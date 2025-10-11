from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List
from threading import Thread

from managers.name_learning_manager import NameLearningManager
from core.retrieval import reindex_all_events

router = APIRouter(prefix="/api", tags=["aliases"])

@router.get("/aliases/{person}")
async def get_person_aliases(person: str):
    result = NameLearningManager().get_person_aliases_display(person)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=f"Person '{person}' not found")
    return result

@router.post("/aliases/add")
async def add_alias_endpoint(request: Dict):
    person_name = request.get("person_name")
    alias = request.get("alias")
    confidence = request.get("confidence", 0.9)
    if not person_name or not alias:
        raise HTTPException(status_code=400, detail="person_name and alias required")
    
    result = NameLearningManager().add_alias(person_name, alias, confidence=confidence, source="manual_api")
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@router.delete("/aliases/{alias}")
async def remove_alias_endpoint(alias: str):
    result = NameLearningManager().remove_alias(alias)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@router.post("/merge-persons")
async def merge_persons_endpoint(request: Dict):
    source = request.get("source")
    target = request.get("target")
    if not source or not target:
        raise HTTPException(status_code=400, detail="source and target required")
    
    result = NameLearningManager().merge_persons(source, target)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    # 异步重建索引，不阻塞
    def reindex_async():
        try:
            from core.retrieval import reindex_all_events
            reindex_all_events()
        except Exception as e:
            print(f"[WARNING] Reindex failed: {e}")
    
    Thread(target=reindex_async, daemon=True).start()
    
    return result

@router.get("/suggest-names")
async def suggest_names(q: str = Query(..., description="Partial name to search"), limit: int = Query(default=10, ge=1, le=20)):
    if len(q) < 2:
        return {"suggestions": [], "query": q}
    suggestions = NameLearningManager().suggest_names_for_input(q, limit)
    return {"query": q, "suggestions": suggestions, "count": len(suggestions)}

@router.get("/check-name/{name}")
async def check_name(name: str):
    return NameLearningManager().check_name_matches(name)

@router.get("/find-similar-people/{name}")
async def find_similar_people(name: str, limit: int = Query(default=7, ge=1, le=20), offset: int = Query(default=0, ge=0)):
    """查找相似的人物，返回所有可能的匹配供用户选择，支持分页"""
    return NameLearningManager().find_similar_people(name, limit, offset)

@router.post("/confirm-name")
async def confirm_name_decision(request: Dict):
    input_name = request.get("input_name")
    decision = request.get("decision")
    if not input_name or not decision:
        raise HTTPException(status_code=400, detail="input_name and decision required")
    result = NameLearningManager().process_confirmation(input_name, decision)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@router.post("/batch-check-names")
async def batch_check_names(request: Dict):
    """批量检查名字"""
    names = request.get("names", [])
    if not names:
        raise HTTPException(status_code=400, detail="names list required")
    
    results = []
    manager = NameLearningManager()
    for name in names:
        result = manager.check_name_matches(name)
        results.append({
            "name": name,
            "type": result.get("type"),
            "needs_confirmation": result.get("needs_confirmation", False)
        })
    
    return {"results": results}

@router.get("/learning/stats")
async def get_learning_stats():
    """获取学习系统统计"""
    return NameLearningManager().get_stats()

@router.post("/learning/train")
async def train_learning(request: Dict):
    """训练名字映射"""
    short_form = request.get("short_form")
    full_form = request.get("full_form")
    is_match = request.get("is_match", True)
    
    if not short_form or not full_form:
        raise HTTPException(status_code=400, detail="short_form and full_form required")
    
    result = NameLearningManager().train_from_confirmation(short_form, full_form, is_match)
    return result

@router.get("/aliases/duplicates")
async def find_duplicates():
    """查找可能的重复人员"""
    # 简单实现：查找相似的canonical_name
    from core.database import get_db_manager
    db = get_db_manager()
    
    try:
        # 查找可能的重复（基于名字相似性）
        persons = db.execute_query("SELECT id, canonical_name FROM persons ORDER BY canonical_name")
        
        duplicates = []
        for i, person1 in enumerate(persons):
            for person2 in persons[i+1:]:
                name1 = person1['canonical_name'].lower()
                name2 = person2['canonical_name'].lower()
                
                # 简单的相似性检查
                if abs(len(name1) - len(name2)) <= 2:
                    from difflib import SequenceMatcher
                    similarity = SequenceMatcher(None, name1, name2).ratio()
                    if similarity > 0.8:
                        duplicates.append({
                            "person1": {"id": person1['id'], "name": person1['canonical_name']},
                            "person2": {"id": person2['id'], "name": person2['canonical_name']},
                            "similarity": similarity
                        })
        
        return {"duplicates": duplicates, "count": len(duplicates)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
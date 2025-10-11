"""
名称学习管理器 - 基于新分层架构
"""
from typing import Dict, List
import logging

from core.services import PersonService
from core.dao import PersonDAO, AliasDAO
from core.database import get_db_manager

logger = logging.getLogger(__name__)

class NameLearningManager:
    """名称学习管理器 - 处理名称匹配和学习"""
    
    def __init__(self):
        self.person_service = PersonService()
        self.person_dao = PersonDAO()
        self.alias_dao = AliasDAO()
    
    def check_name_matches(self, name: str) -> Dict:
        """检查名称匹配"""
        try:
            # 检查是否存在完全匹配
            person_info = self.person_service.get_person_by_alias(name)
            if person_info:
                return {
                    "type": "existing",
                    "confidence": 1.0,
                    "canonical_name": person_info['canonical_name'],
                    "person_id": person_info['id']
                }
            
            # 如果没有完全匹配，返回新用户
            return {
                "type": "new",
                "confidence": 0.0,
                "suggested_name": name
            }
            
        except Exception as e:
            logger.error(f"Error checking name matches: {e}")
            return {"type": "error", "error": str(e)}
    
    def find_similar_people(self, name: str, limit: int = 7, offset: int = 0) -> Dict:
        """查找相似的人员"""
        try:
            # 获取所有人员
            all_persons = self.person_dao.get_all_persons()
            
            candidates = []
            name_lower = name.lower()
            
            for person in all_persons:
                person_name = person['canonical_name']
                person_id = person['id']
                
                # 检查是否完全匹配
                is_exact_match = person_name.lower() == name_lower
                
                if is_exact_match:
                    similarity = 1.0
                    match_type = 'exact'
                else:
                    # 计算相似度
                    from core.utils import calculate_name_similarity
                    similarity = calculate_name_similarity(name, person_name)
                    
                    if similarity >= 0.8:
                        match_type = 'high'
                    elif similarity >= 0.6:
                        match_type = 'medium'
                    else:
                        match_type = 'low'
                
                if is_exact_match or similarity > 0.3:
                    # 获取Alias信息作为简介
                    aliases_data = self.person_service.get_all_aliases(person_name)
                    brief = f"Alias: {', '.join([a['alias'] for a in aliases_data.get('aliases', [])][:3])}"
                    
                    candidates.append({
                        'person_name': person_name,
                        'person_id': person_id,
                        'similarity': similarity,
                        'match_type': match_type,
                        'brief': brief,
                        'timestamp': person['created_at']
                    })
            
            # 按相似度排序
            candidates.sort(key=lambda x: (-x['similarity'], x.get('timestamp', '')))
            
            # 分页
            total = len(candidates)
            page_candidates = candidates[offset:offset + limit]
            
            return {
                'input_name': name,
                'similar_people': page_candidates,
                'total': total,
                'count': len(page_candidates),
                'has_more': offset + limit < total,
                'next_offset': offset + limit if offset + limit < total else None
            }
            
        except Exception as e:
            logger.error(f"Error finding similar people: {e}")
            return {
                'input_name': name,
                'similar_people': [],
                'total': 0,
                'count': 0,
                'has_more': False,
                'error': str(e)
            }
    
    def get_person_aliases_display(self, person_name: str) -> Dict:
        """获取人员Alias显示信息"""
        aliases_data = self.person_service.get_all_aliases(person_name)
        
        if aliases_data.get('success'):
            return {
                "success": True,
                "primary": aliases_data.get('canonical_name', person_name),
                "aliases": [a['alias'] for a in aliases_data.get('aliases', [])],
                "total": aliases_data.get('total_aliases', 0)
            }
        else:
            return {
                "success": True,  # 即使没有Alias也算成功
                "primary": person_name,
                "aliases": [person_name],
                "total": 1
            }
    
    def suggest_names_for_input(self, query: str, limit: int = 10) -> List[str]:
        """为输入建议名称"""
        try:
            # 获取所有Alias
            from core.database import get_db_manager
            db = get_db_manager()
            
            result = db.execute_query("""
                SELECT DISTINCT alias
                FROM person_aliases
                WHERE LOWER(alias) LIKE LOWER(%s)
                ORDER BY alias
                LIMIT %s
            """, (f"%{query}%", limit))
            
            return [row['alias'] for row in result]
            
        except Exception as e:
            logger.error(f"Error suggesting names: {e}")
            return []
    
    def get_stats(self) -> Dict:
        """获取名称学习统计信息"""
        try:
            from core.database import get_db_manager
            db = get_db_manager()
            
            # 获取统计信息
            persons_result = db.execute_query("SELECT COUNT(*) as count FROM persons")
            aliases_result = db.execute_query("SELECT COUNT(*) as count FROM person_aliases")
            return {
                "total_entities": persons_result[0]['count'] if persons_result else 0,
                "total_aliases": aliases_result[0]['count'] if aliases_result else 0,
                "confirmed_matches": 0,  # 新架构中暂不跟踪
                "rejected_matches": 0,   # 新架构中暂不跟踪
                "patterns_learned": 0    # 新架构中暂不跟踪
            }
            
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {
                "total_entities": 0,
                "total_aliases": 0,
                "confirmed_matches": 0,
                "rejected_matches": 0,
                "patterns_learned": 0,
                "error": str(e)
            }
    
    def add_alias(self, person_name: str, alias: str, confidence: float = 1.0, source: str = 'manual') -> Dict:
        """添加Alias（API兼容性）"""
        return self.person_service.add_alias(person_name, alias, source, confidence)
    
    def process_confirmation(self, person_id: int, confirmed: bool = True) -> Dict:
        """处理确认（API兼容性）"""
        # 新架构中不需要确认流程，直接返回成功
        return {"success": True, "message": "Confirmation processed"}
    
    def remove_alias(self, alias: str, person_name: str = None) -> Dict:
        """删除Alias（API兼容性）- 支持只传alias参数"""
        try:
            db = get_db_manager()
            
            if person_name:
                # 如果提供了person_name，直接使用
                person_info = self.person_service.get_person_by_alias(person_name)
                if not person_info:
                    return {"success": False, "error": "Person not found"}
                person_id = person_info['id']
            else:
                # 如果只提供了alias，通过alias查找person_id
                result = db.execute_query(
                    "SELECT person_id FROM person_aliases WHERE alias = %s",
                    (alias,)
                )
                if not result:
                    return {"success": False, "error": "Alias not found"}
                person_id = result[0]['person_id']
            
            # 删除Alias
            db.execute_query(
                "DELETE FROM person_aliases WHERE person_id = %s AND alias = %s",
                (person_id, alias)
            )
            
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def merge_persons(self, source_name: str, target_name: str) -> Dict:
        """合并人员（API兼容性）"""
        try:
            # 获取源和目标人员信息
            source_info = self.person_service.get_person_by_alias(source_name)
            target_info = self.person_service.get_person_by_alias(target_name)
            
            if not source_info or not target_info:
                return {"success": False, "error": "Source or target person not found"}
            
            if source_info['id'] == target_info['id']:
                return {"success": False, "error": "Cannot merge same person"}
            
            db = get_db_manager()
            
            # 更新所有事件
            db.execute_query(
                "UPDATE events SET person_id = %s, person_name = %s WHERE person_id = %s",
                (target_info['id'], target_info['canonical_name'], source_info['id'])
            )
            
            # 迁移Alias
            db.execute_query(
                "UPDATE person_aliases SET person_id = %s WHERE person_id = %s",
                (target_info['id'], source_info['id'])
            )
            
            # 删除源人员
            db.execute_query("DELETE FROM persons WHERE id = %s", (source_info['id'],))
            
            return {"success": True, "merged_to": target_info['canonical_name']}
            
        except Exception as e:
            logger.error(f"Error merging persons: {e}")
            return {"success": False, "error": str(e)}
    
    def train_from_confirmation(self, original_name: str, confirmed_name: str, is_positive: bool = True) -> Dict:
        """从确认中训练（API兼容性）"""
        # 新架构中学习是自动的，这里只返回成功
        return {
            "success": True,
            "pattern_learned": f"{original_name} -> {confirmed_name}",
            "confidence_boost": 0.1 if is_positive else -0.1
        }

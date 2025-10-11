from fastapi import APIRouter, HTTPException

from managers.system_manager import SystemManager


router = APIRouter(prefix="", tags=["system"])


@router.get("/health")
async def health():
    h = SystemManager().check_health()
    # Normalize to expected shape in tests: status + checks
    status = "healthy" if h.get("database_ok") and h.get("tables_ok") and h.get("integrity") == "ok" else "degraded"
    return {
        "status": status,
        "checks": h
    }

@router.post("/reset-database")
async def reset_database():
    """Reset the entire database - WARNING: This deletes all data!"""
    manager = SystemManager()
    result = manager.reset_database()
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Reset failed"))
    return result

@router.post("/migrate-person-embeddings")
async def migrate_person_embeddings():
    """为所有现有person创建人名嵌入"""
    try:
        from core.services.embedding_service import EmbeddingService
        service = EmbeddingService()
        result = service.migrate_existing_persons_to_embeddings()
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Migration failed"))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


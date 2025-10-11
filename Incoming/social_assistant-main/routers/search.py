from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from managers.search_manager import SearchManager


router = APIRouter(prefix="", tags=["search"])


@router.get("/who/{name}")
async def who(name: str):
    manager = SearchManager()
    result = manager.get_person_timeline(name)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return {
        "person": name,
        "events": result.get("events"),
        "total": len(result.get("events")),
        "exists": len(result.get("events")) > 0,
    }


@router.get("/list")
async def list_recent(limit: int = Query(default=10, ge=1, le=1000)):
    manager = SearchManager()
    result = manager.list_recent_interactions(limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/search")
async def search(query: str, person: Optional[str] = Query(default=None), limit: int = Query(default=5, ge=1, le=20)):
    manager = SearchManager()
    result = manager.search_interactions(query, person, limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/connections/{person}")
async def connections(person: str, limit: int = Query(default=5, ge=1, le=20)):
    manager = SearchManager()
    result = manager.find_connections(person, limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/api/people/stats")
async def get_people_statistics():
    manager = SearchManager()
    return manager.get_people_statistics()



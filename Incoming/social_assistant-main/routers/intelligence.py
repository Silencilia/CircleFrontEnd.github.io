from fastapi import APIRouter, HTTPException

from managers.intelligence_manager import IntelligenceManager


router = APIRouter(prefix="", tags=["intelligence"])


@router.get("/prep/{name}")
async def prep(name: str):
    manager = IntelligenceManager()
    result = manager.prepare_meeting(name)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/reminders")
async def reminders():
    manager = IntelligenceManager()
    result = manager.get_reminders()
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result



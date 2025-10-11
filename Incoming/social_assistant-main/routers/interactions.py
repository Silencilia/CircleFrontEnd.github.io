from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict

from managers.interaction_manager import InteractionManager
from managers.name_learning_manager import NameLearningManager


router = APIRouter(prefix="", tags=["interactions"])


class AddInteractionRequest(BaseModel):
    text: str


class UpdateRequest(BaseModel):
    text: str


class AddInteractionRequestWithShadows(BaseModel):
    text: str
    check_shadows: bool = True
    shadow_ids: List[int] = []
    user_decision: Optional[Dict] = None


@router.post("/add/{name}")
async def add(name: str, request: AddInteractionRequestWithShadows):
    # print(f"[DEBUG] /add/{name} called with text: {request.text[:50]}")
    if request.check_shadows:
        check_result = NameLearningManager().check_name_matches(name)
        if check_result.get("needs_confirmation") and not request.user_decision:
            # Flatten to top-level keys expected by tests
            payload = {"needs_confirmation": True}
            ctype = check_result.get("type")
            cdata = check_result.get("data") or {}
            if ctype == "smart_match" and "matches" in cdata:
                payload["matches"] = cdata["matches"]
            if ctype == "shadow" and "shadows" in cdata:
                payload["shadows"] = cdata["shadows"]
            return payload

    if request.user_decision:
        decision_result = NameLearningManager().process_confirmation(name, request.user_decision)
        if not decision_result.get("success"):
            raise HTTPException(status_code=400, detail=decision_result.get("error"))
        if decision_result.get("canonical_name"):
            name = decision_result["canonical_name"]

    manager = InteractionManager()
    manager.person_name = name
    # print(f"[DEBUG] Before add_interaction for {name}")
    add_result = manager.add_interaction(request.text, async_mode=False)
    # print(f"[DEBUG] After add_interaction, event_id: {add_result.get('event_id')}")
    # print(f"[DEBUG] Before enrich_add_result")
    if add_result.get("status") == "processing":
        add_result["message"] = "Data saved, AI extraction in progress"
    return manager.enrich_add_result(add_result)
    # print(f"[DEBUG] After enrich_add_result")


@router.post("/update/{name}")
async def update(name: str, request: UpdateRequest):
    manager = InteractionManager()
    manager.person_name = name
    result = manager.update_person_info(name, request.text)
    if result.get("error"):
        if "not found" in result["error"].lower():
            raise HTTPException(status_code=404, detail=result["error"])
        else:
            raise HTTPException(status_code=500, detail=result["error"])
    return {
        "event_id": result.get("event_id"),
        "person": name,
        "shadows": [],
        "extracted": result.get("extracted"),
        "new_shadows": result.get("new_shadows", []),
        "error": result.get("error")
    }


@router.delete("/delete/{name}")
async def delete_person(name: str, all: bool = Query(default=False), event_id: Optional[int] = Query(default=None)):
    if all:
        manager = InteractionManager()
        count = manager.delete_person_events(name)
        if count == 0:
            raise HTTPException(status_code=404, detail=f"No records found for {name}")
        return {"success": True, "deleted": count, "person": name, "all": True}
    if event_id:
        manager = InteractionManager()
        success = manager.delete_event(event_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
        return {"success": success, "event_id": event_id, "deleted": 1 if success else 0}
    raise HTTPException(status_code=400, detail="Must specify either all=true or event_id")



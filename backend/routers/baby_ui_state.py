"""Persist app-design domain lists not modeled as events (growth, milestones, etc.).

baby_ui_state.milestones: list of {id, status, observedDate?, notes?} — markings only.
Static catalog: UI seed milestones.initialMilestones.
baby_ui_state.custom_milestones: optional list of {id, title, description?, ageRange, category}.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict

from deps import get_json_repository
from repositories.json_repository import JsonRepository

router = APIRouter(prefix="/api/ui/baby-state", tags=["ui"])


class BabyUiStatePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    growth_entries: Optional[List[Any]] = None
    milestones: Optional[List[Any]] = None
    custom_milestones: Optional[List[Any]] = None
    vitamins: Optional[List[Any]] = None
    vaccines: Optional[List[Any]] = None
    health_events: Optional[List[Any]] = None


@router.get("/{baby_id}")
async def get_baby_ui_state(
    baby_id: str,
    repo: JsonRepository = Depends(get_json_repository),
) -> Dict[str, Any]:
    return repo.get_baby_ui_state(baby_id)


@router.put("/{baby_id}")
async def put_baby_ui_state(
    baby_id: str,
    patch: BabyUiStatePatch,
    repo: JsonRepository = Depends(get_json_repository),
) -> Dict[str, Any]:
    return repo.merge_baby_ui_state(baby_id, patch.model_dump(exclude_unset=True))

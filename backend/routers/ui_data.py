"""Read-only UI seed data and aggregated bootstrap for app-design."""
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from config import use_ui_seed
from deps import get_repository
from repositories import BaseRepository
from seed_json_store import (
    SEED_NAMES,
    build_bootstrap_payload,
    build_empty_bootstrap_payload,
    load_seed,
)
from services.baby_core_service import BabyCoreService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ui", tags=["ui-data"])

_SEED_DISABLED_DETAIL = (
    "UI seed JSON is disabled. Set environment variable BABYHEALTH_USE_UI_SEED=1 "
    "to load backend/ui_app_defaults/*.json via /api/ui/bootstrap and /api/ui/seed/*."
)


def _inject_baby_core(payload: Dict[str, Any], repo: BaseRepository) -> None:
    """Replace static baby_core seed with real computed pillars when a baby exists."""
    bid = payload.get("baby", {}).get("id")
    if not bid or not str(bid).strip():
        return
    try:
        svc = BabyCoreService(repo)
        pillars = svc.compute_pillars(str(bid))
        if pillars:
            payload["baby_core"] = {"pillars": pillars}
    except Exception:
        logger.debug("baby_core computation skipped", exc_info=True)


@router.get("/bootstrap")
async def ui_bootstrap(
    baby_id: Optional[str] = Query(None, description="Baby id; defaults to first in repo or seed default"),
    repo: BaseRepository = Depends(get_repository),
) -> Dict[str, Any]:
    babies: List[Dict[str, Any]] = repo.get_all("baby")
    if use_ui_seed():
        payload = build_bootstrap_payload(babies, baby_id)
    else:
        payload = build_empty_bootstrap_payload(babies, baby_id)
    _inject_baby_core(payload, repo)
    return payload


@router.get("/seed/{name}")
async def get_seed(name: str) -> Any:
    if not use_ui_seed():
        raise HTTPException(status_code=404, detail=_SEED_DISABLED_DETAIL)
    if name not in SEED_NAMES:
        raise HTTPException(status_code=404, detail=f"Unknown seed: {name}")
    try:
        return load_seed(name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

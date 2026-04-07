"""Read-only UI seed data and aggregated bootstrap for app-design."""
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

router = APIRouter(prefix="/api/ui", tags=["ui-data"])

_SEED_DISABLED_DETAIL = (
    "UI seed JSON is disabled. Set environment variable BABYHEALTH_USE_UI_SEED=1 "
    "to load backend/ui_app_defaults/*.json via /api/ui/bootstrap and /api/ui/seed/*."
)


@router.get("/bootstrap")
async def ui_bootstrap(
    baby_id: Optional[str] = Query(None, description="Baby id; defaults to first in repo or seed default"),
    repo: BaseRepository = Depends(get_repository),
) -> Dict[str, Any]:
    babies: List[Dict[str, Any]] = repo.get_all("baby")
    if use_ui_seed():
        return build_bootstrap_payload(babies, baby_id)
    return build_empty_bootstrap_payload(babies, baby_id)


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

"""Read-only UI seed data and aggregated bootstrap for app-design."""
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from config import use_ui_seed
from deps import get_profile_repository
from repositories import BaseRepository
from repositories.json_repository import JsonRepository
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


def _inject_today_vitamins(payload: Dict[str, Any], repo: BaseRepository) -> None:
    """Populate today.vitaminItems/medItems/quickVitamins/quickMeds from baby_ui_state."""
    bid = payload.get("baby", {}).get("id")
    if not bid or not str(bid).strip() or not isinstance(repo, JsonRepository):
        return
    try:
        state = repo.get_baby_ui_state(str(bid))
        items = state.get("vitamins")
        if not isinstance(items, list) or not items:
            return

        vitamin_items = []
        med_items = []
        quick_vitamins = []
        quick_meds = []

        for v in items:
            if not isinstance(v, dict) or not v.get("active", False):
                continue
            entry = {"id": v.get("id", ""), "label": v.get("name", ""), "takenAt": None}
            quick = {"id": v.get("id", ""), "label": v.get("name", "")}
            cat = v.get("category", "vitamin")
            if cat == "medication":
                med_items.append(entry)
                quick_meds.append(quick)
            else:
                vitamin_items.append(entry)
                quick_vitamins.append(quick)

        today = payload.get("today")
        if not isinstance(today, dict):
            today = {}
            payload["today"] = today

        if vitamin_items or quick_vitamins:
            today["vitaminItems"] = vitamin_items
            today["quickVitamins"] = quick_vitamins
        if med_items or quick_meds:
            today["medItems"] = med_items
            today["quickMeds"] = quick_meds
    except Exception:
        logger.debug("today vitamins injection skipped", exc_info=True)


def _estimate_percentile(value: float, bands: list, age_months: int) -> int:
    """Estimate percentile from WHO-style band data."""
    if not bands:
        return 50
    closest = min(bands, key=lambda b: abs(b.get("month", 0) - age_months))
    p3, p15, p50, p85, p97 = (
        closest.get("p3", 0), closest.get("p15", 0), closest.get("p50", 0),
        closest.get("p85", 0), closest.get("p97", 0),
    )
    if value <= p3:
        return 3
    if value <= p15:
        return int(3 + (value - p3) / max(p15 - p3, 0.01) * 12)
    if value <= p50:
        return int(15 + (value - p15) / max(p50 - p15, 0.01) * 35)
    if value <= p85:
        return int(50 + (value - p50) / max(p85 - p50, 0.01) * 35)
    if value <= p97:
        return int(85 + (value - p85) / max(p97 - p85, 0.01) * 12)
    return 97


def _inject_growth_cards(payload: Dict[str, Any], repo: BaseRepository) -> None:
    """Replace static growthCards with latest real measurement from baby_ui_state."""
    bid = payload.get("baby", {}).get("id")
    if not bid or not str(bid).strip() or not isinstance(repo, JsonRepository):
        return
    try:
        state = repo.get_baby_ui_state(str(bid))
        entries = state.get("growth_entries")
        if not isinstance(entries, list) or not entries:
            return

        sorted_entries = sorted(entries, key=lambda e: e.get("date", ""))
        latest = sorted_entries[-1]
        weight = latest.get("weight")
        height = latest.get("height")
        head = latest.get("head")
        if weight is None and height is None and head is None:
            return

        baby = payload.get("baby", {})
        birth_date = baby.get("birth_date", "")
        age_months = 7
        if birth_date:
            from datetime import datetime
            try:
                bd = datetime.fromisoformat(birth_date)
                age_months = (datetime.utcnow() - bd).days // 30
            except (ValueError, TypeError):
                pass

        bands = payload.get("growth", {}).get("percentileBands", {})
        weight_bands = bands.get("weight", [])
        height_bands = bands.get("height", [])
        head_bands = bands.get("head", [])

        cards = []
        if weight is not None:
            cards.append({
                "label": "Peso",
                "value": str(round(float(weight), 2)),
                "unit": "kg",
                "percentile": _estimate_percentile(float(weight), weight_bands, age_months),
                "icon": "Weight",
                "color": "bg-baby-peach/40",
            })
        if height is not None:
            cards.append({
                "label": "Altura",
                "value": str(round(float(height), 1)),
                "unit": "cm",
                "percentile": _estimate_percentile(float(height), height_bands, age_months),
                "icon": "Ruler",
                "color": "bg-baby-blue/40",
            })
        if head is not None:
            cards.append({
                "label": "Cabeça",
                "value": str(round(float(head), 1)),
                "unit": "cm",
                "percentile": _estimate_percentile(float(head), head_bands, age_months),
                "icon": "CircleDot",
                "color": "bg-baby-lavender/40",
            })

        if cards:
            extras = payload.get("profile_extras")
            if isinstance(extras, dict):
                extras["growthCards"] = cards
    except Exception:
        logger.debug("growth cards injection skipped", exc_info=True)


def _milestone_progress_from_stored(stored: Any) -> Dict[str, Dict[str, Any]]:
    """Map milestone id -> {status, observedDate?, notes?} from baby_ui_state (slim or legacy rows)."""
    out: Dict[str, Dict[str, Any]] = {}
    if not isinstance(stored, list):
        return out
    for item in stored:
        if not isinstance(item, dict):
            continue
        mid = item.get("id")
        if not mid:
            continue
        mid = str(mid)
        status = item.get("status") or "not_yet"
        if status not in ("observed", "emerging", "not_yet"):
            status = "not_yet"
        row: Dict[str, Any] = {"id": mid, "status": status}
        if item.get("observedDate"):
            row["observedDate"] = item["observedDate"]
        if item.get("notes"):
            row["notes"] = item["notes"]
        out[mid] = row
    return out


def _baby_age_months(birth_date_str: str) -> int:
    if not birth_date_str or not str(birth_date_str).strip():
        return 7
    try:
        bd = datetime.fromisoformat(str(birth_date_str).replace("Z", "+00:00"))
        if bd.tzinfo:
            bd = bd.replace(tzinfo=None)
    except (ValueError, TypeError):
        return 7
    now = datetime.utcnow()
    return max(0, (now - bd).days // 30)


def _age_window_for_months(age_months: int) -> str:
    """Map approximate age in months to milestone age band (0–5 years)."""
    if age_months <= 3:
        return "0-3 meses"
    if age_months <= 6:
        return "4-6 meses"
    if age_months <= 9:
        return "6-9 meses"
    if age_months <= 12:
        return "9-12 meses"
    if age_months <= 18:
        return "12-18 meses"
    if age_months <= 24:
        return "18-24 meses"
    if age_months <= 36:
        return "2-3 anos"
    if age_months <= 48:
        return "3-4 anos"
    return "4-5 anos"


def _combined_milestone_definitions(payload: Dict[str, Any], state: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Seed catalog plus user-defined custom_milestones."""
    rows: List[Dict[str, Any]] = []
    ms = payload.get("milestones") or {}
    catalog = ms.get("initialMilestones")
    if isinstance(catalog, list):
        for c in catalog:
            if isinstance(c, dict):
                rows.append(c)
    custom = state.get("custom_milestones")
    if isinstance(custom, list):
        for c in custom:
            if (
                isinstance(c, dict)
                and c.get("id")
                and c.get("title")
                and c.get("ageRange")
            ):
                rows.append(c)
    return rows


def _age_label_at_observation(birth_iso: str, observed_yyyy_mm_dd: Optional[str]) -> Optional[str]:
    if not observed_yyyy_mm_dd or not str(observed_yyyy_mm_dd).strip():
        return None
    if not birth_iso or not str(birth_iso).strip():
        return None
    try:
        bd = datetime.fromisoformat(str(birth_iso).replace("Z", "+00:00"))
        if bd.tzinfo:
            bd = bd.replace(tzinfo=None)
        obs = datetime.strptime(str(observed_yyyy_mm_dd)[:10], "%Y-%m-%d")
    except (ValueError, TypeError):
        return None
    months = (obs.year - bd.year) * 12 + (obs.month - bd.month)
    if months < 1:
        days = max(0, (obs - bd).days)
        return f"{days} dias"
    if months < 24:
        return f"{months} meses"
    years = months // 12
    rem = months % 12
    return f"{years} anos e {rem} meses" if rem else f"{years} anos"


def _inject_recent_milestones(payload: Dict[str, Any], repo: BaseRepository) -> None:
    """Tile on Meu Bebe: titles from seed + custom catalog; status from baby_ui_state."""
    bid = payload.get("baby", {}).get("id")
    if not bid or not str(bid).strip() or not isinstance(repo, JsonRepository):
        return
    try:
        state = repo.get_baby_ui_state(str(bid))
        combined = _combined_milestone_definitions(payload, state)
        if not combined:
            return

        progress = _milestone_progress_from_stored(state.get("milestones"))

        baby = payload.get("baby") or {}
        birth = str(baby.get("birth_date") or "")
        age_m = _baby_age_months(birth)
        target_window = _age_window_for_months(age_m)

        picked: List[Dict[str, Any]] = []
        for c in combined:
            if not isinstance(c, dict):
                continue
            if str(c.get("ageRange") or "") != target_window:
                continue
            mid = str(c.get("id") or "")
            p = progress.get(mid) or {}
            status = p.get("status") or "not_yet"
            if status not in ("observed", "emerging", "not_yet"):
                status = "not_yet"
            title = str(c.get("title") or "")
            observed_age = None
            if status == "observed" and p.get("observedDate"):
                observed_age = _age_label_at_observation(birth, str(p.get("observedDate")))
            picked.append({"title": title, "status": status, "observedAge": observed_age})
            if len(picked) >= 3:
                break

        if not picked:
            return

        extras = payload.get("profile_extras")
        if not isinstance(extras, dict):
            extras = {}
            payload["profile_extras"] = extras
        extras["recentMilestones"] = picked
    except Exception:
        logger.debug("recent milestones injection skipped", exc_info=True)


@router.get("/bootstrap")
async def ui_bootstrap(
    baby_id: Optional[str] = Query(None, description="Baby id; defaults to first in repo or seed default"),
    repo: BaseRepository = Depends(get_profile_repository),
) -> Dict[str, Any]:
    babies: List[Dict[str, Any]] = repo.get_all("baby")
    if use_ui_seed():
        payload = build_bootstrap_payload(babies, baby_id)
    else:
        payload = build_empty_bootstrap_payload(babies, baby_id)
    _inject_baby_core(payload, repo)
    _inject_today_vitamins(payload, repo)
    _inject_growth_cards(payload, repo)
    _inject_recent_milestones(payload, repo)
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

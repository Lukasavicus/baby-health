"""Read-only UI default JSON files under backend/ui_app_defaults/ (optional override: BABYHEALTH_UI_DEFAULTS_DIR)."""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional


def ui_app_defaults_dir() -> Path:
    override = os.getenv("BABYHEALTH_UI_DEFAULTS_DIR", "").strip()
    if override:
        return Path(override).expanduser().resolve()
    return Path(__file__).resolve().parent / "ui_app_defaults"

# Files exposed by name (without .json)
SEED_NAMES = [
    "catalogs",
    "content_shell",
    "food_catalog",
    "growth",
    "default_baby",
    "baby_profile_extras",
    "baby_core",
    "today",
    "timeline_seed",
    "milestones",
    "vaccines",
    "vitamins",
    "health_events",
    "health_detail",
    "caregivers_feed",
    "tracker_logs",
    "tracker_charts",
    "activity_v2",
]


def seed_dir() -> Path:
    return ui_app_defaults_dir()


def _read_raw(name: str) -> Any:
    path = ui_app_defaults_dir() / f"{name}.json"
    if not path.is_file():
        raise FileNotFoundError(f"Missing seed file: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


@lru_cache(maxsize=len(SEED_NAMES))
def load_seed(name: str) -> Any:
    if name not in SEED_NAMES:
        raise KeyError(f"Unknown seed: {name}")
    return _read_raw(name)


def list_seed_files() -> List[str]:
    root = ui_app_defaults_dir()
    return [n for n in SEED_NAMES if (root / f"{n}.json").is_file()]


def clear_cache() -> None:
    load_seed.cache_clear()


def resolve_baby(
    repo_babies: List[Dict[str, Any]],
    baby_id: Optional[str],
) -> Dict[str, Any]:
    """Pick baby from repository or fall back to default_baby seed."""
    if baby_id:
        for b in repo_babies:
            if b.get("id") == baby_id:
                return dict(b)
    if repo_babies:
        return dict(repo_babies[0])
    default = load_seed("default_baby")
    out = dict(default)
    if "created_at" not in out:
        out["created_at"] = None
    return out


def resolve_baby_no_seed(
    repo_babies: List[Dict[str, Any]],
    baby_id: Optional[str],
) -> Dict[str, Any]:
    """Baby from JSON repo only; no default_baby.json when the store is empty."""
    if baby_id:
        for b in repo_babies:
            if b.get("id") == baby_id:
                return dict(b)
    if repo_babies:
        return dict(repo_babies[0])
    return {
        "id": "",
        "name": "",
        "birth_date": "",
        "photo_url": None,
        "created_at": None,
    }


# Minimal shell so app-design keeps bottom-nav routes without reading seed files.
_EMPTY_CONTENT_SHELL: Dict[str, Any] = {
    "tabs": [
        {"path": "/", "label": "Hoje", "icon": "Heart"},
        {"path": "/caregivers", "label": "Cuidadores", "icon": "Users"},
        {"path": "/routines", "label": "Rotinas", "icon": "BookOpen"},
        {"path": "/my-baby", "label": "Meu Bebê", "icon": "Baby"},
    ],
    "routinesFeatured": {
        "tag": "",
        "title": "",
        "description": "",
        "ctaLabel": "",
    },
    "routines": [],
    "articles": [],
}

_EMPTY_PROFILE_EXTRAS: Dict[str, Any] = {
    "bloodType": None,
    "growthCards": [],
    "recentMilestones": [],
    "healthSummary": {
        "vaccines": {"total": 0, "upToDate": True},
        "vitamins": {"active": 0, "names": []},
        "events": {"recent": 0, "lastEvent": ""},
    },
}


def build_empty_bootstrap_payload(
    repo_babies: List[Dict[str, Any]],
    baby_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Same keys as build_bootstrap_payload, without reading ui_app_defaults/*.json."""
    baby = resolve_baby_no_seed(repo_babies, baby_id)
    return {
        "baby": baby,
        "profile_extras": dict(_EMPTY_PROFILE_EXTRAS),
        "catalogs": {},
        "content_shell": dict(_EMPTY_CONTENT_SHELL),
        "food_catalog": {"foods": []},
        "growth": {
            "percentileBands": {},
            "timeFilters": ["3m", "6m", "1a", "Tudo"],
            "initialEntries": [],
        },
        "baby_core": {"pillars": []},
        "today": {
            "insights": [],
            "quickActivities": [],
            "quickVitamins": [],
            "quickMeds": [],
            "vitaminItems": [],
            "medItems": [],
            "initialWaterMl": 0,
            "hydrationGoalMl": 500,
            "lastWakeOffsetMs": 0,
        },
        "timeline_seed": {"entries": []},
        "milestones": {"ageWindows": [], "initialMilestones": []},
        "vaccines": {"vaccines": []},
        "vitamins": {"vitamins": []},
        "health_events": {"events": []},
        "health_detail": {},
        "caregivers_feed": {"caregivers": [], "sharedFeed": []},
        "tracker_logs": {},
        "tracker_charts": {},
        "activity_v2": {
            "categories": [],
            "durationOptions": [],
            "initialLogs": [],
            "weekData": [],
            "defaultFavoriteActivityIds": [],
        },
    }


def build_bootstrap_payload(
    repo_babies: List[Dict[str, Any]],
    baby_id: Optional[str] = None,
) -> Dict[str, Any]:
    baby = resolve_baby(repo_babies, baby_id)
    extras = load_seed("baby_profile_extras")
    return {
        "baby": baby,
        "profile_extras": {
            "bloodType": extras.get("bloodType"),
            "growthCards": extras.get("growthCards", []),
            "recentMilestones": extras.get("recentMilestones", []),
            "healthSummary": extras.get("healthSummary", {}),
        },
        "catalogs": load_seed("catalogs"),
        "content_shell": load_seed("content_shell"),
        "food_catalog": load_seed("food_catalog"),
        "growth": load_seed("growth"),
        "baby_core": load_seed("baby_core"),
        "today": load_seed("today"),
        "timeline_seed": load_seed("timeline_seed"),
        "milestones": load_seed("milestones"),
        "vaccines": load_seed("vaccines"),
        "vitamins": load_seed("vitamins"),
        "health_events": load_seed("health_events"),
        "health_detail": load_seed("health_detail"),
        "caregivers_feed": load_seed("caregivers_feed"),
        "tracker_logs": load_seed("tracker_logs"),
        "tracker_charts": load_seed("tracker_charts"),
        "activity_v2": load_seed("activity_v2"),
    }

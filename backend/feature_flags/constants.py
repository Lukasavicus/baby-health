"""Default catalog: variant lists and defaults when the store file omits keys."""

from __future__ import annotations

from typing import Any

DEFAULT_FEATURES: dict[str, dict[str, Any]] = {
    "activities_tile": {
        "variants": ["v1", "v2"],
        "defaultVariant": "v1",
        "description": "Which Activities tile layout is shown",
    },
    "vitamins_tile": {
        "variants": ["v1", "v2"],
        "defaultVariant": "v1",
        "description": "Which Vitamins tile layout is shown",
    },
    "timeline_style": {
        "variants": ["v1", "v2"],
        "defaultVariant": "v1",
        "description": "Timeline presentation style",
    },
}


def default_store_document() -> dict[str, Any]:
    """Initial on-disk shape: catalog + sample profile overrides."""
    return {
        "features": {k: dict(v) for k, v in DEFAULT_FEATURES.items()},
        "profiles": {
            "default": {},
            "lucas-dev": {
                "activities_tile": "v2",
                "vitamins_tile": "v1",
                "timeline_style": "v2",
            },
            "internal-test": {},
            "baby-profile-01": {},
        },
    }

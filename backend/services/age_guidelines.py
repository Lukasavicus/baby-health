"""Age-based reference ranges for baby health indicators (AAP/WHO approximate)."""
from typing import Dict, Tuple

# (min_months, max_months) → { metric: (ideal_min, ideal_max) }
GUIDELINES: Dict[Tuple[int, int], Dict[str, Tuple[float, float]]] = {
    (0, 3): {
        "feeding_count": (8, 12),
        "sleep_hours": (14, 17),
        "diaper_count": (6, 8),
        "activity_min": (15, 30),
        "hydration_ml": (0, 0),
    },
    (4, 6): {
        "feeding_count": (5, 8),
        "sleep_hours": (12, 15),
        "diaper_count": (6, 8),
        "activity_min": (30, 60),
        "hydration_ml": (100, 300),
    },
    (7, 9): {
        "feeding_count": (4, 6),
        "sleep_hours": (12, 15),
        "diaper_count": (4, 6),
        "activity_min": (30, 60),
        "hydration_ml": (200, 500),
    },
    (10, 12): {
        "feeding_count": (3, 5),
        "sleep_hours": (11, 14),
        "diaper_count": (4, 6),
        "activity_min": (30, 60),
        "hydration_ml": (300, 600),
    },
    (13, 18): {
        "feeding_count": (3, 5),
        "sleep_hours": (11, 14),
        "diaper_count": (4, 6),
        "activity_min": (45, 90),
        "hydration_ml": (400, 800),
    },
    (19, 36): {
        "feeding_count": (3, 5),
        "sleep_hours": (10, 13),
        "diaper_count": (3, 5),
        "activity_min": (60, 120),
        "hydration_ml": (500, 1000),
    },
}

_FALLBACK = {
    "feeding_count": (4, 6),
    "sleep_hours": (11, 14),
    "diaper_count": (4, 6),
    "activity_min": (30, 60),
    "hydration_ml": (300, 600),
}


def get_guidelines(age_months: int) -> Dict[str, Tuple[float, float]]:
    """Return reference ranges for the given age in months."""
    for (lo, hi), ranges in GUIDELINES.items():
        if lo <= age_months <= hi:
            return ranges
    return dict(_FALLBACK)

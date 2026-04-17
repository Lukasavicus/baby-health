"""Tests for App Design payload normalization."""
import pytest
from datetime import datetime

from services.event_normalization import merge_and_normalize_event, normalize_event_payload


def test_diaper_pee_poo_aliases():
    n = normalize_event_payload(
        {
            "type": "diaper",
            "subtype": "pee",
            "baby_id": "b1",
            "caregiver_id": "c1",
            "timestamp": datetime(2025, 1, 15, 10, 0, 0),
            "metadata": {},
        }
    )
    assert n["subtype"] == "wet"

    n2 = normalize_event_payload(
        {
            "type": "diaper",
            "subtype": "poo",
            "baby_id": "b1",
            "caregiver_id": "c1",
            "timestamp": datetime(2025, 1, 15, 10, 0, 0),
            "metadata": {},
        }
    )
    assert n2["subtype"] == "dirty"


def test_sleep_night_alias_and_window_from_metadata():
    n = normalize_event_payload(
        {
            "type": "sleep",
            "subtype": "night",
            "baby_id": "b1",
            "caregiver_id": "c1",
            "timestamp": datetime(2025, 1, 15, 12, 0, 0),
            "metadata": {"sleep_start": "22:00", "sleep_end": "06:00"},
        }
    )
    assert n["subtype"] == "night_sleep"
    assert n["timestamp"].hour == 22
    assert n["end_timestamp"] is not None
    assert n["end_timestamp"].day == 16


def test_feeding_breast_bottle():
    n = normalize_event_payload(
        {
            "type": "feeding",
            "subtype": "breast",
            "baby_id": "b1",
            "caregiver_id": "c1",
            "timestamp": datetime(2025, 1, 15, 8, 0, 0),
            "metadata": {"breast_side": "Esquerdo"},
        }
    )
    assert n["subtype"] == "breastfeeding"
    assert n["metadata"]["breast_side"] == "Esquerdo"

    n2 = normalize_event_payload(
        {
            "type": "feeding",
            "subtype": "bottle",
            "baby_id": "b1",
            "caregiver_id": "c1",
            "timestamp": datetime(2025, 1, 15, 8, 0, 0),
            "metadata": {},
        }
    )
    assert n2["subtype"] == "bottle_formula"


def test_hydration_tea():
    n = normalize_event_payload(
        {
            "type": "hydration",
            "subtype": "tea",
            "baby_id": "b1",
            "caregiver_id": "c1",
            "timestamp": datetime(2025, 1, 15, 9, 0, 0),
            "quantity": 40,
            "metadata": {},
        }
    )
    assert n["subtype"] == "other"
    assert n["metadata"]["drink_type"] == "tea"
    assert n["unit"] == "ml"


def test_activity_tummy():
    n = normalize_event_payload(
        {
            "type": "activity",
            "subtype": "tummy",
            "baby_id": "b1",
            "caregiver_id": "c1",
            "timestamp": datetime(2025, 1, 15, 9, 0, 0),
            "metadata": {},
        }
    )
    assert n["subtype"] == "tummy_time"


def test_bath_temperature_subtype():
    n = normalize_event_payload(
        {
            "type": "bath",
            "subtype": "morno",
            "baby_id": "b1",
            "caregiver_id": "c1",
            "timestamp": datetime(2025, 1, 15, 19, 0, 0),
            "metadata": {},
        }
    )
    assert n["subtype"] == "bath"
    assert n["metadata"]["bath_temperature"] == "morno"


def test_health_vitamin():
    n = normalize_event_payload(
        {
            "type": "health",
            "subtype": "vitamin",
            "baby_id": "b1",
            "caregiver_id": "c1",
            "timestamp": datetime(2025, 1, 15, 7, 0, 0),
            "metadata": {"health_name": "Vit. D"},
        }
    )
    assert n["type"] == "health"
    assert n["subtype"] == "vitamin"
    assert n["metadata"]["health_name"] == "Vit. D"


def test_invalid_type_raises():
    with pytest.raises(ValueError, match="Invalid event type"):
        normalize_event_payload(
            {
                "type": "unknown",
                "subtype": "x",
                "baby_id": "b1",
                "caregiver_id": "c1",
                "timestamp": datetime(2025, 1, 15, 7, 0, 0),
                "metadata": {},
            }
        )


def test_merge_and_normalize_preserves_metadata_merge():
    existing = {
        "id": "e1",
        "type": "feeding",
        "subtype": "bottle_formula",
        "baby_id": "b1",
        "caregiver_id": "c1",
        "timestamp": "2025-01-15T08:00:00",
        "metadata": {"a": 1},
    }
    out = merge_and_normalize_event(
        existing,
        {"metadata": {"b": 2}},
    )
    assert out["metadata"]["a"] == 1
    assert out["metadata"]["b"] == 2

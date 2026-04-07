"""Normalize App Design / alias event payloads to canonical API storage."""
from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import Any, Dict, Tuple

ALLOWED_EVENT_TYPES: Tuple[str, ...] = (
    "feeding",
    "hydration",
    "sleep",
    "diaper",
    "activity",
    "medication",
    "bath",
    "health",
)


def _coerce_datetime(value: Any) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def _combine_local_date_time(d: date, hhmm: str) -> datetime | None:
    if not hhmm or ":" not in hhmm:
        return None
    parts = hhmm.strip().split(":")
    try:
        h = int(parts[0])
        m = int(parts[1]) if len(parts) > 1 else 0
    except ValueError:
        return None
    return datetime(d.year, d.month, d.day, h, m, 0)


def _resolve_sleep_window(
    timestamp: datetime,
    sleep_start: str | None,
    sleep_end: str | None,
) -> Tuple[datetime, datetime | None]:
    d = timestamp.date()
    start_dt = _combine_local_date_time(d, sleep_start) if sleep_start else None
    end_dt = _combine_local_date_time(d, sleep_end) if sleep_end else None
    if start_dt and end_dt:
        if end_dt <= start_dt:
            end_dt += timedelta(days=1)
        return start_dt, end_dt
    return timestamp, None


def normalize_event_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Return a dict suitable for Event / EventCreate (canonical type/subtype, datetimes, metadata).
    Mutates a shallow copy only.
    """
    p: Dict[str, Any] = dict(payload)
    md: Dict[str, Any] = dict(p.get("metadata") or {})

    raw_type = (p.get("type") or "").strip().lower()
    p["type"] = raw_type
    subtype = (p.get("subtype") or "").strip().lower()
    p["subtype"] = subtype

    p["timestamp"] = _coerce_datetime(p.get("timestamp"))
    p["end_timestamp"] = _coerce_datetime(p.get("end_timestamp"))

    if p["type"] == "diaper":
        diaper_map = {"pee": "wet", "poo": "dirty"}
        p["subtype"] = diaper_map.get(subtype, subtype or "wet")

    elif p["type"] == "sleep":
        sleep_map = {"night": "night_sleep"}
        p["subtype"] = sleep_map.get(subtype, subtype or "nap")
        ss = md.get("sleep_start") or md.get("sleepStart")
        se = md.get("sleep_end") or md.get("sleepEnd")
        if p["timestamp"] is None:
            p["timestamp"] = datetime.utcnow()
        if p["end_timestamp"] is None and ss and se:
            start_dt, end_dt = _resolve_sleep_window(p["timestamp"], str(ss), str(se))
            p["timestamp"] = start_dt
            p["end_timestamp"] = end_dt
        if md.get("sleep_location") or md.get("sleepLocation"):
            loc = md.get("sleep_location") or md.get("sleepLocation")
            md["sleep_location"] = loc
        for k in ("sleep_start", "sleep_end", "sleepStart", "sleepEnd", "sleepLocation"):
            md.pop(k, None)
        p["metadata"] = md

    elif p["type"] == "feeding":
        if subtype == "breast":
            p["subtype"] = "breastfeeding"
            side = md.get("breast_side") or md.get("feedSide")
            if side:
                md["breast_side"] = side
        elif subtype == "bottle":
            if md.get("milk_source") == "breast" or md.get("bottle_contents") == "breastmilk":
                p["subtype"] = "bottle_breastmilk"
            else:
                p["subtype"] = "bottle_formula"
        elif subtype == "formula":
            p["subtype"] = "bottle_formula"
        elif subtype == "solids":
            p["subtype"] = "solids"
            if p.get("unit") is None:
                p["unit"] = "g"
        p["metadata"] = md

    elif p["type"] == "hydration":
        if subtype == "tea":
            p["subtype"] = "other"
            md["drink_type"] = "tea"
        p["metadata"] = md
        if p.get("unit") is None and p.get("quantity") is not None:
            p["unit"] = "ml"

    elif p["type"] == "activity":
        act_map = {
            "tummy": "tummy_time",
        }
        if subtype in act_map:
            p["subtype"] = act_map[subtype]
        elif subtype == "other":
            p["subtype"] = "play"
            md["activity_kind"] = "other"
        elif not subtype:
            p["subtype"] = "play"
        p["metadata"] = md

    elif p["type"] == "bath":
        if subtype in ("frio", "morno", "quente"):
            md["bath_temperature"] = subtype
            p["subtype"] = "bath"
        elif not subtype:
            p["subtype"] = "bath"
        if p.get("quantity") is not None and p.get("unit") == "min":
            md.setdefault("duration_min", int(p["quantity"]))
        p["metadata"] = md

    elif p["type"] == "health":
        if subtype in ("vitamin", "medication"):
            p["subtype"] = subtype
        elif subtype == "vitamina":
            p["subtype"] = "vitamin"
        elif not subtype:
            p["subtype"] = "vitamin"
        else:
            p["subtype"] = "vitamin" if "vit" in subtype else "medication"
        name = md.get("health_name") or md.get("healthName")
        dosage = md.get("health_dosage") or md.get("healthDosage")
        if name:
            md["health_name"] = name
        if dosage:
            md["health_dosage"] = dosage
        p["metadata"] = md

    elif p["type"] == "medication":
        p["metadata"] = md

    if p["timestamp"] is None:
        p["timestamp"] = datetime.utcnow()

    if p["type"] not in ALLOWED_EVENT_TYPES:
        raise ValueError(f"Invalid event type: {p['type']}")

    p["metadata"] = md
    return p


def merge_and_normalize_event(existing: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
    """Merge stored event with partial update, then normalize."""
    merged: Dict[str, Any] = {**existing}
    for key, value in updates.items():
        if key == "metadata" and isinstance(value, dict):
            merged["metadata"] = {**(dict(existing.get("metadata") or {})), **value}
        else:
            merged[key] = value
    return normalize_event_payload(merged)

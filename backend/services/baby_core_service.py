"""Compute Baby Core wellness pillars from real event data."""
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from repositories import BaseRepository
from services.event_service import EventService
from services.age_guidelines import get_guidelines


def _score_from_range(value: float, ideal_min: float, ideal_max: float) -> int:
    """Score 0-100 based on how well `value` fits the ideal range.

    Within range          → 85-100
    Close (within 30%)    → 60-84
    Far                   → 20-59
    Zero                  → 0
    """
    if ideal_max == 0 and ideal_min == 0:
        return 85 if value == 0 else 90

    if value <= 0:
        return 0

    mid = (ideal_min + ideal_max) / 2
    span = ideal_max - ideal_min if ideal_max > ideal_min else 1

    if ideal_min <= value <= ideal_max:
        closeness = 1 - abs(value - mid) / (span / 2) if span > 0 else 1
        return int(85 + closeness * 15)

    if value < ideal_min:
        ratio = value / ideal_min if ideal_min > 0 else 0
        if ratio >= 0.7:
            return int(60 + (ratio - 0.7) / 0.3 * 24)
        return max(20, int(ratio * 60 / 0.7))

    over_ratio = value / ideal_max if ideal_max > 0 else 2
    if over_ratio <= 1.3:
        return int(84 - (over_ratio - 1) / 0.3 * 24)
    return max(20, int(84 - 24 - (over_ratio - 1.3) * 20))


def _trend(today_score: int, yesterday_score: int) -> str:
    diff = today_score - yesterday_score
    if diff > 5:
        return "up"
    if diff < -5:
        return "down"
    return "stable"


def _feeding_detail(count: int, total_ml: float, age_months: int) -> str:
    parts = []
    if count > 0:
        parts.append(f"{count} {'refeição' if count == 1 else 'refeições'}")
    if total_ml > 0:
        parts.append(f"{int(total_ml)} ml")
    if not parts:
        return "Nenhuma refeição registrada ainda."
    base = " + ".join(parts)
    return f"{base} — registros do dia."


def _sleep_detail(hours: float, ideal_min: float, ideal_max: float) -> str:
    if hours <= 0:
        return "Nenhum sono registrado ainda."
    h = int(hours)
    m = int((hours - h) * 60)
    dur = f"{h}h{m:02d}" if m else f"{h}h"
    if ideal_min <= hours <= ideal_max:
        return f"{dur} de sono — dentro do recomendado."
    if hours < ideal_min:
        return f"{dur} de sono — abaixo do recomendado ({int(ideal_min)}-{int(ideal_max)}h)."
    return f"{dur} de sono — acima do recomendado."


def _hydration_detail(
    diaper_count: int, hydration_ml: float, diaper_range: Tuple[float, float]
) -> str:
    parts = []
    if diaper_count > 0:
        parts.append(f"{diaper_count} {'fralda' if diaper_count == 1 else 'fraldas'}")
    if hydration_ml > 0:
        parts.append(f"{int(hydration_ml)} ml líquidos")
    if not parts:
        return "Nenhum registro de fralda ou hidratação."
    base = ", ".join(parts)
    if diaper_range[0] <= diaper_count <= diaper_range[1]:
        return f"{base} — eliminação adequada."
    if diaper_count < diaper_range[0]:
        return f"{base} — atenção à hidratação."
    return f"{base} — volume elevado."


def _activity_detail(count: int, minutes: float, ideal_range: Tuple[float, float]) -> str:
    if count <= 0:
        return "Nenhuma atividade registrada — considere mais estimulação."
    dur = f"{int(minutes)} min" if minutes > 0 else f"{count} {'sessão' if count == 1 else 'sessões'}"
    if minutes >= ideal_range[0]:
        return f"{dur} de estimulação — desenvolvimento no caminho."
    return f"{dur} de estimulação — considere mais tempo de atividade."


def _status_label(score: int) -> str:
    if score >= 85:
        return "Ótimo"
    if score >= 70:
        return "No caminho"
    if score >= 50:
        return "Atenção"
    if score > 0:
        return "Baixo"
    return "Sem dados"


PILLAR_COLORS = {
    "feeding": "#FFDAB9",
    "sleep": "#E8D5F0",
    "hydration": "#A8D8EA",
    "development": "#7EC8B8",
}


class BabyCoreService:
    def __init__(self, repository: BaseRepository):
        self.repo = repository
        self.event_service = EventService(repository)

    def compute_pillars(self, baby_id: str) -> List[Dict[str, Any]]:
        baby = self.repo.get_by_id("baby", baby_id)
        if not baby or not baby.get("birth_date"):
            return self._empty_pillars()

        try:
            birth = datetime.fromisoformat(baby["birth_date"])
        except (ValueError, TypeError):
            return self._empty_pillars()

        age_days = (datetime.utcnow() - birth).days
        age_months = age_days // 30
        guidelines = get_guidelines(age_months)

        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

        today = self.event_service.get_daily_summary(baby_id, today_str)
        yesterday = self.event_service.get_daily_summary(baby_id, yesterday_str)

        feeding_range = guidelines["feeding_count"]
        sleep_range = guidelines["sleep_hours"]
        diaper_range = guidelines["diaper_count"]
        activity_range = guidelines["activity_min"]
        hydration_range = guidelines["hydration_ml"]

        # -- Feeding --
        feed_score = _score_from_range(today["feeding_count"], *feeding_range)
        feed_score_y = _score_from_range(yesterday["feeding_count"], *feeding_range)

        # -- Sleep --
        sleep_score = _score_from_range(today["sleep_hours"], *sleep_range)
        sleep_score_y = _score_from_range(yesterday["sleep_hours"], *sleep_range)

        # -- Hydration & Elimination (weighted average) --
        diaper_score = _score_from_range(today["diaper_count"], *diaper_range)
        hyd_score = (
            _score_from_range(today["hydration_total_ml"], *hydration_range)
            if hydration_range[1] > 0
            else diaper_score
        )
        hydration_score = int(diaper_score * 0.6 + hyd_score * 0.4)

        diaper_score_y = _score_from_range(yesterday["diaper_count"], *diaper_range)
        hyd_score_y = (
            _score_from_range(yesterday["hydration_total_ml"], *hydration_range)
            if hydration_range[1] > 0
            else diaper_score_y
        )
        hydration_score_y = int(diaper_score_y * 0.6 + hyd_score_y * 0.4)

        # -- Development --
        act_minutes = today.get("activity_minutes", 0)
        dev_score = _score_from_range(act_minutes, *activity_range)
        act_minutes_y = yesterday.get("activity_minutes", 0)
        dev_score_y = _score_from_range(act_minutes_y, *activity_range)

        return [
            {
                "label": "Alimentação",
                "shortLabel": "Alim.",
                "score": feed_score,
                "color": PILLAR_COLORS["feeding"],
                "status": _status_label(feed_score),
                "trend": _trend(feed_score, feed_score_y),
                "detail": _feeding_detail(
                    today["feeding_count"], today["feeding_total_ml"], age_months
                ),
            },
            {
                "label": "Sono",
                "shortLabel": "Sono",
                "score": sleep_score,
                "color": PILLAR_COLORS["sleep"],
                "status": _status_label(sleep_score),
                "trend": _trend(sleep_score, sleep_score_y),
                "detail": _sleep_detail(today["sleep_hours"], *sleep_range),
            },
            {
                "label": "Hidratação",
                "shortLabel": "Hidr.",
                "score": hydration_score,
                "color": PILLAR_COLORS["hydration"],
                "status": _status_label(hydration_score),
                "trend": _trend(hydration_score, hydration_score_y),
                "detail": _hydration_detail(
                    today["diaper_count"], today["hydration_total_ml"], diaper_range
                ),
            },
            {
                "label": "Desenvolvimento",
                "shortLabel": "Desenv.",
                "score": dev_score,
                "color": PILLAR_COLORS["development"],
                "status": _status_label(dev_score),
                "trend": _trend(dev_score, dev_score_y),
                "detail": _activity_detail(
                    today["activity_count"], act_minutes, activity_range
                ),
            },
        ]

    @staticmethod
    def _empty_pillars() -> List[Dict[str, Any]]:
        return [
            {
                "label": "Alimentação",
                "shortLabel": "Alim.",
                "score": 0,
                "color": PILLAR_COLORS["feeding"],
                "status": "Sem dados",
                "trend": "stable",
                "detail": "Cadastre o bebê para começar.",
            },
            {
                "label": "Sono",
                "shortLabel": "Sono",
                "score": 0,
                "color": PILLAR_COLORS["sleep"],
                "status": "Sem dados",
                "trend": "stable",
                "detail": "Cadastre o bebê para começar.",
            },
            {
                "label": "Hidratação",
                "shortLabel": "Hidr.",
                "score": 0,
                "color": PILLAR_COLORS["hydration"],
                "status": "Sem dados",
                "trend": "stable",
                "detail": "Cadastre o bebê para começar.",
            },
            {
                "label": "Desenvolvimento",
                "shortLabel": "Desenv.",
                "score": 0,
                "color": PILLAR_COLORS["development"],
                "status": "Sem dados",
                "trend": "stable",
                "detail": "Cadastre o bebê para começar.",
            },
        ]

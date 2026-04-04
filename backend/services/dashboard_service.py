"""Dashboard service for aggregated data"""
from datetime import datetime
from typing import Any, Dict, Optional
from repositories import BaseRepository
from .event_service import EventService


class DashboardService:
    """Service for dashboard data aggregation"""

    def __init__(self, repository: BaseRepository):
        """Initialize dashboard service"""
        self.repo = repository
        self.event_service = EventService(repository)

    def get_dashboard_data(self, baby_id: str) -> Dict[str, Any]:
        """Get comprehensive dashboard data for a baby"""
        # Get baby info
        baby = self.repo.get_by_id("baby", baby_id)
        if not baby:
            return {"error": "Baby not found"}

        # Get today's date
        today = datetime.utcnow().strftime("%Y-%m-%d")

        # Get today's summary
        daily_summary = self.event_service.get_daily_summary(baby_id, today)

        # Get recent events (last 10)
        all_events = self.event_service.get_events_for_baby(baby_id, date=today)
        recent_events = all_events[:10]

        # Get caregivers
        caregivers = self.repo.get_all("caregiver")

        # Build caregiver map
        caregiver_map = {c["id"]: c for c in caregivers}

        # Enrich events with caregiver info
        enriched_events = []
        for event in recent_events:
            caregiver_id = event.get("caregiver_id")
            caregiver = caregiver_map.get(caregiver_id)
            enriched_events.append(
                {
                    **event,
                    "caregiver_name": caregiver.get("name") if caregiver else "Unknown",
                    "caregiver_avatar_color": caregiver.get("avatar_color")
                    if caregiver
                    else "gray",
                }
            )

        return {
            "baby": baby,
            "today": today,
            "summary": daily_summary,
            "recent_events": enriched_events,
            "caregivers": caregivers,
        }

    def get_hero_card_data(self, baby_id: str) -> Dict[str, Any]:
        """Get hero card data (quick stats for today)"""
        baby = self.repo.get_by_id("baby", baby_id)
        if not baby:
            return {"error": "Baby not found"}

        today = datetime.utcnow().strftime("%Y-%m-%d")
        summary = self.event_service.get_daily_summary(baby_id, today)

        # Calculate age
        birth_date = datetime.fromisoformat(baby.get("birth_date"))
        age_days = (datetime.utcnow() - birth_date).days
        age_months = age_days // 30

        return {
            "baby_id": baby_id,
            "baby_name": baby.get("name"),
            "baby_photo_url": baby.get("photo_url"),
            "age_months": age_months,
            "age_days": age_days,
            "today": today,
            "last_feeding": self._get_last_feeding(baby_id),
            "last_sleep": self._get_last_sleep(baby_id),
            "last_diaper": self._get_last_diaper(baby_id),
            "summary": summary,
        }

    def _get_last_feeding(self, baby_id: str) -> Optional[Dict[str, Any]]:
        """Get the last feeding event"""
        events = self.repo.list_by_field("event", "baby_id", baby_id)
        feeding_events = [e for e in events if e.get("type") == "feeding"]
        if feeding_events:
            feeding_events.sort(
                key=lambda e: e.get("timestamp"), reverse=True
            )
            return feeding_events[0]
        return None

    def _get_last_sleep(self, baby_id: str) -> Optional[Dict[str, Any]]:
        """Get the last sleep event"""
        events = self.repo.list_by_field("event", "baby_id", baby_id)
        sleep_events = [e for e in events if e.get("type") == "sleep"]
        if sleep_events:
            sleep_events.sort(
                key=lambda e: e.get("timestamp"), reverse=True
            )
            return sleep_events[0]
        return None

    def _get_last_diaper(self, baby_id: str) -> Optional[Dict[str, Any]]:
        """Get the last diaper event"""
        events = self.repo.list_by_field("event", "baby_id", baby_id)
        diaper_events = [e for e in events if e.get("type") == "diaper"]
        if diaper_events:
            diaper_events.sort(
                key=lambda e: e.get("timestamp"), reverse=True
            )
            return diaper_events[0]
        return None

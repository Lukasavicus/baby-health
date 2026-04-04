"""Event service for business logic"""
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from repositories import BaseRepository


class EventService:
    """Service for managing events"""

    def __init__(self, repository: BaseRepository):
        """Initialize event service"""
        self.repo = repository

    def create_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new event"""
        return self.repo.create("event", event_data)

    def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Get a single event by ID"""
        return self.repo.get_by_id("event", event_id)

    def update_event(self, event_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an event"""
        return self.repo.update("event", event_id, updates)

    def delete_event(self, event_id: str) -> bool:
        """Delete an event"""
        return self.repo.delete("event", event_id)

    def get_events_for_baby(
        self,
        baby_id: str,
        date: Optional[str] = None,
        event_type: Optional[str] = None,
        caregiver_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get events for a baby, optionally filtered by date and type"""
        events = self.repo.list_by_field("event", "baby_id", baby_id)

        # Filter by date if provided
        if date:
            target_date = datetime.fromisoformat(date)
            start_date = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date + timedelta(days=1) - timedelta(seconds=1)

            events = [
                e
                for e in events
                if self._parse_datetime(e.get("timestamp"))
                and start_date <= self._parse_datetime(e.get("timestamp")) <= end_date
            ]

        # Filter by event type if provided
        if event_type:
            events = [e for e in events if e.get("type") == event_type]

        # Filter by caregiver if provided
        if caregiver_id:
            events = [e for e in events if e.get("caregiver_id") == caregiver_id]

        # Sort by timestamp (newest first)
        events.sort(key=lambda e: self._parse_datetime(e.get("timestamp")) or datetime.min, reverse=True)

        return events

    def get_daily_summary(self, baby_id: str, date: str) -> Dict[str, Any]:
        """Get daily summary of events"""
        events = self.get_events_for_baby(baby_id, date=date)

        summary = {
            "date": date,
            "feeding_count": 0,
            "feeding_total_ml": 0,
            "hydration_count": 0,
            "sleep_hours": 0,
            "diaper_count": 0,
            "activity_count": 0,
        }

        for event in events:
            event_type = event.get("type")

            if event_type == "feeding":
                summary["feeding_count"] += 1
                if event.get("quantity"):
                    summary["feeding_total_ml"] += event.get("quantity", 0)

            elif event_type == "hydration":
                summary["hydration_count"] += 1

            elif event_type == "sleep":
                # Calculate hours from timestamp and end_timestamp
                start = self._parse_datetime(event.get("timestamp"))
                end = self._parse_datetime(event.get("end_timestamp"))
                if start and end:
                    duration = (end - start).total_seconds() / 3600
                    summary["sleep_hours"] += duration

            elif event_type == "diaper":
                summary["diaper_count"] += 1

            elif event_type == "activity":
                summary["activity_count"] += 1

        return summary

    def get_weekly_summary(self, baby_id: str, start_date: str) -> Dict[str, Any]:
        """Get weekly summary of events"""
        start = datetime.fromisoformat(start_date)
        summaries = []

        for i in range(7):
            current_date = start + timedelta(days=i)
            date_str = current_date.strftime("%Y-%m-%d")
            daily_summary = self.get_daily_summary(baby_id, date_str)
            summaries.append(daily_summary)

        # Aggregate
        aggregated = {
            "start_date": start_date,
            "end_date": (start + timedelta(days=6)).strftime("%Y-%m-%d"),
            "daily_summaries": summaries,
            "feeding_count": sum(s["feeding_count"] for s in summaries),
            "feeding_total_ml": sum(s["feeding_total_ml"] for s in summaries),
            "hydration_count": sum(s["hydration_count"] for s in summaries),
            "sleep_hours": sum(s["sleep_hours"] for s in summaries),
            "diaper_count": sum(s["diaper_count"] for s in summaries),
            "activity_count": sum(s["activity_count"] for s in summaries),
        }

        return aggregated

    @staticmethod
    def _parse_datetime(dt_str: str) -> Optional[datetime]:
        """Parse datetime string"""
        if not dt_str:
            return None

        try:
            if "T" in dt_str:
                return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
            return datetime.fromisoformat(dt_str)
        except (ValueError, AttributeError):
            return None

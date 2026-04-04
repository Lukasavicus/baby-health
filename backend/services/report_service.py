"""Report service for generating insights"""
from datetime import datetime, timedelta
from typing import Any, Dict, List
from repositories import BaseRepository
from .event_service import EventService


class ReportService:
    """Service for generating reports and insights"""

    def __init__(self, repository: BaseRepository):
        """Initialize report service"""
        self.repo = repository
        self.event_service = EventService(repository)

    def get_feeding_report(self, baby_id: str, days: int = 7) -> Dict[str, Any]:
        """Generate feeding report for the last N days"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        events = self.repo.get_events_by_date_range(
            baby_id, start_date, end_date, event_type="feeding"
        )

        # Aggregate by subtype
        subtypes = {}
        total_volume = 0
        total_sessions = len(events)

        for event in events:
            subtype = event.get("subtype")
            if subtype not in subtypes:
                subtypes[subtype] = {"count": 0, "total_ml": 0}

            subtypes[subtype]["count"] += 1
            if event.get("quantity"):
                subtypes[subtype]["total_ml"] += event.get("quantity", 0)
                total_volume += event.get("quantity", 0)

        avg_per_session = total_volume / total_sessions if total_sessions > 0 else 0

        return {
            "period_days": days,
            "total_sessions": total_sessions,
            "total_volume_ml": total_volume,
            "average_per_session_ml": round(avg_per_session, 2),
            "by_subtype": subtypes,
        }

    def get_sleep_report(self, baby_id: str, days: int = 7) -> Dict[str, Any]:
        """Generate sleep report for the last N days"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        events = self.repo.get_events_by_date_range(
            baby_id, start_date, end_date, event_type="sleep"
        )

        total_hours = 0
        nap_count = 0
        night_sleep_count = 0
        awakenings_total = 0

        for event in events:
            start = self._parse_datetime(event.get("timestamp"))
            end = self._parse_datetime(event.get("end_timestamp"))

            if start and end:
                duration = (end - start).total_seconds() / 3600
                total_hours += duration

            subtype = event.get("subtype")
            if subtype == "nap":
                nap_count += 1
            elif subtype == "night_sleep":
                night_sleep_count += 1

            metadata = event.get("metadata", {})
            awakenings_total += metadata.get("awakenings", 0)

        session_count = nap_count + night_sleep_count
        avg_per_session = total_hours / session_count if session_count > 0 else 0

        return {
            "period_days": days,
            "total_hours": round(total_hours, 2),
            "total_sessions": session_count,
            "nap_count": nap_count,
            "night_sleep_count": night_sleep_count,
            "average_per_session_hours": round(avg_per_session, 2),
            "total_awakenings": awakenings_total,
        }

    def get_diaper_report(self, baby_id: str, days: int = 7) -> Dict[str, Any]:
        """Generate diaper report for the last N days"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        events = self.repo.get_events_by_date_range(
            baby_id, start_date, end_date, event_type="diaper"
        )

        subtypes = {"wet": 0, "dirty": 0, "mixed": 0}

        for event in events:
            subtype = event.get("subtype")
            if subtype in subtypes:
                subtypes[subtype] += 1

        total_count = sum(subtypes.values())
        avg_per_day = total_count / days if days > 0 else 0

        return {
            "period_days": days,
            "total_count": total_count,
            "average_per_day": round(avg_per_day, 2),
            "wet_count": subtypes["wet"],
            "dirty_count": subtypes["dirty"],
            "mixed_count": subtypes["mixed"],
        }

    def get_activity_report(self, baby_id: str, days: int = 7) -> Dict[str, Any]:
        """Generate activity report for the last N days"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        events = self.repo.get_events_by_date_range(
            baby_id, start_date, end_date, event_type="activity"
        )

        activities = {}
        total_duration = 0

        for event in events:
            subtype = event.get("subtype")
            if subtype not in activities:
                activities[subtype] = {"count": 0, "total_minutes": 0}

            activities[subtype]["count"] += 1

            # Calculate duration if we have timestamps
            start = self._parse_datetime(event.get("timestamp"))
            end = self._parse_datetime(event.get("end_timestamp"))
            if start and end:
                duration_minutes = (end - start).total_seconds() / 60
                activities[subtype]["total_minutes"] += duration_minutes
                total_duration += duration_minutes

        return {
            "period_days": days,
            "activities": activities,
            "total_activity_minutes": round(total_duration, 2),
        }

    def get_comprehensive_report(self, baby_id: str, days: int = 7) -> Dict[str, Any]:
        """Generate comprehensive report across all metrics"""
        return {
            "period_days": days,
            "generated_at": datetime.utcnow().isoformat(),
            "feeding": self.get_feeding_report(baby_id, days),
            "sleep": self.get_sleep_report(baby_id, days),
            "diaper": self.get_diaper_report(baby_id, days),
            "activity": self.get_activity_report(baby_id, days),
        }

    @staticmethod
    def _parse_datetime(dt_str: str):
        """Parse datetime string"""
        if not dt_str:
            return None

        try:
            if "T" in dt_str:
                return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
            return datetime.fromisoformat(dt_str)
        except (ValueError, AttributeError):
            return None

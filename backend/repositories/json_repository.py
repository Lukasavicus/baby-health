"""JSON file-based repository implementation"""
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime
from .base import BaseRepository


class JsonRepository(BaseRepository):
    """JSON file-based data storage implementation"""

    def __init__(self, data_dir: Path):
        """Initialize JSON repository with data directory"""
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Initialize data files for each model type
        self.files = {
            "baby": self.data_dir / "babies.json",
            "caregiver": self.data_dir / "caregivers.json",
            "event": self.data_dir / "events.json",
            "medication": self.data_dir / "medications.json",
        }

        # Create empty files if they don't exist
        for file_path in self.files.values():
            if not file_path.exists():
                file_path.write_text(json.dumps([], indent=2))

    def _load_data(self, model_type: str) -> List[Dict[str, Any]]:
        """Load data from JSON file"""
        file_path = self.files.get(model_type)
        if not file_path or not file_path.exists():
            return []

        try:
            content = file_path.read_text()
            return json.loads(content) if content else []
        except (json.JSONDecodeError, IOError):
            return []

    def _save_data(self, model_type: str, data: List[Dict[str, Any]]) -> None:
        """Save data to JSON file"""
        file_path = self.files.get(model_type)
        if not file_path:
            return

        file_path.write_text(json.dumps(data, indent=2, default=str))

    def get_by_id(self, model_type: str, id: str) -> Optional[Dict[str, Any]]:
        """Get a single item by ID"""
        data = self._load_data(model_type)
        for item in data:
            if item.get("id") == id:
                return item
        return None

    def get_all(self, model_type: str, **filters) -> List[Dict[str, Any]]:
        """Get all items of a type, optionally filtered"""
        data = self._load_data(model_type)

        # Apply filters
        if filters:
            for key, value in filters.items():
                data = [item for item in data if item.get(key) == value]

        return data

    def create(self, model_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new item"""
        items = self._load_data(model_type)
        items.append(data)
        self._save_data(model_type, items)
        return data

    def update(
        self, model_type: str, id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update an existing item"""
        items = self._load_data(model_type)

        for i, item in enumerate(items):
            if item.get("id") == id:
                # Merge updates
                updated_item = {**item, **data}
                updated_item["updated_at"] = datetime.utcnow().isoformat()
                items[i] = updated_item
                self._save_data(model_type, items)
                return updated_item

        return None

    def delete(self, model_type: str, id: str) -> bool:
        """Delete an item"""
        items = self._load_data(model_type)
        original_len = len(items)
        items = [item for item in items if item.get("id") != id]

        if len(items) < original_len:
            self._save_data(model_type, items)
            return True
        return False

    def list_by_field(
        self, model_type: str, field: str, value: Any
    ) -> List[Dict[str, Any]]:
        """List items by a specific field value"""
        data = self._load_data(model_type)
        return [item for item in data if item.get(field) == value]

    def delete_by_field(self, model_type: str, field: str, value: Any) -> int:
        """Delete items by a specific field value"""
        items = self._load_data(model_type)
        original_len = len(items)
        items = [item for item in items if item.get(field) != value]
        deleted = original_len - len(items)

        if deleted > 0:
            self._save_data(model_type, items)

        return deleted

    def get_events_by_date_range(
        self,
        baby_id: str,
        start_date: datetime,
        end_date: datetime,
        event_type: Optional[str] = None,
        caregiver_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get events within a date range with optional filters"""
        events = self._load_data("event")

        # Filter by baby_id
        events = [e for e in events if e.get("baby_id") == baby_id]

        # Filter by date range
        events = [
            e
            for e in events
            if self._parse_datetime(e.get("timestamp"))
            and start_date
            <= self._parse_datetime(e.get("timestamp"))
            <= end_date
        ]

        # Filter by event type if specified
        if event_type:
            events = [e for e in events if e.get("type") == event_type]

        # Filter by caregiver if specified
        if caregiver_id:
            events = [e for e in events if e.get("caregiver_id") == caregiver_id]

        # Sort by timestamp
        events.sort(key=lambda e: self._parse_datetime(e.get("timestamp")))

        return events

    @staticmethod
    def _parse_datetime(dt_str: str) -> Optional[datetime]:
        """Parse datetime string"""
        if not dt_str:
            return None

        try:
            # Handle ISO format with potential timezone
            if "T" in dt_str:
                return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
            return datetime.fromisoformat(dt_str)
        except (ValueError, AttributeError):
            return None

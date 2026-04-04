"""Abstract base repository pattern"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from datetime import datetime


class BaseRepository(ABC):
    """Abstract base repository for data access"""

    @abstractmethod
    def get_by_id(self, model_type: str, id: str) -> Optional[Dict[str, Any]]:
        """Get a single item by ID"""
        pass

    @abstractmethod
    def get_all(self, model_type: str, **filters) -> List[Dict[str, Any]]:
        """Get all items of a type, optionally filtered"""
        pass

    @abstractmethod
    def create(self, model_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new item"""
        pass

    @abstractmethod
    def update(self, model_type: str, id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing item"""
        pass

    @abstractmethod
    def delete(self, model_type: str, id: str) -> bool:
        """Delete an item"""
        pass

    @abstractmethod
    def list_by_field(
        self, model_type: str, field: str, value: Any
    ) -> List[Dict[str, Any]]:
        """List items by a specific field value"""
        pass

    @abstractmethod
    def delete_by_field(self, model_type: str, field: str, value: Any) -> int:
        """Delete items by a specific field value"""
        pass

    @abstractmethod
    def get_events_by_date_range(
        self,
        baby_id: str,
        start_date: datetime,
        end_date: datetime,
        event_type: Optional[str] = None,
        caregiver_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get events within a date range with optional filters"""
        pass

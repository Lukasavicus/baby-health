"""Event model for logging baby activities"""
from datetime import datetime
from typing import Any, Dict, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


# Event types and subtypes
EventType = Literal[
    "feeding",
    "hydration",
    "sleep",
    "diaper",
    "activity",
    "medication",
    "bath",
    "health",
]
FeedingSubtype = Literal[
    "bottle_formula", "bottle_breastmilk", "breastfeeding", "solids", "snack"
]
HydrationSubtype = Literal["water", "juice", "other"]
SleepSubtype = Literal["nap", "night_sleep"]
DiaperSubtype = Literal["wet", "dirty", "mixed"]
ActivitySubtype = Literal[
    "tummy_time",
    "reading",
    "play",
    "walk",
    "bath",
    "sensory",
    "music",
    "visual",
    "auditory",
    "spatial",
]
BathSubtype = Literal["bath"]
HealthSubtype = Literal["vitamin", "medication"]


class Event(BaseModel):
    """Event/log entry model"""

    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    baby_id: str
    caregiver_id: str
    type: EventType
    subtype: str  # Specific subtype depends on type
    timestamp: datetime
    end_timestamp: Optional[datetime] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None  # ml, oz, g, etc.
    notes: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "event123",
                "baby_id": "baby123",
                "caregiver_id": "caregiver123",
                "type": "feeding",
                "subtype": "bottle_formula",
                "timestamp": "2024-01-15T10:30:00",
                "end_timestamp": None,
                "quantity": 120,
                "unit": "ml",
                "notes": "Baby seemed hungry",
                "metadata": {},
                "created_at": "2024-01-15T10:30:00",
                "updated_at": "2024-01-15T10:30:00",
            }
        }


class EventIncoming(BaseModel):
    """Loose create payload (App Design / aliases); normalized before persistence."""

    model_config = ConfigDict(extra="ignore")

    baby_id: str
    caregiver_id: str
    type: str
    subtype: str = ""
    timestamp: Optional[datetime] = None
    end_timestamp: Optional[datetime] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    notes: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EventCreate(BaseModel):
    """Schema for creating an event (canonical, post-normalization)"""

    baby_id: str
    caregiver_id: str
    type: EventType
    subtype: str
    timestamp: datetime
    end_timestamp: Optional[datetime] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    notes: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EventUpdate(BaseModel):
    """Schema for updating an event"""

    type: Optional[EventType] = None
    subtype: Optional[str] = None
    timestamp: Optional[datetime] = None
    end_timestamp: Optional[datetime] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class EventResponse(BaseModel):
    """Schema for event response"""

    id: str
    baby_id: str
    caregiver_id: str
    type: EventType
    subtype: str
    timestamp: datetime
    end_timestamp: Optional[datetime]
    quantity: Optional[float]
    unit: Optional[str]
    notes: Optional[str]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class EventSummary(BaseModel):
    """Summary of events for a given period"""

    date: str  # YYYY-MM-DD
    feeding_count: int = 0
    feeding_total_ml: float = 0
    hydration_count: int = 0
    hydration_total_ml: float = 0
    sleep_hours: float = 0
    diaper_count: int = 0
    activity_count: int = 0
    bath_count: int = 0
    health_count: int = 0

"""Medication model"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Medication(BaseModel):
    """Medication model for tracking baby medications"""

    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    baby_id: str
    name: str
    dose: float
    unit: str  # mg, ml, drops, etc.
    frequency: str  # "every 8 hours", "daily", "as needed", etc.
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "med123",
                "baby_id": "baby123",
                "name": "Vitamin D",
                "dose": 400,
                "unit": "IU",
                "frequency": "daily",
                "active": True,
                "created_at": "2024-01-15T10:30:00",
            }
        }


class MedicationCreate(BaseModel):
    """Schema for creating a medication"""

    baby_id: str
    name: str = Field(..., min_length=1, max_length=100)
    dose: float
    unit: str
    frequency: str
    active: bool = True


class MedicationUpdate(BaseModel):
    """Schema for updating a medication"""

    name: Optional[str] = None
    dose: Optional[float] = None
    unit: Optional[str] = None
    frequency: Optional[str] = None
    active: Optional[bool] = None


class MedicationResponse(BaseModel):
    """Schema for medication response"""

    id: str
    baby_id: str
    name: str
    dose: float
    unit: str
    frequency: str
    active: bool
    created_at: datetime

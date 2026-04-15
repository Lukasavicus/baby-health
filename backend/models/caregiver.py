"""Caregiver model"""
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


CaregiverRole = Literal[
    "pai",
    "mãe",
    "babá",
    "avó",
    "avô",
    "vovô",
    "vovó",
    "tia",
    "tio",
    "outro",
]
AvatarColor = Literal["red", "blue", "green", "yellow", "purple", "orange", "pink", "teal"]


class Caregiver(BaseModel):
    """Caregiver model"""

    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    name: str
    role: CaregiverRole
    avatar_color: AvatarColor = "blue"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "caregiver123",
                "name": "Maria",
                "role": "mãe",
                "avatar_color": "blue",
                "created_at": "2024-01-15T10:30:00",
            }
        }


class CaregiverCreate(BaseModel):
    """Schema for creating a caregiver"""

    name: str = Field(..., min_length=1, max_length=100)
    role: CaregiverRole
    avatar_color: AvatarColor = "blue"


class CaregiverUpdate(BaseModel):
    """Schema for updating a caregiver"""

    name: Optional[str] = None
    role: Optional[CaregiverRole] = None
    avatar_color: Optional[AvatarColor] = None


class CaregiverResponse(BaseModel):
    """Schema for caregiver response"""

    id: str
    name: str
    role: CaregiverRole
    avatar_color: AvatarColor
    created_at: datetime

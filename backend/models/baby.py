"""Baby model"""
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


BabyGender = Literal["male", "female", "unknown"]


class Baby(BaseModel):
    """Baby profile model"""

    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    name: str
    birth_date: str  # ISO format: YYYY-MM-DD
    photo_url: Optional[str] = None
    gender: Optional[BabyGender] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "baby123",
                "name": "Emma",
                "birth_date": "2024-01-15",
                "photo_url": None,
                "created_at": "2024-01-15T10:30:00",
            }
        }


class BabyCreate(BaseModel):
    """Schema for creating a baby"""

    name: str = Field(..., min_length=1, max_length=100)
    birth_date: str = Field(..., description="ISO format: YYYY-MM-DD")
    photo_url: Optional[str] = None
    gender: Optional[BabyGender] = None


class BabyUpdate(BaseModel):
    """Schema for updating a baby"""

    name: Optional[str] = None
    birth_date: Optional[str] = None
    photo_url: Optional[str] = None
    gender: Optional[BabyGender] = None


class BabyResponse(BaseModel):
    """Schema for baby response"""

    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    birth_date: str
    photo_url: Optional[str]
    gender: Optional[BabyGender] = None
    created_at: datetime

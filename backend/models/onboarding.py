"""Request/response models for public onboarding API."""
from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator

from models.baby import BabyGender
from models.caregiver import CaregiverRole


class SendVerificationRequest(BaseModel):
    email: EmailStr


class SendVerificationResponse(BaseModel):
    ok: bool = True
    mock: bool = True


class CheckEmailRequest(BaseModel):
    email: EmailStr


class CheckEmailResponse(BaseModel):
    available: bool


class OnboardingBabyIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    birth_date: str = Field(..., description="YYYY-MM-DD")
    gender: BabyGender | None = None
    weight_kg: float | None = Field(None, ge=0, le=30)
    height_cm: float | None = Field(None, ge=20, le=150)


class OnboardingCompleteRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    display_name: str = Field(..., min_length=1, max_length=100)
    role: CaregiverRole
    verification_code: str = Field(..., min_length=6, max_length=6)
    baby: OnboardingBabyIn

    @field_validator("verification_code")
    @classmethod
    def six_digits(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError("verification_code must be exactly 6 digits")
        return v

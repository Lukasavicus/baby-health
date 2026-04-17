from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class CatalogResponse(BaseModel):
    features: list[dict[str, Any]]


class ProfileAssignments(BaseModel):
    profileId: str
    assignments: dict[str, str]


class AssignmentsListResponse(BaseModel):
    profiles: list[ProfileAssignments]


class AssignmentsPatchBody(BaseModel):
    profileId: str = Field(..., min_length=1)
    assignments: dict[str, str]

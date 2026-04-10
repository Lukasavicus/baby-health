"""Authentication models for BabyHealth API."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class User(BaseModel):
    id: str
    username: str
    display_name: str
    hashed_password: str
    profile_dir: str
    caregiver_id: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


class UserInfo(BaseModel):
    id: str
    username: str
    display_name: str
    profile_dir: str
    caregiver_id: str


class TokenPayload(BaseModel):
    sub: str
    username: str
    profile_dir: str
    caregiver_id: str
    exp: Optional[int] = None

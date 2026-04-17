"""JWT creation, validation and password hashing."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from config import settings
from models.auth import TokenPayload


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(
    user_id: str,
    username: str,
    profile_dir: str,
    caregiver_id: str,
    display_name: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.jwt_expiry_minutes)
    )
    payload = {
        "sub": user_id,
        "username": username,
        "profile_dir": profile_dir,
        "caregiver_id": caregiver_id,
        "exp": expire,
    }
    if display_name:
        payload["display_name"] = display_name
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[TokenPayload]:
    try:
        data = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        return TokenPayload(**data)
    except JWTError:
        return None

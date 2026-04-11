"""Shared FastAPI dependencies (auth, JSON repository)."""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import settings
from models.auth import TokenPayload
from repositories import BaseRepository, JsonRepository
from services.auth_service import decode_access_token
from services.user_service import UserService

def _make_gcs_repo(prefix: str) -> BaseRepository:
    from repositories.gcs_repository import GcsRepository
    return GcsRepository(bucket_name=settings.gcs_bucket, prefix=prefix)

_bearer_scheme = HTTPBearer(auto_error=False)

_user_service: UserService | None = None


def get_user_service() -> UserService:
    global _user_service
    if _user_service is None:
        _user_service = UserService(settings.data_dir.resolve() / "users.json")
    return _user_service


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> TokenPayload:
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(creds.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


def get_profile_repository(
    user: TokenPayload = Depends(get_current_user),
) -> BaseRepository:
    if settings.storage_type == "gcs":
        return _make_gcs_repo(f"{user.profile_dir}/")
    profile_path = (settings.data_dir / user.profile_dir).resolve()
    if not profile_path.is_dir():
        raise HTTPException(
            status_code=500,
            detail=f"Profile directory not found: {user.profile_dir}",
        )
    return JsonRepository(profile_path)


def get_profile_json_repository(
    user: TokenPayload = Depends(get_current_user),
) -> JsonRepository:
    repo = get_profile_repository(user)
    if not isinstance(repo, JsonRepository):
        raise HTTPException(
            status_code=500,
            detail="JSON storage required for this endpoint.",
        )
    return repo


# Legacy helpers kept for backward-compatibility during migration
def get_repository() -> BaseRepository:
    if settings.storage_type == "gcs":
        return _make_gcs_repo("")
    return JsonRepository(settings.data_dir.resolve())


def get_json_repository() -> JsonRepository:
    repo = get_repository()
    if not isinstance(repo, JsonRepository):
        raise HTTPException(
            status_code=500,
            detail="JSON storage required for this endpoint.",
        )
    return repo

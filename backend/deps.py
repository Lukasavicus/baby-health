"""Shared FastAPI dependencies (JSON repository)."""
from __future__ import annotations

from fastapi import HTTPException

from config import settings
from repositories import BaseRepository, JsonRepository


def get_repository() -> BaseRepository:
    if settings.storage_type != "json":
        raise ValueError(f"Unsupported storage type: {settings.storage_type}")
    return JsonRepository(settings.data_dir.resolve())


def get_json_repository() -> JsonRepository:
    """Same as get_repository, typed as JsonRepository for JSON-only helpers."""
    repo = get_repository()
    if not isinstance(repo, JsonRepository):
        raise HTTPException(
            status_code=500,
            detail="JSON storage required for this endpoint.",
        )
    return repo

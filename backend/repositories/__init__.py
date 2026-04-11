"""Repository layer for data persistence"""
from .base import BaseRepository
from .json_repository import JsonRepository

__all__ = ["BaseRepository", "JsonRepository"]

# GcsRepository is imported lazily in deps.py to avoid requiring
# google-cloud-storage when running locally with STORAGE_TYPE=json.


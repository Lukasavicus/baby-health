"""Repository layer for data persistence"""
from .base import BaseRepository
from .json_repository import JsonRepository

__all__ = ["BaseRepository", "JsonRepository"]

"""User credential management backed by a JSON file."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from models.auth import User


class UserService:
    def __init__(self, users_file: Path):
        self._path = users_file
        self._users: list[User] = []
        self._load()

    def _load(self) -> None:
        if not self._path.is_file():
            self._users = []
            return
        raw = json.loads(self._path.read_text(encoding="utf-8"))
        self._users = [User.model_validate(u) for u in raw]

    def get_by_username(self, username: str) -> Optional[User]:
        for u in self._users:
            if u.username == username:
                return u
        return None

    def get_by_id(self, user_id: str) -> Optional[User]:
        for u in self._users:
            if u.id == user_id:
                return u
        return None

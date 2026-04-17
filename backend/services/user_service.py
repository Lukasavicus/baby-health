"""User credential management backed by a JSON file."""
from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Optional

from models.auth import User


def normalize_login_username(username: str) -> str:
    return username.strip().lower()


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

    def _persist(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        payload = [u.model_dump() for u in self._users]
        self._path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")

    def get_by_username(self, username: str) -> Optional[User]:
        key = normalize_login_username(username)
        for u in self._users:
            if normalize_login_username(u.username) == key:
                return u
        return None

    def get_by_id(self, user_id: str) -> Optional[User]:
        for u in self._users:
            if u.id == user_id:
                return u
        return None

    def email_taken(self, email: str) -> bool:
        return self.get_by_username(email) is not None

    def create_user(
        self,
        *,
        username: str,
        display_name: str,
        plain_password: str,
        profile_dir: str,
        caregiver_id: str,
    ) -> User:
        from services.auth_service import hash_password

        key = normalize_login_username(username)
        if self.get_by_username(key):
            raise ValueError("Username or email already registered")
        user = User(
            id=f"usr-{uuid.uuid4().hex[:12]}",
            username=key,
            display_name=display_name.strip(),
            hashed_password=hash_password(plain_password),
            profile_dir=profile_dir,
            caregiver_id=caregiver_id,
        )
        self._users.append(user)
        self._persist()
        return user

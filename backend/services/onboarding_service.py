"""Provision a new data profile, baby, primary caregiver, and user (onboarding)."""
from __future__ import annotations

import random
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, cast

from config import settings
from models.auth import LoginResponse, UserInfo
from models.baby import Baby
from models.caregiver import AvatarColor, Caregiver
from models.onboarding import OnboardingCompleteRequest
from repositories.gcs_repository import GcsRepository
from repositories.json_repository import JsonRepository
from services.auth_service import create_access_token
from services.user_service import UserService, normalize_login_username

MOCK_EMAIL_CODE = "123456"

_AVATAR_COLORS: List[str] = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "teal",
]


def _new_profile_dir() -> str:
    return f"p-{uuid.uuid4().hex[:12]}"


def _validate_profile_path(data_root: Path, profile_dir: str) -> Path:
    root = data_root.resolve()
    path = (root / profile_dir).resolve()
    if path == root or root not in path.parents:
        raise ValueError("Invalid profile_dir")
    return path


def _cleanup_local_profile(data_root: Path, profile_dir: str) -> None:
    try:
        path = _validate_profile_path(data_root, profile_dir)
        if path.is_dir():
            shutil.rmtree(path, ignore_errors=True)
    except ValueError:
        return


def _provision_gcs(profile_dir: str, body: OnboardingCompleteRequest, user_svc: UserService) -> LoginResponse:
    if not settings.gcs_bucket:
        raise RuntimeError("GCS_BUCKET is not configured")

    repo = GcsRepository(bucket_name=settings.gcs_bucket, prefix=f"{profile_dir}/")
    caregiver_id = uuid.uuid4().hex
    baby_id = uuid.uuid4().hex
    now = datetime.utcnow()

    caregiver = Caregiver(
        id=caregiver_id,
        name=body.display_name.strip(),
        role=body.role,
        avatar_color=cast(AvatarColor, random.choice(_AVATAR_COLORS)),
        created_at=now,
    )
    baby = Baby(
        id=baby_id,
        name=body.baby.name.strip(),
        birth_date=body.baby.birth_date,
        photo_url=None,
        gender=body.baby.gender,
        created_at=now,
    )
    repo.create("caregiver", caregiver.model_dump())
    repo.create("baby", baby.model_dump())

    if body.baby.weight_kg is not None or body.baby.height_cm is not None:
        entry = {
            "id": str(int(now.timestamp() * 1000)),
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "weight": float(body.baby.weight_kg or 0),
            "height": float(body.baby.height_cm or 0),
            "head": 0.0,
        }
        repo.merge_baby_ui_state(baby_id, {"growth_entries": [entry]})

    user = user_svc.create_user(
        username=normalize_login_username(str(body.email)),
        display_name=body.display_name,
        plain_password=body.password,
        profile_dir=profile_dir,
        caregiver_id=caregiver_id,
    )

    token = create_access_token(
        user_id=user.id,
        username=user.username,
        profile_dir=user.profile_dir,
        caregiver_id=user.caregiver_id,
        display_name=user.display_name,
    )
    return LoginResponse(
        access_token=token,
        user=UserInfo(
            id=user.id,
            username=user.username,
            display_name=user.display_name,
            profile_dir=user.profile_dir,
            caregiver_id=user.caregiver_id,
        ),
    )


def _provision_json(profile_dir: str, body: OnboardingCompleteRequest, user_svc: UserService) -> LoginResponse:
    data_root = settings.data_dir.resolve()
    path = _validate_profile_path(data_root, profile_dir)
    path.mkdir(parents=True, exist_ok=False)
    try:
        repo = JsonRepository(path)
        caregiver_id = uuid.uuid4().hex
        baby_id = uuid.uuid4().hex
        now = datetime.utcnow()

        caregiver = Caregiver(
            id=caregiver_id,
            name=body.display_name.strip(),
            role=body.role,
            avatar_color=cast(AvatarColor, random.choice(_AVATAR_COLORS)),
            created_at=now,
        )
        baby = Baby(
            id=baby_id,
            name=body.baby.name.strip(),
            birth_date=body.baby.birth_date,
            photo_url=None,
            gender=body.baby.gender,
            created_at=now,
        )
        repo.create("caregiver", caregiver.model_dump())
        repo.create("baby", baby.model_dump())

        if body.baby.weight_kg is not None or body.baby.height_cm is not None:
            entry: Dict[str, Any] = {
                "id": str(int(now.timestamp() * 1000)),
                "date": datetime.utcnow().strftime("%Y-%m-%d"),
                "weight": float(body.baby.weight_kg or 0),
                "height": float(body.baby.height_cm or 0),
                "head": 0.0,
            }
            repo.merge_baby_ui_state(baby_id, {"growth_entries": [entry]})

        user = user_svc.create_user(
            username=normalize_login_username(str(body.email)),
            display_name=body.display_name,
            plain_password=body.password,
            profile_dir=profile_dir,
            caregiver_id=caregiver_id,
        )

        token = create_access_token(
            user_id=user.id,
            username=user.username,
            profile_dir=user.profile_dir,
            caregiver_id=user.caregiver_id,
            display_name=user.display_name,
        )
        return LoginResponse(
            access_token=token,
            user=UserInfo(
                id=user.id,
                username=user.username,
                display_name=user.display_name,
                profile_dir=user.profile_dir,
                caregiver_id=user.caregiver_id,
            ),
        )
    except Exception:
        _cleanup_local_profile(data_root, profile_dir)
        raise


def run_onboarding_complete(body: OnboardingCompleteRequest, user_svc: UserService) -> LoginResponse:
    if not settings.allow_mock_onboarding_email_code:
        raise PermissionError("Onboarding with mock email code is disabled")
    if body.verification_code != MOCK_EMAIL_CODE:
        raise ValueError("Invalid verification code")
    if user_svc.email_taken(str(body.email)):
        raise ValueError("Email already registered")

    last_err: Exception | None = None
    for _ in range(5):
        profile_dir = _new_profile_dir()
        try:
            if settings.storage_type == "gcs":
                return _provision_gcs(profile_dir, body, user_svc)
            return _provision_json(profile_dir, body, user_svc)
        except FileExistsError as e:
            last_err = e
            continue
        except Exception:
            if settings.storage_type != "gcs":
                _cleanup_local_profile(settings.data_dir.resolve(), profile_dir)
            raise
    raise RuntimeError("Could not allocate profile directory") from last_err

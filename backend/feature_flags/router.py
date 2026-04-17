"""
Feature flags API.

Management routes (assignments) require X-TOTP-Code. Catalog is public metadata only.
GET /me uses the normal JWT — no TOTP on every app load.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status

from deps import get_current_user
from models.auth import TokenPayload
from feature_flags.schemas import AssignmentsPatchBody, CatalogResponse
from feature_flags.store import store_from_env
from feature_flags import totp

router = APIRouter(prefix="/api/feature-flags", tags=["feature-flags"])


def _store() -> FeatureFlagStore:
    """Resolve store path from env on each use (tests can monkeypatch env)."""
    return store_from_env()


def require_totp(
    x_totp_code: str | None = Header(default=None, alias="X-TOTP-Code"),
) -> None:
    if not totp.totp_configured():
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "FEATURE_FLAGS_TOTP_SECRET not configured",
        )
    if not totp.verify_totp(x_totp_code):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invalid or missing X-TOTP-Code",
        )


@router.get("/catalog", response_model=CatalogResponse)
def get_catalog() -> dict:
    data = _store().load()
    features: list[dict] = []
    for key, meta in data["features"].items():
        features.append(
            {
                "key": key,
                "variants": meta["variants"],
                "defaultVariant": meta["defaultVariant"],
                "description": meta.get("description"),
            }
        )
    return {"features": features}


@router.get("/assignments", dependencies=[Depends(require_totp)])
def get_assignments(profile_id: str | None = Query(default=None, alias="profileId")):
    data = _store().load()
    feats = data["features"]
    profs = data["profiles"]
    ids = [profile_id] if profile_id else sorted(profs.keys())
    return {
        "profiles": [
            {
                "profileId": pid,
                "assignments": _store().effective_assignments(pid, feats, profs),
            }
            for pid in ids
        ]
    }


@router.post("/assignments", dependencies=[Depends(require_totp)])
def post_assignments(body: AssignmentsPatchBody):
    data = _store().load()
    feats = data["features"]
    for k, v in body.assignments.items():
        if k not in feats:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Unknown feature: {k}")
        allowed = feats[k].get("variants") or []
        if v not in allowed:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid variant for {k}: {v}",
            )
    merged = _store().update_profile_assignments(body.profileId, body.assignments)
    return {"profileId": body.profileId, "assignments": merged}


@router.get("/me")
def get_me(user: TokenPayload = Depends(get_current_user)):
    data = _store().load()
    pid = user.profile_dir
    return {
        "profileId": pid,
        "assignments": _store().effective_assignments(
            pid, data["features"], data["profiles"]
        ),
    }

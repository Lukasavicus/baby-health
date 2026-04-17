"""Feature flags module: catalog, TOTP-guarded assignments, JWT /me."""

from __future__ import annotations

import importlib
import json
from pathlib import Path

import pyotp
import pytest
from fastapi.testclient import TestClient

import config


@pytest.fixture
def ff_secret() -> str:
    return "JBSWY3DPEHPK3PXP"


@pytest.fixture
def ff_client(monkeypatch: pytest.MonkeyPatch, tmp_path: Path, ff_secret: str):
    monkeypatch.setenv("FEATURE_FLAGS_ENABLED", "1")
    monkeypatch.setenv("FEATURE_FLAGS_STORE_PATH", str(tmp_path / "feature_flags_store.json"))
    monkeypatch.setenv("FEATURE_FLAGS_TOTP_SECRET", ff_secret)
    monkeypatch.setattr(config.settings, "data_dir", tmp_path)
    import main

    importlib.reload(main)
    return TestClient(main.app), ff_secret


def test_catalog_public_no_totp(ff_client):
    client, _ = ff_client
    r = client.get("/api/feature-flags/catalog")
    assert r.status_code == 200
    data = r.json()
    assert "features" in data
    keys = {f["key"] for f in data["features"]}
    assert "activities_tile" in keys
    assert {"v1", "v2"} == set(next(f for f in data["features"] if f["key"] == "activities_tile")["variants"])


def test_assignments_requires_totp(ff_client):
    client, _ = ff_client
    r = client.get("/api/feature-flags/assignments")
    assert r.status_code == 401
    r2 = client.get("/api/feature-flags/assignments", headers={"X-TOTP-Code": "000000"})
    assert r2.status_code == 401


def test_assignments_with_valid_totp(ff_client):
    client, secret = ff_client
    code = pyotp.TOTP(secret).now()
    r = client.get("/api/feature-flags/assignments", headers={"X-TOTP-Code": code})
    assert r.status_code == 200
    body = r.json()
    assert "profiles" in body
    assert len(body["profiles"]) >= 1
    lucas = next((p for p in body["profiles"] if p["profileId"] == "lucas-dev"), None)
    assert lucas is not None
    assert lucas["assignments"]["activities_tile"] == "v2"


def test_post_invalid_variant(ff_client):
    client, secret = ff_client
    code = pyotp.TOTP(secret).now()
    r = client.post(
        "/api/feature-flags/assignments",
        headers={"X-TOTP-Code": code},
        json={"profileId": "lucas-dev", "assignments": {"activities_tile": "v99"}},
    )
    assert r.status_code == 400


def test_post_updates_and_me_with_jwt(ff_client):
    client, secret = ff_client
    code = pyotp.TOTP(secret).now()
    r = client.post(
        "/api/feature-flags/assignments",
        headers={"X-TOTP-Code": code},
        json={"profileId": "lucas-dev", "assignments": {"activities_tile": "v1"}},
    )
    assert r.status_code == 200
    assert r.json()["assignments"]["activities_tile"] == "v1"

    from services.auth_service import create_access_token

    token = create_access_token(
        user_id="u1",
        username="t@t.com",
        profile_dir="lucas-dev",
        caregiver_id="c1",
    )
    me = client.get(
        "/api/feature-flags/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == 200
    assert me.json()["profileId"] == "lucas-dev"
    assert me.json()["assignments"]["activities_tile"] == "v1"


def test_me_without_jwt(ff_client):
    client, _ = ff_client
    r = client.get("/api/feature-flags/me")
    assert r.status_code == 401

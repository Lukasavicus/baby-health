"""TOTP verification for admin-style feature-flag routes (Google Authenticator–compatible)."""

from __future__ import annotations

import os

import pyotp


def totp_secret() -> str | None:
    raw = os.getenv("FEATURE_FLAGS_TOTP_SECRET", "").strip()
    return raw or None


def verify_totp(code: str | None) -> bool:
    if not code or not str(code).strip():
        return False
    secret = totp_secret()
    if not secret:
        return False
    totp = pyotp.TOTP(secret)
    return bool(totp.verify(str(code).strip(), valid_window=1))


def totp_configured() -> bool:
    return totp_secret() is not None

"""Configuration for BabyHealth API"""
import json
import os
import secrets
import sys
from pathlib import Path

from dotenv import load_dotenv


def _parse_cors_origins(raw: str) -> list[str]:
    """Support comma-separated URLs or a JSON array (as in root .env.example)."""
    text = raw.strip()
    if not text:
        return []
    if text.startswith("["):
        try:
            data = json.loads(text)
            if isinstance(data, list):
                return [str(x).strip() for x in data if str(x).strip()]
        except json.JSONDecodeError:
            pass
    out: list[str] = []
    for part in text.split(","):
        p = part.strip().strip('"').strip("'")
        if p and p != "*":
            out.append(p)
    return out

# Repo root = parent of backend/ — load .env before reading any os.getenv below.
# Skip under pytest so local `.env` does not override test expectations (auth, DEBUG, etc.).
if "pytest" not in sys.modules:
    _REPO_ROOT = Path(__file__).resolve().parent.parent
    load_dotenv(_REPO_ROOT / ".env")


def use_ui_seed() -> bool:
    """When True, /api/ui/bootstrap merges JSON from backend/ui_app_defaults/. When False, bootstrap is empty (repo baby only). Read on each call so tests can monkeypatch env."""
    return os.getenv("BABYHEALTH_USE_UI_SEED", "").lower() in ("1", "true", "yes")


class Settings:
    """Application settings"""

    def __init__(self):
        # App
        self.app_name = os.getenv("APP_NAME", "BabyHealth API")
        self.app_version = os.getenv("APP_VERSION", "1.0.0")
        self.debug = os.getenv("DEBUG", "True").lower() == "true"

        # Storage: "json" (local files) or "gcs" (Google Cloud Storage)
        self.storage_type = os.getenv("STORAGE_TYPE", "json")
        self.data_dir = Path(os.getenv("DATA_DIR", str(Path(__file__).parent / "data")))
        self.gcs_bucket = os.getenv("GCS_BUCKET", "")

        # JWT
        self.jwt_secret = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_expiry_minutes = int(os.getenv("JWT_EXPIRY_MINUTES", "1440"))

        # Built SPA (Vite); default legacy frontend, override for App Design bundle
        _default_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
        self.frontend_dist_dir = Path(
            os.getenv("FRONTEND_DIST_DIR", str(_default_dist))
        ).resolve()

        # CORS (no "*" — incompatible with allow_credentials=True in Starlette)
        cors_str = os.getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:8080,http://localhost:5173,"
            "http://127.0.0.1:5173,http://127.0.0.1:8080",
        )
        self.cors_allowed_origins = _parse_cors_origins(cors_str)


settings = Settings()

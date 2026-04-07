"""Configuration for BabyHealth API"""
import os
from pathlib import Path


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

        # JSON store root (babies.json, events.json, …). Use a different path per environment.
        self.storage_type = os.getenv("STORAGE_TYPE", "json")
        self.data_dir = Path(os.getenv("DATA_DIR", str(Path(__file__).parent / "data")))

        # Built SPA (Vite); default legacy frontend, override for App Design bundle
        _default_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
        self.frontend_dist_dir = Path(
            os.getenv("FRONTEND_DIST_DIR", str(_default_dist))
        ).resolve()

        # CORS
        cors_str = os.getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:8000,http://localhost:5173,*"
        )
        self.cors_allowed_origins = [origin.strip() for origin in cors_str.split(",")]


settings = Settings()

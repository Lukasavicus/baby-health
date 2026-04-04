"""Configuration for BabyHealth API"""
import os
from pathlib import Path


class Settings:
    """Application settings"""

    def __init__(self):
        # App
        self.app_name = os.getenv("APP_NAME", "BabyHealth API")
        self.app_version = os.getenv("APP_VERSION", "1.0.0")
        self.debug = os.getenv("DEBUG", "True").lower() == "true"

        # Storage
        self.storage_type = os.getenv("STORAGE_TYPE", "json")
        self.data_dir = Path(os.getenv("DATA_DIR", str(Path(__file__).parent / "data")))

        # CORS
        cors_str = os.getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:8000,http://localhost:5173,*"
        )
        self.cors_allowed_origins = [origin.strip() for origin in cors_str.split(",")]


settings = Settings()

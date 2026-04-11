"""Google Cloud Storage repository implementation.

Drop-in replacement for JsonRepository — same CRUD semantics, but reads/writes
JSON blobs in a GCS bucket instead of local files.
"""
import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from google.cloud import storage
from google.api_core.exceptions import NotFound

from .base import BaseRepository


class GcsRepository(BaseRepository):
    """GCS-backed data storage.  Each model type maps to a JSON blob."""

    _MODEL_FILES = {
        "baby": "babies.json",
        "caregiver": "caregivers.json",
        "event": "events.json",
        "medication": "medications.json",
    }

    def __init__(self, bucket_name: str, prefix: str = ""):
        self._client = storage.Client()
        self._bucket = self._client.bucket(bucket_name)
        self._prefix = prefix

    def _blob_path(self, filename: str) -> str:
        return f"{self._prefix}{filename}"

    def _load_data(self, model_type: str) -> List[Dict[str, Any]]:
        filename = self._MODEL_FILES.get(model_type)
        if not filename:
            return []
        blob = self._bucket.blob(self._blob_path(filename))
        try:
            content = blob.download_as_text()
            return json.loads(content) if content else []
        except (NotFound, json.JSONDecodeError):
            return []

    def _save_data(self, model_type: str, data: List[Dict[str, Any]]) -> None:
        filename = self._MODEL_FILES.get(model_type)
        if not filename:
            return
        blob = self._bucket.blob(self._blob_path(filename))
        blob.upload_from_string(
            json.dumps(data, indent=2, default=str),
            content_type="application/json",
        )

    # --- CRUD (mirrors JsonRepository) ---

    def get_by_id(self, model_type: str, id: str) -> Optional[Dict[str, Any]]:
        for item in self._load_data(model_type):
            if item.get("id") == id:
                return item
        return None

    def get_all(self, model_type: str, **filters) -> List[Dict[str, Any]]:
        data = self._load_data(model_type)
        for key, value in filters.items():
            data = [item for item in data if item.get(key) == value]
        return data

    def create(self, model_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        items = self._load_data(model_type)
        items.append(data)
        self._save_data(model_type, items)
        return data

    def update(self, model_type: str, id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        items = self._load_data(model_type)
        for i, item in enumerate(items):
            if item.get("id") == id:
                updated = {**item, **data, "updated_at": datetime.utcnow().isoformat()}
                items[i] = updated
                self._save_data(model_type, items)
                return updated
        return None

    def delete(self, model_type: str, id: str) -> bool:
        items = self._load_data(model_type)
        filtered = [item for item in items if item.get("id") != id]
        if len(filtered) < len(items):
            self._save_data(model_type, filtered)
            return True
        return False

    def list_by_field(self, model_type: str, field: str, value: Any) -> List[Dict[str, Any]]:
        return [item for item in self._load_data(model_type) if item.get(field) == value]

    def delete_by_field(self, model_type: str, field: str, value: Any) -> int:
        items = self._load_data(model_type)
        filtered = [item for item in items if item.get(field) != value]
        deleted = len(items) - len(filtered)
        if deleted > 0:
            self._save_data(model_type, filtered)
        return deleted

    def get_events_by_date_range(
        self,
        baby_id: str,
        start_date: datetime,
        end_date: datetime,
        event_type: Optional[str] = None,
        caregiver_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        events = [e for e in self._load_data("event") if e.get("baby_id") == baby_id]
        events = [
            e for e in events
            if self._parse_dt(e.get("timestamp"))
            and start_date <= self._parse_dt(e.get("timestamp")) <= end_date
        ]
        if event_type:
            events = [e for e in events if e.get("type") == event_type]
        if caregiver_id:
            events = [e for e in events if e.get("caregiver_id") == caregiver_id]
        events.sort(key=lambda e: self._parse_dt(e.get("timestamp")))
        return events

    # --- baby_ui_state (same contract as JsonRepository) ---

    _UI_STATE_FILE = "baby_ui_state.json"

    def get_baby_ui_state(self, baby_id: str) -> Dict[str, Any]:
        blob = self._bucket.blob(self._blob_path(self._UI_STATE_FILE))
        try:
            raw = json.loads(blob.download_as_text())
        except (NotFound, json.JSONDecodeError):
            return {}
        by_baby = raw.get("by_baby_id") or {}
        if not isinstance(by_baby, dict):
            return {}
        state = by_baby.get(baby_id)
        return dict(state) if isinstance(state, dict) else {}

    def merge_baby_ui_state(self, baby_id: str, patch: Dict[str, Any]) -> Dict[str, Any]:
        blob = self._bucket.blob(self._blob_path(self._UI_STATE_FILE))
        try:
            raw = json.loads(blob.download_as_text())
        except (NotFound, json.JSONDecodeError):
            raw = {"version": 1, "by_baby_id": {}}
        if "by_baby_id" not in raw or not isinstance(raw["by_baby_id"], dict):
            raw["by_baby_id"] = {}
        current = dict(raw["by_baby_id"].get(baby_id) or {})
        for key, value in patch.items():
            if value is not None:
                current[key] = value
        raw["by_baby_id"][baby_id] = current
        blob.upload_from_string(
            json.dumps(raw, indent=2, default=str),
            content_type="application/json",
        )
        return current

    # --- Media helpers (used by media.py) ---

    def upload_image(self, profile_dir: str, filename: str, body: bytes, content_type: str) -> None:
        blob = self._bucket.blob(f"{profile_dir}/images/{filename}")
        blob.upload_from_string(body, content_type=content_type)

    def download_image(self, profile_dir: str, filename: str) -> tuple[bytes, str]:
        blob = self._bucket.blob(f"{profile_dir}/images/{filename}")
        content = blob.download_as_bytes()
        ct = blob.content_type or "application/octet-stream"
        return content, ct

    def total_images_bytes(self, profile_dir: str) -> int:
        prefix = f"{profile_dir}/images/"
        return sum(b.size or 0 for b in self._client.list_blobs(self._bucket, prefix=prefix))

    def image_exists(self, profile_dir: str, filename: str) -> bool:
        blob = self._bucket.blob(f"{profile_dir}/images/{filename}")
        return blob.exists()

    # --- Helpers ---

    @staticmethod
    def _parse_dt(dt_str: str) -> Optional[datetime]:
        if not dt_str:
            return None
        try:
            if "T" in dt_str:
                return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
            return datetime.fromisoformat(dt_str)
        except (ValueError, AttributeError):
            return None

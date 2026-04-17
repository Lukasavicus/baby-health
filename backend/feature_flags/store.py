"""JSON file persistence for feature catalog + per-profile variant overrides."""

from __future__ import annotations

import json
import os
import threading
from copy import deepcopy
from pathlib import Path
from typing import Any

from feature_flags.constants import DEFAULT_FEATURES, default_store_document


class FeatureFlagStore:
    """Thread-safe load/save of { features, profiles }."""

    def __init__(self, path: Path) -> None:
        self._path = path
        self._lock = threading.Lock()

    def _deep_merge_features(
        self, base: dict[str, Any], overlay: dict[str, Any]
    ) -> dict[str, Any]:
        out = deepcopy(base)
        for key, val in overlay.items():
            if not isinstance(val, dict):
                continue
            if key not in out:
                out[key] = deepcopy(val)
                continue
            merged = dict(out[key])
            for vk, vv in val.items():
                merged[vk] = vv
            out[key] = merged
        return out

    def _load_raw(self) -> dict[str, Any]:
        if not self._path.is_file():
            self._path.parent.mkdir(parents=True, exist_ok=True)
            doc = default_store_document()
            self._path.write_text(json.dumps(doc, indent=2), encoding="utf-8")
            return doc
        text = self._path.read_text(encoding="utf-8")
        if not text.strip():
            return default_store_document()
        return json.loads(text)

    def load(self) -> dict[str, Any]:
        with self._lock:
            raw = self._load_raw()
            merged_features = self._deep_merge_features(
                {k: dict(v) for k, v in DEFAULT_FEATURES.items()},
                raw.get("features") or {},
            )
            profiles = raw.get("profiles") or {}
            if not isinstance(profiles, dict):
                profiles = {}
            return {"features": merged_features, "profiles": profiles}

    def save(self, features: dict[str, Any], profiles: dict[str, Any]) -> None:
        doc = {"features": features, "profiles": profiles}
        self._path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self._path.with_suffix(".tmp")
        tmp.write_text(json.dumps(doc, indent=2), encoding="utf-8")
        tmp.replace(self._path)

    def update_profile_assignments(
        self, profile_id: str, assignments: dict[str, str]
    ) -> dict[str, str]:
        with self._lock:
            raw = self._load_raw()
            merged_features = self._deep_merge_features(
                {k: dict(v) for k, v in DEFAULT_FEATURES.items()},
                raw.get("features") or {},
            )
            profiles: dict[str, Any] = raw.get("profiles") or {}
            if not isinstance(profiles, dict):
                profiles = {}
            current = dict(profiles.get(profile_id) or {})
            current.update(assignments)
            profiles[profile_id] = current
            self.save(merged_features, profiles)
            return self.effective_assignments(
                profile_id, merged_features, profiles
            )

    def effective_assignments(
        self,
        profile_id: str,
        features: dict[str, Any],
        profiles: dict[str, Any],
    ) -> dict[str, str]:
        out: dict[str, str] = {}
        for key, meta in features.items():
            dv = meta.get("defaultVariant", "v1")
            out[key] = str(dv) if dv is not None else "v1"

        def apply_layer(layer: Any) -> None:
            if not isinstance(layer, dict):
                return
            for k, v in layer.items():
                if k not in out or not isinstance(v, str):
                    continue
                spec = features.get(k) or {}
                allowed = spec.get("variants") or []
                if v in allowed:
                    out[k] = v

        apply_layer(profiles.get("default") or {})
        apply_layer(profiles.get(profile_id) or {})
        return out


def store_from_env() -> FeatureFlagStore:
    base = Path(
        os.getenv(
            "FEATURE_FLAGS_STORE_PATH",
            str(
                Path(__file__).resolve().parent.parent
                / "data"
                / "feature_flags"
                / "store.json"
            ),
        )
    )
    return FeatureFlagStore(base.resolve())

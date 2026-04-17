#!/usr/bin/env python3
"""Migrate local JSON data and images to a GCS bucket.

Usage:
    python -m scripts.migrate_to_gcs --bucket baby-health-492304-data

Reads from DATA_DIR (default: backend/data/) and uploads each profile
directory to gs://<bucket>/<profile>/.  Idempotent — safe to re-run.
"""
import argparse
import json
import mimetypes
import os
import sys
from pathlib import Path

from google.cloud import storage


def migrate_profile(bucket: storage.Bucket, data_dir: Path, profile: str) -> int:
    """Upload all JSON + image files for one profile.  Returns file count."""
    profile_dir = data_dir / profile
    if not profile_dir.is_dir():
        return 0

    count = 0

    for json_file in profile_dir.glob("*.json"):
        blob_path = f"{profile}/{json_file.name}"
        blob = bucket.blob(blob_path)
        blob.upload_from_string(
            json_file.read_text(encoding="utf-8"),
            content_type="application/json",
        )
        print(f"  {blob_path} ({json_file.stat().st_size:,} bytes)")
        count += 1

    images_dir = profile_dir / "images"
    if images_dir.is_dir():
        for img in images_dir.iterdir():
            if not img.is_file() or img.name.startswith("."):
                continue
            blob_path = f"{profile}/images/{img.name}"
            ct = mimetypes.guess_type(img.name)[0] or "application/octet-stream"
            blob = bucket.blob(blob_path)
            blob.upload_from_filename(str(img), content_type=ct)
            print(f"  {blob_path} ({img.stat().st_size:,} bytes)")
            count += 1

    return count


def main():
    parser = argparse.ArgumentParser(description="Migrate local data to GCS")
    parser.add_argument("--bucket", required=True, help="GCS bucket name")
    parser.add_argument(
        "--data-dir",
        default=os.getenv("DATA_DIR", str(Path(__file__).resolve().parent.parent / "data")),
        help="Local data directory (default: backend/data/)",
    )
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if not data_dir.is_dir():
        print(f"Data directory not found: {data_dir}", file=sys.stderr)
        sys.exit(1)

    client = storage.Client()
    bucket = client.bucket(args.bucket)

    profiles = [d.name for d in data_dir.iterdir() if d.is_dir() and not d.name.startswith(".")]
    if not profiles:
        print("No profile directories found.")
        return

    total = 0
    for profile in sorted(profiles):
        print(f"\n[{profile}]")
        n = migrate_profile(bucket, data_dir, profile)
        total += n

    print(f"\nDone. {total} files uploaded to gs://{args.bucket}/")


if __name__ == "__main__":
    main()

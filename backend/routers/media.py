"""Profile-scoped image uploads — local filesystem or GCS."""
from __future__ import annotations

import mimetypes
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response

from config import settings
from deps import get_current_user
from models.auth import TokenPayload

router = APIRouter(prefix="/api/media", tags=["media"])

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MiB
MAX_TOTAL_BYTES = 1024 * 1024 * 1024  # 1 GiB per profile folder

ALLOWED_EXTENSIONS: dict[str, str] = {
    ".jpg": ".jpg", ".jpeg": ".jpg", ".png": ".png",
    ".gif": ".gif", ".webp": ".webp", ".bmp": ".bmp",
    ".tif": ".tif", ".tiff": ".tif", ".heic": ".heic", ".heif": ".heif",
}

SAFE_FILENAME_RE = re.compile(
    r"^[a-f0-9]{32}\.(jpg|png|gif|webp|bmp|tif|heic|heif)$", re.IGNORECASE
)


def _is_gcs() -> bool:
    return settings.storage_type == "gcs"


def _gcs_repo():
    from repositories.gcs_repository import GcsRepository
    return GcsRepository(bucket_name=settings.gcs_bucket, prefix="")


# --- Local helpers ---

def _local_images_dir(profile_dir: str) -> Path:
    return (settings.data_dir / profile_dir).resolve() / "images"


def _ensure_local_dir(profile_dir: str) -> Path:
    d = _local_images_dir(profile_dir)
    d.mkdir(parents=True, exist_ok=True)
    return d


def _local_total_bytes(root: Path) -> int:
    if not root.is_dir():
        return 0
    return sum(p.stat().st_size for p in root.iterdir() if p.is_file())


def _extension_from_upload(filename: str, content_type: str | None) -> str:
    raw = Path(filename or "").suffix.lower()
    if raw in ALLOWED_EXTENSIONS:
        return ALLOWED_EXTENSIONS[raw]
    if content_type:
        ct = content_type.split(";")[0].strip().lower()
        mapping = {
            "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png",
            "image/gif": ".gif", "image/webp": ".webp", "image/bmp": ".bmp",
            "image/tiff": ".tif", "image/heic": ".heic", "image/heif": ".heif",
        }
        if ct in mapping:
            return mapping[ct]
    raise HTTPException(
        status_code=400,
        detail="Unsupported image type. Allowed: JPEG, PNG, GIF, WebP, BMP, TIFF, HEIC/HEIF.",
    )


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    user: TokenPayload = Depends(get_current_user),
) -> dict:
    ext = _extension_from_upload(file.filename or "", file.content_type)
    body = await file.read(MAX_FILE_BYTES + 1)
    if len(body) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail=f"File too large (max {MAX_FILE_BYTES // (1024 * 1024)} MiB).")
    if len(body) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    name = f"{uuid.uuid4().hex}{ext}"
    ct = file.content_type or mimetypes.guess_type(name)[0] or "application/octet-stream"

    if _is_gcs():
        repo = _gcs_repo()
        current = repo.total_images_bytes(user.profile_dir)
        if current + len(body) > MAX_TOTAL_BYTES:
            raise HTTPException(status_code=413, detail="Profile images quota exceeded (max 1 GiB).")
        repo.upload_image(user.profile_dir, name, body, ct)
    else:
        dest_dir = _ensure_local_dir(user.profile_dir)
        current = _local_total_bytes(dest_dir)
        if current + len(body) > MAX_TOTAL_BYTES:
            raise HTTPException(status_code=413, detail="Profile images quota exceeded (max 1 GiB).")
        (dest_dir / name).write_bytes(body)

    return {
        "url": f"/api/media/{name}",
        "filename": name,
        "bytes_used": current + len(body),
        "quota_bytes": MAX_TOTAL_BYTES,
    }


@router.get("/{filename}")
async def get_image(
    filename: str,
    user: TokenPayload = Depends(get_current_user),
):
    if filename == "upload" or not SAFE_FILENAME_RE.match(filename):
        raise HTTPException(status_code=404, detail="Not found")

    if _is_gcs():
        repo = _gcs_repo()
        if not repo.image_exists(user.profile_dir, filename):
            raise HTTPException(status_code=404, detail="Not found")
        content, media_type = repo.download_image(user.profile_dir, filename)
        return Response(content=content, media_type=media_type)

    root = _local_images_dir(user.profile_dir)
    path = (root / filename).resolve()
    try:
        path.relative_to(root.resolve())
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Not found") from e
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    media_type, _ = mimetypes.guess_type(path.name)
    return FileResponse(path, media_type=media_type or "application/octet-stream", filename=path.name)

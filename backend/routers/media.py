"""Profile-scoped image uploads under DATA_DIR/images/."""
from __future__ import annotations

import mimetypes
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from config import settings
from deps import get_repository
from repositories import BaseRepository

router = APIRouter(prefix="/api/media", tags=["media"])

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MiB
MAX_TOTAL_BYTES = 1024 * 1024 * 1024  # 1 GiB per profile folder

# Popular raster formats (extension -> normalized suffix)
ALLOWED_EXTENSIONS: dict[str, str] = {
    ".jpg": ".jpg",
    ".jpeg": ".jpg",
    ".png": ".png",
    ".gif": ".gif",
    ".webp": ".webp",
    ".bmp": ".bmp",
    ".tif": ".tif",
    ".tiff": ".tif",
    ".heic": ".heic",
    ".heif": ".heif",
}

SAFE_FILENAME_RE = re.compile(
    r"^[a-f0-9]{32}\.(jpg|png|gif|webp|bmp|tif|heic|heif)$", re.IGNORECASE
)


def profile_images_dir() -> Path:
    return settings.data_dir.resolve() / "images"


def ensure_images_dir() -> Path:
    d = profile_images_dir()
    d.mkdir(parents=True, exist_ok=True)
    return d


def total_images_bytes(root: Path) -> int:
    if not root.is_dir():
        return 0
    total = 0
    for p in root.iterdir():
        if p.is_file():
            try:
                total += p.stat().st_size
            except OSError:
                continue
    return total


def extension_from_upload(filename: str, content_type: str | None) -> str:
    raw = Path(filename or "").suffix.lower()
    if raw in ALLOWED_EXTENSIONS:
        return ALLOWED_EXTENSIONS[raw]
    if content_type:
        ct = content_type.split(";")[0].strip().lower()
        mapping = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "image/gif": ".gif",
            "image/webp": ".webp",
            "image/bmp": ".bmp",
            "image/tiff": ".tif",
            "image/heic": ".heic",
            "image/heif": ".heif",
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
    _json_repo: BaseRepository = Depends(get_repository),
) -> dict:
    """
    Save an image under DATA_DIR/images/ for the active profile (DATA_DIR).
    Limits: 10 MiB per file, 1 GiB total per images folder.
    """
    dest_dir = ensure_images_dir()
    ext = extension_from_upload(file.filename or "", file.content_type)
    body = await file.read(MAX_FILE_BYTES + 1)
    if len(body) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large (max {MAX_FILE_BYTES // (1024 * 1024)} MiB).",
        )
    if len(body) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    current = total_images_bytes(dest_dir)
    if current + len(body) > MAX_TOTAL_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Profile images folder quota exceeded (max 1 GiB total).",
        )

    name = f"{uuid.uuid4().hex}{ext}"
    path = dest_dir / name
    path.write_bytes(body)

    public_path = f"/api/media/{name}"
    return {
        "url": public_path,
        "filename": name,
        "bytes_used": current + len(body),
        "quota_bytes": MAX_TOTAL_BYTES,
    }


@router.get("/{filename}")
async def get_image(
    filename: str,
    _json_repo: BaseRepository = Depends(get_repository),
) -> FileResponse:
    if filename == "upload" or not SAFE_FILENAME_RE.match(filename):
        raise HTTPException(status_code=404, detail="Not found")
    root = profile_images_dir()
    path = (root / filename).resolve()
    try:
        path.relative_to(root.resolve())
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Not found") from e
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    media_type, _ = mimetypes.guess_type(path.name)
    return FileResponse(
        path,
        media_type=media_type or "application/octet-stream",
        filename=path.name,
    )

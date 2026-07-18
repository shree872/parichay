import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _media_root() -> Path:
    root = Path(settings.MEDIA_ROOT)
    root.mkdir(parents=True, exist_ok=True)
    return root


def save_upload(file: UploadFile, *, subfolder: str) -> tuple[str, bytes]:
    """
    Validates and persists an uploaded image to local disk.
    Returns (public_url_path, raw_bytes). Swap this function's internals
    for an S3/GCS client later without touching any endpoint code.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}",
        )

    raw = file.file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(raw) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size is {settings.MAX_UPLOAD_MB}MB",
        )

    ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}[file.content_type]
    filename = f"{uuid.uuid4().hex}.{ext}"

    folder = _media_root() / subfolder
    folder.mkdir(parents=True, exist_ok=True)
    (folder / filename).write_bytes(raw)

    public_path = f"{settings.MEDIA_URL_PREFIX}/{subfolder}/{filename}"
    return public_path, raw

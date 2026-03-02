"""
services/user.py — Avatar upload & profile update service
─────────────────────────────────────────────────────────
• Validates image type and size before accepting uploads.
• Resizes JPEG/PNG files to 400 × 400 (cover-crop) using Pillow.
• Uploads the processed bytes to MinIO under avatars/{user_id}/{ts}.jpg.
• Returns the full public CDN URL that is then stored in users.avatar_url.
"""
import io
import time
import uuid as uuid_mod
from typing import Optional

from fastapi import HTTPException, UploadFile, status
from minio import Minio
from minio.error import S3Error
from PIL import Image

from app.core.config import settings

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
TARGET_SIZE = (400, 400)  # pixels


def _get_minio_client() -> Minio:
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_SECURE,
    )


async def upload_avatar(file: UploadFile, user_id: uuid_mod.UUID) -> str:
    """
    Process and upload an avatar image.

    1. Read & validate size / MIME type.
    2. Open with Pillow, convert to JPEG (400×400 thumbnail/crop).
    3. Stream to MinIO.
    4. Return CDN URL.

    Raises HTTPException on validation failure or storage error.
    """
    # ── 1. Read raw bytes ────────────────────────────────────────────────────
    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Avatar must be 5 MB or smaller.",
        )

    # ── 2. Validate content type (MIME sniff + declared type) ────────────────
    content_type = file.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type '{content_type}'. Use JPEG, PNG, or WebP.",
        )

    # ── 3. Open & validate that it is actually an image ─────────────────────
    try:
        image = Image.open(io.BytesIO(raw_bytes))
        image.verify()  # Raises if the file is corrupt or not a valid image
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file could not be parsed as an image.",
        )

    # Re-open after verify (verify() moves the file pointer past end)
    image = Image.open(io.BytesIO(raw_bytes))

    # ── 4. Convert + smart-crop to 400×400 ──────────────────────────────────
    if image.mode in ("RGBA", "P"):
        # Flatten alpha to white background before JPEG conversion
        background = Image.new("RGB", image.size, (255, 255, 255))
        if image.mode == "RGBA":
            background.paste(image, mask=image.split()[3])
        else:
            background.paste(image)
        image = background
    else:
        image = image.convert("RGB")

    # Thumbnail preserves aspect ratio; then center-crop to a perfect square
    image.thumbnail((TARGET_SIZE[0] * 2, TARGET_SIZE[1] * 2), Image.LANCZOS)
    w, h = image.size
    left = (w - TARGET_SIZE[0]) // 2
    top = (h - TARGET_SIZE[1]) // 2
    image = image.crop((left, top, left + TARGET_SIZE[0], top + TARGET_SIZE[1]))

    # ── 5. Encode to JPEG in memory ──────────────────────────────────────────
    output = io.BytesIO()
    image.save(output, format="JPEG", quality=88, optimize=True)
    output.seek(0)
    jpeg_bytes = output.getvalue()

    # ── 6. Upload to MinIO ───────────────────────────────────────────────────
    minio_client = _get_minio_client()
    timestamp = int(time.time())
    object_name = f"avatars/{user_id}/{timestamp}.jpg"

    try:
        # Ensure bucket exists (idempotent)
        if not minio_client.bucket_exists(settings.MINIO_BUCKET):
            minio_client.make_bucket(settings.MINIO_BUCKET)

        minio_client.put_object(
            bucket_name=settings.MINIO_BUCKET,
            object_name=object_name,
            data=io.BytesIO(jpeg_bytes),
            length=len(jpeg_bytes),
            content_type="image/jpeg",
        )
    except S3Error as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Storage error: {e}",
        )

    # ── 7. Build and return the public CDN URL ───────────────────────────────
    cdn_url = f"{settings.CDN_URL}/{settings.MINIO_BUCKET}/{object_name}"
    return cdn_url


def delete_old_avatar(old_url: Optional[str]) -> None:
    """
    Best-effort deletion of a previous avatar from MinIO.
    Silently swallows errors — stale files can be cleaned up by a background job.
    """
    if not old_url:
        return
    try:
        # Extract object_name from the CDN URL
        prefix = f"{settings.CDN_URL}/{settings.MINIO_BUCKET}/"
        if old_url.startswith(prefix):
            object_name = old_url[len(prefix):]
            minio_client = _get_minio_client()
            minio_client.remove_object(settings.MINIO_BUCKET, object_name)
    except Exception:
        pass  # Non-critical — log in production with proper logger

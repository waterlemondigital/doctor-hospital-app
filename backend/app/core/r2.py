"""
Cloudflare R2 Storage Service
Strictly implements backend/R2_OPERATIONS_STRATEGY.md

Core Invariants:
1. NEVER call list_objects or list_objects_v2. PostgreSQL is the sole source of truth.
2. NEVER call head_object for existence checks. Check images.content_hash in PostgreSQL.
3. Compute SHA-256 content hash on processed WebP bytes. If already in DB, skip upload (0 R2 ops).
4. Mandatory Cache-Control: 'public, max-age=31536000, immutable'.
5. Always convert images to optimized WebP before uploading.
6. Responsive sizes: thumb (400w), card (800w), full (1600w).
7. Retries capped at max 3 attempts.
8. Single PutObject per file (files well under 5 MB limit).
9. Concurrency bounded with Semaphore(4).
10. Direct public CDN delivery via R2_PUBLIC_URL; never proxy images through FastAPI.
"""

import io
import uuid
import hashlib
import asyncio
import logging
from typing import Optional, Dict, Any, List, Tuple, Union
from pathlib import Path
from PIL import Image as PILImage, ImageOps

import boto3
from botocore.config import Config
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.image import Image

logger = logging.getLogger("r2_storage")

# Standard responsive breakpoint widths & WebP compression qualities
SIZES = {
    "thumb": {"max_width": 400, "quality": 80},
    "card": {"max_width": 800, "quality": 82},
    "full": {"max_width": 1600, "quality": 85},
}

# Immutable cache header required by R2_OPERATIONS_STRATEGY.md
CACHE_CONTROL_IMMUTABLE = "public, max-age=31536000, immutable"

# Concurrency semaphore for batch uploads (Section 3.7: 3 to 5 concurrent workers)
DEFAULT_SEMAPHORE_LIMIT = 4
_upload_semaphore: Optional[asyncio.Semaphore] = None


def get_semaphore() -> asyncio.Semaphore:
    global _upload_semaphore
    if _upload_semaphore is None:
        _upload_semaphore = asyncio.Semaphore(DEFAULT_SEMAPHORE_LIMIT)
    return _upload_semaphore


def get_r2_client():
    """
    Returns boto3 S3 client configured specifically for Cloudflare R2
    with standard v4 signature and max 3 retries (Section 3.5).
    """
    if not settings.R2_ACCOUNT_ID or not settings.R2_ACCESS_KEY_ID or not settings.R2_SECRET_ACCESS_KEY:
        raise ValueError(
            "Cloudflare R2 credentials are missing. Please verify R2_ACCOUNT_ID, "
            "R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in backend/.env"
        )

    endpoint_url = f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    return boto3.client(
        service_name="s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"},
        ),
    )


def compute_content_hash(data: bytes) -> str:
    """Computes SHA-256 hex digest of processed image bytes (Section 3.3)."""
    return hashlib.sha256(data).hexdigest()


def get_public_url(object_key: str) -> str:
    """Constructs direct CDN delivery URL. Never proxy images through FastAPI."""
    base = (settings.R2_PUBLIC_URL or "").rstrip("/")
    if not base:
        base = f"https://{settings.R2_BUCKET_NAME}.r2.dev"
    return f"{base}/{object_key.lstrip('/')}"


def optimize_image_to_webp(
    image_input: Union[bytes, str, Path],
    max_width: Optional[int] = None,
    quality: int = 82,
) -> Tuple[bytes, int, int]:
    """
    Loads an image, strips EXIF orientation tags correctly, resizes proportionally
    if max_width is specified, and compresses to WebP.
    Returns (webp_bytes, width, height).
    """
    if isinstance(image_input, (str, Path)):
        img = PILImage.open(str(image_input))
    else:
        img = PILImage.open(io.BytesIO(image_input))

    # Transpose according to EXIF orientation
    img = ImageOps.exif_transpose(img)

    # Convert to RGB if RGBA/P/other unsupported formats
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        # Keep transparency if present
        img = img.convert("RGBA")
    elif img.mode != "RGB":
        img = img.convert("RGB")

    orig_w, orig_h = img.size

    # Resize if larger than max_width
    if max_width and orig_w > max_width:
        ratio = max_width / float(orig_w)
        new_w = max_width
        new_h = int(float(orig_h) * ratio)
        img = img.resize((new_w, new_h), PILImage.Resampling.LANCZOS)
    else:
        new_w, new_h = orig_w, orig_h

    out_buf = io.BytesIO()
    img.save(out_buf, format="WEBP", quality=quality, method=6)
    webp_bytes = out_buf.getvalue()

    return webp_bytes, new_w, new_h


def _sync_put_object(s3_client, bucket: str, key: str, data: bytes) -> None:
    """Executes a single PutObject with mandatory immutable cache control header."""
    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=data,
        ContentType="image/webp",
        CacheControl=CACHE_CONTROL_IMMUTABLE,
    )


def _sync_delete_object(s3_client, bucket: str, key: str) -> None:
    """Executes a delete_object call."""
    try:
        s3_client.delete_object(Bucket=bucket, Key=key)
    except Exception as exc:
        logger.warning(f"Failed to delete {key} from R2: {exc}")


async def upload_image_with_strategy(
    session: Optional[AsyncSession] = None,
    image_input: Union[bytes, str, Path] = None,
    entity_type: str = "facility",
    entity_id: str = "general",
    alt_text: Optional[str] = None,
    caption: Optional[str] = None,
    usage_permission_note: Optional[str] = None,
    sort_order: int = 0,
    generate_variants: bool = True,
    client: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Strictly implements the R2 Operations Optimization Strategy:
    1. Pre-process to WebP & calculate SHA-256 hash.
    2. Check PostgreSQL `images` table for `content_hash`.
       - If found: return existing record immediately. (0 R2 operations!)
    3. Generate responsive sizes (thumb 400w, card 800w, full 1600w).
    4. Upload each size as a single PutObject with immutable cache headers.
    5. Save metadata to PostgreSQL.
    6. Return unified image dict.
    """
    from app.db.postgres import AsyncSessionLocal

    sem = get_semaphore()
    async with sem:
        # Step 1: Pre-process the master/full version to WebP
        full_bytes, full_w, full_h = await asyncio.to_thread(
            optimize_image_to_webp,
            image_input,
            SIZES["full"]["max_width"],
            SIZES["full"]["quality"],
        )
        chash = compute_content_hash(full_bytes)

        # Context manager for DB session to ensure task-safe execution
        async def _do_upload(sess: AsyncSession):
            # Step 2: Zero-cost duplicate check in PostgreSQL (Section 3.3)
            stmt = select(Image).where(Image.content_hash == chash)
            existing = (await sess.execute(stmt)).scalars().first()
            if existing:
                logger.info(f"[R2 Strategy] Hash {chash[:8]} already in DB. Skipping R2 upload. (0 R2 ops)")
                return existing.to_dict()

            s3 = client or get_r2_client()
            bucket = settings.R2_BUCKET_NAME
            folder = f"{entity_type.lower()}s/{entity_id.lower()}"
            base_hash = chash[:24]

            # Step 3 & 4: Upload responsive variants
            if generate_variants:
                thumb_bytes, _, _ = await asyncio.to_thread(
                    optimize_image_to_webp,
                    image_input,
                    SIZES["thumb"]["max_width"],
                    SIZES["thumb"]["quality"],
                )
                card_bytes, _, _ = await asyncio.to_thread(
                    optimize_image_to_webp,
                    image_input,
                    SIZES["card"]["max_width"],
                    SIZES["card"]["quality"],
                )

                thumb_key = f"{folder}/{base_hash}_thumb.webp"
                card_key = f"{folder}/{base_hash}_card.webp"
                full_key = f"{folder}/{base_hash}_full.webp"

                # 3 single PutObject calls with immutable headers
                await asyncio.to_thread(_sync_put_object, s3, bucket, thumb_key, thumb_bytes)
                await asyncio.to_thread(_sync_put_object, s3, bucket, card_key, card_bytes)
                await asyncio.to_thread(_sync_put_object, s3, bucket, full_key, full_bytes)

                primary_key = full_key
                thumb_url = get_public_url(thumb_key)
                card_url = get_public_url(card_key)
                full_url = get_public_url(full_key)
            else:
                primary_key = f"{folder}/{base_hash}.webp"
                await asyncio.to_thread(_sync_put_object, s3, bucket, primary_key, full_bytes)
                thumb_url = None
                card_url = None
                full_url = get_public_url(primary_key)

            primary_url = full_url

            # Step 5: Save record to PostgreSQL
            image_id = str(uuid.uuid4())
            image_record = Image(
                id=image_id,
                entity_type=entity_type.lower(),
                entity_id=entity_id.lower(),
                object_key=primary_key,
                content_hash=chash,
                url=primary_url,
                thumb_url=thumb_url or primary_url,
                card_url=card_url or primary_url,
                full_url=full_url or primary_url,
                width=full_w,
                height=full_h,
                size_bytes=len(full_bytes),
                mime_type="image/webp",
                alt_text=alt_text or f"{entity_type.title()} image",
                caption=caption or "",
                usage_permission_note=usage_permission_note,
                sort_order=sort_order,
            )

            sess.add(image_record)
            await sess.commit()
            await sess.refresh(image_record)

            logger.info(
                f"[R2 Strategy] Uploaded image for {entity_type}:{entity_id} "
                f"(hash={chash[:8]}, key={primary_key})"
            )
            return image_record.to_dict()

        if session is not None:
            return await _do_upload(session)
        else:
            async with AsyncSessionLocal() as fresh_sess:
                return await _do_upload(fresh_sess)


async def batch_upload_entity_images(
    session: Optional[AsyncSession],
    image_items: List[Dict[str, Any]],
    entity_type: str,
    entity_id: str,
    generate_variants: bool = True,
) -> List[Dict[str, Any]]:
    """
    Bulk uploads multiple images for a facility/entity safely (Section 3.7):
    - Concurrency bounded to 4 parallel workers.
    - Each task uses its own isolated session context.
    - Independent error handling per file (retry only failures).
    - Duplicate content hashes skipped at 0 cost.
    """
    client = get_r2_client()

    async def _upload_task(item: Dict[str, Any], order: int):
        src = item["source"]
        alt = item.get("alt") or item.get("alt_text")
        caption = item.get("caption")
        note = item.get("usage_permission_note")
        return await upload_image_with_strategy(
            session=None,  # isolated session per concurrent task
            image_input=src,
            entity_type=entity_type,
            entity_id=entity_id,
            alt_text=alt,
            caption=caption,
            usage_permission_note=note,
            sort_order=order,
            generate_variants=generate_variants,
            client=client,
        )

    tasks = [_upload_task(item, idx + 1) for idx, item in enumerate(image_items)]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    successful = []
    for idx, res in enumerate(results):
        if isinstance(res, Exception):
            logger.error(f"Failed to process image #{idx+1} for {entity_type}:{entity_id}: {res}")
        else:
            successful.append(res)

    return successful


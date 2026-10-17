# Cloudflare R2 Operations Strategy (Mandatory Rule)

Whenever adding, updating, ingesting, or refactoring image handling in this project, you **MUST STRICTLY ADHERE** to `backend/R2_OPERATIONS_STRATEGY.md` and use the centralized service `app.core.r2`.

## Non-Negotiable Invariants

1. **NEVER list the bucket**:
   - `list_objects` and `list_objects_v2` are Class A operations ($4.50/M) and waste budget.
   - PostgreSQL (`images` table) is the single source of truth for all image assets, dimensions, and URLs.
   - Admin panels, listing views, and APIs must query PostgreSQL, NEVER R2.

2. **NEVER check object existence via R2**:
   - `head_object` is a Class B operation and wasteful.
   - Always check `images.content_hash` in PostgreSQL instead.

3. **Always Check Content Hash Before Upload**:
   - Every image must be keyed and checked by the SHA-256 of its processed bytes (`content_hash`).
   - If the hash already exists in PostgreSQL, skip R2 upload completely (0 R2 operations).

4. **Mandatory Cache-Control Header**:
   - Every file uploaded to R2 MUST include:
     `Cache-Control: public, max-age=31536000, immutable`
   - Content-Type MUST be `image/webp`.

5. **Local WebP Pre-Processing**:
   - Never upload uncompressed PNGs or JPEGs to R2.
   - Always convert to WebP using Pillow with EXIF transposition and high-efficiency compression.
   - Generate standard responsive sizes where applicable:
     - `thumb`: 400px width (quality 80)
     - `card`: 800px width (quality 82)
     - `full`: 1600px width (quality 85)

6. **Single PutObject per File**:
   - Files are small WebP assets well under the 8 MB multipart threshold.
   - Maintain a 5 MB upload limit to prevent multi-part operation multiplication.

7. **Bounded Concurrency**:
   - Bulk upload operations must be limited to 3–5 concurrent workers (using `asyncio.Semaphore(4)`) to prevent server memory exhaustion.

8. **Direct CDN Access Only**:
   - Never proxy images through FastAPI backend endpoints.
   - All frontend components load images directly from `R2_PUBLIC_URL` / `cdn.yourdomain.com`.
   - Never append cache-busting query strings (e.g. `?v=123`) to image URLs.

## Standard Python Service

Always use `app.core.r2.upload_image_with_strategy` or `app.core.r2.batch_upload_entity_images`, or the CLI tool `backend/scripts/r2_image_uploader.py`.

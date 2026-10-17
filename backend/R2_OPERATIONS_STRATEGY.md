# Cloudflare R2: Operations Optimisation Strategy

Goal: keep **Class A** (writes/lists) and **Class B** (reads) operations as low as possible, so the project stays inside R2's free monthly allowance for as long as possible.

> Verify current limits and which API calls belong to each class on Cloudflare's R2 pricing page before relying on the numbers below.

## 1. Reference numbers

| Item | Free per month | Cost beyond free |
|---|---|---|
| Storage (Standard) | 10 GB | $0.015 per GB |
| Class A (writes, copies, lists) | 1 million | $4.50 per million |
| Class B (reads, HEAD) | 10 million | $0.36 per million |
| Egress (bandwidth) | Unlimited | $0 |

Reminder: bandwidth is never billed. Only the **count** of requests and the **GB stored** matter.

## 2. Be realistic first

At the planned scale (30 images per hospital/wellness/laboratory, 1 per doctor, 3 sizes per image), even thousands of uploads and millions of views stay inside the free allowance. This strategy is mainly about **not wasting operations** and keeping behaviour predictable, not about squeezing out savings.

## 3. Reduce Class A (writes and lists)

### 3.1 Never list the bucket
`list_objects_v2` is Class A. The database is the source of truth for what exists.

- Store `object_key`, `width`, `height`, `alt_text`, `content_hash` in PostgreSQL.
- Admin screens read the DB, never R2.

### 3.2 Never check existence with R2
A `HEAD` request is Class B and still wasteful. Check the `images` table instead.

### 3.3 Skip duplicate uploads with a content hash
Key the file by the SHA-256 of the processed output. If the hash is already in the DB, skip the upload.

```python
import hashlib

def content_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

# in the upload flow
h = content_hash(processed_full_bytes)
existing = db.query(Image).filter_by(content_hash=h).first()
if existing:
    return existing            # 0 R2 operations
key = f"{folder}/{h[:32]}"
```

Add a unique index on `images.content_hash` (or on `(entity_type, entity_id, content_hash)` if the same image may legitimately belong to several entities).

### 3.4 Keep each upload a single PutObject
- Files are small (WebP, well under 5 MB), so boto3 will use one `PutObject`.
- Multipart uploads create several Class A operations per file. Leave the multipart threshold at its default (8 MB) and keep the 5 MB upload cap.

### 3.5 Limit retries
Every retry is another operation.

```python
from botocore.config import Config

s3 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto",
    config=Config(signature_version="s3v4",
                  retries={"max_attempts": 3, "mode": "standard"}),
)
```

### 3.6 Choose the number of sizes deliberately
Each size is one write. Writes are cheap, so the aim is simplicity, not savings.

| Option | Writes per image | Use when |
|---|---|---|
| 3 sizes (thumb 400, card 800, full 1600) | 3 | Default; best fit for responsive `srcset` |
| 2 sizes (thumb 400, full 1200) | 2 | Simpler, slightly larger downloads on mobile |

Pick one and keep it fixed. Changing sizes later means re-processing every original.

### 3.7 Bulk upload safely (for example 50 images at once)
- Process in small parallel groups (3 to 5) to protect server memory.
- Return a result per file, and retry only the failures.
- Do not re-run the whole batch after a partial failure. The hash check in 3.3 makes reruns free for files that already succeeded.

```python
import asyncio
from fastapi.concurrency import run_in_threadpool

sem = asyncio.Semaphore(4)

async def upload_one(file_bytes, content_type, folder):
    async with sem:
        return await run_in_threadpool(upload_image, file_bytes, content_type, folder)

results = await asyncio.gather(*(upload_one(b, t, folder) for b, t in batch),
                               return_exceptions=True)
```

### 3.8 Use a separate dev bucket
Test uploads and loops during development must go to `your-bucket-dev`, never the production bucket.

### 3.9 Deletes
As understood from Cloudflare's pricing, deletes are free. Confirm on the pricing page. Deleting also keeps storage under 10 GB.

## 4. Reduce Class B (reads)

A Class B operation is counted only when a request actually reaches the bucket. The aim is a **high Cloudflare cache hit ratio**.

### 4.1 Serve only through the custom domain
- Use `cdn.yourdomain.com` connected to the bucket (R2, bucket, Settings, Public access, Add custom domain).
- Do not use the `r2.dev` URL in production. It is intended for testing.
- Do not proxy images through FastAPI. That would send every view to R2 and use your server's bandwidth.

### 4.2 Make every file immutable and long-cached
Set at upload time (already part of the helper):

```
Cache-Control: public, max-age=31536000, immutable
```

- Never overwrite a key. To replace an image, upload a new file with a new hash and update the DB row.
- Never purge the cache for routine changes. A purge forces fresh reads.

### 4.3 Confirm Cloudflare caches the images
- In Cloudflare, add a Cache Rule for hostname `cdn.yourdomain.com`: eligible for cache, Edge TTL 1 year. Menu names change, so follow the current Cloudflare docs.
- Test with: `curl -I https://cdn.yourdomain.com/path/image_card.webp`
- Look for `cf-cache-status: HIT` on the second request. `MISS` on the first is normal.
- Enable Tiered Cache if your plan offers it, since it reduces how often the bucket is contacted from different edge locations.

### 4.4 Load fewer images per page view
Every image fetched on a cache miss can be a read.

| Technique | Effect |
|---|---|
| `loading="lazy"` on all below-the-fold images | Unseen images are never requested |
| Listing pages use only `thumb` | Small files, one request per card |
| Detail page loads a cover plus about 4 previews | 30-image galleries load on demand ("View all photos") |
| `srcset` + `sizes` | The browser downloads one size, not three |
| Paginate galleries | Load 8 to 12 at a time |

```html
<img
  src="https://cdn.yourdomain.com/hospitals/1/abc_card.webp"
  srcset="https://cdn.yourdomain.com/hospitals/1/abc_thumb.webp 400w,
          https://cdn.yourdomain.com/hospitals/1/abc_card.webp 800w,
          https://cdn.yourdomain.com/hospitals/1/abc_full.webp 1600w"
  sizes="(max-width: 768px) 100vw, 400px"
  loading="lazy" decoding="async"
  alt="Reception area of the hospital">
```

### 4.5 Let browsers cache too
The one-year `Cache-Control` header means a returning visitor re-downloads nothing. Do not add cache-busting query strings (`?v=123`), because they create new URLs and new cache entries.

### 4.6 Block hotlinking and abusive bots (optional)
- Turn on Cloudflare hotlink protection so other sites cannot embed your images and generate reads.
- Add a rate-limiting or WAF rule on `cdn.yourdomain.com` if you ever see abnormal request spikes.

## 5. Operations cheat sheet

| Action | Operation type | Count |
|---|---|---|
| Upload one image (3 sizes) | Class A | 3 |
| Upload a facility with 30 images | Class A | 90 |
| Visitor views an image, cache miss | Class B | 1 |
| Visitor views an image, cache hit | None on R2 | 0 |
| Delete an image | Free (verify) | 0 |
| List the bucket | Class A | Avoid |
| HEAD existence check | Class B | Avoid |

## 6. Monitoring checklist

- [ ] R2 dashboard: check monthly Class A, Class B and storage totals.
- [ ] Cloudflare analytics: cache hit ratio for `cdn.yourdomain.com` (aim for above 90%).
- [ ] Set a billing or usage notification if your account offers one.
- [ ] Review any month where Class A is above about 100,000 or Class B above about 5 million.
- [ ] Rotate the R2 API token if it is ever exposed.

## 7. Implementation checklist

- [ ] `images` table has `object_key`, `content_hash` (unique), `alt_text`, `usage_permission_note`, `sort_order`.
- [ ] Upload code checks the hash in the DB before touching R2.
- [ ] No `list_objects_v2` and no `head_object` calls anywhere in application code.
- [ ] boto3 retries capped at 3.
- [ ] Bulk upload limited to 3 to 5 concurrent workers.
- [ ] Files uploaded with `Cache-Control: public, max-age=31536000, immutable`.
- [ ] Production images served only from the custom domain.
- [ ] Cache Rule confirmed with `cf-cache-status: HIT`.
- [ ] Frontend uses `srcset`, `sizes` and `loading="lazy"`; galleries load on demand.
- [ ] Separate dev and production buckets.
- [ ] API token scoped to one bucket, Object Read and Write only, stored in backend `.env` only.

## 8. Summary

1. **Writes:** hash first, upload once, never list, never HEAD, cap retries, small parallel batches.
2. **Reads:** custom domain, immutable one-year caching, cache rule verified, lazy-load, `srcset`, thumbnails in lists.
3. **Source of truth:** PostgreSQL, never the bucket.

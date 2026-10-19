# Media Optimization, Cloudflare R2 Pipeline & Directory Sync Guide

This document defines the media architecture, folder routing in Cloudflare R2, sorting rules, and database synchronization workflows for **Hospitals**, **Wellness Centers**, and **Diagnostic Laboratories**.

---

## ⚡ The Single-Command Automated Workflow (No Prompts Needed!)

Whenever you have new image folders, simply put them in:
- `data/hospitals/`
- `data/wellness/`
- `data/labs/`

### 1. Folder & File Naming Convention
- **Folder format**: `name_as_per_our_website - cityname` (e.g. `Apollo Hospitals - Ahmedabad`, `Ruby Hall Clinic - Pune`, or simply `Atmantan Wellness Centre`).
- **Primary Cover Image**: Must be named **`image_1`** (e.g., `image_1.jpg` or `image_1.png`). The pipeline guarantees this image will ALWAYS be placed at index `0` for card thumbnails and carousel slide 1.
- **Additional Images**: Any other images in the folder (`image_2.jpg`, `interior.png`, etc.) are processed in natural sequence.

### 2. Single Command Execution
From the `backend/` folder, run:
```bash
# Process all categories at once:
npm run media:sync

# Or process a specific category:
npm run media:sync:hospitals
npm run media:sync:wellness
npm run media:sync:labs
```

### 3. What the Automated Pipeline Does Automatically:
1. **Intelligent Matcher**: Matches folder name and city against the database without needing hardcoded scripts.
2. **Strict `image_1` Prioritization**: Puts `image_1` at array index 0.
3. **Sharp Progressive WebP Generation**:
   - 1200px Full / Hero View (`image_X.webp`, quality 80)
   - 600px Card Thumbnail (`image_X_card.webp`, quality 75)
4. **Cloudflare R2 Direct Upload**: Uploads to `hospitals/<id>/`, `wellness/<id>/`, or `labs/<id>/` with `Cache-Control: public, max-age=31536000, immutable`.
5. **Database Sync & Instant Cache-Busting**: Updates Neon PostgreSQL `images` column with `?v=<timestamp>` so returning users instantly see updated images.
6. **In-Memory Cache Reload**: Automatically flushes the backend API cache via `POST /api/v1/cache/clear`.

---

## ☁️ Cloudflare R2 Folder Routing Architecture

In Cloudflare R2, images are strictly partitioned under their respective entity category folders:

```text
medvexa (R2 Bucket Root)
├── hospitals/
│   └── <hospital-slug-or-name>/
│       ├── image_1.webp         <-- 1200px Full / Carousel Slide 1
│       ├── image_1_card.webp    <-- 600px Card Thumbnail
│       ├── image_2.webp
│       ├── image_2_card.webp
│       └── ...
├── wellness/
│   └── <wellness-slug-or-name>/
│       ├── image_1.webp         <-- 1200px Full / Carousel Slide 1
│       ├── image_1_card.webp    <-- 600px Card Thumbnail
│       ├── ...
├── labs/
│   └── <lab-slug-or-name>/
│       ├── image_1.webp         <-- 1200px Full / Carousel Slide 1
│       ├── image_1_card.webp    <-- 600px Card Thumbnail
│       └── ...
└── doctors/
    └── <doctor-id>/
        └── photo.webp           <-- 320x320 Face-centered avatar
```

### Dual-Resolution WebP Generation:
- **Full View / Carousel View** (`image_X.webp`):
  - Width: Max `1200px` (aspect ratio preserved, no upscale)
  - Format: Progressive WebP
  - Quality: `80`, Effort: `4`
  - Used by: Inner detail page hero gallery, full-screen lightbox modal.
- **Card Thumbnail** (`image_X_card.webp`):
  - Width: Max `600px` (aspect ratio preserved)
  - Format: Progressive WebP
  - Quality: `75`, Effort: `4`
  - Used by: Homepage cards, search results, directory listing grids.
- **Immutable CDN Caching Headers**:
  ```http
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: image/webp
  ```

---

## 🗄️ Database Storage Schema (Neon PostgreSQL)

Once uploaded to R2, the generated public URLs are written directly into Neon PostgreSQL tables (`hospitals`, `wellness_centers`, `laboratories`).

### Column Format: `images` (JSONB / JSON array)

```json
[
  {
    "url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/ruby-hall-clinic-sassoon-road/image_1.webp",
    "card_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/ruby-hall-clinic-sassoon-road/image_1_card.webp",
    "alt": "Ruby Hall Clinic - Main Campus View (Primary)",
    "caption": "Ruby Hall Clinic - Main Facade & Entrance"
  },
  {
    "url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/ruby-hall-clinic-sassoon-road/image_2.webp",
    "card_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/ruby-hall-clinic-sassoon-road/image_2_card.webp",
    "alt": "Ruby Hall Clinic - View 2",
    "caption": "Ruby Hall Clinic - Diagnostic Center & OPD"
  }
]
```

> **Key Rule**: Because index `0` is `image_1`, both the frontend cards (`entity.images[0].card_url`) and the hero carousel first slide (`entity.images[0].url`) will display `image_1` without needing custom conditional code.

---

## ⚙️ Ingestion & Sorting Logic (`image_1` First)

When scanning any entity's folder, the pipeline applies this strict comparator:

```javascript
// Strict natural sorting placing "image_1" at index 0
files.sort((a, b) => {
  const isA1 = /^image_?1(\.|$)/i.test(path.parse(a).name);
  const isB1 = /^image_?1(\.|$)/i.test(path.parse(b).name);

  // If a is image_1, it always comes first
  if (isA1 && !isB1) return -1;
  // If b is image_1, b comes first
  if (!isA1 && isB1) return 1;

  // Otherwise, sort naturally (image_2, image_3, etc.)
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
});
```

### Entity Resolution Workflow:
1. **Folder Name Matching**:
   The script inspects the folder name (e.g. `"Ruby Hall Clinic"` or `"Atmantan Wellness Centre"`).
2. **Database Lookup**:
   Matches against PostgreSQL records via:
   - Primary ID / Slug (`id = $1 OR slug = $1`)
   - Exact or fuzzy name (`name ILIKE $1`)
3. **Processing & Upload**:
   - Converts `image_1` first &rarr; uploads `image_1.webp` + `image_1_card.webp` to R2.
   - Converts and uploads remaining images sequentially.
4. **PostgreSQL Update**:
   - Updates `UPDATE hospitals SET images = $1, updated_at = NOW() WHERE id = $2`.
5. **Backend In-Memory Cache Invalidation**:
   - Sends `POST /api/v1/cache/clear` to the Express server.
   - All directory API endpoints (`/hospitals`, `/wellness-centers`, `/laboratories`) immediately serve the updated R2 URLs.

---

## 🚀 Execution Commands

When you provide the folders of images, the upload pipeline can be executed directly from the `backend/` directory:

### 1. Ingest New Upload Folder with `image_1` Priority:
```bash
# Process a custom folder containing entity subfolders
node scripts/media_optimizer_pipeline.js --upload --source="/path/to/your/folder" --type=hospitals
node scripts/media_optimizer_pipeline.js --upload --source="/path/to/your/folder" --type=wellness
node scripts/media_optimizer_pipeline.js --upload --source="/path/to/your/folder" --type=labs
```

### 2. Default Local Image Directories:
If placed inside `data/`:
- `data/images_hospitals/` &rarr; `npm run media:upload-hospitals`
- `data/images_wellness/` &rarr; `npm run media:upload-wellness`
- `data/images_labs/` &rarr; `npm run media:upload-labs`

### 3. Verification:
After uploading, run:
```bash
# Verify database records and R2 URLs
node scripts/inspect_tables.js
```
The frontend at `http://localhost:3000` will instantly reflect `image_1` as the card cover and carousel hero slide for that entity.

### 4. Cache-Busting for Returning Visitors (On Demand):
When you have replaced images in R2 and want **100% of returning users** (who already cached old images locally) to immediately fetch the new images on their next visit without needing a hard refresh:
```bash
# Run from backend/ directory:
npm run media:cache-bust

# Or specify a custom version tag or entity type:
node scripts/cache_bust_media_urls.js --type=hospitals --v=2
node scripts/cache_bust_media_urls.js --type=wellness
node scripts/cache_bust_media_urls.js --type=labs
```
This appends `?v=...` to the database image URLs, forcing every visitor's browser to immediately download the updated images.

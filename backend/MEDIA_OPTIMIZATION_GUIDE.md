# Media Optimization & Cloudflare R2 Upload Guide

This project uses an automated high-performance media pipeline powered by **Sharp**, **Cloudflare R2**, and **Neon PostgreSQL**.

---

## ⚡ The Strategy

Whenever images are added, they are processed through this 5-stage optimization pipeline:

1. **Format Conversion to Progressive WebP**:
   - Converts raw `.jpg`, `.jpeg`, and `.png` (including high-resolution screenshots and camera files) to modern **WebP**.
   - Progressive encoding ensures images render instantly without the "bit-by-bit" top-to-bottom scanline streaming.

2. **Responsive Multi-Size Generation**:
   - **Galleries / Hero Views**: Max width `1200px` (quality: 80, effort: 4) &rarr; `.../image_1.webp`.
   - **Card / Directory Listings**: Max width `600px` (quality: 75, effort: 4) &rarr; `.../image_1_card.webp`.
   - **Doctor Avatars**: Max `320x320` face-focused crop (quality: 84, fit: cover, position: top) &rarr; `.../photo.webp`.

3. **Cloudflare Edge Immutable Caching**:
   - Every file uploaded to R2 includes the HTTP header:
     ```http
     Cache-Control: public, max-age=31536000, immutable
     Content-Type: image/webp
     ```
   - Cloudflare CDN edge nodes cache the files globally so visitors load images in under 15 milliseconds.

4. **Structured Database Storage**:
   - PostgreSQL `hospitals.images`, `wellness_centers.images`, and `laboratories.images` store:
     ```json
     {
       "url": "https://pub-xxx.r2.dev/labs/<id>/image_1.webp",
       "card_url": "https://pub-xxx.r2.dev/labs/<id>/image_1_card.webp",
       "alt": "Facility View 1",
       "caption": "Diagnostic Facility & Testing Center 1"
     }
     ```
   - PostgreSQL `doctors.photo` stores:
     `https://pub-xxx.r2.dev/doctors/<id>/photo.webp`

5. **Live Directory Cache Invalidation**:
   - The script automatically sends a request to `POST /api/v1/cache/clear` on your Express backend to immediately reload all memory stores and serve the new links without restarting the server.

---

## 🛠️ How to Use It in the Future

All commands are run from the `backend/` directory:

### 1. Optimize & Sync All Existing Images
To audit and re-optimize all image assets already in R2 and PostgreSQL:
```bash
npm run media:optimize
```
Or selectively by category:
```bash
node scripts/media_optimizer_pipeline.js --type=hospitals
node scripts/media_optimizer_pipeline.js --type=wellness
node scripts/media_optimizer_pipeline.js --type=labs
node scripts/media_optimizer_pipeline.js --type=doctors
```

### 2. Upload New Local Folders of Images
When you have new folders of raw images in `data/`:
- **New Hospital Folders**:
  ```bash
  npm run media:upload-hospitals
  ```
- **New Wellness Center Folders**:
  ```bash
  npm run media:upload-wellness
  ```
- **New Laboratory Folders**:
  ```bash
  npm run media:upload-labs
  ```
- **New Doctor Profile Photos**:
  ```bash
  npm run media:upload-doctors
  ```
Each script will automatically convert the raw local files to progressive WebP, generate card thumbnails, upload both to R2, update PostgreSQL, and reload the Express memory cache.

---

## 📊 Performance Benchmarks

| Asset Type | Before Optimization | After Optimization | Reduction |
| :--- | :--- | :--- | :--- |
| **Sassoon Hospital Image 3** | `4,468 KB` (.png) | Full: `43.6 KB`, Card: `12.2 KB` | **99.7%** |
| **Dr. Aarti Kamat Photo** | `942 KB` (.jpeg) | Avatar: `5.9 KB` (.webp) | **99.4%** |
| **Dr Lal PathLabs Image 3** | `830 KB` (.png) | Full: `82.6 KB`, Card: `25.6 KB` | **87.0%** |
| **Atmantan Retreat Image 6** | `849 KB` (.png) | Full: `65 KB`, Card: `32 KB` | **96.2%** |
| **Total Doctor Directory (30)**| `4.38 MB` | `0.28 MB` | **93.6%** |
| **Total Hospital Directory (50)**| `21.79 MB` | `4.03 MB` (includes cards) | **81.5%** |
| **Total Laboratory Directory (30)**| `29.00 MB` | `2.84 MB` (includes cards) | **90.2%** |

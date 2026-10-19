/**
 * Upload Wellness Centers Images Pipeline
 * 
 * Ingests all wellness directories from data/wellness:
 * 1. Matches each directory against Neon PostgreSQL wellness_centers.
 * 2. Enforces the strict rule that "image_1" is ALWAYS at index 0 (used on listing cards & carousel slide 1).
 * 3. Converts all images to dual progressive WebP (1200px full + 600px card) with Sharp.
 * 4. Uploads to Cloudflare R2 under wellness/<id>/ with immutable caching headers.
 * 5. Updates the Neon PostgreSQL database records with cache-busting version query param.
 * 6. Flushes backend directory cache.
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'medvexa';
const PUBLIC_BASE = (process.env.R2_PUBLIC_URL || 'https://pub-151166afd0294cb99a7c59679d424908.r2.dev/').replace(/\/+$/, '');
const SOURCE_DIR = path.resolve('../data/wellness');

function getImage1Score(filename) {
  const name = path.parse(filename).name.trim().toLowerCase();
  // exact image_1, image_1_, image _1
  if (/^image[\s_]*1[\s_]*$/i.test(name)) return 10;
  if (/^image_?1(\.|$|_)/i.test(name)) return 8;
  // fallback image (1)
  if (/^image\s*\(\s*1\s*\)$/i.test(name)) return 5;
  return 0;
}

function sortWellnessFiles(files) {
  return [...files].sort((a, b) => {
    const sA = getImage1Score(a);
    const sB = getImage1Score(b);
    if (sA !== sB) return sB - sA; // higher priority image_1 first
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
}

async function uploadWebp(key, buffer) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  });
  await s3.send(cmd);
  return `${PUBLIC_BASE}/${key}`;
}

async function reloadBackendCache() {
  console.log('\n========================================');
  console.log('🔄 RELOADING IN-MEMORY DIRECTORY CACHE');
  console.log('========================================');
  try {
    const res = await fetch('http://localhost:8000/api/v1/cache/clear', { method: 'POST' });
    const data = await res.json();
    console.log('✅ In-memory cache reloaded successfully:', data);
  } catch (e) {
    console.warn('⚠️ Could not notify local dev server (it will reload on next server restart):', e.message);
  }
}

async function main() {
  console.log('🌿 Starting Wellness Centers Media Optimization & Cloudflare R2 Upload...');
  console.log(`Source Folder: ${SOURCE_DIR}`);
  console.log(`Bucket: ${BUCKET} | Public CDN Base: ${PUBLIC_BASE}`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const { rows: allWellness } = await pool.query('SELECT id, name, slug, city FROM wellness_centers');
  console.log(`Found ${allWellness.length} wellness centers in database.`);

  const dirs = fs.readdirSync(SOURCE_DIR).filter((f) =>
    fs.statSync(path.join(SOURCE_DIR, f)).isDirectory()
  );
  console.log(`Found ${dirs.length} wellness center folders to process.\n`);

  const explicitOverrides = {
    'Art of Living Triveni Ashram': 'art_of_living_triveni_ashram',
    'Atmabodh Wellness Centre (Patanjali Wellness — Pune)': 'atmabodh_wellness_centre_patanjali_wellness_pune',
    'Atmantan Wellness Centre': 'atmantan_wellness_centre',
    'Kaivalyadhama Health and Yoga Research Center': 'kaivalyadhama_health_and_yoga_research_center',
    'National Institute of Naturopathy (NIN), Pune': 'national_institute_of_naturopathy_nin_pune',
    'Nirvana Nature Cure': 'nirvana_nature_cure',
    'Osho International Meditation Resort': 'osho_international_meditation_resort',
    'Shree Narayandham Care - Naturopathy Centre': 'shree_narayandham_care_naturopathy_centre',
    'Swastik Wellbeing Sanctuary': 'swastik_wellbeing_sanctuary',
  };

  const versionTag = Date.now().toString().slice(-6);
  let totalProcessed = 0;
  let totalUploaded = 0;

  for (let idx = 0; idx < dirs.length; idx++) {
    const folderName = dirs[idx];
    const folderPath = path.join(SOURCE_DIR, folderName);

    // 1. Resolve Wellness Center in DB
    let center = null;
    if (explicitOverrides[folderName]) {
      center = allWellness.find((c) => c.id === explicitOverrides[folderName]);
    }

    if (!center) {
      const cleanDir = folderName.trim().toLowerCase();
      const coreName = cleanDir
        .replace(/,\s*[a-z\s]+$/i, '')
        .replace(/\s*[–—-]\s*.*$/, '')
        .replace(/\(.*?\)/g, '')
        .trim();

      center = allWellness.find((c) => {
        const cName = c.name.toLowerCase();
        const cSlug = c.slug.toLowerCase();
        const cId = c.id.toLowerCase();
        return (
          cName === cleanDir ||
          cName.includes(coreName) ||
          coreName.includes(cName) ||
          cSlug.includes(coreName.replace(/[^a-z0-9]+/g, '-')) ||
          cId.includes(coreName.replace(/[^a-z0-9]+/g, '_'))
        );
      });
    }

    if (!center) {
      console.warn(`⚠️ [${idx + 1}/${dirs.length}] No database match for: "${folderName}". Skipping.`);
      continue;
    }

    // 2. Discover and sort image files
    const rawFiles = fs.readdirSync(folderPath).filter((f) =>
      ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase())
    );

    if (rawFiles.length === 0) {
      console.warn(`⚠️ [${idx + 1}/${dirs.length}] No image files in "${folderName}".`);
      continue;
    }

    // STRICT: image_1 is ALWAYS index 0
    const sortedFiles = sortWellnessFiles(rawFiles);
    const primaryFile = sortedFiles[0];

    console.log(`[${idx + 1}/${dirs.length}] 🌿 "${center.name}" (${center.id})`);
    console.log(`   Folder: "${folderName}" | Total Images: ${sortedFiles.length} | Primary (image_1): ${primaryFile}`);

    const imageObjects = [];

    for (let imgIdx = 0; imgIdx < sortedFiles.length; imgIdx++) {
      const file = sortedFiles[imgIdx];
      const filePath = path.join(folderPath, file);
      const rawBuf = fs.readFileSync(filePath);

      // Generate 1200px Full WebP
      const fullBuf = await sharp(rawBuf)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      // Generate 600px Card Thumbnail WebP
      const cardBuf = await sharp(rawBuf)
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 75, effort: 4 })
        .toBuffer();

      const fullKey = `wellness/${center.id}/image_${imgIdx + 1}.webp`;
      const cardKey = `wellness/${center.id}/image_${imgIdx + 1}_card.webp`;

      const fullUrl = await uploadWebp(fullKey, fullBuf);
      const cardUrl = await uploadWebp(cardKey, cardBuf);

      const isFirst = imgIdx === 0;
      imageObjects.push({
        url: `${fullUrl}?v=${versionTag}`,
        card_url: `${cardUrl}?v=${versionTag}`,
        alt: isFirst
          ? `${center.name} - Main Sanctuary & Entrance (Primary)`
          : `${center.name} - View ${imgIdx + 1}`,
        caption: isFirst
          ? `${center.name} - Main Sanctuary & Entrance`
          : `${center.name} - Campus & Facility View ${imgIdx + 1}`,
      });

      totalUploaded += 2; // full + card
    }

    // 3. Update PostgreSQL
    await pool.query(
      'UPDATE wellness_centers SET images = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(imageObjects), center.id]
    );

    console.log(`   ✅ DB updated with ${imageObjects.length} images. Primary card: ${imageObjects[0].card_url}\n`);
    totalProcessed++;
  }

  console.log('========================================');
  console.log(`🎉 COMPLETED: ${totalProcessed}/${dirs.length} wellness centers processed.`);
  console.log(`⚡ Total optimized WebP files uploaded to R2: ${totalUploaded}`);
  console.log('========================================');

  await reloadBackendCache();
  await pool.end();
}

main().catch((err) => {
  console.error('Fatal error during wellness upload:', err);
  process.exit(1);
});

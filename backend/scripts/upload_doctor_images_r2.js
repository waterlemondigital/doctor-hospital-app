/**
 * Upload Doctor Images to Cloudflare R2 and Sync Database
 *
 * Reads images from data/doc_images/images_doctors in format "{name - city}"
 * Matches them to doctors in Neon PostgreSQL
 * Converts to optimized 320x320 WebP avatars (and original format)
 * Uploads to Cloudflare R2 under doctors/<doctorId>/photo.webp and doctors/<doctorSlug>/photo.webp
 * Updates doctors.photo in database
 * Reloads Express in-memory directory cache
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const IMAGES_DIR = path.resolve(__dirname, '../../data/doc_images/images_doctors');

function getContentType(ext) {
  const e = ext.toLowerCase();
  if (e === '.jpg' || e === '.jpeg') return 'image/jpeg';
  if (e === '.png') return 'image/png';
  if (e === '.webp') return 'image/webp';
  if (e === '.avif') return 'image/avif';
  return 'application/octet-stream';
}

async function uploadToR2(key, buffer, contentType) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });
  await s3.send(cmd);
  return `${PUBLIC_BASE}/${key}`;
}

async function main() {
  console.log('🩺 Doctor Images -> Cloudflare R2 Upload & Database Sync');
  console.log(`Bucket: ${BUCKET}`);
  console.log(`Public Base URL: ${PUBLIC_BASE}`);
  console.log(`Source Folder: ${IMAGES_DIR}\n`);

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Source folder not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR).filter((f) => !f.startsWith('.') && fs.statSync(path.join(IMAGES_DIR, f)).isFile());
  console.log(`Found ${files.length} image files to process.\n`);

  // Fetch all doctors from database
  const { rows: doctors } = await pool.query('SELECT id, slug, name, city, photo FROM doctors ORDER BY name ASC');
  console.log(`Loaded ${doctors.length} doctors from PostgreSQL database.\n`);

  let successCount = 0;
  let failCount = 0;

  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx];
    const ext = path.extname(file);
    const baseName = path.basename(file, ext).trim();

    let [rawName, rawCity] = baseName.split('-').map((s) => (s ? s.trim().replace(/_+$/, '') : ''));
    if (!rawCity && baseName.includes('–')) {
      [rawName, rawCity] = baseName.split('–').map((s) => (s ? s.trim().replace(/_+$/, '') : ''));
    }
    if (rawName.toLowerCase().includes('adi e. dastu')) rawName = 'Dr. Adi E. Dastur';

    function normalizeName(str) {
      return (str || '')
        .toLowerCase()
        .replace(/^prof\.\s*\(dr\.\)\s*/i, '')
        .replace(/^dr\.\s*\(prof\.\)\s*/i, '')
        .replace(/^dr\.?\s*/i, '')
        .replace(/\b[a-z]\b/g, '') // remove single-letter initials
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const cleanDocName = normalizeName(rawName);
    const cleanCity = (rawCity || '').toLowerCase().trim();

    // Match against database doctors
    const matches = doctors.filter((d) => {
      const dClean = normalizeName(d.name);

      let nameMatch = dClean === cleanDocName || dClean.includes(cleanDocName) || cleanDocName.includes(dClean);
      if (!nameMatch) {
        const words = cleanDocName.split(' ').filter((w) => w.length > 2);
        if (words.length >= 2 && words.every((w) => dClean.includes(w))) {
          nameMatch = true;
        }
      }
      if (!nameMatch) return false;

      if (cleanCity && d.city) {
        const dCityClean = d.city.toLowerCase();
        if (dCityClean.includes(cleanCity) || cleanCity.includes(dCityClean)) {
          return true;
        }
      }
      return nameMatch;
    });

    let chosen = null;
    if (matches.length === 1) {
      chosen = matches[0];
    } else if (matches.length > 1) {
      chosen = matches.find((m) => m.city && (m.city.toLowerCase().includes(cleanCity) || cleanCity.includes(m.city.toLowerCase()))) || matches[0];
    }

    if (!chosen) {
      console.warn(`⚠️ [${idx + 1}/${files.length}] No doctor matched for file: "${file}"`);
      failCount++;
      continue;
    }

    const filePath = path.join(IMAGES_DIR, file);
    try {
      const rawBuf = fs.readFileSync(filePath);

      // Convert to WebP avatar (320x320, face-focused top fit)
      const avatarWebpBuf = await sharp(rawBuf)
        .resize({ width: 320, height: 320, fit: 'cover', position: 'top' })
        .webp({ quality: 85 })
        .toBuffer();

      // Upload WebP to primary folder: doctors/<doctorId>/photo.webp
      const primaryKey = `doctors/${chosen.id}/photo.webp`;
      const publicUrl = await uploadToR2(primaryKey, avatarWebpBuf, 'image/webp');

      // Also upload original image: doctors/<doctorId>/photo<ext>
      const origKey = `doctors/${chosen.id}/photo${ext.toLowerCase()}`;
      await uploadToR2(origKey, rawBuf, getContentType(ext));

      // Also upload alias with slug if slug differs from id: doctors/<slug>/photo.webp
      if (chosen.slug && chosen.slug !== chosen.id) {
        await uploadToR2(`doctors/${chosen.slug}/photo.webp`, avatarWebpBuf, 'image/webp');
      }

      // Update database record
      await pool.query('UPDATE doctors SET photo = $1, updated_at = NOW() WHERE id = $2', [publicUrl, chosen.id]);

      console.log(`✅ [${idx + 1}/${files.length}] ${chosen.name} (${chosen.id}) -> ${publicUrl}`);
      successCount++;
    } catch (err) {
      console.error(`❌ [${idx + 1}/${files.length}] Error processing "${file}":`, err.message);
      failCount++;
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 UPLOAD COMPLETE:`);
  console.log(`   Successfully Uploaded & Updated: ${successCount}`);
  console.log(`   Failed / Unmatched: ${failCount}`);
  console.log('======================================================\n');

  // Clear in-memory directory cache
  console.log('🔄 Reloading server in-memory directory cache...');
  try {
    const res = await fetch('http://localhost:8000/api/v1/cache/clear', { method: 'POST' });
    const data = await res.json();
    console.log('✅ In-memory cache reloaded successfully:', data.message || 'Reloaded');
  } catch (e) {
    console.warn('ℹ️ Backend server will reload cache on next query or restart.');
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Fatal error during doctor image upload:', err);
  process.exit(1);
});

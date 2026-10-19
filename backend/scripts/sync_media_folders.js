/**
 * Universal Media Synchronization Pipeline for Hospitals, Wellness Centers & Labs
 * 
 * AUTOMATED FOLDER RULE:
 * - Subfolders are named: "name_as_per_our_website - cityname" (or "name_as_per_our_website")
 * - Subfolders contain raw images, with "image_1" (e.g. image_1.jpg/png) as the primary image.
 * 
 * WHAT THIS SCRIPT AUTOMATES:
 * 1. Matches folder name against Database using name + city fuzzy & normalized matcher.
 * 2. Enforces strict rule: "image_1" is ALWAYS at array index 0 (card preview & carousel slide 1).
 * 3. Converts all images to dual progressive WebP (1200px full + 600px card) via Sharp.
 * 4. Uploads to Cloudflare R2 under hospitals/<id>/, wellness/<id>/, or labs/<id>/ with immutable caching headers.
 * 5. Updates PostgreSQL records with fresh cache-busting timestamp tags (?v=...).
 * 6. Automatically clears in-memory backend cache (http://localhost:8000/api/v1/cache/clear).
 * 
 * USAGE:
 *   npm run media:sync               # Runs across all: hospitals, wellness, labs
 *   npm run media:sync:hospitals     # Only hospitals
 *   npm run media:sync:wellness      # Only wellness centers
 *   npm run media:sync:labs          # Only laboratories
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Data directories
const DATA_ROOT = path.resolve(__dirname, '../../data');
const CATEGORY_CONFIGS = {
  hospitals: {
    name: 'Hospitals',
    table: 'hospitals',
    r2Prefix: 'hospitals',
    dir: path.join(DATA_ROOT, 'hospitals'),
    altPrefix: 'Main Campus & Entrance',
    captionPrefix: 'Main Campus & Entrance',
    altSecondary: 'Clinical Facility View',
    captionSecondary: 'Facility & Inpatient View',
  },
  wellness: {
    name: 'Wellness Centers',
    table: 'wellness_centers',
    r2Prefix: 'wellness',
    dir: path.join(DATA_ROOT, 'wellness'),
    altPrefix: 'Main Sanctuary & Entrance',
    captionPrefix: 'Main Sanctuary & Entrance',
    altSecondary: 'Sanctuary & Campus View',
    captionSecondary: 'Campus & Facility View',
  },
  labs: {
    name: 'Diagnostic Laboratories',
    table: 'laboratories',
    r2Prefix: 'labs',
    dir: path.join(DATA_ROOT, 'labs'),
    altPrefix: 'Diagnostic Center & Lab',
    captionPrefix: 'Main Testing Facility & Reception',
    altSecondary: 'Diagnostic Facility View',
    captionSecondary: 'Diagnostic Equipment & Facility View',
  },
};

/**
 * Normalizes text for resilient matching:
 * Removes accents, punctuation, extra spaces, lowercases.
 */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses user folder convention: "name_as_per_our_website - cityname"
 */
function parseFolder(folderName) {
  // Check for dash separators: " - ", " – ", " — "
  const dashParts = folderName.split(/\s*[-–—]\s*/);
  if (dashParts.length >= 2) {
    return {
      namePart: dashParts.slice(0, -1).join(' - ').trim(),
      cityPart: dashParts[dashParts.length - 1].trim(),
    };
  }

  // Check for comma separator: "Name, City"
  const commaParts = folderName.split(/\s*,\s*/);
  if (commaParts.length >= 2) {
    return {
      namePart: commaParts.slice(0, -1).join(', ').trim(),
      cityPart: commaParts[commaParts.length - 1].trim(),
    };
  }

  return { namePart: folderName.trim(), cityPart: '' };
}

/**
 * Intelligent entity matcher:
 * 1. Matches exact or partial name + city
 * 2. Matches normalized name
 * 3. Matches slug / id
 */
function findEntityMatch(folderName, entities) {
  const { namePart, cityPart } = parseFolder(folderName);
  const normName = normalize(namePart);
  const normCity = normalize(cityPart);
  const normFull = normalize(folderName);

  // Exact ID or Slug match first
  const exactSlugOrId = entities.find(
    (e) =>
      e.id.toLowerCase() === normFull.replace(/\s+/g, '_') ||
      e.slug.toLowerCase() === normFull.replace(/\s+/g, '-')
  );
  if (exactSlugOrId) return exactSlugOrId;

  // Best match scoring
  let bestMatch = null;
  let highestScore = 0;

  for (const entity of entities) {
    const eNormName = normalize(entity.name);
    const eNormCity = normalize(entity.city);
    const eNormSlug = normalize(entity.slug);
    const eNormId = normalize(entity.id);

    let score = 0;

    // City match
    const cityMatched = normCity && (eNormCity.includes(normCity) || normCity.includes(eNormCity));
    if (cityMatched) score += 40;

    // Name match
    if (eNormName === normName) {
      score += 60;
    } else if (eNormName.includes(normName) || normName.includes(eNormName)) {
      score += 45;
    } else if (eNormSlug.includes(normName) || eNormId.includes(normName)) {
      score += 35;
    }

    // Full folder contains entity name
    if (normFull.includes(eNormName) || eNormName.includes(normFull)) {
      score += 30;
    }

    if (score > highestScore && score >= 40) {
      highestScore = score;
      bestMatch = entity;
    }
  }

  return bestMatch;
}

/**
 * Enforces the strict rule: "image_1" is ALWAYS prioritized first
 */
function getImage1Score(filename) {
  const name = path.parse(filename).name.trim().toLowerCase();
  // exact image_1, image_1_, image _1
  if (/^image[\s_]*1[\s_]*$/i.test(name)) return 10;
  if (/^image_?1(\.|$|_)/i.test(name)) return 8;
  // fallback image (1)
  if (/^image\s*\(\s*1\s*\)$/i.test(name)) return 5;
  return 0;
}

function sortFiles(files) {
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
  console.log('\n🔄 Reloading server in-memory directory cache...');
  try {
    const res = await fetch('http://localhost:8000/api/v1/cache/clear', { method: 'POST' });
    const data = await res.json();
    console.log('✅ In-memory cache reloaded successfully:', data.message || 'Cache cleared');
  } catch (e) {
    console.warn('ℹ️ Backend server not currently running on :8000 (cache will reload on next startup).');
  }
}

async function processCategory(catKey, config, versionTag) {
  console.log(`\n======================================================`);
  console.log(`📁 Processing Category: ${config.name.toUpperCase()}`);
  console.log(`   Source Directory: ${config.dir}`);
  console.log(`======================================================`);

  if (!fs.existsSync(config.dir)) {
    console.log(`ℹ️ Directory does not exist: ${config.dir}. Skipping.`);
    return { processed: 0, uploaded: 0 };
  }

  const { rows: entities } = await pool.query(
    `SELECT id, name, slug, city FROM ${config.table}`
  );
  console.log(`Loaded ${entities.length} records from database table "${config.table}".`);

  const folders = fs.readdirSync(config.dir).filter((f) => {
    if (f.startsWith('.')) return false;
    const full = path.join(config.dir, f);
    return fs.statSync(full).isDirectory();
  });

  if (folders.length === 0) {
    console.log(`ℹ️ No folders found inside ${config.dir}.`);
    return { processed: 0, uploaded: 0 };
  }

  console.log(`Found ${folders.length} folder(s) to process:\n`);

  let processedCount = 0;
  let uploadedCount = 0;

  for (let i = 0; i < folders.length; i++) {
    const folderName = folders[i];
    const folderPath = path.join(config.dir, folderName);

    // 1. Resolve entity in DB
    const entity = findEntityMatch(folderName, entities);
    if (!entity) {
      console.warn(`⚠️ [${i + 1}/${folders.length}] Could not match folder "${folderName}" to any DB record. Skipping.`);
      continue;
    }

    // 2. Discover raw images
    const rawFiles = fs.readdirSync(folderPath).filter((f) =>
      ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase())
    );

    if (rawFiles.length === 0) {
      console.warn(`⚠️ [${i + 1}/${folders.length}] No images in "${folderName}". Skipping.`);
      continue;
    }

    // 3. Sort with image_1 STRICTLY FIRST
    const sorted = sortFiles(rawFiles);
    const primaryFile = sorted[0];

    console.log(`[${i + 1}/${folders.length}] 🚀 "${entity.name}" (ID: ${entity.id}, City: ${entity.city || 'N/A'})`);
    console.log(`   Folder: "${folderName}" | Files: ${sorted.length} | Primary (image_1): ${primaryFile}`);

    const imageObjects = [];

    for (let imgIdx = 0; imgIdx < sorted.length; imgIdx++) {
      const file = sorted[imgIdx];
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

      const fullKey = `${config.r2Prefix}/${entity.id}/image_${imgIdx + 1}.webp`;
      const cardKey = `${config.r2Prefix}/${entity.id}/image_${imgIdx + 1}_card.webp`;

      const fullUrl = await uploadWebp(fullKey, fullBuf);
      const cardUrl = await uploadWebp(cardKey, cardBuf);

      const isFirst = imgIdx === 0;
      imageObjects.push({
        url: `${fullUrl}?v=${versionTag}`,
        card_url: `${cardUrl}?v=${versionTag}`,
        alt: isFirst
          ? `${entity.name} - ${config.altPrefix} (Primary)`
          : `${entity.name} - ${config.altSecondary} ${imgIdx + 1}`,
        caption: isFirst
          ? `${entity.name} - ${config.captionPrefix}`
          : `${entity.name} - ${config.captionSecondary} ${imgIdx + 1}`,
      });

      uploadedCount += 2;
    }

    // 4. Update Database
    await pool.query(
      `UPDATE ${config.table} SET images = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(imageObjects), entity.id]
    );

    console.log(`   ✅ DB updated (${imageObjects.length} images). Primary card: ${imageObjects[0].card_url}\n`);
    processedCount++;
  }

  return { processed: processedCount, uploaded: uploadedCount };
}

async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find((a) => a.startsWith('--type='))?.split('=')[1] || 'all';

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       MEDVEXA AUTOMATED MEDIA SYNC PIPELINE        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`Target: ${typeArg.toUpperCase()}`);
  console.log(`Bucket: ${BUCKET} | CDN Base: ${PUBLIC_BASE}`);

  const versionTag = Date.now().toString().slice(-6);

  const targets =
    typeArg === 'all'
      ? ['hospitals', 'wellness', 'labs']
      : [typeArg];

  let totalEntities = 0;
  let totalUploadedWebps = 0;

  for (const catKey of targets) {
    const config = CATEGORY_CONFIGS[catKey];
    if (!config) {
      console.error(`❌ Unknown category: "${catKey}". Choose: hospitals, wellness, labs, or all.`);
      continue;
    }
    const { processed, uploaded } = await processCategory(catKey, config, versionTag);
    totalEntities += processed;
    totalUploadedWebps += uploaded;
  }

  console.log('\n======================================================');
  console.log(`🎉 ALL DONE! Total Entities Synced: ${totalEntities}`);
  console.log(`⚡ Total Optimized WebP Files Uploaded to R2: ${totalUploadedWebps}`);
  console.log('======================================================');

  await reloadBackendCache();
  await pool.end();
}

main().catch((err) => {
  console.error('Fatal error in media sync pipeline:', err);
  process.exit(1);
});

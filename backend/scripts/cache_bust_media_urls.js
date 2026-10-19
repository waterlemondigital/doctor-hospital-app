/**
 * Media URL Cache-Busting Script
 * 
 * Appends a version query parameter (?v=...) to all R2 image URLs in the database
 * so 100% of returning users immediately fetch the latest images without needing
 * to manually hard-refresh their browsers.
 * 
 * Usage:
 *   node scripts/cache_bust_media_urls.js                      # Uses current timestamp as version
 *   node scripts/cache_bust_media_urls.js --v=2                # Uses custom version '2'
 *   node scripts/cache_bust_media_urls.js --type=hospitals     # Only hospitals
 *   node scripts/cache_bust_media_urls.js --type=wellness      # Only wellness centers
 *   node scripts/cache_bust_media_urls.js --type=labs          # Only laboratories
 */

import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function applyVersionToUrl(rawUrl, versionTag) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  // Strip any existing query params (?v=... or ?t=...)
  const cleanUrl = rawUrl.split('?')[0];
  return `${cleanUrl}?v=${versionTag}`;
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
    try {
      await fetch('http://localhost:8000/api/v1/hospitals?refresh=true');
      console.log('✅ Directory cache reloaded via GET /hospitals?refresh=true');
    } catch {
      console.warn('⚠️ Could not notify dev server (it will auto-reload on next server restart)');
    }
  }
}

async function processTable(tableName, displayName, versionTag) {
  console.log(`\n🏷️ Applying ?v=${versionTag} to ${displayName}...`);

  const { rows } = await pool.query(
    `SELECT id, name, images FROM ${tableName} WHERE images IS NOT NULL AND images::text != '[]'`
  );

  let updatedCount = 0;

  for (const row of rows) {
    const imageList = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
    if (!Array.isArray(imageList) || imageList.length === 0) continue;

    const updatedImages = imageList.map((img) => ({
      ...img,
      url: applyVersionToUrl(img.url, versionTag),
      card_url: img.card_url ? applyVersionToUrl(img.card_url, versionTag) : undefined,
      thumb_url: img.thumb_url ? applyVersionToUrl(img.thumb_url, versionTag) : undefined,
    }));

    await pool.query(
      `UPDATE ${tableName} SET images = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(updatedImages), row.id]
    );

    updatedCount++;
  }

  console.log(`✅ Updated ${updatedCount} ${displayName} records.`);
}

async function main() {
  const args = process.argv.slice(2);
  const versionArg = args.find((a) => a.startsWith('--v=') || a.startsWith('--version='));
  const versionTag = versionArg ? versionArg.split('=')[1] : Date.now().toString().slice(-6);

  const typeArg = args.find((a) => a.startsWith('--type='));
  const type = typeArg ? typeArg.split('=')[1] : 'all';

  console.log('========================================');
  console.log('🚀 MEDIA URL CACHE-BUSTER PIPELINE');
  console.log(`Target: ${type} | Version Tag: ?v=${versionTag}`);
  console.log('========================================');

  if (type === 'all' || type === 'hospitals') {
    await processTable('hospitals', 'Hospitals', versionTag);
  }
  if (type === 'all' || type === 'wellness') {
    await processTable('wellness_centers', 'Wellness Centers', versionTag);
  }
  if (type === 'all' || type === 'labs' || type === 'laboratories') {
    await processTable('laboratories', 'Laboratories', versionTag);
  }

  await reloadBackendCache();
  await pool.end();

  console.log('\n🎉 CACHE-BUSTING COMPLETE: All returning visitors will now fetch new images on their next visit!');
}

main().catch((err) => {
  console.error('Fatal error during cache busting:', err);
  process.exit(1);
});

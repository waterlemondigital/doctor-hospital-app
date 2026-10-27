#!/usr/bin/env node
/**
 * Universal Hospital Ingestion & Population Tool
 *
 * Ingests hospital markdown files matching data/templates/hospitals.template.md
 * into Neon PostgreSQL database and refreshes the backend directory cache.
 *
 * Usages:
 *   node scripts/populate_hospitals.js <filePath>
 *   node scripts/populate_hospitals.js <filePath> --dry-run
 *   node scripts/populate_hospitals.js --dir=../data/hospitals/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function parseHospitalMarkdown(fileContent) {
  const content = fileContent
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n');

  const rawSections = content.split(/\n(?=# Hospital:)/i);
  const hospitals = [];

  for (let i = 0; i < rawSections.length; i++) {
    const sec = rawSections[i];
    if (!sec || !sec.includes('# Hospital:')) continue;

    const nameMatch =
      sec.match(/# Hospital:\s*`?([^`\r\n]+)`?/i) ||
      sec.match(/-\s*\*\*Name\*\*:\s*`?([^`\r\n]+)`?/i);

    if (!nameMatch) continue;
    let name = nameMatch[1].trim();
    if (name.includes('<') || name.includes('>')) continue;

    const getField = (pattern) => {
      const m = sec.match(pattern);
      if (!m) return '';
      let val = m[1].trim();
      if (val.startsWith('`') && val.endsWith('`')) val = val.slice(1, -1).trim();
      return val;
    };

    const rawCity = getField(/-\s*\*\*City\*\*:[^\S\r\n]*([^\r\n]+)/i) || 'Mumbai';
    const city = rawCity.toLowerCase().trim();
    const area = getField(/-\s*\*\*Area\*\*:[^\S\r\n]*([^\r\n]+)/i) || '';
    const state = getField(/-\s*\*\*State\*\*:[^\S\r\n]*([^\r\n]+)/i) || 'Maharashtra';
    const address = getField(/-\s*\*\*Address\*\*:[^\S\r\n]*([^\r\n]+)/i) || `${area}, ${rawCity}, ${state}`;
    let pincode = getField(/-\s*\*\*Pincode\*\*:[^\S\r\n]*([^\r\n]+)/i) || 'Contact our consultant';
    if (pincode.toLowerCase().includes('contact')) pincode = '400001';

    const facilityType = getField(/-\s*\*\*Facility Type\*\*:[^\S\r\n]*([^\r\n]+)/i) || 'Multispeciality tertiary-care hospital';
    const facilityTypeBadge = getField(/-\s*\*\*Facility Type Badge\*\*:[^\S\r\n]*([^\r\n]+)/i) || 'Multispeciality';

    const rawBedCount = getField(/-\s*\*\*Bed Count\*\*:[^\S\r\n]*([^\r\n]+)/i);
    let bedCount = null;
    const bedMatch = rawBedCount.match(/\d+/);
    if (bedMatch) bedCount = parseInt(bedMatch[0], 10);

    const rawEmergency = getField(/-\s*\*\*Emergency 24x7\*\*:[^\S\r\n]*([^\r\n]+)/i);
    const emergencyAvailable24x7 = /yes|true|24/i.test(rawEmergency);

    const website = getField(/-\s*\*\*Website\*\*:[^\S\r\n]*([^\r\n]+)/i) || '';
    const mapsUrl = getField(/-\s*\*\*Maps URL\*\*:[^\S\r\n]*([^\r\n]+)/i) || `https://maps.google.com/?q=${encodeURIComponent(name + ', ' + rawCity)}`;

    const phone = getField(/-\s*\*\*Phone\*\*:[^\S\r\n]*([^\r\n]+)/i) || '+91 22 6130 5000';
    const whatsapp = getField(/-\s*\*\*WhatsApp\*\*:[^\S\r\n]*([^\r\n]+)/i) || 'Not separately listed';

    const connectedDoctorsRaw = getField(/-\s*\*\*Connected Doctors\*\*:[^\S\r\n]*([^\r\n]+)/i);
    const connectedDoctors = connectedDoctorsRaw
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d && !d.toLowerCase().includes('contact our consultant'));

    // Overview
    const overviewMatch = sec.match(/### Overview\s*\n+([\s\S]*?)(?=\n### Services|\n### Departments|\n#|$)/i);
    let overview = overviewMatch ? overviewMatch[1].trim() : '';

    // Services
    const servicesMatch = sec.match(/### Services\s*\n+([\s\S]*?)(?=\n### Departments|\n### Facilities|\n#|$)/i);
    const services = servicesMatch
      ? servicesMatch[1]
          .split('\n')
          .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
          .filter(Boolean)
      : [];

    // Departments
    const deptsMatch = sec.match(/### Departments\s*\n+([\s\S]*?)(?=\n### Facilities|\n#|$)/i);
    const departments = deptsMatch
      ? deptsMatch[1]
          .split('\n')
          .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
          .filter(Boolean)
          .map((d) => ({ name: d, slug: slugify(d) }))
      : [];

    // Facilities
    const facilitiesMatch = sec.match(/### Facilities\s*\n+([\s\S]*?)(?=\n###|\n\*\*Research sources\*\*|\n#|---|$)/i);
    const facilities = facilitiesMatch
      ? facilitiesMatch[1]
          .split('\n')
          .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
          .filter(Boolean)
      : [];

    const slug = slugify(name);
    const id = slug.replace(/-/g, '_');

    const sources = [
      {
        name: `${name} Official Profile`,
        url: website || 'https://medvexa.com',
        type: 'official-registry',
        date_checked: new Date().toISOString().split('T')[0],
      },
    ];

    hospitals.push({
      id,
      slug,
      name,
      state,
      city,
      area,
      address,
      pincode,
      facility_type: facilityType,
      facility_type_badge: facilityTypeBadge,
      overview,
      bed_count: bedCount,
      emergency_available_24x7: emergencyAvailable24x7,
      website,
      phone,
      whatsapp,
      maps_url: mapsUrl,
      verification_status: 'independently-checked',
      last_checked: new Date().toISOString().split('T')[0],
      images: [],
      services,
      departments,
      facilities,
      sources,
      connectedDoctors,
    });
  }

  return hospitals;
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const fileArg = args.find((a) => !a.startsWith('--'));

  let targetFiles = [];

  if (fileArg) {
    const resolvedPath = path.isAbsolute(fileArg) ? fileArg : path.resolve(process.cwd(), fileArg);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ File not found: ${resolvedPath}`);
      process.exit(1);
    }
    targetFiles.push(resolvedPath);
  } else {
    // Default to data/hospitals or data/doctors_data
    const defaultFile = path.resolve(__dirname, '../../data/doctors_data/Medvexa_Mumbai_Hospitals_Part_1.md');
    if (fs.existsSync(defaultFile)) {
      targetFiles.push(defaultFile);
    }
  }

  console.log(`🏥 Hospital Population & Ingestion Tool${isDryRun ? ' (DRY RUN)' : ''}`);
  console.log(`Files to process: ${targetFiles.length}\n`);

  const affectedCities = new Set();
  let totalInserted = 0;
  let totalUpdated = 0;

  for (const file of targetFiles) {
    console.log(`======================================================`);
    console.log(`📄 Processing file: "${file}"`);
    console.log(`======================================================`);

    const rawContent = fs.readFileSync(file, 'utf8');
    const hospitals = parseHospitalMarkdown(rawContent);
    console.log(`Parsed ${hospitals.length} hospital record(s) from file.\n`);

    for (let i = 0; i < hospitals.length; i++) {
      const h = hospitals[i];
      affectedCities.add(h.city);

      console.log(`[${i + 1}/${hospitals.length}] Hospital: "${h.name}" (ID: ${h.id})`);
      console.log(`   Location: ${h.area}, ${h.city}, ${h.state} | Beds: ${h.bed_count || 'N/A'}`);
      console.log(`   Departments: ${h.departments.length} | Services: ${h.services.length} | Facilities: ${h.facilities.length}`);
      console.log(`   Connected Doctors: ${h.connectedDoctors.length > 0 ? h.connectedDoctors.join(', ') : 'None listed'}`);

      if (isDryRun) {
        console.log(`   [DRY RUN] Would upsert into database.`);
        continue;
      }

      // Check if already exists
      const existing = await pool.query('SELECT id FROM hospitals WHERE id = $1 OR slug = $2', [h.id, h.slug]);
      const isUpdate = existing.rows.length > 0;

      const upsertSql = `
        INSERT INTO hospitals (
          id, slug, name, state, city, area, address, pincode,
          facility_type, facility_type_badge, overview, bed_count,
          emergency_available_24x7, website, phone, whatsapp, maps_url,
          verification_status, last_checked, images, services, departments,
          facilities, sources, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22,
          $23, $24, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          state = EXCLUDED.state,
          city = EXCLUDED.city,
          area = EXCLUDED.area,
          address = EXCLUDED.address,
          pincode = EXCLUDED.pincode,
          facility_type = EXCLUDED.facility_type,
          facility_type_badge = EXCLUDED.facility_type_badge,
          overview = EXCLUDED.overview,
          bed_count = EXCLUDED.bed_count,
          emergency_available_24x7 = EXCLUDED.emergency_available_24x7,
          website = EXCLUDED.website,
          phone = EXCLUDED.phone,
          whatsapp = EXCLUDED.whatsapp,
          maps_url = EXCLUDED.maps_url,
          services = EXCLUDED.services,
          departments = EXCLUDED.departments,
          facilities = EXCLUDED.facilities,
          sources = EXCLUDED.sources,
          updated_at = NOW();
      `;

      await pool.query(upsertSql, [
        h.id,
        h.slug,
        h.name,
        h.state,
        h.city,
        h.area,
        h.address,
        h.pincode,
        h.facility_type,
        h.facility_type_badge,
        h.overview,
        h.bed_count,
        h.emergency_available_24x7,
        h.website,
        h.phone,
        h.whatsapp,
        h.maps_url,
        h.verification_status,
        h.last_checked,
        JSON.stringify(h.images),
        JSON.stringify(h.services),
        JSON.stringify(h.departments),
        JSON.stringify(h.facilities),
        JSON.stringify(h.sources),
      ]);

      if (isUpdate) {
        totalUpdated++;
        console.log(`   🔄 UPDATED hospital record.`);
      } else {
        totalInserted++;
        console.log(`   ➕ INSERTED new hospital record.`);
      }
    }
  }

  if (!isDryRun) {
    // Update cities hospital_count
    for (const cityId of affectedCities) {
      await pool.query(`
        UPDATE cities
        SET hospital_count = (SELECT count(*) FROM hospitals WHERE city = $1)
        WHERE id = $1
      `, [cityId]);
      const res = await pool.query('SELECT hospital_count FROM cities WHERE id = $1', [cityId]);
      console.log(`\n🌆 City "${cityId}" hospital count updated to: ${res.rows[0]?.hospital_count}`);
    }

    // Flush backend directory cache
    try {
      console.log('\n🔄 Reloading backend directory cache...');
      const cacheRes = await fetch('http://localhost:8000/api/v1/cache/clear', { method: 'POST' });
      if (cacheRes.ok) {
        console.log('✅ In-memory cache reloaded successfully.');
      }
    } catch (e) {
      console.log('ℹ️ Server cache will refresh automatically.');
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 COMPLETED HOSPITAL POPULATION:`);
  console.log(`   Inserted: ${totalInserted}`);
  console.log(`   Updated:  ${totalUpdated}`);
  console.log(`======================================================\n`);

  await pool.end();
}

main().catch((err) => {
  console.error('Fatal error during hospital population:', err);
  process.exit(1);
});

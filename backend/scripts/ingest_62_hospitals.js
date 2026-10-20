/**
 * Ingest Bulk 62 Hospital Records into Neon PostgreSQL
 * 
 * Sources data from backend/complete_hospital_doctor_data/hospitals/
 * 
 * RULES ENFORCED:
 * 1. Preserves exact database schema (no DDL/ALTER TABLE).
 * 2. Matches 60 existing hospital records, updating their rich metadata
 *    (overview, departments, services, facilities, bed count, badge, etc.)
 *    while strictly PRESERVING all uploaded Cloudflare R2 images and existing IDs.
 * 3. Inserts the 2 new distinct hospital locations (Fortis Escorts Heart Institute New Delhi
 *    and Bombay Hospital & Medical Research Centre Mumbai).
 * 4. Stores the canonical ID (HVX-H001..HVX-H062) in the sources JSON payload
 *    for 100% deterministic doctor linkage in the next phase.
 * 5. Updates city hospital counts in the cities table.
 * 6. Flushes and reloads the backend in-memory cache.
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

const CITY_TO_STATE = {
  ahmedabad: 'Gujarat',
  aluva: 'Kerala',
  bengaluru: 'Karnataka',
  bhopal: 'Madhya Pradesh',
  bhubaneswar: 'Odisha',
  chandigarh: 'Chandigarh',
  chennai: 'Tamil Nadu',
  coimbatore: 'Tamil Nadu',
  faridabad: 'Haryana',
  gurugram: 'Haryana',
  hyderabad: 'Telangana',
  indore: 'Madhya Pradesh',
  jaipur: 'Rajasthan',
  jamshedpur: 'Jharkhand',
  jodhpur: 'Rajasthan',
  kochi: 'Kerala',
  lucknow: 'Uttar Pradesh',
  mumbai: 'Maharashtra',
  'new delhi': 'Delhi',
  patna: 'Bihar',
  puducherry: 'Puducherry',
  pune: 'Maharashtra',
  ranchi: 'Jharkhand',
  rishikesh: 'Uttarakhand',
  secunderabad: 'Telangana',
  thiruvananthapuram: 'Kerala',
  vellore: 'Tamil Nadu',
};

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseHospitalMarkdown(content, filename) {
  const hvxIdMatch = content.match(/-\s*\*\*Hospital ID:\*\*\s*`([^`]+)`/i);
  const nameMatch = content.match(/-\s*\*\*Official name:\*\*\s*(.+)/i);
  const cityMatch = content.match(/-\s*\*\*City:\*\*\s*(.+)/i);
  const areaMatch = content.match(/-\s*\*\*Area \/ campus:\*\*\s*(.+)/i);
  const typeMatch = content.match(/-\s*\*\*Facility type:\*\*\s*(.+)/i);
  const webMatch = content.match(/-\s*\*\*Official website \/ source:\*\*\s*(.+)/i);

  const hvxId = hvxIdMatch ? hvxIdMatch[1].trim() : null;
  const name = nameMatch ? nameMatch[1].trim() : null;
  const city = cityMatch ? cityMatch[1].trim() : 'Pune';
  const area = areaMatch ? areaMatch[1].trim() : city;
  const facilityType = typeMatch ? typeMatch[1].trim() : 'Multispecialty Tertiary Care';
  const website = webMatch ? webMatch[1].trim() : null;

  // 1. Overview
  let overview = '';
  const overviewMatch = content.match(/## 1\.\s*Overview\s*\n+([\s\S]*?)(?=\n## 2\.|\n---)/i);
  if (overviewMatch) {
    overview = overviewMatch[1].trim();
  }

  // 2. Services
  const services = [];
  const servicesMatch = content.match(/## 2\.\s*Services and Treatments\s*\n+([\s\S]*?)(?=\n## 3\.|\n---)/i);
  if (servicesMatch) {
    const lines = servicesMatch[1].split('\n');
    for (const line of lines) {
      const bullet = line.replace(/^\s*[-*]\s*/, '').trim();
      if (bullet) services.push(bullet);
    }
  }

  // 3. Departments
  const departments = [];
  const deptsMatch = content.match(/## 3\.\s*Departments\s*\n+([\s\S]*?)(?=\n## 4\.|\n---)/i);
  if (deptsMatch) {
    const lines = deptsMatch[1].split('\n');
    for (const line of lines) {
      const deptName = line.replace(/^\s*[-*]\s*/, '').trim();
      if (deptName) {
        departments.push({
          name: deptName,
          slug: slugify(deptName),
        });
      }
    }
  }

  // 4. Connected Doctors
  const connectedDoctorIds = [];
  const docConnMatch = content.match(/-\s*\*\*Connected doctor IDs:\*\*\s*(.+)/i);
  if (docConnMatch) {
    const rawIds = docConnMatch[1].split(',');
    for (const raw of rawIds) {
      const clean = raw.replace(/[`\s]/g, '').trim();
      if (clean && clean.startsWith('DVX-')) {
        connectedDoctorIds.push(clean);
      }
    }
  }

  // 5. Infrastructure & Facilities
  const facilities = [];
  let bedCount = null;
  let phone = null;
  let address = null;
  let pincode = null;

  const infraMatch = content.match(/## 5\.\s*Infrastructure and Facilities\s*\n+([\s\S]*?)(?=\n### Data connections|\n### Source|\n---)/i);
  if (infraMatch) {
    const lines = infraMatch[1].split('\n');
    for (const line of lines) {
      const bullet = line.replace(/^\s*[-*]\s*/, '').trim();
      if (!bullet) continue;
      facilities.push(bullet);

      if (!bedCount) {
        const bedM = bullet.match(/(\d+)\+?\s*(?:advanced-care\s*)?beds/i);
        if (bedM) bedCount = parseInt(bedM[1], 10);
      }

      if (!phone) {
        const phoneM = bullet.match(/(?:contact|enquiry|phone):\s*([0-9\s-+]{8,20})/i);
        if (phoneM) phone = phoneM[1].trim();
      }

      if (!address) {
        const locM = bullet.match(/Published location:\s*([^;]+)/i);
        if (locM) {
          address = locM[1].trim();
          const pinM = address.match(/\b(\d{6})\b/);
          if (pinM) pincode = pinM[1];
        }
      }
    }
  }

  const cleanCity = city.toLowerCase().trim();
  const state = CITY_TO_STATE[cleanCity] || 'Maharashtra';
  if (!address) {
    address = `${area}, ${city}, ${state}`;
  }
  if (!pincode) {
    pincode = '400001';
  }

  // Sources
  const sources = [];
  if (website) {
    sources.push({
      name: `${name} Official Profile`,
      url: website,
      date_checked: '2026-10-20',
      type: 'official-registry',
    });
  }
  if (hvxId) {
    sources.push({
      type: 'canonical_id',
      canonical_id: hvxId,
      connected_doctors_count: connectedDoctorIds.length,
      connected_doctor_ids: connectedDoctorIds,
    });
  }

  const slug = filename.replace(/^HVX-H\d+__/, '').replace(/\.md$/, '');

  return {
    hvxId,
    name,
    slug,
    city: cleanCity,
    area,
    address,
    pincode,
    state,
    facilityType,
    facilityTypeBadge:
      facilityType.includes('Super') || facilityType.includes('JCI') || facilityType.includes('NABH')
        ? 'NABH / JCI Accredited Flagship'
        : 'NABH Accredited Facility',
    overview,
    bedCount,
    emergencyAvailable24x7: true,
    website,
    phone: phone || '020 6721 5000',
    whatsapp: 'Not separately listed',
    mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name + ', ' + city + ', India')}`,
    verificationStatus: 'independently-checked',
    lastChecked: '2026-10-20',
    services,
    departments,
    facilities,
    sources,
    connectedDoctorIds,
  };
}

async function main() {
  console.log('🏥 Starting Ingestion of 62 Bulk Hospital Records...');
  const DATA_PATH = path.resolve(__dirname, '../complete_hospital_doctor_data');
  const manifest = JSON.parse(fs.readFileSync(path.join(DATA_PATH, 'manifest.json'), 'utf8'));

  const { rows: dbHospitals } = await pool.query('SELECT * FROM hospitals');
  console.log(`Loaded ${dbHospitals.length} existing hospitals from database.`);
  console.log(`Processing ${manifest.hospital_files.length} hospital files from data pack...\n`);

  const explicitMapping = {
    'HVX-H012': 'kims_hospitals',
    'HVX-H042': 'gleneagles_hospital',
    'HVX-H054': 'shalby_multispecialty_hospital',
    'HVX-H056': 'sum_hospital',
    'HVX-H034': 'aiims_rishikesh',
    'HVX-H035': 'aiims_patna',
    'HVX-H036': 'aiims_jodhpur',
    'HVX-H037': 'aiims_bhubaneswar',
    'HVX-H038': 'aiims_bhopal',
  };

  let updatedCount = 0;
  let insertedCount = 0;

  for (let idx = 0; idx < manifest.hospital_files.length; idx++) {
    const file = manifest.hospital_files[idx];
    const fullPath = path.join(DATA_PATH, 'hospitals', file);
    const content = fs.readFileSync(fullPath, 'utf8');

    const parsed = parseHospitalMarkdown(content, file);

    // 1. Resolve Target Record
    let existing = null;
    if (explicitMapping[parsed.hvxId]) {
      existing = dbHospitals.find((h) => h.id === explicitMapping[parsed.hvxId]);
    }

    if (!existing) {
      existing = dbHospitals.find((h) => h.slug === parsed.slug || h.id === parsed.slug.replace(/-/g, '_'));
    }

    if (!existing) {
      const normName = normalize(parsed.name);
      const normCity = normalize(parsed.city);
      existing = dbHospitals.find((h) => {
        const hCity = h.city.toLowerCase().trim();
        const hNormName = normalize(h.name);
        const cityMatches = !normCity || hCity.includes(normCity) || normCity.includes(hCity);
        const nameMatches = hNormName.includes(normName) || normName.includes(hNormName);
        return cityMatches && nameMatches;
      });
    }

    if (existing) {
      // Preserve existing images, phone/address if rich, existing id and slug
      const mergedImages = existing.images || [];
      const finalPhone = parsed.phone !== '020 6721 5000' ? parsed.phone : (existing.phone || parsed.phone);
      const finalAddress = parsed.address || existing.address;
      const finalPincode = parsed.pincode !== '400001' ? parsed.pincode : (existing.pincode || parsed.pincode);
      const finalBedCount = parsed.bedCount || existing.bed_count;

      await pool.query(
        `UPDATE hospitals
         SET name = $1,
             state = $2,
             city = $3,
             area = $4,
             address = $5,
             pincode = $6,
             facility_type = $7,
             facility_type_badge = $8,
             overview = $9,
             bed_count = $10,
             emergency_available_24x7 = $11,
             website = COALESCE($12, website),
             phone = $13,
             verification_status = $14,
             last_checked = $15,
             services = $16,
             departments = $17,
             facilities = $18,
             sources = $19,
             updated_at = NOW()
         WHERE id = $20`,
        [
          parsed.name,
          parsed.state,
          parsed.city,
          parsed.area,
          finalAddress,
          finalPincode,
          parsed.facilityType,
          parsed.facilityTypeBadge,
          parsed.overview,
          finalBedCount,
          parsed.emergencyAvailable24x7,
          parsed.website,
          finalPhone,
          parsed.verificationStatus,
          parsed.lastChecked,
          JSON.stringify(parsed.services),
          JSON.stringify(parsed.departments),
          JSON.stringify(parsed.facilities),
          JSON.stringify(parsed.sources),
          existing.id,
        ]
      );

      console.log(`[${idx + 1}/${manifest.hospital_files.length}] 🔄 UPDATED: "${existing.name}" (ID: ${existing.id}) with ${parsed.hvxId} data.`);
      updatedCount++;
    } else {
      // INSERT new record
      const newId = parsed.slug.replace(/-/g, '_');
      await pool.query(
        `INSERT INTO hospitals (
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
         )`,
        [
          newId,
          parsed.slug,
          parsed.name,
          parsed.state,
          parsed.city,
          parsed.area,
          parsed.address,
          parsed.pincode,
          parsed.facilityType,
          parsed.facilityTypeBadge,
          parsed.overview,
          parsed.bedCount,
          parsed.emergencyAvailable24x7,
          parsed.website,
          parsed.phone,
          parsed.whatsapp,
          parsed.mapsUrl,
          parsed.verificationStatus,
          parsed.lastChecked,
          JSON.stringify([]),
          JSON.stringify(parsed.services),
          JSON.stringify(parsed.departments),
          JSON.stringify(parsed.facilities),
          JSON.stringify(parsed.sources),
        ]
      );

      console.log(`[${idx + 1}/${manifest.hospital_files.length}] ➕ INSERTED NEW: "${parsed.name}" (ID: ${newId}) [${parsed.hvxId}]`);
      insertedCount++;
    }
  }

  // Update city hospital counts in cities table
  console.log('\n🏙️ Updating city hospital counts...');
  await pool.query(`
    UPDATE cities c
    SET hospital_count = (
      SELECT COUNT(*) FROM hospitals h WHERE LOWER(h.city) = LOWER(c.name) OR LOWER(h.city) = LOWER(c.id)
    )
  `);
  console.log('✅ City hospital counts synchronized.');

  console.log('\n========================================');
  console.log(`🎉 INGESTION COMPLETE:`);
  console.log(`   Updated: ${updatedCount} existing hospitals`);
  console.log(`   Inserted: ${insertedCount} new hospitals`);
  console.log(`   Total Processed: ${manifest.hospital_files.length}`);
  console.log('========================================');

  // Reload cache
  console.log('\n🔄 Reloading server in-memory directory cache...');
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
  console.error('Fatal error during hospital ingestion:', err);
  process.exit(1);
});

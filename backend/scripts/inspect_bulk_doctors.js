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

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function inspectDoctors() {
  const DATA_PATH = path.resolve(__dirname, '../complete_hospital_doctor_data');
  const manifest = JSON.parse(fs.readFileSync(path.join(DATA_PATH, 'manifest.json'), 'utf8'));

  // Get hospital mapping from DB
  const { rows: dbHospitals } = await pool.query('SELECT id, slug, name, city, state, area, sources FROM hospitals');
  
  const hvxToHospital = new Map();
  for (const h of dbHospitals) {
    const sources = Array.isArray(h.sources) ? h.sources : JSON.parse(h.sources || '[]');
    const canonical = sources.find(s => s.type === 'canonical_id')?.canonical_id;
    if (canonical) {
      hvxToHospital.set(canonical, h);
    }
  }

  console.log(`Loaded ${hvxToHospital.size} canonical hospital mappings.`);
  console.log(`Processing ${manifest.doctor_files.length} doctor files...\n`);

  let parsedCount = 0;
  let unmappedAffiliations = [];

  for (const file of manifest.doctor_files) {
    const content = fs.readFileSync(path.join(DATA_PATH, 'doctors', file), 'utf8');

    const dvxIdMatch = content.match(/-\s*\*\*Doctor ID:\*\*\s*`?([^`\n]+)`?/i);
    const nameMatch = content.match(/-\s*\*\*Name:\*\*\s*(.+)/i);
    const specMatch = content.match(/-\s*\*\*Primary speciality:\*\*\s*(.+)/i);
    const roleMatch = content.match(/-\s*\*\*Professional role:\*\*\s*(.+)/i);
    const qualMatch = content.match(/-\s*\*\*Qualifications:\*\*\s*(.+)/i);
    const areasMatch = content.match(/-\s*\*\*Areas of practice:\*\*\s*(.+)/i);

    const dvxId = dvxIdMatch ? dvxIdMatch[1].trim() : null;
    const name = nameMatch ? nameMatch[1].trim() : null;
    const speciality = specMatch ? specMatch[1].trim() : 'General Medicine';
    const title = roleMatch ? roleMatch[1].trim() : 'Consultant Specialist';
    const qualifications = qualMatch ? qualMatch[1].trim() : 'MBBS';

    // Parse Affiliated Hospitals: line containing "hospital ID `HVX-H...`"
    const affMatches = [...content.matchAll(/hospital ID\s*`?(HVX-H\d+)`?/gi)];
    const hospitalIds = affMatches.map(m => m[1].toUpperCase());

    if (hospitalIds.length === 0) {
      // Check if hospital ID without "hospital ID" text
      const directHvx = [...content.matchAll(/`(HVX-H\d+)`/gi)].map(m => m[1].toUpperCase());
      hospitalIds.push(...directHvx);
    }

    parsedCount++;

    for (const hid of hospitalIds) {
      if (!hvxToHospital.has(hid)) {
        unmappedAffiliations.push({ dvxId, name, hid, file });
      }
    }

    if (parsedCount <= 5) {
      const primaryHosp = hvxToHospital.get(hospitalIds[0]);
      console.log(`[${parsedCount}] ${dvxId}: "${name}" | Speciality: "${speciality}"`);
      console.log(`    Role: "${title}" | Qual: "${qualifications}"`);
      console.log(`    Hospitals: ${hospitalIds.join(', ')} -> ${primaryHosp ? primaryHosp.name + ' (' + primaryHosp.city + ')' : 'UNKNOWN'}`);
    }
  }

  console.log(`\n✅ Total parsed doctor records: ${parsedCount}`);
  if (unmappedAffiliations.length > 0) {
    console.warn(`⚠️ Unmapped hospital affiliations count: ${unmappedAffiliations.length}`);
    console.warn(unmappedAffiliations);
  } else {
    console.log('🎉 100% of doctor affiliations mapped to valid database hospitals!');
  }

  await pool.end();
}

inspectDoctors().catch(console.error);

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function simulate() {
  const manifest = JSON.parse(fs.readFileSync('complete_hospital_doctor_data/manifest.json', 'utf8'));
  const { rows: dbHospitals } = await pool.query('SELECT id, slug, name, city FROM hospitals');

  const explicit = {
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

  let updateCount = 0;
  let insertCount = 0;
  const newInserts = [];

  for (const file of manifest.hospital_files) {
    const content = fs.readFileSync(path.join('complete_hospital_doctor_data/hospitals', file), 'utf8');
    const hvxIdMatch = content.match(/-\s*\*\*Hospital ID:\*\*\s*`([^`]+)`/i);
    const nameMatch = content.match(/-\s*\*\*Official name:\*\*\s*(.+)/i);
    const cityMatch = content.match(/-\s*\*\*City:\*\*\s*(.+)/i);

    const hvxId = hvxIdMatch ? hvxIdMatch[1].trim() : null;
    const name = nameMatch ? nameMatch[1].trim() : null;
    const city = cityMatch ? cityMatch[1].trim().toLowerCase() : '';
    const slug = file.replace(/^HVX-H\d+__/, '').replace(/\.md$/, '');

    let match = null;
    if (explicit[hvxId]) {
      match = dbHospitals.find((h) => h.id === explicit[hvxId]);
    }

    if (!match) {
      match = dbHospitals.find((h) => h.slug === slug || h.id === slug.replace(/-/g, '_'));
    }

    if (!match) {
      const normName = normalize(name);
      const normCity = normalize(city);
      match = dbHospitals.find((h) => {
        const hCity = h.city.toLowerCase().trim();
        const hNormName = normalize(h.name);
        const cityMatches = !normCity || hCity.includes(normCity) || normCity.includes(hCity);
        const nameMatches = hNormName.includes(normName) || normName.includes(hNormName);
        return cityMatches && nameMatches;
      });
    }

    if (match) {
      updateCount++;
    } else {
      insertCount++;
      newInserts.push({ hvxId, name, city, file });
    }
  }

  console.log(`Simulation Result:`);
  console.log(`Total Files in Data Pack: ${manifest.hospital_files.length}`);
  console.log(`Matched and will UPDATE existing records: ${updateCount}`);
  console.log(`New locations to INSERT: ${insertCount}`);
  if (newInserts.length > 0) {
    console.log('\nNew locations to insert:');
    newInserts.forEach((n) => console.log(`- ${n.hvxId}: "${n.name}" in ${n.city} (${n.file})`));
  }

  await pool.end();
}

simulate().catch(console.error);

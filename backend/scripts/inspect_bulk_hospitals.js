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

async function main() {
  const { rows: dbHospitals } = await pool.query('SELECT id, slug, name, city, images FROM hospitals');
  
  const manifest = JSON.parse(fs.readFileSync('complete_hospital_doctor_data/manifest.json', 'utf8'));
  console.log('Manifest hospital files count:', manifest.hospital_files.length);
  console.log('DB hospital rows count:', dbHospitals.length);

  const parsed = [];
  for (const file of manifest.hospital_files) {
    const content = fs.readFileSync(path.join('complete_hospital_doctor_data/hospitals', file), 'utf8');
    const idMatch = content.match(/-\s*\*\*Hospital ID:\*\*\s*`([^`]+)`/);
    const nameMatch = content.match(/-\s*\*\*Official name:\*\*\s*(.+)/);
    const cityMatch = content.match(/-\s*\*\*City:\*\*\s*(.+)/);
    const areaMatch = content.match(/-\s*\*\*Area \/ campus:\*\*\s*(.+)/);
    const typeMatch = content.match(/-\s*\*\*Facility type:\*\*\s*(.+)/);
    const webMatch = content.match(/-\s*\*\*Official website \/ source:\*\*\s*(.+)/);
    
    parsed.push({
      hvxId: idMatch ? idMatch[1].trim() : null,
      name: nameMatch ? nameMatch[1].trim() : null,
      city: cityMatch ? cityMatch[1].trim() : null,
      area: areaMatch ? areaMatch[1].trim() : null,
      type: typeMatch ? typeMatch[1].trim() : null,
      web: webMatch ? webMatch[1].trim() : null,
      file,
    });
  }

  let matched = 0;
  const unmatched = [];

  parsed.forEach((p) => {
    const m = dbHospitals.find((db) => {
      const n1 = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const n2 = db.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const c1 = p.city.toLowerCase().replace(/[^a-z0-9]/g, '');
      const c2 = db.city.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (n1.includes(n2) || n2.includes(n1)) && (c1.includes(c2) || c2.includes(c1));
    });
    if (m) {
      matched++;
    } else {
      unmatched.push(p);
    }
  });

  console.log('Matched against current DB:', matched, '/', parsed.length);
  if (unmatched.length > 0) {
    console.log('Unmatched count:', unmatched.length);
    console.log('Unmatched samples:', unmatched.slice(0, 10));
  }

  await pool.end();
}

main().catch(console.error);

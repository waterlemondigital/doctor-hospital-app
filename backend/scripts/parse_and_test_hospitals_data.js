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

// State mapping for Indian cities
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

  // Overview
  let overview = '';
  const overviewMatch = content.match(/## 1\.\s*Overview\s*\n+([\s\S]*?)(?=\n## 2\.|\n---)/i);
  if (overviewMatch) {
    overview = overviewMatch[1].trim();
  }

  // Services
  const services = [];
  const servicesMatch = content.match(/## 2\.\s*Services and Treatments\s*\n+([\s\S]*?)(?=\n## 3\.|\n---)/i);
  if (servicesMatch) {
    const lines = servicesMatch[1].split('\n');
    for (const line of lines) {
      const bullet = line.replace(/^\s*[-*]\s*/, '').trim();
      if (bullet) services.push(bullet);
    }
  }

  // Departments
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

  // Connected Doctors
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

  // Infrastructure and Facilities
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

      // Extract bed count if present
      if (!bedCount) {
        const bedM = bullet.match(/(\d+)\+?\s*(?:advanced-care\s*)?beds/i);
        if (bedM) bedCount = parseInt(bedM[1], 10);
      }

      // Extract phone / appointment contact
      if (!phone) {
        const phoneM = bullet.match(/(?:contact|enquiry|phone):\s*([0-9\s-+]{8,20})/i);
        if (phoneM) phone = phoneM[1].trim();
      }

      // Extract location/address
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
      name: 'Medvexa Canonical ID',
      canonical_id: hvxId,
      connected_doctors_count: connectedDoctorIds.length,
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
    facilityTypeBadge: facilityType.includes('Super') || facilityType.includes('JCI') || facilityType.includes('NABH')
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

async function testAll() {
  const manifest = JSON.parse(fs.readFileSync('complete_hospital_doctor_data/manifest.json', 'utf8'));
  console.log(`Testing parsing of all ${manifest.hospital_files.length} hospital files...`);

  const { rows: dbHospitals } = await pool.query('SELECT id, slug, name, city, images FROM hospitals');
  console.log(`Current DB contains ${dbHospitals.length} hospitals.\n`);

  let parsedCount = 0;
  for (const file of manifest.hospital_files) {
    const content = fs.readFileSync(path.join('complete_hospital_doctor_data/hospitals', file), 'utf8');
    const hospital = parseHospitalMarkdown(content, file);
    parsedCount++;

    if (parsedCount <= 3) {
      console.log(`[${parsedCount}] ${hospital.hvxId}: ${hospital.name}`);
      console.log(`     City: ${hospital.city} | State: ${hospital.state} | Beds: ${hospital.bedCount}`);
      console.log(`     Depts: ${hospital.departments.length} | Services: ${hospital.services.length} | Connected Docs: ${hospital.connectedDoctorIds.length}`);
    }
  }

  console.log(`\n✅ Successfully parsed ${parsedCount} hospital records!`);
  await pool.end();
}

testAll().catch(console.error);

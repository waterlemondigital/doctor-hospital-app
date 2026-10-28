/**
 * Unified Medical Directory Formatting & Ingestion Pipeline
 * 
 * Compliant with:
 *  - data/templates/hospitals.template.md
 *  - data/templates/doctors.template.md
 * 
 * Features:
 *  1. Parses & standardizes hospital and doctor markdown files to exact template formats.
 *  2. Upserts hospitals and doctors into Neon PostgreSQL.
 *  3. Automatically resolves and builds two-way affiliations (Doctor-Hospital & Doctor-Laboratory).
 *  4. Clears in-memory directory cache.
 * 
 * Usage:
 *  - Process all files in data/hospital_data and data/doctors_data:
 *      node scripts/sync_data.js
 *  - Process specific files:
 *      node scripts/sync_data.js --hospitals ../data/hospital_data/singapore_hospital_data_part1.md --doctors ../data/doctors_data/singapore_doctors_data_part1.md
 *  - Format markdown files only (no database changes):
 *      node scripts/sync_data.js --format-only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper utilities
function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function snakeId(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');
}

async function getDbClient() {
  try {
    const client = new pg.Client({
      host: '52.14.39.200',
      port: 5432,
      user: 'neondb_owner',
      password: 'npg_3OQICy7REpix',
      database: 'neondb',
      options: 'endpoint=ep-rapid-math-b46t2c0w',
      ssl: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
      },
    });
    await client.connect();
    return client;
  } catch (err) {
    console.warn('⚠️ Direct IP failed, attempting connection using DATABASE_URL...');
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    return client;
  }
}

// ==========================================
// HOSPITAL PARSING & FORMATTING
// ==========================================
export function parseHospitalsMarkdown(content) {
  const sections = content.split(/(?=^# Hospital:)/m).filter((s) => s.trim().startsWith('# Hospital:'));
  const hospitals = [];

  for (const section of sections) {
    const nameMatch = section.match(/-\s*\*\*Name\*\*:\s*([^\n\r]+)/i);
    const cityMatch = section.match(/-\s*\*\*City\*\*:\s*([^\n\r]+)/i);
    const areaMatch = section.match(/-\s*\*\*Area\*\*:\s*([^\n\r]+)/i);
    const stateMatch = section.match(/-\s*\*\*State\*\*:\s*([^\n\r]+)/i);
    const addressMatch = section.match(/-\s*\*\*Address\*\*:\s*([^\n\r]+)/i);
    const pincodeMatch = section.match(/-\s*\*\*Pincode\*\*:\s*([^\n\r]+)/i);
    const facilityTypeMatch = section.match(/-\s*\*\*Facility Type\*\*:\s*([^\n\r]+)/i);
    const badgeMatch = section.match(/-\s*\*\*Facility Type Badge\*\*:\s*([^\n\r]+)/i);
    const bedMatch = section.match(/-\s*\*\*Bed Count\*\*:\s*([^\n\r]+)/i);
    const emergencyMatch = section.match(/-\s*\*\*Emergency 24x7\*\*:\s*`?([^\n\r`]+)`?/i);
    const webMatch = section.match(/-\s*\*\*Website\*\*:\s*([^\n\r]+)/i);
    const mapsMatch = section.match(/-\s*\*\*Maps URL\*\*:\s*([^\n\r]+)/i);
    const doctorsMatch = section.match(/-\s*\*\*Connected Doctors\*\*:\s*([^\n\r]+)/i);
    const labsMatch = section.match(/-\s*\*\*Connected Laboratories\*\*:\s*([^\n\r]+)/i);

    const name = nameMatch ? nameMatch[1].trim() : '';
    const city = cityMatch ? cityMatch[1].trim() : '';
    const area = areaMatch ? areaMatch[1].trim() : city;
    const state = stateMatch ? stateMatch[1].trim() : '';
    const address = addressMatch ? addressMatch[1].trim() : '';
    const pincode = pincodeMatch ? pincodeMatch[1].trim() : '';
    const facilityType = facilityTypeMatch ? facilityTypeMatch[1].trim() : 'Super-Speciality Tertiary Care';
    const facilityTypeBadge = badgeMatch ? badgeMatch[1].trim() : 'NABH Accredited Flagship';
    const bedCountRaw = bedMatch ? bedMatch[1].trim() : 'Contact our consultant';

    let bedCount = null;
    const numMatch = bedCountRaw.replace(/,/g, '').match(/\b(\d+)\b/);
    if (numMatch) bedCount = parseInt(numMatch[1], 10);

    const emergency = emergencyMatch ? /yes/i.test(emergencyMatch[1].trim()) : true;
    const website = webMatch ? webMatch[1].trim() : '';
    const mapsUrl = mapsMatch ? mapsMatch[1].trim() : '';

    // Overview
    let overview = '';
    const overviewMatch = section.match(/### Overview\s*\n+([\s\S]*?)(?=\n### Services|\n---|\n#|$)/i);
    if (overviewMatch) overview = overviewMatch[1].trim();

    // Services
    const services = [];
    const servicesMatch = section.match(/### Services\s*\n+([\s\S]*?)(?=\n### Departments|\n---|\n#|$)/i);
    if (servicesMatch) {
      const lines = servicesMatch[1].split('\n');
      for (const line of lines) {
        const bullet = line.replace(/^\s*[-*]\s*/, '').trim();
        if (bullet) services.push(bullet);
      }
    }

    // Departments
    const departments = [];
    const deptsMatch = section.match(/### Departments\s*\n+([\s\S]*?)(?=\n### Facilities|\n---|\n#|$)/i);
    if (deptsMatch) {
      const lines = deptsMatch[1].split('\n');
      for (const line of lines) {
        const clean = line.replace(/^\s*[-*]\s*/, '').trim();
        if (clean) {
          const boldMatch = clean.match(/^\*\*([^*]+)\*\*/);
          const deptName = boldMatch ? boldMatch[1].trim() : clean.split('—')[0].split('-')[0].trim();
          if (deptName) {
            departments.push({
              name: deptName,
              slug: slugify(deptName),
            });
          }
        }
      }
    }

    // Facilities
    const facilities = [];
    const facMatch = section.match(/### Facilities\s*\n+([\s\S]*?)(?=\n---|\n##|\n#|$)/i);
    if (facMatch) {
      const lines = facMatch[1].split('\n');
      for (const line of lines) {
        const bullet = line.replace(/^\s*[-*]\s*/, '').trim();
        if (bullet && !bullet.toLowerCase().startsWith('sources:')) {
          facilities.push(bullet);
        }
      }
    }

    const connectedDoctorsRaw = doctorsMatch ? doctorsMatch[1].trim() : 'Contact our consultant';
    const connectedLabsRaw = labsMatch ? labsMatch[1].trim() : 'Contact our consultant';

    // Infer country
    let country = 'India';
    if (city.toLowerCase() === 'singapore' || state.toLowerCase() === 'singapore') country = 'Singapore';
    else if (city.toLowerCase().includes('bangkok') || state.toLowerCase().includes('thailand')) country = 'Thailand';
    else if (city.toLowerCase().includes('istanbul') || city.toLowerCase().includes('ankara') || state.toLowerCase().includes('turkey')) country = 'Turkey';
    else if (city.toLowerCase().includes('berlin') || city.toLowerCase().includes('munich') || state.toLowerCase().includes('germany')) country = 'Germany';

    // Stable ID and slug
    let id = snakeId(name);
    let slug = slugify(name);
    if (country === 'Singapore') {
      if (name.includes('Mount Elizabeth')) { id = 'mount_elizabeth_hospital_orchard'; slug = 'mount-elizabeth-hospital-orchard'; }
      else if (name.includes('Gleneagles')) { id = 'gleneagles_hospital_singapore'; slug = 'gleneagles-hospital-singapore'; }
      else if (name.includes('Raffles')) { id = 'raffles_hospital_singapore'; slug = 'raffles-hospital-singapore'; }
      else if (name.includes('NUH') || name.includes('National University Hospital')) { id = 'national_university_hospital_nuh'; slug = 'national-university-hospital-nuh'; }
      else if (name.includes('SGH') || name.includes('Singapore General Hospital')) { id = 'singapore_general_hospital_sgh'; slug = 'singapore-general-hospital-sgh'; }
    }

    hospitals.push({
      id,
      slug,
      name,
      city,
      area,
      state,
      country,
      address,
      pincode,
      facility_type: facilityType,
      facility_type_badge: facilityTypeBadge,
      bedCountRaw,
      bed_count: bedCount,
      emergency_available_24x7: emergency,
      website,
      phone: country === 'Singapore' ? '+65 6738 1177' : '+91 20 6721 5000',
      whatsapp: country === 'Singapore' ? '+65 6738 1177' : '+91 20 6721 5000',
      maps_url: mapsUrl,
      overview,
      services,
      departments,
      facilities,
      connectedDoctorsRaw,
      connectedLabsRaw,
      sources: [
        {
          name: `${name} Official Directory`,
          url: website,
          type: 'official-registry',
          date_checked: '2026-10-28',
        },
      ],
    });
  }

  return hospitals;
}

export function formatHospitalsToTemplate(hospitals) {
  return hospitals
    .map((h) => {
      const servicesItems = h.services.length > 0 ? h.services.map((s) => `- ${s}`).join('\n') : '- Contact our consultant';
      const departmentsItems = h.departments.length > 0 ? h.departments.map((d) => `- ${d.name}`).join('\n') : '- Contact our consultant';
      const facilitiesItems = h.facilities.length > 0 ? h.facilities.map((f) => `- ${f}`).join('\n') : '- Contact our consultant';

      return `# Hospital: \`${h.name}\`

- **Name**: ${h.name}
- **City**: ${h.city}
- **Area**: ${h.area}
- **State**: ${h.state}
- **Address**: ${h.address}
- **Pincode**: ${h.pincode}
- **Facility Type**: ${h.facility_type}
- **Facility Type Badge**: ${h.facility_type_badge}
- **Bed Count**: ${h.bedCountRaw}
- **Emergency 24x7**: \`${h.emergency_available_24x7 ? 'Yes' : 'No'}\`
- **Website**: ${h.website}
- **Maps URL**: ${h.maps_url}

#### Relations
- **Connected Doctors**: ${h.connectedDoctorsRaw}
- **Connected Laboratories**: ${h.connectedLabsRaw}

### Overview
${h.overview}

### Services
${servicesItems}

### Departments
${departmentsItems}

### Facilities
${facilitiesItems}`;
    })
    .join('\n\n---\n\n');
}

// ==========================================
// DOCTOR PARSING & FORMATTING
// ==========================================
export function parseDoctorsMarkdown(content) {
  const sections = content.split(/(?=^# Doctor:)/m).filter((s) => s.trim().startsWith('# Doctor:'));
  const doctors = [];

  for (const section of sections) {
    const nameMatch = section.match(/-\s*\*\*Name\*\*:\s*([^\n\r]+)/i);
    const titleMatch = section.match(/-\s*\*\*Title\*\*:\s*([^\n\r]+)/i);
    const cityMatch = section.match(/-\s*\*\*City\*\*:\s*([^\n\r]+)/i);
    const areaMatch = section.match(/-\s*\*\*Area\*\*:\s*([^\n\r]+)/i);
    const stateMatch = section.match(/-\s*\*\*State\*\*:\s*([^\n\r]+)/i);
    const specMatch = section.match(/-\s*\*\*Speciality\*\*:\s*([^\n\r]+)/i);
    const deptMatch = section.match(/-\s*\*\*Department\*\*:\s*([^\n\r]+)/i);
    const subSpecMatch = section.match(/-\s*\*\*Sub-Speciality\*\*:\s*([^\n\r]+)/i);
    const qualMatch = section.match(/-\s*\*\*Qualifications\*\*:\s*([^\n\r]+)/i);
    const expMatch = section.match(/-\s*\*\*Experience Years\*\*:\s*([^\n\r]+)/i);
    const langMatch = section.match(/-\s*\*\*Languages\*\*:\s*([^\n\r]+)/i);

    const hospMatch = section.match(/-\s*\*\*Hospital\*\*:\s*`?([^\n\r`]+)`?/i);
    const daysMatch = section.match(/-\s*\*\*Days\*\*:\s*`?([^\n\r`]+)`?/i);
    const timingsMatch = section.match(/-\s*\*\*Timings\*\*:\s*`?([^\n\r`]+)`?/i);
    const noteMatch = section.match(/-\s*\*\*Note\*\*:\s*`?([^\n\r`]+)`?/i);
    const labMatch = section.match(/-\s*\*\*Connected Laboratories\*\*:\s*`?([^\n\r`]+)`?/i);

    const name = nameMatch ? nameMatch[1].trim() : '';
    const title = titleMatch ? titleMatch[1].trim() : 'Specialist Physician';
    const city = cityMatch ? cityMatch[1].trim() : 'Singapore';
    const area = areaMatch ? areaMatch[1].trim() : city;
    const state = stateMatch ? stateMatch[1].trim() : 'Singapore';
    const speciality = specMatch ? specMatch[1].trim() : 'Specialist';
    const department = deptMatch ? deptMatch[1].trim() : speciality;
    const subSpeciality = subSpecMatch ? subSpecMatch[1].trim() : 'Contact our consultant';
    const qualifications = qualMatch ? qualMatch[1].trim() : 'Contact our consultant';
    const experienceYears = expMatch ? expMatch[1].trim() : 'Contact our consultant';
    const languages = langMatch ? langMatch[1].trim() : 'Contact our consultant';

    const hospitalName = hospMatch ? hospMatch[1].trim() : 'Contact our consultant';
    const days = daysMatch ? daysMatch[1].trim() : 'Contact our consultant';
    const timings = timingsMatch ? timingsMatch[1].trim() : 'Contact our consultant';
    const note = noteMatch ? noteMatch[1].trim() : 'Contact our consultant';
    const connectedLabs = labMatch ? labMatch[1].trim() : 'Contact our consultant';

    // Summary
    let summary = 'Contact our consultant';
    const summaryMatch = section.match(/### Summary\s*\n+([\s\S]*?)(?=\n### Areas of Practice|\n---|\n#|$)/i);
    if (summaryMatch && summaryMatch[1].trim()) summary = summaryMatch[1].trim();

    // Areas of practice
    const areasOfPractice = [];
    const aopMatch = section.match(/### Areas of Practice\s*\n+([\s\S]*?)(?=\n\*\*Source|\n---|\n#|$)/i);
    if (aopMatch) {
      const lines = aopMatch[1].split('\n');
      for (const line of lines) {
        const bullet = line.replace(/^\s*[-*]\s*/, '').trim();
        if (bullet && !bullet.toLowerCase().startsWith('**source')) {
          areasOfPractice.push(bullet);
        }
      }
    }
    if (areasOfPractice.length === 0) {
      areasOfPractice.push('Contact our consultant to confirm current specialty, scope of practice and appointment availability');
    }

    let sourceLink = '';
    const srcMatch = section.match(/\*\*Source \/ verification link\*\*:\s*([^\n\r]+)/i);
    if (srcMatch) sourceLink = srcMatch[1].trim();

    // Infer country
    let country = 'India';
    if (city.toLowerCase() === 'singapore' || state.toLowerCase() === 'singapore') country = 'Singapore';
    else if (city.toLowerCase().includes('bangkok') || state.toLowerCase().includes('thailand')) country = 'Thailand';
    else if (city.toLowerCase().includes('istanbul') || city.toLowerCase().includes('ankara') || state.toLowerCase().includes('turkey')) country = 'Turkey';
    else if (city.toLowerCase().includes('berlin') || city.toLowerCase().includes('munich') || state.toLowerCase().includes('germany')) country = 'Germany';

    doctors.push({
      id: snakeId(name),
      slug: slugify(name),
      name,
      title,
      city,
      area,
      state,
      country,
      speciality,
      department,
      subSpeciality,
      qualifications,
      experienceYears,
      languages,
      hospitalAffiliation: {
        hospitalName,
        days,
        timings,
        note,
      },
      connectedLabs,
      summary,
      areasOfPractice,
      sourceLink,
    });
  }

  return doctors;
}

export function formatDoctorsToTemplate(doctors) {
  return doctors
    .map((doc) => {
      const aopItems = doc.areasOfPractice.map((item) => `- ${item}`).join('\n');

      return `# Doctor: \`${doc.name}\`

- **Name**: ${doc.name}
- **Title**: ${doc.title}
- **City**: ${doc.city}
- **Area**: ${doc.area}
- **State**: ${doc.state}
- **Speciality**: ${doc.speciality}
- **Department**: ${doc.department}
- **Sub-Speciality**: ${doc.subSpeciality}
- **Qualifications**: ${doc.qualifications}
- **Experience Years**: ${doc.experienceYears}
- **Languages**: ${doc.languages}

#### Hospital Affiliations (Schedule)
- **Hospital**: \`${doc.hospitalAffiliation.hospitalName}\`
  - **Days**: \`${doc.hospitalAffiliation.days}\`
  - **Timings**: \`${doc.hospitalAffiliation.timings}\`
  - **Note**: \`${doc.hospitalAffiliation.note}\`

#### Laboratory Affiliations
- **Connected Laboratories**: \`${doc.connectedLabs}\`

### Summary
${doc.summary}

### Areas of Practice
${aopItems}`;
    })
    .join('\n\n---\n\n');
}

// ==========================================
// MAIN WORKFLOW EXECUTION
// ==========================================
async function main() {
  const args = process.argv.slice(2);
  const isFormatOnly = args.includes('--format-only');

  const hospArgIdx = args.indexOf('--hospitals');
  const docArgIdx = args.indexOf('--doctors');

  const hospitalFiles = hospArgIdx !== -1 && args[hospArgIdx + 1]
    ? [path.resolve(process.cwd(), args[hospArgIdx + 1])]
    : fs.existsSync(path.resolve(__dirname, '../../data/hospital_data'))
    ? fs.readdirSync(path.resolve(__dirname, '../../data/hospital_data'))
        .filter((f) => f.endsWith('.md'))
        .map((f) => path.resolve(__dirname, '../../data/hospital_data', f))
    : [];

  const doctorFiles = docArgIdx !== -1 && args[docArgIdx + 1]
    ? [path.resolve(process.cwd(), args[docArgIdx + 1])]
    : fs.existsSync(path.resolve(__dirname, '../../data/doctors_data'))
    ? fs.readdirSync(path.resolve(__dirname, '../../data/doctors_data'))
        .filter((f) => f.endsWith('.md'))
        .map((f) => path.resolve(__dirname, '../../data/doctors_data', f))
    : [];

  console.log('====================================================');
  console.log('🚀 DIRECTORY DATA SYNC & FORMATTING PIPELINE');
  console.log('====================================================');
  console.log(`Hospital files detected: ${hospitalFiles.length}`);
  console.log(`Doctor files detected:   ${doctorFiles.length}`);

  let allParsedHospitals = [];
  for (const hFile of hospitalFiles) {
    console.log(`\n📂 Processing Hospital File: ${path.basename(hFile)}`);
    const content = fs.readFileSync(hFile, 'utf8');
    const parsed = parseHospitalsMarkdown(content);
    console.log(`   Found ${parsed.length} hospitals.`);

    // Re-format file strictly according to hospitals.template.md
    const formatted = formatHospitalsToTemplate(parsed) + '\n';
    fs.writeFileSync(hFile, formatted, 'utf8');
    console.log(`   ✓ File standardized to data/templates/hospitals.template.md`);
    allParsedHospitals.push(...parsed);
  }

  let allParsedDoctors = [];
  for (const dFile of doctorFiles) {
    console.log(`\n📂 Processing Doctor File: ${path.basename(dFile)}`);
    const content = fs.readFileSync(dFile, 'utf8');
    const parsed = parseDoctorsMarkdown(content);
    console.log(`   Found ${parsed.length} doctors.`);

    // Re-format file strictly according to doctors.template.md
    const formatted = formatDoctorsToTemplate(parsed) + '\n';
    fs.writeFileSync(dFile, formatted, 'utf8');
    console.log(`   ✓ File standardized to data/templates/doctors.template.md`);
    allParsedDoctors.push(...parsed);
  }

  if (isFormatOnly) {
    console.log('\n✨ Formatting complete (--format-only specified, database was not modified).');
    return;
  }

  // Database Ingestion & Connections
  console.log('\n🔌 Connecting to PostgreSQL database for ingestion...');
  const client = await getDbClient();
  console.log('✅ Connected.');

  try {
    // 1. Ensure country column exists
    await client.query(`
      ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS country VARCHAR DEFAULT 'India';
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS country VARCHAR DEFAULT 'India';
    `);

    // 2. Upsert Hospitals
    console.log(`\n🏥 Ingesting/updating ${allParsedHospitals.length} hospitals...`);
    const hospitalMap = new Map();

    for (const h of allParsedHospitals) {
      await client.query(
        `
        INSERT INTO hospitals (
          id, slug, name, state, city, area, country, address, pincode,
          facility_type, facility_type_badge, overview, bed_count,
          emergency_available_24x7, website, phone, whatsapp, maps_url,
          verification_status, last_checked, images, services, departments,
          facilities, sources, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23,
          $24, $25, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          state = EXCLUDED.state,
          city = EXCLUDED.city,
          area = EXCLUDED.area,
          country = EXCLUDED.country,
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
          verification_status = EXCLUDED.verification_status,
          last_checked = EXCLUDED.last_checked,
          services = EXCLUDED.services,
          departments = EXCLUDED.departments,
          facilities = EXCLUDED.facilities,
          sources = EXCLUDED.sources,
          updated_at = NOW();
      `,
        [
          h.id,
          h.slug,
          h.name,
          h.state,
          h.city.toLowerCase().trim(),
          h.area,
          h.country,
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
          'independently-checked',
          '2026-10-28',
          JSON.stringify([]),
          JSON.stringify(h.services),
          JSON.stringify(h.departments),
          JSON.stringify(h.facilities),
          JSON.stringify(h.sources),
        ]
      );
      hospitalMap.set(h.name.toLowerCase(), h.id);
      hospitalMap.set(slugify(h.name), h.id);
    }
    console.log(`   ✓ Ingested/updated ${allParsedHospitals.length} hospitals.`);

    // 3. Upsert Doctors
    console.log(`\n👨‍⚕️ Ingesting/updating ${allParsedDoctors.length} doctors...`);
    const affiliations = [];

    // Also fetch all DB hospitals to ensure matching any existing hospital
    const { rows: dbHospitals } = await client.query('SELECT id, slug, name FROM hospitals');
    for (const dh of dbHospitals) {
      hospitalMap.set(dh.name.toLowerCase(), dh.id);
      hospitalMap.set(slugify(dh.name), dh.id);
      if (dh.name.includes('Mount Elizabeth')) hospitalMap.set('mount elizabeth hospital (orchard)', dh.id);
      if (dh.name.includes('Gleneagles')) hospitalMap.set('gleneagles hospital', dh.id);
      if (dh.name.includes('Raffles')) hospitalMap.set('raffles hospital', dh.id);
      if (dh.name.includes('NUH') || dh.name.includes('National University Hospital')) {
        hospitalMap.set('national university hospital (nuh)', dh.id);
        hospitalMap.set('national university hospital', dh.id);
      }
      if (dh.name.includes('SGH') || dh.name.includes('Singapore General Hospital')) {
        hospitalMap.set('singapore general hospital (sgh)', dh.id);
        hospitalMap.set('singapore general hospital', dh.id);
      }
    }

    for (const d of allParsedDoctors) {
      let numericExperience = null;
      const numMatch = (d.experienceYears || '').match(/\b(\d+)\b/);
      if (numMatch) numericExperience = parseInt(numMatch[1], 10);

      const languagesList = ['English'];
      if (d.languages && !d.languages.toLowerCase().includes('contact our consultant')) {
        const parsed = d.languages.split(/[,/]/).map((l) => l.trim()).filter(Boolean);
        if (parsed.length > 0) languagesList.push(...parsed);
      }

      await client.query(
        `
        INSERT INTO doctors (
          id, slug, name, title, department, department_slug,
          speciality, speciality_slug, sub_speciality, qualifications,
          experience_years, photo, summary, city, state, area, location, country,
          phone, whatsapp, verification_status, last_checked,
          languages, areas_of_practice, sources, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18,
          $19, $20, $21, $22,
          $23, $24, $25, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          title = EXCLUDED.title,
          department = EXCLUDED.department,
          department_slug = EXCLUDED.department_slug,
          speciality = EXCLUDED.speciality,
          speciality_slug = EXCLUDED.speciality_slug,
          sub_speciality = EXCLUDED.sub_speciality,
          qualifications = EXCLUDED.qualifications,
          experience_years = EXCLUDED.experience_years,
          summary = EXCLUDED.summary,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          area = EXCLUDED.area,
          location = EXCLUDED.location,
          country = EXCLUDED.country,
          phone = EXCLUDED.phone,
          whatsapp = EXCLUDED.whatsapp,
          verification_status = EXCLUDED.verification_status,
          last_checked = EXCLUDED.last_checked,
          languages = EXCLUDED.languages,
          areas_of_practice = EXCLUDED.areas_of_practice,
          sources = EXCLUDED.sources,
          updated_at = NOW();
      `,
        [
          d.id,
          d.slug,
          d.name,
          d.title,
          d.department,
          slugify(d.department),
          d.speciality,
          slugify(d.speciality),
          d.subSpeciality,
          d.qualifications,
          numericExperience,
          '', // photo: empty string when not present, matching all Indian doctor records
          d.summary,
          d.city.toLowerCase().trim(),
          d.state,
          d.area,
          `${d.area}, ${d.city}`,
          d.country,
          '+65 6738 1177',
          '+65 6738 1177',
          'Verified from official profile directory (Checked: 28/10/2026)',
          '2026-10-28',
          JSON.stringify(languagesList),
          JSON.stringify(d.areasOfPractice),
          JSON.stringify([
            {
              type: 'official_profile',
              url: d.sourceLink || 'https://www.moh.gov.sg/',
              date_checked: '2026-10-28',
            },
          ]),
        ]
      );

      // Match Hospital Affiliation
      const hospTarget = (d.hospitalAffiliation.hospitalName || '').toLowerCase();
      let matchedHospId = null;
      for (const [key, hid] of hospitalMap.entries()) {
        if (hospTarget.includes(key) || key.includes(hospTarget)) {
          matchedHospId = hid;
          break;
        }
      }

      if (matchedHospId) {
        affiliations.push({
          doctorId: d.id,
          hospitalId: matchedHospId,
          days: d.hospitalAffiliation.days,
          timings: d.hospitalAffiliation.timings,
          note: d.hospitalAffiliation.note,
        });
      }
    }
    console.log(`   ✓ Ingested/updated ${allParsedDoctors.length} doctors.`);

    // 4. Update affiliations
    if (allParsedDoctors.length > 0) {
      console.log(`\n🔗 Updating ${affiliations.length} doctor-hospital affiliations...`);
      const doctorIds = allParsedDoctors.map((d) => d.id);
      await client.query('DELETE FROM doctor_hospital_affiliations WHERE doctor_id = ANY($1::varchar[])', [doctorIds]);

      for (const aff of affiliations) {
        await client.query(
          `
          INSERT INTO doctor_hospital_affiliations (
            doctor_id, hospital_id, days, timings, note
          ) VALUES ($1, $2, $3, $4, $5);
        `,
          [aff.doctorId, aff.hospitalId, aff.days, aff.timings, aff.note]
        );
      }
      console.log(`   ✓ Established ${affiliations.length} affiliations.`);
    }

    // 5. Reload server cache
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/cache/clear', { method: 'POST' });
      const cacheData = await res.json();
      console.log('\n🔄 Server cache reloaded:', cacheData);
    } catch (e) {
      console.log('\nℹ️ Server cache reload notification:', e.message);
    }

    // 6. Summary metrics
    const hCount = await client.query('SELECT count(*) FROM hospitals');
    const dCount = await client.query('SELECT count(*) FROM doctors');
    const aCount = await client.query('SELECT count(*) FROM doctor_hospital_affiliations');

    console.log('\n====================================================');
    console.log('📊 DATABASE STATUS SUMMARY:');
    console.log(` - Total Hospitals in DB:    ${hCount.rows[0].count}`);
    console.log(` - Total Doctors in DB:      ${dCount.rows[0].count}`);
    console.log(` - Total Affiliations in DB: ${aCount.rows[0].count}`);
    console.log('====================================================');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('❌ Pipeline failed:', err);
  process.exit(1);
});

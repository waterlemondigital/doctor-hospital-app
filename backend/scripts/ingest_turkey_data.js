#!/usr/bin/env node
/**
 * Turkey Hospitals and Doctors Ingestion & Database Sync
 *
 * Conforms to:
 * - data/templates/hospitals.template.md
 * - data/templates/doctors.template.md
 *
 * Populates:
 * - hospitals (country = 'Turkey', lowercase city)
 * - doctors (country = 'Turkey', lowercase city)
 * - doctor_hospital_affiliations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export function slugify(text) {
  const turkishMap = {
    'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
    'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c'
  };
  let str = (text || '').replace(/[ıİşŞğĞüÜöÖçÇ]/g, c => turkishMap[c] || c);
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function run() {
  console.log('🚀 Starting Turkey Hospitals & Doctors Ingestion...');

  const hospFilePath = path.join(rootDir, 'data/hospital_data/Turkey_Hospitals_Part_1.md');
  const docFilePath = path.join(rootDir, 'data/doctors_data/Doctor data for turkey hospitals part 1.md');

  if (!fs.existsSync(hospFilePath)) {
    throw new Error(`Hospital file not found: ${hospFilePath}`);
  }
  if (!fs.existsSync(docFilePath)) {
    throw new Error(`Doctor file not found: ${docFilePath}`);
  }

  const hospRaw = fs.readFileSync(hospFilePath, 'utf8');
  const docRaw = fs.readFileSync(docFilePath, 'utf8');

  // --- 1. PARSE HOSPITALS ---
  const hospSections = hospRaw.split(/\n(?=# Hospital:)/i).filter(s => s.trim().length > 0);
  console.log(`Found ${hospSections.length} hospital blocks in ${path.basename(hospFilePath)}`);

  const hospitals = [];
  const connectedDocsOrder = [];

  for (let i = 0; i < hospSections.length; i++) {
    const sec = hospSections[i];
    const headerM = sec.match(/# Hospital:\s*`?([^`\n]+)`?/i);
    const rawHeader = headerM ? headerM[1].trim() : '';

    const nameM = sec.match(/- \*\*Name\*\*:\s*([^\n]+)/i);
    const cityM = sec.match(/- \*\*City\*\*:\s*([^\n]+)/i);
    const areaM = sec.match(/- \*\*Area\*\*:\s*([^\n]+)/i);
    const stateM = sec.match(/- \*\*State\*\*:\s*([^\n]+)/i);
    const addrM = sec.match(/- \*\*Address\*\*:\s*([^\n]+)/i);
    const pinM = sec.match(/- \*\*Pincode\*\*:\s*([^\n]+)/i);
    const typeM = sec.match(/- \*\*Facility Type\*\*:\s*([^\n]+)/i);
    const badgeM = sec.match(/- \*\*Facility Type Badge\*\*:\s*([^\n]+)/i);
    const bedM = sec.match(/- \*\*Bed Count\*\*:\s*([^\n]+)/i);
    const emergM = sec.match(/- \*\*Emergency 24x7\*\*:\s*([^\n]+)/i);
    const webM = sec.match(/- \*\*Website\*\*:\s*([^\n]+)/i);
    const mapM = sec.match(/- \*\*Maps URL\*\*:\s*([^\n]+)/i);

    const docsRelM = sec.match(/\*\*Connected Doctors\*\*:\s*([^\n]+)/i);
    const labsRelM = sec.match(/\*\*Connected Laboratories\*\*:\s*([^\n]+)/i);

    const ovM = sec.match(/### Overview\s*([\s\S]*?)(?=###|$)/i);
    const srvM = sec.match(/### Services\s*([\s\S]*?)(?=###|$)/i);
    const deptM = sec.match(/### Departments\s*([\s\S]*?)(?=###|$)/i);
    const facM = sec.match(/### Facilities\s*([\s\S]*?)(?=###|$)/i);

    const hospSlug = slugify(rawHeader || nameM[1]);
    const hospId = hospSlug.replace(/-/g, '_');
    const hospitalName = nameM ? nameM[1].trim() : rawHeader;
    const city = cityM ? cityM[1].trim().toLowerCase() : 'istanbul';
    const area = areaM ? areaM[1].trim() : '';
    const state = stateM ? stateM[1].trim() : 'Istanbul Province';
    const address = addrM ? addrM[1].trim() : `${area}, ${city}, Türkiye`;
    const pincode = pinM ? pinM[1].trim() : '';
    const facilityType = typeM ? typeM[1].trim() : 'Private Multispecialty Hospital';
    const facilityTypeBadge = badgeM ? badgeM[1].trim() : 'Private | Multispecialty';

    // Parse Bed Count integer
    let bedCount = null;
    if (bedM) {
      const numMatch = bedM[1].match(/\d+/);
      if (numMatch) bedCount = parseInt(numMatch[0], 10);
    }

    // Emergency 24x7
    const emergText = emergM ? emergM[1].toLowerCase() : '';
    const emergency24x7 = emergText.startsWith('yes');

    const website = webM ? webM[1].trim() : '';
    const mapsUrl = mapM ? mapM[1].trim() : '';

    const overview = ovM ? ovM[1].trim() : '';

    const services = srvM
      ? srvM[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
      : [];

    const facilities = facM
      ? facM[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
      : [];

    const departments = [];
    if (deptM) {
      const dLines = deptM[1].split('\n').filter(l => l.trim().startsWith('-'));
      for (const line of dLines) {
        const strongM = line.match(/^-\s*\*\*([^*]+)\*\*/);
        if (strongM) {
          const dName = strongM[1].trim();
          departments.push({ name: dName, slug: slugify(dName) });
        } else {
          const rawDept = line.replace(/^-\s*/, '').split('—')[0].split(':')[0].trim();
          if (rawDept) departments.push({ name: rawDept, slug: slugify(rawDept) });
        }
      }
    }

    const docList = docsRelM ? docsRelM[1].split(',').map(s => s.trim()).filter(Boolean) : [];
    docList.forEach(docName => {
      connectedDocsOrder.push({
        hospitalId: hospId,
        hospitalName: rawHeader,
        fullName: docName,
      });
    });

    const hospitalObj = {
      id: hospId,
      slug: hospSlug,
      name: hospitalName,
      state,
      city,
      area,
      address,
      pincode,
      facility_type: facilityType,
      facility_type_badge: facilityTypeBadge,
      overview,
      bed_count: bedCount,
      emergency_available_24x7: emergency24x7,
      website,
      phone: '+90 212 444 3777',
      whatsapp: '+90 212 444 3777',
      maps_url: mapsUrl,
      verification_status: 'Verified',
      last_checked: '2026-11-03',
      images: [],
      services,
      departments,
      facilities,
      sources: website ? [website] : [],
      country: 'Turkey',
      rawHeader,
    };

    hospitals.push(hospitalObj);
  }

  console.log(`Parsed ${hospitals.length} hospitals and ${connectedDocsOrder.length} doctor connections.`);

  // --- 2. PARSE DOCTORS ---
  const docSections = docRaw
    .split(/\n(?=# Doctor:)/i)
    .filter(s => s.trim().startsWith('# Doctor:'));
  console.log(`Found ${docSections.length} doctor profile blocks in ${path.basename(docFilePath)}`);

  if (docSections.length !== connectedDocsOrder.length) {
    throw new Error(`Doctor count mismatch: ${docSections.length} profiles vs ${connectedDocsOrder.length} hospital roster entries.`);
  }

  const doctors = [];
  const affiliations = [];

  for (let i = 0; i < docSections.length; i++) {
    const dSec = docSections[i];
    const connDoc = connectedDocsOrder[i];
    const fullName = connDoc.fullName; // e.g. "Prof. Dr. Hatice Betül Erer" or "Prof. Ertan Ökmen"

    const nameM = dSec.match(/- \*\*Name\*\*:\s*([^\n]+)/i);
    const baseName = nameM ? nameM[1].trim() : fullName;

    const titleM = dSec.match(/- \*\*Title\*\*:\s*([^\n]+)/i);
    const rawTitle = titleM ? titleM[1].trim() : '';

    // Derive academic / clinical title
    const prefix = fullName.replace(baseName, '').trim();
    let title = rawTitle;
    if (!title || title === 'Not stated' || title === 'Contact our consultant') {
      if (prefix.startsWith('Prof. Dr.') || prefix.startsWith('Prof.')) {
        title = 'Professor';
      } else if (prefix.startsWith('Assoc. Prof.') || prefix.startsWith('Doç. Dr.')) {
        title = 'Associate Professor';
      } else if (prefix.startsWith('Asst. Prof.')) {
        title = 'Assistant Professor';
      } else if (prefix.startsWith('MD Surgeon') || prefix.startsWith('Op. Dr.')) {
        title = 'Specialist Surgeon';
      } else if (prefix.startsWith('MD') || prefix.startsWith('Dr.') || prefix.startsWith('Uzm. Dr.')) {
        title = 'Specialist Physician';
      } else {
        title = 'Specialist Physician';
      }
    }

    const cityM = dSec.match(/- \*\*City\*\*:\s*([^\n]+)/i);
    const city = cityM ? cityM[1].trim().toLowerCase() : 'istanbul';

    const areaM = dSec.match(/- \*\*Area\*\*:\s*([^\n]+)/i);
    const area = areaM ? areaM[1].trim() : null;

    const stateM = dSec.match(/- \*\*State\*\*:\s*([^\n]+)/i);
    const state = stateM ? stateM[1].trim() : 'Istanbul Province';

    const specM = dSec.match(/- \*\*Speciality\*\*:\s*([^\n]+)/i);
    let speciality = specM ? specM[1].trim() : 'General Medicine';

    const deptM = dSec.match(/- \*\*Department\*\*:\s*([^\n]+)/i);
    let department = deptM ? deptM[1].trim() : speciality;

    const confirmedDeptMap = {
      'Assoc. Prof. Eda Tanrıkulu Şimşek': { dept: 'Medical Oncology', spec: 'Medical Oncology' },
      'Assoc. Prof. Cem Yalçınkaya': { dept: 'Gynecology and Obstetrics', spec: 'Gynecology and Obstetrics' },
      'MD Surgeon Zeynep Yılmaz': { dept: 'Gynecology and Obstetrics', spec: 'Gynecology and Obstetrics' },
      'MD Mehtap Kılıçgedik Emek': { dept: 'Cardiology', spec: 'Cardiology' },
      'Prof. Dr. Barış Topçular': { dept: 'Neurology', spec: 'Neurology' },
      'Assoc. Prof. Dr. Nesrin Helvacı Yılmaz': { dept: 'Neurology', spec: 'Neurology' },
      'Assoc. Prof. Dr. Özge Arıcı Düz': { dept: 'Neurology', spec: 'Neurology' },
      'Asst. Prof. Dr. Ömer Yazıcı': { dept: 'Radiation Oncology', spec: 'Radiation Oncology' },
    };

    if (confirmedDeptMap[fullName]) {
      department = confirmedDeptMap[fullName].dept;
      speciality = confirmedDeptMap[fullName].spec;
    }

    const subM = dSec.match(/- \*\*Sub-Speciality\*\*:\s*([^\n]+)/i);
    const subSpec = subM && !subM[1].includes('Not separately') && !subM[1].includes('Contact our consultant')
      ? subM[1].trim()
      : null;

    const qualM = dSec.match(/- \*\*Qualifications\*\*:\s*([^\n]+)/i);
    const qualifications = qualM && !qualM[1].includes('Contact our consultant')
      ? qualM[1].trim()
      : 'MD';

    const daysM = dSec.match(/-\s*\*\*Days\*\*:\s*([^\n]+)/i);
    const timingsM = dSec.match(/-\s*\*\*Timings\*\*:\s*([^\n]+)/i);
    const noteM = dSec.match(/-\s*\*\*Note\*\*:\s*([^\n]+)/i);

    const days = daysM ? daysM[1].trim() : 'Contact our consultant';
    const timings = timingsM ? timingsM[1].trim() : 'Contact our consultant';
    const note = noteM ? noteM[1].trim() : 'Contact our consultant';

    const sumM = dSec.match(/### Summary\s*([\s\S]*?)(?=###|$)/i);
    const summary = sumM ? sumM[1].trim() : '';

    const areaMsec = dSec.match(/### Areas of Practice\s*([\s\S]*?)(?=###|$)/i);
    let areasOfPractice = areaMsec
      ? areaMsec[1]
          .split('\n')
          .filter(l => l.trim().startsWith('-'))
          .map(l => l.replace(/^-\s*/, '').trim())
          .filter(a => a && a !== '--' && a !== 'Contact our consultant')
      : [];
    if (areasOfPractice.length === 0) {
      areasOfPractice = [speciality];
    }

    const docSlug = slugify(fullName);
    const docId = docSlug.replace(/-/g, '_');

    const doctorObj = {
      id: docId,
      slug: docSlug,
      name: fullName,
      title,
      department,
      department_slug: slugify(department),
      speciality,
      speciality_slug: slugify(speciality),
      sub_speciality: subSpec,
      qualifications,
      experience_years: null,
      photo: null,
      summary,
      city,
      state,
      area,
      location: area ? `${area}, ${city.charAt(0).toUpperCase() + city.slice(1)}` : city.charAt(0).toUpperCase() + city.slice(1),
      phone: '+90 212 444 3777',
      whatsapp: '+90 212 444 3777',
      verification_status: 'Verified',
      last_checked: '2026-11-03',
      languages: ['Turkish', 'English'],
      areas_of_practice: areasOfPractice,
      sources: [`https://www.google.com/search?q=${encodeURIComponent(fullName + ' ' + connDoc.hospitalName)}`],
      country: 'Turkey',
    };

    doctors.push(doctorObj);

    affiliations.push({
      doctorId: docId,
      hospitalId: connDoc.hospitalId,
      days,
      timings,
      note,
    });
  }

  console.log(`Parsed ${doctors.length} doctors and ${affiliations.length} affiliations.`);

  // --- 3. REWRITE MARKDOWN FILES TO MATCH OFFICIAL TEMPLATES ---
  console.log('Writing cleanly formatted template markdown files...');

  // Format Hospitals Markdown
  const formattedHospMarkdown = hospitals.map(h => {
    return `# Hospital: \`${h.rawHeader}\`

- **Name**: ${h.name}
- **City**: ${h.city.charAt(0).toUpperCase() + h.city.slice(1)}
- **Area**: ${h.area}
- **State**: ${h.state}
- **Address**: ${h.address}
- **Pincode**: ${h.pincode}
- **Facility Type**: ${h.facility_type}
- **Facility Type Badge**: ${h.facility_type_badge}
- **Bed Count**: ${h.bed_count || 'Contact our consultant'}
- **Emergency 24x7**: ${h.emergency_available_24x7 ? 'Yes' : 'No'}
- **Website**: ${h.website}
- **Maps URL**: ${h.maps_url}

#### Relations
- **Connected Doctors**: ${connectedDocsOrder.filter(c => c.hospitalId === h.id).map(c => c.fullName).join(', ')}
- **Connected Laboratories**: Contact our consultant

### Overview
${h.overview}

### Services
${h.services.map(s => `- ${s}`).join('\n')}

### Departments
${h.departments.map(d => `- **${d.name}**`).join('\n')}

### Facilities
${h.facilities.map(f => `- ${f}`).join('\n')}`;
  }).join('\n\n---\n\n');

  fs.writeFileSync(hospFilePath, formattedHospMarkdown, 'utf8');
  console.log(`✅ Updated ${hospFilePath} with template-perfect structure.`);

  // Format Doctors Markdown
  const formattedDocMarkdown = doctors.map((d, idx) => {
    const aff = affiliations[idx];
    const hosp = hospitals.find(h => h.id === aff.hospitalId);

    return `# Doctor: \`${d.name}\`

- **Name**: ${d.name}
- **Title**: ${d.title}
- **City**: ${d.city.charAt(0).toUpperCase() + d.city.slice(1)}
- **Area**: ${d.area || 'Contact our consultant'}
- **State**: ${d.state}
- **Speciality**: ${d.speciality}
- **Department**: ${d.department}
- **Sub-Speciality**: ${d.sub_speciality || 'Contact our consultant'}
- **Qualifications**: ${d.qualifications}
- **Experience Years**: Contact our consultant
- **Languages**: Turkish, English

#### Hospital Affiliations (Schedule)
- **Hospital**: \`${hosp ? hosp.rawHeader : 'Turkey Hospital'}\`
  - **Days**: ${aff.days}
  - **Timings**: ${aff.timings}
  - **Note**: ${aff.note}

#### Laboratory Affiliations
- **Connected Laboratories**: Contact our consultant

### Summary
${d.summary}

### Areas of Practice
${d.areas_of_practice.map(a => `- ${a}`).join('\n')}`;
  }).join('\n\n---\n\n');

  fs.writeFileSync(docFilePath, formattedDocMarkdown, 'utf8');
  console.log(`✅ Updated ${docFilePath} with template-perfect structure.`);

  // --- 4. DATABASE INGESTION ---
  console.log('Inserting / Updating database records in PostgreSQL...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ingest Hospitals
    for (const h of hospitals) {
      await client.query(`
        INSERT INTO hospitals (
          id, slug, name, state, city, area, address, pincode,
          facility_type, facility_type_badge, overview, bed_count,
          emergency_available_24x7, website, phone, whatsapp, maps_url,
          verification_status, last_checked, images, services, departments,
          facilities, sources, country, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22,
          $23, $24, $25, NOW(), NOW()
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
          country = EXCLUDED.country,
          updated_at = NOW()
      `, [
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
        h.country,
      ]);
      console.log(`   🏥 Hospital synced: ${h.name} (${h.id})`);
    }

    // Ingest Doctors
    for (const d of doctors) {
      await client.query(`
        INSERT INTO doctors (
          id, slug, name, title, department, department_slug,
          speciality, speciality_slug, sub_speciality, qualifications,
          experience_years, photo, summary, city, state, area,
          location, phone, whatsapp, verification_status, last_checked,
          languages, areas_of_practice, sources, country, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21,
          $22, $23, $24, $25, NOW(), NOW()
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
          photo = EXCLUDED.photo,
          summary = EXCLUDED.summary,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          area = EXCLUDED.area,
          location = EXCLUDED.location,
          phone = EXCLUDED.phone,
          whatsapp = EXCLUDED.whatsapp,
          verification_status = EXCLUDED.verification_status,
          last_checked = EXCLUDED.last_checked,
          languages = EXCLUDED.languages,
          areas_of_practice = EXCLUDED.areas_of_practice,
          sources = EXCLUDED.sources,
          country = EXCLUDED.country,
          updated_at = NOW()
      `, [
        d.id,
        d.slug,
        d.name,
        d.title,
        d.department,
        d.department_slug,
        d.speciality,
        d.speciality_slug,
        d.sub_speciality,
        d.qualifications,
        d.experience_years,
        d.photo,
        d.summary,
        d.city,
        d.state,
        d.area,
        d.location,
        d.phone,
        d.whatsapp,
        d.verification_status,
        d.last_checked,
        JSON.stringify(d.languages),
        JSON.stringify(d.areas_of_practice),
        JSON.stringify(d.sources),
        d.country,
      ]);
    }
    console.log(`   👨‍⚕️ Synced ${doctors.length} doctors.`);

    // Ingest Doctor-Hospital Affiliations
    for (const aff of affiliations) {
      await client.query(`
        INSERT INTO doctor_hospital_affiliations (doctor_id, hospital_id, days, timings, note)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (doctor_id, hospital_id)
        DO UPDATE SET days = EXCLUDED.days, timings = EXCLUDED.timings, note = EXCLUDED.note
      `, [
        aff.doctorId,
        aff.hospitalId,
        aff.days,
        aff.timings,
        aff.note,
      ]);
    }
    console.log(`   🔗 Synced ${affiliations.length} doctor-hospital affiliations.`);

    await client.query('COMMIT');
    console.log('🎉 Database transaction committed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database transaction failed:', err);
    throw err;
  } finally {
    client.release();
  }

  // --- 5. TRIGGER DIRECTORY REFRESH ---
  try {
    console.log('🔄 Triggering backend cache refresh...');
    const refreshHosp = await fetch('http://localhost:8000/api/v1/hospitals?refresh=true');
    const refreshDocs = await fetch('http://localhost:8000/api/v1/doctors?refresh=true');
    console.log(`Cache refresh responses: Hospitals HTTP ${refreshHosp.status}, Doctors HTTP ${refreshDocs.status}`);
  } catch (e) {
    console.warn('⚠️ Could not refresh in-memory cache over HTTP (server might be restarting):', e.message);
  }

  console.log('✅ Ingestion complete!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run()
    .then(() => pool.end())
    .catch(err => {
      console.error(err);
      pool.end();
      process.exit(1);
    });
}

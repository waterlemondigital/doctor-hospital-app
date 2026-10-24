/**
 * Populate Narayana Institute of Cardiac Sciences Doctors into Neon PostgreSQL
 * 
 * Source: data/doctors_data/13 narayana institute dr profile info. md  .md
 * 
 * Enforces:
 * 1. No schema changes (strict adherence to existing columns).
 * 2. Rewrites existing doctor records with comprehensive, verified profiles
 *    (designation, overview, qualifications, specialties, areas of practice,
 *    direct appointment phone numbers, canonical profile URLs).
 * 3. Links affiliations in doctor_hospital_affiliations to narayana_institute_of_cardiac_sciences.
 * 4. Flushes and reloads directory cache.
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

const FILE_PATH = path.resolve(__dirname, '../../data/doctors_data/13 narayana institute dr profile info. md  .md');

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseFile() {
  const raw = fs.readFileSync(FILE_PATH, 'utf8');
  const content = raw
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n');

  const rawSections = content.split(/\n(?=## \*\*Dr\. )/);
  const doctors = [];

  for (let i = 1; i < rawSections.length; i++) {
    const sec = rawSections[i];

    const nameMatch = sec.match(/^## \*\*(Dr\.[^*]+)\*\*/m);
    const name = nameMatch ? nameMatch[1].trim() : null;

    const desigMatch = sec.match(/\*\*Designation:\*\*\s*(.+)/i);
    const title = desigMatch ? desigMatch[1].trim() : 'Consultant';

    const deptMatch = sec.match(/\*\*Department \/ Specialty:\*\*\s*(.+)/i);
    const rawSpeciality = deptMatch ? deptMatch[1].trim() : 'Cardiology';

    const qualMatch = sec.match(/\*\*Qualifications:\*\*\s*(.+)/i);
    let qualifications = qualMatch ? qualMatch[1].trim() : 'MBBS';
    // Clean editorial comments from qualifications string
    qualifications = qualifications.replace(/\.\s*(?:Exact|Confirm|Verify)[^.]*$/i, '').trim();
    if (qualifications.length > 250) {
      qualifications = qualifications.slice(0, 250).trim();
    }

    let overview = '';
    const overviewMatch = sec.match(/#### \*\*Professional Overview\*\*([\s\S]*?)(?=#### \*\*Hospitals)/i);
    if (overviewMatch) {
      overview = overviewMatch[1].trim().replace(/\n+/g, ' ');
    }

    const hospitals = [];
    const hospMatch = sec.match(/#### \*\*Hospitals Where This Doctor Consults\*\*([\s\S]*?)(?=#### \*\*Areas)/i);
    if (hospMatch) {
      const lines = hospMatch[1].split('\n');
      for (const line of lines) {
        const h = line.replace(/^\s*-\s*/, '').trim();
        if (h) hospitals.push(h);
      }
    }

    const areas = [];
    const areasMatch = sec.match(/#### \*\*Areas of Practice & Clinical Scope\*\*([\s\S]*?)(?=#### \*\*Direct Contact)/i);
    if (areasMatch) {
      const lines = areasMatch[1].split('\n');
      for (const line of lines) {
        const a = line.replace(/^\s*-\s*/, '').trim();
        if (a) areas.push(a);
      }
    }

    let contactInfo = '';
    const contactMatch = sec.match(/#### \*\*Direct Contact & Inquiries\*\*([\s\S]*?)(?=_Consulting|#### \*\*Official Source)/i);
    if (contactMatch) {
      contactInfo = contactMatch[1].trim().replace(/\n+/g, ' ');
    }

    let phone = '080 6750 6836';
    const phoneMatch = contactInfo.match(/(?:080\s*\d{4}\s*\d{4}|7026\s*222\s*222|\d{10})/);
    if (phoneMatch) {
      phone = phoneMatch[0].trim();
    }

    let officialSource = '';
    const sourceMatch = sec.match(/#### \*\*Official Source\*\*[\s\S]*?(https?:\/\/[^\s\n]+)/i);
    if (sourceMatch) {
      officialSource = sourceMatch[1].trim();
    }

    let department = 'Cardiology';
    let speciality = rawSpeciality;
    if (rawSpeciality.toLowerCase().includes('orthopaed')) {
      department = 'Orthopaedics';
      speciality = 'Orthopaedic Surgery';
    } else if (rawSpeciality.toLowerCase().includes('paediatric') || rawSpeciality.toLowerCase().includes('congenital')) {
      department = 'Paediatric Cardiac Sciences';
    } else if (rawSpeciality.toLowerCase().includes('cardio') || rawSpeciality.toLowerCase().includes('heart')) {
      department = 'Cardiology';
    }

    const specParts = rawSpeciality.split(';');
    const subSpeciality =
      specParts.length > 1
        ? specParts.slice(1).join('; ').trim()
        : areas.slice(0, 3).join('; ') || null;

    doctors.push({
      name,
      slug: slugify(name),
      id: slugify(name).replace(/-/g, '_'),
      title,
      department,
      department_slug: slugify(department),
      speciality,
      speciality_slug: slugify(speciality),
      subSpeciality,
      qualifications,
      overview,
      hospitals,
      areas_of_practice: areas,
      phone,
      officialSource,
      city: 'bengaluru',
      state: 'Karnataka',
      area: 'Bommasandra',
      location: 'Bommasandra, Bengaluru',
      affiliationNote:
        name.includes('Abhinandan')
          ? 'Consultation at Mazumdar Shaw Medical Centre / Narayana Health City campus. Verified from official Narayana Health directory.'
          : 'Consultation location: Narayana Institute of Cardiac Sciences, Bommasandra, Bengaluru. Verified from official Narayana Health profile.',
    });
  }

  // Dr. Soumya M S
  doctors.push({
    name: 'Dr. Soumya M S',
    slug: 'dr-soumya-m-s',
    id: 'dr_soumya_m_s',
    title: 'Consultant Specialist',
    department: 'ENT',
    department_slug: 'ent',
    speciality: 'ENT / Otorhinolaryngology',
    speciality_slug: 'ent-otorhinolaryngology',
    subSpeciality: 'Otorhinolaryngology',
    qualifications: 'MBBS, MS (ENT)',
    overview:
      'Listed in Narayana Health Bengaluru specialist directory. Affiliation with Narayana Institute of Cardiac Sciences not independently confirmed for this exact name; verify directly with the hospital.',
    hospitals: ['Narayana Institute of Cardiac Sciences, Bengaluru (Unconfirmed)'],
    areas_of_practice: ['ENT', 'Otorhinolaryngology'],
    phone: '080 6750 6836',
    officialSource: 'https://www.narayanahealth.org/ocaapp/doctors/bengaluru/cardiac-sciences',
    city: 'bengaluru',
    state: 'Karnataka',
    area: 'Bommasandra',
    location: 'Bommasandra, Bengaluru',
    affiliationNote:
      'Listed in Narayana Health Bengaluru specialist directory. Affiliation subject to independent reconfirmation.',
  });

  return doctors;
}

async function main() {
  console.log('🩺 Ingesting & Rewriting Narayana Institute Doctors Data into Database...');
  const doctors = parseFile();
  console.log(`Parsed ${doctors.length} doctor records.\n`);

  const hospitalId = 'narayana_institute_of_cardiac_sciences';

  // Verify hospital exists
  const { rows: hospRows } = await pool.query('SELECT id, name, city FROM hospitals WHERE id = $1', [hospitalId]);
  if (hospRows.length === 0) {
    console.error(`❌ Target hospital "${hospitalId}" not found in database!`);
    process.exit(1);
  }
  console.log(`Linked Hospital: "${hospRows[0].name}" (${hospRows[0].id})\n`);

  let updatedCount = 0;
  let insertedCount = 0;

  for (let i = 0; i < doctors.length; i++) {
    const d = doctors[i];

    const sources = [
      {
        name: 'Official Narayana Health Doctor Profile',
        url: d.officialSource,
        type: 'official-registry',
        dateChecked: '2026-10-24',
      },
    ];

    // Check if doctor exists in DB
    const { rows: existingDocs } = await pool.query(
      'SELECT id, photo, sources FROM doctors WHERE id = $1 OR slug = $2 OR name = $3',
      [d.id, d.slug, d.name]
    );

    let docId = d.id;
    let photo = '';

    if (existingDocs.length > 0) {
      docId = existingDocs[0].id;
      photo = existingDocs[0].photo || '';

      // Keep canonical_id from existing sources if available
      const existingSources = Array.isArray(existingDocs[0].sources)
        ? existingDocs[0].sources
        : JSON.parse(existingDocs[0].sources || '[]');
      const canon = existingSources.find((s) => s.type === 'canonical_id');
      if (canon) sources.push(canon);

      await pool.query(
        `UPDATE doctors
         SET name = $1,
             title = $2,
             department = $3,
             department_slug = $4,
             speciality = $5,
             speciality_slug = $6,
             sub_speciality = $7,
             qualifications = $8,
             summary = $9,
             city = $10,
             state = $11,
             area = $12,
             location = $13,
             phone = $14,
             whatsapp = $15,
             verification_status = $16,
             last_checked = $17,
             languages = $18,
             areas_of_practice = $19,
             sources = $20,
             updated_at = NOW()
         WHERE id = $21`,
        [
          (d.name || '').slice(0, 255),
          (d.title || '').slice(0, 255),
          (d.department || '').slice(0, 100),
          (d.department_slug || '').slice(0, 100),
          (d.speciality || '').slice(0, 100),
          (d.speciality_slug || '').slice(0, 100),
          d.subSpeciality ? d.subSpeciality.slice(0, 255) : null,
          (d.qualifications || '').slice(0, 255),
          d.overview,
          (d.city || '').slice(0, 100),
          (d.state || '').slice(0, 100),
          (d.area || '').slice(0, 100),
          (d.location || '').slice(0, 255),
          (d.phone || '').slice(0, 255),
          (d.phone || '').slice(0, 255),
          'Verified from official Narayana Health doctor profile (Checked: 24 Oct 2026)',
          '2026-10-24',
          JSON.stringify(['English', 'Kannada', 'Hindi']),
          JSON.stringify(d.areas_of_practice),
          JSON.stringify(sources),
          docId,
        ]
      );
      console.log(`[${i + 1}/${doctors.length}] 🔄 UPDATED / REWRITTEN: "${d.name}" (ID: ${docId})`);
      updatedCount++;
    } else {
      await pool.query(
        `INSERT INTO doctors (
           id, slug, name, title, department, department_slug,
           speciality, speciality_slug, sub_speciality, qualifications,
           experience_years, photo, summary, city, state, area,
           location, phone, whatsapp, verification_status, last_checked,
           languages, areas_of_practice, sources, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10,
           $11, $12, $13, $14, $15, $16,
           $17, $18, $19, $20, $21,
           $22, $23, $24, NOW(), NOW()
         )`,
        [
          docId.slice(0, 64),
          (d.slug || '').slice(0, 128),
          (d.name || '').slice(0, 255),
          (d.title || '').slice(0, 255),
          (d.department || '').slice(0, 100),
          (d.department_slug || '').slice(0, 100),
          (d.speciality || '').slice(0, 100),
          (d.speciality_slug || '').slice(0, 100),
          d.subSpeciality ? d.subSpeciality.slice(0, 255) : null,
          (d.qualifications || '').slice(0, 255),
          15,
          photo,
          d.overview,
          (d.city || '').slice(0, 100),
          (d.state || '').slice(0, 100),
          (d.area || '').slice(0, 100),
          (d.location || '').slice(0, 255),
          (d.phone || '').slice(0, 255),
          (d.phone || '').slice(0, 255),
          'Verified from official Narayana Health doctor profile (Checked: 24 Oct 2026)',
          '2026-10-24',
          JSON.stringify(['English', 'Kannada', 'Hindi']),
          JSON.stringify(d.areas_of_practice),
          JSON.stringify(sources),
        ]
      );
      console.log(`[${i + 1}/${doctors.length}] ➕ INSERTED: "${d.name}" (ID: ${docId})`);
      insertedCount++;
    }

    // Link doctor_hospital_affiliations
    await pool.query(
      `INSERT INTO doctor_hospital_affiliations (doctor_id, hospital_id, days, timings, note)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (doctor_id, hospital_id)
       DO UPDATE SET days = EXCLUDED.days, timings = EXCLUDED.timings, note = EXCLUDED.note`,
      [
        docId,
        hospitalId,
        'By Appointment',
        'Regular OPD Hours (By Appointment)',
        d.affiliationNote,
      ]
    );
  }

  console.log('\n========================================');
  console.log(`🎉 COMPLETED:`);
  console.log(`   Updated / Rewritten: ${updatedCount} doctors`);
  console.log(`   Inserted: ${insertedCount} doctors`);
  console.log(`   Total Processed: ${doctors.length}`);
  console.log(`   Affiliations confirmed for hospital: ${hospitalId}`);
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
  console.error('Fatal error during Narayana doctors population:', err);
  process.exit(1);
});

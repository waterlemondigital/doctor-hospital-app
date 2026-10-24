import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.resolve(__dirname, '../../data/doctors_data/13 narayana institute dr profile info. md  .md');

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseFile() {
  const raw = fs.readFileSync(FILE_PATH, 'utf8');
  // Normalize line endings and trailing whitespace per line
  const content = raw
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n');

  // Split by "## **Dr. "
  const rawSections = content.split(/\n(?=## \*\*Dr\. )/);

  const doctors = [];

  for (let i = 1; i < rawSections.length; i++) {
    const sec = rawSections[i];

    // Name
    const nameMatch = sec.match(/^## \*\*(Dr\.[^*]+)\*\*/m);
    const name = nameMatch ? nameMatch[1].trim() : null;

    // Designation
    const desigMatch = sec.match(/\*\*Designation:\*\*\s*(.+)/i);
    const title = desigMatch ? desigMatch[1].trim() : 'Consultant';

    // Department / Specialty
    const deptMatch = sec.match(/\*\*Department \/ Specialty:\*\*\s*(.+)/i);
    const rawSpeciality = deptMatch ? deptMatch[1].trim() : 'Cardiology';

    // City
    const cityMatch = sec.match(/\*\*City:\*\*\s*(.+)/i);
    const rawCity = cityMatch ? cityMatch[1].trim() : 'Bengaluru (Bangalore), Karnataka, India';

    // Qualifications
    const qualMatch = sec.match(/\*\*Qualifications:\*\*\s*(.+)/i);
    const qualifications = qualMatch ? qualMatch[1].trim() : 'MBBS';

    // Professional Overview
    let overview = '';
    const overviewMatch = sec.match(/#### \*\*Professional Overview\*\*([\s\S]*?)(?=#### \*\*Hospitals)/i);
    if (overviewMatch) {
      overview = overviewMatch[1].trim().replace(/\n+/g, ' ');
    }

    // Hospitals
    const hospitals = [];
    const hospMatch = sec.match(/#### \*\*Hospitals Where This Doctor Consults\*\*([\s\S]*?)(?=#### \*\*Areas)/i);
    if (hospMatch) {
      const lines = hospMatch[1].split('\n');
      for (const line of lines) {
        const h = line.replace(/^\s*-\s*/, '').trim();
        if (h) hospitals.push(h);
      }
    }

    // Areas of Practice & Clinical Scope
    const areas = [];
    const areasMatch = sec.match(/#### \*\*Areas of Practice & Clinical Scope\*\*([\s\S]*?)(?=#### \*\*Direct Contact)/i);
    if (areasMatch) {
      const lines = areasMatch[1].split('\n');
      for (const line of lines) {
        const a = line.replace(/^\s*-\s*/, '').trim();
        if (a) areas.push(a);
      }
    }

    // Direct Contact & Inquiries
    let contactInfo = '';
    const contactMatch = sec.match(/#### \*\*Direct Contact & Inquiries\*\*([\s\S]*?)(?=_Consulting|#### \*\*Official Source)/i);
    if (contactMatch) {
      contactInfo = contactMatch[1].trim().replace(/\n+/g, ' ');
    }

    // Extract phone numbers from contactInfo
    let phone = '080 6750 6836';
    const phoneMatch = contactInfo.match(/(?:080\s*\d{4}\s*\d{4}|7026\s*222\s*222|\d{10})/);
    if (phoneMatch) {
      phone = phoneMatch[0].trim();
    }

    // Official Source
    let officialSource = '';
    const sourceMatch = sec.match(/#### \*\*Official Source\*\*[\s\S]*?(https?:\/\/[^\s\n]+)/i);
    if (sourceMatch) {
      officialSource = sourceMatch[1].trim();
    }

    // Clean Speciality and Department
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
    const subSpeciality = specParts.length > 1 ? specParts.slice(1).join('; ').trim() : areas.slice(0, 3).join('; ') || null;

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
    });
  }

  // Also handle Dr. Soumya M S from the directory summary note
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
    overview: 'Listed in Narayana Health Bengaluru specialist directory. Affiliation with Narayana Institute of Cardiac Sciences not independently confirmed for this exact name; verify directly with the hospital.',
    hospitals: ['Narayana Institute of Cardiac Sciences, Bengaluru (Unconfirmed)'],
    areas_of_practice: ['ENT', 'Otorhinolaryngology'],
    phone: '080 6750 6836',
    officialSource: 'https://www.narayanahealth.org/ocaapp/doctors/bengaluru/cardiac-sciences',
    city: 'bengaluru',
    state: 'Karnataka',
    area: 'Bommasandra',
    location: 'Bommasandra, Bengaluru',
  });

  return doctors;
}

const docs = parseFile();
console.log(`Parsed ${docs.length} doctor profiles:\n`);
docs.forEach((d, idx) => {
  console.log(`[${idx + 1}] ${d.name} (${d.id})`);
  console.log(`    Title: ${d.title}`);
  console.log(`    Dept: ${d.department} | Spec: ${d.speciality}`);
  console.log(`    SubSpec: ${d.subSpeciality}`);
  console.log(`    Qual: ${d.qualifications}`);
  console.log(`    Phone: ${d.phone}`);
  console.log(`    Source: ${d.officialSource}`);
  console.log(`    Hospitals: ${d.hospitals.join('; ')}`);
  console.log(`    Areas (${d.areas_of_practice.length}): ${d.areas_of_practice.join(', ')}`);
  console.log(`    Overview: ${d.overview.slice(0, 110)}...\n`);
});

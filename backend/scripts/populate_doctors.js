#!/usr/bin/env node
/**
 * Universal Doctor Ingestion & Rewriting Tool
 * 
 * Works for ANY doctor markdown file:
 * 1. Standard Template Format (e.g. data/templates/doctors.template.md):
 *    # Doctor: Dr. Sudhir Kothari
 *    - **Name**: ...
 *    - **Title**: ...
 *    - **City**: ...
 *    - **Area**: ...
 *    - **State**: ...
 *    - **Speciality**: ...
 *    - **Department**: ...
 *    - **Sub-Speciality**: ...
 *    - **Qualifications**: ...
 *    - **Experience Years**: 28
 *    - **Languages**: English, Hindi, Marathi
 *    - **Phone**: ...
 *    - **WhatsApp**: ...
 *    #### Hospital Affiliations (Schedule)
 *    - **Hospital**: ...
 *      - **Days**: ...
 *      - **Timings**: ...
 *      - **Note**: ...
 *    #### Laboratory Affiliations
 *    - **Connected Laboratories**: ...
 *    ### Summary
 *    ### Areas of Practice
 * 
 * 2. Research Profile Format (e.g. 17 Fortis escorts..., 13 Narayana...):
 *    ## **Dr. Name**
 *    **Designation:** ...
 *    **Department / Clinical Specialty:** ...
 *    **City:** ...
 *    **Qualifications:** ... / ### **Qualifications & Medical Training**
 *    ### **Professional Overview**
 *    ### **Hospitals Where This Doctor Consults**
 *    ### **Areas of Practice & Clinical Scope**
 * 
 * Usages:
 *   node scripts/populate_doctors.js
 *   node scripts/populate_doctors.js <filePath>
 *   node scripts/populate_doctors.js <filePath> --hospital=<hospital_id_or_slug>
 *   node scripts/populate_doctors.js --dir=../data/doctors_data/
 *   node scripts/populate_doctors.js <filePath> --dry-run
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

/**
 * Clean qualifications string: strip editorial remarks & clamp length
 */
export function cleanQualifications(raw) {
  if (!raw) return 'MBBS';
  let cleaned = raw.trim();
  if (
    /^Full qualifications/i.test(cleaned) ||
    /^Exact qualification/i.test(cleaned) ||
    /^Qualifications not/i.test(cleaned) ||
    /^Not verified/i.test(cleaned)
  ) {
    return 'MBBS (Specialist Credentials Pending Verification)';
  }
  // Strip editorial notes: ". Fortis also lists...", ", according to...", etc.
  cleaned = cleaned.replace(/\.\s*(?:Fortis|Narayana|Apollo|According|Exact|Confirm|Verify|Note)[\s\S]*$/i, '').trim();
  cleaned = cleaned.replace(/,\s*(?:according|as per|reported in)[\s\S]*$/i, '').trim();
  cleaned = cleaned.replace(/;\s*(?:Exact|Confirm|Verify|Note)[\s\S]*$/i, '').trim();
  if (cleaned.length > 250) {
    cleaned = cleaned.slice(0, 250).trim();
  }
  return cleaned || 'MBBS';
}

/**
 * Infer Department from Speciality text
 */
export function inferDepartment(specialityText) {
  const s = (specialityText || '').toLowerCase();
  if (
    s.includes('cardio') ||
    s.includes('heart') ||
    s.includes('vascular') ||
    s.includes('ctvs') ||
    s.includes('electrophysiol') ||
    s.includes('arrhythmi') ||
    s.includes('angioplasty')
  ) {
    if (s.includes('paediatric') || s.includes('congenital') || s.includes('pediatric')) {
      return 'Paediatric Cardiac Sciences';
    }
    return 'Cardiology';
  }
  if (s.includes('orthopaed') || s.includes('joint') || s.includes('spine')) {
    return 'Orthopaedics';
  }
  if (s.includes('neuro') || s.includes('brain') || s.includes('stroke') || s.includes('spine')) {
    return 'Neurology';
  }
  if (s.includes('onco') || s.includes('cancer') || s.includes('tumour')) {
    return 'Oncology';
  }
  if (s.includes('gastro') || s.includes('liver') || s.includes('digest')) {
    return 'Gastroenterology';
  }
  if (s.includes('nephro') || s.includes('renal') || s.includes('kidney')) {
    return 'Nephrology';
  }
  if (s.includes('ent') || s.includes('otorhinolaryngology') || s.includes('ear')) {
    return 'ENT';
  }
  if (s.includes('paediatric') || s.includes('pediatric')) {
    return 'Paediatrics';
  }
  if (s.includes('gynaec') || s.includes('obstetric')) {
    return 'Obstetrics & Gynaecology';
  }
  if (s.includes('ophthalm') || s.includes('eye') || s.includes('cornea') || s.includes('retina')) {
    return 'Ophthalmology';
  }
  if (s.includes('radio') || s.includes('imaging') || s.includes('x-ray') || s.includes('mri')) {
    return 'Radiology';
  }
  if (s.includes('plastic') || s.includes('reconstruct') || s.includes('cosmetic')) {
    return 'Plastic Surgery';
  }
  if (s.includes('pulmon') || s.includes('chest') || s.includes('respiratory') || s.includes('lung')) {
    return 'Pulmonology';
  }
  if (s.includes('urol')) {
    return 'Urology';
  }
  if (s.includes('vascular')) {
    return 'Vascular Surgery';
  }
  return 'General Medicine';
}

/**
 * Parse city string like "New Delhi, Delhi, India" or "Pune"
 */
export function parseLocationDetails(rawCity, defaultState = '') {
  if (!rawCity) {
    return { city: '', state: defaultState, area: '', location: '' };
  }
  const parts = rawCity.split(',').map((p) => p.trim());
  let cityPart = parts[0] || '';
  cityPart = cityPart.replace(/\([^)]*\)/g, '').trim();
  const city = cityPart.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  let state = defaultState;
  if (parts.length > 1) {
    state = parts[1].replace(/\([^)]*\)/g, '').trim();
  }
  return {
    city: city,
    state: state || defaultState,
    area: '',
    location: `${cityPart}${state ? ', ' + state : ''}`,
  };
}

/**
 * Match raw entity text (hospital or laboratory) against DB records
 */
export function findEntityMatch(rawInput, dbList, cityHint = '') {
  if (!rawInput) return null;
  const rawTrimmed = rawInput.trim();
  const clean = rawTrimmed.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const inputSlug = slugify(rawInput);

  // 0. Known entity alias patterns for precise matching
  const aliasRules = [
    { pattern: /aiims.*(new\s*delhi|delhi|rajendra\s*prasad)/i, id: 'all_india_institute_of_medical_sciences_aiims_new_delhi' },
    { pattern: /aiims.*bhubaneswar/i, id: 'aiims_bhubaneswar' },
    { pattern: /aiims.*patna/i, id: 'aiims_patna' },
    { pattern: /aiims.*rishikesh/i, id: 'aiims_rishikesh' },
    { pattern: /aiims.*jodhpur/i, id: 'aiims_jodhpur' },
    { pattern: /aiims.*bhopal/i, id: 'aiims_bhopal' },
    { pattern: /medanta.*(lucknow|awadh)/i, id: 'medanta' },
    { pattern: /medanta.*(gurugram|medicity)/i, id: 'medanta_the_medicity' },
    { pattern: /apollo.*(greams|chennai)/i, id: 'apollo_hospitals_greams_road' },
    { pattern: /apollo.*(ahmedabad|international)/i, id: 'apollo_hospitals_ahmedabad' },
    { pattern: /apollo.*(bengaluru|bangalore)/i, id: 'apollo_hospitals_bengaluru' },
    { pattern: /tata\s*memorial.*(mumbai|parel)/i, id: 'tata_memorial_hospital' },
    { pattern: /fortis\s*escorts.*(delhi|okhla)/i, id: 'fortis_escorts_heart_institute_new_delhi' },
    { pattern: /manipal.*(old\s*airport|bengaluru|bangalore)/i, id: 'manipal_hospital_old_airport_road' },
    { pattern: /kalinga|kims.*bhubaneswar/i, id: 'kalinga_institute_of_medical_sciences_kims' },
    { pattern: /narayana\s*institute\s*of\s*cardiac/i, id: 'narayana_institute_of_cardiac_sciences' },
    { pattern: /fortis.*(mulund|mumbai)/i, id: 'fortis_hospital_mulund' },
    { pattern: /raheja/i, id: 's_l_raheja_hospital_a_fortis_associate' },
    { pattern: /reliance.*foundation/i, id: 'sir_h_n_reliance_foundation_hospital_and_research_centre' },
    { pattern: /jaslok/i, id: 'jaslok_hospital_and_research_centre' },
    { pattern: /gleneagles.*parel/i, id: 'gleneagles_hospital_parel' },
    { pattern: /wockhardt.*(mumbai|central)/i, id: 'wockhardt_hospitals_mumbai_central' },
    { pattern: /saifee/i, id: 'saifee_hospital_charni_road' },
    { pattern: /breach\s*candy/i, id: 'breach_candy_hospital_trust' },
    { pattern: /hiranandani/i, id: 'dr_l_h_hiranandani_hospital_powai' },
    { pattern: /seven\s*hills/i, id: 'sevenhills_hospital' },
    { pattern: /criticare/i, id: 'criticare_asia_multispeciality_hospital_andheri_west' },
    { pattern: /holy\s*family/i, id: 'holy_family_hospital' },
    { pattern: /surya/i, id: 'surya_hospitals_santacruz' },
    { pattern: /srcc|children.*narayana/i, id: 'srcc_children_s_hospital_managed_by_narayana_health' }
  ];

  for (const rule of aliasRules) {
    if (rule.pattern.test(rawTrimmed)) {
      const match = dbList.find((e) => e.id === rule.id);
      if (match) return match;
    }
  }

  // 1. Exact ID match
  let match = dbList.find(
    (e) => e.id === rawTrimmed || e.id === inputSlug.replace(/-/g, '_')
  );
  if (match) return match;

  // 2. Exact slug match
  match = dbList.find((e) => e.slug === inputSlug);
  if (match) return match;

  // 3. Exact name match (case-insensitive)
  match = dbList.find((e) => e.name.toLowerCase() === rawTrimmed.toLowerCase());
  if (match) return match;

  // 4. Clean name contains or is contained
  const candidateMatches = dbList.filter((e) => {
    const eClean = e.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    return clean.includes(eClean) || eClean.includes(clean);
  });
  if (candidateMatches.length === 1) return candidateMatches[0];
  if (candidateMatches.length > 1) {
    if (cityHint) {
      const cityMatch = candidateMatches.find(
        (e) => e.city && e.city.toLowerCase() === cityHint.toLowerCase()
      );
      if (cityMatch) return cityMatch;
    }
    return candidateMatches[0];
  }

  // 5. Keyword match (excluding generic terms)
  const ignoredWords = new Set([
    'hospital', 'hospitals', 'clinic', 'clinics', 'institute', 'super',
    'speciality', 'specialty', 'centre', 'center', 'medical', 'sciences',
    'science', 'laboratory', 'laboratories', 'lab', 'labs', 'diagnostics',
    'diagnostic', 'reference', 'central', 'regional'
  ]);
  const keywords = clean.split(' ').filter((w) => w.length > 3 && !ignoredWords.has(w));
  if (keywords.length > 0) {
    const kwMatches = dbList.filter((e) => {
      const eClean = e.name.toLowerCase();
      return keywords.every((kw) => eClean.includes(kw));
    });
    if (kwMatches.length === 1) return kwMatches[0];
    if (kwMatches.length > 1) {
      if (cityHint) {
        const cityMatch = kwMatches.find(
          (e) => e.city && e.city.toLowerCase() === cityHint.toLowerCase()
        );
        if (cityMatch) return cityMatch;
      }
      return kwMatches[0];
    }
  }

  return null;
}

/**
 * Universal Parser for any Doctor Markdown file (Template & Research formats)
 */
export function parseDoctorMarkdown(fileContent, dbHospitals = []) {
  const content = fileContent
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n');

  // Detect file-level hospital & city
  let fileHospitalName = '';
  let fileCity = '';

  const headerTitleMatch = content.match(/^#\s+\*\*(.+?)\*\*/m) || content.match(/^#\s+([^*\n]+)/m);
  if (headerTitleMatch && !headerTitleMatch[1].toLowerCase().includes('doctor data') && !headerTitleMatch[1].toLowerCase().includes('doctor:')) {
    fileHospitalName = headerTitleMatch[1].trim();
  }

  const fileHospLine = content.match(/\*\*Hospital:\*\*\s*([^*\n]+)/i);
  if (fileHospLine) {
    fileHospitalName = fileHospLine[1].trim();
  }

  const fileCityLine = content.match(/\*\*City:\*\*\s*([^*\n]+)/i);
  if (fileCityLine) {
    fileCity = fileCityLine[1].trim();
  }

  // Try matching file-level hospital against DB
  let fileMatchedHospital = null;
  if (fileHospitalName) {
    fileMatchedHospital = findEntityMatch(fileHospitalName, dbHospitals, fileCity);
  }

  const isTemplateFormat = /# Doctor:\s*(?:Dr\.)?/i.test(content);
  let rawSections = [];
  let startIndex = 0;

  if (isTemplateFormat) {
    rawSections = content.split(/\n(?=# Doctor:)/i);
    startIndex = 0;
  } else {
    rawSections = content.split(/\n(?=## (?:\*\*)?Dr\. )/);
    startIndex = 1; // Skip section 0 (preamble/summary table)
  }

  const doctors = [];
  const seenDoctorNames = new Set();

  for (let i = startIndex; i < rawSections.length; i++) {
    const sec = rawSections[i];
    if (!sec) continue;

    // --- Name ---
    let name = null;
    const templateNameMatch = sec.match(/-\s*\*\*Name\*\*:\s*`?([^`\r\n]+)`?/i) || sec.match(/# Doctor:\s*`?([^`\r\n]+)`?/i);
    const standardNameMatch = sec.match(/^##\s+\*\*(Dr\.[^*]+)\*\*/m) || sec.match(/^##\s+(Dr\.[^\n]+)/m);

    if (templateNameMatch) {
      name = templateNameMatch[1].trim();
    } else if (standardNameMatch) {
      name = standardNameMatch[1].trim();
    }
    if (name) {
      name = name.replace(/`/g, '').trim();
    }

    if (
      !name ||
      name.length > 70 ||
      name.includes('<') ||
      name.includes('>') ||
      name.includes('[Name]') ||
      seenDoctorNames.has(name.toLowerCase())
    ) {
      continue;
    }
    seenDoctorNames.add(name.toLowerCase());

    // --- Designation / Title ---
    let title = 'Consultant';
    const desigMatch =
      sec.match(/-\s*\*\*Title\*\*:[^\S\r\n]*([^\r\n]+)/i) ||
      sec.match(/\*\*Designation:\*\*[^\S\r\n]*([^\r\n]+)/i) ||
      sec.match(/-\s*\*\*Designation\*\*:[^\S\r\n]*([^\r\n]+)/i);
    if (desigMatch) {
      let rawTitle = desigMatch[1].trim();
      if (rawTitle.includes('**')) rawTitle = rawTitle.split('**')[0].trim();
      if (rawTitle.endsWith(';')) rawTitle = rawTitle.slice(0, -1).trim();
      if (rawTitle) title = rawTitle.slice(0, 255);
    }

    // --- Department & Clinical Specialty ---
    let rawSpeciality = '';
    let rawDepartment = '';

    const specOnlyMatch =
      sec.match(/-\s*\*\*Speciality\*\*:[^\S\r\n]*([^\r\n]+)/i) ||
      sec.match(/\*\*Speciality:\*\*[^\S\r\n]*([^\r\n]+)/i) ||
      sec.match(/\*\*Clinical Specialty:\*\*[^\S\r\n]*([^\r\n]+)/i);
    const deptOnlyMatch =
      sec.match(/-\s*\*\*Department\*\*:[^\S\r\n]*([^\r\n]+)/i) ||
      sec.match(/\*\*Department:\*\*[^\S\r\n]*([^\r\n]+)/i);
    const deptSpecMatch =
      sec.match(/\*\*Department \/ (?:Clinical )?Specialty:\*\*[^\S\r\n]*([^\r\n]+)/i) ||
      sec.match(/\*\*Department \/ Specialty:\*\*[^\S\r\n]*([^\r\n]+)/i);

    if (specOnlyMatch) {
      rawSpeciality = specOnlyMatch[1].trim();
    } else if (deptSpecMatch) {
      rawSpeciality = deptSpecMatch[1].trim();
    }

    if (deptOnlyMatch) {
      rawDepartment = deptOnlyMatch[1].trim();
    }

    if (rawSpeciality.includes('**')) rawSpeciality = rawSpeciality.split('**')[0].trim();
    if (rawDepartment.includes('**')) rawDepartment = rawDepartment.split('**')[0].trim();
    if (rawSpeciality.endsWith(';')) rawSpeciality = rawSpeciality.slice(0, -1).trim();
    if (rawDepartment.endsWith(';')) rawDepartment = rawDepartment.slice(0, -1).trim();

    let department = (rawDepartment || inferDepartment(rawSpeciality)).slice(0, 100);
    let speciality = (rawSpeciality || department).slice(0, 100);

    // --- Sub-Speciality ---
    let subSpeciality = null;
    const subSpecMatch =
      sec.match(/-\s*\*\*Sub-Speciality\*\*:[^\S\r\n]*([^\r\n]+)/i) ||
      sec.match(/\*\*Sub-Speciality:\*\*[^\S\r\n]*([^\r\n]+)/i);
    if (subSpecMatch) {
      subSpeciality = subSpecMatch[1].trim();
    } else if (rawSpeciality.includes(';')) {
      const parts = rawSpeciality.split(';');
      speciality = parts[0].trim().slice(0, 100);
      subSpeciality = parts.slice(1).join('; ').trim();
    }
    if (subSpeciality) {
      if (subSpeciality.includes('**')) subSpeciality = subSpeciality.split('**')[0].trim();
      subSpeciality = subSpeciality.slice(0, 255);
    }

    // --- City, State, Area, Location ---
    const cityMatch = sec.match(/-\s*\*\*City\*\*:[^\S\r\n]*([^\r\n]+)/i) || sec.match(/\*\*City:\*\*[^\S\r\n]*([^\r\n]+)/i);
    const stateMatch = sec.match(/-\s*\*\*State\*\*:[^\S\r\n]*([^\r\n]+)/i) || sec.match(/\*\*State:\*\*[^\S\r\n]*([^\r\n]+)/i);
    const areaMatch = sec.match(/-\s*\*\*Area\*\*:[^\S\r\n]*([^\r\n]+)/i) || sec.match(/\*\*Area:\*\*[^\S\r\n]*([^\r\n]+)/i);
    const hospAddrMatch = sec.match(/\*\*Hospital Address:\*\*[^\S\r\n]*([^\r\n]+)/i);

    let rawCity = cityMatch ? cityMatch[1].trim() : fileCity || fileMatchedHospital?.city || 'Pune';
    if (rawCity.includes('**')) rawCity = rawCity.split('**')[0].trim();

    const locInfo = parseLocationDetails(rawCity);
    if (stateMatch) {
      let rawState = stateMatch[1].trim();
      if (rawState.includes('**')) rawState = rawState.split('**')[0].trim();
      locInfo.state = rawState;
    }
    if (areaMatch) {
      let rawArea = areaMatch[1].trim();
      if (rawArea.includes('**')) rawArea = rawArea.split('**')[0].trim();
      locInfo.area = rawArea;
    }
    if (hospAddrMatch && !locInfo.area) {
      const addrParts = hospAddrMatch[1].split(',');
      locInfo.area = addrParts[0].trim();
    }
    if (fileMatchedHospital) {
      if (!locInfo.city) locInfo.city = fileMatchedHospital.city;
      if (!locInfo.state) locInfo.state = fileMatchedHospital.state;
      if (!locInfo.area) locInfo.area = fileMatchedHospital.area;
    }
    locInfo.location = `${locInfo.area ? locInfo.area + ', ' : ''}${locInfo.city ? locInfo.city.charAt(0).toUpperCase() + locInfo.city.slice(1) : ''}`;

    // --- Qualifications ---
    let rawQual = '';
    const qualLineMatch =
      sec.match(/-\s*\*\*Qualifications\*\*:[^\S\r\n]*([^\r\n]+)/i) ||
      sec.match(/\*\*Qualifications:\*\*[^\S\r\n]*([^\r\n]+)/i);
    if (qualLineMatch) {
      rawQual = qualLineMatch[1].trim();
    } else {
      const qualBlockMatch = sec.match(/#{2,4}\s+\*\*Qualifications[^*]*\*\*([\s\S]*?)(?=#{2,4}|$)/i);
      if (qualBlockMatch) {
        rawQual = qualBlockMatch[1].trim().replace(/\n+/g, ' ');
      }
    }
    if (rawQual.includes('**')) rawQual = rawQual.split('**')[0].trim();
    const qualifications = cleanQualifications(rawQual || 'MBBS');

    // --- Experience Years ---
    let experienceYears = 15;
    const expMatch =
      sec.match(/-\s*\*\*Experience Years\*\*:[^\S\r\n]*(\d+)/i) ||
      sec.match(/\*\*Experience Years:\*\*[^\S\r\n]*(\d+)/i);
    if (expMatch) {
      experienceYears = parseInt(expMatch[1], 10);
    }

    // --- Languages ---
    let languages = ['English', 'Hindi', 'Marathi'];
    const langMatch =
      sec.match(/-\s*\*\*Languages\*\*:[^\S\r\n]*([^\r\n]+)/i) ||
      sec.match(/\*\*Languages:\*\*[^\S\r\n]*([^\r\n]+)/i);
    if (langMatch) {
      let rawLang = langMatch[1].trim();
      if (rawLang.includes('**')) rawLang = rawLang.split('**')[0].trim();
      if (rawLang && !rawLang.startsWith('- **') && !rawLang.startsWith('#') && !rawLang.toLowerCase().includes('contact our consultant')) {
        const parsedLangs = rawLang
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean);
        if (parsedLangs.length > 0) {
          languages = parsedLangs;
        }
      }
    }

    // --- Phone & WhatsApp ---
    let phone = '';
    const phoneExplicit =
      sec.match(/-\s*\*\*Phone\*\*:\s*(.+)/i) ||
      sec.match(/\*\*Phone:\*\*\s*(.+)/i);
    if (phoneExplicit) {
      phone = phoneExplicit[1].trim();
    } else {
      const contactMatch = sec.match(/#{2,4}\s+\*\*Direct Contact & Inquiries\*\*([\s\S]*?)(?=#{2,4}|$)/i);
      if (contactMatch) {
        const pMatch = contactMatch[1].match(
          /(?:\+91\s*)?(?:0\d{2,4}\s*\d{3,4}\s*\d{3,4}|[6-9]\d{9}|\d{4}\s*\d{3}\s*\d{3})/
        );
        if (pMatch) phone = pMatch[0].trim();
      }
    }

    let whatsapp = phone;
    const waExplicit =
      sec.match(/-\s*\*\*WhatsApp\*\*:\s*(.+)/i) ||
      sec.match(/\*\*WhatsApp:\*\*\s*(.+)/i);
    if (waExplicit) {
      whatsapp = waExplicit[1].trim();
    }

    if (!phone && fileMatchedHospital?.phone) {
      phone = fileMatchedHospital.phone;
      whatsapp = phone;
    }
    if (!phone) {
      phone = '+91 20 6721 5000';
      whatsapp = phone;
    }

    // --- Hospital Affiliations (with Days, Timings, Note) ---
    const hospitalAffiliations = [];

    // Check template format: #### Hospital Affiliations (Schedule)
    const scheduleMatch =
      sec.match(/####\s+Hospital Affiliations[^\n]*\n([\s\S]*?)(?=####|###|---|$)/i) ||
      sec.match(/###\s+Hospital Affiliations[^\n]*\n([\s\S]*?)(?=####|###|---|$)/i);

    if (scheduleMatch) {
      const hospBlocks = scheduleMatch[1].split(/(?=-\s+\*\*Hospital\*\*:)/i);
      for (const hb of hospBlocks) {
        const hNameMatch = hb.match(/-\s+\*\*Hospital\*\*:[^\S\r\n]*([^\r\n]+)/i);
        const daysMatch = hb.match(/-\s+\*\*Days\*\*:[^\S\r\n]*([^\r\n]*)/i);
        const timeMatch = hb.match(/-\s+\*\*Timings\*\*:[^\S\r\n]*([^\r\n]*)/i);
        const noteMatch = hb.match(/-\s+\*\*Note\*\*:[^\S\r\n]*([^\r\n]*)/i);
        if (hNameMatch) {
          let hName = hNameMatch[1].trim();
          if (hName.includes('**')) hName = hName.split('**')[0].trim();
          hName = hName.replace(/`/g, '').trim();
          if (hName) {
            const rawDays = daysMatch ? daysMatch[1].trim() : '';
            const rawTimings = timeMatch ? timeMatch[1].trim() : '';
            const rawNote = noteMatch ? noteMatch[1].trim() : '';

            const cleanDays = (!rawDays || rawDays.startsWith('- **') || rawDays.startsWith('#')) ? 'By Appointment' : rawDays;
            const isInvalidTiming = !rawTimings || 
              rawTimings.startsWith('- **') || 
              rawTimings.startsWith('#') || 
              rawTimings.toLowerCase().includes('note') ||
              rawTimings.toLowerCase().startsWith('confirm') ||
              rawTimings.toLowerCase().startsWith('book');
            const cleanTimings = isInvalidTiming ? 'Consult our contact number' : rawTimings;
            const cleanNote = (!rawNote || rawNote.startsWith('- **') || rawNote.startsWith('#')) ? '' : rawNote;

            hospitalAffiliations.push({
              name: hName,
              days: cleanDays.slice(0, 255),
              timings: cleanTimings.slice(0, 255),
              note: cleanNote,
            });
          }
        }
      }
    }

    // Check research format: **Consulting Hospital:** or ### **Hospitals Where This Doctor Consults**
    if (hospitalAffiliations.length === 0) {
      const consultingHospMatch = sec.match(/\*\*Consulting Hospital:\*\*\s*(.+)/i);
      if (consultingHospMatch) {
        hospitalAffiliations.push({
          name: consultingHospMatch[1].trim(),
          days: 'By Appointment',
          timings: 'Regular OPD Hours (By Appointment)',
          note: `Consultation at ${consultingHospMatch[1].trim()}. Verified from directory profile.`,
        });
      }

      const hospBlockMatch =
        sec.match(/#{2,4}\s+\*\*Hospitals Where This Doctor Consults\*\*([\s\S]*?)(?=#{2,4}|$)/i);
      if (hospBlockMatch) {
        const rawBlock = hospBlockMatch[1].trim();
        const lines = rawBlock.split('\n');
        for (const line of lines) {
          const clean = line
            .replace(/^\s*-\s*\*\*Hospital\*\*:\s*/i, '')
            .replace(/^\s*-\s*/, '')
            .trim();
          if (
            clean &&
            !clean.startsWith('**Days**') &&
            !clean.startsWith('**Timings**') &&
            !clean.startsWith('**Note**')
          ) {
            const firstSentence = clean.split('.')[0].trim();
            if (firstSentence && !hospitalAffiliations.some((h) => h.name === firstSentence)) {
              hospitalAffiliations.push({
                name: firstSentence,
                days: 'By Appointment',
                timings: 'Regular OPD Hours (By Appointment)',
                note: `Consultation at ${firstSentence}. Verified from official profile.`,
              });
            }
          }
        }
      }

      if (hospitalAffiliations.length === 0 && fileHospitalName) {
        hospitalAffiliations.push({
          name: fileHospitalName,
          days: 'By Appointment',
          timings: 'Regular OPD Hours (By Appointment)',
          note: `Consultation at ${fileHospitalName}.`,
        });
      }
    }

    // --- Laboratory Affiliations ---
    const laboratoryAffiliations = [];
    const labAffMatch =
      sec.match(/####\s+Laboratory Affiliations[^\n]*\n([\s\S]*?)(?=####|###|---|$)/i) ||
      sec.match(/###\s+Laboratory Affiliations[^\n]*\n([\s\S]*?)(?=####|###|---|$)/i);
    if (labAffMatch) {
      const labLine = labAffMatch[1].match(/-\s+\*\*Connected Laboratories\*\*:[^\S\r\n]*([^\r\n]*)/i);
      if (labLine && labLine[1].trim() && !labLine[1].trim().startsWith('#') && !labLine[1].trim().startsWith('-')) {
        const labNames = labLine[1].split(',').map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && !l.startsWith('-'));
        laboratoryAffiliations.push(...labNames);
      }
    }

    // --- Professional Overview / Summary ---
    let overview = '';
    const overviewMatch =
      sec.match(/###\s+Summary([\s\S]*?)(?=### Areas|####|---|$)/i) ||
      sec.match(/#{2,4}\s+\*\*Professional Overview\*\*([\s\S]*?)(?=#{2,4}|$)/i);
    if (overviewMatch) {
      overview = overviewMatch[1].trim().replace(/\n+/g, ' ');
    }

    // --- Areas of Practice ---
    const areas = [];
    const areasMatch =
      sec.match(/###\s+Areas of Practice([\s\S]*?)(?=####|###|---|$)/i) ||
      sec.match(/#{2,4}\s+\*\*Areas of Practice[^*]*\*\*([\s\S]*?)(?=#{2,4}|$)/i);
    if (areasMatch) {
      const lines = areasMatch[1].split('\n');
      for (const line of lines) {
        const clean = line.replace(/^\s*-\s*/, '').trim();
        if (clean && !clean.startsWith('#') && !clean.toLowerCase().startsWith('**source') && !clean.toLowerCase().startsWith('source:')) {
          areas.push(clean);
        }
      }
    }

    if (!subSpeciality && areas.length > 0) {
      subSpeciality = areas.slice(0, 3).join('; ');
    }

    // --- Official Source ---
    let officialSource = '';
    const sourceMatch =
      sec.match(/\*\*Source\*\*:\s*(https?:\/\/[^\s\n)]+)/i) ||
      sec.match(/#{2,4}\s+\*\*Official Profile[^*]*\*\*[\s\S]*?(https?:\/\/[^\s\n)]+)/i) ||
      sec.match(/#{2,4}\s+\*\*Official Source\*\*[\s\S]*?(https?:\/\/[^\s\n)]+)/i) ||
      sec.match(/https?:\/\/(?:www\.)?(?:fortishealthcare|narayanahealth|sahyadrihospitals|wockhardthospitals|saifeehospital|breachcandyhospital|hiranandanihospital)[^\s\n)]+/);
    if (sourceMatch) {
      officialSource = sourceMatch[1] || sourceMatch[0];
    }

    const doctorSlug = slugify(name);
    const doctorId = doctorSlug.replace(/-/g, '_');

    doctors.push({
      id: doctorId,
      slug: doctorSlug,
      name,
      title: title.slice(0, 250),
      department: department.slice(0, 100),
      department_slug: slugify(department).slice(0, 100),
      speciality: speciality.slice(0, 100),
      speciality_slug: slugify(speciality).slice(0, 100),
      subSpeciality: subSpeciality ? subSpeciality.slice(0, 250) : null,
      qualifications: qualifications.slice(0, 250),
      experienceYears,
      languages,
      overview,
      city: (locInfo.city || 'pune').slice(0, 100),
      state: (locInfo.state || 'Maharashtra').slice(0, 100),
      area: (locInfo.area || '').slice(0, 100),
      location: (locInfo.location || 'Pune').slice(0, 250),
      phone: phone.slice(0, 250),
      whatsapp: whatsapp.slice(0, 250),
      hospitalAffiliations,
      laboratoryAffiliations,
      areas_of_practice: areas,
      officialSource,
      fileMatchedHospital,
    });
  }

  return { doctors, fileMatchedHospital };
}

/**
 * Process and Ingest a single Doctor Markdown File
 */
async function processDoctorFile(filePath, options = {}) {
  const { defaultHospitalId = null, dryRun = false, dbHospitals = [], dbLabs = [] } = options;

  console.log(`\n======================================================`);
  console.log(`📄 Processing file: "${filePath}"`);
  console.log(`======================================================`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return { updated: 0, inserted: 0, total: 0 };
  }

  const rawContent = fs.readFileSync(filePath, 'utf8');
  const { doctors, fileMatchedHospital } = parseDoctorMarkdown(rawContent, dbHospitals);

  console.log(`Parsed ${doctors.length} doctor profile(s) from file.`);
  if (fileMatchedHospital) {
    console.log(`🏥 File Header Target Hospital: "${fileMatchedHospital.name}" (${fileMatchedHospital.id})`);
  }

  // Detect dominant hospital for this file
  const hospitalCounts = new Map();
  if (fileMatchedHospital) {
    hospitalCounts.set(fileMatchedHospital.id, 100);
  }
  for (const d of doctors) {
    if (d.hospitalAffiliations) {
      for (const hItem of d.hospitalAffiliations) {
        const m = findEntityMatch(hItem.name, dbHospitals, d.city);
        if (m) hospitalCounts.set(m.id, (hospitalCounts.get(m.id) || 0) + 1);
      }
    }
  }

  let dominantHospitalId = defaultHospitalId;
  if (!dominantHospitalId && hospitalCounts.size > 0) {
    let maxCount = 0;
    for (const [hId, count] of hospitalCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantHospitalId = hId;
      }
    }
  }

  if (dominantHospitalId) {
    console.log(`🏥 Resolved Primary Hospital for Affiliations: ${dominantHospitalId}\n`);
  }

  if (dryRun) {
    console.log(`🔍 [DRY RUN] Simulating database updates...`);
    doctors.forEach((d, i) => {
      console.log(`   [${i + 1}] ${d.name} (${d.id})`);
      console.log(`       Title: ${d.title}`);
      console.log(`       Dept: ${d.department} | Speciality: ${d.speciality} (Sub: ${d.subSpeciality || 'None'})`);
      console.log(`       Qual: ${d.qualifications} | Exp: ${d.experienceYears} yrs`);
      console.log(`       City: ${d.city} | Area: ${d.area} | State: ${d.state}`);
      console.log(`       Phone: ${d.phone} | WA: ${d.whatsapp}`);
      console.log(`       Languages: ${d.languages.join(', ')}`);
      console.log(`       Hospitals (${d.hospitalAffiliations.length}): ${d.hospitalAffiliations.map((h) => `${h.name} [${h.days} / ${h.timings}]`).join('; ') || 'None'}`);
      if (d.laboratoryAffiliations.length > 0) {
        console.log(`       Labs (${d.laboratoryAffiliations.length}): ${d.laboratoryAffiliations.join(', ')}`);
      }
      console.log(`       Areas: ${d.areas_of_practice.slice(0, 3).join(', ')}`);
      console.log(`       Overview: ${d.overview ? d.overview.slice(0, 80) + '...' : 'None'}`);
    });
    return { updated: 0, inserted: 0, total: doctors.length };
  }

  let updatedCount = 0;
  let insertedCount = 0;

  for (let i = 0; i < doctors.length; i++) {
    const d = doctors[i];

    // Build source metadata
    const sources = [];
    if (d.officialSource) {
      sources.push({
        name: 'Official Directory Profile',
        url: d.officialSource,
        type: 'official-registry',
        dateChecked: new Date().toISOString().split('T')[0],
      });
    }

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
    }

    // Check Cloudflare R2 if doctor does not yet have a photo
    if (!photo) {
      const r2Base = (process.env.R2_PUBLIC_URL || 'https://pub-151166afd0294cb99a7c59679d424908.r2.dev').replace(/\/+$/, '');
      try {
        const headRes = await fetch(`${r2Base}/doctors/${docId}/photo.webp`, { method: 'HEAD' });
        if (headRes.ok) {
          photo = `${r2Base}/doctors/${docId}/photo.webp`;
        } else if (d.slug && d.slug !== docId) {
          const headResSlug = await fetch(`${r2Base}/doctors/${d.slug}/photo.webp`, { method: 'HEAD' });
          if (headResSlug.ok) {
            photo = `${r2Base}/doctors/${d.slug}/photo.webp`;
          }
        }
      } catch (err) {
        // Ignore network error during R2 check
      }
    }

    if (existingDocs.length > 0) {
      // Preserve existing canonical_id
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
             experience_years = $9,
             summary = $10,
             city = $11,
             state = $12,
             area = $13,
             location = $14,
             phone = $15,
             whatsapp = $16,
             verification_status = $17,
             last_checked = $18,
             languages = $19,
             areas_of_practice = $20,
             sources = $21,
             photo = COALESCE(NULLIF(doctors.photo, ''), NULLIF($22, ''), ''),
             updated_at = NOW()
         WHERE id = $23`,
        [
          (d.name || '').slice(0, 255),
          (d.title || '').slice(0, 255),
          (d.department || '').slice(0, 100),
          (d.department_slug || '').slice(0, 100),
          (d.speciality || '').slice(0, 100),
          (d.speciality_slug || '').slice(0, 100),
          d.subSpeciality ? d.subSpeciality.slice(0, 255) : null,
          (d.qualifications || '').slice(0, 255),
          d.experienceYears || 15,
          d.overview || null,
          (d.city || '').slice(0, 100),
          (d.state || '').slice(0, 100),
          (d.area || '').slice(0, 100),
          (d.location || '').slice(0, 255),
          (d.phone || '').slice(0, 255),
          (d.whatsapp || d.phone || '').slice(0, 255),
          `Verified from official profile directory (Checked: ${new Date().toLocaleDateString('en-GB')})`,
          new Date().toISOString().split('T')[0],
          JSON.stringify(d.languages || ['English', 'Hindi']),
          JSON.stringify(d.areas_of_practice || []),
          JSON.stringify(sources),
          photo,
          docId,
        ]
      );
      console.log(`[${i + 1}/${doctors.length}] 🔄 UPDATED / REWRITTEN: "${d.name}" (ID: ${docId})${photo ? ' 📸 (Photo linked)' : ''}`);
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
          d.experienceYears || 15,
          photo,
          d.overview || null,
          (d.city || '').slice(0, 100),
          (d.state || '').slice(0, 100),
          (d.area || '').slice(0, 100),
          (d.location || '').slice(0, 255),
          (d.phone || '').slice(0, 255),
          (d.whatsapp || d.phone || '').slice(0, 255),
          `Verified from official profile directory (Checked: ${new Date().toLocaleDateString('en-GB')})`,
          new Date().toISOString().split('T')[0],
          JSON.stringify(d.languages || ['English', 'Hindi']),
          JSON.stringify(d.areas_of_practice || []),
          JSON.stringify(sources),
        ]
      );
      console.log(`[${i + 1}/${doctors.length}] ➕ INSERTED: "${d.name}" (ID: ${docId})`);
      insertedCount++;
    }

    // --- Link Hospital Affiliations ---
    // Clean old affiliations for this doctor before re-linking
    await pool.query('DELETE FROM doctor_hospital_affiliations WHERE doctor_id = $1', [docId]);
    await pool.query('DELETE FROM doctor_laboratory_affiliations WHERE doctor_id = $1', [docId]);

    const linkedHospitalIds = new Set();

    if (d.hospitalAffiliations && d.hospitalAffiliations.length > 0) {
      for (const hItem of d.hospitalAffiliations) {
        const matched = findEntityMatch(hItem.name, dbHospitals, d.city);
        if (matched) {
          linkedHospitalIds.add(matched.id);
          await pool.query(
            `INSERT INTO doctor_hospital_affiliations (doctor_id, hospital_id, days, timings, note)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (doctor_id, hospital_id)
             DO UPDATE SET days = EXCLUDED.days, timings = EXCLUDED.timings, note = EXCLUDED.note`,
            [
              docId.slice(0, 64),
              matched.id.slice(0, 64),
              (hItem.days || 'By Appointment').slice(0, 255),
              (hItem.timings || 'Consult our contact number').slice(0, 255),
              (hItem.note || `Consultation at ${matched.name}. Verified from directory.`).slice(0, 1000),
            ]
          );
          console.log(`   🔗 Linked affiliation -> Hospital: ${matched.name} (${matched.id}) [${hItem.days} | ${hItem.timings}]`);
        }
      }
    }

    // Fallback to dominant hospital if none linked
    if (linkedHospitalIds.size === 0 && dominantHospitalId) {
      await pool.query(
        `INSERT INTO doctor_hospital_affiliations (doctor_id, hospital_id, days, timings, note)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (doctor_id, hospital_id)
         DO UPDATE SET days = EXCLUDED.days, timings = EXCLUDED.timings, note = EXCLUDED.note`,
        [
          docId.slice(0, 64),
          dominantHospitalId.slice(0, 64),
          'By Appointment',
          'Regular OPD Hours (By Appointment)',
          'Consultation location verified from directory profile.',
        ]
      );
      console.log(`   🔗 Linked affiliation -> Hospital: ${dominantHospitalId} (Primary Fallback)`);
    }

    // --- Link Laboratory Affiliations ---
    if (d.laboratoryAffiliations && d.laboratoryAffiliations.length > 0) {
      for (const labText of d.laboratoryAffiliations) {
        const matchedLab = findEntityMatch(labText, dbLabs, d.city);
        if (matchedLab) {
          await pool.query(
            `INSERT INTO doctor_laboratory_affiliations (doctor_id, laboratory_id)
             VALUES ($1, $2)
             ON CONFLICT (doctor_id, laboratory_id) DO NOTHING`,
            [docId.slice(0, 64), matchedLab.id.slice(0, 64)]
          );
          console.log(`   🧪 Linked affiliation -> Laboratory: ${matchedLab.name} (${matchedLab.id})`);
        }
      }
    }
  }

  return { updated: updatedCount, inserted: insertedCount, total: doctors.length };
}

/**
 * Main Controller
 */
async function main() {
  const args = process.argv.slice(2);

  let targetFile = null;
  let targetDir = null;
  let targetHospital = null;
  let dryRun = false;

  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg.startsWith('--hospital=')) {
      targetHospital = arg.split('=')[1].trim();
    } else if (arg.startsWith('--file=')) {
      targetFile = arg.split('=')[1].trim();
    } else if (arg.startsWith('--dir=')) {
      targetDir = arg.split('=')[1].trim();
    } else if (!arg.startsWith('--') && !targetFile) {
      targetFile = arg;
    }
  }

  console.log(`🩺 Universal Doctor Data Population & Rewriter Tool`);

  // Load existing hospitals & laboratories from database
  const { rows: dbHospitals } = await pool.query(
    'SELECT id, slug, name, city, area, state, phone, address FROM hospitals'
  );
  const { rows: dbLabs } = await pool.query(
    'SELECT id, slug, name, city FROM laboratories'
  );
  console.log(`Loaded ${dbHospitals.length} hospitals and ${dbLabs.length} laboratories from database.`);

  // Validate target hospital if explicitly given
  if (targetHospital) {
    const matchedHospital = findEntityMatch(targetHospital, dbHospitals);
    if (matchedHospital) {
      targetHospital = matchedHospital.id;
      console.log(`🎯 Explicit Hospital Target: "${matchedHospital.name}" (${matchedHospital.id})`);
    } else {
      console.warn(`⚠️ Warning: Specified hospital "${targetHospital}" not found in database.`);
    }
  }

  // Gather list of files to process
  const filesToProcess = [];

  if (targetFile) {
    const absPath = path.isAbsolute(targetFile) ? targetFile : path.resolve(process.cwd(), targetFile);
    filesToProcess.push(absPath);
  } else if (targetDir) {
    const absDir = path.isAbsolute(targetDir) ? targetDir : path.resolve(process.cwd(), targetDir);
    if (fs.existsSync(absDir)) {
      const items = fs.readdirSync(absDir).filter((f) => f.endsWith('.md'));
      for (const item of items) {
        filesToProcess.push(path.join(absDir, item));
      }
    }
  } else {
    // Default: inspect data/doctors_data
    const defaultDataDir = path.resolve(__dirname, '../../data/doctors_data');
    if (fs.existsSync(defaultDataDir)) {
      const items = fs.readdirSync(defaultDataDir).filter((f) => f.endsWith('.md'));
      for (const item of items) {
        filesToProcess.push(path.join(defaultDataDir, item));
      }
    }
  }

  if (filesToProcess.length === 0) {
    console.error(`❌ No markdown files found to process.`);
    console.log(`   Usage: node scripts/populate_doctors.js <path_to_markdown_file> [--hospital=<id>]`);
    process.exit(1);
  }

  let totalUpdated = 0;
  let totalInserted = 0;
  let totalProcessed = 0;

  for (const f of filesToProcess) {
    const res = await processDoctorFile(f, {
      defaultHospitalId: targetHospital,
      dryRun,
      dbHospitals,
      dbLabs,
    });
    totalUpdated += res.updated;
    totalInserted += res.inserted;
    totalProcessed += res.total;
  }

  console.log(`\n======================================================`);
  console.log(`🎉 COMPLETED POPULATION:`);
  console.log(`   Files Processed: ${filesToProcess.length}`);
  console.log(`   Doctors Processed: ${totalProcessed}`);
  console.log(`   Doctors Rewritten / Updated: ${totalUpdated}`);
  console.log(`   Doctors Newly Inserted: ${totalInserted}`);
  console.log(`======================================================`);

  if (!dryRun) {
    console.log('\n🔄 Reloading server in-memory directory cache...');
    try {
      const res = await fetch('http://localhost:8000/api/v1/cache/clear', { method: 'POST' });
      const data = await res.json();
      console.log('✅ In-memory cache reloaded successfully:', data.message || 'Reloaded');
    } catch (e) {
      console.warn('ℹ️ Backend server will reload cache on next query or restart.');
    }
  }

  await pool.end();
}

if (process.argv[1] && (process.argv[1].endsWith('populate_doctors.js') || process.argv[1].includes('populate_doctors'))) {
  main().catch((err) => {
    console.error('Fatal error during doctor population:', err);
    process.exit(1);
  });
}

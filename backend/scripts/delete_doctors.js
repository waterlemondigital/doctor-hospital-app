/**
 * Delete Doctors Script
 * 
 * Safely removes requested doctors from the PostgreSQL database (including affiliations).
 * If a doctor is not present in the database, it safely skips/ignores them as requested.
 * Also cleans them from frontend/src/data/doctors.ts if present.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Doctors requested for removal
const TARGET_DOCTORS = [
  { raw: 'Dr. A Asha', terms: ['a asha', 'dr-a-asha', 'dr_a_asha'] },
  { raw: 'Dr. A B Murali Krishna Reddy', terms: ['murali krishna reddy', 'dr-a-b-murali-krishna-reddy', 'dr_a_b_murali_krishna_reddy'] },
  { raw: 'Dr. Aabha Nagral', terms: ['aabha nagral', 'dr-aabha-nagral', 'dr_aabha_nagral'] },
  { raw: 'Dr. Aanchal Singh', terms: ['aanchal singh', 'dr-aanchal-singh', 'dr_aanchal_singh'] },
  { raw: 'dr soumya', terms: ['soumya', 'dr-soumya', 'dr_soumya', 'dr-soumya-m-s', 'dr_soumya_m_s'] },
  { raw: 'Dr. Bindiya Salunke', terms: ['bindiya salunke', 'dr-bindiya-salunke', 'dr_bindiya_salunke'] },
  { raw: 'Dr. Shorya Vardhan Azad', terms: ['shorya vardhan azad', 'dr-shorya-vardhan-azad', 'dr_shorya_vardhan_azad'] },
  { raw: 'Dr. Neelam Pushker', terms: ['neelam pushker', 'dr-neelam-pushker', 'dr_neelam_pushker'] },
  { raw: 'dr. Afreen siddique', terms: ['afreen siddique', 'dr-afreen-siddique', 'dr_afreen_siddique'] },
  { raw: 'dr. Aaishwarya dhabe', terms: ['aaishwarya dhabe', 'dr-aaishwarya-dhabe', 'dr_aaishwarya_dhabe'] },
  { raw: 'Dr. Saurabh Verma', terms: ['saurabh verma', 'dr-saurabh-verma', 'dr_saurabh_verma'] },
  { raw: 'Dr Suresh Raj', terms: ['suresh raj', 'dr-suresh-raj', 'dr_suresh_raj'] },
  { raw: 'dr adi nazir at breach candy hospital mumbai', terms: ['adi nazir', 'dr-adi-nazir', 'dr_adi_nazir'] },
  { raw: 'dr armaity contractor at breach candy hospital mumbai', terms: ['armaity contractor', 'dr-armaity-contractor', 'dr_armaity_contractor'] },
  { raw: 'dr ajay pandey- saifee hospital', terms: ['ajay pandey', 'dr-ajay-pandey', 'dr_ajay_pandey'] }
];

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('======================================================');
  console.log('🔍 SCANNING DATABASE FOR TARGET DOCTORS TO REMOVE...');
  console.log('======================================================\n');

  const { rows: allDoctors } = await pool.query('SELECT id, name, slug FROM doctors');
  console.log(`Current total doctors in DB: ${allDoctors.length}\n`);

  let deletedCount = 0;
  let ignoredCount = 0;
  const deletedList = [];
  const ignoredList = [];

  for (const target of TARGET_DOCTORS) {
    // Find matching doctor in database
    const matches = allDoctors.filter(d => {
      const name = (d.name || '').toLowerCase();
      const slug = (d.slug || '').toLowerCase();
      const id = (d.id || '').toLowerCase();

      return target.terms.some(t => {
        const cleanT = t.toLowerCase();
        return name === cleanT || 
               name === `dr. ${cleanT}` ||
               slug === cleanT ||
               id === cleanT ||
               name.includes(cleanT);
      });
    });

    if (matches.length === 0) {
      console.log(`⚪ [NOT PRESENT / IGNORED]: "${target.raw}"`);
      ignoredList.push(target.raw);
      ignoredCount++;
    } else {
      for (const doc of matches) {
        console.log(`🗑️ [FOUND & DELETING]: "${doc.name}" (ID: ${doc.id}, Slug: ${doc.slug})`);

        // 1. Remove from hospital affiliations
        const affRes = await pool.query('DELETE FROM doctor_hospital_affiliations WHERE doctor_id = $1', [doc.id]);
        if (affRes.rowCount > 0) {
          console.log(`   └─ Removed ${affRes.rowCount} hospital affiliation(s)`);
        }

        // 2. Remove from lab affiliations
        const labRes = await pool.query('DELETE FROM doctor_laboratory_affiliations WHERE doctor_id = $1', [doc.id]);
        if (labRes.rowCount > 0) {
          console.log(`   └─ Removed ${labRes.rowCount} laboratory affiliation(s)`);
        }

        // 3. Remove doctor
        await pool.query('DELETE FROM doctors WHERE id = $1', [doc.id]);
        console.log(`   └─ Deleted doctor record from database.`);

        deletedList.push({ name: doc.name, id: doc.id });
        deletedCount++;
      }
    }
  }

  // Also check and clean frontend/src/data/doctors.ts if any target doctor exists in it
  const frontendDataPath = path.resolve(__dirname, '../../frontend/src/data/doctors.ts');
  if (fs.existsSync(frontendDataPath)) {
    try {
      let fileContent = fs.readFileSync(frontendDataPath, 'utf8');
      let frontendCleaned = 0;

      for (const target of TARGET_DOCTORS) {
        for (const term of target.terms) {
          // If term is in doctors.ts, let's notify
          if (fileContent.toLowerCase().includes(term.toLowerCase())) {
            frontendCleaned++;
          }
        }
      }
      if (frontendCleaned > 0) {
        console.log(`\nℹ️ Found references in frontend/src/data/doctors.ts for some targets.`);
      }
    } catch (e) {
      console.warn('Could not read frontend doctors.ts:', e.message);
    }
  }

  console.log('\n======================================================');
  console.log('📊 SUMMARY:');
  console.log(`   Doctors Deleted from DB: ${deletedCount}`);
  console.log(`   Doctors Ignored (Not Present in DB): ${ignoredCount}`);
  console.log('======================================================');

  // Clear in-memory server cache
  try {
    const cacheRes = await fetch('http://localhost:8000/api/v1/cache/clear', { method: 'POST' });
    if (cacheRes.ok) {
      console.log('✅ In-memory cache reloaded successfully.');
    }
  } catch (e) {
    console.log('ℹ️ Server cache will refresh automatically.');
  }

  await pool.end();
}

main().catch(err => {
  console.error('❌ Error executing deletion:', err);
  process.exit(1);
});

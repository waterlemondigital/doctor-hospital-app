/**
 * HealthDiscover / Medvexa - Unified Media Optimization & Upload Pipeline
 *
 * This single script handles all media operations for hospitals, wellness centers, and doctors:
 * 1. Optimizes all images using Sharp:
 *    - Full view: 1200px max width WebP (progressive quality 80)
 *    - Card thumbnail: 600px max width WebP (fast listing load quality 75)
 *    - Doctor avatar: 320x320 face-focused WebP (quality 84)
 * 2. Uploads to Cloudflare R2 with permanent cache headers:
 *    - Cache-Control: public, max-age=31536000, immutable
 * 3. Updates Neon PostgreSQL database records (hospitals, wellness_centers, doctors).
 * 4. Automatically reloads the Express backend's in-memory directory cache.
 *
 * Usage:
 *   node scripts/media_optimizer_pipeline.js                     # Re-optimize all existing images in R2 & DB
 *   node scripts/media_optimizer_pipeline.js --upload            # Upload & optimize all local data folders
 *   node scripts/media_optimizer_pipeline.js --upload --type=hospitals
 *   node scripts/media_optimizer_pipeline.js --upload --type=wellness
 *   node scripts/media_optimizer_pipeline.js --upload --type=doctors
 *   node scripts/media_optimizer_pipeline.js --type=hospitals   # Optimize existing hospital images
 *   node scripts/media_optimizer_pipeline.js --type=wellness    # Optimize existing wellness images
 *   node scripts/media_optimizer_pipeline.js --type=doctors     # Optimize existing doctor photos
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'medvexa';
const PUBLIC_BASE = (process.env.R2_PUBLIC_URL || 'https://pub-151166afd0294cb99a7c59679d424908.r2.dev/').replace(/\/+$/, '');

const HOSPITAL_DIR = path.resolve('../data/images_hospitals');
const WELLNESS_DIR = path.resolve('../data/images_wellness');
const DOCTOR_DIR = path.resolve('../data/images_doctor');
const LAB_DIR = path.resolve('../data/images_labs');

// -------------------------------------------------------------
// Mappings for Local Folder Uploads
// -------------------------------------------------------------

const HOSPITAL_MAPPINGS = [
  { folderName: ' Apollo Hospitals — Pune', hospitalIds: ['apollo_hospitals_pune'], hospitalName: 'Apollo Hospitals' },
  { folderName: ' Ruby Hall Clinic — Sassoon Road', hospitalIds: ['ruby_hall_clinic_sassoon_road'], hospitalName: 'Ruby Hall Clinic' },
  { folderName: 'Deenanath Mangeshkar Hospital & Research Center', hospitalIds: ['deenanath_mangeshkar_hospital_research_center', 'deenanath_mangeshkar_hospital_and_research_center'], hospitalName: 'Deenanath Mangeshkar Hospital & Research Center' },
  { folderName: 'Jehangir Hospital', hospitalIds: ['jehangir_hospital'], hospitalName: 'Jehangir Hospital' },
  { folderName: 'Jupiter Hospital — Baner', hospitalIds: ['jupiter_hospital_baner'], hospitalName: 'Jupiter Hospital' },
  { folderName: 'KEM Hospital Pune ', hospitalIds: ['kem_hospital_pune'], hospitalName: 'KEM Hospital' },
  { folderName: 'Manipal Hospital — Kharadi', hospitalIds: ['manipal_hospital_kharadi'], hospitalName: 'Manipal Hospital, Kharadi' },
  { folderName: 'Noble Hospitals & Research Centre', hospitalIds: ['noble_hospitals_research_centre'], hospitalName: 'Noble Hospitals & Research Centre' },
  { folderName: 'Sahyadri Super Speciality Hospital  ', hospitalIds: ['sahyadri_super_speciality_hospital'], hospitalName: 'Sahyadri Super Speciality Hospital' },
  { folderName: 'Sassoon General Hospital & B.J. Government Medical College', hospitalIds: ['sassoon_general_hospital_b_j_government_medical_college'], hospitalName: 'Sassoon General Hospital & B.J. Government Medical College' },
];

const WELLNESS_MAPPINGS = [
  { folderName: 'Art of Living Triveni Ashram', centerId: 'art_of_living_triveni_ashram', centerName: 'Art of Living Triveni Ashram' },
  { folderName: 'Atmabodh Wellness Centre (Patanjali Wellness — Pune)', centerId: 'atmabodh_wellness_centre_patanjali_wellness_pune', centerName: 'Atmabodh Wellness Centre (Patanjali Wellness — Pune)' },
  { folderName: 'Atmantan Wellness Centre', centerId: 'atmantan_wellness_centre', centerName: 'Atmantan Wellness Centre' },
  { folderName: 'Kaivalyadhama Health and Yoga Research Center', centerId: 'kaivalyadhama_health_and_yoga_research_center', centerName: 'Kaivalyadhama Health and Yoga Research Center' },
  { folderName: 'National Institute of Naturopathy (NIN), Pune', centerId: 'national_institute_of_naturopathy_nin_pune', centerName: 'National Institute of Naturopathy (NIN), Pune' },
  { folderName: 'Nirvana Nature Cure', centerId: 'nirvana_nature_cure', centerName: 'Nirvana Nature Cure' },
  { folderName: 'Osho International Meditation Resort', centerId: 'osho_international_meditation_resort', centerName: 'Osho International Meditation Resort' },
  { folderName: 'Shree Narayandham Care - Naturopathy Centre', centerId: 'shree_narayandham_care_naturopathy_centre', centerName: 'Shree Narayandham Care / Naturopathy Centre' },
  { folderName: 'Swastik Wellbeing Sanctuary', centerId: 'swastik_wellbeing_sanctuary', centerName: 'Swastik Wellbeing Sanctuary' },
];

const DOCTOR_MAPPINGS = [
  { folderName: ' Dr. Anand Shinde', doctorId: 'dr_anand_shinde', doctorName: 'Dr. Anand Shinde' },
  { folderName: ' Dr. Anita Bawaswraj', doctorId: 'dr_anita_bawaswraj', doctorName: 'Dr. Anita Bawaswraj' },
  { folderName: ' Dr. Chakor Vora', doctorId: 'dr_chakor_vora', doctorName: 'Dr. Chakor Vora' },
  { folderName: 'Dr. Aarti Kamat', doctorId: 'dr_aarti_kamat', doctorName: 'Dr. Aarti Kamat' },
  { folderName: 'Dr. Abhay Kulkarni', doctorId: 'dr_abhay_kulkarni', doctorName: 'Dr. Abhay Kulkarni' },
  { folderName: 'Dr. Abhijeet Naik', doctorId: 'dr_abhijeet_naik', doctorName: 'Dr. Abhijeet Naik' },
  { folderName: 'Dr. Abhijeet Palshikar', doctorId: 'dr_abhijeet_palshikar', doctorName: 'Dr. Abhijeet Palshikar' },
  { folderName: 'Dr. Abhijit Botre', doctorId: 'dr_abhijit_botre', doctorName: 'Dr. Abhijit Botre' },
  { folderName: 'Dr. Abhijit P. Benare', doctorId: 'dr_abhijit_p_benare', doctorName: 'Dr. Abhijit P. Benare' },
  { folderName: 'Dr. Asha Gokhale', doctorId: 'dr_asha_gokhale', doctorName: 'Dr. Asha Gokhale' },
  { folderName: 'Dr. Ashish Trivedi', doctorId: 'dr_ashish_trivedi', doctorName: 'Dr. Ashish Trivedi' },
  { folderName: 'Dr. Ashok Bhanage', doctorId: 'dr_ashok_bhanage', doctorName: 'Dr. Ashok Bhanage' },
  { folderName: 'Dr. Bhushan Joshi', doctorId: 'dr_bhushan_joshi', doctorName: 'Dr. Bhushan Joshi' },
  { folderName: 'Dr. Danish Haroon Memon', doctorId: 'dr_danish_haroon_memon', doctorName: 'Dr. Danish Haroon Memon' },
  { folderName: 'Dr. Dileep Mane', doctorId: 'dr_dileep_mane', doctorName: 'Dr. Dileep Mane' },
  { folderName: 'Dr. Haridas B. Prasad', doctorId: 'dr_haridas_b_prasad', doctorName: 'Dr. Haridas B. Prasad' },
  { folderName: 'Dr. Hemant Wakankar', doctorId: 'dr_hemant_wakankar', doctorName: 'Dr. Hemant Wakankar' },
  { folderName: 'Dr. Ketan Vartak', doctorId: 'dr_ketan_vartak', doctorName: 'Dr. Ketan Vartak' },
  { folderName: 'Dr. Manohar Sakhare', doctorId: 'dr_manohar_sakhare', doctorName: 'Dr. Manohar Sakhare' },
  { folderName: 'Dr. Milind Gadkari', doctorId: 'dr_milind_gadkari', doctorName: 'Dr. Milind Gadkari' },
  { folderName: 'Dr. Purvez K. Grant', doctorId: 'dr_purvez_k_grant', doctorName: 'Dr. Purvez K. Grant' },
  { folderName: 'Dr. Rajesh Parasnis', doctorId: 'dr_rajesh_parasnis', doctorName: 'Dr. Rajesh Parasnis' },
  { folderName: 'Dr. Rashida Patanwala Melinkeri', doctorId: 'dr_rashida_patanwala_melinkeri', doctorName: 'Dr. Rashida Patanwala Melinkeri' },
  { folderName: 'Dr. Reema Y. Kashiva', doctorId: 'dr_reema_y_kashiva', doctorName: 'Dr. Reema Y. Kashiva' },
  { folderName: 'Dr. Sanjay Bafna', doctorId: 'dr_sanjay_bafna', doctorName: 'Dr. Sanjay Bafna' },
  { folderName: 'Dr. Shilpa Naik', doctorId: 'dr_shilpa_naik', doctorName: 'Dr. Shilpa Naik' },
  { folderName: 'Dr. Sonali P. Salvi', doctorId: 'dr_sonali_p_salvi', doctorName: 'Dr. Sonali P. Salvi' },
  { folderName: 'Dr. Sunil Jawale', doctorId: 'dr_sunil_jawale', doctorName: 'Dr. Sunil Jawale' },
  { folderName: 'Dr. Tanmai Yermal (Jain)', doctorId: 'dr_tanmai_yermal_jain', doctorName: 'Dr. Tanmai Yermal (Jain)' },
  { folderName: 'Dr. Vivek Gaikwad', doctorId: 'dr_vivek_gaikwad', doctorName: 'Dr. Vivek Gaikwad' },
];

const LAB_MAPPINGS = [
  { folderName: ' Vijaya PH Diagnostic Centre', labId: 'vijaya_ph_diagnostic_centre', labName: 'Vijaya PH Diagnostic Centre' },
  { folderName: 'AG Diagnostics (Dr Ajit Golwilkar Laboratory)', labId: 'ag_diagnostics_dr_ajit_golwilkar_laboratory', labName: 'AG Diagnostics (Dr Ajit Golwilkar Laboratory)' },
  { folderName: 'Apollo Diagnostics', labId: 'apollo_diagnostics', labName: 'Apollo Diagnostics' },
  { folderName: 'Bharati Hospital — Pathology Laboratory', labId: 'bharati_hospital_pathology_laboratory', labName: 'Bharati Hospital — Pathology Laboratory' },
  { folderName: 'Deenanath Mangeshkar Hospital — Pathology Laboratory', labId: 'deenanath_mangeshkar_hospital_pathology_laboratory', labName: 'Deenanath Mangeshkar Hospital — Pathology Laboratory' },
  { folderName: 'Dr Lal PathLabs', labId: 'dr_lal_pathlabs', labName: 'Dr Lal PathLabs' },
  { folderName: 'Metropolis Healthcare', labId: 'metropolis_healthcare', labName: 'Metropolis Healthcare' },
  { folderName: 'Pioneer Diagnostic Centre', labId: 'pioneer_diagnostic_centre', labName: 'Pioneer Diagnostic Centre' },
  { folderName: 'Suburban Diagnostics', labId: 'suburban_diagnostics', labName: 'Suburban Diagnostics' },
  { folderName: 'Texas Imaging & Labs', labId: 'texas_imaging_labs', labName: 'Texas Imaging & Labs' },
];

// -------------------------------------------------------------
// Core S3 / R2 Utilities
// -------------------------------------------------------------

async function getObjectBuffer(key) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const res = await s3.send(cmd);
  const chunks = [];
  for await (const chunk of res.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function uploadWebpToR2(key, buffer) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  });
  await s3.send(cmd);
  return `${PUBLIC_BASE}/${key}`;
}

function extractKeyFromUrl(url) {
  if (!url) return null;
  return url.replace(PUBLIC_BASE, '').replace(/^\/+/, '');
}

async function reloadBackendCache() {
  console.log('\n========================================');
  console.log('🔄 RELOADING IN-MEMORY DIRECTORY CACHE');
  console.log('========================================');
  try {
    const res = await fetch('http://localhost:8000/api/v1/cache/clear', { method: 'POST' });
    const data = await res.json();
    console.log('✅ In-memory cache reloaded successfully:', data);
  } catch (e) {
    console.warn('⚠️ Could not notify local dev server (it will reload on next server restart):', e.message);
  }
}

// -------------------------------------------------------------
// 1. Audit & Re-Optimize Images Already in R2
// -------------------------------------------------------------

export async function optimizeAllDoctors() {
  console.log('\n========================================');
  console.log('🩺 OPTIMIZING DOCTOR PHOTOS (IN R2)');
  console.log('========================================');

  const { rows: doctors } = await pool.query(
    "SELECT id, name, photo FROM doctors WHERE photo IS NOT NULL AND photo != '' ORDER BY name ASC"
  );
  console.log(`Found ${doctors.length} doctors with photos.`);

  let totalRaw = 0;
  let totalOptimized = 0;

  for (let i = 0; i < doctors.length; i++) {
    const doc = doctors[i];
    const key = extractKeyFromUrl(doc.photo);
    if (!key) continue;

    process.stdout.write(`[${i + 1}/${doctors.length}] ${doc.name}... `);
    try {
      const rawBuf = await getObjectBuffer(key);
      const avatarBuf = await sharp(rawBuf)
        .resize({ width: 320, height: 320, fit: 'cover', position: 'top' })
        .webp({ quality: 84 })
        .toBuffer();

      const newKey = `doctors/${doc.id}/photo.webp`;
      const newUrl = await uploadWebpToR2(newKey, avatarBuf);

      totalRaw += rawBuf.length;
      totalOptimized += avatarBuf.length;

      await pool.query('UPDATE doctors SET photo = $1, updated_at = NOW() WHERE id = $2', [newUrl, doc.id]);
      console.log(`✅ ${(rawBuf.length / 1024).toFixed(0)}KB -> ${(avatarBuf.length / 1024).toFixed(1)}KB`);
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  const reduction = totalRaw > 0 ? ((1 - totalOptimized / totalRaw) * 100).toFixed(1) : 0;
  console.log(`🎉 Doctors complete: ${(totalRaw / 1024 / 1024).toFixed(2)}MB -> ${(totalOptimized / 1024 / 1024).toFixed(2)}MB (${reduction}% reduction)`);
}

export async function optimizeAllHospitals() {
  console.log('\n========================================');
  console.log('🏥 OPTIMIZING HOSPITAL IMAGES (IN R2)');
  console.log('========================================');

  const { rows: hospitals } = await pool.query(
    "SELECT id, name, images FROM hospitals WHERE images IS NOT NULL AND images::text != '[]' ORDER BY name ASC"
  );
  console.log(`Found ${hospitals.length} hospitals with image galleries.`);

  let totalRaw = 0;
  let totalOptimized = 0;

  for (let hIdx = 0; hIdx < hospitals.length; hIdx++) {
    const h = hospitals[hIdx];
    const imageList = typeof h.images === 'string' ? JSON.parse(h.images) : h.images;
    if (!Array.isArray(imageList) || imageList.length === 0) continue;

    console.log(`\n[${hIdx + 1}/${hospitals.length}] Processing "${h.name}" (${imageList.length} images)...`);
    const updatedImages = [];

    for (let imgIdx = 0; imgIdx < imageList.length; imgIdx++) {
      const img = imageList[imgIdx];
      const key = extractKeyFromUrl(img.url);
      if (!key) {
        updatedImages.push(img);
        continue;
      }

      process.stdout.write(`   ⬆️ [${imgIdx + 1}/${imageList.length}] Image ${imgIdx + 1}... `);
      try {
        const rawBuf = await getObjectBuffer(key);

        const fullBuf = await sharp(rawBuf)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        const cardBuf = await sharp(rawBuf)
          .resize({ width: 600, withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toBuffer();

        totalRaw += rawBuf.length;
        totalOptimized += (fullBuf.length + cardBuf.length);

        const fullKey = `hospitals/${h.id}/image_${imgIdx + 1}.webp`;
        const cardKey = `hospitals/${h.id}/image_${imgIdx + 1}_card.webp`;

        const fullUrl = await uploadWebpToR2(fullKey, fullBuf);
        const cardUrl = await uploadWebpToR2(cardKey, cardBuf);

        updatedImages.push({
          url: fullUrl,
          card_url: cardUrl,
          alt: img.alt || `${h.name} - View ${imgIdx + 1}`,
          caption: img.caption || `${h.name} - View ${imgIdx + 1}`,
        });

        console.log(`✅ ${(rawBuf.length / 1024).toFixed(0)}KB -> Full: ${(fullBuf.length / 1024).toFixed(0)}KB, Card: ${(cardBuf.length / 1024).toFixed(0)}KB`);
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        updatedImages.push(img);
      }
    }

    await pool.query('UPDATE hospitals SET images = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(updatedImages), h.id]);
  }

  console.log(`🎉 Hospitals complete: ${(totalRaw / 1024 / 1024).toFixed(2)}MB raw -> ${(totalOptimized / 1024 / 1024).toFixed(2)}MB optimized.`);
}

export async function optimizeAllWellness() {
  console.log('\n========================================');
  console.log('🌿 OPTIMIZING WELLNESS CENTER IMAGES (IN R2)');
  console.log('========================================');

  const { rows: centers } = await pool.query(
    "SELECT id, name, images FROM wellness_centers WHERE images IS NOT NULL AND images::text != '[]' ORDER BY name ASC"
  );
  console.log(`Found ${centers.length} wellness centers with image galleries.`);

  let totalRaw = 0;
  let totalOptimized = 0;

  for (let cIdx = 0; cIdx < centers.length; cIdx++) {
    const c = centers[cIdx];
    const imageList = typeof c.images === 'string' ? JSON.parse(c.images) : c.images;
    if (!Array.isArray(imageList) || imageList.length === 0) continue;

    console.log(`\n[${cIdx + 1}/${centers.length}] Processing "${c.name}" (${imageList.length} images)...`);
    const updatedImages = [];

    for (let imgIdx = 0; imgIdx < imageList.length; imgIdx++) {
      const img = imageList[imgIdx];
      const key = extractKeyFromUrl(img.url);
      if (!key) {
        updatedImages.push(img);
        continue;
      }

      process.stdout.write(`   ⬆️ [${imgIdx + 1}/${imageList.length}] Image ${imgIdx + 1}... `);
      try {
        const rawBuf = await getObjectBuffer(key);

        const fullBuf = await sharp(rawBuf)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        const cardBuf = await sharp(rawBuf)
          .resize({ width: 600, withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toBuffer();

        totalRaw += rawBuf.length;
        totalOptimized += (fullBuf.length + cardBuf.length);

        const fullKey = `wellness/${c.id}/image_${imgIdx + 1}.webp`;
        const cardKey = `wellness/${c.id}/image_${imgIdx + 1}_card.webp`;

        const fullUrl = await uploadWebpToR2(fullKey, fullBuf);
        const cardUrl = await uploadWebpToR2(cardKey, cardBuf);

        updatedImages.push({
          url: fullUrl,
          card_url: cardUrl,
          alt: img.alt || `${c.name} - View ${imgIdx + 1}`,
          caption: img.caption || `${c.name} - View ${imgIdx + 1}`,
        });

        console.log(`✅ ${(rawBuf.length / 1024).toFixed(0)}KB -> Full: ${(fullBuf.length / 1024).toFixed(0)}KB, Card: ${(cardBuf.length / 1024).toFixed(0)}KB`);
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        updatedImages.push(img);
      }
    }

    await pool.query('UPDATE wellness_centers SET images = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(updatedImages), c.id]);
  }

  console.log(`🎉 Wellness centers complete: ${(totalRaw / 1024 / 1024).toFixed(2)}MB raw -> ${(totalOptimized / 1024 / 1024).toFixed(2)}MB optimized.`);
}

export async function optimizeAllLabs() {
  console.log('\n========================================');
  console.log('🧪 OPTIMIZING LABORATORY IMAGES (IN R2)');
  console.log('========================================');

  const { rows: labs } = await pool.query(
    "SELECT id, name, images FROM laboratories WHERE images IS NOT NULL AND images::text != '[]' ORDER BY name ASC"
  );
  console.log(`Found ${labs.length} laboratories with image galleries.`);

  let totalRaw = 0;
  let totalOptimized = 0;

  for (let lIdx = 0; lIdx < labs.length; lIdx++) {
    const l = labs[lIdx];
    const imageList = typeof l.images === 'string' ? JSON.parse(l.images) : l.images;
    if (!Array.isArray(imageList) || imageList.length === 0) continue;

    console.log(`\n[${lIdx + 1}/${labs.length}] Processing "${l.name}" (${imageList.length} images)...`);
    const updatedImages = [];

    for (let imgIdx = 0; imgIdx < imageList.length; imgIdx++) {
      const img = imageList[imgIdx];
      const key = extractKeyFromUrl(img.url);
      if (!key) {
        updatedImages.push(img);
        continue;
      }

      process.stdout.write(`   ⬆️ [${imgIdx + 1}/${imageList.length}] Image ${imgIdx + 1}... `);
      try {
        const rawBuf = await getObjectBuffer(key);

        const fullBuf = await sharp(rawBuf)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        const cardBuf = await sharp(rawBuf)
          .resize({ width: 600, withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toBuffer();

        totalRaw += rawBuf.length;
        totalOptimized += (fullBuf.length + cardBuf.length);

        const fullKey = `labs/${l.id}/image_${imgIdx + 1}.webp`;
        const cardKey = `labs/${l.id}/image_${imgIdx + 1}_card.webp`;

        const fullUrl = await uploadWebpToR2(fullKey, fullBuf);
        const cardUrl = await uploadWebpToR2(cardKey, cardBuf);

        updatedImages.push({
          url: fullUrl,
          card_url: cardUrl,
          alt: img.alt || `${l.name} - View ${imgIdx + 1}`,
          caption: img.caption || `${l.name} - Diagnostic Center View ${imgIdx + 1}`,
        });

        console.log(`✅ ${(rawBuf.length / 1024).toFixed(0)}KB -> Full: ${(fullBuf.length / 1024).toFixed(0)}KB, Card: ${(cardBuf.length / 1024).toFixed(0)}KB`);
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        updatedImages.push(img);
      }
    }

    await pool.query('UPDATE laboratories SET images = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(updatedImages), l.id]);
  }

  console.log(`🎉 Laboratories complete: ${(totalRaw / 1024 / 1024).toFixed(2)}MB raw -> ${(totalOptimized / 1024 / 1024).toFixed(2)}MB optimized.`);
}

// -------------------------------------------------------------
// 2. Upload & Optimize New Images from Local Folders
// -------------------------------------------------------------

export async function uploadLocalHospitals(customDir) {
  const dir = customDir || HOSPITAL_DIR;
  console.log(`\n========================================`);
  console.log(`🏥 UPLOADING LOCAL HOSPITAL IMAGES (${dir})`);
  console.log(`========================================`);

  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ Directory not found: ${dir}`);
    return;
  }

  for (const item of HOSPITAL_MAPPINGS) {
    const folderPath = path.join(dir, item.folderName);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath).filter((f) => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase()));
    if (files.length === 0) continue;

    console.log(`📁 "${item.hospitalName}" (${files.length} images)...`);
    const imageObjects = [];
    const primaryId = item.hospitalIds[0];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawBuf = fs.readFileSync(path.join(folderPath, file));

      const fullBuf = await sharp(rawBuf).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toBuffer();
      const cardBuf = await sharp(rawBuf).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 75, effort: 4 }).toBuffer();

      const fullKey = `hospitals/${primaryId}/image_${i + 1}.webp`;
      const cardKey = `hospitals/${primaryId}/image_${i + 1}_card.webp`;

      const fullUrl = await uploadWebpToR2(fullKey, fullBuf);
      const cardUrl = await uploadWebpToR2(cardKey, cardBuf);

      imageObjects.push({
        url: fullUrl,
        card_url: cardUrl,
        alt: `${item.hospitalName} - View ${i + 1}`,
        caption: `${item.hospitalName} - Facility View ${i + 1}`,
      });
    }

    for (const hId of item.hospitalIds) {
      await pool.query('UPDATE hospitals SET images = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(imageObjects), hId]);
    }
  }
}

export async function uploadLocalWellness(customDir) {
  const dir = customDir || WELLNESS_DIR;
  console.log(`\n========================================`);
  console.log(`🌿 UPLOADING LOCAL WELLNESS IMAGES (${dir})`);
  console.log(`========================================`);

  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ Directory not found: ${dir}`);
    return;
  }

  for (const item of WELLNESS_MAPPINGS) {
    const folderPath = path.join(dir, item.folderName);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath).filter((f) => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase()));
    if (files.length === 0) continue;

    console.log(`📁 "${item.centerName}" (${files.length} images)...`);
    const imageObjects = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawBuf = fs.readFileSync(path.join(folderPath, file));

      const fullBuf = await sharp(rawBuf).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toBuffer();
      const cardBuf = await sharp(rawBuf).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 75, effort: 4 }).toBuffer();

      const fullKey = `wellness/${item.centerId}/image_${i + 1}.webp`;
      const cardKey = `wellness/${item.centerId}/image_${i + 1}_card.webp`;

      const fullUrl = await uploadWebpToR2(fullKey, fullBuf);
      const cardUrl = await uploadWebpToR2(cardKey, cardBuf);

      imageObjects.push({
        url: fullUrl,
        card_url: cardUrl,
        alt: `${item.centerName} - View ${i + 1}`,
        caption: `${item.centerName} - Campus & Facility View ${i + 1}`,
      });
    }

    await pool.query('UPDATE wellness_centers SET images = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(imageObjects), item.centerId]);
  }
}

export async function uploadLocalDoctors(customDir) {
  const dir = customDir || DOCTOR_DIR;
  console.log(`\n========================================`);
  console.log(`🩺 UPLOADING LOCAL DOCTOR PHOTOS (${dir})`);
  console.log(`========================================`);

  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ Directory not found: ${dir}`);
    return;
  }

  for (let idx = 0; idx < DOCTOR_MAPPINGS.length; idx++) {
    const item = DOCTOR_MAPPINGS[idx];
    const folderPath = path.join(dir, item.folderName);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath).filter((f) => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase()));
    if (files.length === 0) continue;

    const rawBuf = fs.readFileSync(path.join(folderPath, files[0]));
    const avatarBuf = await sharp(rawBuf).resize({ width: 320, height: 320, fit: 'cover', position: 'top' }).webp({ quality: 84 }).toBuffer();

    const r2Key = `doctors/${item.doctorId}/photo.webp`;
    const publicUrl = await uploadWebpToR2(r2Key, avatarBuf);

    await pool.query('UPDATE doctors SET photo = $1, updated_at = NOW() WHERE id = $2', [publicUrl, item.doctorId]);
    console.log(`✅ [${idx + 1}/${DOCTOR_MAPPINGS.length}] ${item.doctorName}`);
  }
}

export async function uploadLocalLabs(customDir) {
  const dir = customDir || LAB_DIR;
  console.log(`\n========================================`);
  console.log(`🧪 UPLOADING LOCAL LABORATORY IMAGES (${dir})`);
  console.log(`========================================`);

  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ Directory not found: ${dir}`);
    return;
  }

  for (const item of LAB_MAPPINGS) {
    const folderPath = path.join(dir, item.folderName);
    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️ Folder not found: "${item.folderName}"`);
      continue;
    }

    const files = fs.readdirSync(folderPath).filter((f) => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase()));
    if (files.length === 0) continue;

    // Natural sort prioritizing main image first
    files.sort((a, b) => {
      if (a.startsWith('image.') && !b.startsWith('image.')) return -1;
      if (!a.startsWith('image.') && b.startsWith('image.')) return 1;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    console.log(`📁 "${item.labName}" (${files.length} images)...`);
    const imageObjects = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawBuf = fs.readFileSync(path.join(folderPath, file));

      const fullBuf = await sharp(rawBuf).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toBuffer();
      const cardBuf = await sharp(rawBuf).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 75, effort: 4 }).toBuffer();

      const fullKey = `labs/${item.labId}/image_${i + 1}.webp`;
      const cardKey = `labs/${item.labId}/image_${i + 1}_card.webp`;

      const fullUrl = await uploadWebpToR2(fullKey, fullBuf);
      const cardUrl = await uploadWebpToR2(cardKey, cardBuf);

      imageObjects.push({
        url: fullUrl,
        card_url: cardUrl,
        alt: `${item.labName} - View ${i + 1}`,
        caption: `${item.labName} - Diagnostic Facility & Testing Center ${i + 1}`,
      });
      console.log(`   ⬆️ [${i + 1}/${files.length}] ${file} -> ${fullKey} (${(fullBuf.length / 1024).toFixed(1)} KB) & card (${(cardBuf.length / 1024).toFixed(1)} KB)`);
    }

    await pool.query('UPDATE laboratories SET images = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(imageObjects), item.labId]);
    console.log(`   💾 Database updated for ${item.labName}`);
  }
}

// -------------------------------------------------------------
// CLI Dispatcher
// -------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const isUpload = args.includes('--upload');
  const typeArg = args.find((a) => a.startsWith('--type='));
  const type = typeArg ? typeArg.split('=')[1] : 'all';

  console.log('⚡ HealthDiscover Unified Media Pipeline');
  console.log(`Bucket: ${BUCKET} | Action: ${isUpload ? 'LOCAL_UPLOAD' : 'OPTIMIZE_R2'} | Target: ${type}`);

  if (isUpload) {
    if (type === 'all' || type === 'hospitals') await uploadLocalHospitals();
    if (type === 'all' || type === 'wellness') await uploadLocalWellness();
    if (type === 'all' || type === 'labs' || type === 'laboratories') await uploadLocalLabs();
    if (type === 'all' || type === 'doctors') await uploadLocalDoctors();
  } else {
    if (type === 'all' || type === 'doctors') await optimizeAllDoctors();
    if (type === 'all' || type === 'hospitals') await optimizeAllHospitals();
    if (type === 'all' || type === 'wellness') await optimizeAllWellness();
    if (type === 'all' || type === 'labs' || type === 'laboratories') await optimizeAllLabs();
  }

  await reloadBackendCache();
  await pool.end();

  console.log('\n🚀 PIPELINE EXECUTION FINISHED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('Fatal pipeline error:', err);
  process.exit(1);
});

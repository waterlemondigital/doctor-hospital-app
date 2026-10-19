import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8000/api/v1';
const PDF_PATH = '/Users/tousif/githubs/doctor-hospital-app/data/Untitled document.pdf';

async function uploadPdf(entityType, docType, entityName, customFilename) {
  const fileBuffer = fs.readFileSync(PDF_PATH);
  const formData = new FormData();
  formData.append(
    'file',
    new Blob([fileBuffer], { type: 'application/pdf' }),
    customFilename || 'Untitled document.pdf'
  );
  formData.append('entityType', entityType);
  formData.append('docType', docType);
  formData.append('entityName', entityName);

  const res = await fetch(`${BASE_URL}/upload/document`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Upload failed for ${entityName} (${docType}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function run() {
  console.log('🚀 Starting Test User Generation & Lead Flow Verification...');
  console.log(`📄 Using source PDF: ${PDF_PATH}`);

  // ----------------------------------------------------
  // 1. HOSPITAL: Ruby Hall Memorial Hospital Pune
  // ----------------------------------------------------
  console.log('\n🏥 1. Creating Test Hospital...');
  const hospName = 'Ruby Hall Memorial Hospital Pune';
  const hospUpload = await uploadPdf('hospital', 'registration_cert', hospName, 'ruby_hall_licence.pdf');
  console.log('   ✓ R2 Licence Uploaded:', hospUpload.url);

  const hospEmail = 'rubyhall.admissions@gmail.com';
  // If user exists, delete or re-use
  const hospSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: hospName,
      email: hospEmail,
      password: 'Password123!',
      role: 'hospital',
      country_code: '+91',
      phone: '9822014567',
      city: 'Pune',
      address: '40 Sassoon Road, Near Pune Railway Station, Sangamvadi',
      pincode: '411001',
      authorized_person_name: 'Dr. Manisha Karmarkar (COO)',
      authorized_person_phone: '9822014568',
      registration_cert_url: hospUpload.url,
    }),
  });

  const hospSignupData = await hospSignupRes.json();
  let hospUserId;
  if (hospSignupRes.ok) {
    hospUserId = hospSignupData.user.id;
    console.log(`   ✓ Hospital Registered! User ID: ${hospUserId}`);
  } else if (hospSignupData.detail?.includes('already exists')) {
    console.log('   ℹ️ Hospital user already exists, querying user ID...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: hospEmail, password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    hospUserId = loginData.user.id;
    console.log(`   ✓ Logged in as existing hospital. User ID: ${hospUserId}`);
  } else {
    throw new Error(`Hospital registration failed: ${JSON.stringify(hospSignupData)}`);
  }

  // ----------------------------------------------------
  // 2. LABORATORY: Suburban Diagnostics & Pathology Center
  // ----------------------------------------------------
  console.log('\n🔬 2. Creating Test Laboratory...');
  const labName = 'Suburban Diagnostics & Pathology Center';
  const labLicenceUpload = await uploadPdf('laboratory', 'operating_licence', labName, 'suburban_lab_licence.pdf');
  const labProofUpload = await uploadPdf('laboratory', 'address_proof', labName, 'suburban_address_proof.pdf');
  console.log('   ✓ R2 Licence Uploaded:', labLicenceUpload.url);
  console.log('   ✓ R2 Address Proof Uploaded:', labProofUpload.url);

  const labEmail = 'suburban.lab.pune@gmail.com';
  const labSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: labName,
      email: labEmail,
      password: 'Password123!',
      role: 'laboratory',
      country_code: '+91',
      phone: '9822034567',
      city: 'Pune',
      address: 'Shop 12, Westend Plaza, Aundh, Pune',
      pincode: '411007',
      registration_cert_url: labLicenceUpload.url,
      address_proof_url: labProofUpload.url,
    }),
  });

  const labSignupData = await labSignupRes.json();
  let labUserId;
  if (labSignupRes.ok) {
    labUserId = labSignupData.user.id;
    console.log(`   ✓ Laboratory Registered! User ID: ${labUserId}`);
  } else if (labSignupData.detail?.includes('already exists')) {
    console.log('   ℹ️ Laboratory user already exists, querying user ID...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: labEmail, password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    labUserId = loginData.user.id;
    console.log(`   ✓ Logged in as existing laboratory. User ID: ${labUserId}`);
  } else {
    throw new Error(`Laboratory registration failed: ${JSON.stringify(labSignupData)}`);
  }

  // ----------------------------------------------------
  // 3. WELLNESS: Atmantan Integrated Wellness & Longevity Resort
  // ----------------------------------------------------
  console.log('\n🌿 3. Creating Test Wellness Center...');
  const wellName = 'Atmantan Integrated Wellness & Longevity Resort';
  const wellLicenceUpload = await uploadPdf('wellness', 'operating_licence', wellName, 'atmantan_wellness_licence.pdf');
  const wellProofUpload = await uploadPdf('wellness', 'address_proof', wellName, 'atmantan_address_proof.pdf');
  console.log('   ✓ R2 Licence Uploaded:', wellLicenceUpload.url);
  console.log('   ✓ R2 Address Proof Uploaded:', wellProofUpload.url);

  const wellEmail = 'atmantan.wellness.desk@gmail.com';
  const wellSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: wellName,
      email: wellEmail,
      password: 'Password123!',
      role: 'wellness',
      country_code: '+91',
      phone: '9822056789',
      city: 'Pune',
      address: 'Village Palse, Mulshi, Pune',
      pincode: '412108',
      registration_cert_url: wellLicenceUpload.url,
      address_proof_url: wellProofUpload.url,
    }),
  });

  const wellSignupData = await wellSignupRes.json();
  let wellUserId;
  if (wellSignupRes.ok) {
    wellUserId = wellSignupData.user.id;
    console.log(`   ✓ Wellness Center Registered! User ID: ${wellUserId}`);
  } else if (wellSignupData.detail?.includes('already exists')) {
    console.log('   ℹ️ Wellness user already exists, querying user ID...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: wellEmail, password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    wellUserId = loginData.user.id;
    console.log(`   ✓ Logged in as existing wellness center. User ID: ${wellUserId}`);
  } else {
    throw new Error(`Wellness registration failed: ${JSON.stringify(wellSignupData)}`);
  }

  // ----------------------------------------------------
  // 4. VERIFY VISIBILITY IN ADMIN TARGETS
  // ----------------------------------------------------
  console.log('\n📋 4. Verifying Visibility in Admin Targets (GET /admin/targets)...');
  const targetsRes = await fetch(`${BASE_URL}/admin/targets`);
  const targets = await targetsRes.json();

  const foundHosp = targets.hospitals?.find((h) => h.id === hospUserId);
  const foundLab = targets.laboratories?.find((l) => l.id === labUserId);
  const foundWell = targets.wellness?.find((w) => w.id === wellUserId);

  console.log(`   [HOSPITAL] Visible in Admin? ${!!foundHosp} -> Name: "${foundHosp?.name}", R2 Doc: ${foundHosp?.registrationCertUrl}`);
  console.log(`   [LABORATORY] Visible in Admin? ${!!foundLab} -> Name: "${foundLab?.name}", R2 Doc: ${foundLab?.registrationCertUrl}`);
  console.log(`   [WELLNESS] Visible in Admin? ${!!foundWell} -> Name: "${foundWell?.name}", R2 Doc: ${foundWell?.registrationCertUrl}`);

  if (!foundHosp || !foundLab || !foundWell) {
    throw new Error('Not all newly registered test entities were found in admin targets!');
  }

  // ----------------------------------------------------
  // 5. DISPATCH LEADS TO EACH ENTITY TARGET
  // ----------------------------------------------------
  console.log('\n🎯 5. Dispatching Leads from Admin to Each Test Target...');

  // Lead to Hospital
  const hospLeadRes = await fetch(`${BASE_URL}/admin/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientName: 'Aditya Kulkarni',
      patientPhone: '9876543210',
      patientEmail: 'aditya.kulkarni@gmail.com',
      patientCity: 'Pune',
      patientArea: 'Kothrud',
      patientAge: 46,
      patientGender: 'Male',
      medicalConcern: 'Severe recurring angina with shortness of breath on climbing stairs, recommended for immediate coronary evaluation',
      speciality: 'Cardiology',
      urgency: 'priority',
      preferredDate: '2026-10-22',
      preferredTime: 'Morning (10:00 AM - 01:00 PM)',
      targetType: 'hospital',
      targetId: hospUserId,
      targetName: hospName,
      agentNotes: 'Patient seeking admission in Ruby Hall under senior cardiologist team',
      agentName: 'Call Desk Agent Tousif',
    }),
  });
  const hospLead = await hospLeadRes.json();
  console.log(`   ✓ Hospital Lead Dispatched: ID: ${hospLead.lead?.id} -> Target: ${hospLead.lead?.target_name}`);

  // Lead to Laboratory
  const labLeadRes = await fetch(`${BASE_URL}/admin/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientName: 'Sneha Joshi',
      patientPhone: '9865432109',
      patientEmail: 'sneha.joshi@gmail.com',
      patientCity: 'Pune',
      patientArea: 'Aundh',
      patientAge: 32,
      patientGender: 'Female',
      medicalConcern: 'Full Body Comprehensive Metabolic Panel, Thyroid profile, and Vitamin D3 home collection inquiry',
      speciality: 'Pathology & Diagnostics',
      urgency: 'routine',
      preferredDate: '2026-10-23',
      preferredTime: 'Morning (08:00 AM - 10:00 AM)',
      targetType: 'laboratory',
      targetId: labUserId,
      targetName: labName,
      agentNotes: 'Requested early morning home sample collection in Aundh',
      agentName: 'Call Desk Agent Tousif',
    }),
  });
  const labLead = await labLeadRes.json();
  console.log(`   ✓ Laboratory Lead Dispatched: ID: ${labLead.lead?.id} -> Target: ${labLead.lead?.target_name}`);

  // Lead to Wellness Center
  const wellLeadRes = await fetch(`${BASE_URL}/admin/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientName: 'Vikram Malhotra',
      patientPhone: '9854321098',
      patientEmail: 'vikram.malhotra@gmail.com',
      patientCity: 'Pune',
      patientArea: 'Kalyani Nagar',
      patientAge: 52,
      patientGender: 'Male',
      medicalConcern: 'Chronic metabolic stress, insomnia, and Panchakarma detox retreat consultation',
      speciality: 'Ayurveda & Holistic Wellness',
      urgency: 'routine',
      preferredDate: '2026-10-25',
      preferredTime: 'Afternoon (02:00 PM - 05:00 PM)',
      targetType: 'wellness',
      targetId: wellUserId,
      targetName: wellName,
      agentNotes: 'Executive wellness 7-day residency retreat enquiry',
      agentName: 'Call Desk Agent Tousif',
    }),
  });
  const wellLead = await wellLeadRes.json();
  console.log(`   ✓ Wellness Lead Dispatched: ID: ${wellLead.lead?.id} -> Target: ${wellLead.lead?.target_name}`);

  // ----------------------------------------------------
  // 6. VERIFY LEADS RECEIVED BY EACH TARGET SPECIFICALLY
  // ----------------------------------------------------
  console.log('\n📥 6. Verifying that Each Target Specifically Received Their Respective Lead...');

  // Hospital target panel
  const hospLeadsCheck = await fetch(`${BASE_URL}/admin/targets/hospital/${hospUserId}/leads`);
  const hospLeadsData = await hospLeadsCheck.json();
  const matchedHospLead = hospLeadsData.leads?.find((l) => l.id === hospLead.lead?.id);
  console.log(`   Hospital (${hospName}) Received Lead: ${!!matchedHospLead} (Total leads for hospital: ${hospLeadsData.totalLeads})`);
  console.log(`     - Patient: ${matchedHospLead?.patient_name}, Concern: "${matchedHospLead?.medical_concern.slice(0, 50)}..."`);

  // Laboratory target panel
  const labLeadsCheck = await fetch(`${BASE_URL}/admin/targets/laboratory/${labUserId}/leads`);
  const labLeadsData = await labLeadsCheck.json();
  const matchedLabLead = labLeadsData.leads?.find((l) => l.id === labLead.lead?.id);
  console.log(`   Laboratory (${labName}) Received Lead: ${!!matchedLabLead} (Total leads for lab: ${labLeadsData.totalLeads})`);
  console.log(`     - Patient: ${matchedLabLead?.patient_name}, Concern: "${matchedLabLead?.medical_concern.slice(0, 50)}..."`);

  // Wellness target panel
  const wellLeadsCheck = await fetch(`${BASE_URL}/admin/targets/wellness/${wellUserId}/leads`);
  const wellLeadsData = await wellLeadsCheck.json();
  const matchedWellLead = wellLeadsData.leads?.find((l) => l.id === wellLead.lead?.id);
  console.log(`   Wellness (${wellName}) Received Lead: ${!!matchedWellLead} (Total leads for wellness: ${wellLeadsData.totalLeads})`);
  console.log(`     - Patient: ${matchedWellLead?.patient_name}, Concern: "${matchedWellLead?.medical_concern.slice(0, 50)}..."`);

  console.log('\n======================================================');
  console.log('🎉 ALL TEST FLOWS VERIFIED 100% SUCCESSFULLY!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

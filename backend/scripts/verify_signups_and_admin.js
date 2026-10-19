import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8000/api/v1';

async function runTests() {
  console.log('🧪 1. Testing Document Upload to Cloudflare R2...');

  // Create a minimal valid sample PDF buffer
  const samplePdfBuffer = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Title (MedVexa Verification Document) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
  );

  const testPdfPath = path.resolve('scripts/sample_test.pdf');
  fs.writeFileSync(testPdfPath, samplePdfBuffer);

  // Upload hospital licence PDF to R2
  const formData = new FormData();
  formData.append('file', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'sahyadri_operating_licence.pdf');
  formData.append('entityType', 'hospital');
  formData.append('docType', 'registration_cert');
  formData.append('entityName', 'Sahyadri Super Speciality');

  const uploadRes = await fetch(`${BASE_URL}/upload/document`, {
    method: 'POST',
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log('Upload Response:', uploadRes.status, uploadData);
  if (!uploadData.url) {
    throw new Error('Upload failed: ' + JSON.stringify(uploadData));
  }
  console.log('✅ Document uploaded to Cloudflare R2 successfully!');
  console.log('   - R2 Key:', uploadData.key);
  console.log('   - Public R2 URL:', uploadData.url);

  // 2. Hospital Signup Test
  console.log('\n🏥 2. Testing Hospital Signup...');
  const hospEmail = `sahyadri.desk.${Date.now()}@medvexa.health`;
  const hospRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sahyadri Super Speciality Hospital Deccan',
      email: hospEmail,
      password: 'Password123!',
      role: 'hospital',
      country_code: '+91',
      phone: '9822011223',
      city: 'Pune',
      address: 'Plot No. 30 C, Erandwane, Deccan Gymkhana, Pune',
      pincode: '411004',
      authorized_person_name: 'Dr. Charudutt Apte (Chairman)',
      authorized_person_phone: '9822011224',
      registration_cert_url: uploadData.url,
    }),
  });

  const hospData = await hospRes.json();
  console.log('Hospital Signup Response:', hospRes.status, hospData.message, 'User ID:', hospData.user?.id);

  // 3. Laboratory Signup Test
  console.log('\n🔬 3. Testing Laboratory Signup...');
  const labEmail = `metropolis.desk.${Date.now()}@medvexa.health`;
  const labRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Metropolis Healthcare & Molecular Diagnostics',
      email: labEmail,
      password: 'Password123!',
      role: 'laboratory',
      country_code: '+91',
      phone: '9822033445',
      city: 'Pune',
      address: 'Shop 4, Tilak Road, Sadashiv Peth, Pune',
      pincode: '411030',
      registration_cert_url: uploadData.url,
      address_proof_url: uploadData.url,
    }),
  });

  const labData = await labRes.json();
  console.log('Laboratory Signup Response:', labRes.status, labData.message, 'User ID:', labData.user?.id);

  // 4. Wellness Center Signup Test
  console.log('\n🌿 4. Testing Wellness Center Signup...');
  const wellEmail = `ayurcare.desk.${Date.now()}@medvexa.health`;
  const wellRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Punarvasu Ayurveda & Panchakarma Sanctuary',
      email: wellEmail,
      password: 'Password123!',
      role: 'wellness',
      country_code: '+91',
      phone: '9822055667',
      city: 'Pune',
      address: 'Lane 7, Koregaon Park North Main Road, Pune',
      pincode: '411001',
      registration_cert_url: uploadData.url,
      address_proof_url: uploadData.url,
    }),
  });

  const wellData = await wellRes.json();
  console.log('Wellness Center Signup Response:', wellRes.status, wellData.message, 'User ID:', wellData.user?.id);

  // 5. Check Admin Targets
  console.log('\n📋 5. Checking Admin Targets...');
  const targetsRes = await fetch(`${BASE_URL}/admin/targets`);
  const targetsData = await targetsRes.json();
  console.log('Targets Summary:');
  console.log('  - Doctors count:', targetsData.doctors?.length);
  console.log('  - Hospitals count:', targetsData.hospitals?.length);
  console.log('  - Laboratories count:', targetsData.laboratories?.length);
  console.log('  - Wellness centers count:', targetsData.wellness?.length);

  const foundHosp = targetsData.hospitals?.find((h) => h.id === hospData.user?.id);
  const foundLab = targetsData.laboratories?.find((l) => l.id === labData.user?.id);
  const foundWell = targetsData.wellness?.find((w) => w.id === wellData.user?.id);

  console.log('Found newly registered Hospital in Admin Targets:', !!foundHosp, foundHosp?.name);
  console.log('   - R2 Licence URL:', foundHosp?.registrationCertUrl);
  console.log('Found newly registered Lab in Admin Targets:', !!foundLab, foundLab?.name);
  console.log('   - R2 Licence URL:', foundLab?.registrationCertUrl);
  console.log('Found newly registered Wellness in Admin Targets:', !!foundWell, foundWell?.name);
  console.log('   - R2 Licence URL:', foundWell?.registrationCertUrl);

  // 6. Test Admin Dispatching a lead to the newly registered Hospital
  console.log('\n🎯 6. Testing Lead Dispatch to Registered Hospital...');
  const leadRes = await fetch(`${BASE_URL}/admin/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientName: 'Rohan Deshmukh',
      patientPhone: '9823012345',
      patientCity: 'Pune',
      medicalConcern: 'Severe chest discomfort and shortness of breath upon exertion',
      speciality: 'Cardiology',
      urgency: 'priority',
      targetType: 'hospital',
      targetId: hospData.user?.id,
      targetName: 'Sahyadri Super Speciality Hospital Deccan',
      agentNotes: 'Family requested admission inquiry under Dr. Apte team',
    }),
  });

  const leadData = await leadRes.json();
  console.log('Lead Dispatch Response:', leadRes.status, leadData.message);
  console.log('   - Dispatched Lead ID:', leadData.lead?.id);
  console.log('   - Target Status:', leadData.lead?.target_account_status);

  // Clean up temporary test file
  if (fs.existsSync(testPdfPath)) {
    fs.unlinkSync(testPdfPath);
  }

  console.log('\n✨ ALL TESTS COMPLETED SUCCESSFULLY! ✨');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

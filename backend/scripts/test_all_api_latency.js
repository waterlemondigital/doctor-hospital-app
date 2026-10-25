#!/usr/bin/env node
/**
 * Comprehensive latency and performance benchmark for all MedVexa API endpoints (Node.js version).
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

const ENDPOINTS = [
  ['/', 'Root System Info'],
  ['/api/v1/health', 'Database & Server Health Check'],
  ['/api/v1/cache/status', 'API Cache Status & Metrics'],

  // Hospitals Directory
  ['/api/v1/hospitals', 'All Hospitals (National 71 Facilities)'],
  ['/api/v1/hospitals?city=pune', 'Hospitals Filtered by Pune'],
  ['/api/v1/hospitals?city=mumbai', 'Hospitals Filtered by Mumbai'],
  ['/api/v1/hospitals?city=new%20delhi', 'Hospitals Filtered by New Delhi'],
  ['/api/v1/hospitals?city=bengaluru', 'Hospitals Filtered by Bengaluru'],
  ['/api/v1/hospitals?search=cardiology', 'Hospitals Search by Speciality'],

  // Single Hospital Details
  ['/api/v1/hospitals/all-india-institute-of-medical-sciences-aiims-new-delhi', 'Hospital Detail: AIIMS New Delhi'],
  ['/api/v1/hospitals/medanta-the-medicity', 'Hospital Detail: Medanta Gurugram'],
  ['/api/v1/hospitals/kokilaben-dhirubhai-ambani-hospital', 'Hospital Detail: Kokilaben Mumbai'],
  ['/api/v1/hospitals/narayana-institute-of-cardiac-sciences', 'Hospital Detail: Narayana Bengaluru'],
  ['/api/v1/hospitals/sahyadri-super-speciality-hospital', 'Hospital Detail: Sahyadri Pune'],
  ['/api/v1/hospitals/ruby-hall-clinic', 'Hospital Detail: Ruby Hall Clinic'],

  // Doctors Directory
  ['/api/v1/doctors', 'All Doctors (48 Verified Specialists)'],
  ['/api/v1/doctors?city=pune', 'Doctors Filtered by Pune'],
  ['/api/v1/doctors?city=mumbai', 'Doctors Filtered by Mumbai'],
  ['/api/v1/doctors?city=new%20delhi', 'Doctors Filtered by New Delhi'],
  ['/api/v1/doctors?city=bengaluru', 'Doctors Filtered by Bengaluru'],
  ['/api/v1/doctors?speciality=Ophthalmology', 'Doctors Filtered by Speciality'],

  // Single Doctor Details
  ['/api/v1/doctors/dr-radhika-tandon', 'Doctor Detail: Dr. Radhika Tandon'],
  ['/api/v1/doctors/dr-arvind-kumar', 'Doctor Detail: Dr. Arvind Kumar'],
  ['/api/v1/doctors/dr-abhaya-kumar', 'Doctor Detail: Dr. Abhaya Kumar'],
  ['/api/v1/doctors/dr-a-asha', 'Doctor Detail: Dr. A Asha'],
  ['/api/v1/doctors/dr-rashida-patanwala-melinkeri', 'Doctor Detail: Dr. Rashida Melinkeri'],

  // Laboratories Directory
  ['/api/v1/laboratories', 'All Diagnostic Laboratories'],
  ['/api/v1/laboratories?city=pune', 'Laboratories Filtered by Pune'],
  ['/api/v1/laboratories?search=pathology', 'Laboratories Search by Service'],

  // Wellness Clinics Directory
  ['/api/v1/wellness-centers', 'All Wellness Centers & Clinics'],
  ['/api/v1/wellness-centers?city=pune', 'Wellness Centers Filtered by Pune'],

  // Metadata & Taxonomy
  ['/api/v1/cities', 'Supported Cities Taxonomy'],
  ['/api/v1/specialities', 'Clinical Specialities Taxonomy'],
];

async function testEndpoint(path) {
  const url = `${BASE_URL}${path}`;
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Encoding': 'gzip',
        Accept: 'application/json',
      },
    });
    const text = await res.text();
    const elapsedMs = performance.now() - t0;
    const cacheHeader = res.headers.get('X-Cache') || 'N/A';
    const sizeKb = Buffer.byteLength(text, 'utf8') / 1024;

    return {
      ok: res.ok,
      status: res.status,
      latency_ms: elapsedMs,
      cache: cacheHeader,
      size_kb: sizeKb,
    };
  } catch (err) {
    const elapsedMs = performance.now() - t0;
    return {
      ok: false,
      status: 0,
      latency_ms: elapsedMs,
      cache: 'ERR',
      size_kb: 0,
      error: err.message,
    };
  }
}

async function runBenchmark() {
  console.log(`🚀 Starting Node.js latency benchmark on ${ENDPOINTS.length} API endpoints...`);
  console.log(
    `${'Endpoint'.padEnd(55)} | ${'Status'.padEnd(6)} | ${'Cache'.padEnd(5)} | ${'Latency'.padEnd(9)} | ${'Payload'.padEnd(8)} | Evaluation`
  );
  console.log('-'.repeat(105));

  const latencies = [];
  let successCount = 0;

  for (const [path, label] of ENDPOINTS) {
    const res = await testEndpoint(path);
    latencies.push(res.latency_ms);

    let evaluation = '';
    if (res.ok) {
      successCount++;
      if (res.latency_ms < 5.0) evaluation = '⚡ Ultra Fast (<5ms)';
      else if (res.latency_ms < 50.0) evaluation = '✅ Excellent (<50ms)';
      else if (res.latency_ms <= 500.0) evaluation = '✅ Within Target (100-500ms)';
      else evaluation = '⚠️ Marginal (>500ms)';
    } else {
      evaluation = `❌ ERROR (HTTP ${res.status})`;
    }

    const shortPath = path.length > 55 ? path.slice(0, 52) + '...' : path;
    console.log(
      `${shortPath.padEnd(55)} | ${String(res.status).padEnd(6)} | ${res.cache.padEnd(5)} | ${(
        res.latency_ms.toFixed(2) + ' ms'
      ).padEnd(9)} | ${(res.size_kb.toFixed(1) + ' KB').padEnd(8)} | ${evaluation}`
    );
  }

  const minLat = Math.min(...latencies).toFixed(2);
  const avgLat = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
  const maxLat = Math.max(...latencies).toFixed(2);

  console.log('-'.repeat(105));
  console.log(`📊 SUMMARY: ${ENDPOINTS.length} Endpoints Tested | ${successCount} Succeeded | ${ENDPOINTS.length - successCount} Failed`);
  console.log(`⚡ Minimum Latency: ${minLat} ms`);
  console.log(`⚡ Average Latency: ${avgLat} ms`);
  console.log(`⚡ Maximum Latency: ${maxLat} ms`);
}

runBenchmark();

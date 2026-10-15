import { Hospital } from '../types';

export const LABORATORIES_DATA: Hospital[] = [
  {
    id: "lab_01",
    slug: "apollo-diagnostics-regional-lab-pune",
    name: "Apollo Diagnostics Central Reference Laboratory",
    state: "Maharashtra",
    city: "pune",
    area: "Shivajinagar",
    address: "ICC Trade Tower, Senapati Bapat Road, Shivajinagar, Pune",
    pincode: "411016",
    facilityType: "Super-Speciality Tertiary Care",
    facilityTypeBadge: "NABL & CAP Accredited Laboratory",
    images: [
      {
        url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
        alt: "Apollo Diagnostics Central Reference Laboratory",
        caption: "Automated clinical biochemistry and genomics laboratory",
      },
    ],
    overview:
      "A flagship regional pathology reference center featuring automated robotic clinical chemistry, molecular diagnostics, real-time PCR, histopathology, and comprehensive home sample collection throughout Pune.",
    services: [
      "24x7 Emergency Blood & Fluid Profiling",
      "Home Sample Phlebotomy Collection Across Pune",
      "Comprehensive Metabolic & Lipid Panels",
      "Oncology Tumour Markers & Biopsy Histopathology",
      "Hormonal & Thyroid Assays (CLIA Automated)",
      "Digital Real-Time Reports with QR Verification",
    ],
    departments: [
      { name: "Clinical Biochemistry", slug: "biochemistry" },
      { name: "Microbiology & Serology", slug: "microbiology" },
      { name: "Histopathology", slug: "histopathology" },
      { name: "Molecular Genetics", slug: "molecular" },
    ],
    facilities: [
      "NABL / CAP Certified Setup",
      "Automated Roche Cobas Track Analyzers",
      "Temperature-Controlled Sample Transport",
      "Patient Lounge & Express Phlebotomy Desks",
    ],
    emergencyAvailable24x7: true,
    website: "https://apollodiagnostics.in",
    phone: "+91 20 4444 2424",
    whatsapp: "+91 91234 56780",
    mapsUrl: "https://maps.google.com/?q=Apollo+Diagnostics+ICC+Trade+Tower+Pune",
    verificationStatus: "independently-checked",
    lastChecked: "2026-03-24",
    sources: [
      {
        label: "National Accreditation Board for Testing and Calibration Laboratories (NABL)",
        url: "https://nabl-india.org",
        type: "official-registry",
        dateChecked: "2026-03-24",
      },
    ],
    doctorIds: [],
  },
  {
    id: "lab_02",
    slug: "metropolis-healthcare-lab-pune",
    name: "Metropolis Healthcare Regional Reference Laboratory",
    state: "Maharashtra",
    city: "pune",
    area: "Bund Garden",
    address: "Opp. Residency Club, Bund Garden Road, Pune",
    pincode: "411001",
    facilityType: "Super-Speciality Tertiary Care",
    facilityTypeBadge: "NABL Accredited Diagnostics",
    images: [
      {
        url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80",
        alt: "Metropolis Healthcare Pune",
      },
    ],
    overview:
      "A premier diagnostic facility offering over 4,000 specialized and routine tests, cytogenetics, immunohistochemistry, and preventive wellness health checks with rapid digital turnaround.",
    services: [
      "Advanced TruHealth Preventive Packages",
      "Prenatal Genetic Screening & Karyotyping",
      "Autoimmune & Allergy Diagnostic Panels",
      "Digital Report Access in 4-6 Hours",
    ],
    departments: [
      { name: "Clinical Pathology", slug: "pathology" },
      { name: "Haematology & Coagulation", slug: "haematology" },
      { name: "Cytology & Genomics", slug: "genomics" },
    ],
    facilities: [
      "NABL Certified Quality Standards",
      "Barcoded Vacuum Sample Handling",
      "Home Phlebotomy Fleet",
    ],
    emergencyAvailable24x7: false,
    website: "https://metropolisindia.com",
    phone: "+91 20 6712 1212",
    whatsapp: "+91 98220 99887",
    mapsUrl: "https://maps.google.com/?q=Metropolis+Healthcare+Bund+Garden+Pune",
    verificationStatus: "independently-checked",
    lastChecked: "2026-03-23",
    sources: [
      {
        label: "NABL Testing Directory",
        url: "https://nabl-india.org",
        type: "official-registry",
        dateChecked: "2026-03-23",
      },
    ],
    doctorIds: [],
  },
];

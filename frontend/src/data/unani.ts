import { Hospital } from '../types';

export const UNANI_CENTERS_DATA: Hospital[] = [
  {
    id: "hosp_unani_01",
    slug: "zvm-unani-medical-college-hospital-pune",
    name: "Z.V.M. Unani Medical College & Hospital",
    state: "Maharashtra",
    city: "pune",
    area: "Camp",
    address: "K.B. Hidayatullah Road, Azam Campus, Camp, Pune",
    pincode: "411001",
    facilityType: "Super-Speciality Tertiary Care",
    facilityTypeBadge: "Teaching Unani Hospital",
    images: [
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
        alt: "ZVM Unani Medical College and Hospital Pune",
        caption: "Main clinical building at Azam Campus",
      },
    ],
    overview:
      "A renowned 100-bed Unani teaching hospital established by the Maharashtra Cosmopolitan Education Society, featuring specialized Ilaj-bit-Tadbeer (Regimental Therapy: Hijama/Cupping, Hammam, Dalak) and herbal clinical dispensaries.",
    services: [
      "Ilaj-bit-Tadbeer (Hijama / Wet Cupping & Dry Cupping)",
      "Amraz-e-Jild (Unani Dermatology & Vitiligo/Bars)",
      "Moalajat (General Unani Internal Medicine)",
      "Qabalat wa Amraz-e-Niswan (Unani Gynaecology)",
      "Kulliyat wa Ilmul Advia (Herbal Pharmacy & Formulation)",
      "Charitable Outpatient Clinics & Pathology",
    ],
    departments: [
      { name: "Ilaj-bit-Tadbeer", slug: "ilaj-bit-tadbeer", description: "Regimental Therapy and Hijama" },
      { name: "Moalajat", slug: "moalajat", description: "Internal Medicine" },
      { name: "Jarahat", slug: "jarahat", description: "Unani Surgery & Dressing" },
      { name: "Amraz-e-Niswan", slug: "amraz-e-niswan", description: "Obstetrics and Gynaecology" },
    ],
    facilities: [
      "100 Inpatient Hospital Beds",
      "Dedicated Cupping (Hijama) Procedure Suites",
      "Ayush Central Dispensing Pharmacy",
      "Pathological Diagnostic Laboratory",
    ],
    bedCount: 100,
    emergencyAvailable24x7: false,
    website: "https://zvmumc.edu.in",
    phone: "+91 20 2643 1475",
    whatsapp: "+91 94030 55667",
    mapsUrl: "https://maps.google.com/?q=ZVM+Unani+Hospital+Azam+Campus+Pune",
    verificationStatus: "independently-checked",
    lastChecked: "2026-03-22",
    sources: [
      {
        label: "National Commission for Indian System of Medicine (Unani Board)",
        url: "https://ncismindia.org",
        type: "statutory-license",
        dateChecked: "2026-03-22",
      },
    ],
    doctorIds: [],
  },
  {
    id: "hosp_unani_02",
    slug: "nrium-clinical-research-unit-pune",
    name: "National Research Institute of Unani Medicine Clinical Unit",
    state: "Maharashtra",
    city: "pune",
    area: "Shivajinagar",
    address: "Near Central Health Dispensary, Shivajinagar, Pune",
    pincode: "411005",
    facilityType: "Government Teaching Hospital",
    facilityTypeBadge: "Central Government AYUSH Center",
    images: [
      {
        url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80",
        alt: "Central Government Unani Clinical Unit",
      },
    ],
    overview:
      "A clinical research and treatment facility under the Central Council for Research in Unani Medicine (CCRUM), Ministry of AYUSH, offering evidence-based Unani regimens for chronic skin disorders, arthritis, and liver ailments.",
    services: [
      "Government Subsidized Unani Consultations",
      "Vitiligo & Psoriasis Specialized Regimens",
      "Arthritis & Musculoskeletal Management",
      "Free Essential Unani Herbal Medicine Supply",
    ],
    departments: [
      { name: "Clinical Research", slug: "clinical-research" },
      { name: "General OPD", slug: "general-opd" },
    ],
    facilities: [
      "Specialized Research Outpatient Suites",
      "Government Central Herbal Dispensary",
    ],
    emergencyAvailable24x7: false,
    website: "https://ccrum.res.in",
    phone: "+91 20 2553 4410",
    whatsapp: "+91 98230 66778",
    mapsUrl: "https://maps.google.com/?q=National+Research+Institute+Unani+Medicine+Pune",
    verificationStatus: "independently-checked",
    lastChecked: "2026-03-20",
    sources: [
      {
        label: "Ministry of AYUSH Central Council for Research in Unani Medicine",
        url: "https://ccrum.res.in",
        type: "official-registry",
        dateChecked: "2026-03-20",
      },
    ],
    doctorIds: [],
  },
];

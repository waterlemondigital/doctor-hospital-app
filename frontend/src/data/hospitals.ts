/**
 * PLACEHOLDER DATA: replace with verified, sourced information before launch.
 *
 * NOTE: Contact numbers, doctor details, and specific operational timings in this demo dataset
 * are neutral placeholders intended for layout testing and integration demonstration only.
 * Always check official source links for current operational status.
 */

import { Hospital } from '../types';

export const HOSPITALS_DATA: Hospital[] = [
  {
    id: "hosp-sahyadri-deccan",
    slug: "sahyadri-hospital-pune",
    name: "Sahyadri Super Speciality Hospital",
    state: "Maharashtra",
    city: "Pune",
    area: "Deccan Gymkhana",
    address: "Plot No. 30-C, Erandwane, Karve Road, Deccan Gymkhana, Pune, Maharashtra 411004",
    pincode: "411004",
    facilityType: "Super-Speciality Tertiary Care",
    facilityTypeBadge: "Super Speciality Tertiary",
    images: [
      {
        // Placeholder image 1: Hospital exterior/facade
        url: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
        alt: "Exterior facade of modern multispeciality hospital building in Pune",
        caption: "Main entrance and outpatient reception wing",
      },
      {
        // Placeholder image 2: Hospital modern reception / consultation lobby
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
        alt: "Clean modern hospital lobby and central reception desk",
        caption: "Patient admission and registration atrium",
      },
      {
        // Placeholder image 3: Hospital critical care / diagnostic wing
        url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
        alt: "Modern cardiac catheterization suite and patient monitoring equipment",
        caption: "Specialist monitoring and intervention suite",
      },
    ],
    overview: "Sahyadri Super Speciality Hospital (Deccan Gymkhana) is a prominent tertiary care hospital in Pune. It houses comprehensive departments spanning cardiology, neurosciences, organ transplantation, oncology, and emergency trauma care with round-the-clock emergency and pathology facilities.",
    services: [
      "24x7 Emergency & Trauma Care",
      "Interventional Cardiology & Cath Lab",
      "Comprehensive Neurosciences Unit",
      "Medical & Surgical Oncology",
      "Nephrology & Renal Transplant Unit",
      "Advanced Intensive Care (ICU & CCU)",
      "Day Care Chemotherapy Facility",
      "Diagnostic Imaging (MRI, CT, Ultrasound)",
      "24x7 NABL Accredited Pathology Lab",
      "In-House 24x7 Pharmacy",
    ],
    departments: [
      {
        name: "Cardiology",
        slug: "cardiology",
        description: "Interventional cardiology, cath lab, and coronary angioplasty unit",
      },
      {
        name: "Neurology",
        slug: "neurology",
        description: "Comprehensive brain, spine, stroke, and clinical neurosciences",
      },
      {
        name: "Orthopaedics",
        slug: "orthopaedics",
        description: "Joint replacement, fracture surgery, and sports medicine",
      },
      {
        name: "General Surgery",
        slug: "general-surgery",
        description: "Advanced laparoscopic and minimally invasive gastrointestinal surgery",
      },
      {
        name: "Gastroenterology",
        slug: "gastroenterology",
        description: "Medical gastroenterology, endoscopy, and hepatology care",
      },
      {
        name: "General Medicine",
        slug: "general-medicine",
        description: "Internal medicine, diabetes, metabolic care, and preventative health",
      },
      {
        name: "Critical Care",
        slug: "critical-care",
        description: "24x7 Level III intensive care, monitoring, and life support",
      },
      {
        name: "Pulmonology",
        slug: "pulmonology",
        description: "Respiratory illness, bronchoscopy, and sleep medicine protocols",
      },
    ],
    facilities: [
      "Over 200 Inpatient Beds",
      "Level III Intensive Care Units",
      "Modular Laminar Flow Operation Theatres",
      "Dedicated Cardiac Emergency Bay",
      "Dedicated Ambulance Service",
      "Valet Parking & Wheelchair Accessibility",
      "Cashless TPA Insurance Desk",
    ],
    bedCount: 202,
    emergencyAvailable24x7: true,
    website: "https://sahyadrihospitals.com",
    phone: "+91 20 6721 5000",
    whatsapp: "912067215000",
    mapsUrl: "https://maps.google.com/?q=Sahyadri+Super+Speciality+Hospital+Deccan+Pune",
    verificationStatus: "independently-checked",
    lastChecked: "2026-03-28",
    sources: [
      {
        label: "Official Hospital Website & Directory",
        url: "https://sahyadrihospitals.com/deccan-gymkhana-pune",
        type: "official-registry",
        dateChecked: "2026-03-28",
      },
      {
        label: "Pune Municipal Corporation Health Department Registry",
        url: "https://pmc.gov.in/en/registered-nursing-homes-and-hospitals",
        type: "statutory-license",
        dateChecked: "2026-03-15",
      },
      {
        label: "NABH Accreditation Portal Record",
        url: "https://nabh.co/AccreditedHosp.aspx",
        type: "public-records",
        dateChecked: "2026-02-20",
      },
    ],
    doctorIds: ["doc-placeholder-cardio-01", "doc-placeholder-neuro-03", "doc-placeholder-ortho-04"],
  },
  {
    id: "hosp-sassoon-general",
    slug: "sassoon-general-hospital-pune",
    name: "Sassoon General Hospital & B.J. Govt. Medical College",
    state: "Maharashtra",
    city: "Pune",
    area: "Near Pune Railway Station",
    address: "Station Road, Agarkar Nagar, Near Pune Railway Station, Pune, Maharashtra 411001",
    pincode: "411001",
    facilityType: "Government Teaching Hospital",
    facilityTypeBadge: "Govt. Teaching & Tertiary Care",
    images: [
      {
        // Placeholder image 1: Historic stone gothic architecture
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        alt: "Historical main building and heritage clock tower of Sassoon General Hospital Pune",
        caption: "Historic stone clock-tower building and administrative block",
      },
      {
        // Placeholder image 2: Teaching hospital ambulatory wing
        url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80",
        alt: "Spacious ambulatory corridor and outpatient consultation wing",
        caption: "Outpatient clinical departments (OPD) complex",
      },
      {
        // Placeholder image 3: Refurbished modern clinical inpatient facility
        url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
        alt: "Inpatient medical care ward with diagnostic support equipment",
        caption: "Super-speciality clinical inpatient tower",
      },
    ],
    overview: "Sassoon General Hospital is a historic, landmark government tertiary care hospital affiliated with B.J. Government Medical College in Pune. Founded in the late 19th century, it delivers comprehensive medical care, subsidised and free treatments, specialized surgeries, and acts as the premier referral hospital for western Maharashtra.",
    services: [
      "24x7 Government Casualty & Emergency Services",
      "General Outpatient Departments (OPD)",
      "Trauma & Orthopaedic Emergency Surgery",
      "General Medicine & Infectious Disease Care",
      "Cardiology & Cardio-Thoracic OPD",
      "Obstetrics & High-Risk Neonatal Care (NICU)",
      "Pediatric Multi-Disciplinary Care",
      "Government Blood Bank & Diagnostic Lab",
      "Free & Subsidised Medicine Dispensation",
      "Government Health Scheme Assistance (MJPJAY / PMJAY)",
    ],
    departments: [
      {
        name: "General Medicine",
        slug: "general-medicine",
        description: "Internal medicine, infectious diseases, adult diabetology, and general clinical care",
      },
      {
        name: "Cardiology",
        slug: "cardiology",
        description: "Government cardiology OPD, non-invasive cardiac evaluation, and referrals",
      },
      {
        name: "General Surgery",
        slug: "general-surgery",
        description: "Comprehensive acute surgical care, gastrointestinal surgery, and elective procedures",
      },
      {
        name: "Obstetrics & Gynaecology",
        slug: "obstetrics-gynaecology",
        description: "Maternal healthcare, antenatal monitoring, and high-risk obstetric delivery care",
      },
      {
        name: "Paediatrics & Neonatology",
        slug: "paediatrics-neonatology",
        description: "Dedicated neonatal intensive care unit (NICU) and paediatric general medicine",
      },
      {
        name: "Orthopaedics",
        slug: "orthopaedics",
        description: "Government trauma centre, emergency fracture fixation, and joint reconstruction",
      },
      {
        name: "Ophthalmology",
        slug: "ophthalmology",
        description: "Clinical vision screening, cataract interventions, and cornea evaluation",
      },
      {
        name: "Otorhinolaryngology (ENT)",
        slug: "ent",
        description: "Ear, nose, throat diagnostics, audiology screening, and surgical care",
      },
      {
        name: "Critical Care & Casualty",
        slug: "critical-care",
        description: "24x7 government central casualty, emergency triage, and life-support units",
      },
    ],
    facilities: [
      "1,200+ Subsidised and Free Care Beds",
      "Dedicated Central Casualty Unit",
      "Regional Blood Transfusion Center",
      "Modern 11-Storey Super-Speciality Building",
      "Teaching Hospital Clinical Auditoriums",
      "Government Jan Aushadhi Generic Pharmacy",
      "Wheelchair & Stretcher Ramps across Campus",
    ],
    bedCount: 1296,
    emergencyAvailable24x7: true,
    website: "https://www.bjmcpune.org",
    phone: "+91 20 2612 8000",
    whatsapp: "912026128000",
    mapsUrl: "https://maps.google.com/?q=Sassoon+General+Hospital+Pune",
    verificationStatus: "provider-confirmed",
    lastChecked: "2026-03-25",
    sources: [
      {
        label: "B.J. Government Medical College & Sassoon Official Portal",
        url: "https://www.bjmcpune.org/hospital.html",
        type: "official-registry",
        dateChecked: "2026-03-25",
      },
      {
        label: "Directorate of Medical Education and Research (DMER) Maharashtra",
        url: "https://www.med-edu.in",
        type: "statutory-license",
        dateChecked: "2026-03-10",
      },
      {
        label: "National Health Authority / PMJAY Empanelled Facility Directory",
        url: "https://hospitals.pmjay.gov.in",
        type: "public-records",
        dateChecked: "2026-02-15",
      },
    ],
    doctorIds: ["doc-placeholder-physician-02", "doc-placeholder-paed-05"],
  },
  {
    id: "hosp-kem-mumbai",
    slug: "kem-hospital-mumbai",
    name: "King Edward Memorial (KEM) Hospital",
    state: "Maharashtra",
    city: "Mumbai",
    area: "Parel",
    address: "Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012",
    pincode: "400012",
    facilityType: "Government Teaching Hospital",
    facilityTypeBadge: "Govt. Teaching & Tertiary Care",
    images: [
      {
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        alt: "Main heritage hospital building of KEM Hospital Mumbai",
        caption: "Main administrative and clinical block in Parel",
      },
    ],
    overview: "King Edward Memorial Hospital and Seth Gordhandas Sunderdas Medical College is one of the foremost government teaching and tertiary care hospitals in Mumbai, catering to patients across Maharashtra.",
    services: [
      "24x7 Government Casualty & Trauma Care",
      "Comprehensive Cardiology & Cath Lab",
      "General Outpatient Departments (OPD)",
      "Advanced Surgical Oncology & Neurosciences",
      "Subsidised & Free Patient Care",
    ],
    departments: [
      {
        name: "Cardiology",
        slug: "cardiology",
        description: "Clinical cardiology, cath lab interventions, and cardiac diagnostics",
      },
      {
        name: "General Medicine",
        slug: "general-medicine",
        description: "Internal medicine, infectious diseases, and metabolic disorders",
      },
    ],
    facilities: [
      "1,800+ Inpatient Beds",
      "Level III Intensive Care Facilities",
      "24x7 Casualty Resuscitation Wing",
    ],
    bedCount: 1800,
    emergencyAvailable24x7: true,
    website: "https://www.kem.edu",
    phone: "+91 22 2410 7000",
    whatsapp: "912224107000",
    mapsUrl: "https://maps.google.com/?q=KEM+Hospital+Parel+Mumbai",
    verificationStatus: "independently-checked",
    lastChecked: "2026-03-26",
    sources: [
      {
        label: "Municipal Corporation of Greater Mumbai (MCGM)",
        url: "https://portal.mcgm.gov.in",
        type: "official-registry",
        dateChecked: "2026-03-26",
      },
    ],
    doctorIds: ["doc-placeholder-mumbai-cardio-06"],
  },
];

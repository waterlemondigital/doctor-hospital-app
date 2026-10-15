/**
 * PLACEHOLDER DATA: replace with verified, sourced information before launch.
 *
 * IMPORTANT ETHICAL NOTICE:
 * To avoid misattributing real medical professionals without statutory verification,
 * all names, registrations, contact numbers, and consultation hours below are
 * clearly labeled placeholders for demonstration purposes only.
 */

import { Doctor } from '../types';

export const DOCTORS_DATA: Doctor[] = [
  {
    id: "doc-placeholder-cardio-01",
    slug: "dr-placeholder-cardio-one",
    name: "Dr. Placeholder Name One",
    title: "Senior Consultant Interventional Cardiologist",
    department: "Cardiology",
    departmentSlug: "cardiology",
    speciality: "Cardiology",
    specialitySlug: "cardiology",
    subSpeciality: "Interventional Cardiology & Coronary Angioplasty",
    qualifications: "MBBS, MD (General Medicine), DM (Cardiology), FACC",
    experienceYears: 16,
    languages: ["English", "Hindi", "Marathi"],
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    summary: "Practising interventional cardiologist focusing on adult coronary artery interventions, radial angiographies, and preventative cardiac care. Consults at Sahyadri Super Speciality Hospital Deccan Gymkhana with elective outpatient hours.",
    areasOfPractice: [
      "Coronary Angiography & Angioplasty",
      "Radial Artery Interventions",
      "Hypertension & Lipid Management",
      "Preventative Cardiac Health Assessments",
      "Heart Failure Management Protocols",
      "Echocardiography & Stress Testing",
    ],
    hospitals: [
      {
        hospitalId: "hosp-sahyadri-deccan",
        hospitalName: "Sahyadri Super Speciality Hospital",
        days: "Monday, Wednesday, Friday",
        timings: "10:00 AM – 01:30 PM (OPD)",
        note: "Please reconfirm consultation timings with the hospital reception before visiting.",
      },
    ],
    phone: "+91 20 6721 5000",
    whatsapp: "912067215000",
    verificationStatus: "independently-checked",
    lastChecked: "2026-03-27",
    sources: [
      {
        label: "Hospital Consultant Directory Listing",
        url: "https://sahyadrihospitals.com/doctors",
        type: "official-registry",
        dateChecked: "2026-03-27",
      },
      {
        label: "Maharashtra Medical Council (MMC) Practitioner Register",
        url: "https://www.maharashtramedicalcouncil.in",
        type: "statutory-license",
        dateChecked: "2026-03-12",
      },
    ],
  },
  {
    id: "doc-placeholder-physician-02",
    slug: "dr-placeholder-physician-two",
    name: "Dr. Placeholder Name Two",
    title: "Professor & Senior Consultant Physician",
    department: "General Medicine",
    departmentSlug: "general-medicine",
    speciality: "General Medicine",
    specialitySlug: "general-medicine",
    subSpeciality: "Internal Medicine, Infectious Diseases & Diabetology",
    qualifications: "MBBS, MD (Internal Medicine), FACP",
    experienceYears: 21,
    languages: ["English", "Hindi", "Marathi"],
    photo: "https://images.unsplash.com/photo-1594824813583-3652873130d2?auto=format&fit=crop&w=600&q=80",
    summary: "Senior consultant physician and academic mentor at Sassoon General Hospital & B.J. Government Medical College. Manages complex infectious diseases, uncontrolled metabolic disorders, adult diabetes care, and general clinical outpatient care.",
    areasOfPractice: [
      "Infectious & Tropical Diseases",
      "Type 1 & Type 2 Diabetes Mellitus",
      "Metabolic Syndrome & Dyslipidemia",
      "Geriatric Comprehensive Medical Care",
      "Fever of Unknown Origin Evaluation",
      "Preventive Adult Immunization",
    ],
    hospitals: [
      {
        hospitalId: "hosp-sassoon-general",
        hospitalName: "Sassoon General Hospital & B.J. Govt. Medical College",
        days: "Tuesday, Thursday, Saturday",
        timings: "09:00 AM – 01:00 PM (OPD Unit 3)",
        note: "Government OPD registration slip required on arrival. Timings subject to clinical triage duties.",
      },
    ],
    phone: "+91 20 2612 8000",
    whatsapp: "912026128000",
    verificationStatus: "provider-confirmed",
    lastChecked: "2026-03-24",
    sources: [
      {
        label: "B.J. Govt Medical College Faculty Register",
        url: "https://www.bjmcpune.org/faculty.html",
        type: "official-registry",
        dateChecked: "2026-03-24",
      },
      {
        label: "National Medical Commission (NMC) Indian Medical Register",
        url: "https://www.nmc.org.in/information-desk/indian-medical-register/",
        type: "statutory-license",
        dateChecked: "2026-03-08",
      },
    ],
  },
];

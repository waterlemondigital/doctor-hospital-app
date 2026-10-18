export interface TreatmentCity {
  id: string;
  name: string;
  state: string;
  specialityHub: string;
  tagline: string;
  hasVerifiedHospitals?: boolean;
}

/**
 * 20 Famous Cities for Treatment in India.
 * Note: Sequence is strictly ordered as requested.
 */
export const FAMOUS_TREATMENT_CITIES: TreatmentCity[] = [
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    specialityHub: "Cardiology & Organ Transplants",
    tagline: "India's Healthcare Capital",
    hasVerifiedHospitals: true,
  },
  {
    id: "delhi-ncr",
    name: "Delhi NCR",
    state: "Delhi NCR",
    specialityHub: "Apex Quaternary & Oncology",
    tagline: "AIIMS & National Medical Hub",
    hasVerifiedHospitals: true,
  },
  {
    id: "mumbai",
    name: "Mumbai MMR",
    state: "Maharashtra",
    specialityHub: "Comprehensive Oncology & Cardiac Care",
    tagline: "Apex Tertiary Care Destination",
    hasVerifiedHospitals: true,
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    specialityHub: "Robotic Surgeries & Transplants",
    tagline: "High-Tech Medical Excellence",
    hasVerifiedHospitals: true,
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    specialityHub: "Neurosciences, Biotech & Cardiac",
    tagline: "Cutting-edge Clinical Hub",
    hasVerifiedHospitals: true,
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    specialityHub: "Cardiac & Multi-Speciality Care",
    tagline: "Western India Healthcare Apex",
    hasVerifiedHospitals: true,
  },
  {
    id: "pune",
    name: "Pune",
    state: "Maharashtra",
    specialityHub: "Quaternary Care & Multi-Organ Transplants",
    tagline: "Verified Flagship Institutions",
    hasVerifiedHospitals: true,
  },
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    specialityHub: "Apex Multi-Speciality & Diagnostics",
    tagline: "Eastern India's Medical Epicenter",
    hasVerifiedHospitals: false,
  },
  {
    id: "kochi",
    name: "Kochi",
    state: "Kerala",
    specialityHub: "Medical Tourism & Quaternary Care",
    tagline: "Global Patient Destination",
    hasVerifiedHospitals: true,
  },
  {
    id: "chandigarh",
    name: "Chandigarh",
    state: "Chandigarh",
    specialityHub: "Apex Referral & Super-Speciality",
    tagline: "North India Healthcare Gateway",
    hasVerifiedHospitals: true,
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    specialityHub: "Advanced Surgical & Multi-Speciality",
    tagline: "Leading Tertiary Referral Center",
    hasVerifiedHospitals: true,
  },
  {
    id: "coimbatore",
    name: "Coimbatore",
    state: "Tamil Nadu",
    specialityHub: "Super-Speciality & Trauma Care",
    tagline: "South India Healthcare Hub",
    hasVerifiedHospitals: true,
  },
  {
    id: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    specialityHub: "Apex Tertiary & Medical Research",
    tagline: "State Medical Headquarters",
    hasVerifiedHospitals: true,
  },
  {
    id: "indore",
    name: "Indore",
    state: "Madhya Pradesh",
    specialityHub: "Central India Tertiary Care",
    tagline: "Premier Regional Medical Center",
    hasVerifiedHospitals: true,
  },
  {
    id: "visakhapatnam",
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
    specialityHub: "Coastal Super-Speciality Network",
    tagline: "Andhra Healthcare Hub",
    hasVerifiedHospitals: false,
  },
  {
    id: "nagpur",
    name: "Nagpur",
    state: "Maharashtra",
    specialityHub: "AIIMS & Central Referral Care",
    tagline: "Central India Healthcare Apex",
    hasVerifiedHospitals: false,
  },
  {
    id: "bhubaneswar",
    name: "Bhubaneswar",
    state: "Odisha",
    specialityHub: "Eastern Multi-Speciality & Trauma",
    tagline: "Fast-Growing Medical Destination",
    hasVerifiedHospitals: true,
  },
  {
    id: "patna",
    name: "Patna",
    state: "Bihar",
    specialityHub: "Major Super-Speciality Referral",
    tagline: "Regional Healthcare Lifeline",
    hasVerifiedHospitals: true,
  },
  {
    id: "surat",
    name: "Surat",
    state: "Gujarat",
    specialityHub: "High-Volume Cardiac & Surgical Care",
    tagline: "South Gujarat Medical Center",
    hasVerifiedHospitals: false,
  },
  {
    id: "nashik",
    name: "Nashik",
    state: "Maharashtra",
    specialityHub: "Emerging Tertiary & Critical Care",
    tagline: "North Maharashtra Healthcare Hub",
    hasVerifiedHospitals: false,
  },
];

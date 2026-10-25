export interface HospitalDoctorAffiliation {
  doctor_id: string;
  doctor_name?: string | null;
  doctor_slug?: string | null;
  speciality?: string | null;
  days: string;
  timings: string;
  note?: string | null;
}

export interface Hospital {
  id: string;
  slug: string;
  name: string;
  state: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  facility_type: string;
  facility_type_badge: string;
  overview?: string | null;
  bed_count?: number | null;
  emergency_available_24x7: boolean;
  website?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  maps_url?: string | null;
  verification_status: string;
  last_checked?: string | null;
  images: any[];
  services: string[];
  departments: any[];
  facilities: string[];
  sources: any[];
  doctors: HospitalDoctorAffiliation[];
}

export interface DoctorAffiliation {
  hospital_id: string;
  hospital_name?: string | null;
  hospital_slug?: string | null;
  hospital_city?: string | null;
  days: string;
  timings: string;
  note?: string | null;
}

export interface Doctor {
  id: string;
  slug: string;
  name: string;
  title: string;
  department: string;
  department_slug: string;
  speciality: string;
  speciality_slug: string;
  sub_speciality?: string | null;
  qualifications: string;
  experience_years?: number | null;
  photo?: string | null;
  summary?: string | null;
  city: string;
  state: string;
  area?: string | null;
  location?: string | null;
  phone: string;
  whatsapp: string;
  verification_status: string;
  last_checked?: string | null;
  languages: string[];
  areas_of_practice: string[];
  sources: any[];
  hospitals: DoctorAffiliation[];
  connected_laboratory_ids?: string[];
}

export interface Laboratory {
  id: string;
  slug: string;
  name: string;
  state: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  accreditation?: string | null;
  overview?: string | null;
  home_sample_collection: boolean;
  emergency_available_24x7: boolean;
  website?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  maps_url?: string | null;
  verification_status: string;
  last_checked?: string | null;
  images: any[];
  services: string[];
  departments: any[];
  facilities: string[];
  sources: any[];
  connected_hospital_ids?: string[];
  connected_doctor_ids?: string[];
}

export interface WellnessCenter {
  id: string;
  slug: string;
  name: string;
  category: string;
  state: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  accreditation?: string | null;
  overview?: string | null;
  website?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  maps_url?: string | null;
  verification_status: string;
  last_checked?: string | null;
  images: any[];
  programs: string[];
  disciplines: string[];
  facilities: string[];
  sources: any[];
}

export interface City {
  id: string;
  name: string;
  state_id: string;
  state_name: string;
  is_active: boolean;
  hospital_count: number;
}

export interface Speciality {
  id: string;
  name: string;
  description?: string | null;
  icon_name?: string | null;
}

export interface User {
  id: string;
  email: string;
  hashed_password: string;
  name: string;
  role: string;
  phone?: string | null;
  country_code?: string | null;
  avatar?: string | null;
  hashed_refresh_token?: string | null;
  speciality?: string | null;
  experience?: string | null;
  whatsapp_number?: string | null;
  clinic_address?: string | null;
  medical_reg_no?: string | null;
  city?: string | null;
  address?: string | null;
  pincode?: string | null;
  authorized_person_name?: string | null;
  authorized_person_phone?: string | null;
  registration_cert_url?: string | null;
  address_proof_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

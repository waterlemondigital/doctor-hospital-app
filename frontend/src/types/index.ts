/**
 * Core domain types for MedVexa directory
 */

export type VerificationStatus = 'independently-checked' | 'provider-confirmed' | 'unverified';

export interface SourceCitation {
  label: string;
  url: string;
  type: 'official-registry' | 'provider-declaration' | 'statutory-license' | 'public-records';
  dateChecked: string;
}

export interface HospitalImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface Department {
  name: string;
  slug: string;
  description?: string;
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
  facilityType: 'Super-Speciality Tertiary Care' | 'Government Teaching Hospital' | 'Multispeciality Hospital';
  facilityTypeBadge: string;
  images: HospitalImage[];
  overview: string;
  services: string[];
  departments: Department[];
  facilities: string[];
  bedCount?: number;
  accreditation?: string;
  homeSampleCollection?: boolean;
  emergencyAvailable24x7: boolean;
  website: string;
  phone: string;
  whatsapp: string;
  mapsUrl: string;
  verificationStatus: VerificationStatus;
  lastChecked: string;
  sources: SourceCitation[];
  doctorIds: string[];
  connectedHospitalIds?: string[];
  connectedDoctorIds?: string[];
}

export interface DoctorHospitalAffiliation {
  hospitalId: string;
  hospitalName?: string;
  days: string;
  timings: string;
  note?: string;
}

export interface Doctor {
  id: string;
  slug: string;
  name: string;
  title: string;
  department: string;
  departmentSlug: string;
  speciality: string;
  specialitySlug: string;
  subSpeciality: string;
  qualifications: string;
  experienceYears?: number;
  languages?: string[];
  photo: string;
  summary: string;
  areasOfPractice: string[];
  hospitals: DoctorHospitalAffiliation[];
  location?: string;
  area?: string;
  city?: string;
  state?: string;
  phone: string;
  whatsapp: string;
  verificationStatus: VerificationStatus;
  lastChecked: string;
  sources: SourceCitation[];
}

export interface City {
  id: string;
  name: string;
  stateId: string;
  isActive: boolean;
  hospitalCount: number;
}

export interface StateLocation {
  id: string;
  name: string;
  isActive: boolean;
  cities: City[];
}

export interface SpecialityMeta {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export type AdSlotSize = 'sidebar-tall' | 'sidebar-square' | 'banner' | 'full-width';

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
  accreditation?: string;
  overview?: string;
  website?: string;
  phone?: string;
  whatsapp?: string;
  mapsUrl?: string;
  verificationStatus: string;
  lastChecked?: string;
  images: HospitalImage[];
  programs: string[];
  disciplines: string[];
  facilities: string[];
  sources: SourceCitation[];
}

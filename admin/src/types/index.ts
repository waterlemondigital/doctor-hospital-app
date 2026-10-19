export type UrgencyLevel = 'routine' | 'priority' | 'emergency';

export type LeadStatus =
  | 'dispatched'
  | 'acknowledged'
  | 'in_consultation'
  | 'completed'
  | 'cancelled';

export type TargetType = 'doctor' | 'hospital' | 'laboratory' | 'wellness';

export type PortalAccountStatus = 'active' | 'pending' | 'suspended' | 'not_registered';

export interface PatientLead {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_whatsapp?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_city: string;
  patient_area?: string;
  medical_concern: string;
  speciality: string;
  urgency: UrgencyLevel;
  preferred_date?: string;
  preferred_time?: string;
  target_type: TargetType;
  target_id: string;
  target_name: string;
  target_account_status: string;
  status: LeadStatus;
  agent_notes?: string;
  agent_name: string;
  created_at: string;
  updated_at: string;
}

export interface TargetDoctor {
  id: string;
  slug: string;
  name: string;
  type: 'doctor';
  title: string;
  speciality: string;
  department: string;
  city: string;
  area: string;
  phone: string;
  whatsapp?: string;
  photo?: string;
  experienceYears?: string | number;
  qualifications?: string;
  clinicAddress?: string;
  medicalRegNo?: string;
  primaryHospital?: string;
  hasPortalAccount: boolean;
  portalAccountStatus: PortalAccountStatus;
  dashboardAccessEnabled: boolean;
  portalEmail: string;
  leadCount: number;
}

export interface TargetHospital {
  id: string;
  slug: string;
  name: string;
  type: 'hospital';
  facilityType: string;
  city: string;
  area: string;
  address: string;
  pincode?: string;
  phone: string;
  authorizedPersonName?: string;
  authorizedPersonPhone?: string;
  registrationCertUrl?: string;
  bedCount?: number;
  emergency24x7?: boolean;
  coverImage?: string;
  hasPortalAccount: boolean;
  portalAccountStatus: PortalAccountStatus;
  dashboardAccessEnabled: boolean;
  portalEmail: string;
  leadCount: number;
}

export interface TargetLaboratory {
  id: string;
  slug: string;
  name: string;
  type: 'laboratory';
  facilityType: string;
  city: string;
  area: string;
  address: string;
  pincode?: string;
  phone: string;
  registrationCertUrl?: string;
  addressProofUrl?: string;
  coverImage?: string;
  hasPortalAccount: boolean;
  portalAccountStatus: PortalAccountStatus;
  dashboardAccessEnabled: boolean;
  portalEmail: string;
  leadCount: number;
}

export interface TargetWellness {
  id: string;
  slug: string;
  name: string;
  type: 'wellness';
  facilityType: string;
  city: string;
  area: string;
  address: string;
  pincode?: string;
  phone: string;
  registrationCertUrl?: string;
  addressProofUrl?: string;
  coverImage?: string;
  hasPortalAccount: boolean;
  portalAccountStatus: PortalAccountStatus;
  dashboardAccessEnabled: boolean;
  portalEmail: string;
  leadCount: number;
}

export type TargetEntity = TargetDoctor | TargetHospital | TargetLaboratory | TargetWellness;

export interface AdminStats {
  totalLeads: number;
  todayLeads: number;
  priorityLeads: number;
  activePortalAccounts: number;
  totalDoctors: number;
  totalHospitals: number;
  totalLaboratories?: number;
  totalWellness?: number;
  byTargetType: { target_type: string; count: string | number }[];
  byStatus: { status: string; count: string | number }[];
}

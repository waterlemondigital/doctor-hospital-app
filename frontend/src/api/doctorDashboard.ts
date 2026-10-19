import { apiFetch } from './client';

export interface DoctorLead {
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
  urgency: 'routine' | 'priority' | 'emergency';
  preferred_date?: string;
  preferred_time?: string;
  target_type: 'doctor' | 'hospital' | 'laboratory' | 'wellness';
  target_id: string;
  target_name: string;
  target_account_status: string;
  status: 'dispatched' | 'acknowledged' | 'in_consultation' | 'completed' | 'cancelled';
  agent_notes?: string;
  agent_name: string;
  created_at: string;
  updated_at: string;
}

export interface PortalEntityProfile {
  id: string;
  role: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  pincode?: string;
  photo?: string;
  speciality?: string;
  experience?: string;
  medicalRegNo?: string;
  authorizedPersonName?: string;
  authorizedPersonPhone?: string;
  registrationCertUrl?: string;
  addressProofUrl?: string;
}

export interface DoctorDashboardData {
  entity?: PortalEntityProfile;
  doctor?: {
    id: string;
    slug?: string;
    name: string;
    title?: string;
    speciality?: string;
    department?: string;
    city?: string;
    area?: string;
    photo?: string;
    hospital?: string;
  };
  stats: {
    total: number;
    dispatched: number;
    acknowledged: number;
    inConsultation: number;
    completed: number;
  };
  leads: DoctorLead[];
  availableDoctors?: { id: string; name: string; speciality: string }[];
}

export async function fetchDoctorMyLeads(params?: {
  doctorId?: string;
  targetId?: string;
  email?: string;
  name?: string;
}): Promise<DoctorDashboardData> {
  const query = new URLSearchParams();
  if (params?.doctorId) query.set('doctorId', params.doctorId);
  if (params?.targetId) query.set('targetId', params.targetId);
  if (params?.email) query.set('email', params.email);
  if (params?.name) query.set('name', params.name);

  return apiFetch<DoctorDashboardData>(`portal/my-leads?${query.toString()}`, {
    skipCache: true,
  });
}

export async function updateDoctorLeadStatus(
  leadId: string,
  status: string,
  doctorNotes?: string
): Promise<{ success: boolean; lead: DoctorLead; message: string }> {
  return apiFetch<{ success: boolean; lead: DoctorLead; message: string }>(
    `portal/leads/${leadId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, notes: doctorNotes }),
      skipCache: true,
    }
  );
}

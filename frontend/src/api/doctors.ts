import { apiFetch } from './client';
import { Doctor, DoctorHospitalAffiliation } from '../types';

const DOCTOR_FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813626-d6682627993a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=80',
];

interface RawDoctorAffiliation {
  hospital_id: string;
  hospital_name?: string;
  hospital_slug?: string;
  hospital_city?: string;
  days: string;
  timings: string;
  note?: string;
}

interface RawDoctor {
  id: string;
  slug: string;
  name: string;
  title: string;
  department: string;
  department_slug?: string;
  speciality: string;
  speciality_slug?: string;
  sub_speciality?: string;
  qualifications: string;
  experience_years?: number;
  photo?: string;
  summary?: string;
  city: string;
  state: string;
  area?: string;
  location?: string;
  phone?: string;
  whatsapp?: string;
  verification_status?: string;
  last_checked?: string;
  languages?: string[];
  areas_of_practice?: string[];
  sources?: any[];
  hospitals?: RawDoctorAffiliation[];
}

export function mapDoctor(raw: RawDoctor, index = 0): Doctor {
  const photo = raw.photo && raw.photo.trim().length > 0
    ? raw.photo
    : DOCTOR_FALLBACK_AVATARS[index % DOCTOR_FALLBACK_AVATARS.length];

  const affiliations: DoctorHospitalAffiliation[] = (raw.hospitals || []).map((aff) => ({
    hospitalId: aff.hospital_id,
    hospitalName: aff.hospital_name || aff.hospital_id,
    days: aff.days,
    timings: aff.timings,
    note: aff.note,
  }));

  const sources = (raw.sources || []).map((s) => ({
    label: s.label || s.name || `${raw.name} Official Profile`,
    url: s.url || '',
    type: s.type || 'official-registry',
    dateChecked: s.dateChecked || s.date_checked || raw.last_checked || '2026-10-17',
  }));

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    title: raw.title,
    department: raw.department,
    departmentSlug: raw.department_slug || raw.department.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    speciality: raw.speciality,
    specialitySlug: raw.speciality_slug || raw.speciality.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    subSpeciality: raw.sub_speciality || '',
    qualifications: raw.qualifications,
    experienceYears: raw.experience_years,
    languages: raw.languages || [],
    photo,
    summary: raw.summary || '',
    areasOfPractice: raw.areas_of_practice || [],
    hospitals: affiliations,
    location: raw.location || raw.area || 'Pune',
    area: raw.area || 'Pune',
    city: raw.city ? raw.city.charAt(0).toUpperCase() + raw.city.slice(1) : 'Pune',
    state: raw.state || 'Maharashtra',
    phone: raw.phone || '',
    whatsapp: raw.whatsapp || '',
    verificationStatus: (raw.verification_status as any) || 'independently-checked',
    lastChecked: raw.last_checked || '2026-10-17',
    sources,
  };
}

export async function fetchDoctors(params?: {
  city?: string;
  speciality?: string;
  hospitalId?: string;
  search?: string;
}): Promise<Doctor[]> {
  try {
    const query = new URLSearchParams();
    if (params?.city && params.city !== 'all') query.set('city', params.city);
    if (params?.speciality && params.speciality !== 'all') query.set('speciality', params.speciality);
    if (params?.hospitalId && params.hospitalId !== 'all') query.set('hospital_id', params.hospitalId);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const rawList = await apiFetch<RawDoctor[]>(`/doctors${qs}`);
    return rawList.map((d, i) => mapDoctor(d, i));
  } catch (err) {
    console.warn('API error fetching doctors:', err);
    return [];
  }
}

export async function fetchDoctorBySlug(slug: string): Promise<Doctor | null> {
  try {
    const raw = await apiFetch<RawDoctor>(`/doctors/${slug}`);
    return mapDoctor(raw);
  } catch (err) {
    console.warn(`API error fetching doctor ${slug}:`, err);
    return null;
  }
}

import { apiFetch } from './client';
import { Hospital } from '../types';
import { CONTACT_PHONE, CONTACT_WHATSAPP } from '../data/config';

interface RawLaboratory {
  id: string;
  slug: string;
  name: string;
  state: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  accreditation?: string;
  overview?: string;
  home_sample_collection?: boolean;
  emergency_available_24x7?: boolean;
  website?: string;
  phone?: string;
  whatsapp?: string;
  maps_url?: string;
  verification_status?: string;
  last_checked?: string;
  images?: any[];
  services?: string[];
  departments?: any[];
  facilities?: string[];
  sources?: any[];
  connected_hospital_ids?: string[];
  connected_doctor_ids?: string[];
}

export function mapLaboratory(raw: RawLaboratory): Hospital {
  const images = (raw.images && raw.images.length > 0) ? raw.images : [];

  const depts = (raw.departments || []).map((d) => {
    if (typeof d === 'string') {
      return {
        name: d,
        slug: d.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };
    }
    return d;
  });

  const sources = (raw.sources || []).map((s) => ({
    label: s.label || s.name || `${raw.name} Official Website`,
    url: s.url || raw.website || '',
    type: s.type || 'official-registry',
    dateChecked: s.dateChecked || s.date_checked || raw.last_checked || '2026-10-17',
  }));

  let badge = raw.accreditation || 'Diagnostic Pathology Laboratory';
  if ((raw.accreditation || '').toUpperCase().includes('NABL')) {
    badge = 'NABL Accredited Diagnostics';
  } else if (!badge || badge.toLowerCase().includes('confirm')) {
    badge = 'Diagnostic Pathology Facility';
  }

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    state: raw.state || 'Maharashtra',
    city: raw.city ? raw.city.charAt(0).toUpperCase() + raw.city.slice(1) : 'Pune',
    area: raw.area || 'Pune',
    address: raw.address || '',
    pincode: raw.pincode || '',
    facilityType: 'Super-Speciality Tertiary Care',
    facilityTypeBadge: badge,
    images,
    overview: raw.overview || '',
    services: raw.services || [],
    departments: depts,
    facilities: raw.facilities || [],
    accreditation: raw.accreditation || '',
    homeSampleCollection: raw.home_sample_collection ?? true,
    emergencyAvailable24x7: raw.emergency_available_24x7 ?? false,
    website: raw.website || '',
    phone: raw.phone || CONTACT_PHONE,
    whatsapp: raw.whatsapp || CONTACT_WHATSAPP,
    mapsUrl: raw.maps_url || '',
    verificationStatus: (raw.verification_status as any) || 'independently-checked',
    lastChecked: raw.last_checked || '2026-10-17',
    sources,
    doctorIds: raw.connected_doctor_ids || [],
    connectedHospitalIds: raw.connected_hospital_ids || [],
    connectedDoctorIds: raw.connected_doctor_ids || [],
  };
}

export async function fetchLaboratories(params?: {
  city?: string;
  search?: string;
}): Promise<Hospital[]> {
  try {
    const query = new URLSearchParams();
    if (params?.city && params.city !== 'all') query.set('city', params.city);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const rawList = await apiFetch<RawLaboratory[]>(`/laboratories${qs}`);
    return rawList.map((l) => mapLaboratory(l));
  } catch (err) {
    console.warn('API error fetching laboratories:', err);
    return [];
  }
}

export async function fetchLaboratoryBySlug(slug: string): Promise<Hospital | null> {
  try {
    const raw = await apiFetch<RawLaboratory>(`/laboratories/${slug}`);
    return mapLaboratory(raw);
  } catch (err) {
    console.warn(`API error fetching laboratory ${slug}:`, err);
    return null;
  }
}

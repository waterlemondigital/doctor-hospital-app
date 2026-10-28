import { apiFetch } from './client';
import { Hospital } from '../types';
import { CONTACT_PHONE, CONTACT_WHATSAPP } from '../data/config';

interface RawHospital {
  id: string;
  slug: string;
  name: string;
  state: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  facility_type?: string;
  facility_type_badge?: string;
  overview?: string;
  bed_count?: number;
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
  doctors?: Array<{
    doctor_id: string;
    doctor_name?: string;
    doctor_slug?: string;
    speciality?: string;
    days: string;
    timings: string;
    note?: string;
  }>;
}

export function mapHospital(raw: RawHospital): Hospital {
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

  const doctorIds = (raw.doctors || []).map((d) => d.doctor_id);

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    state: raw.state || 'Maharashtra',
    city: raw.city ? raw.city.charAt(0).toUpperCase() + raw.city.slice(1) : 'Pune',
    area: raw.area || 'Pune',
    address: raw.address || '',
    pincode: raw.pincode || '',
    facilityType: (raw.facility_type as any) || 'Super-Speciality Tertiary Care',
    facilityTypeBadge: raw.facility_type_badge || 'NABH Accredited Flagship',
    images,
    overview: raw.overview || '',
    services: raw.services || [],
    departments: depts,
    facilities: raw.facilities || [],
    bedCount: raw.bed_count,
    emergencyAvailable24x7: raw.emergency_available_24x7 ?? true,
    website: raw.website || '',
    phone: CONTACT_PHONE,
    whatsapp: CONTACT_WHATSAPP,
    mapsUrl: raw.maps_url || '',
    verificationStatus: (raw.verification_status as any) || 'independently-checked',
    lastChecked: raw.last_checked || '2026-10-17',
    sources,
    doctorIds,
  };
}

export async function fetchHospitals(params?: {
  city?: string;
  state?: string;
  search?: string;
}): Promise<Hospital[]> {
  try {
    const query = new URLSearchParams();
    if (params?.city && params.city !== 'all') query.set('city', params.city);
    if (params?.state && params.state !== 'all') query.set('state', params.state);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const rawList = await apiFetch<RawHospital[]>(`/hospitals${qs}`, { cacheTtlMs: 30 * 1000 });
    return rawList.map((h, i) => mapHospital(h, i));
  } catch (err) {
    console.warn('API error fetching hospitals:', err);
    return [];
  }
}

export async function fetchHospitalBySlug(slug: string): Promise<Hospital | null> {
  try {
    const raw = await apiFetch<RawHospital>(`/hospitals/${slug}`, { cacheTtlMs: 10 * 1000 });
    return mapHospital(raw);
  } catch (err) {
    console.warn(`API error fetching hospital ${slug}:`, err);
    return null;
  }
}

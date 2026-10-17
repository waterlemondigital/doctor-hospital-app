import { apiFetch } from './client';
import { WellnessCenter, SourceCitation } from '../types';
import { CONTACT_PHONE, CONTACT_WHATSAPP } from '../data/config';

interface RawWellnessCenter {
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
  maps_url?: string;
  verification_status?: string;
  last_checked?: string;
  images?: any[];
  programs?: string[];
  disciplines?: string[];
  facilities?: string[];
  sources?: any[];
}

export function mapWellnessCenter(raw: RawWellnessCenter): WellnessCenter {
  const images = (raw.images && raw.images.length > 0) ? raw.images : [];

  const sources: SourceCitation[] = (raw.sources || []).map((s) => ({
    label: s.label || s.name || `${raw.name} Official Registry`,
    url: s.url || raw.website || '',
    type: s.type || 'official-registry',
    dateChecked: s.dateChecked || s.date_checked || raw.last_checked || '2026-10-17',
  }));

  if (sources.length === 0 && raw.website) {
    sources.push({
      label: `${raw.name} Official Website`,
      url: raw.website,
      type: 'official-registry',
      dateChecked: raw.last_checked || '2026-10-17',
    });
  }

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    category: raw.category || 'Yoga & Naturopathy Center',
    state: raw.state || 'Maharashtra',
    city: raw.city || 'pune',
    area: raw.area || '',
    address: raw.address || '',
    pincode: raw.pincode || '',
    accreditation: raw.accreditation || '',
    overview: raw.overview || '',
    website: raw.website || '',
    phone: CONTACT_PHONE,
    whatsapp: CONTACT_WHATSAPP,
    mapsUrl: raw.maps_url || '',
    verificationStatus: raw.verification_status || 'independently-checked',
    lastChecked: raw.last_checked || '2026-10-17',
    images,
    programs: raw.programs || [],
    disciplines: raw.disciplines || [],
    facilities: raw.facilities || [],
    sources,
  };
}

export interface WellnessQueryParams {
  city?: string;
  category?: string;
  search?: string;
}

export async function fetchWellnessCenters(params?: WellnessQueryParams): Promise<WellnessCenter[]> {
  try {
    const query = new URLSearchParams();
    if (params?.city && params.city !== 'all') query.set('city', params.city);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    const endpoint = `/wellness-centers${qs ? `?${qs}` : ''}`;
    const rawList = await apiFetch<RawWellnessCenter[]>(endpoint);
    return rawList.map((item, idx) => mapWellnessCenter(item, idx));
  } catch (err) {
    console.error('Failed to fetch wellness centers from API:', err);
    return [];
  }
}

export async function fetchWellnessCenterBySlug(slugOrId: string): Promise<WellnessCenter | null> {
  try {
    const raw = await apiFetch<RawWellnessCenter>(`/wellness-centers/${encodeURIComponent(slugOrId)}`);
    return mapWellnessCenter(raw);
  } catch (err) {
    console.error(`Failed to fetch wellness center ${slugOrId}:`, err);
    return null;
  }
}

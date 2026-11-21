/**
 * MedVexa Google Tag Manager & GA4 Analytics Integration
 * Container ID: GTM-WXB6GMJ4
 *
 * Implements tracking for:
 * 1. Website page views (SPA route transitions without duplicates)
 * 2. Hospital profile views
 * 3. Doctor profile views
 * 4. Wellness centre profile views
 * 5. Laboratory profile views
 * 6. Appointment button clicks
 * 7. Enquiry button clicks
 * 8. Successful enquiry form submissions
 * 9. Phone number clicks
 * 10. WhatsApp button clicks
 * 11. Traffic sources and initial landing pages
 */

export const GTM_CONTAINER_ID = 'GTM-WXB6GMJ4';

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
    gtag?: (...args: any[]) => void;
    __medvexa_analytics_initialized?: boolean;
  }
}

export interface TrafficAttribution {
  landing_page: string;
  landing_path: string;
  referrer: string;
  traffic_source: string;
  traffic_medium: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
}

const SESSION_STORAGE_KEY = 'medvexa_analytics_session';

// State deduplication guards
let lastTrackedPage = '';
let lastTrackedProfile = '';
let lastClickEventTimestamp = 0;
let lastClickEventFingerprint = '';

/**
 * Safely push an event to window.dataLayer
 */
export function pushDataLayer(data: Record<string, any>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);

  // If gtag is available, also notify gtag
  if (typeof window.gtag === 'function' && data.event) {
    const { event, ...params } = data;
    try {
      window.gtag('event', event, params);
    } catch {
      // Ignore gtag invocation errors if any
    }
  }

  // Developer visibility in development mode
  if (import.meta.env?.DEV) {
    console.debug('[GTM dataLayer Event]:', data.event, data);
  }
}

/**
 * Parses URL search params and document.referrer to determine initial traffic attribution
 */
export function getTrafficAttribution(): TrafficAttribution {
  if (typeof window === 'undefined') {
    return {
      landing_page: '',
      landing_path: '',
      referrer: '',
      traffic_source: 'direct',
      traffic_medium: 'none',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
    };
  }

  // Check if session attribution is already cached for this session
  try {
    const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // sessionStorage might be restricted in private/incognito modes
  }

  const url = new URL(window.location.href);
  const params = url.searchParams;

  const utm_source = params.get('utm_source') || '';
  const utm_medium = params.get('utm_medium') || '';
  const utm_campaign = params.get('utm_campaign') || '';
  const utm_term = params.get('utm_term') || '';
  const utm_content = params.get('utm_content') || '';

  const referrer = document.referrer || '';
  let traffic_source = 'direct';
  let traffic_medium = 'none';

  if (utm_source) {
    traffic_source = utm_source;
    traffic_medium = utm_medium || 'cpc';
  } else if (referrer) {
    try {
      const refUrl = new URL(referrer);
      const host = refUrl.hostname.toLowerCase();

      if (host.includes('medvexa.health') || host === window.location.hostname) {
        traffic_source = 'direct';
        traffic_medium = 'internal';
      } else if (host.includes('google.')) {
        traffic_source = 'google';
        traffic_medium = 'organic';
      } else if (host.includes('bing.')) {
        traffic_source = 'bing';
        traffic_medium = 'organic';
      } else if (host.includes('yahoo.')) {
        traffic_source = 'yahoo';
        traffic_medium = 'organic';
      } else if (host.includes('duckduckgo.')) {
        traffic_source = 'duckduckgo';
        traffic_medium = 'organic';
      } else if (host.includes('facebook.') || host.includes('fb.')) {
        traffic_source = 'facebook';
        traffic_medium = 'social';
      } else if (host.includes('instagram.')) {
        traffic_source = 'instagram';
        traffic_medium = 'social';
      } else if (host.includes('linkedin.')) {
        traffic_source = 'linkedin';
        traffic_medium = 'social';
      } else if (host.includes('twitter.') || host.includes('x.com')) {
        traffic_source = 'twitter';
        traffic_medium = 'social';
      } else if (host.includes('whatsapp.')) {
        traffic_source = 'whatsapp';
        traffic_medium = 'chat';
      } else {
        traffic_source = host;
        traffic_medium = 'referral';
      }
    } catch {
      traffic_source = 'referral';
      traffic_medium = 'unknown';
    }
  }

  const attribution: TrafficAttribution = {
    landing_page: window.location.href,
    landing_path: window.location.pathname + window.location.search,
    referrer,
    traffic_source,
    traffic_medium,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
  };

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Ignore storage quota or security errors
  }

  return attribution;
}

/**
 * 1. SPA Page View Tracking (Prevents duplicates across re-renders)
 */
export function trackPageView(path: string, customTitle?: string) {
  if (typeof window === 'undefined') return;

  const currentPath = path || (window.location.pathname + window.location.search);
  const currentTitle = customTitle || document.title || 'Medvexa';

  // Prevent duplicate page view tracking if path hasn't changed
  if (lastTrackedPage === currentPath) {
    return;
  }
  lastTrackedPage = currentPath;

  const attribution = getTrafficAttribution();

  pushDataLayer({
    event: 'page_view',
    page_path: currentPath,
    page_title: currentTitle,
    page_location: window.location.href,
    landing_page: attribution.landing_page,
    landing_path: attribution.landing_path,
    traffic_source: attribution.traffic_source,
    traffic_medium: attribution.traffic_medium,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
  });

  // Also push virtual_page_view for GTM setups requiring a distinct custom event trigger
  pushDataLayer({
    event: 'virtual_page_view',
    page_path: currentPath,
    page_title: currentTitle,
    page_location: window.location.href,
  });
}

/**
 * 2. Hospital Profile View
 */
export function trackHospitalProfileView(hospital: {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  country?: string;
  facilityType?: string;
}) {
  const profileKey = `hospital:${hospital.id || hospital.slug}`;
  if (lastTrackedProfile === profileKey) return;
  lastTrackedProfile = profileKey;

  pushDataLayer({
    event: 'hospital_profile_view',
    entity_type: 'hospital',
    hospital_id: hospital.id,
    hospital_name: hospital.name,
    hospital_slug: hospital.slug,
    city: hospital.city || '',
    state: hospital.state || '',
    country: hospital.country || '',
    facility_type: hospital.facilityType || '',
    // GA4 view_item compatibility
    ecommerce: {
      items: [
        {
          item_id: hospital.id,
          item_name: hospital.name,
          item_category: 'Hospital',
          item_category2: hospital.city || '',
        },
      ],
    },
  });
}

/**
 * 3. Doctor Profile View
 */
export function trackDoctorProfileView(doctor: {
  id: string;
  name: string;
  slug: string;
  speciality?: string;
  department?: string;
  hospitalName?: string;
  city?: string;
}) {
  const profileKey = `doctor:${doctor.id || doctor.slug}`;
  if (lastTrackedProfile === profileKey) return;
  lastTrackedProfile = profileKey;

  pushDataLayer({
    event: 'doctor_profile_view',
    entity_type: 'doctor',
    doctor_id: doctor.id,
    doctor_name: doctor.name,
    doctor_slug: doctor.slug,
    speciality: doctor.speciality || '',
    department: doctor.department || '',
    hospital_name: doctor.hospitalName || '',
    city: doctor.city || '',
    // GA4 view_item compatibility
    ecommerce: {
      items: [
        {
          item_id: doctor.id,
          item_name: doctor.name,
          item_category: 'Doctor',
          item_category2: doctor.speciality || '',
        },
      ],
    },
  });
}

/**
 * 4. Wellness Centre Profile View
 */
export function trackWellnessProfileView(center: {
  id: string;
  name: string;
  slug: string;
  category?: string;
  city?: string;
}) {
  const profileKey = `wellness:${center.id || center.slug}`;
  if (lastTrackedProfile === profileKey) return;
  lastTrackedProfile = profileKey;

  pushDataLayer({
    event: 'wellness_profile_view',
    entity_type: 'wellness_centre',
    center_id: center.id,
    center_name: center.name,
    center_slug: center.slug,
    category: center.category || '',
    city: center.city || '',
    ecommerce: {
      items: [
        {
          item_id: center.id,
          item_name: center.name,
          item_category: 'Wellness Centre',
          item_category2: center.category || '',
        },
      ],
    },
  });
}

/**
 * 5. Laboratory Profile View
 */
export function trackLaboratoryProfileView(laboratory: {
  id: string;
  name: string;
  slug: string;
  nabl?: boolean;
  city?: string;
}) {
  const profileKey = `laboratory:${laboratory.id || laboratory.slug}`;
  if (lastTrackedProfile === profileKey) return;
  lastTrackedProfile = profileKey;

  pushDataLayer({
    event: 'laboratory_profile_view',
    entity_type: 'laboratory',
    lab_id: laboratory.id,
    lab_name: laboratory.name,
    lab_slug: laboratory.slug,
    nabl_accredited: Boolean(laboratory.nabl),
    city: laboratory.city || '',
    ecommerce: {
      items: [
        {
          item_id: laboratory.id,
          item_name: laboratory.name,
          item_category: 'Laboratory',
        },
      ],
    },
  });
}

/**
 * 6. Appointment Button Click
 */
export function trackAppointmentClick(details: {
  targetType?: string;
  targetName?: string;
  targetUrl?: string;
  buttonText: string;
  clickLocation?: string;
}) {
  const now = Date.now();
  const fingerprint = `apt:${details.targetName}:${details.buttonText}`;
  if (now - lastClickEventTimestamp < 350 && lastClickEventFingerprint === fingerprint) {
    return;
  }
  lastClickEventTimestamp = now;
  lastClickEventFingerprint = fingerprint;

  pushDataLayer({
    event: 'appointment_button_click',
    target_type: details.targetType || 'general',
    target_name: details.targetName || 'Medvexa Appointment Desk',
    target_url: details.targetUrl || '',
    button_text: details.buttonText,
    click_location: details.clickLocation || window.location.pathname,
  });
}

/**
 * 7. Enquiry Button Click
 */
export function trackEnquiryClick(details: {
  targetType: string;
  targetName: string;
  targetId?: string;
  buttonText: string;
  clickLocation?: string;
}) {
  const now = Date.now();
  const fingerprint = `enq_click:${details.targetType}:${details.targetName}:${details.buttonText}`;
  if (now - lastClickEventTimestamp < 350 && lastClickEventFingerprint === fingerprint) {
    return;
  }
  lastClickEventTimestamp = now;
  lastClickEventFingerprint = fingerprint;

  pushDataLayer({
    event: 'enquiry_button_click',
    target_type: details.targetType,
    target_name: details.targetName,
    target_id: details.targetId || '',
    button_text: details.buttonText,
    click_location: details.clickLocation || window.location.pathname,
  });
}

/**
 * 8. Successful Enquiry Form Submission
 * Note: Never send raw personal details (patient name/phone) to GA4/GTM to strictly comply with privacy standards.
 */
export function trackEnquirySubmit(details: {
  targetType: string;
  targetName: string;
  formType: 'query_dialog' | 'hero_inquiry_form' | 'contact_form';
  targetId?: string;
  city?: string;
  state?: string;
  country?: string;
}) {
  pushDataLayer({
    event: 'enquiry_form_submit',
    ga4_event: 'generate_lead',
    form_type: details.formType,
    target_type: details.targetType,
    target_name: details.targetName,
    target_id: details.targetId || '',
    city: details.city || '',
    state: details.state || '',
    country: details.country || '',
    submitted_at: new Date().toISOString(),
  });
}

/**
 * 9. Phone Number Click
 */
export function trackPhoneClick(details: {
  phoneNumber: string;
  targetName?: string;
  targetType?: string;
  clickLocation?: string;
}) {
  const cleanPhone = details.phoneNumber.replace(/[^0-9+]/g, '');
  const now = Date.now();
  const fingerprint = `phone:${cleanPhone}`;
  if (now - lastClickEventTimestamp < 350 && lastClickEventFingerprint === fingerprint) {
    return;
  }
  lastClickEventTimestamp = now;
  lastClickEventFingerprint = fingerprint;

  pushDataLayer({
    event: 'phone_click',
    phone_number: cleanPhone,
    target_name: details.targetName || 'Medvexa Healthcare Helpline',
    target_type: details.targetType || 'general',
    click_location: details.clickLocation || window.location.pathname,
  });
}

/**
 * 10. WhatsApp Button Click
 */
export function trackWhatsAppClick(details: {
  phoneNumber?: string;
  targetName?: string;
  targetType?: string;
  clickLocation?: string;
}) {
  const cleanPhone = (details.phoneNumber || '7875657402').replace(/[^0-9+]/g, '');
  const now = Date.now();
  const fingerprint = `wa:${cleanPhone}`;
  if (now - lastClickEventTimestamp < 350 && lastClickEventFingerprint === fingerprint) {
    return;
  }
  lastClickEventTimestamp = now;
  lastClickEventFingerprint = fingerprint;

  pushDataLayer({
    event: 'whatsapp_click',
    phone_number: cleanPhone,
    target_name: details.targetName || 'Medvexa WhatsApp Support',
    target_type: details.targetType || 'general',
    click_location: details.clickLocation || window.location.pathname,
  });
}

/**
 * Global click interceptor to catch any phone, WhatsApp, appointment, or enquiry clicks across the site
 */
export function setupGlobalClickDelegation() {
  if (typeof window === 'undefined') return;

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check closest anchor or button
    const anchor = target.closest('a') as HTMLAnchorElement | null;
    const button = target.closest('button') as HTMLButtonElement | null;
    const interactiveEl = anchor || button;

    if (!interactiveEl) return;

    // Check if element has an explicit data-track-ignore attribute
    if (interactiveEl.getAttribute('data-track-ignore') === 'true') {
      return;
    }

    const href = anchor ? anchor.getAttribute('href') || '' : '';
    const text = (interactiveEl.textContent || '').trim();

    // 1. Phone link detection: <a href="tel:...">
    if (href.startsWith('tel:')) {
      const phone = href.replace('tel:', '');
      trackPhoneClick({
        phoneNumber: phone,
        targetName: interactiveEl.getAttribute('data-target-name') || text || 'Medvexa Phone Link',
        targetType: interactiveEl.getAttribute('data-target-type') || 'general',
        clickLocation: window.location.pathname,
      });
      return;
    }

    // 2. WhatsApp link detection: <a href*="wa.me"> or <a href*="whatsapp.com">
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      const waMatch = href.match(/wa\.me\/([0-9+]+)/);
      const phone = waMatch ? waMatch[1] : '7875657402';
      trackWhatsAppClick({
        phoneNumber: phone,
        targetName: interactiveEl.getAttribute('data-target-name') || text || 'Medvexa WhatsApp',
        targetType: interactiveEl.getAttribute('data-target-type') || 'general',
        clickLocation: window.location.pathname,
      });
      return;
    }

    // 3. Appointment link / button detection
    const isAppointmentAction =
      interactiveEl.getAttribute('data-track-appointment') === 'true' ||
      href.includes('/book') ||
      href.includes('appointment') ||
      text.toLowerCase().includes('book sample') ||
      text.toLowerCase().includes('book appointment') ||
      text.toLowerCase().includes('make an appointment');

    if (isAppointmentAction) {
      trackAppointmentClick({
        targetType: interactiveEl.getAttribute('data-target-type') || 'general',
        targetName: interactiveEl.getAttribute('data-target-name') || text,
        targetUrl: href || window.location.href,
        buttonText: text || 'Appointment Action',
        clickLocation: window.location.pathname,
      });
      return;
    }

    // 4. Enquiry link / button detection
    const isEnquiryAction =
      interactiveEl.getAttribute('data-track-enquiry') === 'true' ||
      text.toLowerCase().includes('send a non-clinical query') ||
      text.toLowerCase().includes('inquire with hospital desk') ||
      text.toLowerCase().includes('inquire test package') ||
      text.toLowerCase().includes('send general query');

    if (isEnquiryAction) {
      trackEnquiryClick({
        targetType: interactiveEl.getAttribute('data-target-type') || 'general',
        targetName: interactiveEl.getAttribute('data-target-name') || text,
        targetId: interactiveEl.getAttribute('data-target-id') || '',
        buttonText: text || 'Enquiry Button',
        clickLocation: window.location.pathname,
      });
    }
  };

  document.addEventListener('click', handleClick, { capture: true, passive: true });
}

/**
 * Main initialization routine called once globally when application starts
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;
  if (window.__medvexa_analytics_initialized) return;
  window.__medvexa_analytics_initialized = true;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // Capture and broadcast initial traffic attribution
  const attribution = getTrafficAttribution();
  pushDataLayer({
    event: 'traffic_source_detected',
    ...attribution,
  });

  // Attach global click event delegation
  setupGlobalClickDelegation();

  if (import.meta.env?.DEV) {
    console.info(`[Medvexa Analytics] Initialized with GTM Container: ${GTM_CONTAINER_ID}`);
  }
}

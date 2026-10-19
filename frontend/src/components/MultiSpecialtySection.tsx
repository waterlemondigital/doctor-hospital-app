import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Phone, MessageSquare } from 'lucide-react';
import {
  CONTACT_PHONE,
  CONTACT_PHONE_CALL_HREF,
  CONTACT_WHATSAPP_CLEAN,
} from '../data/config';

interface SpecialtyItem {
  id: string;
  name: string;
  description: string;
  queryParam: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    hoverBg: string;
    hoverText: string;
    hoverBorder: string;
    lightRing: string;
  };
  icon: () => JSX.Element;
}

/**
 * Curated exclusively from verified database records:
 * (Doctors specialities and hospital clinical departments in PostgreSQL)
 */
const SPECIALTIES: SpecialtyItem[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'World-class heart care, interventions, and cardiac surgery.',
    queryParam: 'Cardiology',
    colorScheme: {
      bg: 'bg-rose-50/80',
      border: 'border-rose-100',
      text: 'text-rose-600',
      hoverBg: 'group-hover:bg-rose-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-rose-600',
      lightRing: 'group-hover:ring-rose-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 13c-2.5-4-7.5-5-10.5-2s-3 8 0 12l10.5 12 10.5-12c3-4 3-9 0-12s-8-2-10.5 2z" />
        <path d="M19 24h3l2-4 3 7 2-4h3" />
        <path d="M38 28v7a5 5 0 0 1-10 0v-2" strokeDasharray="2 2" opacity="0.6" />
        <circle cx="28" cy="33" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    description: 'Expert joint replacements, arthroscopy, and trauma care.',
    queryParam: 'Orthopaedics',
    colorScheme: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-100',
      text: 'text-amber-600',
      hoverBg: 'group-hover:bg-amber-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-amber-600',
      lightRing: 'group-hover:ring-amber-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7v10a5 5 0 0 0 5 5h1a5 5 0 0 1 5 5v14" />
        <path d="M14 7v8a8 8 0 0 0 8 8" />
        <ellipse cx="25" cy="24" rx="4" ry="5" />
        <circle cx="36" cy="36" r="6" strokeWidth="2" />
        <path d="M36 33v6M33 36h6" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Specialized care for stroke, epilepsy, and nervous system disorders.',
    queryParam: 'Neurology',
    colorScheme: {
      bg: 'bg-purple-50/80',
      border: 'border-purple-100',
      text: 'text-purple-600',
      hoverBg: 'group-hover:bg-purple-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-purple-600',
      lightRing: 'group-hover:ring-purple-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 8c-7 0-13 5-13 13 0 4 2 7 5 9v10h16V30c3-2 5-5 5-9 0-8-6-13-13-13z" />
        <path d="M16 18c2-2 5-2 7 0M16 26c3-1 5 1 8 0M32 18c-2-2-5-2-7 0M32 26c-3-1-5 1-8 0" />
      </svg>
    ),
  },
  {
    id: 'neurosurgery',
    name: 'Neurosurgery',
    description: 'Complex brain surgeries, cranial procedures, and neuro-oncology.',
    queryParam: 'Neurosurgery',
    colorScheme: {
      bg: 'bg-violet-50/80',
      border: 'border-violet-100',
      text: 'text-violet-600',
      hoverBg: 'group-hover:bg-violet-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-violet-600',
      lightRing: 'group-hover:ring-violet-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 7c-7 0-12 5-12 12 0 8 5 14 12 21 7-7 12-13 12-21 0-7-5-12-12-12z" />
        <line x1="24" y1="7" x2="24" y2="40" strokeDasharray="3 3" />
        <circle cx="24" cy="20" r="4" strokeWidth="2" />
        <path d="M18 19h-3M30 19h3" />
      </svg>
    ),
  },
  {
    id: 'spine-surgery',
    name: 'Spine Surgery',
    description: 'Precision spine surgeries, disc care, and spinal mobility restoration.',
    queryParam: 'Orthopaedics',
    colorScheme: {
      bg: 'bg-sky-50/80',
      border: 'border-sky-100',
      text: 'text-sky-600',
      hoverBg: 'group-hover:bg-sky-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-sky-600',
      lightRing: 'group-hover:ring-sky-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="6" width="12" height="6" rx="2" />
        <rect x="16" y="14" width="16" height="6" rx="2" />
        <rect x="15" y="22" width="18" height="6" rx="2" />
        <rect x="16" y="30" width="16" height="6" rx="2" />
        <rect x="18" y="38" width="12" height="5" rx="2" />
        <line x1="24" y1="6" x2="24" y2="43" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'oncology',
    name: 'Oncology',
    description: 'Advanced medical oncology, targeted chemotherapy, and cancer therapy.',
    queryParam: 'Medical Oncology',
    colorScheme: {
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-100',
      text: 'text-indigo-600',
      hoverBg: 'group-hover:bg-indigo-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-indigo-600',
      lightRing: 'group-hover:ring-indigo-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 18a4 4 0 1 1 8 0c0 4-6 10-6 10s-6-6-6-10" />
        <path d="M21 25l-7 14M27 25l7 14" />
        <path d="M10 28c2 5 7 9 14 9s12-4 14-9" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'paediatrics',
    name: 'Paediatrics & Neonatology',
    description: 'Comprehensive child healthcare, neonatal intensive care, and surgery.',
    queryParam: 'Paediatrics',
    colorScheme: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      hoverBg: 'group-hover:bg-emerald-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-emerald-600',
      lightRing: 'group-hover:ring-emerald-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="16" r="6" />
        <path d="M15 34c0-5 4-9 9-9s9 4 9 9" />
        <path d="M12 20a12 12 0 0 0 24 0" strokeDasharray="2 2" opacity="0.6" />
        <path d="M24 34v6" />
      </svg>
    ),
  },
  {
    id: 'obstetrics-gynaecology',
    name: 'Obstetrics & Gynaecology',
    description: 'Specialized maternity care, high-risk pregnancy, and women’s health.',
    queryParam: 'Obstetrics & Gynaecology',
    colorScheme: {
      bg: 'bg-fuchsia-50/80',
      border: 'border-fuchsia-100',
      text: 'text-fuchsia-600',
      hoverBg: 'group-hover:bg-fuchsia-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-fuchsia-600',
      lightRing: 'group-hover:ring-fuchsia-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 10c-6 0-11 5-11 11 0 7 8 15 11 18 3-3 11-11 11-18 0-6-5-11-11-11z" />
        <path d="M19 19c2-2 8-2 10 0M19 25c2 2 8 2 10 0" opacity="0.6" />
        <circle cx="24" cy="21" r="3" />
      </svg>
    ),
  },
  {
    id: 'nephrology',
    name: 'Nephrology',
    description: 'Expert renal medicine, dialysis care, and kidney disease management.',
    queryParam: 'Nephrology',
    colorScheme: {
      bg: 'bg-teal-50/80',
      border: 'border-teal-100',
      text: 'text-teal-600',
      hoverBg: 'group-hover:bg-teal-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-teal-600',
      lightRing: 'group-hover:ring-teal-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c-4-4-9-1-10 4s0 12 5 15c4 2 7-2 7-6 0-3-2-5-2-7s2-4 0-6z" />
        <path d="M29 14c4-4 9-1 10 4s0 12-5 15c-4 2-7-2-7-6 0-3 2-5 2-7s-2-4 0-6z" />
        <path d="M17 28c3 4 5 10 5 14M31 28c-3 4-5 10-5 14" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'urology',
    name: 'Urology',
    description: 'Urinary tract treatments, kidney stone removal, and uro-care.',
    queryParam: 'Urology',
    colorScheme: {
      bg: 'bg-cyan-50/80',
      border: 'border-cyan-100',
      text: 'text-cyan-600',
      hoverBg: 'group-hover:bg-cyan-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-cyan-600',
      lightRing: 'group-hover:ring-cyan-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 10v12c0 5 3 9 8 9s8-4 8-9V10" />
        <circle cx="24" cy="36" r="4" />
        <path d="M24 31v1M24 40v3" />
      </svg>
    ),
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology',
    description: 'Comprehensive digestive tract health, endoscopy, and hepatobiliary care.',
    queryParam: 'General Surgery',
    colorScheme: {
      bg: 'bg-orange-50/80',
      border: 'border-orange-100',
      text: 'text-orange-600',
      hoverBg: 'group-hover:bg-orange-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-orange-600',
      lightRing: 'group-hover:ring-orange-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 9c-4 0-7 3-7 7 0 6 3 9 4 15 1 5-2 7-6 8" />
        <path d="M22 9c6 0 12 3 12 11 0 8-7 12-14 12" />
        <path d="M20 22c2-1 6-1 8 1" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'internal-medicine',
    name: 'Internal Medicine',
    description: 'Adult internal medicine, multi-system diagnoses, and chronic disease care.',
    queryParam: 'Internal Medicine',
    colorScheme: {
      bg: 'bg-blue-50/80',
      border: 'border-blue-100',
      text: 'text-blue-600',
      hoverBg: 'group-hover:bg-blue-600',
      hoverText: 'group-hover:text-white',
      hoverBorder: 'group-hover:border-blue-600',
      lightRing: 'group-hover:ring-blue-100',
    },
    icon: () => (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 12v12a10 10 0 0 0 20 0V12" />
        <circle cx="14" cy="10" r="2.5" fill="currentColor" />
        <circle cx="34" cy="10" r="2.5" fill="currentColor" />
        <path d="M24 34v4a4 4 0 0 0 8 0v-2" />
        <circle cx="32" cy="36" r="3" strokeWidth="2" />
      </svg>
    ),
  },
];

export function MultiSpecialtySection() {
  const navigate = useNavigate();

  const handleSelectSpecialty = (spec: SpecialtyItem) => {
    navigate(`/doctors?speciality=${encodeURIComponent(spec.queryParam)}`);
  };

  const waUrl = `https://wa.me/${CONTACT_WHATSAPP_CLEAN}?text=${encodeURIComponent(
    'Hello, I would like guidance on finding the right doctor and department.'
  )}`;

  return (
    <section
      className="relative rounded-3xl bg-gradient-to-b from-[#f0f9ff]/70 via-[#f8fafc] to-white p-6 sm:p-10 lg:p-12 border border-[#90e0ef]/50 shadow-xs overflow-hidden"
      aria-labelledby="multi-specialty-title"
    >
      {/* Soft Ambient Background Glows */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#00b4d8]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#0077b6]/10 blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-2 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#0077b6] border border-[#90e0ef] shadow-2xs mb-1">
          <Sparkles className="h-3.5 w-3.5 text-[#0077b6]" />
          <span>Clinical Excellence</span>
        </div>

        <h2
          id="multi-specialty-title"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#03045e] tracking-tight"
        >
          Multi-Specialty Focus
        </h2>
        <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
          Verified medical specialties across leading hospitals and specialist doctors.
        </p>
      </div>

      {/* Grid of Specialty Cards: Exactly 12 Cards in 3 Columns matching Reference Layout */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 sm:gap-5">
        {SPECIALTIES.map((spec) => {
          const IconComponent = spec.icon;
          const { bg, border, text, hoverBg, hoverText, hoverBorder, lightRing } = spec.colorScheme;

          return (
            <div
              key={spec.id}
              onClick={() => handleSelectSpecialty(spec)}
              className={`group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:shadow-[#0077b6]/8 hover:border-[#0077b6]/60 hover:-translate-y-1 transition-all duration-300 flex items-start justify-between gap-3 cursor-pointer select-none overflow-hidden ring-0 ${lightRing} hover:ring-2`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectSpecialty(spec);
                }
              }}
              aria-label={`View ${spec.name} specialists`}
            >
              {/* Subtle Top Accent Highlight that glows on hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-[#0077b6] to-transparent transition-opacity duration-300" />

              <div className="flex items-start gap-4 min-w-0">
                {/* Dedicated Tinted Icon Tile with Smooth Color Transition */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${bg} ${border} ${text} ${hoverBg} ${hoverText} ${hoverBorder} shadow-2xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-300`}
                >
                  <IconComponent />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] sm:text-base font-bold text-slate-900 group-hover:text-[#0077b6] transition-colors leading-tight">
                    {spec.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {spec.description}
                  </p>
                </div>
              </div>

              {/* Red Circular Plus Accent Icon with Radiant Gradient */}
              <div className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-xs group-hover:scale-110 group-hover:from-rose-500 group-hover:to-red-400 group-hover:shadow-sm transition-all duration-300 mt-0.5">
                <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Assistance Callout Strip */}
      <div className="relative z-10 mt-8 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm font-bold text-[#03045e]">
            Need immediate guidance choosing the right department or doctor?
          </p>
          <p className="text-xs text-slate-500">
            Our verified healthcare helpline is accessible for queries and hospital appointments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`tel:${CONTACT_PHONE_CALL_HREF}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#0077b6] px-3.5 py-2 text-xs font-bold text-[#03045e] hover:text-[#0077b6] shadow-2xs transition-all"
          >
            <Phone className="h-3.5 w-3.5 text-[#0077b6]" />
            <span>{CONTACT_PHONE}</span>
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-all"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}

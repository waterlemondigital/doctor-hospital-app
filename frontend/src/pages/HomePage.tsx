import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  UserRound,
  Phone,
  CalendarCheck,
  Flag,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Sparkles,
  X,
  Stethoscope,
} from 'lucide-react';
import { SITE_NAME, SITE_TAGLINE, SITE_SUBTITLE, CONTACT_PHONE, CONTACT_PHONE_CALL_HREF } from '../data/config';
import { LOCATIONS_DATA, ACTIVE_STATE, ACTIVE_CITY } from '../data/locations';
import { Hospital, Doctor, WellnessCenter } from '../types';
import { SPECIALITIES_DATA } from '../data/specialities';
import { fetchHospitals } from '../api/hospitals';
import { fetchDoctors } from '../api/doctors';
import { fetchLaboratories } from '../api/laboratories';
import { fetchWellnessCenters } from '../api/wellness';
import { HospitalCard } from '../components/HospitalCard';
import { DoctorCard } from '../components/DoctorCard';
import { LaboratoryCard } from '../components/LaboratoryCard';
import { WellnessCard } from '../components/WellnessCard';
import { AdSlot } from '../components/AdSlot';
import { MultiSpecialtySection } from '../components/MultiSpecialtySection';
import { FamousCitiesSection } from '../components/FamousCitiesSection';
import { FamousHospitalsSection } from '../components/FamousHospitalsSection';
import { HeroInquiryForm } from '../components/HeroInquiryForm';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { FlaskConical, Sparkles as SparklesIcon, Leaf } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = React.useState<Hospital[]>([]);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [laboratories, setLaboratories] = React.useState<Hospital[]>([]);
  const [wellnessCenters, setWellnessCenters] = React.useState<WellnessCenter[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchHospitals(),
      fetchDoctors(),
      fetchLaboratories(),
      fetchWellnessCenters(),
    ]).then(([h, d, labs, wellness]) => {
      if (isMounted) {
        if (h && h.length > 0) setHospitals(h);
        if (d && d.length > 0) setDoctors(d);
        if (labs && labs.length > 0) setLaboratories(labs);
        if (wellness && wellness.length > 0) setWellnessCenters(wellness);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Search state for all healthcare services
  type SearchCategory = 'all' | 'hospitals' | 'doctors' | 'laboratories' | 'wellness' | 'specialities';
  const [searchCategory, setSearchCategory] = React.useState<SearchCategory>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Location selector state
  const [selectedState, setSelectedState] = React.useState(ACTIVE_STATE.id);
  const [selectedCity, setSelectedCity] = React.useState(ACTIVE_CITY.id);

  const currentState = LOCATIONS_DATA.find((s) => s.id === selectedState) || ACTIVE_STATE;

  // Click outside to close suggestion dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter live suggestions across all services
  const cleanHeroQuery = searchQuery.toLowerCase().trim();

  const suggestedHospitals = cleanHeroQuery
    ? hospitals.filter(
        (h) =>
          (searchCategory === 'all' || searchCategory === 'hospitals') &&
          (h.name.toLowerCase().includes(cleanHeroQuery) ||
            h.city.toLowerCase().includes(cleanHeroQuery) ||
            h.area.toLowerCase().includes(cleanHeroQuery) ||
            h.services.some((s) => s.toLowerCase().includes(cleanHeroQuery)) ||
            h.departments.some(
              (d) =>
                d.name.toLowerCase().includes(cleanHeroQuery) ||
                d.slug.toLowerCase().includes(cleanHeroQuery)
            ))
      ).slice(0, 3)
    : [];

  const suggestedDoctors = cleanHeroQuery
    ? doctors.filter(
        (d) =>
          (searchCategory === 'all' || searchCategory === 'doctors') &&
          (d.name.toLowerCase().includes(cleanHeroQuery) ||
            (d.city && d.city.toLowerCase().includes(cleanHeroQuery)) ||
            (d.area && d.area.toLowerCase().includes(cleanHeroQuery)) ||
            d.department.toLowerCase().includes(cleanHeroQuery) ||
            d.departmentSlug.toLowerCase().includes(cleanHeroQuery) ||
            d.speciality.toLowerCase().includes(cleanHeroQuery) ||
            d.subSpeciality.toLowerCase().includes(cleanHeroQuery) ||
            d.areasOfPractice.some((a) => a.toLowerCase().includes(cleanHeroQuery)))
      ).slice(0, 3)
    : [];

  const suggestedLaboratories = cleanHeroQuery
    ? laboratories.filter(
        (lab) =>
          (searchCategory === 'all' || searchCategory === 'laboratories') &&
          (lab.name.toLowerCase().includes(cleanHeroQuery) ||
            lab.city.toLowerCase().includes(cleanHeroQuery) ||
            lab.area.toLowerCase().includes(cleanHeroQuery) ||
            lab.services.some((s) => s.toLowerCase().includes(cleanHeroQuery)) ||
            (lab.accreditation && lab.accreditation.toLowerCase().includes(cleanHeroQuery)))
      ).slice(0, 3)
    : [];

  const suggestedWellness = cleanHeroQuery
    ? wellnessCenters.filter(
        (w) =>
          (searchCategory === 'all' || searchCategory === 'wellness') &&
          (w.name.toLowerCase().includes(cleanHeroQuery) ||
            w.city.toLowerCase().includes(cleanHeroQuery) ||
            w.area.toLowerCase().includes(cleanHeroQuery) ||
            w.category.toLowerCase().includes(cleanHeroQuery) ||
            w.programs.some((p) => p.toLowerCase().includes(cleanHeroQuery)) ||
            w.disciplines.some((disc) => disc.toLowerCase().includes(cleanHeroQuery)))
      ).slice(0, 3)
    : [];

  const suggestedSpecialities = cleanHeroQuery
    ? SPECIALITIES_DATA.filter(
        (s) =>
          (searchCategory === 'all' || searchCategory === 'specialities') &&
          (s.name.toLowerCase().includes(cleanHeroQuery) ||
            s.description.toLowerCase().includes(cleanHeroQuery))
      ).slice(0, 2)
    : [];

  const hasSuggestions =
    suggestedHospitals.length > 0 ||
    suggestedDoctors.length > 0 ||
    suggestedLaboratories.length > 0 ||
    suggestedWellness.length > 0 ||
    suggestedSpecialities.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuggestionsOpen(false);
    const query = searchQuery.trim();
    if (!query) {
      if (searchCategory === 'doctors') {
        navigate('/doctors');
      } else if (searchCategory === 'laboratories') {
        navigate('/laboratories');
      } else if (searchCategory === 'wellness') {
        navigate('/wellness-centers');
      } else {
        navigate('/hospitals');
      }
      return;
    }

    if (searchCategory === 'doctors') {
      navigate(`/doctors?search=${encodeURIComponent(query)}`);
    } else if (searchCategory === 'laboratories') {
      navigate(`/laboratories?search=${encodeURIComponent(query)}`);
    } else if (searchCategory === 'wellness') {
      navigate(`/wellness-centers?search=${encodeURIComponent(query)}`);
    } else if (searchCategory === 'specialities') {
      navigate(`/doctors?speciality=${encodeURIComponent(query)}`);
    } else {
      // Smart routing for 'all': navigate to specific service if single match type, otherwise default to hospitals directory search
      if (suggestedDoctors.length > 0 && suggestedHospitals.length === 0 && suggestedLaboratories.length === 0 && suggestedWellness.length === 0) {
        navigate(`/doctors?search=${encodeURIComponent(query)}`);
      } else if (suggestedLaboratories.length > 0 && suggestedHospitals.length === 0 && suggestedDoctors.length === 0 && suggestedWellness.length === 0) {
        navigate(`/laboratories?search=${encodeURIComponent(query)}`);
      } else if (suggestedWellness.length > 0 && suggestedHospitals.length === 0 && suggestedDoctors.length === 0 && suggestedLaboratories.length === 0) {
        navigate(`/wellness-centers?search=${encodeURIComponent(query)}`);
      } else {
        navigate(`/hospitals?search=${encodeURIComponent(query)}`);
      }
    }
  };

  const openCorrectionDialog = () => {
    window.dispatchEvent(
      new CustomEvent('open-correction-dialog', {
        detail: { subject: 'Homepage Listing Update' },
      })
    );
  };

  return (
    <div className="space-y-12">
      {/* 1. Hero Section with soft light-cyan gradient (No overflow-hidden on outer container so dropdown is not clipped) */}
      <section className="relative rounded-3xl bg-gradient-to-b from-[#caf0f8]/70 via-[#caf0f8]/20 to-white p-6 sm:p-10 lg:p-14 border border-[#90e0ef]/60 shadow-xs">
        {/* Decorative soft circles confined to clipped background */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#90e0ef]/30 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[#00b4d8]/15 blur-2xl pointer-events-none" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Shifted to Left Alignment */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            <div>
              <a
                href={CONTACT_PHONE_CALL_HREF}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold text-[#0077b6] border border-[#90e0ef] shadow-2xs hover:bg-white transition-colors"
              >
                <Phone className="h-4 w-4 text-[#0077b6]" />
                <span>{CONTACT_PHONE}</span>
              </a>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#03045e] leading-tight text-balance">
              {SITE_TAGLINE}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-balance max-w-xl">
              {SITE_SUBTITLE}
            </p>

            {/* Large Search Bar with Live Suggestions */}
            <div ref={searchContainerRef} className="relative z-30 w-full max-w-2xl">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-white p-2 rounded-2xl border-2 border-[#90e0ef] shadow-md focus-within:border-[#0077b6] transition-colors"
            >
              {/* Category Select */}
              <div className="sm:w-44 shrink-0">
                <Select
                  value={searchCategory}
                  onChange={(e) => {
                    setSearchCategory(e.target.value as any);
                    if (searchQuery.trim()) setIsSuggestionsOpen(true);
                  }}
                  className="h-12 bg-slate-50 border-slate-200 text-xs font-semibold"
                  aria-label="Filter search category"
                >
                  <option value="all">All Services</option>
                  <option value="hospitals">Hospitals</option>
                  <option value="doctors">Doctors</option>
                  <option value="laboratories">Laboratories</option>
                  <option value="wellness">Wellness Centers</option>
                  <option value="specialities">Specialities</option>
                </Select>
              </div>

              {/* Input query */}
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim()) setIsSuggestionsOpen(true);
                  }}
                  placeholder="Search hospitals, doctors, labs, wellness..."
                  className="w-full h-12 pl-10 pr-9 text-sm text-[#03045e] placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSuggestionsOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-[#03045e] hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Clear search query"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="h-12 bg-[#0077b6] hover:bg-[#03045e] text-white font-bold gap-2 px-6 shrink-0 rounded-xl"
              >
                <span>Search</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Live Suggestions Dropdown Below the Search Bar */}
            {isSuggestionsOpen && cleanHeroQuery.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white border border-[#90e0ef] shadow-xl overflow-hidden p-3 text-left animate-in fade-in-50 zoom-in-95 duration-150 space-y-3">
                {hasSuggestions ? (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar">
                    {/* Matching Hospitals */}
                    {suggestedHospitals.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <Building2 className="h-3 w-3 text-[#0077b6]" />
                          <span>Hospitals ({suggestedHospitals.length})</span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {suggestedHospitals.map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => {
                                setIsSuggestionsOpen(false);
                                navigate(`/hospitals/${h.slug}`);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#caf0f8]/40 transition-colors text-left group cursor-pointer"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="text-xs font-bold text-[#03045e] group-hover:text-[#0077b6] truncate">
                                  {h.name}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {h.area}, {h.city} · {h.facilityTypeBadge}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold text-[#0077b6] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                View <ArrowRight className="h-3 w-3" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Doctors */}
                    {suggestedDoctors.length > 0 && (
                      <div className="pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <UserRound className="h-3 w-3 text-[#0077b6]" />
                          <span>Doctors ({suggestedDoctors.length})</span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {suggestedDoctors.map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                setIsSuggestionsOpen(false);
                                navigate(`/doctors/${d.slug}`);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#caf0f8]/40 transition-colors text-left group cursor-pointer"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="text-xs font-bold text-[#03045e] group-hover:text-[#0077b6] truncate">
                                  {d.name}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {d.title} · {d.speciality}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold text-[#0077b6] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                Profile <ArrowRight className="h-3 w-3" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Diagnostic Laboratories */}
                    {suggestedLaboratories.length > 0 && (
                      <div className="pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <FlaskConical className="h-3 w-3 text-[#0077b6]" />
                          <span>Laboratories ({suggestedLaboratories.length})</span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {suggestedLaboratories.map((lab) => (
                            <button
                              key={lab.id}
                              type="button"
                              onClick={() => {
                                setIsSuggestionsOpen(false);
                                navigate(`/laboratories/${lab.slug}`);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#caf0f8]/40 transition-colors text-left group cursor-pointer"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="text-xs font-bold text-[#03045e] group-hover:text-[#0077b6] truncate">
                                  {lab.name}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {lab.area}, {lab.city} {lab.accreditation ? `· ${lab.accreditation}` : ''}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold text-[#0077b6] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                View <ArrowRight className="h-3 w-3" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Wellness Centers */}
                    {suggestedWellness.length > 0 && (
                      <div className="pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <Leaf className="h-3 w-3 text-emerald-600" />
                          <span>Wellness Centers ({suggestedWellness.length})</span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {suggestedWellness.map((center) => (
                            <button
                              key={center.id}
                              type="button"
                              onClick={() => {
                                setIsSuggestionsOpen(false);
                                navigate(`/wellness-centers/${center.slug}`);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#caf0f8]/40 transition-colors text-left group cursor-pointer"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="text-xs font-bold text-[#03045e] group-hover:text-[#0077b6] truncate">
                                  {center.name}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {center.area}, {center.city} · {center.category}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold text-[#0077b6] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                View <ArrowRight className="h-3 w-3" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Specialities */}
                    {suggestedSpecialities.length > 0 && (
                      <div className="pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <Stethoscope className="h-3 w-3 text-[#0077b6]" />
                          <span>Specialities</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                          {suggestedSpecialities.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setIsSuggestionsOpen(false);
                                navigate(`/doctors?speciality=${encodeURIComponent(s.name)}`);
                              }}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-[#caf0f8]/50 transition-colors text-left group cursor-pointer border border-slate-200/60"
                            >
                              <div className="truncate">
                                <p className="text-xs font-bold text-[#03045e] group-hover:text-[#0077b6]">
                                  {s.name}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {s.description}
                                </p>
                              </div>
                              <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-[#0077b6] shrink-0 ml-1" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 px-3 text-center text-slate-500 space-y-1">
                    <p className="text-xs font-bold text-[#03045e]">
                      No verified listings found for &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Press Enter or click Search to browse all verified healthcare listings.
                    </p>
                  </div>
                )}

                {/* Footer strip in suggestion box */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-500">Quick Search:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuggestionsOpen(false);
                        navigate(`/hospitals?search=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                      className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-[#caf0f8] text-[#0077b6] font-medium transition-colors cursor-pointer"
                    >
                      Hospitals
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuggestionsOpen(false);
                        navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                      className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-[#caf0f8] text-[#0077b6] font-medium transition-colors cursor-pointer"
                    >
                      Doctors
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuggestionsOpen(false);
                        navigate(`/laboratories?search=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                      className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-[#caf0f8] text-[#0077b6] font-medium transition-colors cursor-pointer"
                    >
                      Labs
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuggestionsOpen(false);
                        navigate(`/wellness-centers?search=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                      className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-[#caf0f8] text-[#0077b6] font-medium transition-colors cursor-pointer"
                    >
                      Wellness
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="font-bold text-[#0077b6] hover:underline cursor-pointer ml-auto"
                  >
                    View All Results &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

            {/* Interactive Speciality Filter Chips */}
            <div className="pt-2">
              <div className="flex items-center justify-start gap-1.5 flex-wrap text-xs">
                <span className="text-slate-500 font-medium mr-1">Popular Specialities:</span>
                {SPECIALITIES_DATA.slice(0, 4).map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => navigate(`/doctors?speciality=${encodeURIComponent(spec.name)}`)}
                    className="rounded-lg bg-white/90 border border-slate-200 hover:border-[#0077b6] hover:bg-[#caf0f8] px-2.5 py-1 text-xs font-medium text-[#03045e] transition-all cursor-pointer shadow-2xs"
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Hero Consultation Inquiry Form */}
          <div className="lg:col-span-5 w-full">
            <HeroInquiryForm />
          </div>
        </div>
      </section>

      {/* Multi-Specialty Focus Section */}
      <MultiSpecialtySection />

      {/* 2. Location Selector Section */}
      <section className="rounded-2xl border border-[#90e0ef]/70 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#caf0f8] p-2.5 text-[#0077b6]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#03045e]">
                Explore By Region
              </h2>
              <p className="text-xs text-slate-500">
                Phase 1 coverage active in Pune. Additional districts undergoing verification.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* State Select */}
            <div className="flex-1 sm:w-48">
              <label htmlFor="state-select" className="sr-only">Select State</label>
              <select
                id="state-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
              >
                {LOCATIONS_DATA.map((state) => (
                  <option key={state.id} value={state.id} disabled={!state.isActive}>
                    {state.name} {!state.isActive ? '(Coming Soon)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* City Select */}
            <div className="flex-1 sm:w-48">
              <label htmlFor="city-select" className="sr-only">Select City</label>
              <select
                id="city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
              >
                {currentState.cities.map((city) => (
                  <option key={city.id} value={city.id} disabled={!city.isActive}>
                    {city.name} {!city.isActive ? '(Coming Soon)' : `(${city.hospitalCount} Verified)`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Browse Category Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Browse Hospitals Card */}
        <Link
          to="/hospitals"
          className="group relative overflow-hidden rounded-2xl border border-[#90e0ef] bg-gradient-to-br from-white to-[#caf0f8]/30 p-6 shadow-xs hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-[#0077b6] text-white p-3 shadow-xs">
              <Building2 className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#0077b6] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-xl font-bold text-[#03045e] group-hover:text-[#0077b6]">
              Browse Hospitals
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover verified tertiary care institutions, government hospitals, and clinical departments in Pune.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#0077b6]">
            <span>View {hospitals.length} Verified Facilities</span>
            <span aria-hidden="true">→</span>
          </div>
        </Link>

        {/* Browse Doctors Card */}
        <Link
          to="/doctors"
          className="group relative overflow-hidden rounded-2xl border border-[#90e0ef] bg-gradient-to-br from-white to-[#caf0f8]/30 p-6 shadow-xs hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-[#03045e] text-white p-3 shadow-xs">
              <UserRound className="h-6 w-6 text-[#90e0ef]" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#0077b6] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-xl font-bold text-[#03045e] group-hover:text-[#0077b6]">
              Consulting Doctors
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore credentialed specialists, medical affiliations, verified OPD days, and clinical practice areas.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#0077b6]">
            <span>View {doctors.length} Consulting Specialists</span>
            <span aria-hidden="true">→</span>
          </div>
        </Link>
      </section>

      {/* Famous Cities for Treatment */}
      <FamousCitiesSection />

      {/* Famous Hospitals for Treatment */}
      <FamousHospitalsSection />

      {/* Inter-Section Clickable Ad Banner Slot 1 */}
      <AdSlot
        size="full-width"
        label="Ad"
        slotName="Sponsored Display Ad"
        dimensions="Full-Width Click Banner (1200×200)"
        href="#"
      />

      {/* 4. Featured Hospitals */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
              <Building2 className="h-3.5 w-3.5" />
              <span>Pune Facilities</span>
            </div>
            <h2 className="text-2xl font-bold text-[#03045e] mt-0.5">
              Featured Hospitals
            </h2>
          </div>
          <Link
            to="/hospitals"
            className="text-xs font-bold text-[#0077b6] hover:text-[#03045e] flex items-center gap-1"
          >
            <span>All Hospitals</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {hospitals
            .filter((h) => h.city.toLowerCase() === 'pune')
            .slice(0, 6)
            .map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
        </div>
      </section>

      {/* Inter-Section Clickable Ad Banner Slot 2 */}
      <AdSlot
        size="full-width"
        label="Ad"
        slotName="Sponsored Display Ad"
        dimensions="Full-Width Click Banner (1200×200)"
        href="#"
      />

      {/* 5. Featured Doctors */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
              <UserRound className="h-3.5 w-3.5" />
              <span>Doctors & Specialists</span>
            </div>
            <h2 className="text-2xl font-bold text-[#03045e] mt-0.5">
              Verified Doctors at Listed Hospitals
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-[#0077b6] hover:text-[#03045e] flex items-center gap-1"
          >
            <span>All Doctors</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      {/* Inter-Section Clickable Ad Banner Slot 3 */}
      <AdSlot
        size="full-width"
        label="Ad"
        slotName="Sponsored Display Ad"
        dimensions="Full-Width Click Banner (1200×200)"
        href="#"
      />

      {/* 6. Featured Laboratories */}
      {laboratories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Diagnostic Services</span>
              </div>
              <h2 className="text-2xl font-bold text-[#03045e] mt-0.5">
                Featured Laboratories
              </h2>
            </div>
            <Link
              to="/laboratories"
              className="text-xs font-bold text-[#0077b6] hover:text-[#03045e] flex items-center gap-1"
            >
              <span>All Laboratories</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {laboratories.slice(0, 9).map((lab) => (
              <LaboratoryCard key={lab.id} laboratory={lab} />
            ))}
          </div>
        </section>
      )}

      {/* Inter-Section Clickable Ad Banner Slot 4 */}
      <AdSlot
        size="full-width"
        label="Ad"
        slotName="Sponsored Display Ad"
        dimensions="Full-Width Click Banner (1200×200)"
        href="#"
      />

      {/* 7. Featured Wellness Clinics & Centers */}
      {wellnessCenters.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
                <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                <span>Holistic & Preventive Health</span>
              </div>
              <h2 className="text-2xl font-bold text-[#03045e] mt-0.5">
                Featured Wellness Clinics & Centers
              </h2>
            </div>
            <Link
              to="/wellness-centers"
              className="text-xs font-bold text-[#0077b6] hover:text-[#03045e] flex items-center gap-1"
            >
              <span>All Wellness Centers</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {wellnessCenters.slice(0, 9).map((center) => (
              <WellnessCard key={center.id} center={center} />
            ))}
          </div>
        </section>
      )}

      {/* Inter-Section Clickable Ad Banner Slot 5 */}
      <AdSlot
        size="full-width"
        label="Ad"
        slotName="Sponsored Display Ad"
        dimensions="Full-Width Click Banner (1200×200)"
        href="#"
      />

      {/* 8. "Why trust this information" strip */}
      <section className="rounded-3xl border border-[#90e0ef] bg-[#caf0f8]/30 p-6 sm:p-8 space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-[#03045e]">
            Why You Can Trust This Information
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            HealthDiscover was built to eliminate opaque marketing claims and unreliable star ratings from healthcare decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Item 1 */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#caf0f8] text-[#0077b6]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-[#03045e]">
              Official Sources Listed
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every facility and doctor profile links directly to statutory council registers, municipal health portals, or verified hospital directories.
            </p>
          </div>

          {/* Item 2 */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#caf0f8] text-[#0077b6]">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-[#03045e]">
              Last-Checked Dates
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No stale listings. We publish the precise audit date for each telephone number, OPD timing, and hospital accreditation.
            </p>
          </div>

          {/* Item 3 */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#caf0f8] text-[#0077b6]">
              <Flag className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-[#03045e]">
              Public Error Reporting
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Spotted a modified consultation hour or moved facility? Any visitor or provider can submit corrections for immediate editorial review.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-start">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/about">
              <span>Read Full Verification Methodology</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 7. Provider CTA Banner */}
      <section className="rounded-3xl bg-[#03045e] text-white p-6 sm:p-10 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="inline-block rounded-md bg-[#0077b6] px-2.5 py-0.5 text-xs font-bold text-[#caf0f8]">
              Healthcare Provider Network
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Doctors and hospitals: update or correct your information
            </h3>
            <p className="text-xs text-[#caf0f8]/80 leading-relaxed">
              Keep your consultation timings, contact details, and department facilities accurate for Pune patients. There is zero charge for listing or updates.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCorrectionDialog}
            size="lg"
            className="bg-[#0077b6] hover:bg-white hover:text-[#03045e] text-white font-bold gap-2 shrink-0 shadow-md"
          >
            <Flag className="h-4 w-4" />
            <span>Submit Correction Request</span>
          </Button>
        </div>
      </section>
    </div>
  );
}

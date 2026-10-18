import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { FAMOUS_TREATMENT_CITIES, TreatmentCity } from '../data/treatmentCities';

interface FamousCitiesSectionProps {
  className?: string;
}

export function FamousCitiesSection({ className }: FamousCitiesSectionProps) {
  const navigate = useNavigate();

  const handleCityClick = (city: TreatmentCity) => {
    // Navigate to hospitals page with city filter
    navigate(`/hospitals?city=${encodeURIComponent(city.name)}`);
  };

  return (
    <section className={`space-y-6 ${className || ''}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
            <MapPin className="h-3.5 w-3.5" />
            <span>Healthcare Destinations Across India</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#03045e] mt-1 tracking-tight">
            Famous Cities for Treatment
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Discover top medical destinations across India known for multi-speciality tertiary care, organ transplants, robotics, oncology, and cardiac surgery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/hospitals')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077b6] hover:text-[#03045e] transition-colors shrink-0 group self-start sm:self-auto cursor-pointer"
        >
          <span>Browse All Cities</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 20 Cities Grid in strict sequence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {FAMOUS_TREATMENT_CITIES.map((city, idx) => (
          <div
            key={city.id}
            onClick={() => handleCityClick(city)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#90e0ef]/70 bg-gradient-to-b from-white via-white to-[#caf0f8]/20 p-4 shadow-2xs hover:shadow-md hover:border-[#0077b6] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCityClick(city);
              }
            }}
          >
            {/* Top row: City Icon + State / Verified Badge */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#caf0f8] text-[#0077b6] group-hover:bg-[#0077b6] group-hover:text-white transition-colors duration-200 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>

                {/* <div className="flex items-center gap-1">
                  {city.hasVerifiedHospitals ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span>Verified Hub</span>
                    </span>
                  ) : (
                    <span className="rounded-md bg-slate-100/90 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                      {city.state}
                    </span>
                  )}
                </div> */}
              </div>

              {/* City Title */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#03045e] group-hover:text-[#0077b6] transition-colors leading-snug">
                  {city.name}
                </h3>
                <p className="text-[11px] font-medium text-[#0077b6] line-clamp-1">
                  {city.specialityHub}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
                  {city.tagline}
                </p>
              </div>
            </div>

            {/* Bottom Row / Action CTA */}
            <div className="mt-4 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] font-bold text-[#0077b6]">
              <span className="group-hover:underline">Explore Hospitals</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Order index subtly placed in bottom corner */}
            <span className="absolute -bottom-2 -right-1 text-[24px] font-black text-slate-100 group-hover:text-[#caf0f8]/40 transition-colors pointer-events-none select-none">
              {idx + 1}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

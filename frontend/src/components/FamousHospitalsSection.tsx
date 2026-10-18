import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MapPin, ArrowRight, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { FAMOUS_HOSPITALS_LIST, FamousHospitalItem } from '../data/famousHospitals';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const BATCH_SIZE = 12;

export function FamousHospitalsSection() {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = React.useState(BATCH_SIZE);

  const visibleHospitals = React.useMemo(() => {
    return FAMOUS_HOSPITALS_LIST.slice(0, visibleCount);
  }, [visibleCount]);

  const hasMore = visibleCount < FAMOUS_HOSPITALS_LIST.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, FAMOUS_HOSPITALS_LIST.length));
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
            <Building2 className="h-3.5 w-3.5" />
            <span>National Medical Centers of Excellence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#03045e] mt-1 tracking-tight">
            Famous Hospitals for Treatment
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Leading tertiary teaching institutions, multi-organ transplant centers, and accredited super-speciality hospitals across major medical hubs in India.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-[#03045e]">{visibleHospitals.length}</strong> of{' '}
            <strong className="text-[#03045e]">{FAMOUS_HOSPITALS_LIST.length}</strong>
          </span>
        </div>
      </div>

      {/* Grid of Famous Hospital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleHospitals.map((hosp: FamousHospitalItem) => {
          const coverImage = hosp.images && hosp.images.length > 0 ? hosp.images[0] : null;

          return (
            <div
              key={hosp.id}
              onClick={() => navigate(`/hospitals/${hosp.slug}`)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#90e0ef]/70 bg-gradient-to-b from-white via-white to-[#caf0f8]/20 p-5 shadow-2xs hover:shadow-md hover:border-[#0077b6] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/hospitals/${hosp.slug}`);
                }
              }}
            >
              <div>
                {/* Top Strip: Rank Badge & Facility Type */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center justify-center rounded-lg bg-[#0077b6] text-white px-2.5 py-0.5 text-xs font-black shadow-2xs">
                    #{hosp.rank}
                  </span>

                  <span className="truncate rounded-md bg-white/90 border border-[#90e0ef]/60 px-2 py-0.5 text-[11px] font-bold text-[#03045e] shadow-2xs max-w-[70%]">
                    {hosp.facilityTypeBadge}
                  </span>
                </div>

                {/* Hospital Name & Location */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[#03045e] group-hover:text-[#0077b6] transition-colors leading-snug line-clamp-2">
                    {hosp.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
                    <span className="truncate">
                      {hosp.area ? `${hosp.area}, ` : ''}{hosp.city}, {hosp.state}
                    </span>
                  </div>
                </div>

                {/* Clinical Departments */}
                {hosp.departments && hosp.departments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Key Specialties
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hosp.departments.slice(0, 3).map((dept, dIdx) => (
                        <Badge
                          key={dIdx}
                          variant="secondary"
                          className="text-[10px] py-0.5 px-2 bg-[#caf0f8]/60 text-[#03045e] font-medium"
                        >
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer CTA */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0077b6]">
                <div className="flex items-center gap-1.5">
                  {hosp.emergency24x7 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>24x7 Emergency</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Hospital</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Read More / Load More Action Strip */}
      <div className="pt-4 flex flex-col items-center justify-center gap-3">
        {hasMore ? (
          <Button
            type="button"
            onClick={handleLoadMore}
            size="lg"
            className="bg-[#0077b6] hover:bg-[#03045e] text-white font-bold gap-2 px-8 shadow-sm cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Load More Famous Hospitals (+{Math.min(BATCH_SIZE, FAMOUS_HOSPITALS_LIST.length - visibleCount)})</span>
          </Button>
        ) : (
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>All 69 Famous Hospitals Displayed in Shortlist Order</span>
            </span>
          </div>
        )}

        <Link
          to="/hospitals"
          className="text-xs font-semibold text-slate-500 hover:text-[#0077b6] transition-colors inline-flex items-center gap-1 pt-1"
        >
          <span>Explore complete national hospital directory</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}

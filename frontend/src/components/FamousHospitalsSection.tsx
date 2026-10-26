import * as React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, ArrowRight, Phone } from 'lucide-react';
import { FAMOUS_HOSPITALS_LIST, FamousHospitalItem } from '../data/famousHospitals';
import { Hospital } from '../types';
import { CONTACT_PHONE } from '../data/config';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface FamousHospitalsSectionProps {
  hospitals?: Hospital[];
}

function FamousHospitalCard({
  hosp,
  matchedHospital,
}: {
  hosp: FamousHospitalItem;
  matchedHospital?: Hospital;
}) {
  const [imageError, setImageError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Cover Image from hosp or matched DB hospital or fallback
  const coverImage =
    hosp.images && hosp.images.length > 0
      ? hosp.images[0]
      : matchedHospital?.images && matchedHospital.images.length > 0
      ? matchedHospital.images[0]
      : hosp.name.toLowerCase().includes('ruby hall')
      ? { url: '/images/rubyhall/r1.jpeg', alt: `${hosp.name} Campus & Entrance` }
      : null;

  const overview =
    matchedHospital?.overview ||
    `${hosp.facilityType} located in ${hosp.city}, ${hosp.state}. Recognized for tertiary clinical excellence, advanced diagnostics, and specialist patient care.`;

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-200 border-[#90e0ef]/70 flex flex-col justify-between">
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
          {!isLoaded && !imageError && coverImage && (
            <div className="absolute inset-0 bg-slate-200/80 animate-pulse" />
          )}
          {imageError || !coverImage ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#caf0f8] to-slate-100 p-4 text-[#03045e]">
              <Building2 className="h-10 w-10 text-[#0077b6] mb-1.5 opacity-60" />
              <p className="text-xs font-semibold text-center line-clamp-1">{hosp.name}</p>
            </div>
          ) : (
            <img
              src={coverImage.card_url || coverImage.thumb_url || coverImage.url}
              alt={coverImage.alt || hosp.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onError={() => setImageError(true)}
              className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 pointer-events-none select-none ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Top-Left Rank Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center justify-center rounded-lg bg-[#0077b6] text-white px-2.5 py-0.5 text-xs font-black shadow-2xs">
              #{hosp.rank}
            </span>
          </div>

          {/* Facility Type Badge matching Featured Hospitals */}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-md bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-[#03045e] shadow-2xs border border-white/60">
              {hosp.facilityTypeBadge}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <CardContent className="p-5 space-y-4">
          <div>
            <Link
              to={`/hospitals/${hosp.slug}`}
              className="block group-hover:text-[#0077b6] transition-colors"
            >
              <h3 className="text-lg font-bold text-[#03045e] line-clamp-1 leading-snug">
                {hosp.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
              <span>
                {hosp.area ? `${hosp.area}, ` : ''}
                {hosp.city}, {hosp.state}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {overview}
          </p>

          {/* Clinical Departments directly matching Featured Hospitals */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Departments
            </span>
            <div className="flex flex-wrap gap-1.5">
              {hosp.departments.slice(0, 3).map((dept, dIdx) => (
                <Badge
                  key={dIdx}
                  variant="secondary"
                  className="text-[11px] py-0.5 px-2 bg-[#caf0f8]/60 text-[#03045e]"
                >
                  {dept}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Phone className="h-3 w-3 text-[#0077b6]" />
          <span>{CONTACT_PHONE}</span>
        </div>

        <Button asChild size="sm" variant="default" className="gap-1.5 bg-[#0077b6] hover:bg-[#03045e]">
          <Link to={`/hospitals/${hosp.slug}`}>
            <span>View Hospital</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export function FamousHospitalsSection({ hospitals }: FamousHospitalsSectionProps) {
  // Hospital map for matching overview or real photos from database
  const hospitalMap = React.useMemo(() => {
    const map = new Map<string, Hospital>();
    if (hospitals) {
      hospitals.forEach((h) => {
        if (h.slug) map.set(h.slug, h);
        if (h.id) map.set(h.id, h);
      });
    }
    return map;
  }, [hospitals]);

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
            Showing <strong className="text-[#03045e]">{FAMOUS_HOSPITALS_LIST.length}</strong> hospitals
          </span>
        </div>
      </div>

      {/* Grid of Famous Hospital Cards styled identical to Featured Hospitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {FAMOUS_HOSPITALS_LIST.map((hosp: FamousHospitalItem) => {
          const matchedHospital = hospitalMap.get(hosp.slug) || hospitalMap.get(hosp.id);
          return (
            <FamousHospitalCard
              key={hosp.id}
              hosp={hosp}
              matchedHospital={matchedHospital}
            />
          );
        })}
      </div>

      {/* Explore Directory Link */}
      <div className="pt-2 flex flex-col items-center justify-center gap-2">
        <Link
          to="/hospitals"
          className="text-xs font-semibold text-slate-500 hover:text-[#0077b6] transition-colors inline-flex items-center gap-1"
        >
          <span>Explore complete national hospital directory</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}

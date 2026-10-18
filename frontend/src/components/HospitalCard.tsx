import * as React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, ArrowRight, Phone } from 'lucide-react';
import { Hospital } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface HospitalCardProps {
  hospital: Hospital;
  className?: string;
}

export function HospitalCard({ hospital, className }: HospitalCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  // Choose first image from DB
  const coverImage =
    hospital.images && hospital.images.length > 0
      ? hospital.images[0]
      : hospital.name.toLowerCase().includes('ruby hall')
      ? { url: '/images/rubyhall/r1.jpeg', alt: `${hospital.name} Campus & Entrance` }
      : null;

  return (
    <Card className={`overflow-hidden group hover:shadow-md transition-all duration-200 border-[#90e0ef]/70 flex flex-col justify-between ${className || ''}`}>
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
          {!isLoaded && !imageError && coverImage && (
            <div className="absolute inset-0 bg-slate-200/80 animate-pulse" />
          )}
          {imageError || !coverImage ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#caf0f8] to-slate-100 p-4 text-[#03045e]">
              <Building2 className="h-10 w-10 text-[#0077b6] mb-1.5 opacity-60" />
              <p className="text-xs font-semibold">{hospital.name}</p>
            </div>
          ) : (
            <img
              src={coverImage.card_url || coverImage.thumb_url || coverImage.url}
              alt={coverImage.alt || hospital.name}
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

          {/* Facility Type Badge directly matching hospital page */}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-md bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-[#03045e] shadow-2xs border border-white/60">
              {hospital.facilityTypeBadge}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <CardContent className="p-5 space-y-4">
          <div>
            <Link
              to={`/hospitals/${hospital.slug}`}
              className="block group-hover:text-[#0077b6] transition-colors"
            >
              <h3 className="text-lg font-bold text-[#03045e] line-clamp-1 leading-snug">
                {hospital.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
              <span>{hospital.area}, {hospital.city}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {hospital.overview}
          </p>

          {/* Clinical Departments directly matching hospital page */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Departments
            </span>
            <div className="flex flex-wrap gap-1.5">
              {hospital.departments.slice(0, 3).map((dept) => (
                <Badge
                  key={dept.slug}
                  variant="secondary"
                  className="text-[11px] py-0.5 px-2 bg-[#caf0f8]/60 text-[#03045e]"
                >
                  {dept.name}
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
          <span>{hospital.phone}</span>
        </div>

        <Button asChild size="sm" variant="default" className="gap-1.5 bg-[#0077b6] hover:bg-[#03045e]">
          <Link to={`/hospitals/${hospital.slug}`}>
            <span>View Hospital</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

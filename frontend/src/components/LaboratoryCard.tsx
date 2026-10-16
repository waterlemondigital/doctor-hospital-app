import * as React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, FlaskConical, ArrowRight, Phone, Home, ShieldCheck } from 'lucide-react';
import { Hospital } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface LaboratoryCardProps {
  laboratory: Hospital;
  className?: string;
}

export function LaboratoryCard({ laboratory, className }: LaboratoryCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const coverImage = laboratory.images[0];

  const hasHomeCollection =
    laboratory.overview.toLowerCase().includes('home sample collection') ||
    laboratory.services.some((s) => s.toLowerCase().includes('home collection')) ||
    laboratory.name.toLowerCase().includes('lal') ||
    laboratory.name.toLowerCase().includes('metropolis') ||
    laboratory.name.toLowerCase().includes('apollo') ||
    laboratory.name.toLowerCase().includes('suburban') ||
    laboratory.name.toLowerCase().includes('ag diagnostics');

  return (
    <Card className={`overflow-hidden group hover:shadow-md transition-all duration-200 border-[#90e0ef]/70 flex flex-col justify-between ${className || ''}`}>
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
          {imageError || !coverImage ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#caf0f8] to-slate-100 p-4 text-[#03045e]">
              <FlaskConical className="h-10 w-10 text-[#0077b6] mb-1.5 opacity-60" />
              <p className="text-xs font-semibold text-center">{laboratory.name}</p>
            </div>
          ) : (
            <img
              src={coverImage.url}
              alt={coverImage.alt}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
            />
          )}

          {/* Quality Badge */}
          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-[#03045e] shadow-2xs border border-white/60 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-[#0077b6]" />
              <span>{laboratory.facilityTypeBadge}</span>
            </span>
          </div>

          {/* Home Collection Badge */}
          {hasHomeCollection && (
            <div className="absolute top-3 right-3">
              <span className="rounded-full bg-[#03045e]/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                <Home className="h-2.5 w-2.5 text-[#90e0ef]" />
                <span>Home Collection</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <CardContent className="p-5 space-y-4">
          <div>
            <Link
              to={`/laboratories/${laboratory.slug}`}
              className="block group-hover:text-[#0077b6] transition-colors"
            >
              <h3 className="text-lg font-bold text-[#03045e] line-clamp-1 leading-snug">
                {laboratory.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
              <span className="line-clamp-1">{laboratory.area}, {laboratory.city}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {laboratory.overview}
          </p>

          {/* Test Categories / Services */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Services & Test Packages
            </span>
            <div className="flex flex-wrap gap-1.5">
              {laboratory.services.slice(0, 3).map((service, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[11px] py-0.5 px-2 bg-[#caf0f8]/60 text-[#03045e] font-medium"
                >
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
          <Phone className="h-3 w-3 text-[#0077b6] shrink-0" />
          <span className="truncate">{laboratory.phone.startsWith('Use official') ? 'Official Helpdesk' : laboratory.phone}</span>
        </div>

        <Button asChild size="sm" variant="default" className="gap-1.5 bg-[#0077b6] hover:bg-[#03045e] shrink-0">
          <Link to={`/laboratories/${laboratory.slug}`}>
            <span>View Lab</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

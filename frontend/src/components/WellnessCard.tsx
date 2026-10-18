import * as React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, ArrowRight, Phone, ShieldCheck, Leaf } from 'lucide-react';
import { WellnessCenter } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface WellnessCardProps {
  center: WellnessCenter;
  className?: string;
}

export function WellnessCard({ center, className }: WellnessCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const coverImage = center.images && center.images.length > 0 ? center.images[0] : null;

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
              <Sparkles className="h-10 w-10 text-[#0077b6] mb-1.5 opacity-60" />
              <p className="text-xs font-semibold text-center">{center.name}</p>
            </div>
          ) : (
            <img
              src={coverImage.card_url || coverImage.thumb_url || coverImage.url}
              alt={coverImage.alt || center.name}
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

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[85%]">
            <span className="rounded-md bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-[#03045e] shadow-2xs border border-white/60 flex items-center gap-1 truncate">
              <Leaf className="h-3 w-3 text-emerald-600 shrink-0" />
              <span className="truncate">{center.category}</span>
            </span>
          </div>

          {/* Accreditation Tag if present */}
          {center.accreditation && !center.accreditation.toLowerCase().includes('no current') && (
            <div className="absolute top-3 right-3">
              <span className="rounded-full bg-[#03045e]/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5 text-[#90e0ef]" />
                <span>Verified Center</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <CardContent className="p-5 space-y-4">
          <div>
            <Link
              to={`/wellness-centers/${center.slug}`}
              className="block group-hover:text-[#0077b6] transition-colors"
            >
              <h3 className="text-lg font-bold text-[#03045e] line-clamp-1 leading-snug">
                {center.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
              <span className="line-clamp-1">{center.area}, {center.city}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {center.overview}
          </p>

          {/* Programs & Treatments */}
          {center.programs && center.programs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Programs & Treatments
              </span>
              <div className="flex flex-wrap gap-1.5">
                {center.programs.slice(0, 3).map((program, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-[11px] py-0.5 px-2 bg-[#caf0f8]/60 text-[#03045e] font-medium"
                  >
                    {program}
                  </Badge>
                ))}
                {center.programs.length > 3 && (
                  <span className="text-[10px] text-slate-400 self-center">
                    +{center.programs.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>

      {/* Card Footer Actions */}
      <div className="border-t border-slate-100 p-4 px-5 flex items-center justify-between gap-3 bg-slate-50/50">
        {center.phone && !center.phone.toLowerCase().includes('not') && !center.phone.toLowerCase().includes('use official') ? (
          <a
            href={`tel:${center.phone.replace(/[^0-9+]/g, '')}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0077b6] hover:underline"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call</span>
          </a>
        ) : (
          <span className="text-[11px] text-slate-400">Direct Inquiry</span>
        )}

        <Button asChild size="sm" variant="default" className="gap-1.5 bg-[#0077b6] hover:bg-[#03045e] shrink-0">
          <Link to={`/wellness-centers/${center.slug}`}>
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

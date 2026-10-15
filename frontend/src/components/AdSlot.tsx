import * as React from 'react';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { AdSlotSize } from '../types';

export interface AdSlotProps {
  size?: AdSlotSize;
  className?: string;
  label?: string;
  imageUrl?: string;
  href?: string;
  alt?: string;
  slotName?: string;
  dimensions?: string;
}

/**
 * Clickable Advertisement Box / Banner Container.
 * Formatted as a clean display ad space ready for image creatives.
 * Entire unit is clickable with appropriate ad disclosure.
 */
export function AdSlot({
  size = 'full-width',
  className,
  label = 'Ad',
  imageUrl,
  href = '#',
  alt = 'Advertisement',
  slotName,
  dimensions = 'Responsive Billboard / Banner (e.g. 1200×250)',
}: AdSlotProps) {
  const isFullWidth = size === 'full-width' || size === 'banner';

  return (
    <a
      href={href}
      target={href !== '#' ? '_blank' : undefined}
      rel={href !== '#' ? 'noopener noreferrer sponsored' : undefined}
      onClick={(e) => {
        if (href === '#') {
          e.preventDefault();
        }
      }}
      aria-label={`${label} - ${alt}`}
      className={cn(
        'group relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50/70 transition-all duration-200 hover:border-[#0077b6]/60 hover:shadow-md cursor-pointer select-none',
        isFullWidth
          ? 'min-h-[110px] sm:min-h-[150px] md:min-h-[190px] lg:min-h-[220px]'
          : 'min-h-[250px]',
        className
      )}
    >
      {/* Top Disclosure Tag */}
      <div className="absolute top-2.5 right-3 z-10 flex items-center gap-1 rounded bg-black/50 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
        <span>{label}</span>
        <ExternalLink className="h-2.5 w-2.5 opacity-70" />
      </div>

      {imageUrl ? (
        /* Actual Image Creative when provided */
        <img
          src={imageUrl}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
      ) : (
        /* Clean, minimal ad box placeholder waiting for image */
        <div className="flex h-full min-h-[inherit] w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-50 via-[#f0f9fc]/50 to-slate-100/80">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#caf0f8]/80 text-[#0077b6] shadow-2xs group-hover:scale-105 transition-transform duration-200">
            <ImageIcon className="h-5 w-5" />
          </div>

          <div className="mt-2.5 space-y-1 max-w-md">
            <p className="text-xs font-bold text-[#03045e] tracking-tight">
              {slotName || 'Advertisement Banner'}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              Clickable Ad Unit · {dimensions}
            </p>
          </div>
        </div>
      )}
    </a>
  );
}

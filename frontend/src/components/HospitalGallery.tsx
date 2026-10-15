import * as React from 'react';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { HospitalImage } from '../types';

interface HospitalGalleryProps {
  images: HospitalImage[];
  hospitalName: string;
}

export function HospitalGallery({ images, hospitalName }: HospitalGalleryProps) {
  const [activeMobileIndex, setActiveMobileIndex] = React.useState(0);
  const [failedImages, setFailedImages] = React.useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handleNext = () => {
    setActiveMobileIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveMobileIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  const mainImage = images[0];
  const sideImages = images.slice(1, 3);

  return (
    <section aria-label={`Photo gallery of ${hospitalName}`} className="space-y-2">
      {/* Desktop Layout: 1 Hero + 2 Stacked Side Tiles (Static display - clicking does nothing) */}
      <div className="hidden md:grid md:grid-cols-3 gap-3 h-[380px] rounded-2xl overflow-hidden border border-[#90e0ef]/70 shadow-xs bg-slate-50 select-none cursor-default">
        {/* Main Hero Tile (col-span-2) */}
        <div className="relative md:col-span-2 h-full overflow-hidden bg-slate-100 select-none cursor-default">
          {failedImages[0] ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#caf0f8] to-slate-100 p-6 text-center text-[#03045e] pointer-events-none">
              <Building2 className="h-12 w-12 text-[#0077b6] mb-2 opacity-60" />
              <p className="text-sm font-semibold">{hospitalName}</p>
              <p className="text-xs text-slate-500">Main Facility View (Placeholder)</p>
            </div>
          ) : (
            <img
              src={mainImage.url}
              alt={mainImage.alt}
              referrerPolicy="no-referrer"
              draggable={false}
              onError={() => handleImageError(0)}
              className="h-full w-full object-cover pointer-events-none select-none cursor-default"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none select-none" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none select-none">
            <span className="text-xs font-medium tracking-wide bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
              {mainImage.caption || 'Main Entrance'}
            </span>
          </div>
        </div>

        {/* 2 Stacked Side Tiles */}
        <div className="grid grid-rows-2 gap-3 h-full select-none cursor-default">
          {sideImages.map((img, idx) => {
            const actualIndex = idx + 1;
            return (
              <div
                key={actualIndex}
                className="relative h-full overflow-hidden bg-slate-100 select-none cursor-default"
              >
                {failedImages[actualIndex] ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#caf0f8]/60 to-slate-100 p-4 text-center text-[#03045e] pointer-events-none">
                    <Building2 className="h-8 w-8 text-[#0077b6] mb-1 opacity-60" />
                    <p className="text-xs font-semibold">{img.caption || `View ${actualIndex + 1}`}</p>
                  </div>
                ) : (
                  <img
                    src={img.url}
                    alt={img.alt}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    onError={() => handleImageError(actualIndex)}
                    className="h-full w-full object-cover pointer-events-none select-none cursor-default"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none select-none" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white pointer-events-none select-none">
                  <span className="text-xs font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md truncate max-w-[90%]">
                    {img.caption || `Facility detail ${actualIndex + 1}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Touch Carousel (Slide switcher only - no lightbox click action) */}
      <div className="relative md:hidden rounded-2xl overflow-hidden border border-[#90e0ef]/70 shadow-xs bg-slate-100 aspect-16/10">
        <div className="h-full w-full">
          {failedImages[activeMobileIndex] ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#caf0f8] to-slate-100 p-6 text-center text-[#03045e]">
              <Building2 className="h-10 w-10 text-[#0077b6] mb-2 opacity-60" />
              <p className="text-sm font-semibold">{hospitalName}</p>
              <p className="text-xs text-slate-500">{images[activeMobileIndex].caption}</p>
            </div>
          ) : (
            <img
              src={images[activeMobileIndex].url}
              alt={images[activeMobileIndex].alt}
              referrerPolicy="no-referrer"
              draggable={false}
              onError={() => handleImageError(activeMobileIndex)}
              className="h-full w-full object-cover pointer-events-none select-none cursor-default"
            />
          )}
        </div>

        {/* Gradient Scrim & Caption */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
          <span className="text-xs font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
            {images[activeMobileIndex].caption || `Photo ${activeMobileIndex + 1} of ${images.length}`}
          </span>
          <span className="text-xs opacity-90 font-mono">
            {activeMobileIndex + 1} / {images.length}
          </span>
        </div>

        {/* Carousel controls */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous photo"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-xs hover:bg-black/60 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next photo"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-xs hover:bg-black/60 transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

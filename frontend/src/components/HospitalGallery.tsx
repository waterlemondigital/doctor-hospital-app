import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  LayoutGrid,
  Image as ImageIcon,
} from 'lucide-react';
import { HospitalImage } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface HospitalGalleryProps {
  images: HospitalImage[];
  hospitalName: string;
}

export function HospitalGallery({ images, hospitalName }: HospitalGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<'featured' | 'grid'>('featured');
  const [failedImages, setFailedImages] = React.useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  const currentImage = images[activeIndex] || images[0];

  return (
    <section aria-label={`Photo gallery of ${hospitalName}`} className="space-y-3">
      {/* Gallery Header Controls */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold border-[#90e0ef] text-[#0077b6] bg-[#caf0f8]/40">
            Fixed 16:9
          </Badge>
          <span className="text-xs text-slate-500 font-medium">
            {images.length} Facility Photos
          </span>
        </div>

        {images.length > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant={viewMode === 'featured' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('featured')}
              className={`h-7 px-2.5 text-xs gap-1.5 cursor-pointer ${
                viewMode === 'featured' ? 'bg-[#0077b6] text-white hover:bg-[#023e8a]' : 'text-slate-600'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Slideshow</span>
            </Button>
            <Button
              type="button"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-7 px-2.5 text-xs gap-1.5 cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#0077b6] text-white hover:bg-[#023e8a]' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>All 6 Photos (Grid)</span>
            </Button>
          </div>
        )}
      </div>

      {viewMode === 'featured' ? (
        <div className="space-y-3">
          {/* Main 16:9 Featured Stage */}
          <div className="relative w-full aspect-video aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-950 select-none group">
            {failedImages[activeIndex] ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#caf0f8] to-slate-100 p-6 text-center text-[#03045e]">
                <Building2 className="h-12 w-12 text-[#0077b6] mb-2 opacity-60" />
                <p className="text-sm font-semibold">{hospitalName}</p>
                <p className="text-xs text-slate-500">{currentImage.caption || 'Facility Photo'}</p>
              </div>
            ) : (
              <img
                src={currentImage.url}
                alt={currentImage.alt || `${hospitalName} - Photo ${activeIndex + 1}`}
                draggable={false}
                loading="eager"
                decoding="async"
                onError={() => handleImageError(activeIndex)}
                className="h-full w-full object-cover select-none transition-all duration-300"
              />
            )}

            {/* Gradient Scrim & Caption */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none gap-3">
              <span className="text-xs sm:text-sm font-medium bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 truncate max-w-[80%]">
                {currentImage.caption || `${hospitalName} Facility Photo`}
              </span>
              <span className="text-xs font-mono bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 shrink-0">
                {activeIndex + 1} / {images.length}
              </span>
            </div>

            {/* Nav Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white backdrop-blur-md hover:bg-black/80 transition-all shadow-md cursor-pointer opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white backdrop-blur-md hover:bg-black/80 transition-all shadow-md cursor-pointer opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* 16:9 Thumbnail Strip */}
          {images.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative aspect-video aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-900 ${
                    activeIndex === idx
                      ? 'border-[#0077b6] ring-2 ring-[#0077b6]/40 shadow-sm scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${idx + 1}: ${img.caption || img.alt}`}
                >
                  {failedImages[idx] ? (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <img
                      src={img.thumb_url || img.url}
                      alt={img.alt}
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      onError={() => handleImageError(idx)}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-1 right-1 text-[10px] font-mono bg-black/70 text-white px-1 rounded">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* All Photos Grid View - Every photo in fixed 16:9 */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                setViewMode('featured');
              }}
              className="group relative aspect-video aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-950 cursor-pointer"
            >
              {failedImages[idx] ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#caf0f8] to-slate-100 p-4 text-center text-[#03045e]">
                  <Building2 className="h-8 w-8 text-[#0077b6] mb-1 opacity-60" />
                  <p className="text-xs font-semibold">{img.caption}</p>
                </div>
              ) : (
                <img
                  src={img.card_url || img.url}
                  srcSet={
                    img.thumb_url && img.card_url
                      ? `${img.thumb_url} 400w, ${img.card_url} 800w`
                      : undefined
                  }
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  alt={img.alt}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  onError={() => handleImageError(idx)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
                <span className="text-xs font-medium bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md truncate max-w-[80%]">
                  {img.caption || `Photo ${idx + 1}`}
                </span>
                <span className="text-[11px] font-mono opacity-80">
                  {idx + 1} / {images.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

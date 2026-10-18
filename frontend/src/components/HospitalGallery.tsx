import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  LayoutGrid,
  X,
  Maximize2,
} from 'lucide-react';
import { HospitalImage } from '../types';

interface HospitalGalleryProps {
  images: HospitalImage[];
  hospitalName: string;
}

export function HospitalGallery({ images, hospitalName }: HospitalGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [loadedMap, setLoadedMap] = React.useState<Record<number, boolean>>({});
  const [failedImages, setFailedImages] = React.useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handleNextLightbox = React.useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => ((prev ?? 0) + 1) % images.length);
  }, [lightboxIndex, images.length]);

  const handlePrevLightbox = React.useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => ((prev ?? 0) - 1 + images.length) % images.length);
  }, [lightboxIndex, images.length]);

  // Handle keyboard navigation for lightbox
  React.useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNextLightbox();
      if (e.key === 'ArrowLeft') handlePrevLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxIndex, handleNextLightbox, handlePrevLightbox]);

  if (!images || images.length === 0) return null;

  // Render strictly 16:9 image box with object-cover
  const renderStrict16x9Box = (
    img: HospitalImage,
    index: number,
    isPriority: boolean = false
  ) => {
    const isLoaded = loadedMap[index];
    const isFailed = failedImages[index];

    return (
      <div
        key={index}
        onClick={() => setLightboxIndex(index)}
        className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#90e0ef]/70 bg-slate-100 group cursor-pointer shadow-xs select-none hover:border-[#0077b6] transition-all"
        role="button"
        tabIndex={0}
        aria-label={`View photo ${index + 1} of ${hospitalName}: ${img.caption || img.alt || ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setLightboxIndex(index);
          }
        }}
      >
        {/* Loading shimmer */}
        {!isLoaded && !isFailed && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse z-1" />
        )}

        {isFailed ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#caf0f8] to-slate-100 p-4 text-center text-[#03045e]">
            <Building2 className="h-8 w-8 text-[#0077b6]/50 mb-1" />
            <p className="text-xs font-semibold line-clamp-1">{hospitalName}</p>
          </div>
        ) : (
          <img
            src={img.card_url || img.thumb_url || img.url}
            alt={img.alt || `${hospitalName} - Photo ${index + 1}`}
            loading={isPriority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setLoadedMap((prev) => ({ ...prev, [index]: true }))}
            onError={() => handleImageError(index)}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Gradient Scrim for subtle contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-85 transition-opacity pointer-events-none" />

        {/* Caption Tag */}
        {img.caption && (
          <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none z-2">
            <span className="text-[11px] sm:text-xs font-medium bg-black/60 text-white backdrop-blur-xs px-2.5 py-1 rounded-lg truncate max-w-[90%] inline-block border border-white/10">
              {img.caption}
            </span>
          </div>
        )}

        {/* Zoom Icon Badge on Hover */}
        <div className="absolute top-2.5 right-2.5 z-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-lg pointer-events-none backdrop-blur-xs">
          <Maximize2 className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  };

  // Number of images to display in the single horizontal line (up to 3: Main + 2 Side)
  const displayCount = Math.min(images.length, 3);
  const gridColsClass = displayCount === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : displayCount === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3';

  return (
    <section aria-label={`Photo gallery of ${hospitalName}`} className="space-y-3">
      {/* Top Row: Main image and side 2 images in ONE horizontal line */}
      <div className={`grid ${gridColsClass} gap-3`}>
        {/* Main Image (First box) */}
        <div>
          {renderStrict16x9Box(images[0], 0, true)}
        </div>

        {/* Side Image 1 (Second box) */}
        {images.length > 1 && (
          <div>
            {renderStrict16x9Box(images[1], 1)}
          </div>
        )}

        {/* Side Image 2 (Third box) */}
        {images.length > 2 && (
          <div>
            {renderStrict16x9Box(images[2], 2)}
          </div>
        )}
      </div>

      {/* View more button below them */}
      <div>
        <button
          type="button"
          onClick={() => setLightboxIndex(images.length > 3 ? 3 : 0)}
          className="w-full rounded-2xl border-2 border-dashed border-[#90e0ef] hover:border-[#0077b6] bg-gradient-to-r from-[#caf0f8]/40 via-white to-[#caf0f8]/40 hover:bg-[#caf0f8]/70 text-[#0077b6] flex items-center justify-center gap-2.5 py-3 px-4 transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
          aria-label={`View more photos of ${hospitalName}`}
        >
          <div className="h-6 w-6 rounded-full bg-[#0077b6] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0">
            <LayoutGrid className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#03045e] group-hover:text-[#0077b6] leading-tight">
            View more
          </span>
          <span className="text-[11px] font-semibold text-slate-500 bg-white/90 px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
            All {images.length} verified photos
          </span>
        </button>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
          role="dialog"
          aria-modal="true"
          aria-label={`${hospitalName} photo viewer`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxIndex(null);
          }}
        >
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between text-white shrink-0 pb-3 border-b border-white/10">
            <div className="space-y-0.5 max-w-[80%] truncate">
              <h4 className="text-sm sm:text-base font-bold text-white truncate">
                {hospitalName}
              </h4>
              <p className="text-xs text-slate-400">
                Photo {lightboxIndex + 1} of {images.length}
                {images[lightboxIndex]?.caption
                  ? ` • ${images[lightboxIndex].caption}`
                  : ''}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition-colors cursor-pointer"
              aria-label="Close photo viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Lightbox Main Stage */}
          <div className="relative flex-1 flex items-center justify-center my-3 min-h-0">
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrevLightbox}
                className="absolute left-1 sm:left-4 z-10 rounded-full bg-black/60 hover:bg-black/90 p-2.5 sm:p-3 text-white backdrop-blur-md transition-all shadow-xl cursor-pointer border border-white/10"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div className="max-h-[68vh] sm:max-h-[74vh] max-w-5xl mx-auto flex items-center justify-center p-2">
              <img
                src={images[lightboxIndex]?.url}
                alt={
                  images[lightboxIndex]?.alt ||
                  `${hospitalName} - Photo ${lightboxIndex + 1}`
                }
                className="max-h-[68vh] sm:max-h-[74vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNextLightbox}
                className="absolute right-1 sm:right-4 z-10 rounded-full bg-black/60 hover:bg-black/90 p-2.5 sm:p-3 text-white backdrop-blur-md transition-all shadow-xl cursor-pointer border border-white/10"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Strip */}
          {images.length > 1 && (
            <div className="shrink-0 pt-2 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    lightboxIndex === idx
                      ? 'border-[#0077b6] ring-2 ring-[#0077b6]/50 scale-105 bg-white'
                      : 'border-white/20 opacity-60 hover:opacity-100 bg-slate-900'
                  }`}
                  aria-label={`Jump to photo ${idx + 1}`}
                >
                  <img
                    src={img.card_url || img.thumb_url || img.url}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

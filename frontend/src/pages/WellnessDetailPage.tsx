import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Globe,
  Share2,
  Flag,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Leaf,
  ShieldCheck,
  Building2,
  Navigation,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWellnessCenterBySlug } from '../api/wellness';
import { WellnessCenter } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';

export function WellnessDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [center, setCenter] = React.useState<WellnessCenter | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    if (slug) {
      fetchWellnessCenterBySlug(slug)
        .then((data) => {
          if (isMounted) {
            setCenter(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setCenter(null);
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Wellness center link copied to clipboard', {
        description: `Verified listing for ${center?.name || ''} is ready to share.`,
      });
    }
  };

  const handleReportError = () => {
    window.dispatchEvent(
      new CustomEvent('open-correction-dialog', {
        detail: { subject: `${center?.name || ''} (Wellness Center)` },
      })
    );
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-[#0077b6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Loading verified wellness center profile...</p>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-[#03045e]">Wellness Center Not Found</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The requested wellness center listing is not present or has been consolidated.
        </p>
        <Button asChild variant="default" className="bg-[#0077b6] hover:bg-[#03045e]">
          <Link to="/wellness-centers">Browse All Wellness Centers</Link>
        </Button>
      </div>
    );
  }

  const coverImage = (center.images && center.images.length > 0) ? center.images[0] : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <Breadcrumb className="py-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/wellness-centers">Wellness Centers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{center.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Card */}
      <div className="rounded-3xl border border-[#90e0ef] bg-white overflow-hidden shadow-xs">
        <div className="relative aspect-21/9 sm:aspect-24/9 w-full bg-gradient-to-br from-[#03045e] via-[#023e8a] to-[#0077b6] overflow-hidden min-h-[200px] max-h-[360px]">
          {coverImage && !imageError && (
            <>
              <img
                src={coverImage.url}
                alt={coverImage.alt}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03045e]/90 via-[#03045e]/40 to-transparent" />
            </>
          )}

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                <span>{center.category}</span>
              </span>
              <span className="rounded-md bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-semibold text-white border border-white/30">
                {center.city.toUpperCase()} · {center.area}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {center.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-200 mt-2">
              <MapPin className="h-4 w-4 text-[#90e0ef] shrink-0" />
              <span>{center.address}</span>
            </div>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Audited & verified listing · Last reviewed: <strong>{center.lastChecked || '2026-10-17'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleShare} variant="outline" size="sm" className="gap-1.5 text-xs">
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </Button>
            <Button onClick={handleReportError} variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-500 hover:text-red-600">
              <Flag className="h-3.5 w-3.5" />
              <span>Report Update</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Contact Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#03045e] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0077b6]" />
              <span>Center Overview</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {center.overview}
            </p>
          </div>

          {/* Programs & Treatments */}
          {center.programs && center.programs.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#03045e] flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span>Programs & Treatments</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {center.programs.map((program, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-[#03045e]">
                    <CheckCircle2 className="h-4 w-4 text-[#0077b6] shrink-0 mt-0.5" />
                    <span>{program}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disciplines & Departments */}
          {center.disciplines && center.disciplines.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#03045e]">Disciplines & Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {center.disciplines.map((discipline, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1 bg-[#caf0f8]/60 text-[#03045e] font-medium text-xs">
                    {discipline}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          {center.facilities && center.facilities.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#03045e] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#0077b6]" />
                <span>Campus Facilities</span>
              </h2>
              <ul className="space-y-2 text-xs text-slate-600">
                {center.facilities.map((fac, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0077b6]" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification & Official Citations */}
          <div className="rounded-2xl border border-[#90e0ef]/70 bg-[#caf0f8]/20 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#03045e]">
              <ShieldCheck className="h-4 w-4 text-[#0077b6]" />
              <span>Verification Transparency</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {center.verificationStatus}
            </p>
            {center.sources && center.sources.length > 0 && (
              <div className="pt-2 border-t border-[#90e0ef]/40 space-y-1">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                  Citations & Sources
                </span>
                {center.sources.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3 text-[#0077b6] shrink-0" />
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0077b6] font-semibold hover:underline truncate"
                    >
                      {s.label}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Contact & Directions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#03045e] border-b border-slate-100 pb-2">
              Contact & Location
            </h3>

            {/* Address */}
            <div className="space-y-1 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Full Address
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                {center.address} (Pincode: {center.pincode})
              </p>
            </div>

            {/* Telephone & WhatsApp */}
            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Phone & WhatsApp
              </span>
              <a
                href={`tel:${center.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-2 text-sm font-bold text-[#0077b6] hover:underline"
              >
                <Phone className="h-4 w-4" />
                <span>{center.phone}</span>
              </a>

              <a
                href={`https://wa.me/${center.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                  `Hello, I would like visiting hours and booking information for ${center.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors w-full justify-center"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

            {/* Website */}
            {/* {center.website && (
              <div className="space-y-1 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Official Website
                </span>
                <a
                  href={center.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0077b6] hover:underline truncate"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{center.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 ml-0.5" />
                </a>
              </div>
            )} */}

            {/* Google Maps Button */}
            {center.mapsUrl && (
              <Button asChild className="w-full bg-[#0077b6] hover:bg-[#03045e] text-white gap-2 mt-2">
                <a href={center.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions on Google Maps</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

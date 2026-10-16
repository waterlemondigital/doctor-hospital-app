import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ExternalLink,
  Phone,
  Building2,
  Calendar,
  CheckCircle2,
  Flag,
  Share2,
  AlertTriangle,
  FlaskConical,
  Sparkles,
  ShieldCheck,
  Home,
  Clock,
  ArrowRight,
  FileCheck,
  Search,
} from 'lucide-react';
import { LABORATORIES_DATA } from '../data/laboratories';
import { HOSPITALS_DATA } from '../data/hospitals';
import { QueryDialog } from '../components/QueryDialog';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export function LaboratoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isQueryOpen, setIsQueryOpen] = React.useState(false);

  const laboratory = LABORATORIES_DATA.find((l) => l.slug === slug || l.id === slug);

  if (!laboratory) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#caf0f8] text-[#0077b6]">
          <FlaskConical className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-[#03045e]">Laboratory Listing Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          The requested diagnostic laboratory record could not be found or may have been updated.
        </p>
        <Button asChild variant="default" className="bg-[#0077b6]">
          <Link to="/laboratories">Back to Laboratories Directory</Link>
        </Button>
      </div>
    );
  }

  // Find connected hospitals based on relations or name matching
  const connectedHospitals = HOSPITALS_DATA.filter((h) => {
    const labName = laboratory.name.toLowerCase();
    const hospName = h.name.toLowerCase();
    // E.g. Deenanath Mangeshkar Hospital, Bharati Hospital
    if (labName.includes('deenanath') && hospName.includes('deenanath')) return true;
    if (labName.includes('bharati') && hospName.includes('bharati')) return true;
    // Known affiliations from dataset: Sahyadri & Sassoon with Apollo & Metropolis
    if (labName.includes('apollo') && hospName.includes('sahyadri')) return true;
    if (labName.includes('metropolis') && (hospName.includes('sahyadri') || hospName.includes('sassoon'))) return true;
    return false;
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Laboratory profile link copied', {
        description: `Verified listing for ${laboratory.name} is ready to share.`,
      });
    }
  };

  const handleReportError = () => {
    window.dispatchEvent(
      new CustomEvent('open-correction-dialog', {
        detail: { subject: `${laboratory.name} (Laboratory)` },
      })
    );
  };

  const coverImage = laboratory.images[0] || {
    url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&auto=format&fit=crop&q=80',
    alt: laboratory.name,
    caption: 'Diagnostic pathology and automated clinical biochemistry center',
  };

  const isPhoneDirect = !laboratory.phone.toLowerCase().startsWith('use official');

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb: Home > Laboratories > Maharashtra > Pune > Lab Name */}
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
              <Link to="/laboratories">Laboratories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-slate-500">{laboratory.state}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-slate-500">{laboratory.city}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{laboratory.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Profile Block */}
      <div className="rounded-3xl border border-[#90e0ef]/70 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-[#caf0f8] text-[#03045e] font-semibold flex items-center gap-1.5 py-1 px-3">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0077b6]" />
                <span>{laboratory.facilityTypeBadge}</span>
              </Badge>
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1 py-1 px-2.5">
                <Home className="h-3 w-3 text-emerald-600" />
                <span>Home Sample Phlebotomy</span>
              </Badge>
              {laboratory.emergencyAvailable24x7 && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 font-semibold flex items-center gap-1 py-1 px-2.5">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span>24x7 Emergency Services</span>
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#03045e] tracking-tight">
              {laboratory.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#0077b6] shrink-0" />
                <span>{laboratory.address || `${laboratory.area}, ${laboratory.city}`}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>PIN Code: {laboratory.pincode}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs"
            >
              <Share2 className="h-3.5 w-3.5 text-[#0077b6]" />
              <span>Share</span>
            </Button>

            <button
              type="button"
              onClick={handleReportError}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer"
            >
              <Flag className="h-3 w-3" />
              <span>Report an error</span>
            </button>
          </div>
        </div>

        {/* External Links Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs font-semibold">
          {laboratory.website && (
            <a
              href={laboratory.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#0077b6] hover:text-[#03045e] hover:underline"
            >
              <span>Official Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {laboratory.mapsUrl && (
            <>
              <span className="text-slate-300">•</span>
              <a
                href={laboratory.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#0077b6] hover:text-[#03045e] hover:underline"
              >
                <span>Google Maps Directions</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}

          <span className="text-slate-300">•</span>
          <span className="text-slate-500">
            Last Checked: {laboratory.lastChecked}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (Content & Tabs) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover Media Gallery */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-50">
            <div className="relative aspect-16/9 w-full bg-slate-100">
              <img
                src={coverImage.url}
                alt={coverImage.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-xs">
                <p className="font-semibold">{coverImage.alt}</p>
                {coverImage.caption && <p className="text-[11px] text-slate-200">{coverImage.caption}</p>}
              </div>
            </div>
          </div>

          {/* Deep Navigation Tabs */}
          <Tabs defaultValue="overview" className="w-full space-y-4">
            <TabsList className="w-full flex-wrap justify-start h-auto p-1 bg-slate-100/90 rounded-xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Test Categories ({laboratory.services.length})</TabsTrigger>
              <TabsTrigger value="departments">Departments ({laboratory.departments.length})</TabsTrigger>
              <TabsTrigger value="hospitals">Connected Hospitals ({connectedHospitals.length})</TabsTrigger>
              <TabsTrigger value="verification">Accreditation Audit</TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-[#03045e]">
                  About {laboratory.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">
                  {laboratory.overview}
                </p>
              </div>

              {/* Operational Diagnostic Highlights */}
              <div className="rounded-xl bg-[#caf0f8]/30 p-5 border border-[#90e0ef]/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#03045e]">
                  Operational & Clinical Quality Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 font-semibold">Accreditation Status</strong>
                      <span className="text-slate-600">{laboratory.accreditation || 'NABL Accredited Diagnostics'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 font-semibold">Home Sample Phlebotomy</strong>
                      <span className="text-slate-600">Available across serviceable Pune PIN codes</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 font-semibold">Service Model</strong>
                      <span className="text-slate-600">{laboratory.name.includes('Hospital') ? 'Hospital In-house Pathology Wing' : 'Central Reference Laboratory Network'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 font-semibold">Emergency Coverage</strong>
                      <span className="text-slate-600">{laboratory.emergencyAvailable24x7 ? '24x7 Critical Care Fluid Profiling' : 'Regular OPD Phlebotomy Hours'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facilities / Equipment notes */}
              {laboratory.facilities && laboratory.facilities.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sample Collection & Reporting Facilities
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {laboratory.facilities.map((fac, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0077b6] shrink-0 mt-1.5" />
                        <span>{fac}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Test Categories & Services */}
            <TabsContent value="services" className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#03045e]">
                    Diagnostic Test Categories & Health Packages
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified clinical pathology test menus offered by {laboratory.name}.
                  </p>
                </div>
                <Button onClick={() => setIsQueryOpen(true)} size="sm" className="bg-[#0077b6] hover:bg-[#03045e] text-xs">
                  Inquire Test Menu
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {laboratory.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 text-xs font-semibold text-[#03045e] hover:border-[#90e0ef] transition-colors"
                  >
                    <FlaskConical className="h-4 w-4 text-[#0077b6] shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 mt-4 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Patient Advisory:</strong> Specific test preparation instructions (e.g. 10–12 hours overnight fasting for lipid/blood sugar tests, stopping certain medications) should be confirmed with the laboratory beforehand.
                </p>
              </div>
            </TabsContent>

            {/* Tab 3: Departments */}
            <TabsContent value="departments" className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-lg font-bold text-[#03045e]">
                Pathology Disciplines & Clinical Departments
              </h3>
              <p className="text-xs text-slate-500">
                Specialized laboratory branches operating under calibrated quality control protocols.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {laboratory.departments.map((dept, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 shadow-2xs hover:border-[#0077b6] transition-colors"
                  >
                    <h4 className="text-sm font-bold text-[#03045e]">{dept.name}</h4>
                    <p className="text-xs text-slate-500">Clinical diagnostic division with automated analyzer integration.</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab 4: Connected Hospitals */}
            <TabsContent value="hospitals" className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#03045e]">
                  Affiliated Hospitals & Medical Centers
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tertiary care hospitals and institutions with verified diagnostic referral or operational linkages.
                </p>
              </div>

              {connectedHospitals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {connectedHospitals.map((hosp) => (
                    <div
                      key={hosp.id}
                      className="rounded-2xl border border-[#90e0ef]/70 bg-white p-4 space-y-3 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077b6]">
                          {hosp.facilityTypeBadge}
                        </span>
                        <h4 className="text-sm font-bold text-[#03045e] line-clamp-1">
                          {hosp.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#0077b6] shrink-0" />
                          <span>{hosp.area}, {hosp.city}</span>
                        </p>
                      </div>

                      <Button asChild size="sm" variant="outline" className="w-full justify-between text-xs font-semibold text-[#0077b6] hover:bg-[#caf0f8]/30">
                        <Link to={`/hospitals/${hosp.slug}`}>
                          <span>View Hospital Profile</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-2 bg-slate-50/70">
                  <Building2 className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-[#03045e]">Independent Central Diagnostic Provider</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    This diagnostic brand operates through autonomous collection centers and direct patient phlebotomy throughout Pune.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab 5: Verification Audit */}
            <TabsContent value="verification" className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-lg font-bold text-[#03045e]">
                Accreditation & Source Verification Audit
              </h3>
              <p className="text-xs text-slate-500">
                Official source links and statutory quality verification details for {laboratory.name}.
              </p>

              <div className="space-y-3 pt-2">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-[#03045e]">Verification Status:</span>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px]">
                      {laboratory.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Laboratory information has been reviewed against published hospital directory data and official diagnostics listings.
                  </p>
                </div>

                {laboratory.sources && laboratory.sources.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Official Source References
                    </h4>
                    <div className="space-y-2">
                      {laboratory.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs"
                        >
                          <span className="font-semibold text-[#03045e]">{src.label}</span>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0077b6] hover:underline font-bold"
                          >
                            <span>Verify Source</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Contact & Booking Actions */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Action Card */}
          <div className="rounded-3xl border border-[#90e0ef] bg-white p-6 shadow-sm space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0077b6]">
                Direct Laboratory Access
              </span>
              <h3 className="text-lg font-extrabold text-[#03045e] mt-1">
                Book Sample Collection
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Connect directly with {laboratory.name} phlebotomy coordinators or request home sample collection in Pune.
              </p>
            </div>

            <div className="space-y-2.5">
              <Button
                onClick={() => setIsQueryOpen(true)}
                className="w-full bg-[#0077b6] hover:bg-[#03045e] text-white font-bold h-11 text-xs gap-2 shadow-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>Inquire Test Package / Home Collection</span>
              </Button>

              {isPhoneDirect ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:text-[#0077b6] hover:border-[#90e0ef] h-10 text-xs gap-2"
                >
                  <a href={`tel:${laboratory.phone.replace(/[^0-9+]/g, '')}`}>
                    <Phone className="h-3.5 w-3.5 text-[#0077b6]" />
                    <span>Call Lab: {laboratory.phone}</span>
                  </a>
                </Button>
              ) : (
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#0077b6] shrink-0" />
                  <span className="line-clamp-2">{laboratory.phone}</span>
                </div>
              )}

              {laboratory.website && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:text-[#0077b6] hover:border-[#90e0ef] h-10 text-xs gap-2"
                >
                  <a href={laboratory.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 text-[#0077b6]" />
                    <span>Open Provider Portal</span>
                  </a>
                </Button>
              )}

              {laboratory.mapsUrl && (
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-slate-600 hover:text-[#0077b6] h-9 text-xs gap-1.5"
                >
                  <a href={laboratory.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="h-3.5 w-3.5 text-[#0077b6]" />
                    <span>Get Directions on Google Maps</span>
                  </a>
                </Button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>No intermediary booking charges</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Digital reports with QR verification</span>
              </p>
            </div>
          </div>

          {/* Quality Notice Card */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#03045e]">
              <ShieldCheck className="h-4 w-4 text-[#0077b6]" />
              <span>NABL Quality Accreditation Note</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Diagnostic accreditation is test- and facility-specific. While major national brands maintain central NABL/CAP certifications, exact branch scope and report turnaround times should be verified directly with the provider.
            </p>
          </div>
        </div>
      </div>

      {/* Inquiry Dialog */}
      <QueryDialog
        open={isQueryOpen}
        onOpenChange={setIsQueryOpen}
        targetType="laboratory"
        targetName={laboratory.name}
        targetId={laboratory.id}
      />
    </div>
  );
}

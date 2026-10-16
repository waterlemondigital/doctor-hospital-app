import * as React from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
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
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { HOSPITALS_DATA } from '../data/hospitals';
import { LABORATORIES_DATA } from '../data/laboratories';
import { DOCTORS_DATA } from '../data/doctors';
import { HospitalGallery } from '../components/HospitalGallery';
import { EmergencyNoticeCard } from '../components/EmergencyNoticeCard';
import { ContactActionsBar } from '../components/ContactActionsBar';
import { DoctorCard } from '../components/DoctorCard';
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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export function HospitalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isQueryOpen, setIsQueryOpen] = React.useState(false);

  // If a laboratory slug is accessed via /hospitals/:slug, redirect to /laboratories/:slug
  const isLab = LABORATORIES_DATA.some((l) => l.slug === slug);
  if (isLab) {
    return <Navigate to={`/laboratories/${slug}`} replace />;
  }

  const hospital = HOSPITALS_DATA.find((h) => h.slug === slug);

  if (!hospital) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#03045e]">Listing Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          The requested healthcare profile may have been relocated or updated. Please browse our verified directory.
        </p>
        <Button asChild variant="default" className="bg-[#0077b6]">
          <Link to="/hospitals">Back to Healthcare Directory</Link>
        </Button>
      </div>
    );
  }

  // Doctors affiliated with this hospital
  const consultingDoctors = DOCTORS_DATA.filter((d) =>
    d.hospitals.some((aff) => aff.hospitalId === hospital.id) ||
    hospital.doctorIds.includes(d.id)
  );

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard', {
        description: `Verified listing link for ${hospital.name} is ready to share.`,
      });
    }
  };

  const handleReportError = () => {
    window.dispatchEvent(
      new CustomEvent('open-correction-dialog', {
        detail: { subject: `${hospital.name} (${hospital.city})` },
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb: Home > Hospitals > Maharashtra > Pune > Hospital name */}
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
              <Link to="/hospitals">Hospitals</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-slate-500">{hospital.state}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-slate-500">{hospital.city}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{hospital.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Block */}
      <div className="rounded-3xl border border-[#90e0ef]/70 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-[#caf0f8] text-[#03045e]">
                {hospital.facilityTypeBadge}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#03045e] tracking-tight">
              {hospital.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#0077b6] shrink-0" />
                <span>{hospital.address}</span>
              </div>
            </div>
          </div>

          {/* Quick External Actions */}
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
          <a
            href={hospital.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#0077b6] hover:text-[#03045e] hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {hospital.bedCount && (
            <>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <span className="text-slate-600">
                Capacity: <strong>{hospital.bedCount}+ Inpatient Beds</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Image Gallery (1 Large + 2 Stacked on desktop, carousel on mobile) */}
      <HospitalGallery images={hospital.images} hospitalName={hospital.name} />

      {/* Emergency Guidance Card */}
      <EmergencyNoticeCard />

      {/* Main Grid: Content Tabs & Action Sidecard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Comprehensive Tabs (Overview, Services, Departments, Doctors, Facilities) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList
              data-no-scrollbar="true"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="w-full justify-start overflow-x-auto no-scrollbar py-1"
            >
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services & Treatments</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="doctors">Doctors ({consultingDoctors.length})</TabsTrigger>
              <TabsTrigger value="facilities">Infrastructure</TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-lg font-bold text-[#03045e]">
                About {hospital.name}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {hospital.overview}
              </p>

              <div className="rounded-xl bg-[#caf0f8]/30 p-4 border border-[#90e0ef]/50 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#03045e]">
                  Operational Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Emergency Service: {hospital.emergencyAvailable24x7 ? '24x7 Active' : 'Restricted Hours'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Location: {hospital.area}, Pune</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Category: {hospital.facilityType}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>PIN Code: {hospital.pincode}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Services & Treatments */}
            <TabsContent value="services" className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#03045e]">
                  Clinical Services & Procedures
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {hospital.services.length} Listed
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Verified offerings available at this facility. Specific procedure scheduling is subject to OPD assessment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {hospital.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs font-semibold text-[#03045e]"
                  >
                    <div className="h-2 w-2 rounded-full bg-[#0077b6] shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab 3: Departments - with unified slug tracking to doctors */}
            <TabsContent value="departments" className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#03045e]">
                  Medical & Surgical Departments
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {hospital.departments.length} Departments
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Institutional departments with department slugs matching consulting doctor profiles:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {hospital.departments.map((dept) => {
                  const matchingDoctor = consultingDoctors.find(
                    (d) => d.departmentSlug === dept.slug || d.specialitySlug === dept.slug
                  );

                  return (
                    <div
                      key={dept.slug}
                      className="rounded-2xl border border-[#90e0ef]/70 bg-gradient-to-br from-white to-[#caf0f8]/10 p-4 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#caf0f8] text-[#0077b6]">
                            <Stethoscope className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#03045e] leading-snug">
                              {dept.name}
                            </h4>
                            <span className="text-[10px] font-mono font-medium text-slate-400">
                              slug: {dept.slug}
                            </span>
                          </div>
                        </div>

                        {matchingDoctor && (
                          <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold shrink-0">
                            Doctor Linked
                          </span>
                        )}
                      </div>

                      {dept.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {dept.description}
                        </p>
                      )}

                      {/* Connection to doctor with matching department slug */}
                      {matchingDoctor ? (
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            to={`/doctors/${matchingDoctor.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077b6] hover:text-[#03045e] hover:underline"
                          >
                            <span>Consultant: {matchingDoctor.name}</span>
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </div>
                      ) : (
                        <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                          Active OPD & Inpatient Rota
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab 4: Doctors at this hospital */}
            <TabsContent value="doctors" className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-[#03045e]">
                    Doctors at this Hospital
                  </h3>
                  <p className="text-xs text-slate-500">
                    Credentialed specialists with verified outpatient schedules at {hospital.name}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {consultingDoctors.map((doc) => (
                  <DoctorCard key={doc.id} doctor={doc} showHospitalList={false} />
                ))}
              </div>
            </TabsContent>

            {/* Tab 5: Facilities */}
            <TabsContent value="facilities" className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-lg font-bold text-[#03045e]">
                Patient & Campus Facilities
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {hospital.facilities.map((fac, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#0077b6] shrink-0" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Contact Actions & FAQ info */}
        <div className="space-y-6">
          <ContactActionsBar
            phone={hospital.phone}
            whatsapp={hospital.whatsapp}
            targetName={hospital.name}
            targetType="hospital"
            onOpenQuery={() => setIsQueryOpen(true)}
          />

          {/* Quick FAQ / Help Accordion */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#03045e]">
              Visitor Information
            </h4>
            <Accordion defaultValue={['faq-1']}>
              <AccordionItem value="faq-1">
                <AccordionTrigger value="faq-1">Are OPD timings guaranteed?</AccordionTrigger>
                <AccordionContent value="faq-1">
                  Outpatient sessions can occasionally change due to acute emergency surgeries or government clinical rotations. We recommend calling the hospital reception before travelling.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger value="faq-2">Is health insurance accepted?</AccordionTrigger>
                <AccordionContent value="faq-2">
                  Most tertiary hospitals maintain a dedicated Third-Party Administrator (TPA) cashless desk. Government facilities additionally honour PMJAY and state schemes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Query Dialog Modal */}
      <QueryDialog
        open={isQueryOpen}
        onOpenChange={setIsQueryOpen}
        targetType="hospital"
        targetName={hospital.name}
        targetId={hospital.id}
      />
    </div>
  );
}

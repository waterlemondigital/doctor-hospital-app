import * as React from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  ArrowRight,
  UserRound,
  X,
  Filter,
} from 'lucide-react';
import { fetchHospitalBySlug } from '../api/hospitals';
import { fetchDoctors } from '../api/doctors';
import { Hospital, Doctor } from '../types';
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

const RUBY_HALL_TEMPORARY_IMAGES: HospitalImage[] = [
  {
    url: '/images/rubyhall/r1.jpeg',
    alt: 'Ruby Hall Clinic - Main Campus & Entrance',
    caption: 'Main Campus & Entrance',
  },
  {
    url: '/images/rubyhall/r2.jpeg',
    alt: 'Ruby Hall Clinic - Hospital Infrastructure',
    caption: 'Hospital Infrastructure & Patient Care',
  },
  {
    url: '/images/rubyhall/r3.jpeg',
    alt: 'Ruby Hall Clinic - Clinical Departments & OPD',
    caption: 'Clinical Departments & OPD',
  },
  {
    url: '/images/rubyhall/r3.jpg',
    alt: 'Ruby Hall Clinic - Inpatient & Advanced Medical Complex',
    caption: 'Inpatient & Advanced Medical Complex',
  },
  {
    url: '/images/rubyhall/r4.jpeg',
    alt: 'Ruby Hall Clinic - Diagnostic & Imaging Wing',
    caption: 'Diagnostic & Specialty Wing',
  },
  {
    url: '/images/rubyhall/r5.jpeg',
    alt: 'Ruby Hall Clinic - Specialty Treatment Facility',
    caption: 'Specialty Care Wing',
  },
];

function isDoctorInDepartment(doc: Doctor, dept: { name: string; slug: string }): boolean {
  if (!doc || !dept) return false;

  const dSlug = (doc.departmentSlug || '').toLowerCase();
  const sSlug = (doc.specialitySlug || '').toLowerCase();
  const deptSlug = (dept.slug || '').toLowerCase();

  // 1. Direct slug match or inclusion
  if (dSlug === deptSlug || sSlug === deptSlug) return true;
  if (deptSlug && (dSlug.includes(deptSlug) || deptSlug.includes(dSlug))) return true;
  if (deptSlug && (sSlug.includes(deptSlug) || deptSlug.includes(sSlug))) return true;

  // 2. Normalized keyword matching
  const stopWords = new Set([
    'and', 'or', 'of', 'in', 'the', 'department', 'speciality', 'clinic',
    'center', 'centre', 'medicine', 'services', 'care', 'surgery', 'surgical',
    'unit', 'division', 'institute', 'hospital', 'health'
  ]);

  const cleanWords = (str: string) => (str || '').toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const deptWords = cleanWords(dept.name);
  const docDeptWords = cleanWords(doc.department);
  const docSpecWords = cleanWords(doc.speciality);
  const allDocWords = new Set([...docDeptWords, ...docSpecWords]);

  const hasWord = (w: string) => {
    if (allDocWords.has(w)) return true;
    if (w === 'cardiac' && allDocWords.has('heart')) return true;
    if (w === 'heart' && allDocWords.has('cardiac')) return true;
    if (w === 'cardiothoracic' && (allDocWords.has('cardiac') || allDocWords.has('heart') || allDocWords.has('thoracic'))) return true;
    if (w === 'orthopaedics' && allDocWords.has('orthopaedic')) return true;
    if (w === 'orthopaedic' && allDocWords.has('orthopaedics')) return true;
    if (w === 'pediatric' && allDocWords.has('paediatric')) return true;
    if (w === 'paediatric' && allDocWords.has('pediatric')) return true;
    if (w === 'gynecology' && (allDocWords.has('gynaecology') || allDocWords.has('obstetrics') || allDocWords.has('obgyn'))) return true;
    if (w === 'gynaecology' && (allDocWords.has('gynecology') || allDocWords.has('obstetrics'))) return true;
    if (w === 'oncology' && (allDocWords.has('cancer') || allDocWords.has('oncologist'))) return true;
    if (w === 'cancer' && allDocWords.has('oncology')) return true;
    return false;
  };

  const matchingWords = deptWords.filter((w) => hasWord(w));

  if (deptWords.length === 1 && matchingWords.length === 1) return true;
  if (deptWords.length > 1 && matchingWords.length >= Math.min(2, deptWords.length)) return true;

  return false;
}

export function HospitalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isQueryOpen, setIsQueryOpen] = React.useState(false);

  const [hospital, setHospital] = React.useState<Hospital | null>(null);
  const [allDoctors, setAllDoctors] = React.useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const urlDept = searchParams.get('department');

  const [activeTab, setActiveTab] = React.useState<string>(() => {
    if (urlDept) return 'doctors';
    if (urlTab) return urlTab;
    return 'overview';
  });

  const [selectedDeptSlug, setSelectedDeptSlug] = React.useState<string>(() => urlDept || 'all');

  React.useEffect(() => {
    let isMounted = true;
    if (slug) {
      setIsLoading(true);
      Promise.all([fetchHospitalBySlug(slug), fetchDoctors()])
        .then(([h, docs]) => {
          if (isMounted) {
            setHospital(h);
            if (docs) setAllDoctors(docs);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [slug]);

  // Sync state if URL searchParams change
  React.useEffect(() => {
    const d = searchParams.get('department');
    const t = searchParams.get('tab');
    if (d) {
      setSelectedDeptSlug(d);
      setActiveTab('doctors');
    } else {
      setSelectedDeptSlug('all');
      if (t) setActiveTab(t);
    }
  }, [searchParams]);

  // Doctors affiliated with this hospital
  const consultingDoctors = React.useMemo(() => {
    if (!hospital) return [];
    return allDoctors.filter((d) =>
      d.hospitals.some((aff) => aff.hospitalId === hospital.id) ||
      hospital.doctorIds.includes(d.id)
    );
  }, [hospital, allDoctors]);

  const selectedDepartmentObj = React.useMemo(() => {
    if (!hospital || selectedDeptSlug === 'all') return null;
    return (
      hospital.departments.find(
        (d) =>
          d.slug.toLowerCase() === selectedDeptSlug.toLowerCase() ||
          d.name.toLowerCase() === selectedDeptSlug.toLowerCase()
      ) || { name: selectedDeptSlug.replace(/-/g, ' '), slug: selectedDeptSlug }
    );
  }, [hospital, selectedDeptSlug]);

  const filteredDoctors = React.useMemo(() => {
    if (selectedDeptSlug === 'all' || !selectedDepartmentObj) {
      return consultingDoctors;
    }
    return consultingDoctors.filter((d) => isDoctorInDepartment(d, selectedDepartmentObj));
  }, [consultingDoctors, selectedDeptSlug, selectedDepartmentObj]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', newTab);
      if (newTab !== 'doctors') {
        next.delete('department');
      }
      return next;
    });
  };

  const handleSelectDepartment = (deptSlug: string) => {
    const targetDept = deptSlug && deptSlug !== 'all' ? deptSlug : 'all';
    setSelectedDeptSlug(targetDept);
    setActiveTab('doctors');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'doctors');
      if (targetDept !== 'all') {
        next.set('department', targetDept);
      } else {
        next.delete('department');
      }
      return next;
    });

    const el = document.getElementById('hospital-tabs-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = () => {
    if (!hospital) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard', {
        description: `Verified listing link for ${hospital.name} is ready to share.`,
      });
    }
  };

  const handleReportError = () => {
    if (!hospital) return;
    window.dispatchEvent(
      new CustomEvent('open-correction-dialog', {
        detail: { subject: `${hospital.name} (${hospital.city})` },
      })
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0077b6] border-t-transparent mx-auto" />
        <p className="text-sm font-medium text-slate-500">Loading hospital profile from verified database...</p>
      </div>
    );
  }

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

      {/* Image Gallery */}
      {(() => {
        const isRubyHall =
          hospital.slug === 'ruby-hall-clinic' ||
          hospital.id === 'ruby_hall_clinic_sassoon_road' ||
          hospital.name.toLowerCase().includes('ruby hall');
        const displayImages =
          isRubyHall && (!hospital.images || hospital.images.length === 0)
            ? RUBY_HALL_TEMPORARY_IMAGES
            : hospital.images;
        return <HospitalGallery images={displayImages} hospitalName={hospital.name} />;
      })()}

      {/* Emergency Guidance Card */}
      <EmergencyNoticeCard />

      {/* Main Grid: Content Tabs & Action Sidecard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Comprehensive Tabs (Overview, Services, Departments, Doctors, Facilities) */}
        <div id="hospital-tabs-container" className="lg:col-span-2 space-y-6 scroll-mt-20">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList
              data-no-scrollbar="true"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="w-full justify-start overflow-x-auto no-scrollbar py-1"
            >
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services & Treatments</TabsTrigger>
              <TabsTrigger value="departments">Departments ({hospital.departments.length})</TabsTrigger>
              <TabsTrigger value="doctors">
                Doctors ({selectedDeptSlug !== 'all' ? `${filteredDoctors.length}/${consultingDoctors.length}` : consultingDoctors.length})
              </TabsTrigger>
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
                    <span>Location: {hospital.area ? `${hospital.area}, ` : ''}{hospital.city || 'Hospital Campus'}</span>
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

            {/* Tab 3: Departments - Clickable to open doctors in that department */}
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
                Click any department below to view consulting doctors, schedules, and clinical offerings at {hospital.name}:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {hospital.departments.map((dept) => {
                  const matchingDocs = consultingDoctors.filter((d) => isDoctorInDepartment(d, dept));
                  const count = matchingDocs.length;

                  return (
                    <div
                      key={dept.slug}
                      onClick={() => handleSelectDepartment(dept.slug)}
                      className="group rounded-2xl border border-[#90e0ef]/70 bg-gradient-to-br from-white to-[#caf0f8]/10 hover:to-[#caf0f8]/30 hover:border-[#0077b6] p-4.5 shadow-2xs hover:shadow-md space-y-3 cursor-pointer transition-all active:scale-[0.99] flex flex-col justify-between"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectDepartment(dept.slug);
                        }
                      }}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#caf0f8] group-hover:bg-[#0077b6] text-[#0077b6] group-hover:text-white transition-colors shrink-0">
                              <Stethoscope className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#03045e] group-hover:text-[#0077b6] transition-colors leading-snug">
                                {dept.name}
                              </h4>
                              <span className="text-[10px] font-mono font-medium text-slate-400">
                                slug: {dept.slug}
                              </span>
                            </div>
                          </div>

                          {count > 0 ? (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold shrink-0 flex items-center gap-1 shadow-2xs">
                              <UserRound className="h-3 w-3" />
                              <span>{count} {count === 1 ? 'Doctor' : 'Doctors'}</span>
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-medium shrink-0">
                              Specialty Unit
                            </span>
                          )}
                        </div>

                        {dept.description && (
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {dept.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0077b6] group-hover:text-[#03045e]">
                        <span className="inline-flex items-center gap-1">
                          {count > 0
                            ? `View ${count} ${count === 1 ? 'Doctor' : 'Doctors'} in this Department`
                            : 'View Department Roster'}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab 4: Doctors at this hospital (Filterable by department) */}
            <TabsContent value="doctors" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="text-lg font-bold text-[#03045e] flex items-center gap-2">
                    <span>Doctors at this Hospital</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#caf0f8] text-[#0077b6]">
                      {selectedDeptSlug !== 'all' ? `${filteredDoctors.length} of ${consultingDoctors.length}` : consultingDoctors.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Credentialed specialists with verified outpatient schedules at {hospital.name}.
                  </p>
                </div>

                {/* Quick Department Selector in Doctors tab */}
                <div className="flex items-center gap-2">
                  <label htmlFor="dept-filter-select" className="text-xs font-semibold text-slate-600 shrink-0">
                    Department:
                  </label>
                  <select
                    id="dept-filter-select"
                    value={selectedDeptSlug}
                    onChange={(e) => handleSelectDepartment(e.target.value)}
                    className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[#03045e] focus:outline-none focus:border-[#0077b6] cursor-pointer"
                  >
                    <option value="all">All Departments ({consultingDoctors.length})</option>
                    {hospital.departments.map((d) => {
                      const count = consultingDoctors.filter((doc) => isDoctorInDepartment(doc, d)).length;
                      return (
                        <option key={d.slug} value={d.slug}>
                          {d.name} {count > 0 ? `(${count})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Active Department Filter Pill Banner */}
              {selectedDepartmentObj && selectedDeptSlug !== 'all' && (
                <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#caf0f8]/60 to-[#caf0f8]/20 border border-[#90e0ef] rounded-2xl text-xs shadow-2xs gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0077b6] text-white shrink-0">
                      <Stethoscope className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-semibold text-slate-600">Showing doctors in:</span>
                    <span className="font-bold text-[#03045e] px-2.5 py-0.5 bg-white rounded-lg border border-[#90e0ef] shadow-2xs">
                      {selectedDepartmentObj.name}
                    </span>
                    <span className="text-slate-500 font-medium">
                      ({filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectDepartment('all')}
                    className="text-xs font-bold text-[#0077b6] hover:text-[#03045e] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#0077b6] transition-colors shrink-0"
                  >
                    <span>Clear filter (View all {consultingDoctors.length})</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Doctors Grid */}
              {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredDoctors.map((doc) => (
                    <DoctorCard key={doc.id} doctor={doc} showHospitalList={false} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#90e0ef] bg-[#caf0f8]/10 p-8 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#caf0f8] text-[#0077b6]">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="text-sm font-bold text-[#03045e]">
                      No doctor profiles specifically linked to {selectedDepartmentObj?.name || 'this department'} yet
                    </h4>
                    <p className="text-xs text-slate-600">
                      This hospital operates an active outpatient and inpatient service in {selectedDepartmentObj?.name || 'this specialty'}. Consult with our desk for the latest duty roster or view all specialists.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      type="button"
                      onClick={() => handleSelectDepartment('all')}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold border-slate-300"
                    >
                      View All Doctors ({consultingDoctors.length})
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsQueryOpen(true)}
                      size="sm"
                      className="text-xs font-bold bg-[#0077b6] hover:bg-[#03045e]"
                    >
                      Inquire with Hospital Desk
                    </Button>
                  </div>
                </div>
              )}
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

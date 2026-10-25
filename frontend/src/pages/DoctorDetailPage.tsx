import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  Languages,
  Clock,
  Building2,
  Calendar,
  Flag,
  Share2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { fetchDoctorBySlug } from '../api/doctors';
import { fetchHospitals } from '../api/hospitals';
import { Doctor, Hospital } from '../types';
import { ContactActionsBar } from '../components/ContactActionsBar';
import { QueryDialog } from '../components/QueryDialog';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export function DoctorDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [isQueryOpen, setIsQueryOpen] = React.useState(false);

  const [doctor, setDoctor] = React.useState<Doctor | null>(null);
  const [hospitals, setHospitals] = React.useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    if (slug) {
      setIsLoading(true);
      Promise.all([fetchDoctorBySlug(slug), fetchHospitals()])
        .then(([doc, hosps]) => {
          if (isMounted) {
            setDoctor(doc);
            if (hosps) setHospitals(hosps);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0077b6] border-t-transparent mx-auto" />
        <p className="text-sm font-medium text-slate-500">Loading doctor profile from verified database...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#03045e]">Doctor Profile Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          The requested specialist record may have been updated or moved.
        </p>
        <Button asChild variant="default" className="bg-[#0077b6]">
          <Link to="/doctors">Back to Doctors Directory</Link>
        </Button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Doctor profile link copied', {
        description: `Verified profile for ${doctor.name} is ready to share.`,
      });
    }
  };

  const handleReportError = () => {
    window.dispatchEvent(
      new CustomEvent('open-correction-dialog', {
        detail: { subject: `${doctor.name} (${doctor.speciality})` },
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb: Home > Doctors > Doctor name */}
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
              <Link to="/doctors">Doctors</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{doctor.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Profile Header Block */}
      <div className="rounded-3xl border border-[#90e0ef]/70 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar / Photo */}
            <Avatar className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 border-4 border-[#90e0ef]/80 shadow-md shrink-0">
              <AvatarImage src={doctor.photo} alt={doctor.name} />
              <AvatarFallback className="text-3xl sm:text-4xl font-extrabold text-[#03045e]">
                {doctor.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-[#caf0f8] text-[#03045e]">
                  <Link
                    to={`/doctors?speciality=${encodeURIComponent(doctor.speciality)}`}
                    className="hover:underline cursor-pointer"
                    title={`Filter all ${doctor.speciality} doctors`}
                  >
                    {doctor.speciality}
                  </Link>
                </Badge>
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-mono font-medium text-slate-700">
                  Dept: {doctor.department} <span className="text-slate-400">({doctor.departmentSlug})</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#03045e] tracking-tight">
                {doctor.name}
              </h1>

              <p className="text-sm font-semibold text-[#0077b6]">
                {doctor.title}
              </p>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-1">
                {doctor.city && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
                    <span>City:</span>
                    <Link
                      to={`/doctors?city=${encodeURIComponent(doctor.city.toLowerCase())}`}
                      className="inline-flex items-center gap-1 text-[#0077b6] font-bold bg-[#caf0f8]/80 hover:bg-[#90e0ef]/60 px-2.5 py-0.5 rounded-full transition-colors"
                      title={`Filter all doctors in ${doctor.city}`}
                    >
                      <span>{doctor.city}{doctor.area ? ` (${doctor.area})` : ''}</span>
                      <span className="text-[10px] font-normal underline opacity-80">(Filter by city)</span>
                    </Link>
                  </div>
                )}
                {doctor.experienceYears && (
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-[#0077b6]" />
                    <span><strong>{doctor.experienceYears}+ years</strong> clinical practice</span>
                  </div>
                )}
                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Languages className="h-3.5 w-3.5 text-[#0077b6]" />
                    <span>Speaks: {doctor.languages.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
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

        {/* Relational Credentials Strip: Qualifications, City, Speciality, Hospital */}
        <div className="rounded-2xl bg-[#caf0f8]/30 border border-[#90e0ef]/50 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 text-[#0077b6] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#03045e]">Formal Qualifications</p>
              <p className="text-slate-600">{doctor.qualifications}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-[#0077b6] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#03045e]">City Location</p>
              <Link
                to={`/doctors?city=${encodeURIComponent(doctor.city?.toLowerCase() || 'pune')}`}
                className="text-[#0077b6] font-semibold hover:underline block"
                title={`Filter doctors in ${doctor.city || 'Pune'}`}
              >
                {doctor.city ? `${doctor.city}${doctor.state ? `, ${doctor.state}` : ''}` : 'Pune, Maharashtra'}
              </Link>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#0077b6] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#03045e]">Clinical Speciality</p>
              <Link
                to={`/doctors?speciality=${encodeURIComponent(doctor.speciality)}`}
                className="text-[#0077b6] font-semibold hover:underline block"
                title={`Filter ${doctor.speciality} doctors`}
              >
                {doctor.speciality}
              </Link>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-[#0077b6] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#03045e]">Consulting Hospital</p>
              {doctor.hospitals.length > 0 ? (
                <Link
                  to={`/doctors?hospital=${encodeURIComponent(doctor.hospitals[0].hospitalId)}`}
                  className="text-[#0077b6] font-semibold hover:underline block truncate max-w-[180px]"
                  title={`Filter doctors at ${doctor.hospitals[0].hospitalName}`}
                >
                  {doctor.hospitals[0].hospitalName}
                </Link>
              ) : (
                <p className="text-slate-600">{doctor.department}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Clinical Information & Contact Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section: Factual summary (no outcome promises, no superlatives) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="text-lg font-bold text-[#03045e]">
              Professional Overview
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {doctor.summary}
            </p>
          </section>

          {/* Hospitals where this doctor consults */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#03045e]">
                  Hospitals Where This Doctor Consults
                </h3>
                <p className="text-xs text-slate-500">
                  Verified outpatient sessions. Multiple hospital consulting is common across Indian medical practice.
                </p>
              </div>
              <Building2 className="h-5 w-5 text-[#0077b6]" />
            </div>

            <div className="grid grid-cols-1 gap-4 pt-1">
              {doctor.hospitals.map((affiliation, idx) => {
                const hospitalData = hospitals.find((h) => h.id === affiliation.hospitalId || h.slug === affiliation.hospitalId);
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#90e0ef]/70 bg-gradient-to-br from-white to-[#caf0f8]/20 p-5 space-y-3 transition-all hover:shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-[#03045e]">
                          {hospitalData ? hospitalData.name : affiliation.hospitalName}
                        </h4>
                        {hospitalData && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-[#0077b6]" />
                            {hospitalData.area}, {hospitalData.city} · {hospitalData.facilityTypeBadge}
                          </p>
                        )}
                      </div>

                      {hospitalData && (
                        <Button asChild size="sm" variant="outline" className="text-xs shrink-0">
                          <Link to={`/hospitals/${hospitalData.slug}`}>
                            <span>View Hospital</span>
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#03045e]">
                        <Calendar className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
                        <span>Days: {affiliation.days}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
                        <span>Timings: {affiliation.timings}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 leading-snug">
                      <strong>Advisory:</strong> {affiliation.note || 'Please reconfirm OPD availability before visiting.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Areas of Practice */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="text-lg font-bold text-[#03045e]">
              Areas of Practice & Clinical Scope
            </h3>
            <p className="text-xs text-slate-500">
              Documented specializations and clinical intervention capabilities:
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {doctor.areasOfPractice.map((area, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-slate-50 text-slate-800 border-slate-200 py-1 px-3 text-xs font-semibold"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Contact Actions & Safety Notice */}
        <div className="space-y-6">
          <ContactActionsBar
            phone={doctor.phone}
            whatsapp={doctor.whatsapp}
            targetName={doctor.name}
            targetType="doctor"
            onOpenQuery={() => setIsQueryOpen(true)}
          />

          {/* Medical Disclaimer Note Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#03045e]">
              <AlertCircle className="h-4 w-4 text-[#0077b6]" />
              <span>Medical Disclaimer</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              General information only. Not medical advice. MedVexa does not provide diagnoses, endorse specific practitioners, or guarantee clinical outcomes. For urgent care, call 112.
            </p>
            <Link
              to="/medical-disclaimer"
              className="inline-block text-xs font-semibold text-[#0077b6] hover:underline"
            >
              Read full policy →
            </Link>
          </div>
        </div>
      </div>

      {/* Query Dialog Modal */}
      <QueryDialog
        open={isQueryOpen}
        onOpenChange={setIsQueryOpen}
        targetType="doctor"
        targetName={doctor.name}
        targetId={doctor.id}
      />
    </div>
  );
}

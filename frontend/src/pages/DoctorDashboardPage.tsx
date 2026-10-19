import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  FlaskConical,
  Activity,
  ShieldCheck,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Flame,
  Search,
  Filter,
  RefreshCw,
  User,
  ArrowRight,
  MapPin,
  Check,
  ChevronRight,
  Sparkles,
  FileText,
  ExternalLink,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth';
import {
  fetchDoctorMyLeads,
  updateDoctorLeadStatus,
  DoctorLead,
  DoctorDashboardData,
} from '../api/doctorDashboard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

export function DoctorDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = React.useState<DoctorDashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [updatingLeadId, setUpdatingLeadId] = React.useState<string | null>(null);

  // Allow switching profile for testing
  const [activeDoctorId, setActiveDoctorId] = React.useState<string>('');

  const loadLeads = React.useCallback(async (docId?: string) => {
    setIsLoading(true);
    try {
      const res = await fetchDoctorMyLeads({
        doctorId: docId || activeDoctorId,
        targetId: user?.id,
        email: user?.email,
        name: user?.name,
      });
      setData(res);
      if (!activeDoctorId && res.doctor?.id) {
        setActiveDoctorId(res.doctor.id);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load dashboard leads: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeDoctorId, user?.id, user?.email, user?.name]);

  React.useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        toast.info('Please log in with a provider account to access your Leads Dashboard');
      }
      loadLeads();
    }
  }, [isAuthLoading, user, loadLeads]);

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    setUpdatingLeadId(leadId);
    try {
      const res = await updateDoctorLeadStatus(leadId, newStatus);
      toast.success(res.message);

      // Update state locally
      setData((prev) => {
        if (!prev) return prev;
        const updatedLeads = prev.leads.map((l) =>
          l.id === leadId ? { ...l, status: newStatus as any } : l
        );

        return {
          ...prev,
          leads: updatedLeads,
          stats: {
            ...prev.stats,
            dispatched: updatedLeads.filter((l) => l.status === 'dispatched').length,
            acknowledged: updatedLeads.filter((l) => l.status === 'acknowledged').length,
            inConsultation: updatedLeads.filter((l) => l.status === 'in_consultation').length,
            completed: updatedLeads.filter((l) => l.status === 'completed').length,
          },
        };
      });
    } catch (err: any) {
      toast.error('Failed to update lead: ' + err.message);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const filteredLeads = React.useMemo(() => {
    if (!data?.leads) return [];
    const q = searchQuery.toLowerCase().trim();

    return data.leads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.patient_name.toLowerCase().includes(q) ||
        lead.patient_phone.toLowerCase().includes(q) ||
        lead.id.toLowerCase().includes(q) ||
        lead.medical_concern.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatus === 'all' || lead.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [data?.leads, searchQuery, selectedStatus]);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 text-xs font-bold uppercase animate-pulse">
            <Flame className="h-3.5 w-3.5" /> Critical Emergency
          </span>
        );
      case 'priority':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-xs font-bold uppercase">
            Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs font-semibold">
            Routine Inbound
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-[#0077b6] border border-blue-200 px-2.5 py-0.5 text-xs font-bold">
            New Lead (Awaiting Response)
          </span>
        );
      case 'acknowledged':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-xs font-bold">
            Acknowledged
          </span>
        );
      case 'in_consultation':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-bold">
            In Consultation / Processing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
            <Check className="h-3 w-3" /> Consultation / Intake Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const activeRole = data?.entity?.role || user?.role || 'doctor';
  const isProvider = ['doctor', 'hospital', 'laboratory', 'wellness'].includes(activeRole);
  const entityName = data?.entity?.name || data?.doctor?.name || user?.name || 'Healthcare Provider';

  return (
    <div className="space-y-6 pb-16">
      {/* Patient Notice (Only if logged in as a pure patient) */}
      {user && !isProvider && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              You are currently logged in as a <strong>Patient</strong> ({user.email}). The Provider Dashboard is reserved for Doctors, Hospitals, Diagnostic Labs, and Wellness Centers.
            </span>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-[#0077b6] hover:underline shrink-0"
          >
            Browse Healthcare Directory &rarr;
          </Link>
        </div>
      )}

      {/* Top Header Card */}
      <div className="rounded-3xl border border-[#90e0ef]/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Entity Avatar / Badge */}
            <div className="relative">
              {activeRole === 'hospital' ? (
                <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0077b6] to-[#03045e] text-white shadow-md border-4 border-[#90e0ef]/70 shrink-0">
                  <Building2 className="h-12 w-12 text-[#90e0ef]" />
                </div>
              ) : activeRole === 'laboratory' ? (
                <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-600 to-[#03045e] text-white shadow-md border-4 border-teal-200 shrink-0">
                  <FlaskConical className="h-12 w-12 text-teal-300" />
                </div>
              ) : activeRole === 'wellness' ? (
                <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-[#03045e] text-white shadow-md border-4 border-purple-200 shrink-0">
                  <Activity className="h-12 w-12 text-purple-300" />
                </div>
              ) : (
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-[#90e0ef] shadow-sm shrink-0">
                  <AvatarImage
                    src={data?.doctor?.photo || data?.entity?.photo}
                    alt={entityName}
                  />
                  <AvatarFallback className="text-2xl font-extrabold text-[#03045e] bg-[#caf0f8]">
                    {entityName
                      .replace(/^(dr\.?|doctor)\s+/i, '')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {activeRole === 'hospital' ? (
                  <>
                    <Badge variant="secondary" className="bg-[#caf0f8] text-[#03045e] font-bold">
                      <Building2 className="h-3.5 w-3.5 text-[#0077b6] mr-1" />
                      Hospital Admissions & Inpatient Portal
                    </Badge>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Verified Hospital Center</span>
                    </Badge>
                  </>
                ) : activeRole === 'laboratory' ? (
                  <>
                    <Badge variant="secondary" className="bg-teal-50 text-teal-900 border border-teal-200 font-bold">
                      <FlaskConical className="h-3.5 w-3.5 text-teal-600 mr-1" />
                      Diagnostic & Pathology Laboratory
                    </Badge>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Verified Diagnostics Hub</span>
                    </Badge>
                  </>
                ) : activeRole === 'wellness' ? (
                  <>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-900 border border-purple-200 font-bold">
                      <Activity className="h-3.5 w-3.5 text-purple-600 mr-1" />
                      Integrative Wellness & Preventive Care
                    </Badge>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Verified Wellness Resort</span>
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="bg-[#caf0f8] text-[#03045e] font-semibold">
                      <Stethoscope className="h-3.5 w-3.5 text-[#0077b6] mr-1" />
                      {data?.entity?.speciality || data?.doctor?.speciality || 'Specialist Physician'}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Verified Medical Specialist</span>
                    </Badge>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#03045e] tracking-tight">
                {entityName}
              </h1>

              {/* Entity Address & Contact Details */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600">
                {(data?.entity?.address || data?.doctor?.area) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#0077b6] shrink-0" />
                    <span>
                      {data?.entity?.address || data?.doctor?.area}
                      {data?.entity?.city ? `, ${data.entity.city}` : ''}
                      {data?.entity?.pincode ? ` - ${data.entity.pincode}` : ''}
                    </span>
                  </div>
                )}

                {data?.entity?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-[#0077b6] shrink-0" />
                    <span>{data.entity.phone}</span>
                  </div>
                )}

                {data?.entity?.authorizedPersonName && (
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Authorized Person: <strong>{data.entity.authorizedPersonName}</strong> {data.entity.authorizedPersonPhone ? `(${data.entity.authorizedPersonPhone})` : ''}</span>
                  </div>
                )}

                {data?.entity?.medicalRegNo && (
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Reg No: <strong>{data.entity.medicalRegNo}</strong></span>
                  </div>
                )}
              </div>

              {/* Verified Documents (Stored in Cloudflare R2) */}
              {(data?.entity?.registrationCertUrl || data?.entity?.addressProofUrl) && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {data?.entity?.registrationCertUrl && (
                    <a
                      href={data.entity.registrationCertUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-[#0077b6] hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors shadow-2xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Operating Licence / Certificate (R2 PDF)</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {data?.entity?.addressProofUrl && (
                    <a
                      href={data.entity.addressProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors shadow-2xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Address Proof (R2 PDF)</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Switcher & Database Sync */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-end lg:self-center">
            {data?.availableDoctors && data.availableDoctors.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Switch:</span>
                <select
                  value={activeDoctorId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setActiveDoctorId(newId);
                    loadLeads(newId);
                  }}
                  className="bg-transparent font-bold text-[#0077b6] focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  {data.availableDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.speciality})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadLeads()}
              disabled={isLoading}
              className="gap-1.5 text-xs border-[#90e0ef] hover:bg-[#caf0f8]/30 text-[#03045e]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#0077b6]' : ''}`} />
              <span>Sync Database</span>
            </Button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="rounded-2xl bg-gradient-to-br from-[#caf0f8]/50 to-white border border-[#90e0ef]/60 p-4 text-center">
            <span className="text-xs font-semibold text-slate-500">Total Leads Assigned</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#03045e] mt-0.5">
              {data?.stats?.total ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-200/80 p-4 text-center">
            <span className="text-xs font-semibold text-blue-700">New Dispatches</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0077b6] mt-0.5">
              {data?.stats?.dispatched ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 p-4 text-center">
            <span className="text-xs font-semibold text-amber-700">In Consult / Processing</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-0.5">
              {data?.stats?.inConsultation ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 p-4 text-center">
            <span className="text-xs font-semibold text-emerald-700">Completed Cases</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-0.5">
              {data?.stats?.completed ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by patient name, phone, symptoms, or lead ID..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            {(['all', 'dispatched', 'acknowledged', 'in_consultation', 'completed'] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedStatus === st
                      ? 'bg-[#0077b6] text-white border-[#0077b6] shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st === 'all'
                    ? 'All Inquiries'
                    : st === 'dispatched'
                    ? 'New Leads'
                    : st === 'in_consultation'
                    ? 'In Consult'
                    : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Inbound Leads List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3 bg-white border border-slate-200 rounded-3xl p-6">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0077b6] border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-500">
            Syncing inbound patient leads from database...
          </p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 space-y-3 shadow-xs">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-[#03045e]">No Patient Leads Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {data?.leads?.length === 0
              ? 'No patient inquiries have been routed to this account yet. When our admin call agents dispatch a patient to your institution, it will appear here in real time.'
              : 'No patient leads match your current search or status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const isUpdating = updatingLeadId === lead.id;

            return (
              <div
                key={lead.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-[#90e0ef] transition-all space-y-4"
              >
                {/* Header: ID, Urgency, Status, Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#0077b6] bg-[#caf0f8] px-2 py-0.5 rounded-md border border-[#90e0ef]/70">
                      {lead.id}
                    </span>
                    {getUrgencyBadge(lead.urgency)}
                    {getStatusBadge(lead.status)}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Dispatched: {new Date(lead.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</span>
                    <span>•</span>
                    <span className="text-slate-600 font-semibold">{lead.agent_name}</span>
                  </div>
                </div>

                {/* Patient Information & Clinical Concern */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start text-xs">
                  {/* Left Patient Details (5 cols) */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400 shrink-0" />
                      <h3 className="text-base font-extrabold text-[#03045e]">
                        {lead.patient_name}
                      </h3>
                      {lead.patient_age && (
                        <span className="text-xs text-slate-500 font-medium">
                          ({lead.patient_age} yrs, {lead.patient_gender})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-bold text-xs pt-0.5">
                      <a
                        href={`tel:${lead.patient_phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077b6]/10 text-[#0077b6] hover:bg-[#0077b6] hover:text-white transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call: {lead.patient_phone}</span>
                      </a>

                      {lead.patient_whatsapp && (
                        <a
                          href={`https://wa.me/${lead.patient_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${lead.patient_name}, this is ${entityName} from MedVexa regarding your inquiry (Ref: ${lead.id}). How can we assist you today?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div className="space-y-1 pt-1 text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>
                          {lead.patient_city}
                          {lead.patient_area ? ` • ${lead.patient_area}` : ''}
                        </span>
                      </div>

                      {lead.preferred_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Preferred Date: <strong>{lead.preferred_date}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Clinical Symptoms & Agent Notes (7 cols) */}
                  <div className="md:col-span-7 space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Patient Concern / Clinical Symptoms:
                      </span>
                      <p className="mt-1 text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {lead.medical_concern}
                      </p>
                    </div>

                    {lead.agent_notes && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0077b6]">
                          Dispatcher Agent Notes:
                        </span>
                        <p className="mt-1 text-xs text-slate-700 italic bg-[#caf0f8]/30 p-2.5 rounded-lg border border-[#90e0ef]/50">
                          &ldquo;{lead.agent_notes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Status Control: Directly updates DB */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 gap-3">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Status Control (Syncs directly to Central Database):
                  </span>

                  <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                    {lead.status === 'dispatched' && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(lead.id, 'acknowledged')}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Acknowledge Lead</span>
                      </Button>
                    )}

                    {(lead.status === 'dispatched' || lead.status === 'acknowledged') && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(lead.id, 'in_consultation')}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Accept & Process</span>
                      </Button>
                    )}

                    {lead.status !== 'completed' && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(lead.id, 'completed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Completed</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

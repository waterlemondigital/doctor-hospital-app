import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  Stethoscope,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { TargetDoctor, TargetHospital, TargetType } from '../types';
import { toggleTargetPortalAccount } from '../api/client';

interface TargetDirectoryProps {
  doctors: TargetDoctor[];
  hospitals: TargetHospital[];
  onPreviewTarget: (type: TargetType, id: string, name: string) => void;
  onTargetsUpdated: () => void;
}

export function TargetDirectory({
  doctors,
  hospitals,
  onPreviewTarget,
  onTargetsUpdated,
}: TargetDirectoryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'doctors' | 'hospitals'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [accountStatusFilter, setAccountStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const combinedTargets = useMemo(() => {
    let list: (TargetDoctor | TargetHospital)[] = [];
    if (activeTab === 'all' || activeTab === 'doctors') {
      list = [...list, ...doctors];
    }
    if (activeTab === 'all' || activeTab === 'hospitals') {
      list = [...list, ...hospitals];
    }

    const q = searchQuery.toLowerCase().trim();

    return list.filter((target) => {
      const isDoc = target.type === 'doctor';
      const doc = isDoc ? (target as TargetDoctor) : null;
      const hosp = !isDoc ? (target as TargetHospital) : null;

      const matchesSearch =
        !q ||
        target.name.toLowerCase().includes(q) ||
        target.city.toLowerCase().includes(q) ||
        target.area.toLowerCase().includes(q) ||
        (doc && doc.speciality.toLowerCase().includes(q)) ||
        (doc && doc.department.toLowerCase().includes(q)) ||
        (hosp && hosp.facilityType.toLowerCase().includes(q));

      const matchesStatus =
        accountStatusFilter === 'all' ||
        (accountStatusFilter === 'active' && target.dashboardAccessEnabled) ||
        (accountStatusFilter === 'pending' && !target.dashboardAccessEnabled);

      return matchesSearch && matchesStatus;
    });
  }, [doctors, hospitals, activeTab, searchQuery, accountStatusFilter]);

  const handleToggleAccount = async (target: TargetDoctor | TargetHospital) => {
    const newStatus = !target.dashboardAccessEnabled;
    setTogglingId(target.id);
    try {
      const res = await toggleTargetPortalAccount({
        targetType: target.type,
        targetId: target.id,
        targetName: target.name,
        dashboardAccessEnabled: newStatus,
        accountStatus: newStatus ? 'active' : 'pending',
      });
      target.dashboardAccessEnabled = newStatus;
      target.hasPortalAccount = true;
      target.portalAccountStatus = newStatus ? 'active' : 'pending';
      toast.success(res.message);
      onTargetsUpdated();
    } catch (err: any) {
      toast.error('Failed to update portal status: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search targets by doctor name, speciality, hospital name, location..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
            />
          </div>

          {/* Target Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-[#03045e] shadow-2xs'
                  : 'text-slate-600 hover:text-[#03045e]'
              }`}
            >
              All ({doctors.length + hospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'doctors'
                  ? 'bg-white text-[#0077b6] shadow-2xs'
                  : 'text-slate-600 hover:text-[#03045e]'
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Doctors ({doctors.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'hospitals'
                  ? 'bg-white text-[#0077b6] shadow-2xs'
                  : 'text-slate-600 hover:text-[#03045e]'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Hospitals ({hospitals.length})</span>
            </button>
          </div>
        </div>

        {/* Account Status Filter */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-500">Portal Readiness:</span>
          {(['all', 'active', 'pending'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setAccountStatusFilter(filter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-all border ${
                accountStatusFilter === filter
                  ? 'bg-[#caf0f8] text-[#03045e] border-[#90e0ef] font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {filter === 'all' ? 'All Account Statuses' : filter === 'active' ? 'Portal Active & Visible' : 'Pending Setup'}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combinedTargets.map((target) => {
          const isDoc = target.type === 'doctor';
          const doc = isDoc ? (target as TargetDoctor) : null;
          const hosp = !isDoc ? (target as TargetHospital) : null;
          const isToggling = togglingId === target.id;
          const isPortalActive = target.dashboardAccessEnabled;

          return (
            <div
              key={target.id}
              className={`rounded-2xl border p-5 bg-white shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                isPortalActive ? 'border-slate-200 hover:border-[#90e0ef]' : 'border-amber-200/80 bg-amber-50/20'
              }`}
            >
              {/* Header: Photo + Name + Type */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {isDoc ? (
                    doc?.photo ? (
                      <img
                        src={doc.photo}
                        alt={doc.name}
                        className="h-14 w-14 rounded-full object-cover border-2 border-[#90e0ef] shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-[#caf0f8] text-[#03045e] font-extrabold flex items-center justify-center shrink-0 text-base">
                        {doc?.name.slice(0, 2).toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0077b6] to-[#03045e] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Building2 className="h-7 w-7 text-[#90e0ef]" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {target.type}
                      </span>

                      {/* Lead Count Pill */}
                      {target.leadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#caf0f8] text-[#0077b6]">
                          {target.leadCount} Active {target.leadCount === 1 ? 'Lead' : 'Leads'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#03045e] leading-snug line-clamp-1" title={target.name}>
                      {target.name}
                    </h3>

                    <p className="text-xs font-semibold text-[#0077b6] line-clamp-1">
                      {isDoc ? doc?.speciality : hosp?.facilityType}
                    </p>
                  </div>
                </div>

                {/* Sub details */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
                    <span className="truncate">
                      {target.city} {target.area ? `• ${target.area}` : ''}
                    </span>
                  </div>

                  {isDoc && (
                    <>
                      {doc?.experienceYears && (
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Activity className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
                          <span>Experience: {doc.experienceYears}</span>
                        </div>
                      )}
                      {(doc?.medicalRegNo || doc?.qualifications) && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{doc?.medicalRegNo ? `Reg: ${doc.medicalRegNo}` : doc?.qualifications}</span>
                        </div>
                      )}
                      {(doc?.clinicAddress || doc?.primaryHospital) && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Clinic: {doc?.clinicAddress || doc?.primaryHospital}</span>
                        </div>
                      )}
                    </>
                  )}

                  {!isDoc && hosp?.bedCount && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Capacity: {hosp.bedCount}+ Inpatient Beds</span>
                    </div>
                  )}

                  {target.phone && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{target.phone} {isDoc && doc?.whatsapp ? `• WA: ${doc.whatsapp}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer: Portal Readiness & Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Dashboard Access:</span>
                  {isPortalActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" /> Enabled & Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <ShieldAlert className="h-3 w-3" /> Pending Setup
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggleAccount(target)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isPortalActive
                        ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs'
                    }`}
                  >
                    {isToggling ? 'Updating...' : isPortalActive ? 'Revoke Portal' : 'Grant Dashboard'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onPreviewTarget(target.type, target.id, target.name)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-[#0077b6] hover:bg-[#caf0f8]/30 text-slate-600 hover:text-[#0077b6] transition-colors cursor-pointer"
                    title="Simulate target doctor/hospital portal view"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

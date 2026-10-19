import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  Building2,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
  X,
  ExternalLink,
  Copy,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { PatientLead, LeadStatus, TargetType } from '../types';
import { updateLeadStatus } from '../api/client';
import { formatDateTime } from '../lib/utils';

interface LeadsPipelineProps {
  leads: PatientLead[];
  onLeadUpdated: (lead: PatientLead) => void;
  onPreviewTarget: (type: TargetType, id: string, name: string) => void;
}

export function LeadsPipeline({ leads, onLeadUpdated, onPreviewTarget }: LeadsPipelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTargetType, setSelectedTargetType] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<PatientLead | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.patient_name.toLowerCase().includes(q) ||
        lead.patient_phone.toLowerCase().includes(q) ||
        lead.target_name.toLowerCase().includes(q) ||
        lead.id.toLowerCase().includes(q) ||
        lead.speciality.toLowerCase().includes(q);

      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
      const matchesType = selectedTargetType === 'all' || lead.target_type === selectedTargetType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leads, searchQuery, selectedStatus, selectedTargetType]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingId(leadId);
    try {
      const updated = await updateLeadStatus(leadId, newStatus);
      onLeadUpdated(updated);
      toast.success(`Lead ${leadId} status updated to ${newStatus}`);
      if (selectedLead?.id === leadId) {
        setSelectedLead(updated);
      }
    } catch (err: any) {
      toast.error('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 text-[10px] font-extrabold uppercase animate-pulse">
            <Flame className="h-3 w-3" /> Critical Emergency
          </span>
        );
      case 'priority':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase">
            Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
            Routine OPD
          </span>
        );
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-[#0077b6] border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">
            Dispatched to Panel
          </span>
        );
      case 'acknowledged':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold">
            Acknowledged by Target
          </span>
        );
      case 'in_consultation':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold">
            In Consultation
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
            Consultation Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold">
            Closed / Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, phone, doctor, hospital, or lead ID..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
            />
          </div>

          {/* Target Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setSelectedTargetType('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                selectedTargetType === 'all'
                  ? 'bg-white text-[#03045e] shadow-2xs'
                  : 'text-slate-600 hover:text-[#03045e]'
              }`}
            >
              All Targets
            </button>
            <button
              onClick={() => setSelectedTargetType('doctor')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                selectedTargetType === 'doctor'
                  ? 'bg-white text-[#0077b6] shadow-2xs'
                  : 'text-slate-600 hover:text-[#03045e]'
              }`}
            >
              <Stethoscope className="h-3 w-3" /> Doctors
            </button>
            <button
              onClick={() => setSelectedTargetType('hospital')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                selectedTargetType === 'hospital'
                  ? 'bg-white text-[#0077b6] shadow-2xs'
                  : 'text-slate-600 hover:text-[#03045e]'
              }`}
            >
              <Building2 className="h-3 w-3" /> Hospitals
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
          {(['all', 'dispatched', 'acknowledged', 'in_consultation', 'completed', 'cancelled'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition-all border ${
                  selectedStatus === st
                    ? 'bg-[#0077b6] text-white border-[#0077b6] shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Leads List / Table */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <AlertTriangle className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[#03045e]">No Consultation Leads Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {leads.length === 0
              ? 'No patient consultations have been dispatched yet. Use the Inbound Consultation Desk to dispatch your first lead.'
              : 'No leads match your current search and status filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const isDoctor = lead.target_type === 'doctor';
            const isUpdating = updatingId === lead.id;

            return (
              <div
                key={lead.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-[#90e0ef] transition-all space-y-3"
              >
                {/* Header row: ID, Urgency, Status, Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#0077b6] bg-[#caf0f8]/50 px-2 py-0.5 rounded-md border border-[#90e0ef]/60">
                      {lead.id}
                    </span>
                    {getUrgencyBadge(lead.urgency)}
                    {getStatusBadge(lead.status)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Dispatched: {formatDateTime(lead.created_at)}</span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">By {lead.agent_name}</span>
                  </div>
                </div>

                {/* Body Row: Patient Details & Target Info */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Patient Info (5 cols) */}
                  <div className="md:col-span-5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400 shrink-0" />
                      <h4 className="text-sm font-extrabold text-[#03045e]">
                        {lead.patient_name}
                      </h4>
                      {lead.patient_age && (
                        <span className="text-xs text-slate-500 font-medium">
                          ({lead.patient_age}y, {lead.patient_gender})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                      <a
                        href={`tel:${lead.patient_phone}`}
                        className="inline-flex items-center gap-1 text-[#0077b6] hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{lead.patient_phone}</span>
                      </a>

                      {lead.patient_whatsapp && (
                        <a
                          href={`https://wa.me/${lead.patient_whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      Location: <strong>{lead.patient_city}</strong> {lead.patient_area ? `• ${lead.patient_area}` : ''}
                    </p>
                  </div>

                  {/* Medical Requirement (4 cols) */}
                  <div className="md:col-span-4 space-y-1 text-xs">
                    <span className="font-bold text-slate-700">Speciality: {lead.speciality}</span>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {lead.medical_concern}
                    </p>
                    {lead.preferred_date && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-0.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>Slot: {lead.preferred_date} ({lead.preferred_time || 'General'})</span>
                      </div>
                    )}
                  </div>

                  {/* Allocated Target Panel (3 cols) */}
                  <div className="md:col-span-3 rounded-xl bg-[#f0f9fc] border border-[#90e0ef]/70 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Assigned Target
                      </span>
                      <button
                        type="button"
                        onClick={() => onPreviewTarget(lead.target_type, lead.target_id, lead.target_name)}
                        className="text-[10px] font-bold text-[#0077b6] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Panel</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-[#03045e]">
                      {isDoctor ? (
                        <Stethoscope className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
                      )}
                      <span className="truncate">{lead.target_name}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>{lead.target_account_status === 'verified_active' ? 'Account Active' : 'Target Notified'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2.5 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    {lead.agent_notes && (
                      <span className="line-clamp-1 italic">Note: "{lead.agent_notes}"</span>
                    )}
                  </div>

                  {/* Status Updaters */}
                  <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Update Status:</span>

                    {lead.status === 'dispatched' && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(lead.id, 'acknowledged')}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}

                    {(lead.status === 'dispatched' || lead.status === 'acknowledged') && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(lead.id, 'in_consultation')}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                      >
                        In Consult
                      </button>
                    )}

                    {lead.status !== 'completed' && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(lead.id, 'completed')}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                      >
                        Completed
                      </button>
                    )}

                    {lead.status !== 'cancelled' && lead.status !== 'completed' && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(lead.id, 'cancelled')}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Close
                      </button>
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

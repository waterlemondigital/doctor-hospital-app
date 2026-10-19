import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  Building2,
  FlaskConical,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Flame,
  User,
  Inbox,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { TargetType, PatientLead } from '../types';
import { fetchTargetLeads, updateLeadStatus, toggleTargetPortalAccount } from '../api/client';
import { formatDateTime } from '../lib/utils';

interface TargetPortalModalProps {
  targetType: TargetType;
  targetId: string;
  targetName: string;
  onClose: () => void;
  onLeadUpdated: (lead: PatientLead) => void;
}

export function TargetPortalModal({
  targetType,
  targetId,
  targetName,
  onClose,
  onLeadUpdated,
}: TargetPortalModalProps) {
  const [leads, setLeads] = useState<PatientLead[]>([]);
  const [portalAccount, setPortalAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchTargetLeads(targetType, targetId)
      .then((data) => {
        if (isMounted) {
          setLeads(data.leads || []);
          setPortalAccount(data.portalAccount || null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [targetType, targetId]);

  const handleUpdateStatus = async (leadId: string, status: any) => {
    try {
      const updated = await updateLeadStatus(leadId, status);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      onLeadUpdated(updated);
      toast.success(`Patient lead marked as ${status}`);
    } catch (err: any) {
      toast.error('Failed to update lead: ' + err.message);
    }
  };

  const handleToggleAccess = async () => {
    setIsToggling(true);
    const newStatus = !portalAccount?.dashboard_access_enabled;
    try {
      const res = await toggleTargetPortalAccount({
        targetType,
        targetId,
        targetName,
        dashboardAccessEnabled: newStatus,
        accountStatus: newStatus ? 'active' : 'pending',
      });
      setPortalAccount(res.account);
      toast.success(res.message);
    } catch (err: any) {
      toast.error('Failed to toggle dashboard: ' + err.message);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white border border-[#90e0ef] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Top Target Panel Bar */}
        <div className="bg-[#03045e] p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              {targetType === 'doctor' ? (
                <Stethoscope className="h-6 w-6 text-[#90e0ef]" />
              ) : targetType === 'hospital' ? (
                <Building2 className="h-6 w-6 text-[#90e0ef]" />
              ) : targetType === 'laboratory' ? (
                <FlaskConical className="h-6 w-6 text-teal-300" />
              ) : (
                <Activity className="h-6 w-6 text-purple-300" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-white/20 text-[#caf0f8] px-2 py-0.5 rounded-md font-bold">
                  {targetType === 'doctor'
                    ? 'Doctor Portal View'
                    : targetType === 'hospital'
                    ? 'Hospital Center Dashboard'
                    : targetType === 'laboratory'
                    ? 'Laboratory Panel View'
                    : 'Wellness Center Dashboard'}
                </span>
                <span className="text-xs text-white/60">ID: {targetId}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-0.5">
                {targetName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {portalAccount?.dashboard_access_enabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Dashboard Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 text-xs font-bold">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Account Pending</span>
              </span>
            )}

            <button
              onClick={handleToggleAccess}
              disabled={isToggling}
              className="text-xs font-bold px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/20"
            >
              {isToggling ? '...' : portalAccount?.dashboard_access_enabled ? 'Revoke Access' : 'Enable Access'}
            </button>

            <button
              onClick={onClose}
              className="rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition-colors cursor-pointer ml-1"
              title="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Portal Body & Leads Inbox */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-[#0077b6]" />
              <h3 className="text-sm sm:text-base font-bold text-[#03045e]">
                Inbound Consultation Inquiries
              </h3>
              <span className="rounded-full bg-[#0077b6] text-white text-xs font-bold px-2 py-0.5">
                {leads.length}
              </span>
            </div>

            <p className="text-xs text-slate-500 hidden sm:block">
              Simulated view of what {targetName} receives on their terminal.
            </p>
          </div>

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0077b6] border-t-transparent mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Loading target inbox...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-[#03045e]">No Leads Assigned Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No patient consultations have been dispatched to {targetName} yet. Go to the Inbound Call Desk to route a new patient here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 hover:border-[#90e0ef] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#0077b6] bg-[#caf0f8] px-2 py-0.5 rounded">
                        {lead.id}
                      </span>
                      <span className="text-xs font-bold capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Status: {lead.status.replace('_', ' ')}
                      </span>
                      {lead.urgency === 'emergency' && (
                        <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                          <Flame className="h-3 w-3" /> Critical
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-slate-400">
                      Received: {formatDateTime(lead.created_at)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <h4 className="text-sm font-bold text-[#03045e]">
                          {lead.patient_name}
                        </h4>
                        {lead.patient_age && (
                          <span className="text-slate-500">
                            ({lead.patient_age} yrs, {lead.patient_gender})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 font-semibold text-xs">
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

                      <p className="text-slate-500">
                        Location: {lead.patient_city} {lead.patient_area ? `(${lead.patient_area})` : ''}
                      </p>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-[#03045e]">Chief Medical Concern:</span>
                      <p className="text-slate-600 leading-relaxed">
                        {lead.medical_concern}
                      </p>
                      {lead.preferred_date && (
                        <p className="text-[11px] text-slate-500 pt-1">
                          Preferred Slot: <strong>{lead.preferred_date}</strong> ({lead.preferred_time})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Doctor/Hospital Portal Action Controls */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {lead.status === 'dispatched' && (
                      <button
                        onClick={() => handleUpdateStatus(lead.id, 'acknowledged')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                      >
                        Acknowledge Inquiry
                      </button>
                    )}

                    {lead.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(lead.id, 'in_consultation')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                      >
                        Schedule / In Consult
                      </button>
                    )}

                    {lead.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(lead.id, 'completed')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
                      >
                        Mark Consult Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

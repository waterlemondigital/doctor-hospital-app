import React, { useState, useMemo } from 'react';
import {
  User,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Building2,
  Stethoscope,
  Send,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Zap,
  FlaskConical,
  Activity,
  FileCheck2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  TargetDoctor,
  TargetHospital,
  TargetLaboratory,
  TargetWellness,
  TargetType,
  UrgencyLevel,
  PatientLead,
} from '../types';
import { createPatientLead, toggleTargetPortalAccount } from '../api/client';

interface PatientDispatchFormProps {
  doctors: TargetDoctor[];
  hospitals: TargetHospital[];
  laboratories?: TargetLaboratory[];
  wellness?: TargetWellness[];
  onLeadCreated: (lead: PatientLead) => void;
  onPreviewTarget: (type: TargetType, id: string, name: string) => void;
}

const COMMON_SPECIALITIES = [
  'General Medicine',
  'Cardiology',
  'Cardiac Surgery',
  'Neurology',
  'Neurosurgery',
  'Orthopedics',
  'Pediatrics',
  'Oncology',
  'Gastroenterology',
  'Gynecology & Obstetrics',
  'Nephrology & Urology',
  'Dermatology',
  'ENT',
  'Pulmonology',
];

const COMMON_CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai'];

export function PatientDispatchForm({
  doctors,
  hospitals,
  laboratories = [],
  wellness = [],
  onLeadCreated,
  onPreviewTarget,
}: PatientDispatchFormProps) {
  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientWhatsapp, setPatientWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientCity, setPatientCity] = useState('Pune');
  const [patientArea, setPatientArea] = useState('');
  const [medicalConcern, setMedicalConcern] = useState('');
  const [speciality, setSpeciality] = useState('General Medicine');
  const [urgency, setUrgency] = useState<UrgencyLevel>('priority');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 01:00 PM)');
  const [agentNotes, setAgentNotes] = useState('');
  const [agentName, setAgentName] = useState('Call Desk Agent 01');

  // Target Selection State
  const [targetType, setTargetType] = useState<TargetType>('doctor');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [targetSearchQuery, setTargetSearchQuery] = useState('');
  const [filterSpecialityOnly, setFilterSpecialityOnly] = useState(false);

  // Submission & Success Modal State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedLead, setDispatchedLead] = useState<PatientLead | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Sync WhatsApp when toggle is checked
  const handlePhoneChange = (val: string) => {
    setPatientPhone(val);
    if (sameAsPhone) {
      setPatientWhatsapp(val);
    }
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setPatientWhatsapp(patientPhone);
    }
  };

  // Filter candidates based on targetType, search, and speciality
  const filteredCandidates = useMemo(() => {
    const query = targetSearchQuery.toLowerCase().trim();

    if (targetType === 'doctor') {
      return doctors.filter((doc) => {
        const matchesQuery =
          !query ||
          doc.name.toLowerCase().includes(query) ||
          doc.speciality.toLowerCase().includes(query) ||
          doc.city.toLowerCase().includes(query) ||
          doc.area.toLowerCase().includes(query);

        const matchesSpeciality =
          !filterSpecialityOnly ||
          doc.speciality.toLowerCase().includes(speciality.toLowerCase()) ||
          doc.department.toLowerCase().includes(speciality.toLowerCase());

        return matchesQuery && matchesSpeciality;
      });
    } else if (targetType === 'hospital') {
      return hospitals.filter((hosp) => {
        const matchesQuery =
          !query ||
          hosp.name.toLowerCase().includes(query) ||
          hosp.facilityType.toLowerCase().includes(query) ||
          hosp.city.toLowerCase().includes(query) ||
          hosp.area.toLowerCase().includes(query);

        return matchesQuery;
      });
    } else if (targetType === 'laboratory') {
      return laboratories.filter((lab) => {
        const matchesQuery =
          !query ||
          lab.name.toLowerCase().includes(query) ||
          lab.facilityType.toLowerCase().includes(query) ||
          lab.city.toLowerCase().includes(query) ||
          lab.area.toLowerCase().includes(query);

        return matchesQuery;
      });
    } else {
      return wellness.filter((well) => {
        const matchesQuery =
          !query ||
          well.name.toLowerCase().includes(query) ||
          well.facilityType.toLowerCase().includes(query) ||
          well.city.toLowerCase().includes(query) ||
          well.area.toLowerCase().includes(query);

        return matchesQuery;
      });
    }
  }, [doctors, hospitals, laboratories, wellness, targetType, targetSearchQuery, filterSpecialityOnly, speciality]);

  // Selected Target Object
  const selectedTarget = useMemo(() => {
    if (!selectedTargetId) return null;
    if (targetType === 'doctor') {
      return doctors.find((d) => d.id === selectedTargetId) || null;
    }
    if (targetType === 'hospital') {
      return hospitals.find((h) => h.id === selectedTargetId) || null;
    }
    if (targetType === 'laboratory') {
      return laboratories.find((l) => l.id === selectedTargetId) || null;
    }
    return wellness.find((w) => w.id === selectedTargetId) || null;
  }, [doctors, hospitals, laboratories, wellness, targetType, selectedTargetId]);

  // Quick Action to Enable/Activate Target's Portal Account
  const handleEnablePortalAccount = async (
    e: React.MouseEvent,
    target: TargetDoctor | TargetHospital | TargetLaboratory | TargetWellness
  ) => {
    e.stopPropagation();
    try {
      const res = await toggleTargetPortalAccount({
        targetType: target.type,
        targetId: target.id,
        targetName: target.name,
        dashboardAccessEnabled: true,
        accountStatus: 'active',
      });
      target.hasPortalAccount = true;
      target.dashboardAccessEnabled = true;
      target.portalAccountStatus = 'active';
      toast.success(res.message);
    } catch (err: any) {
      toast.error('Failed to enable account: ' + err.message);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    if (!patientPhone.trim()) {
      toast.error('Please enter patient contact number');
      return;
    }
    if (!medicalConcern.trim()) {
      toast.error('Please enter chief medical complaint / symptoms');
      return;
    }
    if (!selectedTarget) {
      toast.error('Please select a target doctor or hospital to route this lead');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createPatientLead({
        patientName,
        patientPhone,
        patientWhatsapp: sameAsPhone ? patientPhone : patientWhatsapp,
        patientEmail,
        patientAge: patientAge ? parseInt(patientAge, 10) : undefined,
        patientGender,
        patientCity,
        patientArea,
        medicalConcern,
        speciality,
        urgency,
        preferredDate,
        preferredTime,
        targetType,
        targetId: selectedTarget.id,
        targetName: selectedTarget.name,
        agentNotes,
        agentName,
      });

      toast.success(response.message);
      setDispatchedLead(response.lead);
      onLeadCreated(response.lead);
    } catch (err: any) {
      console.error(err);
      toast.error('Dispatch failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNextCall = () => {
    setPatientName('');
    setPatientPhone('');
    setPatientWhatsapp('');
    setPatientEmail('');
    setPatientAge('');
    setPatientArea('');
    setMedicalConcern('');
    setAgentNotes('');
    setSelectedTargetId('');
    setDispatchedLead(null);
  };

  const getWhatsAppMessageText = (lead: PatientLead) => {
    return `*MedVexa Patient Consultation Referral*\n\n` +
      `*Patient Name:* ${lead.patient_name}\n` +
      `*Contact:* ${lead.patient_phone}\n` +
      `*Location:* ${lead.patient_city} ${lead.patient_area ? `(${lead.patient_area})` : ''}\n` +
      `*Urgency:* ${lead.urgency.toUpperCase()}\n` +
      `*Clinical Speciality:* ${lead.speciality}\n` +
      `*Chief Concern:* ${lead.medical_concern}\n` +
      `*Preferred Date:* ${lead.preferred_date || 'Earliest available'}\n` +
      `*Assigned Target:* ${lead.target_name} (${lead.target_type === 'doctor' ? 'Doctor Specialist' : 'Hospital Center'})\n` +
      `*Lead ID:* ${lead.id}\n\n` +
      `*Agent Note:* ${lead.agent_notes || 'Patient screened and waiting for consultation confirmation.'}`;
  };

  const handleCopyWhatsApp = () => {
    if (!dispatchedLead) return;
    navigator.clipboard.writeText(getWhatsAppMessageText(dispatchedLead));
    setCopiedWhatsApp(true);
    toast.success('Consultation referral message copied to clipboard!');
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Agent Call Status Notice Banner */}
      <div className="rounded-2xl border border-[#90e0ef]/80 bg-gradient-to-r from-[#caf0f8]/50 via-white to-[#caf0f8]/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0077b6] text-white flex items-center justify-center shadow-xs shrink-0">
            <Phone className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#03045e] flex items-center gap-2">
              <span>Inbound Patient Consultation Desk</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Live Intake Form
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Collect patient details on the call, allocate target doctor or hospital, and route directly to their panel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Agent:</span>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="text-xs font-bold text-[#03045e] bg-white border border-[#90e0ef] rounded-lg px-2.5 py-1 w-40 focus:ring-2 focus:ring-[#0077b6] focus:outline-none"
            placeholder="Agent Name"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Patient Info & Medical Triage (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1: Patient Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#03045e] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0077b6] text-white text-[11px] font-bold">
                    1
                  </span>
                  <span>Patient Demographic & Contact</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">* Required</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Rahul Deshmukh"
                      className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="e.g. +91 98220 12345"
                        className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">WhatsApp</label>
                      <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameAsPhone}
                          onChange={(e) => handleSameAsPhoneToggle(e.target.checked)}
                          className="rounded text-[#0077b6] focus:ring-0"
                        />
                        <span>Same</span>
                      </label>
                    </div>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        disabled={sameAsPhone}
                        value={patientWhatsapp}
                        onChange={(e) => setPatientWhatsapp(e.target.value)}
                        placeholder="WhatsApp Number"
                        className={`w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none ${
                          sameAsPhone ? 'bg-slate-50 text-slate-500' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="e.g. 42"
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Child / Infant">Child / Infant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <select
                      value={patientCity}
                      onChange={(e) => setPatientCity(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none bg-white"
                    >
                      {COMMON_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      value={patientArea}
                      onChange={(e) => setPatientArea(e.target.value)}
                      placeholder="e.g. Shivaji Nagar"
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Clinical Concern & Triage */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#03045e] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0077b6] text-white text-[11px] font-bold">
                    2
                  </span>
                  <span>Clinical Complaint & Triage</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Triage Protocol</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chief Complaint / Symptoms *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={medicalConcern}
                    onChange={(e) => setMedicalConcern(e.target.value)}
                    placeholder="Describe patient's symptoms, duration, prior diagnoses, or specific consultation requirement..."
                    className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Required Speciality
                    </label>
                    <select
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      className="w-full text-xs font-semibold text-[#03045e] px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none bg-white"
                    >
                      {COMMON_SPECIALITIES.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Urgency Level
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setUrgency('routine')}
                        className={`text-center py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
                          urgency === 'routine'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        Routine
                      </button>

                      <button
                        type="button"
                        onClick={() => setUrgency('priority')}
                        className={`text-center py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
                          urgency === 'priority'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        Priority
                      </button>

                      <button
                        type="button"
                        onClick={() => setUrgency('emergency')}
                        className={`text-center py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
                          urgency === 'emergency'
                            ? 'bg-red-600 text-white border-red-600 shadow-2xs animate-pulse'
                            : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        Critical
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Consultation Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Internal Agent Remarks / Insurance Notes
                  </label>
                  <input
                    type="text"
                    value={agentNotes}
                    onChange={(e) => setAgentNotes(e.target.value)}
                    placeholder="e.g. Has Star Health policy, patient requested female gynecologist"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Target Allocation & Readiness Engine (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <h3 className="text-sm font-bold text-[#03045e] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0077b6] text-white text-[11px] font-bold">
                    3
                  </span>
                  <span>Target Allocation & Portal Readiness</span>
                </h3>

                {/* Target Type Toggle */}
                <div className="flex items-center flex-wrap rounded-xl bg-slate-100 p-1 border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('doctor');
                      setSelectedTargetId('');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetType === 'doctor'
                        ? 'bg-[#0077b6] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#03045e]'
                    }`}
                  >
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>Doctor ({doctors.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('hospital');
                      setSelectedTargetId('');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetType === 'hospital'
                        ? 'bg-[#0077b6] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#03045e]'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Hospital ({hospitals.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('laboratory');
                      setSelectedTargetId('');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetType === 'laboratory'
                        ? 'bg-[#0077b6] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#03045e]'
                    }`}
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    <span>Lab ({laboratories.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('wellness');
                      setSelectedTargetId('');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetType === 'wellness'
                        ? 'bg-[#0077b6] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#03045e]'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>Wellness ({wellness.length})</span>
                  </button>
                </div>
              </div>

              {/* Target Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={targetSearchQuery}
                    onChange={(e) => setTargetSearchQuery(e.target.value)}
                    placeholder={`Search ${
                      targetType === 'doctor'
                        ? 'doctor by name, speciality, hospital...'
                        : targetType === 'hospital'
                        ? 'hospital by name, area...'
                        : targetType === 'laboratory'
                        ? 'lab by name, city, area...'
                        : 'wellness center by name, city...'
                    }`}
                    className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
                  />
                </div>

                {targetType === 'doctor' && (
                  <button
                    type="button"
                    onClick={() => setFilterSpecialityOnly(!filterSpecialityOnly)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                      filterSpecialityOnly
                        ? 'bg-[#caf0f8] text-[#03045e] border-[#90e0ef]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5 text-[#0077b6]" />
                    <span>Match "{speciality}"</span>
                  </button>
                )}
              </div>

              {/* Target Candidate List */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredCandidates.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                    <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No matching targets found</p>
                    <p className="text-[11px] text-slate-400">Try clearing search filters</p>
                  </div>
                ) : (
                  filteredCandidates.map((cand) => {
                    const isSelected = selectedTargetId === cand.id;
                    const isDoctor = cand.type === 'doctor';
                    const isHospital = cand.type === 'hospital';
                    const isLab = cand.type === 'laboratory';
                    const isWellness = cand.type === 'wellness';
                    const hasPortal = cand.dashboardAccessEnabled;

                    return (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedTargetId(cand.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#0077b6] bg-[#caf0f8]/30 shadow-xs ring-2 ring-[#0077b6]/30'
                            : 'border-slate-200 hover:border-[#90e0ef] hover:bg-slate-50/70 bg-white'
                        }`}
                      >
                        {/* Target Avatar / Cover + Info */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {isDoctor ? (
                            cand.photo ? (
                              <img
                                src={cand.photo}
                                alt={cand.name}
                                className="h-12 w-12 rounded-full object-cover border border-[#90e0ef] shrink-0"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-[#caf0f8] text-[#03045e] font-bold flex items-center justify-center shrink-0 text-sm">
                                {cand.name.slice(0, 2).toUpperCase()}
                              </div>
                            )
                          ) : isHospital ? (
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0077b6] to-[#03045e] text-white flex items-center justify-center shrink-0">
                              <Building2 className="h-6 w-6 text-[#90e0ef]" />
                            </div>
                          ) : isLab ? (
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 text-white flex items-center justify-center shrink-0">
                              <FlaskConical className="h-6 w-6 text-teal-200" />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-800 text-white flex items-center justify-center shrink-0">
                              <Activity className="h-6 w-6 text-purple-200" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-[#03045e] truncate">
                                {cand.name}
                              </h4>

                              {/* Portal Account Readiness Pill */}
                              {hasPortal ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                  <span>Portal Active</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  <span>Pending Portal</span>
                                </span>
                              )}

                              {/* Verification PDF Badge if uploaded to R2 */}
                              {(cand as any).registrationCertUrl && (
                                <a
                                  href={(cand as any).registrationCertUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-sky-700 hover:bg-sky-100"
                                  title="View Operating Licence / Reg Certificate PDF in R2"
                                >
                                  <FileCheck2 className="h-3 w-3 text-sky-600" />
                                  <span>R2 Licence PDF</span>
                                </a>
                              )}

                              {(cand as any).addressProofUrl && (
                                <a
                                  href={(cand as any).addressProofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 rounded-md bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-bold text-violet-700 hover:bg-violet-100"
                                  title="View Address Proof PDF in R2"
                                >
                                  <FileCheck2 className="h-3 w-3 text-violet-600" />
                                  <span>R2 Address Proof</span>
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                              <span className="font-semibold text-[#0077b6]">
                                {isDoctor
                                  ? (cand as TargetDoctor).speciality
                                  : isHospital
                                  ? (cand as TargetHospital).facilityType
                                  : isLab
                                  ? (cand as TargetLaboratory).facilityType
                                  : (cand as TargetWellness).facilityType}
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-0.5">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                {cand.city} {cand.area ? `(${cand.area})` : ''}
                              </span>
                              {isDoctor && (cand as TargetDoctor).primaryHospital && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[140px] text-slate-600">
                                    {(cand as TargetDoctor).primaryHospital}
                                  </span>
                                </>
                              )}
                              {isHospital && (cand as TargetHospital).authorizedPersonName && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-600">
                                    Auth: {(cand as TargetHospital).authorizedPersonName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Actions: Enable Portal Account or Preview */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {!hasPortal && (
                            <button
                              type="button"
                              onClick={(e) => handleEnablePortalAccount(e, cand)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-2xs"
                              title="Enable doctor/hospital portal dashboard so lead is visible"
                            >
                              Activate Portal
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreviewTarget(cand.type, cand.id, cand.name);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0077b6] hover:border-[#0077b6] bg-white transition-colors cursor-pointer"
                            title="Preview target's panel inbox"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>

                          <div
                            className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#0077b6] bg-[#0077b6] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Target Confirmation Banner */}
              {selectedTarget && (
                <div className="rounded-xl border border-[#0077b6] bg-[#caf0f8]/40 p-4 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#0077b6]" />
                      <span className="text-xs font-bold text-[#03045e]">
                        Selected Target: {selectedTarget.name}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-600">
                      Type: <strong className="capitalize">{selectedTarget.type}</strong>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Lead will route directly to {selectedTarget.name}'s portal dashboard.
                    {selectedTarget.dashboardAccessEnabled
                      ? ' Account is verified and visible in their inbox.'
                      : ' Notice: Account is marked pending onboarding. Activated automatically upon dispatch.'}
                  </p>
                </div>
              )}

              {/* Dispatch Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTarget}
                  className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
                    selectedTarget && !isSubmitting
                      ? 'bg-[#0077b6] hover:bg-[#03045e] text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>
                    {isSubmitting
                      ? 'Routing Lead to Target Panel...'
                      : selectedTarget
                      ? `Dispatch Lead to ${selectedTarget.name}'s Panel`
                      : 'Select a Target Doctor or Hospital to Dispatch'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* DISPATCH SUCCESS CONFIRMATION MODAL */}
      {dispatchedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#90e0ef] shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#03045e]">
                  Consultation Lead Dispatched!
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Ref ID: <strong className="text-[#0077b6]">{dispatchedLead.id}</strong>
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500">Patient:</span>
                <strong className="text-[#03045e]">{dispatchedLead.patient_name} ({dispatchedLead.patient_phone})</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500">Target Dispatched:</span>
                <strong className="text-[#0077b6]">{dispatchedLead.target_name} ({dispatchedLead.target_type})</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500">Clinical Focus:</span>
                <span>{dispatchedLead.speciality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Urgency:</span>
                <span className="font-bold uppercase text-amber-700">{dispatchedLead.urgency}</span>
              </div>
            </div>

            {/* WhatsApp Referral Snippet for Agent */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>WhatsApp Referral Message for Target / Patient:</span>
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0077b6] hover:underline cursor-pointer"
                >
                  {copiedWhatsApp ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedWhatsApp ? 'Copied!' : 'Copy Template'}</span>
                </button>
              </label>
              <pre className="text-[11px] font-mono bg-slate-100 p-3 rounded-xl border border-slate-200 text-slate-600 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {getWhatsAppMessageText(dispatchedLead)}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onPreviewTarget(dispatchedLead.target_type, dispatchedLead.target_id, dispatchedLead.target_name);
                  setDispatchedLead(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#0077b6] hover:bg-[#caf0f8]/50 border border-[#90e0ef] transition-colors cursor-pointer"
              >
                View in Target's Panel
              </button>

              <button
                type="button"
                onClick={handleResetForNextCall}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0077b6] hover:bg-[#03045e] text-white shadow-xs transition-colors cursor-pointer"
              >
                Next Inbound Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

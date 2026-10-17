import * as React from 'react';
import { Phone, MessageSquare, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  CONTACT_PHONE,
  CONTACT_PHONE_CALL_HREF,
  CONTACT_WHATSAPP_CLEAN,
} from '../data/config';

const COUNTRIES = [
  'India',
  'United Arab Emirates',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Saudi Arabia',
  'Oman',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Singapore',
  'Germany',
  'Bangladesh',
  'Nepal',
  'Other Country',
];

export function HeroInquiryForm() {
  const [patientName, setPatientName] = React.useState('');
  const [country, setCountry] = React.useState('India');
  const [state, setState] = React.useState('');
  const [city, setCity] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const waPreFillMessage = encodeURIComponent(
    patientName
      ? `Hello, I would like medical assistance for patient ${patientName} from ${city || 'Pune'}, ${country}. Requirement: ${message || 'General consultation & appointment details'}.`
      : 'Hello, I would like medical guidance and appointment details for hospital admission.'
  );

  const waUrl = `https://wa.me/${CONTACT_WHATSAPP_CLEAN}?text=${waPreFillMessage}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    if (!state.trim()) {
      toast.error('Please enter state');
      return;
    }
    if (!city.trim()) {
      toast.error('Please enter city');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter your message or medical requirement');
      return;
    }

    setIsSubmitted(true);
    toast.success('Inquiry submitted successfully!', {
      description: `Thank you, ${patientName}. Our healthcare team will contact you shortly regarding care in ${city}, ${state}.`,
    });

    // Reset fields after successful submission
    setTimeout(() => {
      setPatientName('');
      setState('');
      setCity('');
      setMessage('');
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <div className="rounded-3xl border border-[#90e0ef] bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-lg space-y-4 text-left">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-[#03045e]">
            Patient Consultation & Guidance
          </h3>
          <p className="text-xs text-slate-500">
            Verified helpdesk · Quick specialist response
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#caf0f8] text-[#0077b6]">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      {/* Main Inquiry Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 1. Patient Name */}
        <div>
          <label className="block text-xs font-semibold text-[#03045e] mb-1">
            Patient Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-[#03045e] placeholder:text-slate-400 focus:outline-none focus:border-[#0077b6] focus:bg-white transition-colors font-medium"
          />
        </div>

        {/* 2. Country Select */}
        <div>
          <label className="block text-xs font-semibold text-[#03045e] mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-[#03045e] focus:outline-none focus:border-[#0077b6] focus:bg-white transition-colors font-medium cursor-pointer"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 3. State & City (2 Columns) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-[#03045e] mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Maharashtra"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-[#03045e] placeholder:text-slate-400 focus:outline-none focus:border-[#0077b6] focus:bg-white transition-colors font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#03045e] mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Pune"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-[#03045e] placeholder:text-slate-400 focus:outline-none focus:border-[#0077b6] focus:bg-white transition-colors font-medium"
            />
          </div>
        </div>

        {/* 4. Message */}
        <div>
          <label className="block text-xs font-semibold text-[#03045e] mb-1">
            Message / Medical Requirement <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your medical query, symptoms, or hospital preference..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-[#03045e] placeholder:text-slate-400 focus:outline-none focus:border-[#0077b6] focus:bg-white transition-colors font-medium resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitted}
          className="w-full h-10 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isSubmitted ? 'Inquiry Sent ✓' : 'Submit Consultation Request'}</span>
        </button>
      </form>

      {/* Two Direct Contact Options: Phone & WhatsApp */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
          Or Reach Out Directly
        </span>

        <div className="grid grid-cols-2 gap-2">
          {/* Option 1: Phone */}
          <a
            href={CONTACT_PHONE_CALL_HREF}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#caf0f8]/40 hover:border-[#0077b6] p-2.5 text-xs font-bold text-[#03045e] transition-colors shadow-2xs group"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-[#0077b6] group-hover:border-[#0077b6] shrink-0">
              <Phone className="h-3.5 w-3.5" />
            </div>
            <div className="text-left min-w-0">
              <span className="block text-[10px] text-slate-500 font-medium">Direct Call</span>
              <span className="block text-xs font-bold truncate text-[#03045e]">{CONTACT_PHONE}</span>
            </div>
          </a>

          {/* Option 2: WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 p-2.5 text-xs font-bold transition-colors shadow-2xs group"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <div className="text-left min-w-0">
              <span className="block text-[10px] text-emerald-700 font-medium">WhatsApp</span>
              <span className="block text-xs font-bold truncate text-emerald-950">{CONTACT_PHONE}</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

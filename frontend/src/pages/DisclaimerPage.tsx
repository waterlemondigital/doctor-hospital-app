import { Link } from 'react-router-dom';
import { AlertTriangle, PhoneCall, ShieldCheck, HeartHandshake } from 'lucide-react';
import { SITE_NAME, EMERGENCY_NUMBER, AMBULANCE_NUMBER } from '../data/config';
import { EmergencyNoticeCard } from '../components/EmergencyNoticeCard';
import { Button } from '../components/ui/button';

export function DisclaimerPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-0.5 text-xs font-bold text-red-800">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Statutory Medical Notice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#03045e] tracking-tight">
          Medical Disclaimer & Public Notice
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Please read this statutory notice carefully before using {SITE_NAME}. By accessing this directory, you acknowledge and agree to the terms outlined below.
        </p>
      </div>

      {/* Emergency Alert Box */}
      <EmergencyNoticeCard />

      {/* Key Clauses */}
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <h2 className="text-base font-bold text-[#03045e]">
            1. Informational Directory Purpose Only
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {SITE_NAME} is an informational directory service intended exclusively for general public awareness regarding hospital infrastructure, clinical departments, and consulting doctors in Pune, Maharashtra. The content provided on this website does not constitute medical advice, diagnosis, treatment recommendations, or clinical prognoses.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <h2 className="text-base font-bold text-[#03045e]">
            2. No Doctor-Patient Relationship
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Browsing this directory, reading provider information, or submitting general administrative inquiry forms through {SITE_NAME} does <strong>not</strong> establish a doctor-patient, therapist-patient, or clinical confidential relationship of any kind. A clinical doctor-patient relationship is established solely through formal clinical registration and consultation directly at a licensed medical institution.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <h2 className="text-base font-bold text-[#03045e]">
            3. Zero Clinical Diagnosis Tools or Booking Guarantees
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {SITE_NAME} does not operate automated diagnostic engines, symptom checkers, or telemedicine treatment algorithms. Furthermore, this website does not guarantee bed availability, specific doctor availability, or emergency admittance. All operational decisions rest exclusively with the respective hospital authorities.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <h2 className="text-base font-bold text-[#03045e]">
            4. Absence of Commercial Rankings or Endorsements
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            We do not accept payments, commissions, or sponsorship fees to alter search placement, assign promotional &ldquo;top doctor&rdquo; labels, or manipulate healthcare information. Any sponsored advertisement spaces are distinctly labeled with dashed borders and separate &ldquo;Advertisement&rdquo; tags.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <h2 className="text-base font-bold text-[#03045e]">
            5. Verification Limits & User Responsibility
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            While we apply rigorous multi-step checks against official registries (such as the Maharashtra Medical Council and Pune Municipal Corporation), clinical schedules and emergency capabilities can change without advance notice. Users are strongly urged to verify critical timing directly with the facility reception prior to visiting.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button asChild variant="default" className="bg-[#0077b6]">
          <Link to="/">Return to Homepage</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/about">Learn How We Verify</Link>
        </Button>
      </div>
    </div>
  );
}

import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Search,
  Scale,
  CalendarCheck,
  Flag,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';
import { SITE_NAME, SUPPORT_EMAIL } from '../data/config';
import { Button } from '../components/ui/button';

export function AboutPage() {
  const openCorrectionDialog = () => {
    window.dispatchEvent(
      new CustomEvent('open-correction-dialog', {
        detail: { subject: 'Verification Inquiry' },
      })
    );
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#caf0f8] px-3 py-0.5 text-xs font-bold text-[#0077b6]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Editorial Standards & Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#03045e] tracking-tight">
          How We Verify Healthcare Information
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          {SITE_NAME} is an objective, non-commercial healthcare discovery directory. We believe patients and families deserve straightforward, verified facts without algorithmic rating manipulation or sponsored bias.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[#90e0ef]/80 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#caf0f8] text-[#0077b6]">
            <Scale className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#03045e]">
            Zero Star Ratings or Rankings
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Healthcare outcomes cannot be simplified into 5-star commercial review widgets. We never rank doctors or label any institution as &ldquo;the best&rdquo;.
          </p>
        </div>

        <div className="rounded-2xl border border-[#90e0ef]/80 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#caf0f8] text-[#0077b6]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#03045e]">
            Statutory Council Citations
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Medical practitioners are verified against the Maharashtra Medical Council (MMC) and National Medical Commission (NMC) Indian Medical Register.
          </p>
        </div>

        <div className="rounded-2xl border border-[#90e0ef]/80 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#caf0f8] text-[#0077b6]">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#03045e]">
            Transparent Audit Timestamps
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every profile item lists the exact date it was verified against official sources so visitors know the currency of the information.
          </p>
        </div>
      </div>

      {/* Verification Protocol Stages */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-[#03045e]">
          The 4-Step Verification Workflow
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0077b6] text-white font-bold text-xs">
              01
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#03045e]">Facility Licensing & Registration</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We cross-check hospital registrations with the Pune Municipal Corporation (PMC) Health Department and the Directorate of Medical Education and Research (DMER) Maharashtra.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0077b6] text-white font-bold text-xs">
              02
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#03045e]">Doctor Credentials & Registration Numbers</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Degrees (MBBS, MD, DM, etc.) and council registration are verified via publicly accessible council registers prior to profile publication.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0077b6] text-white font-bold text-xs">
              03
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#03045e]">Operational Hours & Emergency Bay Checks</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct telephone checks confirm whether emergency bays are 24x7 operational, and whether regular outpatient departments (OPD) follow published schedules.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0077b6] text-white font-bold text-xs">
              04
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#03045e]">Continuous Community Error Reporting</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Healthcare changes rapidly. We provide an immediate correction workflow where hospital administrators or visitors can flag shifts in clinical schedules or contact numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="rounded-3xl bg-[#caf0f8]/40 border border-[#90e0ef] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl text-center sm:text-left">
          <h3 className="text-lg font-bold text-[#03045e]">
            Are you a healthcare provider in Pune?
          </h3>
          <p className="text-xs text-slate-600">
            Ensure your facility departments or outpatient consulting schedules are up to date. You can request corrections or submit verified documentation directly.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCorrectionDialog}
          variant="default"
          className="bg-[#0077b6] hover:bg-[#03045e] shrink-0 gap-2"
        >
          <Flag className="h-4 w-4" />
          <span>Submit a Correction</span>
        </Button>
      </section>
    </div>
  );
}

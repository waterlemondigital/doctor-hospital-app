import { Link } from 'react-router-dom';
import { HeartPulse, ShieldAlert, Mail, MapPin, Phone } from 'lucide-react';
import { SITE_NAME, SUPPORT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_CALL_HREF } from '../data/config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#03045e] text-white pt-14 pb-10 border-t border-[#0077b6]/40">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0077b6] text-white">
                <HeartPulse className="h-4 w-4 text-[#caf0f8]" />
              </div>
              <span>{SITE_NAME}</span>
            </Link>
            <p className="text-xs text-[#caf0f8]/80 leading-relaxed">
              An independent, verified healthcare directory for patients and families. Factual facilities, registered credentials, and zero sponsored rankings.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#90e0ef]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>Pune, Maharashtra, India</span>
            </div>
          </div>

          {/* Directory Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#90e0ef]">
              Directory
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <Link to="/hospitals" className="hover:text-[#90e0ef] transition-colors">
                  Hospitals in Pune
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-[#90e0ef] transition-colors">
                  Consulting Doctors
                </Link>
              </li>
              <li>
                <Link to="/hospitals/sahyadri-hospital-pune" className="hover:text-[#90e0ef] transition-colors">
                  Sahyadri Super Speciality
                </Link>
              </li>
              <li>
                <Link to="/hospitals/sassoon-general-hospital-pune" className="hover:text-[#90e0ef] transition-colors">
                  Sassoon General Hospital
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Ethics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#90e0ef]">
              Integrity & Trust
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <Link to="/about" className="hover:text-[#90e0ef] transition-colors">
                  How We Verify Information
                </Link>
              </li>
              <li>
                <Link to="/medical-disclaimer" className="hover:text-[#90e0ef] transition-colors">
                  Medical Disclaimer
                </Link>
              </li>
              <li>
                <a
                  href="#corrections"
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('open-correction-dialog'));
                  }}
                  className="hover:text-[#90e0ef] transition-colors"
                >
                  Report an Error / Correction
                </a>
              </li>
              <li>
                <span className="text-white/50 cursor-not-allowed">
                  Independent Audit Log (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Emergency Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#90e0ef]">
              Support & Helpdesk
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              For appointments, facility guidance, and direct inquiries:
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={CONTACT_PHONE_CALL_HREF}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#90e0ef] hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call / WhatsApp: {CONTACT_PHONE}</span>
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#90e0ef] hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>{SUPPORT_EMAIL}</span>
              </a>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-red-200">
              <span className="font-bold text-red-300 flex items-center gap-1 mb-1">
                <ShieldAlert className="h-3 w-3" /> Urgent Medical Need?
              </span>
              Do not email. Dial 112 or visit the nearest emergency room immediately.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p className="text-center md:text-left">
            Information is for general awareness only and is not medical advice.
          </p>
          <p className="text-center md:text-right">
            &copy; {currentYear} {SITE_NAME}. All rights reserved. Built for public awareness in Pune, Maharashtra.
          </p>
        </div>
      </div>
    </footer>
  );
}

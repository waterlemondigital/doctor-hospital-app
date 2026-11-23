import { Phone, MessageSquare, Send, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  CONTACT_PHONE,
  CONTACT_PHONE_CLEAN,
  CONTACT_WHATSAPP_CLEAN,
} from '../data/config';

interface ContactActionsBarProps {
  phone?: string;
  whatsapp?: string;
  targetName: string;
  targetType: 'hospital' | 'doctor';
  onOpenQuery: () => void;
  className?: string;
  stickyOnMobile?: boolean;
}

export function ContactActionsBar({
  targetName,
  targetType,
  onOpenQuery,
  className,
  stickyOnMobile = true,
}: ContactActionsBarProps) {
  const displayPhone = CONTACT_PHONE;
  const sanitizedPhone = CONTACT_PHONE_CLEAN;
  const cleanWaNumber = CONTACT_WHATSAPP_CLEAN;

  const waMessage = encodeURIComponent(
    `Hello, I am reaching out regarding ${targetName}. I would like visiting hours, consultation guidance, and appointment details.`
  );

  const waUrl = `https://wa.me/${cleanWaNumber}?text=${waMessage}`;

  return (
    <>
      {/* Desktop / In-Page Card presentation */}
      <div
        className={cn(
          'rounded-2xl border border-[#90e0ef] bg-white p-5 shadow-sm space-y-4',
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-[#03045e]">
              Direct Contact & Inquiries
            </h4>
            <p className="text-xs text-slate-500">
              Verified support desk · Guidance & visiting hours
            </p>
          </div>
          <ShieldCheck className="h-4 w-4 text-[#0077b6]" />
        </div>

        {/* Action Options: Strictly one below another */}
        <div className="flex flex-col space-y-3 w-full">
          {/* 1. Call Link */}
          <a
            href={`tel:${sanitizedPhone}`}
            className="flex items-center justify-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-[#03045e] hover:border-[#0077b6] hover:bg-[#caf0f8]/30 transition-all shadow-xs w-full group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-[#0077b6] group-hover:border-[#0077b6] shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="block font-bold text-[#03045e]">Call Helpline</span>
              <span className="text-[11px] text-[#0077b6] font-semibold truncate block">{displayPhone}</span>
            </div>
          </a>

          {/* 2. WhatsApp Link */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs font-semibold text-emerald-900 hover:bg-emerald-100/80 transition-all shadow-xs w-full group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="block font-bold text-emerald-950">Message on WhatsApp</span>
              <span className="text-[11px] text-emerald-700 font-semibold truncate block">{displayPhone} · Quick assistance</span>
            </div>
          </a>

          {/* 3. Send Query Modal Button */}
          <button
            type="button"
            onClick={onOpenQuery}
            className="flex items-center justify-start gap-3 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white p-3 text-xs font-semibold transition-all shadow-xs w-full group cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white shrink-0">
              <Send className="h-4 w-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="block font-bold text-white">Send a Non-Clinical Query</span>
              <span className="text-[11px] text-[#caf0f8] font-normal truncate block">Submit inquiry to our verified desk</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <Clock className="h-3 w-3 text-slate-400 shrink-0" />
          <span>Inquiries answered during business hours (09:00 - 18:00 IST).</span>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (When stickyOnMobile is true) */}
      {stickyOnMobile && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#90e0ef] px-4 py-3 shadow-lg">
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            <a
              href={`tel:${sanitizedPhone}`}
              className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-100 text-[#03045e] text-[11px] font-semibold active:bg-[#caf0f8]"
            >
              <Phone className="h-4 w-4 text-[#0077b6]" />
              <span>Call</span>
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold active:bg-emerald-100 border border-emerald-200"
            >
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onOpenQuery}
              className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-[#0077b6] text-white text-[11px] font-semibold active:bg-[#03045e]"
            >
              <Send className="h-4 w-4" />
              <span>Query</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

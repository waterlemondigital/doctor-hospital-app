import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { EMERGENCY_NUMBER, AMBULANCE_NUMBER } from '../data/config';

interface EmergencyNoticeCardProps {
  className?: string;
  facilityPhone?: string;
  facilityName?: string;
}

export function EmergencyNoticeCard({ className }: EmergencyNoticeCardProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-xs transition-colors',
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="rounded-xl bg-red-600 p-2 text-white shrink-0 shadow-xs">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-red-950">
              Emergency Guidance (India)
            </h4>
            <span className="rounded-md bg-red-200/80 px-2 py-0.5 text-xs font-bold text-red-900">
              Dial {EMERGENCY_NUMBER} or {AMBULANCE_NUMBER}
            </span>
          </div>
          <p className="text-sm text-red-900 leading-relaxed">
            For urgent situations, contact your local emergency services (<strong>{EMERGENCY_NUMBER}</strong> in India or Ambulance <strong>{AMBULANCE_NUMBER}</strong>) or proceed directly to the nearest emergency department. Do not wait for an electronic response or message reply from this directory website.
          </p>
        </div>
      </div>
    </div>
  );
}

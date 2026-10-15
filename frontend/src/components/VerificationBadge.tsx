import { CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { VerificationStatus } from '../types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  lastChecked?: string;
  className?: string;
  showDate?: boolean;
}

export function VerificationBadge({
  status,
  lastChecked,
  className,
  showDate = false,
}: VerificationBadgeProps) {
  const config = {
    'independently-checked': {
      icon: CheckCircle2,
      label: 'Independently checked',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      iconColor: 'text-emerald-600',
    },
    'provider-confirmed': {
      icon: ShieldCheck,
      label: 'Provider-confirmed',
      classes: 'bg-sky-50 text-[#0077b6] border-sky-300',
      iconColor: 'text-[#0077b6]',
    },
    'unverified': {
      icon: HelpCircle,
      label: 'Pending audit',
      classes: 'bg-amber-50 text-amber-800 border-amber-300',
      iconColor: 'text-amber-600',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-tight shadow-2xs',
        config.classes,
        className
      )}
      title={
        lastChecked
          ? `${config.label} (Verified on ${lastChecked})`
          : config.label
      }
    >
      <Icon className={cn('h-3.5 w-3.5 shrink-0', config.iconColor)} />
      <span>{config.label}</span>
      {showDate && lastChecked && (
        <>
          <span className="opacity-40" aria-hidden="true">·</span>
          <span className="font-normal opacity-85 text-[11px]">Checked {lastChecked}</span>
        </>
      )}
    </div>
  );
}

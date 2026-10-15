import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'verified' | 'provider' | 'unverified';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#0077b6] text-white',
    secondary: 'bg-[#caf0f8] text-[#03045e]',
    outline: 'border border-[#90e0ef] text-[#03045e] bg-white',
    verified: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-medium',
    provider: 'bg-sky-50 text-sky-800 border border-sky-300 font-medium',
    unverified: 'bg-amber-50 text-amber-800 border border-amber-300 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

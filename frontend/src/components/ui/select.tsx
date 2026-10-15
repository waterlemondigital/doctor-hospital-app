import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={cn(
            'flex h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-[#03045e] shadow-2xs transition-colors hover:border-[#0077b6] focus:border-[#0077b6] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            icon ? 'pl-9 pr-8' : 'pl-3.5 pr-8',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    );
  }
);
Select.displayName = 'Select';

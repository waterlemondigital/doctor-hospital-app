import * as React from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-semibold leading-none text-[#03045e] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 font-bold">*</span>}
    </label>
  );
}

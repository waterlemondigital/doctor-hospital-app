import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4d8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]';

    const variants = {
      default:
        'bg-[#0077b6] text-white shadow-sm hover:bg-[#023e8a] hover:shadow',
      secondary:
        'bg-[#caf0f8] text-[#03045e] hover:bg-[#90e0ef] shadow-xs',
      outline:
        'border border-[#90e0ef] bg-white text-[#03045e] hover:bg-[#caf0f8]/50 hover:border-[#0077b6]',
      ghost:
        'text-[#03045e] hover:bg-[#caf0f8]/50 hover:text-[#0077b6]',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      subtle:
        'bg-slate-100 text-slate-700 hover:bg-slate-200',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-12 rounded-xl px-6 text-base',
      icon: 'h-10 w-10',
    };

    const computedClass = cn(baseClasses, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      const childElement = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(childElement, {
        className: cn(computedClass, childElement.props.className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={computedClass}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

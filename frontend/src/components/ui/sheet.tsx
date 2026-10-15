import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Sheet({ open, onOpenChange, children, side = 'right' }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#03045e]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Slide-over panel */}
      <div
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col bg-white p-6 shadow-2xl transition-transform ease-in-out duration-300 w-full sm:max-w-sm',
          side === 'right' && 'right-0 border-l border-[#90e0ef] animate-in slide-in-from-right',
          side === 'left' && 'left-0 border-r border-[#90e0ef] animate-in slide-in-from-left'
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:text-[#03045e] hover:bg-[#caf0f8] transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

import { Megaphone } from 'lucide-react';
import { cn } from '../lib/utils';
import { AdSlotSize } from '../types';

interface AdSlotProps {
  size: AdSlotSize;
  className?: string;
  label?: string;
}

/**
 * Reusable Advertisement Slot placeholder.
 * Designed with clear visual boundaries and labeling to keep commercial
 * placements strictly decoupled from factual clinical content.
 * Replace contents of this component when connecting to real ad networks (e.g. Google Ad Manager).
 */
export function AdSlot({ size, className, label = 'Advertisement' }: AdSlotProps) {
  const sizeClasses = {
    'sidebar-tall': 'w-full min-h-[500px] h-full flex-col justify-center',
    'sidebar-square': 'w-full min-h-[250px] flex-col justify-center',
    'banner': 'w-full min-h-[90px] py-4 px-6 flex-row items-center justify-between',
  };

  return (
    <aside
      aria-label="Sponsored Content"
      className={cn(
        'group relative overflow-hidden rounded-2xl border-2 border-dashed border-[#90e0ef] bg-[#caf0f8]/20 p-4 transition-all duration-200 hover:border-[#00b4d8] hover:bg-[#caf0f8]/40 flex items-center text-center select-none',
        sizeClasses[size],
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase border border-slate-200/60 shadow-2xs">
          <Megaphone className="h-3 w-3 text-[#0077b6]" />
          <span>{label}</span>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Reserved Slot · {size === 'sidebar-tall' ? '160x600 / 300x600' : size === 'sidebar-square' ? '300x250' : '728x90 Banner'}
        </p>
      </div>

      {/* Developer note visible in DOM */}
      {/* TODO: Integrate advertising tag code (e.g., Google AdSense / DFP unit) here */}
    </aside>
  );
}

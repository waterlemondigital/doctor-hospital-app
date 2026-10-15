import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

export function Accordion({
  children,
  className,
  defaultValue = [],
}: {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string[];
}) {
  const [openItems, setOpenItems] = React.useState<string[]>(defaultValue);

  const toggleItem = (val: string) => {
    setOpenItems((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn('divide-y divide-slate-200 border-y border-slate-200', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-value={value} className={cn('py-1', className)}>
      {children}
    </div>
  );
}

export function AccordionTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

  const isOpen = context.openItems.includes(value);

  return (
    <button
      type="button"
      onClick={() => context.toggleItem(value)}
      aria-expanded={isOpen}
      className={cn(
        'flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-[#03045e] transition-all hover:text-[#0077b6] cursor-pointer',
        className
      )}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200',
          isOpen && 'rotate-180 text-[#0077b6]'
        )}
      />
    </button>
  );
}

export function AccordionContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const isOpen = context.openItems.includes(value);
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'pb-4 pt-0 text-sm text-slate-600 leading-relaxed animate-in fade-in-50 duration-150',
        className
      )}
    >
      {children}
    </div>
  );
}

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ShieldAlert, Send, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';

const queryFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Please enter your full name (at least 2 characters).' })
    .max(80, { message: 'Name must be under 80 characters.' }),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, {
      message: 'Please enter a valid 10-digit Indian mobile number (e.g., 9822012345).',
    }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(5, { message: 'Please enter your inquiry (at least 5 characters).' })
    .max(500, { message: 'Inquiry message must be under 500 characters.' }),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must confirm the consent checkbox to send this inquiry.',
  }),
  // Honeypot field for spam defense - must remain empty
  honeypot: z.string().max(0, { message: 'Bot detected.' }).optional(),
});

type QueryFormData = z.infer<typeof queryFormSchema>;

interface QueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: 'hospital' | 'doctor' | 'laboratory';
  targetName: string;
  targetId: string;
}

export function QueryDialog({
  open,
  onOpenChange,
  targetType,
  targetName,
  targetId,
}: QueryDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QueryFormData>({
    resolver: zodResolver(queryFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      message: '',
      honeypot: '',
    },
  });

  const onSubmit = async (data: QueryFormData) => {
    // Honeypot guard
    if (data.honeypot && data.honeypot.length > 0) {
      console.warn('Spam submission suppressed via honeypot field.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate client-side transmission
      const payload = {
        targetType,
        targetId,
        targetName,
        submittedAt: new Date().toISOString(),
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        message: data.message,
      };

      // TODO: Replace with backend API endpoint call (e.g., await fetch('/api/inquiries', { method: 'POST', body: JSON.stringify(payload) }))
      console.log('[MedVexa Inquiry Submitted]:', payload);

      // Brief simulated network settle
      await new Promise((resolve) => setTimeout(resolve, 600));

      toast.success('Inquiry sent successfully', {
        description: `Your general enquiry regarding ${targetName} has been logged. The facility liaison will contact you via phone.`,
        duration: 5000,
      });

      reset();
      onOpenChange(false);
    } catch {
      toast.error('Unable to send inquiry', {
        description: 'Please check your connection or contact the provider directly by phone.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0077b6]">
            <span>Non-Clinical Inquiry</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{targetType} Desk</span>
          </div>
          <DialogTitle>Send an Inquiry to {targetName}</DialogTitle>
          <DialogDescription>
            Inquire about outpatient consultation hours, facility directions, or administrative details.
          </DialogDescription>
        </DialogHeader>

        {/* Visible Medical Safety Notice */}
        <div
          role="note"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5"
        >
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important Privacy & Medical Notice:</strong> Please do <em>not</em> share medical symptoms, diagnostic reports, personal medical histories, or emergency requests in this form. This website does not provide medical diagnoses or telemedicine.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Honeypot field hidden from real users */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_hp">Leave empty</label>
            <input
              id="website_hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register('honeypot')}
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" required>
              Your Full Name
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. Ramesh Kulkarni"
              {...register('fullName')}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* Phone (Indian 10-digit) */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" required>
              Mobile Number (10 Digits)
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="9822012345"
                className="pl-12 font-mono"
                maxLength={10}
                {...register('phone')}
                aria-invalid={!!errors.phone}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Email (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message" required>
              General Question or Inquiry
            </Label>
            <Textarea
              id="message"
              rows={3}
              placeholder="e.g. Inquiring whether the Saturday morning outpatient session is open for new registrations."
              {...register('message')}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="text-xs text-red-600">{errors.message.message}</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="space-y-1 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-snug">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0077b6] focus:ring-[#00b4d8] cursor-pointer"
                {...register('consent')}
              />
              <span>
                I agree to be contacted regarding this general query and confirm I have reviewed the Privacy notice. I understand this is not a diagnostic or emergency tool.
              </span>
            </label>
            {errors.consent && (
              <p className="text-xs text-red-600 pl-6.5">{errors.consent.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-[#0077b6] hover:bg-[#03045e]"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Inquiry
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Lock className="h-3 w-3" />
          <span>Your contact info is used strictly to respond to this single inquiry.</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

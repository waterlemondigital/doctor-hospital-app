import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Flag, Send, ExternalLink } from 'lucide-react';
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

const correctionSchema = z.object({
  subjectName: z.string().min(1, 'Please specify the hospital or doctor.'),
  issueType: z.enum([
    'incorrect-contact',
    'changed-timings',
    'facility-update',
    'doctor-affiliation',
    'outdated-source',
    'other',
  ] as const),
  details: z
    .string()
    .trim()
    .min(10, 'Please provide factual details of the correction (at least 10 characters).')
    .max(1000, 'Details must be under 1,000 characters.'),
  sourceUrl: z
    .string()
    .trim()
    .url('Please provide a valid URL (e.g., official hospital page or council register).')
    .optional()
    .or(z.literal('')),
  reporterRole: z.enum(['healthcare-provider', 'patient-visitor', 'other-member'] as const),
  reporterEmail: z.string().trim().email('Please enter a valid contact email.'),
});

type CorrectionFormData = z.infer<typeof correctionSchema>;

interface CorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubject?: string;
}

export function CorrectionDialog({
  open,
  onOpenChange,
  defaultSubject = 'General Directory Listing',
}: CorrectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CorrectionFormData>({
    resolver: zodResolver(correctionSchema),
    defaultValues: {
      subjectName: defaultSubject,
      issueType: 'incorrect-contact',
      details: '',
      sourceUrl: '',
      reporterRole: 'healthcare-provider',
      reporterEmail: '',
    },
  });

  React.useEffect(() => {
    if (defaultSubject) {
      reset((prev) => ({ ...prev, subjectName: defaultSubject }));
    }
  }, [defaultSubject, reset]);

  const onSubmit = async (data: CorrectionFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        submittedAt: new Date().toISOString(),
        referenceId: `CORR-${Date.now().toString().slice(-6)}`,
      };

      // TODO: Connect to backend ticketing or moderation API endpoint
      console.log('[HealthDiscover Correction Submitted]:', payload);

      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success('Correction request submitted', {
        description: `Thank you for contributing to healthcare transparency. Ref: ${payload.referenceId}. Our editorial team will review the citation.`,
        duration: 5500,
      });

      reset();
      onOpenChange(false);
    } catch {
      toast.error('Submission failed. Please email verification@healthdiscover.in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0077b6]">
            <Flag className="h-3.5 w-3.5" />
            <span>Factual Data Correction</span>
          </div>
          <DialogTitle>Report an Error / Update Listing</DialogTitle>
          <DialogDescription>
            Help keep HealthDiscover accurate. Submissions must refer to official registries or verifiable hospital publications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* Target Entity */}
          <div className="space-y-1">
            <Label htmlFor="subjectName" required>Listing Subject</Label>
            <Input
              id="subjectName"
              {...register('subjectName')}
              placeholder="e.g. Sahyadri Hospital or Dr. Placeholder"
              aria-invalid={!!errors.subjectName}
            />
            {errors.subjectName && (
              <p className="text-xs text-red-600">{errors.subjectName.message}</p>
            )}
          </div>

          {/* Issue Type */}
          <div className="space-y-1">
            <Label htmlFor="issueType" required>Correction Category</Label>
            <select
              id="issueType"
              {...register('issueType')}
              className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
            >
              <option value="incorrect-contact">Incorrect Phone Number or Address</option>
              <option value="changed-timings">Outdated Consultation Hours / OPD Days</option>
              <option value="facility-update">New or Discontinued Department / Facility</option>
              <option value="doctor-affiliation">Doctor Affiliation / Practice Update</option>
              <option value="outdated-source">Outdated Source Link</option>
              <option value="other">Other Factual Correction</option>
            </select>
            {errors.issueType && (
              <p className="text-xs text-red-600">{errors.issueType.message}</p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1">
            <Label htmlFor="details" required>Correction Details & Explanation</Label>
            <Textarea
              id="details"
              rows={3}
              placeholder="Please explain what is currently inaccurate and what the verified factual value should be."
              {...register('details')}
              aria-invalid={!!errors.details}
            />
            {errors.details && (
              <p className="text-xs text-red-600">{errors.details.message}</p>
            )}
          </div>

          {/* Source Link */}
          <div className="space-y-1">
            <Label htmlFor="sourceUrl">
              Verification Source Link (Optional but Recommended)
            </Label>
            <div className="relative">
              <Input
                id="sourceUrl"
                type="url"
                placeholder="https://hospital-domain.com/official-notice"
                {...register('sourceUrl')}
                aria-invalid={!!errors.sourceUrl}
              />
              <ExternalLink className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
            {errors.sourceUrl && (
              <p className="text-xs text-red-600">{errors.sourceUrl.message}</p>
            )}
          </div>

          {/* Submitter Role & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label htmlFor="reporterRole" required>You Are</Label>
              <select
                id="reporterRole"
                {...register('reporterRole')}
                className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-2.5 text-xs text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
              >
                <option value="healthcare-provider">Hospital/Clinic Representative</option>
                <option value="patient-visitor">Patient or Public Visitor</option>
                <option value="other-member">Independent Researcher</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="reporterEmail" required>Your Work/Contact Email</Label>
              <Input
                id="reporterEmail"
                type="email"
                placeholder="editor@hospital.org"
                {...register('reporterEmail')}
                aria-invalid={!!errors.reporterEmail}
              />
              {errors.reporterEmail && (
                <p className="text-xs text-red-600">{errors.reporterEmail.message}</p>
              )}
            </div>
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
              className="gap-2 bg-[#03045e] hover:bg-[#0077b6]"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Correction
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useRef } from 'react';
import { toast } from 'sonner';
import { FileText, UploadCloud, CheckCircle2, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { Label } from './ui/label';

interface PdfUploadFieldProps {
  id: string;
  label: string;
  sublabel?: string;
  fileUrl?: string;
  fileName?: string;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onClear: () => void;
  required?: boolean;
}

export function PdfUploadField({
  id,
  label,
  sublabel = 'PDF format below 5 MB',
  fileUrl,
  fileName,
  isUploading,
  onUpload,
  onClear,
  required = false,
}: PdfUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again if cleared
    e.target.value = '';

    // 1. PDF Mime/Extension check
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfExt) {
      toast.error('Invalid File Format', {
        description: 'Please upload a PDF document (.pdf format only).',
      });
      return;
    }

    // 2. Strict 5 MB Size check
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      toast.error('File Exceeds 5 MB Limit', {
        description: `Selected file is ${sizeMb} MB. Please upload a PDF under 5 MB.`,
      });
      return;
    }

    try {
      await onUpload(file);
    } catch (err: any) {
      toast.error('Upload to Cloudflare R2 Failed', {
        description: err?.message || 'Network error during upload.',
      });
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <span className="text-[10px] text-slate-400 font-medium">{sublabel}</span>
      </div>

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {fileUrl ? (
        /* Uploaded State: Green Verified Pill + R2 Link + Clear */
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/60 transition-all">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-emerald-900 truncate">
                {fileName || 'document.pdf'}
              </p>
              <p className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                <span>Stored securely in Cloudflare R2</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
              title="Preview PDF"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Remove document"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Uploading State */
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isUploading
              ? 'border-sky-300 bg-sky-50/50 cursor-wait'
              : 'border-slate-200 hover:border-[#0077b6] hover:bg-[#caf0f8]/20 bg-white'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0077b6]">
              <Loader2 className="h-4 w-4 animate-spin text-[#0077b6]" />
              <span>Uploading PDF to Cloudflare R2...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <UploadCloud className="h-4 w-4 text-[#0077b6]" />
              <span>Click to select PDF document</span>
              <span className="text-[10px] text-slate-400">(&lt; 5MB)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

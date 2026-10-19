import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Lock,
  Mail,
  User,
  Phone,
  Stethoscope,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  FlaskConical,
  Activity,
  Award,
  FileText,
  MessageSquare,
  MapPin,
  Compass,
  FileCheck2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useAuth } from '../lib/auth';
import { uploadDocument } from '../api/auth';
import { PdfUploadField } from './PdfUploadField';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: 'login' | 'signup';
}

type SignupRole = 'patient' | 'doctor' | 'hospital' | 'laboratory' | 'wellness';

const COUNTRY_DIAL_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'US / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

const DOCTOR_SPECIALITY_OPTIONS = [
  'Cardiology',
  'Orthopaedics',
  'Neurology & Neurosurgery',
  'Paediatrics & Child Health',
  'General Medicine',
  'General & Laparoscopic Surgery',
  'Gynaecology & Obstetrics',
  'Dermatology',
  'ENT (Ear, Nose, Throat)',
  'Ophthalmology',
  'Gastroenterology',
  'Nephrology',
  'Pulmonology / Chest Medicine',
  'Urology',
  'Oncology / Cancer Care',
  'Endocrinology & Diabetology',
  'Psychiatry',
  'Ayurvedic Medicine',
  'Homeopathy',
  'Unani Medicine',
];

export function AuthDialog({ open, onOpenChange, initialMode = 'login' }: AuthDialogProps) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  // Signup form common state
  const [signupRole, setSignupRole] = React.useState<SignupRole>('patient');
  const [signupName, setSignupName] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [signupCountryCode, setSignupCountryCode] = React.useState('+91');
  const [signupPhone, setSignupPhone] = React.useState('');
  const [signupPhoneError, setSignupPhoneError] = React.useState<string | null>(null);
  const [signupPassword, setSignupPassword] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(true);

  // Doctor-specific signup state fields
  const [doctorExperience, setDoctorExperience] = React.useState('');
  const [doctorSpeciality, setDoctorSpeciality] = React.useState('Cardiology');
  const [doctorWhatsapp, setDoctorWhatsapp] = React.useState('');
  const [doctorSameWhatsapp, setDoctorSameWhatsapp] = React.useState(true);
  const [doctorClinicAddress, setDoctorClinicAddress] = React.useState('');
  const [doctorRegNo, setDoctorRegNo] = React.useState('');

  // Hospital-specific signup state fields
  const [hospitalCity, setHospitalCity] = React.useState('Pune');
  const [hospitalAddress, setHospitalAddress] = React.useState('');
  const [hospitalPincode, setHospitalPincode] = React.useState('');
  const [hospitalAuthName, setHospitalAuthName] = React.useState('');
  const [hospitalAuthPhone, setHospitalAuthPhone] = React.useState('');
  const [hospitalRegCertUrl, setHospitalRegCertUrl] = React.useState('');
  const [hospitalRegCertName, setHospitalRegCertName] = React.useState('');
  const [isUploadingHospitalCert, setIsUploadingHospitalCert] = React.useState(false);

  // Laboratory-specific signup state fields
  const [labCity, setLabCity] = React.useState('Pune');
  const [labAddress, setLabAddress] = React.useState('');
  const [labPincode, setLabPincode] = React.useState('');
  const [labLicenceUrl, setLabLicenceUrl] = React.useState('');
  const [labLicenceName, setLabLicenceName] = React.useState('');
  const [isUploadingLabLicence, setIsUploadingLabLicence] = React.useState(false);
  const [labAddressProofUrl, setLabAddressProofUrl] = React.useState('');
  const [labAddressProofName, setLabAddressProofName] = React.useState('');
  const [isUploadingLabAddressProof, setIsUploadingLabAddressProof] = React.useState(false);

  // Wellness-specific signup state fields
  const [wellnessCity, setWellnessCity] = React.useState('Pune');
  const [wellnessAddress, setWellnessAddress] = React.useState('');
  const [wellnessPincode, setWellnessPincode] = React.useState('');
  const [wellnessLicenceUrl, setWellnessLicenceUrl] = React.useState('');
  const [wellnessLicenceName, setWellnessLicenceName] = React.useState('');
  const [isUploadingWellnessLicence, setIsUploadingWellnessLicence] = React.useState(false);
  const [wellnessAddressProofUrl, setWellnessAddressProofUrl] = React.useState('');
  const [wellnessAddressProofName, setWellnessAddressProofName] = React.useState('');
  const [isUploadingWellnessAddressProof, setIsUploadingWellnessAddressProof] = React.useState(false);

  const validatePhoneNumber = (rawPhone: string, countryCode: string): string | null => {
    const digits = rawPhone.replace(/\D/g, '').trim();
    if (!digits) {
      return null;
    }
    if (countryCode === '+91') {
      if (digits.length !== 10) {
        return 'Mobile number must be exactly 10 digits.';
      }
      if (!/^[6-9]/.test(digits)) {
        return 'Indian mobile numbers must begin with 6, 7, 8, or 9.';
      }
    } else {
      if (digits.length < 7 || digits.length > 15) {
        return 'International mobile numbers must be between 7 and 15 digits.';
      }
    }
    return null;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSignupPhone(val);
    if (signupPhoneError) {
      setSignupPhoneError(validatePhoneNumber(val, signupCountryCode));
    }
  };

  // Sync mode with initialMode whenever dialog opens
  React.useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  // Upload handlers with direct Cloudflare R2 path management
  const handleUploadHospitalCert = async (file: File) => {
    setIsUploadingHospitalCert(true);
    try {
      const res = await uploadDocument(file, 'hospital', 'registration_cert', signupName || 'hospital');
      setHospitalRegCertUrl(res.url);
      setHospitalRegCertName(res.fileName);
      toast.success('Certificate Uploaded to Cloudflare R2', {
        description: `${res.fileName} (${(res.fileSize / (1024 * 1024)).toFixed(2)} MB)`,
      });
    } finally {
      setIsUploadingHospitalCert(false);
    }
  };

  const handleUploadLabLicence = async (file: File) => {
    setIsUploadingLabLicence(true);
    try {
      const res = await uploadDocument(file, 'laboratory', 'operating_licence', signupName || 'laboratory');
      setLabLicenceUrl(res.url);
      setLabLicenceName(res.fileName);
      toast.success('Registration Licence Uploaded to Cloudflare R2', {
        description: `${res.fileName} (${(res.fileSize / (1024 * 1024)).toFixed(2)} MB)`,
      });
    } finally {
      setIsUploadingLabLicence(false);
    }
  };

  const handleUploadLabAddressProof = async (file: File) => {
    setIsUploadingLabAddressProof(true);
    try {
      const res = await uploadDocument(file, 'laboratory', 'address_proof', signupName || 'laboratory');
      setLabAddressProofUrl(res.url);
      setLabAddressProofName(res.fileName);
      toast.success('Address Proof Uploaded to Cloudflare R2', {
        description: `${res.fileName} (${(res.fileSize / (1024 * 1024)).toFixed(2)} MB)`,
      });
    } finally {
      setIsUploadingLabAddressProof(false);
    }
  };

  const handleUploadWellnessLicence = async (file: File) => {
    setIsUploadingWellnessLicence(true);
    try {
      const res = await uploadDocument(file, 'wellness', 'operating_licence', signupName || 'wellness');
      setWellnessLicenceUrl(res.url);
      setWellnessLicenceName(res.fileName);
      toast.success('Licence Uploaded to Cloudflare R2', {
        description: `${res.fileName} (${(res.fileSize / (1024 * 1024)).toFixed(2)} MB)`,
      });
    } finally {
      setIsUploadingWellnessLicence(false);
    }
  };

  const handleUploadWellnessAddressProof = async (file: File) => {
    setIsUploadingWellnessAddressProof(true);
    try {
      const res = await uploadDocument(file, 'wellness', 'address_proof', signupName || 'wellness');
      setWellnessAddressProofUrl(res.url);
      setWellnessAddressProofName(res.fileName);
      toast.success('Business Address Proof Uploaded to Cloudflare R2', {
        description: `${res.fileName} (${(res.fileSize / (1024 * 1024)).toFixed(2)} MB)`,
      });
    } finally {
      setIsUploadingWellnessAddressProof(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const user = await login({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      toast.success('Signed in successfully', {
        description: `Welcome back, ${user.name}!`,
      });
      onOpenChange(false);
      if (['doctor', 'hospital', 'laboratory', 'wellness'].includes(user.role)) {
        navigate('/portal/dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || 'Invalid credentials';
      toast.error('Login Failed', {
        description: msg.includes('429')
          ? 'Too many login attempts. Please wait a minute before trying again.'
          : msg.includes('401')
          ? 'Incorrect email or password.'
          : msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Common Name validation
    if (!signupName.trim()) {
      toast.error(
        signupRole === 'hospital'
          ? 'Please enter hospital name.'
          : signupRole === 'laboratory'
          ? 'Please enter laboratory name.'
          : signupRole === 'wellness'
          ? 'Please enter wellness centre name.'
          : 'Please enter your full name.'
      );
      return;
    }

    // 2. Email validation
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // 3. Password validation
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    // 4. Contact Number Validation
    if (!signupPhone.trim()) {
      toast.error('Please enter contact number.');
      return;
    }

    const phoneErr = validatePhoneNumber(signupPhone, signupCountryCode);
    if (phoneErr) {
      setSignupPhoneError(phoneErr);
      toast.error('Invalid Mobile Number', { description: phoneErr });
      return;
    }

    // 5. Role-Specific Validations
    if (signupRole === 'doctor') {
      if (!doctorSpeciality) {
        toast.error('Please select medical speciality.');
        return;
      }
      if (!doctorExperience.trim()) {
        toast.error('Please enter experience in years.');
        return;
      }
      if (!doctorSameWhatsapp && !doctorWhatsapp.trim()) {
        toast.error('Please enter WhatsApp number.');
        return;
      }
      if (!doctorClinicAddress.trim()) {
        toast.error('Please enter clinic or chamber address.');
        return;
      }
      if (!doctorRegNo.trim()) {
        toast.error('Please enter medical council registration number.');
        return;
      }
    } else if (signupRole === 'hospital') {
      if (!hospitalRegCertUrl) {
        toast.error('Hospital registration certificate or licence PDF is required.');
        return;
      }
      if (!hospitalCity.trim()) {
        toast.error('Please enter city.');
        return;
      }
      if (!hospitalAddress.trim()) {
        toast.error('Please enter hospital address.');
        return;
      }
      if (!hospitalPincode.trim()) {
        toast.error('Please enter pincode.');
        return;
      }
      if (!hospitalAuthName.trim()) {
        toast.error('Please enter authorized person name.');
        return;
      }
      if (!hospitalAuthPhone.trim()) {
        toast.error('Please enter authorized person contact number.');
        return;
      }
    } else if (signupRole === 'laboratory') {
      if (!labAddress.trim()) {
        toast.error('Please enter laboratory address.');
        return;
      }
      if (!labCity.trim()) {
        toast.error('Please enter city.');
        return;
      }
      if (!labPincode.trim()) {
        toast.error('Please enter pincode.');
        return;
      }
      if (!labLicenceUrl) {
        toast.error('Valid Government Registration/Licence PDF is required.');
        return;
      }
      if (!labAddressProofUrl) {
        toast.error('Laboratory Address Proof PDF is required.');
        return;
      }
    } else if (signupRole === 'wellness') {
      if (!wellnessAddress.trim()) {
        toast.error('Please enter wellness centre address.');
        return;
      }
      if (!wellnessCity.trim()) {
        toast.error('Please enter city.');
        return;
      }
      if (!wellnessPincode.trim()) {
        toast.error('Please enter pincode.');
        return;
      }
      if (!wellnessLicenceUrl) {
        toast.error('Government Registration/Licence PDF is required.');
        return;
      }
      if (!wellnessAddressProofUrl) {
        toast.error('Business Address Proof PDF is required.');
        return;
      }
    }

    if (!agreeTerms) {
      toast.error('Please agree to directory verification terms.');
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhoneDigits = signupPhone.replace(/\D/g, '').trim() || undefined;

      const user = await signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        country_code: signupCountryCode,
        phone: cleanPhoneDigits,
        role: signupRole,
        password: signupPassword,
        // Doctor fields
        speciality: signupRole === 'doctor' ? doctorSpeciality : undefined,
        experience: signupRole === 'doctor' ? doctorExperience.trim() : undefined,
        whatsapp_number:
          signupRole === 'doctor'
            ? doctorSameWhatsapp
              ? cleanPhoneDigits
              : doctorWhatsapp.replace(/\D/g, '').trim() || undefined
            : undefined,
        clinic_address: signupRole === 'doctor' ? doctorClinicAddress.trim() : undefined,
        medical_reg_no: signupRole === 'doctor' ? doctorRegNo.trim() : undefined,
        // Hospital fields
        city:
          signupRole === 'hospital'
            ? hospitalCity.trim()
            : signupRole === 'laboratory'
            ? labCity.trim()
            : signupRole === 'wellness'
            ? wellnessCity.trim()
            : undefined,
        address:
          signupRole === 'hospital'
            ? hospitalAddress.trim()
            : signupRole === 'laboratory'
            ? labAddress.trim()
            : signupRole === 'wellness'
            ? wellnessAddress.trim()
            : undefined,
        pincode:
          signupRole === 'hospital'
            ? hospitalPincode.trim()
            : signupRole === 'laboratory'
            ? labPincode.trim()
            : signupRole === 'wellness'
            ? wellnessPincode.trim()
            : undefined,
        authorized_person_name: signupRole === 'hospital' ? hospitalAuthName.trim() : undefined,
        authorized_person_phone: signupRole === 'hospital' ? hospitalAuthPhone.trim() : undefined,
        registration_cert_url:
          signupRole === 'hospital'
            ? hospitalRegCertUrl
            : signupRole === 'laboratory'
            ? labLicenceUrl
            : signupRole === 'wellness'
            ? wellnessLicenceUrl
            : undefined,
        address_proof_url:
          signupRole === 'laboratory'
            ? labAddressProofUrl
            : signupRole === 'wellness'
            ? wellnessAddressProofUrl
            : undefined,
      });

      const roleLabels: Record<string, string> = {
        doctor: 'Doctor Specialist',
        hospital: 'Hospital Center',
        laboratory: 'Diagnostic Laboratory',
        wellness: 'Wellness Center',
        patient: 'Patient',
      };

      toast.success('Account created successfully!', {
        description: `Welcome, ${user.name}! Registered as ${roleLabels[user.role] || user.role}. Stored and visible for admin targets.`,
      });
      onOpenChange(false);
      if (['doctor', 'hospital', 'laboratory', 'wellness'].includes(user.role)) {
        navigate('/portal/dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || 'Signup failed';
      toast.error('Registration Failed', {
        description: msg.includes('429')
          ? 'Too many attempts. Rate limit exceeded.'
          : msg.includes('already exists')
          ? 'An account with this email already exists. Please log in.'
          : msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl p-6 sm:p-7 bg-white rounded-3xl border border-[#90e0ef]/70 shadow-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-left space-y-2">
          {/* Top Pill / Switcher */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#caf0f8]/60 text-[#0077b6] text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Directory Access</span>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#0077b6] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-[#0077b6] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <DialogTitle className="text-xl font-extrabold text-[#03045e] tracking-tight">
            {mode === 'login' ? 'Sign in to your account' : 'Register with MedVexa Directory'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Access hospital query tracking, bookmark physicians, and manage inquiries.'
              : 'Create an account for Doctors, Hospitals, Wellness Centers & Laboratories.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'login' ? (
          /* =================== LOGIN FORM =================== */
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            {/* Email / Username / Phone */}
            <div className="space-y-1">
              <Label htmlFor="login-email" className="text-xs font-semibold text-slate-700">
                Email Address or Registered Mobile
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="login-email"
                  type="text"
                  placeholder="name@example.com or 10-digit mobile"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-9 text-xs rounded-xl border-slate-200 focus-visible:border-[#0077b6]"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-9 pr-9 text-xs rounded-xl border-slate-200 focus-visible:border-[#0077b6]"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-[#0077b6] hover:bg-[#023e8a] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          /* =================== SIGNUP FORM =================== */
          <form onSubmit={handleSignupSubmit} className="mt-5 space-y-3.5">
            {/* Account Role Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">I am registering as:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSignupRole('patient')}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    signupRole === 'patient'
                      ? 'border-[#0077b6] bg-[#caf0f8]/40 text-[#03045e] ring-2 ring-[#0077b6]/30 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <User className="h-4 w-4 text-[#0077b6]" />
                  <span>Patient</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignupRole('doctor')}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    signupRole === 'doctor'
                      ? 'border-[#0077b6] bg-[#caf0f8]/40 text-[#03045e] ring-2 ring-[#0077b6]/30 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Stethoscope className="h-4 w-4 text-[#0077b6]" />
                  <span>Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignupRole('hospital')}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    signupRole === 'hospital'
                      ? 'border-[#0077b6] bg-[#caf0f8]/40 text-[#03045e] ring-2 ring-[#0077b6]/30 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="h-4 w-4 text-[#0077b6]" />
                  <span>Hospital</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignupRole('laboratory')}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    signupRole === 'laboratory'
                      ? 'border-[#0077b6] bg-[#caf0f8]/40 text-[#03045e] ring-2 ring-[#0077b6]/30 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <FlaskConical className="h-4 w-4 text-teal-600" />
                  <span>Lab</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignupRole('wellness')}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    signupRole === 'wellness'
                      ? 'border-[#0077b6] bg-[#caf0f8]/40 text-[#03045e] ring-2 ring-[#0077b6]/30 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span>Wellness</span>
                </button>
              </div>
            </div>

            {/* Entity / Full Name */}
            <div className="space-y-1">
              <Label htmlFor="signup-name" className="text-xs font-semibold text-slate-700">
                {signupRole === 'doctor'
                  ? 'Doctor Name with Title (e.g., Dr. Priya Shah)'
                  : signupRole === 'hospital'
                  ? 'Hospital Name *'
                  : signupRole === 'laboratory'
                  ? 'Laboratory Name *'
                  : signupRole === 'wellness'
                  ? 'Wellness Centre Name *'
                  : 'Full Name *'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder={
                    signupRole === 'doctor'
                      ? 'Dr. Priya Shah'
                      : signupRole === 'hospital'
                      ? 'Ruby Hall Clinic'
                      : signupRole === 'laboratory'
                      ? 'Metropolis Healthcare Diagnostics'
                      : signupRole === 'wellness'
                      ? 'AyurVeda Wellness Sanctuary'
                      : 'Aarav Patil'
                  }
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="pl-9 text-xs rounded-xl border-slate-200 focus-visible:border-[#0077b6]"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <Label htmlFor="signup-email" className="text-xs font-semibold text-slate-700">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="contact@institution.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="pl-9 text-xs rounded-xl border-slate-200 focus-visible:border-[#0077b6]"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Contact Phone Number */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="signup-phone" className="text-xs font-semibold text-slate-700">
                  Contact Number *
                </Label>
                {signupCountryCode === '+91' && (
                  <span className="text-[10px] text-slate-400 font-medium">10 digits</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative w-28 shrink-0">
                  <select
                    id="signup-country-code"
                    value={signupCountryCode}
                    onChange={(e) => {
                      setSignupCountryCode(e.target.value);
                      if (signupPhone) {
                        setSignupPhoneError(validatePhoneNumber(signupPhone, e.target.value));
                      }
                    }}
                    className="w-full h-9 pl-2 pr-4 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-[#0077b6] cursor-pointer"
                    aria-label="Select Country Dial Code"
                  >
                    {COUNTRY_DIAL_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder={signupCountryCode === '+91' ? '98220 12345' : '1234567890'}
                    value={signupPhone}
                    onChange={handlePhoneChange}
                    onBlur={() => setSignupPhoneError(validatePhoneNumber(signupPhone, signupCountryCode))}
                    className={`pl-9 text-xs rounded-xl border-slate-200 focus-visible:border-[#0077b6] ${
                      signupPhoneError ? 'border-red-400 focus-visible:border-red-500 bg-red-50/20' : ''
                    }`}
                    required
                  />
                </div>
              </div>
              {signupPhoneError && (
                <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">
                  {signupPhoneError}
                </p>
              )}
            </div>

            {/* 1. DOCTOR EXCLUSIVE FIELDS */}
            {signupRole === 'doctor' && (
              <div className="p-3.5 rounded-2xl bg-[#caf0f8]/20 border border-[#90e0ef]/70 space-y-3">
                <div className="flex items-center gap-1.5 pb-1 border-b border-[#90e0ef]/40 text-xs font-bold text-[#03045e]">
                  <Stethoscope className="h-3.5 w-3.5 text-[#0077b6]" />
                  <span>Doctor Practice & Medical Council Details</span>
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signup-whatsapp" className="text-xs font-semibold text-slate-700">
                      WhatsApp Number
                    </Label>
                    <label className="flex items-center gap-1.5 text-[11px] text-[#0077b6] cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={doctorSameWhatsapp}
                        onChange={(e) => setDoctorSameWhatsapp(e.target.checked)}
                        className="rounded border-slate-300 text-[#0077b6] focus:ring-[#0077b6]"
                      />
                      <span>Same as Phone</span>
                    </label>
                  </div>

                  {!doctorSameWhatsapp && (
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600 pointer-events-none" />
                      <Input
                        id="signup-whatsapp"
                        type="tel"
                        placeholder="WhatsApp contact number"
                        value={doctorWhatsapp}
                        onChange={(e) => setDoctorWhatsapp(e.target.value)}
                        className="pl-9 text-xs rounded-xl border-slate-200 bg-white focus-visible:border-[#0077b6]"
                        required={!doctorSameWhatsapp}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="doc-speciality" className="text-xs font-semibold text-slate-700">
                      Speciality *
                    </Label>
                    <select
                      id="doc-speciality"
                      value={doctorSpeciality}
                      onChange={(e) => setDoctorSpeciality(e.target.value)}
                      className="w-full h-9 pl-2.5 pr-6 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#0077b6] cursor-pointer"
                      required
                    >
                      {DOCTOR_SPECIALITY_OPTIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="doc-experience" className="text-xs font-semibold text-slate-700">
                      Experience *
                    </Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        id="doc-experience"
                        type="text"
                        placeholder="e.g. 12 Years"
                        value={doctorExperience}
                        onChange={(e) => setDoctorExperience(e.target.value)}
                        className="pl-9 text-xs rounded-xl border-slate-200 bg-white focus-visible:border-[#0077b6]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="doc-regno" className="text-xs font-semibold text-slate-700">
                    Medical Reg No (MCI / State Council) *
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="doc-regno"
                      type="text"
                      placeholder="e.g. MMC-2015-08492"
                      value={doctorRegNo}
                      onChange={(e) => setDoctorRegNo(e.target.value)}
                      className="pl-9 text-xs rounded-xl border-slate-200 bg-white focus-visible:border-[#0077b6]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="doc-clinic" className="text-xs font-semibold text-slate-700">
                    Clinic / Chamber Address *
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="doc-clinic"
                      type="text"
                      placeholder="e.g. MedVexa Clinic, FC Road, Shivajinagar, Pune"
                      value={doctorClinicAddress}
                      onChange={(e) => setDoctorClinicAddress(e.target.value)}
                      className="pl-9 text-xs rounded-xl border-slate-200 bg-white focus-visible:border-[#0077b6]"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. HOSPITAL EXCLUSIVE FIELDS */}
            {signupRole === 'hospital' && (
              <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3">
                <div className="flex items-center gap-1.5 pb-1 border-b border-sky-200 text-xs font-bold text-[#03045e]">
                  <Building2 className="h-3.5 w-3.5 text-[#0077b6]" />
                  <span>Hospital Verification & Operating Credentials</span>
                </div>

                {/* PDF Upload: Registration Certificate / Operating Licence */}
                <PdfUploadField
                  id="hospital-reg-cert"
                  label="Hospital Registration Certificate or Operating Licence"
                  sublabel="PDF below 5 MB"
                  fileUrl={hospitalRegCertUrl}
                  fileName={hospitalRegCertName}
                  isUploading={isUploadingHospitalCert}
                  onUpload={handleUploadHospitalCert}
                  onClear={() => {
                    setHospitalRegCertUrl('');
                    setHospitalRegCertName('');
                  }}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="hosp-city" className="text-xs font-semibold text-slate-700">
                      City *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        id="hosp-city"
                        type="text"
                        placeholder="e.g. Pune"
                        value={hospitalCity}
                        onChange={(e) => setHospitalCity(e.target.value)}
                        className="pl-9 text-xs rounded-xl border-slate-200 bg-white focus-visible:border-[#0077b6]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="hosp-pincode" className="text-xs font-semibold text-slate-700">
                      Pincode *
                    </Label>
                    <Input
                      id="hosp-pincode"
                      type="text"
                      placeholder="e.g. 411001"
                      value={hospitalPincode}
                      onChange={(e) => setHospitalPincode(e.target.value)}
                      className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-[#0077b6]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="hosp-address" className="text-xs font-semibold text-slate-700">
                    Hospital Full Address *
                  </Label>
                  <Input
                    id="hosp-address"
                    type="text"
                    placeholder="e.g. Plot 40, Sassoon Road, Near Railway Station, Pune"
                    value={hospitalAddress}
                    onChange={(e) => setHospitalAddress(e.target.value)}
                    className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-[#0077b6]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="hosp-auth-name" className="text-xs font-semibold text-slate-700">
                      Authorized Person Name *
                    </Label>
                    <Input
                      id="hosp-auth-name"
                      type="text"
                      placeholder="e.g. Dr. Sudhir Sharma (Medical Supt.)"
                      value={hospitalAuthName}
                      onChange={(e) => setHospitalAuthName(e.target.value)}
                      className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-[#0077b6]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="hosp-auth-phone" className="text-xs font-semibold text-slate-700">
                      Authorized Person Number *
                    </Label>
                    <Input
                      id="hosp-auth-phone"
                      type="tel"
                      placeholder="e.g. 98220 99887"
                      value={hospitalAuthPhone}
                      onChange={(e) => setHospitalAuthPhone(e.target.value)}
                      className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-[#0077b6]"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. LABORATORY EXCLUSIVE FIELDS */}
            {signupRole === 'laboratory' && (
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                <div className="flex items-center gap-1.5 pb-1 border-b border-teal-200 text-xs font-bold text-teal-900">
                  <FlaskConical className="h-3.5 w-3.5 text-teal-700" />
                  <span>Laboratory Licence & Compliance Documents</span>
                </div>

                {/* PDF 1: Government Registration / Licence */}
                <PdfUploadField
                  id="lab-licence"
                  label="Valid Government Registration / Licence"
                  sublabel="Applicable operating licence (PDF < 5MB)"
                  fileUrl={labLicenceUrl}
                  fileName={labLicenceName}
                  isUploading={isUploadingLabLicence}
                  onUpload={handleUploadLabLicence}
                  onClear={() => {
                    setLabLicenceUrl('');
                    setLabLicenceName('');
                  }}
                  required
                />

                {/* PDF 2: Laboratory Address Proof */}
                <PdfUploadField
                  id="lab-address-proof"
                  label="Laboratory Address Proof"
                  sublabel="Official operating address document (PDF < 5MB)"
                  fileUrl={labAddressProofUrl}
                  fileName={labAddressProofName}
                  isUploading={isUploadingLabAddressProof}
                  onUpload={handleUploadLabAddressProof}
                  onClear={() => {
                    setLabAddressProofUrl('');
                    setLabAddressProofName('');
                  }}
                  required
                />

                <div className="space-y-1">
                  <Label htmlFor="lab-address" className="text-xs font-semibold text-slate-700">
                    Laboratory Address *
                  </Label>
                  <Input
                    id="lab-address"
                    type="text"
                    placeholder="e.g. 2nd Floor, Diagnostic Towers, Tilak Road, Pune"
                    value={labAddress}
                    onChange={(e) => setLabAddress(e.target.value)}
                    className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-teal-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="lab-city" className="text-xs font-semibold text-slate-700">
                      City *
                    </Label>
                    <Input
                      id="lab-city"
                      type="text"
                      placeholder="e.g. Pune"
                      value={labCity}
                      onChange={(e) => setLabCity(e.target.value)}
                      className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-teal-600"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="lab-pincode" className="text-xs font-semibold text-slate-700">
                      Pincode *
                    </Label>
                    <Input
                      id="lab-pincode"
                      type="text"
                      placeholder="e.g. 411030"
                      value={labPincode}
                      onChange={(e) => setLabPincode(e.target.value)}
                      className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-teal-600"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. WELLNESS EXCLUSIVE FIELDS */}
            {signupRole === 'wellness' && (
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
                <div className="flex items-center gap-1.5 pb-1 border-b border-purple-200 text-xs font-bold text-purple-900">
                  <Activity className="h-3.5 w-3.5 text-purple-700" />
                  <span>Wellness Centre Licence & Address Credentials</span>
                </div>

                {/* PDF 1: Applicable Government Registration / Licence */}
                <PdfUploadField
                  id="wellness-licence"
                  label="Applicable Government Registration / Licence"
                  sublabel="Registration certificate / licence (PDF < 5MB)"
                  fileUrl={wellnessLicenceUrl}
                  fileName={wellnessLicenceName}
                  isUploading={isUploadingWellnessLicence}
                  onUpload={handleUploadWellnessLicence}
                  onClear={() => {
                    setWellnessLicenceUrl('');
                    setWellnessLicenceName('');
                  }}
                  required
                />

                {/* PDF 2: Business Address Proof */}
                <PdfUploadField
                  id="wellness-address-proof"
                  label="Business Address Proof"
                  sublabel="Document verifying registered address (PDF < 5MB)"
                  fileUrl={wellnessAddressProofUrl}
                  fileName={wellnessAddressProofName}
                  isUploading={isUploadingWellnessAddressProof}
                  onUpload={handleUploadWellnessAddressProof}
                  onClear={() => {
                    setWellnessAddressProofUrl('');
                    setWellnessAddressProofName('');
                  }}
                  required
                />

                <div className="space-y-1">
                  <Label htmlFor="wellness-address" className="text-xs font-semibold text-slate-700">
                    Wellness Centre Address *
                  </Label>
                  <Input
                    id="wellness-address"
                    type="text"
                    placeholder="e.g. Survey No. 24, Koregaon Park North Main Road, Pune"
                    value={wellnessAddress}
                    onChange={(e) => setWellnessAddress(e.target.value)}
                    className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-purple-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="wellness-city" className="text-xs font-semibold text-slate-700">
                      City *
                    </Label>
                    <Input
                      id="wellness-city"
                      type="text"
                      placeholder="e.g. Pune"
                      value={wellnessCity}
                      onChange={(e) => setWellnessCity(e.target.value)}
                      className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-purple-600"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="wellness-pincode" className="text-xs font-semibold text-slate-700">
                      Pincode *
                    </Label>
                    <Input
                      id="wellness-pincode"
                      type="text"
                      placeholder="e.g. 411006"
                      value={wellnessPincode}
                      onChange={(e) => setWellnessPincode(e.target.value)}
                      className="text-xs rounded-xl border-slate-200 bg-white focus-visible:border-purple-600"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="signup-password" className="text-xs font-semibold text-slate-700">
                Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="pl-9 pr-9 text-xs rounded-xl border-slate-200 focus-visible:border-[#0077b6]"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Agree Terms Checkbox */}
            <label className="flex items-start gap-2 pt-1 text-xs text-slate-600 cursor-pointer leading-tight">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#0077b6] focus:ring-[#0077b6]"
              />
              <span>
                I agree to the Directory Terms of Use and verify accuracy of submitted documents.
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-2 rounded-xl bg-gradient-to-r from-[#0077b6] to-[#03045e] hover:from-[#023e8a] hover:to-[#03045e] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Registering organization...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {signupRole === 'doctor'
                      ? 'Register Doctor Specialist'
                      : signupRole === 'hospital'
                      ? 'Register Hospital'
                      : signupRole === 'laboratory'
                      ? 'Register Diagnostic Laboratory'
                      : signupRole === 'wellness'
                      ? 'Register Wellness Center'
                      : 'Create Account'}
                  </span>
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-500 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-[#0077b6] hover:underline cursor-pointer"
              >
                Log in here
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

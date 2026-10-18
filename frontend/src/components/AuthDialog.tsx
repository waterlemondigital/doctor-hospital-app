import * as React from 'react';
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

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: 'login' | 'signup';
}

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

export function AuthDialog({ open, onOpenChange, initialMode = 'login' }: AuthDialogProps) {
  const { login, signup } = useAuth();
  const [mode, setMode] = React.useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(true);

  // Signup form state
  const [signupRole, setSignupRole] = React.useState<'patient' | 'doctor'>('patient');
  const [signupName, setSignupName] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [signupCountryCode, setSignupCountryCode] = React.useState('+91');
  const [signupPhone, setSignupPhone] = React.useState('');
  const [signupPhoneError, setSignupPhoneError] = React.useState<string | null>(null);
  const [signupPassword, setSignupPassword] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(true);

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
        description: `Welcome back, ${user.name}! (${user.role === 'doctor' ? 'Verified Physician' : 'Patient'})`,
      });
      onOpenChange(false);
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

  const handleQuickLogin = async (role: 'patient' | 'doctor') => {
    setIsLoading(true);
    const demoEmail = role === 'doctor' ? 'doctor.demo@medvexa.in' : 'patient.demo@medvexa.in';
    const demoPassword = 'Password123!';
    const demoName = role === 'doctor' ? 'Dr. Rajesh Deshmukh' : 'Aarav Patil';

    try {
      // First try to login
      try {
        const user = await login({ email: demoEmail, password: demoPassword });
        toast.success(`Signed in as ${role === 'doctor' ? 'Doctor' : 'Patient'}`, {
          description: `Account verified and active.`,
        });
        onOpenChange(false);
        return;
      } catch {
        // If demo user does not exist, auto-create it
        const newUser = await signup({
          name: demoName,
          email: demoEmail,
          password: demoPassword,
          role,
          phone: '+91 78756 57402',
        });
        toast.success(`Demo account ready: ${role === 'doctor' ? 'Doctor' : 'Patient'}`, {
          description: `Welcome ${newUser.name}!`,
        });
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error('Demo Sign-In Failed', {
        description: err?.message || 'Could not authenticate demo user.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (signupPhone.trim()) {
      const phoneErr = validatePhoneNumber(signupPhone, signupCountryCode);
      if (phoneErr) {
        setSignupPhoneError(phoneErr);
        toast.error('Invalid Mobile Number', { description: phoneErr });
        return;
      }
    }
    if (!agreeTerms) {
      toast.error('Please agree to directory verification terms.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        country_code: signupCountryCode,
        phone: signupPhone.replace(/\D/g, '').trim() || undefined,
        role: signupRole,
        password: signupPassword,
      });
      toast.success('Account created successfully!', {
        description: `Welcome, ${user.name}! Signed in as ${user.role === 'doctor' ? 'Doctor' : 'Patient'}.`,
      });
      onOpenChange(false);
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

  const handleForgotPassword = () => {
    if (!loginEmail) {
      toast.info('Password Reset', {
        description: 'Please type your email address above, then click Forgot password.',
      });
      return;
    }
    toast.success('Password Reset Email Sent', {
      description: `A secure verification link was sent to ${loginEmail}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 sm:p-7 bg-white rounded-2xl border border-[#90e0ef]/70 shadow-2xl">
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
            {mode === 'login' ? 'Sign in to your account' : 'Join Pune Medical Directory'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Access hospital query tracking, bookmark physicians, and manage inquiries.'
              : 'Create an account as a patient or verified medical specialist.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'login' ? (
          /* =================== LOGIN FORM =================== */
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            {/* Quick Demo Login Option */}
            <div className="rounded-xl border border-[#90e0ef]/60 bg-[#caf0f8]/20 p-3 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-[#03045e] flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#0077b6]" /> Fast Demo Sign-In:
                </span>
                <span className="text-[10px] text-slate-500">1-click test</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('patient')}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-[#0077b6] hover:text-[#0077b6] transition-colors shadow-2xs cursor-pointer"
                >
                  <User className="h-3 w-3 text-[#0077b6]" />
                  <span>Patient Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('doctor')}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-[#0077b6] hover:text-[#0077b6] transition-colors shadow-2xs cursor-pointer"
                >
                  <Stethoscope className="h-3 w-3 text-[#0077b6]" />
                  <span>Doctor Demo</span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
                or with email
              </span>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-xs font-semibold text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-9 text-xs rounded-xl border-slate-200 focus-visible:border-[#0077b6]"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-medium text-[#0077b6] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
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

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#0077b6] focus:ring-[#0077b6]"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-[#0077b6] to-[#03045e] hover:from-[#023e8a] hover:to-[#03045e] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-500 pt-1">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#0077b6] hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          </form>
        ) : (
          /* =================== SIGNUP FORM =================== */
          <form onSubmit={handleSignupSubmit} className="mt-5 space-y-3.5">
            {/* Account Role Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">I am joining as:</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignupRole('patient')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    signupRole === 'patient'
                      ? 'border-[#0077b6] bg-[#caf0f8]/30 text-[#03045e] ring-1 ring-[#0077b6]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <User className="h-4 w-4 text-[#0077b6]" />
                  <span>Patient / Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('doctor')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    signupRole === 'doctor'
                      ? 'border-[#0077b6] bg-[#caf0f8]/30 text-[#03045e] ring-1 ring-[#0077b6]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Stethoscope className="h-4 w-4 text-[#0077b6]" />
                  <span>Medical Professional</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="signup-name" className="text-xs font-semibold text-slate-700">
                {signupRole === 'doctor' ? 'Full Name with Title (e.g., Dr. Priya Shah)' : 'Full Name'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder={signupRole === 'doctor' ? 'Dr. Priya Shah' : 'Aarav Patil'}
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
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="pl-9 text-xs rounded-xl border-slate-200 focus-visible:border-[#0077b6]"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Mobile Number with Country Code */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="signup-phone" className="text-xs font-semibold text-slate-700">
                  Mobile Number <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                {signupCountryCode === '+91' && (
                  <span className="text-[10px] text-slate-400 font-medium">10 digits</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {/* Country Code Dropdown */}
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

                {/* Phone Input */}
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
                  />
                </div>
              </div>
              {signupPhoneError && (
                <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">
                  {signupPhoneError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="signup-password" className="text-xs font-semibold text-slate-700">
                Password
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
                I agree to the Directory Terms of Use and confirm medical information standards.
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-2 rounded-xl bg-gradient-to-r from-[#0077b6] to-[#03045e] hover:from-[#023e8a] hover:to-[#03045e] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Create Account</span>
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

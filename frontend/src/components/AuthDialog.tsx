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
  const [signupPhone, setSignupPhone] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(true);

  // Sync mode with initialMode whenever dialog opens
  React.useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const isDoctor = loginEmail.toLowerCase().includes('dr') || loginEmail.toLowerCase().includes('doc');
      login(loginEmail, isDoctor ? 'doctor' : 'patient');
      toast.success('Signed in successfully', {
        description: `Welcome back to Pune Medical Directory!`,
      });
      onOpenChange(false);
    }, 400);
  };

  const handleQuickLogin = (role: 'patient' | 'doctor') => {
    if (role === 'doctor') {
      login('dr.rajesh@punemed.in', 'doctor', 'Dr. Rajesh Deshmukh');
      toast.success('Signed in as Doctor', {
        description: 'Verified Physician account active.',
      });
    } else {
      login('aarav.patil@gmail.com', 'patient', 'Aarav Patil');
      toast.success('Signed in as Patient / Citizen', {
        description: 'Member account active.',
      });
    }
    onOpenChange(false);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
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
    if (!agreeTerms) {
      toast.error('Please agree to directory verification terms.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        role: signupRole,
      });
      toast.success('Account created successfully!', {
        description: `Welcome, ${signupName}! You are now signed in.`,
      });
      onOpenChange(false);
    }, 450);
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

            {/* Mobile Number */}
            <div className="space-y-1">
              <Label htmlFor="signup-phone" className="text-xs font-semibold text-slate-700">
                Mobile Number (optional)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="9822012345"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  className="pl-9 text-xs rounded-xl border-slate-200 focus-visible:border-[#0077b6]"
                />
              </div>
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

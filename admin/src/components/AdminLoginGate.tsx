import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { adminLogin } from '../api/client';

interface AdminLoginGateProps {
  onLoginSuccess: (user: any) => void;
}

export function AdminLoginGate({ onLoginSuccess }: AdminLoginGateProps) {
  const [username, setUsername] = useState(import.meta.env.VITE_ADMIN_USERNAME || 'admin@medvexa.health');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      toast.error('Please enter both Admin username and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminLogin(username, password);
      toast.success('Admin identity verified! Entering dispatch terminal...');

      if (rememberMe) {
        localStorage.setItem(
          'medvexa_admin_session',
          JSON.stringify({
            token: result.token,
            user: result.user,
            loggedAt: Date.now(),
          })
        );
      } else {
        sessionStorage.setItem(
          'medvexa_admin_session',
          JSON.stringify({
            token: result.token,
            user: result.user,
            loggedAt: Date.now(),
          })
        );
      }

      onLoginSuccess(result.user);
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUsername(import.meta.env.VITE_ADMIN_USERNAME || 'admin@medvexa.health');
    setPassword(import.meta.env.VITE_ADMIN_PASSWORD || 'MedVexa@Admin2026');
    toast.info('Loaded credentials from admin/.env');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03045e] via-[#023e8a] to-[#0077b6] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white border border-[#90e0ef] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Brand & Badge Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center border-2 border-white shadow-md">
            <Lock className="h-7 w-7 text-[#03045e]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#03045e] tracking-tight">
              MedVexa Admin Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Statutory Inbound Call Desk & Target Allocation Engine
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Authorized Personnel Only</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Email / Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin@medvexa.health"
                className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Configured in <code>admin/.env</code> (VITE_ADMIN_USERNAME)
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Access Password or PIN
              </label>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs font-medium pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/50 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Configured in <code>admin/.env</code> (VITE_ADMIN_PASSWORD)
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-[#0077b6] focus:ring-0"
              />
              <span>Remember session on this device</span>
            </label>

            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-[#0077b6] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Fill from .env</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#0077b6] hover:bg-[#03045e] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Unlock Desk Terminal'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All consultations, patient triage records, and doctor/hospital target dispatches are encrypted and logged for statutory audit.
          </p>
        </div>
      </div>
    </div>
  );
}

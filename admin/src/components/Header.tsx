import React from 'react';
import {
  PhoneCall,
  LayoutDashboard,
  Users,
  Building2,
  RefreshCw,
  ShieldCheck,
  Zap,
  Activity,
  LogOut,
} from 'lucide-react';
import { AdminStats } from '../types';

interface HeaderProps {
  currentTab: 'add-entity' | 'dispatch';
  onSelectTab: (tab: 'add-entity' | 'dispatch') => void;
  stats: AdminStats | null;
  isLoading: boolean;
  onRefresh: () => void;
  adminUser?: any;
  onLogout?: () => void;
}

export function Header({
  currentTab,
  onSelectTab,
  stats,
  isLoading,
  onRefresh,
  adminUser,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#90e0ef]/70 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tier: Brand, Live Desk Badge, Quick Metrics & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/images/logo.png"
                alt="MedVexa Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  // Fallback icon if logo image not found
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-[#03045e] tracking-tight flex items-center gap-1.5">
                  MedVexa <span className="text-[#0077b6] text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-[#caf0f8]">Admin Desk</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Patient Intake & Target Dispatch Engine
                </span>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Agent Desk Online</span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto text-xs">
            <div className="flex items-center gap-1.5 bg-[#f0f9fc] border border-[#90e0ef]/50 px-3 py-1.5 rounded-xl">
              <PhoneCall className="h-3.5 w-3.5 text-[#0077b6]" />
              <span className="text-slate-600">Today:</span>
              <strong className="text-[#03045e] font-bold">{stats?.todayLeads ?? 0}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-[#f0f9fc] border border-[#90e0ef]/50 px-3 py-1.5 rounded-xl">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-slate-600">Priority:</span>
              <strong className="text-[#03045e] font-bold">{stats?.priorityLeads ?? 0}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-[#f0f9fc] border border-[#90e0ef]/50 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-slate-600">Active Portals:</span>
              <strong className="text-[#03045e] font-bold">{stats?.activePortalAccounts ?? 0}</strong>
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh database records"
              className="p-2 rounded-xl border border-slate-200 hover:border-[#0077b6] hover:bg-[#caf0f8]/30 text-slate-600 hover:text-[#0077b6] transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#0077b6]' : ''}`} />
            </button>

            {adminUser && onLogout && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="hidden lg:inline-block text-[11px] font-mono text-slate-500 truncate max-w-[150px]">
                  {adminUser.username}
                </span>
                <button
                  onClick={onLogout}
                  title="Lock terminal / Sign out"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="h-3 w-3" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Tier: Desk Navigation Tabs */}
        <nav className="flex items-center gap-2 pt-2.5 pb-2 overflow-x-auto no-scrollbar">
          {/* Add Entity Section Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('add-entity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              currentTab === 'add-entity'
                ? 'bg-[#0077b6] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#03045e] hover:bg-slate-100'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Add Entity / Directory Master</span>
          </button>

          {/* Dispatch Form Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('dispatch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              currentTab === 'dispatch'
                ? 'bg-[#0077b6] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#03045e] hover:bg-slate-100'
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>Patient Intake & Dispatch</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

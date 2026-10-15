import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  Building2,
  UserRound,
  Info,
  HeartPulse,
  LogIn,
  UserPlus,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { SITE_NAME } from '../data/config';
import { Sheet } from './ui/sheet';
import { SearchDialog } from './SearchDialog';
import { AuthDialog } from './AuthDialog';
import { useAuth } from '../lib/auth';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const { user, logout } = useAuth();
  const location = useLocation();
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Hospitals', path: '/hospitals' },
    { label: 'Doctors', path: '/doctors' },
    { label: 'About & Verification', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Close user dropdown if clicked outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#90e0ef]/60 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Brand Wordmark (Single text element in display face, 1 line) */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-[#03045e] hover:text-[#0077b6] transition-colors whitespace-nowrap shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0077b6] to-[#03045e] text-white shadow-xs">
              <HeartPulse className="h-5 w-5 text-[#90e0ef]" />
            </div>
            <span>{SITE_NAME}</span>
          </Link>

          {/* Zone 2: Navigation Links (Single line, whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 hover:text-[#0077b6] ${
                  isActive(link.path)
                    ? 'text-[#0077b6] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0077b6] after:rounded-full'
                    : 'text-slate-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Search Action, Auth Buttons & Mobile Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 hover:border-[#90e0ef] hover:bg-[#caf0f8]/30 hover:text-[#03045e] transition-all cursor-pointer shadow-2xs"
              aria-label="Open search modal"
            >
              <Search className="h-4 w-4 text-[#0077b6]" />
              <span className="hidden sm:inline">Search directory...</span>
              <kbd className="hidden xl:inline-flex h-5 items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 font-mono text-[10px] text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Smart Auth Buttons (Desktop/Tablet) */}
            {user ? (
              /* User Profile Menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-[#03045e] hover:border-[#90e0ef] hover:bg-[#caf0f8]/30 transition-all cursor-pointer shadow-2xs"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-[#0077b6]"
                  />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-xs text-[#03045e] truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#0077b6] bg-[#caf0f8]/50 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="h-3 w-3" />
                        {user.role === 'doctor' ? 'Verified Physician' : 'Registered Member'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Non-authenticated Auth Controls */
              <div className="flex items-center gap-1.5">
                {/* Thin divider */}
                <div className="hidden sm:block h-4 w-px bg-slate-200 mx-0.5" />

                {/* Log In Button */}
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#0077b6] hover:bg-[#caf0f8]/40 rounded-xl border border-transparent hover:border-[#90e0ef]/50 transition-all cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-500" />
                  <span>Log In</span>
                </button>

                {/* Sign Up Button */}
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#0077b6] to-[#03045e] hover:from-[#023e8a] hover:to-[#03045e] rounded-xl shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
                >
                  <UserPlus className="h-3.5 w-3.5 text-[#90e0ef]" />
                  <span>Sign Up</span>
                </button>

                {/* Mobile compact user button */}
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="sm:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 text-slate-700 hover:bg-[#caf0f8]/40 hover:text-[#0077b6] transition-colors cursor-pointer"
                  aria-label="Account Login or Signup"
                >
                  <User className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-[#caf0f8]/50 hover:text-[#03045e] transition-colors cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Auth Dialog Modal (Login & Sign Up) */}
      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} initialMode={authMode} />

      {/* Mobile Drawer Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} side="right">
        <div className="flex flex-col h-full pt-6">
          <div className="flex items-center gap-2 pb-5 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0077b6] text-white">
              <HeartPulse className="h-4 w-4 text-[#90e0ef]" />
            </div>
            <span className="font-extrabold text-lg text-[#03045e]">{SITE_NAME}</span>
          </div>

          {/* Mobile Auth Smart Bar */}
          <div className="pt-4 pb-2">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border border-[#0077b6] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#03045e] truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuth('login');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-500" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuth('signup');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-white bg-gradient-to-r from-[#0077b6] to-[#03045e] rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5 text-[#90e0ef]" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>

          <div className="py-3">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600 hover:bg-[#caf0f8]/40 cursor-pointer"
            >
              <Search className="h-4 w-4 text-[#0077b6]" />
              <span>Search hospitals, doctors...</span>
            </button>
          </div>

          <nav className="flex flex-col space-y-1.5 py-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                isActive('/') ? 'bg-[#caf0f8] text-[#03045e]' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Home</span>
            </Link>
            <Link
              to="/hospitals"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                isActive('/hospitals') ? 'bg-[#caf0f8] text-[#03045e]' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="h-4 w-4 text-[#0077b6]" />
              <span>Hospitals in Pune</span>
            </Link>
            <Link
              to="/doctors"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                isActive('/doctors') ? 'bg-[#caf0f8] text-[#03045e]' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <UserRound className="h-4 w-4 text-[#0077b6]" />
              <span>Consulting Doctors</span>
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                isActive('/about') ? 'bg-[#caf0f8] text-[#03045e]' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Info className="h-4 w-4 text-[#0077b6]" />
              <span>Verification Methodology</span>
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-[#03045e]">Pune, Maharashtra Directory</p>
            <p className="text-[11px] leading-relaxed">
              Objective, non-promotional healthcare information. For emergencies call 112.
            </p>
          </div>
        </div>
      </Sheet>
    </>
  );
}

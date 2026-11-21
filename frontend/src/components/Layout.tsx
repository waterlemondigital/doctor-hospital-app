import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from './Header';
import { Footer } from './Footer';
import { CorrectionDialog } from './CorrectionDialog';
import { initAnalytics, trackPageView } from '../lib/analytics';

export function Layout() {
  const [isCorrectionOpen, setIsCorrectionOpen] = React.useState(false);
  const [correctionSubject, setCorrectionSubject] = React.useState('General Directory Listing');
  const location = useLocation();

  // Initialize analytics once globally on mount
  React.useEffect(() => {
    initAnalytics();
  }, []);

  // Scroll to top and track SPA page views on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Global listener for opening correction dialog from anywhere (e.g. footer or in-page links)
  React.useEffect(() => {
    const handleOpenCorrection = (e: Event) => {
      const customEvent = e as CustomEvent<{ subject?: string }>;
      if (customEvent.detail?.subject) {
        setCorrectionSubject(customEvent.detail.subject);
      } else {
        setCorrectionSubject('General MedVexa Listing');
      }
      setIsCorrectionOpen(true);
    };

    window.addEventListener('open-correction-dialog', handleOpenCorrection);
    return () => {
      window.removeEventListener('open-correction-dialog', handleOpenCorrection);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* Sticky Header */}
      <Header />

      {/* Main Layout Container - Full page width with balanced side padding */}
      <div className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 py-6">
        <main className="w-full min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Global Correction / Error Report Dialog */}
      <CorrectionDialog
        open={isCorrectionOpen}
        onOpenChange={setIsCorrectionOpen}
        defaultSubject={correctionSubject}
      />

      {/* Accessible Toast Notifications */}
      <Toaster position="top-right" richColors />

      {/* Footer on Deep-Twilight background */}
      <Footer />
    </div>
  );
}

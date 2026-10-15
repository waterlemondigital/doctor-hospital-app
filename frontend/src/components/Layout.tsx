import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from './Header';
import { Footer } from './Footer';
import { AdSlot } from './AdSlot';
import { CorrectionDialog } from './CorrectionDialog';

export function Layout() {
  const [isCorrectionOpen, setIsCorrectionOpen] = React.useState(false);
  const [correctionSubject, setCorrectionSubject] = React.useState('General Directory Listing');
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Global listener for opening correction dialog from anywhere (e.g. footer or in-page links)
  React.useEffect(() => {
    const handleOpenCorrection = (e: Event) => {
      const customEvent = e as CustomEvent<{ subject?: string }>;
      if (customEvent.detail?.subject) {
        setCorrectionSubject(customEvent.detail.subject);
      } else {
        setCorrectionSubject('General HealthDiscover Listing');
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

      {/* Main Layout Container with 3-column desktop layout on xl+ */}
      <div className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start justify-center gap-6">
          {/* Left Desktop Advertisement Rail (xl screens and up) */}
          <aside className="hidden xl:block w-[180px] shrink-0 sticky top-24 self-start space-y-4">
            <AdSlot size="sidebar-tall" label="Sponsored" />
            <div className="text-[10px] text-slate-400 text-center">
              Advertisement rail · Decoupled from clinical rankings
            </div>
          </aside>

          {/* Central Main Content Area */}
          <main className="flex-1 w-full max-w-5xl min-w-0">
            <Outlet />
          </main>

          {/* Right Desktop Advertisement Rail (xl screens and up) */}
          <aside className="hidden xl:block w-[180px] shrink-0 sticky top-24 self-start space-y-4">
            <AdSlot size="sidebar-square" label="Sponsored" />
            <AdSlot size="sidebar-square" label="Advertisement" />
            <div className="text-[10px] text-slate-400 text-center">
              Partner Placement
            </div>
          </aside>
        </div>
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

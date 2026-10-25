import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { Header } from './components/Header';
import { PatientDispatchForm } from './components/PatientDispatchForm';
import { LeadsPipeline } from './components/LeadsPipeline';
import { TargetDirectory } from './components/TargetDirectory';
import { TargetPortalModal } from './components/TargetPortalModal';
import { AdminLoginGate } from './components/AdminLoginGate';
import { AddEntitySection } from './components/AddEntitySection';
import {
  AdminStats,
  PatientLead,
  TargetDoctor,
  TargetHospital,
  TargetLaboratory,
  TargetWellness,
  TargetType,
} from './types';
import {
  fetchAdminStats,
  fetchAdminTargets,
  fetchPatientLeads,
} from './api/client';

export function App() {
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('medvexa_admin_session') || sessionStorage.getItem('medvexa_admin_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.user || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [currentTab, setCurrentTab] = useState<'add-entity' | 'dispatch'>('add-entity');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [doctors, setDoctors] = useState<TargetDoctor[]>([]);
  const [hospitals, setHospitals] = useState<TargetHospital[]>([]);
  const [laboratories, setLaboratories] = useState<TargetLaboratory[]>([]);
  const [wellness, setWellness] = useState<TargetWellness[]>([]);
  const [leads, setLeads] = useState<PatientLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Target Portal Dashboard Preview Modal
  const [previewTarget, setPreviewTarget] = useState<{
    type: TargetType;
    id: string;
    name: string;
  } | null>(null);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, targetsData, leadsData] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchAdminTargets().catch(() => ({ doctors: [], hospitals: [], laboratories: [], wellness: [], totalCount: 0 })),
        fetchPatientLeads().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setDoctors(targetsData.doctors || []);
      setHospitals(targetsData.hospitals || []);
      setLaboratories(targetsData.laboratories || []);
      setWellness(targetsData.wellness || []);
      setLeads(leadsData || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to sync live data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleLeadCreated = (newLead: PatientLead) => {
    setLeads((prev) => [newLead, ...prev]);
    // Increment stats locally
    setStats((prev) =>
      prev
        ? {
            ...prev,
            totalLeads: prev.totalLeads + 1,
            todayLeads: prev.todayLeads + 1,
            priorityLeads:
              newLead.urgency === 'priority' || newLead.urgency === 'emergency'
                ? prev.priorityLeads + 1
                : prev.priorityLeads,
          }
        : null
    );
  };

  const handleLeadUpdated = (updatedLead: PatientLead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
  };

  const handlePreviewTarget = (type: TargetType, id: string, name: string) => {
    setPreviewTarget({ type, id, name });
  };

  const handleLogout = () => {
    localStorage.removeItem('medvexa_admin_session');
    sessionStorage.removeItem('medvexa_admin_session');
    setAdminUser(null);
    toast.info('Terminal locked. Session closed.');
  };

  // If not authenticated, show security login gate
  if (!adminUser) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <AdminLoginGate onLoginSuccess={(user) => setAdminUser(user)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#90e0ef]/40 selection:text-[#03045e]">
      <Toaster position="top-right" richColors />

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        stats={stats}
        isLoading={isLoading}
        onRefresh={loadAllData}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dispatch' && (
          <PatientDispatchForm
            doctors={doctors}
            hospitals={hospitals}
            laboratories={laboratories}
            wellness={wellness}
            onLeadCreated={handleLeadCreated}
            onPreviewTarget={handlePreviewTarget}
          />
        )}

        {currentTab === 'add-entity' && (
          <AddEntitySection
            doctors={doctors}
            hospitals={hospitals}
            laboratories={laboratories}
            wellness={wellness}
            onEntityCreated={loadAllData}
          />
        )}
      </main>

      {/* Target Doctor/Hospital Dashboard Preview Modal */}
      {previewTarget && (
        <TargetPortalModal
          targetType={previewTarget.type}
          targetId={previewTarget.id}
          targetName={previewTarget.name}
          onClose={() => setPreviewTarget(null)}
          onLeadUpdated={handleLeadUpdated}
        />
      )}

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>
            &copy; {new Date().getFullYear()} MedVexa Healthcare Systems. Inbound Patient Consultation & Lead Dispatch Engine.
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>{doctors.length} Doctors Populated</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>{hospitals.length} Hospitals Populated</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;

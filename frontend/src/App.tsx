import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { HospitalsPage } from './pages/HospitalsPage';
import { HospitalDetailPage } from './pages/HospitalDetailPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { AboutPage } from './pages/AboutPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnaniPage } from './pages/UnaniPage';
import { HomeopathyPage } from './pages/HomeopathyPage';
import { AyurvedicPage } from './pages/AyurvedicPage';
import { LaboratoriesPage } from './pages/LaboratoriesPage';
import { LaboratoryDetailPage } from './pages/LaboratoryDetailPage';
import { WellnessPage } from './pages/WellnessPage';
import { WellnessDetailPage } from './pages/WellnessDetailPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AuthProvider } from './lib/auth';
import { fetchHospitals } from './api/hospitals';
import { fetchDoctors } from './api/doctors';
import { fetchLaboratories } from './api/laboratories';
import { fetchWellnessCenters } from './api/wellness';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="hospitals" element={<HospitalsPage />} />
            <Route path="hospitals/:slug" element={<HospitalDetailPage />} />
            <Route path="doctors" element={<DoctorsPage />} />
            <Route path="doctors/:slug" element={<DoctorDetailPage />} />
            <Route path="doctor/dashboard" element={<DoctorDashboardPage />} />
            <Route path="portal/dashboard" element={<DoctorDashboardPage />} />
            <Route path="laboratories" element={<LaboratoriesPage />} />
            <Route path="laboratories/:slug" element={<LaboratoryDetailPage />} />
            <Route path="wellness-centers" element={<WellnessPage />} />
            <Route path="wellness-centers/:slug" element={<WellnessDetailPage />} />
            <Route path="unani" element={<UnaniPage />} />
            <Route path="homeopathy" element={<HomeopathyPage />} />
            <Route path="ayurvedic" element={<AyurvedicPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="medical-disclaimer" element={<DisclaimerPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

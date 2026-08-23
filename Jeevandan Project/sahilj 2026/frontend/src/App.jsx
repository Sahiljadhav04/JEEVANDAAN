import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Donor
import DonorDashboard from './pages/Donor/DonorDashboard';
import DonorProfile from './pages/Donor/DonorProfile';
import DonationHistory from './pages/Donor/DonationHistory';
import FindCamps from './pages/Donor/FindCamps';
import EmergencyRequests from './pages/Donor/EmergencyRequests';
import ScheduleDonation from './pages/Donor/ScheduleDonation';
import HealthQuiz from './pages/Donor/HealthQuiz';
import RewardsBadges from './pages/Donor/RewardsBadges';
import ImpactTracker from './pages/Donor/ImpactTracker';
import DonorCommunity from './pages/Donor/DonorCommunity';
import Notifications from './pages/Donor/Notifications';

// Blood Bank
import BloodBankDashboard from './pages/BloodBank/BloodBankDashboard';
import InventoryManagement from './pages/BloodBank/InventoryManagement';
import QualityControl from './pages/BloodBank/QualityControl';
import CampManagement from './pages/BloodBank/CampManagement';
import DonorCheckin from './pages/BloodBank/DonorCheckin';
import HospitalOrders from './pages/BloodBank/HospitalOrders';

// Hospital
import HospitalDashboard from './pages/Hospital/HospitalDashboard';
import PatientRequest from './pages/Hospital/PatientRequest';
import RequestTracker from './pages/Hospital/RequestTracker';
import TransfusionLogs from './pages/Hospital/TransfusionLogs';
import EmergencyBroadcast from './pages/Hospital/EmergencyBroadcast';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function DashboardLayout({ role, children }) {
  return (
    <div className="app-layout">
      <Sidebar role={role} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/signup/:role" element={<Signup />} />

      {/* Donor Routes */}
      <Route path="/donor/*" element={
        <ProtectedRoute role="donor">
          <DashboardLayout role="donor">
            <Routes>
              <Route path="dashboard" element={<DonorDashboard />} />
              <Route path="profile" element={<DonorProfile />} />
              <Route path="history" element={<DonationHistory />} />
              <Route path="camps" element={<FindCamps />} />
              <Route path="emergency" element={<EmergencyRequests />} />
              <Route path="schedule" element={<ScheduleDonation />} />
              <Route path="health-quiz" element={<HealthQuiz />} />
              <Route path="rewards" element={<RewardsBadges />} />
              <Route path="impact" element={<ImpactTracker />} />
              <Route path="community" element={<DonorCommunity />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Blood Bank Routes */}
      <Route path="/bloodbank/*" element={
        <ProtectedRoute role="bloodbank">
          <DashboardLayout role="bloodbank">
            <Routes>
              <Route path="dashboard" element={<BloodBankDashboard />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="quality" element={<QualityControl />} />
              <Route path="camps" element={<CampManagement />} />
              <Route path="checkin" element={<DonorCheckin />} />
              <Route path="orders" element={<HospitalOrders />} />
              <Route path="reports" element={<BloodBankDashboard />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Hospital Routes */}
      <Route path="/hospital/*" element={
        <ProtectedRoute role="hospital">
          <DashboardLayout role="hospital">
            <Routes>
              <Route path="dashboard" element={<HospitalDashboard />} />
              <Route path="request" element={<PatientRequest />} />
              <Route path="tracker" element={<RequestTracker />} />
              <Route path="transfusions" element={<TransfusionLogs />} />
              <Route path="emergency" element={<EmergencyBroadcast />} />
              <Route path="inventory" element={<HospitalDashboard />} />
              <Route path="reports" element={<HospitalDashboard />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import HealthProtocolDashboard from './components/HealthProtocolDashboard';
import ProtocolPlansLibrary from './components/ProtocolPlansLibrary';
import Admin from './pages/Admin';
import Trainer from './pages/Trainer';
import AdminProfile from './pages/AdminProfile';
import TrainerProfile from './pages/TrainerProfile';
import CustomerProfile from './pages/CustomerProfile';
import Customer from './pages/Customer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MobileNavigation } from './components/MobileNavigation';
import { useResponsive } from './hooks/useResponsive';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

const PrivateRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'trainer':
        return <Navigate to="/trainer" replace />;
      case 'customer':
        return <Navigate to="/my-meal-plans" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// Profile redirect component
const ProfileRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/" replace />;
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/profile" replace />;
    case 'trainer':
      return <Navigate to="/trainer/profile" replace />;
    case 'customer':
      return <Navigate to="/customer/profile" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <PWAInstallPrompt />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/protocols" 
              element={
                <PrivateRoute allowedRoles={['admin', 'trainer']}>
                  <HealthProtocolDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/protocol-plans" 
              element={
                <PrivateRoute allowedRoles={['admin', 'trainer']}>
                  <ProtocolPlansLibrary />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/trainer" 
              element={
                <PrivateRoute allowedRoles={['trainer']}>
                  <Trainer />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/trainer/health-protocols" 
              element={
                <PrivateRoute allowedRoles={['trainer']}>
                  <HealthProtocolDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Admin />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/profile" 
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/trainer/profile" 
              element={
                <PrivateRoute allowedRoles={['trainer']}>
                  <TrainerProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/customer/profile" 
              element={
                <PrivateRoute allowedRoles={['customer']}>
                  <CustomerProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-meal-plans" 
              element={
                <PrivateRoute allowedRoles={['customer']}>
                  <Customer />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  {/* Redirect to role-specific profile */}
                  <ProfileRedirect />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
import React from 'react';
import { Shield, LogOut, Home } from 'lucide-react';
import { MobileNavigation } from './mobile/MobileNavigation';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/responsive.css';

interface ResponsiveHeaderProps {
  title: string;
  showAdminButton?: boolean;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ title, showAdminButton = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Render both mobile and desktop versions, use CSS to show/hide
  return (
    <>
      {/* Mobile Header - visible only on small screens */}
      <nav className="mobile-header bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center">
            <MobileNavigation />
            <Shield className="h-5 w-5 text-blue-600 ml-2 mr-2" />
            <h1 className="text-base font-semibold text-gray-900">
              {title === 'Health Protocol Management System' ? 'Health Protocols' : title}
            </h1>
          </div>
        </div>
      </nav>

      {/* Desktop Header - visible only on medium+ screens */}
      <nav className="desktop-header bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email}
              </span>
              {showAdminButton && user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Admin
                </button>
              )}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
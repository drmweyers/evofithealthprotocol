import React from 'react';
import { Shield, LogOut, Home, User, FileText } from 'lucide-react';
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

  // Single responsive header that adapts to screen size
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="px-4 py-3 sm:py-0">
        <div className="sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between sm:h-16">
            {/* Mobile menu and logo */}
            <div className="flex items-center">
              <div className="sm:hidden">
                <MobileNavigation />
              </div>
              <Shield className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600 ml-2 mr-2 sm:ml-0 sm:mr-3" />
              <h1 className="text-base sm:text-xl font-semibold sm:font-bold text-gray-900">
                {title === 'Health Protocol Management System' ? 'Health Protocols' : title}
              </h1>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email}
              </span>
              
              {/* Health Protocols link for trainers and admins */}
              {(user?.role === 'trainer' || user?.role === 'admin') && (
                <Button
                  onClick={() => navigate('/protocols')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-gray-900"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Health Protocols
                </Button>
              )}
              
              <Button
                onClick={() => navigate('/profile')}
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900"
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </Button>
              {showAdminButton && user?.role === 'admin' && (
                <Button
                  onClick={() => navigate('/admin')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Admin
                </Button>
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
      </div>
    </nav>
  );
};
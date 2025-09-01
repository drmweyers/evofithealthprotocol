import React from 'react';
import { Shield, LogOut, Home, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useState } from 'react';
import { Activity, FileText, Users, Settings, ClipboardList } from 'lucide-react';

interface ResponsiveHeaderSimpleProps {
  title: string;
  showAdminButton?: boolean;
}

export const ResponsiveHeaderSimple: React.FC<ResponsiveHeaderSimpleProps> = ({ title, showAdminButton = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const navigationItems = [
    { label: 'Dashboard', icon: Home, path: user?.role === 'admin' ? '/admin' : '/trainer', roles: ['admin', 'trainer'] },
    { label: 'Health Protocols', icon: FileText, path: '/protocols', roles: ['admin', 'trainer'] },
    { label: 'Customers', icon: Users, path: '/trainer', roles: ['trainer'] },
    { label: 'Meal Plans', icon: ClipboardList, path: '/my-meal-plans', roles: ['customer'] },
    { label: 'Progress', icon: Activity, path: '/progress', roles: ['customer'] },
    { label: 'Profile', icon: Settings, path: '/profile', roles: ['admin', 'trainer', 'customer'] },
  ];

  const mobileTitle = title === 'Health Protocol Management System' ? 'Health Protocols' : title;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div style={{ display: 'block' }}>
        {/* Mobile Header - using inline styles for reliable rendering */}
        <div style={{ 
          display: 'block',
          '@media (min-width: 768px)': { display: 'none' }
        }} className="md:hidden">
          <div className="px-4 py-3">
            <div className="flex items-center">
              {/* Mobile Navigation Menu Button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto w-auto"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                
                <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Sheet Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                          <Activity className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-lg">EvoFit Health</span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user?.name || user?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                          </p>
                          <p className="text-xs text-primary capitalize font-medium">
                            {user?.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 py-4 overflow-y-auto">
                      <nav className="space-y-1 px-3">
                        {navigationItems
                          .filter(item => !item.roles || item.roles.includes(user?.role || ''))
                          .map((item) => {
                            const Icon = item.icon;
                            
                            return (
                              <Button
                                key={item.path}
                                variant="ghost"
                                className="w-full justify-start px-3 py-2.5 h-auto text-left hover:bg-slate-100"
                                onClick={() => handleNavigate(item.path)}
                              >
                                <Icon className="h-5 w-5 mr-3 shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </Button>
                            );
                          })}
                      </nav>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-2.5 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5 mr-3 shrink-0" />
                        <span>Sign Out</span>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Shield className="h-5 w-5 text-blue-600 ml-2 mr-2" />
              <h1 className="text-base font-semibold text-gray-900">{mobileTitle}</h1>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div style={{ 
          display: 'none',
          '@media (min-width: 768px)': { display: 'block' }
        }} className="hidden md:block">
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
        </div>
      </div>
    </nav>
  );
};
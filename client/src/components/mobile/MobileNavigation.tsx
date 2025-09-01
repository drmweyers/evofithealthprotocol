import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu, X, Home, FileText, Users, Settings, LogOut, Activity, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileNavigationProps {
  currentPath?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems = [
    { label: 'Dashboard', icon: Home, path: user?.role === 'admin' ? '/admin' : '/trainer', roles: ['admin', 'trainer'] },
    { label: 'Health Protocols', icon: FileText, path: '/protocols', roles: ['admin', 'trainer'] },
    { label: 'Customers', icon: Users, path: '/trainer', roles: ['trainer'] },
    { label: 'Meal Plans', icon: ClipboardList, path: '/my-meal-plans', roles: ['customer'] },
    { label: 'Progress', icon: Activity, path: '/progress', roles: ['customer'] },
    { label: 'Profile', icon: Settings, path: '/profile', roles: ['admin', 'trainer', 'customer'] },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">EvoFit Health</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-1 h-auto w-auto"
            >
              <X className="h-5 w-5" />
            </Button>
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
                  const isActive = currentPath === item.path;
                  
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start px-3 py-2.5 h-auto text-left ${
                        isActive ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'
                      }`}
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
  );
};
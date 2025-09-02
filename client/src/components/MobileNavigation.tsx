import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Users, Calendar, FileText, BarChart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive, useTouchGestures } from '../hooks/useResponsive';
import { cn } from '../lib/utils';

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useResponsive();
  const gesture = useTouchGestures(drawerRef);

  useEffect(() => {
    if (gesture.type === 'swipe-left') {
      setIsOpen(false);
    }
  }, [gesture]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isMobile && !isTablet) {
    return null;
  }

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { path: '/admin/trainers', label: 'Trainers', icon: Users },
          { path: '/admin/customers', label: 'Customers', icon: Users },
          { path: '/admin/recipes', label: 'Recipes', icon: FileText },
          { path: '/admin/meal-plans', label: 'Meal Plans', icon: Calendar },
          { path: '/admin/analytics', label: 'Analytics', icon: BarChart },
          { path: '/admin/settings', label: 'Settings', icon: Settings },
        ];
      case 'trainer':
        return [
          ...baseItems,
          { path: '/trainer/clients', label: 'Clients', icon: Users },
          { path: '/trainer/protocols', label: 'Health Protocols', icon: FileText },
          { path: '/trainer/meal-plans', label: 'Meal Plans', icon: Calendar },
          { path: '/trainer/progress', label: 'Progress Tracking', icon: BarChart },
          { path: '/trainer/profile', label: 'Profile', icon: Settings },
        ];
      case 'customer':
        return [
          ...baseItems,
          { path: '/customer/protocol', label: 'My Protocol', icon: FileText },
          { path: '/customer/meal-plan', label: 'Meal Plan', icon: Calendar },
          { path: '/customer/progress', label: 'Progress', icon: BarChart },
          { path: '/customer/profile', label: 'Profile', icon: Settings },
        ];
      default:
        return baseItems;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg",
          "touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center",
          "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
          "md:hidden",
          className
        )}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav
        ref={drawerRef}
        className={cn(
          "fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800",
          "transform transition-transform duration-300 ease-in-out z-45",
          "shadow-xl overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:hidden"
        )}
        aria-label="Mobile navigation"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              EvoFit Health
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          {user && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as</p>
              <p className="font-medium text-gray-800 dark:text-white">{user.name || user.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">{user.role}</p>
            </div>
          )}
        </div>

        <div className="py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-6 py-4 transition-colors",
                  "touch-manipulation min-h-[48px]",
                  "hover:bg-gray-50 dark:hover:bg-gray-700",
                  isActive && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                  )} />
                  <span className={cn(
                    "font-medium",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                  )}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            );
          })}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center justify-between w-full px-4 py-3",
              "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
              "rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30",
              "transition-colors touch-manipulation min-h-[48px]"
            )}
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}
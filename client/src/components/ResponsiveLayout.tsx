import React from 'react';
import { MobileNavigation } from './MobileNavigation';
import { useResponsive } from '../hooks/useResponsive';
import { cn } from '../lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showMobileNav?: boolean;
  className?: string;
}

export function ResponsiveLayout({ 
  children, 
  showMobileNav = true,
  className 
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {showMobileNav && (isMobile || isTablet) && (
        <MobileNavigation />
      )}
      <div className={cn(
        "transition-all duration-300",
        showMobileNav && (isMobile || isTablet) && "pt-16"
      )}>
        {children}
      </div>
    </div>
  );
}
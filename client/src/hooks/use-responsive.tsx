import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
}

export function useResponsive(): ResponsiveBreakpoints {
  // Initialize with actual viewport values if window is available
  const getInitialState = (): ResponsiveBreakpoints => {
    if (typeof window === 'undefined') {
      // SSR fallback - assume mobile for better UX
      return {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenSize: 'sm',
        isTouchDevice: false,
        orientation: 'portrait'
      };
    }
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      screenSize: width < 480 ? 'xs' :
                 width < 640 ? 'sm' :
                 width < 768 ? 'md' :
                 width < 1024 ? 'lg' :
                 width < 1280 ? 'xl' : '2xl',
      isTouchDevice,
      orientation: width > height ? 'landscape' : 'portrait'
    };
  };

  const [responsive, setResponsive] = useState<ResponsiveBreakpoints>(getInitialState());

  useEffect(() => {
    const updateResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const breakpoints = {
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenSize: width < 480 ? 'xs' as const :
                   width < 640 ? 'sm' as const :
                   width < 768 ? 'md' as const :
                   width < 1024 ? 'lg' as const :
                   width < 1280 ? 'xl' as const : '2xl' as const,
        isTouchDevice,
        orientation: width > height ? 'landscape' as const : 'portrait' as const
      };
      
      setResponsive(breakpoints);
    };

    // Initial check
    updateResponsive();

    // Listen for resize events
    window.addEventListener('resize', updateResponsive);
    window.addEventListener('orientationchange', updateResponsive);

    return () => {
      window.removeEventListener('resize', updateResponsive);
      window.removeEventListener('orientationchange', updateResponsive);
    };
  }, []);

  return responsive;
}
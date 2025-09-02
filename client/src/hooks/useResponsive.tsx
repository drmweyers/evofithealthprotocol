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
  const [responsive, setResponsive] = useState<ResponsiveBreakpoints>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    return {
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024,
      screenSize: getScreenSize(width),
      isTouchDevice: typeof window !== 'undefined' && 
        ('ontouchstart' in window || navigator.maxTouchPoints > 0),
      orientation: width > height ? 'landscape' : 'portrait'
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setResponsive({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        screenSize: getScreenSize(width),
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    const handleOrientationChange = () => {
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return responsive;
}

function getScreenSize(width: number): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    setMatches(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

export function useTouchGestures(elementRef: React.RefObject<HTMLElement>) {
  const [gesture, setGesture] = useState<{
    type: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | null;
    deltaX: number;
    deltaY: number;
  }>({ type: null, deltaX: 0, deltaY: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const threshold = 50;

      let gestureType: typeof gesture.type = null;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          gestureType = deltaX > 0 ? 'swipe-right' : 'swipe-left';
        }
      } else {
        if (Math.abs(deltaY) > threshold) {
          gestureType = deltaY > 0 ? 'swipe-down' : 'swipe-up';
        }
      }

      setGesture({ type: gestureType, deltaX, deltaY });
      
      setTimeout(() => {
        setGesture({ type: null, deltaX: 0, deltaY: 0 });
      }, 300);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef]);

  return gesture;
}
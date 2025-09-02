import React, { useRef, useEffect, useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { cn } from '../lib/utils';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';

interface MobileChartProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'ultrawide';
  enableFullscreen?: boolean;
}

export function MobileChart({
  children,
  title,
  className,
  aspectRatio = 'video',
  enableFullscreen = true,
}: MobileChartProps) {
  const { isMobile, isTablet, orientation } = useResponsive();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'wide':
        return 'aspect-[21/9]';
      case 'ultrawide':
        return 'aspect-[32/9]';
      default:
        return 'aspect-video';
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Adjust chart container for mobile/tablet
  const containerClass = cn(
    "relative w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
    !isFullscreen && getAspectRatioClass(),
    isFullscreen && "fixed inset-0 z-50 flex flex-col",
    className
  );

  const chartWrapperClass = cn(
    "w-full h-full",
    isFullscreen && "flex-1",
    (isMobile || isTablet) && "touch-manipulation"
  );

  return (
    <div ref={containerRef} className={containerClass}>
      {title && (
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {enableFullscreen && (isMobile || isTablet) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8 sm:h-9 sm:w-9"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}
      
      <div className={chartWrapperClass}>
        <div className="w-full h-full p-2 sm:p-4">
          {/* Chart library will render here */}
          {children}
        </div>
      </div>

      {isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
          >
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Mobile-optimized chart legend component
export function MobileChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string; value?: string | number }[];
  className?: string;
}) {
  const { isMobile } = useResponsive();

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 sm:gap-4 p-2 sm:p-3",
        isMobile && "justify-center",
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
        >
          <div
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
          {item.value !== undefined && (
            <span className="font-semibold text-gray-900 dark:text-white">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Mobile-optimized stat card for charts
export function MobileChartStat({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}: {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {change && (
          <p className={cn("text-xs sm:text-sm mt-1", getChangeColor())}>
            {change}
          </p>
        )}
      </div>
      {icon && (
        <div className="ml-3 flex-shrink-0 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
    </div>
  );
}
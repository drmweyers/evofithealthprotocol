import React, { useState, useEffect } from 'react';
import { Download, X, ZoomIn, ZoomOut, RotateCw, Maximize2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { MobileButton } from './ui/mobile-button';
import { useResponsive } from '../hooks/useResponsive';
import { cn } from '../lib/utils';
import { useToast } from '../hooks/use-toast';

interface MobilePDFViewerProps {
  pdfUrl: string;
  title?: string;
  onClose?: () => void;
  className?: string;
  allowDownload?: boolean;
  fallbackUrl?: string;
}

export function MobilePDFViewer({
  pdfUrl,
  title = 'Document',
  onClose,
  className,
  allowDownload = true,
  fallbackUrl,
}: MobilePDFViewerProps) {
  const { isMobile, isTablet } = useResponsive();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // For mobile devices, we'll use different strategies
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  useEffect(() => {
    // Preload PDF to check availability
    fetch(pdfUrl, { method: 'HEAD' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('PDF not found');
        }
        setIsLoading(false);
      })
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
      });
  }, [pdfUrl]);

  const handleDownload = async () => {
    try {
      // For mobile devices, open in new tab which usually triggers download
      if (isMobile || isTablet) {
        window.open(pdfUrl, '_blank');
        toast({
          title: "Download Started",
          description: "Your PDF download has begun.",
        });
      } else {
        // Desktop download
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Complete",
          description: `${title}.pdf has been downloaded.`,
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (hasError) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg",
        className
      )}>
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Unable to Load PDF
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
          The document could not be loaded. Please try downloading it instead.
        </p>
        {allowDownload && fallbackUrl && (
          <MobileButton onClick={() => window.open(fallbackUrl, '_blank')}>
            Download PDF
          </MobileButton>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-center p-8",
        className
      )}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mobile-specific viewer
  if (isMobile || isTablet) {
    return (
      <div className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-900",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {allowDownload && (
              <MobileButton
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                aria-label="Download PDF"
              >
                <Download className="h-5 w-5" />
              </MobileButton>
            )}
            {onClose && (
              <MobileButton
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </MobileButton>
            )}
          </div>
        </div>

        {/* Mobile PDF Display Options */}
        <div className="flex-1 overflow-hidden">
          {isIOS ? (
            // iOS: Use inline display with iframe
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={title}
            />
          ) : isAndroid ? (
            // Android: Google Docs viewer as fallback
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
              className="w-full h-full border-0"
              title={title}
            />
          ) : (
            // Other mobile browsers: Use object tag
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <embed
                src={pdfUrl}
                type="application/pdf"
                className="w-full h-full"
              />
            </object>
          )}
        </div>

        {/* Mobile Action Bar */}
        <div className="flex items-center justify-around p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <MobileButton
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="flex flex-col items-center gap-1"
          >
            <ZoomOut className="h-5 w-5" />
            <span className="text-xs">Zoom -</span>
          </MobileButton>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {zoom}%
          </span>
          <MobileButton
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="flex flex-col items-center gap-1"
          >
            <ZoomIn className="h-5 w-5" />
            <span className="text-xs">Zoom +</span>
          </MobileButton>
          <MobileButton
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="flex flex-col items-center gap-1"
          >
            <Maximize2 className="h-5 w-5" />
            <span className="text-xs">Full</span>
          </MobileButton>
        </div>
      </div>
    );
  }

  // Desktop viewer
  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden",
      className
    )}>
      {/* Desktop Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4 mr-1" />
            Zoom Out
          </Button>
          <span className="px-3 text-sm text-gray-600 dark:text-gray-400">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4 mr-1" />
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Rotate
          </Button>
          {allowDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop PDF Display */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-950">
        <div
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top left',
            transition: 'transform 0.3s ease',
          }}
        >
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full min-h-screen"
          >
            <embed
              src={pdfUrl}
              type="application/pdf"
              className="w-full min-h-screen"
            />
          </object>
        </div>
      </div>
    </div>
  );
}

// Mobile PDF Preview Card
export function MobilePDFCard({
  title,
  description,
  pdfUrl,
  thumbnailUrl,
  size,
  onView,
  onDownload,
  className,
}: {
  title: string;
  description?: string;
  pdfUrl: string;
  thumbnailUrl?: string;
  size?: string;
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}) {
  const { isMobile } = useResponsive();

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
      "hover:shadow-md transition-shadow cursor-pointer",
      className
    )}
    onClick={onView}
    >
      <div className="flex-shrink-0">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-12 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-16 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center">
            <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {description}
          </p>
        )}
        {size && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {size}
          </p>
        )}
      </div>

      {isMobile && (
        <MobileButton
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDownload?.();
          }}
          className="flex-shrink-0"
        >
          <Download className="h-5 w-5" />
        </MobileButton>
      )}
    </div>
  );
}
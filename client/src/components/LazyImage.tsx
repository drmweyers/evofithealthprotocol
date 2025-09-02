import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3C/svg%3E',
  fallback = '/images/placeholder.jpg',
  aspectRatio,
  objectFit = 'cover',
  priority = false,
  onLoad,
  onError,
  className,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (priority) {
      // Load immediately for priority images
      loadImage();
      return;
    }

    // Set up Intersection Observer for lazy loading
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src]);

  const loadImage = () => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setImageSrc(fallback);
      setIsLoading(false);
      setHasError(true);
      onError?.();
    };

    img.src = src;
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-100 dark:bg-gray-800",
        getAspectRatioClass(),
        className
      )}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          `object-${objectFit}`
        )}
        loading={priority ? 'eager' : 'lazy'}
        {...props}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full" />
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Optimized image component for mobile avatars
export function LazyAvatar({
  src,
  alt,
  size = 'md',
  className,
  ...props
}: {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
} & Omit<LazyImageProps, 'aspectRatio'>) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn(
        "rounded-full",
        sizeClasses[size],
        className
      )}
      aspectRatio="square"
      objectFit="cover"
      {...props}
    />
  );
}

// Progressive image loading for hero images
export function ProgressiveImage({
  lowResSrc,
  highResSrc,
  alt,
  className,
  ...props
}: {
  lowResSrc: string;
  highResSrc: string;
  alt: string;
  className?: string;
} & Omit<LazyImageProps, 'src' | 'placeholder'>) {
  const [currentSrc, setCurrentSrc] = useState(lowResSrc);
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(highResSrc);
      setIsHighResLoaded(true);
    };
    img.src = highResSrc;
  }, [highResSrc]);

  return (
    <div className={cn("relative", className)}>
      <LazyImage
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-all duration-500",
          !isHighResLoaded && "filter blur-sm scale-105"
        )}
        {...props}
      />
    </div>
  );
}
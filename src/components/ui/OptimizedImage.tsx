import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  sizes = '100vw',
  priority = false,
           fallbackSrc = '/images/new/homepage.jpg',
         placeholder = '/images/new/homepage.jpg',
  onLoad,
  onError,
  loading = 'lazy',
  decoding = 'async'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        setHasError(true);
        setImageSrc(fallbackSrc);
        onError?.();
      };
      img.src = src;
    }
  }, [isInView, src, fallbackSrc, isLoaded, hasError, onLoad, onError]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ 
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Main Image */}
      <img
        ref={imgRef}
        src={isInView ? imageSrc : placeholder}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto'
        }}
      />
      
      {/* Loading Indicator */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-4 border-[#57BBB6] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

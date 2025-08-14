import { useState, useEffect, useCallback } from 'react';

interface ImagePreloaderOptions {
  priority?: boolean;
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: () => void;
  onError?: (error: Error, src: string) => void;
}

interface PreloadResult {
  isLoaded: boolean;
  progress: number;
  errors: string[];
  preloadImage: (src: string) => Promise<void>;
  preloadMultiple: (srcs: string[]) => Promise<void>;
}

export const useImagePreloader = (options: ImagePreloaderOptions = {}): PreloadResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const preloadImage = useCallback(async (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        setLoadedCount(prev => {
          const newCount = prev + 1;
          const newProgress = (newCount / totalCount) * 100;
          setProgress(newProgress);
          
          if (options.onProgress) {
            options.onProgress(newCount, totalCount);
          }
          
          if (newCount === totalCount) {
            setIsLoaded(true);
            if (options.onComplete) {
              options.onComplete();
            }
          }
          
          return newCount;
        });
        resolve();
      };
      
      img.onerror = (error) => {
        const errorMessage = `Failed to load image: ${src}`;
        setErrors(prev => [...prev, errorMessage]);
        
        if (options.onError) {
          options.onError(new Error(errorMessage), src);
        }
        
        // Still count as loaded to avoid blocking
        setLoadedCount(prev => {
          const newCount = prev + 1;
          const newProgress = (newCount / totalCount) * 100;
          setProgress(newProgress);
          
          if (newCount === totalCount) {
            setIsLoaded(true);
            if (options.onComplete) {
              options.onComplete();
            }
          }
          
          return newCount;
        });
        
        resolve();
      };
      
      img.src = src;
    });
  }, [options, totalCount]);

  const preloadMultiple = useCallback(async (srcs: string[]): Promise<void> => {
    if (srcs.length === 0) {
      setIsLoaded(true);
      setProgress(100);
      return;
    }

    setTotalCount(srcs.length);
    setLoadedCount(0);
    setProgress(0);
    setErrors([]);
    setIsLoaded(false);

    // Preload all images concurrently
    const preloadPromises = srcs.map(src => preloadImage(src));
    
    try {
      await Promise.all(preloadPromises);
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  }, [preloadImage]);

  // Preload critical images on mount if priority is true
  useEffect(() => {
    if (options.priority) {
               const criticalImages = [
           '/images/new/hero.jpg',
           '/images/new/hero2.jpg',
           '/images/new/hero3.jpg'
         ];
      preloadMultiple(criticalImages);
    }
  }, [options.priority, preloadMultiple]);

  return {
    isLoaded,
    progress,
    errors,
    preloadImage,
    preloadMultiple
  };
};

export default useImagePreloader;

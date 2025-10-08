import { useState, useEffect } from 'react';

// Enhanced device detection hook
export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouch: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
    screenSize: 'unknown' as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'unknown',
    userAgent: '',
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    hasPWA: false,
    isStandalone: false
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      // Screen size detection
      let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'unknown' = 'unknown';
      if (width < 375) screenSize = 'xs';
      else if (width < 640) screenSize = 'sm';
      else if (width < 768) screenSize = 'sm';
      else if (width < 1024) screenSize = 'md';
      else if (width < 1280) screenSize = 'lg';
      else if (width < 1536) screenSize = 'xl';
      else screenSize = '2xl';
      
      // Device type detection
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Touch detection
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Orientation detection
      const orientation = height > width ? 'portrait' : 'landscape';
      
      // Browser detection
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);
      
      // PWA detection
      const hasPWA = 'serviceWorker' in navigator;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        orientation,
        screenSize,
        userAgent,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        hasPWA,
        isStandalone
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for changes
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', () => {
      setDeviceInfo(prev => ({ ...prev, hasPWA: true }));
    });

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Mobile-specific utilities
export function useMobileOptimizations() {
  const deviceInfo = useDeviceDetection();
  
  const mobileClasses = {
    // Responsive text
    text: deviceInfo.isMobile ? 'text-sm' : 'text-base',
    heading: deviceInfo.isMobile ? 'text-xl' : 'text-2xl',
    subheading: deviceInfo.isMobile ? 'text-lg' : 'text-xl',
    
    // Responsive spacing
    padding: deviceInfo.isMobile ? 'p-4' : 'p-6',
    margin: deviceInfo.isMobile ? 'm-4' : 'm-6',
    
    // Responsive layout
    container: deviceInfo.isMobile ? 'px-4' : 'px-6',
    grid: deviceInfo.isMobile ? 'grid-cols-1' : 'grid-cols-2',
    
    // Touch-friendly elements
    button: deviceInfo.isTouch ? 'min-h-[48px] min-w-[48px]' : 'min-h-[36px] min-w-[36px]',
    input: deviceInfo.isTouch ? 'min-h-[48px] px-4 py-3' : 'min-h-[36px] px-3 py-2',
    
    // Modal behavior
    modal: deviceInfo.isMobile ? 'mobile-modal' : 'desktop-modal',
    modalContent: deviceInfo.isMobile ? 'mobile-modal-content' : 'desktop-modal-content'
  };
  
  return {
    deviceInfo,
    mobileClasses,
    isMobile: deviceInfo.isMobile,
    isTablet: deviceInfo.isTablet,
    isDesktop: deviceInfo.isDesktop,
    isTouch: deviceInfo.isTouch,
    orientation: deviceInfo.orientation,
    screenSize: deviceInfo.screenSize
  };
}

// Hook for handling mobile-specific interactions
export function useMobileInteractions() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isUpSwipe = distanceY > 50;
    const isDownSwipe = distanceY < -50;
    
    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      distanceX,
      distanceY
    };
  };
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}

// Hook for mobile performance optimizations
export function useMobilePerformance() {
  const deviceInfo = useDeviceDetection();
  
  useEffect(() => {
    if (deviceInfo.isMobile) {
      // Reduce animations on mobile for better performance
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
      
      // Optimize images for mobile
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
      });
      
      // Add mobile-specific optimizations
      document.body.classList.add('mobile-optimized');
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
      document.body.classList.remove('mobile-optimized');
    }
  }, [deviceInfo.isMobile]);
  
  return {
    isMobileOptimized: deviceInfo.isMobile,
    shouldReduceMotion: deviceInfo.isMobile,
    shouldLazyLoad: deviceInfo.isMobile
  };
}

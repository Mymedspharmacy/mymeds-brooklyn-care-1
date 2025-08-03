import { useEffect } from 'react';

export const useScrollToTop = (dependencies: React.DependencyList = []) => {
  useEffect(() => {
    try {
      // Scroll to top with smooth behavior
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      // Fallback for browsers that don't support smooth scrolling
      console.warn('Smooth scrolling not supported, using instant scroll');
      window.scrollTo(0, 0);
    }
  }, dependencies);
}; 
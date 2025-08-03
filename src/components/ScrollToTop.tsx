import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      // Scroll to top with smooth behavior when route changes
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
  }, [pathname]);

  return null;
}; 
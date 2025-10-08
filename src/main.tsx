import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Add mobile-specific event listeners
if ('ontouchstart' in window) {
  // Add touch class to body for touch-specific styling
  document.body.classList.add('touch-device');
}

// Handle mobile viewport changes
const handleViewportChange = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', handleViewportChange);
window.addEventListener('orientationchange', handleViewportChange);
handleViewportChange(); // Initial call

createRoot(document.getElementById("root")!).render(<App />);

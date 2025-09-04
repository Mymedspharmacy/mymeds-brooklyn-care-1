// Environment configuration for Vite frontend
export const env = {
  // Backend URL
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
  
  // Environment mode
  MODE: import.meta.env.MODE || 'development',
  DEV: import.meta.env.DEV || false,
  PROD: import.meta.env.PROD || false,
  
  // API configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Feature flags
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // External services
  WOOCOMMERCE_STORE_URL: import.meta.env.VITE_WOOCOMMERCE_STORE_URL || '',
  
  // WordPress integration
  WORDPRESS_URL: import.meta.env.VITE_WORDPRESS_URL || '',
  
  // WooCommerce integration
  WOOCOMMERCE_URL: import.meta.env.VITE_WOOCOMMERCE_URL || '',
  WOOCOMMERCE_CONSUMER_KEY: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY || '',
  WOOCOMMERCE_CONSUMER_SECRET: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET || '',
} as const;

// Type-safe environment variable access
export type Env = typeof env;

// Helper function to check if we're in development
export const isDev = env.MODE === 'development';

// Helper function to check if we're in production
export const isProd = env.MODE === 'production';

// Helper function to get backend URL
export const getBackendUrl = () => env.BACKEND_URL;

// Helper function to get API URL
export const getApiUrl = (endpoint: string) => `${env.API_BASE_URL}${endpoint}`;

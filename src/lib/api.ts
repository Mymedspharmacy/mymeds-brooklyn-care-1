import axios from 'axios';

// API configuration
const API_BASE_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin-token');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const token = localStorage.getItem('admin-token');
      if (token) {
        try {
          // Try to refresh the token
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            token: token
          });
          
          const newToken = refreshResponse.data.token;
          localStorage.setItem('admin-token', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear the token and redirect to login
          localStorage.removeItem('admin-token');
          window.location.href = '/admin-signin';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    // Handle authentication errors more gracefully
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('API Auth Error:', error.response.status, error.config?.url);
      
      // Only clear tokens if we're not already on signin page
      // Let the component handle the redirect to avoid conflicts
      if (window.location.pathname !== '/admin-signin' && 
          window.location.pathname !== '/admin-reset') {
        console.log('Auth error detected, clearing tokens');
        
        // Clear tokens but don't redirect automatically
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-auth');
        localStorage.removeItem('admin-user');
        
        // Don't redirect here - let the component handle it
        // This prevents conflicts with the component's authentication flow
      }
    }
    console.log('API Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;

// Helper to set token (for login/register)
export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('admin-token', token);
  } else {
    localStorage.removeItem('admin-token');
  }
} 
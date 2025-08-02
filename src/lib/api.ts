import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// On load, set the admin token if present
const adminToken = localStorage.getItem('railway-admin-token');
if (adminToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
}

// Attach token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('railway-admin-token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});


// Debug: Log all outgoing requests and responses
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method, config.url, config.headers, config.data);
  return config;
});
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.config.url, response.status, response.data);
    return response;
  },
  error => {
    // Only redirect on authentication errors if we're not already on signin page
    // and if it's a genuine auth failure (not just a token refresh issue)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('API Auth Error - checking if we should redirect');
      
      // Don't redirect immediately - let the component handle it
      // This prevents infinite redirect loops
      if (window.location.pathname !== '/admin-signin') {
        console.log('Auth error detected, but not redirecting automatically');
        // Instead of immediate redirect, just clear tokens
        localStorage.removeItem('railway-admin-token');
        localStorage.removeItem('railway-admin-auth');
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
    localStorage.setItem('railway-admin-token', token);
  } else {
    localStorage.removeItem('railway-admin-token');
  }
} 
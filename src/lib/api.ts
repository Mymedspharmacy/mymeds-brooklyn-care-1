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
    // Handle authentication errors more gracefully
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('API Auth Error:', error.response.status, error.config?.url);
      
      // Only clear tokens if we're not already on signin page
      // Let the component handle the redirect to avoid conflicts
      if (window.location.pathname !== '/admin-signin' && 
          window.location.pathname !== '/admin-reset') {
        console.log('Auth error detected, clearing tokens');
        
        // Clear tokens but don't redirect automatically
        localStorage.removeItem('railway-admin-token');
        localStorage.removeItem('railway-admin-auth');
        localStorage.removeItem('railway-admin-user');
        
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
    localStorage.setItem('railway-admin-token', token);
  } else {
    localStorage.removeItem('railway-admin-token');
  }
} 
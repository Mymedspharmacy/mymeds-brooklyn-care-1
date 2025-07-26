import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// On load, set the admin token if present
const adminToken = localStorage.getItem('sb-admin-token');
if (adminToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
}

// Attach token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb-admin-token');
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
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('sb-admin-token');
      localStorage.removeItem('admin-auth');
      // Only redirect if we're not already on the signin page
      if (window.location.pathname !== '/admin-signin') {
        window.location.href = '/admin-signin';
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
    localStorage.setItem('sb-admin-token', token);
  } else {
    localStorage.removeItem('sb-admin-token');
  }
} 
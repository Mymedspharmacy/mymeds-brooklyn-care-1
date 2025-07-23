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

// Global response interceptor for auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      setAuthToken(null); // Remove token
      window.location.href = '/admin-login'; // Redirect to login page
    }
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
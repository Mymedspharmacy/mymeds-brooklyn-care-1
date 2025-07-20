import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {

    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Helper to set token (for login/register)
export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
} 
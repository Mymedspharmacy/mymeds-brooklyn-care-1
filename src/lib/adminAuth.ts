import api from './api';

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

class AdminAuth {
  private token: string | null = null;
  private user: any = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('admin-token');
    if (this.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Attempting login with:', credentials);
      console.log('API base URL:', api.defaults.baseURL);
      const response = await api.post('/api/admin/login', credentials);
      console.log('Login response:', response.data);
      
      // Handle the correct response format from backend
      if (response.data.success && response.data.token) {
        const { token, user } = response.data;
        
        this.token = token;
        this.user = user;
        
        // Store token in localStorage
        localStorage.setItem('admin-token', token);
        localStorage.setItem('admin-user', JSON.stringify(user));
        localStorage.setItem('admin-auth', 'true');
        
        // Set token for future API requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return { token, user };
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Call admin logout endpoint if we have a token
      if (this.token) {
        await api.post('/api/admin/logout');
      }
    } catch (error) {
      // Ignore logout errors, continue with cleanup
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      this.token = null;
      this.user = null;
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-user');
      localStorage.removeItem('admin-auth');
      delete api.defaults.headers.common['Authorization'];
    }
  }

  // Get current user
  async getCurrentUser(): Promise<any> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    try {
      // Ensure token is set in headers
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      
      // Use dashboard endpoint to validate token and get basic user info
      const response = await api.get('/api/admin/dashboard');
      if (response.status === 200 && response.data.success) {
        // Return basic user object since we don't have profile data
        this.user = { email: 'admin@mymedspharmacyinc.com', role: 'ADMIN' };
        return this.user;
      }
      throw new Error('Invalid response from server');
    } catch (error: any) {
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        await this.logout();
      }
      throw new Error(error.response?.data?.error || 'Failed to get user');
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('admin-token');
    const auth = localStorage.getItem('admin-auth');
    
    if (!token || auth !== 'true') {
      return false;
    }

    // Set the token in API headers for the request
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Validate token with backend using dashboard endpoint (which we know works)
    try {
      // Ensure token is set in headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/admin/dashboard');
      if (response.status === 200 && response.data.success) {
        this.token = token;
        // Set a basic user object since we don't have profile data
        this.user = { email: 'admin@mymedspharmacyinc.com', role: 'ADMIN' };
        return true;
      }
      return false;
    } catch (error: any) {
      // If token is invalid, clear it
      if (error.response?.status === 401 || error.response?.status === 403) {
        await this.logout();
      }
      return false;
    }
  }

  // Synchronous check for UI rendering (use with caution)
  isAuthenticatedSync(): boolean {
    return !!this.token && !!localStorage.getItem('admin-auth');
  }

  // Get stored token
  getToken(): string | null {
    return this.token;
  }

  // Get stored user
  getUser(): any {
    if (!this.user) {
      const userStr = localStorage.getItem('admin-user');
      if (userStr) {
        this.user = JSON.parse(userStr);
      }
    }
    return this.user;
  }

  // Request password reset
  async requestPasswordReset(data: ResetPasswordRequest): Promise<void> {
    try {
      await api.post('/auth/admin-reset-request', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to request password reset');
    }
  }

  // Reset password with token
  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await api.post('/auth/admin-reset', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
  }

  // Refresh token (if needed)
  async refreshToken(): Promise<void> {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      
      this.token = token;
      localStorage.setItem('admin-token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      // If refresh fails, logout
      await this.logout();
      throw new Error('Token refresh failed');
    }
  }

  // Initialize auth state from localStorage
  initialize(): void {
    const token = localStorage.getItem('admin-token');
    const auth = localStorage.getItem('admin-auth');
    
    if (token && auth === 'true') {
      this.token = token;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

// Create singleton instance
const adminAuth = new AdminAuth();

// Initialize on import
adminAuth.initialize();

export default adminAuth; 
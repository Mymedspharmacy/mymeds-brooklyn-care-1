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
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      // Handle the correct response format from backend
      if (response.data.token && response.data.user) {
        const { token, user } = response.data;
        
        this.token = token;
        this.user = user;
        
        // Store token and user data in localStorage
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
        await api.post('/admin/logout');
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
      localStorage.removeItem('admin-csrf-token');
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['X-CSRF-Token'];
    }
  }

  // Get current user
  async getCurrentUser(): Promise<any> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    // Return cached user if available (since we don't have a profile endpoint)
    if (this.user) {
      return this.user;
    }

    // Try to get user from localStorage
    const storedUser = localStorage.getItem('admin-user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        return this.user;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }

    throw new Error('No user data available');
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

    // Validate token with backend using profile endpoint
    try {
      // Ensure token is set in headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/admin/profile');
      if (response.status === 200 && response.data.success) {
        this.token = token;
        this.user = response.data.user;
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
    const csrfToken = localStorage.getItem('admin-csrf-token');
    
    if (token && auth === 'true') {
      this.token = token;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (csrfToken) {
        api.defaults.headers.common['X-CSRF-Token'] = csrfToken;
      }
    }
  }
}

// Create singleton instance
const adminAuth = new AdminAuth();

// Initialize on import
adminAuth.initialize();

export default adminAuth; 
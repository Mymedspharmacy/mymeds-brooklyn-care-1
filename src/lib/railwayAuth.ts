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

class RailwayAuth {
  private token: string | null = null;
  private user: any = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('railway-admin-token');
    if (this.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      this.token = token;
      this.user = user;
      
      // Store token in localStorage
      localStorage.setItem('railway-admin-token', token);
      localStorage.setItem('railway-admin-user', JSON.stringify(user));
      localStorage.setItem('railway-admin-auth', 'true');
      
      // Set token for future API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors, continue with cleanup
    } finally {
      // Clear local storage and state
      this.token = null;
      this.user = null;
      localStorage.removeItem('railway-admin-token');
      localStorage.removeItem('railway-admin-user');
      localStorage.removeItem('railway-admin-auth');
      delete api.defaults.headers.common['Authorization'];
    }
  }

  // Get current user
  async getCurrentUser(): Promise<any> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await api.get('/auth/me');
      this.user = response.data;
      return this.user;
    } catch (error: any) {
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        this.logout();
      }
      throw new Error(error.response?.data?.error || 'Failed to get user');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token && !!localStorage.getItem('railway-admin-auth');
  }

  // Get stored token
  getToken(): string | null {
    return this.token;
  }

  // Get stored user
  getUser(): any {
    if (!this.user) {
      const userStr = localStorage.getItem('railway-admin-user');
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
      localStorage.setItem('railway-admin-token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      // If refresh fails, logout
      await this.logout();
      throw new Error('Token refresh failed');
    }
  }

  // Initialize auth state from localStorage
  initialize(): void {
    const token = localStorage.getItem('railway-admin-token');
    const auth = localStorage.getItem('railway-admin-auth');
    
    if (token && auth === 'true') {
      this.token = token;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

// Create singleton instance
const railwayAuth = new RailwayAuth();

// Initialize on import
railwayAuth.initialize();

export default railwayAuth; 
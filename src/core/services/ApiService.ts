// API Service Layer
// Clean Architecture: Infrastructure Layer

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

export interface ApiServiceConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(config: ApiServiceConfig) {
    this.baseURL = config.baseURL;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const adminToken = localStorage.getItem('admin-token');
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const token = localStorage.getItem('admin-token');
          if (token) {
            try {
              const refreshResponse = await axios.post(`${this.baseURL}/auth/refresh`, {
                token: token
              });
              
              const newToken = refreshResponse.data.token;
              localStorage.setItem('admin-token', newToken);
              this.client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              
              return this.client(originalRequest);
            } catch (refreshError) {
              localStorage.removeItem('admin-token');
              window.location.href = '/admin-signin';
              return Promise.reject(refreshError);
            }
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Paginated requests
  async getPaginated<T>(
    url: string, 
    page: number = 1, 
    limit: number = 10,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response: AxiosResponse<PaginatedResponse<T>> = await this.client.get(
        `${url}?${params}`, 
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // File upload
  async uploadFile<T>(url: string, file: File, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config?.headers
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error';
      const errorObj = new Error(message);
      (errorObj as any).status = error.response.status;
      (errorObj as any).data = error.response.data;
      return errorObj;
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

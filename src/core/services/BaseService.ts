// Base Service Implementation
// Clean Architecture: Application Layer

import { ApiService } from './ApiService';
import { ApiResponse, PaginatedResponse } from '../types';

export interface ServiceConfig {
  endpoint: string;
}

export abstract class BaseService<T, ID = number> {
  protected apiService: ApiService;
  protected endpoint: string;

  constructor(apiService: ApiService, config: ServiceConfig) {
    this.apiService = apiService;
    this.endpoint = config.endpoint;
  }

  async getById(id: ID): Promise<T | null> {
    try {
      const response = await this.apiService.get<T>(`${this.endpoint}/${id}`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error(`Error fetching ${this.getEntityName()} by id:`, error);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const response = await this.apiService.get<T[]>(this.endpoint);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error(`Error fetching all ${this.getEntityName()}s:`, error);
      throw error;
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    try {
      const response = await this.apiService.post<T>(this.endpoint, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create entity');
      }
      return response.data;
    } catch (error) {
      console.error(`Error creating ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async update(id: ID, data: Partial<T>): Promise<T | null> {
    try {
      const response = await this.apiService.put<T>(`${this.endpoint}/${id}`, data);
      if (!response.success || !response.data) {
        return null;
      }
      return response.data;
    } catch (error) {
      console.error(`Error updating ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async delete(id: ID): Promise<boolean> {
    try {
      const response = await this.apiService.delete(`${this.endpoint}/${id}`);
      return response.success;
    } catch (error) {
      console.error(`Error deleting ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.apiService.getPaginated<T>(this.endpoint, page, limit);
      return response;
    } catch (error) {
      console.error(`Error fetching paginated ${this.getEntityName()}s:`, error);
      throw error;
    }
  }

  async search(query: string, limit?: number): Promise<T[]> {
    try {
      const params = new URLSearchParams({ q: query });
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      const response = await this.apiService.get<T[]>(`${this.endpoint}/search?${params}`);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error(`Error searching ${this.getEntityName()}s:`, error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const response = await this.apiService.get<{ count: number }>(`${this.endpoint}/count`);
      return response.success ? response.data?.count || 0 : 0;
    } catch (error) {
      console.error(`Error counting ${this.getEntityName()}s:`, error);
      throw error;
    }
  }

  // Abstract method to be implemented by concrete services
  protected abstract getEntityName(): string;
}

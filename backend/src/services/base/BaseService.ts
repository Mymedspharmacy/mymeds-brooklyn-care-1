// Base Service Implementation
// Clean Architecture: Application Layer

import { IRepository } from '../../core/interfaces/IRepository';
import { IService } from '../../core/interfaces/IService';
import { AppError, NotFoundError, ConflictError, ErrorCode } from '../../core/errors/AppError';

export abstract class BaseService<T, ID = number> implements IService<T, ID> {
  protected repository: IRepository<T, ID>;

  constructor(repository: IRepository<T, ID>) {
    this.repository = repository;
  }

  async getById(id: ID): Promise<T | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      throw new AppError(
        `Failed to get ${this.getEntityName()} by id`,
        ErrorCode.DATABASE_ERROR,
        500,
        true,
        { id, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async getAll(): Promise<T[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      throw new AppError(
        `Failed to get all ${this.getEntityName()}s`,
        ErrorCode.DATABASE_ERROR,
        500,
        true,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    try {
      // Validate data before creation
      await this.validateCreateData(data);
      
      return await this.repository.create(data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Failed to create ${this.getEntityName()}`,
        ErrorCode.DATABASE_ERROR,
        500,
        true,
        { data, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async update(id: ID, data: Partial<T>): Promise<T | null> {
    try {
      // Check if entity exists
      const existingEntity = await this.repository.findById(id);
      if (!existingEntity) {
        throw new NotFoundError(this.getEntityName(), id.toString());
      }

      // Validate data before update
      await this.validateUpdateData(data, existingEntity);
      
      return await this.repository.update(id, data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Failed to update ${this.getEntityName()}`,
        ErrorCode.DATABASE_ERROR,
        500,
        true,
        { id, data, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async delete(id: ID): Promise<boolean> {
    try {
      // Check if entity exists
      const existingEntity = await this.repository.findById(id);
      if (!existingEntity) {
        throw new NotFoundError(this.getEntityName(), id.toString());
      }

      return await this.repository.delete(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Failed to delete ${this.getEntityName()}`,
        ErrorCode.DATABASE_ERROR,
        500,
        true,
        { id, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await this.repository.count();
    } catch (error) {
      throw new AppError(
        `Failed to count ${this.getEntityName()}s`,
        ErrorCode.DATABASE_ERROR,
        500,
        true,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // Abstract methods to be implemented by concrete services
  protected abstract getEntityName(): string;
  
  protected async validateCreateData(data: Omit<T, 'id'>): Promise<void> {
    // Override in concrete services for specific validation
  }

  protected async validateUpdateData(data: Partial<T>, existingEntity: T): Promise<void> {
    // Override in concrete services for specific validation
  }
}

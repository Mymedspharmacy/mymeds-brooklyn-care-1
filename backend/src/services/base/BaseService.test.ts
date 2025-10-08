import { BaseService } from './BaseService';
import { IRepository } from '../../core/interfaces/IRepository';
import { AppError, NotFoundError, ErrorCode } from '../../core/errors/AppError';

// Mock Repository
class MockRepository<T> implements IRepository<T, number> {
  private data: Map<number, T> = new Map();
  private idCounter = 1;

  async findById(id: number): Promise<T | null> {
    return this.data.get(id) || null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.data.values());
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const id = this.idCounter++;
    const entity = { id, ...data } as T;
    this.data.set(id, entity);
    return entity;
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    const existing = this.data.get(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...data };
    this.data.set(id, updated);
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    return this.data.delete(id);
  }

  async count(): Promise<number> {
    return this.data.size;
  }

  // Helper method for testing
  clear() {
    this.data.clear();
    this.idCounter = 1;
  }
}

// Test Entity
interface TestEntity {
  id: number;
  name: string;
  email: string;
}

// Concrete Service Implementation
class TestService extends BaseService<TestEntity, number> {
  protected getEntityName(): string {
    return 'TestEntity';
  }

  protected async validateCreateData(data: Omit<TestEntity, 'id'>): Promise<void> {
    if (!data.name || data.name.length < 3) {
      throw new AppError('Name must be at least 3 characters', ErrorCode.VALIDATION_ERROR, 400, false);
    }
    if (!data.email || !data.email.includes('@')) {
      throw new AppError('Invalid email format', ErrorCode.VALIDATION_ERROR, 400, false);
    }
  }

  protected async validateUpdateData(data: Partial<TestEntity>, existingEntity: TestEntity): Promise<void> {
    if (data.email && !data.email.includes('@')) {
      throw new AppError('Invalid email format', ErrorCode.VALIDATION_ERROR, 400, false);
    }
  }
}

describe('BaseService', () => {
  let repository: MockRepository<TestEntity>;
  let service: TestService;

  beforeEach(() => {
    repository = new MockRepository<TestEntity>();
    service = new TestService(repository);
  });

  describe('getById', () => {
    it('should retrieve entity by id', async () => {
      const created = await repository.create({ name: 'John Doe', email: 'john@example.com' });
      const result = await service.getById(created.id);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('John Doe');
      expect(result?.email).toBe('john@example.com');
    });

    it('should return null for non-existent id', async () => {
      const result = await service.getById(999);
      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      const errorRepo = new MockRepository<TestEntity>();
      errorRepo.findById = async () => {
        throw new Error('Database connection error');
      };
      
      const errorService = new TestService(errorRepo);
      
      await expect(errorService.getById(1)).rejects.toThrow(AppError);
    });
  });

  describe('getAll', () => {
    it('should retrieve all entities', async () => {
      await repository.create({ name: 'John Doe', email: 'john@example.com' });
      await repository.create({ name: 'Jane Smith', email: 'jane@example.com' });
      
      const results = await service.getAll();
      
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('John Doe');
      expect(results[1].name).toBe('Jane Smith');
    });

    it('should return empty array when no entities exist', async () => {
      const results = await service.getAll();
      expect(results).toHaveLength(0);
    });

    it('should handle repository errors', async () => {
      const errorRepo = new MockRepository<TestEntity>();
      errorRepo.findAll = async () => {
        throw new Error('Database error');
      };
      
      const errorService = new TestService(errorRepo);
      await expect(errorService.getAll()).rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('should create new entity', async () => {
      const data = { name: 'John Doe', email: 'john@example.com' };
      const result = await service.create(data);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should validate data before creation', async () => {
      const invalidData = { name: 'Jo', email: 'john@example.com' }; // name too short
      
      await expect(service.create(invalidData)).rejects.toThrow(AppError);
    });

    it('should validate email format', async () => {
      const invalidEmail = { name: 'John Doe', email: 'invalid-email' };
      
      await expect(service.create(invalidEmail)).rejects.toThrow(AppError);
    });

    it('should increment IDs correctly', async () => {
      const first = await service.create({ name: 'First', email: 'first@example.com' });
      const second = await service.create({ name: 'Second', email: 'second@example.com' });
      
      expect(second.id).toBeGreaterThan(first.id);
    });
  });

  describe('update', () => {
    it('should update existing entity', async () => {
      const created = await service.create({ name: 'John Doe', email: 'john@example.com' });
      const updated = await service.update(created.id, { name: 'John Smith' });
      
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('John Smith');
      expect(updated?.email).toBe('john@example.com'); // unchanged
    });

    it('should throw NotFoundError for non-existent entity', async () => {
      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });

    it('should validate update data', async () => {
      const created = await service.create({ name: 'John Doe', email: 'john@example.com' });
      
      await expect(service.update(created.id, { email: 'invalid-email' })).rejects.toThrow(AppError);
    });

    it('should allow partial updates', async () => {
      const created = await service.create({ name: 'John Doe', email: 'john@example.com' });
      const updated = await service.update(created.id, { name: 'Jane Doe' });
      
      expect(updated?.name).toBe('Jane Doe');
      expect(updated?.email).toBe('john@example.com');
    });
  });

  describe('delete', () => {
    it('should delete existing entity', async () => {
      const created = await service.create({ name: 'John Doe', email: 'john@example.com' });
      const result = await service.delete(created.id);
      
      expect(result).toBe(true);
      
      const retrieved = await service.getById(created.id);
      expect(retrieved).toBeNull();
    });

    it('should throw NotFoundError for non-existent entity', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundError);
    });

    it('should actually remove entity from repository', async () => {
      const created = await service.create({ name: 'John Doe', email: 'john@example.com' });
      await service.delete(created.id);
      
      const all = await service.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('count', () => {
    it('should return correct count', async () => {
      expect(await service.count()).toBe(0);
      
      await service.create({ name: 'First', email: 'first@example.com' });
      expect(await service.count()).toBe(1);
      
      await service.create({ name: 'Second', email: 'second@example.com' });
      expect(await service.count()).toBe(2);
    });

    it('should update count after deletion', async () => {
      const first = await service.create({ name: 'First', email: 'first@example.com' });
      await service.create({ name: 'Second', email: 'second@example.com' });
      
      expect(await service.count()).toBe(2);
      
      await service.delete(first.id);
      expect(await service.count()).toBe(1);
    });

    it('should handle empty repository', async () => {
      expect(await service.count()).toBe(0);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete CRUD lifecycle', async () => {
      // Create
      const created = await service.create({ name: 'John Doe', email: 'john@example.com' });
      expect(created.id).toBeDefined();
      
      // Read
      const retrieved = await service.getById(created.id);
      expect(retrieved).toEqual(created);
      
      // Update
      const updated = await service.update(created.id, { name: 'Jane Doe' });
      expect(updated?.name).toBe('Jane Doe');
      
      // Delete
      const deleted = await service.delete(created.id);
      expect(deleted).toBe(true);
      
      // Verify deletion
      const afterDelete = await service.getById(created.id);
      expect(afterDelete).toBeNull();
    });

    it('should maintain data integrity across operations', async () => {
      const entities = [
        { name: 'Entity 1', email: 'entity1@example.com' },
        { name: 'Entity 2', email: 'entity2@example.com' },
        { name: 'Entity 3', email: 'entity3@example.com' }
      ];
      
      for (const entity of entities) {
        await service.create(entity);
      }
      
      expect(await service.count()).toBe(3);
      
      const all = await service.getAll();
      expect(all).toHaveLength(3);
      expect(all.map(e => e.name)).toContain('Entity 1');
      expect(all.map(e => e.name)).toContain('Entity 2');
      expect(all.map(e => e.name)).toContain('Entity 3');
    });
  });
});


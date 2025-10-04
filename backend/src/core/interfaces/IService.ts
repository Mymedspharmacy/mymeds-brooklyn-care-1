// Service Interface
// Clean Architecture: Application Layer

export interface IService<T, ID = string | number> {
  getById(id: ID): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
  count(): Promise<number>;
}

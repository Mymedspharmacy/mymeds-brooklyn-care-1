// Service Pattern Interface
// Clean Architecture: Application Layer

export interface IService<T, ID = number> {
  getById(id: ID): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

export interface IPaginatedService<T, ID = number> extends IService<T, ID> {
  getPaginated(page: number, limit: number): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export interface ISearchableService<T, ID = number> extends IService<T, ID> {
  search(query: string, limit?: number): Promise<T[]>;
}

export interface IAuditableService<T, ID = number> extends IService<T, ID> {
  getByDateRange(startDate: Date, endDate: Date): Promise<T[]>;
  getRecent(limit?: number): Promise<T[]>;
}

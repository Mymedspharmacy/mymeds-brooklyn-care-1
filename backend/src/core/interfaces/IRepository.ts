// Repository Pattern Interface
// Clean Architecture: Domain Layer

export interface IRepository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
  count(): Promise<number>;
}

export interface IPaginatedRepository<T, ID = number> extends IRepository<T, ID> {
  findPaginated(page: number, limit: number): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export interface ISearchableRepository<T, ID = number> extends IRepository<T, ID> {
  search(query: string, limit?: number): Promise<T[]>;
}

export interface IAuditableRepository<T, ID = number> extends IRepository<T, ID> {
  findByCreatedDateRange(startDate: Date, endDate: Date): Promise<T[]>;
  findByUpdatedDateRange(startDate: Date, endDate: Date): Promise<T[]>;
}

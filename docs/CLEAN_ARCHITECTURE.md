# 🏗️ Clean Architecture Implementation

## Overview

This document outlines the clean architecture implementation for the MyMeds Pharmacy application. The architecture follows the principles of Clean Architecture, Dependency Inversion, and Separation of Concerns.

## Architecture Layers

### 🎯 Domain Layer (Core Business Logic)
- **Location**: `backend/src/core/`, `src/core/types/`
- **Purpose**: Contains business entities, interfaces, and core business logic
- **Dependencies**: None (pure business logic)

#### Key Components:
- **Interfaces**: `IRepository`, `IService`, `IUseCase`
- **Error Handling**: `AppError`, `ErrorCode`
- **Types**: Core domain types and entities

### 🔧 Application Layer (Use Cases & Services)
- **Location**: `backend/src/services/`, `src/core/services/`
- **Purpose**: Implements business use cases and application services
- **Dependencies**: Domain layer only

#### Key Components:
- **BaseService**: Abstract base class for all services
- **Use Cases**: Business logic implementation
- **Service Interfaces**: Contract definitions

### 🏗️ Infrastructure Layer (External Concerns)
- **Location**: `backend/src/repositories/`, `backend/src/config/`
- **Purpose**: Handles external concerns like database, configuration, and external APIs
- **Dependencies**: Application and Domain layers

#### Key Components:
- **BaseRepository**: Abstract base class for data access
- **Configuration**: Centralized configuration management
- **Database**: Prisma client and database operations

### 🎨 Presentation Layer (UI & Controllers)
- **Location**: `src/components/`, `src/pages/`, `backend/src/routes/`
- **Purpose**: Handles user interface and API endpoints
- **Dependencies**: Application layer

#### Key Components:
- **Components**: Reusable UI components
- **Pages**: Page-level components
- **Routes**: API route handlers

## 🏛️ Dependency Injection Container

### Container Implementation
```typescript
// backend/src/core/Container.ts
export class Container {
  private services = new Map<string, ServiceDefinition>();
  private instances = new Map<string, any>();

  register<T>(token: string | Constructor<T>, factory: Factory<T>, singleton: boolean = true): void
  resolve<T>(token: string | Constructor<T>): T
  isRegistered(token: string | Constructor<any>): boolean
}
```

### Usage Example
```typescript
// Register services
container.registerSingleton('PrismaClient', () => prisma);
container.registerSingleton('Cache', () => cache);

// Resolve services
const prisma = container.resolve<PrismaClient>('PrismaClient');
```

## 🔧 Configuration Management

### Centralized Configuration
```typescript
// backend/src/config/index.ts
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'staging' | 'production';
  database: DatabaseConfig;
  security: SecurityConfig;
  rateLimit: RateLimitConfig;
  external: ExternalServicesConfig;
  monitoring: MonitoringConfig;
}
```

### Environment Validation
- Automatic validation of required environment variables
- Type-safe configuration access
- Environment-specific settings

## 🚨 Error Handling

### Error Hierarchy
```typescript
AppError (Base)
├── ValidationError
├── NotFoundError
├── UnauthorizedError
├── ForbiddenError
├── ConflictError
├── ExternalServiceError
└── DatabaseError
```

### Centralized Error Handler
```typescript
// backend/src/core/errors/ErrorHandler.ts
export class ErrorHandler {
  static handle(error: any, req: Request, res: Response, next: NextFunction): void
  static handleOperationalError(error: AppError, req: Request, res: Response): void
  static handleProgrammingError(error: Error, req: Request, res: Response): void
}
```

## 📊 Service Layer Pattern

### Base Service Implementation
```typescript
// backend/src/services/base/BaseService.ts
export abstract class BaseService<T, ID = number> implements IService<T, ID> {
  protected repository: IRepository<T, ID>;

  async getById(id: ID): Promise<T | null>
  async getAll(): Promise<T[]>
  async create(data: Omit<T, 'id'>): Promise<T>
  async update(id: ID, data: Partial<T>): Promise<T | null>
  async delete(id: ID): Promise<boolean>
  async count(): Promise<number>

  protected abstract getEntityName(): string;
  protected async validateCreateData(data: Omit<T, 'id'>): Promise<void>
  protected async validateUpdateData(data: Partial<T>, existingEntity: T): Promise<void>
}
```

## 🗄️ Repository Pattern

### Base Repository Implementation
```typescript
// backend/src/repositories/base/BaseRepository.ts
export abstract class BaseRepository<T, ID = number> implements IRepository<T, ID> {
  protected prisma: PrismaClient;
  protected modelName: string;

  async findById(id: ID): Promise<T | null>
  async findAll(): Promise<T[]>
  async create(entity: Omit<T, 'id'>): Promise<T>
  async update(id: ID, entity: Partial<T>): Promise<T | null>
  async delete(id: ID): Promise<boolean>
  async count(): Promise<number>
}
```

## 🎨 Frontend Architecture

### Service Layer
```typescript
// src/core/services/ApiService.ts
export class ApiService {
  private client: AxiosInstance;
  
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
}
```

### Custom Hooks
```typescript
// src/core/hooks/useApi.ts
export function useApi<T>(apiFunction: (...args: any[]) => Promise<ApiResponse<T>>): UseApiReturn<T>
export function usePaginatedApi<T>(apiFunction: (page: number, limit: number) => Promise<PaginatedResponse<T>>): UsePaginatedApiReturn<T>
```

### Reusable Components
```typescript
// src/components/common/DataTable.tsx
export function DataTable<T>({
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  searchable?: boolean;
  pagination?: PaginationConfig;
  actions?: ActionConfig[];
}: DataTableProps<T>)
```

## 🔄 Data Flow

### Backend Flow
1. **Request** → Route Handler
2. **Route Handler** → Service (via DI Container)
3. **Service** → Repository (via DI Container)
4. **Repository** → Database (Prisma)
5. **Response** ← Service ← Repository ← Database

### Frontend Flow
1. **User Action** → Component
2. **Component** → Custom Hook
3. **Hook** → API Service
4. **API Service** → Backend API
5. **Response** ← Hook ← Component ← User

## 🧪 Testing Strategy

### Unit Testing
- **Domain Layer**: Pure functions and business logic
- **Service Layer**: Business use cases with mocked dependencies
- **Repository Layer**: Data access with test database

### Integration Testing
- **API Endpoints**: Full request/response cycle
- **Database Operations**: Real database interactions
- **External Services**: Mocked external API calls

### Component Testing
- **UI Components**: Isolated component testing
- **Custom Hooks**: Hook behavior testing
- **User Interactions**: User flow testing

## 📈 Benefits of Clean Architecture

### Maintainability
- Clear separation of concerns
- Easy to understand and modify
- Reduced coupling between layers

### Testability
- Each layer can be tested independently
- Easy to mock dependencies
- High test coverage potential

### Scalability
- Easy to add new features
- Simple to replace implementations
- Clear extension points

### Flexibility
- Technology-agnostic business logic
- Easy to change external dependencies
- Simple to add new interfaces

## 🚀 Implementation Guidelines

### Adding New Features
1. **Define Domain Types** in `core/types/`
2. **Create Repository Interface** in `core/interfaces/`
3. **Implement Repository** in `repositories/`
4. **Create Service Interface** in `core/interfaces/`
5. **Implement Service** in `services/`
6. **Register in DI Container**
7. **Create Route Handler** in `routes/`
8. **Add Frontend Service** in `core/services/`
9. **Create UI Components** in `components/`

### Best Practices
- Always use interfaces for dependencies
- Register all services in the DI container
- Use centralized error handling
- Follow the single responsibility principle
- Keep business logic in the domain layer
- Use type-safe configurations

## 🔍 Code Quality

### Linting
- ESLint configuration for TypeScript
- Consistent code formatting
- Import organization

### Type Safety
- Strict TypeScript configuration
- Interface definitions for all data structures
- Generic types for reusable components

### Error Handling
- Centralized error management
- Proper error logging
- User-friendly error messages

This clean architecture implementation provides a solid foundation for building maintainable, testable, and scalable applications while following industry best practices.

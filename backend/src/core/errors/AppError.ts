// Application Error Classes
// Clean Architecture: Domain Layer

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resource Management
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: any;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: any
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context
    };
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, context?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, ErrorCode.NOT_FOUND, 404, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, ErrorCode.UNAUTHORIZED, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, ErrorCode.FORBIDDEN, 403, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: any) {
    super(message, ErrorCode.CONFLICT, 409, true, context);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, context?: any) {
    super(`${service}: ${message}`, ErrorCode.EXTERNAL_SERVICE_ERROR, 502, true, context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: any) {
    super(message, ErrorCode.DATABASE_ERROR, 500, true, context);
  }
}

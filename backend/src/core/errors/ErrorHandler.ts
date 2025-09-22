// Centralized Error Handling
// Clean Architecture: Infrastructure Layer

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from './AppError';
import logger from '../../utils/logger';

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
  path?: string;
  method?: string;
}

export class ErrorHandler {
  /**
   * Handle operational errors (known errors)
   */
  public static handleOperationalError(
    error: AppError,
    req: Request,
    res: Response
  ): void {
    const errorResponse: ErrorResponse = {
      success: false,
      error: error.message,
      code: error.code,
      timestamp: error.timestamp.toISOString(),
      path: req.path,
      method: req.method
    };

    // Log error with context
    logger.error('Operational Error', {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      context: error.context
    });

    res.status(error.statusCode).json(errorResponse);
  }

  /**
   * Handle programming errors (unknown errors)
   */
  public static handleProgrammingError(
    error: Error,
    req: Request,
    res: Response
  ): void {
    // Log full error details
    logger.error('Programming Error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Don't expose internal errors in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message;

    const errorResponse: ErrorResponse = {
      success: false,
      error: errorMessage,
      code: ErrorCode.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };

    res.status(500).json(errorResponse);
  }

  /**
   * Handle validation errors from express-validator
   */
  public static handleValidationError(
    errors: any[],
    req: Request,
    res: Response
  ): void {
    const errorMessages = errors.map(err => err.msg).join(', ');
    
    logger.warn('Validation Error', {
      errors: errors,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: errorMessages,
      code: ErrorCode.VALIDATION_ERROR,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };

    res.status(400).json(errorResponse);
  }

  /**
   * Handle JWT errors
   */
  public static handleJWTError(error: Error, req: Request, res: Response): void {
    let message = 'Invalid token';
    let statusCode = 401;

    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token not active';
    }

    logger.warn('JWT Error', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: message,
      code: ErrorCode.UNAUTHORIZED,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Handle database errors
   */
  public static handleDatabaseError(
    error: any,
    req: Request,
    res: Response
  ): void {
    logger.error('Database Error', {
      error: error.message,
      code: error.code,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    // Handle specific database errors
    let message = 'Database error occurred';
    let statusCode = 500;

    if (error.code === 'P2002') {
      message = 'Duplicate entry';
      statusCode = 409;
    } else if (error.code === 'P2025') {
      message = 'Record not found';
      statusCode = 404;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: message,
      code: ErrorCode.DATABASE_ERROR,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Main error handling middleware
   */
  public static handle(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Handle AppError instances
    if (error instanceof AppError) {
      return this.handleOperationalError(error, req, res);
    }

    // Handle validation errors
    if (error.name === 'ValidationError' || Array.isArray(error)) {
      return this.handleValidationError(error, req, res);
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError' || 
        error.name === 'TokenExpiredError' || 
        error.name === 'NotBeforeError') {
      return this.handleJWTError(error, req, res);
    }

    // Handle Prisma errors
    if (error.code && error.code.startsWith('P')) {
      return this.handleDatabaseError(error, req, res);
    }

    // Handle all other errors as programming errors
    this.handleProgrammingError(error, req, res);
  }

  /**
   * Handle uncaught exceptions
   */
  public static handleUncaughtException(): void {
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });

      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  public static handleUnhandledRejection(): void {
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection', {
        reason: reason,
        promise: promise
      });

      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  /**
   * Initialize error handling
   */
  public static initialize(): void {
    this.handleUncaughtException();
    this.handleUnhandledRejection();
  }
}

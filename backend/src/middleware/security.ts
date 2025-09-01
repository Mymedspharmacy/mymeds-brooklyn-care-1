import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import logger from '../utils/logger';
import { RateLimitError } from './errorHandler';

// Enhanced CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Common dev port
      'http://localhost:3001', // Additional dev port
      'https://www.mymedspharmacyinc.com',
      'https://mymedspharmacyinc.com'
    ];

    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log blocked origins for security monitoring
    logger.warn('CORS_BLOCKED', {
      origin,
      ip: 'unknown',
      userAgent: 'unknown'
    });

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

// Enhanced rate limiting with Redis support (if available)
const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: options.message || 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req: Request) => {
      // Use IP address and user ID if available
      const key = req.ip || 'unknown';
      const userId = (req as any).user?.userId || 'anonymous';
      return `${key}:${userId}`;
    }),
    skip: options.skip || ((req: Request) => {
      // Skip rate limiting for health checks and static assets
      return req.path === '/api/health' || 
             req.path.startsWith('/static/') ||
             req.path.startsWith('/public/');
    }),
    handler: (req: Request, res: Response) => {
      // Log rate limit violations
      logger.warn('RATE_LIMIT_VIOLATION', {
        ip: req.ip,
        userId: (req as any).user?.userId || 'anonymous',
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method
      });

      // Throw custom error for better error handling
      throw new RateLimitError('Too many requests from this IP');
    }
  });
};

// Production rate limiters
const productionLimiters = {
  // Strict auth rate limiting
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts'
  }),

  // General API rate limiting
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many API requests'
  }),

  // Contact form rate limiting
  contact: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 submissions per hour
    message: 'Too many contact form submissions'
  }),

  // File upload rate limiting
  upload: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: 'Too many file uploads'
  }),

  // Admin operations rate limiting
  admin: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 operations per 15 minutes
    message: 'Too many admin operations'
  })
};

// Development rate limiters (more permissive)
const developmentLimiters = {
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts'
  }),
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many API requests'
  }),
  contact: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many contact form submissions'
  }),
  upload: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: 'Too many file uploads'
  }),
  admin: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many admin operations'
  })
};

// Get appropriate limiters based on environment
const getLimiters = () => {
  return process.env.NODE_ENV === 'production' ? productionLimiters : developmentLimiters;
};

// Enhanced security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"]
    },
    reportOnly: false
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: true, // Enable for better security
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow external resources
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// Request size limiting
const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: {
        message: 'Request entity too large',
        code: 'REQUEST_TOO_LARGE',
        maxSize: `${maxSize / (1024 * 1024)}MB`
      }
    });
  }

  next();
};

// IP blocking middleware (basic implementation)
const ipBlocklist = new Set<string>();
const ipAllowlist = new Set<string>();

export const blockIP = (ip: string) => {
  ipBlocklist.add(ip);
  logger.warn('IP_BLOCKED', { ip, reason: 'Manual block' });
};

export const allowIP = (ip: string) => {
  ipAllowlist.add(ip);
  ipBlocklist.delete(ip);
  logger.info('IP_ALLOWED', { ip });
};

const ipFilter = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip;

  if (!clientIP) {
    return next();
  }

  // Check allowlist first
  if (ipAllowlist.has(clientIP)) {
    return next();
  }

  // Check blocklist
  if (ipBlocklist.has(clientIP)) {
    logger.warn('BLOCKED_IP_ACCESS', {
      ip: clientIP,
      url: req.url,
      userAgent: req.get('User-Agent')
    });

    return res.status(403).json({
      error: {
        message: 'Access denied',
        code: 'IP_BLOCKED'
      }
    });
  }

  next();
};

// Security monitoring middleware
const securityMonitor = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /javascript:/i, // JavaScript protocol
    /on\w+\s*=/i, // Event handlers
    /union\s+select/i, // SQL injection
    /exec\s*\(/i, // Command execution
    /eval\s*\(/i, // Code evaluation
  ];

  const userInput = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userInput)) {
      logger.warn('SUSPICIOUS_INPUT_DETECTED', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        pattern: pattern.source,
        input: userInput.substring(0, 200) // Log first 200 chars
      });
      
      // In production, you might want to block these requests
      if (process.env.NODE_ENV === 'production') {
        return res.status(400).json({
          error: {
            message: 'Suspicious input detected',
            code: 'SUSPICIOUS_INPUT'
          }
        });
      }
      break;
    }
  }

  next();
};

// Export security middleware
export {
  corsOptions,
  getLimiters,
  securityHeaders,
  requestSizeLimit,
  ipFilter,
  securityMonitor,
  createRateLimiter
};

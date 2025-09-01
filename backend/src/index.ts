// New Relic monitoring - must be first
require('newrelic');

import dotenv from 'dotenv';
dotenv.config();

// 🚨 CRITICAL: Environment validation before anything else
const validateEnvironment = () => {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET!.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  // Validate DATABASE_URL format
  if (!process.env.DATABASE_URL!.startsWith('mysql://') && 
      !process.env.DATABASE_URL!.startsWith('postgresql://') &&
      !process.env.DATABASE_URL!.startsWith('file:')) {
    console.error('❌ DATABASE_URL must be a valid MySQL, PostgreSQL, or SQLite connection string');
    process.exit(1);
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'staging', 'production'];
  if (!validEnvs.includes(process.env.NODE_ENV!)) {
    console.error(`❌ NODE_ENV must be one of: ${validEnvs.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
};

// Run validation immediately
validateEnvironment();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import prescriptionRoutes from './routes/prescriptions';
import appointmentRoutes from './routes/appointments';
import blogRoutes from './routes/blogs';
import contactRoutes from './routes/contact';
import newsletterRoutes from './routes/newsletter';
import rateLimit from 'express-rate-limit';
import { AuthRequest } from './types/express';
import paymentsRoutes from './routes/payments';
import { adminAuthMiddleware } from './adminAuth';
import reviewsRoutes from './routes/reviews';
import settingsRoutes from './routes/settings';
import adminRoutes from './routes/admin';
import woocommerceRoutes from './routes/woocommerce';
import wordpressRoutes from './routes/wordpress';
import refillRequestRoutes from './routes/refillRequests';
import transferRequestRoutes from './routes/transferRequests';
import notificationRoutes from './routes/notifications';
import analyticsRoutes from './routes/analytics';
import patientRoutes from './routes/patient';
import monitoringRoutes from './routes/monitoring';
import openfdaRoutes from './routes/openfda';
import cartRoutes from './routes/cart';
// @ts-ignore
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import xss from 'xss-clean';
import statusMonitor from 'express-status-monitor';
import logger from './utils/logger';

console.log('Starting MyMeds backend...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 4000);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***configured***' : '***not configured***');

const app = express();

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://192.168.18.56:8080',
  'http://192.168.18.56:8081',
  'https://www.mymedspharmacyinc.com',
  'https://mymedspharmacyinc.com',
  'http://72.60.116.253', // VPS IP address
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000',  // Common dev port
  'http://localhost:3001',   // Additional dev port
  'http://localhost:3002',   // Frontend port
  'http://localhost:3003',   // Frontend port (current)
  'http://localhost:4000'   // Backend port
];

// ✅ IMPLEMENTED: WebSocket server setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin joined admin room');
  });
  
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined user room`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in other files
export { io };

// 🚀 SCALABILITY IMPROVEMENT: Enhanced Prisma Client with Connection Pooling
// Optimized for VPS KVM1 Hostinger deployment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || '',
    },
  },
  // Query performance optimization
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// 🚀 SCALABILITY IMPROVEMENT: Enhanced Memory Management
const MEMORY_THRESHOLDS = {
  WARNING: 1024,    // 1GB
  CRITICAL: 2048,   // 2GB
  MAX: 3072         // 3GB
};

// 🚀 SCALABILITY IMPROVEMENT: Basic In-Memory Caching
class BasicCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 1000; // Maximum cache entries
  private cleanupInterval = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  set(key: string, data: any, ttl: number = 300000): void { // Default 5 minutes
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries when cache is full
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Initialize cache instance
const cache = new BasicCache();

// Export cache for use in other files
export { cache };

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
    console.log('🚀 Database connection pooling enabled');
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('This is expected if DATABASE_URL is not configured in production');
    // Don't exit - let the app start anyway
  });

// Redirect HTTP to HTTPS in production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.redirect(301, 'https://' + req.headers.host + req.url);
  }
  next();
});

// Enhanced Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional security middleware
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL injection

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow requests from your Vercel domain
    if (process.env.NODE_ENV === 'production' && origin === 'https://www.mymedspharmacyinc.com') {
      return callback(null, true);
    }
    // Allow requests from any Vercel subdomain
    if (process.env.NODE_ENV === 'production' && origin && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
}));
app.options('*', cors()); // Handles preflight requests
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

// Status monitoring
app.use(statusMonitor({
  title: 'MyMeds Pharmacy Status',
  path: '/status',
  spans: [{
    interval: 1,
    retention: 60
  }, {
    interval: 5,
    retention: 60
  }, {
    interval: 15,
    retention: 60
  }]
}));

// Enhanced logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
});

// Enhanced Rate Limiting
const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes (increased from 5)
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

const contactLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 contact form submissions per 15 minutes (increased from 10)
  message: { error: 'Too many contact form submissions, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes (increased from 100)
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Development rate limiter (more permissive for development)
const devLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // 5000 requests per 15 minutes for development
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// No rate limiting for development (if DISABLE_RATE_LIMIT is set)
const noLimiter = (req: Request, res: Response, next: NextFunction) => {
  next();
};

// Log rate limiting configuration
console.log('Rate limiting configuration:');
console.log('- Environment:', process.env.NODE_ENV || 'development');
console.log('- Disable rate limit:', process.env.DISABLE_RATE_LIMIT === 'true' ? 'YES' : 'NO');
console.log('- Auth limit:', process.env.DISABLE_RATE_LIMIT === 'true' ? 'DISABLED' : '20 requests/15min');
console.log('- General limit:', process.env.DISABLE_RATE_LIMIT === 'true' ? 'DISABLED' : 
  (process.env.NODE_ENV === 'production' ? '1000 requests/15min' : '5000 requests/15min'));

// Enhanced Health Check
app.get('/api/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const healthStatus: {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string | undefined;
    version: string;
    checks: {
      database: string;
      memory: string;
      disk: string;
      cache?: { size: number; status: string };
    };
    responseTime?: number;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      memory: 'unknown',
      disk: 'unknown'
    }
  };

  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.checks.database = 'healthy';
  } catch (error) {
    healthStatus.checks.database = 'unhealthy';
    healthStatus.status = 'degraded';
  }

  // 🚀 SCALABILITY IMPROVEMENT: Enhanced Memory Usage Check
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  // Enhanced memory threshold checking
  if (memUsageMB.heapUsed > MEMORY_THRESHOLDS.CRITICAL) {
    healthStatus.checks.memory = 'critical';
    healthStatus.status = 'degraded';
  } else if (memUsageMB.heapUsed > MEMORY_THRESHOLDS.WARNING) {
    healthStatus.checks.memory = 'warning';
  } else {
    healthStatus.checks.memory = 'healthy';
  }

  // Add cache status to health check
  healthStatus.checks.cache = {
    size: cache.size(),
    status: cache.size() > 0 ? 'active' : 'empty'
  };

  healthStatus.responseTime = Date.now() - startTime;
  
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Detailed Database Health Check
app.get('/api/health/db', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await prisma.$connect();
    
    // Check table counts
    const [users, orders, prescriptions] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.prescription.count()
    ]);
    
    const dbStatus = {
      status: 'healthy',
      connection: 'connected',
      responseTime: Date.now() - startTime,
      tableCounts: {
        users,
        orders,
        prescriptions
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(dbStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// API routes with enhanced security
// Use different rate limiters based on environment
const currentLimiter = process.env.DISABLE_RATE_LIMIT === 'true' ? noLimiter : 
  (process.env.NODE_ENV === 'production' ? generalLimiter : devLimiter);

const currentAuthLimiter = process.env.DISABLE_RATE_LIMIT === 'true' ? noLimiter : authLimiter;
const currentContactLimiter = process.env.DISABLE_RATE_LIMIT === 'true' ? noLimiter : contactLimiter;

app.use('/api/auth', currentAuthLimiter, authRoutes);
app.use('/api/admin', adminRoutes); // Admin routes with built-in security
app.use('/api/woocommerce', currentLimiter, woocommerceRoutes); // WooCommerce integration
app.use('/api/wordpress', currentLimiter, wordpressRoutes); // WordPress integration
app.use('/api/users', currentLimiter, userRoutes);
app.use('/api/products', currentLimiter, productRoutes);
app.use('/api/orders', currentLimiter, orderRoutes);
app.use('/api/prescriptions', currentLimiter, prescriptionRoutes);
app.use('/api/appointments', currentLimiter, appointmentRoutes);
app.use('/api/blogs', currentLimiter, blogRoutes);
app.use('/api/contact', currentContactLimiter, contactRoutes);
app.use('/api/newsletter', currentLimiter, newsletterRoutes);
app.use('/api/payments', currentLimiter, paymentsRoutes);
app.use('/api/reviews', currentLimiter, reviewsRoutes);
app.use('/api/settings', currentLimiter, settingsRoutes);
app.use('/api/refill-requests', currentLimiter, refillRequestRoutes);
app.use('/api/transfer-requests', currentLimiter, transferRequestRoutes);
app.use('/api/notifications', currentLimiter, notificationRoutes);
app.use('/api/analytics', currentLimiter, analyticsRoutes);
app.use('/api/patient', currentLimiter, patientRoutes);
app.use('/api/monitoring', currentLimiter, monitoringRoutes);
app.use('/api/openfda', currentLimiter, openfdaRoutes);
app.use('/api/cart', currentLimiter, cartRoutes);

// Notification endpoints
app.get('/api/notifications', adminAuthMiddleware, async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const [orders, appointments, prescriptions, contacts] = await Promise.all([
      prisma.order.findMany({ where: { notified: false }, orderBy: { createdAt: 'desc' }, take: limit }),
      prisma.appointment.findMany({ where: { notified: false }, orderBy: { createdAt: 'desc' }, take: limit }),
      prisma.prescription.findMany({ where: { notified: false }, orderBy: { createdAt: 'desc' }, take: limit }),
      prisma.contactForm.findMany({ where: { notified: false }, orderBy: { createdAt: 'desc' }, take: limit })
    ]);
    console.log('Notification query time:', Date.now() - start, 'ms');
    res.json({ orders, appointments, prescriptions, contacts });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/api/notifications/mark-read', adminAuthMiddleware, async (req: Request, res: Response) => {
  const { type, id } = req.body;
  try {
    let result;
    switch (type) {
      case 'order':
        result = await prisma.order.update({ where: { id: Number(id) }, data: { notified: true } });
        break;
      case 'appointment':
        result = await prisma.appointment.update({ where: { id: Number(id) }, data: { notified: true } });
        break;
      case 'prescription':
        result = await prisma.prescription.update({ where: { id: Number(id) }, data: { notified: true } });
        break;
      case 'contact':
        result = await prisma.contactForm.update({ where: { id: Number(id) }, data: { notified: true } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid notification type' });
    }
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Don't expose internal errors in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(500).json({ 
    error: errorMessage,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4000;
const server = httpServer.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
  
  // Initialize admin user on startup
  try {
    const { ensureAdminUser } = await import('./adminAuth');
    await ensureAdminUser();
    console.log('✅ Admin user initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize admin user:', error);
  }
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    prisma.$disconnect();
  });
}); 

// Export app for testing
export { app }; 
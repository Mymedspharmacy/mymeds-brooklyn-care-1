import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request as ExpressRequest } from 'express';

const prisma = new PrismaClient();

// Use existing Express Request interface from middleware/auth.ts

// Validate required environment variables
const validateEnvironment = () => {
  const requiredVars = [
    'JWT_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD_HASH', // Changed from ADMIN_PASSWORD to ADMIN_PASSWORD_HASH
    'CSRF_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate CSRF_SECRET strength
  if (process.env.CSRF_SECRET!.length < 32) {
    throw new Error('CSRF_SECRET must be at least 32 characters long');
  }

  // Validate admin password hash format (bcrypt should start with $2a$, $2b$, or $2y$)
  const passwordHash = process.env.ADMIN_PASSWORD_HASH!;
  if (!passwordHash.startsWith('$2')) {
    throw new Error('ADMIN_PASSWORD_HASH must be a valid bcrypt hash');
  }
};

// Call validation on import
try {
  validateEnvironment();
} catch (error) {
  console.error('❌ Environment validation failed:', (error as Error).message);
  process.exit(1);
}

// Security configuration
const SECURITY_CONFIG = {
  // Admin credentials
  ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH!,
  ADMIN_NAME: process.env.ADMIN_NAME || 'Admin User',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: '2h' as const, // Reduced from 24h for better security
  
  // Rate limiting configuration
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  MAX_ATTEMPTS_PER_WINDOW: 10,
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_HISTORY_SIZE: 5,
  
  // Session configuration
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  CSRF_TOKEN_EXPIRES_IN: '1h' as const,
  
  // Security headers
  CSRF_SECRET: process.env.CSRF_SECRET!,
};

// Rate limiting: Track failed login attempts from database
export async function trackLoginAttempt(
  email: string, 
  ipAddress: string, 
  userAgent: string | undefined, 
  success: boolean, 
  failureReason?: string
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        userAgent,
        success,
        failureReason
      }
    });
  } catch (error) {
    console.error('Failed to track login attempt:', error);
    // Don't throw error to avoid breaking login flow
  }
}

// Check if account is rate limited
export async function isAccountRateLimited(email: string, ipAddress: string): Promise<{ isLimited: boolean; remainingTime?: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - SECURITY_CONFIG.RATE_LIMIT_WINDOW);
  
  try {
    // Check recent failed attempts
    const recentAttempts = await prisma.loginAttempt.count({
      where: {
        email,
        ipAddress,
        success: false,
        createdAt: {
          gte: windowStart
        }
      }
    });

    if (recentAttempts >= SECURITY_CONFIG.MAX_ATTEMPTS_PER_WINDOW) {
      // Find the oldest attempt in the window to calculate remaining time
      const oldestAttempt = await prisma.loginAttempt.findFirst({
        where: {
          email,
          ipAddress,
          success: false,
          createdAt: {
            gte: windowStart
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      if (oldestAttempt) {
        const remainingTime = Math.ceil((SECURITY_CONFIG.RATE_LIMIT_WINDOW - (now.getTime() - oldestAttempt.createdAt.getTime())) / 1000 / 60);
        return { isLimited: true, remainingTime };
      }
    }

    return { isLimited: false };
  } catch (error) {
    console.error('Failed to check rate limiting:', error);
    // On error, allow login attempt to proceed
    return { isLimited: false };
  }
}

// Secure admin authentication middleware
export async function secureAdminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await prisma.blacklistedToken.findUnique({
      where: { token }
    });

    if (isBlacklisted && isBlacklisted.expiresAt > new Date()) {
      return res.status(401).json({ 
        error: 'Token has been revoked.',
        code: 'TOKEN_REVOKED'
      });
    }

    const decoded = jwt.verify(token, SECURITY_CONFIG.JWT_SECRET) as any;
    
    // Verify it's an admin token
    if (!decoded || decoded.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        code: 'NOT_ADMIN'
      });
    }

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Verify session exists and is active
    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return res.status(401).json({ 
        error: 'Session expired or invalid.',
        code: 'SESSION_INVALID'
      });
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid token.',
      code: 'INVALID_TOKEN'
    });
  }
}

// Secure admin login function
export async function secureAdminLogin(
  email: string, 
  password: string, 
  ipAddress: string, 
  userAgent: string | undefined
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    // Check rate limiting
    const rateLimitCheck = await isAccountRateLimited(email, ipAddress);
    if (rateLimitCheck.isLimited) {
      await trackLoginAttempt(email, ipAddress, userAgent, false, 'Rate limited');
      return { 
        success: false, 
        error: `Too many failed attempts. Try again in ${rateLimitCheck.remainingTime} minutes.` 
      };
    }

    // Verify credentials
    if (email !== SECURITY_CONFIG.ADMIN_EMAIL) {
      await trackLoginAttempt(email, ipAddress, userAgent, false, 'Invalid email');
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, SECURITY_CONFIG.ADMIN_PASSWORD_HASH);
    if (!isValidPassword) {
      await trackLoginAttempt(email, ipAddress, userAgent, false, 'Invalid password');
      return { success: false, error: 'Invalid credentials' };
    }

    // Find or create admin user in database
    let adminUser = await prisma.user.findUnique({
      where: { email: SECURITY_CONFIG.ADMIN_EMAIL }
    });

    if (!adminUser) {
      // Create admin user if it doesn't exist
      adminUser = await prisma.user.create({
        data: {
          email: SECURITY_CONFIG.ADMIN_EMAIL,
          password: SECURITY_CONFIG.ADMIN_PASSWORD_HASH,
          name: SECURITY_CONFIG.ADMIN_NAME,
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: adminUser.id,
        email: SECURITY_CONFIG.ADMIN_EMAIL, 
        role: 'ADMIN',
        name: SECURITY_CONFIG.ADMIN_NAME,
        iat: Math.floor(Date.now() / 1000)
      },
      SECURITY_CONFIG.JWT_SECRET,
      { 
        expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN,
        issuer: 'mymeds-pharmacy',
        audience: 'mymeds-admin'
      }
    );

    // Create session record
    const expiresAt = new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT);
    await prisma.adminSession.create({
      data: {
        userId: adminUser.id,
        token,
        ipAddress,
        userAgent,
        expiresAt
      }
    });

    // Track successful login
    await trackLoginAttempt(email, ipAddress, userAgent, true);

    // Update last login time
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      success: true,
      token,
      user: {
        id: adminUser.id,
        email: SECURITY_CONFIG.ADMIN_EMAIL,
        name: SECURITY_CONFIG.ADMIN_NAME,
        role: 'ADMIN'
      }
    };

  } catch (error) {
    console.error('Admin login error:', error);
    await trackLoginAttempt(email, ipAddress, userAgent, false, 'System error');
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// Secure admin logout with token blacklisting
export async function secureAdminLogout(token: string): Promise<{ success: boolean; message: string }> {
  try {
    // Decode token to get expiration
    const decoded = jwt.decode(token) as any;
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Blacklist the token
    await prisma.blacklistedToken.create({
      data: {
        token,
        userId: decoded?.userId,
        reason: 'logout',
        expiresAt
      }
    });

    // Deactivate session
    await prisma.adminSession.updateMany({
      where: { token },
      data: { isActive: false }
    });

    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Logout failed'
    };
  }
}

// Generate CSRF token
export async function generateCSRFToken(userId: number, sessionId?: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  try {
    await prisma.cSRFToken.create({
      data: {
        token,
        userId,
        sessionId,
        expiresAt
      }
    });

    return token;
  } catch (error) {
    console.error('Failed to generate CSRF token:', error);
    throw new Error('Failed to generate CSRF token');
  }
}

// Validate CSRF token
export async function validateCSRFToken(token: string, userId: number): Promise<boolean> {
  try {
    const csrfToken = await prisma.cSRFToken.findUnique({
      where: { token }
    });

    if (!csrfToken || csrfToken.userId !== userId || csrfToken.expiresAt < new Date()) {
      return false;
    }

    // Delete used token (one-time use)
    await prisma.cSRFToken.delete({
      where: { id: csrfToken.id }
    });

    return true;
  } catch (error) {
    console.error('Failed to validate CSRF token:', error);
    return false;
  }
}

// CSRF middleware
export async function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET requests and login
  if (req.method === 'GET' || req.path === '/login') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const userId = req.user?.userId;

  if (!csrfToken || !userId) {
    return res.status(403).json({
      error: 'CSRF token required',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  const isValid = await validateCSRFToken(csrfToken, userId);
  if (!isValid) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  next();
}

// Change admin password securely
export async function changeAdminPasswordSecurely(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId, role: 'ADMIN' }
    });

    if (!user) {
      return { success: false, message: 'Admin user not found', error: 'USER_NOT_FOUND' };
    }

    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      return { success: false, message: 'Current password is incorrect', error: 'INVALID_CURRENT_PASSWORD' };
    }

    // Validate new password strength
    if (newPassword.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      return { 
        success: false, 
        message: `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`,
        error: 'PASSWORD_TOO_SHORT'
      };
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      return { 
        success: false, 
        message: 'Password must contain uppercase, lowercase, number, and special character',
        error: 'PASSWORD_WEAK'
      };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // TODO: Update environment variable ADMIN_PASSWORD_HASH (requires server restart)
    console.warn('⚠️  Password updated in database. Update ADMIN_PASSWORD_HASH environment variable and restart server.');

    return {
      success: true,
      message: 'Password changed successfully'
    };

  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: 'Failed to change password',
      error: 'SYSTEM_ERROR'
    };
  }
}

// Cleanup expired tokens and sessions
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const now = new Date();
    
    // Clean up expired blacklisted tokens
    await prisma.blacklistedToken.deleteMany({
      where: { expiresAt: { lt: now } }
    });

    // Clean up expired CSRF tokens
    await prisma.cSRFToken.deleteMany({
      where: { expiresAt: { lt: now } }
    });

    // Deactivate expired sessions
    await prisma.adminSession.updateMany({
      where: { expiresAt: { lt: now } },
      data: { isActive: false }
    });

    // Clean up old login attempts (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } }
    });

  } catch (error) {
    console.error('Failed to cleanup expired tokens:', error);
  }
}

// Export security configuration
export { SECURITY_CONFIG };

// Schedule cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

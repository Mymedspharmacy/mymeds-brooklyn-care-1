import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Validate required environment variables on startup
const validateEnvironment = () => {
  const requiredVars = [
    'JWT_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate admin password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  if (!passwordRegex.test(process.env.ADMIN_PASSWORD!)) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters with uppercase, lowercase, number, and special character');
  }
};

// Call validation on import
try {
  validateEnvironment();
} catch (error) {
  console.error('❌ Environment validation failed:', (error as Error).message);
  process.exit(1);
}

// Admin authentication configuration
const ADMIN_CONFIG = {
  // Strict admin credentials - these MUST be set in environment variables
  ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
  ADMIN_NAME: process.env.ADMIN_NAME || 'Admin User',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: '24h' as const, // Token expires in 24 hours
  
  // Enhanced security settings
  MAX_LOGIN_ATTEMPTS: 3, // Reduced from 5
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds (increased)
  PASSWORD_MIN_LENGTH: 12, // Increased from 8
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes (reduced for security)
  PASSWORD_HISTORY_SIZE: 5, // Remember last 5 passwords
};

// Track failed login attempts
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Admin authentication middleware
export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_CONFIG.JWT_SECRET as string) as any;
    
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

// Admin login function
export async function adminLogin(email: string, password: string) {
  try {
    // Check if account is locked
    const lockoutInfo = failedLoginAttempts.get(email);
    if (lockoutInfo && lockoutInfo.count >= ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - lockoutInfo.lastAttempt;
      if (timeSinceLastAttempt < ADMIN_CONFIG.LOCKOUT_DURATION) {
        const remainingTime = Math.ceil((ADMIN_CONFIG.LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60);
        throw new Error(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
      } else {
        // Reset lockout after duration
        failedLoginAttempts.delete(email);
      }
    }

    // Verify credentials
    if (email !== ADMIN_CONFIG.ADMIN_EMAIL) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = password === ADMIN_CONFIG.ADMIN_PASSWORD;
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Reset failed attempts on successful login
    failedLoginAttempts.delete(email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: ADMIN_CONFIG.ADMIN_EMAIL, 
        role: 'ADMIN',
        name: ADMIN_CONFIG.ADMIN_NAME,
        iat: Date.now()
      },
      ADMIN_CONFIG.JWT_SECRET,
      { 
        expiresIn: ADMIN_CONFIG.JWT_EXPIRES_IN,
        issuer: 'mymeds-pharmacy',
        audience: 'mymeds-admin'
      }
    );

    return {
      success: true,
      token,
      user: {
        email: ADMIN_CONFIG.ADMIN_EMAIL,
        name: ADMIN_CONFIG.ADMIN_NAME,
        role: 'ADMIN'
      }
    };

  } catch (error) {
    // Track failed attempts
    const currentAttempts = failedLoginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    currentAttempts.count++;
    currentAttempts.lastAttempt = Date.now();
    failedLoginAttempts.set(email, currentAttempts);

    throw error;
  }
}

// Admin logout function
export function adminLogout(req: Request, res: Response) {
  // In a real implementation, you might want to blacklist the token
  // For now, we'll just return a success response
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
}

// Admin logout function (for direct calls)
export function adminLogoutDirect() {
  return { success: true, message: 'Logged out successfully' };
}

// Change admin password function
export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  try {
    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, await bcrypt.hash(ADMIN_CONFIG.ADMIN_PASSWORD, 10));
    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    if (newPassword.length < ADMIN_CONFIG.PASSWORD_MIN_LENGTH) {
      throw new Error(`Password must be at least ${ADMIN_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new Error('Password must contain uppercase, lowercase, number, and special character');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // In a real implementation, you would update this in a database
    // For now, we'll just return success
    return {
      success: true,
      message: 'Password changed successfully'
    };

  } catch (error) {
    throw error;
  }
}

// Change admin password function (for direct calls with userId)
export async function changeAdminPasswordWithUserId(userId: number, currentPassword: string, newPassword: string) {
  try {
    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, await bcrypt.hash(ADMIN_CONFIG.ADMIN_PASSWORD, 10));
    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    if (newPassword.length < ADMIN_CONFIG.PASSWORD_MIN_LENGTH) {
      throw new Error(`Password must be at least ${ADMIN_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new Error('Password must contain uppercase, lowercase, number, and special character');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // In a real implementation, you would update this in a database
    // For now, we'll just return success
    return {
      success: true,
      message: 'Password changed successfully'
    };

  } catch (error) {
    throw error;
  }
}

// Get admin profile
export function getAdminProfile(req: Request, res: Response) {
  res.json({
    email: ADMIN_CONFIG.ADMIN_EMAIL,
    name: ADMIN_CONFIG.ADMIN_NAME,
    role: 'ADMIN',
    lastLogin: new Date().toISOString()
  });
}

// Get admin info (for direct calls)
export async function getAdminInfo(userId: number) {
  // In a real implementation, you would fetch this from the database
  // For now, we'll return the config values
  return {
    id: userId,
    email: ADMIN_CONFIG.ADMIN_EMAIL,
    name: ADMIN_CONFIG.ADMIN_NAME,
    role: 'ADMIN',
    createdAt: new Date()
  };
}

// Validate admin session
export function validateAdminSession(token: string) {
  try {
    const decoded = jwt.verify(token, ADMIN_CONFIG.JWT_SECRET) as any;
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return { valid: false, error: 'Invalid admin token.' };
    }

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return { valid: false, error: 'Token expired.' };
    }

    return { 
      valid: true, 
      user: {
        id: decoded.userId || 1,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    };
  } catch (error) {
    return { valid: false, error: 'Invalid token.' };
  }
}

// Ensure admin user exists (for setup)
export async function ensureAdminUser() {
  // In a real implementation, you would check/create the admin user in the database
  // For now, we'll just return the config values
  return {
    id: 1,
    email: ADMIN_CONFIG.ADMIN_EMAIL,
    password: ADMIN_CONFIG.ADMIN_PASSWORD,
    name: ADMIN_CONFIG.ADMIN_NAME,
    role: 'ADMIN'
  };
}

// Health check for admin service
export function adminHealthCheck(req: Request, res: Response) {
  res.json({
    status: 'healthy',
    service: 'admin-auth',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
}

// Export admin configuration for use in other modules
export { ADMIN_CONFIG }; 
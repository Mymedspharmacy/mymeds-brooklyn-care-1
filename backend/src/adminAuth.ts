import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Admin authentication configuration
const ADMIN_CONFIG = {
  // Strict admin credentials - these should be set in environment variables
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@mymedspharmacy.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Admin User',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-here-change-this-in-production',
  JWT_EXPIRES_IN: '24h' as const, // Token expires in 24 hours
  
  // Security settings
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
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
    // Check for too many failed attempts
    const clientIP = 'admin'; // For admin login, we use a single counter
    const attempts = failedLoginAttempts.get(clientIP);
    
    if (attempts && attempts.count >= ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      if (timeSinceLastAttempt < ADMIN_CONFIG.LOCKOUT_DURATION) {
        const remainingTime = Math.ceil((ADMIN_CONFIG.LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60);
        throw new Error(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
      } else {
        // Reset failed attempts after lockout period
        failedLoginAttempts.delete(clientIP);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format.');
    }

    // Find admin user
    let adminUser;
    try {
      adminUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          role: 'ADMIN'
        }
      });
    } catch (dbError: any) {
      if (dbError.message && dbError.message.includes("Can't reach database server")) {
        throw new Error('Database not available. Please ensure the database is running.');
      }
      throw dbError;
    }

    if (!adminUser) {
      recordFailedAttempt(clientIP);
      throw new Error('Invalid credentials.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      recordFailedAttempt(clientIP);
      throw new Error('Invalid credentials.');
    }

    // Reset failed attempts on successful login
    failedLoginAttempts.delete(clientIP);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      },
      ADMIN_CONFIG.JWT_SECRET as string,
      { expiresIn: ADMIN_CONFIG.JWT_EXPIRES_IN }
    );

    // Log successful login
    console.log(`✅ Admin login successful: ${adminUser.email} at ${new Date().toISOString()}`);

    return {
      success: true,
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      expiresIn: ADMIN_CONFIG.JWT_EXPIRES_IN
    };

  } catch (error: any) {
    console.error('❌ Admin login failed:', error.message);
    throw error;
  }
}

// Create or update admin user
export async function ensureAdminUser() {
  try {
    // Check if admin user exists
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.ADMIN_PASSWORD, 12);
      
      adminUser = await prisma.user.create({
        data: {
          email: ADMIN_CONFIG.ADMIN_EMAIL,
          password: hashedPassword,
          name: ADMIN_CONFIG.ADMIN_NAME,
          role: 'ADMIN'
        }
      });

      console.log('✅ Admin user created successfully');
      console.log(`Email: ${adminUser.email}`);
      console.log(`Name: ${adminUser.name}`);
      console.log(`Password: ${ADMIN_CONFIG.ADMIN_PASSWORD}`);
      console.log('⚠️  Please change the password after first login!');
    } else {
      // Update existing admin user with new credentials if environment variables changed
      const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.ADMIN_PASSWORD, 12);
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          email: ADMIN_CONFIG.ADMIN_EMAIL,
          password: hashedPassword,
          name: ADMIN_CONFIG.ADMIN_NAME
        }
      });

      console.log('✅ Admin user updated with new credentials');
    }

    return adminUser;
  } catch (error: any) {
    // Handle database connection errors gracefully
    if (error.message && error.message.includes("Can't reach database server")) {
      console.log('⚠️  Database not available. Admin user setup will be skipped.');
      console.log('   This is expected when running locally without Railway database.');
      return null;
    }
    console.error('❌ Error ensuring admin user:', error);
    throw error;
  }
}

// Change admin password
export async function changeAdminPassword(userId: number, currentPassword: string, newPassword: string) {
  try {
    // Validate new password strength
    if (newPassword.length < ADMIN_CONFIG.PASSWORD_MIN_LENGTH) {
      throw new Error(`Password must be at least ${ADMIN_CONFIG.PASSWORD_MIN_LENGTH} characters long.`);
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'admin', 'qwerty', 'letmein'];
    if (weakPasswords.includes(newPassword.toLowerCase())) {
      throw new Error('Password is too weak. Please choose a stronger password.');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      throw new Error('User not found or not an admin.');
    }

    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect.');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    console.log(`✅ Admin password changed successfully for user: ${user.email}`);

    return { success: true, message: 'Password changed successfully.' };
  } catch (error: any) {
    console.error('❌ Error changing admin password:', error);
    throw error;
  }
}

// Validate admin session
export function validateAdminSession(token: string) {
  try {
    const decoded = jwt.verify(token, ADMIN_CONFIG.JWT_SECRET as string) as any;
    
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
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    };
  } catch (error: any) {
    return { valid: false, error: 'Invalid token.' };
  }
}

// Record failed login attempt
function recordFailedAttempt(clientIP: string) {
  const attempts = failedLoginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  failedLoginAttempts.set(clientIP, attempts);

  console.log(`⚠️  Failed admin login attempt ${attempts.count}/${ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS}`);
  
  if (attempts.count >= ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS) {
    console.log(`🔒 Admin account locked for ${ADMIN_CONFIG.LOCKOUT_DURATION / 1000 / 60} minutes`);
  }
}

// Get admin user info
export async function getAdminInfo(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user || user.role !== 'ADMIN') {
      throw new Error('Admin user not found.');
    }

    return user;
  } catch (error: any) {
    console.error('❌ Error getting admin info:', error);
    throw error;
  }
}

// Logout function (client-side should remove token)
export function adminLogout() {
  // In a more advanced system, you might want to blacklist tokens
  // For now, we'll just return a success message
  return { success: true, message: 'Logged out successfully.' };
}

export default {
  adminAuthMiddleware,
  adminLogin,
  ensureAdminUser,
  changeAdminPassword,
  validateAdminSession,
  getAdminInfo,
  adminLogout,
  ADMIN_CONFIG
}; 
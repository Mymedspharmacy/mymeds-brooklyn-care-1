// Authentication Microservice
// Phase 3: Medium-term Scalability

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { shardingManager } from '../../config/database-sharding';

const prisma = shardingManager.getDefaultShard();

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    
    if (this.jwtSecret === 'fallback-secret-key-change-in-production') {
      console.warn('⚠️ WARNING: Using fallback JWT secret. Set JWT_SECRET in production!');
    }
  }

  // User Registration
  async registerUser(data: RegisterData): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Validate input data
      if (!this.validateEmail(data.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      if (!this.validatePassword(data.password)) {
        return { success: false, error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, this.bcryptRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'PATIENT',
          isActive: true,
          emailVerified: false
        }
      });

      // Send verification email (implement email service)
      await this.sendVerificationEmail(user.email, user.id);

      return { success: true, userId: user.id };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // User Login
  async loginUser(credentials: LoginCredentials): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
          permissions: true
        }
      });

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      if (!user.isActive) {
        return { success: false, error: 'Account is deactivated. Please contact support.' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate JWT token
      const payload: AuthPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      };

      const token = jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Verify JWT Token
  async verifyToken(token: string): Promise<{ valid: boolean; payload?: AuthPayload; error?: string }> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as AuthPayload;
      
      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { isActive: true, emailVerified: true }
      });

      if (!user || !user.isActive) {
        return { valid: false, error: 'User account is inactive or deleted' };
      }

      return { valid: true, payload };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      } else {
        console.error('Token verification error:', error);
        return { valid: false, error: 'Token verification failed' };
      }
    }
  }

  // Refresh Token
  async refreshToken(refreshToken: string): Promise<{ success: boolean; newToken?: string; error?: string }> {
    try {
      const result = await this.verifyToken(refreshToken);
      
      if (!result.valid || !result.payload) {
        return { success: false, error: result.error || 'Invalid refresh token' };
      }

      // Generate new token
      const newToken = jwt.sign(result.payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });

      return { success: true, newToken };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Token refresh failed' };
    }
  }

  // Change Password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate new password
      if (!this.validatePassword(newPassword)) {
        return { success: false, error: 'New password must be at least 8 characters with uppercase, lowercase, number, and special character' };
      }

      // Get user with current password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedNewPassword,
          passwordChangedAt: new Date()
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Password change failed. Please try again.' };
    }
  }

  // Reset Password Request
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, email: true }
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return { success: true };
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      // Store reset token (implement with Redis in production)
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken, resetPasswordExpires: new Date(Date.now() + 3600000) }
      });

      // Send reset email (implement email service)
      await this.sendPasswordResetEmail(user.email, resetToken);

      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Password reset request failed. Please try again.' };
    }
  }

  // Reset Password
  async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate new password
      if (!this.validatePassword(newPassword)) {
        return { success: false, error: 'New password must be at least 8 characters with uppercase, lowercase, number, and special character' };
      }

      // Verify reset token
      const payload = jwt.verify(resetToken, this.jwtSecret) as any;
      
      if (payload.type !== 'password-reset') {
        return { success: false, error: 'Invalid reset token' };
      }

      // Find user with valid reset token
      const user = await prisma.user.findFirst({
        where: {
          id: payload.userId,
          resetPasswordToken: resetToken,
          resetPasswordExpires: { gt: new Date() }
        }
      });

      if (!user) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          passwordChangedAt: new Date()
        }
      });

      return { success: true };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { success: false, error: 'Reset token has expired' };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { success: false, error: 'Invalid reset token' };
      } else {
        console.error('Password reset error:', error);
        return { success: false, error: 'Password reset failed. Please try again.' };
      }
    }
  }

  // Logout (invalidate token)
  async logout(userId: string): Promise<{ success: boolean }> {
    try {
      // In production, implement token blacklisting with Redis
      // For now, return success (tokens will expire naturally)
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  // Validation methods
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Email service methods (implement with actual email service)
  private async sendVerificationEmail(email: string, userId: string): Promise<void> {
    try {
      const emailService = this.getEmailService();
      await emailService.sendVerificationEmail(email, userId);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // In production, this should trigger an alert/retry mechanism
    }
  }

  private async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      const emailService = this.getEmailService();
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // In production, this should trigger an alert/retry mechanism
    }
  }

  private getEmailService() {
    // Return appropriate email service based on configuration
    const provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    
    switch (provider) {
      case 'sendgrid':
        return this.getSendGridService();
      case 'aws-ses':
        return this.getAWSSESService();
      case 'nodemailer':
        return this.getNodemailerService();
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
  }

  private getSendGridService() {
    return {
      sendVerificationEmail: async (email: string, userId: string) => {
        // Implement SendGrid verification email
        throw new Error('SendGrid service not implemented');
      },
      sendPasswordResetEmail: async (email: string, resetToken: string) => {
        // Implement SendGrid password reset email
        throw new Error('SendGrid service not implemented');
      }
    };
  }

  private getAWSSESService() {
    return {
      sendVerificationEmail: async (email: string, userId: string) => {
        // Implement AWS SES verification email
        throw new Error('AWS SES service not implemented');
      },
      sendPasswordResetEmail: async (email: string, resetToken: string) => {
        // Implement AWS SES password reset email
        throw new Error('AWS SES service not implemented');
      }
    };
  }

  private getNodemailerService() {
    return {
      sendVerificationEmail: async (email: string, userId: string) => {
        // Implement Nodemailer verification email
        throw new Error('Nodemailer service not implemented');
      },
      sendPasswordResetEmail: async (email: string, resetToken: string) => {
        // Implement Nodemailer password reset email
        throw new Error('Nodemailer service not implemented');
      }
    };
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { permissions: true, role: true }
      });

      if (!user) return [];

      // Combine role-based and custom permissions
      const rolePermissions = this.getRolePermissions(user.role);
      const customPermissions = user.permissions || [];

      return [...new Set([...rolePermissions, ...customPermissions])];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  private getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'ADMIN': ['*'], // All permissions
      'PHARMACIST': ['read:products', 'write:products', 'read:orders', 'write:orders', 'read:users'],
      'PATIENT': ['read:own-profile', 'write:own-profile', 'read:products', 'read:own-orders', 'write:own-orders'],
      'GUEST': ['read:products']
    };

    return rolePermissions[role] || [];
  }
}

// Export singleton instance
export const authService = new AuthService();

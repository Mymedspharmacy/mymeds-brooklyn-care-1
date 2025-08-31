// Authentication Microservice
// Phase 3: Medium-term Scalability

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { shardingManager } from '../../config/database-sharding';

// Get Prisma client from sharding manager
const prisma = shardingManager.getDefaultShard();

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  async registerUser(data: RegisterData): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          phone: data.phone,
          role: 'PATIENT',
          isActive: true,
          emailVerified: false
        }
      });

      // Send verification email
      await this.sendVerificationEmail(user.email, user.id.toString());

      return { success: true, userId: user.id.toString() };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  async loginUser(data: LoginData): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          permissions: true,
          isActive: true,
          emailVerified: true
        }
      });

      if (!user || !user.isActive) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Create JWT payload
      const payload: AuthPayload = {
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
        permissions: Array.isArray(user.permissions) ? user.permissions : []
      };

      // Generate token
      const token = jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });

      // Return user data (without password)
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  async verifyToken(token: string): Promise<{ success: boolean; payload?: AuthPayload; error?: string }> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as AuthPayload;
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: parseInt(payload.userId) },
        select: { id: true, isActive: true }
      });

      if (!user || !user.isActive) {
        return { success: false, error: 'User not found or inactive' };
      }

      return { success: true, payload };
    } catch (error) {
      return { success: false, error: 'Invalid token' };
    }
  }

  async refreshToken(token: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const result = await this.verifyToken(token);
      if (!result.success || !result.payload) {
        return { success: false, error: 'Invalid token' };
      }

      // Generate new token
      const newToken = jwt.sign(result.payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });

      return { success: true, token: newToken };
    } catch (error) {
      return { success: false, error: 'Token refresh failed' };
    }
  }

  async getUserProfile(userId: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          permissions: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Failed to get user profile' };
    }
  }

  async updateUserProfile(userId: string, data: any): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const user = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          name: data.name,
          phone: data.phone,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          updatedAt: true
        }
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  }

  private async sendVerificationEmail(email: string, userId: string): Promise<void> {
    // Implementation for sending verification email
    console.log(`Sending verification email to ${email} for user ${userId}`);
    // Add your email service implementation here
  }
}

import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { Request, Response, NextFunction } from 'express';
import { validate, userSchemas } from '../middleware/validation';

const router = Router();
const prisma = new PrismaClient();

// JWT secret validation
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}
const JWT_SECRET_ASSERTED = JWT_SECRET as string;

// Register with validation
router.post('/register', validate(userSchemas.register), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    
    // Hash password with increased salt rounds for production
    const hash = await bcrypt.hash(password, 12);
    
    // Create user with validated data
    const user = await prisma.user.create({ 
      data: { 
        email, 
        password: hash, 
        name,
        isActive: true,
        emailVerified: false,
        role: 'CUSTOMER'
      } 
    });
    
    // Don't send password in response
    res.status(201).json({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role,
      message: 'User registered successfully. Please verify your email.'
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login with validation
router.post('/login', validate(userSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email 
      }, 
      JWT_SECRET_ASSERTED, 
      { 
        expiresIn: '7d',
        issuer: 'mymeds-pharmacy',
        audience: 'mymeds-users'
      }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        emailVerified: user.emailVerified
      } 
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin password reset request
router.post('/admin-reset-request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'ADMIN') {
      // Always respond with success to avoid user enumeration
      return res.json({ success: true });
    }
    // Generate reset token (JWT, expires in 30 min)
    const resetToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET_ASSERTED, { expiresIn: '30m' });
    // Production email sending with proper error handling
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin-reset?token=${resetToken}`;
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP configuration missing. Email sending disabled.');
      return res.status(503).json({ error: 'Email service not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@mymedspharmacy.com',
        to: user.email,
        subject: 'Admin Password Reset',
        html: `<p>You requested a password reset for your admin account.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link will expire in 30 minutes.</p>`
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Admin reset request error:', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Admin password reset
router.post('/admin-reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Missing token or password' });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET_ASSERTED);
    } catch {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    if (typeof payload === 'object' && payload !== null && 'userId' in payload) {
      const user = await prisma.user.findUnique({ where: { id: (payload as any).userId } });
      if (!user || user.role !== 'ADMIN') return res.status(400).json({ error: 'Invalid user' });
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
      res.json({ success: true });
    } else {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
  } catch (err) {
    console.error('Admin reset error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get current user (protected route)
router.get('/me', unifiedAdminAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: (req as any).user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Unified admin auth middleware
export function unifiedAdminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET_ASSERTED);
    if (typeof payload === 'object' && (payload as any).role === 'ADMIN') {
      req.user = payload;
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: admin only' });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default router; 
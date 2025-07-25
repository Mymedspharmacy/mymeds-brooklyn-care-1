import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash, name } });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
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
    const resetToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30m' });
    // Send email (placeholder logic)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin-reset?token=${resetToken}`;
    // TODO: Replace with real email sending
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'user',
        pass: process.env.SMTP_PASS || 'pass',
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@mymeds.com',
      to: user.email,
      subject: 'Admin Password Reset',
      html: `<p>You requested a password reset for your admin account.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link will expire in 30 minutes.</p>`
    });
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
      payload = jwt.verify(token, JWT_SECRET);
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

// Unified admin auth middleware
export function unifiedAdminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
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
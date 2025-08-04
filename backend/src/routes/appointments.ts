import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const emailRecipient = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === 'object' && 'userId' in payload) {
      req.user = payload;
      next();
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Public: create appointment request (no auth required)
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, service, preferredDate, preferredTime, notes } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !phone || !email || !service || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create default user for public requests
    let defaultUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!defaultUser) {
      // Create admin user with proper hashed password
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      defaultUser = await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL || 'admin@mymeds.com',
          password: hashedPassword,
          name: process.env.ADMIN_NAME || 'Admin User',
          role: 'ADMIN'
        }
      });
    }

    // Create appointment request
    const appointment = await prisma.appointment.create({
      data: {
        userId: defaultUser.id,
        date: new Date(preferredDate + ' ' + preferredTime),
        reason: `Service: ${service}\nPatient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email}\nNotes: ${notes || 'None'}`,
        status: 'PENDING'
      }
    });
    
    // Send notification email
    try {
      if (emailRecipient) {
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailRecipient,
          subject: `New Appointment Request from ${firstName} ${lastName}`,
          text: `Patient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\nPreferred Date: ${preferredDate}\nPreferred Time: ${preferredTime}\nNotes: ${notes}`
        });
      }
    } catch (emailError) {
      console.error('Failed to send appointment notification email:', emailError);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Appointment request submitted successfully',
      appointmentId: appointment.id 
    });
  } catch (err) {
    console.error('Error creating appointment request:', err);
    res.status(500).json({ error: 'Failed to submit appointment request' });
  }
});

// User: create appointment (authenticated users)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { date, reason, status } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.userId,
        date: new Date(date),
        reason,
        status
      }
    });
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// User: get own appointments
router.get('/my', auth, async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({ where: { userId: req.user.userId } });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Admin: get all appointments
router.get('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const appointments = await prisma.appointment.findMany({ take: limit });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Admin: delete appointment
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    await prisma.appointment.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router; 
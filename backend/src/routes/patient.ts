import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Email transporter setup
const emailRecipient = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;
const emailTransporter = nodemailer.createTransporter({
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
  if (!header) return res.status(401).json({ error: 'No token provided' });
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

// GET /api/patient/profile - Get patient profile
router.get('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error fetching patient profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/patient/profile - Update patient profile
router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating patient profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/prescriptions - Get patient's prescriptions
router.get('/prescriptions', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const prescriptions = await prisma.prescription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to match frontend expectations
    const transformedPrescriptions = prescriptions.map(prescription => ({
      id: prescription.id.toString(),
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.instructions,
      refills: 0, // This would need to be calculated based on business logic
      status: prescription.notified ? 'refill-needed' : 'active',
      lastFilled: prescription.createdAt.toISOString().split('T')[0],
      nextRefill: new Date(prescription.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prescriber: 'Dr. Prescriber' // This would come from a separate prescriber table
    }));

    res.json({ prescriptions: transformedPrescriptions });
  } catch (err) {
    console.error('Error fetching patient prescriptions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/appointments - Get patient's appointments
router.get('/appointments', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    // Transform data to match frontend expectations
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.id.toString(),
      type: appointment.reason.split('\n')[0].replace('Service: ', ''),
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.date.toTimeString().split(' ')[0].substring(0, 5),
      status: appointment.status.toLowerCase(),
      provider: 'Dr. Provider', // This would come from a separate provider table
      notes: appointment.reason.includes('Notes:') ? appointment.reason.split('Notes:')[1] : undefined
    }));

    res.json({ appointments: transformedAppointments });
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/health-records - Get patient's health records (simulated)
router.get('/health-records', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // For now, return simulated health records
    // In a real implementation, this would query a health records table
    const healthRecords = [
      {
        id: '1',
        type: 'Blood Pressure',
        date: '2024-01-20',
        provider: 'Dr. Williams',
        result: '120/80 mmHg',
        status: 'normal'
      },
      {
        id: '2',
        type: 'Blood Glucose',
        date: '2024-01-20',
        provider: 'Dr. Williams',
        result: '95 mg/dL',
        status: 'normal'
      }
    ];

    res.json({ healthRecords });
  } catch (err) {
    console.error('Error fetching patient health records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/messages - Get patient's messages
router.get('/messages', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // For now, return empty messages array
    // In a real implementation, this would query a messages table
    const messages: any[] = [];

    res.json({ messages });
  } catch (err) {
    console.error('Error fetching patient messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/patient/messages - Send a message to pharmacy team
router.post('/messages', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Get user info for the email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send email to pharmacy team
    try {
      if (emailRecipient) {
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailRecipient,
          subject: `Patient Message: ${subject}`,
          text: `From: ${user.name} (${user.email})\nSubject: ${subject}\n\nMessage:\n${message}`
        });
      }
    } catch (emailError) {
      console.error('Failed to send message email:', emailError);
    }

    // Create notification for admin
    await prisma.notification.create({
      data: {
        type: 'message',
        title: `New Message from ${user.name}`,
        message: subject,
        data: JSON.stringify({ userId, subject, message })
      }
    });

    res.json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (err) {
    console.error('Error sending patient message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/refill-requests - Get patient's refill requests
router.get('/refill-requests', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const refillRequests = await prisma.refillRequest.findMany({
      where: { userId },
      orderBy: { requestedDate: 'desc' }
    });

    res.json({ refillRequests });
  } catch (err) {
    console.error('Error fetching patient refill requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/transfer-requests - Get patient's transfer requests
router.get('/transfer-requests', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const transferRequests = await prisma.transferRequest.findMany({
      where: { userId },
      orderBy: { requestedDate: 'desc' }
    });

    res.json({ transferRequests });
  } catch (err) {
    console.error('Error fetching patient transfer requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/dashboard - Get dashboard overview data
router.get('/dashboard', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // Get counts for dashboard
    const [prescriptions, appointments, refillRequests, transferRequests] = await Promise.all([
      prisma.prescription.count({ where: { userId } }),
      prisma.appointment.count({ where: { userId } }),
      prisma.refillRequest.count({ where: { userId } }),
      prisma.transferRequest.count({ where: { userId } })
    ]);

    // Get recent activity
    const recentActivity = await prisma.refillRequest.findMany({
      where: { userId },
      take: 5,
      orderBy: { requestedDate: 'desc' },
      select: {
        id: true,
        medication: true,
        status: true,
        requestedDate: true
      }
    });

    const dashboardData = {
      stats: {
        activePrescriptions: prescriptions,
        upcomingAppointments: appointments,
        pendingRefills: refillRequests,
        transferRequests: transferRequests
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: 'refill-request',
        title: `Refill requested for ${activity.medication}`,
        status: activity.status,
        date: activity.requestedDate
      }))
    };

    res.json(dashboardData);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

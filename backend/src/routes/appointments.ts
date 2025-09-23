import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Email functionality temporarily disabled

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
          email: process.env.ADMIN_EMAIL || 'admin@mymedspharmacy.com',
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
        patientName: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        date: new Date(preferredDate + ' ' + preferredTime),
        time: preferredTime,
        reason: `Service: ${service}\nNotes: ${notes || 'None'}`,
        status: 'PENDING'
      }
    });
    
    // Email notifications temporarily disabled

    res.status(201).json({ 
      success: true, 
      message: 'Appointment request submitted successfully',
      appointmentId: appointment.id 
    });
  } catch (err) {
    console.error('Error creating appointment request:', err);
    res.status(500).json({ error: 'Failed to create appointment request' });
  }
});

// User: create appointment (authenticated users)
router.post('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { date, reason, status } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.userId,
        patientName: req.user.name || 'Admin User',
        email: req.user.email || 'admin@mymedspharmacyinc.com',
        phone: '',
        date: new Date(date),
        time: new Date(date).toTimeString().split(' ')[0],
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
router.get('/my', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
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
router.delete('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
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
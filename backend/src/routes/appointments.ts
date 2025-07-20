import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
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
      defaultUser = await prisma.user.create({
        data: {
          email: 'admin@mymeds.com',
          password: 'hashedpassword',
          name: 'Admin User',
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
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const appointments = await prisma.appointment.findMany();
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
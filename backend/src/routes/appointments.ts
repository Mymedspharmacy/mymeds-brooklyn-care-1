import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { authenticateAdmin } from '../middleware/auth';

import { AuthRequest } from '../types/express';

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
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        throw new Error('ADMIN_PASSWORD environment variable is required');
      }
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      defaultUser = await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL,
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
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { date, reason, status } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        userId: parseInt(req.user.userId),
        patientName: req.user.name || 'Admin User',
        email: req.user.email || 'mymedspharmacy@outlook.com',
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
router.get('/my', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({ where: { userId: parseInt(req.user.userId) } });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Admin: get all appointments
router.get('/admin/all', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      success: true,
      data: {
        appointments
      }
    });
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Admin: get all appointments (legacy endpoint)
router.get('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const appointments = await prisma.appointment.findMany({ take: limit });
    res.json({
      success: true,
      data: appointments,
      message: 'Appointments retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Admin: get appointment statistics
router.get('/admin/stats', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      thisWeekAppointments,
      thisMonthAppointments
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.appointment.count({
        where: { status: 'PENDING' }
      }),
      prisma.appointment.count({
        where: {
          date: {
            gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.appointment.count({
        where: {
          date: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1)
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalAppointments,
        today: todayAppointments,
        pending: pendingAppointments,
        thisWeek: thisWeekAppointments,
        thisMonth: thisMonthAppointments,
        completed: await prisma.appointment.count({ where: { status: 'COMPLETED' } }),
        cancelled: await prisma.appointment.count({ where: { status: 'CANCELLED' } }),
        confirmed: await prisma.appointment.count({ where: { status: 'CONFIRMED' } })
      }
    });
  } catch (err) {
    console.error('Error fetching appointment stats:', err);
    res.status(500).json({ error: 'Failed to fetch appointment statistics' });
  }
});

// Admin: update appointment status
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const appointmentId = Number(req.params.id);
    const { status, reason, date, time } = req.body;
    
    // Validate status if provided
    if (status && !['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status', 
        message: 'Status must be one of: PENDING, CONFIRMED, COMPLETED, CANCELLED' 
      });
    }
    
    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (reason) updateData.reason = reason;
    if (date) {
      updateData.date = new Date(date);
      updateData.time = time || new Date(date).toTimeString().split(' ')[0];
    }
    
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: appointment,
      message: `Appointment ${status ? `status updated to ${status}` : 'updated successfully'}`
    });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ 
      error: 'Failed to update appointment',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Admin: delete appointment
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
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
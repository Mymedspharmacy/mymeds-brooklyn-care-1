import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { secureAdminAuthMiddleware } from '../services/SecureAdminAuth';
import { io } from '../index';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// ✅ IMPLEMENTED: Create notification function
async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  userId?: number;
  adminOnly?: boolean;
  data?: any;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data ? JSON.stringify(data.data) : null
      }
    });

    // ✅ IMPLEMENTED: Send real-time notification
    if (data.adminOnly) {
      io.to('admin-room').emit('new-notification', notification);
    } else if (data.userId) {
      io.to(`user-${data.userId}`).emit('new-notification', notification);
    } else {
      // Send to admin room for general notifications
      io.to('admin-room').emit('new-notification', notification);
    }

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
}

// ✅ IMPLEMENTED: System notification triggers
export async function triggerSystemNotification(event: string, data: any) {
  const notifications: Record<string, {
    type: string;
    title: string;
    message: string;
    adminOnly: boolean;
  }> = {
    'new-order': {
      type: 'ORDER',
      title: 'New Order Received',
      message: `Order #${data.orderNumber || data.id} has been placed for $${data.total}`,
      adminOnly: true
    },
    'new-appointment': {
      type: 'APPOINTMENT',
      title: 'New Appointment Request',
      message: `Appointment request from ${data.patientName || 'Patient'} for ${data.service || 'service'}`,
      adminOnly: true
    },
    'new-prescription': {
      type: 'PRESCRIPTION',
      title: 'New Prescription Request',
      message: `Prescription request for ${data.medication} from ${data.patientName || 'Patient'}`,
      adminOnly: true
    },
    'new-contact': {
      type: 'CONTACT',
      title: 'New Contact Form Submission',
      message: `Contact form submitted by ${data.name || 'User'}: ${data.subject || 'No subject'}`,
      adminOnly: true
    },
    'low-stock': {
      type: 'INVENTORY',
      title: 'Low Stock Alert',
      message: `Product ${data.productName} is running low (${data.quantity} remaining)`,
      adminOnly: true
    },
    'payment-success': {
      type: 'PAYMENT',
      title: 'Payment Successful',
      message: `Payment of $${data.amount} for order #${data.orderId} was successful`,
      adminOnly: true
    },
    'payment-failed': {
      type: 'PAYMENT',
      title: 'Payment Failed',
      message: `Payment of $${data.amount} for order #${data.orderId} failed`,
      adminOnly: true
    }
  };

  const notification = notifications[event];
  if (notification) {
    await createNotification({
      ...notification,
      data: data
    });
  }
}

// Admin: get all notifications
router.get('/', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { type, read, limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(limit as string), 100);
    
    const where: any = {};
    if (type) where.type = type;
    if (read !== undefined) where.read = read === 'true';

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limitNum
    });

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Admin: get unread notifications count
router.get('/unread-count', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const count = await prisma.notification.count({
      where: { read: false }
    });

    res.json({ count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Admin: mark notification as read
router.put('/:id/read', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const notification = await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { read: true }
    });

    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Admin: mark all notifications as read
router.put('/mark-all-read', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Admin: delete notification
router.delete('/:id', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    await prisma.notification.delete({
      where: { id: Number(req.params.id) }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ✅ IMPLEMENTED: Create notification endpoint
router.post('/create', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { type, title, message, userId, adminOnly, data } = req.body;
    
    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Type, title, and message are required' });
    }

    const notification = await createNotification({
      type,
      title,
      message,
      userId,
      adminOnly,
      data
    });

    res.json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Admin: get notification statistics
router.get('/stats/overview', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const [total, unread, today, thisWeek, thisMonth] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Get notification counts by type
    const typeCounts = await prisma.notification.groupBy({
      by: ['type'],
      _count: {
        type: true
      },
      orderBy: {
        _count: {
          type: 'desc'
        }
      }
    });

    const recentNotifications = await prisma.notification.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      total,
      unread,
      today,
      thisWeek,
      thisMonth,
      typeCounts,
      recentNotifications
    });
  } catch (err) {
    console.error('Error fetching notification statistics:', err);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

export default router; 
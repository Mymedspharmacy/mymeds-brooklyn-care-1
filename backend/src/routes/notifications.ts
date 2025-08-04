import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Admin: get all notifications
router.get('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
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
router.get('/unread-count', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
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
router.put('/:id/read', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
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
router.put('/mark-all-read', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
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
router.delete('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
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

// Admin: get notification statistics
router.get('/stats/overview', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const [total, unread, today] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    // Get notifications by type
    const typeStats = await prisma.notification.groupBy({
      by: ['type'],
      _count: {
        type: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    const recentNotifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      total,
      unread,
      today,
      typeStats,
      recentNotifications
    });
  } catch (err) {
    console.error('Error fetching notification stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Admin: create notification (for testing or manual creation)
router.post('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { type, title, message, data } = req.body;
    
    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Type, title, and message are required' });
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null
      }
    });

    res.status(201).json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router; 
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { secureAdminAuthMiddleware } from '../services/SecureAdminAuth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Public: submit refill request
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, medication, dosage, urgency, notes } = req.body;
    
    if (!medication || !dosage) {
      return res.status(400).json({ error: 'Medication and dosage are required' });
    }

    const refillRequest = await prisma.refillRequest.create({
      data: {
        userId: Number(userId) || 1, // Default to customer user if not provided
        medication,
        dosage,
        quantity: 30, // Default quantity
        urgency: urgency || 'normal',
        notes,
        status: 'pending',
        notified: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'refill',
        title: 'New Refill Request',
        message: `New refill request for ${medication} from user ${refillRequest.userId}`,
        data: JSON.stringify({ refillRequestId: refillRequest.id })
      }
    });

    res.status(201).json(refillRequest);
  } catch (err) {
    console.error('Error creating refill request:', err);
    res.status(500).json({ error: 'Failed to create refill request' });
  }
});

// Admin: get all refill requests
router.get('/', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { status, urgency, limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(limit as string), 100);
    
    const where: any = {};
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;

    const refillRequests = await prisma.refillRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { requestedDate: 'desc' },
      take: limitNum
    });

    res.json(refillRequests);
  } catch (err) {
    console.error('Error fetching refill requests:', err);
    res.status(500).json({ error: 'Failed to fetch refill requests' });
  }
});

// Admin: get specific refill request
router.get('/:id', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const refillRequest = await prisma.refillRequest.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!refillRequest) {
      return res.status(404).json({ error: 'Refill request not found' });
    }

    res.json(refillRequest);
  } catch (err) {
    console.error('Error fetching refill request:', err);
    res.status(500).json({ error: 'Failed to fetch refill request' });
  }
});

// Admin: update refill request status
router.put('/:id', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { status, notes, completedDate } = req.body;
    const id = Number(req.params.id);

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (status === 'completed' && !completedDate) {
      updateData.completedDate = new Date();
    } else if (completedDate) {
      updateData.completedDate = new Date(completedDate);
    }

    const refillRequest = await prisma.refillRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Mark as notified
    await prisma.refillRequest.update({
      where: { id },
      data: { notified: true }
    });

    res.json(refillRequest);
  } catch (err) {
    console.error('Error updating refill request:', err);
    res.status(500).json({ error: 'Failed to update refill request' });
  }
});

// Admin: delete refill request
router.delete('/:id', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    await prisma.refillRequest.delete({
      where: { id: Number(req.params.id) }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting refill request:', err);
    res.status(500).json({ error: 'Failed to delete refill request' });
  }
});

// Admin: get refill request statistics
router.get('/stats/overview', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const [total, pending, approved, completed, urgent] = await Promise.all([
      prisma.refillRequest.count(),
      prisma.refillRequest.count({ where: { status: 'pending' } }),
      prisma.refillRequest.count({ where: { status: 'approved' } }),
      prisma.refillRequest.count({ where: { status: 'completed' } }),
      prisma.refillRequest.count({ where: { urgency: 'urgent' } })
    ]);

    const recentRequests = await prisma.refillRequest.findMany({
      take: 5,
      orderBy: { requestedDate: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      total,
      pending,
      approved,
      completed,
      urgent,
      recentRequests
    });
  } catch (err) {
    console.error('Error fetching refill request stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Create new refill request (admin only)
router.post('/admin/create', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      medicationName, 
      prescriptionNumber, 
      quantity, 
      dosage, 
      instructions, 
      priority = 'NORMAL' 
    } = req.body;

    // Validate required fields
    if (!userId || !medicationName || !prescriptionNumber || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'User ID, medication name, prescription number, and quantity are required'
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create refill request
    const refillRequest = await prisma.refillRequest.create({
      data: {
        userId: parseInt(userId),
        medication: medicationName,
        quantity: parseInt(quantity),
        dosage: dosage || '',
        notes: instructions || `Created by admin on ${new Date().toISOString()}`,
        status: 'PENDING',
        urgency: priority.toLowerCase()
      },
      include: {
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        title: 'New Refill Request',
        message: `Your refill request for ${medicationName} has been submitted and is pending review.`,
        type: 'info',
        userId: parseInt(userId),
        read: false
      }
    });

    res.status(201).json({
      success: true,
      data: refillRequest,
      message: 'Refill request created successfully'
    });

  } catch (error: any) {
    console.error('Create refill request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create refill request',
      message: error.message
    });
  }
});

export default router; 
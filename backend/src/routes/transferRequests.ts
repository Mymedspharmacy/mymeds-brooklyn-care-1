import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Public: submit transfer request
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, currentPharmacy, medications, notes } = req.body;
    
    if (!currentPharmacy || !medications) {
      return res.status(400).json({ error: 'Current pharmacy and medications are required' });
    }

    const transferRequest = await prisma.transferRequest.create({
      data: {
        userId: Number(userId) || 1, // Default to customer user if not provided
        fromPharmacy: currentPharmacy,
        toPharmacy: 'MyMeds Pharmacy',
        currentPharmacy,
        medication: Array.isArray(medications) ? medications[0] : medications.split(',')[0] || 'Unknown',
        medications: Array.isArray(medications) ? JSON.stringify(medications) : medications,
        dosage: 'As prescribed',
        quantity: 30,
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
        type: 'transfer',
        title: 'New Transfer Request',
        message: `New transfer request from ${currentPharmacy} by user ${transferRequest.userId}`,
        data: JSON.stringify({ transferRequestId: transferRequest.id })
      }
    });

    res.status(201).json(transferRequest);
  } catch (err) {
    console.error('Error creating transfer request:', err);
    res.status(500).json({ error: 'Failed to create transfer request' });
  }
});

// Admin: get all transfer requests
router.get('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { status, limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(limit as string), 100);
    
    const where: any = {};
    if (status) where.status = status;

    const transferRequests = await prisma.transferRequest.findMany({
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

    // Parse medications JSON for each request
    const parsedRequests = transferRequests.map(request => ({
      ...request,
      medications: JSON.parse(request.medications)
    }));

    res.json(parsedRequests);
  } catch (err) {
    console.error('Error fetching transfer requests:', err);
    res.status(500).json({ error: 'Failed to fetch transfer requests' });
  }
});

// Admin: get specific transfer request
router.get('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const transferRequest = await prisma.transferRequest.findUnique({
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

    if (!transferRequest) {
      return res.status(404).json({ error: 'Transfer request not found' });
    }

    // Parse medications JSON
    const parsedRequest = {
      ...transferRequest,
      medications: JSON.parse(transferRequest.medications)
    };

    res.json(parsedRequest);
  } catch (err) {
    console.error('Error fetching transfer request:', err);
    res.status(500).json({ error: 'Failed to fetch transfer request' });
  }
});

// Admin: update transfer request status
router.put('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
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

    const transferRequest = await prisma.transferRequest.update({
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
    await prisma.transferRequest.update({
      where: { id },
      data: { notified: true }
    });

    // Parse medications JSON
    const parsedRequest = {
      ...transferRequest,
      medications: JSON.parse(transferRequest.medications)
    };

    res.json(parsedRequest);
  } catch (err) {
    console.error('Error updating transfer request:', err);
    res.status(500).json({ error: 'Failed to update transfer request' });
  }
});

// Admin: delete transfer request
router.delete('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    await prisma.transferRequest.delete({
      where: { id: Number(req.params.id) }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting transfer request:', err);
    res.status(500).json({ error: 'Failed to delete transfer request' });
  }
});

// Admin: get transfer request statistics
router.get('/stats/overview', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const [total, pending, approved, completed] = await Promise.all([
      prisma.transferRequest.count(),
      prisma.transferRequest.count({ where: { status: 'pending' } }),
      prisma.transferRequest.count({ where: { status: 'approved' } }),
      prisma.transferRequest.count({ where: { status: 'completed' } })
    ]);

    const recentRequests = await prisma.transferRequest.findMany({
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

    // Parse medications JSON for recent requests
    const parsedRecentRequests = recentRequests.map(request => ({
      ...request,
      medications: JSON.parse(request.medications)
    }));

    res.json({
      total,
      pending,
      approved,
      completed,
      recentRequests: parsedRecentRequests
    });
  } catch (err) {
    console.error('Error fetching transfer request stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router; 
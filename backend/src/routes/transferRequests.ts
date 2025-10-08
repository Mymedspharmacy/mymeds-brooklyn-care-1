import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin } from '../middleware/auth';

import { AuthRequest } from '../types/express';

const router = Router();
const prisma = new PrismaClient();

// Public: submit transfer request
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, currentPharmacy, medications, notes, phone } = req.body;
    
    if (!currentPharmacy || !medications) {
      return res.status(400).json({ error: 'Current pharmacy and medications are required' });
    }

    const transferRequest = await prisma.transferRequest.create({
      data: {
        patientName: 'Guest Patient',
        email: 'guest@pharmacy.com',
        phone: phone || '',
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
      } as any,
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
router.get('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { status, limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(limit as string), 100);
    
    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;

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
    const parsedRequests = transferRequests.map(request => {
      try {
        return {
          ...request,
          medications: typeof request.medications === 'string' ? JSON.parse(request.medications) : request.medications
        };
      } catch (parseError) {
        console.warn(`Failed to parse medications for request ${request.id}:`, parseError);
        return {
          ...request,
          medications: request.medications // Return as-is if parsing fails
        };
      }
    });

    res.json({
      success: true,
      data: parsedRequests,
      message: 'Transfer requests retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching transfer requests:', err);
    res.status(500).json({ error: 'Failed to fetch transfer requests' });
  }
});

// Admin: get specific transfer request
router.get('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
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

    // Parse medications JSON safely
    let parsedMedications = transferRequest.medications;
    if (typeof transferRequest.medications === 'string') {
      try {
        parsedMedications = JSON.parse(transferRequest.medications);
      } catch (parseError) {
        console.warn(`Failed to parse medications for request ${transferRequest.id}:`, parseError);
        // Keep as string if parsing fails
        parsedMedications = transferRequest.medications;
      }
    }

    const parsedRequest = {
      ...transferRequest,
      medications: parsedMedications
    };

    res.json(parsedRequest);
  } catch (err) {
    console.error('Error fetching transfer request:', err);
    res.status(500).json({ error: 'Failed to fetch transfer request' });
  }
});

// Admin: update transfer request status
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { status, notes, completedDate } = req.body;
    const id = Number(req.params.id);

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

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

    // Parse medications JSON safely
    let parsedMedications = transferRequest.medications;
    if (typeof transferRequest.medications === 'string') {
      try {
        parsedMedications = JSON.parse(transferRequest.medications);
      } catch (parseError) {
        console.warn(`Failed to parse medications for request ${transferRequest.id}:`, parseError);
        // Keep as string if parsing fails
        parsedMedications = transferRequest.medications;
      }
    }

    const parsedRequest = {
      ...transferRequest,
      medications: parsedMedications
    };

    res.json(parsedRequest);
  } catch (err) {
    console.error('Error updating transfer request:', err);
    res.status(500).json({ error: 'Failed to update transfer request' });
  }
});

// Admin: delete transfer request
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
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
router.get('/stats/overview', authenticateAdmin, async (req: AuthRequest, res: Response) => {
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
    const parsedRecentRequests = recentRequests.map(request => {
      try {
        return {
          ...request,
          medications: typeof request.medications === 'string' ? JSON.parse(request.medications) : request.medications
        };
      } catch (parseError) {
        console.warn(`Failed to parse medications for request ${request.id}:`, parseError);
        return {
          ...request,
          medications: request.medications // Return as-is if parsing fails
        };
      }
    });

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

// Create new transfer request (admin only)
router.post('/admin/create', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      fromPharmacy, 
      toPharmacy, 
      medicationName, 
      prescriptionNumber, 
      quantity, 
      dosage, 
      reason, 
      priority = 'NORMAL' 
    } = req.body;

    // Validate required fields
    if (!userId || !fromPharmacy || !toPharmacy || !medicationName || !prescriptionNumber || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'User ID, pharmacies, medication name, prescription number, and quantity are required'
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

    // Create transfer request
    const transferRequest = await prisma.transferRequest.create({
      data: {
        patientName: user.name || 'Patient',
        email: user.email,
        phone: user.phone || '',
        fromPharmacy,
        toPharmacy,
        medication: medicationName,
        quantity: parseInt(quantity),
        dosage: dosage || '',
        notes: reason || `Transfer requested by admin on ${new Date().toISOString()}`,
        status: 'PENDING'
      } as any,
      include: {
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        title: 'New Transfer Request',
        message: `Your prescription transfer request for ${medicationName} from ${fromPharmacy} to ${toPharmacy} has been submitted.`,
        type: 'info',
        userId: parseInt(userId),
        read: false
      }
    });

    res.status(201).json({
      success: true,
      data: transferRequest,
      message: 'Transfer request created successfully'
    });

  } catch (error: unknown) {
    console.error('Create transfer request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transfer request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
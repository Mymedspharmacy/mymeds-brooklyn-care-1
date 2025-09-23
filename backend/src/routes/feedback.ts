import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Feedback schema
const feedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject must be at most 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be at most 1000 characters'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  category: z.enum(['service', 'product', 'website', 'general', 'complaint', 'suggestion']).default('general'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  contactPreference: z.enum(['email', 'phone', 'none']).default('email'),
  phone: z.string().optional(),
  department: z.enum(['pharmacy', 'customer_service', 'technical', 'billing', 'management']).optional()
});

// Submit feedback
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = feedbackSchema.parse(req.body);
    
    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        rating: validatedData.rating,
        category: validatedData.category,
        priority: validatedData.priority,
        contactPreference: validatedData.contactPreference,
        phone: validatedData.phone,
        department: validatedData.department,
        status: 'new',
        ticketNumber: generateTicketNumber()
      }
    });
    
    // Send notification email to admin (implement email service)
    // await sendFeedbackNotificationEmail(feedback);
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. We will respond within 24 hours.',
      feedback: {
        id: feedback.id,
        ticketNumber: feedback.ticketNumber,
        subject: feedback.subject,
        category: feedback.category,
        priority: feedback.priority,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });
    
  } catch (error: any) {
    console.error('Error creating feedback:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    res.status(500).json({
      error: 'Failed to submit feedback',
      message: error.message
    });
  }
});

// Get feedback by ticket number (public)
router.get('/track/:ticketNumber', async (req: Request, res: Response) => {
  try {
    const { ticketNumber } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required to track feedback' });
    }
    
    const feedback = await prisma.feedback.findFirst({
      where: {
        ticketNumber,
        email: email as string
      },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({
      success: true,
      feedback: {
        id: feedback.id,
        ticketNumber: feedback.ticketNumber,
        subject: feedback.subject,
        message: feedback.message,
        category: feedback.category,
        priority: feedback.priority,
        status: feedback.status,
        createdAt: feedback.createdAt,
        responses: feedback.responses.map(response => ({
          id: response.id,
          message: response.message,
          isAdminResponse: response.isAdminResponse,
          createdAt: response.createdAt
        }))
      }
    });
    
  } catch (error: any) {
    console.error('Error tracking feedback:', error);
    res.status(500).json({
      error: 'Failed to track feedback',
      message: error.message
    });
  }
});

// Get all feedback (admin only)
router.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, category, priority } = req.query;
    
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    
    const feedback = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        responses: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    const totalFeedback = await prisma.feedback.count({ where });
    
    res.json({
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalFeedback,
        pages: Math.ceil(totalFeedback / limitNum)
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback',
      message: error.message
    });
  }
});

// Get feedback statistics (admin only)
router.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    const totalFeedback = await prisma.feedback.count();
    
    const statusStats = await prisma.feedback.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    
    const categoryStats = await prisma.feedback.groupBy({
      by: ['category'],
      _count: { id: true }
    });
    
    const priorityStats = await prisma.feedback.groupBy({
      by: ['priority'],
      _count: { id: true }
    });
    
    const avgRating = await prisma.feedback.aggregate({
      where: {
        rating: { not: null }
      },
      _avg: {
        rating: true
      }
    });
    
    const recentFeedback = await prisma.feedback.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true
      }
    });
    
    res.json({
      summary: {
        totalFeedback,
        averageRating: avgRating._avg.rating || 0,
        pendingCount: statusStats.find(s => s.status === 'new')?._count.id || 0,
        resolvedCount: statusStats.find(s => s.status === 'resolved')?._count.id || 0
      },
      statusBreakdown: statusStats,
      categoryBreakdown: categoryStats,
      priorityBreakdown: priorityStats,
      recentFeedback
    });
    
  } catch (error: any) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback statistics',
      message: error.message
    });
  }
});

// Update feedback status (admin only)
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { status, adminNotes } = req.body;
    
    if (!status || !['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status,
        adminNotes: adminNotes || null,
        updatedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      feedback
    });
    
  } catch (error: any) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      error: 'Failed to update feedback status',
      message: error.message
    });
  }
});

// Add response to feedback (admin only)
router.post('/:id/response', async (req: Request, res: Response) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { message, isAdminResponse = true } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Response message is required' });
    }
    
    const response = await prisma.feedbackResponse.create({
      data: {
        feedbackId,
        message: message.trim(),
        isAdminResponse
      }
    });
    
    // Update feedback status to in_progress if it was new
    await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status: 'in_progress' }
    });
    
    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      response
    });
    
  } catch (error: any) {
    console.error('Error adding response:', error);
    res.status(500).json({
      error: 'Failed to add response',
      message: error.message
    });
  }
});

// Delete feedback (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const feedbackId = parseInt(req.params.id);
    
    // Delete responses first
    await prisma.feedbackResponse.deleteMany({
      where: { feedbackId }
    });
    
    // Delete feedback
    await prisma.feedback.delete({
      where: { id: feedbackId }
    });
    
    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      error: 'Failed to delete feedback',
      message: error.message
    });
  }
});

// Generate ticket number
function generateTicketNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `FB-${timestamp}-${random}`;
}

export default router;

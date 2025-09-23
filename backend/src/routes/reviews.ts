import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Review schema
const reviewSchema = z.object({
  productId: z.number().int().positive('Valid product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be at most 100 characters'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be at most 1000 characters'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Valid email is required'),
  verified: z.boolean().optional().default(false)
});

// Feedback schema
const feedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject must be at most 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be at most 1000 characters'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  category: z.enum(['service', 'product', 'website', 'general', 'complaint', 'suggestion']).default('general'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  contactPreference: z.enum(['email', 'phone', 'none']).default('email')
});

// Create a product review
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = reviewSchema.parse(req.body);
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if customer already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: validatedData.productId,
        customerEmail: validatedData.customerEmail
      }
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    
    // Create review
    const review = await prisma.review.create({
      data: {
        productId: validatedData.productId,
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        verified: validatedData.verified,
        status: 'pending' // Reviews need approval
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });
    
    // Update product average rating
    await updateProductRating(validatedData.productId);
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be published after approval.',
      review: {
        id: review.id,
        product: review.product,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        customerName: review.customerName,
        status: review.status,
        createdAt: review.createdAt
      }
    });
    
  } catch (error: any) {
    console.error('Error creating review:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    res.status(500).json({
      error: 'Failed to create review',
      message: error.message
    });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const { page = '1', limit = '10', status = 'approved' } = req.query;
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;
    
    // Get reviews
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: status as string
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Get total count
    const totalReviews = await prisma.review.count({
      where: {
        productId,
        status: status as string
      }
    });
    
    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: {
        productId,
        status: 'approved'
      },
      _avg: {
        rating: true
      }
    });
    
    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limitNum)
      },
      averageRating: avgRating._avg.rating || 0,
      totalReviews: totalReviews
    });
    
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
});

// Get all reviews (admin only)
router.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, productId } = req.query;
    
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (status) where.status = status;
    if (productId) where.productId = parseInt(productId.toString());
    
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });
    
    const totalReviews = await prisma.review.count({ where });
    
    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limitNum)
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
});

// Update review status (admin only)
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { status, adminNotes } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        adminNotes: adminNotes || null,
        reviewedAt: new Date()
      },
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Update product rating if approved
    if (status === 'approved') {
      await updateProductRating(review.productId);
    }
    
    res.json({
      success: true,
      message: 'Review status updated successfully',
      review
    });
    
  } catch (error: any) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      error: 'Failed to update review status',
      message: error.message
    });
  }
});

// Delete review (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { productId: true }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    await prisma.review.delete({
      where: { id: reviewId }
    });
    
    // Update product rating
    await updateProductRating(review.productId);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      error: 'Failed to delete review',
      message: error.message
    });
  }
});

// Helper function to update product rating
async function updateProductRating(productId: number) {
  try {
    const stats = await prisma.review.aggregate({
      where: {
        productId,
        status: 'approved'
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    });
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: stats._avg.rating || 0,
        reviewCount: stats._count.id
      }
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

export default router;
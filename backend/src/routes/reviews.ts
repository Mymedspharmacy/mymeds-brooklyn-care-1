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
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === 'object' && 'userId' in payload) {
      req.user = payload;
      next();
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin: list all reviews
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const reviews = await prisma.review.findMany({
      include: { product: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Public: get approved reviews for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    const reviews = await prisma.review.findMany({
      where: { productId, status: 'approved' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Public: submit a review for a product
router.post('/product/:productId', async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    const { name, rating, text, userId } = req.body;
    if (!name || !rating || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const review = await prisma.review.create({
      data: {
        productId,
        name,
        rating: Number(rating),
        text,
        userId: userId ? Number(userId) : undefined,
        status: 'pending'
      }
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Admin: approve or reject a review
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const review = await prisma.review.update({
      where: { id },
      data: { status }
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Admin: delete a review
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const id = Number(req.params.id);
    await prisma.review.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router; 
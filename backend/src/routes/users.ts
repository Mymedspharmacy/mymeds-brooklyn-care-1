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

// Get current user profile
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// List all users (admin only)
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user (self or admin)
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.userId !== Number(req.params.id) && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { name } = req.body;
    const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data: { name } });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router; 
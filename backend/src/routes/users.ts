import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const ADMIN_EMAIL = 'mymedspharmacy@outlook.com';

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

function supabaseAdminAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  // Require SUPABASE_JWT_SECRET in production
  if (!SUPABASE_JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('SUPABASE_JWT_SECRET must be set in production!');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }
  }
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
    // Only allow ADMIN role (case-insensitive)
    if (payload.role && payload.role.toUpperCase() === 'ADMIN') {
      req.user = payload;
      return next();
    }
    // If you want to allow more roles, add them here (e.g., SUPERADMIN)
    // if (payload.role && ['ADMIN', 'SUPERADMIN'].includes(payload.role.toUpperCase())) {
    //   req.user = payload;
    //   return next();
    // }
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  } catch (err) {
    // Return 401 for invalid/expired tokens
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Get current user profile
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// List all users (admin only)
router.get('/', supabaseAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true }, take: limit });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user (self or admin)
router.put('/:id', supabaseAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Only admin can update any user
    const { name } = req.body;
    const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data: { name } });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', supabaseAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export { supabaseAdminAuth };
export default router; 
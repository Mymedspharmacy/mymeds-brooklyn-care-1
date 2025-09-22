import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { unifiedAdminAuth } from './auth';

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

// Get site-wide settings (public)
router.get('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update site-wide settings (admin only)
router.put('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { siteName, contactEmail, contactPhone, address, businessHours, facebook, instagram, twitter } = req.body;
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: { siteName, contactEmail, contactPhone, address, businessHours, facebook, instagram, twitter },
      create: { key: 'general', value: 'settings', siteName, contactEmail, contactPhone, address, businessHours, facebook, instagram, twitter }
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router; 
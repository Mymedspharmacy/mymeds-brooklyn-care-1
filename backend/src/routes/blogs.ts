import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Public: list blogs
router.get('/', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const blogs = await prisma.blog.findMany({ take: limit });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Admin: create blog
router.post('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, author } = req.body;
    const blog = await prisma.blog.create({ data: { title, content, author } });
    res.status(201).json(blog);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// Admin: update blog
router.put('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, author } = req.body;
    const blog = await prisma.blog.update({ where: { id: Number(req.params.id) }, data: { title, content, author } });
    res.json(blog);
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// Admin: delete blog
router.delete('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.blog.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

export default router; 
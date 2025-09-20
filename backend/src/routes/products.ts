import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// File upload configuration
const upload = multer({ storage: multer.memoryStorage() });

// Public: list products
router.get('/', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const products = await prisma.product.findMany({ take: limit });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Admin: create product
router.post('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        imageUrl,
        category: { connect: { id: Number(categoryId) } }
      }
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: update product
router.put('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        description,
        price,
        stock,
        imageUrl,
        category: { connect: { id: Number(categoryId) } }
      }
    });
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: delete product
router.delete('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Upload product image
router.post('/:id/images', unifiedAdminAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // TODO: Implement file upload to cloud storage
    // This endpoint needs proper file storage implementation
    res.status(501).json({ error: 'File upload functionality needs implementation' });
  } catch (err) {
    console.error('Error uploading product image:', err);
    res.status(500).json({ error: 'Failed to upload product image' });
  }
});

// Delete product image
router.delete('/images/:imageId', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const imageId = Number(req.params.imageId);
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) return res.status(404).json({ error: 'Image not found' });
    
    // TODO: Implement file deletion from cloud storage
    // For now, just delete from database
    await prisma.productImage.delete({ where: { id: imageId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting product image:', err);
    res.status(500).json({ error: 'Failed to delete product image' });
  }
});

// Create product variant
router.post('/:id/variants', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const { name, value, price, stock } = req.body;
    const variant = await prisma.productVariant.create({ data: { productId, name, value, price, stock } });
    res.status(201).json(variant);
  } catch (err) {
    console.error('Error creating product variant:', err);
    res.status(500).json({ error: 'Failed to create product variant' });
  }
});
// Update product variant
router.put('/variants/:variantId', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const variantId = Number(req.params.variantId);
    const { name, value, price, stock } = req.body;
    const variant = await prisma.productVariant.update({ where: { id: variantId }, data: { name, value, price, stock } });
    res.json(variant);
  } catch (err) {
    console.error('Error updating product variant:', err);
    res.status(500).json({ error: 'Failed to update product variant' });
  }
});
// Delete product variant
router.delete('/variants/:variantId', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const variantId = Number(req.params.variantId);
    await prisma.productVariant.delete({ where: { id: variantId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting product variant:', err);
    res.status(500).json({ error: 'Failed to delete product variant' });
  }
});

// Category CRUD endpoints
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.update({ where: { id: Number(req.params.id) }, data: { name } });
    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router; 
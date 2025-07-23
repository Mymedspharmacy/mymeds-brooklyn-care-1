import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const SUPABASE_BUCKET = 'product-images';
const upload = multer({ storage: multer.memoryStorage() });

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
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
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
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
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
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Upload product image to Supabase Storage
router.post('/:id/images', auth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const productId = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const ext = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false
    });
    if (error) return res.status(500).json({ error: error.message });
    const { data: publicUrlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(fileName);
    const image = await prisma.productImage.create({ data: { url: publicUrlData.publicUrl, productId } });
    res.status(201).json(image);
  } catch (err) {
    console.error('Error uploading product image:', err);
    res.status(500).json({ error: 'Failed to upload product image' });
  }
});

// Delete product image from Supabase Storage and DB
router.delete('/images/:imageId', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const imageId = Number(req.params.imageId);
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) return res.status(404).json({ error: 'Image not found' });
    // Extract file name from URL
    const fileName = image.url.split('/').pop();
    if (fileName) {
      await supabase.storage.from(SUPABASE_BUCKET).remove([fileName]);
    }
    await prisma.productImage.delete({ where: { id: imageId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting product image:', err);
    res.status(500).json({ error: 'Failed to delete product image' });
  }
});

// Create product variant
router.post('/:id/variants', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
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
router.put('/variants/:variantId', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
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
router.delete('/variants/:variantId', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
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

router.post('/categories', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { name } = req.body;
    const category = await prisma.category.update({ where: { id: Number(req.params.id) }, data: { name } });
    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router; 
import { Router, Request, Response } from 'express';
import { adminAuthMiddleware } from '../adminAuth';

const router = Router();

// WooCommerce API configuration
const WOOCOMMERCE_CONFIG = {
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3'
};

// Helper function to make WooCommerce API calls
async function makeWooCommerceRequest(endpoint: string, method: string = 'GET', data?: any) {
  if (!WOOCOMMERCE_CONFIG.url || !WOOCOMMERCE_CONFIG.consumerKey || !WOOCOMMERCE_CONFIG.consumerSecret) {
    throw new Error('WooCommerce configuration is incomplete');
  }

  const url = `${WOOCOMMERCE_CONFIG.url}/wp-json/${WOOCOMMERCE_CONFIG.version}/${endpoint}`;
  
  const auth = Buffer.from(`${WOOCOMMERCE_CONFIG.consumerKey}:${WOOCOMMERCE_CONFIG.consumerSecret}`).toString('base64');
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get all products from WooCommerce
router.get('/products', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const products = await makeWooCommerceRequest('products');
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching WooCommerce products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a specific product
router.get('/products/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const product = await makeWooCommerceRequest(`products/${req.params.id}`);
    res.json(product);
  } catch (error: any) {
    console.error('Error fetching WooCommerce product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a new product
router.post('/products', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const product = await makeWooCommerceRequest('products', 'POST', req.body);
    res.json(product);
  } catch (error: any) {
    console.error('Error creating WooCommerce product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.put('/products/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const product = await makeWooCommerceRequest(`products/${req.params.id}`, 'PUT', req.body);
    res.json(product);
  } catch (error: any) {
    console.error('Error updating WooCommerce product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/products/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    await makeWooCommerceRequest(`products/${req.params.id}`, 'DELETE');
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting WooCommerce product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get orders
router.get('/orders', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await makeWooCommerceRequest('orders');
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching WooCommerce orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get categories
router.get('/categories', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const categories = await makeWooCommerceRequest('products/categories');
    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching WooCommerce categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Sync products from WooCommerce to local database
router.post('/sync-products', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const wooProducts = await makeWooCommerceRequest('products');
    
    for (const wooProduct of wooProducts) {
      await prisma.product.upsert({
        where: { id: wooProduct.id },
        update: {
          name: wooProduct.name,
          description: wooProduct.description,
          price: parseFloat(wooProduct.price),
          stock: wooProduct.stock_quantity || 0,
        },
        create: {
          id: wooProduct.id,
          name: wooProduct.name,
          description: wooProduct.description,
          price: parseFloat(wooProduct.price),
          stock: wooProduct.stock_quantity || 0,
          categoryId: 1, // Default category
        },
      });
    }
    
    await prisma.$disconnect();
    res.json({ success: true, message: `Synced ${wooProducts.length} products` });
  } catch (error: any) {
    console.error('Error syncing products:', error);
    res.status(500).json({ error: 'Failed to sync products' });
  }
});

export default router; 
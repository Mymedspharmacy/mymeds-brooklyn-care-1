import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Admin: get WooCommerce settings
router.get('/settings', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    let settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.wooCommerceSettings.create({
        data: {
          id: 1,
          enabled: false,
          storeUrl: '',
          consumerKey: '',
          consumerSecret: '',
          webhookSecret: '',
          updatedAt: new Date()
        }
      });
    }

    // Don't return sensitive data
    const safeSettings = {
      ...settings,
      consumerKey: settings.consumerKey ? '***' + settings.consumerKey.slice(-4) : '',
      consumerSecret: settings.consumerSecret ? '***' + settings.consumerSecret.slice(-4) : '',
      webhookSecret: settings.webhookSecret ? '***' + settings.webhookSecret.slice(-4) : ''
    };

    res.json(safeSettings);
  } catch (err) {
    console.error('Error fetching WooCommerce settings:', err);
    res.status(500).json({ error: 'Failed to fetch WooCommerce settings' });
  }
});

// Admin: update WooCommerce settings
router.put('/settings', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { enabled, storeUrl, consumerKey, consumerSecret, webhookSecret } = req.body;

    const updateData: any = {
      enabled: enabled || false,
      updatedAt: new Date()
    };

    if (storeUrl !== undefined) updateData.storeUrl = storeUrl;
    if (consumerKey !== undefined) updateData.consumerKey = consumerKey;
    if (consumerSecret !== undefined) updateData.consumerSecret = consumerSecret;
    if (webhookSecret !== undefined) updateData.webhookSecret = webhookSecret;

    const settings = await prisma.wooCommerceSettings.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        enabled: enabled || false,
        storeUrl: storeUrl || '',
        consumerKey: consumerKey || '',
        consumerSecret: consumerSecret || '',
        webhookSecret: webhookSecret || '',
        updatedAt: new Date()
      }
    });

    // Don't return sensitive data
    const safeSettings = {
      ...settings,
      consumerKey: settings.consumerKey ? '***' + settings.consumerKey.slice(-4) : '',
      consumerSecret: settings.consumerSecret ? '***' + settings.consumerSecret.slice(-4) : '',
      webhookSecret: settings.webhookSecret ? '***' + settings.webhookSecret.slice(-4) : ''
    };

    res.json(safeSettings);
  } catch (err) {
    console.error('Error updating WooCommerce settings:', err);
    res.status(500).json({ error: 'Failed to update WooCommerce settings' });
  }
});

// Admin: test WooCommerce connection
router.post('/test-connection', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration is not enabled' });
    }

    // ✅ IMPLEMENTED: WooCommerce connection test
    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/products?per_page=1`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const products = await response.json();
    
    res.json({
      success: true,
      message: 'Connection test successful',
      storeInfo: {
        name: 'WooCommerce Store',
        url: settings.storeUrl,
        productsCount: products.length > 0 ? 'Connected' : 'No products found'
      }
    });
  } catch (err) {
    console.error('Error testing WooCommerce connection:', err);
    res.status(500).json({ error: 'Failed to test connection' });
  }
});

// Admin: sync products from WooCommerce
router.post('/sync-products', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration is not enabled' });
    }

    // ✅ IMPLEMENTED: WooCommerce products sync
    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/products?per_page=100`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const products = await response.json();
    
    // Sync products to local database
    for (const product of products) {
      // First, ensure category exists
      let categoryId = 1; // Default category
      if (product.categories && product.categories.length > 0) {
        const categoryName = product.categories[0].name;
        const category = await prisma.category.upsert({
          where: { name: categoryName },
          update: {},
          create: { name: categoryName }
        });
        categoryId = category.id;
      }

      // Create or update product
      const localProduct = await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock_quantity || 0,
          categoryId: categoryId
        },
        create: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock_quantity || 0,
          categoryId: categoryId
        }
      });

      // Handle product images
      if (product.images && product.images.length > 0) {
        // Clear existing images
        await prisma.productImage.deleteMany({
          where: { productId: localProduct.id }
        });

        // Add new images
        for (const image of product.images) {
          await prisma.productImage.create({
            data: {
              url: image.src,
              productId: localProduct.id
            }
          });
        }
      }
    }

    // Update last sync time
    await prisma.wooCommerceSettings.update({
      where: { id: 1 },
      data: { lastSync: new Date() }
    });

    res.json({
      success: true,
      message: `Successfully synced ${products.length} products`,
      synced: products.length
    });
  } catch (err) {
    console.error('Error syncing WooCommerce products:', err);
    res.status(500).json({ error: 'Failed to sync products' });
  }
});

// Admin: get WooCommerce sync status
router.get('/sync-status', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    res.json({
      enabled: settings?.enabled || false,
      lastSync: settings?.lastSync,
      status: 'idle', // idle, syncing, error
      lastError: null
    });
  } catch (err) {
    console.error('Error fetching WooCommerce sync status:', err);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

export default router; 
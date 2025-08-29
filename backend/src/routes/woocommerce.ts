import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// In-memory cache for products (in production, use Redis)
const productCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache management functions
const getCachedProducts = (key: string) => {
  const cached = productCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedProducts = (key: string, data: any) => {
  productCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearProductCache = () => {
  productCache.clear();
};

// Enhanced error handling with retry logic
const makeWooCommerceRequest = async (url: string, options: any, params?: any, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WooCommerce API error: ${response.status} - ${errorText}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

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
  } catch (err: any) {
    console.error('Error fetching WooCommerce settings:', err);
    res.status(500).json({ 
      error: 'Failed to fetch WooCommerce settings',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: update WooCommerce settings
router.put('/settings', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { enabled, storeUrl, consumerKey, consumerSecret, webhookSecret } = req.body;

    // Validate required fields when enabling
    if (enabled && (!storeUrl || !consumerKey || !consumerSecret)) {
      return res.status(400).json({ 
        error: 'Store URL, Consumer Key, and Consumer Secret are required when enabling WooCommerce integration' 
      });
    }

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

    // Clear cache when settings change
    clearProductCache();

    // Don't return sensitive data
    const safeSettings = {
      ...settings,
      consumerKey: settings.consumerKey ? '***' + settings.consumerKey.slice(-4) : '',
      consumerSecret: settings.consumerSecret ? '***' + settings.consumerSecret.slice(-4) : '',
      webhookSecret: settings.webhookSecret ? '***' + settings.webhookSecret.slice(-4) : ''
    };

    res.json(safeSettings);
  } catch (err: any) {
    console.error('Error updating WooCommerce settings:', err);
    res.status(500).json({ 
      error: 'Failed to update WooCommerce settings',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

    if (!settings.storeUrl || !settings.consumerKey || !settings.consumerSecret) {
      return res.status(400).json({ error: 'Missing required WooCommerce credentials' });
    }

    // Test connection with retry logic
    const response = await makeWooCommerceRequest(
      `${settings.storeUrl}/wp-json/wc/v3/products?per_page=1`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response) {
      throw new Error('No response received from WooCommerce API');
    }

    const products = await response.json();
    
    res.json({
      success: true,
      message: 'Connection test successful',
      storeInfo: {
        name: 'WooCommerce Store',
        url: settings.storeUrl,
        productsCount: products.length > 0 ? 'Connected' : 'No products found',
        apiVersion: 'v3'
      }
    });
  } catch (err: any) {
    console.error('Error testing WooCommerce connection:', err);
    res.status(500).json({ 
      error: 'Failed to test connection',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      suggestion: 'Check your store URL, consumer key, and consumer secret'
    });
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

    // Update sync status
    await prisma.wooCommerceSettings.update({
      where: { id: 1 },
      data: { 
        lastSync: new Date(),
        lastError: null
      }
    });

    // Fetch products with retry logic
    const response = await makeWooCommerceRequest(
      `${settings.storeUrl}/wp-json/wc/v3/products?per_page=100&include=variations`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response) {
      throw new Error('No response received from WooCommerce API');
    }

    const products = await response.json();
    
    // Sync products to local database
    let syncedCount = 0;
    let errorCount = 0;
    let lowStockCount = 0;
    const errors: string[] = [];
    const lowStockAlerts: any[] = [];

    for (const product of products) {
      try {
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

        // Calculate total stock (including variations)
        let totalStock = product.stock_quantity || 0;
        let hasLowStock = false;
        
        if (product.variations && product.variations.length > 0) {
          // Fetch variation details for accurate stock count
          const variationsResponse = await makeWooCommerceRequest(
            `${settings.storeUrl}/wp-json/wc/v3/products/${product.id}/variations`,
            {
              headers: {
                'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (variationsResponse) {
            const variations = await variationsResponse.json();
            totalStock = variations.reduce((sum: number, variation: any) => sum + (variation.stock_quantity || 0), 0);
            
            // Check for low stock variations
            variations.forEach((variation: any) => {
              if (variation.stock_quantity > 0 && variation.stock_quantity <= 5) {
                hasLowStock = true;
                lowStockAlerts.push({
                  productId: product.id,
                  variationId: variation.id,
                  name: `${product.name} - ${variation.name || 'Default'}`,
                  currentStock: variation.stock_quantity,
                  threshold: 5
                });
              }
            });
          }
        } else {
          // Simple product stock check
          hasLowStock = totalStock > 0 && totalStock <= 5;
          if (hasLowStock) {
            lowStockAlerts.push({
              productId: product.id,
              name: product.name,
              currentStock: totalStock,
              threshold: 5
            });
          }
        }

        // Create or update product
        await prisma.product.upsert({
          where: { id: product.id },
          update: {
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: totalStock,
            categoryId: categoryId
          },
          create: {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: totalStock,
            categoryId: categoryId
          }
        });

        // Handle product images
        if (product.images && product.images.length > 0) {
          // Clear existing images
          await prisma.productImage.deleteMany({
            where: { productId: product.id }
          });

          // Add new images
          for (const image of product.images) {
            await prisma.productImage.create({
              data: {
                url: image.src,
                productId: product.id
              }
            });
          }
        }

        // Handle product variants
        if (product.variations && product.variations.length > 0) {
          // Clear existing variants
          await prisma.productVariant.deleteMany({
            where: { productId: product.id }
          });

          // Add new variants
          for (const variation of product.variations) {
            await prisma.productVariant.create({
              data: {
                productId: product.id,
                name: variation.name || 'Default',
                value: variation.option || 'Default',
                price: variation.price ? parseFloat(variation.price) : null,
                stock: variation.stock_quantity || 0
              }
            });
          }
        }

        syncedCount++;
        if (hasLowStock) lowStockCount++;
      } catch (productError: any) {
        errorCount++;
        errors.push(`Product ${product.id}: ${productError.message}`);
      }
    }

    // Clear cache after sync
    clearProductCache();

    // Update sync status
    await prisma.wooCommerceSettings.update({
      where: { id: 1 },
      data: { 
        lastSync: new Date(),
        lastError: errorCount > 0 ? `Sync completed with ${errorCount} errors` : null
      }
    });

    res.json({
      success: true,
      message: `Sync completed: ${syncedCount} products synced, ${errorCount} errors`,
      synced: syncedCount,
      errors: errorCount,
      lowStockCount,
      lowStockAlerts: lowStockAlerts.length > 0 ? lowStockAlerts : undefined,
      errorDetails: errors.length > 0 ? errors : undefined
    });
  } catch (err: any) {
    console.error('Error syncing WooCommerce products:', err);
    
    // Update sync status with error
    await prisma.wooCommerceSettings.update({
      where: { id: 1 },
      data: { 
        lastError: err.message,
        lastSync: new Date()
      }
    });

    res.status(500).json({ 
      error: 'Failed to sync products',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      suggestion: 'Check your WooCommerce credentials and store URL'
    });
  }
});

// Admin: get inventory status
router.get('/inventory-status', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration is not enabled' });
    }

    // Get inventory statistics
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5,
          gt: 0
        }
      },
      include: {
        category: true
      }
    });

    const outOfStockProducts = await prisma.product.findMany({
      where: {
        stock: 0
      },
      include: {
        category: true
      }
    });

    const categoryStock = await prisma.$queryRaw`
      SELECT c.name, COUNT(p.id) as product_count, SUM(p.stock) as total_stock
      FROM "Category" c
      LEFT JOIN "Product" p ON c.id = p."categoryId"
      GROUP BY c.id, c.name
      ORDER BY total_stock DESC
    `;

    res.json({
      summary: {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalStockValue: lowStockProducts.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0)
      },
      lowStockProducts: lowStockProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        price: p.price,
        category: p.category.name
      })),
      outOfStockProducts: outOfStockProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category.name
      })),
      categoryStock
    });
  } catch (err: any) {
    console.error('Error fetching inventory status:', err);
    res.status(500).json({ 
      error: 'Failed to fetch inventory status',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: update product stock
router.put('/products/:id/stock', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { id } = req.params;
    const { stock, notifyLowStock = true } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Valid stock quantity is required' });
    }

    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration is not enabled' });
    }

    // Update local database
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { stock }
    });

    // Update WooCommerce
    const response = await makeWooCommerceRequest(
      `${settings.storeUrl}/wp-json/wc/v3/products/${id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stock_quantity: stock,
          stock_status: stock > 0 ? 'instock' : 'outofstock'
        })
      }
    );

    if (!response) {
      throw new Error('Failed to update WooCommerce stock');
    }

    // Clear cache
    clearProductCache();

    // Send low stock notification if enabled
    if (notifyLowStock && stock <= 5 && stock > 0) {
      // Here you could integrate with notification services
      console.log(`Low stock alert: ${product.name} (ID: ${id}) - Current stock: ${stock}`);
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      product: {
        id: product.id,
        name: product.name,
        stock: product.stock,
        updatedAt: new Date()
      }
    });
  } catch (err: any) {
    console.error('Error updating product stock:', err);
    res.status(500).json({ 
      error: 'Failed to update stock',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Webhook endpoint for real-time updates from WooCommerce
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration not enabled' });
    }

    const { action, data } = req.body;

    switch (action) {
      case 'product.created':
      case 'product.updated':
        // Clear cache and trigger sync for specific product
        clearProductCache();
        console.log(`Webhook: Product ${action} - ID: ${data.id}`);
        
        // Update local product if exists
        try {
          const product = await prisma.product.findFirst({
            where: { id: data.id }
          });
          
          if (product) {
            await prisma.product.update({
              where: { id: data.id },
              data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                stock: data.stock_quantity || 0,
                updatedAt: new Date()
              }
            });
          }
        } catch (error: any) {
          console.error(`Error updating product ${data.id}:`, error);
        }
        break;
      
      case 'product.deleted':
        // Remove product from local database
        try {
          await prisma.product.delete({
            where: { id: data.id }
          });
          clearProductCache();
          console.log(`Webhook: Product deleted - ID: ${data.id}`);
        } catch (error: any) {
          console.error(`Error deleting product ${data.id}:`, error);
        }
        break;
      
      case 'order.created':
      case 'order.updated':
        // Handle order updates
        console.log(`Webhook: Order ${action} - ID: ${data.id}`);
        break;
      
      default:
        console.log(`Webhook: Unknown action - ${action}`);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (err: any) {
    console.error('Error processing WooCommerce webhook:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Automated sync endpoint (can be called by cron jobs)
router.post('/auto-sync', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration not enabled' });
    }

    // Update sync status
    await prisma.wooCommerceSettings.update({
      where: { id: 1 },
      data: { 
        lastSync: new Date(),
        lastError: null
      }
    });

    // Fetch products with retry logic
    const response = await makeWooCommerceRequest(
      `${settings.storeUrl}/wp-json/wc/v3/products?per_page=100&include=variations`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response) {
      throw new Error('No response received from WooCommerce API');
    }

    const products = await response.json();
    
    // Sync products to local database
    let syncedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const product of products) {
      try {
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

        // Calculate total stock (including variations)
        let totalStock = product.stock_quantity || 0;
        
        if (product.variations && product.variations.length > 0) {
          // Fetch variation details for accurate stock count
          const variationsResponse = await makeWooCommerceRequest(
            `${settings.storeUrl}/wp-json/wc/v3/products/${product.id}/variations`,
            {
              headers: {
                'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (variationsResponse) {
            const variations = await variationsResponse.json();
            totalStock = variations.reduce((sum: number, variation: any) => sum + (variation.stock_quantity || 0), 0);
          }
        }

        // Create or update product
        await prisma.product.upsert({
          where: { id: product.id },
          update: {
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: totalStock,
            categoryId: categoryId,
            updatedAt: new Date()
          },
          create: {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: totalStock,
            categoryId: categoryId
          }
        });

        // Handle product images
        if (product.images && product.images.length > 0) {
          // Clear existing images
          await prisma.productImage.deleteMany({
            where: { productId: product.id }
          });

          // Add new images
          for (const image of product.images) {
            await prisma.productImage.create({
              data: {
                url: image.src,
                productId: product.id
              }
            });
          }
        }

        syncedCount++;
      } catch (productError: any) {
        errorCount++;
        errors.push(`Product ${product.id}: ${productError.message}`);
      }
    }

    // Clear cache after sync
    clearProductCache();

    // Update sync status
    await prisma.wooCommerceSettings.update({
      where: { id: 1 },
      data: { 
        lastSync: new Date(),
        lastError: errorCount > 0 ? `Auto-sync completed with ${errorCount} errors` : null
      }
    });

    res.json({
      success: true,
      message: `Auto-sync completed: ${syncedCount} products synced, ${errorCount} errors`,
      synced: syncedCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
      timestamp: new Date()
    });
  } catch (err: any) {
    console.error('Error in auto-sync:', err);
    
    // Update sync status with error
    await prisma.wooCommerceSettings.update({
      where: { id: 1 },
      data: { 
        lastError: err.message,
        lastSync: new Date()
      }
    });

    res.status(500).json({ 
      error: 'Auto-sync failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Public endpoint to get products (for frontend)
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { page = '1', per_page = '20', category, search } = req.query;
    
    // Check cache first
    const cacheKey = `products_${page}_${per_page}_${category}_${search}`;
    const cached = getCachedProducts(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.json({ products: [], pagination: { total: 0, pages: 0 } });
    }

    // Build query parameters
    const params: any = {
      page: parseInt(page.toString()),
      per_page: parseInt(per_page.toString())
    };

    if (category) params.category = category;
    if (search) params.search = search;

    // Fetch from WooCommerce API
    const response = await makeWooCommerceRequest(
      `${settings.storeUrl}/wp-json/wc/v3/products`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      },
      params
    );

    if (!response) {
      throw new Error('No response received from WooCommerce API');
    }

    const products = await response.json();
    const totalProducts = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');

    const result = {
      products: products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        categories: product.categories,
        images: product.images,
        stock_quantity: product.stock_quantity,
        average_rating: product.average_rating,
        rating_count: product.rating_count,
        tags: product.tags,
        attributes: product.attributes
      })),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalProducts || '0'),
        total_pages: parseInt(totalPages || '0')
      }
    };

    // Cache the result
    setCachedProducts(cacheKey, result);

    res.json(result);
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Create WooCommerce order
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(503).json({ error: 'WooCommerce is not configured or enabled' });
    }

    const {
      billing,
      shipping,
      line_items,
      payment_method,
      payment_method_title,
      set_paid,
      customer_note
    } = req.body;

    // Validate required fields
    if (!billing || !shipping || !line_items || !line_items.length) {
      return res.status(400).json({ error: 'Missing required order information' });
    }

    // Prepare order data for WooCommerce
    const orderData = {
      billing,
      shipping,
      line_items,
      payment_method: payment_method || 'bacs',
      payment_method_title: payment_method_title || 'Direct Bank Transfer',
      set_paid: set_paid || false,
      customer_note: customer_note || '',
      status: 'pending'
    };

    // Create order in WooCommerce
    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WooCommerce API error: ${response.status}`);
    }

    const order = await response.json();

    // Log successful order creation
    console.log(`✅ WooCommerce order created: ${order.id}`);

    res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total: order.total,
        created_at: order.created_at
      }
    });

  } catch (err: any) {
    console.error('Error creating WooCommerce order:', err);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get WooCommerce order by ID
router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(503).json({ error: 'WooCommerce is not configured or enabled' });
    }

    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/orders/${id}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WooCommerce API error: ${response.status}`);
    }

    const order = await response.json();

    res.json({
      success: true,
      order
    });

  } catch (err: any) {
    console.error(`Error fetching WooCommerce order ${req.params.id}:`, err);
    res.status(500).json({ 
      error: 'Failed to fetch order',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update WooCommerce order status
router.put('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(503).json({ error: 'WooCommerce is not configured or enabled' });
    }

    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WooCommerce API error: ${response.status}`);
    }

    const order = await response.json();

    console.log(`✅ WooCommerce order ${id} status updated to: ${status}`);

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        updated_at: order.date_modified
      }
    });

  } catch (err: any) {
    console.error(`Error updating WooCommerce order ${req.params.id} status:`, err);
    res.status(500).json({ 
      error: 'Failed to update order status',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: get WooCommerce sync status
router.get('/sync-status', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    // Get product count for status
    const productCount = await prisma.product.count();

    res.json({
      enabled: settings?.enabled || false,
      lastSync: settings?.lastSync,
      lastError: settings?.lastError,
      productCount,
      cacheStatus: productCache.size > 0 ? 'active' : 'empty',
      status: settings?.lastError ? 'error' : 'idle' // idle, syncing, error
    });
  } catch (err: any) {
    console.error('Error fetching WooCommerce sync status:', err);
    res.status(500).json({ 
      error: 'Failed to fetch sync status',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: clear cache
router.post('/clear-cache', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    clearProductCache();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (err: any) {
    console.error('Error clearing cache:', err);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router; 
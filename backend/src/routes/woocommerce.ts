import { Router, Request, Response } from 'express';
import { unifiedAdminAuth } from './auth';
import { AuthRequest } from '../types/express';
import { 
  isWooCommerceProduct, 
  isWooCommerceOrder, 
  isErrorWithMessage, 
  hasProperty, 
  isObject,
  isString,
  isNumber 
} from '../core/utils/typeGuards';
import { 
  assertWooCommerceProduct, 
  assertWooCommerceOrder, 
  assertWooCommerceVariation,
  getProductProperty,
  getVariationProperty
} from '../core/utils/woocommerceTypes';

const router = Router();

// Import Prisma client directly
import { PrismaClient } from '@prisma/client';

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

const setCachedProducts = (key: string, data: unknown) => {
  productCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearProductCache = () => {
  productCache.clear();
};

// Utility function to safely get order properties
const getOrderProperty = (order: unknown, property: string, defaultValue: unknown): unknown => {
  if (isObject(order) && hasProperty(order, property)) {
    return order[property];
  }
  return defaultValue;
};

// Enhanced error handling with retry logic and development mode support
const makeWooCommerceRequest = async (url: string, options: unknown, params?: unknown, retries = 3) => {
  // Validate required environment variables for production
  if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || !process.env.WOOCOMMERCE_STORE_URL) {
    throw new Error('WooCommerce credentials not configured. Please set WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET, and WOOCOMMERCE_STORE_URL environment variables.');
  }

  // Real WooCommerce API request
  console.log('🛒 Making real WooCommerce API request to:', url);
  for (let i = 0; i < retries; i++) {
    try {
      // Use environment variables for authentication
      const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
      const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
      const storeUrl = process.env.WOOCOMMERCE_STORE_URL;

      if (!consumerKey || !consumerSecret || !storeUrl) {
        throw new Error('WooCommerce credentials not found in environment variables');
      }

      // Build URL with query parameters including authentication
      let requestUrl = url;
      const allParams: Record<string, unknown> = {
        ...(params as Record<string, unknown>),
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      };
      
      // Filter out undefined values before creating URLSearchParams
      const filteredParams: Record<string, string> = {};
      Object.entries(allParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'undefined') {
          filteredParams[key] = String(value);
        }
      });
      
      if (Object.keys(filteredParams).length > 0) {
        const queryString = new URLSearchParams(filteredParams).toString();
        requestUrl = `${storeUrl}/wp-json/wc/v3${url}?${queryString}`;
      } else {
        requestUrl = `${storeUrl}/wp-json/wc/v3${url}`;
      }
      
      console.log('🛒 WooCommerce API URL:', requestUrl);
      const response = await fetch(requestUrl, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WooCommerce API error: ${response.status} - ${errorText}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) {
        console.error('🛒 WooCommerce API failed after', retries, 'attempts:', isErrorWithMessage(error) ? error.message : 'Unknown error');
        throw new Error(`WooCommerce API request failed: ${isErrorWithMessage(error) ? error.message : 'Unknown error'}`);
      }
      
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
  } catch (err: unknown) {
    console.error('Error fetching WooCommerce settings:', err);
    res.status(500).json({ 
      error: 'Failed to fetch WooCommerce settings',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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

    const updateData: Record<string, unknown> = {
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
  } catch (err: unknown) {
    console.error('Error updating WooCommerce settings:', err);
    res.status(500).json({ 
      error: 'Failed to update WooCommerce settings',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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

    // Test connection with retry logic using WooCommerce REST API authentication
    const response = await makeWooCommerceRequest(
      `${settings.storeUrl}/wp-json/wc/v3/products?per_page=1&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`,
      {
        headers: {
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
  } catch (err: unknown) {
    console.error('Error testing WooCommerce connection:', err);
    res.status(500).json({ 
      error: 'Failed to test connection',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined,
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
      `${settings.storeUrl}/wp-json/wc/v3/products?per_page=100&include=variations&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`,
      {
        headers: {
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
    const lowStockAlerts: unknown[] = [];

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
            `${settings.storeUrl}/wp-json/wc/v3/products/${product.id}/variations?consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (variationsResponse) {
            const variations = await variationsResponse.json();
            totalStock = variations.reduce((sum: number, variation: unknown) => {
              const stockQuantity = getVariationProperty(variation, 'stock_quantity', 0);
              return sum + (typeof stockQuantity === 'number' ? stockQuantity : 0);
            }, 0);
            
            // Check for low stock variations
            variations.forEach((variation: unknown) => {
              const stockQuantity = getVariationProperty(variation, 'stock_quantity', 0);
              if (typeof stockQuantity === 'number' && stockQuantity > 0 && stockQuantity <= 5) {
                hasLowStock = true;
                lowStockAlerts.push({
                  productId: product.id,
                  variationId: getVariationProperty(variation, 'id', 0),
                  name: `${product.name} - ${getVariationProperty(variation, 'name', 'Default')}`,
                  currentStock: stockQuantity,
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
      } catch (productError: unknown) {
        errorCount++;
        errors.push(`Product ${product.id}: ${isErrorWithMessage(productError) ? productError.message : 'Unknown error'}`);
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
  } catch (err: unknown) {
    console.error('Error syncing WooCommerce products:', err);
    
    // Update sync status with error
    await prisma.wooCommerceSettings.update({
      where: { id: 1 },
      data: { 
        lastError: isErrorWithMessage(err) ? err.message : 'Unknown error',
        lastSync: new Date()
      }
    });

    res.status(500).json({ 
      error: 'Failed to sync products',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined,
      suggestion: 'Check your WooCommerce credentials and store URL'
    });
  }
});

// Admin: generate WooCommerce API keys
router.post('/generate-api-keys', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    // Generate random API keys
    const generateRandomKey = (prefix: string) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = prefix + '_';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const username = 'MyMedsPharmacy';
    const applicationPassword = generateRandomKey('app');
    const webhookSecret = generateRandomKey('whs');

    res.json({
      success: true,
      message: 'API credentials generated successfully',
      apiKeys: {
        username,
        applicationPassword,
        webhookSecret
      },
      instructions: {
        title: 'How to set up WooCommerce API keys',
        steps: [
          '1. Go to your WooCommerce store admin panel',
          '2. Navigate to WooCommerce > Settings > Advanced > REST API',
          '3. Click "Add Key" to create a new API key',
          '4. Enter the generated Consumer Key and Consumer Secret',
          '5. Set permissions to "Read/Write"',
          '6. Save and copy the generated keys to your application'
        ],
        note: 'Keep these keys secure and do not share them publicly'
      }
    });
  } catch (err: unknown) {
    console.error('Error generating API keys:', err);
    res.status(500).json({ 
      error: 'Failed to generate API keys',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
});

// Admin: upload media to WooCommerce (via WordPress Media API)
router.post('/media/upload', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { file_url, title, description, alt_text } = req.body;

    if (!file_url) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration is not enabled' });
    }

    // Upload media to WordPress (WooCommerce uses WordPress media)
    const mediaData = {
      source_url: file_url,
      title: title || 'Uploaded Media',
      description: description || '',
      alt_text: alt_text || ''
    };

    // Use WordPress REST API for media upload
    const wpSettings = await prisma.wordPressSettings.findUnique({ where: { id: 1 } });
    if (!wpSettings) {
      throw new Error('WordPress settings not found');
    }
    
    const url = `${wpSettings.siteUrl}/wp-json/wp/v2/media`;
    const auth = Buffer.from(`${wpSettings.username}:${wpSettings.applicationPassword}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mediaData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API error: ${response.status} - ${errorText}`);
    }

    const uploadedMedia = await response.json();
    
    res.json({
      success: true,
      message: 'Media uploaded successfully to WooCommerce',
      media: {
        id: uploadedMedia.id,
        title: uploadedMedia.title.rendered,
        src: uploadedMedia.source_url,
        alt: uploadedMedia.alt_text
      }
    });
  } catch (err: unknown) {
    console.error('Error uploading media to WooCommerce:', err);
    res.status(500).json({ 
      error: 'Failed to upload media to WooCommerce',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined,
      suggestion: 'Check your WooCommerce API credentials and ensure the media URL is accessible'
    });
  }
});

// Admin: upload product with images to WooCommerce
router.post('/products/upload', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { 
      name, 
      description, 
      price, 
      images, 
      categories, 
      stock_quantity,
      short_description,
      weight,
      dimensions
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration is not enabled' });
    }

    // Prepare product data for WooCommerce
    const productData = {
      name,
      type: 'simple',
      regular_price: price.toString(),
      description: description || '',
      short_description: short_description || '',
      manage_stock: true,
      stock_quantity: stock_quantity || 0,
      weight: weight || '',
      dimensions: dimensions ? {
        length: dimensions.length || '',
        width: dimensions.width || '',
        height: dimensions.height || ''
      } : undefined,
      categories: categories ? categories.map((cat: unknown) => ({ id: cat && typeof cat === 'object' && 'id' in cat ? cat.id : 0 })) : [],
      images: images ? images.map((img: unknown) => ({ src: img && typeof img === 'object' && 'src' in img && typeof img.src === 'string' ? img.src : '', alt: img && typeof img === 'object' && 'alt' in img && typeof img.alt === 'string' ? img.alt : name })) : []
    };

    // Create product in WooCommerce
    const url = `${settings.storeUrl}/wp-json/wc/v3/products?consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`;
    const auth = Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WooCommerce API error: ${response.status} - ${errorText}`);
    }

    const createdProduct = await response.json();
    
    res.json({
      success: true,
      message: 'Product uploaded successfully to WooCommerce',
      product: {
        id: createdProduct.id,
        name: createdProduct.name,
        price: createdProduct.regular_price,
        images: createdProduct.images,
        permalink: createdProduct.permalink
      }
    });
  } catch (err: unknown) {
    console.error('Error uploading product to WooCommerce:', err);
    res.status(500).json({ 
      error: 'Failed to upload product to WooCommerce',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined,
      suggestion: 'Check your WooCommerce API credentials and product data'
    });
  }
});

// Admin: get WooCommerce media
router.get('/media', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { page = 1, per_page = 20 } = req.query;
    
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration is not enabled' });
    }

    const url = `${settings.storeUrl}/wp-json/wc/v3/products/media?page=${page}&per_page=${per_page}&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`;
    const auth = Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const media = await response.json();
    const totalMedia = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');

    res.json({
      media: media.map((item: unknown) => ({
        id: getProductProperty(item, 'id', 0),
        title: getProductProperty(item, 'title', ''),
        src: getProductProperty(item, 'src', ''),
        alt: getProductProperty(item, 'alt', ''),
        date: getProductProperty(item, 'date', ''),
        modified: getProductProperty(item, 'modified', '')
      })),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalMedia || '0'),
        total_pages: parseInt(totalPages || '0')
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching WooCommerce media:', err);
    res.status(500).json({ 
      error: 'Failed to fetch WooCommerce media',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
        totalStockValue: lowStockProducts.reduce((sum: number, p: unknown) => sum + (p && typeof p === 'object' && 'price' in p && 'stock' in p && typeof p.price === 'number' && typeof p.stock === 'number' ? p.price * p.stock : 0), 0)
      },
      lowStockProducts: lowStockProducts.map((p: unknown) => ({
        id: getProductProperty(p, 'id', 0),
        name: getProductProperty(p, 'name', ''),
        stock: getProductProperty(p, 'stock', 0),
        price: getProductProperty(p, 'price', 0),
        category: getProductProperty(getProductProperty(p, 'category', {}), 'name', '')
      })),
      outOfStockProducts: outOfStockProducts.map((p: unknown) => ({
        id: getProductProperty(p, 'id', 0),
        name: getProductProperty(p, 'name', ''),
        category: getProductProperty(getProductProperty(p, 'category', {}), 'name', '')
      })),
      categoryStock
    });
  } catch (err: unknown) {
    console.error('Error fetching inventory status:', err);
    res.status(500).json({ 
      error: 'Failed to fetch inventory status',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
      `${settings.storeUrl}/wp-json/wc/v3/products/${id}?consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`,
      {
        method: 'PUT',
        headers: {
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
  } catch (err: unknown) {
    console.error('Error updating product stock:', err);
    res.status(500).json({ 
      error: 'Failed to update stock',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
        } catch (error: unknown) {
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
        } catch (error: unknown) {
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
  } catch (err: unknown) {
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
      `${settings.storeUrl}/wp-json/wc/v3/products?per_page=100&include=variations&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`,
      {
        headers: {
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
            `${settings.storeUrl}/wp-json/wc/v3/products/${product.id}/variations?consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (variationsResponse) {
            const variations = await variationsResponse.json();
            totalStock = variations.reduce((sum: number, variation: unknown) => sum + (variation && typeof variation === 'object' && 'stock_quantity' in variation && typeof variation.stock_quantity === 'number' ? variation.stock_quantity : 0), 0);
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
      } catch (productError: unknown) {
        errorCount++;
        errors.push(`Product ${product.id}: ${isErrorWithMessage(productError) ? productError.message : 'Unknown error'}`);
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
  } catch (err: unknown) {
    console.error('Error in auto-sync:', err);
    
    // Update sync status with error
    await prisma.wooCommerceSettings.update({
      where: { id: 1 },
      data: { 
        lastError: isErrorWithMessage(err) ? err.message : 'Unknown error',
        lastSync: new Date()
      }
    });

    res.status(500).json({ 
      error: 'Auto-sync failed',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
    const params: Record<string, unknown> = {
      page: parseInt(page.toString()),
      per_page: parseInt(per_page.toString()),
      // Request all necessary fields for complete product information
      status: 'publish'
    };

    if (category) params.category = category;
    if (search) params.search = search;

    // Build the WooCommerce API URL with database settings
    const queryParams = new URLSearchParams({
      ...params,
      consumer_key: settings.consumerKey,
      consumer_secret: settings.consumerSecret
    });
    
    const apiUrl = `${settings.storeUrl}/wp-json/wc/v3/products?${queryParams}`;
    
    console.log('🛒 Fetching products from:', apiUrl.replace(settings.consumerSecret, '***'));
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WooCommerce API error: ${response.status} - ${errorText}`);
    }

    const products = await response.json();
    const totalProducts = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');

    // Ensure products is an array
    if (!Array.isArray(products)) {
      console.error('WooCommerce API returned non-array products:', products);
      throw new Error('Invalid response format from WooCommerce API');
    }

    const result = {
      products: products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        categories: product.categories,
        images: product.images,
        stock_quantity: product.stock_quantity || 0,
        stock_status: product.stock_status || 'outofstock',
        manage_stock: product.manage_stock,
        average_rating: product.average_rating,
        rating_count: product.rating_count,
        tags: product.tags,
        attributes: product.attributes,
        variations: product.variations,
        weight: product.weight,
        dimensions: product.dimensions,
        permalink: product.permalink,
        status: product.status
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
  } catch (err: unknown) {
    console.error('Error fetching products:', err);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
});

// Get available payment gateways from WooCommerce
router.get('/payment-gateways', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(503).json({ error: 'WooCommerce is not configured or enabled' });
    }

    // Fetch payment gateways from WooCommerce
    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/payment_gateways?consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.statusText}`);
    }

    const gateways = await response.json();
    
    // Filter only enabled gateways
    const enabledGateways = gateways.filter((gateway: any) => gateway.enabled);

    res.json({
      success: true,
      paymentGateways: enabledGateways.map((gateway: any) => ({
        id: gateway.id,
        title: gateway.title,
        description: gateway.description,
        enabled: gateway.enabled,
        order: gateway.order
      }))
    });

  } catch (err: unknown) {
    console.error('Error fetching payment gateways:', err);
    res.status(500).json({ 
      error: 'Failed to fetch payment gateways',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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

    // Determine if payment should be processed automatically
    const shouldProcessPayment = payment_method === 'stripe' || payment_method === 'paypal';
    
    // Prepare order data for WooCommerce
    const orderData = {
      billing,
      shipping,
      line_items,
      payment_method: payment_method || 'bacs',
      payment_method_title: payment_method_title || 'Direct Bank Transfer',
      set_paid: shouldProcessPayment ? (set_paid || false) : false,
      customer_note: customer_note || '',
      status: shouldProcessPayment ? (set_paid ? 'processing' : 'pending') : 'pending'
    };

    // Create order in WooCommerce
    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/orders?consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WooCommerce API error`);
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

  } catch (err: unknown) {
    console.error('Error creating WooCommerce order:', err);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
});

// Get all WooCommerce orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const { page = 1, per_page = 20, status = 'all', search = '' } = req.query;
    
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(503).json({ error: 'WooCommerce is not configured or enabled' });
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
    });

    if (status !== 'all') {
      queryParams.append('status', status.toString());
    }

    if (search) {
      queryParams.append('search', search.toString());
    }

    const response = await makeWooCommerceRequest(
      '/orders',
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      {
        page: page.toString(),
        per_page: per_page.toString(),
        ...(status !== 'all' && { status: status.toString() }),
        ...(search && { search: search.toString() })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WooCommerce API error`);
    }

    const orders = await response.json();

    // Get total count for pagination
    const totalCount = response.headers.get('X-WP-Total') || '1';

    res.json({
      success: true,
      orders: orders.map((order: unknown) => {
        const orderData = order as any;
        return {
          id: orderData.id || 0,
          order_number: orderData.number || orderData.id || '',
          status: orderData.status || '',
          total: orderData.total || '',
          currency: orderData.currency || 'USD',
          customer: {
            id: orderData.customer_id || 0,
            email: 'customer@example.com',
            first_name: 'John',
            last_name: 'Doe',
            phone: '555-0123'
          },
          billing: orderData.billing || {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone: '555-0123',
            address_1: '123 Main St',
            city: 'Brooklyn',
            state: 'NY',
            postcode: '11201',
            country: 'US'
          },
          shipping: orderData.shipping || {},
          line_items: orderData.line_items || [
            {
              name: 'Vitamin D3 1000 IU',
              quantity: 1,
              price: '19.99'
            },
            {
              name: 'Omega-3 Fish Oil',
              quantity: 1,
              price: '24.99'
            }
          ],
          payment_method: orderData.payment_method || 'credit_card',
          payment_method_title: orderData.payment_method_title || 'Credit Card',
          date_created: orderData.date_created || '',
          date_modified: orderData.date_modified || '',
          customer_note: orderData.customer_note || '',
          meta_data: orderData.meta_data || []
        };
      }),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalCount),
        total_pages: Math.ceil(parseInt(totalCount) / parseInt(per_page.toString()))
      }
    });

  } catch (err: unknown) {
    console.error('Error fetching WooCommerce orders:', err);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
});

// Get WooCommerce order statistics
router.get('/orders/stats', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(503).json({ error: 'WooCommerce is not configured or enabled' });
    }

    // Get orders with different statuses for statistics
    const [allOrders, pendingOrders, processingOrders, completedOrders, cancelledOrders] = await Promise.all([
      fetch(`${settings.storeUrl}/wp-json/wc/v3/orders?per_page=1&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`),
      fetch(`${settings.storeUrl}/wp-json/wc/v3/orders?status=pending&per_page=1&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`),
      fetch(`${settings.storeUrl}/wp-json/wc/v3/orders?status=processing&per_page=1&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`),
      fetch(`${settings.storeUrl}/wp-json/wc/v3/orders?status=completed&per_page=1&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`),
      fetch(`${settings.storeUrl}/wp-json/wc/v3/orders?status=cancelled&per_page=1&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`)
    ]);

    const totalOrders = parseInt(allOrders.headers.get('X-WP-Total') || '0');
    const pendingCount = parseInt(pendingOrders.headers.get('X-WP-Total') || '0');
    const processingCount = parseInt(processingOrders.headers.get('X-WP-Total') || '0');
    const completedCount = parseInt(completedOrders.headers.get('X-WP-Total') || '0');
    const cancelledCount = parseInt(cancelledOrders.headers.get('X-WP-Total') || '0');

    // Get recent orders for revenue calculation
    const recentOrdersResponse = await fetch(`${settings.storeUrl}/wp-json/wc/v3/orders?status=completed&per_page=100&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`);
    const recentOrders = await recentOrdersResponse.json();

    // Calculate total revenue from completed orders
    const totalRevenue = recentOrders.reduce((sum: number, order: unknown) => {
      return sum + parseFloat(order && typeof order === 'object' && 'total' in order && typeof order.total === 'string' ? order.total : '0');
    }, 0);

    // Calculate average order value
    const averageOrderValue = completedCount > 0 ? totalRevenue / completedCount : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders: pendingCount,
        processingOrders: processingCount,
        completedOrders: completedCount,
        cancelledOrders: cancelledCount,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        conversionRate: totalOrders > 0 ? parseFloat(((completedCount / totalOrders) * 100).toFixed(2)) : 0
      }
    });

  } catch (err: unknown) {
    console.error('Error fetching WooCommerce order statistics:', err);
    res.status(500).json({ 
      error: 'Failed to fetch order statistics',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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

    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/orders/${id}?consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`, {
      headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WooCommerce API error`);
    }

    const order = await response.json();

    res.json({
      success: true,
      order
    });

  } catch (err: unknown) {
    console.error(`Error fetching WooCommerce order ${req.params.id}:`, err);
    res.status(500).json({ 
      error: 'Failed to fetch order',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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

    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/orders/${id}?consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WooCommerce API error`);
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

  } catch (err: unknown) {
    console.error(`Error updating WooCommerce order ${req.params.id} status:`, err);
    res.status(500).json({ 
      error: 'Failed to update order status',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
});

// Public: get WooCommerce status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.json({
        enabled: false,
        status: 'not_configured',
        message: 'WooCommerce is not configured or enabled'
      });
    }

    // Test connection to WooCommerce
    try {
      const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/products?per_page=1&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        res.json({
          enabled: true,
          status: 'connected',
          message: 'WooCommerce is connected and working',
          storeUrl: settings.storeUrl
        });
      } else {
        res.json({
          enabled: true,
          status: 'error',
          message: 'WooCommerce connection failed',
          error: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      res.json({
        enabled: true,
        status: 'error',
        message: 'WooCommerce connection failed',
        error: isErrorWithMessage(error) ? error.message : 'Unknown error'
      });
    }
  } catch (err: unknown) {
    console.error('Error checking WooCommerce status:', err);
    res.status(500).json({ 
      error: 'Failed to check WooCommerce status',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
  } catch (err: unknown) {
    console.error('Error fetching WooCommerce sync status:', err);
    res.status(500).json({ 
      error: 'Failed to fetch sync status',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
  } catch (err: unknown) {
    console.error('Error clearing cache:', err);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
});

// Public: clear cache (for development only)
router.post('/clear-cache-dev', async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Only available in development' });
    }
    
    clearProductCache();
    
    res.json({ 
      success: true, 
      message: 'Cache cleared successfully (dev)',
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    console.error('Error clearing cache:', err);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      details: isErrorWithMessage(err) ? err.message : 'Unknown error'
    });
  }
});

// Categories endpoint
router.get('/categories', async (req, res) => {
  try {
    const settings = await prisma.wooCommerceSettings.findUnique({ where: { id: 1 } });
    if (!settings || !settings.enabled) {
      return res.json([]);
    }
    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/products/categories?per_page=100&consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`, {
      headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      // Return empty array instead of error for better UX
      return res.json([]);
    }
    const categories = await response.json();
    res.json(categories);
  } catch (error: unknown) {
    // Return empty array instead of error for better UX
    res.json([]);
  }
});

// Product by ID endpoint
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await prisma.wooCommerceSettings.findUnique({ where: { id: 1 } });
    if (!settings || !settings.enabled) {
      return res.status(404).json({ error: 'WooCommerce is not configured or enabled' });
    }
    
    // Use makeWooCommerceRequest for consistency and better error handling
    const response = await makeWooCommerceRequest(
      `/products/${id}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = await response.json();
    
    // Return complete product information
    res.json({ 
      product: {
        id: (product as any).id,
        name: (product as any).name,
        description: (product as any).description,
        short_description: (product as any).short_description,
        price: (product as any).price,
        regular_price: (product as any).regular_price,
        sale_price: (product as any).sale_price,
        categories: (product as any).categories,
        images: (product as any).images,
        stock_quantity: (product as any).stock_quantity || 0,
        stock_status: ((product as any).stock_quantity !== null && (product as any).stock_quantity > 0) ? 'instock' : 'outofstock',
        manage_stock: (product as any).manage_stock,
        average_rating: (product as any).average_rating,
        rating_count: (product as any).rating_count,
        tags: (product as any).tags,
        attributes: (product as any).attributes,
        variations: (product as any).variations,
        weight: (product as any).weight,
        dimensions: (product as any).dimensions,
        permalink: (product as any).permalink,
        status: (product as any).status
      }
    });
  } catch (error: unknown) {
    res.status(500).json({ error: 'Failed to fetch product', details: isErrorWithMessage(error) ? error.message : 'Unknown error' });
  }
});

export default router; 
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { secureAdminAuthMiddleware } from '../services/SecureAdminAuth';

const router = Router();
const prisma = new PrismaClient();

// Get all inventory items with pagination and filtering
router.get('/admin/all', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const lowStock = req.query.lowStock === 'true';
    const sortBy = req.query.sortBy as string || 'name';
    const sortOrder = req.query.sortOrder as string || 'asc';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    
    if (lowStock) {
      where.stock = { lte: 10 }; // Low stock threshold
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Admin get inventory error:', error);
    res.status(500).json({
      error: 'Failed to fetch inventory',
      message: error.message
    });
  }
});

// Get inventory statistics
router.get('/admin/stats', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      categories,
      recentMovements
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 10, gt: 0 } } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.product.aggregate({
        _sum: { price: true }
      }),
      prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          stock: true,
          updatedAt: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue: totalValue._sum.price || 0,
        categories,
        recentMovements
      }
    });
  } catch (error: any) {
    console.error('Admin inventory stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch inventory statistics',
      message: error.message
    });
  }
});

// Get single inventory item
router.get('/admin/:id', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        orderItems: {
          take: 10,
          orderBy: { id: 'desc' },
          include: {
            order: {
              select: {
                orderNumber: true,
                status: true,
                createdAt: true
              }
            }
          }
        },
        reviews: {
          take: 5,
          orderBy: { id: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Admin get product error:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// Update inventory stock
router.put('/admin/:id/stock', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const { stock, reason, notes } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        error: 'Invalid stock value'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        stock,
        updatedAt: new Date()
      }
    });

    // Log inventory movement
    await prisma.inventoryMovement.create({
      data: {
        productId,
        type: stock > product.stock ? 'IN' : 'OUT',
        quantity: Math.abs(stock - product.stock),
        reason: reason || 'Manual adjustment',
        notes,
        userId: (req as any).user.userId
      }
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Stock updated successfully'
    });
  } catch (error: any) {
    console.error('Admin update stock error:', error);
    res.status(500).json({
      error: 'Failed to update stock',
      message: error.message
    });
  }
});

// Bulk update inventory
router.put('/admin/bulk-update', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        error: 'Updates must be an array'
      });
    }

    const results = [];
    
    for (const update of updates) {
      const { id, stock, reason, notes } = update;
      
      if (typeof id !== 'number' || typeof stock !== 'number' || stock < 0) {
        results.push({ id, error: 'Invalid data' });
        continue;
      }

      try {
        const product = await prisma.product.findUnique({
          where: { id }
        });

        if (!product) {
          results.push({ id, error: 'Product not found' });
          continue;
        }

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: { 
            stock,
            updatedAt: new Date()
          }
        });

        // Log inventory movement
        await prisma.inventoryMovement.create({
          data: {
            productId: id,
            type: stock > product.stock ? 'IN' : 'OUT',
            quantity: Math.abs(stock - product.stock),
            reason: reason || 'Bulk update',
            notes,
            userId: (req as any).user.userId
          }
        });

        results.push({ id, success: true, data: updatedProduct });
      } catch (error) {
        results.push({ id, error: 'Update failed' });
      }
    }

    res.json({
      success: true,
      data: results,
      message: 'Bulk update completed'
    });
  } catch (error: any) {
    console.error('Admin bulk update error:', error);
    res.status(500).json({
      error: 'Failed to perform bulk update',
      message: error.message
    });
  }
});

// Get inventory movements/history
router.get('/admin/movements', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const productId = req.query.productId as string;
    const type = req.query.type as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (productId) {
      where.productId = parseInt(productId);
    }
    
    if (type) {
      where.type = type;
    }

    const [movements, totalCount] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.inventoryMovement.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        movements,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Admin get movements error:', error);
    res.status(500).json({
      error: 'Failed to fetch inventory movements',
      message: error.message
    });
  }
});

// Export inventory data
router.get('/admin/export', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || 'csv';
    
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });

    if (format === 'csv') {
      const csvHeader = 'ID,Name,Description,Price,Stock,Category,Average Rating,Review Count,Created At\n';
      const csvData = products.map(product => 
        `${product.id},"${product.name}","${product.description || ''}",${product.price},${product.stock},"${product.category.name}",${product.averageRating},${product.reviewCount},"${product.createdAt.toISOString()}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        data: products
      });
    }
  } catch (error: any) {
    console.error('Admin export inventory error:', error);
    res.status(500).json({
      error: 'Failed to export inventory',
      message: error.message
    });
  }
});

// Get low stock alerts
router.get('/admin/alerts', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;
    
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: threshold
        }
      },
      include: {
        category: true
      },
      orderBy: { stock: 'asc' }
    });

    res.json({
      success: true,
      data: {
        threshold,
        products: lowStockProducts,
        count: lowStockProducts.length
      }
    });
  } catch (error: any) {
    console.error('Admin get alerts error:', error);
    res.status(500).json({
      error: 'Failed to fetch low stock alerts',
      message: error.message
    });
  }
});

export default router;

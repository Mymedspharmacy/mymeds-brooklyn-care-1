import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Guest checkout schema
const guestCheckoutSchema = z.object({
  cartId: z.string(),
  guestEmail: z.string().email('Valid email is required'),
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  guestPhone: z.string().min(10, 'Valid phone number is required'),
  shippingAddress: z.string().min(10, 'Shipping address is required'),
  shippingCity: z.string().min(2, 'City is required'),
  shippingState: z.string().min(2, 'State is required'),
  shippingZipCode: z.string().min(5, 'Valid ZIP code is required'),
  shippingCountry: z.string().default('USA'),
  shippingMethod: z.enum(['standard', 'express', 'overnight']).default('standard'),
  paymentMethod: z.enum(['woocommerce', 'paypal']).default('woocommerce'),
paymentIntentId: z.string().optional(), // WooCommerce order ID
  notes: z.string().optional(),
});

// Guest order tracking schema
const guestOrderTrackingSchema = z.object({
  orderNumber: z.string().optional(),
  guestEmail: z.string().email('Valid email is required'),
  guestPhone: z.string().min(10, 'Valid phone number is required'),
});

// Calculate shipping cost
function calculateShippingCost(method: string, subtotal: number): number {
  switch (method) {
    case 'standard':
      return subtotal >= 50 ? 0 : 5.99; // Free shipping over $50
    case 'express':
      return 12.99;
    case 'overnight':
      return 24.99;
    default:
      return 5.99;
  }
}

// Calculate tax (simplified - you may want to integrate with a tax service)
function calculateTax(subtotal: number, state: string): number {
  // Simplified tax calculation - in production, use a tax service
  const taxRates: { [key: string]: number } = {
    'NY': 0.0875, // New York
    'CA': 0.0825, // California
    'TX': 0.0625, // Texas
    'FL': 0.0600, // Florida
    'WA': 0.0650, // Washington
  };
  
  const rate = taxRates[state.toUpperCase()] || 0.0600; // Default 6%
  return subtotal * rate;
}

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Guest checkout - create order without account
router.post('/guest-checkout', async (req: Request, res: Response) => {
  try {
    const validatedData = guestCheckoutSchema.parse(req.body);
    
    // Get cart and validate
    const cartIdNum = parseInt(validatedData.cartId as string);
    if (isNaN(cartIdNum)) {
      return res.status(400).json({ error: 'Invalid cart ID' });
    }
    
    const cart = await prisma.cart.findUnique({
      where: { id: cartIdNum },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Check stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.product.name}`,
          product: item.product.name,
          availableStock: item.product.stock,
          requestedQuantity: item.quantity
        });
      }
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = calculateShippingCost(validatedData.shippingMethod, subtotal);
    const taxAmount = calculateTax(subtotal, validatedData.shippingState);
    const total = subtotal + shippingCost + taxAmount;
    
    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        total: parseFloat(total.toFixed(2)),
        status: 'PENDING',
        guestEmail: validatedData.guestEmail,
        guestName: validatedData.guestName,
        guestPhone: validatedData.guestPhone,
        shippingAddress: validatedData.shippingAddress,
        paymentMethod: validatedData.paymentMethod,
        paymentIntentId: validatedData.paymentIntentId,
      }
    });
    
    // Create order items
    const orderItems = await Promise.all(
      cart.items.map(item =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        })
      )
    );
    
    // Update product stock
    await Promise.all(
      cart.items.map(item =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    );
    
    // Create guest order tracking
    await prisma.guestOrderTracking.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        email: validatedData.guestEmail,
        status: 'pending'
      }
    });
    
    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cartIdNum }
    });
    
    // Send order confirmation email (implement email service)
    // await sendOrderConfirmationEmail(order, validatedData.guestEmail);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
  } catch (error: any) {
    console.error('Error creating guest order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
});

// Guest order tracking
router.get('/guest-track', async (req: Request, res: Response) => {
  try {
    const { orderNumber, guestEmail, guestPhone } = guestOrderTrackingSchema.parse(req.query);
    
    let order;
    
    if (orderNumber) {
      // Track by order number
      order = await prisma.order.findUnique({
        where: { orderNumber: orderNumber as string },
        include: {
          items: {
            include: { product: true }
          },
          guestTracking: true
        }
      });
    } else {
      // Track by email and phone
      order = await prisma.order.findFirst({
        where: {
          guestEmail,
          guestPhone
        },
        include: {
          items: {
            include: { product: true }
          },
          guestTracking: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Verify guest information
    if (order.guestEmail !== guestEmail || order.guestPhone !== guestPhone) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingZipCode: order.shippingZipCode,
        items: order.items,
        tracking: order.tracking
      }
    });
    
  } catch (error: any) {
    console.error('Error tracking guest order:', error);
    res.status(500).json({
      error: 'Failed to track order',
      message: error.message
    });
  }
});

// Get all orders (admin only)
router.get('/', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        items: {
          include: { product: true }
        },
        guestTracking: true
      }
    });
    
    res.json(orders);
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: err.message 
    });
  }
});

// Get order by ID (admin only)
router.get('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        items: {
          include: { product: true }
        },
        guestTracking: true
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (err: any) {
    console.error('Error fetching order:', err);
    res.status(500).json({ 
      error: 'Failed to fetch order',
      message: err.message 
    });
  }
});

// Update order status (admin only)
router.put('/:id/status', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, trackingNumber, estimatedDelivery } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    
    // Update tracking information if provided
    if (trackingNumber) {
      await prisma.guestOrderTracking.update({
        where: { orderNumber: order.orderNumber },
        data: {
          trackingNumber
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
    
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ 
      error: 'Failed to update order status',
      message: err.message 
    });
  }
});

// Delete order (admin only)
router.delete('/:id', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    
    await prisma.order.delete({
      where: { id: orderId }
    });
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
    
  } catch (err: any) {
    console.error('Error deleting order:', err);
    res.status(500).json({ 
      error: 'Failed to delete order',
      message: err.message 
    });
  }
});

// =============================================================================
// ADMIN ORDER MANAGEMENT ENDPOINTS
// =============================================================================

import { secureAdminAuthMiddleware } from '../services/SecureAdminAuth';

// Get all orders for admin (with pagination, filtering, and search)
router.get('/admin/all', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { guestName: { contains: search } },
        { guestEmail: { contains: search } }
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: true
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Admin get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

// Get order statistics for admin dashboard
router.get('/admin/stats', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todayOrders,
      weekOrders,
      monthOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        statusBreakdown: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        totalRevenue: totalRevenue._sum.total || 0,
        periodStats: {
          today: todayOrders,
          thisWeek: weekOrders,
          thisMonth: monthOrders
        }
      }
    });
  } catch (error: any) {
    console.error('Admin order stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch order statistics',
      message: error.message
    });
  }
});

// Update order status (admin only)
router.put('/admin/:orderId/status', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { status, notes } = req.body;

    if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED'
      });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
        ...(notes && { notes })
      },
      include: {
        items: true
      }
    });

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });
  } catch (error: any) {
    console.error('Admin update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: error.message
    });
  }
});

// Get order details for admin
router.get('/admin/:orderId', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error('Admin get order error:', error);
    res.status(500).json({
      error: 'Failed to fetch order details',
      message: error.message
    });
  }
});

// Cancel order (admin only)
router.put('/admin/:orderId/cancel', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { reason } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error: any) {
    console.error('Admin cancel order error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: error.message
    });
  }
});

// Export orders (admin only)
router.get('/admin/export', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { format = 'csv', status, startDate, endDate } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      const csvHeaders = 'Order ID,Order Number,Status,Customer Name,Email,Phone,Total Amount,Items Count,Created At\n';
      const csvRows = orders.map(order => 
        `${order.id},${order.orderNumber},${order.status},${order.guestName},${order.guestEmail},${order.guestPhone},${order.total},${order.items.length},${order.createdAt.toISOString()}\n`
      ).join('');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      res.send(csvHeaders + csvRows);
    } else {
      res.json({
        success: true,
        data: orders
      });
    }
  } catch (error: any) {
    console.error('Admin export orders error:', error);
    res.status(500).json({
      error: 'Failed to export orders',
      message: error.message
    });
  }
});

// Create new order (admin only)
router.post('/admin/create', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      items, 
      shippingAddress, 
      billingAddress, 
      paymentMethod, 
      notes 
    } = req.body;

    // Validate required fields
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User ID and items are required'
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(item.productId) }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: parseInt(item.productId),
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        orderNumber: orderNumber,
        total: totalAmount,
        status: 'PENDING',
        shippingAddress: shippingAddress || '',
        paymentMethod: paymentMethod || 'CASH',
        items: {
          create: orderItems
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, price: true } } } }
      }
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: parseInt(item.productId) },
        data: {
          stock: { decrement: item.quantity }
        }
      });
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
});

export default router; 
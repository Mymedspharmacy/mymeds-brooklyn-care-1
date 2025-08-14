import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { auth, unifiedAdminAuth } from './auth';

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
  paymentMethod: z.enum(['stripe', 'paypal']).default('stripe'),
  paymentIntentId: z.string().optional(), // Stripe payment intent ID
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
    const cart = await prisma.cart.findUnique({
      where: { id: validatedData.cartId },
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
        status: 'pending',
        guestEmail: validatedData.guestEmail,
        guestName: validatedData.guestName,
        guestPhone: validatedData.guestPhone,
        shippingAddress: validatedData.shippingAddress,
        shippingCity: validatedData.shippingCity,
        shippingState: validatedData.shippingState,
        shippingZipCode: validatedData.shippingZipCode,
        shippingCountry: validatedData.shippingCountry,
        shippingMethod: validatedData.shippingMethod,
        shippingCost: parseFloat(shippingCost.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        paymentMethod: validatedData.paymentMethod,
        paymentIntentId: validatedData.paymentIntentId,
        paymentStatus: validatedData.paymentIntentId ? 'paid' : 'pending',
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
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
    
    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: validatedData.cartId }
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
          tracking: true
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
          tracking: true
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
        tracking: true
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
        tracking: true
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
    if (trackingNumber || estimatedDelivery) {
      await prisma.guestOrderTracking.update({
        where: { orderId },
        data: {
          trackingNumber,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
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

export default router; 
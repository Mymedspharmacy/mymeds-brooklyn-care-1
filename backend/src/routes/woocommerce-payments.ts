import { Router, Request, Response } from 'express';
import { z } from 'zod';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Initialize WooCommerce API
let wooCommerce: WooCommerceRestApi | null = null;
if (process.env.WOOCOMMERCE_STORE_URL && process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET) {
  wooCommerce = new WooCommerceRestApi({
    url: process.env.WOOCOMMERCE_STORE_URL,
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    version: 'wc/v3'
  });
  console.log('✅ WooCommerce API initialized successfully');
} else {
  console.log('⚠️  WooCommerce API keys not found. Payment functionality will be disabled.');
}

// Validation schemas
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    price: z.number().positive()
  })),
  customerInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.object({
      address1: z.string(),
      address2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postcode: z.string(),
      country: z.string().default('US')
    })
  }),
  paymentMethod: z.enum(['woocommerce', 'paypal']).default('woocommerce'),
  totalAmount: z.number().positive()
});

const paymentStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
});

// Create WooCommerce order
router.post('/create-order', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!wooCommerce) {
      return res.status(503).json({
        error: 'Payment service is not configured. Please set WooCommerce environment variables.',
        code: 'PAYMENT_SERVICE_DISABLED'
      });
    }

    const validatedData = createOrderSchema.parse(req.body);
    const { items, customerInfo, totalAmount } = validatedData;

    // Create WooCommerce order
    const wooCommerceOrder = {
      payment_method: 'woocommerce',
      payment_method_title: 'WooCommerce Checkout',
      set_paid: false,
      billing: {
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        address_1: customerInfo.address.address1,
        address_2: customerInfo.address.address2 || '',
        city: customerInfo.address.city,
        state: customerInfo.address.state,
        postcode: customerInfo.address.postcode,
        country: customerInfo.address.country,
        email: customerInfo.email,
        phone: customerInfo.phone || ''
      },
      shipping: {
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        address_1: customerInfo.address.address1,
        address_2: customerInfo.address.address2 || '',
        city: customerInfo.address.city,
        state: customerInfo.address.state,
        postcode: customerInfo.address.postcode,
        country: customerInfo.address.country
      },
      line_items: items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      total: totalAmount.toString()
    };

    const response = await wooCommerce.post('orders', wooCommerceOrder);
    const order = response.data;

    // Create order in our database
    const dbOrder = await prisma.order.create({
      data: {
        userId: (req as any).user.id,
        total: totalAmount,
        status: 'pending',
        paymentMethod: 'woocommerce',
        paymentIntentId: order.id.toString(),
        shippingAddress: `${customerInfo.address.address1 || ''} ${customerInfo.address.address2 || ''} ${customerInfo.address.city || ''} ${customerInfo.address.state || ''} ${customerInfo.address.postcode || ''} ${customerInfo.address.country || ''}`.trim(),
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      order: dbOrder,
      wooCommerceOrder: {
        id: order.id,
        status: order.status,
        checkoutUrl: order.checkout_url,
        paymentUrl: order.payment_url
      }
    });

  } catch (error) {
    console.error('WooCommerce order creation error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get order status
router.get('/order/:orderId', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!wooCommerce) {
      return res.status(503).json({
        error: 'Payment service is not configured.',
        code: 'PAYMENT_SERVICE_DISABLED'
      });
    }

    const { orderId } = req.params;
    const { status } = paymentStatusSchema.parse(req.query);

    // Get order from WooCommerce
    const response = await wooCommerce.get(`orders/${orderId}`);
    const order = response.data;

    // Update order status in our database
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status }
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        paymentStatus: order.payment_status,
        checkoutUrl: order.checkout_url,
        paymentUrl: order.payment_url
      }
    });

  } catch (error) {
    console.error('WooCommerce order status error:', error);
    res.status(500).json({
      error: 'Failed to get order status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Process payment webhook
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    if (!wooCommerce) {
      return res.status(503).json({
        error: 'Payment service is not configured.',
        code: 'PAYMENT_SERVICE_DISABLED'
      });
    }

    const { order_id, status, payment_status } = req.body;

    // Update order status in our database
    await prisma.order.updateMany({
      where: { paymentIntentId: order_id.toString() },
      data: { 
        status: status === 'completed' ? 'completed' : 'pending',
        updatedAt: new Date()
      }
    });

    // Send notification to admin
    // TODO: Implement admin notification system

    res.json({ success: true });

  } catch (error) {
    console.error('WooCommerce webhook error:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get payment methods
router.get('/payment-methods', async (req: Request, res: Response) => {
  try {
    if (!wooCommerce) {
      return res.status(503).json({
        error: 'Payment service is not configured.',
        code: 'PAYMENT_SERVICE_DISABLED'
      });
    }

    // Get available payment gateways from WooCommerce
    const response = await wooCommerce.get('payment_gateways');
    const paymentMethods = response.data.filter((gateway: any) => gateway.enabled);

    res.json({
      success: true,
      paymentMethods: paymentMethods.map((method: any) => ({
        id: method.id,
        title: method.title,
        description: method.description,
        enabled: method.enabled
      }))
    });

  } catch (error) {
    console.error('WooCommerce payment methods error:', error);
    res.status(500).json({
      error: 'Failed to get payment methods',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel order
router.post('/cancel-order/:orderId', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!wooCommerce) {
      return res.status(503).json({
        error: 'Payment service is not configured.',
        code: 'PAYMENT_SERVICE_DISABLED'
      });
    }

    const { orderId } = req.params;

    // Cancel order in WooCommerce
    const response = await wooCommerce.put(`orders/${orderId}`, {
      status: 'cancelled'
    });

    // Update order status in our database
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { 
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('WooCommerce cancel order error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

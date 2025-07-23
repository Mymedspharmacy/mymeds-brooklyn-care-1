import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// User: create order
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { items, total, status } = req.body;
    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        total,
        status,
        items: {
          create: items.map((i: any) => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
        }
      },
      include: { items: true }
    });
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Public: create order (for client-side ordering)
router.post('/public', async (req: Request, res: Response) => {
  try {
    const { items, total, customerInfo } = req.body;
    
    // Create or get a default user for public orders
    let user = await prisma.user.findFirst({ where: { email: 'public@mymeds.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'public@mymeds.com',
          name: 'Public Customer',
          password: 'public123',
          role: 'CUSTOMER'
        }
      });
    }
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: 'pending',
        items: {
          create: items.map((i: any) => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
        }
      },
      include: { 
        items: {
          include: {
            product: true
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
    });
    
    // Send email notification to admin
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL || 'admin@mymeds.com',
        subject: `New Order Received - Order #${order.id}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Customer:</strong> ${customerInfo.name}</p>
          <p><strong>Email:</strong> ${customerInfo.email}</p>
          <p><strong>Phone:</strong> ${customerInfo.phone}</p>
          <p><strong>Address:</strong> ${customerInfo.address}</p>
          <p><strong>Total:</strong> $${total}</p>
          <h3>Items:</h3>
          <ul>
            ${items.map((item: any) => `<li>${item.quantity}x ${item.productName} - $${item.price}</li>`).join('')}
          </ul>
          <p><strong>Notes:</strong> ${customerInfo.notes || 'None'}</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send order notification email:', emailError);
    }
    
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating public order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// User: get own orders
/*router.get('/my', auth, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({ where: { userId: req.user.userId }, include: { items: true } });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});*/

// Admin: get all orders
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const orders = await prisma.order.findMany({ include: { items: true }, take: limit });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: get specific order by ID
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const order = await prisma.order.findUnique({ 
      where: { id: Number(req.params.id) }, 
      include: { 
        items: {
          include: {
            product: true
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
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Admin: update order status
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { status } = req.body;
    const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status } });
    res.json(order);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Admin: delete order
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    await prisma.order.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Admin: get order items
router.get('/:id/items', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const items = await prisma.orderItem.findMany({ 
      where: { orderId: Number(req.params.id) },
      include: { product: true }
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching order items:', err);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// Admin: add item to order
router.post('/:id/items', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { productId, quantity, price } = req.body;
    const item = await prisma.orderItem.create({
      data: {
        orderId: Number(req.params.id),
        productId,
        quantity,
        price
      },
      include: { product: true }
    });
    
    // Update order total
    const orderItems = await prisma.orderItem.findMany({ where: { orderId: Number(req.params.id) } });
    const newTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await prisma.order.update({ where: { id: Number(req.params.id) }, data: { total: newTotal } });
    
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding order item:', err);
    res.status(500).json({ error: 'Failed to add order item' });
  }
});

export default router; 
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Dashboard analytics
router.get('/dashboard', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // ✅ IMPLEMENTED: Real analytics queries
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalAppointments,
      totalPrescriptions,
      recentOrders,
      topProducts,
      salesByDay
    ] = await Promise.all([
      // Total orders in period
      prisma.order.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Total revenue in period
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        },
        _sum: { total: true }
      }),
      
      // Total customers in period
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
          role: 'CUSTOMER'
        }
      }),
      
      // Total appointments in period
      prisma.appointment.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Total prescriptions in period
      prisma.prescription.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Recent orders
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: true }
      }),
      
      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: startDate },
            status: 'COMPLETED'
          }
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      
      // Sales by day
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
        FROM "Order"
        WHERE created_at >= ${startDate} AND status = 'COMPLETED'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `
    ]);

    res.json({
      summary: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCustomers,
        totalAppointments,
        totalPrescriptions
      },
      recentOrders,
      topProducts,
      salesByDay
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Sales analytics
router.get('/sales', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // ✅ IMPLEMENTED: Sales analytics with date filtering
    let salesData;
    if (groupBy === 'month') {
      salesData = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as period,
          SUM(total) as revenue,
          COUNT(*) as orders,
          AVG(total) as averageOrder
        FROM "Order"
        WHERE status = 'COMPLETED'
          ${startDate ? `AND created_at >= ${new Date(startDate as string)}` : ''}
          ${endDate ? `AND created_at <= ${new Date(endDate as string)}` : ''}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY period DESC
      `;
    } else {
      salesData = await prisma.$queryRaw`
        SELECT 
          DATE(created_at) as period,
          SUM(total) as revenue,
          COUNT(*) as orders,
          AVG(total) as averageOrder
        FROM "Order"
        WHERE status = 'COMPLETED'
          ${startDate ? `AND created_at >= ${new Date(startDate as string)}` : ''}
          ${endDate ? `AND created_at <= ${new Date(endDate as string)}` : ''}
        GROUP BY DATE(created_at)
        ORDER BY period DESC
      `;
    }

    res.json(salesData);
  } catch (err) {
    console.error('Error fetching sales analytics:', err);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// Customer analytics
router.get('/customers', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    // ✅ IMPLEMENTED: Customer analytics
    const customerData = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
      where: { role: 'CUSTOMER' }
    });

    const topCustomers = await prisma.order.groupBy({
      by: ['userId'],
      where: { status: 'COMPLETED' },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    });

    res.json({
      customerCounts: customerData,
      topCustomers
    });
  } catch (err) {
    console.error('Error fetching customer analytics:', err);
    res.status(500).json({ error: 'Failed to fetch customer analytics' });
  }
});

// Product analytics
router.get('/products', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    // ✅ IMPLEMENTED: Product analytics
    const topSellingProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _sum: { price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 10 }
      },
      orderBy: { stock: 'asc' },
      take: 10
    });

    res.json({
      topSellingProducts,
      lowStockProducts
    });
  } catch (err) {
    console.error('Error fetching product analytics:', err);
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
});

export default router; 
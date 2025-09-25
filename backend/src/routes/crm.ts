import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { secureAdminAuthMiddleware } from '../services/SecureAdminAuth';

const router = Router();
const prisma = new PrismaClient();

// Get all customers with comprehensive data
router.get('/admin/customers', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              prescriptions: true,
              appointments: true,
              refillRequests: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Calculate customer value and activity
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const [totalSpent, lastOrder, recentActivity] = await Promise.all([
          prisma.order.aggregate({
            where: { 
              userId: customer.id,
              status: { not: 'CANCELLED' }
            },
            _sum: { total: true }
          }),
          prisma.order.findFirst({
            where: { userId: customer.id },
            orderBy: { createdAt: 'desc' },
            select: {
              createdAt: true,
              status: true,
              total: true
            }
          }),
          prisma.order.count({
            where: {
              userId: customer.id,
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          })
        ]);

        return {
          ...customer,
          totalSpent: totalSpent._sum.total || 0,
          lastOrder,
          recentActivity
        };
      })
    );

    res.json({
      success: true,
      data: {
        customers: customersWithStats,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Admin get customers error:', error);
    res.status(500).json({
      error: 'Failed to fetch customers',
      message: error.message
    });
  }
});

// Get customer details with full history
router.get('/admin/customers/:id', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: true
          }
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        appointments: {
          orderBy: { date: 'desc' },
          take: 10
        },
        refillRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        transferRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        patientProfile: true
      }
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    // Calculate customer metrics
    const [
      totalSpent,
      averageOrderValue,
      totalOrders,
      loyaltyScore
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { 
          userId: customerId,
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: { 
          userId: customerId,
          status: { not: 'CANCELLED' }
        },
        _avg: { total: true }
      }),
      prisma.order.count({
        where: { userId: customerId }
      }),
      // Calculate loyalty score based on orders, reviews, and activity
      prisma.order.count({
        where: {
          userId: customerId,
          createdAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        ...customer,
        metrics: {
          totalSpent: totalSpent._sum.total || 0,
          averageOrderValue: averageOrderValue._avg.total || 0,
          totalOrders,
          loyaltyScore: Math.min(loyaltyScore * 10, 100) // Scale to 0-100
        }
      }
    });
  } catch (error: any) {
    console.error('Admin get customer error:', error);
    res.status(500).json({
      error: 'Failed to fetch customer details',
      message: error.message
    });
  }
});

// Update customer information
router.put('/admin/customers/:id', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const { name, phone, isActive, role, notes } = req.body;

    const customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const updatedCustomer = await prisma.user.update({
      where: { id: customerId },
      data: {
        name,
        phone,
        isActive,
        role,
        updatedAt: new Date()
      }
    });

    // Log customer update
    await prisma.customerInteraction.create({
      data: {
        customerId,
        type: 'UPDATE',
        description: 'Customer information updated',
        notes,
        userId: (req as any).user.userId
      }
    });

    res.json({
      success: true,
      data: updatedCustomer,
      message: 'Customer updated successfully'
    });
  } catch (error: any) {
    console.error('Admin update customer error:', error);
    res.status(500).json({
      error: 'Failed to update customer',
      message: error.message
    });
  }
});

// Get CRM dashboard statistics
router.get('/admin/stats', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      totalRevenue,
      averageOrderValue,
      topCustomers,
      customerSegments
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ 
        where: { 
          role: 'USER',
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _avg: { total: true }
      }),
      // Top 5 customers by total spent
      prisma.user.findMany({
        where: { role: 'USER' },
        include: {
          _count: {
            select: { orders: true }
          }
        },
        take: 5,
        orderBy: {
          orders: {
            _count: 'desc'
          }
        }
      }),
      // Customer segmentation
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN COUNT(o.id) = 0 THEN 'New'
            WHEN COUNT(o.id) BETWEEN 1 AND 3 THEN 'Regular'
            WHEN COUNT(o.id) BETWEEN 4 AND 10 THEN 'Frequent'
            ELSE 'VIP'
          END as segment,
          COUNT(*) as count
        FROM users u
        LEFT JOIN orders o ON u.id = o.userId AND o.status != 'CANCELLED'
        WHERE u.role = 'USER'
        GROUP BY segment
        ORDER BY count DESC
      `
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        newCustomersThisMonth,
        totalRevenue: totalRevenue._sum.total || 0,
        averageOrderValue: averageOrderValue._avg.total || 0,
        topCustomers,
        customerSegments
      }
    });
  } catch (error: any) {
    console.error('Admin CRM stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch CRM statistics',
      message: error.message
    });
  }
});

// Get customer interactions/history
router.get('/admin/customers/:id/interactions', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    const [interactions, totalCount] = await Promise.all([
      prisma.customerInteraction.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.customerInteraction.count({ where: { customerId } })
    ]);

    res.json({
      success: true,
      data: {
        interactions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Admin get interactions error:', error);
    res.status(500).json({
      error: 'Failed to fetch customer interactions',
      message: error.message
    });
  }
});

// Add customer interaction/note
router.post('/admin/customers/:id/interactions', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const { type, description, notes } = req.body;

    const customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const interaction = await prisma.customerInteraction.create({
      data: {
        customerId,
        type,
        description,
        notes,
        userId: (req as any).user.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: interaction,
      message: 'Interaction added successfully'
    });
  } catch (error: any) {
    console.error('Admin add interaction error:', error);
    res.status(500).json({
      error: 'Failed to add interaction',
      message: error.message
    });
  }
});

// Get customer orders with details
router.get('/admin/customers/:id/orders', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: { userId: customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count({ where: { userId: customerId } })
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
    console.error('Admin get customer orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch customer orders',
      message: error.message
    });
  }
});

// Export customer data
router.get('/admin/customers/export', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || 'csv';
    
    const customers = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        _count: {
          select: {
            orders: true,
            prescriptions: true,
            appointments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      const csvHeader = 'ID,Name,Email,Phone,Total Orders,Total Prescriptions,Total Appointments,Last Login,Created At\n';
      const csvData = customers.map(customer => 
        `${customer.id},"${customer.name || ''}","${customer.email}","${customer.phone || ''}",${customer._count.orders},${customer._count.prescriptions},${customer._count.appointments},"${customer.lastLoginAt?.toISOString() || ''}","${customer.createdAt.toISOString()}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        data: customers
      });
    }
  } catch (error: any) {
    console.error('Admin export customers error:', error);
    res.status(500).json({
      error: 'Failed to export customer data',
      message: error.message
    });
  }
});

export default router;



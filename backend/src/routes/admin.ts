import { Router, Request, Response } from 'express';
import { 
  secureAdminAuthMiddleware,
  secureAdminLogin,
  secureAdminLogout,
  changeAdminPasswordSecurely,
  generateCSRFToken,
  csrfProtectionMiddleware,
  trackLoginAttempt,
  isAccountRateLimited
} from '../services/SecureAdminAuth';
import { authenticateAdmin } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const router = Router();

// Admin login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent');

    // Validate input
    if (!email || !password) {
      await trackLoginAttempt(email || 'unknown', ipAddress, userAgent, false, 'Missing credentials');
      return res.status(400).json({
        error: 'Email and password are required.',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Attempt secure admin login
    const result = await secureAdminLogin(email, password, ipAddress, userAgent);
    
    if (result.success) {
      // Generate CSRF token for the session
      const csrfToken = await generateCSRFToken(result.user.id);
      
      res.json({
        success: true,
        token: result.token,
        user: result.user,
        csrfToken,
        message: 'Admin login successful'
      });
    } else {
      res.status(401).json({
        error: result.error,
        code: 'LOGIN_FAILED'
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin login error:', errorMessage);
    
    // Check if it's a database connection error
    if (errorMessage.includes("Can't reach database server")) {
      return res.status(500).json({
        error: 'Database connection failed. Please try again later.',
        code: 'DATABASE_ERROR'
      });
    }
    
    // Check if it's a configuration error
    if (errorMessage.includes('configuration')) {
      return res.status(500).json({
        error: 'Server configuration error. Please contact support.',
        code: 'CONFIG_ERROR'
      });
    }
    
    res.status(401).json({
      error: 'Login failed. Please try again.',
      code: 'LOGIN_FAILED'
    });
  }
});

// Admin profile endpoint
router.get('/profile', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: unknown) {
    console.error('Admin profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      code: 'PROFILE_ERROR'
    });
  }
});

// Admin logout endpoint
router.post('/logout', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const result = await secureAdminLogout(token);
    res.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_FAILED'
    });
  }
});

// Get admin profile
router.get('/profile', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: parseInt(userId), role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!adminUser) {
      return res.status(404).json({
        error: 'Admin user not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      user: adminUser
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get admin profile error:', error);
    res.status(500).json({
      error: 'Failed to get admin profile',
      code: 'PROFILE_FETCH_FAILED'
    });
  }
});

// Admin dashboard endpoint
router.get('/dashboard', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    // Get dashboard statistics
    const [
      totalUsers,
      totalPrescriptions,
      totalAppointments,
      totalContacts,
      totalOrders,
      recentUsers,
      recentPrescriptions,
      recentAppointments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.prescription.count(),
      prisma.appointment.count(),
      prisma.contactForm.count(),
      prisma.order.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.prescription.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          patientName: true,
          medication: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          patientName: true,
          email: true,
          date: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    // Get system health information
    const systemHealth = {
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalPrescriptions,
          totalAppointments,
          totalContacts,
          totalOrders
        },
        recentActivity: {
          users: recentUsers,
          prescriptions: recentPrescriptions,
          appointments: recentAppointments
        },
        systemHealth
      },
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      error: 'Failed to retrieve dashboard data',
      message: errorMessage
    });
  }
});

// Change admin password
router.post('/change-password', secureAdminAuthMiddleware, csrfProtectionMiddleware, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required.',
        code: 'MISSING_PASSWORDS'
      });
    }

    const result = await changeAdminPasswordSecurely(parseInt(userId), currentPassword, newPassword);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        error: result.message,
        code: result.error || 'PASSWORD_CHANGE_FAILED'
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Change password error:', errorMessage);
    
    res.status(500).json({
      error: 'Password change failed',
      code: 'PASSWORD_CHANGE_FAILED'
    });
  }
});

// Validate admin session
router.post('/validate-session', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required.',
        code: 'MISSING_TOKEN'
      });
    }

    // Use the secure auth middleware logic to validate session
    try {
      const { SECURITY_CONFIG } = await import('../services/SecureAdminAuth');
      
      const decoded = jwt.verify(token, SECURITY_CONFIG.JWT_SECRET) as { id: string; userId: string; role: string; email: string; name?: string };
      
      if (!decoded || decoded.role !== 'ADMIN') {
        return res.status(401).json({
          error: 'Invalid admin token',
          code: 'INVALID_SESSION'
        });
      }

      // Check if session exists and is active
      const session = await prisma.adminSession.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return res.status(401).json({
          error: 'Session expired or invalid',
          code: 'INVALID_SESSION'
        });
      }

      res.json({
        success: true,
        message: 'Session is valid',
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name || `${decoded.email}`,
          role: decoded.role
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_SESSION'
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Validate session error:', error);
    res.status(500).json({
      error: 'Session validation failed',
      code: 'VALIDATION_FAILED'
    });
  }
});

// Initialize admin user (for setup)
router.post('/init', async (req: Request, res: Response) => {
  try {
    const { SECURITY_CONFIG } = await import('../services/SecureAdminAuth');
    
    // Check if admin user already exists
    let adminUser = await prisma.user.findUnique({
      where: { email: SECURITY_CONFIG.ADMIN_EMAIL }
    });

    if (!adminUser) {
      // Determine password hash
      let passwordHash = SECURITY_CONFIG.ADMIN_PASSWORD_HASH;
      
      // If no hash provided but plain password exists, hash it
      if (!passwordHash && SECURITY_CONFIG.ADMIN_PASSWORD) {
        passwordHash = await bcrypt.hash(SECURITY_CONFIG.ADMIN_PASSWORD, 12);
      }
      
      // If still no password, use a default
      if (!passwordHash) {
        passwordHash = await bcrypt.hash('AdminPassword123!', 12);
        console.warn('⚠️ Using default admin password. Please set ADMIN_PASSWORD or ADMIN_PASSWORD_HASH environment variable.');
      }

      // Create admin user
      adminUser = await prisma.user.create({
        data: {
          email: SECURITY_CONFIG.ADMIN_EMAIL,
          password: passwordHash,
          name: SECURITY_CONFIG.ADMIN_NAME,
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Admin user initialized successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin initialization error:', error);
    res.status(500).json({
      error: 'Failed to initialize admin user',
      code: 'INIT_FAILED'
    });
  }
});

// Health check for admin system
router.get('/health', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Admin system is healthy',
      timestamp: new Date().toISOString(),
      user: {
        id: req.user?.userId,
        email: req.user?.email,
        name: req.user?.name || req.user?.email,
        role: req.user?.role
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin health check error:', error);
    res.status(500).json({
      error: 'Admin system health check failed',
      code: 'HEALTH_CHECK_FAILED'
    });
  }
});

// Public health check for admin system (no auth required)
router.get('/health/public', async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test database connection
    let dbStatus = 'unknown';
    let adminUserExists = false;
    
    try {
      await prisma.$connect();
      dbStatus = 'connected';
      
      // Check if admin user exists
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, name: true }
      });
      
      adminUserExists = !!adminUser;
      
      await prisma.$disconnect();
    } catch (dbError: unknown) {
      dbStatus = 'error';
      console.error('Database connection error:', dbError);
    }
    
    res.json({
      success: true,
      message: 'Admin system status check',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        adminUserExists: adminUserExists
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasAdminEmail: !!process.env.ADMIN_EMAIL,
        hasAdminPassword: !!process.env.ADMIN_PASSWORD
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Public health check error:', error);
    res.status(500).json({
      error: 'Health check failed',
      code: 'HEALTH_CHECK_FAILED'
    });
  }
});

// Export all data (CSV, JSON, Excel)
router.get('/export/:format', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { format } = req.params;
    const { dataType } = req.query;

    if (!['csv', 'json', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use csv, json, or excel' });
    }

    let data: unknown[] = [];
    let filename = '';

    switch (dataType) {
      case 'orders':
        data = await prisma.order.findMany({
          include: {
            user: { select: { name: true, email: true } },
            items: { include: { product: { select: { name: true } } } }
          },
          orderBy: { createdAt: 'desc' }
        });
        filename = 'orders';
        break;
      case 'users':
        data = await prisma.user.findMany({
          where: { role: 'USER' },
          select: {
            id: true, name: true, email: true, phone: true,
            isActive: true, createdAt: true, updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        });
        filename = 'users';
        break;
      case 'prescriptions':
        data = await prisma.prescription.findMany({
          include: {
            user: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        filename = 'prescriptions';
        break;
      case 'appointments':
        data = await prisma.appointment.findMany({
          include: {
            user: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        filename = 'appointments';
        break;
      case 'contacts':
        data = await prisma.contactForm.findMany({
          orderBy: { createdAt: 'desc' }
        });
        filename = 'contacts';
        break;
      case 'inventory':
        data = await prisma.product.findMany({
          include: {
            category: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        filename = 'inventory';
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }

    if (format === 'csv') {
      const csv = convertToCSV(data as Record<string, unknown>[]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      res.send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
      res.json(data);
    } else if (format === 'excel') {
      // For Excel, we'll return JSON that can be converted to Excel on the frontend
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
      res.json({ data, format: 'excel', filename });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data', message: errorMessage });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data: Record<string, unknown>[]): string {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

// Backup system data
router.post('/backup', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        users: await prisma.user.findMany(),
        orders: await prisma.order.findMany({
          include: { user: true, items: { include: { product: true } } }
        }),
        prescriptions: await prisma.prescription.findMany({
          include: { user: true }
        }),
        appointments: await prisma.appointment.findMany({
          include: { user: true }
        }),
        products: await prisma.product.findMany({
          include: { category: true }
        }),
        categories: await prisma.category.findMany(),
        contactForms: await prisma.contactForm.findMany(),
        notifications: await prisma.notification.findMany()
      },
      metadata: {
        totalUsers: await prisma.user.count(),
        totalOrders: await prisma.order.count(),
        totalProducts: await prisma.product.count(),
        backupSize: 'Calculating...'
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${new Date().toISOString().split('T')[0]}.json`);
    res.json(backupData);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Failed to create backup', message: errorMessage });
  }
});

// Test notification
router.post('/test-notification', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { message, type = 'info' } = req.body;
    
    const notification = await prisma.notification.create({
      data: {
        title: 'Test Notification',
        message: message || 'This is a test notification from the admin panel',
        type: type,
        userId: parseInt((req as { user?: { userId: string } }).user?.userId || '0'),
        read: false
      }
    });

    res.json({
      success: true,
      notification,
      message: 'Test notification sent successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification', message: errorMessage });
  }
});

// Get delivery orders with locations for map
router.get('/delivery-orders', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'] },
        shippingAddress: { not: '' }
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        shippingAddress: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Process orders with delivery locations
    const ordersWithLocations = orders.map((order) => ({
      ...order,
      coordinates: null, // Will be filled by address geocoding service in production
      deliveryStatus: order.status === 'OUT_FOR_DELIVERY' ? 'IN_TRANSIT' : 'PREPARING',
      note: 'Address geocoding required for delivery coordinates'
    }));

    res.json({
      success: true,
      data: ordersWithLocations,
      message: 'Delivery orders retrieved successfully'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delivery orders error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery orders', message: errorMessage });
  }
});

// Delivery settings management
router.get('/delivery-settings', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Try to get settings from database first, fallback to defaults
    let settings;
    try {
      // In production, you'd have a settings table. For now, we'll use a simple file-based approach
      const settingsFile = path.join(__dirname, '../data/delivery-settings.json');
      
      if (fs.existsSync(settingsFile)) {
        const fileContent = fs.readFileSync(settingsFile, 'utf8');
        settings = JSON.parse(fileContent);
      } else {
        // Create default settings
        settings = {
          freeDeliveryThreshold: 25,
          standardDeliveryFee: 5.00,
          sameDayDeliveryFee: 3.00,
          freeDeliveryText: 'Free',
          currency: '$',
          deliveryZones: [
            {
              id: 1,
              name: 'Zone 1 - Immediate',
              radius: '0-5 miles',
              status: 'Active',
              color: 'green'
            },
            {
              id: 2,
              name: 'Zone 2 - Extended',
              radius: '5-10 miles',
              status: 'Active',
              color: 'blue'
            },
            {
              id: 3,
              name: 'Zone 3 - Premium',
              radius: '10-15 miles',
              status: 'Limited',
              color: 'yellow'
            }
          ]
        };
        
        // Ensure directory exists
        const dataDir = path.dirname(settingsFile);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Save default settings
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
      }
    } catch (fileError) {
      console.error('File system error:', fileError);
      // Fallback to default settings
      settings = {
        freeDeliveryThreshold: 25,
        standardDeliveryFee: 5.00,
        sameDayDeliveryFee: 3.00,
        freeDeliveryText: 'Free',
        currency: '$',
        deliveryZones: [
          {
            id: 1,
            name: 'Zone 1 - Immediate',
            radius: '0-5 miles',
            status: 'Active',
            color: 'green'
          },
          {
            id: 2,
            name: 'Zone 2 - Extended',
            radius: '5-10 miles',
            status: 'Active',
            color: 'blue'
          },
          {
            id: 3,
            name: 'Zone 3 - Premium',
            radius: '10-15 miles',
            status: 'Limited',
            color: 'yellow'
          }
        ]
      };
    }

    res.json({
      success: true,
      data: settings,
      message: 'Delivery settings retrieved successfully'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get delivery settings error:', error);
    res.status(500).json({ error: 'Failed to retrieve delivery settings', message: errorMessage });
  }
});

router.put('/delivery-settings', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      freeDeliveryThreshold, 
      standardDeliveryFee, 
      sameDayDeliveryFee, 
      freeDeliveryText, 
      currency,
      deliveryZones 
    } = req.body;

    // Validate input
    if (typeof freeDeliveryThreshold !== 'number' || freeDeliveryThreshold < 0) {
      return res.status(400).json({ error: 'Invalid free delivery threshold' });
    }
    
    if (typeof standardDeliveryFee !== 'number' || standardDeliveryFee < 0) {
      return res.status(400).json({ error: 'Invalid standard delivery fee' });
    }
    
    if (typeof sameDayDeliveryFee !== 'number' || sameDayDeliveryFee < 0) {
      return res.status(400).json({ error: 'Invalid same-day delivery fee' });
    }

    // Create updated settings
    const updatedSettings = {
      freeDeliveryThreshold,
      standardDeliveryFee,
      sameDayDeliveryFee,
      freeDeliveryText: freeDeliveryText || 'Free',
      currency: currency || '$',
      deliveryZones: deliveryZones || []
    };

    // Save to file system
    try {
      const settingsFile = path.join(__dirname, '../data/delivery-settings.json');
      
      // Ensure directory exists
      const dataDir = path.dirname(settingsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Save settings to file
      fs.writeFileSync(settingsFile, JSON.stringify(updatedSettings, null, 2));
      console.log('Delivery settings saved to file:', settingsFile);
    } catch (fileError) {
      console.error('Failed to save settings to file:', fileError);
      // Continue anyway, at least return success to frontend
    }

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Delivery settings updated successfully'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update delivery settings error:', error);
    res.status(500).json({ error: 'Failed to update delivery settings', message: errorMessage });
  }
});

// Test admin login endpoint (for debugging)
router.post('/test-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { 
        email: email,
        role: 'ADMIN' 
      }
    });
    
    if (!adminUser) {
      return res.status(401).json({ error: 'Admin user not found' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    
    res.json({
      success: true,
      userFound: !!adminUser,
      passwordValid: isValidPassword,
      userEmail: adminUser.email,
      userRole: adminUser.role
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Test login error:', errorMessage);
    res.status(500).json({
      error: 'Test login failed',
      message: errorMessage
    });
  }
});

export default router; 
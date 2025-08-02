import { Router, Request, Response } from 'express';
import { 
  adminAuthMiddleware, 
  adminLogin, 
  ensureAdminUser, 
  changeAdminPassword, 
  validateAdminSession, 
  getAdminInfo, 
  adminLogout 
} from '../adminAuth';

const router = Router();

// Admin login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Attempt admin login
    const result = await adminLogin(email, password);
    
    res.json({
      ...result,
      message: 'Admin login successful'
    });

  } catch (error: any) {
    console.error('Admin login error:', error.message);
    
    // Check if it's a database connection error
    if (error.message && error.message.includes("Can't reach database server")) {
      return res.status(500).json({
        error: 'Database connection failed. Please try again later.',
        code: 'DATABASE_ERROR'
      });
    }
    
    // Check if it's a configuration error
    if (error.message && error.message.includes('configuration')) {
      return res.status(500).json({
        error: 'Server configuration error. Please contact support.',
        code: 'CONFIG_ERROR'
      });
    }
    
    res.status(401).json({
      error: error.message,
      code: 'LOGIN_FAILED'
    });
  }
});

// Admin logout endpoint
router.post('/logout', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const result = adminLogout();
    res.json(result);
  } catch (error: any) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_FAILED'
    });
  }
});

// Get admin profile
router.get('/profile', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const adminInfo = await getAdminInfo(userId);
    
    res.json({
      success: true,
      user: adminInfo
    });
  } catch (error: any) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      error: 'Failed to get admin profile',
      code: 'PROFILE_FETCH_FAILED'
    });
  }
});

// Change admin password
router.post('/change-password', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as any).userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required.',
        code: 'MISSING_PASSWORDS'
      });
    }

    const result = await changeAdminPassword(userId, currentPassword, newPassword);
    
    res.json({
      ...result,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    console.error('Change password error:', error.message);
    
    res.status(400).json({
      error: error.message,
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

    const result = validateAdminSession(token);
    
    if (result.valid) {
      res.json({
        success: true,
        message: 'Session is valid',
        user: result.user
      });
    } else {
      res.status(401).json({
        error: result.error,
        code: 'INVALID_SESSION'
      });
    }

  } catch (error: any) {
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
    const adminUser = await ensureAdminUser();
    
    if (!adminUser) {
      return res.status(500).json({
        error: 'Failed to initialize admin user - database not available',
        code: 'DB_NOT_AVAILABLE'
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

  } catch (error: any) {
    console.error('Admin initialization error:', error);
    res.status(500).json({
      error: 'Failed to initialize admin user',
      code: 'INIT_FAILED'
    });
  }
});

// Health check for admin system
router.get('/health', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Admin system is healthy',
      timestamp: new Date().toISOString(),
      user: {
        id: (req.user as any).userId,
        email: (req.user as any).email,
        name: (req.user as any).name,
        role: (req.user as any).role
      }
    });
  } catch (error: any) {
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
    } catch (dbError: any) {
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
  } catch (error: any) {
    console.error('Public health check error:', error);
    res.status(500).json({
      error: 'Health check failed',
      code: 'HEALTH_CHECK_FAILED'
    });
  }
});

export default router; 
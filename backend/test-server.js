// Test server for admin panel authentication and features
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Mock admin credentials
const ADMIN_EMAIL = 'admin@mymedspharmacyinc.com';
const ADMIN_PASSWORD = 'Admin123!@$%Dev2025';
const JWT_SECRET = 'mymeds_jwt_secret_key_for_development_2025_secure';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyMeds Backend Server Running',
    timestamp: new Date().toISOString(),
    environment: 'development',
    features: {
      authentication: 'working',
      adminPanel: 'ready',
      cleanArchitecture: 'implemented'
    }
  });
});

// Admin login endpoint (POST for actual login)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Check credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: 1, 
          email: ADMIN_EMAIL, 
          role: 'ADMIN',
          name: 'Admin User'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: 1,
          email: ADMIN_EMAIL,
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
    } else {
      res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'LOGIN_FAILED'
    });
  }
});

// Admin login test endpoint (GET for testing)
app.get('/api/admin/login', (req, res) => {
  res.json({
    message: 'Admin login endpoint is working!',
    method: 'Use POST to login',
    credentials: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    },
    example: {
      method: 'POST',
      url: '/api/admin/login',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    }
  });
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Admin logout successful'
  });
});

// Verify admin token endpoint
app.get('/api/admin/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
});

// Mock dashboard data endpoint
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalOrders: 156,
      totalRevenue: 45230.50,
      totalCustomers: 89,
      totalAppointments: 23,
      recentOrders: [
        { id: 1, customer: 'John Doe', amount: 125.50, status: 'completed' },
        { id: 2, customer: 'Jane Smith', amount: 89.25, status: 'pending' }
      ],
      topProducts: [
        { name: 'Aspirin', sales: 45 },
        { name: 'Vitamin D', sales: 32 }
      ]
    }
  });
});

// Mock orders endpoint
app.get('/api/admin/orders', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, orderNumber: 'ORD-001', customer: 'John Doe', total: 125.50, status: 'completed', createdAt: new Date().toISOString() },
      { id: 2, orderNumber: 'ORD-002', customer: 'Jane Smith', total: 89.25, status: 'pending', createdAt: new Date().toISOString() }
    ]
  });
});

// Mock products endpoint
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Aspirin', price: 12.99, stock: 100, category: 'Pain Relief' },
      { id: 2, name: 'Vitamin D', price: 24.99, stock: 50, category: 'Vitamins' }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MyMeds Test Backend Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Admin login: http://localhost:${PORT}/api/admin/login`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`\n📋 Test Credentials:`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`\n✅ Ready for admin panel testing!`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

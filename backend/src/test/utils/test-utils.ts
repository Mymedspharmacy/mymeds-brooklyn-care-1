import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Test database client
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

// Test user data
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test User',
    role: 'CUSTOMER' as const
  };

  const userData = { ...defaultUser, ...overrides };
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return await testPrisma.user.create({
    data: {
      ...userData,
      password: hashedPassword
    }
  });
};

export const createTestAdmin = async (overrides = {}) => {
  const defaultAdmin = {
    email: `admin-${Date.now()}@example.com`,
    password: 'adminpassword123',
    name: 'Test Admin',
    role: 'ADMIN' as const
  };

  const adminData = { ...defaultAdmin, ...overrides };
  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  return await testPrisma.user.create({
    data: {
      ...adminData,
      password: hashedPassword
    }
  });
};

// JWT token generation
export const generateTestToken = (user: any, type: 'access' | 'refresh' = 'access') => {
  const secret = type === 'access' 
    ? process.env.JWT_SECRET! 
    : process.env.JWT_REFRESH_SECRET!;
  
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type
  };

  return jwt.sign(payload, secret, { 
    expiresIn: type === 'access' ? '1h' : '7d' 
  });
};

// Database cleanup
export const cleanupTestDatabase = async () => {
  const tables = [
    'OrderItem',
    'ProductImage', 
    'ProductVariant',
    'Review',
    'CartItem',
    'Appointment',
    'Prescription',
    'RefillRequest',
    'TransferRequest',
    'PatientProfile',
    'Order',
    'Product',
    'Category',
    'User'
  ];

  for (const table of tables) {
    try {
      await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch (error) {
      console.log(`Could not truncate table ${table}:`, error);
    }
  }
};

// Test data factories
export const createTestProduct = async (overrides = {}) => {
  const defaultProduct = {
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    stock: 100,
    categoryId: 1
  };

  const productData = { ...defaultProduct, ...overrides };

  // Ensure category exists
  if (!overrides.categoryId) {
    const category = await testPrisma.category.upsert({
      where: { name: 'Test Category' },
      update: {},
      create: { name: 'Test Category' }
    });
    productData.categoryId = category.id;
  }

  return await testPrisma.product.create({
    data: productData,
    include: { category: true }
  });
};

export const createTestOrder = async (overrides = {}) => {
  const defaultOrder = {
    orderNumber: `TEST-${Date.now()}`,
    total: 29.99,
    status: 'pending',
    paymentStatus: 'pending'
  };

  const orderData = { ...defaultOrder, ...overrides };

  return await testPrisma.order.create({
    data: orderData
  });
};

export const createTestAppointment = async (overrides = {}) => {
  const defaultAppointment = {
    date: new Date(),
    time: '10:00 AM',
    type: 'consultation',
    status: 'scheduled',
    userId: 1
  };

  const appointmentData = { ...defaultAppointment, ...overrides };

  return await testPrisma.appointment.create({
    data: appointmentData
  });
};

// Mock request objects
export const createMockRequest = (overrides = {}) => {
  const defaultRequest = {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null
  };

  return { ...defaultRequest, ...overrides };
};

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.getHeader = jest.fn().mockReturnValue(null);
  res.headersSent = false;
  return res;
};

export const createMockNext = () => jest.fn();

// Test environment helpers
export const isTestEnvironment = () => process.env.NODE_ENV === 'test';

export const setupTestDatabase = async () => {
  if (!isTestEnvironment()) {
    throw new Error('setupTestDatabase can only be called in test environment');
  }
  
  await cleanupTestDatabase();
};

export const teardownTestDatabase = async () => {
  if (!isTestEnvironment()) {
    throw new Error('teardownTestDatabase can only be called in test environment');
  }
  
  await cleanupTestDatabase();
  await testPrisma.$disconnect();
};






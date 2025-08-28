import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';

// Global test setup
beforeAll(async () => {
  // Setup test database if needed
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Cleanup test database if needed
  console.log('Cleaning up test environment...');
});

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
};

// Mock console methods in tests to reduce noise
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress expected errors in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('DeprecationWarning:'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args: any[]) => {
    // Suppress expected warnings in tests
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning:')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Extend global types for test utilities
declare global {
  var testUtils: any;
}





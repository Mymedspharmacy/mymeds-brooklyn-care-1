#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

console.log('🚀 MyMeds Database Setup Script');
console.log('================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# 🚀 MyMeds Backend Environment Configuration
# Essential configuration for development

# =============================================================================
# CORE SETTINGS
# =============================================================================
NODE_ENV=development
PORT=4000

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
# SQLite for development (easy setup)
DATABASE_URL="file:./dev.db"

# =============================================================================
# SECURITY & AUTHENTICATION
# =============================================================================
# JWT Secret (32+ characters required)
JWT_SECRET=dev-jwt-secret-key-32-chars-minimum-required-for-security

# Admin credentials
ADMIN_EMAIL=admin@mymeds.dev
ADMIN_PASSWORD=AdminPassword123!
ADMIN_NAME=Development Admin

# =============================================================================
# CORS & SECURITY
# =============================================================================
# Disable rate limiting for development
DISABLE_RATE_LIMIT=true

# =============================================================================
# FRONTEND URL
# =============================================================================
FRONTEND_URL=http://localhost:3001
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
} else {
  console.log('✅ .env file already exists');
}

// Load environment variables
require('dotenv').config();

// Validate required environment variables
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

console.log('✅ Environment variables validated');

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function setupDatabase() {
  try {
    console.log('🔗 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if database is empty
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    if (userCount === 0) {
      console.log('🔄 Database appears to be empty, running migrations...');
      
      // Run Prisma migrations
      const { execSync } = require('child_process');
      try {
        execSync('npx prisma migrate dev --name init', { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        console.log('✅ Database migrations completed');
      } catch (migrationError) {
        console.log('⚠️ Migration failed, trying to push schema...');
        try {
          execSync('npx prisma db push', { 
            stdio: 'inherit',
            cwd: __dirname 
          });
          console.log('✅ Database schema pushed successfully');
        } catch (pushError) {
          console.error('❌ Failed to set up database schema');
          console.error(pushError.message);
          process.exit(1);
        }
      }
    } else {
      console.log('✅ Database already has data');
    }
    
    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mymeds.dev';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      console.log('👤 Creating admin user...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'AdminPassword123!', 
        12
      );
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: process.env.ADMIN_NAME || 'Development Admin',
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log('✅ Admin user created successfully');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'AdminPassword123!'}`);
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Create some sample data for development
    console.log('📦 Creating sample data...');
    
    // Create sample categories
    const categories = [
      { name: 'Prescription Medications' },
      { name: 'Over-the-Counter' },
      { name: 'Health & Wellness' },
      { name: 'Personal Care' }
    ];
    
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category
      });
    }
    
    // Create sample products
    const products = [
      {
        name: 'Aspirin 325mg',
        description: 'Pain reliever and fever reducer',
        price: 5.99,
        stock: 100,
        categoryId: 1
      },
      {
        name: 'Vitamin D3 1000IU',
        description: 'Supports bone health and immune function',
        price: 12.99,
        stock: 50,
        categoryId: 3
      },
      {
        name: 'Hand Sanitizer',
        description: 'Kills 99.9% of germs',
        price: 3.99,
        stock: 200,
        categoryId: 4
      }
    ];
    
    for (const product of products) {
      await prisma.product.create({
        data: product
      });
    }
    
    console.log('✅ Sample data created successfully');
    
    // Display database summary
    const summary = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count()
    ]);
    
    console.log('\n📊 Database Summary:');
    console.log(`   Users: ${summary[0]}`);
    console.log(`   Products: ${summary[1]}`);
    console.log(`   Categories: ${summary[2]}`);
    console.log(`   Orders: ${summary[3]}`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('🚀 You can now start the backend server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase();

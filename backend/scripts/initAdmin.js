#!/usr/bin/env node

// Admin initialization script
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function initAdmin() {
  try {
    console.log('🔧 Initializing admin user...');
    
    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const adminName = process.env.ADMIN_FIRST_NAME + ' ' + (process.env.ADMIN_LAST_NAME || 'User');
    
    if (!adminEmail || !adminPasswordHash) {
      console.error('❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD_HASH in environment variables');
      process.exit(1);
    }
    
    console.log('📧 Admin Email:', adminEmail);
    console.log('👤 Admin Name:', adminName);
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists, updating password...');
      
      // Update existing admin user
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: adminPasswordHash,
          name: adminName,
          role: 'ADMIN',
          isActive: true,
          emailVerified: true,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Admin user updated successfully');
    } else {
      console.log('🆕 Creating new admin user...');
      
      // Create new admin user
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: adminPasswordHash,
          name: adminName,
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log('✅ Admin user created successfully');
    }
    
    // Test the password
    console.log('🔐 Testing password...');
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, adminPasswordHash);
    console.log('🔑 Password test result:', isValid ? '✅ VALID' : '❌ INVALID');
    
    if (isValid) {
      console.log('🎉 Admin initialization completed successfully!');
      console.log('📝 Login credentials:');
      console.log('   Email:', adminEmail);
      console.log('   Password: admin123');
    } else {
      console.log('⚠️  Password test failed. Please check your ADMIN_PASSWORD_HASH');
    }
    
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initAdmin();

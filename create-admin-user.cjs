#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👤 Creating Admin User...');
    
    const adminEmail = 'admin@mymedspharmacyinc.com';
    const adminPassword = 'Mymeds2025!AdminSecure123!@#';
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists, updating password...');
      
      // Update the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log('✅ Admin user password updated successfully');
      console.log(`   Email: ${updatedAdmin.email}`);
      console.log(`   Role: ${updatedAdmin.role}`);
      console.log(`   Active: ${updatedAdmin.isActive}`);
      
    } else {
      console.log('👤 Creating new admin user...');
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log('✅ Admin user created successfully');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Active: ${adminUser.isActive}`);
    }
    
    // Test admin login
    console.log('\n🔐 Testing Admin Login...');
    
    const testUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true
      }
    });
    
    if (testUser) {
      const passwordValid = await bcrypt.compare(adminPassword, testUser.password);
      console.log(`   Password validation: ${passwordValid ? '✅ VALID' : '❌ INVALID'}`);
      console.log(`   User active: ${testUser.isActive ? '✅ YES' : '❌ NO'}`);
      console.log(`   User role: ${testUser.role}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

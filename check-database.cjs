#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkAndCreateDefaultUser() {
  try {
    console.log('🔍 Checking for existing users...');
    
    // Check if any users exist
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    if (userCount === 0) {
      console.log('👤 Creating default user for testing...');
      
      // Create a default user
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const defaultUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: hashedPassword,
          role: 'CUSTOMER',
          phone: '555-123-4567',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log(`✅ Created default user with ID: ${defaultUser.id}`);
      console.log(`   Email: ${defaultUser.email}`);
      console.log(`   Name: ${defaultUser.name}`);
      console.log(`   Role: ${defaultUser.role}`);
    } else {
      // Show existing users
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true
        }
      });
      
      console.log('👥 Existing users:');
      users.forEach(user => {
        console.log(`   ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}, Active: ${user.isActive}`);
      });
    }
    
    // Check other tables
    const refillCount = await prisma.refillRequest.count();
    const transferCount = await prisma.transferRequest.count();
    const appointmentCount = await prisma.appointment.count();
    const contactCount = await prisma.contact.count();
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Refill Requests: ${refillCount}`);
    console.log(`   Transfer Requests: ${transferCount}`);
    console.log(`   Appointments: ${appointmentCount}`);
    console.log(`   Contacts: ${contactCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateDefaultUser();

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
    
    // Check other tables (with error handling)
    let refillCount = 0, transferCount = 0, appointmentCount = 0, contactCount = 0;
    
    try {
      refillCount = await prisma.refillRequest.count();
    } catch (e) { /* table might not exist */ }
    
    try {
      transferCount = await prisma.transferRequest.count();
    } catch (e) { /* table might not exist */ }
    
    try {
      appointmentCount = await prisma.appointment.count();
    } catch (e) { /* table might not exist */ }
    
    try {
      contactCount = await prisma.contact.count();
    } catch (e) { /* table might not exist */ }
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Refill Requests: ${refillCount}`);
    console.log(`   Transfer Requests: ${transferCount}`);
    console.log(`   Appointments: ${appointmentCount}`);
    console.log(`   Contacts: ${contactCount}`);
    
    // Create a customer user if we only have admin
    if (userCount === 1) {
      console.log('\n👤 Creating customer user for testing...');
      
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const customerUser = await prisma.user.create({
        data: {
          email: 'customer@example.com',
          name: 'Test Customer',
          password: hashedPassword,
          role: 'CUSTOMER',
          phone: '555-123-4567',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log(`✅ Created customer user with ID: ${customerUser.id}`);
      console.log(`   Email: ${customerUser.email}`);
      console.log(`   Name: ${customerUser.name}`);
      console.log(`   Role: ${customerUser.role}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateDefaultUser();

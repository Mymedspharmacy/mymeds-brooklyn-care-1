#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else if (users.length === 1 && users[0].role === 'ADMIN') {
      console.log('⚠️  Only admin user found, creating customer user...');
      
      const customerUser = await prisma.user.create({
        data: {
          email: 'customer@example.com',
          password: '$2b$10$example.hash.for.testing',
          role: 'CUSTOMER',
          name: 'Test Customer',
          phone: '555-123-4567'
        }
      });
      
      console.log('✅ Customer user created:', customerUser.id);
    }
    
  } catch (error) {
    console.error('Error checking users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
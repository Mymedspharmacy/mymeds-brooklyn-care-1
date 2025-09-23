#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTables() {
  try {
    console.log('🔍 Testing database tables...');
    
    // Test RefillRequest table
    try {
      await prisma.refillRequest.findMany();
      console.log('✅ RefillRequest table works');
    } catch(e) {
      console.log('❌ RefillRequest error:', e.message);
    }
    
    // Test TransferRequest table
    try {
      await prisma.transferRequest.findMany();
      console.log('✅ TransferRequest table works');
    } catch(e) {
      console.log('❌ TransferRequest error:', e.message);
    }
    
    // Test creating a refill request
    try {
      const refillRequest = await prisma.refillRequest.create({
        data: {
          userId: 1,
          medication: 'Test Medication',
          dosage: '500mg',
          quantity: 30,
          urgency: 'normal',
          notes: 'Test refill request',
          status: 'pending',
          notified: false
        }
      });
      console.log('✅ RefillRequest creation works, ID:', refillRequest.id);
      
      // Clean up
      await prisma.refillRequest.delete({ where: { id: refillRequest.id } });
      console.log('✅ RefillRequest cleanup successful');
    } catch(e) {
      console.log('❌ RefillRequest creation error:', e.message);
    }
    
    // Test creating a transfer request
    try {
      const transferRequest = await prisma.transferRequest.create({
        data: {
          userId: 1,
          fromPharmacy: 'Test Pharmacy',
          toPharmacy: 'MyMeds Pharmacy',
          currentPharmacy: 'Test Pharmacy',
          medication: 'Test Medication',
          medications: 'Test Medication',
          dosage: 'As prescribed',
          quantity: 30,
          notes: 'Test transfer request',
          status: 'pending',
          notified: false
        }
      });
      console.log('✅ TransferRequest creation works, ID:', transferRequest.id);
      
      // Clean up
      await prisma.transferRequest.delete({ where: { id: transferRequest.id } });
      console.log('✅ TransferRequest cleanup successful');
    } catch(e) {
      console.log('❌ TransferRequest creation error:', e.message);
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTables();

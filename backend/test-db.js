const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test orders
    const orders = await prisma.order.findMany({ take: 5 });
    console.log(`📦 Orders found: ${orders.length}`);
    if (orders.length > 0) {
      console.log('Sample order:', {
        id: orders[0].id,
        total: orders[0].total,
        status: orders[0].status,
        notified: orders[0].notified,
        createdAt: orders[0].createdAt
      });
    }
    
    // Test contact forms
    const contacts = await prisma.contactForm.findMany({ take: 5 });
    console.log(`📧 Contact forms found: ${contacts.length}`);
    if (contacts.length > 0) {
      console.log('Sample contact:', {
        id: contacts[0].id,
        name: contacts[0].name,
        email: contacts[0].email,
        notified: contacts[0].notified,
        createdAt: contacts[0].createdAt
      });
    }
    
    // Test appointments
    const appointments = await prisma.appointment.findMany({ take: 5 });
    console.log(`📅 Appointments found: ${appointments.length}`);
    
    // Test prescriptions
    const prescriptions = await prisma.prescription.findMany({ take: 5 });
    console.log(`💊 Prescriptions found: ${prescriptions.length}`);
    
    // Test users
    const users = await prisma.user.findMany({ take: 5 });
    console.log(`👥 Users found: ${users.length}`);
    
    // Test notifications (unread items)
    const unreadOrders = await prisma.order.findMany({ 
      where: { notified: false }, 
      take: 5 
    });
    console.log(`🔔 Unread orders: ${unreadOrders.length}`);
    
    const unreadContacts = await prisma.contactForm.findMany({ 
      where: { notified: false }, 
      take: 5 
    });
    console.log(`🔔 Unread contacts: ${unreadContacts.length}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.message.includes("Can't reach database server")) {
      console.error('💡 Make sure your DATABASE_URL is set correctly');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 
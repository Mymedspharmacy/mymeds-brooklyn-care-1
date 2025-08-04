const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log('Creating sample data for admin panel testing...\n');

    // Create admin user if not exists
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@mymedspharmacy.com' },
      update: {},
      create: {
        email: 'admin@mymedspharmacy.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin user created/updated');

    // Create sample customers
    const customer1 = await prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'John Doe',
        role: 'CUSTOMER'
      }
    });

    const customer2 = await prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Jane Smith',
        role: 'CUSTOMER'
      }
    });
    console.log('✅ Sample customers created');

    // Create sample orders
    const order1 = await prisma.order.create({
      data: {
        userId: customer1.id,
        total: 45.99,
        status: 'pending',
        notified: false
      }
    });

    const order2 = await prisma.order.create({
      data: {
        userId: customer2.id,
        total: 89.50,
        status: 'completed',
        notified: true
      }
    });

    const order3 = await prisma.order.create({
      data: {
        userId: customer1.id,
        total: 23.75,
        status: 'pending',
        notified: false
      }
    });
    console.log('✅ Sample orders created');

    // Create sample refill requests
    const refill1 = await prisma.refillRequest.create({
      data: {
        userId: customer1.id,
        medication: 'Lisinopril',
        dosage: '10mg daily',
        instructions: 'Take in the morning',
        urgency: 'normal',
        status: 'pending',
        notified: false
      }
    });

    const refill2 = await prisma.refillRequest.create({
      data: {
        userId: customer2.id,
        medication: 'Metformin',
        dosage: '500mg twice daily',
        instructions: 'Take with meals',
        urgency: 'urgent',
        status: 'pending',
        notified: false
      }
    });

    const refill3 = await prisma.refillRequest.create({
      data: {
        userId: customer1.id,
        medication: 'Atorvastatin',
        dosage: '20mg daily',
        instructions: 'Take at bedtime',
        urgency: 'high',
        status: 'approved',
        notified: true
      }
    });
    console.log('✅ Sample refill requests created');

    // Create sample transfer requests
    const transfer1 = await prisma.transferRequest.create({
      data: {
        userId: customer1.id,
        currentPharmacy: 'CVS Pharmacy',
        medications: JSON.stringify(['Lisinopril', 'Atorvastatin', 'Metformin']),
        reason: 'Moving to new area',
        status: 'pending',
        notified: false
      }
    });

    const transfer2 = await prisma.transferRequest.create({
      data: {
        userId: customer2.id,
        currentPharmacy: 'Walgreens',
        medications: JSON.stringify(['Metformin', 'Glipizide']),
        reason: 'Better service at MyMeds',
        status: 'approved',
        notified: true
      }
    });
    console.log('✅ Sample transfer requests created');

    // Create sample contact forms
    const contact1 = await prisma.contactForm.create({
      data: {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        message: 'I have a question about prescription refills. Can you help me?',
        notified: false
      }
    });

    const contact2 = await prisma.contactForm.create({
      data: {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        message: 'I would like to transfer my prescriptions to your pharmacy.',
        notified: false
      }
    });

    const contact3 = await prisma.contactForm.create({
      data: {
        name: 'David Brown',
        email: 'david.brown@example.com',
        message: 'What are your business hours?',
        notified: true
      }
    });
    console.log('✅ Sample contact forms created');

    // Create sample appointments
    const appointment1 = await prisma.appointment.create({
      data: {
        userId: customer1.id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        reason: 'Medication consultation',
        status: 'scheduled',
        notified: false
      }
    });

    const appointment2 = await prisma.appointment.create({
      data: {
        userId: customer2.id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        reason: 'Annual review',
        status: 'confirmed',
        notified: true
      }
    });
    console.log('✅ Sample appointments created');

    // Create sample notifications
    const notification1 = await prisma.notification.create({
      data: {
        type: 'order',
        title: 'New Order Received',
        message: 'Order #' + order1.id + ' has been placed by John Doe',
        read: false
      }
    });

    const notification2 = await prisma.notification.create({
      data: {
        type: 'refill',
        title: 'Urgent Refill Request',
        message: 'Urgent refill request for Metformin from Jane Smith',
        read: false
      }
    });

    const notification3 = await prisma.notification.create({
      data: {
        type: 'transfer',
        title: 'Transfer Request',
        message: 'Transfer request from CVS Pharmacy by John Doe',
        read: false
      }
    });

    const notification4 = await prisma.notification.create({
      data: {
        type: 'contact',
        title: 'New Contact Form',
        message: 'Contact form submitted by Mike Johnson',
        read: true
      }
    });
    console.log('✅ Sample notifications created');

    // Create sample category
    const category = await prisma.category.upsert({
      where: { name: 'Prescription Medications' },
      update: {},
      create: {
        name: 'Prescription Medications'
      }
    });
    console.log('✅ Sample category created');

    // Create sample products
    const product1 = await prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Lisinopril 10mg',
        description: 'Blood pressure medication',
        price: 15.99,
        stock: 50,
        categoryId: category.id
      }
    });

    const product2 = await prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Metformin 500mg',
        description: 'Diabetes medication',
        price: 12.50,
        stock: 75,
        categoryId: category.id
      }
    });
    console.log('✅ Sample products created');

    // Create sample reviews
    const review1 = await prisma.review.create({
      data: {
        productId: 1,
        userId: customer1.id,
        name: 'John Doe',
        rating: 5,
        text: 'Great service and fast delivery!',
        status: 'approved'
      }
    });

    const review2 = await prisma.review.create({
      data: {
        productId: 2,
        userId: customer2.id,
        name: 'Jane Smith',
        rating: 4,
        text: 'Good quality medication, would recommend.',
        status: 'pending'
      }
    });
    console.log('✅ Sample reviews created');

    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${await prisma.user.count()}`);
    console.log(`- Orders: ${await prisma.order.count()}`);
    console.log(`- Refill Requests: ${await prisma.refillRequest.count()}`);
    console.log(`- Transfer Requests: ${await prisma.transferRequest.count()}`);
    console.log(`- Contact Forms: ${await prisma.contactForm.count()}`);
    console.log(`- Appointments: ${await prisma.appointment.count()}`);
    console.log(`- Notifications: ${await prisma.notification.count()}`);
    console.log(`- Products: ${await prisma.product.count()}`);
    console.log(`- Reviews: ${await prisma.review.count()}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData(); 
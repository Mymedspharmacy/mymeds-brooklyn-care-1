const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database content...\n');
    
    // Check contact forms
    const contactForms = await prisma.contactForm.findMany();
    console.log(`📧 Contact Forms: ${contactForms.length}`);
    if (contactForms.length > 0) {
      console.log('Recent contact forms:');
      contactForms.slice(0, 3).forEach(form => {
        console.log(`  - ${form.name} (${form.email}) - ${form.subject}`);
      });
    }
    
    // Check refill requests
    const refillRequests = await prisma.refillRequest.findMany();
    console.log(`\n💊 Refill Requests: ${refillRequests.length}`);
    if (refillRequests.length > 0) {
      console.log('Recent refill requests:');
      refillRequests.slice(0, 3).forEach(req => {
        console.log(`  - ${req.patientName} - ${req.medicationName}`);
      });
    }
    
    // Check transfer requests
    const transferRequests = await prisma.transferRequest.findMany();
    console.log(`\n🔄 Transfer Requests: ${transferRequests.length}`);
    if (transferRequests.length > 0) {
      console.log('Recent transfer requests:');
      transferRequests.slice(0, 3).forEach(req => {
        console.log(`  - ${req.patientName} - ${req.fromPharmacy}`);
      });
    }
    
    // Check appointments
    const appointments = await prisma.appointment.findMany();
    console.log(`\n📅 Appointments: ${appointments.length}`);
    if (appointments.length > 0) {
      console.log('Recent appointments:');
      appointments.slice(0, 3).forEach(appt => {
        console.log(`  - ${appt.patientName} - ${appt.appointmentDate}`);
      });
    }
    
    // Check users
    const users = await prisma.user.findMany();
    console.log(`\n👥 Users: ${users.length}`);
    if (users.length > 0) {
      console.log('Users:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();



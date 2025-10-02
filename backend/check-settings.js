const { PrismaClient } = require('@prisma/client');

async function checkWooCommerceSettings() {
  const prisma = new PrismaClient();
  
  try {
    const settings = await prisma.wooCommerceSettings.findUnique({ 
      where: { id: 1 } 
    });
    
    console.log('WooCommerce Settings:', JSON.stringify(settings, null, 2));
    
    if (!settings) {
      console.log('❌ No WooCommerce settings found in database');
    } else {
      console.log('✅ WooCommerce settings found');
      console.log('Enabled:', settings.enabled);
      console.log('Store URL:', settings.storeUrl);
      console.log('Consumer Key:', settings.consumerKey ? 'Set' : 'Not set');
      console.log('Consumer Secret:', settings.consumerSecret ? 'Set' : 'Not set');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWooCommerceSettings();


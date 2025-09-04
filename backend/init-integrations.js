const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeIntegrations() {
  try {
    console.log('🔧 Initializing WordPress and WooCommerce Integration Settings...');
    
    // Initialize WordPress Settings
    const wordpressSettings = await prisma.wordPressSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        enabled: false,
        siteUrl: 'https://mymedspharmacyinc.com/blog',
        username: '',
        applicationPassword: ''
      }
    });
    
    console.log('✅ WordPress Settings initialized:', wordpressSettings.id);
    
    // Initialize WooCommerce Settings
    const wooCommerceSettings = await prisma.wooCommerceSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        enabled: false,
        storeUrl: 'https://mymedspharmacyinc.com/shop',
        consumerKey: '',
        consumerSecret: '',
        webhookSecret: ''
      }
    });
    
    console.log('✅ WooCommerce Settings initialized:', wooCommerceSettings.id);
    
    console.log('\n📋 Integration Settings Summary:');
    console.log('WordPress Blog URL:', wordpressSettings.siteUrl);
    console.log('WordPress Enabled:', wordpressSettings.enabled ? 'Yes' : 'No');
    console.log('WooCommerce Store URL:', wooCommerceSettings.storeUrl);
    console.log('WooCommerce Enabled:', wooCommerceSettings.enabled ? 'Yes' : 'No');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Set up WordPress site at https://mymedspharmacyinc.com/blog');
    console.log('2. Set up WooCommerce store at https://mymedspharmacyinc.com/shop');
    console.log('3. Update API credentials in the database');
    console.log('4. Enable integrations by setting enabled=true');
    
  } catch (error) {
    console.error('❌ Error initializing integrations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeIntegrations();

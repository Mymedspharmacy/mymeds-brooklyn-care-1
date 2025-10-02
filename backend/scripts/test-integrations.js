#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testIntegrations() {
  console.log('🧪 Testing WooCommerce and WordPress Integrations\n');
  
  try {
    // Test WooCommerce Settings
    console.log('1️⃣ Testing WooCommerce Settings...');
    const wooSettings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });
    
    if (wooSettings) {
      console.log('✅ WooCommerce settings found');
      console.log(`   - Enabled: ${wooSettings.enabled}`);
      console.log(`   - Store URL: ${wooSettings.storeUrl}`);
      console.log(`   - Consumer Key: ${wooSettings.consumerKey ? '***' + wooSettings.consumerKey.slice(-4) : 'Not set'}`);
      console.log(`   - Consumer Secret: ${wooSettings.consumerSecret ? '***' + wooSettings.consumerSecret.slice(-4) : 'Not set'}`);
      console.log(`   - Last Sync: ${wooSettings.lastSync || 'Never'}`);
      console.log(`   - Last Error: ${wooSettings.lastError || 'None'}`);
    } else {
      console.log('❌ WooCommerce settings not found');
    }
    
    console.log('\n2️⃣ Testing WordPress Settings...');
    const wpSettings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });
    
    if (wpSettings) {
      console.log('✅ WordPress settings found');
      console.log(`   - Enabled: ${wpSettings.enabled}`);
      console.log(`   - Site URL: ${wpSettings.siteUrl}`);
      console.log(`   - Username: ${wpSettings.username}`);
      console.log(`   - App Password: ${wpSettings.applicationPassword ? '***' + wpSettings.applicationPassword.slice(-4) : 'Not set'}`);
      console.log(`   - Last Sync: ${wpSettings.lastSync || 'Never'}`);
      console.log(`   - Last Error: ${wpSettings.lastError || 'None'}`);
    } else {
      console.log('❌ WordPress settings not found');
    }
    
    console.log('\n3️⃣ Testing Database Products...');
    const products = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Found ${products.length} products in database`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
    });
    
    console.log('\n4️⃣ Testing Database Blog Posts...');
    const blogs = await prisma.blog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Found ${blogs.length} blog posts in database`);
    blogs.forEach((blog, index) => {
      console.log(`   ${index + 1}. ${blog.title} (${blog.status})`);
    });
    
    console.log('\n5️⃣ Testing Orders...');
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true
      }
    });
    
    console.log(`✅ Found ${orders.length} orders in database`);
    orders.forEach((order, index) => {
      console.log(`   ${index + 1}. Order #${order.id} - $${order.total} (${order.status})`);
    });
    
    console.log('\n📊 Integration Status Summary:');
    console.log(`   - WooCommerce: ${wooSettings?.enabled ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   - WordPress: ${wpSettings?.enabled ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   - Products: ${products.length > 0 ? '✅ Available' : '⚠️ No products'}`);
    console.log(`   - Blog Posts: ${blogs.length > 0 ? '✅ Available' : '⚠️ No posts'}`);
    console.log(`   - Orders: ${orders.length > 0 ? '✅ Available' : '⚠️ No orders'}`);
    
    console.log('\n🎯 Next Steps:');
    if (wooSettings?.enabled && wpSettings?.enabled) {
      console.log('   1. Start backend server: npm run dev');
      console.log('   2. Test API endpoints: /api/woocommerce/test-connection');
      console.log('   3. Test API endpoints: /api/wordpress/test-connection');
      console.log('   4. Visit shop page: /shop');
      console.log('   5. Visit blog page: /blog');
    } else {
      console.log('   1. Configure missing integrations in admin panel');
      console.log('   2. Run setup scripts again');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIntegrations();


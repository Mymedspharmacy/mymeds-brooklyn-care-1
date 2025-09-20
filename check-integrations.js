import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIntegrations() {
  try {
    console.log('🔍 Checking Integration Settings...\n');
    
    // Check WooCommerce settings
    const wooSettings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });
    
    console.log('WooCommerce Settings:');
    console.log(JSON.stringify(wooSettings, null, 2));
    
    // Check WordPress settings
    const wpSettings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });
    
    console.log('\nWordPress Settings:');
    console.log(JSON.stringify(wpSettings, null, 2));
    
    // Check if there are any products
    const productCount = await prisma.product.count();
    console.log(`\nProducts in database: ${productCount}`);
    
    // Check if there are any blog posts
    const blogCount = await prisma.blog.count();
    console.log(`Blog posts in database: ${blogCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIntegrations();

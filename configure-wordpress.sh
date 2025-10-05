#!/bin/bash

echo "🔧 Configuring WordPress settings in database..."

# Navigate to backend directory
cd /var/www/mymeds-pharmacy/backend

# Create a Node.js script to configure WordPress settings
cat > configure-wordpress.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function configureWordPress() {
  try {
    console.log('📝 Configuring WordPress settings...');
    
    // Check if settings exist
    const existingSettings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });
    
    if (existingSettings) {
      console.log('✅ WordPress settings already exist, updating...');
      await prisma.wordPressSettings.update({
        where: { id: 1 },
        data: {
          siteUrl: 'https://mymedspharmacyinc.com/wp-json',
          username: 'admin',
          applicationPassword: 'JSxc hiG4 fv5x zui8 LGzk lpiB',
          enabled: true,
          updatedAt: new Date()
        }
      });
    } else {
      console.log('🆕 Creating new WordPress settings...');
      await prisma.wordPressSettings.create({
        data: {
          id: 1,
          siteUrl: 'https://mymedspharmacyinc.com/wp-json',
          username: 'admin',
          applicationPassword: 'JSxc hiG4 fv5x zui8 LGzk lpiB',
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    console.log('✅ WordPress settings configured successfully!');
    
    // Test the settings
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });
    
    console.log('📋 Current settings:');
    console.log('   Site URL:', settings.siteUrl);
    console.log('   Username:', settings.username);
    console.log('   Enabled:', settings.enabled);
    
  } catch (error) {
    console.error('❌ Error configuring WordPress settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

configureWordPress();
EOF

# Run the configuration script
node configure-wordpress.js

# Clean up
rm configure-wordpress.js

echo "🎉 WordPress configuration completed!"




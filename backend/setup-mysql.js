const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const MYSQL_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'AdminPassword123!', // Match your app's admin password
  port: 3306
};

const DATABASE_NAME = 'mymeds_dev';

async function setupMySQL() {
  console.log('🚀 Setting up MySQL for MyMeds Pharmacy...');
  
  let connection;
  
  try {
    // Connect to MySQL server
    console.log('📡 Connecting to MySQL server...');
    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    console.log(`🗄️ Creating database: ${DATABASE_NAME}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
    console.log(`✅ Database '${DATABASE_NAME}' created/verified`);
    
    // Close connection
    await connection.end();
    
    // Update environment file
    console.log('📝 Updating environment configuration...');
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, 'env.development');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update DATABASE_URL to use MySQL
    envContent = envContent.replace(
      /DATABASE_URL="file:\.\/dev\.db"/,
      `DATABASE_URL="mysql://root:AdminPassword123!@localhost:3306/${DATABASE_NAME}"`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment file updated for MySQL');
    
    // Run Prisma migrations
    console.log('🔄 Running Prisma migrations...');
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ Prisma migrations completed');
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ Prisma client generated');
    
    // Seed database with initial data
    console.log('🌱 Seeding database with initial data...');
    await seedDatabase();
    console.log('✅ Database seeded successfully');
    
    console.log('\n🎉 MySQL setup completed successfully!');
    console.log(`📊 Database: ${DATABASE_NAME}`);
    console.log('🔗 Connection: mysql://root:AdminPassword123!@localhost:3306/mymeds_dev');
    console.log('\n🚀 You can now start your application with MySQL!');
    
  } catch (error) {
    console.error('❌ MySQL setup failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure MySQL is installed and running');
    console.log('2. Check if MySQL is running on port 3306');
    console.log('3. Verify the root password is correct');
    console.log('4. Try running as administrator if needed');
    
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

async function seedDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `mysql://root:AdminPassword123!@localhost:3306/${DATABASE_NAME}`
      }
    }
  });
  
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('AdminPassword123!', 12);
    await prisma.user.upsert({
      where: { email: 'admin@mymeds.dev' },
      update: {},
      create: {
        email: 'admin@mymeds.dev',
        password: adminPassword,
        name: 'Development Admin',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true
      }
    });
    
    // Create categories
    const categories = [
      'Prescription Medications',
      'Over-the-Counter',
      'Health & Wellness',
      'Personal Care'
    ];
    
    for (const categoryName of categories) {
      await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName }
      });
    }
    
    // Create sample products
    const products = [
      {
        name: 'Aspirin 325mg',
        description: 'Pain reliever and fever reducer',
        price: 5.99,
        stock: 100,
        categoryId: 1
      },
      {
        name: 'Ibuprofen 200mg',
        description: 'Anti-inflammatory pain reliever',
        price: 7.99,
        stock: 75,
        categoryId: 2
      },
      {
        name: 'Vitamin D3 1000IU',
        description: 'Supports bone health and immune system',
        price: 12.99,
        stock: 50,
        categoryId: 3
      },
      {
        name: 'Hand Sanitizer',
        description: 'Kills 99.9% of germs',
        price: 3.99,
        stock: 200,
        categoryId: 4
      },
      {
        name: 'Acetaminophen 500mg',
        description: 'Pain reliever and fever reducer',
        price: 4.99,
        stock: 150,
        categoryId: 2
      },
      {
        name: 'Omega-3 Fish Oil',
        description: 'Supports heart and brain health',
        price: 15.99,
        stock: 30,
        categoryId: 3
      },
      {
        name: 'Band-Aids',
        description: 'Adhesive bandages for minor cuts',
        price: 2.99,
        stock: 300,
        categoryId: 4
      },
      {
        name: 'Cough Syrup',
        description: 'Relieves cough and cold symptoms',
        price: 8.99,
        stock: 60,
        categoryId: 2
      },
      {
        name: 'Multivitamin',
        description: 'Daily essential vitamins and minerals',
        price: 18.99,
        stock: 40,
        categoryId: 3
      }
    ];
    
    for (const product of products) {
      await prisma.product.create({
        data: product
      });
    }
    
    console.log('✅ Created admin user, categories, and sample products');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupMySQL().catch(console.error);
}

module.exports = { setupMySQL, seedDatabase };

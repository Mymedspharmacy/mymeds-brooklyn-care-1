import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories first
  const category = await prisma.category.upsert({
    where: { name: 'Vitamins & Supplements' },
    update: {},
    create: {
      name: 'Vitamins & Supplements',
      description: 'Essential vitamins and dietary supplements'
    }
  });

  console.log('✅ Category created:', category.name);

  // Create sample products
  const products = [
    {
      name: 'Vitamin D3 1000 IU',
      description: 'Supports bone health and immune function',
      price: 19.99,
      stock: 100,
      categoryId: category.id
    },
    {
      name: 'Vitamin C 500mg',
      description: 'Powerful antioxidant and immune booster',
      price: 14.99,
      stock: 150,
      categoryId: category.id
    },
    {
      name: 'Omega-3 Fish Oil',
      description: 'Supports heart and brain health',
      price: 24.99,
      stock: 75,
      categoryId: category.id
    }
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData
    });
    console.log('✅ Product created:', product.name);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


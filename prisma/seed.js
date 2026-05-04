const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log('✅ Admin user created (username: admin, password: admin123)');

  // Create batches
  const batch1 = await prisma.batch.create({
    data: {
      batchName: 'Batch-2024-A',
      cropType: 'Ornamental Plants',
      totalProduced: 500,
      deadCrops: 20,
      notes: 'High quality ornamental plants for wedding season',
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      batchName: 'Batch-2024-B',
      cropType: 'Fruit Plants',
      totalProduced: 300,
      deadCrops: 10,
      notes: 'Mango and lemon saplings',
    },
  });

  const batch3 = await prisma.batch.create({
    data: {
      batchName: 'Batch-2024-C',
      cropType: 'Flower Plants',
      totalProduced: 400,
      deadCrops: 15,
      notes: 'Seasonal flowering plants',
    },
  });

  console.log('✅ Batches created');

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Kumar',
      mobileNumber: '9876543210',
      address: '123, Green Park, New Delhi',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Priya Sharma',
      mobileNumber: '9123456789',
      address: '45, Sector 15, Gurgaon',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Amit Patel',
      mobileNumber: '9988776655',
      address: '78, MG Road, Bangalore',
    },
  });

  console.log('✅ Customers created');

  // Create sales
  const sale1 = await prisma.sale.create({
    data: {
      batchId: batch1.id,
      customerId: customer1.id,
      cropQuantity: 50,
      pricePerCrop: 150,
      travelingCost: 200,
      plantationCost: 0,
      totalAmount: 7700,
    },
  });

  const sale2 = await prisma.sale.create({
    data: {
      batchId: batch2.id,
      customerId: customer2.id,
      cropQuantity: 30,
      pricePerCrop: 200,
      travelingCost: 150,
      plantationCost: 100,
      totalAmount: 6250,
    },
  });

  const sale3 = await prisma.sale.create({
    data: {
      batchId: batch3.id,
      customerId: customer3.id,
      cropQuantity: 40,
      pricePerCrop: 120,
      travelingCost: 100,
      plantationCost: 50,
      totalAmount: 4950,
    },
  });

  console.log('✅ Sales recorded');

  // Create workers
  const worker1 = await prisma.worker.create({
    data: {
      name: 'Suresh Yadav',
      mobile: '8765432109',
    },
  });

  const worker2 = await prisma.worker.create({
    data: {
      name: 'Ramesh Kumar',
      mobile: '7654321098',
    },
  });

  console.log('✅ Workers created');

  // Record attendance
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.attendance.create({
    data: {
      workerId: worker1.id,
      date: today,
      workType: 'FULL_DAY',
      extraHours: 2,
      borrowedAmount: 500,
    },
  });

  await prisma.attendance.create({
    data: {
      workerId: worker2.id,
      date: today,
      workType: 'FULL_DAY',
      extraHours: 0,
      borrowedAmount: 0,
    },
  });

  await prisma.attendance.create({
    data: {
      workerId: worker1.id,
      date: yesterday,
      workType: 'HALF_DAY',
      extraHours: 0,
      borrowedAmount: 200,
    },
  });

  console.log('✅ Attendance recorded');

  // Create raw materials
  await prisma.rawMaterial.create({
    data: {
      materialName: 'Organic Soil',
      quantity: 100,
      cost: 5000,
      purchaseDate: new Date(),
      notes: 'High quality organic soil from supplier',
    },
  });

  await prisma.rawMaterial.create({
    data: {
      materialName: 'NPK Fertilizer',
      quantity: 50,
      cost: 3000,
      purchaseDate: new Date(),
      notes: 'Balanced NPK fertilizer',
    },
  });

  await prisma.rawMaterial.create({
    data: {
      materialName: 'Ceramic Pots',
      quantity: 200,
      cost: 4000,
      purchaseDate: new Date(),
      notes: 'Assorted sizes ceramic pots',
    },
  });

  await prisma.rawMaterial.create({
    data: {
      materialName: 'Pesticides',
      quantity: 10,
      cost: 1500,
      purchaseDate: new Date(),
      notes: 'Organic pesticide solution',
    },
  });

  console.log('✅ Raw materials added');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

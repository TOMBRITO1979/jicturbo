const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // 1. Create Super Admin (no tenant)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@jicturbo.com' },
    update: {},
    create: {
      email: 'superadmin@jicturbo.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      active: true,
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // 2. Create Tenant 1
  const tenant1 = await prisma.tenant.upsert({
    where: { domain: 'demo1.jicturbo.com' },
    update: {},
    create: {
      name: 'Demo Company 1',
      domain: 'demo1.jicturbo.com',
      plan: 'Pro',
      active: true,
    },
  });
  console.log('✅ Tenant 1 created:', tenant1.name);

  // 3. Create Admin for Tenant 1
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@demo1.com' },
    update: {},
    create: {
      email: 'admin@demo1.com',
      password: hashedPassword,
      name: 'Admin Demo 1',
      role: 'ADMIN',
      tenantId: tenant1.id,
      active: true,
    },
  });
  console.log('✅ Admin 1 created:', admin1.email);

  // 4. Create User for Tenant 1
  const user1 = await prisma.user.upsert({
    where: { email: 'user@demo1.com' },
    update: {},
    create: {
      email: 'user@demo1.com',
      password: hashedPassword,
      name: 'User Demo 1',
      role: 'USER',
      tenantId: tenant1.id,
      active: true,
      permissions: {
        customers: { view: true, edit: false },
        services: { view: true, edit: false },
      },
    },
  });
  console.log('✅ User 1 created:', user1.email);

  // 5. Create sample customers for Tenant 1
  const customer1 = await prisma.customer.create({
    data: {
      tenantId: tenant1.id,
      fullName: 'João Silva Santos',
      email: 'joao.silva@email.com',
      phone: '(11) 98765-4321',
      whatsapp: '(11) 98765-4321',
      company: 'Silva Consultoria Ltda',
      jobTitle: 'CEO',
      addressCity: 'São Paulo',
      addressState: 'SP',
      potentialLevel: 'Alto',
      satisfactionLevel: 5,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      tenantId: tenant1.id,
      fullName: 'Maria Costa Oliveira',
      email: 'maria.costa@email.com',
      phone: '(21) 99876-5432',
      company: 'Costa Tecnologia',
      jobTitle: 'Diretora de TI',
      addressCity: 'Rio de Janeiro',
      addressState: 'RJ',
      potentialLevel: 'Médio',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      tenantId: tenant1.id,
      fullName: 'Pedro Oliveira Lima',
      email: 'pedro.oliveira@email.com',
      phone: '(31) 97654-3210',
      company: 'Lima Engenharia',
      jobTitle: 'Engenheiro Chefe',
      addressCity: 'Belo Horizonte',
      addressState: 'MG',
      potentialLevel: 'Alto',
    },
  });

  console.log('✅ 3 customers created for Tenant 1');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Super Admin: superadmin@jicturbo.com / password123');
  console.log('Admin 1: admin@demo1.com / password123');
  console.log('User 1: user@demo1.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

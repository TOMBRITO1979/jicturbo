import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

  // 6. Create sample service
  const service1 = await prisma.service.create({
    data: {
      tenantId: tenant1.id,
      customerId: customer1.id,
      name: 'Consultoria Empresarial Completa',
      category: 'Consultoria',
      status: 'Ativo',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-12-31'),
      periodicity: 'Anual',
      totalValue: 60000,
      paymentStatus: 'Em dia',
      completionPercent: 45,
      description: 'Consultoria estratégica para crescimento empresarial',
    },
  });

  const service2 = await prisma.service.create({
    data: {
      tenantId: tenant1.id,
      customerId: customer2.id,
      name: 'Suporte Técnico Mensal',
      category: 'Suporte',
      status: 'Ativo',
      startDate: new Date('2025-02-01'),
      periodicity: 'Mensal',
      totalValue: 5000,
      paymentStatus: 'Em dia',
      completionPercent: 100,
      autoRenewal: true,
    },
  });

  console.log('✅ 2 services created');

  // 7. Create sample events
  const event1 = await prisma.event.create({
    data: {
      tenantId: tenant1.id,
      customerId: customer1.id,
      title: 'Reunião Estratégica - Planejamento Q4',
      type: 'Reunião',
      startDate: new Date('2025-10-25T10:00:00'),
      endDate: new Date('2025-10-25T11:30:00'),
      location: 'Sala de Reuniões - Escritório Central',
      status: 'Agendado',
      priority: 'Alta',
      description: 'Discussão sobre estratégias para o último trimestre',
    },
  });

  const event2 = await prisma.event.create({
    data: {
      tenantId: tenant1.id,
      customerId: customer2.id,
      title: 'Follow-up - Suporte Técnico',
      type: 'Telefonema',
      startDate: new Date('2025-10-24T14:00:00'),
      endDate: new Date('2025-10-24T14:30:00'),
      status: 'Agendado',
      priority: 'Média',
      isTask: true,
      taskStatus: 'Pendente',
    },
  });

  console.log('✅ 2 events created');

  // 8. Create sample financial records
  const financial1 = await prisma.financial.create({
    data: {
      tenantId: tenant1.id,
      customerId: customer1.id,
      totalContracted: 60000,
      totalPaid: 27000,
      totalOutstanding: 33000,
      isDefaulter: false,
    },
  });

  console.log('✅ 1 financial record created');

  // 9. Create sample invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      tenantId: tenant1.id,
      customerId: customer1.id,
      serviceId: service1.id,
      invoiceNumber: 'INV-2025-001',
      amount: 60000,
      dueDate: new Date('2025-11-15'),
      status: 'Em Aberto',
      isInstallment: true,
      totalInstallments: 12,
      installmentNumber: 1,
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      tenantId: tenant1.id,
      customerId: customer2.id,
      serviceId: service2.id,
      invoiceNumber: 'INV-2025-002',
      amount: 5000,
      dueDate: new Date('2025-11-01'),
      status: 'Pago',
      paymentDate: new Date('2025-10-20'),
      paidAmount: 5000,
    },
  });

  console.log('✅ 2 invoices created');

  // 10. Create sample project
  const project1 = await prisma.project.create({
    data: {
      tenantId: tenant1.id,
      customerId: customer3.id,
      name: 'Implementação Sistema de Gestão Integrado',
      type: 'Projeto',
      status: 'Em Progresso',
      startDate: new Date('2025-09-01'),
      estimatedEndDate: new Date('2025-12-31'),
      completionPercent: 65,
      currentStage: 'Execução',
      priority: 'Alta',
      description: 'Sistema completo de gestão empresarial integrado',
    },
  });

  // Create project tasks
  await prisma.projectTask.createMany({
    data: [
      {
        projectId: project1.id,
        name: 'Análise de Requisitos',
        status: 'Concluída',
        description: 'Levantamento completo de requisitos do cliente',
      },
      {
        projectId: project1.id,
        name: 'Desenvolvimento do Backend',
        status: 'Em Progresso',
        description: 'Desenvolvimento da API e regras de negócio',
      },
      {
        projectId: project1.id,
        name: 'Desenvolvimento do Frontend',
        status: 'Pendente',
        description: 'Interface do usuário e integração com API',
      },
    ],
  });

  console.log('✅ 1 project with 3 tasks created');

  // 11. Create Tenant 2 (for testing multi-tenancy)
  const tenant2 = await prisma.tenant.upsert({
    where: { domain: 'demo2.jicturbo.com' },
    update: {},
    create: {
      name: 'Demo Company 2',
      domain: 'demo2.jicturbo.com',
      plan: 'Basic',
      active: true,
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'admin@demo2.com' },
    update: {},
    create: {
      email: 'admin@demo2.com',
      password: hashedPassword,
      name: 'Admin Demo 2',
      role: 'ADMIN',
      tenantId: tenant2.id,
      active: true,
    },
  });

  console.log('✅ Tenant 2 created:', tenant2.name);
  console.log('✅ Admin 2 created:', admin2.email);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Super Admin: superadmin@jicturbo.com / password123');
  console.log('Admin 1: admin@demo1.com / password123');
  console.log('User 1: user@demo1.com / password123');
  console.log('Admin 2: admin@demo2.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

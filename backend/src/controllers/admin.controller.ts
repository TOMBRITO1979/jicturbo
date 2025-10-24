import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { hashPassword } from '../utils/password';

/**
 * Get all tenants (SUPER_ADMIN only)
 * GET /api/admin/tenants
 */
export const getAllTenants = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Super Admins podem acessar.', 403);
  }

  const { search, active } = req.query;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { domain: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (active !== undefined) {
    where.active = active === 'true';
  }

  const tenants = await prisma.tenant.findMany({
    where,
    include: {
      _count: {
        select: {
          users: true,
          customers: true,
          services: true,
          projects: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: { tenants },
  });
});

/**
 * Get single tenant (SUPER_ADMIN only)
 * GET /api/admin/tenants/:id
 */
export const getTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Super Admins podem acessar.', 403);
  }

  const { id } = req.params;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          customers: true,
          services: true,
          projects: true,
          invoices: true,
        },
      },
    },
  });

  if (!tenant) {
    throw new AppError('Empresa não encontrada', 404);
  }

  res.json({
    success: true,
    data: { tenant },
  });
});

/**
 * Create new tenant (SUPER_ADMIN only)
 * POST /api/admin/tenants
 */
export const createTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Super Admins podem acessar.', 403);
  }

  const { name, domain, plan, adminEmail, adminPassword, adminName } = req.body;

  // Validate required fields
  if (!name) {
    throw new AppError('Nome da empresa é obrigatório', 400);
  }

  if (!adminEmail || !adminPassword || !adminName) {
    throw new AppError('Dados do administrador são obrigatórios', 400);
  }

  // Check if domain already exists
  if (domain) {
    const existingTenant = await prisma.tenant.findUnique({
      where: { domain },
    });
    if (existingTenant) {
      throw new AppError('Este domínio já está sendo usado', 400);
    }
  }

  // Check if admin email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (existingUser) {
    throw new AppError('Este email já está cadastrado', 400);
  }

  // Hash admin password
  const hashedPassword = await hashPassword(adminPassword);

  // Create tenant and admin user in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create tenant
    const tenant = await tx.tenant.create({
      data: {
        name,
        domain: domain || null,
        plan: plan || 'Basic',
        active: true,
      },
    });

    // Create admin user for this tenant
    const adminUser = await tx.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        tenantId: tenant.id,
        active: true,
      },
    });

    return { tenant, adminUser };
  });

  res.status(201).json({
    success: true,
    data: { tenant: result.tenant, admin: result.adminUser },
    message: 'Empresa criada com sucesso',
  });
});

/**
 * Update tenant (SUPER_ADMIN only)
 * PUT /api/admin/tenants/:id
 */
export const updateTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Super Admins podem acessar.', 403);
  }

  const { id } = req.params;
  const { name, domain, plan, active } = req.body;

  // Check if tenant exists
  const existingTenant = await prisma.tenant.findUnique({
    where: { id },
  });

  if (!existingTenant) {
    throw new AppError('Empresa não encontrada', 404);
  }

  // Check if domain is being changed and if it's already in use
  if (domain && domain !== existingTenant.domain) {
    const domainInUse = await prisma.tenant.findUnique({
      where: { domain },
    });
    if (domainInUse) {
      throw new AppError('Este domínio já está sendo usado', 400);
    }
  }

  // Clean data
  const cleanData: any = {};
  if (name !== undefined) cleanData.name = name;
  if (domain !== undefined) cleanData.domain = domain || null;
  if (plan !== undefined) cleanData.plan = plan;
  if (active !== undefined) cleanData.active = active;

  const tenant = await prisma.tenant.update({
    where: { id },
    data: cleanData,
  });

  res.json({
    success: true,
    data: { tenant },
    message: 'Empresa atualizada com sucesso',
  });
});

/**
 * Delete tenant (SUPER_ADMIN only)
 * DELETE /api/admin/tenants/:id
 */
export const deleteTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Super Admins podem acessar.', 403);
  }

  const { id } = req.params;

  // Check if tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          customers: true,
          services: true,
        },
      },
    },
  });

  if (!tenant) {
    throw new AppError('Empresa não encontrada', 404);
  }

  // Prevent deletion if tenant has data (optional - can be removed if you want cascade delete)
  if (tenant._count.customers > 0 || tenant._count.services > 0) {
    throw new AppError(
      'Não é possível excluir empresa com dados cadastrados. Desative a empresa ao invés de excluir.',
      400
    );
  }

  // Delete tenant (will cascade delete all related data)
  await prisma.tenant.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Empresa excluída com sucesso',
  });
});

/**
 * Get all users of a specific tenant (SUPER_ADMIN only)
 * GET /api/admin/tenants/:id/users
 */
export const getTenantUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Super Admins podem acessar.', 403);
  }

  const { id } = req.params;

  // Check if tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id },
  });

  if (!tenant) {
    throw new AppError('Empresa não encontrada', 404);
  }

  const users = await prisma.user.findMany({
    where: { tenantId: id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      permissions: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: { users },
  });
});

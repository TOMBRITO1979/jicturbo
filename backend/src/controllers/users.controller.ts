import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { hashPassword } from '../utils/password';

/**
 * Get all users of current tenant (ADMIN only)
 * GET /api/users
 */
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Não autorizado', 401);
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Admins podem acessar.', 403);
  }

  const { search, role, active } = req.query;

  const where: any = {};

  // Super Admin can see all users, Admin only their tenant
  if (req.user.role === 'ADMIN') {
    where.tenantId = req.user.tenantId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (active !== undefined) {
    where.active = active === 'true';
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      permissions: true,
      tenantId: true,
      tenant: {
        select: {
          id: true,
          name: true,
        },
      },
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

/**
 * Get single user (ADMIN only)
 * GET /api/users/:id
 */
export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Não autorizado', 401);
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Admins podem acessar.', 403);
  }

  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      permissions: true,
      tenantId: true,
      tenant: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  // Admin can only see users from their tenant
  if (req.user.role === 'ADMIN' && user.tenantId !== req.user.tenantId) {
    throw new AppError('Acesso negado', 403);
  }

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * Create new user in tenant (ADMIN only)
 * POST /api/users
 */
export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Não autorizado', 401);
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Admins podem criar usuários.', 403);
  }

  const { email, password, name, role, permissions } = req.body;

  // Validate required fields
  if (!email || !password || !name) {
    throw new AppError('Email, senha e nome são obrigatórios', 400);
  }

  // Admins can only create USER role
  if (req.user.role === 'ADMIN' && role && role !== 'USER') {
    throw new AppError('Admins só podem criar usuários com role USER', 400);
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new AppError('Este email já está cadastrado', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'USER',
      tenantId: req.user.tenantId!,
      permissions: permissions || null,
      active: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      permissions: true,
      createdAt: true,
    },
  });

  res.status(201).json({
    success: true,
    data: { user },
    message: 'Usuário criado com sucesso',
  });
});

/**
 * Update user (ADMIN only)
 * PUT /api/users/:id
 */
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Não autorizado', 401);
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Admins podem atualizar usuários.', 403);
  }

  const { id } = req.params;
  const { name, email, role, permissions, active, password } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError('Usuário não encontrado', 404);
  }

  // Admin can only update users from their tenant
  if (req.user.role === 'ADMIN' && existingUser.tenantId !== req.user.tenantId) {
    throw new AppError('Acesso negado', 403);
  }

  // Admins cannot change role to ADMIN or SUPER_ADMIN
  if (req.user.role === 'ADMIN' && role && role !== 'USER') {
    throw new AppError('Admins não podem alterar role para ADMIN ou SUPER_ADMIN', 400);
  }

  // Prevent user from deactivating themselves
  if (id === req.user.userId && active === false) {
    throw new AppError('Você não pode desativar sua própria conta', 400);
  }

  // Check if email is being changed and if it's already in use
  if (email && email !== existingUser.email) {
    const emailInUse = await prisma.user.findUnique({
      where: { email },
    });
    if (emailInUse) {
      throw new AppError('Este email já está sendo usado', 400);
    }
  }

  // Clean data
  const cleanData: any = {};
  if (name !== undefined) cleanData.name = name;
  if (email !== undefined) cleanData.email = email;
  if (role !== undefined) cleanData.role = role;
  if (permissions !== undefined) cleanData.permissions = permissions;
  if (active !== undefined) cleanData.active = active;
  if (password) {
    cleanData.password = await hashPassword(password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: cleanData,
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
  });

  res.json({
    success: true,
    data: { user },
    message: 'Usuário atualizado com sucesso',
  });
});

/**
 * Delete user (ADMIN only)
 * DELETE /api/users/:id
 */
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Não autorizado', 401);
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Acesso negado. Apenas Admins podem excluir usuários.', 403);
  }

  const { id } = req.params;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  // Admin can only delete users from their tenant
  if (req.user.role === 'ADMIN' && user.tenantId !== req.user.tenantId) {
    throw new AppError('Acesso negado', 403);
  }

  // Prevent user from deleting themselves
  if (id === req.user.userId) {
    throw new AppError('Você não pode excluir sua própria conta', 400);
  }

  // Prevent deleting other ADMINs if you're an ADMIN
  if (req.user.role === 'ADMIN' && user.role === 'ADMIN') {
    throw new AppError('Admins não podem excluir outros Admins', 400);
  }

  // Delete user
  await prisma.user.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Usuário excluído com sucesso',
  });
});

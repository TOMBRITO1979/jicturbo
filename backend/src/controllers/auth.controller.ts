import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateResetToken } from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/email';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Generate a unique API token
 */
const generateApiToken = (): string => {
  return `jic_${crypto.randomBytes(32).toString('hex')}`;
};

/**
 * Register new user and create tenant
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, tenantName, role } = req.body;

  // Validate input
  if (!email || !password || !name) {
    throw new AppError('Email, password and name are required', 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user and tenant in transaction
  const result = await prisma.$transaction(async (tx) => {
    let tenant = null;
    let userRole = role || 'USER';
    let userTenantId = null;

    // If tenantName provided, create new tenant and make user ADMIN
    if (tenantName) {
      tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          active: true,
        },
      });
      userRole = 'ADMIN';
      userTenantId = tenant.id;
    }

    // Create user
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole as any,
        tenantId: userTenantId,
        active: true,
      },
    });

    return { user, tenant };
  });

  // Generate JWT token
  const token = generateToken({
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role,
    tenantId: result.user.tenantId,
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        tenantId: result.user.tenantId,
      },
      tenant: result.tenant,
      token,
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.active) {
    throw new AppError('Account is deactivated', 403);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant,
      },
      token,
    },
  });
});

/**
 * Request password reset
 * POST /api/auth/request-password-reset
 */
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    res.json({
      success: true,
      message: 'If the email exists, a reset link will be sent',
    });
    return;
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Save token to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  // Send email
  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (error) {
    console.error('Failed to send reset email:', error);
    // Don't throw error to prevent email enumeration
  }

  res.json({
    success: true,
    message: 'If the email exists, a reset link will be sent',
  });
});

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400);
  }

  // Find user with valid token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  res.json({
    success: true,
    message: 'Password reset successful',
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { tenant: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * Regenerate API token
 * POST /api/auth/regenerate-token
 */
export const regenerateApiToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  // Generate new unique token
  let newToken = generateApiToken();

  // Ensure uniqueness - retry if token already exists
  let existingUser = await prisma.user.findUnique({ where: { apiToken: newToken } });
  while (existingUser) {
    newToken = generateApiToken();
    existingUser = await prisma.user.findUnique({ where: { apiToken: newToken } });
  }

  // Update user with new token
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: { apiToken: newToken },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      apiToken: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: { user },
    message: 'API token regenerated successfully',
  });
});

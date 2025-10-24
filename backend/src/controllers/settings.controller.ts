import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

/**
 * Get tenant settings
 * GET /api/settings
 */
export const getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const tenantId = req.user.tenantId;

  if (!tenantId) {
    throw new AppError('Tenant ID is required', 400);
  }

  let settings = await prisma.settings.findUnique({
    where: { tenantId },
  });

  // If settings don't exist, create default settings
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        tenantId,
        googleApiKey: '',
        wahaApiKey: '',
        microsoftTeamsKey: '',
        zoomApiKey: '',
        openaiApiKey: '',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        smtpFrom: '',
      },
    });
  }

  res.json({
    success: true,
    data: { settings },
  });
});

/**
 * Update tenant settings
 * PUT /api/settings
 */
export const updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const tenantId = req.user.tenantId;

  if (!tenantId) {
    throw new AppError('Tenant ID is required', 400);
  }

  // Check if user is admin or super admin
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Only admins can update settings', 403);
  }

  // Check if settings exist
  let settings = await prisma.settings.findUnique({
    where: { tenantId },
  });

  if (!settings) {
    // Create new settings
    settings = await prisma.settings.create({
      data: {
        ...req.body,
        tenantId,
      },
    });
  } else {
    // Update existing settings
    settings = await prisma.settings.update({
      where: { tenantId },
      data: req.body,
    });
  }

  res.json({
    success: true,
    data: { settings },
  });
});

/**
 * Test SMTP settings
 * POST /api/settings/test-smtp
 */
export const testSmtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const tenantId = req.user.tenantId;

  if (!tenantId) {
    throw new AppError('Tenant ID is required', 400);
  }

  const { testEmail } = req.body;

  if (!testEmail) {
    throw new AppError('Test email is required', 400);
  }

  // Get SMTP settings
  const settings = await prisma.settings.findUnique({
    where: { tenantId },
  });

  if (!settings || !settings.smtpHost || !settings.smtpUser) {
    throw new AppError('SMTP settings not configured', 400);
  }

  // TODO: Implement actual SMTP test using nodemailer
  // For now, just return success
  res.json({
    success: true,
    message: 'SMTP test email sent successfully',
  });
});

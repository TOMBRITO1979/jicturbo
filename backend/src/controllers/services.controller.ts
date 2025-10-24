import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

/**
 * Get all services with pagination and search
 * GET /api/services
 */
export const getServices = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { page = 1, limit = 10, search = '', customerId = '' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const tenantFilter = getTenantFilter(req.user);

  const where: any = {
    ...tenantFilter,
  };

  // Filter by customer if provided
  if (customerId) {
    where.customerId = customerId as string;
  }

  // Search across multiple fields
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { serviceCode: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.service.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/**
 * Get single service by ID
 * GET /api/services/:id
 */
export const getServiceById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  const service = await prisma.service.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  res.json({
    success: true,
    data: { service },
  });
});

/**
 * Create new service
 * POST /api/services
 */
export const createService = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  // Super admin must provide tenantId
  if (req.user.role === 'SUPER_ADMIN' && !req.body.tenantId) {
    throw new AppError('Tenant ID is required for super admin', 400);
  }

  const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;

  if (!tenantId) {
    throw new AppError('Tenant ID is required', 400);
  }

  // Clean data - remove empty strings and convert dates
  const cleanData: any = {};
  Object.keys(req.body).forEach(key => {
    const value = req.body[key];
    // Skip empty strings, null, undefined
    if (value === '' || value === null || value === undefined) {
      return;
    }
    // Convert date strings to DateTime
    if ((key === 'contractDate' || key === 'startDate' || key === 'endDate') && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const service = await prisma.service.create({
    data: {
      ...cleanData,
      tenantId,
    },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: { service },
  });
});

/**
 * Update service
 * PUT /api/services/:id
 */
export const updateService = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if service exists and belongs to user's tenant
  const existingService = await prisma.service.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingService) {
    throw new AppError('Service not found', 404);
  }

  // Remove tenantId from body to prevent changing it
  const { tenantId, ...bodyData } = req.body;

  // Clean data - remove empty strings and convert dates
  const cleanData: any = {};
  Object.keys(bodyData).forEach(key => {
    const value = bodyData[key];
    // Skip empty strings, null, undefined
    if (value === '' || value === null || value === undefined) {
      return;
    }
    // Convert date strings to DateTime
    if ((key === 'contractDate' || key === 'startDate' || key === 'endDate') && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const service = await prisma.service.update({
    where: { id },
    data: cleanData,
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: { service },
  });
});

/**
 * Delete service
 * DELETE /api/services/:id
 */
export const deleteService = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if service exists and belongs to user's tenant
  const existingService = await prisma.service.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingService) {
    throw new AppError('Service not found', 404);
  }

  await prisma.service.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Service deleted successfully',
  });
});

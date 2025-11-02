import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

/**
 * Get all customers with pagination and search
 * GET /api/customers
 */
export const getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const tenantFilter = getTenantFilter(req.user);

  const where: any = {
    ...tenantFilter,
  };

  // Search across multiple fields
  if (search) {
    where.OR = [
      { fullName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string, mode: 'insensitive' } },
      { company: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      customers,
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
 * Get single customer by ID
 * GET /api/customers/:id
 */
export const getCustomerById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  const customer = await prisma.customer.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  res.json({
    success: true,
    data: { customer },
  });
});

/**
 * Create new customer
 * POST /api/customers
 */
export const createCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }


    // Use tenantId from body if provided (for SUPER_ADMIN), otherwise use user's tenantId
  const tenantId = req.body.tenantId || req.user.tenantId;

  if (!tenantId) {
    throw new AppError('Tenant ID is required', 400);
  }

  // Clean data - remove empty strings and convert dates
  const cleanData: any = {};
  Object.keys(req.body).forEach(key => {
    const value = req.body[key];
    // Skip empty strings
    if (value === '' || value === null || value === undefined) {
      return;
    }
    // Convert date strings to DateTime
    if (key === 'birthDate' && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const customer = await prisma.customer.create({
    data: {
      ...cleanData,
      tenantId,
    },
  });

  res.status(201).json({
    success: true,
    data: { customer },
  });
});

/**
 * Update customer
 * PUT /api/customers/:id
 */
export const updateCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if customer exists and belongs to user's tenant
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingCustomer) {
    throw new AppError('Customer not found', 404);
  }

  // Remove tenantId from body to prevent changing it
  const { tenantId, ...bodyData } = req.body;

  // Clean data - remove empty strings and convert dates
  const cleanData: any = {};
  Object.keys(bodyData).forEach(key => {
    const value = bodyData[key];
    // Skip empty strings
    if (value === '' || value === null || value === undefined) {
      return;
    }
    // Convert date strings to DateTime
    if (key === 'birthDate' && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const customer = await prisma.customer.update({
    where: { id },
    data: cleanData,
  });

  res.json({
    success: true,
    data: { customer },
  });
});

/**
 * Delete customer
 * DELETE /api/customers/:id
 */
export const deleteCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if customer exists and belongs to user's tenant
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingCustomer) {
    throw new AppError('Customer not found', 404);
  }

  await prisma.customer.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Customer deleted successfully',
  });
});

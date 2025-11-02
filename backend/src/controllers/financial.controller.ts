import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

/**
 * Get all financials with pagination
 * GET /api/financial
 */
export const getFinancials = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { page = 1, limit = 10, customerId = '' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const tenantFilter = getTenantFilter(req.user);

  const where: any = {
    ...tenantFilter,
  };

  if (customerId) {
    where.customerId = customerId as string;
  }

  const [financials, total] = await Promise.all([
    prisma.financial.findMany({
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
    prisma.financial.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      financials,
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
 * Get all invoices with pagination and filters
 * GET /api/financial/invoices
 */
export const getInvoices = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { page = 1, limit = 10, customerId = '', status = '' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const tenantFilter = getTenantFilter(req.user);

  const where: any = {
    ...tenantFilter,
  };

  if (customerId) {
    where.customerId = customerId as string;
  }

  if (status) {
    where.status = status as string;
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
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
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      invoices,
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
 * Get single invoice by ID
 * GET /api/financial/invoices/:id
 */
export const getInvoiceById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
    include: {
      customer: true,
      service: true,
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  res.json({
    success: true,
    data: { invoice },
  });
});

/**
 * Create new invoice
 * POST /api/financial/invoices
 */
export const createInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
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
    // Skip empty strings, null, undefined
    if (value === '' || value === null || value === undefined) {
      return;
    }
    // Convert date strings to DateTime
    if ((key === 'issueDate' || key === 'dueDate' || key === 'paymentDate') && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const invoice = await prisma.invoice.create({
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
      service: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: { invoice },
  });
});

/**
 * Update invoice
 * PUT /api/financial/invoices/:id
 */
export const updateInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if invoice exists and belongs to user's tenant
  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingInvoice) {
    throw new AppError('Invoice not found', 404);
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
    if ((key === 'issueDate' || key === 'dueDate' || key === 'paymentDate') && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const invoice = await prisma.invoice.update({
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
      service: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: { invoice },
  });
});

/**
 * Delete invoice
 * DELETE /api/financial/invoices/:id
 */
export const deleteInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if invoice exists and belongs to user's tenant
  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingInvoice) {
    throw new AppError('Invoice not found', 404);
  }

  await prisma.invoice.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Invoice deleted successfully',
  });
});

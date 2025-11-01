import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

/**
 * Get all cash flows with pagination and filters
 * GET /api/cashflow
 */
export const getCashFlows = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const {
    page = 1,
    limit = 50,
    type = '',
    category = '',
    status = '',
    startDate = '',
    endDate = '',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const tenantFilter = getTenantFilter(req.user);

  const where: any = {
    ...tenantFilter,
  };

  if (type) {
    where.type = type as string;
  }

  if (category) {
    where.category = category as string;
  }

  if (status) {
    where.status = status as string;
  }

  // Date range filter
  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) {
      where.transactionDate.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.transactionDate.lte = new Date(endDate as string);
    }
  }

  const [cashFlows, total] = await Promise.all([
    prisma.cashFlow.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { transactionDate: 'desc' },
    }),
    prisma.cashFlow.count({ where }),
  ]);

  // Calculate totals
  const totals = await prisma.cashFlow.groupBy({
    by: ['type'],
    where,
    _sum: {
      amount: true,
    },
  });

  const summary = {
    income: totals.find((t) => t.type === 'Entrada')?._sum.amount || 0,
    expense: totals.find((t) => t.type === 'Saída')?._sum.amount || 0,
  };

  summary.balance = Number(summary.income) - Number(summary.expense);

  res.json({
    success: true,
    data: {
      cashFlows,
      summary,
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
 * Get cash flow by ID
 * GET /api/cashflow/:id
 */
export const getCashFlowById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  const cashFlow = await prisma.cashFlow.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!cashFlow) {
    throw new AppError('Lançamento não encontrado', 404);
  }

  res.json({
    success: true,
    data: cashFlow,
  });
});

/**
 * Create cash flow
 * POST /api/cashflow
 */
export const createCashFlow = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const {
    type,
    transactionDate,
    amount,
    category,
    subcategory,
    description,
    referenceNumber,
    paymentMethod,
    bankAccount,
    customerId,
    invoiceId,
    projectId,
    status,
    approvedBy,
    approvedAt,
    isRecurring,
    recurringInterval,
    nextOccurrence,
    notes,
    attachments,
    reconciled,
    reconciledAt,
    reconciledBy,
  } = req.body;

  // Validation
  if (!type || !transactionDate || !amount || !category || !description) {
    throw new AppError('Campos obrigatórios: type, transactionDate, amount, category, description', 400);
  }

  const cashFlow = await prisma.cashFlow.create({
    data: {
      tenantId: req.user.tenantId || '',
      type,
      transactionDate: new Date(transactionDate),
      amount,
      category,
      subcategory,
      description,
      referenceNumber,
      paymentMethod,
      bankAccount,
      customerId,
      invoiceId,
      projectId,
      status: status || 'Confirmado',
      approvedBy,
      approvedAt: approvedAt ? new Date(approvedAt) : undefined,
      isRecurring: isRecurring || false,
      recurringInterval,
      nextOccurrence: nextOccurrence ? new Date(nextOccurrence) : undefined,
      notes,
      attachments,
      reconciled: reconciled || false,
      reconciledAt: reconciledAt ? new Date(reconciledAt) : undefined,
      reconciledBy,
    },
  });

  res.status(201).json({
    success: true,
    data: cashFlow,
  });
});

/**
 * Update cash flow
 * PUT /api/cashflow/:id
 */
export const updateCashFlow = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if cash flow exists and belongs to user's tenant
  const existing = await prisma.cashFlow.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existing) {
    throw new AppError('Lançamento não encontrado', 404);
  }

  const {
    type,
    transactionDate,
    amount,
    category,
    subcategory,
    description,
    referenceNumber,
    paymentMethod,
    bankAccount,
    customerId,
    invoiceId,
    projectId,
    status,
    approvedBy,
    approvedAt,
    isRecurring,
    recurringInterval,
    nextOccurrence,
    notes,
    attachments,
    reconciled,
    reconciledAt,
    reconciledBy,
  } = req.body;

  const cashFlow = await prisma.cashFlow.update({
    where: { id },
    data: {
      ...(type && { type }),
      ...(transactionDate && { transactionDate: new Date(transactionDate) }),
      ...(amount !== undefined && { amount }),
      ...(category && { category }),
      ...(subcategory !== undefined && { subcategory }),
      ...(description && { description }),
      ...(referenceNumber !== undefined && { referenceNumber }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(bankAccount !== undefined && { bankAccount }),
      ...(customerId !== undefined && { customerId }),
      ...(invoiceId !== undefined && { invoiceId }),
      ...(projectId !== undefined && { projectId }),
      ...(status && { status }),
      ...(approvedBy !== undefined && { approvedBy }),
      ...(approvedAt !== undefined && { approvedAt: approvedAt ? new Date(approvedAt) : null }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(recurringInterval !== undefined && { recurringInterval }),
      ...(nextOccurrence !== undefined && { nextOccurrence: nextOccurrence ? new Date(nextOccurrence) : null }),
      ...(notes !== undefined && { notes }),
      ...(attachments !== undefined && { attachments }),
      ...(reconciled !== undefined && { reconciled }),
      ...(reconciledAt !== undefined && { reconciledAt: reconciledAt ? new Date(reconciledAt) : null }),
      ...(reconciledBy !== undefined && { reconciledBy }),
    },
  });

  res.json({
    success: true,
    data: cashFlow,
  });
});

/**
 * Delete cash flow
 * DELETE /api/cashflow/:id
 */
export const deleteCashFlow = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if cash flow exists and belongs to user's tenant
  const existing = await prisma.cashFlow.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existing) {
    throw new AppError('Lançamento não encontrado', 404);
  }

  await prisma.cashFlow.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Lançamento excluído com sucesso',
  });
});

/**
 * Get cash flow summary/analytics
 * GET /api/cashflow/analytics
 */
export const getCashFlowAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { startDate = '', endDate = '' } = req.query;
  const tenantFilter = getTenantFilter(req.user);

  const where: any = {
    ...tenantFilter,
  };

  // Date range filter
  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) {
      where.transactionDate.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.transactionDate.lte = new Date(endDate as string);
    }
  }

  // Get totals by type
  const totals = await prisma.cashFlow.groupBy({
    by: ['type'],
    where,
    _sum: {
      amount: true,
    },
  });

  // Get totals by category
  const byCategory = await prisma.cashFlow.groupBy({
    by: ['category', 'type'],
    where,
    _sum: {
      amount: true,
    },
  });

  // Get totals by payment method
  const byPaymentMethod = await prisma.cashFlow.groupBy({
    by: ['paymentMethod'],
    where: {
      ...where,
      paymentMethod: { not: null },
    },
    _sum: {
      amount: true,
    },
  });

  const income = totals.find((t) => t.type === 'Entrada')?._sum.amount || 0;
  const expense = totals.find((t) => t.type === 'Saída')?._sum.amount || 0;
  const balance = Number(income) - Number(expense);

  res.json({
    success: true,
    data: {
      summary: {
        income,
        expense,
        balance,
      },
      byCategory,
      byPaymentMethod,
    },
  });
});

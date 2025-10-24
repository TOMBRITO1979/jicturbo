import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

/**
 * Get dashboard summary
 * GET /api/reports/dashboard
 */
export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const tenantFilter = getTenantFilter(req.user);

  const [
    totalCustomers,
    totalServices,
    totalProjects,
    totalInvoices,
    totalRevenue,
    pendingInvoices,
    upcomingEvents,
  ] = await Promise.all([
    prisma.customer.count({ where: tenantFilter }),
    prisma.service.count({ where: tenantFilter }),
    prisma.project.count({ where: tenantFilter }),
    prisma.invoice.count({ where: tenantFilter }),
    prisma.invoice.aggregate({
      where: { ...tenantFilter, status: 'Pago' },
      _sum: { amount: true },
    }),
    prisma.invoice.count({ where: { ...tenantFilter, status: 'Em Aberto' } }),
    prisma.event.count({
      where: {
        ...tenantFilter,
        startDate: { gte: new Date() },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalCustomers,
      totalServices,
      totalProjects,
      totalInvoices,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      pendingInvoices,
      upcomingEvents,
    },
  });
});

/**
 * Get sales report
 * GET /api/reports/sales
 */
export const getSalesReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { startDate, endDate } = req.query;
  const tenantFilter = getTenantFilter(req.user);

  const where: any = { ...tenantFilter };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string);
    }
  }

  const [services, invoices] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.findMany({
      where: { ...where, status: 'Pago' },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    }),
  ]);

  const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const totalContracts = services.reduce((sum, service) => sum + Number(service.totalValue || 0), 0);

  res.json({
    success: true,
    data: {
      services,
      invoices,
      totalRevenue,
      totalContracts,
      totalServices: services.length,
      totalInvoices: invoices.length,
    },
  });
});

/**
 * Get customers report
 * GET /api/reports/customers
 */
export const getCustomersReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const tenantFilter = getTenantFilter(req.user);

  const customers = await prisma.customer.findMany({
    where: tenantFilter,
    include: {
      services: {
        select: {
          id: true,
          name: true,
          totalValue: true,
        },
      },
      _count: {
        select: { services: true, events: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: {
      customers,
      totalCustomers: customers.length,
    },
  });
});

/**
 * Get projects report
 * GET /api/reports/projects
 */
export const getProjectsReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const tenantFilter = getTenantFilter(req.user);

  const [projects, statusCount] = await Promise.all([
    prisma.project.findMany({
      where: tenantFilter,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.groupBy({
      by: ['status'],
      where: tenantFilter,
      _count: true,
    }),
  ]);

  res.json({
    success: true,
    data: {
      projects,
      totalProjects: projects.length,
      statusCount,
    },
  });
});

/**
 * Get financial report
 * GET /api/reports/financial
 */
export const getFinancialReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { startDate, endDate } = req.query;
  const tenantFilter = getTenantFilter(req.user);

  const where: any = { ...tenantFilter };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string);
    }
  }

  const [invoices, statusCount, totalRevenue, totalPending] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { ...where, status: 'Pago' },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: { ...where, status: 'Em Aberto' },
      _sum: { amount: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      invoices,
      totalInvoices: invoices.length,
      statusCount,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalPending: Number(totalPending._sum.amount || 0),
    },
  });
});

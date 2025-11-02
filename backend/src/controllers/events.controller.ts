import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

/**
 * Get all events with pagination and filters
 * GET /api/events
 */
export const getEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const {
    page = 1,
    limit = 10,
    search = '',
    customerId = '',
    startDate = '',
    endDate = '',
    type = '',
    status = ''
  } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const tenantFilter = getTenantFilter(req.user);

  const where: any = {
    ...tenantFilter,
  };

  // Filter by customer if provided
  if (customerId) {
    where.customerId = customerId as string;
  }

  // Filter by date range
  if (startDate || endDate) {
    where.startDate = {};
    if (startDate) {
      where.startDate.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.startDate.lte = new Date(endDate as string);
    }
  }

  // Filter by type
  if (type) {
    where.type = type as string;
  }

  // Filter by status
  if (status) {
    where.status = status as string;
  }

  // Search across multiple fields
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { location: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { startDate: 'desc' },
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
    prisma.event.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      events,
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
 * Get single event by ID
 * GET /api/events/:id
 */
export const getEventById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  const event = await prisma.event.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
    include: {
      customer: true,
    },
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  res.json({
    success: true,
    data: { event },
  });
});

/**
 * Create new event
 * POST /api/events
 */
export const createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }


    // Use tenantId from body if provided (for SUPER_ADMIN), otherwise use user's tenantId
  const tenantId = req.body.tenantId || req.user.tenantId;

  if (!tenantId) {
    throw new AppError('Tenant ID is required', 400);
  }

  // If no responsibleId provided, assign to current user
  if (!req.body.responsibleId) {
    req.body.responsibleId = req.user.userId;
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
    if ((key === 'startDate' || key === 'endDate') && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const event = await prisma.event.create({
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
    data: { event },
  });
});

/**
 * Update event
 * PUT /api/events/:id
 */
export const updateEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if event exists and belongs to user's tenant
  const existingEvent = await prisma.event.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingEvent) {
    throw new AppError('Event not found', 404);
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
    if ((key === 'startDate' || key === 'endDate') && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const event = await prisma.event.update({
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
    data: { event },
  });
});

/**
 * Delete event
 * DELETE /api/events/:id
 */
export const deleteEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if event exists and belongs to user's tenant
  const existingEvent = await prisma.event.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingEvent) {
    throw new AppError('Event not found', 404);
  }

  await prisma.event.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
});

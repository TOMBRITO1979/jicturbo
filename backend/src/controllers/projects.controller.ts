import { Response } from 'express';
import prisma from '../database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

/**
 * Get all projects with pagination and filters
 * GET /api/projects
 */
export const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
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
        _count: {
          select: { tasks: true },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      projects,
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
 * Get single project by ID with tasks
 * GET /api/projects/:id
 */
export const getProjectById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
    include: {
      customer: true,
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  res.json({
    success: true,
    data: { project },
  });
});

/**
 * Create new project
 * POST /api/projects
 */
export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
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
    if ((key === 'startDate' || key === 'estimatedEndDate' || key === 'actualEndDate' || key === 'lastUpdate') && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const project = await prisma.project.create({
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
    data: { project },
  });
});

/**
 * Update project
 * PUT /api/projects/:id
 */
export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if project exists and belongs to user's tenant
  const existingProject = await prisma.project.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingProject) {
    throw new AppError('Project not found', 404);
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
    if ((key === 'startDate' || key === 'estimatedEndDate' || key === 'actualEndDate' || key === 'lastUpdate') && value) {
      cleanData[key] = new Date(value);
    } else {
      cleanData[key] = value;
    }
  });

  const project = await prisma.project.update({
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
    data: { project },
  });
});

/**
 * Delete project
 * DELETE /api/projects/:id
 */
export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Check if project exists and belongs to user's tenant
  const existingProject = await prisma.project.findFirst({
    where: {
      id,
      ...tenantFilter,
    },
  });

  if (!existingProject) {
    throw new AppError('Project not found', 404);
  }

  await prisma.project.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
});

/**
 * Get tasks for a project
 * GET /api/projects/:projectId/tasks
 */
export const getProjectTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { projectId } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Verify project belongs to user's tenant
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...tenantFilter,
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const tasks = await prisma.projectTask.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: { tasks },
  });
});

/**
 * Create task for a project
 * POST /api/projects/:projectId/tasks
 */
export const createProjectTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { projectId } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Verify project belongs to user's tenant
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...tenantFilter,
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const task = await prisma.projectTask.create({
    data: {
      ...req.body,
      projectId,
    },
  });

  res.status(201).json({
    success: true,
    data: { task },
  });
});

/**
 * Update project task
 * PUT /api/projects/:projectId/tasks/:taskId
 */
export const updateProjectTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { projectId, taskId } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Verify project belongs to user's tenant
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...tenantFilter,
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const task = await prisma.projectTask.update({
    where: { id: taskId },
    data: req.body,
  });

  res.json({
    success: true,
    data: { task },
  });
});

/**
 * Delete project task
 * DELETE /api/projects/:projectId/tasks/:taskId
 */
export const deleteProjectTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { projectId, taskId } = req.params;
  const tenantFilter = getTenantFilter(req.user);

  // Verify project belongs to user's tenant
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...tenantFilter,
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  await prisma.projectTask.delete({
    where: { id: taskId },
  });

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});

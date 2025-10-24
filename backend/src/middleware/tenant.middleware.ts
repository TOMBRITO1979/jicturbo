import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware to enforce tenant isolation
 * Super-admins can access all tenants
 * Other users can only access their own tenant's data
 */
export const tenantIsolation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Super-admins bypass tenant isolation
  if (req.user.role === 'SUPER_ADMIN') {
    next();
    return;
  }

  // Regular users and admins must have a tenantId
  if (!req.user.tenantId) {
    res.status(403).json({ error: 'No tenant associated with this user' });
    return;
  }

  next();
};

/**
 * Helper function to get tenant filter for Prisma queries
 */
export const getTenantFilter = (user: any): { tenantId?: string } | {} => {
  if (user.role === 'SUPER_ADMIN') {
    return {}; // No filter - can see all tenants
  }
  return { tenantId: user.tenantId };
};

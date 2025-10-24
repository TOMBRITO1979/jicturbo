import { Router } from 'express';
import {
  getAllTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantUsers,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and SUPER_ADMIN role
router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

// Tenant management
router.get('/tenants', getAllTenants);
router.get('/tenants/:id', getTenant);
router.post('/tenants', createTenant);
router.put('/tenants/:id', updateTenant);
router.delete('/tenants/:id', deleteTenant);

// Tenant users
router.get('/tenants/:id/users', getTenantUsers);

export default router;

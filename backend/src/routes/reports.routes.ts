import { Router } from 'express';
import {
  getDashboard,
  getSalesReport,
  getCustomersReport,
  getProjectsReport,
  getFinancialReport,
} from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth.middleware';
import { tenantIsolation } from '../middleware/tenant.middleware';

const router = Router();

// All routes require authentication and tenant isolation
router.use(authenticate);
router.use(tenantIsolation);

router.get('/dashboard', getDashboard);
router.get('/sales', getSalesReport);
router.get('/customers', getCustomersReport);
router.get('/projects', getProjectsReport);
router.get('/financial', getFinancialReport);

export default router;

import { Router } from 'express';
import {
  getCashFlows,
  getCashFlowById,
  createCashFlow,
  updateCashFlow,
  deleteCashFlow,
  getCashFlowAnalytics,
} from '../controllers/cashflow.controller';
import { generateCashFlowPDF } from '../controllers/cashflow-pdf.controller';
import { generateCashFlowCSV } from '../controllers/cashflow-csv.controller';
import { authenticate } from '../middleware/auth.middleware';
import { tenantIsolation } from '../middleware/tenant.middleware';

const router = Router();

// All routes require authentication and tenant isolation
router.use(authenticate);
router.use(tenantIsolation);

// Cash flow CRUD
router.get('/', getCashFlows);
router.get('/analytics', getCashFlowAnalytics);
router.get('/:id', getCashFlowById);
router.post('/', createCashFlow);
router.put('/:id', updateCashFlow);
router.delete('/:id', deleteCashFlow);

// Export routes
router.get('/export/pdf', generateCashFlowPDF);
router.get('/export/csv', generateCashFlowCSV);

export default router;

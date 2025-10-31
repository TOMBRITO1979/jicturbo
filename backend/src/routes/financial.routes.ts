import { Router } from 'express';
import {
  getFinancials,
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../controllers/financial.controller';
import { generateInvoicePDF } from '../controllers/pdf.controller';
import { authenticate } from '../middleware/auth.middleware';
import { tenantIsolation } from '../middleware/tenant.middleware';

const router = Router();

// All routes require authentication and tenant isolation
router.use(authenticate);
router.use(tenantIsolation);

// Financial records
router.get('/', getFinancials);

// Invoices
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', createInvoice);
router.put('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', deleteInvoice);

// PDF Generation
router.get('/invoices/:id/pdf', generateInvoicePDF);

export default router;

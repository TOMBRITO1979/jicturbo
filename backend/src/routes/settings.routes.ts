import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  testSmtp,
} from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { tenantIsolation } from '../middleware/tenant.middleware';

const router = Router();

// All routes require authentication and tenant isolation
router.use(authenticate);
router.use(tenantIsolation);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-smtp', testSmtp);

export default router;

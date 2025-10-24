import { Router } from 'express';
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  getMe,
  regenerateApiToken,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);
router.post('/regenerate-token', authenticate, regenerateApiToken);

export default router;

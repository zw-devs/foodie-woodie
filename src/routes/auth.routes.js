import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  changePassword, 
  refreshAccessToken 
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', rateLimiter, register);
router.post('/login', rateLimiter, login);
router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.patch('/change-password', authenticate, changePassword);

export default router;
import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  getProfile,
  updateProfile,
  blockUser,
  unblockUser
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Admin routes
router.post('/', authenticate, authorize('ADMIN'), rateLimiter, createUser);
router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.patch('/:userId/status', authenticate, authorize('ADMIN'), updateUserStatus);
router.delete('/:userId', authenticate, authorize('ADMIN'), deleteUser);

// Admin + self (profile routes)
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);

// Admin/User routes with ownership
router.get('/:userId', authenticate, getUserById);
router.patch('/:userId', authenticate, updateUser);
router.patch('/:userId/block', authenticate, authorize('ADMIN'), blockUser);
router.patch('/:userId/unblock', authenticate, authorize('ADMIN'), unblockUser);

export default router;
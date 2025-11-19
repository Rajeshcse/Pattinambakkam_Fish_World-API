import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  toggleUserVerification,
  getDashboardStats,
  bulkUserAction
} from '../controllers/adminController.js';

import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

import {
  validateAdminUpdateUser,
  validateAdminChangeRole,
  validateAdminBulkAction
} from '../middleware/validation.js';

import {
  adminLimiter,
  adminBulkLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Apply general admin rate limiting
router.use(adminLimiter);

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', validateAdminUpdateUser, updateUser);
router.delete('/users/:id', deleteUser);

// Role management
router.put('/users/:id/role', validateAdminChangeRole, changeUserRole);

// Verification management
router.put('/users/:id/verification', toggleUserVerification);

// Bulk operations (with additional rate limiting)
router.post('/users/bulk-action', adminBulkLimiter, validateAdminBulkAction, bulkUserAction);

export default router;
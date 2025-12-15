import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  toggleUserVerification,
  getDashboardStats,
  bulkUserAction,
  confirmPayment
} from '../controllers/adminController.js';

import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminGetOrderStats
} from '../controllers/orderController.js';

import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

import {
  validateAdminUpdateUser,
  validateAdminChangeRole,
  validateAdminBulkAction,
  validateAdminUpdateOrderStatus
} from '../middleware/validation.js';

import { adminLimiter, adminBulkLimiter } from '../middleware/rateLimiter.js';

import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.use(adminLimiter);

router.get('/dashboard', asyncHandler(getDashboardStats));

router.get('/users', asyncHandler(getAllUsers));
router.get('/users/:id', asyncHandler(getUserById));
router.put('/users/:id', validateAdminUpdateUser, asyncHandler(updateUser));
router.delete('/users/:id', asyncHandler(deleteUser));

router.put('/users/:id/role', validateAdminChangeRole, asyncHandler(changeUserRole));

router.put('/users/:id/verification', asyncHandler(toggleUserVerification));

router.post(
  '/users/bulk-action',
  adminBulkLimiter,
  validateAdminBulkAction,
  asyncHandler(bulkUserAction)
);

router.get('/orders', asyncHandler(adminGetAllOrders));
router.get('/orders/stats', asyncHandler(adminGetOrderStats));
router.put(
  '/orders/:orderId/status',
  validateAdminUpdateOrderStatus,
  asyncHandler(adminUpdateOrderStatus)
);
router.put('/orders/:orderId/confirm-payment', asyncHandler(confirmPayment));

export default router;

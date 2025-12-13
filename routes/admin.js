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
} from '../controllers/adminController.js';

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

import {
  validateAdminUpdateUser,
  validateAdminChangeRole,
  validateAdminBulkAction,
  validateCreateProduct,
  validateUpdateProduct,
} from '../middleware/validation.js';

import { adminLimiter, adminBulkLimiter } from '../middleware/rateLimiter.js';

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
router.post(
  '/users/bulk-action',
  adminBulkLimiter,
  validateAdminBulkAction,
  bulkUserAction
);

// ✅ PRODUCT ROUTES (Admin only, must verify both email & phone)
// Create product (requires both email & phone verification)
router.post('/products', validateCreateProduct, createProduct);

// Get all products
router.get('/products', getAllProducts);

// Get product by ID
router.get('/products/:id', getProductById);

// Update product (creator or super admin only)
router.put('/products/:id', validateUpdateProduct, updateProduct);

// Delete product (creator or super admin only)
router.delete('/products/:id', deleteProduct);

export default router;

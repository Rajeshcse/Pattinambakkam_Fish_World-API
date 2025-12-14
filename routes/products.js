import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability
} from '../controllers/productController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateCreateProduct, validateUpdateProduct } from '../middleware/validation.js';
import { adminLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', asyncHandler(getAllProducts));
router.get('/:id', asyncHandler(getProductById));

// Admin-only routes (protected)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  adminLimiter,
  validateCreateProduct,
  asyncHandler(createProduct)
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  adminLimiter,
  validateUpdateProduct,
  asyncHandler(updateProduct)
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  adminLimiter,
  asyncHandler(deleteProduct)
);

router.patch(
  '/:id/availability',
  authenticateToken,
  authorizeRoles('admin'),
  adminLimiter,
  asyncHandler(toggleProductAvailability)
);

export default router;

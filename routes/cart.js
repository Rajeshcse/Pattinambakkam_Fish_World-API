import express from 'express';
import {
  addItemToCart,
  getUserCart,
  updateCartItem,
  removeItemFromCart,
  clearUserCart,
  getCartCount
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateAddToCart, validateUpdateCartItem } from '../middleware/validation.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Cart routes
router.post('/add', validateAddToCart, addItemToCart);
router.get('/', getUserCart);
router.get('/count', getCartCount);
router.put('/update/:itemId', validateUpdateCartItem, updateCartItem);
router.delete('/remove/:itemId', removeItemFromCart);
router.delete('/clear', clearUserCart);

export default router;

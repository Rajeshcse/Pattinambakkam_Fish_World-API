import express from 'express';
import {
  addItemToCart,
  getUserCart,
  updateCartItem,
  removeItemFromCart,
  clearUserCart,
  getCartCount,
  guestCheckout
} from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { validateAddToCart, validateUpdateCartItem } from '../middleware/validation.js';

const router = express.Router();

router.use(optionalAuth);

router.post('/add', validateAddToCart, addItemToCart);
router.get('/', getUserCart);
router.get('/count', getCartCount);
router.put('/update/:itemId', validateUpdateCartItem, updateCartItem);
router.delete('/remove/:itemId', removeItemFromCart);
router.delete('/clear', clearUserCart);

// Guest checkout endpoint - requires authentication
router.post('/guest-checkout', guestCheckout);

export default router;

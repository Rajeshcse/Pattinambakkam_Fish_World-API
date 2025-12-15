import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderDetails,
  cancelUserOrder,
  getMyOrderStats
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCreateOrder } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/create', validateCreateOrder, placeOrder);
router.get('/', getMyOrders);
router.get('/stats', getMyOrderStats);
router.get('/:orderId', getOrderDetails);
router.put('/:orderId/cancel', cancelUserOrder);

export default router;

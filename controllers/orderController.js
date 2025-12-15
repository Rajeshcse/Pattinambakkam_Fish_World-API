import { validationResult } from 'express-validator';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderByMongoId,
  cancelOrder,
  getUserOrderStats,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} from '../services/orderService.js';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendPaginatedSuccess
} from '../utils/helpers/responseHelper.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants/index.js';

export const placeOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const userId = req.user.id;
    const orderData = req.body;

    const order = await createOrder(userId, orderData);

    return sendSuccess(res, order, 'Order placed successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Place order error:', error);

    if (error.message.includes('Cart') || error.message.includes('empty')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('stock') || error.message.includes('Insufficient')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('delivery') || error.message.includes('4 hours')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const orders = await getUserOrders(userId, filters);

    return sendSuccess(res, orders, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Get user orders error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await getOrderById(userId, orderId);

    return sendSuccess(res, order, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Get order details error:', error);

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'Order');
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const cancelUserOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await cancelOrder(userId, orderId);

    return sendSuccess(res, order, 'Order cancelled successfully');
  } catch (error) {
    console.error('Cancel order error:', error);

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'Order');
    }

    if (error.message.includes('Cannot cancel')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const getMyOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getUserOrderStats(userId);

    return sendSuccess(res, stats, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Get user order stats error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const adminGetAllOrders = async (req, res) => {
  try {
    const filters = req.query;
    const result = await getAllOrders(filters);

    return sendPaginatedSuccess(
      res,
      result.orders,
      {
        page: result.page,
        pages: result.pages,
        total: result.total,
        limit: parseInt(filters.limit) || 20
      },
      null,
      SUCCESS_MESSAGES.DATA_RETRIEVED
    );
  } catch (error) {
    console.error('Admin get all orders error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const order = await updateOrderStatus(orderId, status);

    return sendSuccess(res, order, 'Order status updated successfully');
  } catch (error) {
    console.error('Admin update order status error:', error);

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'Order');
    }

    if (error.message.includes('Invalid')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const adminGetOrderStats = async (req, res) => {
  try {
    const stats = await getOrderStats();

    return sendSuccess(res, stats, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Admin get order stats error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

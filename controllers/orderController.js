import { validationResult } from 'express-validator';
import {
  createOrder,
  getUserOrders,
  getOrderById,
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

    // Generate WhatsApp message for the customer
    const whatsappData = generateStatusWhatsAppMessage(order, status);

    return sendSuccess(
      res,
      {
        order,
        whatsapp: whatsappData
      },
      'Order status updated successfully'
    );
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

// Helper function to generate WhatsApp message based on order status
const generateStatusWhatsAppMessage = (order, newStatus) => {
  const customerName = order.user?.name || 'Customer';
  const customerPhone = order.deliveryDetails?.phone || order.user?.phone;

  const statusMessages = {
    confirmed: {
      emoji: '✅',
      title: 'Order Confirmed!',
      message: `Order Confirmed! Your order *${
        order.orderId
      }* has been *confirmed*! \n\nWe're Packing your fresh seafood!\n\nTrack Order: ${
        process.env.CLIENT_URL || 'http://localhost:5173'
      }/orders/${order.orderId}`
    },
    'out-for-delivery': {
      emoji: '🚗',
      title: 'Out for Delivery',
      message: `*Out for Delivery!* \n\nHi ${customerName}! 🚗💨\n\nYour order *${order.orderId}* is *out for delivery*!\n\nYour fresh seafood is on its way! 🐟📦\n\nPlease keep your phone nearby. Our delivery person will call you shortly`
    },
    delivered: {
      emoji: '✅',
      title: 'Order Delivered',
      message: `*Delivered: Your order *${order.orderId}* has been *delivered successfully*!\n\nWe hope you enjoy your fresh seafood! 🐟🦐\n\n*Thank you for choosing Pattinambakkam Fish World!*`
    },
    cancelled: {
      emoji: '❌',
      title: 'Order Cancelled',
      message: `Hi ${customerName},\n\nYour order *${order.orderId}* has been *cancelled*.\n\n*Refund:* ₹${order.totalAmount}\nIf you paid online, your refund will be processed within 5-7 business days.\n\nIf you have any questions, please contact us.\n\nWe hope to serve you again soon! 🐟\n\n_Pattinambakkam Fish World_`
    }
  };

  const messageData = statusMessages[newStatus];

  if (!messageData) {
    return null; // No message for 'pending' status
  }

  return {
    phone: customerPhone,
    message: messageData.message,
    emoji: messageData.emoji,
    title: messageData.title
  };
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

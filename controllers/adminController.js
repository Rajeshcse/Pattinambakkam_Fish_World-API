/**
 * Admin Controller
 * Handles HTTP requests and responses for admin operations
 */

import { validationResult } from 'express-validator';
import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  changeUserRoleService,
  toggleUserVerificationService,
  getDashboardStatsService,
  bulkUserActionService,
} from '../services/adminService.js';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendPaginatedSuccess,
} from '../utils/helpers/responseHelper.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants/index.js';

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const result = await getAllUsersService(req.query);

    return sendPaginatedSuccess(
      res,
      result.users,
      result.pagination,
      result.stats,
      SUCCESS_MESSAGES.DATA_RETRIEVED
    );
  } catch (error) {
    console.error('Get all users error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getUserByIdService(id);

    return sendSuccess(res, result.user, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Get user by ID error:', error);

    if (error.message.includes('Invalid user ID')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'User');
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Update user profile by admin
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    // Check validation errors from middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { id } = req.params;
    const result = await updateUserService(id, req.body, req.user.email);

    return sendSuccess(res, result.user, result.message);
  } catch (error) {
    console.error('Update user error:', error);

    if (error.message.includes('Invalid user ID')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'User');
    }

    if (error.message.includes('already in use')) {
      return sendError(res, error.message, HTTP_STATUS.CONFLICT);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteUserService(id, req.user.id, req.user.email);

    return sendSuccess(res, null, result.message);
  } catch (error) {
    console.error('Delete user error:', error);

    if (error.message.includes('Invalid user ID')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('Cannot delete')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'User');
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Change user role (promote/demote)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const changeUserRole = async (req, res) => {
  try {
    // Check validation errors from middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { id } = req.params;
    const { role } = req.body;
    const result = await changeUserRoleService(id, role, req.user.id, req.user.email);

    return sendSuccess(res, result.user, result.message);
  } catch (error) {
    console.error('Change user role error:', error);

    if (error.message.includes('Invalid user ID')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('Cannot change')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'User');
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Toggle user verification status
// @route   PUT /api/admin/users/:id/verification
// @access  Private/Admin
export const toggleUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await toggleUserVerificationService(id, req.user.email);

    return sendSuccess(res, result.user, result.message);
  } catch (error) {
    console.error('Toggle user verification error:', error);

    if (error.message.includes('Invalid user ID')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'User');
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const result = await getDashboardStatsService();

    return sendSuccess(res, result, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Bulk operations on users
// @route   POST /api/admin/users/bulk-action
// @access  Private/Admin
export const bulkUserAction = async (req, res) => {
  try {
    // Check validation errors from middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { action, userIds } = req.body;
    const result = await bulkUserActionService(action, userIds, req.user.id, req.user.email);

    return sendSuccess(res, { affected: result.affected }, result.message);
  } catch (error) {
    console.error('Bulk user action error:', error);

    if (error.message.includes('Invalid user IDs') || error.message.includes('array is required')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('Cannot perform bulk')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    if (error.message.includes('Invalid action')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Confirm payment for razorpay-link orders
// @route   PUT /api/admin/orders/:orderId/confirm-payment
// @access  Private/Admin
export const confirmPayment = async (req, res) => {
  try {
    const Order = (await import('../models/Order.js')).default;
    const { orderId } = req.params;
    const { transactionId, note } = req.body;

    // Find order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return sendNotFound(res, 'Order');
    }

    // Check if order payment is pending
    if (order.payment.status === 'completed') {
      return sendError(res, 'Payment already confirmed', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if order is razorpay-link payment
    if (order.payment.method !== 'razorpay-link') {
      return sendError(res, 'This order is not an online payment order', HTTP_STATUS.BAD_REQUEST);
    }

    // Update payment status
    order.payment.status = 'completed';
    order.payment.paidAt = new Date();
    order.payment.amount = order.totalAmount;

    if (transactionId) {
      order.payment.razorpayTransactionId = transactionId;
    }

    if (note) {
      order.payment.paymentNote = note;
    }

    // Update order status to confirmed
    order.status = 'confirmed';

    await order.save();

    return sendSuccess(res, order, 'Payment confirmed successfully');
  } catch (error) {
    console.error('Confirm payment error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

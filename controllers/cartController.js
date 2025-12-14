/**
 * Cart Controller
 * Handles HTTP requests and responses for shopping cart operations
 */

import { validationResult } from 'express-validator';
import {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  getCartItemCount
} from '../services/cartService.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/helpers/responseHelper.js';
import { isValidObjectId } from '../utils/helpers/validationHelper.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants/index.js';

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addItemToCart = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Validate product ID
    if (!isValidObjectId(productId)) {
      return sendError(res, 'Invalid product ID format', HTTP_STATUS.BAD_REQUEST);
    }

    const cart = await addToCart(userId, productId, parseInt(quantity));

    return sendSuccess(res, cart, 'Item added to cart successfully', HTTP_STATUS.OK);
  } catch (error) {
    console.error('Add to cart error:', error);

    if (error.message.includes('not found')) {
      return sendError(res, error.message, HTTP_STATUS.NOT_FOUND);
    }

    if (error.message.includes('not available') || error.message.includes('stock')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await getCart(userId);

    return sendSuccess(res, cart, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Get cart error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const cart = await updateCartItemQuantity(userId, itemId, parseInt(quantity));

    return sendSuccess(res, cart, 'Cart updated successfully');
  } catch (error) {
    console.error('Update cart item error:', error);

    if (error.message.includes('not found')) {
      return sendError(res, error.message, HTTP_STATUS.NOT_FOUND);
    }

    if (error.message.includes('stock') || error.message.includes('Quantity')) {
      return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
export const removeItemFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const cart = await removeCartItem(userId, itemId);

    return sendSuccess(res, cart, 'Item removed from cart');
  } catch (error) {
    console.error('Remove cart item error:', error);

    if (error.message.includes('not found')) {
      return sendError(res, error.message, HTTP_STATUS.NOT_FOUND);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await clearCart(userId);

    return sendSuccess(res, cart, 'Cart cleared successfully');
  } catch (error) {
    console.error('Clear cart error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
export const getCartCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getCartItemCount(userId);

    return sendSuccess(res, { count }, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Get cart count error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

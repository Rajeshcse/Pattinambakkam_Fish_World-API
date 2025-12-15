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

export const addItemToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { productId, quantity } = req.body;
    const userId = req.user.id;

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

export const updateCartItem = async (req, res) => {
  try {
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

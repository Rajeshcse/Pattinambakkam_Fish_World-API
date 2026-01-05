import { validationResult } from 'express-validator';
import {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  getCartItemCount
} from '../services/cartService.js';
import {
  addToGuestCart,
  getGuestCart,
  updateGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
  getGuestCartItemCount
} from '../services/guestCartService.js';
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
    const userId = req.user?.id;
    const guestId = req.guestId;

    if (!isValidObjectId(productId)) {
      return sendError(res, 'Invalid product ID format', HTTP_STATUS.BAD_REQUEST);
    }

    let cart;

    if (userId) {
      // Authenticated user
      cart = await addToCart(userId, productId, parseInt(quantity));
    } else if (guestId) {
      // Guest user
      cart = await addToGuestCart(guestId, productId, parseInt(quantity));
      return sendSuccess(
        res,
        {
          ...cart,
          isGuest: true,
          guestId
        },
        'Item added to cart successfully',
        HTTP_STATUS.OK
      );
    } else {
      return sendError(res, 'Unable to identify user session', HTTP_STATUS.BAD_REQUEST);
    }

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
    const userId = req.user?.id;
    const guestId = req.guestId;

    let cart;

    if (userId) {
      // Authenticated user
      cart = await getCart(userId);
    } else if (guestId) {
      // Guest user
      cart = getGuestCart(guestId);
      return sendSuccess(
        res,
        {
          ...cart,
          isGuest: true
        },
        SUCCESS_MESSAGES.DATA_RETRIEVED
      );
    } else {
      return sendError(res, 'Unable to identify user session', HTTP_STATUS.BAD_REQUEST);
    }

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
    const userId = req.user?.id;
    const guestId = req.guestId;

    let cart;

    if (userId) {
      // Authenticated user
      cart = await updateCartItemQuantity(userId, itemId, parseInt(quantity));
    } else if (guestId) {
      // Guest user - itemId is the index in guest cart
      const itemIndex = parseInt(itemId);
      if (isNaN(itemIndex)) {
        return sendError(res, 'Invalid item index', HTTP_STATUS.BAD_REQUEST);
      }
      cart = await updateGuestCartItem(guestId, itemIndex, parseInt(quantity));
      return sendSuccess(
        res,
        {
          ...cart,
          isGuest: true
        },
        'Cart updated successfully'
      );
    } else {
      return sendError(res, 'Unable to identify user session', HTTP_STATUS.BAD_REQUEST);
    }

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
    const userId = req.user?.id;
    const guestId = req.guestId;

    let cart;

    if (userId) {
      // Authenticated user
      cart = await removeCartItem(userId, itemId);
    } else if (guestId) {
      // Guest user - itemId is the index in guest cart
      const itemIndex = parseInt(itemId);
      if (isNaN(itemIndex)) {
        return sendError(res, 'Invalid item index', HTTP_STATUS.BAD_REQUEST);
      }
      cart = removeGuestCartItem(guestId, itemIndex);
      return sendSuccess(
        res,
        {
          ...cart,
          isGuest: true
        },
        'Item removed from cart'
      );
    } else {
      return sendError(res, 'Unable to identify user session', HTTP_STATUS.BAD_REQUEST);
    }

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
    const userId = req.user?.id;
    const guestId = req.guestId;

    let cart;

    if (userId) {
      // Authenticated user
      cart = await clearCart(userId);
    } else if (guestId) {
      // Guest user
      cart = clearGuestCart(guestId);
      return sendSuccess(
        res,
        {
          ...cart,
          isGuest: true
        },
        'Cart cleared successfully'
      );
    } else {
      return sendError(res, 'Unable to identify user session', HTTP_STATUS.BAD_REQUEST);
    }

    return sendSuccess(res, cart, 'Cart cleared successfully');
  } catch (error) {
    console.error('Clear cart error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const getCartCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestId = req.guestId;

    let count;

    if (userId) {
      // Authenticated user
      count = await getCartItemCount(userId);
    } else if (guestId) {
      // Guest user
      count = getGuestCartItemCount(guestId);
      return sendSuccess(res, { count, isGuest: true }, SUCCESS_MESSAGES.DATA_RETRIEVED);
    } else {
      return sendError(res, 'Unable to identify user session', HTTP_STATUS.BAD_REQUEST);
    }

    return sendSuccess(res, { count }, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Get cart count error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Guest checkout endpoint
 * Converts guest cart to authenticated user cart and prepares for checkout
 * This endpoint must be called with authentication token
 */
export const guestCheckout = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestId = req.body.guestId || req.guestId;
    const { redirectUrl } = req.body;

    // User must be authenticated to checkout
    if (!userId) {
      return sendError(
        res,
        'Authentication required to proceed to checkout. Please login first.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (!guestId) {
      return sendError(res, 'Guest cart ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Import the conversion function
    const { convertGuestCartToUserCart } = await import('../services/guestCartService.js');

    // Convert guest cart to user cart
    const userCart = await convertGuestCartToUserCart(guestId, userId);

    if (!userCart || userCart.items.length === 0) {
      return sendError(
        res,
        'Cart is empty. Please add items before checkout.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Return success with cart and checkout redirect info
    return sendSuccess(
      res,
      {
        cart: userCart,
        message: 'Cart transferred successfully',
        redirectUrl: redirectUrl || '/checkout',
        isReady: true
      },
      'Ready to proceed to checkout',
      HTTP_STATUS.OK
    );
  } catch (error) {
    console.error('Guest checkout error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

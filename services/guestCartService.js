import Cart from '../models/Cart.js';
import FishProduct from '../models/FishProduct.js';

/**
 * Guest Cart Service
 * Handles cart operations for guest users
 * Uses in-memory storage with expiration (24 hours)
 */

const guestCarts = new Map();
const GUEST_CART_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get or create a guest cart
 * @param {string} guestId - Unique identifier for guest (sessionID or IP)
 * @returns {Object} Guest cart object
 */
export const getOrCreateGuestCart = (guestId) => {
  if (!guestCarts.has(guestId)) {
    guestCarts.set(guestId, {
      guestId,
      items: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + GUEST_CART_EXPIRATION
    });
  } else {
    const cart = guestCarts.get(guestId);
    // Reset expiration on access
    cart.expiresAt = Date.now() + GUEST_CART_EXPIRATION;
  }

  return guestCarts.get(guestId);
};

/**
 * Add item to guest cart
 * @param {string} guestId - Guest identifier
 * @param {string} productId - Product ID to add
 * @param {number} quantity - Quantity to add
 * @returns {Object} Updated guest cart
 */
export const addToGuestCart = async (guestId, productId, quantity) => {
  const product = await FishProduct.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (!product.isAvailable) {
    throw new Error('Product is not available');
  }

  if (product.stock < quantity) {
    throw new Error(`Only ${product.stock} items available in stock`);
  }

  const cart = getOrCreateGuestCart(guestId);

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );

  if (existingItemIndex >= 0) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (newQuantity > product.stock) {
      throw new Error(`Cannot add more items. Only ${product.stock} available in stock`);
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].addedAt = Date.now();
  } else {
    cart.items.push({
      productId,
      productName: product.name,
      price: product.price,
      image: product.image,
      quantity,
      addedAt: Date.now()
    });
  }

  return cart;
};

/**
 * Get guest cart
 * @param {string} guestId - Guest identifier
 * @returns {Object} Guest cart or empty cart
 */
export const getGuestCart = (guestId) => {
  const cart = guestCarts.get(guestId);

  if (!cart) {
    return {
      guestId,
      items: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + GUEST_CART_EXPIRATION
    };
  }

  // Check if expired
  if (cart.expiresAt < Date.now()) {
    guestCarts.delete(guestId);
    return {
      guestId,
      items: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + GUEST_CART_EXPIRATION
    };
  }

  return cart;
};

/**
 * Update guest cart item quantity
 * @param {string} guestId - Guest identifier
 * @param {number} itemIndex - Index of item in cart
 * @param {number} quantity - New quantity
 * @returns {Object} Updated cart
 */
export const updateGuestCartItem = async (guestId, itemIndex, quantity) => {
  const cart = guestCarts.get(guestId);

  if (!cart) {
    throw new Error('Cart not found');
  }

  if (itemIndex < 0 || itemIndex >= cart.items.length) {
    throw new Error('Item not found in cart');
  }

  const item = cart.items[itemIndex];
  const product = await FishProduct.findById(item.productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (quantity > product.stock) {
    throw new Error(`Only ${product.stock} items available in stock`);
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  item.quantity = quantity;
  return cart;
};

/**
 * Remove item from guest cart
 * @param {string} guestId - Guest identifier
 * @param {number} itemIndex - Index of item to remove
 * @returns {Object} Updated cart
 */
export const removeGuestCartItem = (guestId, itemIndex) => {
  const cart = guestCarts.get(guestId);

  if (!cart) {
    throw new Error('Cart not found');
  }

  if (itemIndex < 0 || itemIndex >= cart.items.length) {
    throw new Error('Item not found in cart');
  }

  cart.items.splice(itemIndex, 1);
  return cart;
};

/**
 * Clear guest cart
 * @param {string} guestId - Guest identifier
 * @returns {Object} Empty cart
 */
export const clearGuestCart = (guestId) => {
  const cart = guestCarts.get(guestId);

  if (cart) {
    cart.items = [];
  }

  return (
    cart || {
      guestId,
      items: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + GUEST_CART_EXPIRATION
    }
  );
};

/**
 * Get guest cart item count
 * @param {string} guestId - Guest identifier
 * @returns {number} Total items in cart
 */
export const getGuestCartItemCount = (guestId) => {
  const cart = getGuestCart(guestId);
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Convert guest cart to user cart
 * Transfers all items from guest cart to authenticated user's cart
 * @param {string} guestId - Guest identifier
 * @param {string} userId - User ID
 * @returns {Object} User's cart with transferred items
 */
export const convertGuestCartToUserCart = async (guestId, userId) => {
  const guestCart = getGuestCart(guestId);

  if (!guestCart || guestCart.items.length === 0) {
    // Return existing user cart or create new one
    return await getOrCreateUserCart(userId);
  }

  let userCart = await Cart.findOne({ user: userId });

  if (!userCart) {
    userCart = new Cart({ user: userId, items: [] });
  }

  // Transfer items from guest cart to user cart
  for (const guestItem of guestCart.items) {
    const product = await FishProduct.findById(guestItem.productId);

    if (!product || !product.isAvailable) {
      continue; // Skip unavailable products
    }

    const existingItemIndex = userCart.items.findIndex(
      (item) => item.product.toString() === guestItem.productId.toString()
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      userCart.items[existingItemIndex].quantity += guestItem.quantity;
    } else {
      // Add new item
      userCart.items.push({
        product: guestItem.productId,
        quantity: guestItem.quantity,
        addedAt: new Date()
      });
    }
  }

  await userCart.save();
  await userCart.populate('items.product');

  // Clear guest cart after successful transfer
  guestCarts.delete(guestId);

  return userCart;
};

/**
 * Get or create user cart (helper for conversion)
 * @param {string} userId - User ID
 * @returns {Object} User cart
 */
export const getOrCreateUserCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

/**
 * Cleanup expired guest carts
 * Should be called periodically (e.g., every hour)
 */
export const cleanupExpiredGuestCarts = () => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [guestId, cart] of guestCarts.entries()) {
    if (cart.expiresAt < now) {
      guestCarts.delete(guestId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired guest carts`);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredGuestCarts, 60 * 60 * 1000);

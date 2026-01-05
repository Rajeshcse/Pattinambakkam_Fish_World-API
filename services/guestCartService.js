import Cart from '../models/Cart.js';
import FishProduct from '../models/FishProduct.js';

/**
 * Guest Cart Service
 * Handles cart operations for guest users
 * Uses in-memory storage with automatic expiration cleanup (24 hours)
 * Cleanup interval runs every 15 minutes to remove expired carts
 */

const guestCarts = new Map();
const GUEST_CART_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CLEANUP_INTERVAL = 15 * 60 * 1000; // Run cleanup every 15 minutes

/**
 * Cleanup expired guest carts
 * Removes carts older than 24 hours from memory
 * Called periodically to prevent memory leaks
 * @returns {number} Number of carts cleaned up
 */
const cleanupExpiredGuestCarts = () => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [guestId, cart] of guestCarts.entries()) {
    if (cart.expiresAt < now) {
      guestCarts.delete(guestId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(
      `[Guest Cart Cleanup] Removed ${cleanedCount} expired carts at ${new Date().toISOString()}`
    );
  }

  return cleanedCount;
};

/**
 * Initialize cleanup interval
 * Automatically runs cleanup every 15 minutes
 * Exported for testing and explicit initialization
 * @returns {NodeJS.Timer} Cleanup interval ID
 */
export const initializeCleanupInterval = () => {
  const cleanupIntervalId = setInterval(cleanupExpiredGuestCarts, CLEANUP_INTERVAL);

  // Prevent the process from hanging due to this interval
  cleanupIntervalId.unref();

  console.log(
    `[Guest Cart Service] Cleanup interval initialized: every ${
      CLEANUP_INTERVAL / 1000 / 60
    } minutes`
  );

  return cleanupIntervalId;
};

// Initialize cleanup interval on module load
initializeCleanupInterval();

/**
 * Get or create a guest cart
 * Creates a new cart with timestamps if not exists
 * Resets expiration time on access
 * @param {string} guestId - Unique identifier for guest (sessionID)
 * @returns {Object} Guest cart object with createdAt and expiresAt timestamps
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
 * Uses atomic MongoDB operation to prevent overselling
 * Stock check and reservation happen in single atomic operation
 * @param {string} guestId - Guest identifier
 * @param {string} productId - Product ID to add
 * @param {number} quantity - Quantity to add
 * @returns {Object} Updated guest cart
 */
export const addToGuestCart = async (guestId, productId, quantity) => {
  // Atomic operation: Find product, check availability, and reserve stock in one operation
  // Only succeeds if stock >= quantity
  const product = await FishProduct.findOneAndUpdate(
    {
      _id: productId,
      isAvailable: true,
      stock: { $gte: quantity } // Only match if stock is sufficient
    },
    {
      $inc: { stock: -quantity } // Atomically decrease stock
    },
    {
      new: false, // Return document before update to get original stock value
      runValidators: true
    }
  );

  // If MongoDB returns null, it means either:
  // - Product doesn't exist
  // - Product is not available
  // - Stock is insufficient
  if (!product) {
    // Fetch product to determine exact error
    const existingProduct = await FishProduct.findById(productId);

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    if (!existingProduct.isAvailable) {
      throw new Error('Product is not available');
    }

    throw new Error(`Only ${existingProduct.stock} items available in stock`);
  }

  const cart = getOrCreateGuestCart(guestId);

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].addedAt = Date.now();
  } else {
    // Fetch fresh product data to get current details
    const freshProduct = await FishProduct.findById(productId);
    cart.items.push({
      productId,
      productName: freshProduct.name,
      price: freshProduct.price,
      image: freshProduct.image,
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
 * Export cleanup function for manual triggering or testing
 * @returns {number} Number of expired carts removed
 */
export const triggerCleanup = cleanupExpiredGuestCarts;

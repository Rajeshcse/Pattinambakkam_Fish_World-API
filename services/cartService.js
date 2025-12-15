import Cart from '../models/Cart.js';
import FishProduct from '../models/FishProduct.js';

export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

export const addToCart = async (userId, productId, quantity) => {
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

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

  if (existingItemIndex >= 0) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (newQuantity > product.stock) {
      throw new Error(`Cannot add more items. Only ${product.stock} available in stock`);
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].addedAt = new Date();
  } else {
    cart.items.push({
      product: productId,
      quantity,
      addedAt: new Date()
    });
  }

  await cart.save();

  await cart.populate('items.product');

  return cart;
};

export const getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart) {
    return { user: userId, items: [], updatedAt: new Date() };
  }

  cart.items = cart.items.filter((item) => {
    return item.product && item.product.isAvailable;
  });

  if (cart.isModified('items')) {
    await cart.save();
  }

  return cart;
};

export const updateCartItemQuantity = async (userId, itemId, quantity) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error('Cart not found');
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw new Error('Item not found in cart');
  }

  const product = await FishProduct.findById(item.product);

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
  await cart.save();

  await cart.populate('items.product');

  return cart;
};

export const removeCartItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error('Cart not found');
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw new Error('Item not found in cart');
  }

  cart.items.pull(itemId);
  await cart.save();

  await cart.populate('items.product');

  return cart;
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return { user: userId, items: [], updatedAt: new Date() };
  }

  cart.items = [];
  await cart.save();

  return cart;
};

export const getCartItemCount = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return 0;
  }

  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

export const validateCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  const errors = [];

  if (!cart || cart.items.length === 0) {
    return { valid: false, errors: ['Cart is empty'] };
  }

  for (const item of cart.items) {
    if (!item.product) {
      errors.push(`Product no longer exists`);
      continue;
    }

    if (!item.product.isAvailable) {
      errors.push(`${item.product.name} is no longer available`);
    }

    if (item.quantity > item.product.stock) {
      errors.push(
        `${item.product.name}: Only ${item.product.stock} available, you have ${item.quantity} in cart`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

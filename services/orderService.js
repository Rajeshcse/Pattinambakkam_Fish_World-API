import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import FishProduct from '../models/FishProduct.js';
import {
  generateOrderId,
  validateDeliveryTime,
  calculateOrderTotal
} from '../utils/helpers/orderHelpers.js';
import { validateCart, clearCart } from './cartService.js';

export const createOrder = async (userId, orderData) => {
  const { deliveryDetails, orderNotes, paymentMethod } = orderData;

  const cartValidation = await validateCart(userId);
  if (!cartValidation.valid) {
    throw new Error(`Cart validation failed: ${cartValidation.errors.join(', ')}`);
  }

  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const deliveryValidation = validateDeliveryTime(
    deliveryDetails.deliveryDate,
    deliveryDetails.deliveryTime
  );

  if (!deliveryValidation.valid) {
    throw new Error(deliveryValidation.message);
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of cart.items) {
    const product = cartItem.product;

    if (cartItem.quantity > product.stock) {
      throw new Error(`${product.name}: Insufficient stock. Only ${product.stock} available`);
    }

    const subtotal = product.price * cartItem.quantity;
    totalAmount += subtotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      subtotal
    });

    product.stock -= cartItem.quantity;
    await product.save();
  }

  const orderId = await generateOrderId();

  const order = await Order.create({
    orderId,
    user: userId,
    items: orderItems,
    totalAmount,
    deliveryDetails: {
      address: deliveryDetails.address,
      phone: deliveryDetails.phone,
      deliveryDate: new Date(deliveryDetails.deliveryDate),
      deliveryTime: deliveryDetails.deliveryTime
    },
    orderNotes: orderNotes || '',
    paymentMethod: paymentMethod || 'Google Pay',
    status: 'pending',
    paymentStatus: 'pending'
  });

  await clearCart(userId);

  await order.populate('items.product');

  return order;
};

export const getUserOrders = async (userId, filters = {}) => {
  const { status, limit = 20, skip = 0, sort = '-createdAt' } = filters;

  const query = { user: userId };

  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate('items.product')
    .sort(sort)
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  return orders;
};

export const getOrderById = async (userId, orderId) => {
  const order = await Order.findOne({ orderId, user: userId })
    .populate('items.product')
    .populate('user', 'name email phone');

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

export const getOrderByMongoId = async (userId, id) => {
  const order = await Order.findOne({ _id: id, user: userId })
    .populate('items.product')
    .populate('user', 'name email phone');

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

export const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ orderId, user: userId });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'pending') {
    throw new Error(`Cannot cancel order with status: ${order.status}`);
  }

  for (const item of order.items) {
    const product = await FishProduct.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.status = 'cancelled';
  await order.save();

  await order.populate('items.product');

  return order;
};

export const getUserOrderStats = async (userId) => {
  const totalOrders = await Order.countDocuments({ user: userId });
  const pendingOrders = await Order.countDocuments({ user: userId, status: 'pending' });
  const deliveredOrders = await Order.countDocuments({ user: userId, status: 'delivered' });
  const cancelledOrders = await Order.countDocuments({ user: userId, status: 'cancelled' });

  const orders = await Order.find({ user: userId });
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalSpent
  };
};

export const getAllOrders = async (filters = {}) => {
  const { status, limit = 20, skip = 0, sort = '-createdAt', search } = filters;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.orderId = { $regex: search, $options: 'i' };
  }

  const orders = await Order.find(query)
    .populate('user', 'name email phone')
    .populate('items.product')
    .sort(sort)
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Order.countDocuments(query);

  return {
    orders,
    total,
    page: Math.floor(skip / limit) + 1,
    pages: Math.ceil(total / limit)
  };
};

export const updateOrderStatus = async (orderId, status) => {
  const validStatuses = [
    'pending',
    'confirmed',
    'preparing',
    'out-for-delivery',
    'delivered',
    'cancelled'
  ];

  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new Error('Order not found');
  }

  if (status === 'cancelled' && order.status !== 'cancelled') {
    for (const item of order.items) {
      const product = await FishProduct.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
  }

  order.status = status;
  await order.save();

  await order.populate('user', 'name email phone');
  await order.populate('items.product');

  return order;
};

export const getOrderStats = async () => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
  const preparingOrders = await Order.countDocuments({ status: 'preparing' });
  const outForDeliveryOrders = await Order.countDocuments({ status: 'out-for-delivery' });
  const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
  const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

  const orders = await Order.find({ status: { $ne: 'cancelled' } });
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });

  return {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    outForDeliveryOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    todayOrders
  };
};

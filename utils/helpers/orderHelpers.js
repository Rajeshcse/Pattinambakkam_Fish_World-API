import Order from '../../models/Order.js';

/**
 * Generate a unique order ID in format: ORD-YYYYMMDD-XXX
 * @returns {Promise<string>} Unique order ID
 */
export const generateOrderId = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Find the count of orders created today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayOrderCount = await Order.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  // Increment and pad to 3 digits
  const sequence = String(todayOrderCount + 1).padStart(3, '0');

  return `ORD-${dateStr}-${sequence}`;
};

/**
 * Validate if the selected delivery date and time is at least 4 hours from now
 * @param {Date|string} deliveryDate - Selected delivery date
 * @param {string} deliveryTime - Time slot (08:00-12:00, 12:00-16:00, 16:00-20:00)
 * @returns {{valid: boolean, message: string, minimumTime: Date}}
 */
export const validateDeliveryTime = (deliveryDate, deliveryTime) => {
  const now = new Date();
  const minimumDeliveryTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

  // Parse the delivery date
  const selectedDate = new Date(deliveryDate);

  // Validate time slot format
  const validTimeSlots = ['08:00-12:00', '12:00-16:00', '16:00-20:00'];
  if (!validTimeSlots.includes(deliveryTime)) {
    return {
      valid: false,
      message: 'Invalid delivery time slot. Must be 08:00-12:00, 12:00-16:00, or 16:00-20:00',
      minimumTime: minimumDeliveryTime
    };
  }

  // Extract start time from the slot
  const [startTime] = deliveryTime.split('-');
  const [hours, minutes] = startTime.split(':').map(Number);

  // Set the delivery time to the start of the selected slot
  const selectedDeliveryTime = new Date(selectedDate);
  selectedDeliveryTime.setHours(hours, minutes, 0, 0);

  // Check if the selected delivery time is at least 4 hours from now
  if (selectedDeliveryTime < minimumDeliveryTime) {
    return {
      valid: false,
      message: `Delivery time must be at least 4 hours from now. Minimum delivery time: ${minimumDeliveryTime.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      })}`,
      minimumTime: minimumDeliveryTime
    };
  }

  // Check if date is in the past
  if (selectedDate < new Date(now.setHours(0, 0, 0, 0))) {
    return {
      valid: false,
      message: 'Delivery date cannot be in the past',
      minimumTime: minimumDeliveryTime
    };
  }

  return {
    valid: true,
    message: 'Delivery time is valid',
    minimumTime: minimumDeliveryTime
  };
};

/**
 * Calculate the total amount for order items
 * @param {Array} items - Array of order items with price and quantity
 * @returns {number} Total amount
 */
export const calculateOrderTotal = (items) => {
  if (!items || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const subtotal = item.price * item.quantity;
    return total + subtotal;
  }, 0);
};

/**
 * Get available time slots for a given date
 * @param {Date|string} date - Selected date
 * @returns {Array<{slot: string, available: boolean, reason: string}>}
 */
export const getAvailableTimeSlots = (date) => {
  const now = new Date();
  const minimumTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const selectedDate = new Date(date);

  const timeSlots = [
    { slot: '08:00-12:00', start: 8 },
    { slot: '12:00-16:00', start: 12 },
    { slot: '16:00-20:00', start: 16 }
  ];

  return timeSlots.map(({ slot, start }) => {
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(start, 0, 0, 0);

    const available = slotDateTime >= minimumTime;
    const reason = available
      ? 'Available'
      : 'Requires at least 4 hours advance notice';

    return { slot, available, reason };
  });
};

/**
 * Format order ID for display
 * @param {string} orderId - Order ID
 * @returns {string} Formatted order ID
 */
export const formatOrderId = (orderId) => {
  return orderId || 'N/A';
};

/**
 * Get status badge color for UI
 * @param {string} status - Order status
 * @returns {string} Color class or code
 */
export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'orange',
    confirmed: 'blue',
    preparing: 'purple',
    'out-for-delivery': 'indigo',
    delivered: 'green',
    cancelled: 'red'
  };

  return statusColors[status] || 'gray';
};

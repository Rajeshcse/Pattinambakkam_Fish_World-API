import Order from '../../models/Order.js';

export const generateOrderId = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayOrderCount = await Order.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const sequence = String(todayOrderCount + 1).padStart(3, '0');

  return `ORD-${dateStr}-${sequence}`;
};

export const validateDeliveryTime = (deliveryDate, deliveryTime) => {
  const now = new Date();
  const minimumDeliveryTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const selectedDate = new Date(deliveryDate);

  const validTimeSlots = ['8:00 AM - 12:00 PM', '12:00 PM - 4:00 PM', '4:00 PM - 8:00 PM'];
  if (!validTimeSlots.includes(deliveryTime)) {
    return {
      valid: false,
      message:
        'Invalid delivery time slot. Must be 8:00 AM - 12:00 PM, 12:00 PM - 4:00 PM, or 4:00 PM - 8:00 PM',
      minimumTime: minimumDeliveryTime
    };
  }

  let hours, minutes;

  if (deliveryTime.includes('8:00 AM')) {
    hours = 8;
    minutes = 0;
  } else if (deliveryTime.includes('12:00 PM')) {
    hours = 12;
    minutes = 0;
  } else if (deliveryTime.includes('4:00 PM')) {
    hours = 16;
    minutes = 0;
  }

  const selectedDeliveryTime = new Date(selectedDate);
  selectedDeliveryTime.setHours(hours, minutes, 0, 0);

  if (selectedDeliveryTime < minimumDeliveryTime) {
    return {
      valid: false,
      message: `Delivery time must be at least 4 hours from now. Minimum delivery time: ${minimumDeliveryTime.toLocaleString(
        'en-IN',
        {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short'
        }
      )}`,
      minimumTime: minimumDeliveryTime
    };
  }

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

export const calculateOrderTotal = (items) => {
  if (!items || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const subtotal = item.price * item.quantity;
    return total + subtotal;
  }, 0);
};

export const getAvailableTimeSlots = (date) => {
  const now = new Date();
  const minimumTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const selectedDate = new Date(date);

  const timeSlots = [
    { slot: '8:00 AM - 12:00 PM', start: 8 },
    { slot: '12:00 PM - 4:00 PM', start: 12 },
    { slot: '4:00 PM - 8:00 PM', start: 16 }
  ];

  return timeSlots.map(({ slot, start }) => {
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(start, 0, 0, 0);

    const available = slotDateTime >= minimumTime;
    const reason = available ? 'Available' : 'Requires at least 4 hours advance notice';

    return { slot, available, reason };
  });
};

export const formatOrderId = (orderId) => {
  return orderId || 'N/A';
};

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

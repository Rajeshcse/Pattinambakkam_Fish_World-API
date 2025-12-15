import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FishProduct',
        required: [true, 'Product is required']
      },
      name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
      },
      price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
      },
      quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
      },
      subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  deliveryDetails: {
    address: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
      minlength: [10, 'Address must be at least 10 characters'],
      maxlength: [300, 'Address cannot exceed 300 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Phone number must be a valid 10-digit number starting with 6-9'
      }
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required']
    },
    deliveryTime: {
      type: String,
      enum: {
        values: ['08:00-12:00', '12:00-16:00', '16:00-20:00'],
        message: 'Delivery time must be one of: 08:00-12:00, 12:00-16:00, 16:00-20:00'
      },
      required: [true, 'Delivery time slot is required']
    }
  },
  orderNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Order notes cannot exceed 500 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
      message: 'Invalid order status'
    },
    default: 'pending',
    index: true
  },
  payment: {
    method: {
      type: String,
      enum: {
        values: ['whatsapp', 'cod', 'razorpay-link'],
        message: 'Payment method must be whatsapp, cod, or razorpay-link'
      },
      default: 'cod',
      required: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: 'Invalid payment status'
      },
      default: 'pending',
      index: true
    },
    paidAt: {
      type: Date
    },
    amount: {
      type: Number,
      min: [0, 'Payment amount cannot be negative']
    },

    razorpayTransactionId: {
      type: String,
      sparse: true
    },
    paymentNote: {
      type: String,
      trim: true
    }
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);

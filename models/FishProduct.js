import mongoose from 'mongoose';

const fishProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: {
      values: ['Fish', 'Prawn', 'Crab', 'Squid'],
      message: 'Category must be one of: Fish, Prawn, Crab, Squid',
    },
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0.01, 'Price must be greater than 0'],
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  images: [
    {
      type: String,
      trim: true,
      default: '',
    },
  ],
  createdBy: {
    type: String,
    required: [true, 'Admin email is required'],
    trim: true,
    lowercase: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
fishProductSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure isAvailable is set to false when stock is 0
fishProductSchema.pre('save', function (next) {
  if (this.stock === 0) {
    this.isAvailable = false;
  } else if (this.stock > 0 && !this.isModified('isAvailable')) {
    this.isAvailable = true;
  }
  next();
});

export default mongoose.model('FishProduct', fishProductSchema);

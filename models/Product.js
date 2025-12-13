import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // ===== MANDATORY FIELDS =====
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: [
        'Fish',
        'Shrimp',
        'Crab',
        'Lobster',
        'Shellfish',
        'Accessories',
        'Food',
        'Other',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    // ===== OPTIONAL FIELDS =====
    type: {
      type: String,
      enum: ['Uncleaned', 'Cleaned'],
      required: function () {
        return (
          this.category !== 'Accessories' &&
          this.category !== 'Food' &&
          this.category !== 'Other'
        );
      },
    },
    wholeFishCount: {
      type: Number,
      min: [0, 'Whole fish count cannot be negative'],
    },
    cutPiecesCount: {
      type: Number,
      min: [0, 'Cut pieces count cannot be negative'],
    },
    description: {
      type: String,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    images: [
      {
        type: String,
      },
    ],
    beforeCleanImage: {
      type: String,
    },
    afterCleanImage: {
      type: String,
    },

    // ===== SYSTEM FIELDS =====
    rating: {
      type: Number,
      min: [0, 'Rating must be between 0 and 5'],
      max: [5, 'Rating must be between 0 and 5'],
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // Admin who created the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Is product active/available
    isActive: {
      type: Boolean,
      default: true,
    },
    // SKU for inventory tracking
    sku: {
      type: String,
      unique: true,
      required: false,
      trim: true,
      uppercase: true,
      default: function () {
        const categoryMap = {
          Fish: 'FISH',
          Shrimp: 'SHMP',
          Crab: 'CRAB',
          Lobster: 'LOBS',
          Shellfish: 'SHEL',
          Accessories: 'ACCS',
          Food: 'FOOD',
          Other: 'OTHR',
        };
        const prefix = categoryMap[this.category] || 'PROD';
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}${timestamp}`;
      },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
productSchema.index({ name: 'text', description: 'text', category: 1 });

productSchema.index({ category: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

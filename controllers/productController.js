import { validationResult } from 'express-validator';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { generateDescription } from '../utils/descriptionGenerator.js';

// ✅ CREATE PRODUCT – Admin only, must have email + phone verified
// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Private/Admin (requires both email & phone verification)
export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // ✅ Check if admin has verified BOTH email and phone
    const admin = await User.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // 🔐 Enforce verification requirement
    if (!admin.emailVerified || !admin.phoneVerified) {
      return res.status(403).json({
        success: false,
        message:
          'You must verify both email and phone number to create products',
        verified: {
          email: admin.emailVerified,
          phone: admin.phoneVerified,
        },
      });
    }

    const {
      name,
      description,
      price,
      category,
      stock,
      images,
      sku,
      tags,
      type,
    } = req.body;

    // Auto-generate description if not provided
    let finalDescription = description;
    if (!description) {
      finalDescription = generateDescription(category, type || 'Uncleaned');
    }

    // Create product with admin ID (sku will auto-generate if not provided)
    const product = new Product({
      name,
      description: finalDescription,
      price,
      category,
      stock,
      images: images || [],
      sku: sku || undefined, // Let schema handle auto-generation
      tags: tags || [],
      type,
      createdBy: req.user.id,
    });

    await product.save();

    // Populate admin details in response
    await product.populate('createdBy', 'name email phone');

    // Log admin action
    console.log(`
========================================
✅ PRODUCT CREATED SUCCESSFULLY
========================================
Product Name: ${product.name}
Product SKU: ${product.sku}
Category: ${product.category}
Price: ₹${product.price}
Stock: ${product.stock}
Created By: ${admin.name} (${admin.email})
Created At: ${new Date().toLocaleString()}
========================================
`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        image: product.image,
        sku: product.sku,
        tags: product.tags,
        isActive: product.isActive,
        createdBy: product.createdBy,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
    });
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Search by name or SKU
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: searchRegex }, { sku: searchRegex }];
    }

    const products = await Product.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/admin/products/:id
// @access  Private/Admin
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id).populate(
      'createdBy',
      'name email phone'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin (creator only or super admin)
export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if admin owns the product or is super admin
    if (
      product.createdBy.toString() !== req.user.id &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update products you created',
      });
    }

    const {
      name,
      description,
      price,
      category,
      stock,
      images,
      sku,
      tags,
      isActive,
    } = req.body;

    // Check if SKU is being changed and already exists
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists',
        });
      }
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (images !== undefined) product.images = images;
    if (sku !== undefined) product.sku = sku.toUpperCase();
    if (tags !== undefined) product.tags = tags;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    // Log admin action
    console.log(`Admin ${req.user.email} updated product ${product.sku}`);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin (creator only or super admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if admin owns the product or is super admin
    if (
      product.createdBy.toString() !== req.user.id &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete products you created',
      });
    }

    const productName = product.name;
    const productSku = product.sku;

    await Product.findByIdAndDelete(id);

    // Log admin action
    console.log(`Admin ${req.user.email} deleted product ${productSku}`);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      deletedProduct: {
        id: product._id,
        name: productName,
        sku: productSku,
      },
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
    });
  }
};

import { validationResult } from 'express-validator';
import FishProduct from '../models/FishProduct.js';

// @desc    Create a new fish product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, category, price, stock, description, images } = req.body;

    // Check if product with same name and category already exists
    const existingProduct = await FishProduct.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
      category
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: `A product named "${name}" in the "${category}" category already exists`
      });
    }

    // Create new product
    const newProduct = new FishProduct({
      name: name.trim(),
      category,
      price,
      stock,
      description: description ? description.trim() : '',
      images: images && Array.isArray(images) ? images.filter(img => img.trim()) : [],
      createdBy: req.user.email
    });

    // Save product to database
    await newProduct.save();

    // Log admin action
    console.log(`Admin ${req.user.email} created product: ${newProduct.name} (ID: ${newProduct._id})`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: newProduct._id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        stock: newProduct.stock,
        description: newProduct.description,
        images: newProduct.images,
        createdBy: newProduct.createdBy,
        isAvailable: newProduct.isAvailable,
        createdAt: newProduct.createdAt,
        updatedAt: newProduct.updatedAt
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

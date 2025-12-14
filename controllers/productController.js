/**
 * Product Controller
 * Handles HTTP requests and responses for product operations
 */

import { validationResult } from 'express-validator';
import {
  getAllProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  toggleProductAvailabilityService,
} from '../services/productService.js';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendPaginatedSuccess,
} from '../utils/helpers/responseHelper.js';
import { isValidObjectId } from '../utils/helpers/validationHelper.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants/index.js';

// @desc    Get all fish products with pagination and filters
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const result = await getAllProductsService(req.query);

    return sendPaginatedSuccess(
      res,
      result.products,
      result.pagination,
      result.stats,
      SUCCESS_MESSAGES.DATA_RETRIEVED
    );
  } catch (error) {
    console.error('Get all products error:', error);
    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Get single fish product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return sendError(res, 'Invalid product ID format', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await getProductByIdService(id);

    return sendSuccess(res, result.product, SUCCESS_MESSAGES.DATA_RETRIEVED);
  } catch (error) {
    console.error('Get product by ID error:', error);

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'Product');
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Create a new fish product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    // Check validation errors from middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const result = await createProductService(req.body, req.user.email);

    return sendSuccess(res, result.product, result.message, HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Create product error:', error);

    if (error.message.includes('already exists')) {
      return sendError(res, error.message, HTTP_STATUS.CONFLICT);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Update a fish product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    // Check validation errors from middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return sendError(res, 'Invalid product ID format', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await updateProductService(id, req.body, req.user.email);

    return sendSuccess(res, result.product, result.message);
  } catch (error) {
    console.error('Update product error:', error);

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'Product');
    }

    if (error.message.includes('already exists')) {
      return sendError(res, error.message, HTTP_STATUS.CONFLICT);
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Delete a fish product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return sendError(res, 'Invalid product ID format', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await deleteProductService(id, req.user.email);

    return sendSuccess(res, null, result.message);
  } catch (error) {
    console.error('Delete product error:', error);

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'Product');
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Toggle product availability (hide/show)
// @route   PATCH /api/products/:id/availability
// @access  Private/Admin
export const toggleProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return sendError(res, 'Invalid product ID format', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await toggleProductAvailabilityService(id, req.user.email);

    return sendSuccess(res, result.product, result.message);
  } catch (error) {
    console.error('Toggle availability error:', error);

    if (error.message.includes('not found')) {
      return sendNotFound(res, 'Product');
    }

    return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

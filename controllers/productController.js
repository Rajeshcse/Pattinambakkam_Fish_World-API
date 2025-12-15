import { validationResult } from 'express-validator';
import {
  getAllProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  toggleProductAvailabilityService
} from '../services/productService.js';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendPaginatedSuccess
} from '../utils/helpers/responseHelper.js';
import { isValidObjectId } from '../utils/helpers/validationHelper.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants/index.js';

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

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

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

export const createProduct = async (req, res) => {
  try {
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

export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { id } = req.params;

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

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

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

export const toggleProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;

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

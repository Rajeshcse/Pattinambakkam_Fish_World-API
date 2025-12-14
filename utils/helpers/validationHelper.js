/**
 * Validation Helper Utilities
 * Custom validation functions and sanitization
 */

import mongoose from 'mongoose';
import { isValidEmail, isValidPhone } from './stringHelper.js';

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid and missing fields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];

  requiredFields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Validate price value
 * @param {*} price - Price to validate
 * @returns {Object} Validation result
 */
export const validatePrice = (price) => {
  const numPrice = parseFloat(price);

  if (isNaN(numPrice)) {
    return { isValid: false, message: 'Price must be a number' };
  }

  if (numPrice <= 0) {
    return { isValid: false, message: 'Price must be greater than 0' };
  }

  if (numPrice > 100000) {
    return { isValid: false, message: 'Price cannot exceed ₹1,00,000' };
  }

  return { isValid: true, value: numPrice };
};

/**
 * Validate stock value
 * @param {*} stock - Stock to validate
 * @returns {Object} Validation result
 */
export const validateStock = (stock) => {
  const numStock = parseInt(stock);

  if (isNaN(numStock)) {
    return { isValid: false, message: 'Stock must be a number' };
  }

  if (numStock < 0) {
    return { isValid: false, message: 'Stock cannot be negative' };
  }

  if (numStock > 10000) {
    return { isValid: false, message: 'Stock cannot exceed 10,000 units' };
  }

  return { isValid: true, value: numStock };
};

/**
 * Validate fish category
 * @param {string} category - Category to validate
 * @returns {Object} Validation result
 */
export const validateFishCategory = (category) => {
  const validCategories = ['Fish', 'Prawn', 'Crab', 'Squid'];

  if (!category || typeof category !== 'string') {
    return { isValid: false, message: 'Category is required' };
  }

  if (!validCategories.includes(category)) {
    return {
      isValid: false,
      message: `Category must be one of: ${validCategories.join(', ')}`,
    };
  }

  return { isValid: true, value: category };
};

/**
 * Validate and sanitize product name
 * @param {string} name - Product name to validate
 * @returns {Object} Validation result
 */
export const validateProductName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'Product name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, message: 'Product name must be at least 2 characters' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, message: 'Product name cannot exceed 100 characters' };
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9\s\-\.]+$/.test(trimmedName)) {
    return { isValid: false, message: 'Product name contains invalid characters' };
  }

  return { isValid: true, value: trimmedName };
};

/**
 * Validate image URLs array
 * @param {Array} images - Array of image URLs
 * @returns {Object} Validation result
 */
export const validateImages = (images) => {
  if (!images) {
    return { isValid: true, value: [] };
  }

  if (!Array.isArray(images)) {
    return { isValid: false, message: 'Images must be an array' };
  }

  if (images.length > 10) {
    return { isValid: false, message: 'Cannot add more than 10 images per product' };
  }

  const validImages = [];
  const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    if (typeof image !== 'string') {
      return { isValid: false, message: `Image ${i + 1} must be a string URL` };
    }

    const trimmedImage = image.trim();

    if (trimmedImage && !urlPattern.test(trimmedImage)) {
      return { isValid: false, message: `Image ${i + 1} must be a valid image URL` };
    }

    if (trimmedImage) {
      validImages.push(trimmedImage);
    }
  }

  return { isValid: true, value: validImages };
};

/**
 * Validate pagination parameters
 * @param {*} page - Page number
 * @param {*} limit - Items per page
 * @returns {Object} Validation result with sanitized values
 */
export const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  const sanitizedPage = Math.max(1, pageNum);
  const sanitizedLimit = Math.min(Math.max(1, limitNum), 100); // Max 100 items per page

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    skip: (sanitizedPage - 1) * sanitizedLimit,
  };
};

/**
 * Validate user role
 * @param {string} role - Role to validate
 * @returns {Object} Validation result
 */
export const validateUserRole = (role) => {
  const validRoles = ['user', 'admin'];

  if (!role || typeof role !== 'string') {
    return { isValid: false, message: 'Role is required' };
  }

  if (!validRoles.includes(role)) {
    return {
      isValid: false,
      message: `Role must be one of: ${validRoles.join(', ')}`,
    };
  }

  return { isValid: true, value: role };
};

/**
 * Sanitize user input
 * @param {Object} data - Data object to sanitize
 * @returns {Object} Sanitized data
 */
export const sanitizeUserInput = (data) => {
  const sanitized = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (typeof value === 'string') {
      // Remove HTML tags and trim whitespace
      sanitized[key] = value.replace(/<[^>]*>/g, '').trim();
    } else if (Array.isArray(value)) {
      // Sanitize array of strings
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? item.replace(/<[^>]*>/g, '').trim() : item
      );
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

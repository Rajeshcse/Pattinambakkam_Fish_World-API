import mongoose from 'mongoose';
import { isValidEmail, isValidPhone } from './stringHelper.js';

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];

  requiredFields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

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

export const validateFishCategory = (category) => {
  const validCategories = ['Fish', 'Prawn', 'Crab', 'Squid'];

  if (!category || typeof category !== 'string') {
    return { isValid: false, message: 'Category is required' };
  }

  if (!validCategories.includes(category)) {
    return {
      isValid: false,
      message: `Category must be one of: ${validCategories.join(', ')}`
    };
  }

  return { isValid: true, value: category };
};

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

  if (!/^[a-zA-Z0-9\s\-\.\(\)]+$/.test(trimmedName)) {
    return { isValid: false, message: 'Product name contains invalid characters' };
  }

  return { isValid: true, value: trimmedName };
};

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

export const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  const sanitizedPage = Math.max(1, pageNum);
  const sanitizedLimit = Math.min(Math.max(1, limitNum), 100);

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    skip: (sanitizedPage - 1) * sanitizedLimit
  };
};

export const validateUserRole = (role) => {
  const validRoles = ['user', 'admin'];

  if (!role || typeof role !== 'string') {
    return { isValid: false, message: 'Role is required' };
  }

  if (!validRoles.includes(role)) {
    return {
      isValid: false,
      message: `Role must be one of: ${validRoles.join(', ')}`
    };
  }

  return { isValid: true, value: role };
};

export const sanitizeUserInput = (data) => {
  const sanitized = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (typeof value === 'string') {
      sanitized[key] = value.replace(/<[^>]*>/g, '').trim();
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? item.replace(/<[^>]*>/g, '').trim() : item
      );
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

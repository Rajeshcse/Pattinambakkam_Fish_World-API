import { body } from 'express-validator';

export const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .bail() 
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .bail() 
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .bail()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number '),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

export const validateLogin = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  // Custom validation to ensure either email or phone is provided
  body('email').custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('Please provide either email or phone number');
    }
    return true;
  })
];

export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .bail()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number starting with 6, 7, 8, or 9'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

export const validateVerifyEmail = [
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .bail()
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

export const validateForgotPassword = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

export const validateResetPassword = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .bail()
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .bail()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('newPassword').custom((value, { req }) => {
    if (value === req.body.currentPassword) {
      throw new Error('New password must be different from current password');
    }
    return true;
  })
];

export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

export const validateLogout = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// Admin validation rules

export const validateAdminUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .bail()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number starting with 6, 7, 8, or 9'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),

  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean value')
];

export const validateAdminChangeRole = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .bail()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
];

export const validateAdminBulkAction = [
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .bail()
    .isIn(['delete', 'verify', 'unverify'])
    .withMessage('Action must be one of: delete, verify, unverify'),

  body('userIds')
    .notEmpty()
    .withMessage('User IDs array is required')
    .bail()
    .isArray({ min: 1 })
    .withMessage('User IDs must be a non-empty array')
    .bail()
    .custom((userIds) => {
      if (userIds.length > 100) {
        throw new Error('Cannot perform bulk action on more than 100 users at once');
      }
      return true;
    })
];

// Product validation rules

export const validateCreateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .bail()
    .isIn(['Vanjaram', 'Prawn', 'Crab', 'Squid'])
    .withMessage('Category must be one of: Vanjaram, Prawn, Crab, Squid'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .bail()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a number greater than 0'),

  body('stock')
    .notEmpty()
    .withMessage('Stock quantity is required')
    .bail()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .bail()
    .custom((images) => {
      if (images && images.length > 10) {
        throw new Error('Cannot add more than 10 images per product');
      }
      return true;
    })
];
/**
 * Error Message Constants
 * Centralized error messages for consistency across the application
 */

// Authentication & Authorization Errors
export const AUTH_ERRORS = {
  TOKEN_MISSING: 'Access denied. No token provided',
  TOKEN_INVALID: 'Access denied. Invalid token',
  TOKEN_EXPIRED: 'Access denied. Token has expired',
  INVALID_CREDENTIALS: 'Invalid email/phone or password',
  INSUFFICIENT_PERMISSIONS: 'Access denied. Insufficient permissions',
  ACCOUNT_NOT_VERIFIED: 'Please verify your account first',
  ACCOUNT_LOCKED: 'Account has been temporarily locked',
  PASSWORD_INCORRECT: 'Current password is incorrect',
  SESSION_EXPIRED: 'Session has expired. Please login again'
};

// Validation Errors
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PHONE: 'Please provide a valid 10-digit phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
  PASSWORD_WEAK: 'Password must contain at least one uppercase, lowercase, and number',
  NAME_TOO_SHORT: 'Name must be at least 2 characters long',
  NAME_TOO_LONG: 'Name cannot exceed 50 characters',
  INVALID_OBJECT_ID: 'Invalid ID format',
  INVALID_CATEGORY: 'Invalid category selected',
  PRICE_INVALID: 'Price must be a positive number',
  STOCK_INVALID: 'Stock must be a non-negative number'
};

// Resource Errors
export const RESOURCE_ERRORS = {
  USER_NOT_FOUND: 'User not found',
  PRODUCT_NOT_FOUND: 'Product not found',
  EMAIL_EXISTS: 'Email already exists',
  PHONE_EXISTS: 'Phone number already exists',
  PRODUCT_EXISTS: 'Product with this name already exists in the category',
  RESOURCE_NOT_FOUND: 'Requested resource not found',
  DUPLICATE_ENTRY: 'Duplicate entry detected'
};

// Server Errors
export const SERVER_ERRORS = {
  INTERNAL_ERROR: 'Internal server error occurred',
  DATABASE_ERROR: 'Database operation failed',
  NETWORK_ERROR: 'Network connection error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later'
};

// Operation Errors
export const OPERATION_ERRORS = {
  CREATE_FAILED: 'Failed to create resource',
  UPDATE_FAILED: 'Failed to update resource',
  DELETE_FAILED: 'Failed to delete resource',
  FETCH_FAILED: 'Failed to fetch data',
  UPLOAD_FAILED: 'File upload failed',
  EMAIL_SEND_FAILED: 'Failed to send email',
  OTP_INVALID: 'Invalid or expired OTP',
  OTP_EXPIRED: 'OTP has expired. Please request a new one'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  OTP_SENT: 'OTP sent successfully',
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
  DATA_RETRIEVED: 'Data retrieved successfully'
};

// Combined Error Messages for easy access
export const ERROR_MESSAGES = {
  ...AUTH_ERRORS,
  ...VALIDATION_ERRORS,
  ...RESOURCE_ERRORS,
  ...SERVER_ERRORS,
  ...OPERATION_ERRORS,
  INTERNAL_SERVER_ERROR: SERVER_ERRORS.INTERNAL_ERROR
};
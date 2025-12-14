/**
 * Error Handling Middleware
 * Central error processing for the application
 */

import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';
import { sendError } from '../utils/helpers/responseHelper.js';

/**
 * Global Error Handler
 * Catches and processes all application errors
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Global Error Handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate ${field}: ${value} already exists`;
    return sendError(res, message, HTTP_STATUS.CONFLICT);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again';
    return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again';
    return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests from this IP, please try again later';
    return sendError(res, message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  // Default server error
  return sendError(
    res,
    error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};

/**
 * 404 Not Found Handler
 * Handles routes that don't exist
 */
export const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  sendError(res, message, HTTP_STATUS.NOT_FOUND);
};

/**
 * Async Error Wrapper
 * Wraps async functions to catch errors automatically
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom Error Class
 * For creating custom application errors
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Development Error Handler
 * Provides detailed error information in development
 */
export const developmentErrorHandler = (err, req, res, next) => {
  console.error('Development Error:', err);

  res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
};

/**
 * Production Error Handler
 * Provides minimal error information in production
 */
export const productionErrorHandler = (err, req, res, next) => {
  // Only send error details if it's an operational error
  if (err.isOperational) {
    sendError(res, err.message, err.statusCode);
  } else {
    // Log error for internal monitoring
    console.error('Production Error:', err);

    // Send generic message to client
    sendError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

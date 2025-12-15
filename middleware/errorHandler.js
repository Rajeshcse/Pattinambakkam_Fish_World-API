import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';
import { sendError } from '../utils/helpers/responseHelper.js';

export const globalErrorHandler = (err, req, res, next) => {
  console.error('Global Error Handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate ${field}: ${value} already exists`;
    return sendError(res, message, HTTP_STATUS.CONFLICT);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again';
    return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again';
    return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.status === 429) {
    const message = 'Too many requests from this IP, please try again later';
    return sendError(res, message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  return sendError(
    res,
    error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};

export const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  sendError(res, message, HTTP_STATUS.NOT_FOUND);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

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

export const productionErrorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    sendError(res, err.message, err.statusCode);
  } else {
    console.error('Production Error:', err);

    sendError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

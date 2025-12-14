/**
 * Response Helper Utilities
 * Standardized API response helpers for consistent response formatting
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (
  res,
  data = null,
  message = 'Operation successful',
  statusCode = 200
) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    if (Array.isArray(data)) {
      response.data = data;
      response.count = data.length;
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Array} errors - Validation errors array
 */
export const sendError = (
  res,
  message = 'Something went wrong',
  statusCode = 500,
  errors = null
) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination object
 * @param {Object} stats - Optional statistics
 * @param {string} message - Success message
 */
export const sendPaginatedSuccess = (
  res,
  data,
  pagination,
  stats = null,
  message = 'Data retrieved successfully'
) => {
  const response = {
    success: true,
    message,
    data,
    pagination
  };

  if (stats) {
    response.stats = stats;
  }

  return res.status(200).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors from express-validator
 */
export const sendValidationError = (res, errors) => {
  return sendError(res, 'Validation failed', 400, errors);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name that wasn't found
 */
export const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, 404);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Custom unauthorized message
 */
export const sendUnauthorized = (res, message = 'Access denied. Authentication required') => {
  return sendError(res, message, 401);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Custom forbidden message
 */
export const sendForbidden = (res, message = 'Access denied. Insufficient permissions') => {
  return sendError(res, message, 403);
};

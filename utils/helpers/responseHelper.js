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

export const sendValidationError = (res, errors) => {
  return sendError(res, 'Validation failed', 400, errors);
};

export const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, 404);
};

export const sendUnauthorized = (res, message = 'Access denied. Authentication required') => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res, message = 'Access denied. Insufficient permissions') => {
  return sendError(res, message, 403);
};

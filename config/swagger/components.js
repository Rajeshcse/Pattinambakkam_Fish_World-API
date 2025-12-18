export const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter your JWT token in the format: Bearer <token>'
  }
};

export const responses = {
  UnauthorizedError: {
    description: 'Access token is missing or invalid',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Access denied. No token provided' }
          }
        }
      }
    }
  },

  ForbiddenError: {
    description: 'Insufficient permissions for this action',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Access denied. Insufficient permissions.' }
          }
        }
      }
    }
  },

  ValidationError: {
    description: 'Validation error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ValidationError' }
      }
    }
  },

  ServerError: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Server error' }
          }
        }
      }
    }
  },

  BadRequest: {
    description: 'Bad request - invalid input',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Invalid request data' }
          }
        }
      }
    }
  },

  Unauthorized: {
    description: 'Authentication required',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Authentication required' }
          }
        }
      }
    }
  },

  Forbidden: {
    description: 'Access forbidden - insufficient permissions',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Access denied. Admin role required.' }
          }
        }
      }
    }
  }
};

export const tags = [
  {
    name: 'Authentication',
    description: 'User authentication endpoints (register, login, logout, token refresh)'
  },
  {
    name: 'Email Verification',
    description: 'Email verification with OTP'
  },
  {
    name: 'Password Management',
    description: 'Password reset and change operations'
  },
  {
    name: 'User Profile',
    description: 'User profile management'
  },
  {
    name: 'Admin Management',
    description: 'Admin dashboard and overview statistics'
  },
  {
    name: 'Admin - User Management',
    description: 'User CRUD operations (admin only)'
  },
  {
    name: 'Admin - Role Management',
    description: 'User role and permission management (admin only)'
  },
  {
    name: 'Admin - Bulk Operations',
    description: 'Bulk user operations (admin only)'
  },
  {
    name: 'Admin - Product Management',
    description: 'Fish product CRUD operations (admin only)'
  },
  {
    name: 'Products',
    description: 'Fish product listing and details for customers'
  },
  {
    name: 'Cart',
    description: 'Shopping cart management for authenticated users'
  },
  {
    name: 'Orders',
    description: 'Order placement and management for authenticated users'
  },
  {
    name: 'Admin - Orders',
    description: 'Order management and status updates (admin only)'
  },
  {
    name: 'Phone Verification',
    description: 'Phone number verification with OTP'
  },
  {
    name: 'File Upload',
    description: 'File upload operations (product images)'
  }
];

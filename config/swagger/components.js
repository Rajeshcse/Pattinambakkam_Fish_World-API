// Reusable Swagger Components (Security Schemes, Responses, etc.)

export const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter your JWT token in the format: Bearer <token>',
  },
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
            message: {
              type: 'string',
              example: 'Access denied. No token provided',
            },
          },
        },
      },
    },
  },

  ForbiddenError: {
    description: 'Insufficient permissions for this action',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: {
              type: 'string',
              example: 'Access denied. Insufficient permissions.',
            },
          },
        },
      },
    },
  },

  ValidationError: {
    description: 'Validation error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ValidationError' },
      },
    },
  },

  ServerError: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Server error' },
          },
        },
      },
    },
  },
};

export const tags = [
  {
    name: 'Authentication',
    description:
      'User authentication endpoints (register, login, logout, token refresh)',
  },
  {
    name: 'Email Verification',
    description: 'Email verification with OTP',
  },
  {
    name: 'Password Management',
    description: 'Password reset and change operations',
  },
  {
    name: 'User Profile',
    description: 'User profile management',
  },
  {
    name: 'Admin Management',
    description: 'Admin dashboard and overview statistics',
  },
  {
    name: 'Admin - User Management',
    description: 'User CRUD operations (admin only)',
  },
  {
    name: 'Admin - Role Management',
    description: 'User role and permission management (admin only)',
  },
  {
    name: 'Admin - Bulk Operations',
    description: 'Bulk user operations (admin only)',
  },
  {
    name: 'Products',
    description:
      'Product management (create, read, update, delete with auto-generated descriptions and SKUs)',
  },
];

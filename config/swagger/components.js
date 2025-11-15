// Reusable Swagger Components (Security Schemes, Responses, etc.)

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
  }
];

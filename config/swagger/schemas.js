// Reusable Swagger Schemas

export const schemas = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      phone: { type: 'string', example: '9876543210' },
      role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
      isVerified: { type: 'boolean', example: false },
      avatar: { type: 'string', example: '' },
      createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
    }
  },

  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Error message' }
    }
  },

  ValidationError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Validation failed' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            msg: { type: 'string' },
            path: { type: 'string' },
            location: { type: 'string' }
          }
        }
      }
    }
  }
};

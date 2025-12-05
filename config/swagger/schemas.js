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
      isEmailVerified: { type: 'boolean', example: false },
      avatar: { type: 'string', example: '' },
      createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
    }
  },

  UserSummary: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
      isEmailVerified: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
    }
  },

  Pagination: {
    type: 'object',
    properties: {
      currentPage: { type: 'number', example: 1 },
      totalPages: { type: 'number', example: 10 },
      totalUsers: { type: 'number', example: 95 },
      hasNextPage: { type: 'boolean', example: true },
      hasPrevPage: { type: 'boolean', example: false }
    }
  },

  UserStats: {
    type: 'object',
    properties: {
      totalUsers: { type: 'number', example: 150 },
      verifiedUsers: { type: 'number', example: 120 },
      adminUsers: { type: 'number', example: 3 },
      recentUsers: { type: 'number', example: 25 }
    }
  },

  // Standardized Response Schemas
  StandardResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Operation completed successfully' },
      data: { type: 'object', description: 'Response data varies by endpoint' }
    }
  },

  PaginatedResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Data retrieved successfully' },
      data: {
        type: 'array',
        description: 'Array of data items'
      },
      pagination: { $ref: '#/components/schemas/Pagination' },
      stats: { type: 'object', description: 'Additional statistics' }
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
  },

  FishProduct: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'Fresh Vanjaram' },
      category: { type: 'string', enum: ['Fish', 'Prawn', 'Crab', 'Squid'], example: 'Fish' },
      price: { type: 'number', example: 450 },
      stock: { type: 'number', example: 25 },
      description: { type: 'string', example: 'High quality fresh Vanjaram fish sourced from local fishermen' },
      images: {
        type: 'array',
        items: { type: 'string' },
        example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      },
      createdBy: { type: 'string', example: 'admin@example.com' },
      isAvailable: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
    }
  },

  FishProductCreate: {
    type: 'object',
    required: ['name', 'category', 'price', 'stock'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100, example: 'Fresh Vanjaram' },
      category: { type: 'string', enum: ['Fish', 'Prawn', 'Crab', 'Squid'], example: 'Fish' },
      price: { type: 'number', minimum: 0.01, example: 450 },
      stock: { type: 'number', minimum: 0, example: 25 },
      description: { type: 'string', maxLength: 500, example: 'High quality fresh Vanjaram fish' },
      images: {
        type: 'array',
        items: { type: 'string' },
        example: ['https://example.com/image1.jpg']
      }
    }
  },

  FishProductSummary: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'Fresh Vanjaram' },
      category: { type: 'string', enum: ['Fish', 'Prawn', 'Crab', 'Squid'], example: 'Fish' },
      price: { type: 'number', example: 450 },
      stock: { type: 'number', example: 25 },
      isAvailable: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
    }
  },

  FishProductUpdate: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100, example: 'Fresh Vanjaram - Premium' },
      category: { type: 'string', enum: ['Fish', 'Prawn', 'Crab', 'Squid'], example: 'Fish' },
      price: { type: 'number', minimum: 0.01, example: 475 },
      stock: { type: 'number', minimum: 0, example: 30 },
      description: { type: 'string', maxLength: 500, example: 'Premium quality Vanjaram fish' },
      images: {
        type: 'array',
        items: { type: 'string' },
        example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      },
      isAvailable: { type: 'boolean', example: true }
    }
  }
};

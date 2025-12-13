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
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
      },
    },
  },

  UserSummary: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
      isVerified: { type: 'boolean', example: true },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
      },
    },
  },

  Pagination: {
    type: 'object',
    properties: {
      currentPage: { type: 'number', example: 1 },
      totalPages: { type: 'number', example: 10 },
      totalUsers: { type: 'number', example: 95 },
      hasNextPage: { type: 'boolean', example: true },
      hasPrevPage: { type: 'boolean', example: false },
    },
  },

  UserStats: {
    type: 'object',
    properties: {
      totalUsers: { type: 'number', example: 150 },
      verifiedUsers: { type: 'number', example: 120 },
      adminUsers: { type: 'number', example: 3 },
      recentUsers: { type: 'number', example: 25 },
    },
  },

  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Error message' },
    },
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
            location: { type: 'string' },
          },
        },
      },
    },
  },

  Product: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'Fresh Mackerel Fish' },
      description: {
        type: 'string',
        example:
          'Fresh 🐟 Fish selected daily for great taste and quality you can trust. Kept whole for better flavour and freshness. Perfect for simple fry or healthy home cooking 🍽️.',
      },
      category: {
        type: 'string',
        enum: [
          'Fish',
          'Shrimp',
          'Crab',
          'Lobster',
          'Shellfish',
          'Accessories',
          'Food',
          'Other',
        ],
        example: 'Fish',
      },
      price: { type: 'number', example: 350 },
      stock: { type: 'number', example: 100 },
      type: {
        type: 'string',
        enum: ['Uncleaned', 'Cleaned'],
        example: 'Uncleaned',
      },
      sku: {
        type: 'string',
        example: 'FISH123456',
        description: 'Auto-generated Stock Keeping Unit',
      },
      images: {
        type: 'array',
        items: { type: 'string' },
        example: ['https://example.com/product.jpg'],
      },
      wholeFishCount: { type: 'number', example: 5 },
      cutPiecesCount: { type: 'number', example: null },
      beforeCleanImage: { type: 'string', example: null },
      afterCleanImage: { type: 'string', example: null },
      rating: { type: 'number', example: 0, minimum: 0, maximum: 5 },
      reviewCount: { type: 'number', example: 0 },
      tags: {
        type: 'array',
        items: { type: 'string' },
        example: ['fresh', 'uncleaned'],
      },
      isActive: { type: 'boolean', example: true },
      createdBy: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          name: { type: 'string', example: 'Admin User' },
          email: { type: 'string', example: 'admin@example.com' },
          phone: { type: 'string', example: '9876543210' },
        },
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-12-13T08:35:28.484Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-12-13T08:35:28.484Z',
      },
    },
  },
};

export default schemas;

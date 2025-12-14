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
  },

  // Cart Schemas
  CartItem: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      product: { $ref: '#/components/schemas/FishProduct' },
      quantity: { type: 'number', minimum: 1, example: 2 },
      addedAt: { type: 'string', format: 'date-time', example: '2025-12-06T10:30:00.000Z' }
    }
  },

  Cart: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      user: { type: 'string', example: '507f1f77bcf86cd799439012' },
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/CartItem' }
      },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-12-06T10:30:00.000Z' }
    }
  },

  CartResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Cart retrieved successfully' },
      data: { $ref: '#/components/schemas/Cart' }
    }
  },

  // Order Schemas
  OrderItem: {
    type: 'object',
    properties: {
      product: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'Fresh Vanjaram' },
      price: { type: 'number', example: 450 },
      quantity: { type: 'number', example: 2 },
      subtotal: { type: 'number', example: 900 }
    }
  },

  DeliveryDetails: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        minLength: 10,
        maxLength: 300,
        example: '123 Beach Road, Pattinambakkam, Chennai - 600041'
      },
      phone: {
        type: 'string',
        pattern: '^[6-9]\\d{9}$',
        example: '9994072395'
      },
      deliveryDate: {
        type: 'string',
        format: 'date',
        example: '2025-12-07'
      },
      deliveryTime: {
        type: 'string',
        enum: ['08:00-12:00', '12:00-16:00', '16:00-20:00'],
        example: '16:00-20:00'
      }
    }
  },

  Order: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      orderId: { type: 'string', example: 'ORD-20251206-001' },
      user: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      },
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/OrderItem' }
      },
      totalAmount: { type: 'number', example: 1800.00 },
      deliveryDetails: { $ref: '#/components/schemas/DeliveryDetails' },
      orderNotes: { type: 'string', example: 'Please clean and cut into medium pieces' },
      paymentMethod: { type: 'string', example: 'Google Pay' },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
        example: 'pending'
      },
      createdAt: { type: 'string', format: 'date-time', example: '2025-12-06T10:30:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-12-06T10:30:00.000Z' }
    }
  },

  OrderResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Order created successfully' },
      data: { $ref: '#/components/schemas/Order' }
    }
  }
};

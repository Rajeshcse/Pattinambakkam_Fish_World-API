// Product Management Endpoints Swagger Documentation

export const productPaths = {
  '/api/admin/products': {
    post: {
      tags: ['Products'],
      summary: 'Create a new product',
      description:
        'Create a new product with auto-generated description and SKU. Description and SKU will be auto-generated if not provided.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'category', 'price', 'stock'],
              properties: {
                name: {
                  type: 'string',
                  minLength: 3,
                  maxLength: 100,
                  example: 'Fresh Mackerel Fish',
                  description: 'Product name (3-100 characters)',
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
                  description: 'Product category',
                },
                price: {
                  type: 'number',
                  minimum: 0,
                  example: 350,
                  description: 'Product price in rupees',
                },
                stock: {
                  type: 'number',
                  minimum: 0,
                  example: 100,
                  description: 'Product stock quantity',
                },
                type: {
                  type: 'string',
                  enum: ['Uncleaned', 'Cleaned'],
                  example: 'Uncleaned',
                  description:
                    'Product type (required for Fish, Shrimp, Crab, Lobster, Shellfish)',
                },
                description: {
                  type: 'string',
                  minLength: 10,
                  maxLength: 1000,
                  example: 'Fresh fish selected daily for great taste',
                  description:
                    'Product description (auto-generated if not provided)',
                },
                sku: {
                  type: 'string',
                  example: 'FISH001',
                  description:
                    'Stock Keeping Unit (auto-generated if not provided, format: CATEGORYCODE + timestamp)',
                },
                images: {
                  type: 'array',
                  items: { type: 'string', format: 'uri' },
                  example: ['https://example.com/product.jpg'],
                  description: 'Product images URLs (optional)',
                },
                wholeFishCount: {
                  type: 'number',
                  minimum: 0,
                  example: 5,
                  description: 'Number of whole fish (for Uncleaned type)',
                },
                cutPiecesCount: {
                  type: 'number',
                  minimum: 0,
                  example: 8,
                  description: 'Number of cut pieces (for Cleaned type)',
                },
                beforeCleanImage: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://example.com/before-clean.jpg',
                  description: 'Image before cleaning (for Cleaned type)',
                },
                afterCleanImage: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://example.com/after-clean.jpg',
                  description: 'Image after cleaning (for Cleaned type)',
                },
                tags: {
                  type: 'array',
                  maxItems: 10,
                  items: { type: 'string' },
                  example: ['fresh', 'uncleaned', 'local'],
                  description: 'Product tags (max 10)',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Product created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Product created successfully',
                  },
                  product: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        403: {
          description: 'Forbidden - Email or phone not verified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example:
                      'You must verify both email and phone number to create products',
                  },
                  verified: {
                    type: 'object',
                    properties: {
                      email: { type: 'boolean' },
                      phone: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    get: {
      tags: ['Products'],
      summary: 'Get all products',
      description:
        'Retrieve all products with pagination and filtering options',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', example: 1 },
          description: 'Page number (default: 1)',
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', example: 10 },
          description: 'Items per page (default: 10)',
        },
        {
          name: 'category',
          in: 'query',
          schema: { type: 'string', example: 'Fish' },
          description: 'Filter by category',
        },
        {
          name: 'isActive',
          in: 'query',
          schema: { type: 'boolean', example: true },
          description: 'Filter by active status',
        },
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string', example: 'Mackerel' },
          description: 'Search by product name or SKU',
        },
      ],
      responses: {
        200: {
          description: 'Products retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  products: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Product' },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentPage: { type: 'integer', example: 1 },
                      totalPages: { type: 'integer', example: 5 },
                      totalProducts: { type: 'integer', example: 47 },
                      hasNextPage: { type: 'boolean', example: true },
                      hasPrevPage: { type: 'boolean', example: false },
                    },
                  },
                },
              },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  '/api/admin/products/{id}': {
    get: {
      tags: ['Products'],
      summary: 'Get product by ID',
      description: 'Retrieve a specific product by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', example: '507f1f77bcf86cd799439011' },
          description: 'Product ID (MongoDB ObjectId)',
        },
      ],
      responses: {
        200: {
          description: 'Product retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  product: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid product ID',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid product ID' },
                },
              },
            },
          },
        },
        404: {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Product not found' },
                },
              },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['Products'],
      summary: 'Update product',
      description: 'Update a product (creator or super admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', example: '507f1f77bcf86cd799439011' },
          description: 'Product ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 3, maxLength: 100 },
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
                },
                price: { type: 'number', minimum: 0 },
                stock: { type: 'number', minimum: 0 },
                type: { type: 'string', enum: ['Uncleaned', 'Cleaned'] },
                description: { type: 'string', minLength: 10, maxLength: 1000 },
                images: { type: 'array', items: { type: 'string' } },
                wholeFishCount: { type: 'number', minimum: 0 },
                cutPiecesCount: { type: 'number', minimum: 0 },
                beforeCleanImage: { type: 'string' },
                afterCleanImage: { type: 'string' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  maxItems: 10,
                },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Product updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Product updated successfully',
                  },
                  product: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        403: {
          description: 'Forbidden - Only creator or super admin can update',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'You can only update products you created',
                  },
                },
              },
            },
          },
        },
        404: { description: 'Product not found' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['Products'],
      summary: 'Delete product',
      description: 'Delete a product (creator or super admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', example: '507f1f77bcf86cd799439011' },
          description: 'Product ID',
        },
      ],
      responses: {
        200: {
          description: 'Product deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Product deleted successfully',
                  },
                  deletedProduct: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      sku: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        403: {
          description: 'Forbidden - Only creator or super admin can delete',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'You can only delete products you created',
                  },
                },
              },
            },
          },
        },
        404: { description: 'Product not found' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};

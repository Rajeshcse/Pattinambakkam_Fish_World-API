export const productPaths = {
  '/api/products': {
    get: {
      tags: ['Admin - Product Management'],
      summary: 'Get all fish products with pagination and filters',
      description:
        'Retrieve paginated list of fish products with optional filtering by category, availability, price range, and search. Public endpoint - no authentication required.',
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number for pagination'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Number of products per page (max 100)'
        },
        {
          in: 'query',
          name: 'category',
          schema: { type: 'string', enum: ['Fish', 'Prawn', 'Crab', 'Squid'] },
          description: 'Filter by fish category'
        },
        {
          in: 'query',
          name: 'isAvailable',
          schema: { type: 'boolean' },
          description: 'Filter by availability status'
        },
        {
          in: 'query',
          name: 'minPrice',
          schema: { type: 'number', minimum: 0 },
          description: 'Minimum price filter'
        },
        {
          in: 'query',
          name: 'maxPrice',
          schema: { type: 'number', minimum: 0 },
          description: 'Maximum price filter'
        },
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          description: 'Search by product name or description'
        }
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
                    items: { $ref: '#/components/schemas/FishProductSummary' }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentPage: { type: 'number', example: 1 },
                      totalPages: { type: 'number', example: 5 },
                      totalProducts: { type: 'number', example: 45 },
                      hasNextPage: { type: 'boolean', example: true },
                      hasPrevPage: { type: 'boolean', example: false }
                    }
                  },
                  stats: {
                    type: 'object',
                    properties: {
                      totalProducts: { type: 'number', example: 45 },
                      availableProducts: { type: 'number', example: 42 },
                      totalStock: { type: 'number', example: 500 },
                      averagePrice: { type: 'number', example: 450.5 }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        500: { $ref: '#/components/responses/ServerError' }
      }
    },
    post: {
      tags: ['Admin - Product Management'],
      summary: 'Create a new fish product',
      description:
        'Create a new fish product listing with name, category, price, stock, and optional description and images. Admin only operation.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/FishProductCreate' },
            example: {
              name: 'Fresh Vanjaram',
              category: 'Fish',
              price: 450,
              stock: 25,
              description:
                'High quality fresh Vanjaram fish sourced from local fishermen in Pattinambakkam',
              images: ['https://example.com/vanjaram1.jpg', 'https://example.com/vanjaram2.jpg']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Fish product created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Product created successfully' },
                  product: { $ref: '#/components/schemas/FishProduct' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error or duplicate product name',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  },
  '/api/products/{id}': {
    get: {
      tags: ['Admin - Product Management'],
      summary: 'Get single fish product by ID',
      description:
        'Retrieve detailed information about a specific fish product. Public endpoint - no authentication required.',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Product MongoDB ObjectId'
        }
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
                  product: { $ref: '#/components/schemas/FishProduct' }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid product ID format',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid product ID format' }
                }
              }
            }
          }
        },
        404: {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Product not found' }
                }
              }
            }
          }
        },
        500: { $ref: '#/components/responses/ServerError' }
      }
    },
    put: {
      tags: ['Admin - Product Management'],
      summary: 'Update a fish product',
      description:
        'Update an existing fish product. All fields are optional - only provided fields will be updated. Admin only operation.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Product MongoDB ObjectId'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/FishProductUpdate' },
            example: {
              name: 'Fresh Vanjaram - Premium Quality',
              price: 475,
              stock: 30,
              description: 'Premium quality Vanjaram fish with updated pricing'
            }
          }
        }
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
                  message: { type: 'string', example: 'Product updated successfully' },
                  product: { $ref: '#/components/schemas/FishProduct' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error or duplicate product',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        404: {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Product not found' }
                }
              }
            }
          }
        },
        500: { $ref: '#/components/responses/ServerError' }
      }
    },
    delete: {
      tags: ['Admin - Product Management'],
      summary: 'Delete a fish product',
      description:
        'Permanently delete a fish product from the database. This action cannot be undone. Admin only operation.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Product MongoDB ObjectId'
        }
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
                  message: { type: 'string', example: 'Product deleted successfully' }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid product ID format',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid product ID format' }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        404: {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Product not found' }
                }
              }
            }
          }
        },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  },
  '/api/products/{id}/availability': {
    patch: {
      tags: ['Admin - Product Management'],
      summary: 'Toggle product availability (hide/show)',
      description:
        'Update the availability status of a product without deleting it. Use this to temporarily hide products from customers. Admin only operation.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Product MongoDB ObjectId'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['isAvailable'],
              properties: {
                isAvailable: {
                  type: 'boolean',
                  description: 'Set to true to show product, false to hide'
                }
              }
            },
            example: { isAvailable: false }
          }
        }
      },
      responses: {
        200: {
          description: 'Availability updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Product hidden successfully' },
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                      name: { type: 'string', example: 'Fresh Vanjaram' },
                      isAvailable: { type: 'boolean', example: false },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request - isAvailable must be boolean',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'isAvailable must be a boolean value' }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        404: {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Product not found' }
                }
              }
            }
          }
        },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  }
};

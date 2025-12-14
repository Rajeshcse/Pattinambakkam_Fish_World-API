export const orderPaths = {
  '/api/orders/create': {
    post: {
      tags: ['Orders'],
      summary: 'Create order from cart',
      description:
        'Place an order from cart items with delivery details. Validates 4-hour minimum delivery time.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['deliveryDetails'],
              properties: {
                deliveryDetails: {
                  type: 'object',
                  required: ['address', 'phone', 'deliveryDate', 'deliveryTime'],
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
                orderNotes: {
                  type: 'string',
                  maxLength: 500,
                  example: 'Please clean and cut into medium pieces'
                },
                paymentMethod: {
                  type: 'string',
                  default: 'Google Pay',
                  example: 'Google Pay'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Order created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderResponse' }
            }
          }
        },
        400: {
          description: 'Bad request - Validation failed (cart empty, delivery time < 4 hours, etc.)'
        },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/api/orders': {
    get: {
      tags: ['Orders'],
      summary: 'Get user orders',
      description: "Retrieve authenticated user's order history",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: [
              'pending',
              'confirmed',
              'preparing',
              'out-for-delivery',
              'delivered',
              'cancelled'
            ]
          },
          description: 'Filter by order status'
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'number', default: 20 },
          description: 'Number of orders to return'
        },
        {
          name: 'skip',
          in: 'query',
          schema: { type: 'number', default: 0 },
          description: 'Number of orders to skip'
        }
      ],
      responses: {
        200: {
          description: 'Orders retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Order' }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/api/orders/stats': {
    get: {
      tags: ['Orders'],
      summary: 'Get user order statistics',
      description: "Get statistics about user's orders",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Statistics retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      totalOrders: { type: 'number', example: 10 },
                      pendingOrders: { type: 'number', example: 2 },
                      deliveredOrders: { type: 'number', example: 7 },
                      cancelledOrders: { type: 'number', example: 1 },
                      totalSpent: { type: 'number', example: 5500.0 }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/api/orders/{orderId}': {
    get: {
      tags: ['Orders'],
      summary: 'Get order details',
      description: 'Get detailed information about a specific order',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'orderId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Order ID (e.g., ORD-20251206-001)',
          example: 'ORD-20251206-001'
        }
      ],
      responses: {
        200: {
          description: 'Order details retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderResponse' }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { description: 'Order not found' }
      }
    }
  },
  '/api/orders/{orderId}/cancel': {
    put: {
      tags: ['Orders'],
      summary: 'Cancel order',
      description: 'Cancel a pending order. Only orders with status "pending" can be cancelled.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'orderId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Order ID to cancel',
          example: 'ORD-20251206-001'
        }
      ],
      responses: {
        200: {
          description: 'Order cancelled successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderResponse' }
            }
          }
        },
        400: { description: 'Cannot cancel order (not in pending status)' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { description: 'Order not found' }
      }
    }
  },
  '/api/admin/orders': {
    get: {
      tags: ['Admin - Orders'],
      summary: 'Get all orders (Admin)',
      description: 'Get all orders with pagination and filters',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: [
              'pending',
              'confirmed',
              'preparing',
              'out-for-delivery',
              'delivered',
              'cancelled'
            ]
          }
        },
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Search by order ID'
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'number', default: 20 }
        },
        {
          name: 'skip',
          in: 'query',
          schema: { type: 'number', default: 0 }
        }
      ],
      responses: {
        200: {
          description: 'Orders retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      orders: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Order' }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'number' },
                          pages: { type: 'number' },
                          total: { type: 'number' },
                          limit: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      }
    }
  },
  '/api/admin/orders/stats': {
    get: {
      tags: ['Admin - Orders'],
      summary: 'Get order statistics (Admin)',
      description: 'Get comprehensive order statistics for admin dashboard',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Statistics retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      totalOrders: { type: 'number' },
                      pendingOrders: { type: 'number' },
                      confirmedOrders: { type: 'number' },
                      preparingOrders: { type: 'number' },
                      outForDeliveryOrders: { type: 'number' },
                      deliveredOrders: { type: 'number' },
                      cancelledOrders: { type: 'number' },
                      totalRevenue: { type: 'number' },
                      todayOrders: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      }
    }
  },
  '/api/admin/orders/{orderId}/status': {
    put: {
      tags: ['Admin - Orders'],
      summary: 'Update order status (Admin)',
      description: 'Update the status of an order',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'orderId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          example: 'ORD-20251206-001'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: {
                  type: 'string',
                  enum: [
                    'pending',
                    'confirmed',
                    'preparing',
                    'out-for-delivery',
                    'delivered',
                    'cancelled'
                  ],
                  example: 'confirmed'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Order status updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderResponse' }
            }
          }
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { description: 'Order not found' }
      }
    }
  }
};

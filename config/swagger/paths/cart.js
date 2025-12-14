export const cartPaths = {
  '/api/cart/add': {
    post: {
      tags: ['Cart'],
      summary: 'Add item to cart',
      description: "Add a product to the user's shopping cart with specified quantity",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: {
                  type: 'string',
                  description: 'Product ID to add to cart',
                  example: '65a1b2c3d4e5f6789012345',
                },
                quantity: {
                  type: 'number',
                  minimum: 1,
                  description: 'Quantity to add (in kg)',
                  example: 2,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Item added to cart successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { description: 'Product not found' },
      },
    },
  },
  '/api/cart': {
    get: {
      tags: ['Cart'],
      summary: 'Get user cart',
      description: "Retrieve the authenticated user's shopping cart with populated product details",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Cart retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
  '/api/cart/count': {
    get: {
      tags: ['Cart'],
      summary: 'Get cart item count',
      description: 'Get total number of items in cart',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Cart count retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      count: { type: 'number', example: 5 },
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
  '/api/cart/update/{itemId}': {
    put: {
      tags: ['Cart'],
      summary: 'Update cart item quantity',
      description: 'Update the quantity of a specific item in the cart',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'itemId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Cart item ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['quantity'],
              properties: {
                quantity: {
                  type: 'number',
                  minimum: 1,
                  example: 3,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Cart updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { description: 'Cart item not found' },
      },
    },
  },
  '/api/cart/remove/{itemId}': {
    delete: {
      tags: ['Cart'],
      summary: 'Remove item from cart',
      description: 'Remove a specific item from the shopping cart',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'itemId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Cart item ID to remove',
        },
      ],
      responses: {
        200: {
          description: 'Item removed from cart',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { description: 'Cart item not found' },
      },
    },
  },
  '/api/cart/clear': {
    delete: {
      tags: ['Cart'],
      summary: 'Clear cart',
      description: 'Remove all items from the shopping cart',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Cart cleared successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
};

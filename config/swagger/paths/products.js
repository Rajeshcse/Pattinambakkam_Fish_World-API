// Product Management Endpoints Swagger Documentation

export const productPaths = {
  '/api/products': {
    post: {
      tags: ['Admin - Product Management'],
      summary: 'Create a new fish product',
      description: 'Create a new fish product listing with name, category, price, stock, and optional description and images. Admin only operation.',
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
              description: 'High quality fresh Vanjaram fish sourced from local fishermen in Pattinambakkam',
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
  }
};

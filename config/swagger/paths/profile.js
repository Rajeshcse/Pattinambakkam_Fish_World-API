// User Profile Endpoints Swagger Documentation

export const profilePaths = {
  '/api/auth/profile': {
    get: {
      tags: ['User Profile'],
      summary: 'Get user profile',
      description: 'Get current authenticated user profile',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        500: { $ref: '#/components/responses/ServerError' }
      }
    },

    put: {
      tags: ['User Profile'],
      summary: 'Update user profile',
      description: 'Update user profile information',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'John Updated' },
                email: { type: 'string', format: 'email', example: 'john.updated@example.com' },
                phone: { type: 'string', pattern: '^[6-9]\\d{9}$', example: '9876543211' },
                avatar: { type: 'string', example: 'https://example.com/avatar.jpg' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Profile updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Profile updated successfully' },
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation failed or email/phone already in use',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/ValidationError' },
                  {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      message: {
                        type: 'string',
                        example: 'Email already in use',
                        description: 'Can be "Email already in use" or "Phone number already in use"'
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  }
};

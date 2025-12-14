// Authentication Endpoints Swagger Documentation

export const authPaths = {
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register a new user',
      description: 'Create a new user account with email, phone, and password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'phone', 'password'],
              properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                phone: { type: 'string', pattern: '^[6-9]\\d{9}$', example: '9876543210' },
                password: { type: 'string', minLength: 6, example: 'Password123' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'User registered successfully. Please verify your email.',
                  },
                  accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                  refreshToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation failed or user already exists',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/ValidationError' },
                  {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      message: { type: 'string', example: 'User already exists with this email' },
                    },
                  },
                ],
              },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login user',
      description: 'Authenticate user with email/phone and password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['password'],
              properties: {
                email: {
                  type: 'string',
                  example: 'john@example.com',
                  description: 'Email or phone number (one is required)',
                },
                phone: {
                  type: 'string',
                  example: '9876543210',
                  description: 'Phone number or email (one is required)',
                },
                password: { type: 'string', example: 'Password123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Login successful' },
                  accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                  refreshToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'User not found',
                    description: 'Can be "User not found" or "Incorrect password"',
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

  '/api/auth/refresh-token': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh access token',
      description: 'Get a new access token using refresh token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Token refreshed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Invalid or expired refresh token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'Invalid or expired refresh token',
                    description:
                      'Can be "Refresh token is required", "Invalid or expired refresh token", "User not found", or "Invalid refresh token"',
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

  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout user',
      description: 'Logout user from current device by removing refresh token',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Logged out successfully' },
                },
              },
            },
          },
        },
        400: {
          description: 'Refresh token is required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  '/api/auth/logout-all': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout from all devices',
      description: 'Remove all refresh tokens for the user',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Logged out from all devices',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Logged out from all devices successfully' },
                },
              },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};

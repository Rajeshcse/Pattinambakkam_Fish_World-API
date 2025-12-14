// Admin Management Endpoints Swagger Documentation

export const adminPaths = {
  '/api/admin/dashboard': {
    get: {
      tags: ['Admin Management'],
      summary: 'Get admin dashboard statistics',
      description:
        'Retrieve comprehensive dashboard statistics including user counts, recent registrations, role distribution, and recent users',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Dashboard statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  dashboard: {
                    type: 'object',
                    properties: {
                      overview: {
                        type: 'object',
                        properties: {
                          totalUsers: { type: 'number', example: 150 },
                          verifiedUsers: { type: 'number', example: 120 },
                          adminUsers: { type: 'number', example: 3 },
                        },
                      },
                      recentRegistrations: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string', example: '2024-01-15' },
                            count: { type: 'number', example: 5 },
                          },
                        },
                      },
                      roleDistribution: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string', example: 'user' },
                            count: { type: 'number', example: 147 },
                          },
                        },
                      },
                      recentUsers: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/UserSummary' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  '/api/admin/users': {
    get: {
      tags: ['Admin - User Management'],
      summary: 'Get all users with pagination and filters',
      description:
        'Retrieve paginated list of users with optional filtering by role, verification status, and search',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number for pagination',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Number of users per page (max 100)',
        },
        {
          in: 'query',
          name: 'role',
          schema: { type: 'string', enum: ['user', 'admin'] },
          description: 'Filter by user role',
        },
        {
          in: 'query',
          name: 'isVerified',
          schema: { type: 'boolean' },
          description: 'Filter by verification status',
        },
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          description: 'Search in name and email fields',
        },
      ],
      responses: {
        200: {
          description: 'Users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  users: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' },
                  stats: { $ref: '#/components/schemas/UserStats' },
                },
              },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  '/api/admin/users/{id}': {
    get: {
      tags: ['Admin - User Management'],
      summary: 'Get user by ID',
      description: 'Retrieve detailed information about a specific user',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'User ID',
        },
      ],
      responses: {
        200: {
          description: 'User retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid user ID',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
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

    put: {
      tags: ['Admin - User Management'],
      summary: 'Update user profile',
      description: 'Update user profile information as admin',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'User ID',
        },
      ],
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
                avatar: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://example.com/avatar.jpg',
                },
                isVerified: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User updated successfully' },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation failed or email/phone already in use',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/ValidationError' },
                  { $ref: '#/components/schemas/Error' },
                ],
              },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
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

    delete: {
      tags: ['Admin - User Management'],
      summary: 'Delete user',
      description: 'Permanently delete a user account (cannot delete own account)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'User ID',
        },
      ],
      responses: {
        200: {
          description: 'User deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User deleted successfully' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid user ID or cannot delete own account',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
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

  '/api/admin/users/{id}/role': {
    put: {
      tags: ['Admin - Role Management'],
      summary: 'Change user role',
      description: 'Promote user to admin or demote admin to user (cannot change own role)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'User ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['role'],
              properties: {
                role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User role changed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User role changed from user to admin' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string' },
                      previousRole: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation failed or cannot change own role',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/ValidationError' },
                  { $ref: '#/components/schemas/Error' },
                ],
              },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
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

  '/api/admin/users/{id}/verification': {
    put: {
      tags: ['Admin - User Management'],
      summary: 'Toggle user verification status',
      description: 'Verify or unverify user email status',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'User ID',
        },
      ],
      responses: {
        200: {
          description: 'User verification status updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User verified successfully' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      isVerified: { type: 'boolean' },
                      previousStatus: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid user ID',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
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

  '/api/admin/users/bulk-action': {
    post: {
      tags: ['Admin - Bulk Operations'],
      summary: 'Perform bulk operations on users',
      description:
        'Perform bulk delete, verify, or unverify operations on multiple users (max 100)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['action', 'userIds'],
              properties: {
                action: {
                  type: 'string',
                  enum: ['delete', 'verify', 'unverify'],
                  example: 'verify',
                },
                userIds: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                  maxItems: 100,
                  example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Bulk operation completed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Bulk verify operation completed' },
                  affected: { type: 'number', example: 25 },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation failed or invalid operation',
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
                        example: 'Cannot perform bulk actions on your own account',
                      },
                      invalidIds: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        429: {
          description: 'Too many bulk operations',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'Too many bulk operations, please try again after 15 minutes',
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
};

import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Kidzo API Documentation',
    version: '1.0.0',
    description: 'Complete API documentation for Kidzo Authentication System',
    contact: {
      name: 'Kidzo API Support',
      email: 'support@kidzo.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.kidzo.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and profile management endpoints'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token in format: Bearer <token>'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '64f1a7c9d2e4f3b1a2c3d4e5',
            description: 'Unique user identifier'
          },
          name: {
            type: 'string',
            example: 'John Doe',
            minLength: 2,
            maxLength: 50
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          phone: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            example: '9876543210',
            description: '10-digit Indian mobile number starting with 6-9'
          },
          role: { 
            type: 'string',
            enum: ['user', 'admin'],
            example: 'user',
            default: 'user'
          },
          isVerified: {
            type: 'boolean',
            example: false,
            default: false
          },
          avatar: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/avatar.jpg',
            description: 'User profile picture URL'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-10-09T10:30:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-10-09T10:30:00.000Z'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'phone', 'password'],
        properties: {
          name: {
            type: 'string',
            example: 'John Doe',
            minLength: 2,
            maxLength: 50,
            description: 'Full name (2-50 characters, letters and spaces only)'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
            description: 'Valid email address'
          },
          phone: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            example: '9876543210',
            description: '10-digit Indian mobile number starting with 6, 7, 8, or 9'
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'Password123',
            minLength: 6,
            description: 'Minimum 6 characters with at least one uppercase, one lowercase, and one number'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
            description: 'Email address (provide either email or phone)'
          },
          phone: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            example: '9876543210',
            description: 'Phone number (provide either email or phone)'
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'Password123',
            description: 'User password'
          }
        }
      },
      ProfileUpdateRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'John Smith',
            minLength: 2,
            maxLength: 50,
            description: 'Updated full name'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'johnsmith@example.com',
            description: 'Updated email address'
          },
          phone: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            example: '9123456789',
            description: 'Updated phone number'
          },
          avatar: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/avatar.jpg',
            description: 'Profile picture URL'
          }
        }
      },
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'User registered successfully'
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT authentication token'
          },
          user: {
            $ref: '#/components/schemas/User'
          }
        }
      },
      ProfileSuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          user: {
            $ref: '#/components/schemas/User'
          }
        }
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Validation failed'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  example: 'field'
                },
                value: {
                  type: 'string',
                  example: 'invalid-email'
                },
                msg: {
                  type: 'string',
                  example: 'Please provide a valid email'
                },
                path: {
                  type: 'string',
                  example: 'email'
                },
                location: {
                  type: 'string',
                  example: 'body'
                }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message'
          }
        }
      }
    }
  },
  paths: {
    '/': {
      get: {
        tags: ['General'],
        summary: 'API Welcome',
        description: 'Returns welcome message and available endpoints',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Welcome to Kidzo API - Authentication System' },
                    version: { type: 'string', example: '1.0.0' },
                    documentation: { type: 'string', example: 'http://localhost:3000/api-docs' },
                    endpoints: {
                      type: 'object',
                      properties: {
                        register: { type: 'string', example: 'POST /api/auth/register' },
                        login: { type: 'string', example: 'POST /api/auth/login' },
                        profile: { type: 'string', example: 'GET /api/auth/profile (Protected)' },
                        updateProfile: { type: 'string', example: 'PUT /api/auth/profile (Protected)' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Create a new user account with name, email, phone, and password. Returns JWT token for immediate authentication.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest'
              },
              examples: {
                validUser: {
                  summary: 'Valid registration',
                  value: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '9876543210',
                    password: 'Password123'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthSuccessResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error or user already exists',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/ValidationErrorResponse' },
                    { $ref: '#/components/schemas/ErrorResponse' }
                  ]
                },
                examples: {
                  validationError: {
                    summary: 'Validation failed',
                    value: {
                      success: false,
                      message: 'Validation failed',
                      errors: [
                        {
                          msg: 'Please provide a valid email',
                          path: 'email',
                          location: 'body'
                        }
                      ]
                    }
                  },
                  duplicateEmail: {
                    summary: 'Email already exists',
                    value: {
                      success: false,
                      message: 'User already exists with this email'
                    }
                  },
                  duplicatePhone: {
                    summary: 'Phone already exists',
                    value: {
                      success: false,
                      message: 'User already exists with this phone number'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        description: 'Authenticate user with email/phone and password. Returns JWT token and user data.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              },
              examples: {
                loginWithEmail: {
                  summary: 'Login with email',
                  value: {
                    email: 'john@example.com',
                    password: 'Password123'
                  }
                },
                loginWithPhone: {
                  summary: 'Login with phone',
                  value: {
                    phone: '9876543210',
                    password: 'Password123'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthSuccessResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse'
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                },
                examples: {
                  invalidCredentials: {
                    summary: 'Invalid credentials',
                    value: {
                      success: false,
                      message: 'Invalid credentials'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get user profile',
        description: 'Retrieve authenticated user profile information. Requires valid JWT token.',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProfileSuccessResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Invalid or missing token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                },
                examples: {
                  noToken: {
                    summary: 'No token provided',
                    value: {
                      success: false,
                      message: 'Access denied. No token provided.'
                    }
                  },
                  invalidToken: {
                    summary: 'Invalid token',
                    value: {
                      success: false,
                      message: 'Invalid token'
                    }
                  },
                  expiredToken: {
                    summary: 'Token expired',
                    value: {
                      success: false,
                      message: 'Token expired.'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['Authentication'],
        summary: 'Update user profile',
        description: 'Update authenticated user profile information. All fields are optional. Requires valid JWT token.',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProfileUpdateRequest'
              },
              examples: {
                updateName: {
                  summary: 'Update name only',
                  value: {
                    name: 'John Smith'
                  }
                },
                updateAll: {
                  summary: 'Update all fields',
                  value: {
                    name: 'John Smith',
                    email: 'johnsmith@example.com',
                    phone: '9123456789',
                    avatar: 'https://example.com/new-avatar.jpg'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
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
          '400': {
            description: 'Validation error or duplicate data',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/ValidationErrorResponse' },
                    { $ref: '#/components/schemas/ErrorResponse' }
                  ]
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Invalid or missing token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    }
  }
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Kidzo API Documentation'
  }));
};

export default setupSwagger;

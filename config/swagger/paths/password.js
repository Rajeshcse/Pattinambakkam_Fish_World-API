// Password Management Endpoints Swagger Documentation

export const passwordPaths = {
  '/api/auth/forgot-password': {
    post: {
      tags: ['Password Management'],
      summary: 'Request password reset OTP',
      description: 'Send password reset OTP to user email (prevents email enumeration)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', format: 'email', example: 'john@example.com' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password reset OTP sent (or generic message for security)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example:
                      'If an account exists with this email, a password reset OTP has been sent',
                  },
                  expiresIn: { type: 'string', example: '10 minutes' },
                },
              },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  '/api/auth/reset-password': {
    post: {
      tags: ['Password Management'],
      summary: 'Reset password with OTP',
      description: 'Reset user password using OTP',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'otp', 'newPassword'],
              properties: {
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                otp: { type: 'string', pattern: '^\\d{6}$', example: '123456' },
                newPassword: { type: 'string', minLength: 6, example: 'NewPassword123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password reset successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Password reset successful. Please login with your new password.',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid or expired OTP, or validation failed',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/ValidationError' },
                  {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      message: { type: 'string', example: 'Invalid or expired OTP' },
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

  '/api/auth/change-password': {
    post: {
      tags: ['Password Management'],
      summary: 'Change password',
      description: 'Change password for authenticated user (logs out other sessions)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                currentPassword: { type: 'string', example: 'OldPassword123' },
                newPassword: { type: 'string', minLength: 6, example: 'NewPassword123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password changed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Password changed successfully. Other sessions have been logged out.',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation failed or new password same as current',
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
                        example: 'New password must be different from current password',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        401: {
          description: 'Unauthorized or incorrect current password',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'Current password is incorrect',
                    description:
                      'Can be "Access denied. No token provided", "Invalid token", "Token expired", or "Current password is incorrect"',
                  },
                },
              },
            },
          },
        },
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

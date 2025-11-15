// Email Verification Endpoints Swagger Documentation

export const verificationPaths = {
  '/api/auth/send-verification-email': {
    post: {
      tags: ['Email Verification'],
      summary: 'Send email verification OTP',
      description: 'Send a 6-digit OTP to user email for verification',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'OTP sent successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Verification OTP sent to your email' },
                  expiresIn: { type: 'string', example: '10 minutes' }
                }
              }
            }
          }
        },
        400: {
          description: 'Email already verified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Email is already verified' }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        500: {
          description: 'Failed to send email',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Failed to send verification email. Please try again.' }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/auth/verify-email': {
    post: {
      tags: ['Email Verification'],
      summary: 'Verify email with OTP',
      description: 'Verify user email address using the OTP sent to their email',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['otp'],
              properties: {
                otp: { type: 'string', pattern: '^\\d{6}$', example: '123456' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Email verified successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Email verified successfully' }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid or expired OTP, or email already verified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'Invalid or expired OTP',
                    description: 'Can be "Invalid or expired OTP", "Email is already verified", or validation errors'
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  },

  '/api/auth/resend-verification-email': {
    post: {
      tags: ['Email Verification'],
      summary: 'Resend verification email OTP',
      description: 'Resend verification OTP to user email',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'OTP resent successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'New verification OTP sent to your email' },
                  expiresIn: { type: 'string', example: '10 minutes' }
                }
              }
            }
          }
        },
        400: {
          description: 'Email already verified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Email is already verified' }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Please wait at least 1 minute before requesting a new OTP' }
                }
              }
            }
          }
        },
        500: {
          description: 'Failed to send email',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Failed to send verification email. Please try again.' }
                }
              }
            }
          }
        }
      }
    }
  }
};

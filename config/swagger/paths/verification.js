// Phone Verification Endpoints Swagger Documentation

export const verificationPaths = {
  '/api/auth/send-phone-otp': {
    post: {
      tags: ['Phone Verification'],
      summary: 'Send phone verification OTP',
      description:
        'Send a 6-digit OTP to user phone number for verification (called automatically during registration)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['phone'],
              properties: {
                phone: {
                  type: 'string',
                  pattern: '^\\d{10}$',
                  example: '9876543210',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'OTP sent successfully to phone',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Verification OTP sent to your phone',
                  },
                  expiresIn: { type: 'string', example: '10 minutes' },
                },
              },
            },
          },
        },
        400: {
          description: 'Phone already verified or invalid phone number',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'Phone number is already verified',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to send OTP',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example:
                      'Failed to send verification OTP. Please try again.',
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/auth/verify-phone-otp': {
    post: {
      tags: ['Phone Verification'],
      summary: 'Verify phone number with OTP',
      description:
        'Verify user phone number using the OTP sent via SMS. Phone number is captured from registration form.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['phone', 'otp'],
              properties: {
                phone: {
                  type: 'string',
                  pattern: '^\\d{10}$',
                  example: '9876543210',
                },
                otp: { type: 'string', pattern: '^\\d{6}$', example: '123456' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Phone number verified successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Phone number verified successfully',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid or expired OTP, or phone already verified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'Invalid or expired OTP',
                    description:
                      'Can be "Invalid or expired OTP", "Phone is already verified", or validation errors',
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

  '/api/auth/resend-phone-otp': {
    post: {
      tags: ['Phone Verification'],
      summary: 'Resend phone verification OTP',
      description:
        'Resend verification OTP to user phone number. Used when user does not receive initial OTP or it expires.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['phone'],
              properties: {
                phone: {
                  type: 'string',
                  pattern: '^\\d{10}$',
                  example: '9876543210',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'OTP resent successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'New verification OTP sent to your phone',
                  },
                  expiresIn: { type: 'string', example: '10 minutes' },
                },
              },
            },
          },
        },
        400: {
          description: 'Phone already verified or invalid phone number',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'Phone number is already verified',
                  },
                },
              },
            },
          },
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example:
                      'Please wait at least 1 minute before requesting a new OTP',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to send OTP',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example:
                      'Failed to send verification OTP. Please try again.',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

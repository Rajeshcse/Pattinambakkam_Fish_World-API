export const phoneVerificationPaths = {
  '/api/auth/send-verification-sms': {
    post: {
      tags: ['Phone Verification'],
      summary: 'Send phone verification OTP',
      description: 'Send a 6-digit OTP to user phone for verification',
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
                  message: {
                    type: 'string',
                    example: 'Verification OTP sent to your phone number'
                  },
                  expiresIn: { type: 'string', example: '10 minutes' },
                  otp: {
                    type: 'string',
                    example: '123456',
                    description: 'Only returned in development mode'
                  },
                  note: { type: 'string', example: '⚠️ OTP shown only in DEVELOPMENT mode' }
                }
              }
            }
          }
        },
        400: {
          description: 'Phone already verified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Phone number is already verified' }
                }
              }
            }
          }
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        500: {
          description: 'Failed to send SMS',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'Failed to send verification SMS. Please try again.'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/auth/verify-phone': {
    post: {
      tags: ['Phone Verification'],
      summary: 'Verify phone with OTP',
      description: 'Verify user phone number using the OTP sent via SMS',
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
          description: 'Phone verified successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Phone number verified successfully' }
                }
              }
            }
          }
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
                      'Can be "Invalid or expired OTP", "Phone number is already verified", or validation errors'
                  }
                }
              }
            }
          }
        },
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

  '/api/auth/resend-verification-sms': {
    post: {
      tags: ['Phone Verification'],
      summary: 'Resend verification SMS OTP',
      description: 'Resend verification OTP to user phone',
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
                  message: {
                    type: 'string',
                    example: 'New verification OTP sent to your phone number'
                  },
                  expiresIn: { type: 'string', example: '10 minutes' },
                  otp: {
                    type: 'string',
                    example: '123456',
                    description: 'Only returned in development mode'
                  },
                  note: { type: 'string', example: '⚠️ OTP shown only in DEVELOPMENT mode' }
                }
              }
            }
          }
        },
        400: {
          description: 'Phone already verified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Phone number is already verified' }
                }
              }
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
                  message: {
                    type: 'string',
                    example: 'Please wait at least 1 minute before requesting a new OTP'
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Failed to send SMS',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    example: 'Failed to send verification SMS. Please try again.'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

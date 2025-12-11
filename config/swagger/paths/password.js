// Password Management Endpoints Swagger Documentation

export const passwordPaths = {
  "/api/auth/forgot-password": {
    post: {
      tags: ["Password Management"],
      summary: "Request password reset code",
      description:
        "Send password reset code to user phone. User can provide either email or phone number to find account.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "john@example.com",
                  description: "User email address (provide email or phone)",
                },
                phone: {
                  type: "string",
                  pattern: "^[6-9]\\d{9}$",
                  example: "9876543210",
                  description: "User phone number (provide email or phone)",
                },
              },
              description:
                "Provide either email or phone number to find account",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Reset code sent to phone successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Reset code sent to your phone",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation failed - email or phone required",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Please provide either email or phone number",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "User not found" },
                },
              },
            },
          },
        },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/api/auth/reset-password": {
    post: {
      tags: ["Password Management"],
      summary: "Reset password with reset code",
      description:
        "Reset user password by providing email/phone, reset code, and new password. User can provide either email or phone to identify account.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["resetCode", "newPassword"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "john@example.com",
                  description: "User email address (provide email or phone)",
                },
                phone: {
                  type: "string",
                  pattern: "^[6-9]\\d{9}$",
                  example: "9876543210",
                  description: "User phone number (provide email or phone)",
                },
                resetCode: {
                  type: "string",
                  pattern: "^\\d{6}$",
                  example: "381851",
                  description: "6-digit reset code received on phone",
                },
                newPassword: {
                  type: "string",
                  minLength: 6,
                  example: "NewPassword123",
                  description:
                    "New password (min 6 chars, 1 uppercase, 1 lowercase, 1 number)",
                },
              },
              description:
                "Provide either email or phone, reset code, and new password",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password reset successfully - redirect to login",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Password reset successfully",
                  },
                  phone: {
                    type: "string",
                    example: "9876543210",
                    description: "User phone number",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation failed or invalid/expired reset code",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example:
                      "Invalid or expired reset code | Password must contain at least one uppercase letter",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "User not found" },
                },
              },
            },
          },
        },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/api/auth/change-password": {
    post: {
      tags: ["Password Management"],
      summary: "Change password",
      description:
        "Change password for authenticated user (logs out other sessions)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["currentPassword", "newPassword"],
              properties: {
                currentPassword: { type: "string", example: "OldPassword123" },
                newPassword: {
                  type: "string",
                  minLength: 6,
                  example: "NewPassword123",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password changed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example:
                      "Password changed successfully. Other sessions have been logged out.",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation failed or new password same as current",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/ValidationError" },
                  {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: {
                        type: "string",
                        example:
                          "New password must be different from current password",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        401: {
          description: "Unauthorized or incorrect current password",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Current password is incorrect",
                    description:
                      'Can be "Access denied. No token provided", "Invalid token", "Token expired", or "Current password is incorrect"',
                  },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
};

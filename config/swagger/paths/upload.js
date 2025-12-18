export const uploadPaths = {
  '/api/upload/product-image': {
    post: {
      tags: ['File Upload'],
      summary: 'Upload single product image',
      description: 'Upload a single image file for a product (Admin only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                image: {
                  type: 'string',
                  format: 'binary',
                  description: 'Image file to upload'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Image uploaded successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Image uploaded successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      url: { type: 'string', example: 'https://res.cloudinary.com/...' },
                      publicId: {
                        type: 'string',
                        example: 'pattinambakkam-fish-world/products/xyz'
                      },
                      size: { type: 'number', example: 12345 },
                      format: { type: 'string', example: 'jpg' },
                      width: { type: 'number', example: 1200 },
                      height: { type: 'number', example: 800 }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'No file uploaded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        500: {
          description: 'Upload failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },

  '/api/upload/product-images': {
    post: {
      tags: ['File Upload'],
      summary: 'Upload multiple product images',
      description: 'Upload multiple image files (max 5) for a product (Admin only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                images: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'binary'
                  },
                  description: 'Array of image files to upload (max 5)'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Images uploaded successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: '2 image(s) uploaded successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      images: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            url: { type: 'string', example: 'https://res.cloudinary.com/...' },
                            publicId: {
                              type: 'string',
                              example: 'pattinambakkam-fish-world/products/xyz'
                            },
                            size: { type: 'number', example: 12345 },
                            format: { type: 'string', example: 'jpg' },
                            width: { type: 'number', example: 1200 },
                            height: { type: 'number', example: 800 }
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
        400: {
          description: 'No files uploaded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        500: {
          description: 'Upload failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  }
};

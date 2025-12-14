import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { schemas } from './schemas.js';
import { securitySchemes, responses, tags } from './components.js';
import { authPaths } from './paths/auth.js';
import { verificationPaths } from './paths/verification.js';
import { passwordPaths } from './paths/password.js';
import { profilePaths } from './paths/profile.js';
import { adminPaths } from './paths/admin.js';
import { productPaths } from './paths/products.js';
import { cartPaths } from './paths/cart.js';
import { orderPaths } from './paths/orders.js';

// Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pattinambakkam_Fish_World API Documentation',
      version: '1.0.0',
      description: 'Complete authentication and user management API for Pattinambakkam_Fish_World application - AI picture books for Kids to publish in KDP. Includes role-based admin access control with comprehensive user management capabilities.',
      contact: {
        name: 'Pattinambakkam_Fish_World API Support',
        email: 'support@Pattinambakkam_Fish_World.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.Pattinambakkam_Fish_World.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes,
      schemas,
      responses
    },
    tags,
    paths: {
      // Combine all path definitions
      ...authPaths,
      ...verificationPaths,
      ...passwordPaths,
      ...profilePaths,
      ...adminPaths,
      ...productPaths,
      ...cartPaths,
      ...orderPaths
    }
  },
  apis: [] // No annotations needed since we're defining everything inline
};

// Generate Swagger specification
const swaggerSpec = swaggerJsdoc(options);

// Setup Swagger UI middleware
export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Pattinambakkam_Fish_World API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none', // Keep sections collapsed by default
      filter: true, // Enable filtering
      showExtensions: true,
      showCommonExtensions: true
    }
  }));

  console.log('✅ Swagger documentation initialized at /api-docs');
};

export default setupSwagger;

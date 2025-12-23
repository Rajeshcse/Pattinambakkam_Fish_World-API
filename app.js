import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';
import setupSwagger from './config/swagger/setup.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { sendSuccess } from './utils/helpers/responseHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

setupSwagger(app);

app.get('/', (req, res) => {
  const apiInfo = {
    name: 'Pattinambakkam Fish World API',
    version: '2.0.0',
    description: 'Fish marketplace API with product management and authentication',
    documentation: `http://localhost:${port}/api-docs`,
    status: 'active',
    endpoints: {
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (Protected)',
        updateProfile: 'PUT /api/auth/profile (Protected)'
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard (Admin Only)',
        userManagement: 'GET /api/admin/users (Admin Only)'
      },
      products: {
        list: 'GET /api/products (Public)',
        getById: 'GET /api/products/:id (Public)',
        create: 'POST /api/products (Admin Only)',
        update: 'PUT /api/products/:id (Admin Only)',
        delete: 'DELETE /api/products/:id (Admin Only)',
        toggleAvailability: 'PATCH /api/products/:id/availability (Admin Only)'
      },
      cart: {
        addItem: 'POST /api/cart/add (Protected)',
        getCart: 'GET /api/cart (Protected)',
        updateItem: 'PUT /api/cart/update/:itemId (Protected)',
        removeItem: 'DELETE /api/cart/remove/:itemId (Protected)',
        clearCart: 'DELETE /api/cart/clear (Protected)'
      },
      orders: {
        create: 'POST /api/orders/create (Protected)',
        myOrders: 'GET /api/orders (Protected)',
        orderDetails: 'GET /api/orders/:orderId (Protected)',
        cancelOrder: 'PUT /api/orders/:orderId/cancel (Protected)'
      }
    },
    features: [
      'JWT Authentication',
      'Role-based Authorization',
      'Product Management',
      'Shopping Cart',
      'Order Management',
      'WhatsApp Order Confirmation',
      '4-Hour Delivery Validation',
      'File Upload Support',
      'Rate Limiting',
      'Input Validation',
      'API Documentation',
      'Error Handling'
    ]
  };

  return sendSuccess(res, apiInfo, 'Welcome to Pattinambakkam Fish World API');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});

export default app;

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import setupSwagger from './config/swagger.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup Swagger Documentation
setupSwagger(app);

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Kidzo API - Authentication System',
    version: '1.0.0',
    documentation: 'http://localhost:3000/api-docs',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile (Protected)',
      updateProfile: 'PUT /api/auth/profile (Protected)'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});
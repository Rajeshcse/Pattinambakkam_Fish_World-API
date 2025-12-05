# Pattinambakkam Fish World - API Documentation

## Project Overview

The Pattinambakkam Fish World API is a comprehensive backend solution for a fish marketplace application. It provides robust product management, user authentication, role-based authorization, and API documentation. The system is designed to support a fish marketplace where administrators can manage products and customers can browse the catalog.

## 🚀 Features

### Core Features
- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: Full CRUD operations for fish products with categories
- **Advanced Filtering**: Search, category filtering, price range, and availability filters
- **Pagination**: Efficient data handling with customizable pagination
- **File Upload Support**: Image management for product galleries
- **Rate Limiting**: Protection against abuse with configurable limits
- **Input Validation**: Comprehensive validation using express-validator
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Error Handling**: Centralized error processing with detailed logging

### Technical Features
- **Clean Architecture**: Service layer pattern with separation of concerns
- **Helper Utilities**: Reusable functions for common operations
- **Constants Management**: Centralized configuration and message management
- **Async Error Handling**: Automatic error catching for async operations
- **Response Standardization**: Consistent API response formatting
- **Database Optimization**: Mongoose with optimized queries and indexing

## 📁 Project Structure

```
PFW-API/
├── app.js                          # Application entry point
├── package.json                    # Dependencies and scripts
├── README.md                       # Project documentation
│
├── config/                         # Configuration files
│   ├── database.js                 # MongoDB connection setup
│   └── swagger/                    # API documentation configuration
│       ├── setup.js                # Swagger setup and configuration
│       ├── components.js           # Reusable Swagger components
│       ├── schemas.js              # Data model schemas
│       └── paths/                  # API endpoint documentation
│           ├── admin.js            # Admin endpoint docs
│           ├── auth.js             # Authentication endpoint docs
│           ├── password.js         # Password management docs
│           ├── profile.js          # User profile docs
│           ├── products.js         # Product endpoint docs
│           └── verification.js     # Email verification docs
│
├── controllers/                    # Request handlers
│   ├── adminController.js          # Admin operations
│   ├── authController.js           # Authentication logic
│   ├── passwordController.js       # Password management
│   ├── productController.js        # Product operations (Updated)
│   └── verificationController.js   # Email verification
│
├── middleware/                     # Custom middleware
│   ├── auth.js                     # JWT authentication & authorization
│   ├── rateLimiter.js             # Rate limiting configuration
│   ├── validation.js              # Input validation rules
│   └── errorHandler.js            # Centralized error handling (New)
│
├── models/                         # Database models
│   ├── User.js                     # User data model
│   ├── Token.js                    # Token management model
│   └── FishProduct.js             # Fish product data model
│
├── routes/                         # API route definitions
│   ├── auth.js                     # Authentication routes
│   ├── admin.js                    # Admin routes
│   └── products.js                # Product routes (Updated)
│
├── services/                       # Business logic layer (New)
│   └── productService.js          # Product business operations
│
├── utils/                          # Utility functions (New)
│   └── helpers/                    # Helper functions
│       ├── responseHelper.js       # Standardized API responses
│       ├── stringHelper.js         # String manipulation utilities
│       ├── dateHelper.js           # Date formatting utilities
│       └── validationHelper.js     # Custom validation functions
│
├── constants/                      # Application constants (New)
│   ├── index.js                    # Constants export hub
│   ├── statusCodes.js             # HTTP status codes
│   ├── messages.js                # Error and success messages
│   └── enums.js                   # Application enumerations
│
└── scripts/                        # Utility scripts
    ├── createAdmin.js              # Admin user creation
    └── promoteAdmin.js             # User promotion to admin
```

## 🛠️ Technology Stack

### Core Technologies
- **Node.js**: Runtime environment
- **Express.js v5.1.0**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose v8.19.1**: MongoDB object modeling

### Authentication & Security
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcrypt**: Password hashing
- **express-rate-limit**: Rate limiting
- **cors**: Cross-origin resource sharing

### Validation & Documentation
- **express-validator**: Input validation
- **Swagger UI**: API documentation
- **swagger-jsdoc**: Swagger specification generation

### Utilities & Development
- **dotenv**: Environment variable management
- **nodemon**: Development auto-restart
- **crypto**: Secure random generation

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, indexed),
  password: String (required, hashed),
  phone: String (required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isEmailVerified: Boolean (default: false),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### FishProduct Model
```javascript
{
  name: String (required, indexed),
  category: String (enum: ['Fish', 'Prawn', 'Crab', 'Squid'], required),
  price: Number (required, min: 0),
  stock: Number (required, min: 0, default: 0),
  description: String,
  images: [String] (array of image URLs),
  isAvailable: Boolean (auto-calculated based on stock),
  createdBy: String (admin email),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Endpoints

### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login            # User login
GET  /api/auth/profile          # Get user profile (Protected)
PUT  /api/auth/profile          # Update user profile (Protected)
```

### Product Endpoints
```
GET    /api/products            # Get all products (Public)
GET    /api/products/:id        # Get product by ID (Public)
POST   /api/products            # Create product (Admin Only)
PUT    /api/products/:id        # Update product (Admin Only)
DELETE /api/products/:id        # Delete product (Admin Only)
PATCH  /api/products/:id/availability  # Toggle availability (Admin Only)
```

### Admin Endpoints
```
GET /api/admin/dashboard        # Admin dashboard (Admin Only)
GET /api/admin/users           # User management (Admin Only)
```

## 🔍 Query Parameters

### Product Filtering
```
GET /api/products?category=Fish              # Filter by category
GET /api/products?isAvailable=true          # Filter by availability
GET /api/products?minPrice=100&maxPrice=500  # Price range filter
GET /api/products?search=salmon             # Text search
GET /api/products?page=2&limit=10           # Pagination
```

### Combination Filtering
```
GET /api/products?category=Fish&isAvailable=true&page=1&limit=5
```

## 📝 Request/Response Examples

### Create Product Request
```json
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Fresh Pomfret",
  "category": "Fish",
  "price": 450,
  "stock": 25,
  "description": "Fresh Pomfret caught daily from Bay of Bengal",
  "images": [
    "https://example.com/pomfret1.jpg",
    "https://example.com/pomfret2.jpg"
  ]
}
```

### Product Response
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "676c8d123456789abcdef123",
    "name": "Fresh Pomfret",
    "category": "Fish",
    "price": 450,
    "stock": 25,
    "description": "Fresh Pomfret caught daily from Bay of Bengal",
    "images": [
      "https://example.com/pomfret1.jpg",
      "https://example.com/pomfret2.jpg"
    ],
    "isAvailable": true,
    "createdBy": "admin@example.com",
    "createdAt": "2024-12-26T10:30:00.000Z",
    "updatedAt": "2024-12-26T10:30:00.000Z"
  }
}
```

### Paginated Products Response
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "676c8d123456789abcdef123",
      "name": "Fresh Pomfret",
      "category": "Fish",
      "price": 450,
      "stock": 25,
      "isAvailable": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalProducts": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "stats": {
    "totalProducts": 25,
    "availableProducts": 22,
    "totalStock": 350,
    "averagePrice": 275.5
  }
}
```

## 🚦 Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (Duplicate)
- `429`: Too Many Requests
- `500`: Internal Server Error

## 🔐 Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt
- Role-based access control

### Rate Limiting
```javascript
// Different limits for different endpoints
authLimiter: 5 requests per 15 minutes
adminLimiter: 10 requests per 15 minutes
generalLimiter: 100 requests per 15 minutes
```

### Validation
- Input sanitization
- Business logic validation
- MongoDB injection prevention

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (v5+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configurations

# Start the server
npm run dev
```

### Environment Variables
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pfw_database
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### Creating Admin User
```bash
# Run the admin creation script
npm run create-admin
# Follow the prompts to create an admin user
```

## 📚 API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

The documentation includes:
- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Parameter descriptions

## 🧪 Development Commands

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run create-admin    # Create new admin user
npm run promote-admin   # Promote existing user to admin
```

## 📈 Performance Optimizations

### Database
- Indexed fields for fast queries
- Efficient aggregation pipelines
- Lean queries for read operations

### Application
- Service layer for business logic separation
- Helper utilities for code reuse
- Async error handling for performance
- Response caching headers

### Security
- Rate limiting per endpoint type
- Input validation and sanitization
- Secure HTTP headers
- CORS configuration

## 🔄 Recent Updates (v2.0.0)

### Architecture Improvements
- ✅ **Service Layer**: Moved business logic from controllers to services
- ✅ **Helper Utilities**: Created reusable helper functions
- ✅ **Constants Management**: Centralized error messages and status codes
- ✅ **Error Handling**: Comprehensive error processing middleware
- ✅ **Response Standardization**: Consistent API response formatting

### Code Quality Enhancements
- ✅ **Separation of Concerns**: Clean architecture implementation
- ✅ **Code Reusability**: DRY principle with helper functions
- ✅ **Type Safety**: Better validation and error handling
- ✅ **Documentation**: Comprehensive JSDoc comments

### Performance Improvements
- ✅ **Async Error Handling**: Automatic error catching
- ✅ **Database Optimization**: Efficient query patterns
- ✅ **Memory Management**: Optimized object creation
- ✅ **Response Speed**: Faster API responses

## 🔮 Future Enhancements

### Planned Features
- **Image Upload**: Direct file upload support with AWS S3/Cloudinary
- **WhatsApp Integration**: Order placement via WhatsApp API
- **Inventory Management**: Stock tracking and low-stock alerts
- **Order Management**: Complete order lifecycle management
- **Push Notifications**: Real-time updates for users
- **Payment Integration**: Payment gateway integration
- **Analytics Dashboard**: Business intelligence and reporting
- **Mobile API**: Optimized endpoints for mobile applications

### Technical Improvements
- **Database Migrations**: Version-controlled schema changes
- **Testing Suite**: Unit and integration tests
- **CI/CD Pipeline**: Automated deployment
- **Monitoring**: Application performance monitoring
- **Logging**: Structured logging with log aggregation
- **Caching**: Redis implementation for performance
- **Microservices**: Service decomposition for scalability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please contact:
- **Email**: support@pattinambakkamfishworld.com
- **Documentation**: http://localhost:3000/api-docs
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)

---

**Version**: 2.0.0  
**Last Updated**: December 26, 2024  
**Maintained by**: Pattinambakkam Fish World Development Team
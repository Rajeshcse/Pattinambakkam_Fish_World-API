# Kidzo API - Authentication System

A Node.js/Express REST API with MongoDB for user authentication featuring registration, login, and profile management.

## Features

- ✅ User Registration with validation
- ✅ User Login with JWT authentication
- ✅ Protected profile routes
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ MongoDB integration with Mongoose
- ✅ CORS enabled
- ✅ Environment variables support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Rajeshcse/KidZo.git
cd KidZo
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` file with your MongoDB URI and JWT secret.

4. Start the development server
```bash
npm run dev
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get user profile | Protected |
| PUT | `/api/auth/profile` | Update user profile | Protected |

### Sample Requests

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Profile (Protected)
```bash
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

## Environment Variables

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kidzo-api
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Project Structure

```
Kidzo-API/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── validation.js       # Input validation rules
├── models/
│   └── User.js             # User schema
├── routes/
│   └── auth.js             # Authentication routes
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── app.js                 # Main application file
└── package.json           # Dependencies and scripts
```

## License

ISC
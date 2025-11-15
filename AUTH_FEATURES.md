# Kidzo API - Authentication Features

## Overview
This document outlines all authentication features implemented in the Kidzo API.

## Features Implemented

### 1. Password Reset/Forgot Password
Users can reset their password if forgotten using OTP sent to their email.

**Endpoints:**
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP

**Flow:**
1. User requests password reset with email
2. System sends 6-digit OTP to email (valid for 10 minutes)
3. User submits OTP with new password
4. Password is reset and all refresh tokens are cleared for security

**Security Features:**
- Email enumeration protection (same response regardless of email existence)
- OTP expires in 10 minutes
- All sessions logged out after password reset
- Rate limited to 3 attempts per 15 minutes

---

### 2. Email Verification
Users must verify their email address after registration.

**Endpoints:**
- `POST /api/auth/send-verification-email` - Send verification OTP (Protected)
- `POST /api/auth/verify-email` - Verify email with OTP (Protected)
- `POST /api/auth/resend-verification-email` - Resend verification OTP (Protected)

**Flow:**
1. User registers and receives access/refresh tokens
2. User requests verification OTP
3. System sends 6-digit OTP to email (valid for 10 minutes)
4. User submits OTP to verify email
5. Welcome email sent after successful verification

**Security Features:**
- OTP expires in 10 minutes
- Rate limited to 5 OTP requests per 15 minutes
- Resend OTP limited to 1 per minute
- Automatic token cleanup after expiration

---

### 3. Refresh Token System
Implements secure token refresh mechanism for maintaining user sessions.

**Endpoints:**
- `POST /api/auth/refresh-token` - Get new access token using refresh token

**Flow:**
1. User logs in and receives both access token (15min) and refresh token (30 days)
2. When access token expires, client uses refresh token to get new access token
3. Refresh tokens are stored in database and validated on each use

**Security Features:**
- Access tokens expire in 15 minutes
- Refresh tokens expire in 30 days
- Maximum 5 refresh tokens per user (for multiple devices)
- Refresh tokens stored in database for validation
- Tokens automatically cleaned up after expiration

---

### 4. Change Password
Logged-in users can change their password.

**Endpoint:**
- `POST /api/auth/change-password` - Change password (Protected)

**Flow:**
1. User provides current password and new password
2. System verifies current password
3. New password is hashed and saved
4. All other sessions are logged out for security

**Security Features:**
- Current password verification required
- New password must be different from current
- Password strength validation (min 6 chars, uppercase, lowercase, number)
- All refresh tokens cleared except current session
- Rate limited to 5 attempts per 15 minutes

---

### 5. Rate Limiting
Protection against brute force attacks and abuse.

**Rate Limits Applied:**
- **Registration:** 3 attempts per hour
- **Login:** 5 attempts per 15 minutes
- **Password Reset:** 3 attempts per 15 minutes
- **OTP Requests:** 5 attempts per 15 minutes
- **Profile Updates:** 10 attempts per 15 minutes
- **General Auth:** 5 attempts per 15 minutes

**Features:**
- IP-based rate limiting
- Different limits for different endpoints
- Successful logins don't count toward limit
- Clear error messages with retry time

---

## Authentication Endpoints Summary

### Public Endpoints
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/auth/register` | Register new user | 3/hour |
| POST | `/api/auth/login` | Login with email/phone | 5/15min |
| POST | `/api/auth/refresh-token` | Refresh access token | 5/15min |
| POST | `/api/auth/forgot-password` | Request password reset | 3/15min |
| POST | `/api/auth/reset-password` | Reset password with OTP | 3/15min |

### Protected Endpoints (Requires Access Token)
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/auth/profile` | Get user profile | - |
| PUT | `/api/auth/profile` | Update user profile | 10/15min |
| POST | `/api/auth/logout` | Logout current session | - |
| POST | `/api/auth/logout-all` | Logout all sessions | - |
| POST | `/api/auth/send-verification-email` | Send verification OTP | 5/15min |
| POST | `/api/auth/verify-email` | Verify email with OTP | 5/15min |
| POST | `/api/auth/resend-verification-email` | Resend verification OTP | 5/15min |
| POST | `/api/auth/change-password` | Change password | 5/15min |

---

## Environment Variables Required

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_REFRESH_EXPIRE=30d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Email From Configuration
FROM_NAME=Kidzo
FROM_EMAIL=noreply@kidzo.com
```

---

## Database Models

### User Model Updates
- Added `refreshTokens` array to store refresh tokens
- Each refresh token has `token` and `createdAt` fields
- Automatic cleanup after 30 days

### Token Model (New)
Used for OTP verification and password resets:
- `userId` - Reference to user
- `token` - Unique token hash
- `type` - Type of token (email_verification, password_reset)
- `otp` - 6-digit OTP code
- `expiresAt` - Expiration timestamp (10 minutes)
- Automatic cleanup after expiration

---

## Security Features

1. **Password Security**
   - Bcrypt hashing with 12 salt rounds
   - Password strength validation
   - Secure password reset flow

2. **Token Security**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (30 days)
   - Database validation of refresh tokens
   - Automatic token cleanup

3. **Rate Limiting**
   - IP-based rate limiting
   - Different limits per endpoint
   - Protection against brute force

4. **Email Security**
   - OTP-based verification
   - Time-limited OTPs (10 minutes)
   - Email enumeration protection
   - Secure email templates

5. **Session Management**
   - Multiple device support (5 devices)
   - Individual session logout
   - Logout from all devices
   - Session invalidation on password change

---

## API Documentation

Full API documentation is available at: `http://localhost:3000/api-docs`

The Swagger documentation includes:
- Complete endpoint descriptions
- Request/response examples
- Authentication requirements
- Rate limit information
- Error responses

---

## Testing in Development

In development mode:
- Email OTPs are logged to console
- No actual emails are sent (configure SMTP for production)
- Use the logged OTPs to test verification flows

**Example Console Output:**
```
Email sent (DEV MODE): {
  to: 'john@example.com',
  otp: '123456',
  messageId: '<...>'
}
```

---

## Next Steps (Optional Enhancements)

Consider implementing these additional features:
1. Two-Factor Authentication (2FA)
2. OAuth/Social Login (Google, Facebook)
3. SMS-based OTP verification
4. Session management dashboard
5. Security audit logs
6. Account deletion
7. Profile picture upload
8. Account lockout after failed attempts

---

## File Structure

```
├── controllers/
│   ├── authController.js         # Auth, login, logout, refresh token
│   ├── verificationController.js # Email verification
│   └── passwordController.js     # Password reset, change password
├── middleware/
│   ├── auth.js                   # JWT authentication
│   ├── validation.js             # Input validation
│   └── rateLimiter.js           # Rate limiting
├── models/
│   ├── User.js                   # User model with refresh tokens
│   └── Token.js                  # OTP/verification tokens
├── routes/
│   └── auth.js                   # All auth routes
├── utils/
│   └── emailService.js          # Email sending utility
└── config/
    └── swagger.js               # API documentation
```

---

## Support

For issues or questions, refer to the API documentation at `/api-docs` or check the code comments in the respective controller files.

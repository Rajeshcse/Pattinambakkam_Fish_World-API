# Password Reset & Phone Verification API Endpoints

## Overview

This document describes the implemented endpoints for password reset and phone verification. All services have been migrated from Twilio SMS to local terminal-based OTP/reset code display for development.

---

## 1. Password Reset Flow

### A. Forgot Password (Send Reset Code)

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Initiates password reset by sending a reset code to the user's email (displayed in terminal).

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Validation Rules:**

- `email` - Required, must be valid email format

**Response (Success):**

```json
{
  "message": "Password reset code sent to email"
}
```

**Response (User Not Found):**

```json
{
  "message": "User not found"
}
```

**Terminal Output (When Email Exists):**

```
[PASSWORD RESET CODE]
Email: user@example.com
Reset Code: 123456
Expires in: 10 minutes
```

**Status Code:** 200 (success), 404 (not found), 400 (validation error)

---

### B. Verify Reset Code (Without Changing Password)

**Endpoint:** `POST /api/auth/verify-code`

**Description:** Validates a reset code without changing the password. Useful for frontend code verification before password change.

**Request Body:**

```json
{
  "email": "user@example.com",
  "resetCode": "123456"
}
```

**Validation Rules:**

- `email` - Required, valid email format
- `resetCode` - Required, exactly 6 digits

**Response (Valid Code):**

```json
{
  "message": "Code is valid"
}
```

**Response (Invalid/Expired Code):**

```json
{
  "message": "Invalid or expired code"
}
```

**Status Code:** 200 (valid), 400 (invalid/expired), 404 (user not found)

---

### C. Reset Password (Complete Password Reset)

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Resets user password using email and valid reset code. Includes password strength validation.

**Request Body:**

```json
{
  "email": "user@example.com",
  "resetCode": "123456",
  "newPassword": "NewPassword123"
}
```

**Validation Rules:**

- `email` - Required, valid email format
- `resetCode` - Required, exactly 6 digits
- `newPassword` - Required, must satisfy all of:
  - Minimum 6 characters
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one digit (0-9)

**Response (Success):**

```json
{
  "message": "Password reset successfully"
}
```

**Response (Invalid/Expired Code):**

```json
{
  "message": "Invalid or expired code"
}
```

**Response (Weak Password):**

```json
{
  "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
}
```

**Status Code:** 200 (success), 400 (validation error), 404 (user not found)

---

## 2. Phone Verification Flow

### A. Send Phone OTP

**Endpoint:** `POST /api/auth/send-phone-otp`

**Description:** Generates and sends a 6-digit OTP to user's phone (displayed in terminal).

**Request Body:**

```json
{
  "phone": "+1234567890"
}
```

**Validation Rules:**

- `phone` - Required, valid phone format (with country code)

**Response (Success):**

```json
{
  "message": "OTP sent to phone"
}
```

**Response (Phone Not Found):**

```json
{
  "message": "Phone number not found"
}
```

**Terminal Output (When Phone Exists):**

```
[PHONE VERIFICATION OTP]
Phone: +1234567890
User: John Doe
OTP: 654321
Expires in: 10 minutes
```

**Status Code:** 200 (success), 404 (not found), 400 (validation error)

---

### B. Verify Phone OTP

**Endpoint:** `POST /api/auth/verify-phone-otp`

**Description:** Verifies the OTP sent to user's phone and marks phone as verified.

**Request Body:**

```json
{
  "phone": "+1234567890",
  "otp": "654321"
}
```

**Validation Rules:**

- `phone` - Required, valid phone format
- `otp` - Required, exactly 6 digits

**Response (Valid OTP):**

```json
{
  "message": "Phone verified successfully"
}
```

**Response (Invalid/Expired OTP):**

```json
{
  "message": "Invalid or expired OTP"
}
```

**Status Code:** 200 (success), 400 (invalid/expired), 404 (phone not found)

---

### C. Resend Phone OTP

**Endpoint:** `POST /api/auth/resend-phone-otp`

**Description:** Resends OTP to phone. Rate-limited to 1 request per minute.

**Request Body:**

```json
{
  "phone": "+1234567890"
}
```

**Validation Rules:**

- `phone` - Required, valid phone format

**Response (Success):**

```json
{
  "message": "OTP resent to phone"
}
```

**Response (Rate Limited):**

```json
{
  "message": "Please wait 1 minute before requesting another OTP"
}
```

**Status Code:** 200 (success), 429 (rate limited), 404 (not found)

---

## 3. Technical Details

### Database Collections

**Token Collection:**
Stores all OTPs and reset codes with automatic expiration.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  email: "user@example.com",
  phone: "+1234567890",
  code: "123456",  // OTP or reset code
  type: "email_verification" | "phone_verification" | "password_reset",
  expiresAt: Date,  // TTL index auto-deletes after 10 minutes
  createdAt: Date
}
```

**User Collection:**

```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "user@example.com",
  phone: "+1234567890",
  password: "hashedPassword",  // bcryptjs with 12 salt rounds
  phoneVerified: boolean,
  emailVerified: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Code Generation

- **Format:** 6-digit numeric code (000000-999999)
- **Storage:** Token collection with type indicator
- **Expiration:** 10 minutes (TTL index)
- **Display:** Console logs (for development/terminal visibility)

### Password Strength Requirements

All new passwords must contain:

- Minimum 6 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 digit (0-9)

Example valid passwords:

- `MyPass123`
- `SecurePass99`
- `ValidPW2024`

Example invalid passwords:

- `short1` (too short)
- `alllowercase123` (no uppercase)
- `ALLUPPERCASE123` (no lowercase)
- `NoDigitPassword` (no digit)

---

## 4. Development Testing

### Access Swagger Documentation

```
http://localhost:3001/api-docs
```

### View API Endpoints

All endpoints are documented in `/config/swagger/paths/` directory:

- `password.js` - Password reset endpoints
- `verification.js` - Phone verification endpoints
- `auth.js` - Authentication endpoints

### Test with cURL or Postman

**Test Forgot Password:**

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Test Reset Password:**

```bash
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","resetCode":"123456","newPassword":"NewPass123"}'
```

---

## 5. Migration from Twilio

### What Changed:

- ✅ Removed all Twilio imports and dependencies
- ✅ Removed SMS sending functionality
- ✅ OTPs and reset codes displayed in terminal instead
- ✅ Password reset changed from phone-based to email-based
- ✅ Added comprehensive input validation

### What Stayed the Same:

- Database structure (Token collection with type-based tracking)
- Authentication mechanism (JWT)
- User model and password hashing (bcryptjs)
- Endpoint structure

### For Production:

Replace console logging with actual email/SMS service:

1. In `controllers/passwordController.js` - send reset code via email
2. In `controllers/verificationController.js` - send OTP via SMS
3. Remove or redirect `console.log()` statements

---

## 6. Error Handling

All endpoints return standard error responses:

**400 - Validation Error:**

```json
{
  "message": "Validation error message"
}
```

**404 - Not Found:**

```json
{
  "message": "User not found" or "Phone number not found"
}
```

**429 - Rate Limited:**

```json
{
  "message": "Please wait X seconds before trying again"
}
```

**500 - Server Error:**

```json
{
  "message": "Internal server error"
}
```

---

## 7. Complete Workflow Example

### Password Reset Workflow:

```
1. User clicks "Forgot Password" → POST /forgot-password with email
   ↓ Terminal shows: [PASSWORD RESET CODE] Reset Code: 123456

2. User enters code in frontend → POST /verify-code to validate
   ↓ Returns: "Code is valid"

3. User enters new password → POST /reset-password with code + new password
   ↓ Returns: "Password reset successfully"

4. User logs in with new password
```

### Phone Verification Workflow:

```
1. User provides phone → POST /send-phone-otp
   ↓ Terminal shows: [PHONE VERIFICATION OTP] OTP: 654321

2. User enters OTP from SMS/app → POST /verify-phone-otp
   ↓ Returns: "Phone verified successfully"

3. Phone is now marked as verified in User record
```

---

## 8. Support & Troubleshooting

### Server Not Running?

Check that MongoDB is connected:

- Port: 27017 (default)
- Database: Configured in `.env`

### Codes Not Appearing in Terminal?

- Both `console.log()` and `console.error()` are used for visibility
- Check terminal output in VS Code or command prompt
- Ensure code generation reached (check "User not found" error)

### Code Expired?

- Codes expire after 10 minutes (hardcoded TTL)
- Request a new code via /forgot-password or /send-phone-otp

### Rate Limit Issues?

- Phone OTP resend: Limited to 1 request per minute
- Reset password: No rate limit (but tokens expire after 10 minutes)

---

**Last Updated:** 2024
**API Version:** 1.0.0 (OpenAPI 3.0.3 Compliant)

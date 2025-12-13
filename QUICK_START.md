# 🚀 Quick Start Guide - Product Creation

## What Was Created?

✅ **Product Model** - MongoDB schema with all fields  
✅ **Product Controller** - CRUD operations with verification checks  
✅ **Product Routes** - 5 endpoints (create, read, update, delete)  
✅ **Validation Rules** - Field validation for all inputs  
✅ **Security** - Admin-only access + email & phone verification required

---

## 🔐 Security Rules

**Only admins with BOTH verified can create products:**

1. ✅ Must be an **Admin** user
2. ✅ Email must be **Verified** (emailVerified = true)
3. ✅ Phone must be **Verified** (phoneVerified = true)

If you don't meet these requirements:

```json
{
  "success": false,
  "message": "You must verify both email and phone number to create products",
  "verified": {
    "email": false,
    "phone": false
  }
}
```

---

## 📍 All Endpoints

| Method | Endpoint                  | Purpose           | Auth     | Verified |
| ------ | ------------------------- | ----------------- | -------- | -------- |
| POST   | `/api/admin/products`     | Create product    | ✅ Admin | ✅ Both  |
| GET    | `/api/admin/products`     | List all products | ✅ Admin | ❌ No    |
| GET    | `/api/admin/products/:id` | Get one product   | ✅ Admin | ❌ No    |
| PUT    | `/api/admin/products/:id` | Update product    | ✅ Admin | ❌ No    |
| DELETE | `/api/admin/products/:id` | Delete product    | ✅ Admin | ❌ No    |

---

## 🧪 Test in Postman (Step by Step)

### Step 1: Login as Admin

```
POST http://localhost:3001/api/auth/login

Body (JSON):
{
  "email": "admin@fishworld.com",
  "password": "NewAdmin@123"
}
```

**Save the `accessToken` from response**

---

### Step 2: Check Verification Status

```
GET http://localhost:3001/api/auth/profile

Headers:
Authorization: Bearer <accessToken>
```

**Look for:**

```json
{
  "user": {
    "emailVerified": true,
    "phoneVerified": true,
    ...
  }
}
```

If either is `false`, verify them first:

#### Verify Email:

```
POST http://localhost:3001/api/auth/send-verification-email

Headers:
Authorization: Bearer <accessToken>
```

(Check terminal for OTP code, then verify)

```
POST http://localhost:3001/api/auth/verify-email

Headers:
Authorization: Bearer <accessToken>

Body:
{
  "otp": "123456"
}
```

#### Verify Phone:

```
POST http://localhost:3001/api/auth/send-phone-otp

Headers:
Authorization: Bearer <accessToken>
```

(Check terminal for OTP code)

```
POST http://localhost:3001/api/auth/verify-phone-otp

Headers:
Authorization: Bearer <accessToken>

Body:
{
  "otp": "123456"
}
```

---

### Step 3: Create a Product ✅

```
POST http://localhost:3001/api/admin/products

Headers:
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  "name": "Fresh Salmon",
  "description": "Premium quality salmon imported from Norway. Perfect for grilling and baking. Fresh and sustainably sourced.",
  "price": 850,
  "category": "Fish",
  "stock": 50,
  "image": "https://cdn.example.com/salmon.jpg",
  "sku": "FRE-SAL-2024-001",
  "tags": ["Fresh", "Premium", "Norwegian", "Imported"]
}
```

**Expected Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "65f8a9c2d9b5e2f4c1a2b3c4",
    "name": "Fresh Salmon",
    "description": "...",
    "price": 850,
    "category": "Fish",
    "stock": 50,
    "image": "https://cdn.example.com/salmon.jpg",
    "sku": "FRE-SAL-2024-001",
    "tags": ["Fresh", "Premium", "Norwegian", "Imported"],
    "isActive": true,
    "createdBy": {
      "_id": "...",
      "name": "Admin Name",
      "email": "admin@fishworld.com"
    },
    "createdAt": "2024-12-12T15:45:00.000Z"
  }
}
```

---

### Step 4: List All Products

```
GET http://localhost:3001/api/admin/products?page=1&limit=10&category=Fish

Headers:
Authorization: Bearer <accessToken>
```

---

### Step 5: Get One Product

```
GET http://localhost:3001/api/admin/products/65f8a9c2d9b5e2f4c1a2b3c4

Headers:
Authorization: Bearer <accessToken>
```

---

### Step 6: Update Product

```
PUT http://localhost:3001/api/admin/products/65f8a9c2d9b5e2f4c1a2b3c4

Headers:
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  "price": 899,
  "stock": 45
}
```

---

### Step 7: Delete Product

```
DELETE http://localhost:3001/api/admin/products/65f8a9c2d9b5e2f4c1a2b3c4

Headers:
Authorization: Bearer <accessToken>
```

---

## 📦 Product Categories

Choose one:

- `Fish` - Various fish types
- `Shrimp` - Shrimp varieties
- `Crab` - Fresh crab
- `Lobster` - Premium lobster
- `Shellfish` - Clams, mussels
- `Accessories` - Fishing gear, aquarium equipment
- `Food` - Fish-based food
- `Other` - Other seafood

---

## ✔️ Validation Rules

### Name

- Min: 3 characters
- Max: 100 characters

### Description

- Min: 10 characters
- Max: 1000 characters

### Price

- Must be a number
- Must be ≥ 0

### Stock

- Must be a number
- Must be ≥ 0
- Must be an integer

### Category

- Must be one of the 8 categories listed above

### Image

- Must be a valid URL (starts with http:// or https://)

### SKU

- Min: 3 characters
- Max: 20 characters
- Must be unique (no duplicates)
- Can contain: letters, numbers, hyphens (-), underscores (\_)
- Will be converted to UPPERCASE

### Tags

- Optional
- Max 10 tags
- Each tag is a string

---

## 🔒 Error Scenarios

### ❌ Not Verified

```json
{
  "success": false,
  "message": "You must verify both email and phone number to create products",
  "verified": {
    "email": true,
    "phone": false
  }
}
```

### ❌ Duplicate SKU

```json
{
  "success": false,
  "message": "SKU already exists. Please use a unique SKU"
}
```

### ❌ Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "value": "",
      "msg": "Product name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### ❌ No Authorization

```json
{
  "success": false,
  "message": "No authorization token"
}
```

### ❌ Not Admin

```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

---

## 🎯 Files Created/Modified

### New Files

- ✅ `models/Product.js` - Product schema
- ✅ `controllers/productController.js` - Product logic
- ✅ `PRODUCT_API.md` - Full API documentation
- ✅ `QUICK_START.md` - This file

### Modified Files

- ✅ `routes/admin.js` - Added product routes
- ✅ `middleware/validation.js` - Added product validators

---

## 📞 Next Steps

1. **Verify email & phone** (if not already done)
2. **Create your first product** using the Create Product endpoint
3. **List products** to see what you've created
4. **Update products** as needed
5. **Delete products** when out of stock

---

## 🐛 Troubleshooting

### "You must verify both email and phone number"

→ Run email and phone verification endpoints first

### "SKU already exists"

→ Use a unique SKU value

### "Product name is required"

→ Check all required fields are provided

### "Invalid category"

→ Choose from: Fish, Shrimp, Crab, Lobster, Shellfish, Accessories, Food, Other

### "No authorization token"

→ Add JWT token to Authorization header

### Server Error (500)

→ Check server logs in terminal

---

**Happy selling! 🎉 Your product system is ready to use!**

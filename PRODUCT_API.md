# 🛒 Product Management API Documentation

## Overview

Only **admins with both email AND phone verified** can create products. This ensures accountability and prevents unauthorized product creation.

---

## 📋 Requirements to Create Products

✅ **Must be:** Admin user  
✅ **Email:** Verified ✓  
✅ **Phone:** Verified ✓

If you don't meet these requirements, you'll get:

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

## 🚀 CREATE PRODUCT

### Endpoint

```
POST /api/admin/products
```

### Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Fresh Salmon",
  "description": "Premium quality salmon imported from Norway. Perfect for grilling and baking. Fresh and sustainably sourced.",
  "price": 850,
  "category": "Fish",
  "stock": 50,
  "image": "https://example.com/salmon.jpg",
  "sku": "FRE-SAL-2024-001",
  "tags": ["Fresh", "Premium", "Norwegian", "Imported"]
}
```

### Field Descriptions

| Field         | Type   | Required | Validation                                                       |
| ------------- | ------ | -------- | ---------------------------------------------------------------- |
| `name`        | String | ✅ Yes   | 3-100 characters                                                 |
| `description` | String | ✅ Yes   | 10-1000 characters                                               |
| `price`       | Number | ✅ Yes   | Must be ≥ 0                                                      |
| `category`    | String | ✅ Yes   | Fish, Shrimp, Crab, Lobster, Shellfish, Accessories, Food, Other |
| `stock`       | Number | ✅ Yes   | Must be ≥ 0 (integer)                                            |
| `image`       | String | ✅ Yes   | Valid image URL                                                  |
| `sku`         | String | ✅ Yes   | 3-20 characters, unique, alphanumeric + hyphens/underscores      |
| `tags`        | Array  | ❌ No    | Max 10 tags                                                      |

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "65f8a9c2d9b5e2f4c1a2b3c4",
    "name": "Fresh Salmon",
    "description": "Premium quality salmon imported from Norway...",
    "price": 850,
    "category": "Fish",
    "stock": 50,
    "image": "https://example.com/salmon.jpg",
    "sku": "FRE-SAL-2024-001",
    "tags": ["Fresh", "Premium", "Norwegian", "Imported"],
    "isActive": true,
    "createdBy": {
      "_id": "65f8a9c2d9b5e2f4c1a2b3c4",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "createdAt": "2024-12-12T14:30:00.000Z"
  }
}
```

### Error Responses

**❌ Not Verified (403)**

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

**❌ Duplicate SKU (400)**

```json
{
  "success": false,
  "message": "SKU already exists. Please use a unique SKU"
}
```

**❌ Validation Error (400)**

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

**❌ Unauthorized (401)**

```json
{
  "success": false,
  "message": "No authorization token"
}
```

**❌ Not Admin (403)**

```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

---

## 📦 GET ALL PRODUCTS

### Endpoint

```
GET /api/admin/products?page=1&limit=10&category=Fish&search=Salmon
```

### Query Parameters

| Parameter  | Type    | Default  | Description                          |
| ---------- | ------- | -------- | ------------------------------------ |
| `page`     | Number  | 1        | Page number for pagination           |
| `limit`    | Number  | 10       | Items per page                       |
| `category` | String  | Optional | Filter by category                   |
| `isActive` | Boolean | Optional | Filter by active status (true/false) |
| `search`   | String  | Optional | Search by name or SKU                |

### Success Response

```json
{
  "success": true,
  "products": [
    {
      "_id": "65f8a9c2d9b5e2f4c1a2b3c4",
      "name": "Fresh Salmon",
      "description": "Premium quality salmon...",
      "price": 850,
      "category": "Fish",
      "stock": 50,
      "image": "https://example.com/salmon.jpg",
      "sku": "FRE-SAL-2024-001",
      "isActive": true,
      "createdBy": {
        "_id": "...",
        "name": "Admin Name",
        "email": "admin@example.com"
      },
      "createdAt": "2024-12-12T14:30:00.000Z",
      "updatedAt": "2024-12-12T14:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 48,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🔍 GET PRODUCT BY ID

### Endpoint

```
GET /api/admin/products/:id
```

### Example

```
GET /api/admin/products/65f8a9c2d9b5e2f4c1a2b3c4
```

### Success Response

```json
{
  "success": true,
  "product": {
    "_id": "65f8a9c2d9b5e2f4c1a2b3c4",
    "name": "Fresh Salmon",
    "description": "Premium quality salmon...",
    "price": 850,
    "category": "Fish",
    "stock": 50,
    "image": "https://example.com/salmon.jpg",
    "sku": "FRE-SAL-2024-001",
    "rating": 4.5,
    "reviewCount": 12,
    "isActive": true,
    "tags": ["Fresh", "Premium"],
    "createdBy": {
      "_id": "...",
      "name": "Admin Name",
      "email": "admin@example.com",
      "phone": "9876543210"
    },
    "createdAt": "2024-12-12T14:30:00.000Z",
    "updatedAt": "2024-12-12T14:30:00.000Z"
  }
}
```

---

## ✏️ UPDATE PRODUCT

### Endpoint

```
PUT /api/admin/products/:id
```

### Request Body

```json
{
  "name": "Fresh Norwegian Salmon",
  "price": 899,
  "stock": 45,
  "isActive": true
}
```

**Note:** Only the admin who created the product (or superadmin) can update it.

### Success Response

```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": { ... }
}
```

### Error (403 Forbidden)

```json
{
  "success": false,
  "message": "You can only update products you created"
}
```

---

## 🗑️ DELETE PRODUCT

### Endpoint

```
DELETE /api/admin/products/:id
```

### Success Response

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "deletedProduct": {
    "id": "65f8a9c2d9b5e2f4c1a2b3c4",
    "name": "Fresh Salmon",
    "sku": "FRE-SAL-2024-001"
  }
}
```

---

## 🧪 Testing with cURL

### Create Product

```bash
curl -X POST http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Salmon",
    "description": "Premium quality salmon imported from Norway. Perfect for grilling and baking.",
    "price": 850,
    "category": "Fish",
    "stock": 50,
    "image": "https://example.com/salmon.jpg",
    "sku": "FRE-SAL-2024-001",
    "tags": ["Fresh", "Premium", "Norwegian"]
  }'
```

### Get All Products

```bash
curl -X GET http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Product by ID

```bash
curl -X GET http://localhost:3001/api/admin/products/65f8a9c2d9b5e2f4c1a2b3c4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Product

```bash
curl -X PUT http://localhost:3001/api/admin/products/65f8a9c2d9b5e2f4c1a2b3c4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 899,
    "stock": 45
  }'
```

### Delete Product

```bash
curl -X DELETE http://localhost:3001/api/admin/products/65f8a9c2d9b5e2f4c1a2b3c4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧪 Testing with Postman

### Step 1: Login (Get JWT Token)

```
POST http://localhost:3001/api/auth/login
{
  "email": "admin@fishworld.com",
  "password": "AdminPassword@123"
}
```

Copy the `accessToken` from the response.

### Step 2: Verify Email & Phone (If needed)

```
POST http://localhost:3001/api/auth/send-verification-email
POST /api/auth/send-phone-otp
```

### Step 3: Create Product

```
POST http://localhost:3001/api/admin/products
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Fresh Salmon",
  "description": "Premium quality salmon imported from Norway. Perfect for grilling and baking. Fresh and sustainably sourced.",
  "price": 850,
  "category": "Fish",
  "stock": 50,
  "image": "https://example.com/salmon.jpg",
  "sku": "FRE-SAL-2024-001",
  "tags": ["Fresh", "Premium", "Norwegian", "Imported"]
}
```

---

## 📊 Product Categories Available

- 🐟 **Fish** - Various fish types
- 🦐 **Shrimp** - Fresh shrimp varieties
- 🦀 **Crab** - Fresh crab
- 🦞 **Lobster** - Premium lobster
- 🐚 **Shellfish** - Clams, mussels, etc.
- 🎣 **Accessories** - Fishing/aquarium accessories
- 🍽️ **Food** - Fish-based food products
- ❓ **Other** - Other seafood products

---

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based authentication  
✅ **Role-based Access** - Admin only access  
✅ **Email & Phone Verification** - Both must be verified  
✅ **Rate Limiting** - Prevents abuse  
✅ **Input Validation** - All fields validated  
✅ **SQL Injection Prevention** - MongoDB protection  
✅ **Audit Logging** - All admin actions logged to terminal

---

## 📝 Example Products

### Fish

```json
{
  "name": "Fresh Atlantic Salmon",
  "description": "Premium Atlantic salmon, fresh and sustainably sourced from certified farms",
  "price": 850,
  "category": "Fish",
  "stock": 100,
  "image": "https://cdn.example.com/salmon.jpg",
  "sku": "FISH-SAL-ATL-001"
}
```

### Shrimp

```json
{
  "name": "Tiger Shrimp (1kg)",
  "description": "Large tiger shrimp, perfect for grilling or biryani",
  "price": 650,
  "category": "Shrimp",
  "stock": 75,
  "image": "https://cdn.example.com/tiger-shrimp.jpg",
  "sku": "SHRIMP-TIGER-1KG"
}
```

### Accessories

```json
{
  "name": "Aquarium Filter Pro",
  "description": "High-efficiency aquarium filter for saltwater and freshwater",
  "price": 2500,
  "category": "Accessories",
  "stock": 30,
  "image": "https://cdn.example.com/filter.jpg",
  "sku": "ACC-FILTER-PRO-001"
}
```

---

## 🎯 Next Steps

1. ✅ Verify your email and phone number as admin
2. ✅ Create your first product
3. ✅ List all products
4. ✅ Update product details
5. ✅ Monitor inventory

Happy selling! 🎉

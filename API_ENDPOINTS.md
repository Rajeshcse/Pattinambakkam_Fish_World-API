# API Endpoints Reference

## Complete Endpoint List with Examples

### 1️⃣ Add Item to Cart

**Endpoint**: `POST /api/cart/add`
**Authentication**: Optional (works for guests & authenticated users)

```
Request:
POST http://localhost:3000/api/cart/add
Content-Type: application/json
Authorization: Bearer <token> (optional)

{
  "productId": "673a1b2c3d4e5f6g7h8i9j0k",
  "quantity": 2
}

Response (Guest - 200):
{
  "success": true,
  "data": {
    "guestId": "192.168.1.1",
    "items": [{
      "productId": "673a1b2c3d4e5f6g7h8i9j0k",
      "productName": "Fresh Salmon",
      "price": 250,
      "image": "url",
      "quantity": 2,
      "addedAt": 1704297600000
    }],
    "isGuest": true
  },
  "message": "Item added to cart successfully"
}

Response (Authenticated - 200):
{
  "success": true,
  "data": {
    "_id": "cart_id",
    "user": "user_id",
    "items": [{
      "_id": "item_id",
      "product": "product_id",
      "quantity": 2,
      "addedAt": "2024-01-03T10:00:00.000Z"
    }]
  },
  "message": "Item added to cart successfully"
}

Error (404):
{
  "success": false,
  "message": "Product not found"
}

Error (400):
{
  "success": false,
  "message": "Only 50 items available in stock"
}
```

---

### 2️⃣ Get Cart

**Endpoint**: `GET /api/cart`
**Authentication**: Optional

```
Request:
GET http://localhost:3000/api/cart
Authorization: Bearer <token> (optional)

Response (Guest - 200):
{
  "success": true,
  "data": {
    "guestId": "192.168.1.1",
    "items": [
      {
        "productId": "673a1b2c3d4e5f6g7h8i9j0k",
        "productName": "Fresh Salmon",
        "price": 250,
        "image": "url",
        "quantity": 2,
        "addedAt": 1704297600000
      },
      {
        "productId": "673a1b2c3d4e5f6g7h8i9j0l",
        "productName": "Shrimp",
        "price": 350,
        "image": "url",
        "quantity": 1,
        "addedAt": 1704297700000
      }
    ],
    "createdAt": 1704297600000,
    "expiresAt": 1704384000000,
    "isGuest": true
  },
  "message": "Data retrieved successfully"
}

Response (Authenticated - 200):
{
  "success": true,
  "data": {
    "_id": "673a1b2c3d4e5f6g7h8i9j0k",
    "user": "673a1b2c3d4e5f6g7h8i9j0l",
    "items": [
      {
        "_id": "673a1b2c3d4e5f6g7h8i9j0m",
        "product": {
          "_id": "673a1b2c3d4e5f6g7h8i9j0k",
          "name": "Fresh Salmon",
          "price": 250,
          "image": "url",
          "stock": 50,
          "isAvailable": true
        },
        "quantity": 2,
        "addedAt": "2024-01-03T10:00:00.000Z"
      }
    ],
    "updatedAt": "2024-01-03T10:30:00.000Z"
  },
  "message": "Data retrieved successfully"
}
```

---

### 3️⃣ Get Cart Count

**Endpoint**: `GET /api/cart/count`
**Authentication**: Optional

```
Request:
GET http://localhost:3000/api/cart/count
Authorization: Bearer <token> (optional)

Response (Guest - 200):
{
  "success": true,
  "data": {
    "count": 3,
    "isGuest": true
  },
  "message": "Data retrieved successfully"
}

Response (Authenticated - 200):
{
  "success": true,
  "data": {
    "count": 5
  },
  "message": "Data retrieved successfully"
}
```

---

### 4️⃣ Update Cart Item

**Endpoint**: `PUT /api/cart/update/:itemId`
**Authentication**: Optional
**Note**: For guests, use array index (0, 1, 2). For authenticated users, use MongoDB ObjectId.

```
Request (Guest):
PUT http://localhost:3000/api/cart/update/0
Content-Type: application/json

{
  "quantity": 5
}

Request (Authenticated):
PUT http://localhost:3000/api/cart/update/673a1b2c3d4e5f6g7h8i9j0m
Content-Type: application/json

{
  "quantity": 5
}

Response (Guest - 200):
{
  "success": true,
  "data": {
    "guestId": "192.168.1.1",
    "items": [{
      "productId": "673a1b2c3d4e5f6g7h8i9j0k",
      "productName": "Fresh Salmon",
      "price": 250,
      "image": "url",
      "quantity": 5,
      "addedAt": 1704297600000
    }],
    "isGuest": true
  },
  "message": "Cart updated successfully"
}

Error (400):
{
  "success": false,
  "message": "Only 50 items available in stock"
}

Error (404):
{
  "success": false,
  "message": "Item not found in cart"
}
```

---

### 5️⃣ Remove Item from Cart

**Endpoint**: `DELETE /api/cart/remove/:itemId`
**Authentication**: Optional
**Note**: For guests, use array index (0, 1, 2). For authenticated users, use MongoDB ObjectId.

```
Request (Guest):
DELETE http://localhost:3000/api/cart/remove/0

Request (Authenticated):
DELETE http://localhost:3000/api/cart/remove/673a1b2c3d4e5f6g7h8i9j0m

Response (Guest - 200):
{
  "success": true,
  "data": {
    "guestId": "192.168.1.1",
    "items": [],
    "isGuest": true
  },
  "message": "Item removed from cart"
}

Error (404):
{
  "success": false,
  "message": "Item not found in cart"
}
```

---

### 6️⃣ Clear Cart

**Endpoint**: `DELETE /api/cart/clear`
**Authentication**: Optional

```
Request:
DELETE http://localhost:3000/api/cart/clear

Response (Guest - 200):
{
  "success": true,
  "data": {
    "guestId": "192.168.1.1",
    "items": [],
    "isGuest": true
  },
  "message": "Cart cleared successfully"
}

Response (Authenticated - 200):
{
  "success": true,
  "data": {
    "_id": "cart_id",
    "user": "user_id",
    "items": [],
    "updatedAt": "2024-01-03T10:30:00.000Z"
  },
  "message": "Cart cleared successfully"
}
```

---

### 7️⃣ Guest Checkout (Convert to User Cart)

**Endpoint**: `POST /api/cart/guest-checkout`
**Authentication**: REQUIRED ✅ (Must be authenticated)

```
Request:
POST http://localhost:3000/api/cart/guest-checkout
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "guestId": "192.168.1.1",
  "redirectUrl": "/checkout" (optional)
}

Response (Success - 200):
{
  "success": true,
  "data": {
    "cart": {
      "_id": "673a1b2c3d4e5f6g7h8i9j0k",
      "user": "673a1b2c3d4e5f6g7h8i9j0l",
      "items": [
        {
          "_id": "673a1b2c3d4e5f6g7h8i9j0m",
          "product": {
            "_id": "673a1b2c3d4e5f6g7h8i9j0k",
            "name": "Fresh Salmon",
            "price": 250,
            "image": "url",
            "stock": 50,
            "isAvailable": true
          },
          "quantity": 2,
          "addedAt": "2024-01-03T10:00:00.000Z"
        }
      ],
      "updatedAt": "2024-01-03T10:35:00.000Z"
    },
    "message": "Cart transferred successfully",
    "redirectUrl": "/checkout",
    "isReady": true
  },
  "message": "Ready to proceed to checkout"
}

Error (401 - Not Authenticated):
{
  "success": false,
  "message": "Authentication required to proceed to checkout. Please login first."
}

Error (400 - Missing guestId):
{
  "success": false,
  "message": "Guest cart ID is required"
}

Error (400 - Empty Cart):
{
  "success": false,
  "message": "Cart is empty. Please add items before checkout."
}
```

---

## Quick Reference Table

| Endpoint                   | Method | Auth         | Param Type | Status      |
| -------------------------- | ------ | ------------ | ---------- | ----------- |
| `/api/cart/add`            | POST   | Optional     | -          | 200/400/404 |
| `/api/cart`                | GET    | Optional     | -          | 200         |
| `/api/cart/count`          | GET    | Optional     | -          | 200         |
| `/api/cart/update/:id`     | PUT    | Optional     | Index/ID   | 200/400/404 |
| `/api/cart/remove/:id`     | DELETE | Optional     | Index/ID   | 200/404     |
| `/api/cart/clear`          | DELETE | Optional     | -          | 200         |
| `/api/cart/guest-checkout` | POST   | **REQUIRED** | Body       | 200/400/401 |

---

## Status Code Legend

| Code | Meaning      | Usage                                            |
| ---- | ------------ | ------------------------------------------------ |
| 200  | OK           | Successful operation                             |
| 400  | Bad Request  | Invalid data, missing fields, insufficient stock |
| 401  | Unauthorized | Guest checkout without authentication            |
| 404  | Not Found    | Product or item not found                        |
| 500  | Server Error | Internal server error                            |

---

## Guest vs Authenticated Item ID Reference

When updating/removing items:

**For Guest Users:**

```
Array Index (0-based)
Example: /api/cart/update/0  (first item)
         /api/cart/update/1  (second item)
         /api/cart/remove/2  (third item)
```

**For Authenticated Users:**

```
MongoDB ObjectId
Example: /api/cart/update/673a1b2c3d4e5f6g7h8i9j0m
         /api/cart/remove/673a1b2c3d4e5f6g7h8i9j0n
```

---

## Complete Frontend Workflow

```javascript
// 1. Guest browsing - no auth needed
const response1 = await fetch('/api/cart/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId: 'xyz', quantity: 2 })
});
const result1 = await response1.json();
const guestId = result1.data.guestId;
localStorage.setItem('guestId', guestId);

// 2. View cart
const response2 = await fetch('/api/cart');
const result2 = await response2.json();
console.log(result2.data.items);

// 3. Update item (use index for guest)
const response3 = await fetch('/api/cart/update/0', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ quantity: 5 })
});

// 4. Proceed to checkout after login
const authToken = localStorage.getItem('authToken');
const storedGuestId = localStorage.getItem('guestId');

const response4 = await fetch('/api/cart/guest-checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  },
  body: JSON.stringify({ guestId: storedGuestId })
});

const result4 = await response4.json();
if (result4.success) {
  localStorage.removeItem('guestId');
  window.location.href = result4.data.redirectUrl;
}
```

---

## Testing with cURL

### Add Item (Guest)

```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"productId":"673a1b2c3d4e5f6g7h8i9j0k","quantity":2}'
```

### Get Cart

```bash
curl http://localhost:3000/api/cart
```

### Update Item (using index 0)

```bash
curl -X PUT http://localhost:3000/api/cart/update/0 \
  -H "Content-Type: application/json" \
  -d '{"quantity":5}'
```

### Guest Checkout (with token)

```bash
curl -X POST http://localhost:3000/api/cart/guest-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"guestId":"192.168.1.1"}'
```

---

This is your complete endpoint reference! Bookmark this for quick access during development.

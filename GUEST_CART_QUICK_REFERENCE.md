# Guest Cart Quick Reference

## Core Endpoints

| Method | Endpoint                   | Auth         | Guest Support | Purpose               |
| ------ | -------------------------- | ------------ | ------------- | --------------------- |
| POST   | `/api/cart/add`            | Optional     | ✅ Yes        | Add product to cart   |
| GET    | `/api/cart`                | Optional     | ✅ Yes        | Retrieve cart items   |
| GET    | `/api/cart/count`          | Optional     | ✅ Yes        | Get total item count  |
| PUT    | `/api/cart/update/:itemId` | Optional     | ✅ Yes        | Update item quantity  |
| DELETE | `/api/cart/remove/:itemId` | Optional     | ✅ Yes        | Remove item from cart |
| DELETE | `/api/cart/clear`          | Optional     | ✅ Yes        | Empty entire cart     |
| POST   | `/api/cart/guest-checkout` | **Required** | ✅ Yes        | Convert & checkout    |

## Guest Cart Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Guest Browses Products (No Auth Required)            │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 2. Guest Adds Items (POST /api/cart/add)                │
│    Response includes: guestId (store in localStorage)   │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 3. Guest Views Cart (GET /api/cart)                     │
│    All items visible with isGuest: true flag            │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 4. Guest Clicks "Proceed to Checkout"                   │
│    • If NOT logged in → Redirect to /login              │
│    • If logged in → Continue to step 5                  │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 5. Transfer Cart (POST /api/cart/guest-checkout)        │
│    • Send: guestId + authToken                          │
│    • Server transfers items to user account             │
│    • Guest cart deleted from memory                     │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 6. Redirect to Checkout (/checkout)                     │
│    • Cart items now in user account                     │
│    • Ready for payment processing                       │
└─────────────────────────────────────────────────────────┘
```

## Code Examples

### Frontend: Add to Guest Cart

```javascript
const response = await fetch('/api/cart/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId: 'xyz', quantity: 2 })
});
const { data } = await response.json();
localStorage.setItem('guestId', data.guestId);
```

### Frontend: Checkout as Guest

```javascript
const token = localStorage.getItem('authToken');
const guestId = localStorage.getItem('guestId');

const response = await fetch('/api/cart/guest-checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ guestId })
});

if (response.ok) {
  window.location.href = '/checkout';
}
```

### Guest vs Authenticated Response

**Guest Response:**

```json
{
  "data": {
    "guestId": "abc123",
    "items": [...],
    "isGuest": true
  }
}
```

**Authenticated Response:**

```json
{
  "data": {
    "_id": "cart_id",
    "user": "user_id",
    "items": [...]
  }
}
```

## Key Differences

| Aspect        | Guest              | Authenticated     |
| ------------- | ------------------ | ----------------- |
| Storage       | In-Memory (24h)    | MongoDB           |
| Item ID       | Array Index        | MongoDB ObjectId  |
| Update Param  | `/update/0`        | `/update/item_id` |
| Remove Param  | `/remove/0`        | `/remove/item_id` |
| Cart Transfer | Via guest-checkout | Automatic         |
| Persistence   | Temporary          | Permanent         |

## Guest Cart Properties

```javascript
{
  guestId: "session_id_or_ip",           // Unique identifier
  items: [
    {
      productId: "mongo_id",              // Product ObjectId
      productName: "Fish Name",           // Cached for display
      price: 250,                         // Cached price
      image: "url",                       // Cached image
      quantity: 2,
      addedAt: 1704297600000              // Timestamp
    }
  ],
  createdAt: 1704297600000,               // Cart creation time
  expiresAt: 1704384000000                // 24 hours from last access
}
```

## Important Notes

1. **Guest ID Storage**: Always store returned `guestId` in localStorage
2. **Item Indexing**: For guests, use array index (0, 1, 2) instead of MongoDB ID
3. **Cart Expiration**: 24 hours of inactivity = automatic deletion
4. **Checkout Requirement**: Guest must be authenticated before checkout
5. **Stock Validation**: All operations validate against current inventory
6. **Error Handling**: Always check `success` flag in response

## Status Codes

- **200**: Success
- **400**: Invalid request (missing/invalid data)
- **401**: Unauthorized (checkout requires auth)
- **404**: Not found (product doesn't exist)
- **500**: Server error

## Common Issues & Solutions

| Issue                             | Solution                                          |
| --------------------------------- | ------------------------------------------------- |
| "Unable to identify user session" | Check if request includes proper headers/IP       |
| "Cart is empty"                   | Ensure items were added successfully              |
| "Authentication required"         | Login before calling guest-checkout               |
| Cart expires                      | Items deleted after 24 hours - add to cart again  |
| guestId not stored                | Use localStorage.setItem('guestId', data.guestId) |

## Environment Setup

No additional environment variables needed. Guest cart service uses:

- In-memory Map storage
- Automatic cleanup every 60 minutes
- 24-hour expiration by default

## Files Modified/Created

- ✅ `middleware/optionalAuth.js` - New optional authentication
- ✅ `services/guestCartService.js` - New guest cart logic
- ✅ `controllers/cartController.js` - Updated for guest support
- ✅ `routes/cart.js` - Changed middleware, added endpoint
- 📄 `GUEST_CART_GUIDE.md` - Complete documentation

## API Response Template

### Success (200)

```json
{
  "success": true,
  "data": {
    /* cart/response data */
  },
  "message": "Operation successful"
}
```

### Error (400/401/404/500)

```json
{
  "success": false,
  "message": "Error description"
}
```

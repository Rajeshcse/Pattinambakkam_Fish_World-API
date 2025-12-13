# 🖼️ Product Images - Quick Reference

## Form to API Mapping

| Form Field     | API Field     | Type             | Required |
| -------------- | ------------- | ---------------- | -------- |
| Product Name   | `name`        | String           | ✅       |
| Category       | `category`    | String (enum)    | ✅       |
| Price          | `price`       | Number           | ✅       |
| Stock          | `stock`       | Number           | ✅       |
| Description    | `description` | String           | ✅       |
| Product Images | `images`      | Array of strings | ✅       |
| SKU            | `sku`         | String           | ✅       |
| Tags           | `tags`        | Array of strings | ❌       |

---

## Images Field

```javascript
// SEND THIS:
{
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ]
}

// NOT THIS:
{
  "image": "https://example.com/image.jpg"  // ❌ Old format
}
```

---

## Validation Rules

✅ Array (not string)  
✅ Minimum 1 image  
✅ Maximum 5 images  
✅ Each must be valid URL (http:// or https://)

---

## Error Messages

| Error                                        | Solution                       |
| -------------------------------------------- | ------------------------------ |
| "At least one product image URL is required" | Add images array               |
| "Images must be an array"                    | Send array, not string         |
| "Maximum 5 images allowed"                   | Remove extra images            |
| "Each image must be a string URL"            | Check URL format               |
| "is not a valid URL"                         | Start with http:// or https:// |

---

## Code Examples

### JavaScript

```javascript
const product = {
  name: "Fresh Pomfret",
  description: "Premium quality pomfret...",
  price: 450,
  category: "Fish",
  stock: 75,
  images: [
    "https://cdn.example.com/img1.jpg",
    "https://cdn.example.com/img2.jpg",
  ],
  sku: "FISH-POM-001",
};

fetch("/api/admin/products", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(product),
});
```

### TypeScript

```typescript
interface Product {
  name: string;
  description: string;
  price: number;
  category:
    | "Fish"
    | "Shrimp"
    | "Crab"
    | "Lobster"
    | "Shellfish"
    | "Accessories"
    | "Food"
    | "Other";
  stock: number;
  images: string[]; // Array of URLs
  sku: string;
  tags?: string[];
}
```

---

## API Response

```json
{
  "success": true,
  "product": {
    "id": "...",
    "name": "Fresh Pomfret",
    "description": "...",
    "price": 450,
    "category": "Fish",
    "stock": 75,
    "images": [
      "https://cdn.example.com/img1.jpg",
      "https://cdn.example.com/img2.jpg"
    ],
    "sku": "FISH-POM-001",
    "isActive": true,
    "createdAt": "2024-12-12T..."
  }
}
```

---

## Categories

Choose one:

- `Fish`
- `Shrimp`
- `Crab`
- `Lobster`
- `Shellfish`
- `Accessories`
- `Food`
- `Other`

---

## Quick Test in Postman

1. **Method:** POST
2. **URL:** `http://localhost:3001/api/admin/products`
3. **Header:** `Authorization: Bearer <token>`
4. **Body:**

```json
{
  "name": "Fresh Pomfret",
  "description": "Premium quality pomfret fish",
  "price": 450,
  "category": "Fish",
  "stock": 75,
  "images": [
    "https://cdn.example.com/pomfret-1.jpg",
    "https://cdn.example.com/pomfret-2.jpg"
  ],
  "sku": "FISH-POM-2024-001"
}
```

---

**All systems updated! Ready to use! ✅**

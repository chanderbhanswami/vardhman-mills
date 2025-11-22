# Frontend-Backend Path Alignment Fixes

## Overview
This document outlines all path mismatches between frontend and backend, and the fixes required.

---

## 1. Cart Paths

### Issue 1: Add Item to Cart
- **Frontend Current**: `/api/cart/add` (in cartSlice.ts line 69)
- **Backend Actual**: `/api/cart/items` (POST)
- **Action**: Update frontend to use `/api/cart/items`

### Issue 2: Calculate Shipping
- **Frontend Current**: `/api/cart/shipping` (in cartSlice.ts line 157)
- **Backend Actual**: `/api/cart/calculate-shipping` (POST)
- **Action**: Update frontend to use `/api/cart/calculate-shipping`

### Issue 3: Constants File
- **File**: `frontend/src/lib/constants.ts`
- **Lines to Update**:
  - Line 19: `CART_ADD: '/api/cart/items'` (not '/api/cart/add')
  - Line 20: `CART_REMOVE: '/api/cart/items/:id'` (DELETE, not '/api/cart/remove')
  - Line 21: `CART_UPDATE: '/api/cart/items/:id'` (PUT, not '/api/cart/update')

---

## 2. Wishlist Paths

### Issue 1: Add to Wishlist
- **Frontend Current**: `/api/wishlist/add` (in constants.ts line 26)
- **Backend Actual**: `/api/wishlist/items` (POST)
- **Action**: Update constants to use `/api/wishlist/items`

### Issue 2: Remove from Wishlist
- **Frontend Current**: `/api/wishlist/remove` (in constants.ts line 27)
- **Backend Actual**: `/api/wishlist/items/:id` (DELETE)
- **Action**: Update constants to use `/api/wishlist/items/:id`

---

## 3. Order Paths

### Issue 1: Create Order
- **Frontend Current**: `/api/orders/create` (in constants.ts line 32)
- **Backend Actual**: `/api/orders` (POST)
- **Action**: Update constants - use POST to `/api/orders` directly

### Issue 2: Order Tracking
- **Frontend Current**: `/api/orders/:id/track` (in constants.ts line 33)
- **Backend Actual**: `/api/orders/:id/tracking` (GET)
- **Action**: Update constants to use `/api/orders/:id/tracking`

---

## 4. Files to Update

### File 1: `frontend/src/store/slices/cartSlice.ts`
**Changes:**
1. Line 69: Change `/api/cart/add` → `/api/cart/items`
2. Line 157: Change `/api/cart/shipping` → `/api/cart/calculate-shipping`

### File 2: `frontend/src/lib/constants.ts`
**Changes:**
1. Line 19: `CART_ADD: '/api/cart/items'`
2. Line 20: `CART_REMOVE: (id: string) => `/api/cart/items/${id}``
3. Line 21: `CART_UPDATE: (id: string) => `/api/cart/items/${id}``
4. Line 26: `WISHLIST_ADD: '/api/wishlist/items'`
5. Line 27: `WISHLIST_REMOVE: (id: string) => `/api/wishlist/items/${id}``
6. Line 32: Remove `ORDER_CREATE` (use ORDERS with POST)
7. Line 33: `ORDER_TRACK: (id: string) => `/api/orders/${id}/tracking``

---

## 5. Backend Endpoint Reference

### Cart Endpoints (from backend/src/routes/cart.routes.ts)
```
GET    /api/cart                           - Get cart
POST   /api/cart                           - Create cart
DELETE /api/cart/clear                     - Clear cart
POST   /api/cart/validate                  - Validate cart
POST   /api/cart/sync-guest               - Sync guest cart
POST   /api/cart/items                     - Add item
PUT    /api/cart/items/:itemId            - Update item
DELETE /api/cart/items/:itemId            - Remove item
POST   /api/cart/items/:itemId/increase   - Increase quantity
POST   /api/cart/items/:itemId/decrease   - Decrease quantity
POST   /api/cart/coupons                  - Apply coupon
DELETE /api/cart/coupons/:couponId       - Remove coupon
POST   /api/cart/calculate-shipping       - Calculate shipping
```

### Wishlist Endpoints (from backend/src/routes/wishlist.routes.ts)
```
GET    /api/wishlist                       - Get wishlist
POST   /api/wishlist/items                 - Add item
DELETE /api/wishlist/items/:itemId        - Remove item
```

### Order Endpoints (from backend/src/routes/order.routes.ts)
```
GET    /api/orders                         - Get orders
POST   /api/orders                         - Create order
GET    /api/orders/:id                     - Get order
GET    /api/orders/:id/tracking           - Get tracking
GET    /api/orders/:id/invoice            - Get invoice
POST   /api/orders/:id/cancel             - Cancel order
```

---

## Status
- [ ] Cart paths fixed
- [ ] Wishlist paths fixed
- [ ] Order paths fixed
- [ ] Constants file updated
- [ ] Tested all changes

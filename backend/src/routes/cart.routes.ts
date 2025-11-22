import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== CORE CART OPERATIONS ====================

// Get cart (supports both auth and guest with cartId)
router.get('/', cartController.getCart);

// Create cart (supports guest cart migration)
router.post('/', cartController.createCart);

// Clear cart (protected)
router.delete('/clear', protect, cartController.clearCart);

// Validate cart
router.post('/validate', cartController.validateCart);

// Sync guest cart with user cart (protected)
router.post('/sync-guest', protect, cartController.syncGuestCart);

// ==================== ITEM OPERATIONS ====================

// Add item to cart
router.post('/items', cartController.addItem);

// Update item in cart (protected)
router.put('/items/:itemId', protect, cartController.updateItem);

// Remove item from cart (protected)
router.delete('/items/:itemId', protect, cartController.removeItem);

// Move item to wishlist (protected)
router.post('/items/:itemId/move-to-wishlist', protect, cartController.moveToWishlist);

// Move item from wishlist to cart (protected)
router.post('/items/from-wishlist/:wishlistItemId', protect, cartController.moveFromWishlist);

// Bulk operations (protected)
router.post('/items/bulk/add', protect, cartController.addMultipleItems);
router.put('/items/bulk/update', protect, cartController.updateMultipleItems);
router.delete('/items/bulk/remove', protect, cartController.removeMultipleItems);

// Quantity operations (protected)
router.post('/items/:itemId/increase', protect, cartController.increaseQuantity);
router.post('/items/:itemId/decrease', protect, cartController.decreaseQuantity);
router.put('/items/:itemId/quantity', protect, cartController.setQuantity);

// Quick add (protected)
router.post('/quick-add', protect, cartController.quickAdd);

// ==================== COUPON OPERATIONS ====================

// Apply coupon to cart
router.post('/coupons', cartController.applyCoupon);

// Remove coupon from cart (protected)
router.delete('/coupons/:couponId', protect, cartController.removeCoupon);

// Validate coupon
router.post('/coupons/validate', cartController.validateCoupon);

// ==================== SHIPPING CALCULATOR ====================

// Calculate shipping for cart
router.post('/calculate-shipping', cartController.calculateShipping);

// ==================== SAVED CART OPERATIONS ====================

// Get saved carts (protected)
router.get('/saved', protect, cartController.getSavedCarts);

// Save current cart (protected)
router.post('/save', protect, cartController.saveCart);

// Restore saved cart (protected)
router.post('/saved/:id/restore', protect, cartController.restoreSavedCart);

// Delete saved cart (protected)
router.delete('/saved/:id', protect, cartController.deleteSavedCart);

// ==================== RECOMMENDATIONS & ANALYTICS ====================

// Get recommendations (protected)
router.get('/recommendations', protect, cartController.getRecommendations);

// Get cart analytics (admin)
router.get('/analytics', protect, cartController.getCartAnalytics);

export default router;

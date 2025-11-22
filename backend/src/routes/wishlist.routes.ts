import express from 'express';
import {
  getWishlist,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isInWishlist,
  toggleWishlist,
  shareWishlist,
  getSharedWishlist,
  moveToCart,
  getRecommendations,
  getSimilarProducts,
  bulkAddToWishlist,
  bulkRemoveFromWishlist,
  bulkMoveToCart,
  searchWishlist,
  getWishlistAnalytics,
  exportWishlist,
  importWishlist
} from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/shared/:shareCode', getSharedWishlist);

// Protected routes (requires authentication)
router.use(protect);

// Basic operations
router.get('/', getWishlist);
router.get('/count', getWishlistCount);
router.post('/add', addToWishlist);
router.delete('/remove/:itemId', removeFromWishlist);
router.delete('/clear', clearWishlist);
router.get('/check/:productId', isInWishlist);
router.post('/toggle', toggleWishlist);

// Advanced features
router.post('/share', shareWishlist);
router.post('/items/:itemId/move-to-cart', moveToCart);
router.get('/recommendations', getRecommendations);
router.get('/items/:itemId/similar', getSimilarProducts);

// Bulk operations
router.post('/bulk/add', bulkAddToWishlist);
router.delete('/bulk/remove', bulkRemoveFromWishlist);
router.post('/bulk/move-to-cart', bulkMoveToCart);

// Search & Analytics
router.get('/search', searchWishlist);
router.get('/analytics', getWishlistAnalytics);

// Export & Import
router.post('/export', exportWishlist);
router.post('/import', importWishlist);

export default router;

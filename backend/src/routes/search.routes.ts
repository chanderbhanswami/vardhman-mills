import express from 'express';
import {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches,
  getTrendingSearches,
  getRelatedSearches,
  trackSearchClick,
  trackSearchSelection,
  getSearchAnalytics,
  getZeroResultSearches,
  getAllSearchQueries,
  getSearchQuery,
  deleteSearchQuery,
  cleanupOldSearches
} from '../controllers/search.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Main search
router.post('/', searchProducts);

// Autocomplete & suggestions
router.get('/suggestions', getSearchSuggestions);

// Public analytics
router.get('/popular', getPopularSearches);
router.get('/trending', getTrendingSearches);
router.get('/related/:query', getRelatedSearches);

// ==================== TRACKING ROUTES ====================
// These are public but require valid IDs

// Track clicks and selections
router.post('/:searchId/click', trackSearchClick);
router.post('/:searchId/selection', trackSearchSelection);

// ==================== ADMIN ROUTES ====================

// Analytics & insights (Admin only)
router.get('/analytics/overview', protect, restrictTo('admin'), getSearchAnalytics);
router.get('/analytics/zero-results', protect, restrictTo('admin'), getZeroResultSearches);

// Query management (Admin only)
router.get('/queries', protect, restrictTo('admin'), getAllSearchQueries);
router.get('/queries/:id', protect, restrictTo('admin'), getSearchQuery);
router.delete('/queries/:id', protect, restrictTo('admin'), deleteSearchQuery);

// System operations (Admin only)
router.post('/cleanup', protect, restrictTo('admin'), cleanupOldSearches);

export default router;

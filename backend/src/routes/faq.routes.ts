import express from 'express';
import {
  getAllFAQs,
  getFAQ,
  searchFAQs,
  getFAQsByCategory,
  getCategories,
  getMostViewed,
  getMostHelpful,
  getFAQsByTags,
  markHelpful,
  markNotHelpful,
  getAllFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  togglePublish,
  reorderFAQs,
  bulkUpdateFAQs,
  bulkDeleteFAQs,
  getFAQStats
} from '../controllers/faq.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Categories
router.get('/categories', getCategories);

// Popular FAQs
router.get('/popular/most-viewed', getMostViewed);
router.get('/popular/most-helpful', getMostHelpful);

// Search
router.get('/search', searchFAQs);

// By category
router.get('/category/:category', getFAQsByCategory);

// By tags
router.get('/tags/:tags', getFAQsByTags);

// Get all FAQs (public)
router.get('/', getAllFAQs);

// Get single FAQ
router.get('/:id', getFAQ);

// ==================== FEEDBACK ROUTES (PUBLIC) ====================

router.post('/:id/helpful', markHelpful);
router.post('/:id/not-helpful', markNotHelpful);

// ==================== ADMIN ROUTES ====================

// Statistics
router.get('/admin/stats', protect, restrictTo('admin'), getFAQStats);

// Get all FAQs (admin - includes unpublished)
router.get('/admin/all', protect, restrictTo('admin'), getAllFAQsAdmin);

// Bulk operations
router.patch('/bulk-update', protect, restrictTo('admin'), bulkUpdateFAQs);
router.delete('/bulk-delete', protect, restrictTo('admin'), bulkDeleteFAQs);

// Reorder
router.patch('/reorder', protect, restrictTo('admin'), reorderFAQs);

// Toggle publish
router.patch('/:id/toggle-publish', protect, restrictTo('admin'), togglePublish);

// CRUD operations
router.post('/', protect, restrictTo('admin'), createFAQ);
router.patch('/:id', protect, restrictTo('admin'), updateFAQ);
router.delete('/:id', protect, restrictTo('admin'), deleteFAQ);

export default router;

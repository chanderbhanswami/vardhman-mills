import express from 'express';
import {
  subscribe,
  verifySubscription,
  unsubscribe,
  updatePreferences,
  getSubscriptionStatus,
  getAllSubscribers,
  getActiveSubscribers,
  getSubscribersByTags,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  addTags,
  removeTags,
  bulkImport,
  bulkUpdate,
  bulkDelete,
  getStats,
  cleanupUnverified,
  exportSubscribers
} from '../controllers/newsletter.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Subscribe
router.post('/subscribe', subscribe);

// Verify subscription
router.get('/verify/:token', verifySubscription);

// Unsubscribe
router.post('/unsubscribe/:token', unsubscribe);

// Update preferences
router.patch('/preferences/:token', updatePreferences);

// Get subscription status
router.get('/status/:email', getSubscriptionStatus);

// ==================== ADMIN ROUTES ====================

// Statistics
router.get('/stats', protect, restrictTo('admin'), getStats);

// Export
router.get('/export', protect, restrictTo('admin'), exportSubscribers);

// Active subscribers
router.get('/subscribers/active', protect, restrictTo('admin'), getActiveSubscribers);

// By tags
router.get('/subscribers/tags/:tags', protect, restrictTo('admin'), getSubscribersByTags);

// Bulk operations
router.post('/subscribers/bulk-import', protect, restrictTo('admin'), bulkImport);
router.patch('/subscribers/bulk-update', protect, restrictTo('admin'), bulkUpdate);
router.delete('/subscribers/bulk-delete', protect, restrictTo('admin'), bulkDelete);

// Cleanup
router.post('/cleanup', protect, restrictTo('admin'), cleanupUnverified);

// Get all subscribers
router.get('/subscribers', protect, restrictTo('admin'), getAllSubscribers);

// Single subscriber operations
router.get('/subscribers/:id', protect, restrictTo('admin'), getSubscriber);
router.patch('/subscribers/:id', protect, restrictTo('admin'), updateSubscriber);
router.delete('/subscribers/:id', protect, restrictTo('admin'), deleteSubscriber);

// Tags management
router.post('/subscribers/:id/tags', protect, restrictTo('admin'), addTags);
router.delete('/subscribers/:id/tags', protect, restrictTo('admin'), removeTags);

export default router;

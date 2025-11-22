import express from 'express';
import {
  getThread,
  getRepliesByReview,
  getReply,
  getTopReplies,
  createReply,
  updateReply,
  deleteReply,
  toggleLike,
  toggleDislike,
  markHelpful,
  markUnhelpful,
  addReaction,
  reportReply,
  approveReply,
  rejectReply,
  flagReply,
  markAsSpam,
  getModerationQueue,
  pinReply,
  unpinReply,
  featureReply,
  searchReplies,
  getAnalytics
} from '../controllers/review-reply.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * Get thread
 */
router.get('/thread/:threadId', getThread);

/**
 * Get replies by review
 */
router.get('/review/:reviewId', getRepliesByReview);

/**
 * Get top replies
 */
router.get('/top', getTopReplies);

/**
 * Search replies
 */
router.get('/search', searchReplies);

/**
 * Get single reply
 */
router.get('/:id', getReply);

// ==================== PROTECTED ROUTES ====================

/**
 * Create reply
 */
router.post('/', protect, createReply);

/**
 * Update reply
 */
router.patch('/:id', protect, updateReply);

/**
 * Delete reply
 */
router.delete('/:id', protect, deleteReply);

/**
 * Engagement actions
 */
router.post('/:id/like', protect, toggleLike);
router.post('/:id/dislike', protect, toggleDislike);
router.post('/:id/helpful', protect, markHelpful);
router.post('/:id/unhelpful', protect, markUnhelpful);
router.post('/:id/react', protect, addReaction);
router.post('/:id/report', protect, reportReply);
router.post('/:id/flag', protect, flagReply);

// ==================== ADMIN/MODERATOR ROUTES ====================

// Moderation
router.get(
  '/moderation/queue',
  protect,
  restrictTo('admin', 'moderator'),
  getModerationQueue
);

router.post(
  '/:id/approve',
  protect,
  restrictTo('admin', 'moderator'),
  approveReply
);

router.post(
  '/:id/reject',
  protect,
  restrictTo('admin', 'moderator'),
  rejectReply
);

router.post(
  '/:id/spam',
  protect,
  restrictTo('admin', 'moderator'),
  markAsSpam
);

// Pin/Feature
router.post(
  '/:id/pin',
  protect,
  restrictTo('admin'),
  pinReply
);

router.post(
  '/:id/unpin',
  protect,
  restrictTo('admin'),
  unpinReply
);

router.post(
  '/:id/feature',
  protect,
  restrictTo('admin'),
  featureReply
);

// Analytics
router.get(
  '/analytics/overview',
  protect,
  restrictTo('admin'),
  getAnalytics
);

export default router;

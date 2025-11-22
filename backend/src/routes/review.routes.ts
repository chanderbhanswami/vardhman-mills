import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Product reviews - public access for viewing
router.get('/products/:productId/distribution', reviewController.getRatingDistribution);
router.get('/products/:productId/top', reviewController.getTopReviews);
router.get('/products/:productId', reviewController.getProductReviews);

// Single review - public access
router.get('/:id', reviewController.getReview);

// ==================== AUTHENTICATION REQUIRED ====================
router.use(protect);

// User's own reviews
router.get('/my/reviews', reviewController.getMyReviews);

// Create review for a product
router.post('/products/:productId', reviewController.createReview);

// Update/delete own review
router
  .route('/:id')
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

// Voting system
router.post('/:id/vote', reviewController.voteReview);
router.delete('/:id/vote', reviewController.removeVote);

// Flagging system
router.post('/:id/flag', reviewController.flagReview);

// ==================== ADMIN/SELLER ROUTES ====================
router.use(restrictTo('admin', 'seller'));

// Response management
router.post('/:id/response', reviewController.addResponse);
router.delete('/:id/response', reviewController.deleteResponse);

// Moderation
router.patch('/:id/approve', reviewController.approveReview);
router.patch('/:id/reject', reviewController.rejectReview);

// Admin lists
router.get('/admin/pending', reviewController.getPendingReviews);
router.get('/admin/flagged', reviewController.getFlaggedReviews);
router.get('/admin/stats', reviewController.getReviewStats);

// Bulk operations
router.post('/admin/bulk-approve', reviewController.bulkApproveReviews);
router.delete('/admin/bulk-delete', reviewController.bulkDeleteReviews);

export default router;

import express from 'express';
import * as featuredContentController from '../controllers/featured-content.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/v1/featured-content/placement/:placement
 * @desc    Get featured content by placement (public)
 * @access  Public
 */
router.get('/placement/:placement', featuredContentController.getFeaturedContentByPlacement);

// ==================== ADMIN ROUTES ====================

// Protect all routes after this middleware
router.use(protect, restrictTo('admin', 'super-admin'));

/**
 * @route   GET /api/v1/featured-content
 * @desc    Get all featured content with filters
 * @access  Admin
 */
router.get('/', featuredContentController.getFeaturedContents);

/**
 * @route   POST /api/v1/featured-content
 * @desc    Create new featured content
 * @access  Admin
 */
router.post('/', featuredContentController.createFeaturedContent);

/**
 * @route   GET /api/v1/featured-content/analytics
 * @desc    Get featured content analytics dashboard
 * @access  Admin
 */
router.get('/analytics', featuredContentController.getFeaturedContentAnalytics);

/**
 * @route   POST /api/v1/featured-content/bulk-update
 * @desc    Bulk update featured content
 * @access  Admin
 */
router.post('/bulk-update', featuredContentController.bulkUpdateContents);

/**
 * @route   GET /api/v1/featured-content/:id
 * @desc    Get featured content by ID
 * @access  Admin
 */
router.get('/:id', featuredContentController.getFeaturedContentById);

/**
 * @route   PATCH /api/v1/featured-content/:id
 * @desc    Update featured content
 * @access  Admin
 */
router.patch('/:id', featuredContentController.updateFeaturedContent);

/**
 * @route   DELETE /api/v1/featured-content/:id
 * @desc    Delete featured content
 * @access  Admin
 */
router.delete('/:id', featuredContentController.deleteFeaturedContent);

/**
 * @route   POST /api/v1/featured-content/:id/duplicate
 * @desc    Duplicate featured content
 * @access  Admin
 */
router.post('/:id/duplicate', featuredContentController.duplicateFeaturedContent);

/**
 * @route   PATCH /api/v1/featured-content/:id/activate
 * @desc    Activate featured content
 * @access  Admin
 */
router.patch('/:id/activate', featuredContentController.activateFeaturedContent);

/**
 * @route   PATCH /api/v1/featured-content/:id/deactivate
 * @desc    Deactivate featured content
 * @access  Admin
 */
router.patch('/:id/deactivate', featuredContentController.deactivateFeaturedContent);

/**
 * @route   PATCH /api/v1/featured-content/:id/position
 * @desc    Update featured content position
 * @access  Admin
 */
router.patch('/:id/position', featuredContentController.updatePosition);

/**
 * @route   POST /api/v1/featured-content/:id/reorder
 * @desc    Reorder featured content
 * @access  Admin
 */
router.post('/:id/reorder', featuredContentController.reorderContents);

/**
 * @route   GET /api/v1/featured-content/:id/stats
 * @desc    Get featured content statistics
 * @access  Admin
 */
router.get('/:id/stats', featuredContentController.getContentStats);

/**
 * @route   POST /api/v1/featured-content/:id/track/impression
 * @desc    Track featured content impression
 * @access  Public
 */
router.post('/:id/track/impression', featuredContentController.trackImpression);

/**
 * @route   POST /api/v1/featured-content/:id/track/click
 * @desc    Track featured content click
 * @access  Public
 */
router.post('/:id/track/click', featuredContentController.trackClick);

/**
 * @route   POST /api/v1/featured-content/:id/track/conversion
 * @desc    Track featured content conversion
 * @access  Public
 */
router.post('/:id/track/conversion', featuredContentController.trackConversion);

/**
 * @route   POST /api/v1/featured-content/:id/schedule
 * @desc    Schedule featured content
 * @access  Admin
 */
router.post('/:id/schedule', featuredContentController.scheduleFeaturedContent);

/**
 * @route   POST /api/v1/featured-content/:id/ab-test
 * @desc    Create A/B test
 * @access  Admin
 */
router.post('/:id/ab-test', featuredContentController.createABTest);

/**
 * @route   GET /api/v1/featured-content/:id/ab-test/results
 * @desc    Get A/B test results
 * @access  Admin
 */
router.get('/:id/ab-test/results', featuredContentController.getABTestResults);

/**
 * @route   POST /api/v1/featured-content/:id/ab-test/end
 * @desc    End A/B test
 * @access  Admin
 */
router.post('/:id/ab-test/end', featuredContentController.endABTest);

export default router;

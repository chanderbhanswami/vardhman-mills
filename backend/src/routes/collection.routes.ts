import express from 'express';
import * as collectionController from '../controllers/collection.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/v1/collections
 * @desc    Get all collections with filters (public)
 * @access  Public
 */
router.get('/', collectionController.getCollections);

/**
 * @route   GET /api/v1/collections/slug/:slug
 * @desc    Get collection by slug (public)
 * @access  Public
 */
router.get('/slug/:slug', collectionController.getCollectionBySlug);

/**
 * @route   GET /api/v1/collections/:id/products
 * @desc    Get products in a collection (public)
 * @access  Public
 */
router.get('/:id/products', collectionController.getCollectionProducts);

// ==================== ADMIN ROUTES ====================

// Protect all routes after this middleware
router.use(protect, restrictTo('admin', 'super-admin'));

/**
 * @route   POST /api/v1/collections
 * @desc    Create new collection
 * @access  Admin
 */
router.post('/', collectionController.createCollection);

/**
 * @route   GET /api/v1/collections/analytics
 * @desc    Get collections analytics dashboard
 * @access  Admin
 */
router.get('/analytics', collectionController.getCollectionAnalytics);

/**
 * @route   POST /api/v1/collections/refresh-all
 * @desc    Refresh all automatic/hybrid collections
 * @access  Admin
 */
router.post('/refresh-all', collectionController.refreshAllCollections);

/**
 * @route   POST /api/v1/collections/validate-rules
 * @desc    Validate collection rules
 * @access  Admin
 */
router.post('/validate-rules', collectionController.validateRules);

/**
 * @route   POST /api/v1/collections/bulk-update
 * @desc    Bulk update collections
 * @access  Admin
 */
router.post('/bulk-update', collectionController.bulkUpdateCollections);

/**
 * @route   POST /api/v1/collections/bulk-delete
 * @desc    Bulk delete collections
 * @access  Admin
 */
router.post('/bulk-delete', collectionController.bulkDeleteCollections);

/**
 * @route   GET /api/v1/collections/:id
 * @desc    Get collection by ID
 * @access  Admin
 */
router.get('/:id', collectionController.getCollectionById);

/**
 * @route   PATCH /api/v1/collections/:id
 * @desc    Update collection
 * @access  Admin
 */
router.patch('/:id', collectionController.updateCollection);

/**
 * @route   DELETE /api/v1/collections/:id
 * @desc    Delete collection
 * @access  Admin
 */
router.delete('/:id', collectionController.deleteCollection);

/**
 * @route   POST /api/v1/collections/:id/duplicate
 * @desc    Duplicate collection
 * @access  Admin
 */
router.post('/:id/duplicate', collectionController.duplicateCollection);

/**
 * @route   PATCH /api/v1/collections/:id/activate
 * @desc    Activate collection
 * @access  Admin
 */
router.patch('/:id/activate', collectionController.activateCollection);

/**
 * @route   PATCH /api/v1/collections/:id/deactivate
 * @desc    Deactivate collection
 * @access  Admin
 */
router.patch('/:id/deactivate', collectionController.deactivateCollection);

/**
 * @route   POST /api/v1/collections/:id/products
 * @desc    Add products to collection (manual/hybrid)
 * @access  Admin
 */
router.post('/:id/products', collectionController.addProductsToCollection);

/**
 * @route   DELETE /api/v1/collections/:id/products
 * @desc    Remove products from collection (manual/hybrid)
 * @access  Admin
 */
router.delete('/:id/products', collectionController.removeProductsFromCollection);

/**
 * @route   PATCH /api/v1/collections/:id/products/reorder
 * @desc    Reorder products in collection (manual/hybrid)
 * @access  Admin
 */
router.patch('/:id/products/reorder', collectionController.reorderProducts);

/**
 * @route   POST /api/v1/collections/:id/refresh
 * @desc    Refresh collection products (automatic/hybrid)
 * @access  Admin
 */
router.post('/:id/refresh', collectionController.refreshCollectionProducts);

/**
 * @route   GET /api/v1/collections/:id/stats
 * @desc    Get collection statistics
 * @access  Admin
 */
router.get('/:id/stats', collectionController.getCollectionStats);

/**
 * @route   POST /api/v1/collections/:id/track/view
 * @desc    Track collection view
 * @access  Admin
 */
router.post('/:id/track/view', collectionController.trackCollectionView);

/**
 * @route   POST /api/v1/collections/:id/track/click
 * @desc    Track collection click
 * @access  Admin
 */
router.post('/:id/track/click', collectionController.trackCollectionClick);

export default router;

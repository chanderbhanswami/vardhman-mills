import express from 'express';
import {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  bulkDeleteMedia,
  optimizeMedia,
  bulkOptimizeMedia,
  generateThumbnails,
  convertFormat,
  addWatermark,
  removeWatermark,
  approveMedia,
  rejectMedia,
  flagMedia,
  unflagMedia,
  getModerationQueue,
  assignModerator,
  bulkModerate,
  getAnalytics,
  getMediaStats
} from '../controllers/review-media.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * Get all review media
 */
router.get('/', getAllMedia);

/**
 * Get single media by ID
 */
router.get('/:id', getMediaById);

// ==================== PROTECTED ROUTES ====================

/**
 * Create new media
 */
router.post('/', protect, createMedia);

/**
 * Update media
 */
router.patch('/:id', protect, updateMedia);

/**
 * Delete media
 */
router.delete('/:id', protect, deleteMedia);

/**
 * Flag media
 */
router.post('/:id/flag', protect, flagMedia);

// ==================== ADMIN/MODERATOR ROUTES ====================

// Use middleware for all routes below
router.use(protect);
router.use(restrictTo('admin', 'moderator'));

/**
 * Bulk operations
 */
router.delete('/bulk-delete', bulkDeleteMedia);
router.post('/bulk-optimize', bulkOptimizeMedia);
router.post('/bulk-moderate', bulkModerate);

/**
 * Optimization
 */
router.post('/:id/optimize', optimizeMedia);
router.post('/:id/thumbnails', generateThumbnails);
router.post('/:id/convert', convertFormat);

/**
 * Watermark
 */
router.post('/:id/watermark', addWatermark);
router.delete('/:id/watermark', removeWatermark);

/**
 * Moderation
 */
router.get('/moderation/queue', getModerationQueue);
router.post('/:id/approve', approveMedia);
router.post('/:id/reject', rejectMedia);
router.post('/:id/unflag', unflagMedia);
router.post('/:id/assign-moderator', assignModerator);

/**
 * Analytics
 */
router.get('/analytics/overview', getAnalytics);
router.get('/analytics/stats', getMediaStats);

export default router;

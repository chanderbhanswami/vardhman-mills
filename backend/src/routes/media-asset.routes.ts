import express from 'express';
import * as mediaAssetController from '../controllers/media-asset.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes protected for admin
router.use(protect);
router.use(restrictTo('admin', 'super-admin'));

// ==================== MEDIA ASSETS ====================

router
  .route('/')
  .get(mediaAssetController.getMediaAssets)
  .post(mediaAssetController.createMediaAsset);

router
  .route('/analytics')
  .get(mediaAssetController.getMediaAnalytics);

router
  .route('/unused')
  .get(mediaAssetController.getUnusedAssets);

router
  .route('/bulk/update')
  .patch(mediaAssetController.bulkUpdateAssets);

router
  .route('/bulk/delete')
  .delete(mediaAssetController.bulkDeleteAssets);

// ==================== FOLDERS ====================

router
  .route('/folders')
  .get(mediaAssetController.getFolders);

router
  .route('/:id/move')
  .patch(mediaAssetController.moveToFolder);

// ==================== USAGE TRACKING ====================

router
  .route('/:id/usage')
  .post(mediaAssetController.trackUsage)
  .delete(mediaAssetController.removeUsage);

// ==================== OPTIMIZATION ====================

router
  .route('/:id/optimize')
  .post(mediaAssetController.optimizeAsset);

// ==================== ANALYTICS ====================

router
  .route('/:id/download')
  .post(mediaAssetController.trackDownload);

// ==================== SINGLE ASSET ====================

router
  .route('/slug/:slug')
  .get(mediaAssetController.getMediaAssetBySlug);

router
  .route('/:id')
  .get(mediaAssetController.getMediaAssetById)
  .patch(mediaAssetController.updateMediaAsset)
  .delete(mediaAssetController.deleteMediaAsset);

router
  .route('/:id/archive')
  .patch(mediaAssetController.archiveMediaAsset);

router
  .route('/:id/restore')
  .patch(mediaAssetController.restoreMediaAsset);

export default router;

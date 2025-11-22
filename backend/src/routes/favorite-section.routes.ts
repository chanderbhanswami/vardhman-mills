import express from 'express';
import * as favoriteSectionController from '../controllers/favorite-section.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get('/', favoriteSectionController.getFavoriteSections);
router.get('/placement/:page', favoriteSectionController.getSectionsByPlacement);
router.post('/:id/impression', favoriteSectionController.trackImpression);
router.post('/:id/click', favoriteSectionController.trackClick);
router.get('/:identifier', favoriteSectionController.getFavoriteSectionByIdOrSlug);

// ==================== PROTECTED ADMIN ROUTES ====================
router.use(protect);
router.use(restrictTo('admin', 'super-admin'));

router.post('/', favoriteSectionController.createFavoriteSection);
router.patch('/:id', favoriteSectionController.updateFavoriteSection);
router.delete('/:id', favoriteSectionController.deleteFavoriteSection);
router.patch('/:id/publish', favoriteSectionController.publishFavoriteSection);
router.patch('/:id/archive', favoriteSectionController.archiveFavoriteSection);
router.post('/:id/duplicate', favoriteSectionController.duplicateFavoriteSection);
router.patch('/reorder', favoriteSectionController.reorderSections);
router.get('/analytics/overview', favoriteSectionController.getSectionAnalytics);
router.post('/:id/ab-test/start', favoriteSectionController.startABTest);
router.post('/:id/ab-test/end', favoriteSectionController.endABTest);
router.patch('/bulk-update', favoriteSectionController.bulkUpdateSections);
router.delete('/bulk-delete', favoriteSectionController.bulkDeleteSections);

export default router;

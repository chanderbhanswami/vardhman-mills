import express from 'express';
import {
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  activateAnnouncement,
  deactivateAnnouncement,
  pauseAnnouncement,
  resumeAnnouncement,
  bulkUpdateStatus,
  getActiveAnnouncements,
  getAnnouncementsForPage,
  getScheduledAnnouncements,
  trackView,
  trackClick,
  trackDismissal,
  getAnnouncementStats,
  getAnnouncementMetrics,
  cleanupExpiredAnnouncements,
  duplicateAnnouncement
} from '../controllers/announcement.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * Get active announcements for public display
 */
router.get('/active', getActiveAnnouncements);

/**
 * Get announcements for specific page
 */
router.get('/page/:page', getAnnouncementsForPage);

/**
 * Track announcement interactions (view, click, dismiss)
 */
router.post('/:id/view', trackView);
router.post('/:id/click', trackClick);
router.post('/:id/dismiss', trackDismissal);

// ==================== PROTECTED ROUTES (Admin Only) ====================

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('admin'));

/**
 * CRUD operations
 */
router
  .route('/')
  .get(getAllAnnouncements)
  .post(createAnnouncement);

router
  .route('/:id')
  .get(getAnnouncement)
  .put(updateAnnouncement)
  .delete(deleteAnnouncement);

/**
 * Status management
 */
router.post('/:id/activate', activateAnnouncement);
router.post('/:id/deactivate', deactivateAnnouncement);
router.post('/:id/pause', pauseAnnouncement);
router.post('/:id/resume', resumeAnnouncement);
router.post('/bulk-status', bulkUpdateStatus);

/**
 * Scheduled announcements
 */
router.get('/scheduled', getScheduledAnnouncements);

/**
 * Analytics
 */
router.get('/stats/overview', getAnnouncementStats);
router.get('/:id/metrics', getAnnouncementMetrics);

/**
 * System operations
 */
router.post('/cleanup', cleanupExpiredAnnouncements);
router.post('/:id/duplicate', duplicateAnnouncement);

export default router;

import express from 'express';
import {
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  activateDeal,
  pauseDeal,
  cancelDeal,
  checkEligibility,
  calculateDiscount,
  trackClick,
  getFlashSales,
  getUpcomingDeals,
  getDealStatistics,
  getTopDeals,
  getDealAnalytics,
  bulkActivateDeals,
  bulkPauseDeals,
  bulkDeleteDeals,
  updateDealStatuses
} from '../controllers/deal.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get deals
router.get('/', getDeals);
router.get('/flash-sales', getFlashSales);
router.get('/upcoming', getUpcomingDeals);
router.get('/:id', getDeal);

// Check eligibility
router.get('/check-eligibility/:productId', checkEligibility);

// Track click
router.post('/:id/click', trackClick);

// ==================== PROTECTED ROUTES ====================

// Calculate discount (requires auth to check user limits)
router.post('/calculate-discount', protect, calculateDiscount);

// ==================== ADMIN ROUTES ====================

// CRUD operations
router.post('/', protect, restrictTo('admin'), createDeal);
router.patch('/:id', protect, restrictTo('admin'), updateDeal);
router.delete('/:id', protect, restrictTo('admin'), deleteDeal);

// Status management
router.patch('/:id/activate', protect, restrictTo('admin'), activateDeal);
router.patch('/:id/pause', protect, restrictTo('admin'), pauseDeal);
router.patch('/:id/cancel', protect, restrictTo('admin'), cancelDeal);

// Analytics
router.get('/:id/statistics', protect, restrictTo('admin'), getDealStatistics);
router.get('/admin/top-performing', protect, restrictTo('admin'), getTopDeals);
router.get('/admin/analytics', protect, restrictTo('admin'), getDealAnalytics);

// Bulk operations
router.post('/admin/bulk-activate', protect, restrictTo('admin'), bulkActivateDeals);
router.post('/admin/bulk-pause', protect, restrictTo('admin'), bulkPauseDeals);
router.delete('/admin/bulk-delete', protect, restrictTo('admin'), bulkDeleteDeals);

// System operations
router.post('/system/update-statuses', protect, restrictTo('admin'), updateDealStatuses);

export default router;

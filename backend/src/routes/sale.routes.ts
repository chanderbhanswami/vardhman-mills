import express from 'express';
import {
  getAllSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  activateSale,
  deactivateSale,
  publishSale,
  unpublishSale,
  toggleFeatured,
  getActiveSales,
  getFeaturedSales,
  getUpcomingSales,
  getSalesByType,
  getSaleBySlug,
  getSalesForProduct,
  checkSaleApplicable,
  calculateDiscount,
  getSaleStats,
  getSaleAnalytics,
  cleanupExpiredSales,
  activateScheduledSales,
  duplicateSale
} from '../controllers/sale.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * Get active sales for public display
 */
router.get('/active', getActiveSales);

/**
 * Get featured sales
 */
router.get('/featured', getFeaturedSales);

/**
 * Get upcoming sales
 */
router.get('/upcoming', getUpcomingSales);

/**
 * Get sales by type
 */
router.get('/type/:type', getSalesByType);

/**
 * Get sale by slug
 */
router.get('/slug/:slug', getSaleBySlug);

/**
 * Get sales for specific product
 */
router.get('/product/:productId', getSalesForProduct);

/**
 * Check if sale can be applied
 */
router.post('/:id/check', checkSaleApplicable);

/**
 * Calculate discount for price
 */
router.post('/:id/calculate', calculateDiscount);

// ==================== PROTECTED ROUTES (Admin Only) ====================

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('admin'));

/**
 * CRUD operations
 */
router
  .route('/')
  .get(getAllSales)
  .post(createSale);

router
  .route('/:id')
  .get(getSale)
  .put(updateSale)
  .delete(deleteSale);

/**
 * Status management
 */
router.post('/:id/activate', activateSale);
router.post('/:id/deactivate', deactivateSale);
router.post('/:id/publish', publishSale);
router.post('/:id/unpublish', unpublishSale);
router.post('/:id/toggle-featured', toggleFeatured);

/**
 * Analytics
 */
router.get('/stats/overview', getSaleStats);
router.get('/:id/analytics', getSaleAnalytics);

/**
 * System operations
 */
router.post('/cleanup', cleanupExpiredSales);
router.post('/activate-scheduled', activateScheduledSales);
router.post('/:id/duplicate', duplicateSale);

export default router;

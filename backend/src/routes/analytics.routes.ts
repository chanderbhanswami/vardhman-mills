import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public event tracking endpoints (no auth required for tracking)
router.post('/track', analyticsController.trackEvent);
router.post('/page-view', analyticsController.trackPageView);
router.post('/product-view', analyticsController.trackProductView);
router.post('/add-to-cart', analyticsController.trackAddToCart);
router.post('/purchase', analyticsController.trackPurchase);
router.post('/search', analyticsController.trackSearch);
router.post('/events', analyticsController.trackCustomEvent);
router.post('/batch-track', analyticsController.batchTrackEvents);

// User behavior endpoints (protected)
router.get('/user-behavior', protect, analyticsController.getUserBehavior);
router.get('/user-journey', protect, analyticsController.getUserJourney);

// Analytics endpoints (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.get('/session-analytics', analyticsController.getSessionAnalytics);
router.get('/product-performance', analyticsController.getProductPerformance);
router.get('/category-analytics', analyticsController.getCategoryAnalytics);
router.get('/revenue-analytics', analyticsController.getRevenueAnalytics);
router.get('/conversion-funnel', analyticsController.getConversionFunnel);
router.get('/search-analytics', analyticsController.getSearchAnalytics);
router.get('/dashboard', analyticsController.getDashboard);
router.get('/realtime', analyticsController.getRealTimeData);
router.get('/export', analyticsController.exportData);

// Custom reports
router.post('/reports', analyticsController.createCustomReport);
router.get('/reports/:id', analyticsController.getCustomReport);

export default router;

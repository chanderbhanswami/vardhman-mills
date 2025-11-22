import { Router } from 'express';
import { protect as authenticate, restrictTo } from '../middleware/auth.middleware';
import * as comparisonController from '../controllers/productComparison.controller';

const router = Router();

// Public routes
router.get('/public', comparisonController.getPublicComparisons);
router.get('/shared/:token', comparisonController.getSharedComparison);
router.get('/popular', comparisonController.getPopularComparisons);
router.get('/trends', comparisonController.getComparisonTrends);
router.get('/products/popular', comparisonController.getMostComparedProducts);

// CRUD Operations (authenticated)
router.get('/', authenticate, comparisonController.getUserComparisons);
router.get('/:id', comparisonController.getComparison); // Public if isPublic=true
router.post('/', comparisonController.createComparison); // Supports sessionId for anonymous
router.put('/:id', comparisonController.updateComparison);
router.delete('/:id', comparisonController.deleteComparison);

// Product Management
router.post('/:id/products', comparisonController.addProduct);
router.delete('/:id/products/:productId', comparisonController.removeProduct);

// Comparison Analysis
router.get('/:id/analyze', comparisonController.analyzeComparison);
router.get('/:id/category-features', comparisonController.getCategoryFeatures);

// Sharing
router.post('/:id/share', comparisonController.generateShareLink);

// Export
router.get('/:id/export', comparisonController.exportComparison);

// AI Insights & Recommendations
router.get('/:id/insights', comparisonController.getComparisonInsights);
router.get('/:id/recommendations', comparisonController.getRecommendations);

// Analytics
router.get('/:id/analytics', authenticate, comparisonController.getComparisonAnalytics);
router.post('/analytics/:event', comparisonController.trackAnalyticsEvent);

// Analytics (authenticated)
router.get('/stats/overview', authenticate, comparisonController.getComparisonStats);

// Bulk Operations (authenticated)
router.post('/bulk-delete', authenticate, comparisonController.bulkDelete);

// System (Admin)
router.post('/cleanup', authenticate, restrictTo('admin'), comparisonController.cleanupExpired);

export default router;

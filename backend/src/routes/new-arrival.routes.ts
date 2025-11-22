import express from 'express';
import * as newArrivalController from '../controllers/new-arrival.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get('/', newArrivalController.getNewArrivals);
router.get('/featured', newArrivalController.getFeaturedNewArrivals);
router.get('/trending', newArrivalController.getTrendingNewArrivals);
router.get('/priority', newArrivalController.getPriorityNewArrivals);
router.get('/upcoming', newArrivalController.getUpcomingNewArrivals);
router.get('/category/:categoryId', newArrivalController.getNewArrivalsByCategory);
router.get('/brand/:brandId', newArrivalController.getNewArrivalsByBrand);
router.get('/:id', newArrivalController.getNewArrivalById);

// ==================== PROTECTED ADMIN ROUTES ====================
router.use(protect);
router.use(restrictTo('admin', 'super-admin'));

router.post('/', newArrivalController.createNewArrival);
router.patch('/:id', newArrivalController.updateNewArrival);
router.delete('/:id', newArrivalController.deleteNewArrival);
router.get('/analytics/overview', newArrivalController.getNewArrivalAnalytics);
router.patch('/:id/metrics', newArrivalController.updateNewArrivalMetrics);
router.patch('/bulk-update', newArrivalController.bulkUpdateNewArrivals);
router.delete('/bulk-delete', newArrivalController.bulkDeleteNewArrivals);
router.post('/expire-old', newArrivalController.expireOldNewArrivals);
router.post('/:id/notify', newArrivalController.sendNewArrivalNotifications);
router.patch('/update-order', newArrivalController.updateDisplayOrder);

export default router;

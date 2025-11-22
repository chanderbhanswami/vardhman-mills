import express from 'express';
import * as analyticsController from '../../controllers/analytics.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All admin analytics routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// System analytics
router.get('/system-analytics', analyticsController.getSystemAnalytics);

// Settings management
router.get('/settings', analyticsController.getSettings);
router.put('/settings', analyticsController.updateSettings);

// Data cleanup
router.delete('/cleanup', analyticsController.cleanupData);

export default router;

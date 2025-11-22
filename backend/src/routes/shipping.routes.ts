import express from 'express';
import * as shippingController from '../controllers/shipping.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public shipping routes
router.post('/calculate-rates', shippingController.calculateRates);

// Admin-only shipping routes
router.use(protect);
router.use(restrictTo('admin'));

// Shipping zones
router.route('/zones')
  .get(shippingController.getAllZones)
  .post(shippingController.createZone);

router.route('/zones/:id')
  .get(shippingController.getZone)
  .patch(shippingController.updateZone)
  .delete(shippingController.deleteZone);

// Shipping methods
router.route('/methods')
  .get(shippingController.getAllMethods)
  .post(shippingController.createMethod);

router.route('/methods/:id')
  .get(shippingController.getMethod)
  .patch(shippingController.updateMethod)
  .delete(shippingController.deleteMethod);

// Zone-specific methods
router.get('/zones/:zoneId/methods', shippingController.getMethodsByZone);

// Method rate calculation
router.post('/methods/:methodId/calculate-rate', shippingController.calculateMethodRate);

// Statistics
router.get('/stats', shippingController.getShippingStats);

export default router;

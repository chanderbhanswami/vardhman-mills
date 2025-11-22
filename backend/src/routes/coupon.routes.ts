import express from 'express';
import {
  getAllCoupons,
  getCoupon,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  removeCoupon,
  getUserCoupons,
  getCouponAnalytics,
  getCouponUsageStats,
  shareCoupon,
  generateReferralCode,
  bulkDeleteCoupons,
  bulkToggleActiveStatus
} from '../controllers/coupon.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/code/:code', getCouponByCode);

// Protected routes (requires authentication)
router.use(protect);

// User routes
router.get('/user/:userId', getUserCoupons);
router.post('/validate', validateCoupon);
router.post('/apply', applyCoupon);
router.delete('/remove/:orderId', removeCoupon);
router.post('/:id/share', shareCoupon);
router.post('/referral/generate', generateReferralCode);

// Admin routes
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllCoupons)
  .post(createCoupon);

router
  .route('/:id')
  .get(getCoupon)
  .patch(updateCoupon)
  .delete(deleteCoupon);

router.get('/analytics', getCouponAnalytics);
router.get('/:id/usage-stats', getCouponUsageStats);

// Bulk operations
router.post('/bulk-delete', bulkDeleteCoupons);
router.patch('/bulk-toggle-active', bulkToggleActiveStatus);

export default router;

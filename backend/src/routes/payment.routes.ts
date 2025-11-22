import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getPaymentStatus,
  refundPayment,
  getPaymentById,
  getPaymentMethods,
  verifyPayment,
  getAvailablePaymentMethods,
  getPaymentStats
} from '../controllers/payment.controller.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// Webhook route (no auth required)
router.post('/razorpay/webhook', handleRazorpayWebhook);

// Get available payment methods
router.get('/methods/available', getAvailablePaymentMethods);

// Verify payment
router.post('/verify', verifyPayment);

// ============================================================================
// PROTECTED ROUTES (Optional Auth)
// ============================================================================

// Routes that work with optional authentication
router.post('/razorpay/create-order', optionalAuth, createRazorpayOrder);
router.post('/razorpay/verify', optionalAuth, verifyRazorpayPayment);
router.get('/:orderId/status', optionalAuth, getPaymentStatus);

// ============================================================================
// PROTECTED ROUTES - USER
// ============================================================================

router.use(protect); // All routes below require authentication

// Get user's saved payment methods
router.get('/methods', getPaymentMethods);

// Get payment by ID
router.get('/:id', getPaymentById);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

router.use(restrictTo('admin')); // All routes below require admin role

// Payment statistics
router.get('/admin/stats', getPaymentStats);

// Refund payment
router.post('/:orderId/refund', refundPayment);

export default router;

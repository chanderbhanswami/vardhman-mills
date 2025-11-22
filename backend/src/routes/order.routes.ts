import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  bulkDeleteOrders,
  bulkUpdateOrderStatus,
  generateInvoice,
  downloadInvoice,
  emailInvoice
} from '../controllers/order.controller.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/track', trackOrder);

// Routes that work with optional authentication
router.post('/', optionalAuth, createOrder);
router.get('/:id', optionalAuth, getOrder);

// Protected routes
router.use(protect);

router.get('/my/orders', getMyOrders);
router.patch('/:id/cancel', cancelOrder);

// Invoice routes (must be before admin middleware)
router.get('/:id/invoice', generateInvoice);
router.get('/:id/invoice/download', downloadInvoice);
router.post('/:id/invoice/email', emailInvoice);

// Admin routes
router.use(restrictTo('admin'));

router.get('/admin/all', getAllOrders);
router.get('/admin/stats', getOrderStats);
router.patch('/admin/:id/status', updateOrderStatus);

// Bulk operations
router.delete('/admin/bulk-delete', bulkDeleteOrders);
router.patch('/admin/bulk-update-status', bulkUpdateOrderStatus);

export default router;
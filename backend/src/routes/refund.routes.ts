import express from 'express';
import {
  createRefund,
  getUserRefunds,
  getRefund,
  cancelRefund,
  getAllRefunds,
  getPendingRefunds,
  approveRefund,
  rejectRefund,
  processRefund,
  updateRefund,
  getOrderRefunds,
  getRefundStats,
  updateRefundStatus
} from '../controllers/refund.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { body, query, param } from 'express-validator';

/**
 * Refund Routes - Vardhman Mills Backend
 * 
 * Routes for refund management:
 * - User routes: Create, view, cancel refunds
 * - Admin routes: Approve, reject, process refunds
 * - Webhook routes: Update status from payment gateway
 * 
 * @version 1.0.0
 * @created 2025-11-01
 */

const router = express.Router();

// ============================================================================
// VALIDATION RULES
// ============================================================================

const createRefundValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('type')
    .optional()
    .isIn(['full', 'partial', 'exchange'])
    .withMessage('Invalid refund type'),
  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .isIn([
      'defective',
      'wrong_item',
      'not_as_described',
      'damaged',
      'late_delivery',
      'changed_mind',
      'better_price',
      'duplicate_order',
      'other'
    ])
    .withMessage('Invalid refund reason'),
  body('detailedReason')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Detailed reason must be less than 500 characters'),
  body('items')
    .if(body('type').equals('partial'))
    .notEmpty()
    .withMessage('Items are required for partial refund')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product')
    .if(body('type').equals('partial'))
    .notEmpty()
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .if(body('type').equals('partial'))
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.reason')
    .if(body('type').equals('partial'))
    .notEmpty()
    .withMessage('Item reason is required'),
  body('paymentMethod')
    .optional()
    .isIn(['original', 'bank_transfer', 'store_credit'])
    .withMessage('Invalid payment method'),
  body('bankDetails')
    .if(body('paymentMethod').equals('bank_transfer'))
    .notEmpty()
    .withMessage('Bank details are required for bank transfer'),
  body('bankDetails.accountNumber')
    .if(body('paymentMethod').equals('bank_transfer'))
    .notEmpty()
    .isString()
    .withMessage('Account number is required'),
  body('bankDetails.accountHolderName')
    .if(body('paymentMethod').equals('bank_transfer'))
    .notEmpty()
    .isString()
    .withMessage('Account holder name is required'),
  body('bankDetails.ifscCode')
    .if(body('paymentMethod').equals('bank_transfer'))
    .notEmpty()
    .isString()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .withMessage('Invalid IFSC code'),
  body('requiresReturn')
    .optional()
    .isBoolean()
    .withMessage('requiresReturn must be a boolean')
];

const approveRefundValidation = [
  param('id').isMongoId().withMessage('Invalid refund ID'),
  body('note')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Note must be less than 500 characters')
];

const rejectRefundValidation = [
  param('id').isMongoId().withMessage('Invalid refund ID'),
  body('reason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isString()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
];

const updateRefundValidation = [
  param('id').isMongoId().withMessage('Invalid refund ID'),
  body('returnStatus')
    .optional()
    .isIn(['initiated', 'pickup_scheduled', 'in_transit', 'received', 'inspected'])
    .withMessage('Invalid return status'),
  body('returnTrackingNumber')
    .optional()
    .isString()
    .withMessage('Tracking number must be a string'),
  body('returnCarrier')
    .optional()
    .isString()
    .withMessage('Carrier must be a string'),
  body('returnNotes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'processing', 'completed', 'failed', 'cancelled'])
    .withMessage('Invalid status'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
];

// ============================================================================
// PUBLIC ROUTES (WEBHOOK)
// ============================================================================

// Payment gateway webhook to update refund status
router.post('/update-status', updateRefundStatus);

// ============================================================================
// PROTECTED ROUTES - USER
// ============================================================================

router.use(protect); // All routes below require authentication

// User refund operations
router
  .route('/')
  .post(createRefundValidation, createRefund);

router
  .route('/user')
  .get(paginationValidation, getUserRefunds);

router
  .route('/:id')
  .get(param('id').isMongoId(), getRefund)
  .delete(param('id').isMongoId(), cancelRefund);

router
  .route('/order/:orderId')
  .get(param('orderId').isMongoId(), getOrderRefunds);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

router.use(restrictTo('admin', 'super-admin')); // All routes below require admin role

// Admin refund operations
router
  .route('/admin/all')
  .get(paginationValidation, getAllRefunds);

router
  .route('/admin/pending')
  .get(getPendingRefunds);

router
  .route('/admin/stats')
  .get(getRefundStats);

router
  .route('/:id/approve')
  .post(approveRefundValidation, approveRefund);

router
  .route('/:id/reject')
  .post(rejectRefundValidation, rejectRefund);

router
  .route('/:id/process')
  .post(param('id').isMongoId(), processRefund);

router
  .route('/:id/update')
  .patch(updateRefundValidation, updateRefund);

export default router;

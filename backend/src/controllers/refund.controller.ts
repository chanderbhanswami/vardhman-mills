import { Request, Response, NextFunction } from 'express';
import Refund, { IRefund, IRefundItem } from '../models/refund.model.js';
import Order from '../models/Order.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { Types } from 'mongoose';

/**
 * Refund Controller - Vardhman Mills Backend
 * 
 * Comprehensive refund management with:
 * - Full CRUD operations
 * - Approval workflow
 * - Payment gateway integration
 * - Automated processing
 * 
 * @version 1.0.0
 * @created 2025-11-01
 */

// ============================================================================
// USER REFUND OPERATIONS
// ============================================================================

/**
 * @desc    Create refund request
 * @route   POST /api/v1/refunds
 * @access  Private
 */
export const createRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    orderId,
    type = 'full',
    reason,
    detailedReason,
    items,
    paymentMethod = 'original',
    bankDetails,
    requiresReturn = true
  } = req.body;

  // Validate order exists and belongs to user
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.user && order.user.toString() !== req.user!.id) {
    return next(new AppError('Not authorized to request refund for this order', 403));
  }

  // Check if order is eligible for refund
  const eligibleStatuses = ['delivered', 'processing', 'shipped'];
  if (!eligibleStatuses.includes(order.status)) {
    return next(new AppError(`Orders with status "${order.status}" cannot be refunded`, 400));
  }

  // Check if refund already exists
  const existingRefund = await Refund.findOne({
    order: orderId,
    status: { $in: ['pending', 'approved', 'processing'] }
  });

  if (existingRefund) {
    return next(new AppError('A refund request already exists for this order', 400));
  }

  // Calculate refund amount
  let refundAmount = {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    refundedAmount: 0,
    processingFee: 0
  };

  if (type === 'full') {
    // Full refund
    refundAmount = {
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shippingCost,
      discount: order.discount || 0,
      total: order.total,
      refundedAmount: order.total,
      processingFee: 0
    };
  } else {
    // Partial refund - calculate from items
    if (!items || items.length === 0) {
      return next(new AppError('Items are required for partial refund', 400));
    }

    for (const item of items) {
      refundAmount.subtotal += item.price * item.quantity;
    }

    // Calculate proportional tax
    refundAmount.tax = (refundAmount.subtotal / order.total) * order.tax;
    refundAmount.total = refundAmount.subtotal + refundAmount.tax;
    refundAmount.refundedAmount = refundAmount.total;
  }

  // Create refund
  const refund = await Refund.create({
    order: orderId,
    user: req.user!.id,
    type,
    reason,
    detailedReason,
    items: type === 'full' 
      ? order.items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          reason
        }))
      : items,
    amount: refundAmount,
    payment: {
      method: paymentMethod,
      bankDetails: paymentMethod === 'bank_transfer' ? bankDetails : undefined
    },
    requiresReturn,
    metadata: {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
      refundSource: 'customer'
    }
  });

  // Populate refund details
  await refund.populate([
    { path: 'order', select: 'orderNumber status totalAmount' },
    { path: 'user', select: 'name email' },
    { path: 'items.product', select: 'name slug images price' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Refund request created successfully',
    data: refund
  });
});

/**
 * @desc    Get user refunds
 * @route   GET /api/v1/refunds/user
 * @access  Private
 */
export const getUserRefunds = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;

  const query: any = { user: req.user!.id };
  if (status) {
    query.status = status;
  }

  const totalRefunds = await Refund.countDocuments(query);
  const refunds = await Refund.find(query)
    .populate('order', 'orderNumber status totalAmount')
    .populate('items.product', 'name slug images price')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: refunds.length,
    total: totalRefunds,
    page,
    pages: Math.ceil(totalRefunds / limit),
    data: refunds
  });
});

/**
 * @desc    Get single refund
 * @route   GET /api/v1/refunds/:id
 * @access  Private
 */
export const getRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refund = await Refund.findById(req.params.id)
    .populate('order', 'orderNumber status totalAmount items')
    .populate('user', 'name email')
    .populate('items.product', 'name slug images price')
    .populate('approvedBy', 'name email')
    .populate('rejectedBy', 'name email');

  if (!refund) {
    return next(new AppError('Refund not found', 404));
  }

  // Check authorization
  const isAdmin = req.user!.role === 'admin';
  const isOwner = refund.user._id.toString() === req.user!.id;

  if (!isAdmin && !isOwner) {
    return next(new AppError('You do not have permission to view this refund', 403));
  }

  res.status(200).json({
    success: true,
    data: refund
  });
});

/**
 * @desc    Cancel refund request
 * @route   DELETE /api/v1/refunds/:id
 * @access  Private
 */
export const cancelRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refund = await Refund.findById(req.params.id);

  if (!refund) {
    return next(new AppError('Refund not found', 404));
  }

  // Check authorization
  if (refund.user.toString() !== req.user!.id) {
    return next(new AppError('You can only cancel your own refund requests', 403));
  }

  // Check if refund can be cancelled
  if (!['pending', 'approved'].includes(refund.status)) {
    return next(new AppError('Refund cannot be cancelled at this stage', 400));
  }

  await refund.cancel(new Types.ObjectId(req.user!.id), req.body.reason || 'Cancelled by user');

  res.status(200).json({
    success: true,
    message: 'Refund request cancelled successfully'
  });
});

// ============================================================================
// ADMIN REFUND OPERATIONS
// ============================================================================

/**
 * @desc    Get all refunds (Admin)
 * @route   GET /api/v1/refunds
 * @access  Private/Admin
 */
export const getAllRefunds = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const search = req.query.search as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const query: any = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { refundNumber: { $regex: search, $options: 'i' } },
      { 'metadata.notes': { $regex: search, $options: 'i' } }
    ];
  }

  if (startDate || endDate) {
    query.requestedAt = {};
    if (startDate) query.requestedAt.$gte = new Date(startDate);
    if (endDate) query.requestedAt.$lte = new Date(endDate);
  }

  const totalRefunds = await Refund.countDocuments(query);
  const refunds = await Refund.find(query)
    .populate('order', 'orderNumber status totalAmount')
    .populate('user', 'name email')
    .populate('approvedBy', 'name')
    .populate('rejectedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: refunds.length,
    total: totalRefunds,
    page,
    pages: Math.ceil(totalRefunds / limit),
    data: refunds
  });
});

/**
 * @desc    Get pending refunds (Admin)
 * @route   GET /api/v1/refunds/pending
 * @access  Private/Admin
 */
export const getPendingRefunds = catchAsync(async (req: Request, res: Response) => {
  const refunds = await Refund.find({ status: 'pending' })
    .populate('order', 'orderNumber status totalAmount')
    .populate('user', 'name email phone')
    .populate('items.product', 'name slug images price')
    .sort({ requestedAt: 1 });

  res.status(200).json({
    success: true,
    count: refunds.length,
    data: refunds
  });
});

/**
 * @desc    Approve refund (Admin)
 * @route   POST /api/v1/refunds/:id/approve
 * @access  Private/Admin
 */
export const approveRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refund = await Refund.findById(req.params.id);

  if (!refund) {
    return next(new AppError('Refund not found', 404));
  }

  if (refund.status !== 'pending') {
    return next(new AppError('Only pending refunds can be approved', 400));
  }

  await refund.approve(new Types.ObjectId(req.user!.id), req.body.note);

  // Auto-process if no return required
  if (!refund.requiresReturn) {
    await refund.process();
  }

  res.status(200).json({
    success: true,
    message: 'Refund approved successfully',
    data: refund
  });
});

/**
 * @desc    Reject refund (Admin)
 * @route   POST /api/v1/refunds/:id/reject
 * @access  Private/Admin
 */
export const rejectRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Rejection reason is required', 400));
  }

  const refund = await Refund.findById(req.params.id);

  if (!refund) {
    return next(new AppError('Refund not found', 404));
  }

  if (refund.status !== 'pending') {
    return next(new AppError('Only pending refunds can be rejected', 400));
  }

  await refund.reject(new Types.ObjectId(req.user!.id), reason);

  res.status(200).json({
    success: true,
    message: 'Refund rejected successfully',
    data: refund
  });
});

/**
 * @desc    Process refund (Admin)
 * @route   POST /api/v1/refunds/:id/process
 * @access  Private/Admin
 */
export const processRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refund = await Refund.findById(req.params.id)
    .populate('order');

  if (!refund) {
    return next(new AppError('Refund not found', 404));
  }

  if (refund.status !== 'approved') {
    return next(new AppError('Only approved refunds can be processed', 400));
  }

  try {
    // Process refund through payment gateway
    // TODO: Integrate with Razorpay refund API
    await refund.process();

    // For now, auto-complete (in production, wait for gateway webhook)
    const gatewayRefundId = `ref_${Date.now()}`;
    await refund.complete(gatewayRefundId);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: refund
    });
  } catch (error: any) {
    await refund.fail(error.message);
    return next(new AppError(`Refund processing failed: ${error.message}`, 500));
  }
});

/**
 * @desc    Update refund (Admin)
 * @route   PATCH /api/v1/refunds/:id
 * @access  Private/Admin
 */
export const updateRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const allowedUpdates = [
    'returnStatus',
    'returnTrackingNumber',
    'returnCarrier',
    'returnNotes',
    'metadata'
  ];

  const updates: any = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const refund = await Refund.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!refund) {
    return next(new AppError('Refund not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Refund updated successfully',
    data: refund
  });
});

// ============================================================================
// ORDER-RELATED OPERATIONS
// ============================================================================

/**
 * @desc    Get refunds for order
 * @route   GET /api/v1/refunds/order/:orderId
 * @access  Private
 */
export const getOrderRefunds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check authorization
  const isAdmin = req.user!.role === 'admin';
  const isOwner = order.user ? order.user.toString() === req.user!.id : false;

  if (!isAdmin && !isOwner) {
    return next(new AppError('You do not have permission to view refunds for this order', 403));
  }

  const refunds = await Refund.find({ order: req.params.orderId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: refunds.length,
    data: refunds
  });
});

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * @desc    Get refund statistics (Admin)
 * @route   GET /api/v1/refunds/stats/overview
 * @access  Private/Admin
 */
export const getRefundStats = catchAsync(async (req: Request, res: Response) => {
  const [statusStats, recentRefunds, topReasons] = await Promise.all([
    // Status-wise statistics
    Refund.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount.refundedAmount' }
        }
      }
    ]),

    // Recent refunds
    Refund.find()
      .select('refundNumber status amount.refundedAmount requestedAt')
      .sort({ requestedAt: -1 })
      .limit(5),

    // Top refund reasons
    Refund.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ])
  ]);

  // Calculate totals
  const totals = {
    totalRefunds: statusStats.reduce((sum, stat) => sum + stat.count, 0),
    totalAmount: statusStats.reduce((sum, stat) => sum + stat.totalAmount, 0),
    pending: statusStats.find(s => s._id === 'pending')?.count || 0,
    approved: statusStats.find(s => s._id === 'approved')?.count || 0,
    completed: statusStats.find(s => s._id === 'completed')?.count || 0,
    rejected: statusStats.find(s => s._id === 'rejected')?.count || 0
  };

  res.status(200).json({
    success: true,
    data: {
      totals,
      statusBreakdown: statusStats,
      recentRefunds,
      topReasons
    }
  });
});

/**
 * @desc    Update refund status from payment gateway webhook
 * @route   POST /api/v1/refunds/update-status
 * @access  Public (webhook)
 */
export const updateRefundStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { gatewayRefundId, status, metadata } = req.body;

  // TODO: Verify webhook signature

  const refund = await Refund.findOne({
    'payment.gatewayRefundId': gatewayRefundId
  });

  if (!refund) {
    return next(new AppError('Refund not found', 404));
  }

  // Update status based on gateway response
  switch (status) {
    case 'processed':
    case 'completed':
      await refund.complete(gatewayRefundId);
      break;
    case 'failed':
      await refund.fail(metadata?.reason || 'Gateway processing failed');
      break;
    default:
      refund.payment.gatewayStatus = status;
      await refund.save();
  }

  res.status(200).json({
    success: true,
    message: 'Refund status updated'
  });
});

export default {
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
};

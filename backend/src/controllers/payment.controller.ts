import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Order from '../models/Order.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import razorpay from '../config/razorpay.js';
import { AuthRequest } from '../types/index.js';

export const createRazorpayOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { amount, orderId } = req.body;

  if (!razorpay) {
    return next(new AppError('Payment service is not available', 503));
  }

  // Verify order exists
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt: order.orderNumber,
    payment_capture: true
  });

  // Update order with Razorpay order ID
  order.paymentInfo.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    }
  });
});

export const verifyRazorpayPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body;

  // Verify signature
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest('hex');

  if (generated_signature !== razorpay_signature) {
    return next(new AppError('Invalid payment signature', 400));
  }

  // Find and update order
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Update payment info
  order.paymentInfo.status = 'paid';
  order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
  order.paymentInfo.paidAt = new Date();
  order.paymentInfo.transactionId = razorpay_payment_id;
  order.status = 'confirmed';

  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Payment verified successfully',
    data: {
      order
    }
  });
});

export const handleRazorpayWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return next(new AppError('Webhook secret not configured', 500));
  }

  // Verify webhook signature
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(JSON.stringify(req.body));
  const generated_signature = hmac.digest('hex');

  if (generated_signature !== webhookSignature) {
    return next(new AppError('Invalid webhook signature', 400));
  }

  const { event, payload } = req.body;

  if (event === 'payment.captured') {
    const payment = payload.payment.entity;
    
    // Find order by Razorpay order ID
    const order = await Order.findOne({
      'paymentInfo.razorpayOrderId': payment.order_id
    });

    if (order) {
      order.paymentInfo.status = 'paid';
      order.paymentInfo.razorpayPaymentId = payment.id;
      order.paymentInfo.paidAt = new Date();
      order.paymentInfo.transactionId = payment.id;
      order.status = 'confirmed';
      
      await order.save();
    }
  } else if (event === 'payment.failed') {
    const payment = payload.payment.entity;
    
    const order = await Order.findOne({
      'paymentInfo.razorpayOrderId': payment.order_id
    });

    if (order) {
      order.paymentInfo.status = 'failed';
      await order.save();
    }
  }

  res.status(200).json({ status: 'success' });
});

export const getPaymentStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      paymentStatus: order.paymentInfo.status,
      paymentMethod: order.paymentInfo.method,
      transactionId: order.paymentInfo.transactionId,
      paidAt: order.paymentInfo.paidAt
    }
  });
});

export const refundPayment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { orderId } = req.params;
  const { amount, reason } = req.body;

  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.paymentInfo.status !== 'paid') {
    return next(new AppError('Payment not found or not completed', 400));
  }

  if (!razorpay) {
    return next(new AppError('Payment service is not available', 503));
  }

  if (!order.paymentInfo.razorpayPaymentId) {
    return next(new AppError('Razorpay payment ID not found', 400));
  }

  try {
    // Create refund in Razorpay
    const refund = await razorpay.payments.refund(order.paymentInfo.razorpayPaymentId, {
      amount: amount ? Math.round(amount * 100) : Math.round(order.total * 100),
      speed: 'normal',
      notes: {
        reason: reason || 'Refund requested',
        order_id: order.orderNumber
      }
    });

    // Update order payment info
    order.paymentInfo.status = 'refunded';
    order.paymentInfo.refundedAt = new Date();
    order.paymentInfo.refundAmount = amount || order.total;
    
    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Refund initiated successfully',
      data: {
        refundId: refund.id,
        refundAmount: (refund.amount ?? 0) / 100
      }
    });
  } catch (error: any) {
    return next(new AppError(`Refund failed: ${error.message}`, 500));
  }
});

/**
 * @desc    Get payment by ID
 * @route   GET /api/v1/payments/:id
 * @access  Private
 */
export const getPaymentById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!razorpay) {
    return next(new AppError('Payment service is not available', 503));
  }

  try {
    const payment = await razorpay.payments.fetch(id);

    res.status(200).json({
      status: 'success',
      data: {
        id: payment.id,
        amount: typeof payment.amount === 'number' ? payment.amount / 100 : 0,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        orderId: payment.order_id,
        email: payment.email,
        contact: payment.contact,
        createdAt: new Date((payment.created_at ?? 0) * 1000),
        captured: payment.captured,
        description: payment.description,
        notes: payment.notes
      }
    });
  } catch (error: any) {
    return next(new AppError(`Failed to fetch payment: ${error.message}`, 500));
  }
});

/**
 * @desc    Get all payment methods for user
 * @route   GET /api/v1/payments/methods
 * @access  Private
 */
export const getPaymentMethods = catchAsync(async (req: AuthRequest, res: Response) => {
  // Mock payment methods data (in production, store in user model)
  const methods = [
    {
      id: 'pm_1',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025
      },
      isDefault: true
    },
    {
      id: 'pm_2',
      type: 'upi',
      upi: {
        vpa: 'user@paytm'
      },
      isDefault: false
    }
  ];

  res.status(200).json({
    status: 'success',
    count: methods.length,
    data: methods
  });
});

/**
 * @desc    Verify payment
 * @route   POST /api/v1/payments/verify
 * @access  Public
 */
export const verifyPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { razorpay_payment_id } = req.body;

  if (!razorpay_payment_id) {
    return next(new AppError('Payment ID is required', 400));
  }

  if (!razorpay) {
    return next(new AppError('Payment service is not available', 503));
  }

  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    res.status(200).json({
      status: 'success',
      data: {
        verified: payment.status === 'captured',
        paymentStatus: payment.status,
        amount: typeof payment.amount === 'number' ? payment.amount / 100 : 0,
        method: payment.method
      }
    });
  } catch (error: any) {
    return next(new AppError(`Verification failed: ${error.message}`, 500));
  }
});

/**
 * @desc    Get payment methods available
 * @route   GET /api/v1/payments/methods/available
 * @access  Public
 */
export const getAvailablePaymentMethods = catchAsync(async (req: Request, res: Response) => {
  const methods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, RuPay',
      icon: 'credit-card',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm',
      icon: 'smartphone',
      enabled: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major banks',
      icon: 'bank',
      enabled: true
    },
    {
      id: 'wallet',
      name: 'Wallets',
      description: 'Paytm, PhonePe, Amazon Pay',
      icon: 'wallet',
      enabled: true
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: 'cash',
      enabled: true,
      additionalCharge: 50
    }
  ];

  res.status(200).json({
    status: 'success',
    data: methods
  });
});

/**
 * @desc    Get payment statistics (Admin)
 * @route   GET /api/v1/payments/stats
 * @access  Private/Admin
 */
export const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$paymentInfo.status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    }
  ]);

  const methodStats = await Order.aggregate([
    {
      $group: {
        _id: '$paymentInfo.method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      byStatus: stats,
      byMethod: methodStats
    }
  });
});
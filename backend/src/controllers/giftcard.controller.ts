import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import GiftCard, { 
  IGiftCard, 
  GiftCardStatus, 
  TransactionType, 
  DeliveryMethod 
} from '../models/GiftCard.model.js';
import Order, { IOrder } from '../models/Order.model.js';
import User, { IUser } from '../models/User.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all gift cards with advanced filtering and analytics
 * GET /api/v1/giftcards
 * Admin only - can see all gift cards
 */
export const getAllGiftCards = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    status,
    type,
    userId,
    search,
    minAmount,
    maxAmount,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query: any = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (userId) query.purchasedBy = userId;
  if (minAmount || maxAmount) {
    query.originalAmount = {};
    if (minAmount) query.originalAmount.$gte = Number(minAmount);
    if (maxAmount) query.originalAmount.$lte = Number(maxAmount);
  }
  if (search) {
    query.$or = [
      { code: { $regex: search, $options: 'i' } },
      { recipientEmail: { $regex: search, $options: 'i' } },
      { recipientName: { $regex: search, $options: 'i' } },
      { senderName: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const [giftCards, total] = await Promise.all([
    GiftCard.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('purchasedBy', 'name email')
      .populate('applicableCategories', 'name')
      .populate('applicableProducts', 'name price')
      .select('-transactions'),
    GiftCard.countDocuments(query)
  ]);

  // Calculate analytics
  const totalValue = await GiftCard.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalOriginal: { $sum: '$originalAmount' },
        totalRemaining: { $sum: '$currentBalance' },
        totalRedeemed: { $sum: '$totalRedeemed' }
      }
    }
  ]);

  // Status breakdown
  const statusBreakdown = await GiftCard.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        value: { $sum: '$currentBalance' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      giftCards,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      },
      analytics: {
        totalValue: totalValue[0] || { totalOriginal: 0, totalRemaining: 0, totalRedeemed: 0 },
        statusBreakdown
      }
    }
  });
});

/**
 * Get a single gift card by ID
 * GET /api/v1/giftcards/:id
 */
export const getGiftCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const giftCard = await GiftCard.findById(id)
    .populate('purchasedBy', 'name email mobile')
    .populate('applicableCategories', 'name slug')
    .populate('applicableProducts', 'name price images');

  if (!giftCard) {
    return next(new AppError('Gift card not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { giftCard }
  });
});

/**
 * Get gift cards for a specific user
 * GET /api/v1/giftcards/user/:userId
 */
export const getUserGiftCards = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Get owned gift cards (purchased by user)
  const ownedCards = await GiftCard.find({ 
    purchasedBy: userObjectId,
    status: { $in: [GiftCardStatus.ACTIVE, GiftCardStatus.PENDING] }
  })
    .select('-transactions')
    .sort('-createdAt');

  // Get received gift cards (sent to user's email)
  const user = await User.findById(userObjectId).select('email');
  const receivedCards = user ? await GiftCard.find({
    recipientEmail: user.email,
    status: { $in: [GiftCardStatus.ACTIVE, GiftCardStatus.PENDING] }
  })
    .select('-transactions')
    .sort('-createdAt') : [];

  // Get purchased cards history
  const purchasedCards = await GiftCard.find({ 
    purchasedBy: userObjectId 
  })
    .select('-transactions')
    .sort('-createdAt')
    .limit(10);

  // Calculate total balance
  const totalBalance = [...ownedCards, ...receivedCards].reduce(
    (sum, card) => sum + card.currentBalance, 
    0
  );

  // Get recent transactions
  const recentTransactions = await GiftCard.aggregate([
    {
      $match: {
        $or: [
          { purchasedBy: userObjectId },
          { recipientEmail: user?.email }
        ]
      }
    },
    { $unwind: '$transactions' },
    { $sort: { 'transactions.timestamp': -1 } },
    { $limit: 20 },
    {
      $project: {
        cardCode: '$code',
        transaction: '$transactions'
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      ownedCards,
      receivedCards,
      purchasedCards,
      totalBalance,
      recentTransactions
    }
  });
});

// ============================================================================
// PURCHASE & PAYMENT
// ============================================================================

/**
 * Purchase a gift card
 * POST /api/v1/giftcards/purchase
 */
export const purchaseGiftCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    recipientEmail,
    recipientName,
    recipientMobile,
    senderName,
    senderEmail,
    amount,
    design,
    template,
    personalMessage,
    deliveryMethod,
    deliveryDate,
    isPhysical,
    shippingAddress
  } = req.body;

  // Validate amount
  if (amount < 100 || amount > 50000) {
    return next(new AppError('Amount must be between ₹100 and ₹50,000', 400));
  }

  // Get user
  const userId = (req as any).user?.id;
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Generate unique code
  const code = await (GiftCard as any).generateUniqueCode('VM');

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    receipt: `giftcard_${code}`,
    notes: {
      type: 'gift_card_purchase',
      recipientEmail: recipientEmail || 'self',
      code
    }
  });

  // Calculate expiry (1 year from purchase)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Create gift card
  const giftCard = await GiftCard.create({
    code,
    status: GiftCardStatus.PENDING,
    type: isPhysical ? 'physical' : 'digital',
    originalAmount: amount,
    currentBalance: amount,
    purchasedBy: userId,
    recipientEmail,
    recipientName,
    recipientMobile,
    senderName,
    senderEmail,
    design: {
      designId: design,
      templateId: template,
      imageUrl: `/designs/${design}.jpg`
    },
    personalMessage,
    deliveryMethod: deliveryMethod || DeliveryMethod.EMAIL,
    deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
    isPhysical: isPhysical || false,
    shippingAddress,
    expiresAt,
    razorpayOrderId: razorpayOrder.id,
    transactions: [{
      type: TransactionType.PURCHASE,
      amount,
      description: 'Gift card purchase',
      timestamp: new Date(),
      userId: new mongoose.Types.ObjectId(userId)
    }]
  });

  res.status(201).json({
    success: true,
    message: 'Gift card created successfully',
    data: {
      giftCard,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    }
  });
});

/**
 * Verify gift card payment
 * POST /api/v1/giftcards/verify-payment
 */
export const verifyPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    giftCardId
  } = req.body;

  // Verify signature
  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(sign.toString())
    .digest('hex');

  if (razorpay_signature !== expectedSign) {
    return next(new AppError('Invalid payment signature', 400));
  }

  // Update gift card status
  const giftCard = await GiftCard.findByIdAndUpdate(
    giftCardId,
    {
      status: GiftCardStatus.ACTIVE,
      razorpayPaymentId: razorpay_payment_id,
      activatedAt: new Date()
    },
    { new: true }
  );

  if (!giftCard) {
    return next(new AppError('Gift card not found', 404));
  }

  // TODO: Send email/SMS notification

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: { giftCard }
  });
});

// ============================================================================
// BALANCE & VALIDATION
// ============================================================================

/**
 * Check gift card balance
 * GET /api/v1/giftcards/balance/:code
 */
export const checkBalance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.params;

  const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    return next(new AppError('Gift card not found', 404));
  }

  const balance = giftCard.checkBalance();

  res.status(200).json({
    success: true,
    data: {
      balance,
      isValid: giftCard.isValid,
      expiresAt: giftCard.expiresAt,
      transactions: giftCard.transactions.map(t => ({
        type: t.type,
        amount: t.amount,
        timestamp: t.timestamp,
        description: t.description
      }))
    }
  });
});

/**
 * Validate gift card
 * POST /api/v1/giftcards/validate
 */
export const validateGiftCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;

  if (!code) {
    return next(new AppError('Gift card code is required', 400));
  }

  const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    return next(new AppError('Invalid gift card code', 404));
  }

  const restrictions = [];
  if (giftCard.minOrderAmount) {
    restrictions.push(`Minimum order amount: ₹${giftCard.minOrderAmount}`);
  }
  if (giftCard.applicableCategories && giftCard.applicableCategories.length > 0) {
    restrictions.push('Valid only for specific categories');
  }
  if (giftCard.applicableProducts && giftCard.applicableProducts.length > 0) {
    restrictions.push('Valid only for specific products');
  }

  res.status(200).json({
    success: true,
    data: {
      isValid: giftCard.isValid,
      balance: giftCard.currentBalance,
      expiresAt: giftCard.expiresAt,
      restrictions,
      canRedeem: giftCard.isValid && giftCard.currentBalance > 0,
      remainingAmount: giftCard.currentBalance
    }
  });
});

// ============================================================================
// REDEMPTION
// ============================================================================

/**
 * Redeem gift card
 * POST /api/v1/giftcards/redeem
 */
export const redeemGiftCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code, amount, orderId, userId } = req.body;

  if (!code) {
    return next(new AppError('Gift card code is required', 400));
  }

  const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    return next(new AppError('Gift card not found', 404));
  }

  // Validate redemption
  const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : undefined;
  const canRedeem = await giftCard.canRedeem(amount || giftCard.currentBalance, userObjectId);

  if (!canRedeem) {
    return next(new AppError('Cannot redeem this gift card', 400));
  }

  const redeemAmount = amount || giftCard.currentBalance;

  // If order is provided, apply to order
  if (orderId) {
    const order = await Order.findById(orderId) as IOrder | null;
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Update order with gift card discount
    order.discount = (order.discount || 0) + redeemAmount;
    order.total = Math.max(0, order.subtotal + order.shippingCost - order.discount);
    await order.save();

    // Redeem gift card
    await giftCard.redeem(
      redeemAmount, 
      new mongoose.Types.ObjectId(orderId),
      userObjectId,
      `Redeemed for order ${order.orderNumber}`
    );
  } else {
    // Just redeem without order
    await giftCard.redeem(redeemAmount, new mongoose.Types.ObjectId(), userObjectId);
  }

  res.status(200).json({
    success: true,
    message: 'Gift card redeemed successfully',
    data: {
      redeemedAmount: redeemAmount,
      remainingBalance: giftCard.currentBalance,
      giftCard: {
        code: giftCard.code,
        status: giftCard.status,
        currentBalance: giftCard.currentBalance
      }
    }
  });
});

// ============================================================================
// DESIGNS & TEMPLATES
// ============================================================================

/**
 * Get available gift card designs
 * GET /api/v1/giftcards/designs
 */
export const getDesigns = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // In a real application, these would be stored in the database
  const designs = [
    {
      id: 'birthday',
      name: 'Birthday Celebration',
      category: 'birthday',
      imageUrl: '/designs/birthday.jpg',
      thumbnail: '/designs/birthday-thumb.jpg',
      backgroundColor: '#FF6B9D',
      textColor: '#FFFFFF',
      isPopular: true
    },
    {
      id: 'anniversary',
      name: 'Anniversary',
      category: 'anniversary',
      imageUrl: '/designs/anniversary.jpg',
      thumbnail: '/designs/anniversary-thumb.jpg',
      backgroundColor: '#C9184A',
      textColor: '#FFFFFF',
      isPopular: true
    },
    {
      id: 'wedding',
      name: 'Wedding',
      category: 'wedding',
      imageUrl: '/designs/wedding.jpg',
      thumbnail: '/designs/wedding-thumb.jpg',
      backgroundColor: '#FFD700',
      textColor: '#000000',
      isPopular: false
    },
    {
      id: 'thank-you',
      name: 'Thank You',
      category: 'gratitude',
      imageUrl: '/designs/thank-you.jpg',
      thumbnail: '/designs/thank-you-thumb.jpg',
      backgroundColor: '#4CAF50',
      textColor: '#FFFFFF',
      isPopular: true
    },
    {
      id: 'congratulations',
      name: 'Congratulations',
      category: 'celebration',
      imageUrl: '/designs/congratulations.jpg',
      thumbnail: '/designs/congratulations-thumb.jpg',
      backgroundColor: '#2196F3',
      textColor: '#FFFFFF',
      isPopular: false
    },
    {
      id: 'festive',
      name: 'Festive',
      category: 'festival',
      imageUrl: '/designs/festive.jpg',
      thumbnail: '/designs/festive-thumb.jpg',
      backgroundColor: '#FF9800',
      textColor: '#FFFFFF',
      isPopular: true
    },
    {
      id: 'classic',
      name: 'Classic',
      category: 'general',
      imageUrl: '/designs/classic.jpg',
      thumbnail: '/designs/classic-thumb.jpg',
      backgroundColor: '#607D8B',
      textColor: '#FFFFFF',
      isPopular: false
    }
  ];

  res.status(200).json({
    success: true,
    data: { designs }
  });
});

/**
 * Get available templates
 * GET /api/v1/giftcards/templates
 */
export const getTemplates = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const templates = [
    {
      id: 'simple',
      name: 'Simple & Elegant',
      preview: '/templates/simple.jpg'
    },
    {
      id: 'floral',
      name: 'Floral Design',
      preview: '/templates/floral.jpg'
    },
    {
      id: 'modern',
      name: 'Modern Minimalist',
      preview: '/templates/modern.jpg'
    },
    {
      id: 'traditional',
      name: 'Traditional',
      preview: '/templates/traditional.jpg'
    }
  ];

  res.status(200).json({
    success: true,
    data: { templates }
  });
});

// ============================================================================
// ANALYTICS & TRANSACTIONS
// ============================================================================

/**
 * Get gift card analytics
 * GET /api/v1/giftcards/analytics
 * Admin only
 */
export const getAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  const matchStage = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  // Overall stats
  const overallStats = await GiftCard.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCards: { $sum: 1 },
        totalValue: { $sum: '$originalAmount' },
        totalRedeemed: { $sum: '$totalRedeemed' },
        totalRemaining: { $sum: '$currentBalance' },
        avgCardValue: { $avg: '$originalAmount' }
      }
    }
  ]);

  // Status distribution
  const statusDistribution = await GiftCard.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        value: { $sum: '$currentBalance' }
      }
    }
  ]);

  // Monthly sales
  const monthlySales = await GiftCard.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$originalAmount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // Top designs
  const topDesigns = await GiftCard.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$design.designId',
        count: { $sum: 1 },
        revenue: { $sum: '$originalAmount' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Delivery method breakdown
  const deliveryMethodBreakdown = await GiftCard.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$deliveryMethod',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overallStats: overallStats[0] || {
        totalCards: 0,
        totalValue: 0,
        totalRedeemed: 0,
        totalRemaining: 0,
        avgCardValue: 0
      },
      statusDistribution,
      monthlySales,
      topDesigns,
      deliveryMethodBreakdown
    }
  });
});

/**
 * Get gift card transactions
 * GET /api/v1/giftcards/:cardId/transactions
 */
export const getTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;

  const giftCard = await GiftCard.findById(cardId)
    .select('code transactions')
    .populate('transactions.userId', 'name email')
    .populate('transactions.orderId', 'orderNumber');

  if (!giftCard) {
    return next(new AppError('Gift card not found', 404));
  }

  // Sort transactions by timestamp (newest first)
  const sortedTransactions = giftCard.transactions.sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  res.status(200).json({
    success: true,
    data: {
      code: giftCard.code,
      transactions: sortedTransactions
    }
  });
});

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

/**
 * Cancel a gift card
 * DELETE /api/v1/giftcards/:id/cancel
 * Admin only
 */
export const cancelGiftCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { reason } = req.body;

  const giftCard = await GiftCard.findById(id);

  if (!giftCard) {
    return next(new AppError('Gift card not found', 404));
  }

  giftCard.status = GiftCardStatus.CANCELLED;
  giftCard.notes = reason || 'Cancelled by admin';
  await giftCard.save();

  res.status(200).json({
    success: true,
    message: 'Gift card cancelled successfully',
    data: { giftCard }
  });
});

/**
 * Refund a gift card
 * POST /api/v1/giftcards/:id/refund
 * Admin only
 */
export const refundGiftCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  const giftCard = await GiftCard.findById(id);

  if (!giftCard) {
    return next(new AppError('Gift card not found', 404));
  }

  if (!giftCard.isRefundable) {
    return next(new AppError('This gift card is not refundable', 400));
  }

  const refundAmount = amount || giftCard.originalAmount;

  // Add refund transaction
  await giftCard.addTransaction({
    type: TransactionType.REFUND,
    amount: refundAmount,
    description: reason || 'Gift card refund',
    timestamp: new Date()
  });

  giftCard.status = GiftCardStatus.CANCELLED;
  await giftCard.save();

  // TODO: Process actual refund with Razorpay

  res.status(200).json({
    success: true,
    message: 'Gift card refunded successfully',
    data: { giftCard, refundAmount }
  });
});

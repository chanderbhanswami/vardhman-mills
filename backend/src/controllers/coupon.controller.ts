/**
 * Coupon Controller - Vardhman Mills Backend
 * 
 * Comprehensive coupon management with validation, application, analytics, and sharing.
 * Supports percentage and fixed discounts, usage limits, and advanced conditions.
 * 
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import Coupon, { ICoupon } from '../models/Coupon.model.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all coupons with filters
 * GET /api/coupons
 * Query params: isActive, discountType, category, minDiscount, maxDiscount, search, page, limit, sortBy, sortOrder
 */
export const getAllCoupons = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    isActive,
    discountType,
    category,
    minDiscount,
    maxDiscount,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query: any = {};

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (discountType) {
    query.discountType = discountType;
  }

  if (category) {
    query.category = category;
  }

  if (minDiscount) {
    query.discountValue = { ...query.discountValue, $gte: Number(minDiscount) };
  }

  if (maxDiscount) {
    query.discountValue = { ...query.discountValue, $lte: Number(maxDiscount) };
  }

  if (search) {
    query.$or = [
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }

  // Only show active and valid coupons to non-admin users
  if (!req.user || (req.user as any).role !== 'admin') {
    query.isActive = true;
    query.$or = [
      { expiresAt: { $gte: new Date() } },
      { expiresAt: { $exists: false } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [coupons, total] = await Promise.all([
    Coupon.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .select('-usageHistory'),
    Coupon.countDocuments(query)
  ]);

  // Get category breakdown
  const categories = await Coupon.aggregate([
    { $match: query },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { name: '$_id', count: 1, _id: 0 } }
  ]);

  // Calculate total savings
  const totalSavingsResult = await Coupon.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$totalSavings' } } }
  ]);

  const totalSavings = totalSavingsResult[0]?.total || 0;

  res.status(200).json({
    success: true,
    message: 'Coupons retrieved successfully',
    data: {
      coupons,
      categories,
      totalSavings: {
        amount: totalSavings,
        currency: 'INR',
        formatted: `₹${totalSavings.toFixed(2)}`
      },
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

/**
 * Get single coupon by ID
 * GET /api/coupons/:id
 */
export const getCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('applicableProducts', 'name slug')
    .populate('applicableCategories', 'name slug');

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  // Hide usage history from non-admin users
  if (!req.user || (req.user as any).role !== 'admin') {
    (coupon as any).usageHistory = undefined;
  }

  res.status(200).json({
    success: true,
    message: 'Coupon retrieved successfully',
    data: coupon
  });
});

/**
 * Get coupon by code
 * GET /api/coupons/code/:code
 */
export const getCouponByCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() })
    .populate('applicableProducts', 'name slug')
    .populate('applicableCategories', 'name slug');

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  if (!coupon.isValid) {
    return next(new AppError('Coupon is not valid', 400));
  }

  // Hide usage history
  (coupon as any).usageHistory = undefined;

  res.status(200).json({
    success: true,
    message: 'Coupon retrieved successfully',
    data: coupon
  });
});

/**
 * Create coupon (admin only)
 * POST /api/coupons
 */
export const createCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const couponData = {
    ...req.body,
    createdBy: (req.user as any)._id,
    code: req.body.code?.toUpperCase()
  };

  const coupon = await Coupon.create(couponData);

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon
  });
});

/**
 * Update coupon (admin only)
 * PATCH /api/coupons/:id
 */
export const updateCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const updates = { ...req.body };
  
  // Don't allow updating usage history directly
  delete updates.usageHistory;
  delete updates.currentUsageCount;
  delete updates.totalUsageCount;
  delete updates.totalSavings;

  if (updates.code) {
    updates.code = updates.code.toUpperCase();
  }

  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon
  });
});

/**
 * Delete coupon (admin only)
 * DELETE /api/coupons/:id
 */
export const deleteCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
    data: null
  });
});

// ============================================================================
// VALIDATION AND APPLICATION
// ============================================================================

/**
 * Validate coupon
 * POST /api/coupons/validate
 */
export const validateCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code, userId, cartItems, cartTotal, customerData } = req.body;

  if (!code || !cartTotal) {
    return next(new AppError('Code and cart total are required', 400));
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return res.status(200).json({
      success: true,
      data: {
        isValid: false,
        discount: {
          amount: { amount: 0, currency: 'INR', formatted: '₹0' },
          type: 'fixed_amount'
        },
        errors: ['Invalid coupon code']
      }
    });
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if coupon is active
  if (!coupon.isActive) {
    errors.push('Coupon is not active');
  }

  // Check validity period
  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    errors.push(`Coupon is not yet valid. Starts from ${coupon.startsAt.toLocaleDateString()}`);
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    errors.push('Coupon has expired');
  }

  // Check usage limits
  if (coupon.usageLimit && coupon.currentUsageCount >= coupon.usageLimit) {
    errors.push('Coupon usage limit reached');
  }

  // Check user-specific eligibility
  if (userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const canUse = await coupon.canBeUsedBy(userObjectId);
    if (!canUse) {
      errors.push('You have reached the usage limit for this coupon');
    }
  }

  // Check minimum order value
  if (coupon.minimumOrderValue && cartTotal.amount < coupon.minimumOrderValue) {
    errors.push(`Minimum order value of ₹${coupon.minimumOrderValue} required`);
  }

  // Validate conditions
  const orderData = {
    total: cartTotal.amount,
    items: cartItems,
    isFirstOrder: customerData?.isFirstTime || false
  };

  const conditionsValid = await coupon.validateConditions(orderData);
  if (!conditionsValid) {
    errors.push('Coupon conditions not met');
  }

  // Calculate discount
  let discountAmount = 0;
  if (errors.length === 0) {
    discountAmount = await coupon.calculateDiscount(cartTotal.amount, cartItems);
  }

  // Add warnings
  if (coupon.expiresAt) {
    const daysUntilExpiry = Math.ceil((coupon.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7) {
      warnings.push(`Coupon expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`);
    }
  }

  if (coupon.usageLimit) {
    const remainingUses = coupon.usageLimit - coupon.currentUsageCount;
    if (remainingUses <= 10) {
      warnings.push(`Only ${remainingUses} use${remainingUses !== 1 ? 's' : ''} remaining`);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      isValid: errors.length === 0,
      coupon: errors.length === 0 ? coupon : undefined,
      discount: {
        amount: {
          amount: discountAmount,
          currency: cartTotal.currency || 'INR',
          formatted: `₹${discountAmount.toFixed(2)}`
        },
        type: coupon.discountType,
        percentage: coupon.discountType === 'percentage' ? coupon.discountValue : undefined
      },
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      conditions: {
        minOrderValue: coupon.minimumOrderValue ? {
          amount: coupon.minimumOrderValue,
          currency: 'INR',
          formatted: `₹${coupon.minimumOrderValue}`
        } : undefined,
        maxUsage: coupon.usageLimit,
        remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.currentUsageCount : undefined,
        expiresAt: coupon.expiresAt?.toISOString()
      }
    }
  });
});

/**
 * Apply coupon to order
 * POST /api/coupons/apply
 */
export const applyCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { couponCode, orderId, userId } = req.body;

  if (!couponCode || !orderId) {
    return next(new AppError('Coupon code and order ID are required', 400));
  }

  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

  if (!coupon || !coupon.isValid) {
    return next(new AppError('Invalid or expired coupon', 400));
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user can use coupon
  const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : order.user || new mongoose.Types.ObjectId();
  const canUse = await coupon.canBeUsedBy(userObjectId);

  if (!canUse) {
    return next(new AppError('You cannot use this coupon', 403));
  }

  // Calculate discount
  const discountAmount = await coupon.calculateDiscount(order.subtotal);

  if (discountAmount === 0) {
    return next(new AppError('Coupon does not apply to this order', 400));
  }

  // Update order with discount
  order.couponCode = couponCode.toUpperCase();
  order.couponDiscount = discountAmount;
  order.total = order.subtotal + order.shippingCost - discountAmount;
  await order.save();

  // Update coupon usage
  await coupon.incrementUsage(userObjectId, new mongoose.Types.ObjectId(order._id), discountAmount, order.subtotal);

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    data: {
      discount: {
        amount: discountAmount,
        currency: 'INR',
        formatted: `₹${discountAmount.toFixed(2)}`
      },
      message: `You saved ₹${discountAmount.toFixed(2)}!`
    }
  });
});

/**
 * Remove coupon from order
 * DELETE /api/coupons/remove/:orderId
 */
export const removeCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!(order as any).couponCode) {
    return next(new AppError('No coupon applied to this order', 400));
  }

  // Reset order totals
  (order as any).couponDiscount = 0;
  order.total = order.subtotal + order.shippingCost;
  (order as any).couponCode = undefined;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Coupon removed successfully',
    data: {
      message: 'Coupon removed from order'
    }
  });
});

// ============================================================================
// USER-SPECIFIC OPERATIONS
// ============================================================================

/**
 * Get user-specific coupons
 * GET /api/coupons/user/:userId
 */
export const getUserCoupons = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = new mongoose.Types.ObjectId(req.params.userId);
  const now = new Date();

  // Available coupons for this user
  const availableCoupons = await Coupon.find({
    isActive: true,
    $and: [
      {
        $or: [
          { startsAt: { $lte: now } },
          { startsAt: { $exists: false } }
        ]
      },
      {
        $or: [
          { expiresAt: { $gte: now } },
          { expiresAt: { $exists: false } }
        ]
      },
      {
        $or: [
          { eligibleUsers: { $size: 0 } },
          { eligibleUsers: userId }
        ]
      },
      {
        $or: [
          { excludedUsers: { $size: 0 } },
          { excludedUsers: { $ne: userId } }
        ]
      }
    ]
  }).select('-usageHistory');

  // Filter out coupons that user has exhausted
  const filtered: ICoupon[] = [];
  for (const coupon of availableCoupons) {
    const canUse = await coupon.canBeUsedBy(userId);
    if (canUse) {
      filtered.push(coupon);
    }
  }

  // Used coupons
  const usedCoupons = await Coupon.find({
    'usageHistory.userId': userId
  }).select('code description discountType discountValue usageHistory');

  const userUsages = usedCoupons.map(coupon => {
    const usage = coupon.usageHistory.filter(u => u.userId.equals(userId));
    return {
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      usageCount: usage.length,
      totalSavings: usage.reduce((sum, u) => sum + u.discountAmount, 0),
      lastUsed: usage[usage.length - 1]?.usedAt
    };
  });

  // Expiring soon (within 7 days)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const expiringSoon = filtered.filter(coupon => 
    coupon.expiresAt && 
    coupon.expiresAt >= now && 
    coupon.expiresAt <= sevenDaysFromNow
  );

  // Recommendations (based on user's past orders - simplified for now)
  const recommendations = filtered.slice(0, 5);

  // Total savings
  const totalSavings = userUsages.reduce((sum, usage) => sum + usage.totalSavings, 0);

  res.status(200).json({
    success: true,
    message: 'User coupons retrieved successfully',
    data: {
      availableCoupons: filtered,
      usedCoupons: userUsages,
      expiringSoon,
      recommendations,
      totalSavings: {
        amount: totalSavings,
        currency: 'INR',
        formatted: `₹${totalSavings.toFixed(2)}`
      }
    }
  });
});

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get coupon analytics
 * GET /api/coupons/analytics
 */
export const getCouponAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { start, end } = req.query;

  const dateFilter: any = {};
  if (start) dateFilter.$gte = new Date(start as string);
  if (end) dateFilter.$lte = new Date(end as string);

  const matchStage = Object.keys(dateFilter).length > 0
    ? { createdAt: dateFilter }
    : {};

  // Total coupons
  const totalCoupons = await Coupon.countDocuments();
  const activeCoupons = await Coupon.countDocuments({ isActive: true });

  // Total usage and savings
  const usageStats = await Coupon.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalUsage: { $sum: '$totalUsageCount' },
        totalSavings: { $sum: '$totalSavings' }
      }
    }
  ]);

  // Top performing coupons
  const topCoupons = await Coupon.find(matchStage)
    .sort({ totalUsageCount: -1 })
    .limit(10)
    .select('code description discountType discountValue totalUsageCount totalSavings conversionRate');

  // Usage by month
  const usageByMonth = await Coupon.aggregate([
    { $match: matchStage },
    { $unwind: '$usageHistory' },
    {
      $group: {
        _id: {
          year: { $year: '$usageHistory.usedAt' },
          month: { $month: '$usageHistory.usedAt' }
        },
        usage: { $sum: 1 },
        savings: { $sum: '$usageHistory.discountAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            { $cond: [{ $lt: ['$_id.month', 10] }, '0', ''] },
            { $toString: '$_id.month' }
          ]
        },
        usage: 1,
        savings: {
          amount: '$savings',
          currency: 'INR',
          formatted: { $concat: ['₹', { $toString: '$savings' }] }
        }
      }
    }
  ]);

  // Category breakdown
  const categoryBreakdown = await Coupon.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        savings: { $sum: '$totalSavings' }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        savings: {
          amount: '$savings',
          currency: 'INR',
          formatted: { $concat: ['₹', { $toString: '$savings' }] }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Analytics retrieved successfully',
    data: {
      totalCoupons,
      activeCoupons,
      totalUsage: usageStats[0]?.totalUsage || 0,
      totalSavings: {
        amount: usageStats[0]?.totalSavings || 0,
        currency: 'INR',
        formatted: `₹${(usageStats[0]?.totalSavings || 0).toFixed(2)}`
      },
      topPerformingCoupons: topCoupons.map(c => ({
        coupon: c,
        usageCount: c.totalUsageCount,
        totalSavings: {
          amount: c.totalSavings,
          currency: 'INR',
          formatted: `₹${c.totalSavings.toFixed(2)}`
        },
        conversionRate: c.conversionRate
      })),
      usageByMonth,
      categoryBreakdown
    }
  });
});

/**
 * Get coupon usage stats
 * GET /api/coupons/:id/usage-stats
 */
export const getCouponUsageStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  const stats = {
    totalUsage: coupon.totalUsageCount,
    currentUsage: coupon.currentUsageCount,
    totalSavings: coupon.totalSavings,
    averageDiscount: coupon.totalUsageCount > 0 
      ? coupon.totalSavings / coupon.totalUsageCount 
      : 0,
    conversionRate: coupon.conversionRate,
    usageHistory: coupon.usageHistory.map(usage => ({
      userId: usage.userId,
      orderId: usage.orderId,
      discountAmount: usage.discountAmount,
      orderAmount: usage.orderAmount,
      usedAt: usage.usedAt,
      savingsPercentage: ((usage.discountAmount / usage.orderAmount) * 100).toFixed(2)
    }))
  };

  res.status(200).json({
    success: true,
    message: 'Usage stats retrieved successfully',
    data: stats
  });
});

// ============================================================================
// SHARING AND REFERRALS
// ============================================================================

/**
 * Share coupon
 * POST /api/coupons/:id/share
 */
export const shareCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { method, recipients } = req.body;
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon || !coupon.isValid) {
    return next(new AppError('Coupon not found or invalid', 404));
  }

  // Generate shareable URL
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const shareUrl = `${baseUrl}/coupons/${coupon.code}`;

  // Here you would implement actual sharing logic based on method
  // (email, SMS, social media, etc.)

  res.status(200).json({
    success: true,
    message: 'Coupon shared successfully',
    data: {
      shareUrl
    }
  });
});

/**
 * Generate referral code
 * POST /api/coupons/referral/generate
 */
export const generateReferralCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if user already has a referral code
  const existingCoupon = await Coupon.findOne({
    isReferral: true,
    createdBy: userId
  });

  if (existingCoupon) {
    return res.status(200).json({
      success: true,
      message: 'Referral code already exists',
      data: {
        code: existingCoupon.code,
        coupon: existingCoupon
      }
    });
  }

  // Generate unique referral code
  const referralCode = await (Coupon as any).generateUniqueCode('REF');

  // Create referral coupon
  const userName = (user as any).name || (user as any).email || 'user';
  const coupon = await Coupon.create({
    code: referralCode,
    description: `Referral discount for ${userName}'s friends`,
    discountType: 'percentage',
    discountValue: 10, // 10% discount
    minimumOrderValue: 500,
    usageLimit: 100,
    usageLimitPerUser: 1,
    isReferral: true,
    referralCode,
    createdBy: userId,
    category: 'referral',
    tags: ['referral', 'friend'],
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  });

  res.status(201).json({
    success: true,
    message: 'Referral code generated successfully',
    data: {
      code: coupon.code,
      coupon
    }
  });
});

// ============================================================================
// BULK OPERATIONS (ADMIN)
// ============================================================================

/**
 * Bulk delete coupons
 * DELETE /api/coupons/bulk-delete
 */
export const bulkDeleteCoupons = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new AppError('Coupon IDs are required', 400));
  }

  const result = await Coupon.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} coupons deleted successfully`,
    data: {
      deletedCount: result.deletedCount
    }
  });
});

/**
 * Bulk toggle active status
 * PATCH /api/coupons/bulk-toggle-active
 */
export const bulkToggleActiveStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { ids, isActive } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new AppError('Coupon IDs are required', 400));
  }

  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive must be a boolean', 400));
  }

  const result = await Coupon.updateMany(
    { _id: { $in: ids } },
    { isActive }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} coupons updated successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

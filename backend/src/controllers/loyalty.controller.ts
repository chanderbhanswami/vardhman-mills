import { Request, Response, NextFunction } from 'express';
import Loyalty, { LOYALTY_TIERS, POINTS_RATES } from '../models/loyalty.model';
import Order from '../models/Order.model';
import Review from '../models/Review.model';
import User from '../models/User.model';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { Types } from 'mongoose';

/**
 * Loyalty & Rewards Controller - Vardhman Mills Backend
 * 
 * Comprehensive loyalty program management:
 * - Points earning and redemption
 * - Tier management and upgrades
 * - Rewards catalog
 * - Referral system
 * - Transaction history
 * 
 * @version 1.0.0
 * @created 2025-11-01
 */

// ============================================================================
// USER LOYALTY OPERATIONS
// ============================================================================

/**
 * @desc    Get user loyalty account
 * @route   GET /api/v1/loyalty
 * @access  Private
 */
export const getMyLoyalty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let loyalty = await Loyalty.findByUser(new Types.ObjectId(req.user!.id));
  
  // Create account if doesn't exist
  if (!loyalty) {
    loyalty = await Loyalty.create({
      user: req.user!.id,
      currentTier: 'bronze',
      currentBalance: 0,
      totalPointsEarned: 0,
      lifetimePoints: 0
    });
    
    // Award signup bonus
    await loyalty.earnPoints(
      POINTS_RATES.signup,
      'signup',
      undefined,
      'Welcome bonus'
    );
  }
  
  // Calculate points expiring soon (next 30 days)
  const expiringTransactions = loyalty.transactions.filter(t => 
    t.type === 'earn' && 
    t.expiresAt && 
    t.expiresAt > new Date() &&
    t.expiresAt <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  
  loyalty.pointsExpiringSoon = expiringTransactions.reduce((sum, t) => sum + t.points, 0);
  
  // Get tier benefits
  const tierBenefits = LOYALTY_TIERS[loyalty.currentTier];
  
  res.status(200).json({
    success: true,
    data: {
      loyalty,
      tierBenefits,
      availableTiers: LOYALTY_TIERS
    }
  });
});

/**
 * @desc    Get transaction history
 * @route   GET /api/v1/loyalty/transactions
 * @access  Private
 */
export const getTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as string;
  
  const loyalty = await Loyalty.findByUser(new Types.ObjectId(req.user!.id));
  
  if (!loyalty) {
    return next(new AppError('Loyalty account not found', 404));
  }
  
  let transactions = [...loyalty.transactions];
  
  // Filter by type
  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }
  
  // Sort by date (newest first)
  transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);
  
  res.status(200).json({
    success: true,
    count: paginatedTransactions.length,
    total: transactions.length,
    page,
    pages: Math.ceil(transactions.length / limit),
    data: paginatedTransactions
  });
});

/**
 * @desc    Get available rewards
 * @route   GET /api/v1/loyalty/rewards
 * @access  Private
 */
export const getRewards = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const loyalty = await Loyalty.findByUser(new Types.ObjectId(req.user!.id));
  
  if (!loyalty) {
    return next(new AppError('Loyalty account not found', 404));
  }
  
  // Mock rewards catalog (in production, fetch from database)
  const allRewards = [
    {
      id: 'reward_1',
      name: '₹100 Off Coupon',
      description: 'Get ₹100 off on your next purchase',
      pointsCost: 500,
      type: 'discount',
      value: 100,
      isActive: true
    },
    {
      id: 'reward_2',
      name: '₹250 Off Coupon',
      description: 'Get ₹250 off on orders above ₹2000',
      pointsCost: 1000,
      type: 'discount',
      value: 250,
      minTier: 'silver' as const,
      isActive: true
    },
    {
      id: 'reward_3',
      name: 'Free Shipping',
      description: 'Free shipping on your next order',
      pointsCost: 300,
      type: 'shipping',
      value: 0,
      isActive: true
    },
    {
      id: 'reward_4',
      name: '₹500 Off Coupon',
      description: 'Get ₹500 off on orders above ₹5000',
      pointsCost: 2000,
      type: 'discount',
      value: 500,
      minTier: 'gold' as const,
      isActive: true
    },
    {
      id: 'reward_5',
      name: '₹1000 Off Coupon',
      description: 'Get ₹1000 off on orders above ₹10000',
      pointsCost: 3500,
      type: 'discount',
      value: 1000,
      minTier: 'platinum' as const,
      isActive: true
    }
  ];
  
  // Filter by tier eligibility and active status
  const availableRewards = allRewards.filter(reward => {
    if (!reward.isActive) return false;
    if (reward.minTier && !loyalty.isTierEligible(reward.minTier)) return false;
    return true;
  });
  
  res.status(200).json({
    success: true,
    count: availableRewards.length,
    currentBalance: loyalty.currentBalance,
    currentTier: loyalty.currentTier,
    data: availableRewards
  });
});

/**
 * @desc    Redeem reward
 * @route   POST /api/v1/loyalty/rewards/:rewardId/redeem
 * @access  Private
 */
export const redeemReward = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { rewardId } = req.params;
  
  const loyalty = await Loyalty.findByUser(new Types.ObjectId(req.user!.id));
  
  if (!loyalty) {
    return next(new AppError('Loyalty account not found', 404));
  }
  
  // Mock rewards catalog (in production, fetch from database)
  const rewards: any = {
    reward_1: { id: 'reward_1', name: '₹100 Off Coupon', pointsCost: 500, value: 100 },
    reward_2: { id: 'reward_2', name: '₹250 Off Coupon', pointsCost: 1000, value: 250, minTier: 'silver' },
    reward_3: { id: 'reward_3', name: 'Free Shipping', pointsCost: 300, value: 0 },
    reward_4: { id: 'reward_4', name: '₹500 Off Coupon', pointsCost: 2000, value: 500, minTier: 'gold' },
    reward_5: { id: 'reward_5', name: '₹1000 Off Coupon', pointsCost: 3500, value: 1000, minTier: 'platinum' }
  };
  
  const reward = rewards[rewardId];
  
  if (!reward) {
    return next(new AppError('Reward not found', 404));
  }
  
  // Check tier eligibility
  if (reward.minTier && !loyalty.isTierEligible(reward.minTier)) {
    return next(new AppError(`This reward requires ${reward.minTier} tier or higher`, 403));
  }
  
  // Check balance
  if (loyalty.currentBalance < reward.pointsCost) {
    return next(new AppError('Insufficient points balance', 400));
  }
  
  // Redeem points
  await loyalty.redeemPoints(
    reward.pointsCost,
    `Redeemed: ${reward.name}`
  );
  
  // Generate coupon code
  const couponCode = `LOYALTY${Date.now().toString().slice(-8)}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  loyalty.redemptions.push({
    rewardId,
    pointsSpent: reward.pointsCost,
    couponCode,
    redeemedAt: new Date(),
    expiresAt,
    status: 'active'
  });
  
  await loyalty.save();
  
  res.status(200).json({
    success: true,
    message: 'Reward redeemed successfully',
    data: {
      couponCode,
      expiresAt,
      pointsRemaining: loyalty.currentBalance
    }
  });
});

/**
 * @desc    Get redemption history
 * @route   GET /api/v1/loyalty/redemptions
 * @access  Private
 */
export const getRedemptions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const loyalty = await Loyalty.findByUser(new Types.ObjectId(req.user!.id));
  
  if (!loyalty) {
    return next(new AppError('Loyalty account not found', 404));
  }
  
  const redemptions = loyalty.redemptions
    .sort((a, b) => b.redeemedAt.getTime() - a.redeemedAt.getTime());
  
  res.status(200).json({
    success: true,
    count: redemptions.length,
    data: redemptions
  });
});

/**
 * @desc    Get referral info
 * @route   GET /api/v1/loyalty/referrals
 * @access  Private
 */
export const getReferrals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const loyalty = await Loyalty.findByUser(new Types.ObjectId(req.user!.id));
  
  if (!loyalty) {
    return next(new AppError('Loyalty account not found', 404));
  }
  
  await loyalty.populate('referrals.referredUser', 'name email');
  
  const stats = {
    referralCode: loyalty.referralCode,
    totalReferrals: loyalty.referrals.length,
    completedReferrals: loyalty.referrals.filter(r => r.status === 'completed').length,
    pendingReferrals: loyalty.referrals.filter(r => r.status === 'pending').length,
    totalPointsEarned: loyalty.referrals.reduce((sum, r) => sum + r.pointsEarned, 0)
  };
  
  res.status(200).json({
    success: true,
    data: {
      stats,
      referrals: loyalty.referrals
    }
  });
});

/**
 * @desc    Apply referral code during signup
 * @route   POST /api/v1/loyalty/referrals/apply
 * @access  Private
 */
export const applyReferralCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { referralCode } = req.body;
  
  if (!referralCode) {
    return next(new AppError('Referral code is required', 400));
  }
  
  // Find referrer's loyalty account
  const referrerLoyalty = await Loyalty.findByReferralCode(referralCode);
  
  if (!referrerLoyalty) {
    return next(new AppError('Invalid referral code', 404));
  }
  
  // Check if user is referring themselves
  if (referrerLoyalty.user.toString() === req.user!.id) {
    return next(new AppError('You cannot use your own referral code', 400));
  }
  
  // Get or create user's loyalty account
  let userLoyalty = await Loyalty.findByUser(new Types.ObjectId(req.user!.id));
  
  if (!userLoyalty) {
    userLoyalty = await Loyalty.create({
      user: req.user!.id
    });
  }
  
  // Check if user already used a referral code
  const existingReferral = await Loyalty.findOne({
    'referrals.referredUser': req.user!.id
  });
  
  if (existingReferral) {
    return next(new AppError('You have already used a referral code', 400));
  }
  
  // Add referral to referrer's account
  await referrerLoyalty.addReferral(new Types.ObjectId(req.user!.id));
  
  // Award points to new user
  await userLoyalty.earnPoints(
    POINTS_RATES.referralReceiver,
    'referral',
    referrerLoyalty.user,
    'Referral signup bonus'
  );
  
  res.status(200).json({
    success: true,
    message: 'Referral code applied successfully',
    data: {
      pointsEarned: POINTS_RATES.referralReceiver,
      currentBalance: userLoyalty.currentBalance
    }
  });
});

/**
 * @desc    Update notification preferences
 * @route   PATCH /api/v1/loyalty/preferences
 * @access  Private
 */
export const updatePreferences = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const loyalty = await Loyalty.findByUser(new Types.ObjectId(req.user!.id));
  
  if (!loyalty) {
    return next(new AppError('Loyalty account not found', 404));
  }
  
  const allowedFields = ['pointsEarned', 'tierUpgrade', 'pointsExpiring', 'rewardsAvailable'];
  const updates: any = {};
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[`notificationPreferences.${field}`] = req.body[field];
    }
  }
  
  Object.assign(loyalty.notificationPreferences, req.body);
  await loyalty.save();
  
  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    data: loyalty.notificationPreferences
  });
});

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

/**
 * @desc    Get all loyalty accounts (Admin)
 * @route   GET /api/v1/loyalty/admin/accounts
 * @access  Private/Admin
 */
export const getAllAccounts = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const tier = req.query.tier as string;
  const search = req.query.search as string;
  
  const query: any = {};
  
  if (tier) {
    query.currentTier = tier;
  }
  
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    
    query.user = { $in: users.map(u => u._id) };
  }
  
  const totalAccounts = await Loyalty.countDocuments(query);
  const accounts = await Loyalty.find(query)
    .populate('user', 'name email')
    .sort({ lifetimePoints: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
  
  res.status(200).json({
    success: true,
    count: accounts.length,
    total: totalAccounts,
    page,
    pages: Math.ceil(totalAccounts / limit),
    data: accounts
  });
});

/**
 * @desc    Get loyalty account by user ID (Admin)
 * @route   GET /api/v1/loyalty/admin/accounts/:userId
 * @access  Private/Admin
 */
export const getAccountByUserId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const loyalty = await Loyalty.findByUser(new Types.ObjectId(req.params.userId));
  
  if (!loyalty) {
    return next(new AppError('Loyalty account not found', 404));
  }
  
  await loyalty.populate('referrals.referredUser', 'name email');
  
  res.status(200).json({
    success: true,
    data: loyalty
  });
});

/**
 * @desc    Adjust points (Admin)
 * @route   POST /api/v1/loyalty/admin/accounts/:userId/adjust
 * @access  Private/Admin
 */
export const adjustPoints = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { points, reason } = req.body;
  
  if (!points || !reason) {
    return next(new AppError('Points and reason are required', 400));
  }
  
  let loyalty = await Loyalty.findByUser(new Types.ObjectId(req.params.userId));
  
  if (!loyalty) {
    return next(new AppError('Loyalty account not found', 404));
  }
  
  await loyalty.adjustPoints(points, reason);
  
  res.status(200).json({
    success: true,
    message: 'Points adjusted successfully',
    data: {
      currentBalance: loyalty.currentBalance,
      adjustment: points
    }
  });
});

/**
 * @desc    Award bonus points (Admin)
 * @route   POST /api/v1/loyalty/admin/accounts/:userId/bonus
 * @access  Private/Admin
 */
export const awardBonus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { points, reason } = req.body;
  
  if (!points || !reason) {
    return next(new AppError('Points and reason are required', 400));
  }
  
  let loyalty = await Loyalty.findByUser(new Types.ObjectId(req.params.userId));
  
  if (!loyalty) {
    return next(new AppError('Loyalty account not found', 404));
  }
  
  await loyalty.addBonusPoints(points, reason);
  
  res.status(200).json({
    success: true,
    message: 'Bonus points awarded successfully',
    data: {
      currentBalance: loyalty.currentBalance,
      bonusPoints: points
    }
  });
});

/**
 * @desc    Get loyalty statistics (Admin)
 * @route   GET /api/v1/loyalty/admin/stats
 * @access  Private/Admin
 */
export const getStats = catchAsync(async (req: Request, res: Response) => {
  const [tierDistribution, leaderboard, expiringPoints, totalStats] = await Promise.all([
    // Tier distribution
    Loyalty.aggregate([
      { $group: { _id: '$currentTier', count: { $sum: 1 } } }
    ]),
    
    // Leaderboard
    Loyalty.getLeaderboard(10),
    
    // Points expiring soon
    Loyalty.getExpiringPoints(30),
    
    // Total statistics
    Loyalty.aggregate([
      {
        $group: {
          _id: null,
          totalAccounts: { $sum: 1 },
          totalPointsIssued: { $sum: '$totalPointsEarned' },
          totalPointsOutstanding: { $sum: '$currentBalance' },
          avgBalance: { $avg: '$currentBalance' }
        }
      }
    ])
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      overview: totalStats[0] || {},
      tierDistribution,
      leaderboard,
      expiringPoints: expiringPoints.slice(0, 10)
    }
  });
});

/**
 * @desc    Get leaderboard
 * @route   GET /api/v1/loyalty/leaderboard
 * @access  Public
 */
export const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  
  const leaderboard = await Loyalty.getLeaderboard(limit);
  
  res.status(200).json({
    success: true,
    count: leaderboard.length,
    data: leaderboard
  });
});

/**
 * @desc    Award points for purchase (Internal)
 * @route   POST /api/v1/loyalty/award/purchase
 * @access  Internal (called from order controller)
 */
export const awardPurchasePoints = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, orderId, amount } = req.body;
  
  if (!userId || !orderId || !amount) {
    return next(new AppError('Missing required fields', 400));
  }
  
  let loyalty = await Loyalty.findByUser(new Types.ObjectId(userId));
  
  if (!loyalty) {
    loyalty = await Loyalty.create({ user: userId });
  }
  
  // Calculate points (1 point per ₹100)
  const points = Math.floor(amount / 100) * POINTS_RATES.purchase;
  
  await loyalty.earnPoints(
    points,
    'purchase',
    new Types.ObjectId(orderId),
    `Purchase worth ₹${amount}`
  );
  
  // Check for referral completion (first purchase)
  const isFirstPurchase = await Order.countDocuments({ user: userId }) === 1;
  if (isFirstPurchase) {
    const referrer = await Loyalty.findOne({ 'referrals.referredUser': userId });
    if (referrer) {
      await referrer.completeReferral(new Types.ObjectId(userId));
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      pointsEarned: points,
      currentBalance: loyalty.currentBalance,
      tierUpgraded: false // TODO: Check if tier was upgraded
    }
  });
});

/**
 * @desc    Award points for review (Internal)
 * @route   POST /api/v1/loyalty/award/review
 * @access  Internal (called from review controller)
 */
export const awardReviewPoints = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, reviewId } = req.body;
  
  if (!userId || !reviewId) {
    return next(new AppError('Missing required fields', 400));
  }
  
  let loyalty = await Loyalty.findByUser(new Types.ObjectId(userId));
  
  if (!loyalty) {
    loyalty = await Loyalty.create({ user: userId });
  }
  
  await loyalty.earnPoints(
    POINTS_RATES.review,
    'review',
    new Types.ObjectId(reviewId),
    'Product review submitted'
  );
  
  res.status(200).json({
    success: true,
    data: {
      pointsEarned: POINTS_RATES.review,
      currentBalance: loyalty.currentBalance
    }
  });
});

export default {
  getMyLoyalty,
  getTransactions,
  getRewards,
  redeemReward,
  getRedemptions,
  getReferrals,
  applyReferralCode,
  updatePreferences,
  getAllAccounts,
  getAccountByUserId,
  adjustPoints,
  awardBonus,
  getStats,
  getLeaderboard,
  awardPurchasePoints,
  awardReviewPoints
};

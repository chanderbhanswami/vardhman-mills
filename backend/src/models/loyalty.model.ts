import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Loyalty & Rewards System - Vardhman Mills Backend
 * 
 * Comprehensive customer loyalty program with:
 * - Points earning system
 * - Tiered membership (Bronze → Silver → Gold → Platinum)
 * - Rewards catalog
 * - Transaction history
 * - Expiry management
 * - Referral bonuses
 * 
 * @version 1.0.0
 * @created 2025-11-01
 */

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface ILoyaltyTransaction {
  type: 'earn' | 'redeem' | 'expire' | 'adjust' | 'bonus';
  points: number;
  source: 'purchase' | 'review' | 'referral' | 'signup' | 'birthday' | 'social_share' | 'redemption' | 'adjustment' | 'bonus';
  sourceId?: mongoose.Types.ObjectId;
  description: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ILoyaltyTier {
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  minPoints: number;
  maxPoints: number;
  benefits: {
    pointsMultiplier: number;
    discountPercentage: number;
    freeShipping: boolean;
    prioritySupport: boolean;
    exclusiveAccess: boolean;
    birthdayBonus: number;
  };
}

export interface IReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'product' | 'shipping' | 'service';
  value: number;
  minTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  isActive: boolean;
  validUntil?: Date;
  metadata?: Record<string, any>;
}

export interface ILoyalty extends Document {
  user: mongoose.Types.ObjectId;
  
  // Points & Balance
  totalPointsEarned: number;
  currentBalance: number;
  lifetimePoints: number;
  pointsExpiringSoon: number;
  
  // Tier Information
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierProgress: {
    currentPoints: number;
    nextTierPoints: number;
    progressPercentage: number;
  };
  tierUpgradedAt?: Date;
  
  // Transaction History
  transactions: ILoyaltyTransaction[];
  
  // Redemptions
  redemptions: Array<{
    rewardId: string;
    pointsSpent: number;
    couponCode?: string;
    redeemedAt: Date;
    expiresAt?: Date;
    status: 'active' | 'used' | 'expired';
  }>;
  
  // Referrals
  referralCode: string;
  referrals: Array<{
    referredUser: mongoose.Types.ObjectId;
    status: 'pending' | 'completed';
    pointsEarned: number;
    referredAt: Date;
    completedAt?: Date;
  }>;
  
  // Settings
  notificationPreferences: {
    pointsEarned: boolean;
    tierUpgrade: boolean;
    pointsExpiring: boolean;
    rewardsAvailable: boolean;
  };
  
  // Status
  isActive: boolean;
  lastActivityAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  earnPoints(points: number, source: string, sourceId?: mongoose.Types.ObjectId, description?: string): Promise<ILoyalty>;
  redeemPoints(points: number, description: string, metadata?: Record<string, any>): Promise<ILoyalty>;
  adjustPoints(points: number, reason: string): Promise<ILoyalty>;
  addBonusPoints(points: number, reason: string): Promise<ILoyalty>;
  checkAndUpgradeTier(): Promise<boolean>;
  getAvailableRewards(): Promise<IReward[]>;
  redeemReward(rewardId: string): Promise<{ couponCode: string; expiresAt: Date }>;
  addReferral(referredUserId: mongoose.Types.ObjectId): Promise<ILoyalty>;
  completeReferral(referredUserId: mongoose.Types.ObjectId): Promise<ILoyalty>;
  expirePoints(): Promise<number>;
  updateTierProgress(): void;
  getNextTier(): ILoyaltyTier | null;
  isTierEligible(requiredTier: string): boolean;
}

export interface ILoyaltyModel extends Model<ILoyalty> {
  findByUser(userId: mongoose.Types.ObjectId): Promise<ILoyalty | null>;
  findByReferralCode(code: string): Promise<ILoyalty | null>;
  getTierBenefits(tier: string): ILoyaltyTier;
  getLeaderboard(limit?: number): Promise<Array<{ user: any; points: number; tier: string }>>;
  getExpiringPoints(days?: number): Promise<Array<{ user: mongoose.Types.ObjectId; points: number; expiresAt: Date }>>;
  bulkExpirePoints(): Promise<number>;
}

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

export const LOYALTY_TIERS: Record<string, ILoyaltyTier> = {
  bronze: {
    name: 'bronze',
    minPoints: 0,
    maxPoints: 999,
    benefits: {
      pointsMultiplier: 1,
      discountPercentage: 0,
      freeShipping: false,
      prioritySupport: false,
      exclusiveAccess: false,
      birthdayBonus: 50
    }
  },
  silver: {
    name: 'silver',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: {
      pointsMultiplier: 1.25,
      discountPercentage: 5,
      freeShipping: false,
      prioritySupport: false,
      exclusiveAccess: false,
      birthdayBonus: 100
    }
  },
  gold: {
    name: 'gold',
    minPoints: 5000,
    maxPoints: 14999,
    benefits: {
      pointsMultiplier: 1.5,
      discountPercentage: 10,
      freeShipping: true,
      prioritySupport: true,
      exclusiveAccess: true,
      birthdayBonus: 250
    }
  },
  platinum: {
    name: 'platinum',
    minPoints: 15000,
    maxPoints: Infinity,
    benefits: {
      pointsMultiplier: 2,
      discountPercentage: 15,
      freeShipping: true,
      prioritySupport: true,
      exclusiveAccess: true,
      birthdayBonus: 500
    }
  }
};

// Points earning rates
export const POINTS_RATES = {
  purchase: 1, // 1 point per ₹100 spent
  review: 50,
  referralGiver: 200,
  referralReceiver: 100,
  signup: 100,
  socialShare: 25,
  birthday: 100
};

// ============================================================================
// SCHEMA
// ============================================================================

const loyaltyTransactionSchema = new Schema<ILoyaltyTransaction>({
  type: {
    type: String,
    enum: ['earn', 'redeem', 'expire', 'adjust', 'bonus'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    enum: ['purchase', 'review', 'referral', 'signup', 'birthday', 'social_share', 'redemption', 'adjustment', 'bonus'],
    required: true
  },
  sourceId: {
    type: Schema.Types.ObjectId,
    refPath: 'transactions.source'
  },
  description: {
    type: String,
    required: true
  },
  expiresAt: Date,
  metadata: Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const loyaltySchema = new Schema<ILoyalty, ILoyaltyModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Points & Balance
  totalPointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  currentBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  lifetimePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsExpiringSoon: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Tier Information
  currentTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  tierProgress: {
    currentPoints: { type: Number, default: 0 },
    nextTierPoints: { type: Number, default: 1000 },
    progressPercentage: { type: Number, default: 0 }
  },
  tierUpgradedAt: Date,
  
  // Transaction History
  transactions: [loyaltyTransactionSchema],
  
  // Redemptions
  redemptions: [{
    rewardId: { type: String, required: true },
    pointsSpent: { type: Number, required: true },
    couponCode: String,
    redeemedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    status: {
      type: String,
      enum: ['active', 'used', 'expired'],
      default: 'active'
    }
  }],
  
  // Referrals
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  referrals: [{
    referredUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    referredAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date
  }],
  
  // Settings
  notificationPreferences: {
    pointsEarned: { type: Boolean, default: true },
    tierUpgrade: { type: Boolean, default: true },
    pointsExpiring: { type: Boolean, default: true },
    rewardsAvailable: { type: Boolean, default: true }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivityAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================================================
// INDEXES
// ============================================================================

loyaltySchema.index({ user: 1 }, { unique: true });
loyaltySchema.index({ currentTier: 1 });
loyaltySchema.index({ currentBalance: -1 });
loyaltySchema.index({ referralCode: 1 }, { unique: true });
loyaltySchema.index({ 'transactions.createdAt': -1 });
loyaltySchema.index({ 'transactions.expiresAt': 1 });

// ============================================================================
// HOOKS
// ============================================================================

// Generate referral code before saving
loyaltySchema.pre('save', function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = `VM${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  
  // Update tier progress
  this.updateTierProgress();
  
  next();
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Update tier progress information
 */
loyaltySchema.methods.updateTierProgress = function(): void {
  const currentTier = LOYALTY_TIERS[this.currentTier];
  const nextTier = this.getNextTier();
  
  if (nextTier) {
    this.tierProgress = {
      currentPoints: this.lifetimePoints,
      nextTierPoints: nextTier.minPoints,
      progressPercentage: Math.min(
        100,
        (this.lifetimePoints / nextTier.minPoints) * 100
      )
    };
  } else {
    // Already at highest tier
    this.tierProgress = {
      currentPoints: this.lifetimePoints,
      nextTierPoints: currentTier.minPoints,
      progressPercentage: 100
    };
  }
};

/**
 * Get next tier information
 */
loyaltySchema.methods.getNextTier = function(): ILoyaltyTier | null {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(this.currentTier);
  
  if (currentIndex < tiers.length - 1) {
    return LOYALTY_TIERS[tiers[currentIndex + 1]];
  }
  
  return null;
};

/**
 * Earn points
 */
loyaltySchema.methods.earnPoints = async function(
  points: number,
  source: string,
  sourceId?: mongoose.Types.ObjectId,
  description?: string
): Promise<ILoyalty> {
  // Apply tier multiplier
  const tierBenefits = LOYALTY_TIERS[this.currentTier].benefits;
  const earnedPoints = Math.round(points * tierBenefits.pointsMultiplier);
  
  // Calculate expiry (1 year from now)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  
  // Add transaction
  this.transactions.push({
    type: 'earn',
    points: earnedPoints,
    source: source as any,
    sourceId,
    description: description || `Earned ${earnedPoints} points from ${source}`,
    expiresAt,
    createdAt: new Date()
  });
  
  // Update balances
  this.currentBalance += earnedPoints;
  this.totalPointsEarned += earnedPoints;
  this.lifetimePoints += earnedPoints;
  this.lastActivityAt = new Date();
  
  // Check for tier upgrade
  await this.checkAndUpgradeTier();
  
  return await this.save();
};

/**
 * Redeem points
 */
loyaltySchema.methods.redeemPoints = async function(
  points: number,
  description: string,
  metadata?: Record<string, any>
): Promise<ILoyalty> {
  if (this.currentBalance < points) {
    throw new Error('Insufficient points balance');
  }
  
  // Add transaction
  this.transactions.push({
    type: 'redeem',
    points: -points,
    source: 'redemption',
    description,
    metadata,
    createdAt: new Date()
  });
  
  // Update balance
  this.currentBalance -= points;
  this.lastActivityAt = new Date();
  
  return await this.save();
};

/**
 * Adjust points (admin only)
 */
loyaltySchema.methods.adjustPoints = async function(
  points: number,
  reason: string
): Promise<ILoyalty> {
  this.transactions.push({
    type: 'adjust',
    points,
    source: 'adjustment',
    description: reason,
    createdAt: new Date()
  });
  
  this.currentBalance += points;
  if (points > 0) {
    this.lifetimePoints += points;
  }
  this.lastActivityAt = new Date();
  
  return await this.save();
};

/**
 * Add bonus points
 */
loyaltySchema.methods.addBonusPoints = async function(
  points: number,
  reason: string
): Promise<ILoyalty> {
  return await this.earnPoints(points, 'bonus', undefined, reason);
};

/**
 * Check and upgrade tier
 */
loyaltySchema.methods.checkAndUpgradeTier = async function(): Promise<boolean> {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  let upgraded = false;
  
  for (const tierName of tiers.reverse()) {
    const tier = LOYALTY_TIERS[tierName];
    if (this.lifetimePoints >= tier.minPoints) {
      if (this.currentTier !== tierName) {
        this.currentTier = tierName;
        this.tierUpgradedAt = new Date();
        upgraded = true;
      }
      break;
    }
  }
  
  return upgraded;
};

/**
 * Get available rewards
 */
loyaltySchema.methods.getAvailableRewards = async function(): Promise<IReward[]> {
  // TODO: Fetch from rewards catalog based on tier and balance
  // This is a placeholder implementation
  const rewards: IReward[] = [];
  return rewards.filter(r => 
    r.isActive &&
    r.pointsCost <= this.currentBalance &&
    (!r.minTier || this.isTierEligible(r.minTier))
  );
};

/**
 * Check tier eligibility
 */
loyaltySchema.methods.isTierEligible = function(requiredTier: string): boolean {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(this.currentTier);
  const requiredIndex = tiers.indexOf(requiredTier);
  return currentIndex >= requiredIndex;
};

/**
 * Redeem reward
 */
loyaltySchema.methods.redeemReward = async function(rewardId: string): Promise<{ couponCode: string; expiresAt: Date }> {
  // TODO: Implement reward redemption logic
  // Generate coupon code
  const couponCode = `LOYALTY${Date.now()}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  this.redemptions.push({
    rewardId,
    pointsSpent: 0, // TODO: Get from reward
    couponCode,
    redeemedAt: new Date(),
    expiresAt,
    status: 'active'
  });
  
  await this.save();
  
  return { couponCode, expiresAt };
};

/**
 * Add referral
 */
loyaltySchema.methods.addReferral = async function(referredUserId: mongoose.Types.ObjectId): Promise<ILoyalty> {
  this.referrals.push({
    referredUser: referredUserId,
    status: 'pending',
    pointsEarned: 0,
    referredAt: new Date()
  });
  
  return await this.save();
};

/**
 * Complete referral and award points
 */
loyaltySchema.methods.completeReferral = async function(referredUserId: mongoose.Types.ObjectId): Promise<ILoyalty> {
  const referral = this.referrals.find(
    (r: any) => r.referredUser.toString() === referredUserId.toString() && r.status === 'pending'
  );
  
  if (referral) {
    referral.status = 'completed';
    referral.completedAt = new Date();
    referral.pointsEarned = POINTS_RATES.referralGiver;
    
    await this.earnPoints(
      POINTS_RATES.referralGiver,
      'referral',
      referredUserId,
      'Referral bonus'
    );
  }
  
  return await this.save();
};

/**
 * Expire old points
 */
loyaltySchema.methods.expirePoints = async function(): Promise<number> {
  const now = new Date();
  let expiredPoints = 0;
  
  for (const transaction of this.transactions) {
    if (
      transaction.type === 'earn' &&
      transaction.expiresAt &&
      transaction.expiresAt <= now &&
      transaction.points > 0
    ) {
      expiredPoints += transaction.points;
      transaction.points = 0; // Mark as expired
      
      this.transactions.push({
        type: 'expire',
        points: -transaction.points,
        source: 'adjustment',
        description: 'Points expired',
        createdAt: new Date()
      });
    }
  }
  
  if (expiredPoints > 0) {
    this.currentBalance -= expiredPoints;
    await this.save();
  }
  
  return expiredPoints;
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find loyalty account by user
 */
loyaltySchema.statics.findByUser = async function(userId: mongoose.Types.ObjectId): Promise<ILoyalty | null> {
  return await this.findOne({ user: userId }).populate('user', 'name email');
};

/**
 * Find by referral code
 */
loyaltySchema.statics.findByReferralCode = async function(code: string): Promise<ILoyalty | null> {
  return await this.findOne({ referralCode: code.toUpperCase() });
};

/**
 * Get tier benefits
 */
loyaltySchema.statics.getTierBenefits = function(tier: string): ILoyaltyTier {
  return LOYALTY_TIERS[tier] || LOYALTY_TIERS.bronze;
};

/**
 * Get leaderboard
 */
loyaltySchema.statics.getLeaderboard = async function(limit = 10): Promise<Array<{ user: any; points: number; tier: string }>> {
  const accounts = await this.find({ isActive: true })
    .select('user lifetimePoints currentTier')
    .populate('user', 'name email')
    .sort({ lifetimePoints: -1 })
    .limit(limit)
    .lean();
  
  return accounts.map((account: any) => ({
    user: account.user,
    points: account.lifetimePoints,
    tier: account.currentTier
  }));
};

/**
 * Get points expiring soon
 */
loyaltySchema.statics.getExpiringPoints = async function(days = 30): Promise<Array<{ user: mongoose.Types.ObjectId; points: number; expiresAt: Date }>> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const accounts = await this.find({
    'transactions.expiresAt': { $lte: futureDate, $gt: new Date() }
  }).populate('user', 'name email');
  
  return accounts.map(account => {
    const expiringPoints = account.transactions
      .filter(t => t.type === 'earn' && t.expiresAt && t.expiresAt <= futureDate && t.expiresAt > new Date())
      .reduce((sum, t) => sum + t.points, 0);
    
    return {
      user: account.user,
      points: expiringPoints,
      expiresAt: account.transactions
        .filter(t => t.type === 'earn' && t.expiresAt)
        .sort((a, b) => a.expiresAt!.getTime() - b.expiresAt!.getTime())[0]?.expiresAt || new Date()
    };
  }).filter(item => item.points > 0);
};

/**
 * Bulk expire points
 */
loyaltySchema.statics.bulkExpirePoints = async function(): Promise<number> {
  const accounts = await this.find({ isActive: true });
  let totalExpired = 0;
  
  for (const account of accounts) {
    const expired = await account.expirePoints();
    totalExpired += expired;
  }
  
  return totalExpired;
};

// ============================================================================
// MODEL
// ============================================================================

const Loyalty = mongoose.model<ILoyalty, ILoyaltyModel>('Loyalty', loyaltySchema);

export default Loyalty;

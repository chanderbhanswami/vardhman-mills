/**
 * Coupon Model - Vardhman Mills Backend
 * 
 * Comprehensive coupon management model with validation, usage tracking, and analytics.
 * Supports percentage and fixed amount discounts, usage limits, and user-specific restrictions.
 * 
 * @version 1.0.0
 */

import mongoose, { Document, Schema, Model } from 'mongoose';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ICouponCondition {
  type: 'min_order_value' | 'max_order_value' | 'specific_products' | 'specific_categories' | 
        'customer_group' | 'first_time_customer' | 'shipping_method' | 'payment_method';
  value: string | number | string[];
  operator?: 'equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
}

export interface ICouponUsage {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  discountAmount: number;
  orderAmount: number;
  usedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  discountValue: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  
  // Validity
  isActive: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  
  // Usage limits
  usageLimit?: number;
  usageLimitPerUser?: number;
  currentUsageCount: number;
  
  // Restrictions
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  excludedProducts?: mongoose.Types.ObjectId[];
  excludedCategories?: mongoose.Types.ObjectId[];
  eligibleUsers?: mongoose.Types.ObjectId[];
  eligibleUserGroups?: string[];
  
  // Advanced conditions
  conditions?: ICouponCondition[];
  combinableWithOtherCoupons: boolean;
  
  // Usage tracking
  usageHistory: ICouponUsage[];
  
  // Metadata
  category?: string;
  tags?: string[];
  isReferral: boolean;
  referralCode?: string;
  createdBy: mongoose.Types.ObjectId;
  
  // Analytics
  totalSavings: number;
  totalUsageCount: number;
  conversionRate: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isValid: boolean;
  isExpired: boolean;
  remainingUses: number;
  
  // Methods
  canBeUsedBy(userId: mongoose.Types.ObjectId): Promise<boolean>;
  incrementUsage(userId: mongoose.Types.ObjectId, orderId: mongoose.Types.ObjectId, discountAmount: number, orderAmount: number): Promise<void>;
  calculateDiscount(orderAmount: number, items?: any[]): Promise<number>;
  validateConditions(orderData: any): Promise<boolean>;
}

// ============================================================================
// SCHEMA
// ============================================================================

const CouponConditionSchema = new Schema<ICouponCondition>({
  type: {
    type: String,
    enum: ['min_order_value', 'max_order_value', 'specific_products', 'specific_categories', 
           'customer_group', 'first_time_customer', 'shipping_method', 'payment_method'],
    required: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  operator: {
    type: String,
    enum: ['equals', 'greater_than', 'less_than', 'in', 'not_in'],
    default: 'equals'
  }
}, { _id: false });

const CouponUsageSchema = new Schema<ICouponUsage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  orderAmount: {
    type: Number,
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
}, { _id: false });

const CouponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [50, 'Coupon code must be less than 50 characters'],
    match: [/^[A-Z0-9_-]+$/, 'Coupon code can only contain letters, numbers, hyphens and underscores']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'],
    required: [true, 'Discount type is required']
  },
  
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value must be positive']
  },
  
  minimumOrderValue: {
    type: Number,
    min: [0, 'Minimum order value must be positive'],
    default: 0
  },
  
  maximumDiscount: {
    type: Number,
    min: [0, 'Maximum discount must be positive']
  },
  
  // Validity
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  startsAt: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date,
    index: true
  },
  
  // Usage limits
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1']
  },
  
  usageLimitPerUser: {
    type: Number,
    min: [1, 'Usage limit per user must be at least 1'],
    default: 1
  },
  
  currentUsageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  
  // Restrictions
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  applicableCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  
  excludedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  excludedCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  
  eligibleUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  eligibleUserGroups: [{
    type: String,
    trim: true
  }],
  
  // Advanced conditions
  conditions: [CouponConditionSchema],
  
  combinableWithOtherCoupons: {
    type: Boolean,
    default: false
  },
  
  // Usage tracking
  usageHistory: [CouponUsageSchema],
  
  // Metadata
  category: {
    type: String,
    trim: true,
    enum: ['seasonal', 'promotional', 'referral', 'loyalty', 'first_order', 'abandoned_cart', 'other'],
    default: 'promotional'
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  isReferral: {
    type: Boolean,
    default: false
  },
  
  referralCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Analytics
  totalSavings: {
    type: Number,
    default: 0,
    min: [0, 'Total savings cannot be negative']
  },
  
  totalUsageCount: {
    type: Number,
    default: 0,
    min: [0, 'Total usage count cannot be negative']
  },
  
  conversionRate: {
    type: Number,
    default: 0,
    min: [0, 'Conversion rate cannot be negative'],
    max: [100, 'Conversion rate cannot exceed 100']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================================================
// INDEXES
// ============================================================================

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, expiresAt: 1 });
CouponSchema.index({ createdBy: 1 });
CouponSchema.index({ category: 1, isActive: 1 });
CouponSchema.index({ 'usageHistory.userId': 1 });
CouponSchema.index({ referralCode: 1 }, { sparse: true });
CouponSchema.index({ tags: 1 });

// ============================================================================
// VIRTUALS
// ============================================================================

CouponSchema.virtual('isValid').get(function(this: ICoupon) {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  if (this.startsAt && now < this.startsAt) return false;
  if (this.expiresAt && now > this.expiresAt) return false;
  if (this.usageLimit && this.currentUsageCount >= this.usageLimit) return false;
  
  return true;
});

CouponSchema.virtual('isExpired').get(function(this: ICoupon) {
  return this.expiresAt ? new Date() > this.expiresAt : false;
});

CouponSchema.virtual('remainingUses').get(function(this: ICoupon) {
  if (!this.usageLimit) return Infinity;
  return Math.max(0, this.usageLimit - this.currentUsageCount);
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Check if coupon can be used by a specific user
 */
CouponSchema.methods.canBeUsedBy = async function(this: ICoupon, userId: mongoose.Types.ObjectId): Promise<boolean> {
  // Check if coupon is valid
  if (!this.isValid) return false;
  
  // Check user-specific eligibility
  if (this.eligibleUsers && this.eligibleUsers.length > 0) {
    const isEligible = this.eligibleUsers.some(id => id.equals(userId));
    if (!isEligible) return false;
  }
  
  // Check usage limit per user
  if (this.usageLimitPerUser) {
    const userUsageCount = this.usageHistory.filter(usage => usage.userId.equals(userId)).length;
    if (userUsageCount >= this.usageLimitPerUser) return false;
  }
  
  return true;
};

/**
 * Increment usage count and record usage
 */
CouponSchema.methods.incrementUsage = async function(
  this: ICoupon, 
  userId: mongoose.Types.ObjectId, 
  orderId: mongoose.Types.ObjectId, 
  discountAmount: number,
  orderAmount: number
): Promise<void> {
  this.currentUsageCount += 1;
  this.totalUsageCount += 1;
  this.totalSavings += discountAmount;
  
  this.usageHistory.push({
    userId,
    orderId,
    discountAmount,
    orderAmount,
    usedAt: new Date()
  } as ICouponUsage);
  
  await this.save();
};

/**
 * Calculate discount amount for an order
 */
CouponSchema.methods.calculateDiscount = async function(
  this: ICoupon, 
  orderAmount: number, 
  items?: any[]
): Promise<number> {
  // Check minimum order value
  if (this.minimumOrderValue && orderAmount < this.minimumOrderValue) {
    return 0;
  }
  
  let discount = 0;
  
  switch (this.discountType) {
    case 'percentage':
      discount = (orderAmount * this.discountValue) / 100;
      // Apply maximum discount cap if specified
      if (this.maximumDiscount) {
        discount = Math.min(discount, this.maximumDiscount);
      }
      break;
      
    case 'fixed_amount':
      discount = Math.min(this.discountValue, orderAmount);
      break;
      
    case 'free_shipping':
      // This would typically be handled separately
      discount = 0; // Shipping cost would be calculated elsewhere
      break;
      
    case 'buy_x_get_y':
      // Complex logic - would need item details
      discount = 0;
      break;
      
    default:
      discount = 0;
  }
  
  return Math.round(discount * 100) / 100;
};

/**
 * Validate conditions for an order
 */
CouponSchema.methods.validateConditions = async function(
  this: ICoupon, 
  orderData: any
): Promise<boolean> {
  if (!this.conditions || this.conditions.length === 0) return true;
  
  for (const condition of this.conditions) {
    switch (condition.type) {
      case 'min_order_value':
        if (orderData.total < Number(condition.value)) return false;
        break;
        
      case 'max_order_value':
        if (orderData.total > Number(condition.value)) return false;
        break;
        
      case 'specific_products':
        const productIds = Array.isArray(condition.value) ? condition.value : [condition.value];
        const hasProduct = orderData.items?.some((item: any) => 
          productIds.includes(item.productId.toString())
        );
        if (!hasProduct) return false;
        break;
        
      case 'first_time_customer':
        if (!orderData.isFirstOrder) return false;
        break;
        
      default:
        break;
    }
  }
  
  return true;
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find valid coupons for a user
 */
CouponSchema.statics.findValidCouponsForUser = async function(
  userId: mongoose.Types.ObjectId
): Promise<ICoupon[]> {
  const now = new Date();
  
  return this.find({
    $and: [
      { isActive: true },
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
      }
    ]
  });
};

/**
 * Generate unique coupon code
 */
CouponSchema.statics.generateUniqueCode = async function(prefix: string = ''): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;
  let exists = true;
  
  while (exists) {
    code = prefix;
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existing = await this.findOne({ code });
    exists = !!existing;
  }
  
  return code!;
};

// ============================================================================
// HOOKS
// ============================================================================

// Pre-save hook to validate discount value
CouponSchema.pre('save', function(next) {
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    next(new Error('Percentage discount cannot exceed 100%'));
  } else if (this.discountType === 'percentage' && this.discountValue <= 0) {
    next(new Error('Percentage discount must be greater than 0'));
  } else {
    next();
  }
});

// Pre-save hook to ensure expiry date is after start date
CouponSchema.pre('save', function(next) {
  if (this.startsAt && this.expiresAt && this.expiresAt <= this.startsAt) {
    next(new Error('Expiry date must be after start date'));
  } else {
    next();
  }
});

// ============================================================================
// MODEL
// ============================================================================

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;

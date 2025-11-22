import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface IDeal extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy-x-get-y' | 'free-shipping';
  
  // Discount configuration
  discountValue: number; // Percentage (0-100) or fixed amount
  minimumPurchase?: number;
  maximumDiscount?: number;
  
  // Buy X Get Y configuration
  buyQuantity?: number;
  getQuantity?: number;
  
  // Applicability
  applicableTo: 'all' | 'specific' | 'category' | 'brand';
  products?: mongoose.Types.ObjectId[]; // Specific products
  categories?: mongoose.Types.ObjectId[]; // Specific categories
  brands?: mongoose.Types.ObjectId[]; // Specific brands
  excludedProducts?: mongoose.Types.ObjectId[];
  
  // Time configuration
  startDate: Date;
  endDate: Date;
  isFlashSale: boolean;
  flashSaleDuration?: number; // Minutes
  
  // Usage limits
  usageLimit?: number; // Total usage limit
  usageLimitPerUser?: number;
  usageCount: number;
  userUsageCount: Map<string, number>;
  
  // Status and visibility
  status: 'scheduled' | 'active' | 'expired' | 'paused' | 'cancelled';
  isActive: boolean;
  isFeatured: boolean;
  priority: number; // Higher priority deals show first
  
  // Display settings
  badge?: string; // e.g., "50% OFF", "BOGO", "Flash Sale"
  bannerImage?: string;
  termsAndConditions?: string;
  
  // Tracking
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  
  // Admin
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  isValid(): boolean;
  canBeUsedBy(userId: mongoose.Types.ObjectId): Promise<boolean>;
  incrementUsage(userId: mongoose.Types.ObjectId, orderValue: number): Promise<this>;
  calculateDiscount(orderValue: number, quantity?: number): number;
  activate(): Promise<this>;
  pause(): Promise<this>;
  cancel(): Promise<this>;
}

export interface IDealModel extends mongoose.Model<IDeal> {
  getActiveDeal(productId?: mongoose.Types.ObjectId): Promise<IDeal | null>;
  getUpcomingDeals(limit?: number): Promise<IDeal[]>;
  getExpiredDeals(limit?: number): Promise<IDeal[]>;
  getFlashSales(): Promise<IDeal[]>;
  checkAndUpdateStatus(): Promise<void>;
  getDealStatistics(dealId: mongoose.Types.ObjectId): Promise<any>;
  getTopDeals(limit?: number): Promise<IDeal[]>;
}

// ==================== SCHEMA ====================

const dealSchema = new Schema<IDeal>(
  {
    name: {
      type: String,
      required: [true, 'Deal name is required'],
      trim: true,
      maxlength: [100, 'Deal name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Deal description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: {
        values: ['percentage', 'fixed', 'buy-x-get-y', 'free-shipping'],
        message: 'Invalid deal type'
      },
      required: [true, 'Deal type is required']
    },
    
    // Discount configuration
    discountValue: {
      type: Number,
      required: function(this: IDeal) {
        return this.type !== 'free-shipping';
      },
      min: [0, 'Discount value cannot be negative'],
      validate: {
        validator: function(this: IDeal, value: number) {
          if (this.type === 'percentage') {
            return value >= 0 && value <= 100;
          }
          return value >= 0;
        },
        message: 'Percentage discount must be between 0 and 100'
      }
    },
    minimumPurchase: {
      type: Number,
      min: [0, 'Minimum purchase cannot be negative'],
      default: 0
    },
    maximumDiscount: {
      type: Number,
      min: [0, 'Maximum discount cannot be negative']
    },
    
    // Buy X Get Y configuration
    buyQuantity: {
      type: Number,
      min: [1, 'Buy quantity must be at least 1'],
      required: function(this: IDeal) {
        return this.type === 'buy-x-get-y';
      }
    },
    getQuantity: {
      type: Number,
      min: [1, 'Get quantity must be at least 1'],
      required: function(this: IDeal) {
        return this.type === 'buy-x-get-y';
      }
    },
    
    // Applicability
    applicableTo: {
      type: String,
      enum: {
        values: ['all', 'specific', 'category', 'brand'],
        message: 'Invalid applicability type'
      },
      default: 'all'
    },
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    categories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category'
    }],
    brands: [{
      type: Schema.Types.ObjectId,
      ref: 'Brand'
    }],
    excludedProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    
    // Time configuration
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(this: IDeal, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    isFlashSale: {
      type: Boolean,
      default: false
    },
    flashSaleDuration: {
      type: Number,
      min: [1, 'Flash sale duration must be at least 1 minute'],
      max: [1440, 'Flash sale duration cannot exceed 24 hours']
    },
    
    // Usage limits
    usageLimit: {
      type: Number,
      min: [1, 'Usage limit must be at least 1']
    },
    usageLimitPerUser: {
      type: Number,
      min: [1, 'User usage limit must be at least 1']
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative']
    },
    userUsageCount: {
      type: Map,
      of: Number,
      default: new Map()
    },
    
    // Status and visibility
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'active', 'expired', 'paused', 'cancelled'],
        message: 'Invalid status'
      },
      default: 'scheduled'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0,
      min: [0, 'Priority cannot be negative']
    },
    
    // Display settings
    badge: {
      type: String,
      trim: true,
      maxlength: [50, 'Badge text cannot exceed 50 characters']
    },
    bannerImage: {
      type: String,
      trim: true
    },
    termsAndConditions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Terms and conditions cannot exceed 2000 characters']
    },
    
    // Tracking
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    clicks: {
      type: Number,
      default: 0,
      min: [0, 'Clicks cannot be negative']
    },
    conversions: {
      type: Number,
      default: 0,
      min: [0, 'Conversions cannot be negative']
    },
    revenue: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    },
    
    // Admin
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

dealSchema.index({ status: 1, isActive: 1 });
dealSchema.index({ startDate: 1, endDate: 1 });
dealSchema.index({ type: 1 });
dealSchema.index({ isFlashSale: 1, status: 1 });
dealSchema.index({ products: 1 });
dealSchema.index({ categories: 1 });
dealSchema.index({ brands: 1 });
dealSchema.index({ priority: -1 });
dealSchema.index({ createdAt: -1 });

// ==================== VIRTUALS ====================

dealSchema.virtual('isExpired').get(function() {
  return this.endDate < new Date() || this.status === 'expired';
});

dealSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date() && this.status === 'scheduled';
});

dealSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'active') return null;
  const now = new Date();
  const remaining = this.endDate.getTime() - now.getTime();
  return remaining > 0 ? remaining : 0;
});

dealSchema.virtual('conversionRate').get(function() {
  return this.clicks > 0 ? (this.conversions / this.clicks) * 100 : 0;
});

// ==================== INSTANCE METHODS ====================

/**
 * Check if deal is currently valid
 */
dealSchema.methods.isValid = function(): boolean {
  const now = new Date();
  return (
    this.isActive &&
    this.status === 'active' &&
    this.startDate <= now &&
    this.endDate >= now &&
    (!this.usageLimit || this.usageCount < this.usageLimit)
  );
};

/**
 * Check if deal can be used by a specific user
 */
dealSchema.methods.canBeUsedBy = async function(
  userId: mongoose.Types.ObjectId
): Promise<boolean> {
  if (!this.isValid()) return false;
  
  if (this.usageLimitPerUser) {
    const userUsage = this.userUsageCount.get(userId.toString()) || 0;
    return userUsage < this.usageLimitPerUser;
  }
  
  return true;
};

/**
 * Increment usage count
 */
dealSchema.methods.incrementUsage = async function(
  userId: mongoose.Types.ObjectId,
  orderValue: number
): Promise<any> {
  this.usageCount += 1;
  this.conversions += 1;
  this.revenue += orderValue;
  
  const userIdStr = userId.toString();
  const currentCount = this.userUsageCount.get(userIdStr) || 0;
  this.userUsageCount.set(userIdStr, currentCount + 1);
  
  await this.save();
  return this as any;
};

/**
 * Calculate discount amount
 */
dealSchema.methods.calculateDiscount = function(
  orderValue: number,
  quantity: number = 1
): number {
  if (!this.isValid()) return 0;
  
  // Check minimum purchase
  if (this.minimumPurchase && orderValue < this.minimumPurchase) {
    return 0;
  }
  
  let discount = 0;
  
  switch (this.type) {
    case 'percentage':
      discount = (orderValue * this.discountValue) / 100;
      break;
    
    case 'fixed':
      discount = this.discountValue;
      break;
    
    case 'buy-x-get-y':
      if (this.buyQuantity && this.getQuantity && quantity >= this.buyQuantity) {
        const sets = Math.floor(quantity / this.buyQuantity);
        const itemPrice = orderValue / quantity;
        discount = sets * this.getQuantity * itemPrice;
      }
      break;
    
    case 'free-shipping':
      // Shipping discount handled separately
      discount = 0;
      break;
  }
  
  // Apply maximum discount cap
  if (this.maximumDiscount && discount > this.maximumDiscount) {
    discount = this.maximumDiscount;
  }
  
  return Math.round(discount * 100) / 100;
};

/**
 * Activate deal
 */
dealSchema.methods.activate = async function(): Promise<any> {
  this.status = 'active';
  this.isActive = true;
  await this.save();
  return this as any;
};

/**
 * Pause deal
 */
dealSchema.methods.pause = async function(): Promise<any> {
  this.status = 'paused';
  this.isActive = false;
  await this.save();
  return this as any;
};

/**
 * Cancel deal
 */
dealSchema.methods.cancel = async function(): Promise<any> {
  this.status = 'cancelled';
  this.isActive = false;
  await this.save();
  return this as any;
};

// ==================== STATIC METHODS ====================

/**
 * Get active deals for a product
 */
dealSchema.statics.getActiveDeal = async function(
  productId?: mongoose.Types.ObjectId
): Promise<IDeal | null> {
  const now = new Date();
  
  const query: any = {
    status: 'active',
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { usageLimit: { $exists: false } },
      { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
    ]
  };
  
  if (productId) {
    query.$or = [
      { applicableTo: 'all' },
      { products: productId }
    ];
  }
  
  return this.findOne(query).sort({ priority: -1, createdAt: -1 });
};

/**
 * Get upcoming deals
 */
dealSchema.statics.getUpcomingDeals = async function(
  limit: number = 10
): Promise<IDeal[]> {
  const now = new Date();
  
  return this.find({
    status: 'scheduled',
    isActive: true,
    startDate: { $gt: now }
  })
    .sort({ startDate: 1 })
    .limit(limit);
};

/**
 * Get expired deals
 */
dealSchema.statics.getExpiredDeals = async function(
  limit: number = 10
): Promise<IDeal[]> {
  const now = new Date();
  
  return this.find({
    $or: [
      { status: 'expired' },
      { endDate: { $lt: now } }
    ]
  })
    .sort({ endDate: -1 })
    .limit(limit);
};

/**
 * Get active flash sales
 */
dealSchema.statics.getFlashSales = async function(): Promise<IDeal[]> {
  const now = new Date();
  
  return this.find({
    isFlashSale: true,
    status: 'active',
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ endDate: 1 });
};

/**
 * Check and update deal statuses
 */
dealSchema.statics.checkAndUpdateStatus = async function(): Promise<void> {
  const now = new Date();
  
  // Activate scheduled deals
  await this.updateMany(
    {
      status: 'scheduled',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    },
    { status: 'active' }
  );
  
  // Expire active deals
  await this.updateMany(
    {
      status: 'active',
      endDate: { $lt: now }
    },
    { status: 'expired', isActive: false }
  );
  
  // Mark deals that reached usage limit
  const deals = await this.find({
    status: 'active',
    usageLimit: { $exists: true },
    $expr: { $gte: ['$usageCount', '$usageLimit'] }
  });
  
  for (const deal of deals) {
    deal.status = 'expired';
    deal.isActive = false;
    await deal.save();
  }
};

/**
 * Get deal statistics
 */
dealSchema.statics.getDealStatistics = async function(
  dealId: mongoose.Types.ObjectId
): Promise<any> {
  const deal = await this.findById(dealId);
  if (!deal) return null;
  
  return {
    name: deal.name,
    type: deal.type,
    status: deal.status,
    views: deal.views,
    clicks: deal.clicks,
    conversions: deal.conversions,
    revenue: deal.revenue,
    conversionRate: deal.conversionRate,
    usageCount: deal.usageCount,
    usageLimit: deal.usageLimit,
    startDate: deal.startDate,
    endDate: deal.endDate,
    timeRemaining: deal.timeRemaining
  };
};

/**
 * Get top performing deals
 */
dealSchema.statics.getTopDeals = async function(
  limit: number = 10
): Promise<IDeal[]> {
  return this.find({ isActive: true })
    .sort({ conversions: -1, revenue: -1 })
    .limit(limit);
};

// ==================== HOOKS ====================

dealSchema.pre('save', function(next) {
  // Auto-generate badge if not provided
  if (!this.badge) {
    switch (this.type) {
      case 'percentage':
        this.badge = `${this.discountValue}% OFF`;
        break;
      case 'fixed':
        this.badge = `₹${this.discountValue} OFF`;
        break;
      case 'buy-x-get-y':
        this.badge = `Buy ${this.buyQuantity} Get ${this.getQuantity}`;
        break;
      case 'free-shipping':
        this.badge = 'FREE SHIPPING';
        break;
    }
  }
  
  // Update status based on dates
  const now = new Date();
  if (this.startDate > now && this.status === 'scheduled') {
    // Keep scheduled
  } else if (this.startDate <= now && this.endDate >= now && this.status === 'scheduled') {
    this.status = 'active';
  } else if (this.endDate < now && this.status !== 'cancelled') {
    this.status = 'expired';
    this.isActive = false;
  }
  
  next();
});

// ==================== MODEL ====================

const Deal = mongoose.model<IDeal, IDealModel>('Deal', dealSchema);

export default Deal;

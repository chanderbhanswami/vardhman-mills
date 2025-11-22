import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface ISale extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Basic Information
  name: string;
  slug: string;
  description?: string;
  
  // Type & Category
  type: 'seasonal' | 'flash' | 'clearance' | 'event' | 'promotional' | 'custom';
  category?: string; // e.g., 'Black Friday', 'Summer Sale', 'Back to School'
  
  // Discount Configuration
  discount: {
    type: 'percentage' | 'fixed' | 'bogo' | 'bundle';
    value: number; // percentage (0-100) or fixed amount
    maxAmount?: number; // max discount cap for percentage
    minPurchase?: number; // minimum purchase amount
  };
  
  // Scheduling
  startDate: Date;
  endDate: Date;
  timezone: string;
  
  // Target Configuration
  targeting: {
    products?: mongoose.Types.ObjectId[]; // Specific products
    categories?: mongoose.Types.ObjectId[]; // Product categories
    brands?: string[]; // Specific brands
    tags?: string[]; // Product tags
    priceRange?: {
      min?: number;
      max?: number;
    };
  };
  
  // Usage Limits
  limits: {
    maxUses?: number; // Total uses across all users
    maxUsesPerUser?: number; // Per user limit
    currentUses: number;
  };
  
  // User Targeting
  userRestrictions: {
    userTypes?: ('all' | 'guest' | 'authenticated' | 'new' | 'vip')[];
    specificUsers?: mongoose.Types.ObjectId[];
    excludeUsers?: mongoose.Types.ObjectId[];
  };
  
  // Display Settings
  display: {
    showBadge: boolean;
    badgeText?: string; // e.g., 'SALE', '50% OFF', 'HOT DEAL'
    badgeColor?: string;
    bannerImage?: string;
    priority: number; // Higher priority shows first
  };
  
  // Status
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  
  // Analytics
  analytics: {
    views: number;
    appliedCount: number;
    revenue: number;
    itemsSold: number;
    averageOrderValue: number;
  };
  
  // Metadata
  createdBy: mongoose.Types.ObjectId;
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  activate(): Promise<this>;
  deactivate(): Promise<this>;
  publish(): Promise<this>;
  unpublish(): Promise<this>;
  incrementViews(): Promise<this>;
  incrementApplied(amount: number): Promise<this>;
  canBeApplied(userId?: mongoose.Types.ObjectId): Promise<{ valid: boolean; message?: string }>;
  isCurrentlyActive(): boolean;
  calculateDiscount(originalPrice: number): number;
}

export interface ISaleModel extends mongoose.Model<ISale> {
  getActiveSales(options?: any): Promise<ISale[]>;
  getSalesByType(type: string): Promise<ISale[]>;
  getFeaturedSales(): Promise<ISale[]>;
  getUpcomingSales(): Promise<ISale[]>;
  getSalesForProduct(productId: mongoose.Types.ObjectId): Promise<ISale[]>;
  deactivateExpired(): Promise<void>;
  activateScheduled(): Promise<void>;
}

// ==================== SCHEMA ====================

const saleSchema = new Schema<ISale>(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Sale name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Type & Category
    type: {
      type: String,
      enum: {
        values: ['seasonal', 'flash', 'clearance', 'event', 'promotional', 'custom'],
        message: '{VALUE} is not a valid sale type'
      },
      required: [true, 'Sale type is required'],
      index: true
    },
    category: {
      type: String,
      trim: true,
      index: true
    },
    
    // Discount Configuration
    discount: {
      type: {
        type: String,
        enum: {
          values: ['percentage', 'fixed', 'bogo', 'bundle'],
          message: '{VALUE} is not a valid discount type'
        },
        required: true
      },
      value: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative']
      },
      maxAmount: {
        type: Number,
        min: [0, 'Max amount cannot be negative']
      },
      minPurchase: {
        type: Number,
        min: [0, 'Min purchase cannot be negative']
      }
    },
    
    // Scheduling
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      index: true
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    
    // Target Configuration
    targeting: {
      products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }],
      categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
      }],
      brands: [{
        type: String,
        trim: true
      }],
      tags: [{
        type: String,
        trim: true,
        lowercase: true
      }],
      priceRange: {
        min: {
          type: Number,
          min: 0
        },
        max: {
          type: Number,
          min: 0
        }
      }
    },
    
    // Usage Limits
    limits: {
      maxUses: {
        type: Number,
        min: [0, 'Max uses cannot be negative']
      },
      maxUsesPerUser: {
        type: Number,
        min: [0, 'Max uses per user cannot be negative']
      },
      currentUses: {
        type: Number,
        default: 0,
        min: [0, 'Current uses cannot be negative']
      }
    },
    
    // User Targeting
    userRestrictions: {
      userTypes: [{
        type: String,
        enum: ['all', 'guest', 'authenticated', 'new', 'vip']
      }],
      specificUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      excludeUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    
    // Display Settings
    display: {
      showBadge: {
        type: Boolean,
        default: true
      },
      badgeText: {
        type: String,
        trim: true,
        maxlength: [20, 'Badge text cannot exceed 20 characters'],
        default: 'SALE'
      },
      badgeColor: {
        type: String,
        trim: true,
        default: '#ef4444'
      },
      bannerImage: {
        type: String,
        trim: true
      },
      priority: {
        type: Number,
        default: 0,
        min: [0, 'Priority cannot be negative'],
        max: [100, 'Priority cannot exceed 100']
      }
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: false,
      index: true
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // Analytics
    analytics: {
      views: {
        type: Number,
        default: 0,
        min: 0
      },
      appliedCount: {
        type: Number,
        default: 0,
        min: 0
      },
      revenue: {
        type: Number,
        default: 0,
        min: 0
      },
      itemsSold: {
        type: Number,
        default: 0,
        min: 0
      },
      averageOrderValue: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    
    // Metadata
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

saleSchema.index({ isActive: 1, isPublished: 1, startDate: 1, endDate: 1 });
saleSchema.index({ type: 1, isActive: 1 });
saleSchema.index({ 'display.priority': -1, startDate: 1 });
saleSchema.index({ isFeatured: 1, isActive: 1 });
saleSchema.index({ 'targeting.products': 1 });
saleSchema.index({ 'targeting.categories': 1 });
saleSchema.index({ tags: 1 });

// ==================== INSTANCE METHODS ====================

/**
 * Activate sale
 */
saleSchema.methods.activate = async function(): Promise<any> {
  this.isActive = true;
  await this.save();
  return this as any;
};

/**
 * Deactivate sale
 */
saleSchema.methods.deactivate = async function(): Promise<any> {
  this.isActive = false;
  await this.save();
  return this as any;
};

/**
 * Publish sale
 */
saleSchema.methods.publish = async function(): Promise<any> {
  this.isPublished = true;
  await this.save();
  return this as any;
};

/**
 * Unpublish sale
 */
saleSchema.methods.unpublish = async function(): Promise<any> {
  this.isPublished = false;
  await this.save();
  return this as any;
};

/**
 * Increment view count
 */
saleSchema.methods.incrementViews = async function(): Promise<any> {
  this.analytics.views += 1;
  await this.save();
  return this as any;
};

/**
 * Increment applied count and update analytics
 */
saleSchema.methods.incrementApplied = async function(amount: number): Promise<any> {
  this.limits.currentUses += 1;
  this.analytics.appliedCount += 1;
  this.analytics.revenue += amount;
  
  // Recalculate average order value
  this.analytics.averageOrderValue = this.analytics.revenue / this.analytics.appliedCount;
  
  await this.save();
  return this as any;
};

/**
 * Check if sale can be applied by user
 */
saleSchema.methods.canBeApplied = async function(
  userId?: mongoose.Types.ObjectId
): Promise<{ valid: boolean; message?: string }> {
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'Sale is not active' };
  }
  
  // Check if published
  if (!this.isPublished) {
    return { valid: false, message: 'Sale is not published' };
  }
  
  // Check dates
  const now = new Date();
  if (this.startDate > now) {
    return { valid: false, message: 'Sale has not started yet' };
  }
  
  if (this.endDate < now) {
    return { valid: false, message: 'Sale has ended' };
  }
  
  // Check max uses
  if (this.limits.maxUses && this.limits.currentUses >= this.limits.maxUses) {
    return { valid: false, message: 'Sale limit reached' };
  }
  
  // Check user-specific limits (would need to query usage history)
  // This is a placeholder - implement based on your usage tracking system
  
  return { valid: true };
};

/**
 * Check if sale is currently active
 */
saleSchema.methods.isCurrentlyActive = function(): boolean {
  if (!this.isActive || !this.isPublished) {
    return false;
  }
  
  const now = new Date();
  
  if (this.startDate > now || this.endDate < now) {
    return false;
  }
  
  if (this.limits.maxUses && this.limits.currentUses >= this.limits.maxUses) {
    return false;
  }
  
  return true;
};

/**
 * Calculate discount for a given price
 */
saleSchema.methods.calculateDiscount = function(originalPrice: number): number {
  if (this.discount.type === 'percentage') {
    let discount = (originalPrice * this.discount.value) / 100;
    
    // Apply max discount cap if set
    if (this.discount.maxAmount && discount > this.discount.maxAmount) {
      discount = this.discount.maxAmount;
    }
    
    return discount;
  } else if (this.discount.type === 'fixed') {
    return Math.min(this.discount.value, originalPrice);
  }
  
  // For BOGO and bundle, calculation depends on cart items
  return 0;
};

// ==================== STATIC METHODS ====================

/**
 * Get active sales
 */
saleSchema.statics.getActiveSales = async function(options: any = {}): Promise<ISale[]> {
  const now = new Date();
  
  const query: any = {
    isActive: true,
    isPublished: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  };
  
  // Type filter
  if (options.type) {
    query.type = options.type;
  }
  
  // Category filter
  if (options.category) {
    query.category = options.category;
  }
  
  const sales = await this.find(query)
    .sort({ 'display.priority': -1, startDate: 1 })
    .lean();
  
  // Filter by usage limits
  return sales.filter((sale: any) => {
    if (sale.limits.maxUses && sale.limits.currentUses >= sale.limits.maxUses) {
      return false;
    }
    return true;
  });
};

/**
 * Get sales by type
 */
saleSchema.statics.getSalesByType = async function(type: string): Promise<ISale[]> {
  return await this.find({ type, isActive: true, isPublished: true })
    .sort({ 'display.priority': -1, startDate: -1 })
    .lean();
};

/**
 * Get featured sales
 */
saleSchema.statics.getFeaturedSales = async function(): Promise<ISale[]> {
  const now = new Date();
  
  return await this.find({
    isFeatured: true,
    isActive: true,
    isPublished: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  })
    .sort({ 'display.priority': -1 })
    .limit(10)
    .lean();
};

/**
 * Get upcoming sales
 */
saleSchema.statics.getUpcomingSales = async function(): Promise<ISale[]> {
  const now = new Date();
  
  return await this.find({
    isPublished: true,
    startDate: { $gt: now }
  })
    .sort({ startDate: 1 })
    .limit(10)
    .lean();
};

/**
 * Get sales for a specific product
 */
saleSchema.statics.getSalesForProduct = async function(
  productId: mongoose.Types.ObjectId
): Promise<ISale[]> {
  const now = new Date();
  
  return await this.find({
    isActive: true,
    isPublished: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    'targeting.products': productId
  })
    .sort({ 'display.priority': -1 })
    .lean();
};

/**
 * Deactivate expired sales
 */
saleSchema.statics.deactivateExpired = async function(): Promise<void> {
  const now = new Date();
  
  await this.updateMany(
    {
      isActive: true,
      endDate: { $lt: now }
    },
    {
      $set: { isActive: false }
    }
  );
};

/**
 * Activate scheduled sales
 */
saleSchema.statics.activateScheduled = async function(): Promise<void> {
  const now = new Date();
  
  await this.updateMany(
    {
      isPublished: true,
      isActive: false,
      startDate: { $lte: now },
      endDate: { $gte: now }
    },
    {
      $set: { isActive: true }
    }
  );
};

// ==================== VIRTUALS ====================

/**
 * Get conversion rate
 */
saleSchema.virtual('conversionRate').get(function() {
  return this.analytics.views > 0 
    ? ((this.analytics.appliedCount / this.analytics.views) * 100).toFixed(2)
    : 0;
});

/**
 * Get usage percentage
 */
saleSchema.virtual('usagePercentage').get(function() {
  if (!this.limits.maxUses) return 0;
  return ((this.limits.currentUses / this.limits.maxUses) * 100).toFixed(2);
});

/**
 * Check if scheduled
 */
saleSchema.virtual('isScheduled').get(function() {
  return this.startDate > new Date();
});

/**
 * Check if expired
 */
saleSchema.virtual('isExpired').get(function() {
  return this.endDate < new Date();
});

/**
 * Get status
 */
saleSchema.virtual('status').get(function() {
  if (!this.isPublished) return 'draft';
  if (!this.isActive) return 'inactive';
  if ((this as any).isScheduled) return 'scheduled';
  if ((this as any).isExpired) return 'expired';
  if (this.limits.maxUses && this.limits.currentUses >= this.limits.maxUses) return 'soldout';
  return 'active';
});

/**
 * Get days remaining
 */
saleSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  if (this.endDate < now) return 0;
  
  const diffTime = this.endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// ==================== HOOKS ====================

/**
 * Validate dates
 */
saleSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

/**
 * Generate slug from name if not provided
 */
saleSchema.pre('save', function(next) {
  if (this.isNew && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * Clean up tags
 */
saleSchema.pre('save', function(next) {
  if (this.tags && this.tags.length > 0) {
    this.tags = [...new Set(this.tags.filter(tag => tag && tag.trim()))];
  }
  next();
});

/**
 * Set default user types
 */
saleSchema.pre('save', function(next) {
  if (this.isNew && (!this.userRestrictions.userTypes || this.userRestrictions.userTypes.length === 0)) {
    this.userRestrictions.userTypes = ['all'];
  }
  next();
});

// ==================== MODEL ====================

const Sale = mongoose.model<ISale, ISaleModel>('Sale', saleSchema);

export default Sale;

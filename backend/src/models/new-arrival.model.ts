import mongoose, { Document, Schema } from 'mongoose';

export interface INewArrival extends Document {
  // Product Reference
  productId: mongoose.Types.ObjectId;
  
  // New Arrival Metadata
  title: string; // Optional custom title
  description?: string;
  launchMessage?: string; // Special launch announcement
  
  // Arrival Dates
  arrivalDate: Date; // When product became available
  launchDate: Date; // Official launch/announcement date
  expiryDate?: Date; // When to stop showing as "new"
  autoExpireDays: number; // Auto-expire after X days (default 30)
  
  // Display Settings
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean; // Show in featured new arrivals
  isPriority: boolean; // High priority/spotlight item
  showBadge: boolean; // Show "New" badge
  badgeText?: string; // Custom badge text
  badgeColor?: string; // Badge color
  badgeStyle?: 'default' | 'pulse' | 'glow' | 'ribbon';
  
  // Categorization
  categoryId?: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  collectionIds: mongoose.Types.ObjectId[];
  
  // Performance Metrics
  metrics: {
    views: number;
    clicks: number;
    addToCart: number;
    purchases: number;
    wishlists: number;
    shares: number;
    clickThroughRate: number; // Calculated: clicks / views * 100
    conversionRate: number; // Calculated: purchases / views * 100
    averageRating: number;
    totalReviews: number;
  };
  
  // Trending Analysis
  trending: {
    isTrending: boolean;
    trendScore: number; // Calculated score based on views, sales, engagement
    trendDirection: 'up' | 'down' | 'stable';
    velocityScore: number; // Sales velocity
    popularityRank?: number; // Rank among new arrivals
  };
  
  // Inventory Status
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | 'pre-order' | 'coming-soon';
  stockQuantity?: number;
  preOrderDate?: Date; // For pre-order items
  
  // Promotional Settings
  promotional: {
    isOnSale: boolean;
    hasDiscount: boolean;
    discountPercentage?: number;
    hasSpecialOffer: boolean;
    offerText?: string;
    isExclusive: boolean; // Exclusive/limited edition
    isLimitedEdition: boolean;
    quantityLimit?: number; // Max purchase quantity
  };
  
  // Visibility Rules
  visibility: {
    showOnHomepage: boolean;
    showOnCategoryPage: boolean;
    showOnBrandPage: boolean;
    showInNewsletter: boolean;
    showInNotifications: boolean;
    regions: string[]; // Geographic targeting
    customerSegments: string[]; // Customer type targeting
    deviceTypes: string[]; // Device targeting (mobile/tablet/desktop)
  };
  
  // Media & Assets
  media: {
    images: string[];
    video?: string;
    thumbnail?: string;
    banner?: string;
  };
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };
  
  // Social Proof
  socialProof: {
    showViewCount: boolean;
    showSoldCount: boolean;
    showRating: boolean;
    showReviewCount: boolean;
    soldCount?: number;
    soldInLast24Hours?: number;
  };
  
  // Notifications
  notifications: {
    emailSent: boolean;
    pushSent: boolean;
    smsSent: boolean;
    notifiedUserCount: number;
    notificationDate?: Date;
  };
  
  // Admin metadata
  tags: string[];
  notes?: string; // Internal notes
  
  // Auto-calculated fields
  isNew: boolean; // Still within "new" period
  isExpired: boolean;
  isPreLaunch: boolean;
  daysAsNew: number;
  daysUntilExpiry?: number;
  
  // Scheduling
  scheduledStart?: Date;
  scheduledEnd?: Date;
  
  // Tracking
  lastSyncedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

// Schema type without computed fields
type INewArrivalSchema = Omit<INewArrival, 'isNew' | 'isExpired' | 'isPreLaunch' | 'daysAsNew' | 'daysUntilExpiry' | 'createdAt' | 'updatedAt'>;

const newArrivalSchema = new Schema<INewArrival>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      unique: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    launchMessage: {
      type: String,
      trim: true,
      maxlength: [300, 'Launch message cannot exceed 300 characters']
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required'],
      index: true
    },
    launchDate: {
      type: Date,
      required: [true, 'Launch date is required'],
      index: true
    },
    expiryDate: {
      type: Date,
      index: true
    },
    autoExpireDays: {
      type: Number,
      default: 30,
      min: [1, 'Auto expire days must be at least 1'],
      max: [365, 'Auto expire days cannot exceed 365']
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isPriority: {
      type: Boolean,
      default: false,
      index: true
    },
    showBadge: {
      type: Boolean,
      default: true
    },
    badgeText: {
      type: String,
      trim: true,
      default: 'New',
      maxlength: [30, 'Badge text cannot exceed 30 characters']
    },
    badgeColor: {
      type: String,
      trim: true,
      default: '#FF6B6B' // Red color
    },
    badgeStyle: {
      type: String,
      enum: ['default', 'pulse', 'glow', 'ribbon'],
      default: 'default'
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      index: true
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      index: true
    },
    collectionIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Collection'
    }],
    metrics: {
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
      addToCart: {
        type: Number,
        default: 0,
        min: [0, 'Add to cart count cannot be negative']
      },
      purchases: {
        type: Number,
        default: 0,
        min: [0, 'Purchases cannot be negative']
      },
      wishlists: {
        type: Number,
        default: 0,
        min: [0, 'Wishlists cannot be negative']
      },
      shares: {
        type: Number,
        default: 0,
        min: [0, 'Shares cannot be negative']
      },
      clickThroughRate: {
        type: Number,
        default: 0,
        min: [0, 'CTR cannot be negative'],
        max: [100, 'CTR cannot exceed 100']
      },
      conversionRate: {
        type: Number,
        default: 0,
        min: [0, 'Conversion rate cannot be negative'],
        max: [100, 'Conversion rate cannot exceed 100']
      },
      averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
      },
      totalReviews: {
        type: Number,
        default: 0,
        min: [0, 'Reviews count cannot be negative']
      }
    },
    trending: {
      isTrending: {
        type: Boolean,
        default: false,
        index: true
      },
      trendScore: {
        type: Number,
        default: 0,
        min: [0, 'Trend score cannot be negative']
      },
      trendDirection: {
        type: String,
        enum: ['up', 'down', 'stable'],
        default: 'stable'
      },
      velocityScore: {
        type: Number,
        default: 0,
        min: [0, 'Velocity score cannot be negative']
      },
      popularityRank: {
        type: Number,
        min: [1, 'Rank must be at least 1']
      }
    },
    stockStatus: {
      type: String,
      enum: {
        values: ['in-stock', 'low-stock', 'out-of-stock', 'pre-order', 'coming-soon'],
        message: '{VALUE} is not a valid stock status'
      },
      default: 'in-stock',
      index: true
    },
    stockQuantity: {
      type: Number,
      min: [0, 'Stock quantity cannot be negative']
    },
    preOrderDate: {
      type: Date
    },
    promotional: {
      isOnSale: {
        type: Boolean,
        default: false
      },
      hasDiscount: {
        type: Boolean,
        default: false
      },
      discountPercentage: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100']
      },
      hasSpecialOffer: {
        type: Boolean,
        default: false
      },
      offerText: {
        type: String,
        trim: true,
        maxlength: [200, 'Offer text cannot exceed 200 characters']
      },
      isExclusive: {
        type: Boolean,
        default: false
      },
      isLimitedEdition: {
        type: Boolean,
        default: false
      },
      quantityLimit: {
        type: Number,
        min: [1, 'Quantity limit must be at least 1']
      }
    },
    visibility: {
      showOnHomepage: {
        type: Boolean,
        default: true
      },
      showOnCategoryPage: {
        type: Boolean,
        default: true
      },
      showOnBrandPage: {
        type: Boolean,
        default: true
      },
      showInNewsletter: {
        type: Boolean,
        default: false
      },
      showInNotifications: {
        type: Boolean,
        default: false
      },
      regions: [{
        type: String,
        trim: true
      }],
      customerSegments: [{
        type: String,
        trim: true
      }],
      deviceTypes: [{
        type: String,
        enum: ['mobile', 'tablet', 'desktop'],
        trim: true
      }]
    },
    media: {
      images: [{
        type: String,
        trim: true
      }],
      video: {
        type: String,
        trim: true
      },
      thumbnail: {
        type: String,
        trim: true
      },
      banner: {
        type: String,
        trim: true
      }
    },
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: [70, 'Meta title cannot exceed 70 characters']
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'Meta description cannot exceed 160 characters']
      },
      keywords: [{
        type: String,
        trim: true
      }],
      canonicalUrl: {
        type: String,
        trim: true
      },
      ogImage: {
        type: String,
        trim: true
      }
    },
    socialProof: {
      showViewCount: {
        type: Boolean,
        default: true
      },
      showSoldCount: {
        type: Boolean,
        default: true
      },
      showRating: {
        type: Boolean,
        default: true
      },
      showReviewCount: {
        type: Boolean,
        default: true
      },
      soldCount: {
        type: Number,
        default: 0,
        min: [0, 'Sold count cannot be negative']
      },
      soldInLast24Hours: {
        type: Number,
        default: 0,
        min: [0, 'Sold count cannot be negative']
      }
    },
    notifications: {
      emailSent: {
        type: Boolean,
        default: false
      },
      pushSent: {
        type: Boolean,
        default: false
      },
      smsSent: {
        type: Boolean,
        default: false
      },
      notifiedUserCount: {
        type: Number,
        default: 0,
        min: [0, 'Notified user count cannot be negative']
      },
      notificationDate: {
        type: Date
      }
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    notes: {
      type: String,
      trim: true
    },
    scheduledStart: {
      type: Date,
      index: true
    },
    scheduledEnd: {
      type: Date,
      index: true
    },
    lastSyncedAt: {
      type: Date
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
newArrivalSchema.index({ arrivalDate: -1, launchDate: -1 });
newArrivalSchema.index({ isActive: 1, isFeatured: 1, isPriority: 1 });
newArrivalSchema.index({ isNew: 1, isExpired: 1 });
newArrivalSchema.index({ categoryId: 1, brandId: 1 });
newArrivalSchema.index({ 'trending.isTrending': 1, 'trending.trendScore': -1 });
newArrivalSchema.index({ 'visibility.showOnHomepage': 1 });
newArrivalSchema.index({ expiryDate: 1 });

// Virtuals
newArrivalSchema.virtual('isCurrentlyActive').get(function(this: INewArrival) {
  const now = new Date();
  const isInLaunchPeriod = now >= this.launchDate;
  const isNotExpired = !this.expiryDate || now <= this.expiryDate;
  const isScheduledActive = !this.scheduledStart || now >= this.scheduledStart;
  const isScheduledNotEnded = !this.scheduledEnd || now <= this.scheduledEnd;
  
  return this.isActive && this.isNew && !this.isExpired && isInLaunchPeriod && isNotExpired && isScheduledActive && isScheduledNotEnded;
});

newArrivalSchema.virtual('engagementRate').get(function(this: INewArrival) {
  if (this.metrics.views === 0) return 0;
  const totalEngagement = this.metrics.clicks + this.metrics.addToCart + this.metrics.wishlists + this.metrics.shares;
  return (totalEngagement / this.metrics.views) * 100;
});

// Pre-save middleware
newArrivalSchema.pre('save', function(this: INewArrival, next) {
  const now = new Date();
  
  // Calculate metrics
  if (this.metrics.views > 0) {
    this.metrics.clickThroughRate = (this.metrics.clicks / this.metrics.views) * 100;
    this.metrics.conversionRate = (this.metrics.purchases / this.metrics.views) * 100;
  }
  
  // Calculate trend score (simple formula based on engagement)
  const viewsWeight = this.metrics.views * 1;
  const clicksWeight = this.metrics.clicks * 2;
  const purchasesWeight = this.metrics.purchases * 5;
  const wishlistsWeight = this.metrics.wishlists * 3;
  this.trending.trendScore = viewsWeight + clicksWeight + purchasesWeight + wishlistsWeight;
  
  // Calculate days as new
  if (this.arrivalDate) {
    const diffTime = Math.abs(now.getTime() - this.arrivalDate.getTime());
    this.daysAsNew = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Calculate days until expiry
  if (this.expiryDate) {
    const diffTime = this.expiryDate.getTime() - now.getTime();
    this.daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (this.daysUntilExpiry < 0) {
      this.isExpired = true;
      this.isNew = false;
    }
  } else {
    // Auto-calculate expiry based on autoExpireDays
    const autoExpiryDate = new Date(this.arrivalDate);
    autoExpiryDate.setDate(autoExpiryDate.getDate() + this.autoExpireDays);
    
    if (now > autoExpiryDate) {
      this.isExpired = true;
      this.isNew = false;
    }
  }
  
  // Check if pre-launch
  this.isPreLaunch = now < this.launchDate;
  
  // Determine trending status (items with high trend score in last 7 days)
  if (this.daysAsNew <= 7 && this.trending.trendScore > 100) {
    this.trending.isTrending = true;
  }
  
  next();
});

// Static methods
newArrivalSchema.statics.getActiveNewArrivals = function(limit: number = 20) {
  const now = new Date();
  return this.find({
    isActive: true,
    isNew: true,
    isExpired: false,
    launchDate: { $lte: now },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: now } }
    ]
  })
  .sort({ arrivalDate: -1, displayOrder: 1 })
  .limit(limit)
  .populate('productId categoryId brandId');
};

newArrivalSchema.statics.getTrendingNewArrivals = function(limit: number = 10) {
  const now = new Date();
  return this.find({
    isActive: true,
    isNew: true,
    'trending.isTrending': true,
    launchDate: { $lte: now }
  })
  .sort({ 'trending.trendScore': -1 })
  .limit(limit)
  .populate('productId categoryId brandId');
};

const NewArrival = mongoose.model<INewArrival>('NewArrival', newArrivalSchema);

export default NewArrival;

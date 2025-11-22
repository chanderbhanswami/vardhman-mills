import mongoose, { Document, Schema } from 'mongoose';

export interface IBestseller extends Document {
  // Product Reference
  productId: mongoose.Types.ObjectId;
  
  // Bestseller Metadata
  title: string; // Optional custom title
  description?: string;
  
  // Ranking & Performance
  rank: number; // Current rank in bestseller list
  previousRank?: number; // For tracking rank changes
  salesCount: number; // Total sales in current period
  revenue: number; // Total revenue in current period
  views: number; // Product views
  conversions: number; // View-to-purchase conversions
  conversionRate: number; // Calculated: conversions / views * 100
  
  // Period Tracking
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all-time';
  periodStartDate: Date;
  periodEndDate: Date;
  
  // Categorization
  categoryId?: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  collectionIds: mongoose.Types.ObjectId[];
  
  // Display Settings
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean; // Show in featured sections
  showBadge: boolean; // Show "Bestseller" badge
  badgeText?: string; // Custom badge text
  badgeColor?: string; // Badge color
  
  // Analytics & Metrics
  metrics: {
    averageRating: number;
    totalReviews: number;
    totalWishlists: number;
    totalCompares: number;
    totalShares: number;
    returnRate: number; // Percentage of returns
    repeatPurchaseRate: number; // Percentage of repeat customers
  };
  
  // Performance Trends
  trends: {
    salesTrend: 'up' | 'down' | 'stable';
    salesChangePercentage: number; // % change from previous period
    rankChange: number; // Position change (positive = improved)
    revenueChangePercentage: number;
  };
  
  // Inventory
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    canonicalUrl?: string;
  };
  
  // Scheduling
  scheduledStart?: Date; // When to start showing as bestseller
  scheduledEnd?: Date; // When to stop showing as bestseller
  
  // Visibility Rules
  visibility: {
    showOnHomepage: boolean;
    showOnCategoryPage: boolean;
    showOnBrandPage: boolean;
    showInNewsletter: boolean;
    regions: string[]; // Geographic regions to show in
    customerSegments: string[]; // Customer segments to target
  };
  
  // Admin metadata
  tags: string[];
  notes?: string; // Internal notes
  
  // Auto-calculated fields
  isScheduled: boolean;
  isExpired: boolean;
  daysAsBestseller: number;
  
  // Tracking
  lastSyncedAt?: Date; // Last time data was synced
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const bestsellerSchema = new Schema<IBestseller>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
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
    rank: {
      type: Number,
      required: [true, 'Rank is required'],
      min: [1, 'Rank must be at least 1'],
      index: true
    },
    previousRank: {
      type: Number,
      min: [1, 'Previous rank must be at least 1']
    },
    salesCount: {
      type: Number,
      required: [true, 'Sales count is required'],
      default: 0,
      min: [0, 'Sales count cannot be negative']
    },
    revenue: {
      type: Number,
      required: [true, 'Revenue is required'],
      default: 0,
      min: [0, 'Revenue cannot be negative']
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    conversions: {
      type: Number,
      default: 0,
      min: [0, 'Conversions cannot be negative']
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: [0, 'Conversion rate cannot be negative'],
      max: [100, 'Conversion rate cannot exceed 100']
    },
    period: {
      type: String,
      enum: {
        values: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all-time'],
        message: '{VALUE} is not a valid period'
      },
      required: [true, 'Period is required'],
      index: true
    },
    periodStartDate: {
      type: Date,
      required: [true, 'Period start date is required'],
      index: true
    },
    periodEndDate: {
      type: Date,
      required: [true, 'Period end date is required'],
      index: true
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
    showBadge: {
      type: Boolean,
      default: true
    },
    badgeText: {
      type: String,
      trim: true,
      default: 'Bestseller',
      maxlength: [50, 'Badge text cannot exceed 50 characters']
    },
    badgeColor: {
      type: String,
      trim: true,
      default: '#FFD700' // Gold color
    },
    metrics: {
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
      },
      totalWishlists: {
        type: Number,
        default: 0,
        min: [0, 'Wishlists count cannot be negative']
      },
      totalCompares: {
        type: Number,
        default: 0,
        min: [0, 'Compares count cannot be negative']
      },
      totalShares: {
        type: Number,
        default: 0,
        min: [0, 'Shares count cannot be negative']
      },
      returnRate: {
        type: Number,
        default: 0,
        min: [0, 'Return rate cannot be negative'],
        max: [100, 'Return rate cannot exceed 100']
      },
      repeatPurchaseRate: {
        type: Number,
        default: 0,
        min: [0, 'Repeat purchase rate cannot be negative'],
        max: [100, 'Repeat purchase rate cannot exceed 100']
      }
    },
    trends: {
      salesTrend: {
        type: String,
        enum: ['up', 'down', 'stable'],
        default: 'stable'
      },
      salesChangePercentage: {
        type: Number,
        default: 0
      },
      rankChange: {
        type: Number,
        default: 0
      },
      revenueChangePercentage: {
        type: Number,
        default: 0
      }
    },
    stockStatus: {
      type: String,
      enum: {
        values: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
        message: '{VALUE} is not a valid stock status'
      },
      default: 'in-stock',
      index: true
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
      }
    },
    scheduledStart: {
      type: Date,
      index: true
    },
    scheduledEnd: {
      type: Date,
      index: true
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
      regions: [{
        type: String,
        trim: true
      }],
      customerSegments: [{
        type: String,
        trim: true
      }]
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
    isScheduled: {
      type: Boolean,
      default: false
    },
    isExpired: {
      type: Boolean,
      default: false
    },
    daysAsBestseller: {
      type: Number,
      default: 0
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
bestsellerSchema.index({ productId: 1, period: 1 }, { unique: true });
bestsellerSchema.index({ rank: 1, period: 1 });
bestsellerSchema.index({ isActive: 1, isFeatured: 1 });
bestsellerSchema.index({ periodStartDate: 1, periodEndDate: 1 });
bestsellerSchema.index({ salesCount: -1, revenue: -1 });
bestsellerSchema.index({ categoryId: 1, brandId: 1 });
bestsellerSchema.index({ 'visibility.showOnHomepage': 1 });

// Virtuals
bestsellerSchema.virtual('rankChangeDirection').get(function() {
  if (!this.previousRank || !this.rank) return 'new';
  if (this.rank < this.previousRank) return 'up';
  if (this.rank > this.previousRank) return 'down';
  return 'same';
});

bestsellerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  const isInPeriod = now >= this.periodStartDate && now <= this.periodEndDate;
  const isScheduledActive = !this.scheduledStart || now >= this.scheduledStart;
  const isNotExpired = !this.scheduledEnd || now <= this.scheduledEnd;
  
  return this.isActive && isInPeriod && isScheduledActive && isNotExpired;
});

// Pre-save middleware
bestsellerSchema.pre('save', function(next) {
  // Calculate conversion rate
  if (this.views > 0) {
    this.conversionRate = (this.conversions / this.views) * 100;
  }
  
  // Calculate rank change
  if (this.previousRank && this.rank) {
    this.trends.rankChange = this.previousRank - this.rank;
  }
  
  // Calculate days as bestseller
  if (this.createdAt) {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    this.daysAsBestseller = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Check if scheduled
  this.isScheduled = !!(this.scheduledStart || this.scheduledEnd);
  
  // Check if expired
  const now = new Date();
  this.isExpired = !!(this.scheduledEnd && now > this.scheduledEnd);
  
  next();
});

// Static methods
bestsellerSchema.statics.getActiveBestsellers = function(period: string) {
  const now = new Date();
  return this.find({
    period,
    isActive: true,
    periodStartDate: { $lte: now },
    periodEndDate: { $gte: now },
    $and: [
      {
        $or: [
          { scheduledStart: { $exists: false } },
          { scheduledStart: { $lte: now } }
        ]
      },
      {
        $or: [
          { scheduledEnd: { $exists: false } },
          { scheduledEnd: { $gte: now } }
        ]
      }
    ]
  })
  .sort({ rank: 1 })
  .populate('productId categoryId brandId');
};

const Bestseller = mongoose.model<IBestseller>('Bestseller', bestsellerSchema);

export default Bestseller;

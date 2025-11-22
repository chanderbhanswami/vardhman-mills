/**
 * Social Link Model
 * Comprehensive social media links management with analytics and tracking
 */

import mongoose, { Schema, Document, Model, Query } from 'mongoose';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Social Platform Types (21 platforms supported)
 */
export type SocialPlatform = 
  | 'facebook' 
  | 'twitter' 
  | 'instagram' 
  | 'linkedin' 
  | 'youtube' 
  | 'pinterest' 
  | 'tiktok' 
  | 'snapchat' 
  | 'whatsapp' 
  | 'telegram' 
  | 'discord' 
  | 'reddit' 
  | 'github' 
  | 'behance' 
  | 'dribbble'
  | 'medium'
  | 'blog'
  | 'website'
  | 'email'
  | 'phone'
  | 'other';

/**
 * Display Location Types
 */
export type DisplayLocation = 'header' | 'footer' | 'sidebar' | 'all' | 'custom';

/**
 * Click Tracking Interface
 */
export interface IClickTracking {
  timestamp: Date;
  referrer?: string;
  userAgent: string;
  country?: string;
  city?: string;
  device?: string;
  ipAddress?: string;
}

/**
 * Analytics Aggregates Interface
 */
export interface IAnalyticsAggregates {
  clicks: number;
  uniqueClicks: number;
  clicksThisMonth: number;
  clicksThisWeek: number;
  clicksToday: number;
  averageClicksPerDay: number;
  lastClickedAt?: Date;
}

/**
 * SEO Configuration Interface
 */
export interface ISEOConfig {
  isNoFollow: boolean;
  isNoIndex: boolean;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

/**
 * Social Link Document Interface
 */
export interface ISocialLink extends Document {
  // Basic Info
  platform: SocialPlatform;
  url: string;
  title: string;
  description?: string;
  icon?: string;
  customIcon?: string;
  
  // Display Settings
  isActive: boolean;
  displayOrder: number;
  openInNewTab: boolean;
  isVerified: boolean;
  displayLocation: DisplayLocation[];
  group?: mongoose.Types.ObjectId;
  
  // Styling & Theme
  theme: {
    style: 'default' | 'minimal' | 'colorful' | 'professional' | 'creative';
    size: 'small' | 'medium' | 'large';
    shape: 'square' | 'rounded' | 'circle';
    colors?: {
      background?: string;
      text?: string;
      hover?: string;
      border?: string;
    };
  };
  
  // Display Options
  displayOptions: {
    showLabel: boolean;
    showTooltip: boolean;
    showFollowerCount: boolean;
    followerCount?: number;
    animateOnHover: boolean;
    customAnimation?: string;
  };
  
  // Analytics & Tracking
  tracking: {
    enabled: boolean;
    clickHistory: IClickTracking[];
  };
  
  analytics: IAnalyticsAggregates;
  
  engagement: {
    engagementRate: number;
    averageTimeOnSite: number;
    bounceRate: number;
    conversionRate: number;
  };
  
  // SEO
  seo: ISEOConfig;
  
  // Verification
  verification: {
    isVerified: boolean;
    verifiedAt?: Date;
    lastChecked?: Date;
    isAccessible: boolean;
    responseTime?: number;
    statusCode?: number;
    verificationError?: string;
  };
  
  // Metadata
  tags: string[];
  metadata?: Record<string, any>;
  notes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
  
  // Virtuals
  clickThroughRate: number;
  isPopular: boolean;
  clickGrowthRate: number;
}

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

const socialLinkSchema = new Schema<ISocialLink>({
  // Basic Info
  platform: {
    type: String,
    enum: [
      'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 
      'pinterest', 'tiktok', 'snapchat', 'whatsapp', 'telegram', 
      'discord', 'reddit', 'github', 'behance', 'dribbble',
      'medium', 'blog', 'website', 'email', 'phone', 'other'
    ],
    required: [true, 'Platform is required'],
    index: true
  },
  
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic URL validation
        if (this.platform === 'email') {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        }
        if (this.platform === 'phone') {
          return /^[\d\s\-\+\(\)]+$/.test(v);
        }
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  icon: {
    type: String,
    trim: true
  },
  
  customIcon: {
    type: String,
    trim: true
  },
  
  // Display Settings
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  displayOrder: {
    type: Number,
    default: 0,
    index: true
  },
  
  openInNewTab: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  
  displayLocation: [{
    type: String,
    enum: ['header', 'footer', 'sidebar', 'all', 'custom'],
    default: ['footer']
  }],
  
  group: {
    type: Schema.Types.ObjectId,
    ref: 'SocialLinksGroup',
    index: true
  },
  
  // Styling & Theme
  theme: {
    style: {
      type: String,
      enum: ['default', 'minimal', 'colorful', 'professional', 'creative'],
      default: 'default'
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    shape: {
      type: String,
      enum: ['square', 'rounded', 'circle'],
      default: 'rounded'
    },
    colors: {
      background: String,
      text: String,
      hover: String,
      border: String
    }
  },
  
  // Display Options
  displayOptions: {
    showLabel: {
      type: Boolean,
      default: true
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    showFollowerCount: {
      type: Boolean,
      default: false
    },
    followerCount: {
      type: Number,
      min: 0,
      default: 0
    },
    animateOnHover: {
      type: Boolean,
      default: true
    },
    customAnimation: String
  },
  
  // Analytics & Tracking
  tracking: {
    enabled: {
      type: Boolean,
      default: true
    },
    clickHistory: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      referrer: String,
      userAgent: String,
      country: String,
      city: String,
      device: String,
      ipAddress: String
    }]
  },
  
  analytics: {
    clicks: {
      type: Number,
      default: 0,
      min: 0
    },
    uniqueClicks: {
      type: Number,
      default: 0,
      min: 0
    },
    clicksThisMonth: {
      type: Number,
      default: 0,
      min: 0
    },
    clicksThisWeek: {
      type: Number,
      default: 0,
      min: 0
    },
    clicksToday: {
      type: Number,
      default: 0,
      min: 0
    },
    averageClicksPerDay: {
      type: Number,
      default: 0,
      min: 0
    },
    lastClickedAt: Date
  },
  
  engagement: {
    engagementRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageTimeOnSite: {
      type: Number,
      default: 0,
      min: 0
    },
    bounceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // SEO
  seo: {
    isNoFollow: {
      type: Boolean,
      default: false
    },
    isNoIndex: {
      type: Boolean,
      default: false
    },
    metaTitle: {
      type: String,
      maxlength: [70, 'Meta title cannot exceed 70 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    canonicalUrl: String
  },
  
  // Verification
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    lastChecked: Date,
    isAccessible: {
      type: Boolean,
      default: true
    },
    responseTime: Number,
    statusCode: Number,
    verificationError: String
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  metadata: {
    type: Schema.Types.Mixed
  },
  
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================================================
// INDEXES
// ============================================================================

socialLinkSchema.index({ platform: 1, isActive: 1 });
socialLinkSchema.index({ displayLocation: 1, isActive: 1 });
socialLinkSchema.index({ group: 1, displayOrder: 1 });
socialLinkSchema.index({ isActive: 1, displayOrder: 1 });
socialLinkSchema.index({ 'analytics.clicks': -1 });
socialLinkSchema.index({ tags: 1 });
socialLinkSchema.index({ createdAt: -1 });

// ============================================================================
// VIRTUALS
// ============================================================================

/**
 * Calculate click-through rate
 */
socialLinkSchema.virtual('clickThroughRate').get(function(this: ISocialLink) {
  if (!this.analytics || this.analytics.clicks === 0) return 0;
  return (this.analytics.uniqueClicks / this.analytics.clicks) * 100;
});

/**
 * Check if link is popular (more than 100 clicks)
 */
socialLinkSchema.virtual('isPopular').get(function(this: ISocialLink) {
  return this.analytics && this.analytics.clicks > 100;
});

/**
 * Calculate click growth rate (last 30 days vs previous 30 days)
 */
socialLinkSchema.virtual('clickGrowthRate').get(function(this: ISocialLink) {
  if (!this.analytics || !this.tracking.clickHistory) return 0;
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const last30Days = this.tracking.clickHistory.filter(
    (click: IClickTracking) => click.timestamp >= thirtyDaysAgo
  ).length;
  
  const previous30Days = this.tracking.clickHistory.filter(
    (click: IClickTracking) => click.timestamp >= sixtyDaysAgo && click.timestamp < thirtyDaysAgo
  ).length;
  
  if (previous30Days === 0) return last30Days > 0 ? 100 : 0;
  return ((last30Days - previous30Days) / previous30Days) * 100;
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Pre-save middleware
 */
socialLinkSchema.pre('save', function(this: ISocialLink, next) {
  // Calculate average clicks per day
  if (this.analytics && this.createdAt) {
    const daysActive = Math.max(1, Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    this.analytics.averageClicksPerDay = Math.round((this.analytics.clicks / daysActive) * 100) / 100;
  }
  
  // Auto-generate icon based on platform if not provided
  if (!this.icon && !this.customIcon) {
    this.icon = `icon-${this.platform}`;
  }
  
  // Ensure URL has protocol for web links
  if (this.platform !== 'email' && this.platform !== 'phone' && !this.url.startsWith('http')) {
    this.url = `https://${this.url}`;
  }
  
  next();
});

/**
 * Post-save middleware - Clean up old click history (keep last 1000 clicks)
 */
socialLinkSchema.post('save', function(this: ISocialLink, doc: ISocialLink, next) {
  if (doc.tracking.clickHistory && doc.tracking.clickHistory.length > 1000) {
    doc.tracking.clickHistory = doc.tracking.clickHistory.slice(-1000);
    doc.save();
  }
  next();
});

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Get active social links
 */
socialLinkSchema.statics.getActiveLinks = function(
  this: Model<ISocialLink>,
  location?: DisplayLocation
) {
  const query: any = { isActive: true };
  if (location) {
    query.displayLocation = location;
  }
  return this.find(query).sort({ displayOrder: 1 }).lean();
};

/**
 * Get popular links (more than 100 clicks)
 */
socialLinkSchema.statics.getPopularLinks = function(
  this: Model<ISocialLink>,
  limit: number = 10
) {
  return this.find({
    isActive: true,
    'analytics.clicks': { $gte: 100 }
  })
  .sort({ 'analytics.clicks': -1 })
  .limit(limit)
  .lean();
};

/**
 * Get links by platform
 */
socialLinkSchema.statics.getLinksByPlatform = function(
  this: Model<ISocialLink>,
  platform: SocialPlatform
) {
  return this.find({ platform, isActive: true })
    .sort({ displayOrder: 1 })
    .lean();
};

/**
 * Search social links
 */
socialLinkSchema.statics.searchLinks = function(
  this: Model<ISocialLink>,
  searchTerm: string
) {
  return this.find({
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ displayOrder: 1 }).lean();
};

// ============================================================================
// MODEL EXPORT
// ============================================================================

const SocialLink = mongoose.model<ISocialLink>('SocialLink', socialLinkSchema);

export default SocialLink;

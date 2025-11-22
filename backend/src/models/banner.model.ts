import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  name: string;
  title?: string;
  description?: string;
  
  // Banner Type
  type: 'promotional' | 'announcement' | 'product' | 'category' | 'seasonal' | 'custom';
  
  // Media
  desktopImage: string;
  tabletImage?: string;
  mobileImage?: string;
  altText: string;
  
  // Video Support
  videoUrl?: string;
  videoThumbnail?: string;
  
  // Link
  link?: {
    url: string;
    target: '_self' | '_blank' | '_parent' | '_top';
    title?: string;
    nofollow?: boolean;
  };
  
  // Position
  position: {
    page: string; // homepage, category, product, cart, checkout, custom
    location: 'top' | 'middle' | 'bottom' | 'sidebar' | 'header' | 'footer' | 'popup' | 'custom';
    zone?: string;
    priority: number;
  };
  
  // Display Settings
  displaySettings: {
    width?: string;
    height?: string;
    aspectRatio?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
    borderRadius?: string;
    shadow?: boolean;
  };
  
  // Animation
  animation?: {
    type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce' | 'custom';
    duration?: number;
    delay?: number;
    easing?: string;
  };
  
  // Targeting
  targeting?: {
    devices?: ('desktop' | 'tablet' | 'mobile')[];
    userRoles?: string[];
    userSegments?: string[];
    locations?: string[];
    languages?: string[];
    dateRange?: {
      start?: Date;
      end?: Date;
    };
    schedule?: {
      days?: number[]; // 0-6 (Sunday-Saturday)
      timeStart?: string;
      timeEnd?: string;
    };
  };
  
  // Status & Scheduling
  status: 'draft' | 'active' | 'scheduled' | 'paused' | 'expired' | 'archived';
  isActive: boolean;
  publishAt?: Date;
  expiresAt?: Date;
  
  // Group
  groupId?: mongoose.Types.ObjectId;
  sortOrder?: number;
  
  // Analytics
  analytics: {
    impressions: number;
    clicks: number;
    ctr?: number;
    uniqueViews?: number;
    conversions?: number;
    revenue?: number;
    lastViewedAt?: Date;
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    testId?: string;
    variantName?: string;
    trafficPercentage?: number;
    conversionGoal?: string;
  };
  
  // SEO
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  
  // Custom Settings
  customCSS?: string;
  customJS?: string;
  customAttributes?: Map<string, any>;
  
  // Author
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Tags
  tags?: string[];
  
  // Metadata
  metadata?: Map<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    name: {
      type: String,
      required: [true, 'Banner name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['promotional', 'announcement', 'product', 'category', 'seasonal', 'custom'],
      default: 'promotional'
    },
    desktopImage: {
      type: String,
      required: [true, 'Desktop image is required'],
      trim: true
    },
    tabletImage: { type: String, trim: true },
    mobileImage: { type: String, trim: true },
    altText: {
      type: String,
      required: [true, 'Alt text is required'],
      trim: true
    },
    videoUrl: { type: String, trim: true },
    videoThumbnail: { type: String, trim: true },
    
    link: {
      url: { type: String, trim: true },
      target: {
        type: String,
        enum: ['_self', '_blank', '_parent', '_top'],
        default: '_self'
      },
      title: { type: String, trim: true },
      nofollow: { type: Boolean, default: false }
    },
    
    position: {
      page: { type: String, required: true },
      location: {
        type: String,
        required: true,
        enum: ['top', 'middle', 'bottom', 'sidebar', 'header', 'footer', 'popup', 'custom']
      },
      zone: { type: String },
      priority: { type: Number, default: 0 }
    },
    
    displaySettings: {
      width: { type: String },
      height: { type: String },
      aspectRatio: { type: String },
      objectFit: {
        type: String,
        enum: ['cover', 'contain', 'fill', 'scale-down'],
        default: 'cover'
      },
      borderRadius: { type: String },
      shadow: { type: Boolean, default: false }
    },
    
    animation: {
      type: {
        type: String,
        enum: ['none', 'fade', 'slide', 'zoom', 'bounce', 'custom'],
        default: 'none'
      },
      duration: { type: Number },
      delay: { type: Number },
      easing: { type: String }
    },
    
    targeting: {
      devices: [{
        type: String,
        enum: ['desktop', 'tablet', 'mobile']
      }],
      userRoles: [{ type: String }],
      userSegments: [{ type: String }],
      locations: [{ type: String }],
      languages: [{ type: String }],
      dateRange: {
        start: { type: Date },
        end: { type: Date }
      },
      schedule: {
        days: [{ type: Number, min: 0, max: 6 }],
        timeStart: { type: String },
        timeEnd: { type: String }
      }
    },
    
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'scheduled', 'paused', 'expired', 'archived'],
      default: 'draft'
    },
    isActive: { type: Boolean, default: false },
    publishAt: { type: Date },
    expiresAt: { type: Date },
    
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'BannerGroup'
    },
    sortOrder: { type: Number, default: 0 },
    
    analytics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      ctr: { type: Number },
      uniqueViews: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      lastViewedAt: { type: Date }
    },
    
    abTest: {
      enabled: { type: Boolean, default: false },
      testId: { type: String },
      variantName: { type: String },
      trafficPercentage: { type: Number, min: 0, max: 100 },
      conversionGoal: { type: String }
    },
    
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }]
    },
    
    customCSS: { type: String },
    customJS: { type: String },
    customAttributes: {
      type: Map,
      of: Schema.Types.Mixed
    },
    
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
bannerSchema.index({ status: 1, isActive: 1 });
bannerSchema.index({ 'position.page': 1, 'position.location': 1, 'position.priority': -1 });
bannerSchema.index({ type: 1 });
bannerSchema.index({ groupId: 1, sortOrder: 1 });
bannerSchema.index({ publishAt: 1, expiresAt: 1 });
bannerSchema.index({ tags: 1 });
bannerSchema.index({ createdAt: -1 });

// Virtual for active status based on scheduling
bannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  const isPublished = !this.publishAt || this.publishAt <= now;
  const notExpired = !this.expiresAt || this.expiresAt > now;
  return this.isActive && isPublished && notExpired;
});

const Banner = mongoose.model<IBanner>('Banner', bannerSchema);

export default Banner;

import mongoose, { Document, Schema } from 'mongoose';

export interface IFeaturedContent extends Document {
  name: string;
  description?: string;
  
  // Content Type
  contentType: 'product' | 'category' | 'collection' | 'brand' | 'blog' | 'custom';
  
  // Referenced Content
  productId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  collectionId?: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  blogId?: mongoose.Types.ObjectId;
  customContent?: {
    title: string;
    description?: string;
    image?: string;
    link?: string;
    cta?: {
      text: string;
      link: string;
      style?: 'primary' | 'secondary' | 'outline' | 'text';
    };
  };
  
  // Display Settings
  displaySettings: {
    placement: 'homepage' | 'category-page' | 'product-page' | 'blog' | 'sidebar' | 'footer' | 'custom';
    section?: string; // specific section on the page
    position: number; // order within section
    layout?: 'card' | 'banner' | 'grid' | 'list' | 'carousel' | 'custom';
    size?: 'small' | 'medium' | 'large' | 'full-width';
    showImage?: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
    showPrice?: boolean; // for products
    showCTA?: boolean;
  };
  
  // Targeting Rules
  targeting: {
    devices?: ('desktop' | 'tablet' | 'mobile')[];
    userRoles?: ('guest' | 'customer' | 'premium' | 'vip')[];
    userSegments?: string[];
    locations?: string[]; // countries/regions
    languages?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    schedule?: {
      daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
      timeStart?: string; // HH:mm format
      timeEnd?: string; // HH:mm format
    };
    minCartValue?: number;
    maxCartValue?: number;
    visitCount?: {
      min?: number;
      max?: number;
    };
  };
  
  // Status & Scheduling
  status: 'draft' | 'active' | 'scheduled' | 'paused' | 'expired' | 'archived';
  isActive: boolean;
  publishAt?: Date;
  expiresAt?: Date;
  
  // Priority & Weight
  priority: number; // higher number = higher priority
  weight?: number; // for weighted random selection
  
  // Analytics
  analytics: {
    impressions: number;
    clicks: number;
    ctr: number; // click-through rate
    conversions: number;
    revenue: number;
    lastImpressionAt?: Date;
    lastClickAt?: Date;
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    testId?: string;
    variantName?: string;
    trafficPercentage?: number;
    conversionGoal?: 'clicks' | 'purchases' | 'signups' | 'views';
  };
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  
  // Custom Styling
  customCSS?: string;
  customJS?: string;
  customAttributes?: Map<string, any>;
  
  // Tags & Categories
  tags?: string[];
  categories?: string[];
  
  // Author & Timestamps
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Metadata
  metadata?: Map<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const featuredContentSchema = new Schema<IFeaturedContent>(
  {
    name: {
      type: String,
      required: [true, 'Featured content name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    contentType: {
      type: String,
      required: [true, 'Content type is required'],
      enum: ['product', 'category', 'collection', 'brand', 'blog', 'custom']
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Collection'
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand'
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: 'Blog'
    },
    customContent: {
      title: { type: String, trim: true, maxlength: 200 },
      description: { type: String, trim: true, maxlength: 500 },
      image: { type: String, trim: true },
      link: { type: String, trim: true },
      cta: {
        text: { type: String, trim: true, maxlength: 50 },
        link: { type: String, trim: true },
        style: {
          type: String,
          enum: ['primary', 'secondary', 'outline', 'text'],
          default: 'primary'
        }
      }
    },
    displaySettings: {
      placement: {
        type: String,
        required: true,
        enum: ['homepage', 'category-page', 'product-page', 'blog', 'sidebar', 'footer', 'custom'],
        default: 'homepage'
      },
      section: { type: String, trim: true },
      position: { type: Number, required: true, default: 0 },
      layout: {
        type: String,
        enum: ['card', 'banner', 'grid', 'list', 'carousel', 'custom'],
        default: 'card'
      },
      size: {
        type: String,
        enum: ['small', 'medium', 'large', 'full-width'],
        default: 'medium'
      },
      showImage: { type: Boolean, default: true },
      showTitle: { type: Boolean, default: true },
      showDescription: { type: Boolean, default: true },
      showPrice: { type: Boolean, default: true },
      showCTA: { type: Boolean, default: true }
    },
    targeting: {
      devices: [{
        type: String,
        enum: ['desktop', 'tablet', 'mobile']
      }],
      userRoles: [{
        type: String,
        enum: ['guest', 'customer', 'premium', 'vip']
      }],
      userSegments: [{ type: String, trim: true }],
      locations: [{ type: String, trim: true }],
      languages: [{ type: String, trim: true, lowercase: true }],
      dateRange: {
        start: { type: Date },
        end: { type: Date }
      },
      schedule: {
        daysOfWeek: [{ type: Number, min: 0, max: 6 }],
        timeStart: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
        timeEnd: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }
      },
      minCartValue: { type: Number, min: 0 },
      maxCartValue: { type: Number, min: 0 },
      visitCount: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
      }
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'scheduled', 'paused', 'expired', 'archived'],
      default: 'draft'
    },
    isActive: {
      type: Boolean,
      default: false
    },
    publishAt: { type: Date },
    expiresAt: { type: Date },
    priority: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    weight: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    analytics: {
      impressions: { type: Number, default: 0, min: 0 },
      clicks: { type: Number, default: 0, min: 0 },
      ctr: { type: Number, default: 0, min: 0, max: 100 },
      conversions: { type: Number, default: 0, min: 0 },
      revenue: { type: Number, default: 0, min: 0 },
      lastImpressionAt: { type: Date },
      lastClickAt: { type: Date }
    },
    abTest: {
      enabled: { type: Boolean, default: false },
      testId: { type: String, trim: true },
      variantName: { type: String, trim: true },
      trafficPercentage: { type: Number, min: 0, max: 100 },
      conversionGoal: {
        type: String,
        enum: ['clicks', 'purchases', 'signups', 'views']
      }
    },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 70 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      metaKeywords: [{ type: String, trim: true }]
    },
    customCSS: { type: String },
    customJS: { type: String },
    customAttributes: {
      type: Map,
      of: Schema.Types.Mixed
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    categories: [{ type: String, trim: true }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
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
featuredContentSchema.index({ contentType: 1 });
featuredContentSchema.index({ status: 1, isActive: 1 });
featuredContentSchema.index({ 'displaySettings.placement': 1, 'displaySettings.position': 1 });
featuredContentSchema.index({ priority: -1 });
featuredContentSchema.index({ publishAt: 1, expiresAt: 1 });
featuredContentSchema.index({ tags: 1 });
featuredContentSchema.index({ categories: 1 });
featuredContentSchema.index({ 'analytics.ctr': -1 });
featuredContentSchema.index({ 'analytics.conversions': -1 });
featuredContentSchema.index({ createdAt: -1 });

// Virtual for checking if content is currently active
featuredContentSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  const isPublished = !this.publishAt || this.publishAt <= now;
  const notExpired = !this.expiresAt || this.expiresAt > now;
  return this.isActive && this.status === 'active' && isPublished && notExpired;
});

// Virtual to populate referenced content
featuredContentSchema.virtual('content', {
  refPath: 'contentType',
  localField: function() {
    switch (this.contentType) {
      case 'product': return 'productId';
      case 'category': return 'categoryId';
      case 'collection': return 'collectionId';
      case 'brand': return 'brandId';
      case 'blog': return 'blogId';
      default: return 'productId'; // Default fallback
    }
  },
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
featuredContentSchema.pre('save', function(next) {
  // Auto-publish if status is active and publishAt is not set
  if (this.status === 'active' && !this.publishAt) {
    this.publishAt = new Date();
  }
  
  // Calculate CTR
  if (this.analytics.impressions > 0) {
    this.analytics.ctr = (this.analytics.clicks / this.analytics.impressions) * 100;
  }
  
  // Validate that content reference exists based on contentType
  if (this.contentType !== 'custom') {
    const contentIdField = `${this.contentType}Id`;
    if (!this.get(contentIdField)) {
      return next(new Error(`${contentIdField} is required for contentType: ${this.contentType}`));
    }
  } else {
    if (!this.customContent || !this.customContent.title) {
      return next(new Error('customContent.title is required for contentType: custom'));
    }
  }
  
  next();
});

// Static method to get active content by placement
featuredContentSchema.statics.getActiveByPlacement = async function(
  placement: string,
  options: {
    device?: string;
    userRole?: string;
    location?: string;
    language?: string;
    section?: string;
  } = {}
) {
  const now = new Date();
  
  const query: any = {
    'displaySettings.placement': placement,
    isActive: true,
    status: 'active',
    $and: [
      { $or: [{ publishAt: { $lte: now } }, { publishAt: { $exists: false } }] },
      { $or: [{ expiresAt: { $gt: now } }, { expiresAt: { $exists: false } }] }
    ]
  };
  
  // Add section filter if provided
  if (options.section) {
    query['displaySettings.section'] = options.section;
  }
  
  // Add targeting filters
  if (options.device) {
    query.$and.push({
      $or: [
        { 'targeting.devices': { $size: 0 } },
        { 'targeting.devices': options.device }
      ]
    });
  }
  
  if (options.userRole) {
    query.$and.push({
      $or: [
        { 'targeting.userRoles': { $size: 0 } },
        { 'targeting.userRoles': options.userRole }
      ]
    });
  }
  
  if (options.location) {
    query.$and.push({
      $or: [
        { 'targeting.locations': { $size: 0 } },
        { 'targeting.locations': options.location }
      ]
    });
  }
  
  if (options.language) {
    query.$and.push({
      $or: [
        { 'targeting.languages': { $size: 0 } },
        { 'targeting.languages': options.language }
      ]
    });
  }
  
  return this.find(query)
    .sort({ priority: -1, 'displaySettings.position': 1 })
    .populate('productId')
    .populate('categoryId')
    .populate('collectionId')
    .populate('brandId')
    .populate('blogId');
};

const FeaturedContent = mongoose.model<IFeaturedContent>('FeaturedContent', featuredContentSchema);

export default FeaturedContent;

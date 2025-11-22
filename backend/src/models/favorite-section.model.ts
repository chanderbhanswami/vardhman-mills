import mongoose, { Document, Schema } from 'mongoose';

export interface IFavoriteSection extends Document {
  // Basic Info
  title: string;
  description?: string;
  slug: string;
  
  // Display Configuration
  displayType: 'grid' | 'list' | 'carousel' | 'masonry';
  itemsPerRow: number;
  maxItems: number;
  showTitle: boolean;
  showDescription: boolean;
  showViewAll: boolean;
  
  // Styling & Layout
  layout: {
    containerWidth: 'full' | 'container' | 'narrow';
    padding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    margin: {
      top: number;
      bottom: number;
    };
    backgroundColor?: string;
    backgroundImage?: string;
    borderRadius: number;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
  
  // Typography
  typography: {
    titleFont: string;
    titleSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    titleWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    titleColor: string;
    descriptionFont: string;
    descriptionSize: 'xs' | 'sm' | 'base' | 'lg';
    descriptionColor: string;
  };
  
  // Content Configuration
  contentType: 'products' | 'categories' | 'brands' | 'collections' | 'custom';
  contentIds: mongoose.Types.ObjectId[];
  autoUpdate: boolean;
  
  // Filtering & Sorting
  filters: {
    categories?: mongoose.Types.ObjectId[];
    brands?: mongoose.Types.ObjectId[];
    priceRange?: {
      min: number;
      max: number;
    };
    tags?: string[];
    inStock?: boolean;
    featured?: boolean;
    onSale?: boolean;
  };
  
  sortBy: 'popularity' | 'newest' | 'price-low' | 'price-high' | 'rating' | 'name' | 'random';
  
  // Animation & Effects
  animation: {
    entrance: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';
    hover: 'none' | 'scale' | 'lift' | 'glow' | 'rotate';
    loading: 'skeleton' | 'spinner' | 'shimmer' | 'pulse';
    stagger: boolean;
    duration: number;
  };
  
  // Responsive Settings
  responsive: {
    mobile: {
      itemsPerRow: number;
      maxItems: number;
      displayType: 'grid' | 'list' | 'carousel';
    };
    tablet: {
      itemsPerRow: number;
      maxItems: number;
      displayType: 'grid' | 'list' | 'carousel';
    };
    desktop: {
      itemsPerRow: number;
      maxItems: number;
      displayType: 'grid' | 'list' | 'carousel' | 'masonry';
    };
  };
  
  // SEO & Meta
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  
  // Analytics & Tracking
  tracking: {
    enabled: boolean;
    events: string[];
    customProperties?: Record<string, any>;
    impressions: number;
    clicks: number;
    clickThroughRate: number;
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: Array<{
      id: string;
      name: string;
      weight: number;
      impressions: number;
      clicks: number;
      conversions: number;
      config: Record<string, any>;
    }>;
    winnerVariant?: string;
    testStartDate?: Date;
    testEndDate?: Date;
  };
  
  // Scheduling
  schedule?: {
    startDate?: Date;
    endDate?: Date;
    timezone: string;
    recurrence?: {
      type: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endAfter?: number;
    };
  };
  
  // Personalization
  personalization: {
    enabled: boolean;
    rules: Array<{
      condition: string;
      action: string;
      value: any;
    }>;
    segmentTargeting?: string[];
  };
  
  // Status & Visibility
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  visibility: 'public' | 'private' | 'members-only';
  priority: number;
  displayOrder: number;
  
  // Location/Placement
  placement: {
    page: 'homepage' | 'category' | 'product' | 'collection' | 'custom';
    position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'custom';
    customUrl?: string;
  };
  
  // Metadata
  metadata: Record<string, any>;
  tags: string[];
  version: number;
  
  // Timestamps
  publishedAt?: Date;
  archivedAt?: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
  
  // Relations
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSectionSchema = new Schema<IFavoriteSection>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    displayType: {
      type: String,
      enum: ['grid', 'list', 'carousel', 'masonry'],
      default: 'grid'
    },
    itemsPerRow: {
      type: Number,
      default: 4,
      min: [1, 'Items per row must be at least 1'],
      max: [12, 'Items per row cannot exceed 12']
    },
    maxItems: {
      type: Number,
      default: 12,
      min: [1, 'Max items must be at least 1'],
      max: [100, 'Max items cannot exceed 100']
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    showDescription: {
      type: Boolean,
      default: true
    },
    showViewAll: {
      type: Boolean,
      default: true
    },
    layout: {
      containerWidth: {
        type: String,
        enum: ['full', 'container', 'narrow'],
        default: 'container'
      },
      padding: {
        top: { type: Number, default: 16 },
        bottom: { type: Number, default: 16 },
        left: { type: Number, default: 16 },
        right: { type: Number, default: 16 }
      },
      margin: {
        top: { type: Number, default: 0 },
        bottom: { type: Number, default: 0 }
      },
      backgroundColor: {
        type: String,
        trim: true
      },
      backgroundImage: {
        type: String,
        trim: true
      },
      borderRadius: {
        type: Number,
        default: 0,
        min: [0, 'Border radius cannot be negative']
      },
      shadow: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'xl'],
        default: 'none'
      }
    },
    typography: {
      titleFont: {
        type: String,
        default: 'Inter',
        trim: true
      },
      titleSize: {
        type: String,
        enum: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'],
        default: '2xl'
      },
      titleWeight: {
        type: String,
        enum: ['normal', 'medium', 'semibold', 'bold'],
        default: 'bold'
      },
      titleColor: {
        type: String,
        default: '#000000',
        trim: true
      },
      descriptionFont: {
        type: String,
        default: 'Inter',
        trim: true
      },
      descriptionSize: {
        type: String,
        enum: ['xs', 'sm', 'base', 'lg'],
        default: 'base'
      },
      descriptionColor: {
        type: String,
        default: '#666666',
        trim: true
      }
    },
    contentType: {
      type: String,
      enum: ['products', 'categories', 'brands', 'collections', 'custom'],
      required: [true, 'Content type is required'],
      index: true
    },
    contentIds: [{
      type: Schema.Types.ObjectId,
      refPath: 'contentType'
    }],
    autoUpdate: {
      type: Boolean,
      default: false
    },
    filters: {
      categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
      }],
      brands: [{
        type: Schema.Types.ObjectId,
        ref: 'Brand'
      }],
      priceRange: {
        min: {
          type: Number,
          min: [0, 'Min price cannot be negative']
        },
        max: {
          type: Number,
          min: [0, 'Max price cannot be negative']
        }
      },
      tags: [{
        type: String,
        trim: true,
        lowercase: true
      }],
      inStock: {
        type: Boolean
      },
      featured: {
        type: Boolean
      },
      onSale: {
        type: Boolean
      }
    },
    sortBy: {
      type: String,
      enum: ['popularity', 'newest', 'price-low', 'price-high', 'rating', 'name', 'random'],
      default: 'popularity'
    },
    animation: {
      entrance: {
        type: String,
        enum: ['none', 'fade', 'slide', 'zoom', 'bounce'],
        default: 'fade'
      },
      hover: {
        type: String,
        enum: ['none', 'scale', 'lift', 'glow', 'rotate'],
        default: 'scale'
      },
      loading: {
        type: String,
        enum: ['skeleton', 'spinner', 'shimmer', 'pulse'],
        default: 'skeleton'
      },
      stagger: {
        type: Boolean,
        default: true
      },
      duration: {
        type: Number,
        default: 300,
        min: [0, 'Duration cannot be negative']
      }
    },
    responsive: {
      mobile: {
        itemsPerRow: {
          type: Number,
          default: 1,
          min: [1, 'Items per row must be at least 1']
        },
        maxItems: {
          type: Number,
          default: 6,
          min: [1, 'Max items must be at least 1']
        },
        displayType: {
          type: String,
          enum: ['grid', 'list', 'carousel'],
          default: 'list'
        }
      },
      tablet: {
        itemsPerRow: {
          type: Number,
          default: 2,
          min: [1, 'Items per row must be at least 1']
        },
        maxItems: {
          type: Number,
          default: 8,
          min: [1, 'Max items must be at least 1']
        },
        displayType: {
          type: String,
          enum: ['grid', 'list', 'carousel'],
          default: 'grid'
        }
      },
      desktop: {
        itemsPerRow: {
          type: Number,
          default: 4,
          min: [1, 'Items per row must be at least 1']
        },
        maxItems: {
          type: Number,
          default: 12,
          min: [1, 'Max items must be at least 1']
        },
        displayType: {
          type: String,
          enum: ['grid', 'list', 'carousel', 'masonry'],
          default: 'grid'
        }
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
      ogTitle: {
        type: String,
        trim: true
      },
      ogDescription: {
        type: String,
        trim: true
      },
      ogImage: {
        type: String,
        trim: true
      }
    },
    tracking: {
      enabled: {
        type: Boolean,
        default: true
      },
      events: [{
        type: String,
        trim: true
      }],
      customProperties: {
        type: Schema.Types.Mixed
      },
      impressions: {
        type: Number,
        default: 0,
        min: [0, 'Impressions cannot be negative']
      },
      clicks: {
        type: Number,
        default: 0,
        min: [0, 'Clicks cannot be negative']
      },
      clickThroughRate: {
        type: Number,
        default: 0,
        min: [0, 'CTR cannot be negative'],
        max: [100, 'CTR cannot exceed 100']
      }
    },
    abTest: {
      enabled: {
        type: Boolean,
        default: false
      },
      variants: [{
        id: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        weight: {
          type: Number,
          required: true,
          min: [0, 'Weight cannot be negative'],
          max: [100, 'Weight cannot exceed 100']
        },
        impressions: {
          type: Number,
          default: 0
        },
        clicks: {
          type: Number,
          default: 0
        },
        conversions: {
          type: Number,
          default: 0
        },
        config: {
          type: Schema.Types.Mixed
        }
      }],
      winnerVariant: {
        type: String
      },
      testStartDate: {
        type: Date
      },
      testEndDate: {
        type: Date
      }
    },
    schedule: {
      startDate: {
        type: Date,
        index: true
      },
      endDate: {
        type: Date,
        index: true
      },
      timezone: {
        type: String,
        default: 'UTC'
      },
      recurrence: {
        type: {
          type: String,
          enum: ['daily', 'weekly', 'monthly']
        },
        interval: {
          type: Number,
          min: [1, 'Interval must be at least 1']
        },
        endAfter: {
          type: Number,
          min: [1, 'End after must be at least 1']
        }
      }
    },
    personalization: {
      enabled: {
        type: Boolean,
        default: false
      },
      rules: [{
        condition: {
          type: String,
          required: true
        },
        action: {
          type: String,
          required: true
        },
        value: {
          type: Schema.Types.Mixed
        }
      }],
      segmentTargeting: [{
        type: String,
        trim: true
      }]
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'draft',
      index: true
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'members-only'],
      default: 'public',
      index: true
    },
    priority: {
      type: Number,
      default: 0,
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    placement: {
      page: {
        type: String,
        enum: ['homepage', 'category', 'product', 'collection', 'custom'],
        default: 'homepage',
        index: true
      },
      position: {
        type: String,
        enum: ['top', 'middle', 'bottom', 'sidebar', 'custom'],
        default: 'middle'
      },
      customUrl: {
        type: String,
        trim: true
      }
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    version: {
      type: Number,
      default: 1
    },
    publishedAt: {
      type: Date,
      index: true
    },
    archivedAt: {
      type: Date
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
favoriteSectionSchema.index({ slug: 1, status: 1 });
favoriteSectionSchema.index({ status: 1, visibility: 1, priority: -1 });
favoriteSectionSchema.index({ 'placement.page': 1, displayOrder: 1 });
favoriteSectionSchema.index({ contentType: 1, status: 1 });
favoriteSectionSchema.index({ tags: 1 });
favoriteSectionSchema.index({ createdAt: -1 });

// Virtuals
favoriteSectionSchema.virtual('isActive').get(function(this: IFavoriteSection) {
  const now = new Date();
  
  if (this.status !== 'published') return false;
  
  if (this.schedule?.startDate && now < this.schedule.startDate) return false;
  if (this.schedule?.endDate && now > this.schedule.endDate) return false;
  
  return true;
});

favoriteSectionSchema.virtual('isScheduled').get(function(this: IFavoriteSection) {
  return this.status === 'scheduled' && !!this.schedule?.startDate;
});

// Pre-save middleware
favoriteSectionSchema.pre('save', function(this: IFavoriteSection, next) {
  // Calculate CTR
  if (this.tracking.impressions > 0) {
    this.tracking.clickThroughRate = (this.tracking.clicks / this.tracking.impressions) * 100;
  }
  
  // Auto-publish if scheduled time has come
  if (this.status === 'scheduled' && this.schedule?.startDate) {
    const now = new Date();
    if (now >= this.schedule.startDate) {
      this.status = 'published';
      this.publishedAt = now;
    }
  }
  
  // Auto-archive if end date has passed
  if (this.status === 'published' && this.schedule?.endDate) {
    const now = new Date();
    if (now > this.schedule.endDate) {
      this.status = 'archived';
      this.archivedAt = now;
    }
  }
  
  // Increment version on update
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  
  next();
});

// Static methods
favoriteSectionSchema.statics.getPublishedSections = function(page: string = 'homepage', limit: number = 10) {
  const now = new Date();
  return this.find({
    status: 'published',
    visibility: 'public',
    'placement.page': page,
    $or: [
      { 'schedule.startDate': { $exists: false } },
      { 'schedule.startDate': { $lte: now } }
    ],
    $and: [
      {
        $or: [
          { 'schedule.endDate': { $exists: false } },
          { 'schedule.endDate': { $gte: now } }
        ]
      }
    ]
  })
  .sort({ priority: -1, displayOrder: 1 })
  .limit(limit)
  .populate('createdBy', 'name email')
  .populate('contentIds');
};

const FavoriteSection = mongoose.model<IFavoriteSection>('FavoriteSection', favoriteSectionSchema);

export default FavoriteSection;

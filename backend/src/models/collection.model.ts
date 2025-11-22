import mongoose, { Document, Schema } from 'mongoose';

// Collection Rule Interface
export interface ICollectionRule {
  field: string; // product field to filter on (e.g., 'category', 'brand', 'price', 'tags')
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'in' | 'notIn' | 'exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ICollection extends Document {
  name: string;
  slug: string;
  description?: string;
  
  // Collection Type
  type: 'manual' | 'automatic' | 'hybrid';
  
  // Manual Products
  manualProducts?: mongoose.Types.ObjectId[];
  
  // Automatic Rules
  automaticRules?: {
    rules: ICollectionRule[];
    matchType: 'all' | 'any'; // Match all rules or any rule
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    maxProducts?: number;
  };
  
  // Featured Products (for hybrid)
  featuredProducts?: mongoose.Types.ObjectId[];
  
  // Display Settings
  display: {
    layout: 'grid' | 'list' | 'masonry' | 'slider';
    productsPerPage?: number;
    showFilters?: boolean;
    showSorting?: boolean;
    gridColumns?: number;
    mobileColumns?: number;
  };
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };
  
  // Media
  image?: string;
  banner?: string;
  
  // Status
  status: 'draft' | 'active' | 'scheduled' | 'archived';
  isActive: boolean;
  isFeatured?: boolean;
  
  // Scheduling
  publishAt?: Date;
  expiresAt?: Date;
  
  // Analytics
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    productsSold: number;
  };
  
  // Cache
  cachedProductCount?: number;
  cachedProducts?: mongoose.Types.ObjectId[];
  lastCacheUpdate?: Date;
  autoUpdateEnabled?: boolean;
  updateFrequency?: number; // in minutes
  
  // Display Order
  sortOrder?: number;
  
  // Author
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Tags & Categories
  tags?: string[];
  categories?: string[];
  
  // Metadata
  metadata?: Map<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const collectionRuleSchema = new Schema<ICollectionRule>({
  field: { 
    type: String, 
    required: true 
  },
  operator: {
    type: String,
    required: true,
    enum: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'in', 'notIn', 'exists']
  },
  value: { 
    type: Schema.Types.Mixed,
    required: true
  },
  logicalOperator: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'AND'
  }
});

const collectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['manual', 'automatic', 'hybrid'],
      default: 'manual'
    },
    manualProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    automaticRules: {
      rules: [collectionRuleSchema],
      matchType: {
        type: String,
        enum: ['all', 'any'],
        default: 'all'
      },
      sortBy: { type: String },
      sortOrder: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'desc'
      },
      maxProducts: { type: Number }
    },
    featuredProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    display: {
      layout: {
        type: String,
        enum: ['grid', 'list', 'masonry', 'slider'],
        default: 'grid'
      },
      productsPerPage: { type: Number, default: 12 },
      showFilters: { type: Boolean, default: true },
      showSorting: { type: Boolean, default: true },
      gridColumns: { type: Number, default: 4 },
      mobileColumns: { type: Number, default: 2 }
    },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 70 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      metaKeywords: [{ type: String, trim: true }],
      canonicalUrl: { type: String, trim: true },
      ogImage: { type: String, trim: true }
    },
    image: { type: String, trim: true },
    banner: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'scheduled', 'archived'],
      default: 'draft'
    },
    isActive: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    publishAt: { type: Date },
    expiresAt: { type: Date },
    analytics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      productsSold: { type: Number, default: 0 }
    },
    cachedProductCount: { type: Number },
    cachedProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    lastCacheUpdate: { type: Date },
    autoUpdateEnabled: { type: Boolean, default: true },
    updateFrequency: { type: Number, default: 60 }, // 60 minutes
    sortOrder: { type: Number, default: 0 },
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
    categories: [{ type: String, trim: true }],
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
collectionSchema.index({ slug: 1 });
collectionSchema.index({ status: 1, isActive: 1 });
collectionSchema.index({ type: 1 });
collectionSchema.index({ isFeatured: 1, sortOrder: 1 });
collectionSchema.index({ tags: 1 });
collectionSchema.index({ categories: 1 });
collectionSchema.index({ createdAt: -1 });

// Auto-generate slug from name
collectionSchema.pre('save', async function(next) {
  if (this.isNew && !this.slug) {
    const slugify = (text: string) => text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let baseSlug = slugify(this.name);
    let slug = baseSlug;
    let counter = 1;
    
    while (await mongoose.models.Collection.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Auto-publish if status is active and publishAt is not set
  if (this.status === 'active' && !this.publishAt) {
    this.publishAt = new Date();
  }
  
  next();
});

// Virtual for checking if collection is currently active
collectionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  const isPublished = !this.publishAt || this.publishAt <= now;
  const notExpired = !this.expiresAt || this.expiresAt > now;
  return this.isActive && isPublished && notExpired;
});

// Static method to build query from rules
collectionSchema.statics.buildQueryFromRules = function(rules: ICollectionRule[], matchType: 'all' | 'any') {
  const conditions: any[] = [];

  rules.forEach(rule => {
    const condition: any = {};

    switch (rule.operator) {
      case 'equals':
        condition[rule.field] = rule.value;
        break;
      case 'notEquals':
        condition[rule.field] = { $ne: rule.value };
        break;
      case 'contains':
        condition[rule.field] = { $regex: rule.value, $options: 'i' };
        break;
      case 'notContains':
        condition[rule.field] = { $not: { $regex: rule.value, $options: 'i' } };
        break;
      case 'greaterThan':
        condition[rule.field] = { $gt: rule.value };
        break;
      case 'lessThan':
        condition[rule.field] = { $lt: rule.value };
        break;
      case 'greaterThanOrEqual':
        condition[rule.field] = { $gte: rule.value };
        break;
      case 'lessThanOrEqual':
        condition[rule.field] = { $lte: rule.value };
        break;
      case 'in':
        condition[rule.field] = { $in: Array.isArray(rule.value) ? rule.value : [rule.value] };
        break;
      case 'notIn':
        condition[rule.field] = { $nin: Array.isArray(rule.value) ? rule.value : [rule.value] };
        break;
      case 'exists':
        condition[rule.field] = { $exists: rule.value };
        break;
    }

    conditions.push(condition);
  });

  if (conditions.length === 0) {
    return {};
  }

  return matchType === 'all' 
    ? { $and: conditions }
    : { $or: conditions };
};

const Collection = mongoose.model<ICollection>('Collection', collectionSchema);

export default Collection;

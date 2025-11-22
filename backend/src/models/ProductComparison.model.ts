import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface IProductComparison extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  
  // Products being compared
  products: mongoose.Types.ObjectId[];
  
  // Comparison metadata
  name?: string;
  description?: string;
  category?: string;
  
  // Sharing
  isPublic: boolean;
  shareToken?: string;
  shareUrl?: string;
  
  // Analytics
  views: number;
  lastViewedAt?: Date;
  
  // Comparison results cache
  comparisonData?: {
    features: Array<{
      name: string;
      values: any[];
      type: 'text' | 'number' | 'boolean' | 'rating';
    }>;
    winner?: {
      productId: mongoose.Types.ObjectId;
      score: number;
      reasons: string[];
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  
  // Methods
  addProduct(productId: mongoose.Types.ObjectId): Promise<this>;
  removeProduct(productId: mongoose.Types.ObjectId): Promise<this>;
  generateShareToken(): Promise<this>;
  incrementViews(): Promise<this>;
  refreshComparisonData(): Promise<this>;
}

export interface IProductComparisonModel extends mongoose.Model<IProductComparison> {
  getUserComparisons(userId: mongoose.Types.ObjectId, options?: any): Promise<IProductComparison[]>;
  getPublicComparisons(options?: any): Promise<IProductComparison[]>;
  getByShareToken(token: string): Promise<IProductComparison | null>;
  cleanupExpired(): Promise<void>;
  getPopularComparisons(limit?: number): Promise<IProductComparison[]>;
}

// ==================== SCHEMA ====================

const productComparisonSchema = new Schema<IProductComparison>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    sessionId: {
      type: String,
      trim: true,
      index: true
    },
    
    // Products being compared
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }],
    
    // Comparison metadata
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
      type: String,
      trim: true,
      index: true
    },
    
    // Sharing
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    shareUrl: {
      type: String
    },
    
    // Analytics
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    lastViewedAt: {
      type: Date
    },
    
    // Comparison results cache
    comparisonData: {
      features: [{
        name: {
          type: String,
          required: true
        },
        values: [Schema.Types.Mixed],
        type: {
          type: String,
          enum: ['text', 'number', 'boolean', 'rating'],
          default: 'text'
        }
      }],
      winner: {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product'
        },
        score: {
          type: Number,
          min: 0,
          max: 100
        },
        reasons: [String]
      }
    },
    
    expiresAt: {
      type: Date,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

productComparisonSchema.index({ user: 1, createdAt: -1 });
productComparisonSchema.index({ sessionId: 1, createdAt: -1 });
productComparisonSchema.index({ isPublic: 1, views: -1 });
productComparisonSchema.index({ category: 1, isPublic: 1 });
productComparisonSchema.index({ expiresAt: 1 }); // TTL index
productComparisonSchema.index({ products: 1 });

// ==================== VALIDATION ====================

productComparisonSchema.path('products').validate(function(products: any[]) {
  return products && products.length >= 2 && products.length <= 10;
}, 'Must have between 2 and 10 products to compare');

// Ensure either user or sessionId is present
productComparisonSchema.pre('validate', function(next) {
  if (!this.user && !this.sessionId) {
    next(new Error('Either user or sessionId must be provided'));
  } else {
    next();
  }
});

// ==================== INSTANCE METHODS ====================

/**
 * Add product to comparison
 */
productComparisonSchema.methods.addProduct = async function(
  productId: mongoose.Types.ObjectId
): Promise<any> {
  if (this.products.length >= 10) {
    throw new Error('Cannot add more than 10 products to comparison');
  }
  
  // Check if product already exists
  const exists = this.products.some((p: any) => p.toString() === productId.toString());
  if (exists) {
    throw new Error('Product already in comparison');
  }
  
  this.products.push(productId);
  await this.save();
  return this as any;
};

/**
 * Remove product from comparison
 */
productComparisonSchema.methods.removeProduct = async function(
  productId: mongoose.Types.ObjectId
): Promise<any> {
  this.products = this.products.filter(
    (p: any) => p.toString() !== productId.toString()
  );
  
  if (this.products.length < 2) {
    throw new Error('Comparison must have at least 2 products');
  }
  
  await this.save();
  return this as any;
};

/**
 * Generate share token for public sharing
 */
productComparisonSchema.methods.generateShareToken = async function(): Promise<any> {
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(16).toString('hex');
  this.shareUrl = `/compare/shared/${this.shareToken}`;
  this.isPublic = true;
  await this.save();
  return this as any;
};

/**
 * Increment view count
 */
productComparisonSchema.methods.incrementViews = async function(): Promise<any> {
  this.views += 1;
  this.lastViewedAt = new Date();
  await this.save();
  return this as any;
};

/**
 * Refresh comparison data cache
 */
productComparisonSchema.methods.refreshComparisonData = async function(): Promise<any> {
  // This will be populated by the controller with actual product data
  // Here we just mark that it needs refresh
  this.comparisonData = undefined;
  await this.save();
  return this as any;
};

// ==================== STATIC METHODS ====================

/**
 * Get user comparisons with pagination
 */
productComparisonSchema.statics.getUserComparisons = async function(
  userId: mongoose.Types.ObjectId,
  options: any = {}
): Promise<IProductComparison[]> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;
  
  const query: any = { user: userId };
  
  if (options.category) {
    query.category = options.category;
  }
  
  return await this.find(query)
    .populate('products', 'name images price rating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

/**
 * Get public comparisons
 */
productComparisonSchema.statics.getPublicComparisons = async function(
  options: any = {}
): Promise<IProductComparison[]> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;
  
  const query: any = { isPublic: true };
  
  if (options.category) {
    query.category = options.category;
  }
  
  const sort = options.sortBy === 'popular' ? { views: -1 } : { createdAt: -1 };
  
  return await this.find(query)
    .populate('products', 'name images price rating')
    .populate('user', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

/**
 * Get comparison by share token
 */
productComparisonSchema.statics.getByShareToken = async function(
  token: string
): Promise<IProductComparison | null> {
  return await this.findOne({ shareToken: token, isPublic: true })
    .populate('products')
    .populate('user', 'name');
};

/**
 * Cleanup expired comparisons
 */
productComparisonSchema.statics.cleanupExpired = async function(): Promise<void> {
  const now = new Date();
  await this.deleteMany({
    expiresAt: { $lt: now }
  });
};

/**
 * Get popular comparisons
 */
productComparisonSchema.statics.getPopularComparisons = async function(
  limit: number = 10
): Promise<IProductComparison[]> {
  return await this.find({ isPublic: true })
    .populate('products', 'name images price rating')
    .populate('user', 'name')
    .sort({ views: -1 })
    .limit(limit)
    .lean();
};

// ==================== VIRTUALS ====================

/**
 * Get product count
 */
productComparisonSchema.virtual('productCount').get(function() {
  return this.products ? this.products.length : 0;
});

/**
 * Check if expired
 */
productComparisonSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// ==================== HOOKS ====================

/**
 * Set default expiry (30 days for anonymous, 90 days for users)
 */
productComparisonSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    const days = this.user ? 90 : 30;
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  next();
});

/**
 * Auto-detect category from products
 */
productComparisonSchema.pre('save', async function(next) {
  if (this.isNew && !this.category && this.products.length > 0) {
    try {
      const Product = mongoose.model('Product');
      const firstProduct = await Product.findById(this.products[0]);
      if (firstProduct && (firstProduct as any).category) {
        this.category = (firstProduct as any).category;
      }
    } catch (error) {
      // Continue without category
    }
  }
  next();
});

// ==================== MODEL ====================

const ProductComparison = mongoose.model<IProductComparison, IProductComparisonModel>(
  'ProductComparison',
  productComparisonSchema
);

export default ProductComparison;

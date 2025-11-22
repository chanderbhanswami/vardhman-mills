import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface ISearchQuery extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Query Information
  query: string;
  normalizedQuery: string; // Lowercase, trimmed
  
  // Search Context
  user?: mongoose.Types.ObjectId;
  sessionId?: string; // For anonymous users
  
  // Search Parameters
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    tags?: string[];
    rating?: number;
    inStock?: boolean;
    custom?: Record<string, any>;
  };
  
  // Results
  resultsCount: number;
  resultsFound: boolean;
  topResults?: mongoose.Types.ObjectId[]; // Top 5 product IDs
  
  // User Interaction
  clicked: boolean; // User clicked any result
  clickedResults?: mongoose.Types.ObjectId[]; // Which results clicked
  selectedResult?: mongoose.Types.ObjectId; // Final selected product
  timeToClick?: number; // Time in milliseconds
  
  // Context
  source: 'header' | 'page' | 'mobile' | 'api' | 'autocomplete';
  device: 'desktop' | 'tablet' | 'mobile';
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  
  // Timestamps
  searchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  recordClick(productId: mongoose.Types.ObjectId, timeToClick: number): Promise<this>;
  recordSelection(productId: mongoose.Types.ObjectId): Promise<this>;
}

export interface ISearchQueryModel extends mongoose.Model<ISearchQuery> {
  getPopularSearches(limit?: number, days?: number): Promise<any[]>;
  getTrendingSearches(days?: number): Promise<any[]>;
  getZeroResultSearches(limit?: number): Promise<ISearchQuery[]>;
  getRelatedSearches(query: string, limit?: number): Promise<string[]>;
  getSearchSuggestions(partial: string, limit?: number): Promise<string[]>;
  getSearchStats(startDate?: Date, endDate?: Date): Promise<any>;
  cleanupOldSearches(days: number): Promise<void>;
}

// ==================== SCHEMA ====================

const searchQuerySchema = new Schema<ISearchQuery>(
  {
    // Query Information
    query: {
      type: String,
      required: [true, 'Search query is required'],
      trim: true,
      maxlength: [200, 'Query cannot exceed 200 characters'],
      index: true
    },
    normalizedQuery: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    
    // Search Context
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true
    },
    sessionId: {
      type: String,
      sparse: true,
      index: true
    },
    
    // Search Parameters
    filters: {
      category: {
        type: String,
        sparse: true
      },
      minPrice: {
        type: Number,
        min: 0
      },
      maxPrice: {
        type: Number,
        min: 0
      },
      brands: [{
        type: String,
        trim: true
      }],
      tags: [{
        type: String,
        trim: true,
        lowercase: true
      }],
      rating: {
        type: Number,
        min: 0,
        max: 5
      },
      inStock: {
        type: Boolean
      },
      custom: {
        type: Schema.Types.Mixed
      }
    },
    
    // Results
    resultsCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    },
    resultsFound: {
      type: Boolean,
      default: false,
      index: true
    },
    topResults: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    
    // User Interaction
    clicked: {
      type: Boolean,
      default: false,
      index: true
    },
    clickedResults: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    selectedResult: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      sparse: true
    },
    timeToClick: {
      type: Number, // milliseconds
      min: 0
    },
    
    // Context
    source: {
      type: String,
      enum: ['header', 'page', 'mobile', 'api', 'autocomplete'],
      default: 'header',
      index: true
    },
    device: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile'],
      default: 'desktop',
      index: true
    },
    
    // Metadata
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    },
    referer: {
      type: String,
      trim: true
    },
    
    // Timestamps
    searchedAt: {
      type: Date,
      default: Date.now,
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

searchQuerySchema.index({ normalizedQuery: 1, searchedAt: -1 });
searchQuerySchema.index({ resultsFound: 1, searchedAt: -1 });
searchQuerySchema.index({ user: 1, searchedAt: -1 });
searchQuerySchema.index({ sessionId: 1, searchedAt: -1 });
searchQuerySchema.index({ clicked: 1, resultsFound: 1 });
searchQuerySchema.index({ searchedAt: -1 });

// ==================== INSTANCE METHODS ====================

/**
 * Record click on search result
 */
searchQuerySchema.methods.recordClick = async function(
  productId: mongoose.Types.ObjectId,
  timeToClick: number
): Promise<any> {
  this.clicked = true;
  
  if (!this.clickedResults) {
    this.clickedResults = [];
  }
  
  if (!this.clickedResults.includes(productId)) {
    this.clickedResults.push(productId);
  }
  
  if (!this.timeToClick) {
    this.timeToClick = timeToClick;
  }
  
  await this.save();
  return this as any;
};

/**
 * Record final product selection
 */
searchQuerySchema.methods.recordSelection = async function(
  productId: mongoose.Types.ObjectId
): Promise<any> {
  this.selectedResult = productId;
  await this.save();
  return this as any;
};

// ==================== STATIC METHODS ====================

/**
 * Get popular searches
 */
searchQuerySchema.statics.getPopularSearches = async function(
  limit: number = 10,
  days: number = 30
): Promise<any[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        searchedAt: { $gte: cutoffDate },
        resultsFound: true
      }
    },
    {
      $group: {
        _id: '$normalizedQuery',
        count: { $sum: 1 },
        originalQuery: { $first: '$query' },
        avgResults: { $avg: '$resultsCount' },
        clickRate: {
          $avg: { $cond: ['$clicked', 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        query: '$originalQuery',
        normalizedQuery: '$_id',
        searchCount: '$count',
        avgResults: { $round: ['$avgResults', 0] },
        clickRate: { $multiply: [{ $round: ['$clickRate', 2] }, 100] }
      }
    }
  ]);
};

/**
 * Get trending searches (growing in popularity)
 */
searchQuerySchema.statics.getTrendingSearches = async function(
  days: number = 7
): Promise<any[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const previousCutoff = new Date(cutoffDate);
  previousCutoff.setDate(previousCutoff.getDate() - days);
  
  const recent = await this.aggregate([
    {
      $match: {
        searchedAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: '$normalizedQuery',
        recentCount: { $sum: 1 },
        query: { $first: '$query' }
      }
    }
  ]);
  
  const previous = await this.aggregate([
    {
      $match: {
        searchedAt: { $gte: previousCutoff, $lt: cutoffDate }
      }
    },
    {
      $group: {
        _id: '$normalizedQuery',
        previousCount: { $sum: 1 }
      }
    }
  ]);
  
  const previousMap = new Map(previous.map((p: any) => [p._id, p.previousCount]));
  
  return recent
    .map((r: any) => {
      const prevCount = previousMap.get(r._id) || 0;
      const growth = prevCount > 0 ? ((r.recentCount - prevCount) / prevCount) * 100 : 100;
      
      return {
        query: r.query,
        normalizedQuery: r._id,
        recentCount: r.recentCount,
        previousCount: prevCount,
        growthRate: Math.round(growth)
      };
    })
    .filter((item: any) => item.growthRate > 0)
    .sort((a: any, b: any) => b.growthRate - a.growthRate)
    .slice(0, 10);
};

/**
 * Get searches with zero results
 */
searchQuerySchema.statics.getZeroResultSearches = async function(
  limit: number = 20
): Promise<ISearchQuery[]> {
  return await this.find({
    resultsFound: false,
    resultsCount: 0
  })
    .sort({ searchedAt: -1 })
    .limit(limit)
    .select('query normalizedQuery filters searchedAt')
    .lean();
};

/**
 * Get related searches
 */
searchQuerySchema.statics.getRelatedSearches = async function(
  query: string,
  limit: number = 5
): Promise<string[]> {
  const normalized = query.toLowerCase().trim();
  
  // Find searches that share words with this query
  const words = normalized.split(/\s+/);
  const regex = words.map(w => `(?=.*${w})`).join('');
  
  const related = await this.aggregate([
    {
      $match: {
        normalizedQuery: { 
          $regex: regex, 
          $options: 'i',
          $ne: normalized
        },
        resultsFound: true
      }
    },
    {
      $group: {
        _id: '$normalizedQuery',
        count: { $sum: 1 },
        query: { $first: '$query' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  return related.map((r: any) => r.query);
};

/**
 * Get search suggestions (autocomplete)
 */
searchQuerySchema.statics.getSearchSuggestions = async function(
  partial: string,
  limit: number = 10
): Promise<string[]> {
  const normalized = partial.toLowerCase().trim();
  
  if (normalized.length < 2) {
    return [];
  }
  
  const suggestions = await this.aggregate([
    {
      $match: {
        normalizedQuery: { $regex: `^${normalized}`, $options: 'i' },
        resultsFound: true
      }
    },
    {
      $group: {
        _id: '$normalizedQuery',
        count: { $sum: 1 },
        query: { $first: '$query' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  return suggestions.map((s: any) => s.query);
};

/**
 * Get comprehensive search statistics
 */
searchQuerySchema.statics.getSearchStats = async function(
  startDate?: Date,
  endDate?: Date
): Promise<any> {
  const matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.searchedAt = {};
    if (startDate) matchStage.searchedAt.$gte = startDate;
    if (endDate) matchStage.searchedAt.$lte = endDate;
  }
  
  const [overview, bySource, byDevice, timeDistribution] = await Promise.all([
    // Overview stats
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          uniqueQueries: { $addToSet: '$normalizedQuery' },
          withResults: {
            $sum: { $cond: ['$resultsFound', 1, 0] }
          },
          withClicks: {
            $sum: { $cond: ['$clicked', 1, 0] }
          },
          avgResults: { $avg: '$resultsCount' },
          avgTimeToClick: { $avg: '$timeToClick' }
        }
      },
      {
        $project: {
          _id: 0,
          totalSearches: 1,
          uniqueQueries: { $size: '$uniqueQueries' },
          withResults: 1,
          withClicks: 1,
          zeroResults: { $subtract: ['$totalSearches', '$withResults'] },
          avgResults: { $round: ['$avgResults', 1] },
          avgTimeToClick: { $round: ['$avgTimeToClick', 0] },
          successRate: {
            $multiply: [
              { $divide: ['$withResults', '$totalSearches'] },
              100
            ]
          },
          clickRate: {
            $multiply: [
              { $divide: ['$withClicks', '$totalSearches'] },
              100
            ]
          }
        }
      }
    ]),
    
    // By source
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]),
    
    // By device
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]),
    
    // Time distribution (by hour)
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $hour: '$searchedAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])
  ]);
  
  return {
    overview: overview[0] || {},
    bySource,
    byDevice,
    timeDistribution
  };
};

/**
 * Cleanup old search queries
 */
searchQuerySchema.statics.cleanupOldSearches = async function(
  days: number = 90
): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  await this.deleteMany({
    searchedAt: { $lt: cutoffDate }
  });
};

// ==================== VIRTUALS ====================

/**
 * Get click-through rate
 */
searchQuerySchema.virtual('clickThroughRate').get(function() {
  return this.resultsFound && this.clicked ? 100 : 0;
});

/**
 * Check if search was successful
 */
searchQuerySchema.virtual('wasSuccessful').get(function() {
  return this.resultsFound && this.resultsCount > 0;
});

// ==================== HOOKS ====================

/**
 * Set normalized query before save
 */
searchQuerySchema.pre('save', function(next) {
  if (this.isModified('query')) {
    this.normalizedQuery = this.query.toLowerCase().trim();
  }
  next();
});

/**
 * Set resultsFound based on resultsCount
 */
searchQuerySchema.pre('save', function(next) {
  if (this.isModified('resultsCount')) {
    this.resultsFound = this.resultsCount > 0;
  }
  next();
});

// ==================== MODEL ====================

const SearchQuery = mongoose.model<ISearchQuery, ISearchQueryModel>(
  'SearchQuery',
  searchQuerySchema
);

export default SearchQuery;

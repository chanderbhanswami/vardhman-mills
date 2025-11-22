
import mongoose, { Document, Schema, Model } from 'mongoose';

// ==================== INTERFACES ====================

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  
  // Media attachments
  images?: string[];
  videos?: string[];
  
  // Verification & Status
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Engagement metrics
  helpfulVotes: number;
  unhelpfulVotes: number;
  votedBy: {
    user: mongoose.Types.ObjectId;
    vote: 'helpful' | 'unhelpful';
    votedAt: Date;
  }[];
  
  // Response from seller/admin
  response?: {
    text: string;
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
  };
  
  // Flagging & moderation
  isFlagged: boolean;
  flaggedBy: mongoose.Types.ObjectId[];
  flagReason?: string;
  
  // Additional metadata
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
  
  // Soft delete
  isActive: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  addVote(userId: mongoose.Types.ObjectId, voteType: 'helpful' | 'unhelpful'): Promise<this>;
  removeVote(userId: mongoose.Types.ObjectId): Promise<this>;
  flagReview(userId: mongoose.Types.ObjectId, reason: string): Promise<this>;
  addResponse(text: string, adminId: mongoose.Types.ObjectId): Promise<this>;
  approve(adminId: mongoose.Types.ObjectId): Promise<this>;
  reject(adminId: mongoose.Types.ObjectId, reason: string): Promise<this>;
}

export interface IReviewModel extends Model<IReview> {
  calcAverageRating(productId: mongoose.Types.ObjectId): Promise<void>;
  getProductReviews(productId: mongoose.Types.ObjectId, options?: any): Promise<IReview[]>;
  getUserReviews(userId: mongoose.Types.ObjectId, options?: any): Promise<IReview[]>;
  getTopReviews(productId: mongoose.Types.ObjectId, limit?: number): Promise<IReview[]>;
  getRatingDistribution(productId: mongoose.Types.ObjectId): Promise<any>;
}

// ==================== SCHEMA ====================

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
      index: true
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
      index: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must not exceed 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Review title cannot exceed 100 characters']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [2000, 'Review comment cannot exceed 2000 characters']
    },
    
    // Media attachments
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 5;
        },
        message: 'Maximum 5 images allowed per review'
      }
    },
    videos: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 2;
        },
        message: 'Maximum 2 videos allowed per review'
      }
    },
    
    // Verification & Status
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
      index: true
    },
    isApproved: {
      type: Boolean,
      default: true,
      index: true
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    
    // Engagement metrics
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0
    },
    unhelpfulVotes: {
      type: Number,
      default: 0,
      min: 0
    },
    votedBy: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      vote: {
        type: String,
        enum: ['helpful', 'unhelpful'],
        required: true
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Response from seller/admin
    response: {
      text: {
        type: String,
        trim: true,
        maxlength: [1000, 'Response cannot exceed 1000 characters']
      },
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      respondedAt: {
        type: Date
      }
    },
    
    // Flagging & moderation
    isFlagged: {
      type: Boolean,
      default: false,
      index: true
    },
    flaggedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    flagReason: {
      type: String,
      trim: true
    },
    
    // Additional metadata
    pros: {
      type: [String],
      default: []
    },
    cons: {
      type: [String],
      default: []
    },
    wouldRecommend: {
      type: Boolean
    },
    
    // Soft delete
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per user per product
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ product: 1, helpfulVotes: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1, isActive: 1 });
reviewSchema.index({ isFlagged: 1 });

// ==================== VIRTUALS ====================

reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpfulVotes + this.unhelpfulVotes;
  return total > 0 ? (this.helpfulVotes / total) * 100 : 0;
});

reviewSchema.virtual('hasMedia').get(function() {
  return (this.images && this.images.length > 0) || (this.videos && this.videos.length > 0);
});

reviewSchema.virtual('totalVotes').get(function() {
  return this.helpfulVotes + this.unhelpfulVotes;
});

// ==================== INSTANCE METHODS ====================

/**
 * Add a vote (helpful or unhelpful)
 */
reviewSchema.methods.addVote = async function(
  userId: mongoose.Types.ObjectId,
  voteType: 'helpful' | 'unhelpful'
): Promise<IReview> {
  // Check if user already voted
  const existingVoteIndex = this.votedBy.findIndex(
    (v: any) => v.user.toString() === userId.toString()
  );

  if (existingVoteIndex >= 0) {
    // Update existing vote
    const oldVote = this.votedBy[existingVoteIndex].vote;
    if (oldVote !== voteType) {
      // Change vote
      if (oldVote === 'helpful') {
        this.helpfulVotes -= 1;
        this.unhelpfulVotes += 1;
      } else {
        this.unhelpfulVotes -= 1;
        this.helpfulVotes += 1;
      }
      this.votedBy[existingVoteIndex].vote = voteType;
      this.votedBy[existingVoteIndex].votedAt = new Date();
    }
  } else {
    // Add new vote
    this.votedBy.push({
      user: userId,
      vote: voteType,
      votedAt: new Date()
    });
    
    if (voteType === 'helpful') {
      this.helpfulVotes += 1;
    } else {
      this.unhelpfulVotes += 1;
    }
  }

  await this.save();
  return this as any;
};

/**
 * Remove a vote
 */
reviewSchema.methods.removeVote = async function(
  userId: mongoose.Types.ObjectId
): Promise<IReview> {
  const voteIndex = this.votedBy.findIndex(
    (v: any) => v.user.toString() === userId.toString()
  );

  if (voteIndex >= 0) {
    const voteType = this.votedBy[voteIndex].vote;
    if (voteType === 'helpful') {
      this.helpfulVotes -= 1;
    } else {
      this.unhelpfulVotes -= 1;
    }
    this.votedBy.splice(voteIndex, 1);
    await this.save();
  }

  return this as any;
};

/**
 * Flag a review for moderation
 */
reviewSchema.methods.flagReview = async function(
  userId: mongoose.Types.ObjectId,
  reason: string
): Promise<IReview> {
  if (!this.flaggedBy.includes(userId)) {
    this.flaggedBy.push(userId);
    this.isFlagged = true;
    this.flagReason = reason;
    await this.save();
  }
  return this as any;
};

/**
 * Add response from seller/admin
 */
reviewSchema.methods.addResponse = async function(
  text: string,
  adminId: mongoose.Types.ObjectId
): Promise<IReview> {
  this.response = {
    text,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  await this.save();
  return this as any;
};

/**
 * Approve a review
 */
reviewSchema.methods.approve = async function(
  adminId: mongoose.Types.ObjectId
): Promise<IReview> {
  this.isApproved = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.isFlagged = false;
  this.flagReason = undefined;
  this.rejectionReason = undefined;
  await this.save();
  return this as any;
};

/**
 * Reject a review
 */
reviewSchema.methods.reject = async function(
  adminId: mongoose.Types.ObjectId,
  reason: string
): Promise<IReview> {
  this.isApproved = false;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  await this.save();
  return this as any;
};

// ==================== STATIC METHODS ====================

/**
 * Calculate average rating for a product
 */
reviewSchema.statics.calcAverageRating = async function(
  productId: mongoose.Types.ObjectId
): Promise<void> {
  const stats = await this.aggregate([
    {
      $match: {
        product: productId,
        isApproved: true,
        isActive: true
      }
    },
    {
      $group: {
        _id: '$product',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].numRating
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

/**
 * Get reviews for a product with filtering and sorting
 */
reviewSchema.statics.getProductReviews = async function(
  productId: mongoose.Types.ObjectId,
  options: any = {}
): Promise<IReview[]> {
  const {
    rating,
    verified,
    withMedia,
    sortBy = 'recent',
    page = 1,
    limit = 10
  } = options;

  const query: any = {
    product: productId,
    isApproved: true,
    isActive: true
  };

  if (rating) query.rating = rating;
  if (verified) query.isVerifiedPurchase = true;
  if (withMedia) {
    query.$or = [
      { 'images.0': { $exists: true } },
      { 'videos.0': { $exists: true } }
    ];
  }

  let sort: any = {};
  switch (sortBy) {
    case 'helpful':
      sort = { helpfulVotes: -1 };
      break;
    case 'recent':
      sort = { createdAt: -1 };
      break;
    case 'rating-high':
      sort = { rating: -1 };
      break;
    case 'rating-low':
      sort = { rating: 1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  return this.find(query)
    .populate('user', 'name avatar')
    .populate('response.respondedBy', 'name')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
};

/**
 * Get reviews by a user
 */
reviewSchema.statics.getUserReviews = async function(
  userId: mongoose.Types.ObjectId,
  options: any = {}
): Promise<IReview[]> {
  const { page = 1, limit = 10 } = options;

  return this.find({
    user: userId,
    isActive: true
  })
    .populate('product', 'name images slug')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
};

/**
 * Get top helpful reviews for a product
 */
reviewSchema.statics.getTopReviews = async function(
  productId: mongoose.Types.ObjectId,
  limit = 5
): Promise<IReview[]> {
  return this.find({
    product: productId,
    isApproved: true,
    isActive: true,
    helpfulVotes: { $gte: 1 }
  })
    .populate('user', 'name avatar')
    .sort({ helpfulVotes: -1, createdAt: -1 })
    .limit(limit)
    .exec();
};

/**
 * Get rating distribution for a product
 */
reviewSchema.statics.getRatingDistribution = async function(
  productId: mongoose.Types.ObjectId
): Promise<any> {
  const distribution = await this.aggregate([
    {
      $match: {
        product: productId,
        isApproved: true,
        isActive: true
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);

  const result: any = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  distribution.forEach((item: any) => {
    result[item._id] = item.count;
  });

  return result;
};

// ==================== MIDDLEWARE ====================

// Update product rating after saving a review
reviewSchema.post('save', function() {
  (this.constructor as any).calcAverageRating(this.product);
});

// Update product rating after removing a review
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
    await (doc.constructor as any).calcAverageRating(doc.product);
  }
});

// ==================== MODEL ====================

const Review = mongoose.model<IReview, IReviewModel>('Review', reviewSchema);

export default Review;
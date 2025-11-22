import mongoose, { Document, Schema, Model } from 'mongoose';

// ==================== INTERFACES ====================

export interface IFAQ extends Document {
  _id: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  order: number;
  isPublished: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedFAQs: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  helpfulRating: number;
  slug: string;

  // Instance Methods
  incrementViews(): Promise<this>;
  markHelpful(): Promise<this>;
  markNotHelpful(): Promise<this>;
}

export interface IFAQModel extends Model<IFAQ> {
  // Static Methods
  getByCategory(category: string, published?: boolean): Promise<IFAQ[]>;
  searchFAQs(query: string, category?: string): Promise<IFAQ[]>;
  getMostViewed(limit?: number): Promise<IFAQ[]>;
  getMostHelpful(limit?: number): Promise<IFAQ[]>;
  getByTags(tags: string[]): Promise<IFAQ[]>;
  getAllCategories(): Promise<string[]>;
  reorderFAQs(faqIds: string[]): Promise<void>;
}

// ==================== SCHEMA ====================

const faqSchema = new Schema<IFAQ, IFAQModel>(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters'],
      index: 'text'
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      maxlength: [5000, 'Answer cannot exceed 5000 characters'],
      index: 'text'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      enum: {
        values: [
          'general',
          'products',
          'orders',
          'shipping',
          'returns',
          'payments',
          'account',
          'technical',
          'billing',
          'warranty',
          'other'
        ],
        message: '{VALUE} is not a valid category'
      },
      default: 'general',
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative']
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    helpful: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative']
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: [0, 'Not helpful count cannot be negative']
    },
    relatedFAQs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FAQ'
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required']
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

// ==================== INDEXES ====================

// Compound indexes for common queries
faqSchema.index({ category: 1, isPublished: 1, order: 1 });
faqSchema.index({ isPublished: 1, views: -1 });
faqSchema.index({ isPublished: 1, helpful: -1 });
faqSchema.index({ tags: 1, isPublished: 1 });
faqSchema.index({ createdAt: -1 });

// Text index for search
faqSchema.index({ question: 'text', answer: 'text', tags: 'text' });

// ==================== VIRTUALS ====================

/**
 * Calculate helpful rating (0-100)
 */
faqSchema.virtual('helpfulRating').get(function (this: IFAQ) {
  const total = this.helpful + this.notHelpful;
  if (total === 0) return 0;
  return Math.round((this.helpful / total) * 100);
});

/**
 * Generate URL-friendly slug
 */
faqSchema.virtual('slug').get(function (this: IFAQ) {
  return this.question
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
});

// ==================== INSTANCE METHODS ====================

/**
 * Increment view count
 */
faqSchema.methods.incrementViews = async function (this: IFAQ): Promise<IFAQ> {
  this.views += 1;
  return await this.save();
};

/**
 * Mark as helpful
 */
faqSchema.methods.markHelpful = async function (this: IFAQ): Promise<IFAQ> {
  this.helpful += 1;
  return await this.save();
};

/**
 * Mark as not helpful
 */
faqSchema.methods.markNotHelpful = async function (this: IFAQ): Promise<IFAQ> {
  this.notHelpful += 1;
  return await this.save();
};

// ==================== STATIC METHODS ====================

/**
 * Get FAQs by category
 */
faqSchema.statics.getByCategory = async function (
  category: string,
  published: boolean = true
): Promise<IFAQ[]> {
  const query: any = { category };
  if (published) {
    query.isPublished = true;
  }

  return await this.find(query)
    .sort({ order: 1, createdAt: -1 })
    .populate('relatedFAQs', 'question category')
    .lean();
};

/**
 * Search FAQs by text
 */
faqSchema.statics.searchFAQs = async function (
  query: string,
  category?: string
): Promise<IFAQ[]> {
  const searchQuery: any = {
    $text: { $search: query },
    isPublished: true
  };

  if (category) {
    searchQuery.category = category;
  }

  return await this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, views: -1 })
    .limit(20)
    .lean();
};

/**
 * Get most viewed FAQs
 */
faqSchema.statics.getMostViewed = async function (
  limit: number = 10
): Promise<IFAQ[]> {
  return await this.find({ isPublished: true })
    .sort({ views: -1 })
    .limit(limit)
    .lean();
};

/**
 * Get most helpful FAQs
 */
faqSchema.statics.getMostHelpful = async function (
  limit: number = 10
): Promise<IFAQ[]> {
  return await this.aggregate([
    {
      $match: { isPublished: true }
    },
    {
      $addFields: {
        totalFeedback: { $add: ['$helpful', '$notHelpful'] },
        helpfulRatio: {
          $cond: {
            if: { $eq: [{ $add: ['$helpful', '$notHelpful'] }, 0] },
            then: 0,
            else: {
              $divide: ['$helpful', { $add: ['$helpful', '$notHelpful'] }]
            }
          }
        }
      }
    },
    {
      $match: {
        totalFeedback: { $gte: 5 } // Minimum 5 feedbacks
      }
    },
    {
      $sort: { helpfulRatio: -1, helpful: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

/**
 * Get FAQs by tags
 */
faqSchema.statics.getByTags = async function (tags: string[]): Promise<IFAQ[]> {
  return await this.find({
    tags: { $in: tags },
    isPublished: true
  })
    .sort({ views: -1 })
    .limit(20)
    .lean();
};

/**
 * Get all unique categories
 */
faqSchema.statics.getAllCategories = async function (): Promise<string[]> {
  const categories = await this.distinct('category', { isPublished: true });
  return categories;
};

/**
 * Reorder FAQs
 */
faqSchema.statics.reorderFAQs = async function (
  faqIds: string[]
): Promise<void> {
  const bulkOps = faqIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { order: index }
    }
  }));

  await this.bulkWrite(bulkOps);
};

// ==================== MIDDLEWARE ====================

/**
 * Pre-save: Normalize tags
 */
faqSchema.pre('save', function (next) {
  if (this.isModified('tags') && Array.isArray((this as any).tags)) {
    (this as any).tags = (this as any).tags.map((tag: string) => 
      tag.toLowerCase().trim()
    );
  }
  next();
});

/**
 * Pre-save: Update 'updatedBy' on modification
 */
faqSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    // updatedBy should be set by controller
  }
  next();
});

// ==================== MODEL ====================

const FAQ = mongoose.model<IFAQ, IFAQModel>('FAQ', faqSchema);

export default FAQ;

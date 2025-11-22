import mongoose, { Document, Schema, Model } from 'mongoose';

// ==================== INTERFACES ====================

export interface INewsletterSubscriber extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained';
  firstName?: string;
  lastName?: string;
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
  source: string;
  user?: mongoose.Types.ObjectId;
  verificationToken?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  unsubscribeToken: string;
  unsubscribedAt?: Date;
  unsubscribeReason?: string;
  bounceCount: number;
  lastBouncedAt?: Date;
  complainedAt?: Date;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
  };
  tags: string[];
  customFields: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  fullName?: string;

  // Instance Methods
  verify(): Promise<this>;
  unsubscribe(reason?: string): Promise<this>;
  resubscribe(): Promise<this>;
  recordBounce(): Promise<this>;
  recordComplaint(): Promise<this>;
  updatePreferences(preferences: any): Promise<this>;
}

export interface INewsletterSubscriberModel extends Model<INewsletterSubscriber> {
  // Static Methods
  findByEmail(email: string): Promise<INewsletterSubscriber | null>;
  getActiveSubscribers(category?: string): Promise<INewsletterSubscriber[]>;
  getByStatus(status: string): Promise<INewsletterSubscriber[]>;
  getByTags(tags: string[]): Promise<INewsletterSubscriber[]>;
  getSubscriberStats(): Promise<any>;
  cleanupUnverified(days?: number): Promise<number>;
}

// ==================== SCHEMA ====================

const newsletterSubscriberSchema = new Schema<
  INewsletterSubscriber,
  INewsletterSubscriberModel
>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'unsubscribed', 'bounced', 'complained'],
        message: '{VALUE} is not a valid status'
      },
      default: 'active',
      index: true
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    preferences: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      categories: {
        type: [String],
        default: ['general']
      }
    },
    source: {
      type: String,
      required: true,
      default: 'website',
      enum: [
        'website',
        'popup',
        'checkout',
        'account',
        'landing-page',
        'social-media',
        'manual',
        'import',
        'api'
      ]
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationToken: {
      type: String,
      select: false
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    verifiedAt: {
      type: Date
    },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    unsubscribedAt: {
      type: Date
    },
    unsubscribeReason: {
      type: String,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    bounceCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastBouncedAt: {
      type: Date
    },
    complainedAt: {
      type: Date
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      referer: String
    },
    tags: {
      type: [String],
      default: []
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map()
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

newsletterSubscriberSchema.index({ email: 1 }, { unique: true });
newsletterSubscriberSchema.index({ status: 1, isVerified: 1 });
newsletterSubscriberSchema.index({ 'preferences.categories': 1, status: 1 });
newsletterSubscriberSchema.index({ tags: 1, status: 1 });
newsletterSubscriberSchema.index({ createdAt: -1 });
newsletterSubscriberSchema.index({ user: 1 });

// ==================== VIRTUALS ====================

/**
 * Get full name
 */
newsletterSubscriberSchema.virtual('fullName').get(function (this: INewsletterSubscriber) {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || 'Subscriber';
});

// ==================== INSTANCE METHODS ====================

/**
 * Verify email
 */
newsletterSubscriberSchema.methods.verify = async function (): Promise<INewsletterSubscriber> {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.verificationToken = undefined;
  return await this.save();
};

/**
 * Unsubscribe
 */
newsletterSubscriberSchema.methods.unsubscribe = async function (
  reason?: string
): Promise<INewsletterSubscriber> {
  this.status = 'unsubscribed';
  this.unsubscribedAt = new Date();
  if (reason) {
    this.unsubscribeReason = reason;
  }
  return await this.save();
};

/**
 * Resubscribe
 */
newsletterSubscriberSchema.methods.resubscribe = async function (): Promise<INewsletterSubscriber> {
  this.status = 'active';
  this.unsubscribedAt = undefined;
  this.unsubscribeReason = undefined;
  return await this.save();
};

/**
 * Record bounce
 */
newsletterSubscriberSchema.methods.recordBounce = async function (): Promise<INewsletterSubscriber> {
  this.bounceCount += 1;
  this.lastBouncedAt = new Date();
  
  // Auto-mark as bounced after 3 bounces
  if (this.bounceCount >= 3) {
    this.status = 'bounced';
  }
  
  return await this.save();
};

/**
 * Record complaint
 */
newsletterSubscriberSchema.methods.recordComplaint = async function (): Promise<INewsletterSubscriber> {
  this.status = 'complained';
  this.complainedAt = new Date();
  return await this.save();
};

/**
 * Update preferences
 */
newsletterSubscriberSchema.methods.updatePreferences = async function (
  preferences: any
): Promise<INewsletterSubscriber> {
  if (preferences.frequency) {
    this.preferences.frequency = preferences.frequency;
  }
  if (preferences.categories) {
    this.preferences.categories = preferences.categories;
  }
  return await this.save();
};

// ==================== STATIC METHODS ====================

/**
 * Find by email
 */
newsletterSubscriberSchema.statics.findByEmail = async function (
  email: string
): Promise<INewsletterSubscriber | null> {
  return await this.findOne({ email: email.toLowerCase() });
};

/**
 * Get active subscribers
 */
newsletterSubscriberSchema.statics.getActiveSubscribers = async function (
  category?: string
): Promise<any[]> {
  const query: any = {
    status: 'active',
    isVerified: true
  };

  if (category) {
    query['preferences.categories'] = category;
  }

  return await this.find(query).lean();
};

/**
 * Get by status
 */
newsletterSubscriberSchema.statics.getByStatus = async function (
  status: string
): Promise<any[]> {
  return await this.find({ status })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Get by tags
 */
newsletterSubscriberSchema.statics.getByTags = async function (
  tags: string[]
): Promise<any[]> {
  return await this.find({
    tags: { $in: tags },
    status: 'active',
    isVerified: true
  }).lean();
};

/**
 * Get subscriber statistics
 */
newsletterSubscriberSchema.statics.getSubscriberStats = async function (): Promise<any> {
  const [
    totalSubscribers,
    activeSubscribers,
    verifiedSubscribers,
    unsubscribedSubscribers,
    statusStats,
    sourceStats,
    frequencyStats,
    recentGrowth
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ status: 'active' }),
    this.countDocuments({ isVerified: true }),
    this.countDocuments({ status: 'unsubscribed' }),
    
    // Status distribution
    this.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Source distribution
    this.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Frequency preferences
    this.aggregate([
      {
        $match: { status: 'active', isVerified: true }
      },
      {
        $group: {
          _id: '$preferences.frequency',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]),
    
    // Recent growth (last 30 days)
    this.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  return {
    overview: {
      total: totalSubscribers,
      active: activeSubscribers,
      verified: verifiedSubscribers,
      unsubscribed: unsubscribedSubscribers,
      verificationRate: totalSubscribers > 0 
        ? Math.round((verifiedSubscribers / totalSubscribers) * 100) 
        : 0,
      activeRate: totalSubscribers > 0
        ? Math.round((activeSubscribers / totalSubscribers) * 100)
        : 0
    },
    byStatus: statusStats,
    bySource: sourceStats,
    byFrequency: frequencyStats,
    recentGrowth
  };
};

/**
 * Cleanup unverified subscribers
 */
newsletterSubscriberSchema.statics.cleanupUnverified = async function (
  days: number = 30
): Promise<number> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await this.deleteMany({
    isVerified: false,
    createdAt: { $lt: cutoffDate }
  });

  return result.deletedCount || 0;
};

// ==================== MIDDLEWARE ====================

/**
 * Pre-save: Generate unsubscribe token
 */
newsletterSubscriberSchema.pre('save', function (next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = 
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36);
  }
  next();
});

/**
 * Pre-save: Normalize tags
 */
newsletterSubscriberSchema.pre('save', function (next) {
  if (this.isModified('tags') && Array.isArray((this as any).tags)) {
    (this as any).tags = (this as any).tags.map((tag: string) =>
      tag.toLowerCase().trim()
    );
  }
  next();
});

/**
 * Pre-save: Normalize categories
 */
newsletterSubscriberSchema.pre('save', function (next) {
  if (this.isModified('preferences.categories')) {
    this.preferences.categories = this.preferences.categories.map((cat) =>
      cat.toLowerCase().trim()
    );
  }
  next();
});

// ==================== MODEL ====================

const NewsletterSubscriber = mongoose.model<
  INewsletterSubscriber,
  INewsletterSubscriberModel
>('NewsletterSubscriber', newsletterSubscriberSchema);

export default NewsletterSubscriber;

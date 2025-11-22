import mongoose, { Document, Schema, Model } from 'mongoose';

// ============================================================================
// INTERFACES
// ============================================================================

export type ReplyModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'spam';
export type ReplySource = 'web' | 'mobile' | 'api' | 'admin';
export type ReplySentiment = 'positive' | 'negative' | 'neutral';
export type VerificationLevel = 'none' | 'email' | 'phone' | 'purchase' | 'identity';

export interface IReplyFlag {
  type: 'inappropriate' | 'spam' | 'harassment' | 'misinformation' | 'copyright' | 'other';
  reason: string;
  flaggedBy: mongoose.Types.ObjectId;
  flaggedAt: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'dismissed';
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

export interface IReplyAttachment {
  type: 'image' | 'video' | 'file' | 'link';
  url: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
}

export interface IReplyMention {
  userId: mongoose.Types.ObjectId;
  username: string;
  position: number;
  length: number;
  notified: boolean;
}

export interface IReplyReaction {
  type: 'like' | 'love' | 'helpful' | 'insightful' | 'funny' | 'angry';
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IReplyHistory {
  content: string;
  editedBy: mongoose.Types.ObjectId;
  editedAt: Date;
  reason?: string;
}

export interface IVisibilityRule {
  type: 'user_group' | 'subscription' | 'location' | 'custom';
  value: string;
  enabled: boolean;
}

export interface IReviewReply extends Document {
  review: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  
  // Reply content
  content: string;
  htmlContent?: string;
  plainTextContent?: string;
  
  // Threading
  parentId?: mongoose.Types.ObjectId;
  threadId?: mongoose.Types.ObjectId;
  level: number;
  path: string;
  parentIds: mongoose.Types.ObjectId[];
  
  // Metadata
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    source: ReplySource;
    isEdited: boolean;
    editCount: number;
    lastEditedAt?: Date;
  };
  
  // Moderation
  moderation: {
    status: ReplyModerationStatus;
    moderatedBy?: mongoose.Types.ObjectId;
    moderatedAt?: Date;
    rejectionReason?: string;
    flags: IReplyFlag[];
    autoModerationScore: number;
    humanReviewRequired: boolean;
    isHidden: boolean;
    hideReason?: string;
  };
  
  // Engagement
  engagement: {
    likes: number;
    dislikes: number;
    replies: number;
    reports: number;
    helpfulVotes: number;
    unhelpfulVotes: number;
  };
  
  // Analytics
  analytics: {
    views: number;
    clickThroughs: number;
    mentions: string[];
    sentiment: ReplySentiment;
    topics: string[];
    readingTime: number;
    engagementRate: number;
  };
  
  // Notifications
  notifications: {
    notifyAuthor: boolean;
    notifyModerators: boolean;
    notifyMentioned: boolean;
    emailSent: boolean;
    pushSent: boolean;
    smsSent?: boolean;
  };
  
  // Verification
  verification: {
    isVerifiedPurchase: boolean;
    verificationLevel: VerificationLevel;
    verifiedAt?: Date;
    purchaseOrderId?: mongoose.Types.ObjectId;
  };
  
  // Visibility
  visibility: {
    isPublic: boolean;
    isStaffOnly: boolean;
    isAuthorOnly: boolean;
    visibilityRules: IVisibilityRule[];
    showInFeed: boolean;
    indexable: boolean;
  };
  
  // Formatting
  formatting: {
    hasLinks: boolean;
    hasEmojis: boolean;
    wordCount: number;
    readabilityScore: number;
  };
  
  // Attachments and interactions
  attachments: IReplyAttachment[];
  mentions: IReplyMention[];
  reactions: IReplyReaction[];
  history: IReplyHistory[];
  
  isActive: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  replyCount: number;
  totalLikes: number;
  totalDislikes: number;
  netVotes: number;
}

export interface IReviewReplyModel extends Model<IReviewReply> {
  getThread(threadId: mongoose.Types.ObjectId): Promise<IReviewReply[]>;
  getTopReplies(query: any, limit: number): Promise<IReviewReply[]>;
  getByReview(reviewId: mongoose.Types.ObjectId): Promise<IReviewReply[]>;
  getModerationQueue(status: ReplyModerationStatus): Promise<IReviewReply[]>;
}

// ============================================================================
// SCHEMAS
// ============================================================================

const ReplyFlagSchema = new Schema<IReplyFlag>({
  type: {
    type: String,
    enum: ['inappropriate', 'spam', 'harassment', 'misinformation', 'copyright', 'other'],
    required: true
  },
  reason: { type: String, required: true },
  flaggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  flaggedAt: { type: Date, default: Date.now },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'resolved', 'dismissed'],
    default: 'open'
  },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
}, { _id: false });

const ReplyAttachmentSchema = new Schema<IReplyAttachment>({
  type: {
    type: String,
    enum: ['image', 'video', 'file', 'link'],
    required: true
  },
  url: { type: String, required: true },
  filename: { type: String },
  size: { type: Number },
  mimeType: { type: String },
  thumbnail: { type: String }
}, { _id: false });

const ReplyMentionSchema = new Schema<IReplyMention>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  position: { type: Number, required: true },
  length: { type: Number, required: true },
  notified: { type: Boolean, default: false }
}, { _id: false });

const ReplyReactionSchema = new Schema<IReplyReaction>({
  type: {
    type: String,
    enum: ['like', 'love', 'helpful', 'insightful', 'funny', 'angry'],
    required: true
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ReplyHistorySchema = new Schema<IReplyHistory>({
  content: { type: String, required: true },
  editedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  editedAt: { type: Date, default: Date.now },
  reason: { type: String }
}, { _id: false });

const VisibilityRuleSchema = new Schema<IVisibilityRule>({
  type: {
    type: String,
    enum: ['user_group', 'subscription', 'location', 'custom'],
    required: true
  },
  value: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { _id: false });

const ReviewReplySchema = new Schema<IReviewReply>({
  review: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: [true, 'Review is required'],
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [1, 'Content cannot be empty'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  htmlContent: { type: String },
  plainTextContent: { type: String },
  
  // Threading
  parentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ReviewReply',
    index: true
  },
  threadId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ReviewReply',
    index: true
  },
  level: {
    type: Number,
    default: 0,
    min: [0, 'Level cannot be negative']
  },
  path: {
    type: String,
    default: '/'
  },
  parentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'ReviewReply'
  }],
  
  // Metadata
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin'],
      default: 'web'
    },
    isEdited: { type: Boolean, default: false },
    editCount: { type: Number, default: 0 },
    lastEditedAt: { type: Date }
  },
  
  // Moderation
  moderation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged', 'spam'],
      default: 'pending',
      index: true
    },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
    rejectionReason: { type: String },
    flags: [ReplyFlagSchema],
    autoModerationScore: { type: Number, default: 0, min: 0, max: 100 },
    humanReviewRequired: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    hideReason: { type: String }
  },
  
  // Engagement
  engagement: {
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    reports: { type: Number, default: 0 },
    helpfulVotes: { type: Number, default: 0 },
    unhelpfulVotes: { type: Number, default: 0 }
  },
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    clickThroughs: { type: Number, default: 0 },
    mentions: [String],
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    topics: [String],
    readingTime: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 }
  },
  
  // Notifications
  notifications: {
    notifyAuthor: { type: Boolean, default: true },
    notifyModerators: { type: Boolean, default: false },
    notifyMentioned: { type: Boolean, default: true },
    emailSent: { type: Boolean, default: false },
    pushSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false }
  },
  
  // Verification
  verification: {
    isVerifiedPurchase: { type: Boolean, default: false },
    verificationLevel: {
      type: String,
      enum: ['none', 'email', 'phone', 'purchase', 'identity'],
      default: 'none'
    },
    verifiedAt: { type: Date },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'Order' }
  },
  
  // Visibility
  visibility: {
    isPublic: { type: Boolean, default: true },
    isStaffOnly: { type: Boolean, default: false },
    isAuthorOnly: { type: Boolean, default: false },
    visibilityRules: [VisibilityRuleSchema],
    showInFeed: { type: Boolean, default: true },
    indexable: { type: Boolean, default: true }
  },
  
  // Formatting
  formatting: {
    hasLinks: { type: Boolean, default: false },
    hasEmojis: { type: Boolean, default: false },
    wordCount: { type: Number, default: 0 },
    readabilityScore: { type: Number, default: 0 }
  },
  
  attachments: [ReplyAttachmentSchema],
  mentions: [ReplyMentionSchema],
  reactions: [ReplyReactionSchema],
  history: [ReplyHistorySchema],
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ReviewReplySchema.index({ review: 1, parentId: 1, createdAt: 1 });
ReviewReplySchema.index({ user: 1, createdAt: -1 });
ReviewReplySchema.index({ product: 1, 'moderation.status': 1 });
ReviewReplySchema.index({ threadId: 1, level: 1 });
ReviewReplySchema.index({ path: 1 });
ReviewReplySchema.index({ isPinned: -1, isFeatured: -1, createdAt: -1 });
ReviewReplySchema.index({ 'engagement.likes': -1 });

// Text search index
ReviewReplySchema.index({
  content: 'text',
  plainTextContent: 'text'
});

// Virtuals
ReviewReplySchema.virtual('replyCount').get(function(this: IReviewReply) {
  return this.engagement.replies;
});

ReviewReplySchema.virtual('totalLikes').get(function(this: IReviewReply) {
  return this.reactions.filter(r => r.type === 'like' || r.type === 'love').length;
});

ReviewReplySchema.virtual('totalDislikes').get(function(this: IReviewReply) {
  return this.engagement.dislikes;
});

ReviewReplySchema.virtual('netVotes').get(function(this: IReviewReply) {
  return this.engagement.helpfulVotes - this.engagement.unhelpfulVotes;
});

// Pre-save middleware
ReviewReplySchema.pre('save', async function(next) {
  // Calculate word count
  this.formatting.wordCount = this.content.split(/\s+/).length;
  
  // Calculate reading time (average 200 words per minute)
  this.analytics.readingTime = Math.ceil(this.formatting.wordCount / 200);
  
  // Check for links
  this.formatting.hasLinks = /<a\s+href|http:\/\/|https:\/\//.test(this.content);
  
  // Check for emojis (basic check)
  this.formatting.hasEmojis = /[\u{1F600}-\u{1F64F}]/u.test(this.content);
  
  // Set plain text content
  if (!this.plainTextContent) {
    this.plainTextContent = this.content.replace(/<[^>]*>/g, '').trim();
  }
  
  // Calculate engagement rate
  const totalEngagement = this.engagement.likes + this.engagement.replies + 
                         this.engagement.helpfulVotes;
  if (this.analytics.views > 0) {
    this.analytics.engagementRate = (totalEngagement / this.analytics.views) * 100;
  }
  
  // Auto-moderate based on score
  if (this.moderation.autoModerationScore >= 80 && !this.moderation.humanReviewRequired) {
    this.moderation.status = 'approved';
  } else if (this.moderation.autoModerationScore < 20) {
    this.moderation.status = 'spam';
    this.moderation.humanReviewRequired = true;
  } else if (this.moderation.autoModerationScore < 40) {
    this.moderation.status = 'flagged';
    this.moderation.humanReviewRequired = true;
  }
  
  // Build threading path
  if (this.isNew && this.parentId) {
    const parent = await (this.constructor as Model<IReviewReply>).findById(this.parentId);
    if (parent) {
      this.level = parent.level + 1;
      this.path = `${parent.path}${parent._id}/`;
      this.parentIds = [...parent.parentIds, parent._id as mongoose.Types.ObjectId];
      this.threadId = (parent.threadId || parent._id) as mongoose.Types.ObjectId;
      
      // Update parent reply count
      await (this.constructor as Model<IReviewReply>).findByIdAndUpdate(
        this.parentId,
        { $inc: { 'engagement.replies': 1 } }
      );
    }
  } else if (this.isNew) {
    this.path = '/';
    this.threadId = this._id as mongoose.Types.ObjectId;
  }
  
  next();
});

// Static methods
ReviewReplySchema.statics.getByReview = function(reviewId: mongoose.Types.ObjectId) {
  return this.find({ 
    review: reviewId, 
    'moderation.status': 'approved',
    isActive: true 
  })
    .populate('user', 'name avatar')
    .populate('parentId', 'user content')
    .sort({ isPinned: -1, createdAt: 1 });
};

ReviewReplySchema.statics.getThread = function(threadId: mongoose.Types.ObjectId) {
  return this.find({ 
    threadId, 
    'moderation.status': 'approved',
    isActive: true 
  })
    .populate('user', 'name avatar')
    .sort({ level: 1, createdAt: 1 });
};

ReviewReplySchema.statics.getModerationQueue = function(
  status: ReplyModerationStatus = 'pending'
) {
  return this.find({ 
    'moderation.status': status,
    isActive: true 
  })
    .sort({ createdAt: 1 })
    .populate('review')
    .populate('user', 'name email avatar')
    .populate('product', 'name slug');
};

ReviewReplySchema.statics.getTopReplies = function(
  query: any = {},
  limit: number = 10
) {
  return this.find({ 
    ...query,
    'moderation.status': 'approved',
    isActive: true 
  })
    .sort({ 'engagement.likes': -1, 'engagement.helpfulVotes': -1 })
    .limit(limit)
    .populate('user', 'name avatar')
    .populate('review', 'rating product');
};

export const ReviewReply = mongoose.model<IReviewReply, IReviewReplyModel>('ReviewReply', ReviewReplySchema);

import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface IBlogPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  
  // Author information
  author: mongoose.Types.ObjectId;
  
  // Categorization
  category: mongoose.Types.ObjectId;
  tags: string[];
  
  // Media
  featuredImage?: string;
  images?: string[];
  
  // Publishing
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publishedAt?: Date;
  scheduledFor?: Date;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  
  // Engagement
  views: number;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  
  // Reading time
  readingTime?: number; // in minutes
  
  // Related content
  relatedPosts?: mongoose.Types.ObjectId[];
  
  // Features
  isFeatured: boolean;
  isPinned: boolean;
  allowComments: boolean;
  
  // Admin
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  incrementViews(): Promise<this>;
  toggleLike(userId: mongoose.Types.ObjectId): Promise<this>;
  publish(): Promise<this>;
  archive(): Promise<this>;
  generateSlug(): string;
  calculateReadingTime(): number;
}

export interface IBlogPostModel extends mongoose.Model<IBlogPost> {
  getPublishedPosts(filters?: any, options?: any): Promise<IBlogPost[]>;
  getFeaturedPosts(limit?: number): Promise<IBlogPost[]>;
  getPopularPosts(limit?: number, days?: number): Promise<IBlogPost[]>;
  getRelatedPosts(postId: mongoose.Types.ObjectId, limit?: number): Promise<IBlogPost[]>;
  searchPosts(query: string, options?: any): Promise<IBlogPost[]>;
  getPostsByTag(tag: string, options?: any): Promise<IBlogPost[]>;
  getPostsByCategory(categoryId: mongoose.Types.ObjectId, options?: any): Promise<IBlogPost[]>;
  getPostsByAuthor(authorId: mongoose.Types.ObjectId, options?: any): Promise<IBlogPost[]>;
  checkAndPublishScheduled(): Promise<void>;
}

// ==================== SCHEMA ====================

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, 'Blog post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    
    // Author information
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true
    },
    
    // Categorization
    category: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
      required: [true, 'Category is required'],
      index: true
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    
    // Media
    featuredImage: {
      type: String,
      trim: true
    },
    images: [{
      type: String,
      trim: true
    }],
    
    // Publishing
    status: {
      type: String,
      enum: {
        values: ['draft', 'scheduled', 'published', 'archived'],
        message: 'Invalid status'
      },
      default: 'draft',
      index: true
    },
    publishedAt: {
      type: Date,
      index: true
    },
    scheduledFor: {
      type: Date,
      validate: {
        validator: function(this: IBlogPost, value: Date) {
          if (!value) return true;
          return value > new Date();
        },
        message: 'Scheduled date must be in the future'
      }
    },
    
    // SEO
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    metaKeywords: [{
      type: String,
      trim: true
    }],
    canonicalUrl: {
      type: String,
      trim: true
    },
    
    // Engagement
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    likesCount: {
      type: Number,
      default: 0,
      min: [0, 'Likes count cannot be negative']
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: [0, 'Comments count cannot be negative']
    },
    sharesCount: {
      type: Number,
      default: 0,
      min: [0, 'Shares count cannot be negative']
    },
    
    // Reading time
    readingTime: {
      type: Number,
      min: [1, 'Reading time must be at least 1 minute']
    },
    
    // Related content
    relatedPosts: [{
      type: Schema.Types.ObjectId,
      ref: 'BlogPost'
    }],
    
    // Features
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    
    // Admin
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
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

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ author: 1, status: 1 });
blogPostSchema.index({ isFeatured: 1, status: 1 });
blogPostSchema.index({ views: -1 });
blogPostSchema.index({ likesCount: -1 });
blogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

// ==================== VIRTUALS ====================

blogPostSchema.virtual('isPublished').get(function() {
  return this.status === 'published' && this.publishedAt && this.publishedAt <= new Date();
});

blogPostSchema.virtual('engagementScore').get(function() {
  // Weighted engagement score
  return (
    this.views * 1 +
    this.likesCount * 5 +
    this.commentsCount * 10 +
    this.sharesCount * 15
  );
});

blogPostSchema.virtual('engagementRate').get(function() {
  if (this.views === 0) return 0;
  const totalEngagements = this.likesCount + this.commentsCount + this.sharesCount;
  return (totalEngagements / this.views) * 100;
});

// Virtual populate comments
blogPostSchema.virtual('comments', {
  ref: 'BlogComment',
  localField: '_id',
  foreignField: 'post'
});

// ==================== INSTANCE METHODS ====================

/**
 * Increment view count
 */
blogPostSchema.methods.incrementViews = async function(): Promise<any> {
  this.views += 1;
  await this.save();
  return this as any;
};

/**
 * Toggle like from a user
 */
blogPostSchema.methods.toggleLike = async function(
  userId: mongoose.Types.ObjectId
): Promise<any> {
  const userIdStr = userId.toString();
  const likeIndex = this.likes.findIndex((id: any) => id.toString() === userIdStr);
  
  if (likeIndex >= 0) {
    // Unlike
    this.likes.splice(likeIndex, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    // Like
    this.likes.push(userId);
    this.likesCount += 1;
  }
  
  await this.save();
  return this as any;
};

/**
 * Publish the post
 */
blogPostSchema.methods.publish = async function(): Promise<any> {
  this.status = 'published';
  if (!this.publishedAt) {
    this.publishedAt = new Date();
  }
  this.scheduledFor = undefined;
  await this.save();
  return this as any;
};

/**
 * Archive the post
 */
blogPostSchema.methods.archive = async function(): Promise<any> {
  this.status = 'archived';
  await this.save();
  return this as any;
};

/**
 * Generate slug from title
 */
blogPostSchema.methods.generateSlug = function(): string {
  return this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Calculate reading time based on content
 */
blogPostSchema.methods.calculateReadingTime = function(): number {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// ==================== STATIC METHODS ====================

/**
 * Get published posts with filters
 */
blogPostSchema.statics.getPublishedPosts = async function(
  filters: any = {},
  options: any = {}
): Promise<IBlogPost[]> {
  const {
    page = 1,
    limit = 10,
    sort = '-publishedAt',
    populate = true
  } = options;
  
  const query = {
    status: 'published',
    publishedAt: { $lte: new Date() },
    deletedAt: { $exists: false },
    ...filters
  };
  
  let queryBuilder = this.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
  
  if (populate) {
    queryBuilder = queryBuilder
      .populate('author', 'name email avatar')
      .populate('category', 'name slug');
  }
  
  return queryBuilder;
};

/**
 * Get featured posts
 */
blogPostSchema.statics.getFeaturedPosts = async function(
  limit: number = 5
): Promise<IBlogPost[]> {
  return this.find({
    status: 'published',
    isFeatured: true,
    publishedAt: { $lte: new Date() },
    deletedAt: { $exists: false }
  })
    .sort('-publishedAt')
    .limit(limit)
    .populate('author', 'name email avatar')
    .populate('category', 'name slug');
};

/**
 * Get popular posts based on engagement
 */
blogPostSchema.statics.getPopularPosts = async function(
  limit: number = 10,
  days: number = 30
): Promise<IBlogPost[]> {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    status: 'published',
    publishedAt: { $gte: dateThreshold, $lte: new Date() },
    deletedAt: { $exists: false }
  })
    .sort('-views -likesCount -commentsCount')
    .limit(limit)
    .populate('author', 'name email avatar')
    .populate('category', 'name slug');
};

/**
 * Get related posts based on tags and category
 */
blogPostSchema.statics.getRelatedPosts = async function(
  postId: mongoose.Types.ObjectId,
  limit: number = 5
): Promise<IBlogPost[]> {
  const post = await this.findById(postId);
  if (!post) return [];
  
  return this.find({
    _id: { $ne: postId },
    status: 'published',
    publishedAt: { $lte: new Date() },
    deletedAt: { $exists: false },
    $or: [
      { category: post.category },
      { tags: { $in: post.tags } }
    ]
  })
    .sort('-publishedAt')
    .limit(limit)
    .populate('author', 'name email avatar')
    .populate('category', 'name slug');
};

/**
 * Search posts by text
 */
blogPostSchema.statics.searchPosts = async function(
  query: string,
  options: any = {}
): Promise<IBlogPost[]> {
  const { page = 1, limit = 10 } = options;
  
  return this.find({
    $text: { $search: query },
    status: 'published',
    publishedAt: { $lte: new Date() },
    deletedAt: { $exists: false }
  })
    .sort({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'name email avatar')
    .populate('category', 'name slug');
};

/**
 * Get posts by tag
 */
blogPostSchema.statics.getPostsByTag = async function(
  tag: string,
  options: any = {}
): Promise<IBlogPost[]> {
  const { page = 1, limit = 10 } = options;
  
  return this.find({
    tags: tag.toLowerCase(),
    status: 'published',
    publishedAt: { $lte: new Date() },
    deletedAt: { $exists: false }
  })
    .sort('-publishedAt')
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'name email avatar')
    .populate('category', 'name slug');
};

/**
 * Get posts by category
 */
blogPostSchema.statics.getPostsByCategory = async function(
  categoryId: mongoose.Types.ObjectId,
  options: any = {}
): Promise<IBlogPost[]> {
  const { page = 1, limit = 10 } = options;
  
  return this.find({
    category: categoryId,
    status: 'published',
    publishedAt: { $lte: new Date() },
    deletedAt: { $exists: false }
  })
    .sort('-publishedAt')
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'name email avatar')
    .populate('category', 'name slug');
};

/**
 * Get posts by author
 */
blogPostSchema.statics.getPostsByAuthor = async function(
  authorId: mongoose.Types.ObjectId,
  options: any = {}
): Promise<IBlogPost[]> {
  const { page = 1, limit = 10, includeUnpublished = false } = options;
  
  const query: any = {
    author: authorId,
    deletedAt: { $exists: false }
  };
  
  if (!includeUnpublished) {
    query.status = 'published';
    query.publishedAt = { $lte: new Date() };
  }
  
  return this.find(query)
    .sort('-publishedAt -createdAt')
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category', 'name slug');
};

/**
 * Check and publish scheduled posts
 */
blogPostSchema.statics.checkAndPublishScheduled = async function(): Promise<void> {
  const now = new Date();
  
  const scheduledPosts = await this.find({
    status: 'scheduled',
    scheduledFor: { $lte: now }
  });
  
  for (const post of scheduledPosts) {
    await post.publish();
  }
};

// ==================== HOOKS ====================

blogPostSchema.pre('save', function(next) {
  // Auto-generate slug if not provided
  if (!this.slug || this.isModified('title')) {
    this.slug = this.generateSlug();
  }
  
  // Auto-calculate reading time
  if (this.isModified('content')) {
    this.readingTime = this.calculateReadingTime();
  }
  
  // Auto-generate meta fields from content if not provided
  if (!this.metaTitle) {
    this.metaTitle = this.title.substring(0, 60);
  }
  
  if (!this.metaDescription) {
    this.metaDescription = this.excerpt.substring(0, 160);
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Ensure unique slug
blogPostSchema.pre('save', async function(next) {
  if (this.isModified('slug')) {
    const existingPost = await (this.constructor as any).findOne({
      slug: this.slug,
      _id: { $ne: this._id }
    });
    
    if (existingPost) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }
  
  next();
});

// ==================== MODEL ====================

const BlogPost = mongoose.model<IBlogPost, IBlogPostModel>('BlogPost', blogPostSchema);

export default BlogPost;

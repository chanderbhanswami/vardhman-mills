import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface IBlogComment extends Document {
  _id: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  parent?: mongoose.Types.ObjectId; // For nested comments/replies
  isApproved: boolean;
  isFlagged: boolean;
  flagReason?: string;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  repliesCount: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  approve(): Promise<this>;
  flag(reason: string): Promise<this>;
  toggleLike(userId: mongoose.Types.ObjectId): Promise<this>;
}

export interface IBlogCommentModel extends mongoose.Model<IBlogComment> {
  getPostComments(postId: mongoose.Types.ObjectId, options?: any): Promise<IBlogComment[]>;
  getPendingComments(): Promise<IBlogComment[]>;
}

// ==================== SCHEMA ====================

const blogCommentSchema = new Schema<IBlogComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'BlogPost',
      required: [true, 'Post is required'],
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'BlogComment',
      default: null
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true
    },
    isFlagged: {
      type: Boolean,
      default: false,
      index: true
    },
    flagReason: {
      type: String,
      trim: true
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
    repliesCount: {
      type: Number,
      default: 0,
      min: [0, 'Replies count cannot be negative']
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

blogCommentSchema.index({ post: 1, isApproved: 1 });
blogCommentSchema.index({ parent: 1 });
blogCommentSchema.index({ user: 1 });

// ==================== VIRTUALS ====================

blogCommentSchema.virtual('replies', {
  ref: 'BlogComment',
  localField: '_id',
  foreignField: 'parent'
});

// ==================== INSTANCE METHODS ====================

blogCommentSchema.methods.approve = async function(): Promise<any> {
  this.isApproved = true;
  this.isFlagged = false;
  this.flagReason = undefined;
  await this.save();
  return this as any;
};

blogCommentSchema.methods.flag = async function(reason: string): Promise<any> {
  this.isFlagged = true;
  this.flagReason = reason;
  await this.save();
  return this as any;
};

blogCommentSchema.methods.toggleLike = async function(
  userId: mongoose.Types.ObjectId
): Promise<any> {
  const userIdStr = userId.toString();
  const likeIndex = this.likes.findIndex((id: any) => id.toString() === userIdStr);
  
  if (likeIndex >= 0) {
    this.likes.splice(likeIndex, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    this.likes.push(userId);
    this.likesCount += 1;
  }
  
  await this.save();
  return this as any;
};

// ==================== STATIC METHODS ====================

blogCommentSchema.statics.getPostComments = async function(
  postId: mongoose.Types.ObjectId,
  options: any = {}
): Promise<IBlogComment[]> {
  const { includeUnapproved = false } = options;
  
  const query: any = {
    post: postId,
    parent: null, // Only root comments
    deletedAt: { $exists: false }
  };
  
  if (!includeUnapproved) {
    query.isApproved = true;
  }
  
  return this.find(query)
    .sort('-createdAt')
    .populate('user', 'name email avatar')
    .populate({
      path: 'replies',
      match: { deletedAt: { $exists: false }, ...(includeUnapproved ? {} : { isApproved: true }) },
      populate: { path: 'user', select: 'name email avatar' }
    });
};

blogCommentSchema.statics.getPendingComments = async function(): Promise<IBlogComment[]> {
  return this.find({
    isApproved: false,
    deletedAt: { $exists: false }
  })
    .sort('-createdAt')
    .populate('user', 'name email avatar')
    .populate('post', 'title slug');
};

// ==================== HOOKS ====================

// Update post comments count
blogCommentSchema.post('save', async function(doc) {
  if (doc.isApproved && !doc.deletedAt) {
    await mongoose.model('BlogPost').findByIdAndUpdate(
      doc.post,
      { $inc: { commentsCount: 1 } }
    );
  }
  
  // Update parent comment replies count
  if (doc.parent) {
    await mongoose.model('BlogComment').findByIdAndUpdate(
      doc.parent,
      { $inc: { repliesCount: 1 } }
    );
  }
});

// ==================== MODEL ====================

const BlogComment = mongoose.model<IBlogComment, IBlogCommentModel>('BlogComment', blogCommentSchema);

export default BlogComment;

import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface IBlogCategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  postsCount: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogCategoryModel extends mongoose.Model<IBlogCategory> {
  getActiveCategories(): Promise<IBlogCategory[]>;
  getCategoryWithPosts(categoryId: mongoose.Types.ObjectId): Promise<any>;
}

// ==================== SCHEMA ====================

const blogCategorySchema = new Schema<IBlogCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
      type: String,
      trim: true
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    postsCount: {
      type: Number,
      default: 0,
      min: [0, 'Posts count cannot be negative']
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

blogCategorySchema.index({ isActive: 1 });
blogCategorySchema.index({ parent: 1 });

// ==================== VIRTUALS ====================

blogCategorySchema.virtual('subcategories', {
  ref: 'BlogCategory',
  localField: '_id',
  foreignField: 'parent'
});

// ==================== STATIC METHODS ====================

blogCategorySchema.statics.getActiveCategories = async function(): Promise<IBlogCategory[]> {
  return this.find({
    isActive: true,
    deletedAt: { $exists: false }
  })
    .sort('name')
    .populate('subcategories');
};

blogCategorySchema.statics.getCategoryWithPosts = async function(
  categoryId: mongoose.Types.ObjectId
): Promise<any> {
  const category = await this.findById(categoryId);
  if (!category) return null;
  
  const posts = await mongoose.model('BlogPost').find({
    category: categoryId,
    status: 'published',
    publishedAt: { $lte: new Date() }
  })
    .sort('-publishedAt')
    .limit(10);
  
  return {
    ...category.toObject(),
    posts
  };
};

// ==================== HOOKS ====================

blogCategorySchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// ==================== MODEL ====================

const BlogCategory = mongoose.model<IBlogCategory, IBlogCategoryModel>('BlogCategory', blogCategorySchema);

export default BlogCategory;

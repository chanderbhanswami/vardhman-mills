import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant {
  _id?: string;
  size?: string;
  color?: string;
  material?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

export interface IProductReview {
  _id?: string;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  brand?: string;
  tags: string[];
  variants: IProductVariant[];
  images: string[];
  specifications: Map<string, string>;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  reviews: IProductReview[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IProductVariant>({
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

const reviewSchema = new Schema<IProductReview>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tags: [{
    type: String,
    trim: true
  }],
  variants: [variantSchema],
  images: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  reviews: [reviewSchema],
  seoTitle: {
    type: String,
    trim: true,
    maxlength: 60
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: 160
  }
}, {
  timestamps: true
});

// Calculate average rating before saving
productSchema.pre('save', function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
});

export default mongoose.model<IProduct>('Product', productSchema);
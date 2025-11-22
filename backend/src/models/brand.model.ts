import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  website?: string;
  establishedYear?: number;
  country?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Social Media Links
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    pinterest?: string;
  };
  
  // Statistics
  productCount: number;
  averageRating?: number;
  totalReviews?: number;
  totalSales?: number;
  
  // Metadata
  metadata?: Map<string, any>;
  tags?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    logo: {
      type: String,
      trim: true
    },
    banner: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Invalid website URL'
      }
    },
    establishedYear: {
      type: Number,
      min: [1800, 'Established year must be after 1800'],
      max: [new Date().getFullYear(), 'Established year cannot be in the future']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country name cannot exceed 100 characters']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true
    },
    
    // SEO
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'SEO title cannot exceed 70 characters']
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    seoKeywords: [{
      type: String,
      trim: true
    }],
    
    // Social Media Links
    socialLinks: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      youtube: { type: String, trim: true },
      pinterest: { type: String, trim: true }
    },
    
    // Statistics (updated by background jobs)
    productCount: {
      type: Number,
      default: 0,
      min: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Metadata
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1, isFeatured: 1 });
brandSchema.index({ sortOrder: 1 });
brandSchema.index({ productCount: -1 });
brandSchema.index({ averageRating: -1 });
brandSchema.index({ totalSales: -1 });
brandSchema.index({ tags: 1 });
brandSchema.index({ createdAt: -1 });

// Text search index
brandSchema.index({ 
  name: 'text', 
  description: 'text',
  tags: 'text'
});

// Virtual for products
brandSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brand'
});

// Pre-save hook to generate slug if not provided
brandSchema.pre('save', async function(next) {
  if (this.isNew && !this.slug) {
    const slugify = (text: string) => text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let baseSlug = slugify(this.name);
    let slug = baseSlug;
    let counter = 1;
    
    // Check for unique slug
    while (await mongoose.models.Brand.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

// Static methods
brandSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

brandSchema.statics.findFeatured = function(limit: number = 10) {
  return this.find({ isActive: true, isFeatured: true })
    .sort({ sortOrder: 1 })
    .limit(limit);
};

brandSchema.statics.searchBrands = function(query: string) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

const Brand = mongoose.model<IBrand>('Brand', brandSchema);

export default Brand;

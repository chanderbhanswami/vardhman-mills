import mongoose, { Document, Schema } from 'mongoose';

// CMS Block Interface
export interface ICMSBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'hero' | 'gallery' | 'form' | 'product_grid' | 'custom';
  name?: string;
  content?: any; // Flexible content based on block type
  settings?: {
    alignment?: string;
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    textColor?: string;
    customCSS?: string;
    animation?: string;
    visibility?: {
      desktop?: boolean;
      tablet?: boolean;
      mobile?: boolean;
    };
  };
  sortOrder: number;
  isActive: boolean;
}

// CMS Page Interface
export interface ICMSPage extends Document {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  type: 'page' | 'landing' | 'article' | 'custom';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  
  // Blocks
  blocks: ICMSBlock[];
  
  // Layout & Design
  layout: {
    template?: string;
    theme?: string;
    customCSS?: string;
    customJS?: string;
    sidebar?: 'left' | 'right' | 'both' | 'none';
    header?: boolean;
    footer?: boolean;
    breadcrumbs?: boolean;
  };
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    robots?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    structuredData?: any;
  };
  
  // Access Control
  accessControl: {
    roles?: string[];
    users?: mongoose.Types.ObjectId[];
    requireLogin?: boolean;
  };
  
  // Media
  featuredImage?: string;
  featuredVideo?: string;
  
  // Taxonomy
  categories?: string[];
  tags?: string[];
  
  // Publishing
  publishedAt?: Date;
  scheduledAt?: Date;
  expiresAt?: Date;
  
  // Versioning
  version: number;
  parentVersion?: mongoose.Types.ObjectId;
  versionHistory?: {
    version: number;
    createdAt: Date;
    createdBy: mongoose.Types.ObjectId;
    changes: string;
  }[];
  
  // Analytics
  analytics: {
    views: number;
    uniqueViews: number;
    avgTimeOnPage?: number;
    bounceRate?: number;
    lastViewedAt?: Date;
  };
  
  // Author
  author: mongoose.Types.ObjectId;
  editor?: mongoose.Types.ObjectId;
  lastEditedAt?: Date;
  
  // Localization
  language?: string;
  translationKey?: string;
  translations?: {
    language: string;
    pageId: mongoose.Types.ObjectId;
  }[];
  
  // Metadata
  metadata?: Map<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const cmsBlockSchema = new Schema<ICMSBlock>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'image', 'video', 'hero', 'gallery', 'form', 'product_grid', 'custom']
  },
  name: { type: String, trim: true },
  content: { type: Schema.Types.Mixed },
  settings: {
    alignment: { type: String },
    padding: { type: String },
    margin: { type: String },
    backgroundColor: { type: String },
    textColor: { type: String },
    customCSS: { type: String },
    animation: { type: String },
    visibility: {
      desktop: { type: Boolean, default: true },
      tablet: { type: Boolean, default: true },
      mobile: { type: Boolean, default: true }
    }
  },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const cmsPageSchema = new Schema<ICMSPage>(
  {
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-\/]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and slashes']
    },
    content: {
      type: String,
      trim: true
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    type: {
      type: String,
      required: true,
      enum: ['page', 'landing', 'article', 'custom'],
      default: 'page'
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'draft',
      index: true
    },
    visibility: {
      type: String,
      required: true,
      enum: ['public', 'private', 'password'],
      default: 'public'
    },
    password: {
      type: String,
      select: false
    },
    
    // Blocks
    blocks: [cmsBlockSchema],
    
    // Layout & Design
    layout: {
      template: { type: String, default: 'default' },
      theme: { type: String, default: 'default' },
      customCSS: { type: String },
      customJS: { type: String },
      sidebar: { 
        type: String, 
        enum: ['left', 'right', 'both', 'none'],
        default: 'none'
      },
      header: { type: Boolean, default: true },
      footer: { type: Boolean, default: true },
      breadcrumbs: { type: Boolean, default: true }
    },
    
    // SEO
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 70 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      metaKeywords: [{ type: String, trim: true }],
      canonicalUrl: { type: String, trim: true },
      robots: { type: String, default: 'index,follow' },
      ogTitle: { type: String, trim: true },
      ogDescription: { type: String, trim: true },
      ogImage: { type: String, trim: true },
      ogType: { type: String, default: 'website' },
      twitterCard: { type: String, default: 'summary_large_image' },
      twitterTitle: { type: String, trim: true },
      twitterDescription: { type: String, trim: true },
      twitterImage: { type: String, trim: true },
      structuredData: { type: Schema.Types.Mixed }
    },
    
    // Access Control
    accessControl: {
      roles: [{ type: String }],
      users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      requireLogin: { type: Boolean, default: false }
    },
    
    // Media
    featuredImage: { type: String, trim: true },
    featuredVideo: { type: String, trim: true },
    
    // Taxonomy
    categories: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true, lowercase: true }],
    
    // Publishing
    publishedAt: { type: Date },
    scheduledAt: { type: Date },
    expiresAt: { type: Date },
    
    // Versioning
    version: { type: Number, default: 1 },
    parentVersion: { type: Schema.Types.ObjectId, ref: 'CMSPage' },
    versionHistory: [{
      version: { type: Number },
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
      changes: { type: String }
    }],
    
    // Analytics
    analytics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      avgTimeOnPage: { type: Number },
      bounceRate: { type: Number },
      lastViewedAt: { type: Date }
    },
    
    // Author
    author: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    editor: { type: Schema.Types.ObjectId, ref: 'User' },
    lastEditedAt: { type: Date },
    
    // Localization
    language: { type: String, default: 'en' },
    translationKey: { type: String },
    translations: [{
      language: { type: String },
      pageId: { type: Schema.Types.ObjectId, ref: 'CMSPage' }
    }],
    
    // Metadata
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
cmsPageSchema.index({ slug: 1 });
cmsPageSchema.index({ status: 1, publishedAt: -1 });
cmsPageSchema.index({ type: 1, status: 1 });
cmsPageSchema.index({ author: 1 });
cmsPageSchema.index({ categories: 1 });
cmsPageSchema.index({ tags: 1 });
cmsPageSchema.index({ 'analytics.views': -1 });
cmsPageSchema.index({ createdAt: -1 });
cmsPageSchema.index({ publishedAt: -1 });

// Text search index
cmsPageSchema.index({ 
  title: 'text', 
  content: 'text',
  excerpt: 'text',
  tags: 'text'
});

// Pre-save hook to auto-generate slug
cmsPageSchema.pre('save', async function(next) {
  if (this.isNew && !this.slug) {
    const slugify = (text: string) => text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let baseSlug = slugify(this.title);
    let slug = baseSlug;
    let counter = 1;
    
    while (await mongoose.models.CMSPage.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Auto-publish if status is published and publishedAt is not set
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static methods
cmsPageSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published',
    $or: [
      { publishedAt: { $lte: new Date() } },
      { publishedAt: { $exists: false } }
    ]
  });
};

cmsPageSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug, status: 'published' });
};

const CMSPage = mongoose.model<ICMSPage>('CMSPage', cmsPageSchema);

export default CMSPage;

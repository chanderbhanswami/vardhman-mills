import mongoose, { Document, Schema } from 'mongoose';

export interface IMediaAsset extends Document {
  name: string;
  slug: string;
  
  // File Information
  originalName: string;
  fileName: string;
  url: string;
  cdnUrl?: string;
  thumbnailUrl?: string;
  
  // File Details
  mimeType: string;
  fileSize: number; // in bytes
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  extension: string;
  
  // Image Specific
  dimensions?: {
    width: number;
    height: number;
  };
  
  // Variants (for responsive images)
  variants?: Array<{
    name: string; // e.g., 'thumbnail', 'small', 'medium', 'large'
    url: string;
    width?: number;
    height?: number;
    fileSize: number;
  }>;
  
  // Organization
  folder?: string;
  path?: string;
  tags: string[];
  categories: string[];
  
  // Metadata
  altText?: string;
  caption?: string;
  description?: string;
  title?: string;
  
  // SEO
  seo: {
    keywords?: string[];
    focusKeyword?: string;
  };
  
  // Usage
  usageCount: number;
  usedIn: Array<{
    type: 'product' | 'category' | 'blog' | 'page' | 'banner' | 'hero' | 'collection' | 'other';
    referenceId: mongoose.Types.ObjectId;
    referenceName?: string;
  }>;
  
  // CDN & Optimization
  cdnProvider?: 'cloudinary' | 'aws-s3' | 'azure' | 'local';
  isOptimized: boolean;
  optimizationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  originalSize?: number;
  optimizedSize?: number;
  compressionRatio?: number;
  
  // Status
  status: 'active' | 'archived' | 'deleted';
  isPublic: boolean;
  
  // Analytics
  analytics: {
    views: number;
    downloads: number;
    lastAccessed?: Date;
  };
  
  // Author
  uploadedBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Metadata
  metadata?: Map<string, any>;
  exifData?: Map<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    name: {
      type: String,
      required: [true, 'Media asset name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    cdnUrl: {
      type: String,
      trim: true
    },
    thumbnailUrl: {
      type: String,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    fileType: {
      type: String,
      required: true,
      enum: ['image', 'video', 'audio', 'document', 'other']
    },
    extension: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number }
    },
    variants: [{
      name: { type: String, required: true, trim: true },
      url: { type: String, required: true, trim: true },
      width: { type: Number },
      height: { type: Number },
      fileSize: { type: Number, required: true }
    }],
    folder: {
      type: String,
      trim: true
    },
    path: {
      type: String,
      trim: true
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    categories: [{ type: String, trim: true }],
    altText: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    seo: {
      keywords: [{ type: String, trim: true }],
      focusKeyword: { type: String, trim: true }
    },
    usageCount: {
      type: Number,
      default: 0
    },
    usedIn: [{
      type: {
        type: String,
        enum: ['product', 'category', 'blog', 'page', 'banner', 'hero', 'collection', 'other']
      },
      referenceId: {
        type: Schema.Types.ObjectId,
        required: true
      },
      referenceName: { type: String, trim: true }
    }],
    cdnProvider: {
      type: String,
      enum: ['cloudinary', 'aws-s3', 'azure', 'local']
    },
    isOptimized: {
      type: Boolean,
      default: false
    },
    optimizationStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed']
    },
    originalSize: { type: Number },
    optimizedSize: { type: Number },
    compressionRatio: { type: Number },
    status: {
      type: String,
      required: true,
      enum: ['active', 'archived', 'deleted'],
      default: 'active'
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    analytics: {
      views: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      lastAccessed: { type: Date }
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    },
    exifData: {
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
mediaAssetSchema.index({ slug: 1 });
mediaAssetSchema.index({ status: 1 });
mediaAssetSchema.index({ fileType: 1 });
mediaAssetSchema.index({ folder: 1 });
mediaAssetSchema.index({ tags: 1 });
mediaAssetSchema.index({ categories: 1 });
mediaAssetSchema.index({ uploadedBy: 1 });
mediaAssetSchema.index({ createdAt: -1 });
mediaAssetSchema.index({ 'analytics.views': -1 });
mediaAssetSchema.index({ 'analytics.downloads': -1 });

// Auto-generate slug
mediaAssetSchema.pre('save', async function(next) {
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
    
    while (await mongoose.models.MediaAsset.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Calculate compression ratio if both sizes exist
  if (this.originalSize && this.optimizedSize) {
    this.compressionRatio = Math.round((1 - this.optimizedSize / this.originalSize) * 100);
  }
  
  next();
});

// Virtual for file size in human readable format
mediaAssetSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

const MediaAsset = mongoose.model<IMediaAsset>('MediaAsset', mediaAssetSchema);

export default MediaAsset;

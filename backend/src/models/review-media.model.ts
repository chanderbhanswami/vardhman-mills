import mongoose, { Document, Schema, Model } from 'mongoose';

// ============================================================================
// INTERFACES
// ============================================================================

export type MediaType = 'image' | 'video';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type ProcessingStatus = 'uploading' | 'processing' | 'completed' | 'failed';
export type StorageProvider = 'local' | 'cloudinary' | 's3' | 'gcs';
export type MediaQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface IMediaFormat {
  format: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
  quality: MediaQuality;
}

export interface IMediaThumbnail {
  size: string;
  url: string;
  width: number;
  height: number;
}

export interface IMediaFlag {
  type: 'inappropriate' | 'spam' | 'copyright' | 'quality' | 'offensive' | 'other';
  reason: string;
  flaggedBy: mongoose.Types.ObjectId;
  flaggedAt: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'dismissed';
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

export interface IProcessingTask {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface IReviewMedia extends Document {
  review: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  
  // Media info
  type: MediaType;
  url: string;
  originalUrl: string;
  filename: string;
  
  // Metadata
  metadata: {
    size: number;
    width?: number;
    height?: number;
    duration?: number;
    format: string;
    quality: MediaQuality;
    encoding?: string;
    compression?: number;
  };
  
  // Analytics
  analytics: {
    views: number;
    likes: number;
    shares: number;
    downloads: number;
    reports: number;
    engagementRate: number;
    averageViewTime?: number;
  };
  
  // Moderation
  moderation: {
    status: ModerationStatus;
    moderatedBy?: mongoose.Types.ObjectId;
    moderatedAt?: Date;
    rejectionReason?: string;
    flags: IMediaFlag[];
    autoModerationScore: number;
    humanReviewRequired: boolean;
  };
  
  // Optimization
  optimization: {
    isOptimized: boolean;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    formats: IMediaFormat[];
    thumbnails: IMediaThumbnail[];
    optimizedAt?: Date;
  };
  
  // Accessibility
  accessibility: {
    altText: string;
    caption?: string;
    transcript?: string;
    audioDescription?: string;
    colorContrast?: number;
    readabilityScore?: number;
  };
  
  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
    structuredData?: Map<string, any>;
  };
  
  // Usage
  usage: {
    featured: boolean;
    showcaseOrder?: number;
    categories: string[];
    tags: string[];
    collections: string[];
  };
  
  // Storage
  storage: {
    provider: StorageProvider;
    bucket?: string;
    path: string;
    cdn: boolean;
    cdnUrl?: string;
    backupUrls: string[];
  };
  
  // Processing
  processing: {
    status: ProcessingStatus;
    progress: number;
    tasks: IProcessingTask[];
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
  };
  
  // Watermark
  watermark?: {
    enabled: boolean;
    text?: string;
    imageUrl?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
    appliedAt?: Date;
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SCHEMA
// ============================================================================

const MediaFlagSchema = new Schema<IMediaFlag>({
  type: {
    type: String,
    enum: ['inappropriate', 'spam', 'copyright', 'quality', 'offensive', 'other'],
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

const MediaFormatSchema = new Schema<IMediaFormat>({
  format: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  width: { type: Number },
  height: { type: Number },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'ultra'],
    default: 'medium'
  }
}, { _id: false });

const MediaThumbnailSchema = new Schema<IMediaThumbnail>({
  size: { type: String, required: true },
  url: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true }
}, { _id: false });

const ProcessingTaskSchema = new Schema<IProcessingTask>({
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  error: { type: String }
}, { _id: false });

const ReviewMediaSchema = new Schema<IReviewMedia>({
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
  type: {
    type: String,
    enum: ['image', 'video'],
    required: [true, 'Media type is required']
  },
  url: {
    type: String,
    required: [true, 'URL is required']
  },
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  metadata: {
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    format: { type: String, required: true },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high', 'ultra'],
      default: 'medium'
    },
    encoding: { type: String },
    compression: { type: Number }
  },
  analytics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    reports: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    averageViewTime: { type: Number }
  },
  moderation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
      index: true
    },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
    rejectionReason: { type: String },
    flags: [MediaFlagSchema],
    autoModerationScore: { type: Number, default: 0, min: 0, max: 100 },
    humanReviewRequired: { type: Boolean, default: false }
  },
  optimization: {
    isOptimized: { type: Boolean, default: false },
    originalSize: { type: Number, default: 0 },
    compressedSize: { type: Number, default: 0 },
    compressionRatio: { type: Number, default: 0 },
    formats: [MediaFormatSchema],
    thumbnails: [MediaThumbnailSchema],
    optimizedAt: { type: Date }
  },
  accessibility: {
    altText: { type: String, required: true },
    caption: { type: String },
    transcript: { type: String },
    audioDescription: { type: String },
    colorContrast: { type: Number },
    readabilityScore: { type: Number }
  },
  seo: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [String],
    structuredData: { type: Map, of: Schema.Types.Mixed }
  },
  usage: {
    featured: { type: Boolean, default: false, index: true },
    showcaseOrder: { type: Number },
    categories: [String],
    tags: { type: [String], index: true },
    collections: [String]
  },
  storage: {
    provider: {
      type: String,
      enum: ['local', 'cloudinary', 's3', 'gcs'],
      required: true
    },
    bucket: { type: String },
    path: { type: String, required: true },
    cdn: { type: Boolean, default: false },
    cdnUrl: { type: String },
    backupUrls: [String]
  },
  processing: {
    status: {
      type: String,
      enum: ['uploading', 'processing', 'completed', 'failed'],
      default: 'uploading'
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    tasks: [ProcessingTaskSchema],
    startedAt: { type: Date },
    completedAt: { type: Date },
    error: { type: String }
  },
  watermark: {
    enabled: { type: Boolean, default: false },
    text: { type: String },
    imageUrl: { type: String },
    position: {
      type: String,
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
      default: 'bottom-right'
    },
    opacity: { type: Number, default: 0.5, min: 0, max: 1 },
    appliedAt: { type: Date }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ReviewMediaSchema.index({ review: 1, type: 1 });
ReviewMediaSchema.index({ user: 1, createdAt: -1 });
ReviewMediaSchema.index({ product: 1, 'moderation.status': 1 });
ReviewMediaSchema.index({ 'usage.featured': 1, 'analytics.views': -1 });
ReviewMediaSchema.index({ 'analytics.likes': -1 });
ReviewMediaSchema.index({ createdAt: -1 });

// Text search index
ReviewMediaSchema.index({
  'accessibility.altText': 'text',
  'accessibility.caption': 'text',
  'seo.title': 'text',
  'seo.description': 'text'
});

// Pre-save middleware
ReviewMediaSchema.pre('save', function(next) {
  // Calculate compression ratio
  if (this.optimization.originalSize > 0 && this.optimization.compressedSize > 0) {
    this.optimization.compressionRatio = 
      ((this.optimization.originalSize - this.optimization.compressedSize) / 
       this.optimization.originalSize) * 100;
  }
  
  // Calculate engagement rate
  const totalInteractions = this.analytics.likes + this.analytics.shares + 
                           this.analytics.downloads;
  if (this.analytics.views > 0) {
    this.analytics.engagementRate = (totalInteractions / this.analytics.views) * 100;
  }
  
  // Auto-moderate based on score
  if (this.moderation.autoModerationScore >= 80 && !this.moderation.humanReviewRequired) {
    this.moderation.status = 'approved';
  } else if (this.moderation.autoModerationScore < 30) {
    this.moderation.status = 'flagged';
    this.moderation.humanReviewRequired = true;
  }
  
  next();
});

// Static methods
ReviewMediaSchema.statics.getByReview = function(reviewId: mongoose.Types.ObjectId) {
  return this.find({ review: reviewId, isActive: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
};

ReviewMediaSchema.statics.getFeatured = function(limit: number = 10) {
  return this.find({ 
    'usage.featured': true, 
    'moderation.status': 'approved',
    isActive: true 
  })
    .sort({ 'usage.showcaseOrder': 1, 'analytics.views': -1 })
    .limit(limit)
    .populate('review')
    .populate('user', 'name avatar')
    .populate('product', 'name slug image');
};

ReviewMediaSchema.statics.getModerationQueue = function(
  status: ModerationStatus = 'pending'
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

export const ReviewMedia = mongoose.model<IReviewMedia>('ReviewMedia', ReviewMediaSchema);

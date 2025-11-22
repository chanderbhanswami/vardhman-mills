import mongoose, { Document, Schema, Model, Query } from 'mongoose';

// ============================================================================
// INTERFACES
// ============================================================================

export type FileUploadType = 
  | 'image' 
  | 'document' 
  | 'video' 
  | 'audio' 
  | 'archive' 
  | 'text' 
  | 'other';

export type UploadStatus = 
  | 'pending' 
  | 'uploading' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type StorageProvider = 
  | 'local' 
  | 'aws-s3' 
  | 'google-cloud' 
  | 'azure-blob' 
  | 'cloudinary';

export interface IThumbnail {
  size: string;
  url: string;
  width: number;
  height: number;
  format?: string;
}

export interface IVersion {
  version: string;
  url: string;
  size: number;
  format: string;
  quality?: string;
  createdAt: Date;
}

export interface IMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  codec?: string;
  dimensions?: string;
  colorSpace?: string;
  orientation?: number;
  aspectRatio?: string;
  frameRate?: number;
  channels?: number;
  sampleRate?: number;
  [key: string]: any;
}

export interface IFileUpload extends Document {
  originalName: string;
  fileName: string;
  filePath: string;
  url: string;
  publicId?: string;
  mimeType: string;
  size: number;
  type: FileUploadType;
  status: UploadStatus;
  progress: number;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  metadata: IMetadata;
  thumbnails: IThumbnail[];
  versions: IVersion[];
  tags: string[];
  category?: string;
  description?: string;
  altText?: string;
  isPublic: boolean;
  expiresAt?: Date;
  downloadCount: number;
  lastDownloaded?: Date;
  storageProvider: StorageProvider;
  storageLocation?: string;
  checksum?: string;
  cdnUrl?: string;
  folder?: mongoose.Types.ObjectId;
  parentFolder?: mongoose.Types.ObjectId;
  error?: string;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  processingTime?: number;
  formattedSize: string;
  isExpired: boolean;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  isDocument: boolean;
}

export interface IUploadFolder extends Document {
  name: string;
  description?: string;
  path: string;
  parentId?: mongoose.Types.ObjectId;
  depth: number;
  isPublic: boolean;
  color?: string;
  icon?: string;
  createdBy: mongoose.Types.ObjectId;
  permissions: Array<{
    userId: mongoose.Types.ObjectId;
    role: 'viewer' | 'editor' | 'admin';
  }>;
  fileCount: number;
  totalSize: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  fullPath: string;
}

export interface IUploadConfig extends Document {
  maxFileSize: number;
  maxTotalSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  enableCompression: boolean;
  compressionQuality: number;
  generateThumbnails: boolean;
  thumbnailSizes: Array<{
    name: string;
    width: number;
    height: number;
    crop: boolean;
  }>;
  enableWatermark: boolean;
  watermarkSettings: {
    text?: string;
    image?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
    size: number;
  };
  enableVirusScan: boolean;
  autoTagging: boolean;
  generateMetadata: boolean;
  enableVersioning: boolean;
  storageProvider: StorageProvider;
  cdn: {
    enabled: boolean;
    baseUrl?: string;
    enableOptimization: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SCHEMAS
// ============================================================================

const ThumbnailSchema = new Schema<IThumbnail>({
  size: { type: String, required: true },
  url: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  format: { type: String }
}, { _id: false });

const VersionSchema = new Schema<IVersion>({
  version: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  format: { type: String, required: true },
  quality: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const FileUploadSchema = new Schema<IFileUpload>({
  originalName: { 
    type: String, 
    required: [true, 'Original file name is required'],
    trim: true 
  },
  fileName: { 
    type: String, 
    required: [true, 'File name is required'],
    trim: true 
  },
  filePath: { 
    type: String, 
    required: [true, 'File path is required'] 
  },
  url: { 
    type: String, 
    required: [true, 'File URL is required'] 
  },
  publicId: { 
    type: String, 
    index: true 
  },
  mimeType: { 
    type: String, 
    required: [true, 'MIME type is required'] 
  },
  size: { 
    type: Number, 
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  type: { 
    type: String, 
    enum: {
      values: ['image', 'document', 'video', 'audio', 'archive', 'text', 'other'],
      message: '{VALUE} is not a valid file type'
    },
    required: [true, 'File type is required']
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'uploading', 'processing', 'completed', 'failed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  progress: { 
    type: Number, 
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100']
  },
  uploadedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Uploader is required'],
    index: true
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  thumbnails: {
    type: [ThumbnailSchema],
    default: []
  },
  versions: {
    type: [VersionSchema],
    default: []
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  category: { 
    type: String,
    trim: true,
    index: true
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  altText: { 
    type: String,
    trim: true,
    maxlength: [500, 'Alt text cannot exceed 500 characters']
  },
  isPublic: { 
    type: Boolean, 
    default: false,
    index: true
  },
  expiresAt: { 
    type: Date,
    index: true
  },
  downloadCount: { 
    type: Number, 
    default: 0,
    min: [0, 'Download count cannot be negative']
  },
  lastDownloaded: { 
    type: Date 
  },
  storageProvider: { 
    type: String, 
    enum: {
      values: ['local', 'aws-s3', 'google-cloud', 'azure-blob', 'cloudinary'],
      message: '{VALUE} is not a valid storage provider'
    },
    default: 'cloudinary'
  },
  storageLocation: { 
    type: String 
  },
  checksum: { 
    type: String,
    index: true
  },
  cdnUrl: { 
    type: String 
  },
  folder: { 
    type: Schema.Types.ObjectId, 
    ref: 'UploadFolder',
    index: true
  },
  parentFolder: { 
    type: Schema.Types.ObjectId, 
    ref: 'UploadFolder'
  },
  error: { 
    type: String 
  },
  processingStartedAt: { 
    type: Date 
  },
  processingCompletedAt: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
FileUploadSchema.index({ type: 1, status: 1 });
FileUploadSchema.index({ uploadedBy: 1, uploadedAt: -1 });
FileUploadSchema.index({ folder: 1, type: 1 });
FileUploadSchema.index({ isPublic: 1, status: 1 });
FileUploadSchema.index({ expiresAt: 1 }, { sparse: true });
FileUploadSchema.index({ createdAt: -1 });
FileUploadSchema.index({ 'tags': 1 });
FileUploadSchema.index({ downloadCount: -1 });

// Text search index
FileUploadSchema.index({
  originalName: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual: Processing time
FileUploadSchema.virtual('processingTime').get(function(this: IFileUpload) {
  if (this.processingStartedAt && this.processingCompletedAt) {
    return this.processingCompletedAt.getTime() - this.processingStartedAt.getTime();
  }
  return undefined;
});

// Virtual: Formatted size
FileUploadSchema.virtual('formattedSize').get(function(this: IFileUpload) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (this.size === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual: Is expired
FileUploadSchema.virtual('isExpired').get(function(this: IFileUpload) {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

// Virtual: Is image
FileUploadSchema.virtual('isImage').get(function(this: IFileUpload) {
  return this.type === 'image';
});

// Virtual: Is video
FileUploadSchema.virtual('isVideo').get(function(this: IFileUpload) {
  return this.type === 'video';
});

// Virtual: Is audio
FileUploadSchema.virtual('isAudio').get(function(this: IFileUpload) {
  return this.type === 'audio';
});

// Virtual: Is document
FileUploadSchema.virtual('isDocument').get(function(this: IFileUpload) {
  return this.type === 'document';
});

// Pre-save middleware
FileUploadSchema.pre('save', function(this: IFileUpload, next) {
  // Auto-detect file type from MIME type if not set
  if (!this.type) {
    const mimeType = this.mimeType.toLowerCase();
    if (mimeType.startsWith('image/')) this.type = 'image';
    else if (mimeType.startsWith('video/')) this.type = 'video';
    else if (mimeType.startsWith('audio/')) this.type = 'audio';
    else if (mimeType.startsWith('text/')) this.type = 'text';
    else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('presentation')) {
      this.type = 'document';
    } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) {
      this.type = 'archive';
    } else {
      this.type = 'other';
    }
  }

  // Set dimensions string for images
  if (this.type === 'image' && this.metadata.width && this.metadata.height) {
    this.metadata.dimensions = `${this.metadata.width}x${this.metadata.height}`;
    this.metadata.aspectRatio = (this.metadata.width / this.metadata.height).toFixed(2);
  }

  // Set processing completed time if status changed to completed
  if (this.isModified('status') && this.status === 'completed' && !this.processingCompletedAt) {
    this.processingCompletedAt = new Date();
  }

  // Set processing started time if status changed to processing
  if (this.isModified('status') && this.status === 'processing' && !this.processingStartedAt) {
    this.processingStartedAt = new Date();
  }

  next();
});

// Static methods
FileUploadSchema.statics.getByUser = function(
  this: Model<IFileUpload>, 
  userId: mongoose.Types.ObjectId
): Query<IFileUpload[], IFileUpload> {
  return this.find({ uploadedBy: userId, status: 'completed' }).sort({ uploadedAt: -1 });
};

FileUploadSchema.statics.getByType = function(
  this: Model<IFileUpload>, 
  type: FileUploadType
): Query<IFileUpload[], IFileUpload> {
  return this.find({ type, status: 'completed' }).sort({ uploadedAt: -1 });
};

FileUploadSchema.statics.getExpired = function(
  this: Model<IFileUpload>
): Query<IFileUpload[], IFileUpload> {
  return this.find({ 
    expiresAt: { $lte: new Date() },
    status: 'completed'
  });
};

FileUploadSchema.statics.cleanup = async function(this: Model<IFileUpload>): Promise<number> {
  const result = await this.deleteMany({ 
    expiresAt: { $lte: new Date() }
  });
  return result.deletedCount || 0;
};

// ============================================================================
// UPLOAD FOLDER SCHEMA
// ============================================================================

const UploadFolderSchema = new Schema<IUploadFolder>({
  name: { 
    type: String, 
    required: [true, 'Folder name is required'],
    trim: true,
    maxlength: [255, 'Folder name cannot exceed 255 characters']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  path: { 
    type: String, 
    required: [true, 'Folder path is required'],
    unique: true,
    index: true
  },
  parentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'UploadFolder',
    index: true
  },
  depth: { 
    type: Number, 
    default: 0,
    min: [0, 'Depth cannot be negative']
  },
  isPublic: { 
    type: Boolean, 
    default: false,
    index: true
  },
  color: { 
    type: String 
  },
  icon: { 
    type: String 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Creator is required'],
    index: true
  },
  permissions: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { 
      type: String, 
      enum: ['viewer', 'editor', 'admin'],
      required: true
    }
  }],
  fileCount: { 
    type: Number, 
    default: 0,
    min: [0, 'File count cannot be negative']
  },
  totalSize: { 
    type: Number, 
    default: 0,
    min: [0, 'Total size cannot be negative']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UploadFolderSchema.index({ createdBy: 1, parentId: 1 });
UploadFolderSchema.index({ isPublic: 1, depth: 1 });

// Virtual: Full path
UploadFolderSchema.virtual('fullPath').get(function(this: IUploadFolder) {
  return this.path;
});

// Pre-save middleware
UploadFolderSchema.pre('save', async function(this: IUploadFolder, next) {
  // Calculate depth and path from parent
  if (this.isNew && this.parentId) {
    const parent = await (this.constructor as Model<IUploadFolder>).findById(this.parentId);
    if (parent) {
      this.depth = parent.depth + 1;
      this.path = `${parent.path}/${this.name}`;
    }
  } else if (this.isNew) {
    this.depth = 0;
    this.path = `/${this.name}`;
  }

  next();
});

// ============================================================================
// UPLOAD CONFIG SCHEMA
// ============================================================================

const UploadConfigSchema = new Schema<IUploadConfig>({
  maxFileSize: { 
    type: Number, 
    default: 10485760, // 10MB
    min: [0, 'Max file size cannot be negative']
  },
  maxTotalSize: { 
    type: Number, 
    default: 104857600, // 100MB
    min: [0, 'Max total size cannot be negative']
  },
  allowedMimeTypes: {
    type: [String],
    default: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'video/mp4', 'video/mpeg',
      'audio/mpeg', 'audio/wav'
    ]
  },
  allowedExtensions: {
    type: [String],
    default: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.mp4', '.mpeg', '.mp3', '.wav']
  },
  enableCompression: { 
    type: Boolean, 
    default: true 
  },
  compressionQuality: { 
    type: Number, 
    default: 80,
    min: [0, 'Compression quality cannot be less than 0'],
    max: [100, 'Compression quality cannot exceed 100']
  },
  generateThumbnails: { 
    type: Boolean, 
    default: true 
  },
  thumbnailSizes: {
    type: [{
      name: { type: String, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      crop: { type: Boolean, default: false }
    }],
    default: [
      { name: 'small', width: 150, height: 150, crop: true },
      { name: 'medium', width: 300, height: 300, crop: true },
      { name: 'large', width: 600, height: 600, crop: false }
    ]
  },
  enableWatermark: { 
    type: Boolean, 
    default: false 
  },
  watermarkSettings: {
    text: { type: String },
    image: { type: String },
    position: { 
      type: String, 
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
      default: 'bottom-right'
    },
    opacity: { 
      type: Number, 
      default: 0.5,
      min: [0, 'Opacity cannot be less than 0'],
      max: [1, 'Opacity cannot exceed 1']
    },
    size: { 
      type: Number, 
      default: 20,
      min: [1, 'Size must be at least 1']
    }
  },
  enableVirusScan: { 
    type: Boolean, 
    default: false 
  },
  autoTagging: { 
    type: Boolean, 
    default: false 
  },
  generateMetadata: { 
    type: Boolean, 
    default: true 
  },
  enableVersioning: { 
    type: Boolean, 
    default: false 
  },
  storageProvider: { 
    type: String, 
    enum: ['local', 'aws-s3', 'google-cloud', 'azure-blob', 'cloudinary'],
    default: 'cloudinary'
  },
  cdn: {
    enabled: { type: Boolean, default: false },
    baseUrl: { type: String },
    enableOptimization: { type: Boolean, default: true }
  }
}, { 
  timestamps: true 
});

// ============================================================================
// MODELS
// ============================================================================

export const FileUpload = mongoose.model<IFileUpload>('FileUpload', FileUploadSchema);
export const UploadFolder = mongoose.model<IUploadFolder>('UploadFolder', UploadFolderSchema);
export const UploadConfig = mongoose.model<IUploadConfig>('UploadConfig', UploadConfigSchema);

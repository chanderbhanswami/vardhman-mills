import mongoose, { Document, Schema } from 'mongoose';

export interface ICMSTemplate extends Document {
  name: string;
  slug: string;
  description?: string;
  type: 'page' | 'email' | 'popup' | 'block' | 'custom';
  category?: string;
  
  // Template Content
  content: string;
  variables?: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'date' | 'image' | 'rich_text' | 'array' | 'object';
    defaultValue?: any;
    required?: boolean;
    description?: string;
    validation?: any;
  }[];
  
  // Layout
  layout?: {
    width?: string;
    height?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
  };
  
  // Styling
  customCSS?: string;
  customJS?: string;
  
  // Preview
  thumbnail?: string;
  previewData?: any;
  
  // Status
  status: 'draft' | 'active' | 'archived';
  isDefault?: boolean;
  
  // Usage
  usageCount: number;
  lastUsedAt?: Date;
  
  // Author
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Tags
  tags?: string[];
  
  // Metadata
  metadata?: Map<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const cmsTemplateSchema = new Schema<ICMSTemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
      type: String,
      required: true,
      enum: ['page', 'email', 'popup', 'block', 'custom'],
      default: 'page'
    },
    category: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Template content is required']
    },
    variables: [{
      name: { type: String, required: true },
      label: { type: String, required: true },
      type: { 
        type: String, 
        required: true,
        enum: ['text', 'number', 'boolean', 'date', 'image', 'rich_text', 'array', 'object']
      },
      defaultValue: { type: Schema.Types.Mixed },
      required: { type: Boolean, default: false },
      description: { type: String },
      validation: { type: Schema.Types.Mixed }
    }],
    layout: {
      width: { type: String },
      height: { type: String },
      backgroundColor: { type: String },
      padding: { type: String },
      margin: { type: String }
    },
    customCSS: { type: String },
    customJS: { type: String },
    thumbnail: { type: String },
    previewData: { type: Schema.Types.Mixed },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'archived'],
      default: 'draft'
    },
    isDefault: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [{ type: String, trim: true, lowercase: true }],
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
cmsTemplateSchema.index({ slug: 1 });
cmsTemplateSchema.index({ type: 1, status: 1 });
cmsTemplateSchema.index({ category: 1 });
cmsTemplateSchema.index({ usageCount: -1 });
cmsTemplateSchema.index({ tags: 1 });

const CMSTemplate = mongoose.model<ICMSTemplate>('CMSTemplate', cmsTemplateSchema);

export default CMSTemplate;

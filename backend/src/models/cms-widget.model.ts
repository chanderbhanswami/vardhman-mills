import mongoose, { Document, Schema } from 'mongoose';

export interface ICMSWidget extends Document {
  name: string;
  slug: string;
  description?: string;
  type: 'text' | 'html' | 'image' | 'slider' | 'countdown' | 'social' | 'newsletter' | 'custom';
  
  // Content
  content?: any; // Flexible content based on widget type
  
  // Settings
  settings: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'sidebar' | 'footer' | 'custom';
    priority?: number;
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    alignment?: 'left' | 'center' | 'right';
    animation?: string;
  };
  
  // Display Rules
  displayRules: {
    pages?: string[]; // Page slugs or IDs
    excludePages?: string[];
    categories?: string[];
    tags?: string[];
    userRoles?: string[];
    requireAuth?: boolean;
    devices?: ('desktop' | 'tablet' | 'mobile')[];
    dateRange?: {
      start?: Date;
      end?: Date;
    };
    schedule?: {
      days?: number[]; // 0-6 (Sunday-Saturday)
      timeStart?: string; // HH:mm
      timeEnd?: string; // HH:mm
    };
  };
  
  // Status
  status: 'draft' | 'active' | 'scheduled' | 'archived';
  isGlobal?: boolean; // Show on all pages
  
  // Styling
  customCSS?: string;
  customJS?: string;
  
  // Analytics
  analytics: {
    impressions: number;
    clicks: number;
    ctr?: number; // Click-through rate
  };
  
  // Author
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Metadata
  metadata?: Map<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const cmsWidgetSchema = new Schema<ICMSWidget>(
  {
    name: {
      type: String,
      required: [true, 'Widget name is required'],
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
      enum: ['text', 'html', 'image', 'slider', 'countdown', 'social', 'newsletter', 'custom']
    },
    content: {
      type: Schema.Types.Mixed
    },
    settings: {
      position: {
        type: String,
        enum: ['top', 'bottom', 'left', 'right', 'sidebar', 'footer', 'custom']
      },
      priority: { type: Number, default: 0 },
      width: { type: String },
      height: { type: String },
      padding: { type: String },
      margin: { type: String },
      backgroundColor: { type: String },
      alignment: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'left'
      },
      animation: { type: String }
    },
    displayRules: {
      pages: [{ type: String }],
      excludePages: [{ type: String }],
      categories: [{ type: String }],
      tags: [{ type: String }],
      userRoles: [{ type: String }],
      requireAuth: { type: Boolean, default: false },
      devices: [{
        type: String,
        enum: ['desktop', 'tablet', 'mobile']
      }],
      dateRange: {
        start: { type: Date },
        end: { type: Date }
      },
      schedule: {
        days: [{ type: Number, min: 0, max: 6 }],
        timeStart: { type: String },
        timeEnd: { type: String }
      }
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'scheduled', 'archived'],
      default: 'draft'
    },
    isGlobal: { type: Boolean, default: false },
    customCSS: { type: String },
    customJS: { type: String },
    analytics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      ctr: { type: Number }
    },
    createdBy: {
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
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
cmsWidgetSchema.index({ slug: 1 });
cmsWidgetSchema.index({ type: 1, status: 1 });
cmsWidgetSchema.index({ 'settings.position': 1 });
cmsWidgetSchema.index({ isGlobal: 1, status: 1 });

const CMSWidget = mongoose.model<ICMSWidget>('CMSWidget', cmsWidgetSchema);

export default CMSWidget;

import mongoose, { Document, Schema } from 'mongoose';

export interface ICMSMenuItem {
  id: string;
  type: 'link' | 'page' | 'category' | 'custom' | 'dropdown' | 'megamenu';
  label: string;
  url?: string;
  pageId?: mongoose.Types.ObjectId;
  target?: '_self' | '_blank' | '_parent' | '_top';
  icon?: string;
  image?: string;
  badge?: {
    text: string;
    color: string;
  };
  description?: string;
  sortOrder: number;
  isActive: boolean;
  children?: ICMSMenuItem[];
  
  // Megamenu specific
  columns?: {
    title?: string;
    items: ICMSMenuItem[];
  }[];
  
  // Permissions
  roles?: string[];
  requireAuth?: boolean;
  
  // Styling
  cssClass?: string;
  customCSS?: string;
}

export interface ICMSMenu extends Document {
  name: string;
  slug: string;
  description?: string;
  location: 'header' | 'footer' | 'sidebar' | 'mobile' | 'custom';
  items: ICMSMenuItem[];
  
  // Settings
  settings: {
    maxDepth?: number;
    showIcons?: boolean;
    showBadges?: boolean;
    orientation?: 'horizontal' | 'vertical';
    theme?: string;
    animation?: string;
  };
  
  // Status
  status: 'draft' | 'active' | 'archived';
  isDefault?: boolean;
  
  // Styling
  customCSS?: string;
  customJS?: string;
  
  // Author
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Metadata
  metadata?: Map<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const cmsMenuItemSchema = new Schema<ICMSMenuItem>({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['link', 'page', 'category', 'custom', 'dropdown', 'megamenu']
  },
  label: { type: String, required: true, trim: true },
  url: { type: String, trim: true },
  pageId: { type: Schema.Types.ObjectId, ref: 'CMSPage' },
  target: {
    type: String,
    enum: ['_self', '_blank', '_parent', '_top'],
    default: '_self'
  },
  icon: { type: String },
  image: { type: String },
  badge: {
    text: { type: String },
    color: { type: String }
  },
  description: { type: String, trim: true },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  children: [{ type: Schema.Types.Mixed }], // Self-reference for nested items
  columns: [{
    title: { type: String },
    items: [{ type: Schema.Types.Mixed }]
  }],
  roles: [{ type: String }],
  requireAuth: { type: Boolean, default: false },
  cssClass: { type: String },
  customCSS: { type: String }
});

const cmsMenuSchema = new Schema<ICMSMenu>(
  {
    name: {
      type: String,
      required: [true, 'Menu name is required'],
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
    location: {
      type: String,
      required: true,
      enum: ['header', 'footer', 'sidebar', 'mobile', 'custom']
    },
    items: [cmsMenuItemSchema],
    settings: {
      maxDepth: { type: Number, default: 3 },
      showIcons: { type: Boolean, default: true },
      showBadges: { type: Boolean, default: true },
      orientation: {
        type: String,
        enum: ['horizontal', 'vertical'],
        default: 'horizontal'
      },
      theme: { type: String, default: 'default' },
      animation: { type: String }
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'archived'],
      default: 'draft'
    },
    isDefault: { type: Boolean, default: false },
    customCSS: { type: String },
    customJS: { type: String },
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
cmsMenuSchema.index({ slug: 1 });
cmsMenuSchema.index({ location: 1, status: 1 });

const CMSMenu = mongoose.model<ICMSMenu>('CMSMenu', cmsMenuSchema);

export default CMSMenu;

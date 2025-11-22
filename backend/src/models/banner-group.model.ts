import mongoose, { Document, Schema } from 'mongoose';

export interface IBannerGroup extends Document {
  name: string;
  description?: string;
  
  // Type
  type: 'carousel' | 'slider' | 'grid' | 'stack' | 'custom';
  
  // Position
  position: {
    page: string;
    location: string;
    priority: number;
  };
  
  // Settings
  settings: {
    autoplay?: boolean;
    autoplaySpeed?: number; // in milliseconds
    loop?: boolean;
    arrows?: boolean;
    dots?: boolean;
    fade?: boolean;
    pauseOnHover?: boolean;
    swipeable?: boolean;
    responsive?: {
      breakpoint: number;
      settings: {
        slidesToShow?: number;
        slidesToScroll?: number;
      };
    }[];
  };
  
  // Display
  display: {
    slidesToShow?: number;
    slidesToScroll?: number;
    gap?: string;
    height?: string;
    width?: string;
  };
  
  // Status
  status: 'draft' | 'active' | 'paused' | 'archived';
  isActive: boolean;
  
  // Scheduling
  publishAt?: Date;
  expiresAt?: Date;
  
  // Targeting
  targeting?: {
    devices?: ('desktop' | 'tablet' | 'mobile')[];
    userRoles?: string[];
    locations?: string[];
  };
  
  // Analytics
  analytics: {
    totalImpressions: number;
    totalClicks: number;
    averageCTR?: number;
  };
  
  // Custom Styling
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

const bannerGroupSchema = new Schema<IBannerGroup>(
  {
    name: {
      type: String,
      required: [true, 'Banner group name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['carousel', 'slider', 'grid', 'stack', 'custom'],
      default: 'carousel'
    },
    position: {
      page: { type: String, required: true },
      location: { type: String, required: true },
      priority: { type: Number, default: 0 }
    },
    settings: {
      autoplay: { type: Boolean, default: true },
      autoplaySpeed: { type: Number, default: 3000 },
      loop: { type: Boolean, default: true },
      arrows: { type: Boolean, default: true },
      dots: { type: Boolean, default: true },
      fade: { type: Boolean, default: false },
      pauseOnHover: { type: Boolean, default: true },
      swipeable: { type: Boolean, default: true },
      responsive: [{
        breakpoint: { type: Number, required: true },
        settings: {
          slidesToShow: { type: Number },
          slidesToScroll: { type: Number }
        }
      }]
    },
    display: {
      slidesToShow: { type: Number, default: 1 },
      slidesToScroll: { type: Number, default: 1 },
      gap: { type: String, default: '0px' },
      height: { type: String },
      width: { type: String }
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft'
    },
    isActive: { type: Boolean, default: false },
    publishAt: { type: Date },
    expiresAt: { type: Date },
    targeting: {
      devices: [{
        type: String,
        enum: ['desktop', 'tablet', 'mobile']
      }],
      userRoles: [{ type: String }],
      locations: [{ type: String }]
    },
    analytics: {
      totalImpressions: { type: Number, default: 0 },
      totalClicks: { type: Number, default: 0 },
      averageCTR: { type: Number }
    },
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
bannerGroupSchema.index({ status: 1, isActive: 1 });
bannerGroupSchema.index({ 'position.page': 1, 'position.location': 1, 'position.priority': -1 });
bannerGroupSchema.index({ type: 1 });

// Virtual populate for banners
bannerGroupSchema.virtual('banners', {
  ref: 'Banner',
  localField: '_id',
  foreignField: 'groupId'
});

const BannerGroup = mongoose.model<IBannerGroup>('BannerGroup', bannerGroupSchema);

export default BannerGroup;

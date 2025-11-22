import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroSection extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  
  // Content
  primaryText?: string;
  secondaryText?: string;
  tagline?: string;
  
  // Media
  backgroundType: 'image' | 'video' | 'gradient' | 'color';
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundGradient?: string;
  backgroundColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  
  // Call to Action
  cta: {
    primaryButton?: {
      text: string;
      link: string;
      style: 'primary' | 'secondary' | 'outline' | 'ghost';
      icon?: string;
    };
    secondaryButton?: {
      text: string;
      link: string;
      style: 'primary' | 'secondary' | 'outline' | 'ghost';
      icon?: string;
    };
  };
  
  // Layout & Style
  layout: {
    contentAlignment: 'left' | 'center' | 'right';
    textAlignment: 'left' | 'center' | 'right';
    height: 'small' | 'medium' | 'large' | 'full' | 'custom';
    customHeight?: string;
    contentWidth: 'narrow' | 'medium' | 'wide' | 'full';
    padding?: string;
    margin?: string;
  };
  
  // Animation
  animation?: {
    enabled: boolean;
    type: 'fade' | 'slide' | 'zoom' | 'parallax' | 'custom';
    duration?: number;
    delay?: number;
  };
  
  // Position & Display
  position: {
    page: string; // Homepage, category, product, custom
    section: 'top' | 'middle' | 'bottom' | 'custom';
    priority: number;
  };
  
  // Targeting
  targeting?: {
    devices?: ('desktop' | 'tablet' | 'mobile')[];
    userRoles?: string[];
    locations?: string[];
    dateRange?: {
      start?: Date;
      end?: Date;
    };
  };
  
  // Status
  status: 'draft' | 'active' | 'scheduled' | 'paused' | 'archived';
  isActive: boolean;
  
  // Scheduling
  publishAt?: Date;
  expiresAt?: Date;
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  
  // Analytics
  analytics: {
    impressions: number;
    clicks: number;
    ctr?: number;
    averageEngagementTime?: number;
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    variantId?: string;
    trafficPercentage?: number;
  };
  
  // Custom Settings
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

const heroSectionSchema = new Schema<IHeroSection>(
  {
    title: {
      type: String,
      required: [true, 'Hero section title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters']
    },
    description: {
      type: String,
      trim: true
    },
    primaryText: { type: String, trim: true },
    secondaryText: { type: String, trim: true },
    tagline: { type: String, trim: true },
    
    backgroundType: {
      type: String,
      required: true,
      enum: ['image', 'video', 'gradient', 'color'],
      default: 'image'
    },
    backgroundImage: { type: String, trim: true },
    backgroundVideo: { type: String, trim: true },
    backgroundGradient: { type: String, trim: true },
    backgroundColor: { type: String, trim: true },
    overlayColor: { type: String, trim: true },
    overlayOpacity: { type: Number, min: 0, max: 1, default: 0.5 },
    
    cta: {
      primaryButton: {
        text: { type: String, required: true },
        link: { type: String, required: true },
        style: {
          type: String,
          enum: ['primary', 'secondary', 'outline', 'ghost'],
          default: 'primary'
        },
        icon: { type: String }
      },
      secondaryButton: {
        text: { type: String },
        link: { type: String },
        style: {
          type: String,
          enum: ['primary', 'secondary', 'outline', 'ghost'],
          default: 'secondary'
        },
        icon: { type: String }
      }
    },
    
    layout: {
      contentAlignment: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'center'
      },
      textAlignment: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'center'
      },
      height: {
        type: String,
        enum: ['small', 'medium', 'large', 'full', 'custom'],
        default: 'large'
      },
      customHeight: { type: String },
      contentWidth: {
        type: String,
        enum: ['narrow', 'medium', 'wide', 'full'],
        default: 'medium'
      },
      padding: { type: String },
      margin: { type: String }
    },
    
    animation: {
      enabled: { type: Boolean, default: false },
      type: {
        type: String,
        enum: ['fade', 'slide', 'zoom', 'parallax', 'custom']
      },
      duration: { type: Number },
      delay: { type: Number }
    },
    
    position: {
      page: { type: String, required: true },
      section: {
        type: String,
        enum: ['top', 'middle', 'bottom', 'custom'],
        default: 'top'
      },
      priority: { type: Number, default: 0 }
    },
    
    targeting: {
      devices: [{
        type: String,
        enum: ['desktop', 'tablet', 'mobile']
      }],
      userRoles: [{ type: String }],
      locations: [{ type: String }],
      dateRange: {
        start: { type: Date },
        end: { type: Date }
      }
    },
    
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'scheduled', 'paused', 'archived'],
      default: 'draft'
    },
    isActive: { type: Boolean, default: false },
    publishAt: { type: Date },
    expiresAt: { type: Date },
    
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      metaKeywords: [{ type: String, trim: true }]
    },
    
    analytics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      ctr: { type: Number },
      averageEngagementTime: { type: Number }
    },
    
    abTest: {
      enabled: { type: Boolean, default: false },
      variantId: { type: String },
      trafficPercentage: { type: Number, min: 0, max: 100 }
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
heroSectionSchema.index({ status: 1, isActive: 1 });
heroSectionSchema.index({ 'position.page': 1, 'position.priority': -1 });
heroSectionSchema.index({ publishAt: 1, expiresAt: 1 });
heroSectionSchema.index({ createdAt: -1 });

const HeroSection = mongoose.model<IHeroSection>('HeroSection', heroSectionSchema);

export default HeroSection;

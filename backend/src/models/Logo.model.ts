import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface ILogo extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Content
  name: string;
  type: 'primary' | 'secondary' | 'favicon' | 'icon' | 'watermark' | 'email' | 'social' | 'custom';
  description?: string;
  
  // File Information
  originalFile: {
    url: string;
    publicId?: string; // Cloudinary public ID
    filename: string;
    size: number; // bytes
    mimeType: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
  
  // Variants (different sizes/formats)
  variants: Array<{
    name: string; // e.g., 'small', 'medium', 'large', 'thumbnail'
    url: string;
    publicId?: string;
    width: number;
    height: number;
    size: number;
    format: string; // e.g., 'png', 'jpg', 'webp', 'svg'
  }>;
  
  // Version Control
  version: number;
  previousVersions?: mongoose.Types.ObjectId[]; // References to old versions
  
  // Usage Tracking
  usageLocations: Array<{
    location: 'header' | 'footer' | 'email' | 'invoice' | 'favicon' | 'social' | 'custom';
    description?: string;
  }>;
  
  // Status & Settings
  isActive: boolean;
  isPrimary: boolean; // Only one primary logo per type
  
  // SEO & Accessibility
  altText: string;
  title?: string;
  
  // Metadata
  tags: string[];
  uploadedBy: mongoose.Types.ObjectId;
  
  // Timestamps
  activatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // ==================== ENHANCEMENT FIELDS ====================
  
  // Display Configuration
  displayConfig?: {
    position?: 'left' | 'center' | 'right';
    alignment?: 'top' | 'middle' | 'bottom';
    maxWidth?: number;
    maxHeight?: number;
    aspectRatio?: 'auto' | '1:1' | '16:9' | '4:3' | '3:2' | 'custom';
    customAspectRatio?: string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
    margin?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    padding?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    sticky?: {
      enabled: boolean;
      offset: number;
      shrinkRatio: number;
      minHeight: number;
    };
  };
  
  // Styling Options
  styling?: {
    backgroundColor?: string;
    borderRadius?: number;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    border?: {
      width: number;
      color: string;
      style: 'solid' | 'dashed' | 'dotted' | 'none';
    };
    opacity?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    grayscale?: number;
    blur?: number;
    hoverEffects?: {
      enabled: boolean;
      scale: number;
      opacity: number;
      brightness: number;
      transition: 'none' | 'smooth' | 'bounce' | 'elastic';
      duration: number;
    };
    scrollEffects?: {
      enabled: boolean;
      fadeIn: boolean;
      slideIn: boolean;
      scaleOnScroll: boolean;
      parallax: number;
    };
  };
  
  // Responsive Settings
  responsive?: {
    mobile?: {
      maxWidth: number;
      maxHeight: number;
      position: 'left' | 'center' | 'right';
      visible: boolean;
      variant?: string;
      shrinkOnScroll: boolean;
    };
    tablet?: {
      maxWidth: number;
      maxHeight: number;
      position: 'left' | 'center' | 'right';
      visible: boolean;
      variant?: string;
      shrinkOnScroll: boolean;
    };
    desktop?: {
      maxWidth: number;
      maxHeight: number;
      position: 'left' | 'center' | 'right';
      visible: boolean;
      variant?: string;
      shrinkOnScroll: boolean;
    };
  };
  
  // Link Configuration
  link?: {
    enabled: boolean;
    url?: string;
    target: '_self' | '_blank' | '_parent' | '_top';
    rel?: string;
    title?: string;
    trackClicks: boolean;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  
  // Navigation Integration
  navigation?: {
    integrated: boolean;
    menuPosition: 'top' | 'bottom' | 'left' | 'right';
    mobileMenuTrigger: boolean;
    breadcrumbIntegration: boolean;
    searchIntegration: boolean;
  };
  
  // Animation Settings
  animation?: {
    entrance?: {
      enabled: boolean;
      type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce' | 'rotate' | 'flip';
      direction?: 'up' | 'down' | 'left' | 'right';
      duration: number;
      delay: number;
      easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    };
    loading?: {
      type: 'skeleton' | 'shimmer' | 'pulse' | 'spinner' | 'progressive';
      color: string;
      showProgress: boolean;
    };
    interactions?: {
      hover: {
        type: 'none' | 'scale' | 'rotate' | 'bounce' | 'pulse' | 'glow';
        intensity: number;
        duration: number;
      };
      click: {
        type: 'none' | 'ripple' | 'scale' | 'shake' | 'flash';
        duration: number;
      };
    };
    scroll?: {
      parallax: {
        enabled: boolean;
        speed: number;
        direction: 'vertical' | 'horizontal';
      };
      reveal: {
        enabled: boolean;
        threshold: number;
        animation: 'fade' | 'slide' | 'zoom';
      };
    };
  };
  
  // Performance Optimization
  performance?: {
    lazyLoading?: boolean;
    preconnect?: string[];
    prefetch?: boolean;
    priority?: 'high' | 'normal' | 'low';
    optimization?: {
      webp: boolean;
      avif: boolean;
      progressive: boolean;
      quality: number;
      compression: 'lossless' | 'lossy';
    };
    caching?: {
      enabled: boolean;
      ttl: number;
      strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    };
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: Array<{
      id: string;
      name: string;
      weight: number;
      config: any;
      impressions: number;
      clicks: number;
      conversions: number;
    }>;
    winnerVariant?: string;
    testDuration?: number;
    testEndDate?: Date;
    confidenceLevel: number;
  };
  
  // Analytics & Performance
  analytics?: {
    impressions: number;
    clicks: number;
    ctr: number;
    loadTime: number;
    renderTime: number;
    lcp: number;
    cls: number;
    errorRate: number;
    hoverCount: number;
    hoverDuration: number;
    averageViewTime: number;
    scrollInteractions: number;
    deviceStats: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    browserStats: Record<string, number>;
    geoStats: {
      countries: Record<string, number>;
      cities: Record<string, number>;
    };
  };
  
  // Methods
  activate(): Promise<this>;
  deactivate(): Promise<this>;
  setPrimary(): Promise<this>;
  addVariant(variant: any): Promise<this>;
  removeVariant(variantName: string): Promise<this>;
  createNewVersion(newFile: any): Promise<any>;
}

export interface ILogoModel extends mongoose.Model<ILogo> {
  getActiveLogo(type: string): Promise<ILogo | null>;
  getPrimaryLogos(): Promise<ILogo[]>;
  getLogosByType(type: string): Promise<ILogo[]>;
  getLogoVersionHistory(logoId: mongoose.Types.ObjectId): Promise<ILogo[]>;
  cleanupUnusedVariants(): Promise<void>;
}

// ==================== SCHEMA ====================

const logoSchema = new Schema<ILogo>(
  {
    // Content
    name: {
      type: String,
      required: [true, 'Logo name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    type: {
      type: String,
      enum: {
        values: ['primary', 'secondary', 'favicon', 'icon', 'watermark', 'email', 'social', 'custom'],
        message: '{VALUE} is not a valid logo type'
      },
      required: [true, 'Logo type is required'],
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    // File Information
    originalFile: {
      url: {
        type: String,
        required: [true, 'File URL is required']
      },
      publicId: {
        type: String,
        sparse: true
      },
      filename: {
        type: String,
        required: [true, 'Filename is required']
      },
      size: {
        type: Number,
        required: [true, 'File size is required'],
        min: [0, 'File size cannot be negative']
      },
      mimeType: {
        type: String,
        required: [true, 'MIME type is required']
      },
      dimensions: {
        width: {
          type: Number,
          required: [true, 'Width is required'],
          min: [1, 'Width must be positive']
        },
        height: {
          type: Number,
          required: [true, 'Height is required'],
          min: [1, 'Height must be positive']
        }
      }
    },
    
    // Variants
    variants: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String
      },
      width: {
        type: Number,
        required: true,
        min: 1
      },
      height: {
        type: Number,
        required: true,
        min: 1
      },
      size: {
        type: Number,
        required: true,
        min: 0
      },
      format: {
        type: String,
        required: true,
        lowercase: true
      }
    }],
    
    // Version Control
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1']
    },
    previousVersions: [{
      type: Schema.Types.ObjectId,
      ref: 'Logo'
    }],
    
    // Usage Tracking
    usageLocations: [{
      location: {
        type: String,
        enum: ['header', 'footer', 'email', 'invoice', 'favicon', 'social', 'custom'],
        required: true
      },
      description: {
        type: String,
        trim: true
      }
    }],
    
    // Status & Settings
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isPrimary: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // SEO & Accessibility
    altText: {
      type: String,
      required: [true, 'Alt text is required for accessibility'],
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    
    // Metadata
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required']
    },
    
    // Timestamps
    activatedAt: {
      type: Date
    },
    
    // ==================== ENHANCEMENT FIELDS ====================
    
    // Display Configuration
    displayConfig: {
      position: {
        type: String,
        enum: ['left', 'center', 'right']
      },
      alignment: {
        type: String,
        enum: ['top', 'middle', 'bottom']
      },
      maxWidth: Number,
      maxHeight: Number,
      aspectRatio: {
        type: String,
        enum: ['auto', '1:1', '16:9', '4:3', '3:2', 'custom']
      },
      customAspectRatio: String,
      objectFit: {
        type: String,
        enum: ['contain', 'cover', 'fill', 'scale-down', 'none']
      },
      margin: {
        top: { type: Number, default: 0 },
        bottom: { type: Number, default: 0 },
        left: { type: Number, default: 0 },
        right: { type: Number, default: 0 }
      },
      padding: {
        top: { type: Number, default: 0 },
        bottom: { type: Number, default: 0 },
        left: { type: Number, default: 0 },
        right: { type: Number, default: 0 }
      },
      sticky: {
        enabled: { type: Boolean, default: false },
        offset: { type: Number, default: 0 },
        shrinkRatio: { type: Number, default: 1 },
        minHeight: { type: Number, default: 0 }
      }
    },
    
    // Styling Options
    styling: {
      backgroundColor: String,
      borderRadius: Number,
      shadow: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'xl']
      },
      border: {
        width: { type: Number, default: 0 },
        color: String,
        style: {
          type: String,
          enum: ['solid', 'dashed', 'dotted', 'none']
        }
      },
      opacity: { type: Number, min: 0, max: 1, default: 1 },
      brightness: { type: Number, default: 1 },
      contrast: { type: Number, default: 1 },
      saturation: { type: Number, default: 1 },
      grayscale: { type: Number, min: 0, max: 1, default: 0 },
      blur: { type: Number, min: 0, default: 0 },
      hoverEffects: {
        enabled: { type: Boolean, default: false },
        scale: { type: Number, default: 1 },
        opacity: { type: Number, min: 0, max: 1, default: 1 },
        brightness: { type: Number, default: 1 },
        transition: {
          type: String,
          enum: ['none', 'smooth', 'bounce', 'elastic'],
          default: 'smooth'
        },
        duration: { type: Number, default: 300 }
      },
      scrollEffects: {
        enabled: { type: Boolean, default: false },
        fadeIn: { type: Boolean, default: false },
        slideIn: { type: Boolean, default: false },
        scaleOnScroll: { type: Boolean, default: false },
        parallax: { type: Number, default: 0 }
      }
    },
    
    // Responsive Settings
    responsive: {
      mobile: {
        maxWidth: Number,
        maxHeight: Number,
        position: {
          type: String,
          enum: ['left', 'center', 'right']
        },
        visible: { type: Boolean, default: true },
        variant: String,
        shrinkOnScroll: { type: Boolean, default: false }
      },
      tablet: {
        maxWidth: Number,
        maxHeight: Number,
        position: {
          type: String,
          enum: ['left', 'center', 'right']
        },
        visible: { type: Boolean, default: true },
        variant: String,
        shrinkOnScroll: { type: Boolean, default: false }
      },
      desktop: {
        maxWidth: Number,
        maxHeight: Number,
        position: {
          type: String,
          enum: ['left', 'center', 'right']
        },
        visible: { type: Boolean, default: true },
        variant: String,
        shrinkOnScroll: { type: Boolean, default: false }
      }
    },
    
    // Link Configuration
    link: {
      enabled: { type: Boolean, default: false },
      url: String,
      target: {
        type: String,
        enum: ['_self', '_blank', '_parent', '_top'],
        default: '_self'
      },
      rel: String,
      title: String,
      trackClicks: { type: Boolean, default: false },
      utmSource: String,
      utmMedium: String,
      utmCampaign: String
    },
    
    // Navigation Integration
    navigation: {
      integrated: { type: Boolean, default: false },
      menuPosition: {
        type: String,
        enum: ['top', 'bottom', 'left', 'right'],
        default: 'top'
      },
      mobileMenuTrigger: { type: Boolean, default: false },
      breadcrumbIntegration: { type: Boolean, default: false },
      searchIntegration: { type: Boolean, default: false }
    },
    
    // Animation Settings
    animation: {
      entrance: {
        enabled: { type: Boolean, default: false },
        type: {
          type: String,
          enum: ['none', 'fade', 'slide', 'zoom', 'bounce', 'rotate', 'flip'],
          default: 'none'
        },
        direction: {
          type: String,
          enum: ['up', 'down', 'left', 'right']
        },
        duration: { type: Number, default: 300 },
        delay: { type: Number, default: 0 },
        easing: {
          type: String,
          enum: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'],
          default: 'ease'
        }
      },
      loading: {
        type: {
          type: String,
          enum: ['skeleton', 'shimmer', 'pulse', 'spinner', 'progressive'],
          default: 'skeleton'
        },
        color: { type: String, default: '#e0e0e0' },
        showProgress: { type: Boolean, default: false }
      },
      interactions: {
        hover: {
          type: {
            type: String,
            enum: ['none', 'scale', 'rotate', 'bounce', 'pulse', 'glow'],
            default: 'none'
          },
          intensity: { type: Number, default: 1 },
          duration: { type: Number, default: 300 }
        },
        click: {
          type: {
            type: String,
            enum: ['none', 'ripple', 'scale', 'shake', 'flash'],
            default: 'none'
          },
          duration: { type: Number, default: 300 }
        }
      },
      scroll: {
        parallax: {
          enabled: { type: Boolean, default: false },
          speed: { type: Number, default: 0.5 },
          direction: {
            type: String,
            enum: ['vertical', 'horizontal'],
            default: 'vertical'
          }
        },
        reveal: {
          enabled: { type: Boolean, default: false },
          threshold: { type: Number, default: 0.5 },
          animation: {
            type: String,
            enum: ['fade', 'slide', 'zoom'],
            default: 'fade'
          }
        }
      }
    },
    
    // Performance Optimization
    performance: {
      lazyLoading: { type: Boolean, default: true },
      preconnect: [String],
      prefetch: { type: Boolean, default: false },
      priority: {
        type: String,
        enum: ['high', 'normal', 'low'],
        default: 'normal'
      },
      optimization: {
        webp: { type: Boolean, default: true },
        avif: { type: Boolean, default: false },
        progressive: { type: Boolean, default: true },
        quality: { type: Number, min: 1, max: 100, default: 85 },
        compression: {
          type: String,
          enum: ['lossless', 'lossy'],
          default: 'lossy'
        }
      },
      caching: {
        enabled: { type: Boolean, default: true },
        ttl: { type: Number, default: 86400 },
        strategy: {
          type: String,
          enum: ['cache-first', 'network-first', 'stale-while-revalidate'],
          default: 'cache-first'
        }
      }
    },
    
    // A/B Testing
    abTest: {
      enabled: { type: Boolean, default: false },
      variants: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        weight: { type: Number, required: true, min: 0, max: 100 },
        config: { type: Schema.Types.Mixed },
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 }
      }],
      winnerVariant: String,
      testDuration: Number,
      testEndDate: Date,
      confidenceLevel: { type: Number, default: 95, min: 0, max: 100 }
    },
    
    // Analytics & Performance
    analytics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      loadTime: { type: Number, default: 0 },
      renderTime: { type: Number, default: 0 },
      lcp: { type: Number, default: 0 },
      cls: { type: Number, default: 0 },
      errorRate: { type: Number, default: 0 },
      hoverCount: { type: Number, default: 0 },
      hoverDuration: { type: Number, default: 0 },
      averageViewTime: { type: Number, default: 0 },
      scrollInteractions: { type: Number, default: 0 },
      deviceStats: {
        mobile: { type: Number, default: 0 },
        tablet: { type: Number, default: 0 },
        desktop: { type: Number, default: 0 }
      },
      browserStats: {
        type: Map,
        of: Number,
        default: () => new Map()
      },
      geoStats: {
        countries: {
          type: Map,
          of: Number,
          default: () => new Map()
        },
        cities: {
          type: Map,
          of: Number,
          default: () => new Map()
        }
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

logoSchema.index({ type: 1, isActive: 1, isPrimary: -1 });
logoSchema.index({ isActive: 1, createdAt: -1 });
logoSchema.index({ tags: 1 });
logoSchema.index({ uploadedBy: 1 });
logoSchema.index({ 'originalFile.publicId': 1 }, { sparse: true });

// ==================== INSTANCE METHODS ====================

/**
 * Activate logo
 */
logoSchema.methods.activate = async function(): Promise<any> {
  this.isActive = true;
  this.activatedAt = new Date();
  await this.save();
  return this as any;
};

/**
 * Deactivate logo
 */
logoSchema.methods.deactivate = async function(): Promise<any> {
  this.isActive = false;
  await this.save();
  return this as any;
};

/**
 * Set as primary logo for its type
 */
logoSchema.methods.setPrimary = async function(): Promise<any> {
  // Remove primary status from other logos of same type
  await mongoose.model('Logo').updateMany(
    {
      type: this.type,
      _id: { $ne: this._id }
    },
    {
      $set: { isPrimary: false }
    }
  );
  
  // Set this as primary
  this.isPrimary = true;
  this.isActive = true;
  this.activatedAt = new Date();
  await this.save();
  return this as any;
};

/**
 * Add a variant
 */
logoSchema.methods.addVariant = async function(variant: any): Promise<any> {
  // Check if variant with same name exists
  const existingIndex = this.variants.findIndex((v: any) => v.name === variant.name);
  
  if (existingIndex > -1) {
    // Update existing variant
    this.variants[existingIndex] = variant;
  } else {
    // Add new variant
    this.variants.push(variant);
  }
  
  await this.save();
  return this as any;
};

/**
 * Remove a variant
 */
logoSchema.methods.removeVariant = async function(variantName: string): Promise<any> {
  this.variants = this.variants.filter((v: any) => v.name !== variantName);
  await this.save();
  return this as any;
};

/**
 * Create new version of logo
 */
logoSchema.methods.createNewVersion = async function(newFile: any): Promise<any> {
  // Create copy of current logo as old version
  const oldVersion = new (mongoose.model('Logo'))({
    ...this.toObject(),
    _id: undefined,
    version: this.version,
    isActive: false,
    isPrimary: false,
    createdAt: undefined,
    updatedAt: undefined
  });
  
  await oldVersion.save();
  
  // Update current logo with new file
  this.originalFile = newFile;
  this.version += 1;
  this.previousVersions = this.previousVersions || [];
  this.previousVersions.push(oldVersion._id);
  this.variants = []; // Clear variants, need to regenerate
  
  await this.save();
  return this as any;
};

// ==================== STATIC METHODS ====================

/**
 * Get active logo by type (primary if available)
 */
logoSchema.statics.getActiveLogo = async function(
  type: string
): Promise<ILogo | null> {
  // Try to get primary active logo
  let logo = await this.findOne({
    type,
    isActive: true,
    isPrimary: true
  }).lean();
  
  // If no primary, get any active logo
  if (!logo) {
    logo = await this.findOne({
      type,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .lean();
  }
  
  return logo;
};

/**
 * Get all primary logos
 */
logoSchema.statics.getPrimaryLogos = async function(): Promise<ILogo[]> {
  return await this.find({
    isPrimary: true,
    isActive: true
  })
    .sort({ type: 1 })
    .lean();
};

/**
 * Get logos by type
 */
logoSchema.statics.getLogosByType = async function(type: string): Promise<ILogo[]> {
  return await this.find({ type })
    .sort({ isPrimary: -1, createdAt: -1 })
    .lean();
};

/**
 * Get version history of a logo
 */
logoSchema.statics.getLogoVersionHistory = async function(
  logoId: mongoose.Types.ObjectId
): Promise<ILogo[]> {
  const logo = await this.findById(logoId);
  
  if (!logo || !logo.previousVersions || logo.previousVersions.length === 0) {
    return [];
  }
  
  return await this.find({
    _id: { $in: logo.previousVersions }
  })
    .sort({ version: -1 })
    .lean();
};

/**
 * Cleanup unused variants (admin maintenance)
 */
logoSchema.statics.cleanupUnusedVariants = async function(): Promise<void> {
  // This would typically involve checking if variant files exist
  // and removing references to missing files
  // Implementation depends on file storage solution (Cloudinary, S3, etc.)
  
  const logos = await this.find({ 'variants.0': { $exists: true } });
  
  for (const logo of logos) {
    // Here you would check if each variant file exists
    // For now, just a placeholder
    await logo.save();
  }
};

// ==================== VIRTUALS ====================

/**
 * Get total storage used
 */
logoSchema.virtual('totalSize').get(function() {
  let total = this.originalFile.size;
  
  if (this.variants && this.variants.length > 0) {
    total += this.variants.reduce((sum: number, v: any) => sum + v.size, 0);
  }
  
  return total;
});

/**
 * Get total storage in MB
 */
logoSchema.virtual('totalSizeMB').get(function() {
  return ((this as any).totalSize / (1024 * 1024)).toFixed(2);
});

/**
 * Get variant count
 */
logoSchema.virtual('variantCount').get(function() {
  return this.variants ? this.variants.length : 0;
});

/**
 * Check if has variants
 */
logoSchema.virtual('hasVariants').get(function() {
  return this.variants && this.variants.length > 0;
});

/**
 * Get aspect ratio
 */
logoSchema.virtual('aspectRatio').get(function() {
  const { width, height } = this.originalFile.dimensions;
  return (width / height).toFixed(2);
});

/**
 * Check if is latest version
 */
logoSchema.virtual('isLatestVersion').get(function() {
  // If this logo has no documents referencing it as a previous version, it's latest
  // This is a simplified check
  return this.isActive;
});

// ==================== HOOKS ====================

/**
 * Ensure only one primary per type
 */
logoSchema.pre('save', async function(next) {
  if (this.isModified('isPrimary') && this.isPrimary) {
    // Remove primary from others of same type
    await mongoose.model('Logo').updateMany(
      {
        type: this.type,
        _id: { $ne: this._id },
        isPrimary: true
      },
      {
        $set: { isPrimary: false }
      }
    );
  }
  next();
});

/**
 * Set activatedAt when activated
 */
logoSchema.pre('save', function(next) {
  if (this.isModified('isActive') && this.isActive && !this.activatedAt) {
    this.activatedAt = new Date();
  }
  next();
});

/**
 * Clean up tags
 */
logoSchema.pre('save', function(next) {
  if (this.tags && this.tags.length > 0) {
    // Remove duplicates and empty tags
    this.tags = [...new Set(this.tags.filter(tag => tag && tag.trim()))];
  }
  next();
});

// ==================== MODEL ====================

const Logo = mongoose.model<ILogo, ILogoModel>('Logo', logoSchema);

export default Logo;

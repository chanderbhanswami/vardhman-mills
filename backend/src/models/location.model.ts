import mongoose, { Document, Schema } from 'mongoose';

// Location Interface
export interface ILocation extends Document {
  name: string;
  slug: string;
  type: 'store' | 'warehouse' | 'office' | 'showroom' | 'pickup-point' | 'service-center';
  
  // Contact Information
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    contactPerson?: string;
    alternatePhone?: string;
  };
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    landmark?: string;
    addressLine2?: string;
  };
  
  // Coordinates
  coordinates: {
    latitude: number;
    longitude: number;
  };
  
  // Region
  regionId?: mongoose.Types.ObjectId;
  
  // Operating Hours
  hours: {
    monday?: { open: string; close: string; isClosed?: boolean };
    tuesday?: { open: string; close: string; isClosed?: boolean };
    wednesday?: { open: string; close: string; isClosed?: boolean };
    thursday?: { open: string; close: string; isClosed?: boolean };
    friday?: { open: string; close: string; isClosed?: boolean };
    saturday?: { open: string; close: string; isClosed?: boolean };
    sunday?: { open: string; close: string; isClosed?: boolean };
  };
  
  // Special Hours (holidays, etc.)
  specialHours?: Array<{
    date: Date;
    open?: string;
    close?: string;
    isClosed: boolean;
    reason?: string;
  }>;
  
  // Services & Features
  services: string[];
  features: string[];
  paymentMethods?: string[];
  
  // Media
  images?: string[];
  coverImage?: string;
  
  // Status
  status: 'active' | 'inactive' | 'coming-soon' | 'temporarily-closed' | 'permanently-closed';
  isActive: boolean;
  isFeatured?: boolean;
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  
  // Display
  displayOrder?: number;
  description?: string;
  shortDescription?: string;
  
  // Analytics
  analytics: {
    views: number;
    clicks: number;
    directions: number;
    calls: number;
  };
  
  // Manager/Staff
  managerId?: mongoose.Types.ObjectId;
  staff?: mongoose.Types.ObjectId[];
  
  // Settings
  settings: {
    allowPickup?: boolean;
    allowReturns?: boolean;
    allowExchange?: boolean;
    showOnStoreFinder?: boolean;
    showOnWebsite?: boolean;
    maxPickupOrders?: number;
  };
  
  // Metadata
  metadata?: Map<string, any>;
  tags?: string[];
  
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

// Region Interface
export interface IRegion extends Document {
  name: string;
  slug: string;
  code: string;
  
  // Hierarchy
  type: 'country' | 'state' | 'city' | 'zone' | 'area';
  parentRegionId?: mongoose.Types.ObjectId;
  
  // Coverage
  coverageArea?: {
    center: {
      latitude: number;
      longitude: number;
    };
    radius?: number; // in kilometers
    boundaries?: Array<{
      latitude: number;
      longitude: number;
    }>;
  };
  
  // Regional Settings
  settings: {
    currency?: string;
    language?: string;
    timezone?: string;
    taxRate?: number;
    shippingZone?: string;
    minOrderAmount?: number;
    freeShippingThreshold?: number;
  };
  
  // Status
  status: 'active' | 'inactive';
  isActive: boolean;
  
  // Display
  displayOrder?: number;
  description?: string;
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  
  // Statistics
  stats: {
    totalLocations: number;
    totalOrders: number;
    totalRevenue: number;
  };
  
  // Metadata
  metadata?: Map<string, any>;
  
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
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
    type: {
      type: String,
      required: true,
      enum: ['store', 'warehouse', 'office', 'showroom', 'pickup-point', 'service-center'],
      default: 'store'
    },
    contactInfo: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      website: { type: String, trim: true },
      contactPerson: { type: String, trim: true },
      alternatePhone: { type: String, trim: true }
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true },
      addressLine2: { type: String, trim: true }
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    regionId: {
      type: Schema.Types.ObjectId,
      ref: 'Region'
    },
    hours: {
      monday: {
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false }
      },
      tuesday: {
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false }
      },
      wednesday: {
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false }
      },
      thursday: {
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false }
      },
      friday: {
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false }
      },
      saturday: {
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false }
      },
      sunday: {
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false }
      }
    },
    specialHours: [{
      date: { type: Date, required: true },
      open: { type: String },
      close: { type: String },
      isClosed: { type: Boolean, default: false },
      reason: { type: String, trim: true }
    }],
    services: [{ type: String, trim: true }],
    features: [{ type: String, trim: true }],
    paymentMethods: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    coverImage: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'coming-soon', 'temporarily-closed', 'permanently-closed'],
      default: 'active'
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 70 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      metaKeywords: [{ type: String, trim: true }]
    },
    displayOrder: { type: Number, default: 0 },
    description: { type: String, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 200 },
    analytics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      directions: { type: Number, default: 0 },
      calls: { type: Number, default: 0 }
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    staff: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    settings: {
      allowPickup: { type: Boolean, default: true },
      allowReturns: { type: Boolean, default: true },
      allowExchange: { type: Boolean, default: true },
      showOnStoreFinder: { type: Boolean, default: true },
      showOnWebsite: { type: Boolean, default: true },
      maxPickupOrders: { type: Number, default: 10 }
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const regionSchema = new Schema<IRegion>(
  {
    name: {
      type: String,
      required: [true, 'Region name is required'],
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
    code: {
      type: String,
      required: [true, 'Region code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['country', 'state', 'city', 'zone', 'area'],
      default: 'city'
    },
    parentRegionId: {
      type: Schema.Types.ObjectId,
      ref: 'Region'
    },
    coverageArea: {
      center: {
        latitude: { type: Number },
        longitude: { type: Number }
      },
      radius: { type: Number },
      boundaries: [{
        latitude: { type: Number },
        longitude: { type: Number }
      }]
    },
    settings: {
      currency: { type: String, trim: true, default: 'INR' },
      language: { type: String, trim: true, default: 'en' },
      timezone: { type: String, trim: true, default: 'Asia/Kolkata' },
      taxRate: { type: Number, default: 0 },
      shippingZone: { type: String, trim: true },
      minOrderAmount: { type: Number, default: 0 },
      freeShippingThreshold: { type: Number }
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    description: { type: String, trim: true },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 70 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      metaKeywords: [{ type: String, trim: true }]
    },
    stats: {
      totalLocations: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 }
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
locationSchema.index({ slug: 1 });
locationSchema.index({ status: 1, isActive: 1 });
locationSchema.index({ type: 1 });
locationSchema.index({ 'address.city': 1 });
locationSchema.index({ 'address.state': 1 });
locationSchema.index({ 'address.country': 1 });
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
locationSchema.index({ regionId: 1 });
locationSchema.index({ isFeatured: 1, displayOrder: 1 });
locationSchema.index({ tags: 1 });

regionSchema.index({ slug: 1 });
regionSchema.index({ code: 1 });
regionSchema.index({ status: 1, isActive: 1 });
regionSchema.index({ type: 1 });
regionSchema.index({ parentRegionId: 1 });
regionSchema.index({ displayOrder: 1 });

// Auto-generate slug
locationSchema.pre('save', async function(next) {
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
    
    while (await mongoose.models.Location.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  next();
});

regionSchema.pre('save', async function(next) {
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
    
    while (await mongoose.models.Region.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  next();
});

// Virtual for checking if location is currently open
locationSchema.virtual('isCurrentlyOpen').get(function() {
  if (this.status !== 'active' || !this.isActive) {
    return false;
  }
  
  const now = new Date();
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const todayHours = this.hours[dayOfWeek as keyof typeof this.hours];
  
  if (!todayHours || todayHours.isClosed) {
    return false;
  }
  
  // Check special hours for today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const specialToday = this.specialHours?.find(sh => {
    const specialDate = new Date(sh.date.getFullYear(), sh.date.getMonth(), sh.date.getDate());
    return specialDate.getTime() === today.getTime();
  });
  
  if (specialToday) {
    if (specialToday.isClosed) return false;
    // TODO: Check if current time is within special hours
  }
  
  // TODO: Check if current time is within regular hours
  return true;
});

// Virtual to populate locations in region
regionSchema.virtual('locations', {
  ref: 'Location',
  localField: '_id',
  foreignField: 'regionId'
});

// Virtual for child regions
regionSchema.virtual('childRegions', {
  ref: 'Region',
  localField: '_id',
  foreignField: 'parentRegionId'
});

export const Location = mongoose.model<ILocation>('Location', locationSchema);
export const Region = mongoose.model<IRegion>('Region', regionSchema);

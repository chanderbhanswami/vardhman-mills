import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface IAnnouncement extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Content
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  
  // Appearance
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  backgroundColor?: string;
  textColor?: string;
  icon?: string;
  
  // Display settings
  position: 'top' | 'bottom';
  dismissible: boolean;
  showCloseButton: boolean;
  
  // Scheduling
  startDate: Date;
  endDate?: Date;
  timezone: string;
  
  // Targeting
  targeting: {
    pages?: string[]; // Specific pages to show on
    excludePages?: string[]; // Pages to exclude
    userTypes?: ('all' | 'guest' | 'authenticated' | 'new')[];
    countries?: string[];
    devices?: ('desktop' | 'tablet' | 'mobile')[];
  };
  
  // Priority & Display
  priority: number;
  displayOrder: number;
  maxViews?: number;
  
  // Status
  isActive: boolean;
  isPaused: boolean;
  
  // Analytics
  views: number;
  clicks: number;
  dismissals: number;
  
  // Metadata
  createdBy: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  activate(): Promise<this>;
  deactivate(): Promise<this>;
  pause(): Promise<this>;
  resume(): Promise<this>;
  incrementViews(): Promise<this>;
  incrementClicks(): Promise<this>;
  incrementDismissals(): Promise<this>;
  isCurrentlyActive(): boolean;
}

export interface IAnnouncementModel extends mongoose.Model<IAnnouncement> {
  getActiveAnnouncements(options?: any): Promise<IAnnouncement[]>;
  getAnnouncementsForPage(page: string, options?: any): Promise<IAnnouncement[]>;
  getScheduledAnnouncements(): Promise<IAnnouncement[]>;
  deactivateExpired(): Promise<void>;
}

// ==================== SCHEMA ====================

const announcementSchema = new Schema<IAnnouncement>(
  {
    // Content
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    link: {
      type: String,
      trim: true
    },
    linkText: {
      type: String,
      trim: true,
      maxlength: [50, 'Link text cannot exceed 50 characters'],
      default: 'Learn More'
    },
    
    // Appearance
    type: {
      type: String,
      enum: {
        values: ['info', 'warning', 'success', 'error', 'promotion'],
        message: '{VALUE} is not a valid announcement type'
      },
      default: 'info',
      index: true
    },
    backgroundColor: {
      type: String,
      trim: true
    },
    textColor: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      trim: true
    },
    
    // Display settings
    position: {
      type: String,
      enum: {
        values: ['top', 'bottom'],
        message: '{VALUE} is not a valid position'
      },
      default: 'top'
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    
    // Scheduling
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    endDate: {
      type: Date,
      index: true
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    
    // Targeting
    targeting: {
      pages: [{
        type: String,
        trim: true,
        lowercase: true
      }],
      excludePages: [{
        type: String,
        trim: true,
        lowercase: true
      }],
      userTypes: [{
        type: String,
        enum: ['all', 'guest', 'authenticated', 'new']
      }],
      countries: [{
        type: String,
        uppercase: true,
        length: 2
      }],
      devices: [{
        type: String,
        enum: ['desktop', 'tablet', 'mobile']
      }]
    },
    
    // Priority & Display
    priority: {
      type: Number,
      default: 0,
      min: [0, 'Priority cannot be negative'],
      max: [100, 'Priority cannot exceed 100'],
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    maxViews: {
      type: Number,
      min: [0, 'Max views cannot be negative']
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: false,
      index: true
    },
    isPaused: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // Analytics
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    clicks: {
      type: Number,
      default: 0,
      min: [0, 'Clicks cannot be negative']
    },
    dismissals: {
      type: Number,
      default: 0,
      min: [0, 'Dismissals cannot be negative']
    },
    
    // Metadata
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

announcementSchema.index({ isActive: 1, isPaused: 1, startDate: 1, endDate: 1 });
announcementSchema.index({ priority: -1, displayOrder: 1 });
announcementSchema.index({ 'targeting.pages': 1 });
announcementSchema.index({ type: 1, isActive: 1 });

// ==================== INSTANCE METHODS ====================

/**
 * Activate announcement
 */
announcementSchema.methods.activate = async function(): Promise<any> {
  this.isActive = true;
  this.isPaused = false;
  await this.save();
  return this as any;
};

/**
 * Deactivate announcement
 */
announcementSchema.methods.deactivate = async function(): Promise<any> {
  this.isActive = false;
  await this.save();
  return this as any;
};

/**
 * Pause announcement
 */
announcementSchema.methods.pause = async function(): Promise<any> {
  this.isPaused = true;
  await this.save();
  return this as any;
};

/**
 * Resume announcement
 */
announcementSchema.methods.resume = async function(): Promise<any> {
  this.isPaused = false;
  await this.save();
  return this as any;
};

/**
 * Increment view count
 */
announcementSchema.methods.incrementViews = async function(): Promise<any> {
  this.views += 1;
  await this.save();
  return this as any;
};

/**
 * Increment click count
 */
announcementSchema.methods.incrementClicks = async function(): Promise<any> {
  this.clicks += 1;
  await this.save();
  return this as any;
};

/**
 * Increment dismissal count
 */
announcementSchema.methods.incrementDismissals = async function(): Promise<any> {
  this.dismissals += 1;
  await this.save();
  return this as any;
};

/**
 * Check if announcement is currently active
 */
announcementSchema.methods.isCurrentlyActive = function(): boolean {
  if (!this.isActive || this.isPaused) {
    return false;
  }
  
  const now = new Date();
  
  // Check start date
  if (this.startDate > now) {
    return false;
  }
  
  // Check end date
  if (this.endDate && this.endDate < now) {
    return false;
  }
  
  // Check max views
  if (this.maxViews && this.views >= this.maxViews) {
    return false;
  }
  
  return true;
};

// ==================== STATIC METHODS ====================

/**
 * Get active announcements
 */
announcementSchema.statics.getActiveAnnouncements = async function(
  options: any = {}
): Promise<IAnnouncement[]> {
  const now = new Date();
  
  const query: any = {
    isActive: true,
    isPaused: false,
    startDate: { $lte: now }
  };
  
  // Check end date
  query.$or = [
    { endDate: { $exists: false } },
    { endDate: null },
    { endDate: { $gte: now } }
  ];
  
  // Type filter
  if (options.type) {
    query.type = options.type;
  }
  
  // Position filter
  if (options.position) {
    query.position = options.position;
  }
  
  const announcements = await this.find(query)
    .sort({ priority: -1, displayOrder: 1 })
    .lean();
  
  // Filter by max views
  return announcements.filter((ann: any) => {
    if (ann.maxViews && ann.views >= ann.maxViews) {
      return false;
    }
    return true;
  });
};

/**
 * Get announcements for specific page
 */
announcementSchema.statics.getAnnouncementsForPage = async function(
  page: string,
  options: any = {}
): Promise<IAnnouncement[]> {
  const announcements = await (this as any).getActiveAnnouncements(options);
  
  return announcements.filter((ann: any) => {
    // Check if page is in included pages
    if (ann.targeting.pages && ann.targeting.pages.length > 0) {
      if (!ann.targeting.pages.includes(page.toLowerCase())) {
        return false;
      }
    }
    
    // Check if page is in excluded pages
    if (ann.targeting.excludePages && ann.targeting.excludePages.length > 0) {
      if (ann.targeting.excludePages.includes(page.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Get scheduled announcements (upcoming)
 */
announcementSchema.statics.getScheduledAnnouncements = async function(): Promise<IAnnouncement[]> {
  const now = new Date();
  
  return await this.find({
    isActive: true,
    startDate: { $gt: now }
  })
    .sort({ startDate: 1 })
    .lean();
};

/**
 * Deactivate expired announcements
 */
announcementSchema.statics.deactivateExpired = async function(): Promise<void> {
  const now = new Date();
  
  await this.updateMany(
    {
      isActive: true,
      endDate: { $lt: now }
    },
    {
      $set: { isActive: false }
    }
  );
};

// ==================== VIRTUALS ====================

/**
 * Get CTR (Click-Through Rate)
 */
announcementSchema.virtual('ctr').get(function() {
  return this.views > 0 ? (this.clicks / this.views) * 100 : 0;
});

/**
 * Get dismissal rate
 */
announcementSchema.virtual('dismissalRate').get(function() {
  return this.views > 0 ? (this.dismissals / this.views) * 100 : 0;
});

/**
 * Get engagement rate
 */
announcementSchema.virtual('engagementRate').get(function() {
  const engaged = this.clicks + this.dismissals;
  return this.views > 0 ? (engaged / this.views) * 100 : 0;
});

/**
 * Check if scheduled for future
 */
announcementSchema.virtual('isScheduled').get(function() {
  return this.startDate > new Date();
});

/**
 * Check if expired
 */
announcementSchema.virtual('isExpired').get(function() {
  return this.endDate && this.endDate < new Date();
});

/**
 * Get status
 */
announcementSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.isPaused) return 'paused';
  if ((this as any).isScheduled) return 'scheduled';
  if ((this as any).isExpired) return 'expired';
  if (this.maxViews && this.views >= this.maxViews) return 'completed';
  return 'active';
});

// ==================== HOOKS ====================

/**
 * Set default colors based on type
 */
announcementSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('type')) {
    if (!this.backgroundColor || !this.textColor) {
      const colorMap: Record<string, { bg: string; text: string }> = {
        info: { bg: '#3b82f6', text: '#ffffff' },
        warning: { bg: '#f59e0b', text: '#000000' },
        success: { bg: '#10b981', text: '#ffffff' },
        error: { bg: '#ef4444', text: '#ffffff' },
        promotion: { bg: '#8b5cf6', text: '#ffffff' }
      };
      
      const colors = colorMap[this.type];
      if (!this.backgroundColor) this.backgroundColor = colors.bg;
      if (!this.textColor) this.textColor = colors.text;
    }
  }
  next();
});

/**
 * Set default targeting
 */
announcementSchema.pre('save', function(next) {
  if (this.isNew && (!this.targeting.userTypes || this.targeting.userTypes.length === 0)) {
    this.targeting.userTypes = ['all'];
  }
  next();
});

// ==================== MODEL ====================

const Announcement = mongoose.model<IAnnouncement, IAnnouncementModel>(
  'Announcement',
  announcementSchema
);

export default Announcement;

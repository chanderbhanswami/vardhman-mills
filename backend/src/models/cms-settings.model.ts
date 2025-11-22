import mongoose, { Document, Schema } from 'mongoose';

export interface ICMSSettings extends Document {
  // Site Information
  siteTitle: string;
  siteTagline?: string;
  siteDescription?: string;
  siteLogo?: string;
  siteFavicon?: string;
  
  // Contact Information
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  
  // Social Media
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    pinterest?: string;
    tiktok?: string;
  };
  
  // SEO Settings
  seo: {
    defaultMetaTitle?: string;
    defaultMetaDescription?: string;
    defaultMetaKeywords?: string[];
    ogImage?: string;
    twitterHandle?: string;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    structuredData?: any;
  };
  
  // General Settings
  general: {
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
    language?: string;
    currency?: string;
    postsPerPage?: number;
    commentsEnabled?: boolean;
    registrationEnabled?: boolean;
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
  };
  
  // Email Settings
  email: {
    fromName?: string;
    fromEmail?: string;
    replyToEmail?: string;
    emailFooter?: string;
  };
  
  // Media Settings
  media: {
    maxUploadSize?: number; // in MB
    allowedFileTypes?: string[];
    imageQuality?: number; // 1-100
    thumbnailSizes?: {
      name: string;
      width: number;
      height: number;
      crop?: boolean;
    }[];
  };
  
  // Privacy & Legal
  privacy: {
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
    cookieConsentEnabled?: boolean;
    cookieConsentMessage?: string;
    gdprCompliant?: boolean;
  };
  
  // Scripts
  scripts?: {
    headerScripts?: string; // Custom HTML/JS for <head>
    footerScripts?: string; // Custom HTML/JS before </body>
    customCSS?: string;
  };
  
  // Cache Settings
  cache?: {
    enabled?: boolean;
    duration?: number; // in minutes
    excludePages?: string[];
  };
  
  // API Settings
  api?: {
    rateLimit?: number; // requests per minute
    enableCORS?: boolean;
    allowedOrigins?: string[];
  };
  
  // Custom Settings
  customSettings?: Map<string, any>;
  
  // Metadata
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const cmsSettingsSchema = new Schema<ICMSSettings>(
  {
    siteTitle: {
      type: String,
      required: [true, 'Site title is required'],
      trim: true
    },
    siteTagline: { type: String, trim: true },
    siteDescription: { type: String, trim: true },
    siteLogo: { type: String, trim: true },
    siteFavicon: { type: String, trim: true },
    
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    contactAddress: { type: String, trim: true },
    
    socialMedia: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      youtube: { type: String, trim: true },
      pinterest: { type: String, trim: true },
      tiktok: { type: String, trim: true }
    },
    
    seo: {
      defaultMetaTitle: { type: String, trim: true },
      defaultMetaDescription: { type: String, trim: true },
      defaultMetaKeywords: [{ type: String, trim: true }],
      ogImage: { type: String, trim: true },
      twitterHandle: { type: String, trim: true },
      googleAnalyticsId: { type: String, trim: true },
      googleTagManagerId: { type: String, trim: true },
      facebookPixelId: { type: String, trim: true },
      structuredData: { type: Schema.Types.Mixed }
    },
    
    general: {
      timezone: { type: String, default: 'UTC' },
      dateFormat: { type: String, default: 'YYYY-MM-DD' },
      timeFormat: { type: String, default: 'HH:mm:ss' },
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'USD' },
      postsPerPage: { type: Number, default: 10 },
      commentsEnabled: { type: Boolean, default: true },
      registrationEnabled: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: { type: String }
    },
    
    email: {
      fromName: { type: String, trim: true },
      fromEmail: { type: String, trim: true, lowercase: true },
      replyToEmail: { type: String, trim: true, lowercase: true },
      emailFooter: { type: String }
    },
    
    media: {
      maxUploadSize: { type: Number, default: 10 },
      allowedFileTypes: [{ type: String }],
      imageQuality: { type: Number, default: 80, min: 1, max: 100 },
      thumbnailSizes: [{
        name: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        crop: { type: Boolean, default: false }
      }]
    },
    
    privacy: {
      privacyPolicyUrl: { type: String, trim: true },
      termsOfServiceUrl: { type: String, trim: true },
      cookieConsentEnabled: { type: Boolean, default: true },
      cookieConsentMessage: { type: String },
      gdprCompliant: { type: Boolean, default: false }
    },
    
    scripts: {
      headerScripts: { type: String },
      footerScripts: { type: String },
      customCSS: { type: String }
    },
    
    cache: {
      enabled: { type: Boolean, default: true },
      duration: { type: Number, default: 60 },
      excludePages: [{ type: String }]
    },
    
    api: {
      rateLimit: { type: Number, default: 100 },
      enableCORS: { type: Boolean, default: true },
      allowedOrigins: [{ type: String }]
    },
    
    customSettings: {
      type: Map,
      of: Schema.Types.Mixed
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

// Ensure only one settings document exists
cmsSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ siteTitle: 'My Site' });
  }
  return settings;
};

const CMSSettings = mongoose.model<ICMSSettings>('CMSSettings', cmsSettingsSchema);

export default CMSSettings;

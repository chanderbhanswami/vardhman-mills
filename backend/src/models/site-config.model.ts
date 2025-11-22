import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteConfig extends Document {
  // General Settings
  siteName: string;
  tagline?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  
  // Contact Information
  contact: {
    email?: string;
    phone?: string;
    alternatePhone?: string;
    address?: string;
    supportEmail?: string;
    salesEmail?: string;
  };
  
  // Social Media Links
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    pinterest?: string;
    tiktok?: string;
    whatsapp?: string;
    telegram?: string;
  };
  
  // Business Hours
  businessHours?: {
    monday?: { open: string; close: string; isClosed?: boolean };
    tuesday?: { open: string; close: string; isClosed?: boolean };
    wednesday?: { open: string; close: string; isClosed?: boolean };
    thursday?: { open: string; close: string; isClosed?: boolean };
    friday?: { open: string; close: string; isClosed?: boolean };
    saturday?: { open: string; close: string; isClosed?: boolean };
    sunday?: { open: string; close: string; isClosed?: boolean };
  };
  
  // SEO Settings
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    tiktokPixelId?: string;
  };
  
  // Features
  features: {
    enableBlog?: boolean;
    enableReviews?: boolean;
    enableWishlist?: boolean;
    enableCompare?: boolean;
    enableChat?: boolean;
    enableNotifications?: boolean;
    enableNewsletter?: boolean;
    enableMultiCurrency?: boolean;
    enableMultiLanguage?: boolean;
  };
  
  // Payment Settings
  payment: {
    enableCOD?: boolean;
    enableOnlinePayment?: boolean;
    currency?: string;
    currencySymbol?: string;
    taxRate?: number;
    shippingFee?: number;
    freeShippingThreshold?: number;
  };
  
  // Email Settings
  email: {
    fromName?: string;
    fromEmail?: string;
    replyToEmail?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
  };
  
  // Maintenance Mode
  maintenance: {
    enabled: boolean;
    message?: string;
    allowedIPs?: string[];
    startTime?: Date;
    endTime?: Date;
  };
  
  // Legal
  legal: {
    termsUrl?: string;
    privacyUrl?: string;
    refundUrl?: string;
    shippingUrl?: string;
    cookiePolicyUrl?: string;
  };
  
  // Custom Scripts
  scripts: {
    headerScripts?: string; // e.g., Google Analytics
    footerScripts?: string; // e.g., Chat widgets
    customCSS?: string;
  };
  
  // API Keys (encrypted)
  apiKeys: {
    googleMapsApiKey?: string;
    recaptchaSiteKey?: string;
    recaptchaSecretKey?: string;
    cloudinaryCloudName?: string;
    cloudinaryApiKey?: string;
    stripePublishableKey?: string;
    razorpayKeyId?: string;
  };
  
  // Theme Settings
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    layout?: 'default' | 'boxed' | 'wide';
  };
  
  // Footer Settings
  footer: {
    copyrightText?: string;
    showSocialLinks?: boolean;
    showPaymentMethods?: boolean;
    paymentMethods?: string[];
    columns?: Array<{
      title: string;
      links: Array<{
        text: string;
        url: string;
      }>;
    }>;
  };
  
  // Notifications
  notifications: {
    enableEmailNotifications?: boolean;
    enableSMSNotifications?: boolean;
    enablePushNotifications?: boolean;
    orderConfirmation?: boolean;
    orderStatusUpdate?: boolean;
    newsletterWelcome?: boolean;
  };
  
  // Status
  isActive: boolean;
  
  // Metadata
  metadata?: Map<string, any>;
  
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const siteConfigSchema = new Schema<ISiteConfig>(
  {
    siteName: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
      maxlength: [100, 'Site name cannot exceed 100 characters']
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, 'Tagline cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true
    },
    logo: { type: String, trim: true },
    favicon: { type: String, trim: true },
    contact: {
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      alternatePhone: { type: String, trim: true },
      address: { type: String, trim: true },
      supportEmail: { type: String, trim: true, lowercase: true },
      salesEmail: { type: String, trim: true, lowercase: true }
    },
    socialMedia: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      youtube: { type: String, trim: true },
      pinterest: { type: String, trim: true },
      tiktok: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      telegram: { type: String, trim: true }
    },
    businessHours: {
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
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 70 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      metaKeywords: [{ type: String, trim: true }],
      ogImage: { type: String, trim: true },
      twitterCard: {
        type: String,
        enum: ['summary', 'summary_large_image', 'app', 'player'],
        default: 'summary_large_image'
      },
      googleAnalyticsId: { type: String, trim: true },
      googleTagManagerId: { type: String, trim: true },
      facebookPixelId: { type: String, trim: true },
      tiktokPixelId: { type: String, trim: true }
    },
    features: {
      enableBlog: { type: Boolean, default: true },
      enableReviews: { type: Boolean, default: true },
      enableWishlist: { type: Boolean, default: true },
      enableCompare: { type: Boolean, default: true },
      enableChat: { type: Boolean, default: false },
      enableNotifications: { type: Boolean, default: true },
      enableNewsletter: { type: Boolean, default: true },
      enableMultiCurrency: { type: Boolean, default: false },
      enableMultiLanguage: { type: Boolean, default: false }
    },
    payment: {
      enableCOD: { type: Boolean, default: true },
      enableOnlinePayment: { type: Boolean, default: true },
      currency: { type: String, trim: true, default: 'INR' },
      currencySymbol: { type: String, trim: true, default: '₹' },
      taxRate: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      freeShippingThreshold: { type: Number }
    },
    email: {
      fromName: { type: String, trim: true },
      fromEmail: { type: String, trim: true, lowercase: true },
      replyToEmail: { type: String, trim: true, lowercase: true },
      smtpHost: { type: String, trim: true },
      smtpPort: { type: Number },
      smtpSecure: { type: Boolean, default: true }
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: { type: String, trim: true },
      allowedIPs: [{ type: String, trim: true }],
      startTime: { type: Date },
      endTime: { type: Date }
    },
    legal: {
      termsUrl: { type: String, trim: true },
      privacyUrl: { type: String, trim: true },
      refundUrl: { type: String, trim: true },
      shippingUrl: { type: String, trim: true },
      cookiePolicyUrl: { type: String, trim: true }
    },
    scripts: {
      headerScripts: { type: String },
      footerScripts: { type: String },
      customCSS: { type: String }
    },
    apiKeys: {
      googleMapsApiKey: { type: String, trim: true },
      recaptchaSiteKey: { type: String, trim: true },
      recaptchaSecretKey: { type: String, trim: true },
      cloudinaryCloudName: { type: String, trim: true },
      cloudinaryApiKey: { type: String, trim: true },
      stripePublishableKey: { type: String, trim: true },
      razorpayKeyId: { type: String, trim: true }
    },
    theme: {
      primaryColor: { type: String, trim: true },
      secondaryColor: { type: String, trim: true },
      accentColor: { type: String, trim: true },
      fontFamily: { type: String, trim: true },
      layout: {
        type: String,
        enum: ['default', 'boxed', 'wide'],
        default: 'default'
      }
    },
    footer: {
      copyrightText: { type: String, trim: true },
      showSocialLinks: { type: Boolean, default: true },
      showPaymentMethods: { type: Boolean, default: true },
      paymentMethods: [{ type: String, trim: true }],
      columns: [{
        title: { type: String, trim: true },
        links: [{
          text: { type: String, trim: true },
          url: { type: String, trim: true }
        }]
      }]
    },
    notifications: {
      enableEmailNotifications: { type: Boolean, default: true },
      enableSMSNotifications: { type: Boolean, default: false },
      enablePushNotifications: { type: Boolean, default: false },
      orderConfirmation: { type: Boolean, default: true },
      orderStatusUpdate: { type: Boolean, default: true },
      newsletterWelcome: { type: Boolean, default: true }
    },
    isActive: { type: Boolean, default: true },
    metadata: {
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

// Indexes
siteConfigSchema.index({ isActive: 1 });

const SiteConfig = mongoose.model<ISiteConfig>('SiteConfig', siteConfigSchema);

export default SiteConfig;

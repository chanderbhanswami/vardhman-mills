/**
 * SEO Model
 * Comprehensive SEO management system with meta tags, sitemaps, schema markup, and auditing
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Change Frequency Types for Sitemap
 */
export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

/**
 * Twitter Card Types
 */
export type TwitterCardType = 'summary' | 'summary_large_image' | 'app' | 'player';

/**
 * Redirect Status Codes
 */
export type RedirectStatusCode = 301 | 302 | 307 | 308;

/**
 * Schema Markup Types
 */
export type SchemaType = 
  | 'Organization' 
  | 'LocalBusiness' 
  | 'Product' 
  | 'Article' 
  | 'Event' 
  | 'Recipe' 
  | 'FAQ' 
  | 'BreadcrumbList' 
  | 'Review' 
  | 'Rating'
  | 'Person'
  | 'Service'
  | 'Course'
  | 'VideoObject';

/**
 * SEO Audit Item Type
 */
export type AuditItemType = 'error' | 'warning' | 'info' | 'success';

/**
 * SEO Audit Category
 */
export type AuditCategory = 'meta' | 'content' | 'technical' | 'performance' | 'accessibility' | 'best-practices';

/**
 * SEO Audit Impact Level
 */
export type ImpactLevel = 'high' | 'medium' | 'low';

/**
 * Validation Status
 */
export type ValidationStatus = 'valid' | 'invalid' | 'warning';

// ============================================================================
// SUB-INTERFACES
// ============================================================================

export interface ISocialShareImages {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

export interface IAnalyticsConfig {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  hotjarId?: string;
  clarityId?: string;
  mixpanelId?: string;
}

export interface IVerificationConfig {
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  yandexVerification?: string;
  pinterestVerification?: string;
  alexaVerification?: string;
}

export interface IHreflangTag {
  hreflang: string;
  href: string;
}

export interface ISitemapImage {
  loc: string;
  title?: string;
  caption?: string;
  geoLocation?: string;
  license?: string;
}

export interface ISitemapVideo {
  loc: string;
  title: string;
  description: string;
  thumbnailLoc: string;
  duration?: number;
  rating?: number;
  viewCount?: number;
  publicationDate?: Date;
  familyFriendly?: boolean;
  platform?: string[];
  requiresSubscription?: boolean;
  uploader?: string;
  live?: boolean;
}

export interface ISitemapEntry {
  loc: string;
  lastmod: Date;
  changefreq: ChangeFrequency;
  priority: number;
  images?: ISitemapImage[];
  videos?: ISitemapVideo[];
  alternates?: IHreflangTag[];
}

export interface IRobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
  comment?: string;
}

export interface IAuditItem {
  type: AuditItemType;
  category: AuditCategory;
  title: string;
  description: string;
  impact: ImpactLevel;
  recommendation: string;
  url?: string;
  element?: string;
  value?: string;
  expected?: string;
  resources?: string[];
}

export interface IPerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  speedIndex: number;
  timeToInteractive: number;
}

export interface IAccessibilityMetrics {
  score: number;
  issues: number;
  passedAudits: number;
  failedAudits: number;
  warningAudits: number;
}

export interface IBestPracticesMetrics {
  score: number;
  issues: number;
  httpsEnabled: boolean;
  http2Enabled: boolean;
  imageOptimization: boolean;
  textCompression: boolean;
}

export interface ISEOMetrics {
  score: number;
  issues: number;
  hasH1: boolean;
  hasMetaDescription: boolean;
  hasCanonical: boolean;
  hasRobots: boolean;
  hasOpenGraph: boolean;
  hasTwitterCards: boolean;
  hasStructuredData: boolean;
  mobileOptimized: boolean;
}

export interface IMetadataInfo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
  author?: string;
  publishedTime?: Date;
  modifiedTime?: Date;
}

export interface IContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  headingStructure: Array<{
    level: number;
    text: string;
    count?: number;
  }>;
  imageOptimization: {
    total: number;
    withAlt: number;
    optimized: number;
    withTitle: number;
    withLazyLoading: number;
  };
  linkAnalysis: {
    internal: number;
    external: number;
    broken: number;
    noFollow: number;
    withAnchorText: number;
  };
  paragraphCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  fleschReadingEase: number;
}

// ============================================================================
// DOCUMENT INTERFACES
// ============================================================================

/**
 * SEO Settings Document Interface
 */
export interface ISEOSettings extends Document {
  // Site-wide Settings
  siteTitle: string;
  siteDescription: string;
  defaultKeywords: string[];
  robotsContent: string;
  
  // Feature Flags
  sitemapEnabled: boolean;
  openGraphEnabled: boolean;
  twitterCardsEnabled: boolean;
  structuredDataEnabled: boolean;
  canonicalUrlsEnabled: boolean;
  hreflangEnabled: boolean;
  metaRobotsDefault: string;
  
  // Social & Analytics
  socialShareImages: ISocialShareImages;
  analytics: IAnalyticsConfig;
  verification: IVerificationConfig;
  
  // SEO Configuration
  defaultOgType: string;
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  locale: string;
  alternateLocales: string[];
  
  // Advanced Settings
  breadcrumbsEnabled: boolean;
  paginationEnabled: boolean;
  schemaAutoGenerate: boolean;
  imageAltAutoGenerate: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
}

/**
 * Page SEO Document Interface
 */
export interface IPageSEO extends Document {
  // Page Reference
  pageId: string;
  pageType: string;
  slug: string;
  
  // Basic Meta Tags
  title: string;
  description: string;
  keywords: string[];
  author?: string;
  
  // Open Graph Tags
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogLocale?: string;
  
  // Twitter Card Tags
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: TwitterCardType;
  twitterSite?: string;
  twitterCreator?: string;
  
  // Technical SEO
  canonicalUrl?: string;
  metaRobots?: string;
  hreflang?: IHreflangTag[];
  
  // Structured Data
  structuredData?: Record<string, any>;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  
  // Sitemap Settings
  priority?: number;
  changeFreq?: ChangeFrequency;
  lastModified?: Date;
  
  // Status & Visibility
  isIndexed: boolean;
  isActive: boolean;
  noIndex: boolean;
  noFollow: boolean;
  
  // SEO Score & Audit
  seoScore?: number;
  lastAuditDate?: Date;
  auditIssues?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
}

/**
 * Sitemap Document Interface
 */
export interface ISitemap extends Document {
  // Basic Info
  type: 'index' | 'pages' | 'products' | 'categories' | 'blog' | 'news' | 'images' | 'videos' | 'custom';
  name: string;
  url: string;
  
  // Entries
  entries: ISitemapEntry[];
  entryCount: number;
  
  // Settings
  compressed: boolean;
  isActive: boolean;
  autoGenerate: boolean;
  includeMobile: boolean;
  
  // Generation Info
  lastGenerated: Date;
  size: number;
  xmlContent?: string;
  
  // Submission Tracking
  submitted: boolean;
  submittedToGoogle?: Date;
  submittedToBing?: Date;
  submissionErrors?: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
}

/**
 * Robots.txt Document Interface
 */
export interface IRobotsTxt extends Document {
  // Content
  content: string;
  rules: IRobotsRule[];
  sitemaps: string[];
  host?: string;
  
  // Status
  isActive: boolean;
  lastModified: Date;
  
  // Validation
  isValid: boolean;
  validationErrors: string[];
  validationWarnings: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
}

/**
 * SEO Audit Document Interface
 */
export interface ISEOAudit extends Document {
  // Audit Target
  url: string;
  pageId?: string;
  
  // Overall Score
  score: number;
  
  // Audit Items
  items: IAuditItem[];
  
  // Performance Metrics
  performance: IPerformanceMetrics;
  
  // Category Scores
  accessibility: IAccessibilityMetrics;
  bestPractices: IBestPracticesMetrics;
  seo: ISEOMetrics;
  
  // Metadata Analysis
  metadata: IMetadataInfo;
  
  // Content Analysis
  contentAnalysis: IContentAnalysis;
  
  // Technical SEO
  technicalSEO: {
    hasH1: boolean;
    hasMetaDescription: boolean;
    hasCanonical: boolean;
    hasRobots: boolean;
    hasOpenGraph: boolean;
    hasTwitterCards: boolean;
    hasStructuredData: boolean;
    mobileOptimized: boolean;
    httpsEnabled: boolean;
    compressionEnabled: boolean;
    cachingEnabled: boolean;
    http2Enabled: boolean;
    hasServiceWorker: boolean;
    hasSitemap: boolean;
    hasRobotsTxt: boolean;
  };
  
  // Device & Environment
  mobile: boolean;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  
  // Audit Metadata
  auditedAt: Date;
  duration: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema Markup Document Interface
 */
export interface ISchemaMarkup extends Document {
  // Basic Info
  type: SchemaType;
  name: string;
  description?: string;
  
  // Schema JSON-LD (renamed from 'schema' to avoid conflict with Document.schema)
  schemaData: Record<string, any>;
  
  // Application
  pages: string[];
  isGlobal: boolean;
  isActive: boolean;
  
  // Validation
  validationStatus: ValidationStatus;
  validationErrors: string[];
  validationWarnings: string[];
  lastValidated: Date;
  
  // Testing
  testUrl?: string;
  richResultsEligible: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
}

/**
 * Meta Tag Document Interface
 */
export interface IMetaTag extends Document {
  // Tag Attributes
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
  charset?: string;
  itemprop?: string;
  
  // Application
  pages: string[];
  isGlobal: boolean;
  isActive: boolean;
  
  // Metadata
  description?: string;
  category: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
}

/**
 * Redirect Rule Document Interface
 */
export interface IRedirectRule extends Document {
  // URLs
  sourceUrl: string;
  targetUrl: string;
  
  // Configuration
  statusCode: RedirectStatusCode;
  isActive: boolean;
  isRegex: boolean;
  preserveQuery: boolean;
  preserveHash: boolean;
  
  // Metadata
  notes?: string;
  tags: string[];
  
  // Analytics
  hits: number;
  lastHit?: Date;
  
  // Testing
  testResults?: {
    tested: boolean;
    works: boolean;
    error?: string;
    testedAt: Date;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
  expiresAt?: Date;
}

// ============================================================================
// SCHEMAS
// ============================================================================

/**
 * SEO Settings Schema
 */
const seoSettingsSchema = new Schema<ISEOSettings>({
  siteTitle: {
    type: String,
    required: [true, 'Site title is required'],
    trim: true,
    maxlength: [70, 'Site title cannot exceed 70 characters']
  },
  
  siteDescription: {
    type: String,
    required: [true, 'Site description is required'],
    trim: true,
    maxlength: [160, 'Site description cannot exceed 160 characters']
  },
  
  defaultKeywords: [{
    type: String,
    trim: true
  }],
  
  robotsContent: {
    type: String,
    default: 'index, follow'
  },
  
  sitemapEnabled: {
    type: Boolean,
    default: true
  },
  
  openGraphEnabled: {
    type: Boolean,
    default: true
  },
  
  twitterCardsEnabled: {
    type: Boolean,
    default: true
  },
  
  structuredDataEnabled: {
    type: Boolean,
    default: true
  },
  
  canonicalUrlsEnabled: {
    type: Boolean,
    default: true
  },
  
  hreflangEnabled: {
    type: Boolean,
    default: false
  },
  
  metaRobotsDefault: {
    type: String,
    default: 'index, follow'
  },
  
  socialShareImages: {
    facebook: String,
    twitter: String,
    linkedin: String
  },
  
  analytics: {
    googleAnalyticsId: String,
    googleTagManagerId: String,
    facebookPixelId: String,
    hotjarId: String,
    clarityId: String,
    mixpanelId: String
  },
  
  verification: {
    googleSiteVerification: String,
    bingSiteVerification: String,
    yandexVerification: String,
    pinterestVerification: String,
    alexaVerification: String
  },
  
  defaultOgType: {
    type: String,
    default: 'website'
  },
  
  siteName: String,
  siteUrl: String,
  defaultImage: String,
  locale: {
    type: String,
    default: 'en_US'
  },
  alternateLocales: [String],
  
  breadcrumbsEnabled: {
    type: Boolean,
    default: true
  },
  
  paginationEnabled: {
    type: Boolean,
    default: true
  },
  
  schemaAutoGenerate: {
    type: Boolean,
    default: true
  },
  
  imageAltAutoGenerate: {
    type: Boolean,
    default: false
  },
  
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'seo_settings'
});

/**
 * Page SEO Schema
 */
const pageSEOSchema = new Schema<IPageSEO>({
  pageId: {
    type: String,
    required: [true, 'Page ID is required'],
    unique: true,
    index: true
  },
  
  pageType: {
    type: String,
    required: true,
    enum: ['page', 'product', 'category', 'blog', 'article', 'home', 'custom'],
    index: true
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [70, 'Title cannot exceed 70 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [160, 'Description cannot exceed 160 characters']
  },
  
  keywords: [{
    type: String,
    trim: true
  }],
  
  author: String,
  
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  ogType: String,
  ogUrl: String,
  ogSiteName: String,
  ogLocale: String,
  
  twitterTitle: String,
  twitterDescription: String,
  twitterImage: String,
  twitterCard: {
    type: String,
    enum: ['summary', 'summary_large_image', 'app', 'player']
  },
  twitterSite: String,
  twitterCreator: String,
  
  canonicalUrl: String,
  metaRobots: String,
  
  hreflang: [{
    hreflang: String,
    href: String
  }],
  
  structuredData: Schema.Types.Mixed,
  
  breadcrumbs: [{
    name: String,
    url: String
  }],
  
  priority: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  
  changeFreq: {
    type: String,
    enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
    default: 'weekly'
  },
  
  lastModified: Date,
  
  isIndexed: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  noIndex: {
    type: Boolean,
    default: false
  },
  
  noFollow: {
    type: Boolean,
    default: false
  },
  
  seoScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  lastAuditDate: Date,
  auditIssues: {
    type: Number,
    default: 0
  },
  
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'page_seo'
});

// Indexes for Page SEO
pageSEOSchema.index({ pageId: 1, isActive: 1 });
pageSEOSchema.index({ pageType: 1, isActive: 1 });
pageSEOSchema.index({ isIndexed: 1, isActive: 1 });
pageSEOSchema.index({ seoScore: -1 });
pageSEOSchema.index({ lastModified: -1 });

/**
 * Sitemap Schema
 */
const sitemapSchema = new Schema<ISitemap>({
  type: {
    type: String,
    enum: ['index', 'pages', 'products', 'categories', 'blog', 'news', 'images', 'videos', 'custom'],
    required: true,
    index: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  url: {
    type: String,
    required: true,
    unique: true
  },
  
  entries: [{
    loc: {
      type: String,
      required: true
    },
    lastmod: {
      type: Date,
      default: Date.now
    },
    changefreq: {
      type: String,
      enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
      default: 'weekly'
    },
    priority: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    images: [{
      loc: String,
      title: String,
      caption: String,
      geoLocation: String,
      license: String
    }],
    videos: [{
      loc: String,
      title: String,
      description: String,
      thumbnailLoc: String,
      duration: Number,
      rating: Number,
      viewCount: Number,
      publicationDate: Date,
      familyFriendly: Boolean,
      platform: [String],
      requiresSubscription: Boolean,
      uploader: String,
      live: Boolean
    }],
    alternates: [{
      hreflang: String,
      href: String
    }]
  }],
  
  entryCount: {
    type: Number,
    default: 0
  },
  
  compressed: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  autoGenerate: {
    type: Boolean,
    default: true
  },
  
  includeMobile: {
    type: Boolean,
    default: true
  },
  
  lastGenerated: {
    type: Date,
    default: Date.now
  },
  
  size: {
    type: Number,
    default: 0
  },
  
  xmlContent: String,
  
  submitted: {
    type: Boolean,
    default: false
  },
  
  submittedToGoogle: Date,
  submittedToBing: Date,
  submissionErrors: [String],
  
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'sitemaps'
});

// Pre-save middleware to update entryCount
sitemapSchema.pre('save', function(next) {
  this.entryCount = this.entries.length;
  next();
});

/**
 * Robots.txt Schema
 */
const robotsTxtSchema = new Schema<IRobotsTxt>({
  content: {
    type: String,
    required: true
  },
  
  rules: [{
    userAgent: {
      type: String,
      required: true
    },
    allow: [String],
    disallow: [String],
    crawlDelay: Number,
    comment: String
  }],
  
  sitemaps: [String],
  host: String,
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastModified: {
    type: Date,
    default: Date.now
  },
  
  isValid: {
    type: Boolean,
    default: true
  },
  
  validationErrors: [String],
  validationWarnings: [String],
  
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'robots_txt'
});

/**
 * SEO Audit Schema
 */
const seoAuditSchema = new Schema<ISEOAudit>({
  url: {
    type: String,
    required: true,
    index: true
  },
  
  pageId: {
    type: String,
    index: true
  },
  
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  
  items: [{
    type: {
      type: String,
      enum: ['error', 'warning', 'info', 'success'],
      required: true
    },
    category: {
      type: String,
      enum: ['meta', 'content', 'technical', 'performance', 'accessibility', 'best-practices'],
      required: true
    },
    title: String,
    description: String,
    impact: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    recommendation: String,
    url: String,
    element: String,
    value: String,
    expected: String,
    resources: [String]
  }],
  
  performance: {
    firstContentfulPaint: Number,
    largestContentfulPaint: Number,
    firstInputDelay: Number,
    cumulativeLayoutShift: Number,
    totalBlockingTime: Number,
    speedIndex: Number,
    timeToInteractive: Number
  },
  
  accessibility: {
    score: Number,
    issues: Number,
    passedAudits: Number,
    failedAudits: Number,
    warningAudits: Number
  },
  
  bestPractices: {
    score: Number,
    issues: Number,
    httpsEnabled: Boolean,
    http2Enabled: Boolean,
    imageOptimization: Boolean,
    textCompression: Boolean
  },
  
  seo: {
    score: Number,
    issues: Number,
    hasH1: Boolean,
    hasMetaDescription: Boolean,
    hasCanonical: Boolean,
    hasRobots: Boolean,
    hasOpenGraph: Boolean,
    hasTwitterCards: Boolean,
    hasStructuredData: Boolean,
    mobileOptimized: Boolean
  },
  
  metadata: {
    title: String,
    description: String,
    keywords: [String],
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterTitle: String,
    twitterDescription: String,
    twitterImage: String,
    canonicalUrl: String,
    robots: String,
    author: String,
    publishedTime: Date,
    modifiedTime: Date
  },
  
  contentAnalysis: {
    wordCount: Number,
    readabilityScore: Number,
    keywordDensity: Schema.Types.Mixed,
    headingStructure: [{
      level: Number,
      text: String,
      count: Number
    }],
    imageOptimization: {
      total: Number,
      withAlt: Number,
      optimized: Number,
      withTitle: Number,
      withLazyLoading: Number
    },
    linkAnalysis: {
      internal: Number,
      external: Number,
      broken: Number,
      noFollow: Number,
      withAnchorText: Number
    },
    paragraphCount: Number,
    sentenceCount: Number,
    averageWordsPerSentence: Number,
    fleschReadingEase: Number
  },
  
  technicalSEO: {
    hasH1: Boolean,
    hasMetaDescription: Boolean,
    hasCanonical: Boolean,
    hasRobots: Boolean,
    hasOpenGraph: Boolean,
    hasTwitterCards: Boolean,
    hasStructuredData: Boolean,
    mobileOptimized: Boolean,
    httpsEnabled: Boolean,
    compressionEnabled: Boolean,
    cachingEnabled: Boolean,
    http2Enabled: Boolean,
    hasServiceWorker: Boolean,
    hasSitemap: Boolean,
    hasRobotsTxt: Boolean
  },
  
  mobile: {
    type: Boolean,
    default: false
  },
  
  userAgent: String,
  
  viewport: {
    width: Number,
    height: Number
  },
  
  auditedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  duration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'seo_audits'
});

// Indexes for SEO Audit
seoAuditSchema.index({ url: 1, auditedAt: -1 });
seoAuditSchema.index({ score: -1 });
seoAuditSchema.index({ pageId: 1, auditedAt: -1 });

/**
 * Schema Markup Schema
 */
const schemaMarkupSchema = new Schema<ISchemaMarkup>({
  type: {
    type: String,
    enum: [
      'Organization', 'LocalBusiness', 'Product', 'Article', 'Event', 
      'Recipe', 'FAQ', 'BreadcrumbList', 'Review', 'Rating',
      'Person', 'Service', 'Course', 'VideoObject'
    ],
    required: true,
    index: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: String,
  
  schemaData: {
    type: Schema.Types.Mixed,
    required: true
  },
  
  pages: [{
    type: String
  }],
  
  isGlobal: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  validationStatus: {
    type: String,
    enum: ['valid', 'invalid', 'warning'],
    default: 'valid',
    index: true
  },
  
  validationErrors: [String],
  validationWarnings: [String],
  
  lastValidated: {
    type: Date,
    default: Date.now
  },
  
  testUrl: String,
  richResultsEligible: {
    type: Boolean,
    default: false
  },
  
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'schema_markup'
});

/**
 * Meta Tag Schema
 */
const metaTagSchema = new Schema<IMetaTag>({
  name: String,
  property: String,
  content: {
    type: String,
    required: true
  },
  httpEquiv: String,
  charset: String,
  itemprop: String,
  
  pages: [String],
  
  isGlobal: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  description: String,
  category: {
    type: String,
    default: 'general'
  },
  
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'meta_tags'
});

/**
 * Redirect Rule Schema
 */
const redirectRuleSchema = new Schema<IRedirectRule>({
  sourceUrl: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  targetUrl: {
    type: String,
    required: true
  },
  
  statusCode: {
    type: Number,
    enum: [301, 302, 307, 308],
    default: 301,
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isRegex: {
    type: Boolean,
    default: false
  },
  
  preserveQuery: {
    type: Boolean,
    default: true
  },
  
  preserveHash: {
    type: Boolean,
    default: true
  },
  
  notes: String,
  tags: [String],
  
  hits: {
    type: Number,
    default: 0,
    index: true
  },
  
  lastHit: Date,
  
  testResults: {
    tested: Boolean,
    works: Boolean,
    error: String,
    testedAt: Date
  },
  
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  expiresAt: Date
}, {
  timestamps: true,
  collection: 'redirect_rules'
});

// Indexes for Redirect Rules
redirectRuleSchema.index({ sourceUrl: 1, isActive: 1 });
redirectRuleSchema.index({ hits: -1 });
redirectRuleSchema.index({ expiresAt: 1 });

// ============================================================================
// MODELS EXPORT
// ============================================================================

export const SEOSettings = mongoose.model<ISEOSettings>('SEOSettings', seoSettingsSchema);
export const PageSEO = mongoose.model<IPageSEO>('PageSEO', pageSEOSchema);
export const Sitemap = mongoose.model<ISitemap>('Sitemap', sitemapSchema);
export const RobotsTxt = mongoose.model<IRobotsTxt>('RobotsTxt', robotsTxtSchema);
export const SEOAudit = mongoose.model<ISEOAudit>('SEOAudit', seoAuditSchema);
export const SchemaMarkup = mongoose.model<ISchemaMarkup>('SchemaMarkup', schemaMarkupSchema);
export const MetaTag = mongoose.model<IMetaTag>('MetaTag', metaTagSchema);
export const RedirectRule = mongoose.model<IRedirectRule>('RedirectRule', redirectRuleSchema);

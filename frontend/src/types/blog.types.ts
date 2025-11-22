/**
 * Blog Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for blog posts, articles, categories,
 * authors, comments, and content management system.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { ID, Timestamp, BaseEntity, ImageAsset, SEOData } from './common.types';

// ============================================================================
// BLOG POST CORE TYPES
// ============================================================================

/**
 * Main blog post structure
 */
export interface BlogPost extends BaseEntity {
  // Basic Information
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  
  // Authoring
  author: BlogAuthor;
  coAuthors?: BlogAuthor[];
  
  // Categorization
  categories: BlogCategory[];
  tags: BlogTag[];
  
  // Media
  featuredImage: ImageAsset;
  gallery?: ImageAsset[];
  
  // Content Structure
  contentBlocks?: ContentBlock[];
  tableOfContents?: TableOfContentsItem[];
  
  // Publishing
  status: BlogPostStatus;
  publishedAt?: Timestamp;
  scheduledFor?: Timestamp;
  
  // Engagement
  engagement: BlogEngagement;
  
  // SEO and Metadata
  seo: SEOData;
  readingTime: number; // in minutes
  
  // Related Content
  relatedPosts?: ID[];
  relatedProducts?: ID[];
  
  // Settings
  settings: BlogPostSettings;
  
  // Analytics
  analytics: BlogAnalytics;
  
  // Revision History
  revisions: BlogRevision[];
  version: number;
}

/**
 * Blog post status options
 */
export type BlogPostStatus = 
  | 'draft'      // Work in progress
  | 'review'     // Under review
  | 'scheduled'  // Scheduled for future publishing
  | 'published'  // Live and public
  | 'archived'   // Moved to archive
  | 'private'    // Private/internal only
  | 'deleted';   // Soft deleted

/**
 * Blog post settings and configuration
 */
export interface BlogPostSettings {
  // Visibility
  isPublic: boolean;
  requiresAuth: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  
  // Comments
  allowComments: boolean;
  allowGuestComments: boolean;
  moderateComments: boolean;
  
  // Social Features
  allowSharing: boolean;
  allowLikes: boolean;
  showAuthorBio: boolean;
  showRelatedPosts: boolean;
  
  // Content
  allowPrint: boolean;
  allowCopy: boolean;
  showTableOfContents: boolean;
  enableReadingProgress: boolean;
  
  // Notifications
  notifyOnComment: boolean;
  notifyOnShare: boolean;
  
  // Advanced
  customCSS?: string;
  customJS?: string;
  canonicalUrl?: string;
  redirectUrl?: string;
}

// ============================================================================
// AUTHOR AND TEAM TYPES
// ============================================================================

/**
 * Blog author information
 */
export interface BlogAuthor extends BaseEntity {
  // Personal Information
  userId?: ID; // Link to user account if exists
  name: string;
  email: string;
  bio: string;
  
  // Professional Information
  title: string;
  expertise: string[];
  credentials: string[];
  
  // Media
  avatar: ImageAsset;
  coverImage?: ImageAsset;
  
  // Social Links
  socialLinks: AuthorSocialLink[];
  website?: string;
  
  // Statistics
  stats: AuthorStats;
  
  // Settings
  isActive: boolean;
  isGuest: boolean;
  displayOrder: number;
  
  // Contact
  contactEmail?: string;
  linkedinProfile?: string;
  twitterHandle?: string;
}

/**
 * Author social media links
 */
export interface AuthorSocialLink {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'website' | 'other';
  url: string;
  username?: string;
  isVerified?: boolean;
}

/**
 * Author statistics
 */
export interface AuthorStats {
  totalPosts: number;
  publishedPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageRating: number;
  followerCount: number;
  
  // Performance Metrics
  averageEngagementRate: number;
  mostPopularPost?: {
    postId: ID;
    title: string;
    views: number;
  };
  
  // Time-based
  postsThisMonth: number;
  postsThisYear: number;
  firstPostDate: Timestamp;
  lastPostDate: Timestamp;
}

// ============================================================================
// CATEGORY AND TAG TYPES
// ============================================================================

/**
 * Blog category structure
 */
export interface BlogCategory extends BaseEntity {
  // Basic Information
  name: string;
  slug: string;
  description: string;
  
  // Hierarchy
  parentId?: ID;
  children?: BlogCategory[];
  level: number;
  
  // Media
  image?: ImageAsset;
  icon?: string;
  color?: string;
  
  // Content
  postCount: number;
  featuredPosts?: ID[];
  
  // SEO
  seo: SEOData;
  
  // Settings
  isActive: boolean;
  displayOrder: number;
  showInMenu: boolean;
  showOnHomepage: boolean;
  
  // Analytics
  analytics: CategoryAnalytics;
}

/**
 * Blog tag structure
 */
export interface BlogTag extends BaseEntity {
  // Basic Information
  name: string;
  slug: string;
  description?: string;
  
  // Usage
  postCount: number;
  usageFrequency: number;
  
  // Categorization
  categoryId?: ID;
  tagGroup?: string;
  
  // Display
  color?: string;
  isPopular: boolean;
  isTrending: boolean;
  
  // Analytics
  clickCount: number;
  searchCount: number;
}

/**
 * Category analytics data
 */
export interface CategoryAnalytics {
  // Engagement
  totalViews: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  
  // Growth
  viewGrowthRate: number;
  postGrowthRate: number;
  
  // Popular Content
  topPosts: {
    postId: ID;
    title: string;
    views: number;
    engagement: number;
  }[];
  
  // Time-based Data
  viewsByMonth: number[];
  postsByMonth: number[];
  
  // Demographics
  audienceDemographics?: {
    ageGroups: { [range: string]: number };
    locations: { [country: string]: number };
    devices: { [device: string]: number };
  };
}

// ============================================================================
// CONTENT STRUCTURE TYPES
// ============================================================================

/**
 * Content block for rich blog posts
 */
export interface ContentBlock {
  id: ID;
  type: ContentBlockType;
  content: ContentBlockData;
  order: number;
  
  // Styling
  style?: {
    className?: string;
    customCSS?: string;
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
  };
  
  // Settings
  isVisible: boolean;
  isCollapsible?: boolean;
  isExpandable?: boolean;
  
  // Responsive
  responsiveSettings?: {
    mobile: Partial<ContentBlock>;
    tablet: Partial<ContentBlock>;
    desktop: Partial<ContentBlock>;
  };
}

/**
 * Available content block types
 */
export type ContentBlockType = 
  | 'paragraph'      // Text paragraph
  | 'heading'        // Heading (H1-H6)
  | 'image'          // Single image
  | 'gallery'        // Image gallery
  | 'video'          // Video embed
  | 'audio'          // Audio embed
  | 'quote'          // Blockquote
  | 'code'           // Code block
  | 'list'           // Bulleted/numbered list
  | 'table'          // Data table
  | 'divider'        // Section divider
  | 'embed'          // Third-party embed
  | 'call_to_action' // CTA button/section
  | 'product_showcase' // Product display
  | 'newsletter_signup' // Newsletter form
  | 'social_share'   // Social sharing buttons
  | 'related_posts'  // Related posts section
  | 'author_bio'     // Author information
  | 'comment_section' // Comments
  | 'custom';        // Custom HTML

/**
 * Content block data structure
 */
export interface ContentBlockData {
  // Text Content
  text?: string;
  html?: string;
  markdown?: string;
  
  // Media Content
  images?: ImageAsset[];
  video?: {
    url: string;
    thumbnail: ImageAsset;
    duration?: number;
    platform: 'youtube' | 'vimeo' | 'wistia' | 'self_hosted';
  };
  audio?: {
    url: string;
    duration?: number;
    title?: string;
  };
  
  // Structured Content
  heading?: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
    anchor?: string;
  };
  list?: {
    type: 'ordered' | 'unordered';
    items: string[];
  };
  table?: {
    headers: string[];
    rows: string[][];
    caption?: string;
  };
  quote?: {
    text: string;
    author?: string;
    source?: string;
    cite?: string;
  };
  code?: {
    language: string;
    code: string;
    filename?: string;
    showLineNumbers?: boolean;
  };
  
  // Interactive Content
  callToAction?: {
    title: string;
    description?: string;
    buttonText: string;
    buttonUrl: string;
    buttonStyle: 'primary' | 'secondary' | 'outline';
  };
  
  // Product Content
  products?: {
    productIds: ID[];
    displayStyle: 'grid' | 'list' | 'carousel';
    showPrices: boolean;
    showRatings: boolean;
  };
  
  // Custom Content
  customData?: Record<string, unknown>;
}

/**
 * Table of contents item
 */
export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children?: TableOfContentsItem[];
}

// ============================================================================
// ENGAGEMENT AND INTERACTION TYPES
// ============================================================================

/**
 * Blog post engagement metrics
 */
export interface BlogEngagement {
  // View Metrics
  views: number;
  uniqueViews: number;
  
  // Interaction Metrics
  likes: number;
  dislikes: number;
  shares: number;
  bookmarks: number;
  
  // Comment Metrics
  comments: number;
  approvedComments: number;
  pendingComments: number;
  
  // Social Metrics
  socialShares: {
    [platform: string]: number;
  };
  
  // Reading Metrics
  averageReadingTime: number;
  readingCompletion: number; // Percentage
  scrollDepth: number;
  
  // Conversion Metrics
  clickThroughRate: number;
  conversionRate: number;
  
  // Time-based Metrics
  peakEngagementTime: {
    hour: number;
    day: string;
    engagement: number;
  };
  
  // User Engagement
  returningReaders: number;
  subscriberEngagement: number;
}

/**
 * Blog comment structure
 */
export interface BlogComment extends BaseEntity {
  // Basic Information
  postId: ID;
  content: string;
  
  // Author Information
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  authorIP?: string;
  userId?: ID; // If logged in user
  
  // Hierarchy
  parentId?: ID; // For replies
  replies?: BlogComment[];
  level: number;
  
  // Status
  status: CommentStatus;
  moderationReason?: string;
  
  // Engagement
  likes: number;
  dislikes: number;
  reports: number;
  
  // Metadata
  userAgent?: string;
  isAuthorReply: boolean;
  isHighlighted: boolean;
  isPinned: boolean;
  
  // Timestamps
  publishedAt?: Timestamp;
}

/**
 * Comment status options
 */
export type CommentStatus = 
  | 'pending'    // Awaiting moderation
  | 'approved'   // Published and visible
  | 'rejected'   // Rejected by moderator
  | 'spam'       // Marked as spam
  | 'deleted';   // Deleted by user/admin

// ============================================================================
// ANALYTICS AND REPORTING TYPES
// ============================================================================

/**
 * Blog analytics data
 */
export interface BlogAnalytics {
  // Performance Metrics
  performance: BlogPerformanceMetrics;
  
  // Audience Metrics
  audience: BlogAudienceMetrics;
  
  // Content Metrics
  content: BlogContentMetrics;
  
  // SEO Metrics
  seo: BlogSEOMetrics;
  
  // Social Metrics
  social: BlogSocialMetrics;
  
  // Conversion Metrics
  conversion: BlogConversionMetrics;
  
  // Historical Data
  historical: BlogHistoricalData;
  
  // Last Updated
  lastUpdated: Timestamp;
}

/**
 * Performance-focused metrics
 */
export interface BlogPerformanceMetrics {
  // Traffic
  totalPageViews: number;
  uniquePageViews: number;
  sessionDuration: number;
  bounceRate: number;
  
  // Engagement
  engagementRate: number;
  timeOnPage: number;
  pagesPerSession: number;
  
  // Growth
  trafficGrowthRate: number;
  engagementGrowthRate: number;
  
  // Quality Metrics
  returnVisitorRate: number;
  subscriptionRate: number;
  commentRate: number;
}

/**
 * Audience analysis metrics
 */
export interface BlogAudienceMetrics {
  // Demographics
  demographics: {
    ageGroups: { [range: string]: number };
    genderDistribution: { [gender: string]: number };
    locationDistribution: { [country: string]: number };
    deviceDistribution: { [device: string]: number };
  };
  
  // Behavior
  newVsReturning: {
    newVisitors: number;
    returningVisitors: number;
  };
  
  // Interests
  topInterests: string[];
  categoryPreferences: { [category: string]: number };
  
  // Acquisition
  trafficSources: {
    [source: string]: {
      sessions: number;
      percentage: number;
      bounceRate: number;
    };
  };
}

/**
 * Content performance metrics
 */
export interface BlogContentMetrics {
  // Content Performance
  topPerformingPosts: {
    postId: ID;
    title: string;
    views: number;
    engagement: number;
  }[];
  
  // Content Types
  performanceByType: {
    [type: string]: {
      posts: number;
      averageViews: number;
      averageEngagement: number;
    };
  };
  
  // Content Length
  performanceByLength: {
    [range: string]: {
      posts: number;
      averageViews: number;
      averageEngagement: number;
    };
  };
  
  // Publishing Frequency
  publishingFrequency: {
    postsPerWeek: number;
    postsPerMonth: number;
    consistency: number; // 0-1
  };
}

/**
 * SEO performance metrics
 */
export interface BlogSEOMetrics {
  // Search Performance
  organicTraffic: number;
  averagePosition: number;
  clickThroughRate: number;
  impressions: number;
  
  // Keyword Performance
  topKeywords: {
    keyword: string;
    position: number;
    clicks: number;
    impressions: number;
  }[];
  
  // Page Speed
  pageLoadTime: number;
  mobilePageSpeed: number;
  desktopPageSpeed: number;
  
  // Technical SEO
  indexedPages: number;
  crawlErrors: number;
  duplicateContent: number;
}

/**
 * Social media metrics
 */
export interface BlogSocialMetrics {
  // Platform Performance
  platformShares: {
    [platform: string]: {
      shares: number;
      clicks: number;
      engagement: number;
    };
  };
  
  // Social Traffic
  socialTraffic: number;
  socialTrafficGrowth: number;
  
  // Viral Content
  viralPosts: {
    postId: ID;
    title: string;
    totalShares: number;
    viralityScore: number;
  }[];
  
  // Influencer Metrics
  influencerMentions: number;
  influencerReach: number;
}

/**
 * Conversion tracking metrics
 */
export interface BlogConversionMetrics {
  // Goal Conversions
  totalConversions: number;
  conversionRate: number;
  conversionValue: number;
  
  // Newsletter Signups
  newsletterSignups: number;
  newsletterConversionRate: number;
  
  // Product Interactions
  productViews: number;
  productClicks: number;
  productConversions: number;
  
  // Lead Generation
  leadGeneration: number;
  leadQuality: number; // 1-10 scale
  
  // Revenue Attribution
  attributedRevenue: number;
  revenuePerVisitor: number;
}

/**
 * Historical performance data
 */
export interface BlogHistoricalData {
  // Time Series Data
  dailyViews: { date: string; views: number }[];
  weeklyEngagement: { week: string; engagement: number }[];
  monthlyGrowth: { month: string; growth: number }[];
  
  // Trend Analysis
  trendDirection: 'up' | 'down' | 'stable';
  trendStrength: number; // -1 to 1
  seasonalPatterns: {
    [season: string]: number;
  };
  
  // Milestone Tracking
  milestones: {
    date: Timestamp;
    type: 'views' | 'subscribers' | 'engagement' | 'revenue';
    value: number;
    description: string;
  }[];
}

// ============================================================================
// REVISION AND VERSION CONTROL TYPES
// ============================================================================

/**
 * Blog post revision information
 */
export interface BlogRevision extends BaseEntity {
  // Basic Information
  postId: ID;
  version: number;
  
  // Content
  title: string;
  content: string;
  excerpt: string;
  
  // Changes
  changesSummary: string;
  changedFields: string[];
  
  // Author Information
  revisedBy: ID;
  revisionReason: string;
  
  // Status
  isPublished: boolean;
  isBackup: boolean;
  
  // Diff Information
  diffFromPrevious?: {
    additions: number;
    deletions: number;
    changes: RevisionChange[];
  };
}

/**
 * Individual revision change
 */
export interface RevisionChange {
  field: string;
  type: 'addition' | 'deletion' | 'modification';
  oldValue?: string;
  newValue?: string;
  position?: number;
}

// ============================================================================
// NEWSLETTER AND SUBSCRIPTION TYPES
// ============================================================================

/**
 * Newsletter subscription information
 */
export interface NewsletterSubscription extends BaseEntity {
  // Subscriber Information
  email: string;
  name?: string;
  userId?: ID;
  
  // Subscription Details
  status: SubscriptionStatus;
  subscriptionDate: Timestamp;
  unsubscribeDate?: Timestamp;
  
  // Preferences
  preferences: SubscriptionPreferences;
  
  // Engagement
  emailsReceived: number;
  emailsOpened: number;
  emailsClicked: number;
  lastEngagement: Timestamp;
  
  // Segmentation
  segments: string[];
  tags: string[];
  
  // Source
  subscriptionSource: string;
  referralSource?: string;
}

/**
 * Subscription status options
 */
export type SubscriptionStatus = 
  | 'active'      // Active subscriber
  | 'pending'     // Email confirmation pending
  | 'unsubscribed' // Unsubscribed
  | 'bounced'     // Email bounced
  | 'complained'  // Marked as spam
  | 'cleaned';    // Removed due to inactivity

/**
 * Subscription preferences
 */
export interface SubscriptionPreferences {
  // Frequency
  frequency: 'daily' | 'weekly' | 'monthly' | 'immediate';
  
  // Content Types
  contentTypes: {
    newPosts: boolean;
    featuredContent: boolean;
    productUpdates: boolean;
    promotions: boolean;
    newsletters: boolean;
  };
  
  // Categories
  categories: ID[];
  
  // Format
  format: 'html' | 'text';
  
  // Language
  language: string;
  
  // Time Preferences
  bestTimeToSend?: {
    dayOfWeek: number;
    hour: number;
    timezone: string;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for blog post list
 */
export interface BlogPostListResponse {
  posts: BlogPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: BlogPostFilters;
  categories: BlogCategory[];
  tags: BlogTag[];
}

/**
 * Blog post filters for API queries
 */
export interface BlogPostFilters {
  // Content Filters
  status?: BlogPostStatus[];
  categories?: ID[];
  tags?: ID[];
  authors?: ID[];
  
  // Date Filters
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Search
  searchTerm?: string;
  searchFields?: ('title' | 'content' | 'excerpt')[];
  
  // Content Type
  featured?: boolean;
  hasVideo?: boolean;
  hasGallery?: boolean;
  
  // Performance
  minViews?: number;
  minEngagement?: number;
  
  // Sorting
  sortBy?: 'date' | 'views' | 'engagement' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Blog dashboard summary response
 */
export interface BlogDashboardResponse {
  // Overview
  summary: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalComments: number;
    totalSubscribers: number;
  };
  
  // Recent Activity
  recentPosts: BlogPost[];
  recentComments: BlogComment[];
  recentSubscribers: NewsletterSubscription[];
  
  // Performance
  topPerformingPosts: {
    postId: ID;
    title: string;
    views: number;
    engagement: number;
  }[];
  
  // Analytics
  analytics: {
    viewsThisMonth: number;
    viewsGrowth: number;
    engagementRate: number;
    subscriptionGrowth: number;
  };
  
  // Alerts
  alerts: {
    type: 'info' | 'warning' | 'error';
    message: string;
    actionRequired: boolean;
  }[];
}

// All types are exported inline
export default BlogPost;

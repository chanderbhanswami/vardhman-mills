import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  ImageAsset,
  SEOData 
} from './common.types';
import type { User } from './user.types';

// Blog Types
export interface BlogPost extends BaseEntity {
  // Basic Information
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  
  // Author Information
  authorId: ID;
  author: BlogAuthor;
  
  // Media
  featuredImage?: ImageAsset;
  gallery: ImageAsset[];
  videos?: VideoAsset[];
  
  // Classification
  categoryId: ID;
  category: BlogCategory;
  tags: BlogTag[];
  
  // Status and Publishing
  status: BlogStatus;
  publishedAt?: Timestamp;
  scheduledFor?: Timestamp;
  
  // SEO and Social
  seo: SEOData;
  socialSharing: SocialSharingData;
  
  // Engagement
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  readingTime: number; // minutes
  
  // Content Settings
  allowComments: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  
  // Related Content
  relatedPosts: ID[];
  relatedProducts: ID[];
  
  // Analytics
  analytics: BlogAnalytics;
}

export interface BlogAuthor extends BaseEntity {
  userId?: ID;
  user?: User;
  
  // Author Information
  name: string;
  displayName: string;
  bio: string;
  avatar?: ImageAsset;
  
  // Contact Information
  email?: string;
  website?: string;
  socialLinks: SocialLinks;
  
  // Statistics
  postCount: number;
  followerCount: number;
  totalViews: number;
  
  // Settings
  isVerified: boolean;
  isActive: boolean;
  canPublish: boolean;
  
  // Specialization
  expertise: string[];
  categories: ID[];
}

export interface BlogCategory extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  color?: string;
  icon?: string;
  
  // Hierarchy
  parentId?: ID;
  parent?: BlogCategory;
  children: BlogCategory[];
  
  // Media
  image?: ImageAsset;
  
  // Settings
  isActive: boolean;
  isFeatured: boolean;
  
  // Content
  postCount: number;
  
  // SEO
  seo: SEOData;
}

export interface BlogTag extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  
  // Usage
  postCount: number;
  
  // Settings
  isActive: boolean;
  
  // Related
  relatedTags: ID[];
}

export type BlogStatus = 
  | 'draft'
  | 'pending'
  | 'published'
  | 'scheduled'
  | 'archived'
  | 'deleted';

export interface BlogAnalytics {
  totalViews: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  sharesByPlatform: Record<string, number>;
  topReferrers: Array<{
    source: string;
    views: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geographicData: Array<{
    country: string;
    views: number;
  }>;
}

// FAQ Types
export interface FAQ extends BaseEntity {
  question: string;
  answer: string;
  
  // Classification
  categoryId: ID;
  category: FAQCategory;
  tags: string[];
  
  // Status
  isActive: boolean;
  isPopular: boolean;
  
  // Ordering
  order: number;
  
  // Usage Statistics
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  
  // Search
  searchKeywords: string[];
  
  // Related
  relatedFAQs: ID[];
  relatedArticles: ID[];
}

export interface FAQCategory extends BaseEntity {
  name: string;
  description: string;
  icon?: string;
  color?: string;
  
  // Hierarchy
  parentId?: ID;
  parent?: FAQCategory;
  children: FAQCategory[];
  
  // Content
  faqCount: number;
  
  // Settings
  isActive: boolean;
  order: number;
}

// Newsletter Types
export interface Newsletter extends BaseEntity {
  // Basic Information
  name: string;
  subject: string;
  preheader?: string;
  
  // Content
  htmlContent: string;
  textContent: string;
  
  // Template
  templateId?: ID;
  template?: NewsletterTemplate;
  
  // Sending
  status: NewsletterStatus;
  scheduledAt?: Timestamp;
  sentAt?: Timestamp;
  
  // Recipients
  recipientLists: ID[];
  recipientCount: number;
  
  // Segmentation
  segments: NewsletterSegment[];
  
  // Personalization
  personalizationEnabled: boolean;
  dynamicContent: DynamicContent[];
  
  // Analytics
  analytics: NewsletterAnalytics;
  
  // Campaign Information
  campaignId?: ID;
  campaign?: MarketingCampaign;
}

export interface NewsletterTemplate extends BaseEntity {
  name: string;
  description: string;
  htmlTemplate: string;
  
  // Categorization
  category: 'promotional' | 'informational' | 'transactional' | 'seasonal';
  
  // Customization
  variables: TemplateVariable[];
  sections: TemplateSection[];
  
  // Usage
  usageCount: number;
  isActive: boolean;
}

export interface NewsletterSegment {
  id: ID;
  name: string;
  description: string;
  conditions: SegmentCondition[];
  recipientCount: number;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | boolean | string[];
}

export interface DynamicContent {
  id: ID;
  name: string;
  type: 'text' | 'image' | 'product' | 'offer';
  content: Record<string, string | number | boolean>;
  conditions: SegmentCondition[];
}

export type NewsletterStatus = 
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'paused'
  | 'cancelled'
  | 'failed';

export interface NewsletterAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
  
  // Rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  
  // Engagement
  clickMap: ClickMapData[];
  topLinks: Array<{
    url: string;
    clicks: number;
  }>;
  
  // Geographic
  geographicData: Array<{
    country: string;
    opens: number;
    clicks: number;
  }>;
  
  // Temporal
  opensByTime: Array<{
    hour: number;
    opens: number;
  }>;
}

export interface ClickMapData {
  url: string;
  x: number;
  y: number;
  clicks: number;
}

// Announcement Types
export interface Announcement extends BaseEntity {
  // Basic Information
  title: string;
  content: string;
  type: AnnouncementType;
  
  // Visual
  icon?: string;
  color?: string;
  image?: ImageAsset;
  
  // Targeting
  targetAudience: AnnouncementAudience[];
  userSegments: ID[];
  
  // Scheduling
  startsAt: Timestamp;
  endsAt?: Timestamp;
  
  // Display Settings
  displayLocation: DisplayLocation[];
  priority: AnnouncementPriority;
  isDismissible: boolean;
  isSticky: boolean;
  
  // Status
  isActive: boolean;
  isPublished: boolean;
  
  // Actions
  hasAction: boolean;
  actionText?: string;
  actionUrl?: string;
  
  // Analytics
  viewCount: number;
  clickCount: number;
  dismissCount: number;
}

export type AnnouncementType = 
  | 'info'
  | 'warning'
  | 'success'
  | 'error'
  | 'promotional'
  | 'maintenance'
  | 'feature'
  | 'event';

export type AnnouncementAudience = 
  | 'all'
  | 'guests'
  | 'registered'
  | 'premium'
  | 'first_time'
  | 'returning'
  | 'cart_abandoners'
  | 'high_value'
  | 'inactive';

export type DisplayLocation = 
  | 'header'
  | 'footer'
  | 'sidebar'
  | 'modal'
  | 'banner'
  | 'popup'
  | 'inline'
  | 'cart'
  | 'checkout'
  | 'product_page'
  | 'category_page'
  | 'home_page';

export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';

// Hero Section Types
export interface HeroSection extends BaseEntity {
  // Basic Information
  title: string;
  subtitle?: string;
  description?: string;
  
  // Media
  backgroundImage?: ImageAsset;
  backgroundVideo?: VideoAsset;
  overlayImage?: ImageAsset;
  
  // Design
  layout: HeroLayout;
  alignment: 'left' | 'center' | 'right';
  overlayColor?: string;
  overlayOpacity?: number;
  
  // Call to Action
  primaryCTA?: CallToAction;
  secondaryCTA?: CallToAction;
  
  // Targeting and Display
  pages: string[];
  userSegments: ID[];
  displayConditions: DisplayCondition[];
  
  // Scheduling
  isActive: boolean;
  startsAt?: Timestamp;
  endsAt?: Timestamp;
  
  // Analytics
  viewCount: number;
  clickCount: number;
  conversionRate: number;
  
  // A/B Testing
  variantId?: ID;
  isControl: boolean;
  
  // Settings
  isFullWidth: boolean;
  height: 'auto' | 'viewport' | 'fixed';
  fixedHeight?: number;
  
  // Animation
  animationType?: AnimationType;
  animationDuration?: number;
}

export type HeroLayout = 
  | 'image_left'
  | 'image_right'
  | 'image_background'
  | 'video_background'
  | 'split_screen'
  | 'centered'
  | 'minimal'
  | 'carousel';

export interface CallToAction {
  text: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline' | 'text';
  icon?: string;
  openInNewTab: boolean;
  trackingId?: string;
}

export interface DisplayCondition {
  type: 'device' | 'location' | 'time' | 'user_type' | 'page_view' | 'cart_value';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number;
}

export type AnimationType = 
  | 'fade_in'
  | 'slide_in'
  | 'zoom_in'
  | 'bounce'
  | 'rotate'
  | 'flip'
  | 'none';

// Promotional Content Types
export interface PromotionalBanner extends BaseEntity {
  // Basic Information
  name: string;
  description?: string;
  
  // Content
  title: string;
  subtitle?: string;
  message: string;
  
  // Media
  image?: ImageAsset;
  backgroundImage?: ImageAsset;
  icon?: string;
  
  // Design
  template: BannerTemplate;
  colors: BannerColors;
  
  // Action
  cta?: CallToAction;
  
  // Targeting
  placement: BannerPlacement[];
  targetAudience: AnnouncementAudience[];
  
  // Campaign
  campaignId?: ID;
  campaign?: MarketingCampaign;
  
  // Scheduling
  isActive: boolean;
  startsAt: Timestamp;
  endsAt?: Timestamp;
  
  // Analytics
  impressions: number;
  clicks: number;
  conversions: number;
  
  // Settings
  frequency: 'once' | 'daily' | 'session' | 'always';
  isDismissible: boolean;
  showDelay?: number;
}

export interface BannerTemplate {
  id: ID;
  name: string;
  html: string;
  css: string;
  variables: TemplateVariable[];
}

export interface BannerColors {
  background: string;
  text: string;
  accent: string;
  border?: string;
}

export type BannerPlacement = 
  | 'top_bar'
  | 'header'
  | 'navigation'
  | 'sidebar'
  | 'content_top'
  | 'content_bottom'
  | 'footer'
  | 'popup'
  | 'slide_in'
  | 'exit_intent';

// Marketing Campaign Types
export interface MarketingCampaign extends BaseEntity {
  // Basic Information
  name: string;
  description: string;
  type: CampaignType;
  
  // Objectives
  objective: CampaignObjective;
  goals: CampaignGoal[];
  
  // Budget and Timing
  budget?: number;
  spendToDate?: number;
  startsAt: Timestamp;
  endsAt?: Timestamp;
  
  // Status
  status: CampaignStatus;
  
  // Content
  creatives: CampaignCreative[];
  content: CampaignContent[];
  
  // Targeting
  audience: AudienceTargeting;
  
  // Channels
  channels: MarketingChannel[];
  
  // Analytics
  analytics: CampaignAnalytics;
  
  // Team
  manager: ID;
  team: ID[];
  
  // Settings
  isAutomated: boolean;
  automationRules: AutomationRule[];
}

export type CampaignType = 
  | 'awareness'
  | 'consideration'
  | 'conversion'
  | 'retention'
  | 'seasonal'
  | 'product_launch'
  | 'flash_sale'
  | 'clearance';

export type CampaignObjective = 
  | 'brand_awareness'
  | 'traffic'
  | 'engagement'
  | 'leads'
  | 'sales'
  | 'app_installs'
  | 'video_views'
  | 'conversions';

export interface CampaignGoal {
  metric: string;
  target: number;
  current: number;
  isAchieved: boolean;
}

export type CampaignStatus = 
  | 'draft'
  | 'pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface CampaignCreative extends BaseEntity {
  name: string;
  type: 'image' | 'video' | 'carousel' | 'text' | 'html';
  content: string;
  assets: ImageAsset[];
  
  // Performance
  impressions: number;
  clicks: number;
  conversions: number;
  
  // Testing
  isControl: boolean;
  variantId?: ID;
}

export interface CampaignContent {
  id: ID;
  type: 'email' | 'sms' | 'push' | 'social' | 'display' | 'search';
  title: string;
  content: string;
  schedule: ContentSchedule;
  
  // Performance
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
}

export interface ContentSchedule {
  sendAt: Timestamp;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  endDate?: Timestamp;
  timezone: string;
}

export interface AudienceTargeting {
  demographics: DemographicTargeting;
  geographic: GeographicTargeting;
  behavioral: BehavioralTargeting;
  interests: string[];
  customAudiences: ID[];
  lookalikes: ID[];
}

export interface DemographicTargeting {
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: ('male' | 'female' | 'non_binary' | 'prefer_not_to_say')[];
  income?: {
    min: number;
    max: number;
  };
  education?: string[];
  occupation?: string[];
  relationship?: string[];
}

export interface GeographicTargeting {
  countries: string[];
  states: string[];
  cities: string[];
  postalCodes: string[];
  radius?: {
    center: {
      latitude: number;
      longitude: number;
    };
    kilometers: number;
  };
}

export interface BehavioralTargeting {
  purchaseHistory: string[];
  websiteBehavior: string[];
  appBehavior: string[];
  deviceUsage: string[];
  brandAffinity: string[];
  lifestyleInterests: string[];
}

export type MarketingChannel = 
  | 'email'
  | 'sms'
  | 'push'
  | 'social_media'
  | 'search_ads'
  | 'display_ads'
  | 'content_marketing'
  | 'influencer'
  | 'affiliate'
  | 'direct_mail'
  | 'events'
  | 'pr';

export interface CampaignAnalytics {
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  cost: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roas: number;
  
  // Channel Performance
  channelBreakdown: Record<MarketingChannel, ChannelMetrics>;
  
  // Audience Insights
  topPerformingSegments: AudienceSegment[];
  
  // Attribution
  firstClick: AttributionData;
  lastClick: AttributionData;
  multiTouch: AttributionData;
}

export interface ChannelMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  conversionRate: number;
  cpa: number;
  roas: number;
}

export interface AudienceSegment {
  name: string;
  size: number;
  performance: ChannelMetrics;
}

export interface AttributionData {
  conversions: number;
  revenue: number;
  channelBreakdown: Record<MarketingChannel, number>;
}

export interface AutomationRule {
  id: ID;
  name: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
}

export interface AutomationTrigger {
  type: 'time' | 'performance' | 'audience' | 'budget' | 'external';
  config: Record<string, string | number | boolean>;
}

export interface AutomationCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

export interface AutomationAction {
  type: 'pause' | 'resume' | 'adjust_budget' | 'change_targeting' | 'send_notification';
  config: Record<string, string | number | boolean>;
}

// Content Management
export interface ContentCalendar {
  id: ID;
  name: string;
  description: string;
  
  // Date Range
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Content Items
  items: ContentCalendarItem[];
  
  // Team
  owners: ID[];
  contributors: ID[];
  
  // Settings
  isPublic: boolean;
  autoSchedule: boolean;
}

export interface ContentCalendarItem {
  id: ID;
  title: string;
  type: ContentType;
  status: ContentStatus;
  
  // Scheduling
  publishDate: Timestamp;
  dueDate?: Timestamp;
  
  // Assignment
  assignedTo: ID;
  reviewers: ID[];
  
  // Content
  contentId?: ID;
  notes?: string;
  
  // Approval
  approvalStatus: ApprovalStatus;
  approvedBy?: ID;
  approvedAt?: Timestamp;
}

export type ContentType = 
  | 'blog_post'
  | 'newsletter'
  | 'social_post'
  | 'product_description'
  | 'marketing_email'
  | 'banner'
  | 'announcement'
  | 'video'
  | 'infographic'
  | 'case_study'
  | 'whitepaper';

export type ContentStatus = 
  | 'idea'
  | 'planned'
  | 'in_progress'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export type ApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'needs_revision';

// Template System
export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'image' | 'url' | 'date';
  defaultValue?: string | number | boolean;
  description?: string;
  required: boolean;
}

export interface TemplateSection {
  id: ID;
  name: string;
  type: 'header' | 'content' | 'sidebar' | 'footer' | 'cta' | 'custom';
  html: string;
  variables: TemplateVariable[];
  isEditable: boolean;
  isRequired: boolean;
}

// Social Media Integration
export interface SocialSharingData {
  platforms: SocialPlatformConfig[];
  defaultMessage?: string;
  hashtags: string[];
  mentions: string[];
  
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: ImageAsset;
  
  // Twitter Card
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
}

export interface SocialPlatformConfig {
  platform: SocialPlatform;
  isEnabled: boolean;
  customMessage?: string;
  scheduledAt?: Timestamp;
  posted: boolean;
  postId?: string;
  
  // Performance
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
}

export type SocialPlatform = 
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'pinterest'
  | 'youtube'
  | 'tiktok'
  | 'snapchat'
  | 'whatsapp'
  | 'telegram';

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  pinterest?: string;
  website?: string;
  blog?: string;
}

// For imports since they're referenced
interface VideoAsset {
  id: ID;
  url: string;
  title?: string;
  duration?: number;
  thumbnail?: ImageAsset;
}
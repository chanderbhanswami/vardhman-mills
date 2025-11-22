import { ID, Timestamp, BaseEntity, ImageAsset, ValidationError } from './common.types';

// Newsletter Subscription Types
export interface NewsletterSubscription extends BaseEntity {
  // Subscriber Information
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: ID; // If subscriber is also a registered user
  
  // Subscription Status
  status: SubscriptionStatus;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Timestamp;
  
  // Subscription Details
  subscribedAt: Timestamp;
  unsubscribedAt?: Timestamp;
  source: SubscriptionSource;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Preferences
  preferences: SubscriptionPreferences;
  
  // Lists and Segments
  lists: NewsletterList[];
  segments: string[];
  tags: string[];
  
  // Engagement Metrics
  engagement: SubscriberEngagement;
  
  // Unsubscribe Information
  unsubscribeReason?: string;
  unsubscribeFeedback?: string;
  
  // Data Privacy
  gdprConsent: boolean;
  gdprConsentDate?: Timestamp;
  marketingOptIn: boolean;
  dataProcessingConsent: boolean;
  
  // Custom Fields
  customFields: Record<string, string | number | boolean>;
}

export type SubscriptionStatus = 
  | 'pending'          // Email verification pending
  | 'active'           // Active subscriber
  | 'unsubscribed'     // Unsubscribed
  | 'bounced'          // Email bounced
  | 'complained'       // Marked as spam
  | 'cleaned'          // Removed due to inactivity
  | 'suppressed';      // Manually suppressed

export type SubscriptionSource = 
  | 'website_footer'
  | 'popup'
  | 'checkout'
  | 'account_creation'
  | 'product_page'
  | 'blog_post'
  | 'social_media'
  | 'referral'
  | 'manual_import'
  | 'api'
  | 'lead_magnet'
  | 'contest'
  | 'event'
  | 'offline';

export interface SubscriptionPreferences {
  // Content Types
  newsletter: boolean;
  productUpdates: boolean;
  promotionalOffers: boolean;
  newArrivals: boolean;
  saleAlerts: boolean;
  blogUpdates: boolean;
  eventInvitations: boolean;
  
  // Frequency
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly';
  
  // Format
  format: 'html' | 'text' | 'both';
  
  // Categories
  categories: ID[];
  brands: ID[];
  priceRanges: string[];
  
  // Language and Locale
  language: string;
  timezone: string;
  
  // Send Time Preferences
  preferredDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'any';
  preferredTime: number; // hour in 24-hour format
  
  // Mobile Preferences
  mobileFriendly: boolean;
  pushNotifications: boolean;
}

export interface SubscriberEngagement {
  // Email Metrics
  totalEmailsSent: number;
  totalEmailsOpened: number;
  totalEmailsClicked: number;
  lastOpened?: Timestamp;
  lastClicked?: Timestamp;
  
  // Engagement Rates
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  
  // Activity Score
  engagementScore: number; // 0-100
  isHighlyEngaged: boolean;
  isLowEngaged: boolean;
  
  // Purchase Behavior
  totalPurchases: number;
  totalSpent: number;
  lastPurchase?: Timestamp;
  averageOrderValue: number;
  
  // Website Activity
  websiteVisits: number;
  lastWebsiteVisit?: Timestamp;
  pageViewsFromEmail: number;
  
  // Social Engagement
  socialShares: number;
  socialFollows: number;
}

// Newsletter Campaign Types
export interface NewsletterCampaign extends BaseEntity {
  // Basic Information
  name: string;
  subject: string;
  preheader?: string;
  
  // Content
  content: EmailContent;
  
  // Campaign Details
  type: CampaignType;
  status: CampaignStatus;
  
  // Targeting
  targetLists: ID[];
  targetSegments: string[];
  excludedSubscribers: ID[];
  estimatedRecipients: number;
  
  // Scheduling
  scheduledAt?: Timestamp;
  sentAt?: Timestamp;
  timezone: string;
  
  // A/B Testing
  abTest?: ABTest;
  
  // Tracking
  trackingSettings: TrackingSettings;
  
  // Analytics
  analytics: CampaignAnalytics;
  
  // Deliverability
  deliverability: DeliverabilityMetrics;
  
  // Automation
  isAutomated: boolean;
  automationTrigger?: AutomationTrigger;
  
  // Template and Design
  templateId?: ID;
  design: EmailDesign;
  
  // Compliance
  compliance: ComplianceSettings;
  
  // Creator Information
  createdBy: ID;
  lastModifiedBy: ID;
  approvedBy?: ID;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export type CampaignType = 
  | 'newsletter'
  | 'promotional'
  | 'welcome_series'
  | 'product_announcement'
  | 'seasonal_campaign'
  | 'reactivation'
  | 'abandoned_cart'
  | 'transactional'
  | 'survey'
  | 'educational'
  | 'event_invitation'
  | 'milestone_celebration';

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'paused'
  | 'cancelled'
  | 'failed';

export interface EmailContent {
  // Main Content
  htmlContent: string;
  textContent: string;
  
  // Sections
  header?: EmailSection;
  body: EmailSection[];
  footer?: EmailSection;
  
  // Dynamic Content
  personalization: PersonalizationTag[];
  dynamicContent: DynamicContentBlock[];
  
  // Product Recommendations
  productRecommendations?: ProductRecommendationBlock[];
  
  // Social Media
  socialLinks: SocialLink[];
  
  // Call to Actions
  callToActions: CallToAction[];
}

export interface EmailSection {
  id: string;
  type: 'header' | 'hero' | 'content' | 'product_grid' | 'cta' | 'footer' | 'divider';
  content: string;
  styling: SectionStyling;
  isVisible: boolean;
  order: number;
}

export interface SectionStyling {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontFamily?: string;
  padding?: string;
  margin?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
}

export interface PersonalizationTag {
  tag: string;
  fallback: string;
  type: 'subscriber' | 'order' | 'product' | 'custom';
}

export interface DynamicContentBlock {
  id: string;
  name: string;
  conditions: ContentCondition[];
  variants: ContentVariant[];
  defaultContent: string;
}

export interface ContentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface ContentVariant {
  name: string;
  content: string;
  conditions: ContentCondition[];
}

export interface ProductRecommendationBlock {
  id: string;
  type: 'recently_viewed' | 'frequently_bought' | 'trending' | 'new_arrivals' | 'personalized';
  productCount: number;
  layout: 'grid' | 'list' | 'carousel';
  showPrices: boolean;
  showRatings: boolean;
  showDiscount: boolean;
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'pinterest' | 'tiktok';
  url: string;
  icon?: ImageAsset;
  isVisible: boolean;
}

export interface CallToAction {
  id: string;
  text: string;
  url: string;
  style: 'primary' | 'secondary' | 'text' | 'custom';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string;
  alignment?: 'left' | 'center' | 'right';
  trackingId?: string;
}

export interface ABTest {
  isEnabled: boolean;
  testType: 'subject_line' | 'content' | 'send_time' | 'sender_name';
  variants: ABTestVariant[];
  testPercentage: number; // percentage of audience to include in test
  winnerSelection: 'manual' | 'automatic';
  winnerMetric: 'open_rate' | 'click_rate' | 'conversion_rate';
  testDuration: number; // hours
  winner?: string; // variant ID
  isCompleted: boolean;
}

export interface ABTestVariant {
  id: string;
  name: string;
  percentage: number;
  subject?: string;
  content?: EmailContent;
  sendTime?: Timestamp;
  senderName?: string;
  metrics: VariantMetrics;
}

export interface VariantMetrics {
  sent: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
  conversions: number;
  revenue: number;
}

export interface TrackingSettings {
  openTracking: boolean;
  clickTracking: boolean;
  googleAnalytics: boolean;
  googleAnalyticsId?: string;
  customTracking: boolean;
  utmParameters: UTMParameters;
}

export interface UTMParameters {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

export interface CampaignAnalytics {
  // Delivery Metrics
  totalSent: number;
  delivered: number;
  bounced: number;
  bounceRate: number;
  
  // Engagement Metrics
  opened: number;
  openRate: number;
  uniqueOpens: number;
  clicked: number;
  clickRate: number;
  uniqueClicks: number;
  
  // Negative Metrics
  unsubscribed: number;
  unsubscribeRate: number;
  complained: number;
  complaintRate: number;
  
  // Conversion Metrics
  conversions: number;
  conversionRate: number;
  revenue: number;
  revenuePerEmail: number;
  
  // Time-based Analytics
  opensByHour: number[];
  clicksByHour: number[];
  peakEngagementTime: string;
  
  // Geographic Analytics
  opensByCountry: Record<string, number>;
  clicksByCountry: Record<string, number>;
  
  // Device Analytics
  opensByDevice: Record<string, number>;
  clicksByDevice: Record<string, number>;
  
  // Link Performance
  topLinks: LinkPerformance[];
  
  // Social Sharing
  socialShares: number;
  socialClicks: number;
  
  // List Performance
  performanceByList: ListPerformance[];
}

export interface LinkPerformance {
  url: string;
  clicks: number;
  uniqueClicks: number;
  clickRate: number;
}

export interface ListPerformance {
  listId: ID;
  listName: string;
  sent: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
}

export interface DeliverabilityMetrics {
  deliveryRate: number;
  inboxRate: number;
  spamRate: number;
  reputationScore: number;
  authenticationStatus: {
    spf: 'pass' | 'fail' | 'neutral';
    dkim: 'pass' | 'fail' | 'neutral';
    dmarc: 'pass' | 'fail' | 'neutral';
  };
  ipReputation: string;
  domainReputation: string;
}

export interface AutomationTrigger {
  type: 'welcome' | 'abandoned_cart' | 'birthday' | 'anniversary' | 'purchase_follow_up' | 'win_back' | 'custom';
  delay: number; // hours or days
  conditions: TriggerCondition[];
  isActive: boolean;
}

export interface TriggerCondition {
  field: string;
  operator: string;
  value: string | number;
  logicalOperator?: 'AND' | 'OR';
}

export interface EmailDesign {
  // Layout
  layout: 'single_column' | 'two_column' | 'three_column' | 'custom';
  width: number;
  backgroundColor: string;
  
  // Typography
  primaryFont: string;
  secondaryFont: string;
  baseTextColor: string;
  headingColor: string;
  
  // Brand Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Header
  showHeader: boolean;
  headerHeight?: number;
  headerBackgroundColor?: string;
  logo?: ImageAsset;
  logoAlignment?: 'left' | 'center' | 'right';
  
  // Footer
  showFooter: boolean;
  footerBackgroundColor?: string;
  footerTextColor?: string;
  
  // Buttons
  buttonStyle: 'rounded' | 'square' | 'pill';
  buttonPrimaryColor: string;
  buttonSecondaryColor: string;
  
  // Responsive Design
  mobileOptimized: boolean;
  mobileBreakpoint: number;
  
  // Custom CSS
  customCSS?: string;
}

export interface ComplianceSettings {
  // Legal Requirements
  includeUnsubscribeLink: boolean;
  includePhysicalAddress: boolean;
  gdprCompliant: boolean;
  canSpamCompliant: boolean;
  
  // Content Guidelines
  avoidSpamWords: boolean;
  textToImageRatio: number;
  linkToTextRatio: number;
  
  // Authentication
  authenticateDomain: boolean;
  useDedicatedIP: boolean;
  
  // Privacy
  trackingDisclosure: boolean;
  cookiePolicy: boolean;
}

// Newsletter Lists and Segments
export interface NewsletterList extends BaseEntity {
  // Basic Information
  name: string;
  description?: string;
  
  // List Details
  type: 'general' | 'promotional' | 'transactional' | 'educational' | 'segment';
  isActive: boolean;
  isPublic: boolean;
  
  // Subscription Settings
  subscriptionMethod: 'single_opt_in' | 'double_opt_in' | 'confirmed_opt_in';
  welcomeEmailEnabled: boolean;
  welcomeEmailTemplate?: ID;
  
  // Member Statistics
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  bouncedCount: number;
  
  // Growth Metrics
  growthRate: number;
  churnRate: number;
  subscriptionsToday: number;
  subscriptionsThisWeek: number;
  subscriptionsThisMonth: number;
  
  // Engagement Metrics
  averageOpenRate: number;
  averageClickRate: number;
  averageUnsubscribeRate: number;
  
  // Custom Fields
  customFields: CustomField[];
  
  // Import/Export
  lastImportDate?: Timestamp;
  lastExportDate?: Timestamp;
  
  // Cleanup Settings
  autoCleanup: boolean;
  cleanupInactiveDays: number;
  cleanupBouncedEmails: boolean;
}

export interface CustomField {
  id: ID;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'boolean' | 'select' | 'multiselect';
  isRequired: boolean;
  options?: string[]; // for select/multiselect types
  defaultValue?: string | number | boolean;
  validation?: FieldValidation;
}

export interface FieldValidation {
  pattern?: string; // regex pattern
  minLength?: number;
  maxLength?: number;
  min?: number; // for number fields
  max?: number; // for number fields
  customValidator?: string;
}

// Templates
export interface EmailTemplate extends BaseEntity {
  // Basic Information
  name: string;
  description?: string;
  category: TemplateCategory;
  
  // Template Content
  subject: string;
  preheader?: string;
  content: EmailContent;
  design: EmailDesign;
  
  // Template Settings
  isActive: boolean;
  isPublic: boolean;
  isPremium: boolean;
  
  // Usage Statistics
  usageCount: number;
  lastUsed?: Timestamp;
  
  // Ratings and Reviews
  rating: number;
  reviewCount: number;
  
  // Template Metadata
  author: string;
  templateVersion: string;
  tags: string[];
  
  // Template Preview
  thumbnailImage?: ImageAsset;
  previewImages: ImageAsset[];
  
  // Compatibility
  emailClients: string[];
  isResponsive: boolean;
  isDarkModeCompatible: boolean;
}

export type TemplateCategory = 
  | 'welcome'
  | 'newsletter'
  | 'promotional'
  | 'transactional'
  | 'seasonal'
  | 'product_announcement'
  | 'event'
  | 'educational'
  | 'survey'
  | 'reactivation'
  | 'abandoned_cart'
  | 'review_request'
  | 'birthday'
  | 'milestone'
  | 'general';

// Automation Workflows
export interface AutomationWorkflow extends BaseEntity {
  // Basic Information
  name: string;
  description?: string;
  
  // Workflow Configuration
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  isActive: boolean;
  
  // Performance Metrics
  totalEntered: number;
  totalCompleted: number;
  completionRate: number;
  averageRevenue: number;
  
  // Goal Tracking
  goals: WorkflowGoal[];
  
  // Timing
  timezone: string;
  respectSendTimePreferences: boolean;
  
  // Advanced Settings
  allowReEntry: boolean;
  exitConditions: ExitCondition[];
  
  // Analytics
  analytics: WorkflowAnalytics;
}

export interface WorkflowTrigger {
  type: 'subscription' | 'purchase' | 'behavior' | 'date' | 'custom_field' | 'tag_added' | 'segment_entry';
  conditions: TriggerCondition[];
  delay?: number; // minutes
}

export interface WorkflowStep {
  id: string;
  type: 'email' | 'delay' | 'condition' | 'action' | 'tag' | 'segment';
  order: number;
  
  // Email Step
  emailTemplate?: ID;
  subject?: string;
  content?: EmailContent;
  
  // Delay Step
  delayAmount?: number;
  delayUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
  
  // Condition Step
  conditions?: StepCondition[];
  trueStepId?: string;
  falseStepId?: string;
  
  // Action Step
  action?: WorkflowAction;
  
  // Performance
  stepMetrics: StepMetrics;
}

export interface StepCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  type: 'add_tag' | 'remove_tag' | 'move_to_list' | 'update_field' | 'send_notification' | 'create_task';
  parameters: Record<string, string | number | boolean>;
}

export interface StepMetrics {
  entered: number;
  completed: number;
  skipped: number;
  failed: number;
  completionRate: number;
  averageTime: number; // minutes
}

export interface WorkflowGoal {
  name: string;
  type: 'email_open' | 'email_click' | 'purchase' | 'page_visit' | 'custom_event';
  target: number;
  achieved: number;
  isActive: boolean;
}

export interface ExitCondition {
  type: 'unsubscribe' | 'purchase' | 'tag_added' | 'custom_field' | 'inactivity';
  parameters: Record<string, string | number | boolean>;
}

export interface WorkflowAnalytics {
  // Flow Performance
  entryPoints: Record<string, number>;
  exitPoints: Record<string, number>;
  dropoffRates: Record<string, number>;
  
  // Revenue Impact
  totalRevenue: number;
  revenuePerSubscriber: number;
  conversionRate: number;
  
  // Timing Analysis
  averageFlowTime: number;
  optimalSendTimes: string[];
  
  // A/B Test Results
  abTestResults?: ABTestResult[];
}

export interface ABTestResult {
  stepId: string;
  variants: string[];
  winner: string;
  improvementRate: number;
  confidence: number;
}

// Newsletter API Types
export interface NewsletterAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: NewsletterError;
  metadata?: ResponseMetadata;
}

export interface NewsletterError {
  code: string;
  message: string;
  details?: Record<string, string | number | boolean>;
}

export interface ResponseMetadata {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  executionTime: number;
}

// Form Types
export interface NewsletterSignupForm {
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: Partial<SubscriptionPreferences>;
  customFields?: Record<string, string | number | boolean>;
  gdprConsent: boolean;
  marketingOptIn: boolean;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface UnsubscribeForm {
  email: string;
  token: string;
  reason?: string;
  feedback?: string;
  resubscribeToSpecific?: boolean;
  keepAccount?: boolean;
}

export interface PreferencesUpdateForm {
  email: string;
  token: string;
  preferences: Partial<SubscriptionPreferences>;
  lists: ID[];
}

// Validation Types
export interface NewsletterValidation {
  email: EmailValidationResult;
  preferences: ValidationError[];
  customFields: ValidationError[];
  general: ValidationError[];
}

export interface EmailValidationResult {
  isValid: boolean;
  isDeliverable: boolean;
  isDisposable: boolean;
  isRoleAccount: boolean;
  suggestions: string[];
  errors: string[];
}

// Export helper types
export type { NewsletterSubscription as SubscriptionType };
export type { EmailTemplate as TemplateType };
/**
 * Notification System Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for notification system including push notifications,
 * email notifications, SMS, in-app notifications, and notification management.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  ImageAsset,
  PaginatedResponse 
} from './common.types';

// ============================================================================
// CORE NOTIFICATION TYPES
// ============================================================================

/**
 * Main notification entity
 */
export interface Notification extends BaseEntity {
  // Basic Information
  title: string;
  message: string;
  shortMessage?: string;
  
  // Type and Category
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  
  // Targeting
  userId?: ID; // For user-specific notifications
  userSegment?: string; // For segment-based notifications
  broadcast?: boolean; // For broadcast notifications
  
  // Content
  content: NotificationContent;
  
  // Delivery Configuration
  channels: NotificationChannel[];
  deliveryConfig: DeliveryConfiguration;
  
  // Scheduling
  scheduledFor?: Timestamp;
  expiresAt?: Timestamp;
  timezone?: string;
  
  // Interaction Tracking
  tracking: NotificationTracking;
  
  // Status and State
  status: NotificationStatus;
  deliveryStatus: DeliveryStatus;
  
  // Metadata
  source: string;
  sourceId?: ID;
  tags: string[];
  campaignId?: ID;
  metadata?: NotificationMetadata;
  
  // Personalization
  personalized: boolean;
  personalizationData?: Record<string, unknown>;
  
  // A/B Testing
  variant?: string;
  testId?: ID;
}

/**
 * Notification types
 */
export type NotificationType = 
  | 'order_update'           // Order status changes
  | 'payment_confirmation'   // Payment confirmations
  | 'shipping_update'        // Shipping and delivery updates
  | 'product_alert'          // Product-related alerts
  | 'price_drop'             // Price drop notifications
  | 'stock_alert'            // Stock availability alerts
  | 'wishlist_update'        // Wishlist item updates
  | 'promotion'              // Promotional offers
  | 'sale_alert'             // Sale and discount alerts
  | 'review_request'         // Review and feedback requests
  | 'account_security'       // Security and account alerts
  | 'newsletter'             // Newsletter and content updates
  | 'reminder'               // General reminders
  | 'announcement'           // Company announcements
  | 'system_alert'           // System-related alerts
  | 'social_activity'        // Social activity notifications
  | 'recommendation'         // Product recommendations
  | 'milestone'              // User milestone celebrations
  | 'support_update'         // Customer support updates
  | 'survey_invitation'      // Survey and feedback invitations
  | 'app_update'             // Application updates
  | 'maintenance'            // Maintenance notifications
  | 'custom';                // Custom notifications

/**
 * Notification categories for organization
 */
export type NotificationCategory = 
  | 'transactional'          // Transaction-related
  | 'marketing'              // Marketing and promotional
  | 'operational'            // Operational updates
  | 'security'               // Security-related
  | 'social'                 // Social interactions
  | 'system'                 // System notifications
  | 'informational'          // Informational content
  | 'urgent'                 // Urgent alerts
  | 'promotional'            // Promotional content
  | 'educational';           // Educational content

/**
 * Notification priority levels
 */
export type NotificationPriority = 
  | 'low'                    // Low priority
  | 'normal'                 // Normal priority
  | 'high'                   // High priority
  | 'urgent'                 // Urgent notifications
  | 'critical';              // Critical alerts

/**
 * Notification delivery channels
 */
export type NotificationChannel = 
  | 'push'                   // Push notifications
  | 'email'                  // Email notifications
  | 'sms'                    // SMS notifications
  | 'in_app'                 // In-app notifications
  | 'whatsapp'               // WhatsApp notifications
  | 'slack'                  // Slack notifications
  | 'webhook'                // Webhook notifications
  | 'browser'                // Browser notifications
  | 'voice'                  // Voice calls
  | 'telegram';              // Telegram notifications

/**
 * Notification status
 */
export type NotificationStatus = 
  | 'draft'                  // Being created
  | 'scheduled'              // Scheduled for delivery
  | 'queued'                 // Queued for processing
  | 'processing'             // Being processed
  | 'sent'                   // Successfully sent
  | 'delivered'              // Delivered to recipient
  | 'failed'                 // Failed to deliver
  | 'cancelled'              // Cancelled before delivery
  | 'expired'                // Expired before delivery
  | 'blocked'                // Blocked by user preferences
  | 'bounced';               // Bounced back

/**
 * Delivery status for each channel
 */
export interface DeliveryStatus {
  overall: NotificationStatus;
  channels: ChannelDeliveryStatus[];
  attempts: number;
  lastAttempt?: Timestamp;
  nextRetry?: Timestamp;
}

export interface ChannelDeliveryStatus {
  channel: NotificationChannel;
  status: NotificationStatus;
  deliveredAt?: Timestamp;
  errorMessage?: string;
  retryCount: number;
  provider?: string;
  externalId?: string;
}

// ============================================================================
// NOTIFICATION CONTENT AND STRUCTURE
// ============================================================================

/**
 * Notification content structure
 */
export interface NotificationContent {
  // Text Content
  title: string;
  body: string;
  summary?: string;
  
  // Rich Content
  html?: string;
  markdown?: string;
  
  // Media
  image?: ImageAsset;
  icon?: string;
  avatar?: ImageAsset;
  attachments?: NotificationAttachment[];
  
  // Actions
  actions: NotificationAction[];
  
  // Deep Links
  deepLink?: string;
  webUrl?: string;
  appUrl?: string;
  
  // Data Payload
  data?: Record<string, unknown>;
  
  // Styling
  styling?: NotificationStyling;
  
  // Localization
  localizations?: Record<string, LocalizedContent>;
}

export interface NotificationAttachment {
  id: ID;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
}

export interface NotificationAction {
  id: ID;
  type: ActionType;
  label: string;
  icon?: string;
  
  // Action Configuration
  url?: string;
  deepLink?: string;
  apiCall?: ApiActionConfig;
  
  // Appearance
  style: ActionStyle;
  color?: string;
  
  // Behavior
  dismissNotification?: boolean;
  trackingEvent?: string;
  
  // Conditions
  conditions?: ActionCondition[];
}

export type ActionType = 
  | 'open_url'               // Open URL
  | 'open_app'               // Open app page
  | 'api_call'               // Make API call
  | 'dismiss'                // Dismiss notification
  | 'snooze'                 // Snooze notification
  | 'share'                  // Share content
  | 'like'                   // Like/react
  | 'reply'                  // Quick reply
  | 'call'                   // Make phone call
  | 'navigate'               // Navigate to page
  | 'download'               // Download file
  | 'custom';                // Custom action

export type ActionStyle = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'text'
  | 'icon'
  | 'floating';

export interface ApiActionConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  authentication?: boolean;
}

export interface ActionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: unknown;
}

export interface NotificationStyling {
  // Colors
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  
  // Typography
  titleFont?: string;
  bodyFont?: string;
  fontSize?: 'small' | 'medium' | 'large';
  
  // Layout
  layout?: 'compact' | 'expanded' | 'large';
  imagePosition?: 'top' | 'left' | 'right' | 'background';
  
  // Effects
  animation?: 'fade' | 'slide' | 'bounce' | 'none';
  sound?: string;
  vibration?: boolean;
  
  // Branding
  showLogo?: boolean;
  customCSS?: string;
}

export interface LocalizedContent {
  title: string;
  body: string;
  summary?: string;
  actions?: Array<{
    id: ID;
    label: string;
  }>;
}

// ============================================================================
// DELIVERY CONFIGURATION
// ============================================================================

/**
 * Delivery configuration for notifications
 */
export interface DeliveryConfiguration {
  // Channel Preferences
  channels: ChannelConfiguration[];
  
  // Timing
  timing: DeliveryTiming;
  
  // Retry Logic
  retryPolicy: RetryPolicy;
  
  // Rate Limiting
  rateLimiting: RateLimitingConfig;
  
  // Deduplication
  deduplication: DeduplicationConfig;
  
  // Batching
  batching?: BatchingConfig;
  
  // Fallback
  fallbackChannels: NotificationChannel[];
}

export interface ChannelConfiguration {
  channel: NotificationChannel;
  enabled: boolean;
  priority: number;
  provider?: string;
  config?: Record<string, unknown>;
  
  // Channel-specific settings
  emailConfig?: EmailChannelConfig;
  smsConfig?: SMSChannelConfig;
  pushConfig?: PushChannelConfig;
  whatsappConfig?: WhatsAppChannelConfig;
}

export interface EmailChannelConfig {
  sender: {
    name: string;
    email: string;
  };
  replyTo?: string;
  template?: string;
  trackOpens: boolean;
  trackClicks: boolean;
  suppressions?: string[];
}

export interface SMSChannelConfig {
  sender: string;
  maxLength: number;
  encoding: 'gsm7' | 'ucs2' | 'auto';
  validityPeriod?: number; // minutes
  dlr?: boolean; // delivery receipt
}

export interface PushChannelConfig {
  collapse?: boolean;
  collapseKey?: string;
  ttl?: number; // time to live in seconds
  badge?: number;
  sound?: string;
  channelId?: string;
  
  // Platform-specific
  ios?: {
    badge?: number;
    sound?: string;
    contentAvailable?: boolean;
    mutableContent?: boolean;
    category?: string;
  };
  
  android?: {
    icon?: string;
    color?: string;
    tag?: string;
    sticky?: boolean;
    channelId?: string;
  };
  
  web?: {
    icon?: string;
    badge?: string;
    requireInteraction?: boolean;
    silent?: boolean;
  };
}

export interface WhatsAppChannelConfig {
  template?: string;
  templateParams?: Record<string, string>;
  mediaType?: 'text' | 'image' | 'document' | 'video';
}

export interface DeliveryTiming {
  // Immediate or scheduled
  immediate: boolean;
  
  // Scheduling
  scheduledFor?: Timestamp;
  timezone?: string;
  
  // Time windows
  allowedHours?: TimeWindow[];
  excludedDays?: string[];
  
  // Frequency control
  minimumInterval?: number; // minutes between notifications
  maximumPerDay?: number;
  maximumPerWeek?: number;
  
  // Smart timing
  smartTiming?: boolean;
  userTimezone?: boolean;
  optimalTime?: boolean;
}

export interface TimeWindow {
  start: string; // HH:MM format
  end: string; // HH:MM format
  days: string[]; // days of week
  timezone?: string;
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number; // seconds
  backoffMultiplier: number;
  maxDelay: number; // seconds
  
  // Channel-specific retry
  channelPolicies?: Record<NotificationChannel, Partial<RetryPolicy>>;
  
  // Failure handling
  failureCallback?: string;
  deadLetterQueue?: boolean;
}

export interface RateLimitingConfig {
  enabled: boolean;
  
  // Global limits
  globalLimits: RateLimit[];
  
  // User limits
  userLimits: RateLimit[];
  
  // Channel limits
  channelLimits: Record<NotificationChannel, RateLimit[]>;
  
  // Burst handling
  burstAllowance?: number;
  burstWindow?: number; // seconds
}

export interface RateLimit {
  count: number;
  period: number; // seconds
  scope: 'global' | 'user' | 'channel' | 'campaign';
}

export interface DeduplicationConfig {
  enabled: boolean;
  window: number; // seconds
  keyFields: string[];
  strategy: 'skip' | 'merge' | 'update';
}

export interface BatchingConfig {
  enabled: boolean;
  batchSize: number;
  maxWaitTime: number; // seconds
  groupBy: string[];
}

// ============================================================================
// NOTIFICATION TRACKING AND ANALYTICS
// ============================================================================

/**
 * Notification tracking information
 */
export interface NotificationTracking {
  // Delivery Tracking
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  readAt?: Timestamp;
  
  // Interaction Tracking
  opened: boolean;
  openedAt?: Timestamp;
  clicked: boolean;
  clickedAt?: Timestamp;
  actionsPerformed: ActionPerformed[];
  
  // User Actions
  bookmarkedAt?: Timestamp;
  starredAt?: Timestamp;
  archivedAt?: Timestamp;
  
  // Engagement Metrics
  timeToOpen?: number; // seconds
  timeToClick?: number; // seconds
  engagementScore?: number;
  
  // Device and Context
  deviceInfo?: DeviceInfo;
  location?: LocationInfo;
  referrer?: string;
  
  // User Journey
  journeyStep?: string;
  conversionEvent?: string;
  attribution?: AttributionInfo;
}

export interface NotificationMetadata {
  sender?: string;
  avatar?: string;
  senderEmail?: string;
  senderRole?: string;
  originalData?: Record<string, unknown>;
  customFields?: Record<string, unknown>;
}

export interface ActionPerformed {
  actionId: ID;
  performedAt: Timestamp;
  result?: 'success' | 'failure' | 'partial';
  data?: Record<string, unknown>;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'watch' | 'other';
  os: string;
  osVersion: string;
  browser?: string;
  browserVersion?: string;
  appVersion?: string;
  userAgent?: string;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AttributionInfo {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  utmParams?: Record<string, string>;
}

// ============================================================================
// USER PREFERENCES AND SETTINGS
// ============================================================================

/**
 * User notification preferences
 */
export interface NotificationPreferences extends BaseEntity {
  userId: ID;
  
  // Global Settings
  globalEnabled: boolean;
  globalQuietHours: QuietHours;
  
  // Channel Preferences
  channelPreferences: ChannelPreference[];
  
  // Type Preferences
  typePreferences: TypePreference[];
  
  // Category Preferences
  categoryPreferences: CategoryPreference[];
  
  // Frequency Preferences
  frequencyPreferences: FrequencyPreference[];
  
  // Device Preferences
  devicePreferences: DevicePreference[];
  
  // Advanced Settings
  advancedSettings: AdvancedNotificationSettings;
  
  // Temporary Settings
  temporarySettings?: TemporarySettings;
}

export interface QuietHours {
  enabled: boolean;
  start: string; // HH:MM format
  end: string; // HH:MM format
  timezone: string;
  days: string[]; // days of week
  exceptions?: string[]; // urgent notification types that override quiet hours
}

export interface ChannelPreference {
  channel: NotificationChannel;
  enabled: boolean;
  priority: number;
  
  // Channel-specific settings
  emailEnabled?: boolean;
  emailFrequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  
  smsEnabled?: boolean;
  smsOnlyUrgent?: boolean;
  
  pushEnabled?: boolean;
  pushQuietHours?: boolean;
  
  // Contact information
  contactInfo?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
}

export interface TypePreference {
  type: NotificationType;
  enabled: boolean;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  frequency?: 'immediate' | 'bundled' | 'digest';
}

export interface CategoryPreference {
  category: NotificationCategory;
  enabled: boolean;
  defaultChannels: NotificationChannel[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
}

export interface FrequencyPreference {
  scope: 'global' | 'category' | 'type';
  scopeId?: string;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  maxPerDay?: number;
  maxPerWeek?: number;
  digestTime?: string; // HH:MM format
}

export interface DevicePreference {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  enabled: boolean;
  preferredChannels: NotificationChannel[];
  quietHours?: QuietHours;
}

export interface AdvancedNotificationSettings {
  // Smart Features
  smartBundling: boolean;
  smartTiming: boolean;
  duplicateDetection: boolean;
  
  // Privacy Settings
  trackOpens: boolean;
  trackClicks: boolean;
  shareData: boolean;
  
  // Personalization
  personalizedContent: boolean;
  locationBasedTiming: boolean;
  behaviorBasedFrequency: boolean;
  
  // Experimental Features
  aiOptimization: boolean;
  predictiveTiming: boolean;
  contextualRelevance: boolean;
}

export interface TemporarySettings {
  // Vacation Mode
  vacationMode?: {
    enabled: boolean;
    startDate: Timestamp;
    endDate: Timestamp;
    urgentOnly: boolean;
  };
  
  // Focus Mode
  focusMode?: {
    enabled: boolean;
    endTime?: Timestamp;
    allowedTypes: NotificationType[];
  };
  
  // Snooze Settings
  snoozedNotifications?: Array<{
    notificationId: ID;
    snoozeUntil: Timestamp;
  }>;
  
  // Temporary Blocks
  temporaryBlocks?: Array<{
    type: 'user' | 'channel' | 'category' | 'type';
    value: string;
    until: Timestamp;
  }>;
}

// ============================================================================
// NOTIFICATION TEMPLATES AND CAMPAIGNS
// ============================================================================

/**
 * Notification template for reusable notifications
 */
export interface NotificationTemplate extends Omit<BaseEntity, 'version'> {
  // Basic Information
  name: string;
  description: string;
  category: NotificationCategory;
  type: NotificationType;
  
  // Template Content
  content: NotificationTemplateContent;
  
  // Default Configuration
  defaultChannels: NotificationChannel[];
  defaultPriority: NotificationPriority;
  defaultTiming: DeliveryTiming;
  
  // Variables and Personalization
  variables: TemplateVariable[];
  personalizationRules: PersonalizationRule[];
  
  // A/B Testing
  variants?: TemplateVariant[];
  
  // Usage and Performance
  usage: TemplateUsage;
  
  // Approval and Governance
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  approvedBy?: ID;
  approvedAt?: Timestamp;
  
  // Versioning (override BaseEntity version)
  version: string;
  previousVersions?: ID[];
}

export interface NotificationTemplateContent {
  // Base Content
  title: string;
  body: string;
  
  // Rich Content
  html?: string;
  markdown?: string;
  
  // Media Templates
  imageTemplate?: string;
  iconTemplate?: string;
  
  // Action Templates
  actionTemplates?: ActionTemplate[];
  
  // Styling Templates
  stylingTemplate?: NotificationStyling;
  
  // Conditional Content
  conditionalContent?: ConditionalContent[];
  
  // Localization Templates
  localizationTemplates?: Record<string, LocalizedContentTemplate>;
}

export interface ActionTemplate {
  type: ActionType;
  labelTemplate: string;
  urlTemplate?: string;
  conditions?: ActionCondition[];
  styling?: ActionStyle;
}

export interface ConditionalContent {
  condition: string; // JavaScript-like expression
  content: Partial<NotificationTemplateContent>;
}

export interface LocalizedContentTemplate {
  title: string;
  body: string;
  actionTemplates?: Array<{
    id: ID;
    labelTemplate: string;
  }>;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  description: string;
  required: boolean;
  defaultValue?: unknown;
  validation?: ValidationRule;
  examples?: unknown[];
}

export interface ValidationRule {
  pattern?: string; // regex pattern
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: unknown[];
}

export interface PersonalizationRule {
  id: ID;
  name: string;
  condition: string; // targeting condition
  modifications: Record<string, unknown>; // content modifications
  priority: number;
}

export interface TemplateVariant {
  id: ID;
  name: string;
  description: string;
  content: Partial<NotificationTemplateContent>;
  weight: number; // for A/B testing
  performance?: VariantPerformance;
}

export interface VariantPerformance {
  impressions: number;
  opens: number;
  clicks: number;
  conversions: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface TemplateUsage {
  totalSent: number;
  lastUsed: Timestamp;
  averagePerformance: NotificationPerformance;
  popularVariables: Array<{
    variable: string;
    frequency: number;
  }>;
}

export interface NotificationPerformance {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  engagementScore: number;
}

// ============================================================================
// NOTIFICATION CAMPAIGNS
// ============================================================================

/**
 * Notification campaign for coordinated messaging
 */
export interface NotificationCampaign extends BaseEntity {
  // Basic Information
  name: string;
  description: string;
  objective: CampaignObjective;
  
  // Campaign Configuration
  type: CampaignType;
  duration: CampaignDuration;
  targeting: CampaignTargeting;
  
  // Content and Messaging
  notifications: CampaignNotification[];
  messageFlow: MessageFlow;
  
  // Scheduling and Automation
  schedule: CampaignSchedule;
  automation: CampaignAutomation;
  
  // Performance and Goals
  goals: CampaignGoal[];
  performance: CampaignPerformance;
  
  // Budget and Limits
  budget?: CampaignBudget;
  limits: CampaignLimits;
  
  // Status and Lifecycle
  status: CampaignStatus;
  lifecycle: CampaignLifecycle;
  
  // Team and Approval
  team: CampaignTeam;
  approval: CampaignApproval;
}

export type CampaignObjective = 
  | 'awareness'              // Brand awareness
  | 'engagement'             // User engagement
  | 'conversion'             // Drive conversions
  | 'retention'              // User retention
  | 'reactivation'           // User reactivation
  | 'education'              // User education
  | 'support'                // Customer support
  | 'feedback'               // Collect feedback
  | 'research';              // Market research

export type CampaignType = 
  | 'promotional'            // Promotional campaigns
  | 'transactional'          // Transaction-based
  | 'behavioral'             // Behavior-triggered
  | 'lifecycle'              // User lifecycle
  | 'seasonal'               // Seasonal campaigns
  | 'event_driven'           // Event-driven
  | 'drip'                   // Drip campaigns
  | 'onboarding'             // User onboarding
  | 'winback'                // Win-back campaigns
  | 'survey'                 // Survey campaigns
  | 'emergency';             // Emergency communications

export interface CampaignDuration {
  startDate: Timestamp;
  endDate?: Timestamp;
  timezone: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    endAfter?: number; // occurrences
    endDate?: Timestamp;
  };
}

export interface CampaignTargeting {
  // Audience Definition
  audienceSegments: string[];
  includeUsers?: ID[];
  excludeUsers?: ID[];
  
  // Demographic Targeting
  demographics?: {
    ageRange?: { min: number; max: number };
    gender?: string[];
    location?: string[];
    language?: string[];
  };
  
  // Behavioral Targeting
  behaviors?: {
    purchaseHistory?: Record<string, unknown>;
    engagementLevel?: 'high' | 'medium' | 'low';
    lastActivity?: { within: number; unit: 'days' | 'weeks' | 'months' };
    devicePreference?: string[];
  };
  
  // Custom Targeting
  customCriteria?: Array<{
    field: string;
    operator: string;
    value: unknown;
  }>;
  
  // Dynamic Targeting
  dynamicRules?: string[]; // IDs of dynamic targeting rules
}

export interface CampaignNotification {
  id: ID;
  templateId: ID;
  sequence: number;
  
  // Timing
  trigger: NotificationTrigger;
  delay?: number; // minutes after trigger
  
  // Conditions
  conditions?: NotificationCondition[];
  
  // Personalization
  personalization?: Record<string, unknown>;
  
  // A/B Testing
  variants?: string[];
  trafficSplit?: number;
  
  // Performance
  performance?: NotificationPerformance;
}

export interface NotificationTrigger {
  type: TriggerType;
  event?: string;
  condition?: string;
  schedule?: {
    time: string; // HH:MM
    days?: string[];
    timezone?: string;
  };
}

export type TriggerType = 
  | 'immediate'              // Send immediately
  | 'scheduled'              // Send at scheduled time
  | 'event_based'            // Triggered by event
  | 'conditional'            // Based on conditions
  | 'user_action'            // User action trigger
  | 'time_based'             // Time-based trigger
  | 'api_triggered';         // API-triggered

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface MessageFlow {
  // Flow Configuration
  flowType: 'linear' | 'branching' | 'parallel' | 'conditional';
  
  // Flow Steps
  steps: FlowStep[];
  
  // Decision Points
  decisionPoints?: DecisionPoint[];
  
  // Exit Conditions
  exitConditions?: ExitCondition[];
  
  // Flow Limits
  maxIterations?: number;
  timeLimit?: number; // days
}

export interface FlowStep {
  id: ID;
  type: 'notification' | 'wait' | 'condition' | 'action';
  notificationId?: ID;
  waitDuration?: number; // minutes
  condition?: string;
  action?: FlowAction;
  nextSteps?: ID[];
}

export interface FlowAction {
  type: 'tag_user' | 'remove_tag' | 'update_property' | 'send_webhook' | 'exit_flow';
  parameters: Record<string, unknown>;
}

export interface DecisionPoint {
  id: ID;
  stepId: ID;
  condition: string;
  trueStep: ID;
  falseStep: ID;
}

export interface ExitCondition {
  condition: string;
  reason: string;
  action?: FlowAction;
}

export interface CampaignSchedule {
  // Start/End
  startDate: Timestamp;
  endDate?: Timestamp;
  timezone: string;
  
  // Frequency Control
  sendingWindows?: TimeWindow[];
  frequency?: {
    maxPerDay?: number;
    maxPerWeek?: number;
    minimumInterval?: number; // minutes
  };
  
  // Pacing
  pacing?: {
    strategy: 'even' | 'aggressive' | 'conservative' | 'custom';
    customSchedule?: Array<{
      date: string;
      percentage: number;
    }>;
  };
}

export interface CampaignAutomation {
  // Auto-optimization
  autoOptimize: boolean;
  optimizationGoal?: 'delivery' | 'opens' | 'clicks' | 'conversions';
  
  // Smart Features
  smartTiming: boolean;
  smartFrequency: boolean;
  smartContent: boolean;
  
  // Triggers
  triggers: AutomationTrigger[];
  
  // Rules
  rules: AutomationRule[];
}

export interface AutomationTrigger {
  id: ID;
  event: string;
  conditions?: NotificationCondition[];
  actions: AutomationAction[];
}

export interface AutomationAction {
  type: 'send_notification' | 'update_segment' | 'modify_campaign' | 'send_alert';
  parameters: Record<string, unknown>;
}

export interface AutomationRule {
  id: ID;
  name: string;
  condition: string;
  action: AutomationAction;
  enabled: boolean;
}

export interface CampaignGoal {
  id: ID;
  name: string;
  type: 'delivery_rate' | 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue' | 'engagement';
  target: number;
  current?: number;
  status: 'not_started' | 'in_progress' | 'achieved' | 'missed';
}

export interface CampaignPerformance {
  // Basic Metrics
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  
  // Rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  
  // Revenue
  revenue?: number;
  revenuePerRecipient?: number;
  roi?: number;
  
  // Engagement
  engagementScore: number;
  timeToOpen?: number;
  timeToClick?: number;
  
  // Trends
  trends: PerformanceTrend[];
  
  // Comparative
  benchmarks?: BenchmarkComparison[];
}

export interface PerformanceTrend {
  date: string;
  metric: string;
  value: number;
}

export interface BenchmarkComparison {
  metric: string;
  campaignValue: number;
  industryAverage: number;
  percentile: number;
}

export interface CampaignBudget {
  totalBudget: number;
  spentBudget: number;
  currency: string;
  costBreakdown: CostBreakdown[];
  budgetAlerts: BudgetAlert[];
}

export interface CostBreakdown {
  category: 'development' | 'sending' | 'tools' | 'personnel' | 'other';
  cost: number;
  description: string;
}

export interface BudgetAlert {
  threshold: number; // percentage
  triggered: boolean;
  triggeredAt?: Timestamp;
}

export interface CampaignLimits {
  // Sending Limits
  maxRecipientsPerDay?: number;
  maxNotificationsPerUser?: number;
  
  // Performance Limits
  minDeliveryRate?: number;
  maxUnsubscribeRate?: number;
  
  // Safety Limits
  pauseOnHighBounceRate?: number;
  pauseOnHighComplaintRate?: number;
  
  // Automatic Actions
  autoActions: AutoAction[];
}

export interface AutoAction {
  condition: string;
  action: 'pause' | 'stop' | 'alert' | 'modify';
  parameters?: Record<string, unknown>;
}

export type CampaignStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface CampaignLifecycle {
  createdAt: Timestamp;
  approvedAt?: Timestamp;
  startedAt?: Timestamp;
  pausedAt?: Timestamp;
  resumedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // State Changes
  stateChanges: StateChange[];
  
  // Milestones
  milestones: CampaignMilestone[];
}

export interface StateChange {
  from: CampaignStatus;
  to: CampaignStatus;
  timestamp: Timestamp;
  userId: ID;
  reason?: string;
}

export interface CampaignMilestone {
  id: ID;
  name: string;
  description: string;
  target: number;
  achieved: boolean;
  achievedAt?: Timestamp;
  value?: number;
}

export interface CampaignTeam {
  owner: ID;
  collaborators: CampaignCollaborator[];
  permissions: CampaignPermissions;
}

export interface CampaignCollaborator {
  userId: ID;
  role: 'viewer' | 'editor' | 'manager' | 'admin';
  permissions: string[];
  addedAt: Timestamp;
  addedBy: ID;
}

export interface CampaignPermissions {
  view: ID[];
  edit: ID[];
  approve: ID[];
  launch: ID[];
  pause: ID[];
  delete: ID[];
}

export interface CampaignApproval {
  required: boolean;
  approvers: ID[];
  approvalFlow: ApprovalStep[];
  currentStep?: number;
  status: 'pending' | 'approved' | 'rejected';
  history: ApprovalHistory[];
}

export interface ApprovalStep {
  stepNumber: number;
  approvers: ID[];
  requiredApprovals: number;
  description: string;
}

export interface ApprovalHistory {
  stepNumber: number;
  approverId: ID;
  action: 'approved' | 'rejected' | 'requested_changes';
  timestamp: Timestamp;
  comments?: string;
}

// ============================================================================
// NOTIFICATION ANALYTICS AND REPORTING
// ============================================================================

/**
 * Notification queue for processing notifications
 */
export interface NotificationQueue {
  id: string;
  notification: Notification;
  priority: NotificationPriority;
  retryCount: number;
  maxRetries: number;
  scheduledFor: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Enhanced notification preferences with channel configuration
 */
export interface NotificationChannelPreferences {
  enabled: boolean;
  sound?: boolean;
  vibration?: boolean;
  badge?: boolean;
  popup?: boolean;
  digest?: boolean;
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  schedule?: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    timezone: string;
  };
}

/**
 * Updated NotificationPreferences with channels and sounds
 */
export interface NotificationPreferences {
  enabled: boolean;
  channels: {
    push: NotificationChannelPreferences;
    email: NotificationChannelPreferences;
    sms: NotificationChannelPreferences;
    in_app: NotificationChannelPreferences;
    slack: NotificationChannelPreferences;
    teams: NotificationChannelPreferences;
    whatsapp: NotificationChannelPreferences;
    webhook: NotificationChannelPreferences;
    browser: NotificationChannelPreferences;
    voice: NotificationChannelPreferences;
    telegram: NotificationChannelPreferences;
  };
  sounds: {
    enabled: boolean;
    volume: number;
    defaultSound: string;
    customSounds: Record<string, string>;
  };
  doNotDisturb: {
    enabled: boolean;
    schedule: {
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
    };
  };
  categories: Record<string, {
    enabled: boolean;
    priority: NotificationPriority;
    channels: string[];
  }>;
  grouping: {
    enabled: boolean;
    maxGroupSize: number;
    groupByType: boolean;
    groupBySender: boolean;
  };
  appearance?: {
    theme: 'light' | 'dark' | 'auto';
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    animation: 'slide' | 'fade' | 'bounce';
    duration: number;
    maxVisible: number;
  };
}

/**
 * Enhanced notification tracking with additional fields
 */
export interface NotificationTracking {
  deliveredAt?: Timestamp;
  readAt?: Timestamp;
  clickedAt?: Timestamp;
  dismissedAt?: Date;
  deletedAt?: Date;
  snoozedUntil?: Date;
  pinnedAt?: Date;
  responseTime?: number;
  deviceInfo?: DeviceInfo;
  engagement: {
    views: number;
    clicks: number;
    shares: number;
    timeSpent: number;
  };
}

/**
 * Simplified notification analytics for provider
 */
export interface SimpleNotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  last24Hours: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
  };
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  averageResponseTime: number;
}

export interface NotificationAnalytics {
  // Direct access properties (for backward compatibility)
  totalSent?: number;
  totalDelivered?: number;
  totalRead?: number;
  totalClicked?: number;
  deliveryRate?: number;
  openRate?: number;
  clickRate?: number;
  byChannel?: Record<string, ChannelAnalytics>;
  byType?: Record<string, TypeAnalytics>;
  byPriority?: Record<string, number>;
  trends?: AnalyticsTrend[];
  
  // Time Period
  period?: AnalyticsPeriod;
  
  // Overview Metrics
  overview?: AnalyticsOverview;
  
  // Channel Performance
  channelPerformance?: ChannelAnalytics[];
  
  // Type Performance
  typePerformance?: TypeAnalytics[];
  
  // User Engagement
  userEngagement?: UserEngagementAnalytics;
  
  // Delivery Analytics
  deliveryAnalytics?: DeliveryAnalytics;
  
  // Revenue Attribution
  revenueAttribution?: RevenueAttributionAnalytics;
  
  // Trends and Insights
  insights?: AnalyticsInsight[];
  
  // Benchmarks
  benchmarks?: AnalyticsBenchmark[];
}

export interface AnalyticsPeriod {
  start: Timestamp;
  end: Timestamp;
  granularity: 'hour' | 'day' | 'week' | 'month';
  timezone: string;
}

export interface AnalyticsOverview {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalConverted: number;
  totalUnsubscribed: number;
  
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  
  averageTimeToOpen: number; // seconds
  averageTimeToClick: number; // seconds
  engagementScore: number;
  
  revenueGenerated?: number;
  costPerConversion?: number;
  roi?: number;
}

export interface ChannelAnalytics {
  channel: NotificationChannel;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  
  averageCost: number;
  revenue?: number;
  roi?: number;
  
  topPerformingContent: ContentPerformance[];
  failureReasons: FailureReason[];
}

export interface ContentPerformance {
  contentId: ID;
  title: string;
  sent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface FailureReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface TypeAnalytics {
  type: NotificationType;
  category: NotificationCategory;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  
  averageFrequency: number; // per user
  userReachRate: number;
  engagementTrend: 'increasing' | 'decreasing' | 'stable';
  
  topActions: ActionAnalytics[];
  userFeedback: UserFeedbackSummary;
}

export interface ActionAnalytics {
  actionType: ActionType;
  label: string;
  clicks: number;
  clickRate: number;
  conversions: number;
  conversionRate: number;
}

export interface UserFeedbackSummary {
  averageRating: number;
  totalRatings: number;
  sentimentScore: number;
  commonComplaints: string[];
  improvementSuggestions: string[];
}

export interface UserEngagementAnalytics {
  // User Segments
  segmentPerformance: SegmentPerformance[];
  
  // Engagement Patterns
  engagementPatterns: EngagementPattern[];
  
  // User Lifecycle
  lifecycleMetrics: LifecycleMetrics;
  
  // Personalization Impact
  personalizationImpact: PersonalizationImpact;
  
  // Preference Analysis
  preferenceAnalysis: PreferenceAnalysis;
}

export interface SegmentPerformance {
  segmentId: string;
  segmentName: string;
  userCount: number;
  avgNotificationsPerUser: number;
  engagementRate: number;
  conversionRate: number;
  revenuePerUser?: number;
  churnRate: number;
}

export interface EngagementPattern {
  pattern: string;
  userCount: number;
  description: string;
  engagementScore: number;
  conversionLikelihood: number;
  recommendedActions: string[];
}

export interface LifecycleMetrics {
  newUsers: number;
  activeUsers: number;
  returningUsers: number;
  churnedUsers: number;
  
  avgTimeToFirstEngagement: number; // days
  avgLifetimeValue?: number;
  retentionRates: Array<{
    period: string;
    rate: number;
  }>;
}

export interface PersonalizationImpact {
  personalizedVsGeneric: {
    personalizedOpenRate: number;
    genericOpenRate: number;
    improvementPercent: number;
  };
  
  personalizationTypes: Array<{
    type: string;
    impactOnEngagement: number;
    usage: number;
  }>;
  
  aiRecommendationAccuracy: number;
}

export interface PreferenceAnalysis {
  channelPreferences: Array<{
    channel: NotificationChannel;
    userPercentage: number;
    engagementRate: number;
  }>;
  
  frequencyPreferences: Array<{
    frequency: string;
    userPercentage: number;
    satisfactionScore: number;
  }>;
  
  contentPreferences: Array<{
    category: string;
    preference: number;
    engagement: number;
  }>;
}

export interface DeliveryAnalytics {
  // Success Rates
  overallSuccessRate: number;
  channelSuccessRates: Record<NotificationChannel, number>;
  
  // Failure Analysis
  failureReasons: FailureAnalysis[];
  
  // Performance Trends
  deliveryTrends: DeliveryTrend[];
  
  // Provider Performance
  providerPerformance: ProviderPerformance[];
  
  // Geography Impact
  geographyImpact: GeographyImpact[];
}

export interface FailureAnalysis {
  reason: string;
  count: number;
  impact: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendedActions: string[];
}

export interface DeliveryTrend {
  date: string;
  channel: NotificationChannel;
  successRate: number;
  avgDeliveryTime: number; // seconds
  volumeSent: number;
}

export interface ProviderPerformance {
  provider: string;
  channel: NotificationChannel;
  deliveryRate: number;
  avgDeliveryTime: number;
  cost: number;
  reliability: number;
  rating: number;
}

export interface GeographyImpact {
  region: string;
  deliveryRate: number;
  engagementRate: number;
  preferredChannels: NotificationChannel[];
  bestPerformingTimes: string[];
}

export interface RevenueAttributionAnalytics {
  totalAttributedRevenue: number;
  
  // Channel Attribution
  channelAttribution: Array<{
    channel: NotificationChannel;
    revenue: number;
    percentage: number;
    roi: number;
  }>;
  
  // Campaign Attribution
  campaignAttribution: Array<{
    campaignId: ID;
    campaignName: string;
    revenue: number;
    costPerAcquisition: number;
    customerLifetimeValue: number;
  }>;
  
  // Attribution Models
  attributionModels: AttributionModel[];
  
  // Customer Journey
  customerJourneyImpact: CustomerJourneyImpact[];
}

export interface AttributionModel {
  name: string;
  description: string;
  revenue: number;
  confidence: number;
}

export interface CustomerJourneyImpact {
  touchpoint: string;
  influence: number;
  conversionContribution: number;
  averageTimeBetweenTouch: number; // hours
}

export interface AnalyticsTrend {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  period: string;
  significance: 'high' | 'medium' | 'low';
}

export interface AnalyticsInsight {
  type: 'opportunity' | 'warning' | 'success' | 'information';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  recommendedActions: string[];
  supportingData: Record<string, unknown>;
}

export interface AnalyticsBenchmark {
  metric: string;
  ourValue: number;
  industryAverage: number;
  topPerformer: number;
  percentile: number;
  status: 'above_average' | 'average' | 'below_average';
}

// ============================================================================
// REQUEST AND RESPONSE TYPES
// ============================================================================

/**
 * Create notification request
 */
export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  
  // Recipients
  userId?: ID;
  userSegment?: string;
  broadcast?: boolean;
  
  // Content
  content?: Partial<NotificationContent>;
  
  // Delivery
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledFor?: Timestamp;
  
  // Tracking
  trackingEnabled?: boolean;
  
  // Template
  templateId?: ID;
  templateVariables?: Record<string, unknown>;
}

/**
 * Update notification preferences request
 */
export interface UpdatePreferencesRequest {
  userId: ID;
  preferences: Partial<NotificationPreferences>;
}

/**
 * Notification search request
 */
export interface NotificationSearchRequest {
  // Filters
  userId?: ID;
  types?: NotificationType[];
  categories?: NotificationCategory[];
  channels?: NotificationChannel[];
  status?: NotificationStatus[];
  
  // Date Range
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Search
  query?: string;
  
  // Sorting
  sortBy?: 'created_at' | 'sent_at' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Notification search response
 */
export interface NotificationSearchResponse extends PaginatedResponse<Notification> {
  facets: {
    types: Array<{ type: NotificationType; count: number }>;
    categories: Array<{ category: NotificationCategory; count: number }>;
    channels: Array<{ channel: NotificationChannel; count: number }>;
    statuses: Array<{ status: NotificationStatus; count: number }>;
  };
  
  stats: {
    totalSent: number;
    totalDelivered: number;
    avgDeliveryRate: number;
    avgOpenRate: number;
  };
}

/**
 * Bulk notification operation request
 */
export interface BulkNotificationRequest {
  operation: 'send' | 'cancel' | 'reschedule' | 'update_status';
  notificationIds?: ID[];
  filters?: NotificationSearchRequest;
  parameters?: Record<string, unknown>;
}

/**
 * Analytics request
 */
export interface AnalyticsRequest {
  period: AnalyticsPeriod;
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, unknown>;
  compareWith?: AnalyticsPeriod;
}

// ============================================================================
// ADDITIONAL TYPES FOR NOTIFICATION DROPDOWN
// ============================================================================

/**
 * Notification filter options
 */
export type NotificationFilter = 
  | 'all'
  | 'unread'
  | 'starred'
  | 'today'
  | 'this_week'
  | 'high_priority';

/**
 * Notification sort options
 */
export type NotificationSortOption = 
  | 'newest'
  | 'oldest'
  | 'priority'
  | 'unread_first'
  | 'read_first';

// All types are exported automatically through interface/type declarations

/**
 * Announcement Bar Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for announcement bars, promotional banners,
 * alert messages, and notification systems displayed at the top of pages.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { ID, Timestamp, BaseEntity, ImageAsset } from './common.types';

// ============================================================================
// ANNOUNCEMENT BAR CORE TYPES
// ============================================================================

/**
 * Main announcement bar structure
 */
export interface AnnouncementBar extends BaseEntity {
  // Basic Information
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  
  // Styling and Appearance
  style: AnnouncementStyle;
  icon?: AnnouncementIcon;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  
  // Content and Media
  content: AnnouncementContent;
  media?: AnnouncementMedia;
  
  // Interaction
  actions: AnnouncementAction[];
  isDismissible: boolean;
  isCloseable: boolean;
  isPersistent: boolean;
  
  // Scheduling
  schedule: AnnouncementSchedule;
  
  // Targeting
  targeting: AnnouncementTargeting;
  
  // Analytics
  analytics: AnnouncementAnalytics;
  
  // Display Settings
  displaySettings: AnnouncementDisplaySettings;
  
  // Status
  status: AnnouncementStatus;
  
  // Timestamps
  publishedAt?: Timestamp;
  lastModified: Timestamp;
}

/**
 * Types of announcements
 */
export type AnnouncementType = 
  | 'promotional'      // Sales, offers, discounts
  | 'informational'    // General company news, updates
  | 'alert'           // Important alerts, warnings
  | 'success'         // Positive news, achievements
  | 'warning'         // Caution messages, policy changes
  | 'error'           // System issues, problems
  | 'maintenance'     // Scheduled maintenance, downtime
  | 'new_feature'     // New product launches, features
  | 'seasonal'        // Holiday messages, seasonal content
  | 'event'           // Upcoming events, webinars
  | 'shipping'        // Delivery updates, shipping info
  | 'covid'           // Health and safety updates
  | 'recruitment'     // Job openings, career opportunities
  | 'partnership'     // New partnerships, collaborations
  | 'sustainability'; // Environmental initiatives

/**
 * Priority levels for announcements
 */
export type AnnouncementPriority = 
  | 'critical'   // Must be seen immediately (red)
  | 'high'       // Important but not urgent (orange)
  | 'medium'     // Normal importance (blue)
  | 'low'        // Nice to know (gray)
  | 'info';      // Informational only (light blue)

/**
 * Visual styling options
 */
export type AnnouncementStyle = 
  | 'solid'      // Solid background color
  | 'gradient'   // Gradient background
  | 'outline'    // Border only
  | 'minimal'    // Text only, minimal styling
  | 'banner'     // Full-width banner style
  | 'ribbon'     // Diagonal ribbon style
  | 'floating'   // Floating notification style
  | 'marquee';   // Scrolling text marquee

/**
 * Icon options for announcements
 */
export interface AnnouncementIcon {
  type: 'emoji' | 'lucide' | 'heroicon' | 'custom' | 'none';
  value: string; // emoji character, icon name, or URL for custom
  position: 'left' | 'right' | 'center';
  size: 'small' | 'medium' | 'large';
  color?: string;
  animation?: 'none' | 'pulse' | 'bounce' | 'spin' | 'ping';
}

/**
 * Current status of announcement
 */
export type AnnouncementStatus = 
  | 'draft'      // Being created/edited
  | 'scheduled'  // Scheduled for future
  | 'active'     // Currently displayed
  | 'paused'     // Temporarily disabled
  | 'expired'    // Past end date
  | 'archived';  // Permanently disabled

// ============================================================================
// CONTENT AND MEDIA TYPES
// ============================================================================

/**
 * Announcement content structure
 */
export interface AnnouncementContent {
  // Text Content
  shortText?: string;        // Brief version for mobile
  fullText: string;          // Complete message
  altText?: string;          // Alternative text for accessibility
  
  // Rich Content
  richContent?: {
    html: string;
    markdown?: string;
    plainText: string;
  };
  
  // Localization
  translations?: {
    [languageCode: string]: {
      title: string;
      message: string;
      shortText?: string;
      altText?: string;
    };
  };
  
  // Dynamic Content
  isDynamic: boolean;
  dynamicVariables?: AnnouncementVariable[];
  
  // Personalization
  personalizationTokens?: string[];
}

/**
 * Dynamic variables for personalized content
 */
export interface AnnouncementVariable {
  key: string;
  type: 'user_name' | 'discount_amount' | 'product_name' | 'location' | 'weather' | 'time' | 'custom';
  defaultValue: string;
  format?: string;
}

/**
 * Media assets for announcements
 */
export interface AnnouncementMedia {
  // Images
  backgroundImage?: ImageAsset;
  thumbnailImage?: ImageAsset;
  logoImage?: ImageAsset;
  
  // Video
  backgroundVideo?: {
    url: string;
    poster: ImageAsset;
    duration: number;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
  };
  
  // Audio
  soundEffect?: {
    url: string;
    autoplay: boolean;
    volume: number;
  };
  
  // Animations
  animation?: {
    type: 'fadeIn' | 'slideIn' | 'bounceIn' | 'pulse' | 'custom';
    duration: number;
    delay: number;
    easing: string;
  };
}

// ============================================================================
// ACTION AND INTERACTION TYPES
// ============================================================================

/**
 * Action buttons/links in announcements
 */
export interface AnnouncementAction {
  id: ID;
  type: AnnouncementActionType;
  label: string;
  style: ActionStyle;
  
  // Navigation
  url?: string;
  isExternal: boolean;
  openInNewTab: boolean;
  
  // Interaction
  onClick?: string; // JavaScript function name
  trackingEvent?: string;
  
  // Appearance
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: AnnouncementIcon;
  
  // Behavior
  isEnabled: boolean;
  isVisible: boolean;
  requiresAuth: boolean;
  
  // Order
  order: number;
}

/**
 * Types of actions available
 */
export type AnnouncementActionType = 
  | 'link'           // Navigate to URL
  | 'button'         // Interactive button
  | 'phone'          // Phone number link
  | 'email'          // Email link
  | 'download'       // File download
  | 'share'          // Social sharing
  | 'subscribe'      // Newsletter subscription
  | 'close'          // Close announcement
  | 'dismiss'        // Dismiss permanently
  | 'remind_later'   // Remind after some time
  | 'contact'        // Contact form
  | 'cart'           // Add to cart
  | 'wishlist'       // Add to wishlist
  | 'custom';        // Custom action

/**
 * Styling options for action buttons
 */
export type ActionStyle = 
  | 'primary'    // Main call-to-action style
  | 'secondary'  // Secondary button style
  | 'outline'    // Outlined button
  | 'ghost'      // Transparent background
  | 'link'       // Text link style
  | 'minimal';   // Minimal styling

// ============================================================================
// SCHEDULING AND TIMING TYPES
// ============================================================================

/**
 * Scheduling configuration for announcements
 */
export interface AnnouncementSchedule {
  // Basic Timing
  startDate: Timestamp;
  endDate?: Timestamp;
  timezone: string;
  
  // Recurring Schedule
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  
  // Time-based Display
  displayTimes?: {
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  };
  
  // Frequency Control
  maxDisplaysPerUser?: number;
  displayInterval?: number; // Minutes between displays
  cooldownPeriod?: number;  // Hours before showing again
  
  // Conditions
  displayConditions?: DisplayCondition[];
}

/**
 * Recurrence pattern for repeated announcements
 */
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // Every N days/weeks/months
  endType: 'never' | 'after_occurrences' | 'on_date';
  endValue?: number | Timestamp;
  
  // Advanced patterns
  customPattern?: {
    daysOfWeek?: number[];
    weeksOfMonth?: number[];
    monthsOfYear?: number[];
    datesOfMonth?: number[];
  };
}

/**
 * Conditions for displaying announcements
 */
export interface DisplayCondition {
  type: 'page_path' | 'user_type' | 'device_type' | 'traffic_source' | 'weather' | 'custom';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'in' | 'not_in';
  value: string | string[];
  caseSensitive?: boolean;
}

// ============================================================================
// TARGETING AND AUDIENCE TYPES
// ============================================================================

/**
 * Audience targeting configuration
 */
export interface AnnouncementTargeting {
  // User Segmentation
  userSegments: UserSegment[];
  
  // Geographic Targeting
  geographic?: GeographicTargeting;
  
  // Device Targeting
  devices?: DeviceTargeting;
  
  // Behavioral Targeting
  behavioral?: BehavioralTargeting;
  
  // Custom Audiences
  customAudiences?: string[];
  
  // Exclusions
  exclusions?: TargetingExclusion[];
}

/**
 * User segment definitions
 */
export interface UserSegment {
  type: 'all' | 'authenticated' | 'guest' | 'new' | 'returning' | 'vip' | 'custom';
  criteria?: {
    // User properties
    registrationDate?: {
      after?: Timestamp;
      before?: Timestamp;
    };
    lastLoginDate?: {
      after?: Timestamp;
      before?: Timestamp;
    };
    orderCount?: {
      min?: number;
      max?: number;
    };
    totalSpent?: {
      min?: number;
      max?: number;
    };
    // Custom attributes
    customAttributes?: Record<string, unknown>;
  };
}

/**
 * Geographic targeting options
 */
export interface GeographicTargeting {
  countries?: string[];
  regions?: string[];
  cities?: string[];
  postalCodes?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  excludeLocations?: string[];
}

/**
 * Device targeting options
 */
export interface DeviceTargeting {
  deviceTypes?: ('desktop' | 'tablet' | 'mobile')[];
  operatingSystems?: string[];
  browsers?: string[];
  screenResolutions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
}

/**
 * Behavioral targeting criteria
 */
export interface BehavioralTargeting {
  // Page behavior
  pagesVisited?: string[];
  timeOnSite?: {
    min?: number; // seconds
    max?: number;
  };
  pageViews?: {
    min?: number;
    max?: number;
  };
  
  // Shopping behavior
  hasItemsInCart?: boolean;
  cartValue?: {
    min?: number;
    max?: number;
  };
  hasWishlistItems?: boolean;
  
  // Interaction history
  previousDismissals?: {
    announcementIds?: ID[];
    maxDismissals?: number;
    within?: number; // days
  };
  
  // Traffic source
  trafficSources?: ('direct' | 'search' | 'social' | 'email' | 'referral' | 'paid')[];
  referralDomains?: string[];
  campaignSources?: string[];
}

/**
 * Targeting exclusions
 */
export interface TargetingExclusion {
  type: 'user_segment' | 'geographic' | 'device' | 'behavioral' | 'custom';
  criteria: unknown; // Flexible criteria object
}

// ============================================================================
// ANALYTICS AND TRACKING TYPES
// ============================================================================

/**
 * Analytics data for announcements
 */
export interface AnnouncementAnalytics {
  // Display Metrics
  impressions: number;
  uniqueImpressions: number;
  viewDuration: number; // Average seconds viewed
  
  // Interaction Metrics
  clicks: number;
  clickThroughRate: number;
  conversionRate: number;
  
  // Action Metrics
  actionClicks: {
    [actionId: string]: {
      clicks: number;
      conversions: number;
    };
  };
  
  // Dismissal Metrics
  dismissals: number;
  dismissalRate: number;
  dismissalReasons?: {
    [reason: string]: number;
  };
  
  // Geographic Distribution
  viewsByCountry: {
    [countryCode: string]: number;
  };
  
  // Device Distribution
  viewsByDevice: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  
  // Time-based Metrics
  viewsByHour: number[];
  viewsByDay: number[];
  
  // Performance Metrics
  loadTime: number; // Average load time in ms
  errorRate: number;
  
  // Business Metrics
  revenue?: number; // Revenue attributed to announcement
  conversions?: number; // Goal completions
  
  // Last Updated
  lastUpdated: Timestamp;
}

// ============================================================================
// DISPLAY SETTINGS TYPES
// ============================================================================

/**
 * Display configuration options
 */
export interface AnnouncementDisplaySettings {
  // Position
  position: AnnouncementPosition;
  zIndex: number;
  
  // Behavior
  behavior: DisplayBehavior;
  
  // Animation
  entryAnimation?: AnimationConfig;
  exitAnimation?: AnimationConfig;
  
  // Responsive Settings
  responsive: ResponsiveSettings;
  
  // Performance
  lazyLoad: boolean;
  preload: boolean;
  
  // Accessibility
  accessibility: AccessibilitySettings;
}

/**
 * Position options for announcements
 */
export type AnnouncementPosition = 
  | 'top'           // Top of page (header area)
  | 'top-sticky'    // Sticky at top
  | 'bottom'        // Bottom of page
  | 'bottom-sticky' // Sticky at bottom
  | 'floating-top'  // Floating at top
  | 'floating-bottom' // Floating at bottom
  | 'modal'         // Modal overlay
  | 'sidebar'       // Side panel
  | 'inline'        // Inline with content
  | 'custom';       // Custom positioning

/**
 * Display behavior configuration
 */
export interface DisplayBehavior {
  // Show/Hide Logic
  showOnPageLoad: boolean;
  showAfterDelay: number; // milliseconds
  showAfterScroll: number; // percentage of page scrolled
  
  // Hide Conditions
  hideAfterTime?: number; // milliseconds
  hideOnClick: boolean;
  hideOnScroll?: number; // percentage scrolled
  hideOnEscape: boolean;
  
  // Frequency
  showOnce: boolean;
  showOncePerSession: boolean;
  respectDismissal: boolean;
  
  // Stacking
  allowMultiple: boolean;
  maxVisible: number;
  stackDirection: 'top' | 'bottom';
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  type: 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'custom';
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  duration: number; // milliseconds
  delay: number;    // milliseconds
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | string;
  customKeyframes?: string; // CSS keyframes
}

/**
 * Responsive display settings
 */
export interface ResponsiveSettings {
  // Breakpoints
  desktop: ResponsiveConfig;
  tablet: ResponsiveConfig;
  mobile: ResponsiveConfig;
  
  // Adaptive behavior
  adaptiveText: boolean;
  adaptiveActions: boolean;
  hideOnSmallScreens: boolean;
}

/**
 * Per-breakpoint configuration
 */
export interface ResponsiveConfig {
  show: boolean;
  position?: AnnouncementPosition;
  maxWidth?: number;
  fontSize?: string;
  padding?: string;
  margin?: string;
}

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  // ARIA labels
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  
  // Screen reader
  announceToScreenReader: boolean;
  screenReaderText?: string;
  
  // Keyboard navigation
  focusable: boolean;
  tabIndex?: number;
  
  // Reduced motion
  respectReducedMotion: boolean;
  fallbackForReducedMotion?: 'static' | 'minimal' | 'none';
  
  // High contrast
  highContrastMode?: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  };
}

// ============================================================================
// TEMPLATE AND PRESET TYPES
// ============================================================================

/**
 * Predefined announcement templates
 */
export interface AnnouncementTemplate extends BaseEntity {
  name: string;
  description: string;
  category: 'promotional' | 'informational' | 'seasonal' | 'maintenance' | 'custom';
  
  // Template Configuration
  defaultConfig: Omit<AnnouncementBar, 'id' | 'createdAt' | 'updatedAt'>;
  
  // Customization Options
  customizableFields: string[];
  requiredFields: string[];
  
  // Preview
  previewImage?: ImageAsset;
  isDefault: boolean;
  usageCount: number;
}

/**
 * Preset configurations for common scenarios
 */
export interface AnnouncementPreset {
  id: string;
  name: string;
  description: string;
  type: AnnouncementType;
  
  // Default Values
  style: AnnouncementStyle;
  priority: AnnouncementPriority;
  displaySettings: Partial<AnnouncementDisplaySettings>;
  
  // Use Cases
  useCases: string[];
  recommendedFor: string[];
}

// ============================================================================
// API AND FORM TYPES
// ============================================================================

/**
 * Form data for creating/updating announcements
 */
export interface AnnouncementFormData {
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  style: AnnouncementStyle;
  
  // Scheduling
  startDate: string; // ISO date string
  endDate?: string;
  timezone: string;
  
  // Actions
  actions: Omit<AnnouncementAction, 'id'>[];
  
  // Targeting
  targetAll: boolean;
  userSegments?: string[];
  countries?: string[];
  devices?: string[];
  
  // Display
  position: AnnouncementPosition;
  isDismissible: boolean;
  showOnce: boolean;
  
  // Media
  backgroundImage?: File | string;
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * API response for announcement list
 */
export interface AnnouncementListResponse {
  announcements: AnnouncementBar[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * API response for user-specific announcements
 */
export interface UserAnnouncementsResponse {
  announcements: AnnouncementBar[];
  dismissedIds: ID[];
  seenIds: ID[];
  totalActive: number;
}

// ============================================================================
// FILTER AND QUERY TYPES
// ============================================================================

/**
 * Filters for announcement queries
 */
export interface AnnouncementFilters {
  // Basic Filters
  type?: AnnouncementType[];
  priority?: AnnouncementPriority[];
  status?: AnnouncementStatus[];
  
  // Date Filters
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Content Filters
  hasActions?: boolean;
  hasMedia?: boolean;
  isRecurring?: boolean;
  
  // Performance Filters
  minImpressions?: number;
  minClickRate?: number;
  
  // Search
  searchTerm?: string;
  searchFields?: ('title' | 'message' | 'content')[];
}

/**
 * Sort options for announcements
 */
export interface AnnouncementSort {
  field: 'createdAt' | 'updatedAt' | 'startDate' | 'priority' | 'impressions' | 'clickRate';
  direction: 'asc' | 'desc';
}

// ============================================================================
// BULK OPERATIONS TYPES
// ============================================================================

/**
 * Bulk operations on announcements
 */
export interface BulkAnnouncementOperation {
  operation: 'activate' | 'deactivate' | 'delete' | 'duplicate' | 'archive' | 'update';
  announcementIds: ID[];
  updateData?: Partial<AnnouncementBar>;
  reason?: string;
}

/**
 * Result of bulk operation
 */
export interface BulkOperationResult {
  successful: ID[];
  failed: {
    id: ID;
    error: string;
  }[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

// All types are exported inline, no additional exports needed
export default AnnouncementBar;

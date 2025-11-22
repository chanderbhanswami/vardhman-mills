/**
 * Sale and Flash Sale Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for sales, flash sales, discount campaigns,
 * promotional events, and sale analytics in the Vardhman Mills e-commerce application.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  ImageAsset, 
  VideoAsset,
  Price,
  Currency,
  SEOData,
  PaginatedResponse 
} from './common.types';
import { Product } from './product.types';
import { Category } from './category.types';
import { Brand } from './brands.types';
import { User } from './user.types';

// ============================================================================
// CORE SALE TYPES
// ============================================================================

/**
 * Main sale entity representing a promotional sale event
 */
export interface Sale extends BaseEntity {
  // Basic Information
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  terms?: string;
  
  // Sale Type and Category
  type: SaleType;
  category: SaleCategory;
  priority: SalePriority;
  
  // Visual Assets
  bannerImage: ImageAsset;
  thumbnailImage: ImageAsset;
  heroVideo?: VideoAsset;
  gallery: ImageAsset[];
  
  // Timing
  schedule: SaleSchedule;
  
  // Targeting
  targeting: SaleTargeting;
  
  // Products and Inventory
  products: SaleProduct[];
  productCount: number;
  totalInventory: number;
  soldInventory: number;
  
  // Pricing and Discounts
  discountRules: SaleDiscountRule[];
  minimumOrderValue?: number;
  maximumDiscount?: number;
  
  // Visibility and Status
  status: SaleStatus;
  visibility: SaleVisibility;
  featured: boolean;
  trending: boolean;
  
  // Marketing
  marketingCampaign?: ID;
  promotionalCode?: string;
  shareableLink: string;
  
  // Analytics and Performance
  analytics: SaleAnalytics;
  
  // SEO
  seo: SEOData;
  
  // Metadata
  tags: string[];
  organizerId: ID;
  lastModifiedBy: ID;
}

/**
 * Sale types for different promotional strategies
 */
export type SaleType = 
  | 'flash_sale'          // Limited time flash sales
  | 'seasonal_sale'       // Seasonal promotional sales
  | 'clearance_sale'      // Inventory clearance sales
  | 'end_of_season'       // End of season sales
  | 'festival_sale'       // Festival and holiday sales
  | 'mega_sale'           // Large scale promotional events
  | 'weekend_sale'        // Weekend specific sales
  | 'daily_deals'         // Daily deal promotions
  | 'member_sale'         // Member exclusive sales
  | 'brand_sale'          // Brand specific sales
  | 'category_sale'       // Category specific sales
  | 'new_arrival_sale'    // New product launch sales
  | 'bundle_sale'         // Bundle and combo sales
  | 'buy_one_get_one'     // BOGO promotional sales
  | 'pre_order_sale'      // Pre-order promotional sales
  | 'warehouse_sale'      // Warehouse clearance sales
  | 'liquidation_sale';   // Liquidation sales

/**
 * Sale categories for organization
 */
export type SaleCategory = 
  | 'furniture'
  | 'home_decor'
  | 'textiles'
  | 'kitchenware'
  | 'bedroom'
  | 'living_room'
  | 'dining_room'
  | 'bathroom'
  | 'outdoor'
  | 'office'
  | 'kids_room'
  | 'storage'
  | 'lighting'
  | 'flooring'
  | 'wall_art'
  | 'seasonal'
  | 'wellness'
  | 'all_categories';

/**
 * Sale priority levels
 */
export type SalePriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'mega_event';

/**
 * Sale status lifecycle
 */
export type SaleStatus = 
  | 'draft'               // Being created/edited
  | 'scheduled'           // Scheduled for future
  | 'active'              // Currently running
  | 'paused'              // Temporarily paused
  | 'ended'               // Naturally ended
  | 'cancelled'           // Cancelled before/during
  | 'expired'             // Expired without completion
  | 'sold_out'            // All inventory sold
  | 'archived';           // Archived for reference

/**
 * Sale visibility settings
 */
export type SaleVisibility = 
  | 'public'              // Visible to all users
  | 'members_only'        // Only for registered members
  | 'premium_members'     // Only for premium members
  | 'invited_only'        // By invitation only
  | 'location_based'      // Based on user location
  | 'hidden'              // Hidden from public
  | 'preview';            // Preview mode

// ============================================================================
// SALE SCHEDULE AND TIMING
// ============================================================================

/**
 * Sale scheduling and timing configuration
 */
export interface SaleSchedule {
  // Basic Timing
  startDate: Timestamp;
  endDate: Timestamp;
  timezone: string;
  
  // Advanced Scheduling
  preAnnouncementDate?: Timestamp;
  earlyAccessDate?: Timestamp;
  reminderSchedule: ReminderSchedule[];
  
  // Countdown and Urgency
  showCountdown: boolean;
  countdownStyle: CountdownStyle;
  urgencyMessages: UrgencyMessage[];
  
  // Recurrence (for recurring sales)
  recurring: boolean;
  recurrencePattern?: RecurrencePattern;
  
  // Time Zones and Regions
  globalSale: boolean;
  regionalTiming: RegionalTiming[];
  
  // Duration Management
  originalDuration: number; // in minutes
  extendedDuration?: number; // for extensions
  autoExtension: boolean;
  extensionTriggers: ExtensionTrigger[];
}

/**
 * Reminder schedule for sale notifications
 */
export interface ReminderSchedule {
  id: ID;
  reminderType: ReminderType;
  triggerTime: number; // minutes before sale start/end
  message: string;
  channels: NotificationChannel[];
  enabled: boolean;
}

export type ReminderType = 
  | 'sale_starting_soon'
  | 'sale_ending_soon'
  | 'flash_sale_alert'
  | 'last_chance'
  | 'new_products_added'
  | 'price_drop_alert'
  | 'stock_running_low';

export type NotificationChannel = 
  | 'email'
  | 'sms'
  | 'push_notification'
  | 'in_app'
  | 'whatsapp'
  | 'social_media';

/**
 * Countdown display styles
 */
export type CountdownStyle = 
  | 'digital_clock'
  | 'analog_clock'
  | 'progress_bar'
  | 'circular_progress'
  | 'text_only'
  | 'animated_timer'
  | 'flip_clock';

/**
 * Urgency messaging system
 */
export interface UrgencyMessage {
  id: ID;
  trigger: UrgencyTrigger;
  message: string;
  style: UrgencyStyle;
  displayDuration: number; // seconds
  priority: number;
}

export type UrgencyTrigger = 
  | 'time_remaining'      // Based on time left
  | 'stock_percentage'    // Based on stock remaining
  | 'user_count'          // Based on active users
  | 'sales_velocity'      // Based on sales rate
  | 'manual';             // Manually triggered

export type UrgencyStyle = 
  | 'banner'
  | 'popup'
  | 'toast'
  | 'badge'
  | 'ticker'
  | 'pulsing_text';

/**
 * Recurrence pattern for recurring sales
 */
export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 weeks
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number;
  endDate?: Timestamp;
  maxOccurrences?: number;
}

export type RecurrenceFrequency = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

/**
 * Regional timing for global sales
 */
export interface RegionalTiming {
  region: string;
  country: string;
  timezone: string;
  startDate: Timestamp;
  endDate: Timestamp;
  localized: boolean;
}

/**
 * Auto-extension triggers
 */
export interface ExtensionTrigger {
  id: ID;
  condition: ExtensionCondition;
  threshold: number;
  extensionDuration: number; // minutes
  maxExtensions: number;
}

export type ExtensionCondition = 
  | 'high_traffic'
  | 'sales_momentum'
  | 'inventory_remaining'
  | 'user_engagement'
  | 'revenue_target';

// ============================================================================
// SALE TARGETING AND AUDIENCE
// ============================================================================

/**
 * Sale targeting configuration
 */
export interface SaleTargeting {
  // Audience Segments
  targetAudience: AudienceSegment[];
  excludeAudience: AudienceSegment[];
  
  // Geographic Targeting
  geographic: GeographicTargeting;
  
  // Demographic Targeting
  demographic: DemographicTargeting;
  
  // Behavioral Targeting
  behavioral: BehavioralTargeting;
  
  // Device and Platform
  deviceTargeting: DeviceTargeting;
  
  // Custom Segments
  customSegments: CustomSegment[];
  
  // Exclusions
  exclusions: TargetingExclusion[];
}

/**
 * Audience segments for targeting
 */
export interface AudienceSegment {
  id: ID;
  name: string;
  description: string;
  type: SegmentType;
  criteria: SegmentCriteria;
  size: number;
  estimatedReach: number;
}

export type SegmentType = 
  | 'demographic'
  | 'behavioral'
  | 'geographic'
  | 'psychographic'
  | 'transactional'
  | 'engagement'
  | 'lifecycle'
  | 'custom';

/**
 * Segment criteria definitions
 */
export interface SegmentCriteria {
  // Purchase Behavior
  purchaseHistory?: PurchaseCriteria;
  
  // Engagement Behavior
  engagement?: EngagementCriteria;
  
  // Demographic Filters
  demographic?: DemographicCriteria;
  
  // Geographic Filters
  geographic?: GeographicCriteria;
  
  // Custom Attributes
  customAttributes?: Record<string, unknown>;
}

export interface PurchaseCriteria {
  totalSpent: { min?: number; max?: number };
  orderCount: { min?: number; max?: number };
  averageOrderValue: { min?: number; max?: number };
  lastPurchaseDate: { start?: Timestamp; end?: Timestamp };
  categoryPreferences: string[];
  brandPreferences: string[];
  frequentlyBoughtProducts: ID[];
}

export interface EngagementCriteria {
  websiteVisits: { min?: number; max?: number };
  pageViews: { min?: number; max?: number };
  timeOnSite: { min?: number; max?: number };
  emailEngagement: EmailEngagementCriteria;
  socialEngagement: SocialEngagementCriteria;
  appUsage: AppUsageCriteria;
}

export interface EmailEngagementCriteria {
  openRate: { min?: number; max?: number };
  clickRate: { min?: number; max?: number };
  subscriptionStatus: 'subscribed' | 'unsubscribed' | 'bounced';
  lastEmailOpened: { start?: Timestamp; end?: Timestamp };
}

export interface SocialEngagementCriteria {
  socialShares: { min?: number; max?: number };
  socialLikes: { min?: number; max?: number };
  socialComments: { min?: number; max?: number };
  socialFollows: boolean;
  socialPlatforms: string[];
}

export interface AppUsageCriteria {
  appInstalled: boolean;
  lastAppOpen: { start?: Timestamp; end?: Timestamp };
  pushNotificationsEnabled: boolean;
  appSessionCount: { min?: number; max?: number };
  appRating: { min?: number; max?: number };
}

/**
 * Geographic targeting
 */
export interface GeographicTargeting {
  countries: string[];
  states: string[];
  cities: string[];
  postalCodes: string[];
  radius?: {
    center: { latitude: number; longitude: number };
    radiusKm: number;
  };
  excludeAreas: string[];
}

/**
 * Demographic targeting
 */
export interface DemographicTargeting {
  ageRange: { min?: number; max?: number };
  gender: ('male' | 'female' | 'other' | 'prefer_not_to_say')[];
  incomeRange: { min?: number; max?: number };
  education: string[];
  occupation: string[];
  maritalStatus: string[];
  householdSize: { min?: number; max?: number };
  languagePreferences: string[];
}

export type DemographicCriteria = DemographicTargeting;
export type GeographicCriteria = GeographicTargeting;

/**
 * Behavioral targeting
 */
export interface BehavioralTargeting {
  browsingBehavior: BrowsingBehavior;
  purchaseBehavior: PurchaseBehaviorTargeting;
  searchBehavior: SearchBehavior;
  deviceUsage: DeviceUsageBehavior;
  seasonalBehavior: SeasonalBehavior;
}

export interface BrowsingBehavior {
  categoriesViewed: string[];
  productsViewed: ID[];
  brandsViewed: string[];
  sessionDuration: { min?: number; max?: number };
  pagesPerSession: { min?: number; max?: number };
  bounceRate: { min?: number; max?: number };
  returnVisitor: boolean;
}

export interface PurchaseBehaviorTargeting {
  purchaseFrequency: 'first_time' | 'occasional' | 'regular' | 'frequent';
  seasonalPurchaser: boolean;
  saleShopper: boolean;
  brandLoyal: boolean;
  priceConscious: boolean;
  impulseBuyer: boolean;
  researchShopper: boolean;
}

export interface SearchBehavior {
  searchTerms: string[];
  searchFrequency: { min?: number; max?: number };
  searchToConversion: { min?: number; max?: number };
  brandSearches: string[];
  categorySearches: string[];
}

export interface DeviceUsageBehavior {
  primaryDevice: 'mobile' | 'tablet' | 'desktop';
  operatingSystem: string[];
  browser: string[];
  appUser: boolean;
  notificationOptIn: boolean;
}

export interface SeasonalBehavior {
  activeSeason: string[];
  holidayShopper: boolean;
  eventShopper: boolean;
  seasonalSpending: Record<string, number>;
}

/**
 * Device targeting
 */
export interface DeviceTargeting {
  deviceTypes: ('mobile' | 'tablet' | 'desktop')[];
  operatingSystems: string[];
  browsers: string[];
  appVersions: string[];
  connectionType: ('wifi' | '4g' | '5g' | 'broadband')[];
}

/**
 * Custom targeting segments
 */
export interface CustomSegment {
  id: ID;
  name: string;
  description: string;
  query: string; // Custom query or rule
  userIds: ID[];
  dynamicRules: DynamicRule[];
}

export interface DynamicRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

/**
 * Targeting exclusions
 */
export interface TargetingExclusion {
  type: ExclusionType;
  criteria: unknown;
  reason: string;
}

export type ExclusionType = 
  | 'user_segment'
  | 'geographic'
  | 'demographic'
  | 'behavioral'
  | 'device'
  | 'custom';

// ============================================================================
// SALE PRODUCTS AND INVENTORY
// ============================================================================

/**
 * Products included in sales
 */
export interface SaleProduct {
  // Product Reference
  productId: ID;
  product?: Product;
  
  // Sale Specific Details
  originalPrice: Price;
  salePrice: Price;
  discountAmount: Price;
  discountPercentage: number;
  
  // Inventory for Sale
  saleQuantity: number;
  availableQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  
  // Limits and Restrictions
  maxQuantityPerCustomer: number;
  minQuantityPerOrder: number;
  
  // Priority and Placement
  priority: number;
  featured: boolean;
  badgeText?: string;
  
  // Timing
  addedToSaleAt: Timestamp;
  
  // Performance
  views: number;
  addToCartCount: number;
  purchaseCount: number;
  conversionRate: number;
  
  // Status
  status: SaleProductStatus;
  visibility: boolean;
}

export type SaleProductStatus = 
  | 'active'
  | 'inactive'
  | 'sold_out'
  | 'removed'
  | 'limited_stock'
  | 'coming_soon';

/**
 * Sale discount rules and configurations
 */
export interface SaleDiscountRule {
  id: ID;
  name: string;
  description: string;
  
  // Rule Type
  type: DiscountRuleType;
  
  // Discount Configuration
  discount: DiscountConfiguration;
  
  // Conditions
  conditions: DiscountCondition[];
  
  // Limits
  limits: DiscountLimits;
  
  // Timing
  validFrom: Timestamp;
  validTo: Timestamp;
  
  // Targeting
  applicableProducts: ID[];
  applicableCategories: ID[];
  applicableBrands: ID[];
  excludeProducts: ID[];
  
  // Status
  status: 'active' | 'inactive' | 'expired';
  priority: number;
}

export type DiscountRuleType = 
  | 'percentage'          // Percentage discount
  | 'fixed_amount'        // Fixed amount discount
  | 'buy_x_get_y'         // Buy X get Y offers
  | 'bulk_discount'       // Quantity-based discounts
  | 'tiered_discount'     // Tiered pricing
  | 'bundle_discount'     // Bundle offers
  | 'free_shipping'       // Free shipping
  | 'gift_with_purchase'  // Free gift offers
  | 'loyalty_discount'    // Loyalty program discounts
  | 'first_purchase'      // First-time buyer discounts
  | 'cart_threshold';     // Minimum cart value discounts

/**
 * Discount configuration
 */
export interface DiscountConfiguration {
  // Basic Discount
  value: number;
  maxDiscount?: number;
  
  // Buy X Get Y Configuration
  buyQuantity?: number;
  getQuantity?: number;
  getDiscountPercent?: number;
  
  // Bulk Discount Tiers
  tiers?: DiscountTier[];
  
  // Bundle Configuration
  bundleProducts?: ID[];
  bundlePrice?: Price;
  
  // Gift Configuration
  giftProductId?: ID;
  giftQuantity?: number;
}

export interface DiscountTier {
  minQuantity: number;
  maxQuantity?: number;
  discountPercent: number;
  discountAmount?: number;
}

/**
 * Discount conditions
 */
export interface DiscountCondition {
  type: DiscountConditionType;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export type DiscountConditionType = 
  | 'cart_total'
  | 'product_quantity'
  | 'user_type'
  | 'user_tier'
  | 'purchase_history'
  | 'geographic_location'
  | 'payment_method'
  | 'shipping_method'
  | 'day_of_week'
  | 'time_of_day'
  | 'device_type'
  | 'referral_source';

/**
 * Discount limits and restrictions
 */
export interface DiscountLimits {
  // Usage Limits
  maxUsageTotal?: number;
  maxUsagePerUser?: number;
  maxUsagePerDay?: number;
  
  // User Restrictions
  newUsersOnly?: boolean;
  existingUsersOnly?: boolean;
  membershipRequired?: boolean;
  minimumMembershipTier?: string;
  
  // Geographic Restrictions
  allowedCountries?: string[];
  excludedCountries?: string[];
  allowedStates?: string[];
  excludedStates?: string[];
  
  // Product Restrictions
  minimumProductCount?: number;
  maximumProductCount?: number;
  requiredCategories?: ID[];
  excludedCategories?: ID[];
  
  // Other Restrictions
  nonCombinable?: boolean;
  requiresPromoCode?: boolean;
  maxConcurrentUse?: number;
}

// ============================================================================
// FLASH SALE SPECIFIC TYPES
// ============================================================================

/**
 * Flash sale specific configuration
 */
export interface FlashSale extends Omit<Sale, 'type'> {
  type: 'flash_sale';
  
  // Flash Sale Specific Properties
  flashSaleConfig: FlashSaleConfiguration;
  
  // Quick Actions
  quickAddToCart: boolean;
  oneClickPurchase: boolean;
  
  // Real-time Updates
  realTimeInventory: boolean;
  realTimePricing: boolean;
  
  // Performance Optimization
  cachingStrategy: CachingStrategy;
  loadBalancing: boolean;
}

/**
 * Flash sale configuration
 */
export interface FlashSaleConfiguration {
  // Duration (typically very short)
  durationMinutes: number;
  
  // Stock Management
  limitedQuantity: boolean;
  totalQuantityLimit: number;
  quantityPerUser: number;
  
  // Countdown and Urgency
  showRealTimeCountdown: boolean;
  showStockCounter: boolean;
  showUserCounter: boolean;
  
  // Access Control
  memberExclusiveMinutes?: number; // Early access for members
  inviteOnlyAccess?: boolean;
  
  // Notification Strategy
  preNotificationMinutes: number[];
  notificationChannels: NotificationChannel[];
  
  // Anti-Bot Measures
  captchaRequired: boolean;
  rateLimiting: RateLimitingConfig;
  userVerification: boolean;
}

/**
 * Caching strategy for performance
 */
export interface CachingStrategy {
  staticContent: CacheConfig;
  dynamicContent: CacheConfig;
  userSpecificContent: CacheConfig;
  inventoryData: CacheConfig;
}

export interface CacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  strategy: 'memory' | 'redis' | 'cdn' | 'hybrid';
  invalidationTriggers: string[];
}

/**
 * Rate limiting configuration
 */
export interface RateLimitingConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  blockDuration: number; // minutes
  exemptUserTypes: string[];
  progressiveDelay: boolean;
}

// ============================================================================
// SALE ANALYTICS AND PERFORMANCE
// ============================================================================

/**
 * Comprehensive sale analytics
 */
export interface SaleAnalytics {
  // Basic Metrics
  basic: BasicSaleMetrics;
  
  // Performance Metrics
  performance: SalePerformanceMetrics;
  
  // User Behavior
  userBehavior: UserBehaviorMetrics;
  
  // Conversion Metrics
  conversion: ConversionMetrics;
  
  // Revenue Metrics
  revenue: RevenueMetrics;
  
  // Traffic Metrics
  traffic: TrafficMetrics;
  
  // Product Performance
  productPerformance: ProductPerformanceMetrics[];
  
  // Comparative Analysis
  comparative: ComparativeMetrics;
  
  // Real-time Data
  realTime: RealTimeMetrics;
}

/**
 * Basic sale metrics
 */
export interface BasicSaleMetrics {
  // Views and Engagement
  totalViews: number;
  uniqueViews: number;
  pageViews: number;
  bounceRate: number;
  timeOnPage: number;
  
  // Participation
  totalParticipants: number;
  newParticipants: number;
  returningParticipants: number;
  
  // Sales Data
  totalOrders: number;
  totalQuantitySold: number;
  totalRevenue: number;
  averageOrderValue: number;
  
  // Inventory
  inventoryTurnover: number;
  stockoutRate: number;
  fastestSelling: ID;
  slowestSelling: ID;
}

/**
 * Sale performance metrics
 */
export interface SalePerformanceMetrics {
  // Conversion Rates
  overallConversionRate: number;
  mobileConversionRate: number;
  desktopConversionRate: number;
  
  // Speed Metrics
  averageDecisionTime: number; // seconds
  averageCheckoutTime: number;
  pageLoadTime: number;
  
  // Engagement Quality
  addToCartRate: number;
  wishlistRate: number;
  shareRate: number;
  reviewRate: number;
  
  // Customer Satisfaction
  satisfactionScore: number;
  npsScore: number;
  returnRate: number;
  complaintsCount: number;
}

/**
 * User behavior metrics
 */
export interface UserBehaviorMetrics {
  // Browsing Patterns
  averageSessionDuration: number;
  pagesPerSession: number;
  pathAnalysis: PathMetric[];
  
  // Search Behavior
  searchTerms: SearchTermMetric[];
  searchConversion: number;
  filterUsage: FilterUsageMetric[];
  
  // Product Interaction
  productViewDuration: number;
  imageViewCount: number;
  videoPlayRate: number;
  zoomUsage: number;
  
  // Social Behavior
  socialShares: SocialShareMetric[];
  socialTraffic: number;
  influencerImpact: number;
}

export interface PathMetric {
  path: string;
  frequency: number;
  conversionRate: number;
  averageTime: number;
}

export interface SearchTermMetric {
  term: string;
  frequency: number;
  conversionRate: number;
  averagePosition: number;
}

export interface FilterUsageMetric {
  filterType: string;
  filterValue: string;
  usageCount: number;
  conversionImpact: number;
}

export interface SocialShareMetric {
  platform: string;
  shareCount: number;
  clickthroughRate: number;
  conversionFromShares: number;
}

/**
 * Conversion metrics
 */
export interface ConversionMetrics {
  // Funnel Analysis
  funnelSteps: FunnelStepMetric[];
  
  // Time-based Conversion
  conversionByHour: HourlyMetric[];
  conversionByDay: DailyMetric[];
  
  // Segment Conversion
  conversionBySegment: SegmentMetric[];
  
  // Device Conversion
  conversionByDevice: DeviceMetric[];
  
  // Geographic Conversion
  conversionByLocation: LocationMetric[];
}

export interface FunnelStepMetric {
  step: string;
  entered: number;
  completed: number;
  conversionRate: number;
  dropoffRate: number;
  averageTime: number;
}

export interface HourlyMetric {
  hour: number;
  views: number;
  conversions: number;
  revenue: number;
}

export interface DailyMetric {
  date: string;
  views: number;
  conversions: number;
  revenue: number;
}

export interface SegmentMetric {
  segment: string;
  participants: number;
  conversionRate: number;
  averageOrderValue: number;
  revenue: number;
}

export interface DeviceMetric {
  deviceType: string;
  sessions: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface LocationMetric {
  location: string;
  participants: number;
  conversionRate: number;
  averageOrderValue: number;
}

/**
 * Revenue metrics
 */
export interface RevenueMetrics {
  // Revenue Breakdown
  grossRevenue: number;
  netRevenue: number;
  discountAmount: number;
  refundAmount: number;
  
  // Revenue Distribution
  revenueByProduct: ProductRevenueMetric[];
  revenueByCategory: CategoryRevenueMetric[];
  revenueByBrand: BrandRevenueMetric[];
  revenueByRegion: RegionRevenueMetric[];
  
  // Revenue Quality
  revenuePerVisitor: number;
  revenuePerParticipant: number;
  repeatPurchaseRevenue: number;
  newCustomerRevenue: number;
  
  // Profitability
  grossMargin: number;
  profitMargin: number;
  costOfSale: number;
  marketingCost: number;
  roi: number;
}

export interface ProductRevenueMetric {
  productId: ID;
  revenue: number;
  quantity: number;
  profit: number;
  margin: number;
}

export interface CategoryRevenueMetric {
  categoryId: ID;
  revenue: number;
  profit: number;
  margin: number;
}

export interface BrandRevenueMetric {
  brandId: ID;
  revenue: number;
  profit: number;
  margin: number;
}

export interface RegionRevenueMetric {
  region: string;
  revenue: number;
  participants: number;
  averageOrderValue: number;
}

/**
 * Traffic metrics
 */
export interface TrafficMetrics {
  // Traffic Sources
  trafficSources: TrafficSourceMetric[];
  
  // Channel Performance
  organicTraffic: number;
  paidTraffic: number;
  socialTraffic: number;
  emailTraffic: number;
  directTraffic: number;
  referralTraffic: number;
  
  // Quality Metrics
  qualityScore: number;
  engagementRate: number;
  newVisitorRate: number;
  mobileTrafficRate: number;
  
  // Peak Traffic
  peakTrafficTime: Timestamp;
  peakConcurrentUsers: number;
  trafficDistribution: TrafficDistributionMetric[];
}

export interface TrafficSourceMetric {
  source: string;
  visitors: number;
  sessions: number;
  conversionRate: number;
  revenue: number;
  costPerAcquisition?: number;
}

export interface TrafficDistributionMetric {
  timeSlot: string;
  visitors: number;
  percentage: number;
}

/**
 * Product performance metrics
 */
export interface ProductPerformanceMetrics {
  productId: ID;
  
  // Basic Performance
  views: number;
  addToCart: number;
  purchases: number;
  wishlistAdds: number;
  
  // Conversion Metrics
  viewToCartRate: number;
  cartToPurchaseRate: number;
  overallConversionRate: number;
  
  // Revenue Metrics
  revenue: number;
  averageSellingPrice: number;
  totalQuantitySold: number;
  
  // Engagement Metrics
  averageViewDuration: number;
  imageViews: number;
  videoPlays: number;
  reviewsReceived: number;
  averageRating: number;
  
  // Inventory Metrics
  initialStock: number;
  currentStock: number;
  stockTurnover: number;
  daysToSellOut?: number;
  
  // Ranking
  rankInSale: number;
  rankInCategory: number;
  trendinessScore: number;
}

/**
 * Comparative metrics
 */
export interface ComparativeMetrics {
  // Historical Comparison
  comparedToPreviousSale: ComparisonMetric;
  comparedToLastYear: ComparisonMetric;
  comparedToAverage: ComparisonMetric;
  
  // Industry Benchmarks
  industryBenchmarks: BenchmarkMetric[];
  
  // Goal Achievement
  goalAchievement: GoalAchievementMetric[];
  
  // Performance Index
  performanceIndex: number;
  marketShareImpact: number;
  competitiveAdvantage: string[];
}

export interface ComparisonMetric {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface BenchmarkMetric {
  metric: string;
  ourValue: number;
  industryAverage: number;
  topPerformer: number;
  percentile: number;
}

export interface GoalAchievementMetric {
  goal: string;
  target: number;
  achieved: number;
  achievementRate: number;
  status: 'exceeded' | 'met' | 'close' | 'missed';
}

/**
 * Real-time metrics
 */
export interface RealTimeMetrics {
  // Current Activity
  currentVisitors: number;
  currentCartAdds: number;
  currentPurchases: number;
  
  // Live Statistics
  salesVelocity: number; // sales per minute
  revenueVelocity: number; // revenue per minute
  inventoryVelocity: number; // items sold per minute
  
  // Trending
  trendingProducts: ID[];
  hotCategories: ID[];
  popularSearches: string[];
  
  // Alerts and Notifications
  activeAlerts: SaleAlert[];
  performanceNotifications: PerformanceNotification[];
  
  // System Health
  systemLoad: number;
  errorRate: number;
  responseTime: number;
}

export interface SaleAlert {
  id: ID;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Timestamp;
  resolved: boolean;
}

export type AlertType = 
  | 'low_stock'
  | 'high_traffic'
  | 'system_error'
  | 'revenue_milestone'
  | 'conversion_drop'
  | 'unusual_activity'
  | 'goal_achievement'
  | 'performance_issue';

export interface PerformanceNotification {
  id: ID;
  type: 'milestone' | 'achievement' | 'warning' | 'insight';
  title: string;
  message: string;
  timestamp: Timestamp;
  actionRequired: boolean;
  actionUrl?: string;
}

// ============================================================================
// SALE MANAGEMENT AND OPERATIONS
// ============================================================================

/**
 * Sale creation and update requests
 */
export interface CreateSaleRequest {
  // Basic Information
  name: string;
  description: string;
  type: SaleType;
  category: SaleCategory;
  
  // Scheduling
  startDate: Timestamp;
  endDate: Timestamp;
  timezone: string;
  
  // Products
  productIds: ID[];
  discountRules: Omit<SaleDiscountRule, 'id'>[];
  
  // Targeting
  targeting?: Partial<SaleTargeting>;
  
  // Visibility
  visibility: SaleVisibility;
  featured?: boolean;
  
  // Media
  bannerImage: File | string;
  thumbnailImage: File | string;
  gallery?: (File | string)[];
  
  // SEO
  seo?: Partial<SEOData>;
  tags?: string[];
}

export interface UpdateSaleRequest {
  id: ID;
  updates: Partial<CreateSaleRequest>;
  reason?: string;
}

/**
 * Sale search and filtering
 */
export interface SaleSearchRequest {
  // Search Terms
  query?: string;
  
  // Filters
  type?: SaleType[];
  category?: SaleCategory[];
  status?: SaleStatus[];
  visibility?: SaleVisibility[];
  
  // Date Filters
  startDateRange?: { start: Timestamp; end: Timestamp };
  endDateRange?: { start: Timestamp; end: Timestamp };
  
  // Performance Filters
  minRevenue?: number;
  maxRevenue?: number;
  minConversion?: number;
  maxConversion?: number;
  
  // Sorting
  sortBy?: SaleSortOption;
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

export type SaleSortOption = 
  | 'created_date'
  | 'start_date'
  | 'end_date'
  | 'revenue'
  | 'conversion_rate'
  | 'participants'
  | 'name'
  | 'status'
  | 'popularity';

/**
 * Sale search response
 */
export interface SaleSearchResponse extends PaginatedResponse<Sale> {
  facets: SaleSearchFacets;
  aggregations: SaleSearchAggregations;
}

export interface SaleSearchFacets {
  types: FacetCount[];
  categories: FacetCount[];
  statuses: FacetCount[];
  visibilities: FacetCount[];
  organizers: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface SaleSearchAggregations {
  totalRevenue: number;
  averageConversion: number;
  totalParticipants: number;
  activeSalesCount: number;
  upcomingSalesCount: number;
}

// ============================================================================
// SALE USER INTERACTIONS
// ============================================================================

/**
 * User's sale participation tracking
 */
export interface UserSaleParticipation {
  userId: ID;
  saleId: ID;
  
  // Participation Details
  firstVisit: Timestamp;
  lastVisit: Timestamp;
  totalVisits: number;
  totalTimeSpent: number; // seconds
  
  // Actions Taken
  productsViewed: ID[];
  productsAddedToCart: ID[];
  productsPurchased: ID[];
  productsWishlisted: ID[];
  
  // Purchase Summary
  totalOrderValue: number;
  totalQuantityPurchased: number;
  orderIds: ID[];
  
  // Engagement
  socialShares: number;
  reviewsWritten: number;
  questionsAsked: number;
  
  // Status
  status: ParticipationStatus;
  notificationsEnabled: boolean;
}

export type ParticipationStatus = 
  | 'browsing'
  | 'interested'
  | 'cart_abandoned'
  | 'purchased'
  | 'returned';

/**
 * Sale notifications and alerts
 */
export interface SaleNotification {
  id: ID;
  userId: ID;
  saleId: ID;
  
  // Notification Details
  type: SaleNotificationType;
  title: string;
  message: string;
  
  // Delivery
  channels: NotificationChannel[];
  scheduledFor: Timestamp;
  sentAt?: Timestamp;
  
  // Interaction
  opened: boolean;
  openedAt?: Timestamp;
  clicked: boolean;
  clickedAt?: Timestamp;
  
  // Status
  status: NotificationStatus;
}

export type SaleNotificationType = 
  | 'sale_starting'
  | 'sale_ending'
  | 'flash_sale_alert'
  | 'price_drop'
  | 'back_in_stock'
  | 'limited_quantity'
  | 'exclusive_access'
  | 'reminder'
  | 'follow_up';

export type NotificationStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'cancelled';

/**
 * Sale reviews and feedback
 */
export interface SaleFeedback {
  id: ID;
  userId: ID;
  saleId: ID;
  
  // Feedback Details
  rating: number; // 1-5
  title: string;
  comment: string;
  
  // Specific Ratings
  ratings: {
    priceValue: number;
    productQuality: number;
    serviceQuality: number;
    websiteExperience: number;
    deliveryExperience: number;
    overallSatisfaction: number;
  };
  
  // Recommendations
  wouldRecommend: boolean;
  wouldParticipateAgain: boolean;
  
  // Additional Info
  purchaseAmount: number;
  deviceUsed: string;
  
  // Moderation
  status: 'pending' | 'approved' | 'rejected';
  moderatedBy?: ID;
  moderatedAt?: Timestamp;
  
  // Interaction
  helpfulVotes: number;
  unhelpfulVotes: number;
  responses: SaleFeedbackResponse[];
  
  // Metadata
  createdAt: Timestamp;
  verified: boolean;
}

export interface SaleFeedbackResponse {
  id: ID;
  responderId: ID;
  responderType: 'admin' | 'customer_service' | 'manager';
  message: string;
  createdAt: Timestamp;
}

// ============================================================================
// SALE REPORTING AND INSIGHTS
// ============================================================================

/**
 * Sale report generation
 */
export interface SaleReportRequest {
  // Report Scope
  saleIds?: ID[];
  dateRange?: { start: Timestamp; end: Timestamp };
  
  // Report Type
  reportType: SaleReportType;
  
  // Metrics to Include
  includeMetrics: SaleMetricType[];
  
  // Grouping and Segmentation
  groupBy?: SaleGroupBy[];
  segmentBy?: SaleSegmentBy[];
  
  // Comparison
  compareWith?: SaleComparisonOption;
  
  // Format and Delivery
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeCharts: boolean;
  emailTo?: string[];
}

export type SaleReportType = 
  | 'performance_summary'
  | 'detailed_analytics'
  | 'revenue_analysis'
  | 'customer_insights'
  | 'product_performance'
  | 'marketing_effectiveness'
  | 'operational_efficiency'
  | 'competitive_analysis';

export type SaleMetricType = 
  | 'revenue'
  | 'conversion'
  | 'traffic'
  | 'engagement'
  | 'customer_acquisition'
  | 'inventory'
  | 'profitability'
  | 'satisfaction';

export type SaleGroupBy = 
  | 'sale'
  | 'product'
  | 'category'
  | 'brand'
  | 'customer_segment'
  | 'geographic_region'
  | 'time_period';

export type SaleSegmentBy = 
  | 'device_type'
  | 'traffic_source'
  | 'customer_type'
  | 'purchase_behavior'
  | 'demographic'
  | 'geographic';

export type SaleComparisonOption = 
  | 'previous_period'
  | 'previous_year'
  | 'industry_benchmark'
  | 'similar_sales'
  | 'goal_targets';

/**
 * Sale insights and recommendations
 */
export interface SaleInsights {
  saleId: ID;
  
  // Key Insights
  keyInsights: KeyInsight[];
  
  // Performance Insights
  performanceInsights: PerformanceInsight[];
  
  // Customer Insights
  customerInsights: CustomerInsight[];
  
  // Product Insights
  productInsights: ProductInsight[];
  
  // Optimization Recommendations
  recommendations: OptimizationRecommendation[];
  
  // Predictive Insights
  predictions: PredictiveInsight[];
  
  // Generated At
  generatedAt: Timestamp;
  validUntil: Timestamp;
}

export interface KeyInsight {
  type: 'success' | 'warning' | 'opportunity' | 'threat';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  supportingData: unknown;
  actionable: boolean;
}

export interface PerformanceInsight {
  metric: string;
  currentValue: number;
  expectedValue: number;
  variance: number;
  trend: 'improving' | 'declining' | 'stable';
  explanation: string;
  contributingFactors: string[];
}

export interface CustomerInsight {
  segment: string;
  behavior: string;
  pattern: string;
  opportunity: string;
  recommendedActions: string[];
  potentialImpact: string;
}

export interface ProductInsight {
  productId: ID;
  insight: string;
  performance: 'overperforming' | 'underperforming' | 'meeting_expectations';
  reasons: string[];
  recommendations: string[];
  potential: 'high' | 'medium' | 'low';
}

export interface OptimizationRecommendation {
  category: 'pricing' | 'inventory' | 'marketing' | 'user_experience' | 'targeting';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  requirements: string[];
  risks: string[];
}

export interface PredictiveInsight {
  type: 'forecast' | 'trend' | 'anomaly' | 'opportunity';
  timeframe: string;
  prediction: string;
  confidence: number;
  methodology: string;
  assumptions: string[];
  scenarios: PredictionScenario[];
}

export interface PredictionScenario {
  name: string;
  probability: number;
  description: string;
  impact: string;
  preparationActions: string[];
}

// ============================================================================
// ADDITIONAL UTILITY TYPES
// ============================================================================

/**
 * Sale summary for quick overview
 */
export interface SaleSummary {
  id: ID;
  name: string;
  type: SaleType;
  status: SaleStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  participantCount: number;
}

/**
 * Sale configuration for quick setup
 */
export interface SaleQuickSetup {
  template: SaleTemplate;
  customization: SaleCustomization;
  autoLaunch: boolean;
  testMode: boolean;
}

export interface SaleTemplate {
  id: ID;
  name: string;
  type: SaleType;
  defaultDuration: number; // hours
  defaultDiscountRules: Partial<SaleDiscountRule>[];
  recommendedProducts: ID[];
}

export interface SaleCustomization {
  name: string;
  duration: number; // hours
  discountPercentage: number;
  productFilters: ProductFilter[];
  targetAudience: string[];
}

export interface ProductFilter {
  type: 'category' | 'brand' | 'price_range' | 'rating' | 'availability';
  values: (string | number | { min: number; max: number })[];
}

/**
 * Sale performance benchmark
 */
export interface SalePerformanceBenchmark {
  industry: string;
  saleType: SaleType;
  metrics: BenchmarkMetric[];
  lastUpdated: Timestamp;
  sampleSize: number;
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface SaleTypeUsage {
  currency: Currency;
  category: Category;
  brand: Brand;
  user: User;
}

// All types are exported by default through the interface/type declarations above
// No need for additional export statements

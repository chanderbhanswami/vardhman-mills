import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  ImageAsset, 
  Price, 
  SEOData
} from './common.types';
import type { Product } from './product.types';

// Deal Types
export interface Deal extends BaseEntity {
  // Basic Information
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  termsAndConditions?: string;
  
  // Deal Type and Category
  type: DealType;
  category: DealCategory;
  priority: DealPriority;
  
  // Discount Configuration
  discountType: DiscountType;
  discountValue: number;
  maximumDiscount?: Price;
  minimumOrderValue?: Price;
  
  // Pricing Information
  originalPrice?: Price;
  dealPrice?: Price;
  savingsAmount?: Price;
  savingsPercentage?: number;
  
  // Products and Targeting
  applicableProducts: ID[];
  applicableCategories: ID[];
  applicableBrands: ID[];
  excludedProducts?: ID[];
  featuredProduct?: Product;
  
  // Validity and Timing
  startsAt: Timestamp;
  expiresAt: Timestamp;
  timezone: string;
  isActive: boolean;
  
  // Stock and Limits
  totalStock?: number;
  remainingStock?: number;
  limitPerCustomer?: number;
  limitPerTransaction?: number;
  
  // Eligibility
  customerEligibility: CustomerEligibility;
  locationRestrictions?: LocationRestriction[];
  
  // Display and Marketing
  media: DealMedia;
  badgeText?: string;
  urgencyText?: string;
  countdownDisplay: boolean;
  
  // Visibility and Placement
  isPublished: boolean;
  isFeatured: boolean;
  isExclusive: boolean;
  showOnHomepage: boolean;
  showInCategory: boolean;
  sortOrder?: number;
  
  // Analytics and Performance
  metrics: DealMetrics;
  
  // SEO
  seo: SEOData;
  
  // Configuration
  settings: DealSettings;
  
  // Admin Information
  createdBy: ID;
  lastModifiedBy: ID;
  approvedBy?: ID;
  approvedAt?: Timestamp;
  rejectionReason?: string;
}

export type DealType = 
  | 'flash_sale'           // Limited time flash sale
  | 'daily_deal'           // Deal of the day
  | 'weekend_special'      // Weekend only deals
  | 'seasonal_sale'        // Seasonal promotions
  | 'clearance'            // Clearance items
  | 'bulk_discount'        // Quantity-based discounts
  | 'bundle_deal'          // Product bundles
  | 'loyalty_exclusive'    // Loyalty member exclusive
  | 'new_customer_deal'    // First-time customer deals
  | 'category_sale'        // Category-wide sales
  | 'brand_sale'           // Brand-specific sales
  | 'limited_time_offer'   // General LTO
  | 'buy_one_get_one'      // BOGO offers
  | 'early_bird'           // Early access deals
  | 'last_chance'          // Final opportunity deals
  | 'pre_order'            // Pre-order discounts
  | 'anniversary_sale'     // Anniversary celebrations
  | 'festival_offer'       // Festival/holiday offers
  | 'midnight_sale'        // Midnight special deals
  | 'vip_access'           // VIP customer access
  | 'referral_bonus'       // Referral-based deals
  | 'social_share_deal'    // Social sharing rewards
  | 'app_exclusive'        // Mobile app exclusive
  | 'email_subscriber'     // Email subscriber exclusive
  | 'cart_abandonment'     // Cart abandonment recovery
  | 'birthday_special';    // Birthday offers

export type DealCategory = 
  | 'percentage_off'       // % discount
  | 'fixed_amount_off'     // Fixed amount discount
  | 'free_shipping'        // Free shipping deals
  | 'free_gift'            // Free gift with purchase
  | 'cashback'             // Cashback offers
  | 'loyalty_points'       // Loyalty points multiplier
  | 'extended_warranty'    // Extended warranty
  | 'price_match'          // Price matching
  | 'trade_in_bonus'       // Trade-in bonuses
  | 'subscription_discount' // Subscription discounts
  | 'group_buy'            // Group buying
  | 'auction_style'        // Auction-style deals
  | 'name_your_price'      // Customer sets price
  | 'progressive_discount' // Progressive discounts
  | 'tiered_pricing';      // Tiered pricing structure

export type DealPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type DiscountType = 
  | 'percentage'           // Percentage discount
  | 'fixed_amount'         // Fixed amount discount
  | 'free_shipping'        // Free shipping
  | 'buy_x_get_y'          // Buy X get Y
  | 'tiered'               // Tiered discounts
  | 'bundle'               // Bundle pricing
  | 'cashback'             // Cashback offer
  | 'loyalty_points'       // Points-based
  | 'gift_with_purchase'   // Free gift
  | 'upgrade'              // Free upgrade
  | 'extended_service';    // Extended service

export interface CustomerEligibility {
  type: 'all' | 'specific_customers' | 'customer_groups' | 'new_customers' | 'returning_customers' | 'loyalty_members';
  customerIds?: ID[];
  customerGroups?: string[];
  loyaltyTiers?: string[];
  minimumPurchaseHistory?: {
    amount?: number;
    orderCount?: number;
    timeframe?: number; // days
  };
  registrationDate?: {
    after?: Timestamp;
    before?: Timestamp;
  };
  excludedCustomers?: ID[];
  requiresVerification?: boolean;
}

export interface LocationRestriction {
  type: 'include' | 'exclude';
  countries?: string[];
  states?: string[];
  cities?: string[];
  postalCodes?: string[];
  deliveryZones?: string[];
}

export interface DealMedia {
  featuredImage?: ImageAsset;
  bannerImage?: ImageAsset;
  thumbnailImage?: ImageAsset;
  gallery?: ImageAsset[];
  videos?: VideoAsset[];
  badgeIcon?: ImageAsset;
  socialShareImage?: ImageAsset;
}

export interface VideoAsset {
  id: ID;
  url: string;
  title?: string;
  thumbnail?: ImageAsset;
  duration?: number;
  platform: 'youtube' | 'vimeo' | 'self_hosted';
}

export interface DealMetrics {
  // Views and Engagement
  totalViews: number;
  uniqueViews: number;
  clickThroughRate: number;
  
  // Conversions
  totalConversions: number;
  conversionRate: number;
  revenueGenerated: Price;
  
  // Social Engagement
  shares: number;
  likes: number;
  comments: number;
  
  // Performance by Channel
  performanceByChannel: {
    [channel: string]: {
      views: number;
      conversions: number;
      revenue: Price;
    };
  };
  
  // Time-based Analytics
  hourlyPerformance: Array<{
    hour: number;
    views: number;
    conversions: number;
  }>;
  
  dailyPerformance: Array<{
    date: string;
    views: number;
    conversions: number;
    revenue: Price;
  }>;
  
  // Customer Behavior
  averageViewDuration: number;
  bounceRate: number;
  returnVisitorRate: number;
  
  // Inventory Impact
  stockMovement: number;
  inventoryTurnover: number;
  
  // Comparative Analysis
  performanceVsTarget: number;
  industryBenchmark?: number;
  historicalComparison?: number;
}

export interface DealSettings {
  // Display Settings
  showTimer: boolean;
  showStockCounter: boolean;
  showProgress: boolean;
  showSavingsAmount: boolean;
  showOriginalPrice: boolean;
  
  // Behavior Settings
  allowStacking: boolean;
  allowCombination: boolean;
  autoApply: boolean;
  requiresCouponCode: boolean;
  
  // Notification Settings
  notifyOnStart: boolean;
  notifyOnEnd: boolean;
  notifyOnStock: boolean;
  reminderNotifications: boolean;
  
  // Advanced Settings
  dynamicPricing: boolean;
  personalizedOffers: boolean;
  geolocationBased: boolean;
  deviceSpecific: boolean;
  
  // Fraud Protection
  limitPerIP: number;
  limitPerDevice: number;
  requiresLogin: boolean;
  verificationRequired: boolean;
}

// Deal Collection and Management
export interface DealCollection extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  type: 'curated' | 'automatic' | 'seasonal' | 'event_based';
  
  // Collection Content
  deals: ID[];
  featuredDeals: ID[];
  
  // Display
  displayStyle: 'grid' | 'list' | 'carousel' | 'masonry';
  itemsPerPage: number;
  sortOrder: DealSortOption;
  
  // Visibility
  isActive: boolean;
  isPublic: boolean;
  requiresLogin: boolean;
  
  // Timing
  startDate?: Timestamp;
  endDate?: Timestamp;
  
  // SEO and Marketing
  seo: SEOData;
  socialImage?: ImageAsset;
  
  // Analytics
  collectionMetrics: {
    totalViews: number;
    totalClicks: number;
    conversionRate: number;
    revenue: Price;
  };
}

export type DealSortOption = 
  | 'newest'
  | 'ending_soon'
  | 'most_popular'
  | 'highest_discount'
  | 'lowest_price'
  | 'highest_rated'
  | 'alphabetical'
  | 'relevance'
  | 'custom';

// Deal Filters and Search
export interface DealFilters {
  // Basic Filters
  type?: DealType[];
  category?: DealCategory[];
  status?: 'active' | 'upcoming' | 'expired' | 'all';
  
  // Discount Filters
  discountRange?: {
    min: number;
    max: number;
  };
  discountType?: DiscountType[];
  
  // Price Filters
  priceRange?: {
    min: number;
    max: number;
  };
  
  // Product Filters
  productCategories?: ID[];
  brands?: ID[];
  products?: ID[];
  
  // Availability Filters
  stockAvailable?: boolean;
  eligibleCustomers?: boolean;
  locationRestricted?: boolean;
  
  // Time Filters
  timeRemaining?: {
    hours?: number;
    days?: number;
  };
  
  // Engagement Filters
  minRating?: number;
  popularDeals?: boolean;
  
  // Search
  searchQuery?: string;
  
  // Sorting
  sortBy?: DealSortOption;
  sortOrder?: 'asc' | 'desc';
}

export interface DealSearchResult {
  deals: Deal[];
  totalCount: number;
  filters: DealFilterGroup[];
  suggestions: string[];
  featuredDeals: Deal[];
  trendingDeals: Deal[];
}

export interface DealFilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'date';
  options: DealFilterOption[];
  isCollapsed: boolean;
}

export interface DealFilterOption {
  id: string;
  label: string;
  value: string | number;
  count: number;
  isSelected: boolean;
}

// Deal Notifications and Alerts
export interface DealNotification extends BaseEntity {
  dealId: ID;
  userId: ID;
  type: DealNotificationType;
  
  // Content
  title: string;
  message: string;
  imageUrl?: string;
  
  // Delivery
  channels: NotificationChannel[];
  scheduledFor?: Timestamp;
  sentAt?: Timestamp;
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  
  // Interaction
  isRead: boolean;
  readAt?: Timestamp;
  clickedAt?: Timestamp;
  actionTaken: boolean;
  
  // Metadata
  metadata: Record<string, string | number | boolean>;
}

export type DealNotificationType = 
  | 'deal_started'
  | 'deal_ending_soon'
  | 'deal_ended'
  | 'stock_low'
  | 'price_drop'
  | 'back_in_stock'
  | 'exclusive_access'
  | 'personalized_recommendation'
  | 'cart_reminder'
  | 'wishlist_alert';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'social';

export interface DealAlert extends BaseEntity {
  userId: ID;
  
  // Alert Criteria
  criteria: {
    productIds?: ID[];
    categories?: ID[];
    brands?: ID[];
    keywords?: string[];
    maxPrice?: number;
    minDiscount?: number;
    dealTypes?: DealType[];
  };
  
  // Notification Preferences
  notificationChannels: NotificationChannel[];
  frequency: 'immediate' | 'daily' | 'weekly';
  
  // Status
  isActive: boolean;
  lastTriggered?: Timestamp;
  triggerCount: number;
  
  // Settings
  alertName: string;
  description?: string;
  expiryDate?: Timestamp;
}

// Deal Analytics and Reporting
export interface DealAnalytics {
  dealId: ID;
  
  // Performance Overview
  overview: {
    totalViews: number;
    uniqueViews: number;
    conversions: number;
    conversionRate: number;
    revenue: Price;
    averageOrderValue: Price;
  };
  
  // Time-based Analysis
  timeAnalysis: {
    hourlyData: Array<{
      hour: number;
      views: number;
      conversions: number;
    }>;
    dailyData: Array<{
      date: string;
      views: number;
      conversions: number;
      revenue: Price;
    }>;
    peakPerformanceTime: {
      hour: number;
      day: string;
      metric: 'views' | 'conversions' | 'revenue';
    };
  };
  
  // Customer Analysis
  customerAnalysis: {
    demographics: {
      ageGroups: Record<string, number>;
      genderDistribution: Record<string, number>;
      locationDistribution: Record<string, number>;
    };
    behavior: {
      newCustomers: number;
      returningCustomers: number;
      averageSessionDuration: number;
      pagesPerSession: number;
    };
    segments: Array<{
      segment: string;
      percentage: number;
      conversionRate: number;
    }>;
  };
  
  // Channel Performance
  channelPerformance: {
    [channel: string]: {
      views: number;
      conversions: number;
      revenue: Price;
      costPerAcquisition: Price;
      returnOnInvestment: number;
    };
  };
  
  // Product Impact
  productImpact: {
    topPerformingProducts: Array<{
      productId: ID;
      productName: string;
      units: number;
      revenue: Price;
    }>;
    categoryDistribution: Record<string, number>;
    inventoryImpact: {
      stockReduction: number;
      turnoverRate: number;
    };
  };
  
  // Competitive Analysis
  competitiveAnalysis?: {
    marketPosition: 'leading' | 'competitive' | 'following';
    priceComparison: number; // percentage vs market average
    featureComparison: string[];
  };
}

// Deal Management and Operations
export interface DealOperation {
  type: 'create' | 'update' | 'activate' | 'deactivate' | 'extend' | 'clone' | 'delete';
  dealId: ID;
  operatorId: ID;
  timestamp: Timestamp;
  details: Record<string, string | number | boolean>;
  result: 'success' | 'failure' | 'partial';
  errorMessage?: string;
}

export interface DealSchedule {
  dealId: ID;
  
  // Schedule Configuration
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval?: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  
  // Duration
  duration: number; // in hours
  
  // Limits
  maxOccurrences?: number;
  endDate?: Timestamp;
  
  // Status
  isActive: boolean;
  nextOccurrence?: Timestamp;
  lastOccurrence?: Timestamp;
  occurrenceCount: number;
}

export interface DealTemplate extends BaseEntity {
  name: string;
  description?: string;
  category: string;
  
  // Template Configuration
  template: Partial<Deal>;
  
  // Usage
  usageCount: number;
  isPublic: boolean;
  tags: string[];
  
  // Ratings
  rating: number;
  reviewCount: number;
  
  // Creator
  createdBy: ID;
  sharedWith: ID[];
}

// API Response Types
export interface DealListResponse {
  deals: Deal[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: DealFilters;
  summary: {
    activeDeals: number;
    totalSavings: Price;
    avgDiscount: number;
    expiringToday: number;
  };
}

export interface DealDetailsResponse {
  deal: Deal;
  relatedDeals: Deal[];
  analytics: DealAnalytics;
  notifications: DealNotification[];
  userEligibility: {
    isEligible: boolean;
    reasons?: string[];
    requirements?: string[];
  };
}

// User Interaction Types
export interface UserDealInteraction {
  userId: ID;
  dealId: ID;
  interactionType: 'view' | 'click' | 'share' | 'save' | 'apply' | 'convert';
  timestamp: Timestamp;
  sessionId: string;
  source: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface DealWishlist extends BaseEntity {
  userId: ID;
  dealId: ID;
  notifyOnRestock: boolean;
  notifyOnPriceDrop: boolean;
  targetPrice?: Price;
  expiryDate?: Timestamp;
  notes?: string;
}

export interface DealShare {
  dealId: ID;
  userId: ID;
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link' | 'other';
  shareUrl: string;
  customMessage?: string;
  recipientCount?: number;
  clickCount: number;
  conversionCount: number;
  sharedAt: Timestamp;
}

// Export commonly used types
export type { DealMetrics as DealMetricsType };
export type { DealFilters as DealFiltersType };
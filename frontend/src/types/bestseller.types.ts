/**
 * Bestseller Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for bestselling products, trending items,
 * popular collections, and sales performance analytics.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { ID, Timestamp, BaseEntity, ImageAsset, Rating } from './common.types';
import { Product } from './product.types';

// ============================================================================
// BESTSELLER CORE TYPES
// ============================================================================

/**
 * Bestselling product information
 */
export interface BestsellerProduct extends BaseEntity {
  // Product Reference
  productId: ID;
  product?: Product; // Populated product data
  
  // Bestseller Metrics
  rank: number;
  category: 'overall' | 'category' | 'subcategory' | 'brand' | 'seasonal' | 'regional';
  categoryId?: ID;
  brandId?: ID;
  region?: string;
  
  // Sales Performance
  salesData: BestsellerSalesData;
  
  // Trending Information
  trendingInfo: TrendingInfo;
  
  // Time Period
  timePeriod: TimePeriod;
  
  // Achievement
  achievement: BestsellerAchievement;
  
  // Display Settings
  displaySettings: BestsellerDisplaySettings;
  
  // Analytics
  analytics: BestsellerAnalytics;
  
  // Status
  status: 'active' | 'inactive' | 'seasonal' | 'discontinued';
  isFeature: boolean;
  isTrending: boolean;
  
  // Timestamps
  firstBestsellerDate: Timestamp;
  lastUpdated: Timestamp;
}

/**
 * Sales performance data
 */
export interface BestsellerSalesData {
  // Quantity Metrics
  totalUnitsSold: number;
  unitsThisPeriod: number;
  averageUnitsPerDay: number;
  
  // Revenue Metrics
  totalRevenue: number;
  revenueThisPeriod: number;
  averageOrderValue: number;
  
  // Growth Metrics
  salesGrowthRate: number; // Percentage
  revenueGrowthRate: number;
  unitGrowthRate: number;
  
  // Comparative Metrics
  marketSharePercentage?: number;
  competitorComparison?: CompetitorComparison;
  
  // Performance Indicators
  performanceScore: number; // 0-100
  velocityScore: number;    // How fast it's selling
  consistencyScore: number; // How consistent sales are
  
  // Historical Data
  historicalData: SalesHistoryPoint[];
}

/**
 * Individual sales history data point
 */
export interface SalesHistoryPoint {
  date: Timestamp;
  unitsSold: number;
  revenue: number;
  rank?: number;
  events?: string[]; // Marketing events, promotions, etc.
}

/**
 * Competitor comparison data
 */
export interface CompetitorComparison {
  competitorCount: number;
  marketPosition: number;
  pricingAdvantage: 'higher' | 'competitive' | 'lower';
  qualityAdvantage: 'superior' | 'competitive' | 'inferior';
  uniqueSellingPoints: string[];
}

/**
 * Trending information
 */
export interface TrendingInfo {
  // Trend Status
  trendStatus: TrendStatus;
  trendDirection: 'rising' | 'falling' | 'stable' | 'volatile';
  trendStrength: 'weak' | 'moderate' | 'strong' | 'viral';
  
  // Momentum
  momentum: number; // -100 to 100
  velocityChange: number; // Rate of change
  
  // Social Signals
  socialMentions?: SocialMentions;
  searchTrends?: SearchTrends;
  
  // Seasonality
  seasonalityFactor: number;
  seasonalPattern?: SeasonalPattern;
  
  // Predictions
  predictedTrend?: TrendPrediction;
}

/**
 * Trend status options
 */
export type TrendStatus = 
  | 'new_entry'      // Recently became bestseller
  | 'rising'         // Moving up in ranks
  | 'stable'         // Maintaining position
  | 'declining'      // Losing rank
  | 'seasonal_peak'  // Seasonal high
  | 'seasonal_low'   // Seasonal low
  | 'viral'          // Rapidly trending
  | 'comeback';      // Returning to bestseller status

/**
 * Social media mentions data
 */
export interface SocialMentions {
  totalMentions: number;
  sentimentScore: number; // -1 to 1
  platforms: {
    [platform: string]: {
      mentions: number;
      sentiment: number;
      engagement: number;
    };
  };
  influencerMentions: number;
  hashtagPerformance: {
    [hashtag: string]: number;
  };
}

/**
 * Search trend data
 */
export interface SearchTrends {
  searchVolume: number;
  searchGrowth: number;
  relatedKeywords: {
    keyword: string;
    volume: number;
    trend: number;
  }[];
  searchSeasonality: number[];
}

/**
 * Seasonal pattern information
 */
export interface SeasonalPattern {
  pattern: 'spring_peak' | 'summer_peak' | 'autumn_peak' | 'winter_peak' | 'holiday_driven' | 'year_round';
  peakMonths: number[];
  lowMonths: number[];
  seasonalityStrength: number; // 0-1
  yearOverYearConsistency: number; // 0-1
}

/**
 * Trend prediction data
 */
export interface TrendPrediction {
  nextMonthRank: number;
  nextQuarterRank: number;
  confidence: number; // 0-1
  factors: string[];
  risks: string[];
  opportunities: string[];
}

// ============================================================================
// TIME PERIOD AND ACHIEVEMENT TYPES
// ============================================================================

/**
 * Time period for bestseller analysis
 */
export interface TimePeriod {
  type: PeriodType;
  current: TimeRange;
  previous?: TimeRange; // For comparison
  
  // Custom periods
  customLabel?: string;
  isRecurring: boolean;
  
  // Filters
  includePromotions: boolean;
  includeDiscounts: boolean;
  includeSeasonalSales: boolean;
}

/**
 * Available time period types
 */
export type PeriodType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'seasonal'
  | 'holiday'
  | 'custom'
  | 'all_time';

/**
 * Time range definition
 */
export interface TimeRange {
  startDate: Timestamp;
  endDate: Timestamp;
  totalDays: number;
}

/**
 * Bestseller achievement information
 */
export interface BestsellerAchievement {
  // Achievement Type
  type: AchievementType;
  level: AchievementLevel;
  
  // Milestones
  milestones: Milestone[];
  
  // Badges
  badges: BestsellerBadge[];
  
  // Records
  records: BestsellerRecord[];
  
  // Recognition
  recognitions: Recognition[];
}

/**
 * Types of bestseller achievements
 */
export type AchievementType = 
  | 'top_seller'        // Overall top seller
  | 'category_leader'   // Best in category
  | 'brand_champion'    // Best for brand
  | 'new_hit'          // New product success
  | 'comeback_star'    // Returned to bestseller
  | 'consistent_performer' // Long-term bestseller
  | 'seasonal_champion' // Seasonal bestseller
  | 'customer_favorite' // High customer satisfaction
  | 'rapid_riser'      // Quick climb to bestseller
  | 'value_leader';    // Best value proposition

/**
 * Achievement levels
 */
export type AchievementLevel = 
  | 'bronze'   // Top 50
  | 'silver'   // Top 20
  | 'gold'     // Top 10
  | 'platinum' // Top 5
  | 'diamond'; // #1

/**
 * Milestone achievements
 */
export interface Milestone {
  id: ID;
  name: string;
  description: string;
  achievedDate: Timestamp;
  value: number;
  unit: string;
  category: 'sales' | 'revenue' | 'ranking' | 'duration' | 'customer_satisfaction';
  isSignificant: boolean;
}

/**
 * Bestseller badges
 */
export interface BestsellerBadge {
  id: ID;
  name: string;
  description: string;
  icon: ImageAsset;
  color: string;
  earnedDate: Timestamp;
  validUntil?: Timestamp;
  criteria: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Performance records
 */
export interface BestsellerRecord {
  id: ID;
  type: 'highest_rank' | 'longest_streak' | 'fastest_climb' | 'highest_sales' | 'highest_revenue';
  value: number;
  unit: string;
  achievedDate: Timestamp;
  period: string;
  isCurrentRecord: boolean;
  previousRecord?: number;
}

/**
 * External recognition
 */
export interface Recognition {
  id: ID;
  title: string;
  source: string;
  type: 'media_mention' | 'industry_award' | 'customer_choice' | 'expert_recommendation';
  date: Timestamp;
  description: string;
  url?: string;
  credibilityScore: number; // 1-10
}

// ============================================================================
// DISPLAY AND PRESENTATION TYPES
// ============================================================================

/**
 * Display settings for bestsellers
 */
export interface BestsellerDisplaySettings {
  // List Settings
  showRank: boolean;
  showBadges: boolean;
  showTrendArrow: boolean;
  showSalesData: boolean;
  showPercentageGrowth: boolean;
  
  // Visual Elements
  highlightColor?: string;
  badgeStyle: 'minimal' | 'standard' | 'premium';
  rankDisplay: 'number' | 'medal' | 'trophy' | 'crown';
  
  // Layout
  layout: 'grid' | 'list' | 'carousel' | 'tiles';
  itemsPerRow: number;
  showFilters: boolean;
  enableSorting: boolean;
  
  // Animation
  enableAnimations: boolean;
  animationType: 'fade' | 'slide' | 'bounce' | 'zoom';
  
  // Responsive
  responsiveBreakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

/**
 * Bestseller section/widget configuration
 */
export interface BestsellerSection extends BaseEntity {
  // Basic Information
  title: string;
  subtitle?: string;
  description?: string;
  
  // Content
  products: BestsellerProduct[];
  maxProducts: number;
  
  // Filtering
  filters: BestsellerFilters;
  
  // Display
  displaySettings: BestsellerDisplaySettings;
  
  // Positioning
  position: SectionPosition;
  order: number;
  
  // Visibility
  isVisible: boolean;
  showOnPages: string[];
  hideOnPages: string[];
  
  // Scheduling
  schedule?: {
    startDate: Timestamp;
    endDate?: Timestamp;
    timezone: string;
  };
  
  // A/B Testing
  variant?: string;
  testId?: ID;
}

/**
 * Section positioning options
 */
export type SectionPosition = 
  | 'homepage_hero'
  | 'homepage_featured'
  | 'homepage_sidebar'
  | 'category_top'
  | 'category_sidebar'
  | 'product_recommendations'
  | 'footer'
  | 'custom';

// ============================================================================
// FILTERING AND SEARCH TYPES
// ============================================================================

/**
 * Filters for bestseller queries
 */
export interface BestsellerFilters {
  // Category Filters
  categories?: ID[];
  subcategories?: ID[];
  brands?: ID[];
  
  // Performance Filters
  minRank?: number;
  maxRank?: number;
  minSalesVolume?: number;
  minRevenue?: number;
  minGrowthRate?: number;
  
  // Time Filters
  timePeriod?: PeriodType;
  customDateRange?: TimeRange;
  
  // Product Filters
  priceRange?: {
    min: number;
    max: number;
  };
  ratingRange?: {
    min: number;
    max: number;
  };
  availabilityStatus?: ('in_stock' | 'low_stock' | 'pre_order')[];
  
  // Trending Filters
  trendStatus?: TrendStatus[];
  trendDirection?: ('rising' | 'falling' | 'stable')[];
  
  // Achievement Filters
  achievementTypes?: AchievementType[];
  achievementLevels?: AchievementLevel[];
  hasBadges?: boolean;
  
  // Display Filters
  excludeDiscounted?: boolean;
  excludeOutOfStock?: boolean;
  featuredOnly?: boolean;
}

/**
 * Sort options for bestsellers
 */
export interface BestsellerSort {
  field: SortField;
  direction: 'asc' | 'desc';
  secondarySort?: {
    field: SortField;
    direction: 'asc' | 'desc';
  };
}

/**
 * Available sort fields
 */
export type SortField = 
  | 'rank'
  | 'sales_volume'
  | 'revenue'
  | 'growth_rate'
  | 'trend_momentum'
  | 'customer_rating'
  | 'price'
  | 'newest'
  | 'alphabetical'
  | 'popularity';

// ============================================================================
// ANALYTICS AND REPORTING TYPES
// ============================================================================

/**
 * Analytics data for bestseller performance
 */
export interface BestsellerAnalytics {
  // Performance Metrics
  performanceMetrics: PerformanceMetrics;
  
  // Customer Metrics
  customerMetrics: CustomerMetrics;
  
  // Conversion Metrics
  conversionMetrics: ConversionMetrics;
  
  // Engagement Metrics
  engagementMetrics: EngagementMetrics;
  
  // Competitive Metrics
  competitiveMetrics?: CompetitiveMetrics;
  
  // Forecasting
  forecasting: ForecastingData;
  
  // Last Updated
  lastUpdated: Timestamp;
}

/**
 * Performance-specific metrics
 */
export interface PerformanceMetrics {
  // Sales Performance
  averageDailySales: number;
  salesVelocity: number;
  inventoryTurnover: number;
  stockoutRate: number;
  
  // Revenue Performance
  profitMargin: number;
  revenuePerUnit: number;
  contributionMargin: number;
  
  // Ranking Performance
  averageRank: number;
  rankVolatility: number;
  timeInTop10: number; // Percentage
  timeInTop100: number;
  
  // Efficiency Metrics
  marketingROI: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
}

/**
 * Customer-related metrics
 */
export interface CustomerMetrics {
  // Demographics
  customerDemographics: {
    ageGroups: { [ageRange: string]: number };
    genderDistribution: { [gender: string]: number };
    locationDistribution: { [region: string]: number };
    incomeSegments: { [segment: string]: number };
  };
  
  // Behavior
  averageOrderSize: number;
  repeatPurchaseRate: number;
  customerRetentionRate: number;
  averageCustomerLifetime: number;
  
  // Satisfaction
  customerSatisfactionScore: number;
  netPromoterScore: number;
  reviewScore: Rating;
  returnRate: number;
  
  // Engagement
  wishlistAdditions: number;
  shareCount: number;
  reviewCount: number;
  questionCount: number;
}

/**
 * Conversion-related metrics
 */
export interface ConversionMetrics {
  // View to Purchase
  viewToPurchaseRate: number;
  addToCartRate: number;
  cartToPurchaseRate: number;
  
  // Channel Performance
  conversionByChannel: {
    [channel: string]: {
      views: number;
      conversions: number;
      rate: number;
    };
  };
  
  // Traffic Sources
  conversionBySource: {
    [source: string]: {
      traffic: number;
      conversions: number;
      rate: number;
    };
  };
  
  // Time-based
  conversionByTimeOfDay: number[];
  conversionByDayOfWeek: number[];
  averageTimeToConversion: number; // hours
}

/**
 * User engagement metrics
 */
export interface EngagementMetrics {
  // Page Metrics
  pageViews: number;
  uniquePageViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  
  // Interaction Metrics
  clickThroughRate: number;
  imageViewRate: number;
  videoPlayRate: number;
  descriptionReadRate: number;
  
  // Social Metrics
  socialShares: number;
  socialMentions: number;
  userGeneratedContent: number;
  
  // Search Metrics
  searchImpressions: number;
  searchClickRate: number;
  searchRankingPosition: number;
}

/**
 * Competitive analysis metrics
 */
export interface CompetitiveMetrics {
  // Market Position
  marketShare: number;
  shareOfVoice: number;
  competitiveRank: number;
  
  // Price Comparison
  priceCompetitiveness: number; // -100 to 100
  pricePremium: number; // Percentage above/below average
  
  // Feature Comparison
  featureScore: number; // 1-10
  qualityScore: number; // 1-10
  valueScore: number;   // 1-10
  
  // Performance vs Competitors
  salesGrowthVsMarket: number;
  customerSatisfactionVsMarket: number;
  innovationScore: number;
}

/**
 * Forecasting and prediction data
 */
export interface ForecastingData {
  // Sales Forecasting
  predictedSales: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  
  // Rank Forecasting
  predictedRank: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  
  // Trend Forecasting
  trendPrediction: {
    direction: 'up' | 'down' | 'stable';
    strength: number; // 1-10
    duration: number; // days
    confidence: number;
  };
  
  // Seasonal Forecasting
  seasonalAdjustment: number;
  seasonalPeakPrediction?: {
    peakDate: Timestamp;
    peakValue: number;
    confidence: number;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for bestseller list
 */
export interface BestsellerListResponse {
  bestsellers: BestsellerProduct[];
  metadata: {
    totalCount: number;
    filteredCount: number;
    currentPage: number;
    totalPages: number;
    timePeriod: TimePeriod;
    lastUpdated: Timestamp;
  };
  filters: BestsellerFilters;
  sort: BestsellerSort;
}

/**
 * API response for bestseller details
 */
export interface BestsellerDetailsResponse {
  bestseller: BestsellerProduct;
  relatedBestsellers: BestsellerProduct[];
  analytics: BestsellerAnalytics;
  history: SalesHistoryPoint[];
  predictions: ForecastingData;
}

/**
 * API response for bestseller categories
 */
export interface BestsellerCategoriesResponse {
  categories: {
    categoryId: ID;
    categoryName: string;
    bestsellerCount: number;
    topProducts: BestsellerProduct[];
  }[];
}

// ============================================================================
// REAL-TIME AND LIVE DATA TYPES
// ============================================================================

/**
 * Real-time bestseller updates
 */
export interface BestsellerLiveUpdate {
  type: 'rank_change' | 'sales_milestone' | 'new_bestseller' | 'trend_change';
  productId: ID;
  timestamp: Timestamp;
  data: {
    oldValue?: unknown;
    newValue: unknown;
    change?: number;
    significance: 'minor' | 'major' | 'critical';
  };
  affectedMetrics: string[];
}

/**
 * Live dashboard data
 */
export interface BestsellerDashboard {
  // Current Status
  totalBestsellers: number;
  newThisWeek: number;
  trendingUp: number;
  trendingDown: number;
  
  // Real-time Updates
  liveUpdates: BestsellerLiveUpdate[];
  
  // Quick Stats
  topPerformer: BestsellerProduct;
  fastestRising: BestsellerProduct;
  longestStreak: BestsellerProduct;
  
  // Alerts
  alerts: {
    type: 'opportunity' | 'warning' | 'critical';
    message: string;
    productId?: ID;
    actionRequired: boolean;
  }[];
  
  // Performance Summary
  overallPerformance: {
    totalSales: number;
    totalRevenue: number;
    averageGrowth: number;
    marketHealth: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

// All types are exported inline
export default BestsellerProduct;

// Re-export coupon and deal types from payment.types for convenience
export type {
  Coupon,
  DiscountType,
  CouponCondition,
  ConditionType,
  CustomerEligibility,
  CouponUsageAnalytics,
  CouponUsage,
  Deal,
  DealType
} from './payment.types';

import { ID, Timestamp, Price, BaseEntity, PaginatedResponse } from './common.types';

// Import the types we need
import type { 
  DiscountType, 
  ConditionType, 
  Coupon,
  Deal,
  DealType,
  CustomerEligibility
} from './payment.types';

// Additional Coupon Management Types
export interface CouponForm {
  code: string;
  title: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maximumDiscount?: number;
  minimumOrderValue?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  isPublic: boolean;
  isAutomaticallyApplied: boolean;
  applicableProducts?: ID[];
  applicableCategories?: ID[];
  applicableBrands?: ID[];
  excludedProducts?: ID[];
  excludedCategories?: ID[];
  excludedBrands?: ID[];
  customerEligibility: CustomerEligibilityForm;
  conditions: CouponConditionForm[];
}

export interface CustomerEligibilityForm {
  type: 'all' | 'specific_customers' | 'customer_groups' | 'new_customers' | 'returning_customers';
  customerIds?: ID[];
  customerGroups?: string[];
  registrationDateFrom?: string;
  registrationDateTo?: string;
  totalSpentMin?: number;
  totalSpentMax?: number;
  orderCountMin?: number;
  orderCountMax?: number;
}

export interface CouponConditionForm {
  type: ConditionType;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between';
  value: string | number | string[] | number[];
  description: string;
}

export interface CouponFilters {
  status?: 'active' | 'inactive' | 'expired' | 'upcoming';
  discountType?: DiscountType[];
  isPublic?: boolean;
  isAutomaticallyApplied?: boolean;
  usageRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    from: Timestamp;
    to: Timestamp;
  };
  search?: string;
  sortBy?: 'created_at' | 'title' | 'usage_count' | 'discount_value' | 'expires_at';
  sortOrder?: 'asc' | 'desc';
}

export interface CouponListing {
  coupons: PaginatedResponse<Coupon>;
  filters: CouponFilterGroup[];
  summary: CouponSummary;
}

export interface CouponFilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'date';
  options: CouponFilterOption[];
  isCollapsed: boolean;
}

export interface CouponFilterOption {
  id: string;
  label: string;
  value: string | number;
  count: number;
  isSelected: boolean;
}

export interface CouponSummary {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalUsage: number;
  totalDiscountGiven: Price;
  averageDiscountPerUse: Price;
  topPerformingCoupons: Array<{
    couponId: ID;
    code: string;
    usage: number;
    discount: Price;
  }>;
}

export interface CouponValidation {
  isValid: boolean;
  coupon?: Coupon;
  errors: CouponValidationError[];
  warnings: CouponValidationWarning[];
  discountAmount?: Price;
  finalAmount?: Price;
}

export interface CouponValidationError {
  code: CouponErrorCode;
  message: string;
  field?: string;
}

export interface CouponValidationWarning {
  code: string;
  message: string;
}

export type CouponErrorCode = 
  | 'INVALID_CODE'
  | 'EXPIRED'
  | 'NOT_STARTED'
  | 'USAGE_LIMIT_EXCEEDED'
  | 'CUSTOMER_LIMIT_EXCEEDED'
  | 'MINIMUM_AMOUNT_NOT_MET'
  | 'INVALID_PRODUCTS'
  | 'INVALID_CUSTOMER'
  | 'ALREADY_APPLIED'
  | 'INACTIVE'
  | 'CONDITION_NOT_MET'
  | 'GEOGRAPHIC_RESTRICTION'
  | 'PAYMENT_METHOD_RESTRICTION'
  | 'CONFLICTING_PROMOTION';

// Deal Management Types
export interface DealForm {
  title: string;
  description?: string;
  shortDescription?: string;
  type: DealType;
  discountType: DiscountType;
  discountValue: number;
  originalPrice?: number;
  applicableProducts: ID[];
  featuredProductId?: ID;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  stockLimit?: number;
  limitPerCustomer?: number;
  badge?: string;
  urgencyText?: string;
  featuredImage?: File | string;
  bannerImage?: File | string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder?: number;
  promotionCode?: string;
}

export interface DealFilters {
  type?: DealType[];
  status?: 'active' | 'inactive' | 'expired' | 'upcoming';
  isPublished?: boolean;
  isFeatured?: boolean;
  hasStock?: boolean;
  discountRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    from: Timestamp;
    to: Timestamp;
  };
  search?: string;
  sortBy?: 'created_at' | 'title' | 'conversion_rate' | 'starts_at' | 'expires_at';
  sortOrder?: 'asc' | 'desc';
}

export interface DealListing {
  deals: PaginatedResponse<Deal>;
  filters: DealFilterGroup[];
  summary: DealSummary;
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

export interface DealSummary {
  totalDeals: number;
  activeDeals: number;
  expiredDeals: number;
  totalViews: number;
  totalConversions: number;
  averageConversionRate: number;
  totalRevenue: Price;
  topPerformingDeals: Array<{
    dealId: ID;
    title: string;
    views: number;
    conversions: number;
    revenue: Price;
  }>;
}

// Promotional Campaigns
export interface PromotionalCampaign extends BaseEntity {
  name: string;
  description?: string;
  
  // Campaign Details
  type: CampaignType;
  status: CampaignStatus;
  
  // Dates
  startsAt: Timestamp;
  expiresAt?: Timestamp;
  
  // Associated Promotions
  coupons: ID[];
  deals: ID[];
  
  // Targeting
  targetAudience: CampaignAudience;
  
  // Budget and Limits
  budget?: Price;
  spentAmount: Price;
  targetCustomers?: number;
  reachedCustomers: number;
  
  // Performance
  metrics: CampaignMetrics;
  
  // Marketing Channels
  channels: CampaignChannel[];
  
  // Creative Assets
  assets: CampaignAsset[];
}

export type CampaignType = 
  | 'seasonal'
  | 'product_launch'
  | 'flash_sale'
  | 'clearance'
  | 'loyalty'
  | 'retention'
  | 'acquisition'
  | 'cross_sell'
  | 'upsell'
  | 'win_back'
  | 'referral';

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface CampaignAudience {
  type: 'all' | 'segments' | 'custom';
  segments?: string[];
  customCriteria?: AudienceCriteria[];
  excludedCustomers?: ID[];
  estimatedReach: number;
}

export interface AudienceCriteria {
  field: 'age' | 'gender' | 'location' | 'order_history' | 'total_spent' | 'last_order_date' | 'customer_group';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between';
  value: string | number | string[] | number[];
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: Price;
  clickThroughRate: number;
  conversionRate: number;
  returnOnAdSpend: number;
  costPerAcquisition: Price;
  reachRate: number;
  engagementRate: number;
}

export interface CampaignChannel {
  type: 'email' | 'sms' | 'push' | 'social' | 'display' | 'search' | 'affiliate' | 'direct';
  isActive: boolean;
  budget?: Price;
  spent: Price;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: Price;
  };
}

export interface CampaignAsset {
  id: ID;
  type: 'banner' | 'email_template' | 'social_post' | 'ad_copy' | 'video' | 'landing_page';
  name: string;
  url?: string;
  content?: string;
  isActive: boolean;
  performance?: {
    views: number;
    clicks: number;
    conversions: number;
  };
}

// Loyalty and Rewards
export interface LoyaltyProgram extends BaseEntity {
  name: string;
  description?: string;
  
  // Program Configuration
  type: LoyaltyProgramType;
  status: 'active' | 'inactive' | 'coming_soon';
  
  // Points System
  pointsSystem: PointsSystem;
  
  // Tiers
  tiers: LoyaltyTier[];
  
  // Rewards
  rewards: LoyaltyReward[];
  
  // Rules
  earningRules: EarningRule[];
  redemptionRules: RedemptionRule[];
  
  // Member Stats
  totalMembers: number;
  activeMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
}

export type LoyaltyProgramType = 
  | 'points_based'
  | 'tier_based'
  | 'cashback'
  | 'subscription'
  | 'referral'
  | 'coalition';

export interface PointsSystem {
  pointName: string; // e.g., "VardPoints"
  pointValue: Price; // value of 1 point
  expiryPeriod?: number; // days
  minimumRedemption: number;
  maximumEarningPerDay?: number;
  roundingRule: 'round_down' | 'round_up' | 'round_nearest';
}

export interface LoyaltyTier {
  id: ID;
  name: string;
  description?: string;
  minimumPoints: number;
  minimumSpent: Price;
  benefits: TierBenefit[];
  upgradeBonus?: number; // bonus points on upgrade
  maintainancePeriod: number; // days to maintain tier
  isActive: boolean;
  sortOrder: number;
}

export interface TierBenefit {
  type: 'points_multiplier' | 'free_shipping' | 'exclusive_discounts' | 'early_access' | 'birthday_bonus' | 'priority_support';
  value: number | string;
  description: string;
}

export interface LoyaltyReward {
  id: ID;
  name: string;
  description?: string;
  type: RewardType;
  pointsCost: number;
  monetaryValue?: Price;
  availability: RewardAvailability;
  restrictions?: RewardRestriction[];
  isActive: boolean;
  sortOrder: number;
}

export type RewardType = 
  | 'discount_percentage'
  | 'discount_fixed'
  | 'free_product'
  | 'free_shipping'
  | 'gift_card'
  | 'experience'
  | 'merchandise'
  | 'charitable_donation';

export interface RewardAvailability {
  unlimited: boolean;
  totalQuantity?: number;
  remainingQuantity?: number;
  limitPerMember?: number;
  validFrom?: Timestamp;
  validUntil?: Timestamp;
}

export interface RewardRestriction {
  type: 'minimum_order' | 'specific_products' | 'specific_categories' | 'tier_required' | 'geographic';
  value: string | number | string[];
  description: string;
}

export interface EarningRule {
  id: ID;
  name: string;
  activity: EarningActivity;
  pointsPerUnit: number;
  maximumPerDay?: number;
  isActive: boolean;
  conditions?: EarningCondition[];
}

export type EarningActivity = 
  | 'purchase'
  | 'signup'
  | 'referral'
  | 'review'
  | 'social_share'
  | 'birthday'
  | 'anniversary'
  | 'survey'
  | 'check_in'
  | 'engagement';

export interface EarningCondition {
  field: string;
  operator: string;
  value: string | number;
}

export interface RedemptionRule {
  id: ID;
  name: string;
  minimumPoints: number;
  maximumPoints?: number;
  allowPartialRedemption: boolean;
  isActive: boolean;
  restrictions?: string[];
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface CouponTypeUsage {
  customerEligibility: CustomerEligibility;
}

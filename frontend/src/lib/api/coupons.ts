import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse, PaginationParams, User, Product } from './types';

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping' | 'cashback';
  value: number;
  currency?: string;
  
  // Discount Configuration
  discountConfig: {
    percentage?: number;
    fixedAmount?: number;
    maxDiscount?: number;
    minOrderValue?: number;
    buyQuantity?: number;
    getQuantity?: number;
    getFreeProduct?: string;
    shippingDiscount?: number;
    cashbackPercentage?: number;
  };
  
  // Usage Limits
  usageLimit: {
    totalUsageLimit?: number;
    usagePerUser?: number;
    usagePerDay?: number;
    usagePerMonth?: number;
    usageCount: number;
    userUsageCount: Record<string, number>;
  };
  
  // Validity Period
  validity: {
    startDate: string;
    endDate?: string;
    timezone: string;
    isActive: boolean;
    scheduledActivation?: string;
    scheduledDeactivation?: string;
  };
  
  // Conditions
  conditions: {
    minOrderValue?: number;
    maxOrderValue?: number;
    applicableProducts?: string[];
    excludedProducts?: string[];
    applicableCategories?: string[];
    excludedCategories?: string[];
    applicableBrands?: string[];
    excludedBrands?: string[];
    newCustomersOnly?: boolean;
    firstOrderOnly?: boolean;
    specificUsers?: string[];
    userGroups?: string[];
    locations?: string[];
    excludedLocations?: string[];
    dayOfWeek?: string[];
    timeOfDay?: {
      start: string;
      end: string;
    };
  };
  
  // Stacking Rules
  stacking: {
    canStackWithOthers: boolean;
    stackingPriority: number;
    conflictingCoupons?: string[];
    requiredCoupons?: string[];
  };
  
  // Auto-application
  autoApplication: {
    enabled: boolean;
    triggerConditions?: {
      cartValue?: number;
      productQuantity?: number;
      categoryItems?: string[];
      userSegment?: string;
    };
    priority: number;
  };
  
  // Analytics
  analytics: {
    totalUsage: number;
    totalDiscount: number;
    conversionRate: number;
    averageOrderValue: number;
    revenueImpact: number;
    popularProducts: string[];
    usageByLocation: Record<string, number>;
    usageByTimeOfDay: Record<string, number>;
  };
  
  // Metadata
  tags: string[];
  category: string;
  source: 'manual' | 'campaign' | 'automated' | 'imported';
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  
  // Status
  status: 'draft' | 'active' | 'paused' | 'expired' | 'disabled';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed_amount';
  finalPrice?: number;
  errors: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  warnings: Array<{
    code: string;
    message: string;
  }>;
  applicableItems?: Array<{
    productId: string;
    discountAmount: number;
  }>;
  suggestedCoupons?: Coupon[];
}

export interface CouponUsage {
  id: string;
  couponId: string;
  coupon: Coupon;
  userId?: string;
  user?: User;
  orderId?: string;
  cartId?: string;
  discountAmount: number;
  originalOrderValue: number;
  finalOrderValue: number;
  products: Array<{
    productId: string;
    product: Product;
    quantity: number;
    originalPrice: number;
    discountedPrice: number;
  }>;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country: string;
    state: string;
    city: string;
  };
  usedAt: string;
  refundedAt?: string;
  refundAmount?: number;
}

export interface CouponCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'promotional' | 'seasonal' | 'loyalty' | 'referral' | 'retention';
  
  coupons: string[]; // Coupon IDs
  
  // Campaign Settings
  settings: {
    distributionMethod: 'email' | 'sms' | 'website' | 'social' | 'app_notification';
    targetAudience: {
      userSegments?: string[];
      specificUsers?: string[];
      newCustomers?: boolean;
      inactiveCustomers?: boolean;
      highValueCustomers?: boolean;
      locations?: string[];
    };
    personalizedCoupons: boolean;
    uniqueCodesPerUser: boolean;
    autoApply: boolean;
  };
  
  // Distribution Schedule
  schedule: {
    startDate: string;
    endDate?: string;
    sendImmediately: boolean;
    scheduledSendTime?: string;
    reminderSchedule?: string[];
  };
  
  // Performance Tracking
  performance: {
    totalSent: number;
    totalOpened: number;
    totalUsed: number;
    totalRevenue: number;
    conversionRate: number;
    clickThroughRate: number;
    redemptionRate: number;
  };
  
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CouponStats {
  overview: {
    totalCoupons: number;
    activeCoupons: number;
    totalUsage: number;
    totalDiscount: number;
    averageDiscountPerOrder: number;
    conversionRate: number;
  };
  
  // Performance by Type
  typePerformance: Array<{
    type: string;
    count: number;
    usage: number;
    discount: number;
    conversionRate: number;
  }>;
  
  // Top Performing Coupons
  topCoupons: Array<{
    coupon: Coupon;
    usage: number;
    discount: number;
    revenue: number;
    conversionRate: number;
  }>;
  
  // Usage Trends
  usageTrends: Array<{
    date: string;
    usage: number;
    discount: number;
    orders: number;
  }>;
  
  // Geographic Distribution
  geographicUsage: Array<{
    location: string;
    usage: number;
    discount: number;
    averageOrderValue: number;
  }>;
  
  // Time-based Analysis
  timeAnalysis: {
    hourlyUsage: Record<string, number>;
    dailyUsage: Record<string, number>;
    monthlyUsage: Record<string, number>;
  };
  
  // Revenue Impact
  revenueImpact: {
    totalRevenue: number;
    revenueWithoutCoupons: number;
    incrementalRevenue: number;
    discountToRevenueRatio: number;
  };
}

class CouponsApiClient {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Public Coupon Operations
  async getActiveCoupons(params?: {
    category?: string;
    type?: string;
    minOrderValue?: number;
  }): Promise<ApiResponse<Coupon[]>> {
    return this.client.get(endpoints.coupons.active, { params });
  }

  async validateCoupon(data: {
    code: string;
    cartValue?: number;
    userId?: string;
    cartItems?: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<ApiResponse<CouponValidationResult>> {
    return this.client.post(endpoints.coupons.validate, data);
  }

  async applyCoupon(data: {
    code: string;
    cartId?: string;
    userId?: string;
    cartValue?: number;
    cartItems?: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<ApiResponse<{
    applied: boolean;
    coupon: Coupon;
    discountAmount: number;
    finalTotal: number;
    breakdown: Array<{
      productId: string;
      originalPrice: number;
      discountedPrice: number;
      discountAmount: number;
    }>;
  }>> {
    return this.client.post(endpoints.coupons.apply, data);
  }

  async getCouponByCode(code: string): Promise<ApiResponse<{
    coupon: Coupon;
    isApplicable: boolean;
    requirements: string[];
  }>> {
    return this.client.get(endpoints.coupons.byCode(code));
  }

  async getUserCoupons(params?: PaginationParams & {
    status?: 'available' | 'used' | 'expired';
    type?: string;
  }): Promise<ApiResponse<{
    coupons: Array<{
      coupon: Coupon;
      userSpecific: {
        usageCount: number;
        lastUsed?: string;
        canUse: boolean;
        expiresAt?: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return this.client.get(endpoints.coupons.user, { params });
  }

  async checkAutoApplicableCoupons(data: {
    cartValue: number;
    cartItems: Array<{
      productId: string;
      quantity: number;
      price: number;
      categoryId?: string;
    }>;
    userId?: string;
  }): Promise<ApiResponse<{
    applicableCoupons: Array<{
      coupon: Coupon;
      discountAmount: number;
      priority: number;
      autoApply: boolean;
    }>;
    bestCoupon?: Coupon;
    totalSavings: number;
  }>> {
    return this.client.post(endpoints.coupons.autoApplicable, data);
  }

  // Coupon Discovery
  async discoverCoupons(data: {
    cartValue?: number;
    productIds?: string[];
    categoryIds?: string[];
    userId?: string;
  }): Promise<ApiResponse<{
    recommendedCoupons: Coupon[];
    trendingCoupons: Coupon[];
    personalizedCoupons: Coupon[];
    seasonalCoupons: Coupon[];
  }>> {
    return this.client.post(endpoints.coupons.discover, data);
  }

  async getSimilarCoupons(couponId: string): Promise<ApiResponse<Coupon[]>> {
    return this.client.get(endpoints.coupons.similar(couponId));
  }

  // Admin Operations
  async getCoupons(params?: PaginationParams & {
    status?: string;
    type?: string;
    category?: string;
    createdBy?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: 'name' | 'usage' | 'discount' | 'created' | 'expires';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    coupons: Coupon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      statuses: Array<{ value: string; count: number }>;
      types: Array<{ value: string; count: number }>;
      categories: Array<{ value: string; count: number }>;
    };
  }>> {
    return this.client.get(endpoints.coupons.admin.list, { params });
  }

  async getCoupon(id: string): Promise<ApiResponse<{
    coupon: Coupon;
    usageHistory: CouponUsage[];
    analytics: {
      totalUsage: number;
      totalDiscount: number;
      conversionRate: number;
      topProducts: Product[];
      usageTrends: Array<{
        date: string;
        usage: number;
        discount: number;
      }>;
    };
  }>> {
    return this.client.get(endpoints.coupons.admin.byId(id));
  }

  async createCoupon(data: {
    name: string;
    code?: string;
    description?: string;
    type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping' | 'cashback';
    value: number;
    discountConfig: Partial<Coupon['discountConfig']>;
    usageLimit?: Partial<Coupon['usageLimit']>;
    validity: {
      startDate: string;
      endDate?: string;
      timezone?: string;
    };
    conditions?: Partial<Coupon['conditions']>;
    stacking?: Partial<Coupon['stacking']>;
    autoApplication?: Partial<Coupon['autoApplication']>;
    tags?: string[];
    category?: string;
  }): Promise<ApiResponse<Coupon>> {
    return this.client.post(endpoints.coupons.admin.create, data);
  }

  async updateCoupon(id: string, data: Partial<{
    name: string;
    description: string;
    discountConfig: Partial<Coupon['discountConfig']>;
    usageLimit: Partial<Coupon['usageLimit']>;
    validity: Partial<Coupon['validity']>;
    conditions: Partial<Coupon['conditions']>;
    stacking: Partial<Coupon['stacking']>;
    autoApplication: Partial<Coupon['autoApplication']>;
    tags: string[];
    category: string;
    status: Coupon['status'];
  }>): Promise<ApiResponse<Coupon>> {
    return this.client.put(endpoints.coupons.admin.update(id), data);
  }

  async deleteCoupon(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.coupons.admin.delete(id));
  }

  async duplicateCoupon(id: string, data?: {
    newCode?: string;
    newName?: string;
    resetUsage?: boolean;
  }): Promise<ApiResponse<Coupon>> {
    return this.client.post(endpoints.coupons.admin.duplicate(id), data);
  }

  async bulkUpdateCoupons(data: {
    couponIds: string[];
    updates: {
      status?: Coupon['status'];
      validity?: Partial<Coupon['validity']>;
      usageLimit?: Partial<Coupon['usageLimit']>;
      tags?: string[];
    };
  }): Promise<ApiResponse<{
    updated: number;
    failed: Array<{
      id: string;
      error: string;
    }>;
  }>> {
    return this.client.patch(endpoints.coupons.admin.bulkUpdate, data);
  }

  async bulkDeleteCoupons(couponIds: string[]): Promise<ApiResponse<{
    deleted: number;
    failed: Array<{
      id: string;
      error: string;
    }>;
  }>> {
    return this.client.delete(endpoints.coupons.admin.bulkDelete, {
      data: { couponIds }
    });
  }

  // Bulk Coupon Generation
  async generateBulkCoupons(data: {
    nameTemplate: string;
    codeTemplate: string;
    count: number;
    type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping' | 'cashback';
    value: number;
    discountConfig: Partial<Coupon['discountConfig']>;
    usageLimit?: Partial<Coupon['usageLimit']>;
    validity: {
      startDate: string;
      endDate?: string;
      timezone?: string;
    };
    conditions?: Partial<Coupon['conditions']>;
    tags?: string[];
    category?: string;
  }): Promise<ApiResponse<{
    coupons: Coupon[];
    codes: string[];
    failed: Array<{
      index: number;
      error: string;
    }>;
  }>> {
    return this.client.post(endpoints.coupons.admin.bulkGenerate, data);
  }

  async importCoupons(file: File, options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
  }): Promise<ApiResponse<{
    imported: number;
    updated: number;
    skipped: number;
    failed: Array<{
      row: number;
      error: string;
    }>;
    preview?: Coupon[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.client.post(endpoints.coupons.admin.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async exportCoupons(params?: {
    format: 'csv' | 'xlsx' | 'json';
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    includeUsage?: boolean;
  }): Promise<ApiResponse<Blob>> {
    return this.client.get(endpoints.coupons.admin.export, {
      params,
      responseType: 'blob',
    });
  }

  // Coupon Usage Tracking
  async getCouponUsage(id: string, params?: PaginationParams & {
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  }): Promise<ApiResponse<{
    usage: CouponUsage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalUsage: number;
      totalDiscount: number;
      uniqueUsers: number;
      averageOrderValue: number;
    };
  }>> {
    return this.client.get(endpoints.coupons.admin.usage(id), { params });
  }

  async getCouponAnalytics(id: string, params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<{
    overview: {
      totalUsage: number;
      totalDiscount: number;
      uniqueUsers: number;
      conversionRate: number;
      averageOrderValue: number;
      revenueImpact: number;
    };
    trends: Array<{
      period: string;
      usage: number;
      discount: number;
      orders: number;
      revenue: number;
    }>;
    demographics: {
      userSegments: Record<string, number>;
      locations: Record<string, number>;
      devices: Record<string, number>;
    };
    productPerformance: Array<{
      product: Product;
      usage: number;
      discount: number;
      revenue: number;
    }>;
  }>> {
    return this.client.get(endpoints.coupons.admin.analytics(id), { params });
  }

  // Campaign Management
  async getCampaigns(params?: PaginationParams & {
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    campaigns: CouponCampaign[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return this.client.get(endpoints.coupons.admin.campaigns.list, { params });
  }

  async createCampaign(data: {
    name: string;
    description?: string;
    type: CouponCampaign['type'];
    coupons: string[];
    settings: CouponCampaign['settings'];
    schedule: CouponCampaign['schedule'];
  }): Promise<ApiResponse<CouponCampaign>> {
    return this.client.post(endpoints.coupons.admin.campaigns.create, data);
  }

  async updateCampaign(id: string, data: Partial<{
    name: string;
    description: string;
    coupons: string[];
    settings: CouponCampaign['settings'];
    schedule: CouponCampaign['schedule'];
    status: CouponCampaign['status'];
  }>): Promise<ApiResponse<CouponCampaign>> {
    return this.client.put(endpoints.coupons.admin.campaigns.update(id), data);
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.coupons.admin.campaigns.delete(id));
  }

  async launchCampaign(id: string): Promise<ApiResponse<{
    launched: boolean;
    sent: number;
    scheduled: number;
    failed: number;
  }>> {
    return this.client.post(endpoints.coupons.admin.campaigns.launch(id));
  }

  async getCampaignAnalytics(id: string): Promise<ApiResponse<{
    performance: CouponCampaign['performance'];
    detailedMetrics: {
      opensByDay: Record<string, number>;
      usageByDay: Record<string, number>;
      revenueByDay: Record<string, number>;
      topPerformingCoupons: Array<{
        coupon: Coupon;
        usage: number;
        revenue: number;
      }>;
    };
  }>> {
    return this.client.get(endpoints.coupons.admin.campaigns.analytics(id));
  }

  // Statistics and Reporting
  async getCouponStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
    type?: string;
    category?: string;
  }): Promise<ApiResponse<CouponStats>> {
    return this.client.get(endpoints.coupons.admin.stats, { params });
  }

  async getCouponPerformanceReport(params?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    sortBy?: 'usage' | 'discount' | 'revenue' | 'conversion';
  }): Promise<ApiResponse<{
    topPerformers: Array<{
      coupon: Coupon;
      metrics: {
        usage: number;
        discount: number;
        revenue: number;
        conversionRate: number;
        roi: number;
      };
    }>;
    underPerformers: Array<{
      coupon: Coupon;
      issues: string[];
      suggestions: string[];
    }>;
    insights: {
      bestPerformingType: string;
      optimalDiscountRange: { min: number; max: number };
      peakUsageHours: string[];
      seasonalTrends: Record<string, number>;
    };
  }>> {
    return this.client.get(endpoints.coupons.admin.performanceReport, { params });
  }

  // Coupon Code Generation
  async generateCouponCode(options?: {
    length?: number;
    prefix?: string;
    suffix?: string;
    includeNumbers?: boolean;
    includeLetters?: boolean;
    includeSpecialChars?: boolean;
    avoidConfusingChars?: boolean;
  }): Promise<ApiResponse<{
    code: string;
    isUnique: boolean;
  }>> {
    return this.client.post(endpoints.coupons.admin.generateCode, options);
  }

  async validateCouponCode(code: string): Promise<ApiResponse<{
    isValid: boolean;
    isUnique: boolean;
    suggestions?: string[];
    issues?: string[];
  }>> {
    return this.client.post(endpoints.coupons.admin.validateCode, { code });
  }

  // A/B Testing
  async createCouponTest(data: {
    name: string;
    description?: string;
    variants: Array<{
      name: string;
      couponId: string;
      trafficPercentage: number;
    }>;
    duration: number; // days
    goals: Array<{
      metric: 'usage' | 'conversion' | 'revenue' | 'retention';
      target: number;
    }>;
    audience: {
      userSegments?: string[];
      locations?: string[];
      newCustomersOnly?: boolean;
    };
  }): Promise<ApiResponse<{
    testId: string;
    status: 'draft' | 'running' | 'completed';
    startDate: string;
    endDate: string;
  }>> {
    return this.client.post(endpoints.coupons.admin.abTest.create, data);
  }

  async getCouponTestResults(testId: string): Promise<ApiResponse<{
    test: {
      id: string;
      name: string;
      status: string;
      startDate: string;
      endDate: string;
    };
    results: Array<{
      variant: string;
      coupon: Coupon;
      metrics: {
        impressions: number;
        usage: number;
        conversionRate: number;
        revenue: number;
        averageOrderValue: number;
      };
      performance: 'winner' | 'loser' | 'neutral';
      confidenceLevel: number;
    }>;
    insights: {
      winner: string;
      improvementPercentage: number;
      significance: number;
      recommendations: string[];
    };
  }>> {
    return this.client.get(endpoints.coupons.admin.abTest.results(testId));
  }
}

export const couponsApi = new CouponsApiClient();

// React Query Hooks

// Public Coupon Hooks
export const useActiveCoupons = (
  params?: {
    category?: string;
    type?: string;
    minOrderValue?: number;
  },
  options?: UseQueryOptions<ApiResponse<Coupon[]>>
) => {
  return useQuery({
    queryKey: ['active-coupons', params],
    queryFn: () => couponsApi.getActiveCoupons(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: (data: {
      code: string;
      cartValue?: number;
      userId?: string;
      cartItems?: Array<{
        productId: string;
        quantity: number;
        price: number;
      }>;
    }) => couponsApi.validateCoupon(data),
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      code: string;
      cartId?: string;
      userId?: string;
      cartValue?: number;
      cartItems?: Array<{
        productId: string;
        quantity: number;
        price: number;
      }>;
    }) => couponsApi.applyCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCouponByCode = (
  code: string,
  options?: UseQueryOptions<ApiResponse<{
    coupon: Coupon;
    isApplicable: boolean;
    requirements: string[];
  }>>
) => {
  return useQuery({
    queryKey: ['coupon-by-code', code],
    queryFn: () => couponsApi.getCouponByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useUserCoupons = (
  params?: PaginationParams & {
    status?: 'available' | 'used' | 'expired';
    type?: string;
  },
  options?: UseQueryOptions<ApiResponse<{
    coupons: Array<{
      coupon: Coupon;
      userSpecific: {
        usageCount: number;
        lastUsed?: string;
        canUse: boolean;
        expiresAt?: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['user-coupons', params],
    queryFn: () => couponsApi.getUserCoupons(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useCheckAutoApplicableCoupons = () => {
  return useMutation({
    mutationFn: (data: {
      cartValue: number;
      cartItems: Array<{
        productId: string;
        quantity: number;
        price: number;
        categoryId?: string;
      }>;
      userId?: string;
    }) => couponsApi.checkAutoApplicableCoupons(data),
  });
};

export const useDiscoverCoupons = () => {
  return useMutation({
    mutationFn: (data: {
      cartValue?: number;
      productIds?: string[];
      categoryIds?: string[];
      userId?: string;
    }) => couponsApi.discoverCoupons(data),
  });
};

export const useSimilarCoupons = (
  couponId: string,
  options?: UseQueryOptions<ApiResponse<Coupon[]>>
) => {
  return useQuery({
    queryKey: ['similar-coupons', couponId],
    queryFn: () => couponsApi.getSimilarCoupons(couponId),
    enabled: !!couponId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

// Admin Coupon Hooks
export const useCoupons = (
  params?: PaginationParams & {
    status?: string;
    type?: string;
    category?: string;
    createdBy?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: 'name' | 'usage' | 'discount' | 'created' | 'expires';
    sortOrder?: 'asc' | 'desc';
  },
  options?: UseQueryOptions<ApiResponse<{
    coupons: Coupon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      statuses: Array<{ value: string; count: number }>;
      types: Array<{ value: string; count: number }>;
      categories: Array<{ value: string; count: number }>;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: () => couponsApi.getCoupons(params),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

export const useCoupon = (
  id: string,
  options?: UseQueryOptions<ApiResponse<{
    coupon: Coupon;
    usageHistory: CouponUsage[];
    analytics: {
      totalUsage: number;
      totalDiscount: number;
      conversionRate: number;
      topProducts: Product[];
      usageTrends: Array<{
        date: string;
        usage: number;
        discount: number;
      }>;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: () => couponsApi.getCoupon(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      code?: string;
      description?: string;
      type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping' | 'cashback';
      value: number;
      discountConfig: Partial<Coupon['discountConfig']>;
      usageLimit?: Partial<Coupon['usageLimit']>;
      validity: {
        startDate: string;
        endDate?: string;
        timezone?: string;
      };
      conditions?: Partial<Coupon['conditions']>;
      stacking?: Partial<Coupon['stacking']>;
      autoApplication?: Partial<Coupon['autoApplication']>;
      tags?: string[];
      category?: string;
    }) => couponsApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<{
        name: string;
        description: string;
        discountConfig: Partial<Coupon['discountConfig']>;
        usageLimit: Partial<Coupon['usageLimit']>;
        validity: Partial<Coupon['validity']>;
        conditions: Partial<Coupon['conditions']>;
        stacking: Partial<Coupon['stacking']>;
        autoApplication: Partial<Coupon['autoApplication']>;
        tags: string[];
        category: string;
        status: Coupon['status'];
      }>
    }) => couponsApi.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon'] });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => couponsApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useDuplicateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data?: {
        newCode?: string;
        newName?: string;
        resetUsage?: boolean;
      }
    }) => couponsApi.duplicateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useBulkUpdateCoupons = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      couponIds: string[];
      updates: {
        status?: Coupon['status'];
        validity?: Partial<Coupon['validity']>;
        usageLimit?: Partial<Coupon['usageLimit']>;
        tags?: string[];
      };
    }) => couponsApi.bulkUpdateCoupons(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useBulkDeleteCoupons = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (couponIds: string[]) => couponsApi.bulkDeleteCoupons(couponIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

// Bulk Operations Hooks
export const useGenerateBulkCoupons = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      nameTemplate: string;
      codeTemplate: string;
      count: number;
      type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping' | 'cashback';
      value: number;
      discountConfig: Partial<Coupon['discountConfig']>;
      usageLimit?: Partial<Coupon['usageLimit']>;
      validity: {
        startDate: string;
        endDate?: string;
        timezone?: string;
      };
      conditions?: Partial<Coupon['conditions']>;
      tags?: string[];
      category?: string;
    }) => couponsApi.generateBulkCoupons(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useImportCoupons = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: { 
      file: File; 
      options?: {
        skipDuplicates?: boolean;
        updateExisting?: boolean;
        validateOnly?: boolean;
      }
    }) => couponsApi.importCoupons(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useExportCoupons = () => {
  return useMutation({
    mutationFn: (params?: {
      format: 'csv' | 'xlsx' | 'json';
      status?: string;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
      includeUsage?: boolean;
    }) => couponsApi.exportCoupons(params),
  });
};

// Usage and Analytics Hooks
export const useCouponUsage = (
  id: string,
  params?: PaginationParams & {
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  },
  options?: UseQueryOptions<ApiResponse<{
    usage: CouponUsage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalUsage: number;
      totalDiscount: number;
      uniqueUsers: number;
      averageOrderValue: number;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['coupon-usage', id, params],
    queryFn: () => couponsApi.getCouponUsage(id, params),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

export const useCouponAnalytics = (
  id: string,
  params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  },
  options?: UseQueryOptions<ApiResponse<{
    overview: {
      totalUsage: number;
      totalDiscount: number;
      uniqueUsers: number;
      conversionRate: number;
      averageOrderValue: number;
      revenueImpact: number;
    };
    trends: Array<{
      period: string;
      usage: number;
      discount: number;
      orders: number;
      revenue: number;
    }>;
    demographics: {
      userSegments: Record<string, number>;
      locations: Record<string, number>;
      devices: Record<string, number>;
    };
    productPerformance: Array<{
      product: Product;
      usage: number;
      discount: number;
      revenue: number;
    }>;
  }>>
) => {
  return useQuery({
    queryKey: ['coupon-analytics', id, params],
    queryFn: () => couponsApi.getCouponAnalytics(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Campaign Hooks
export const useCouponCampaigns = (
  params?: PaginationParams & {
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  options?: UseQueryOptions<ApiResponse<{
    campaigns: CouponCampaign[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['coupon-campaigns', params],
    queryFn: () => couponsApi.getCampaigns(params),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

export const useCreateCouponCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      type: CouponCampaign['type'];
      coupons: string[];
      settings: CouponCampaign['settings'];
      schedule: CouponCampaign['schedule'];
    }) => couponsApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-campaigns'] });
    },
  });
};

export const useUpdateCouponCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<{
        name: string;
        description: string;
        coupons: string[];
        settings: CouponCampaign['settings'];
        schedule: CouponCampaign['schedule'];
        status: CouponCampaign['status'];
      }>
    }) => couponsApi.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-campaigns'] });
    },
  });
};

export const useDeleteCouponCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => couponsApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-campaigns'] });
    },
  });
};

export const useLaunchCouponCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => couponsApi.launchCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-campaigns'] });
    },
  });
};

export const useCouponCampaignAnalytics = (
  id: string,
  options?: UseQueryOptions<ApiResponse<{
    performance: CouponCampaign['performance'];
    detailedMetrics: {
      opensByDay: Record<string, number>;
      usageByDay: Record<string, number>;
      revenueByDay: Record<string, number>;
      topPerformingCoupons: Array<{
        coupon: Coupon;
        usage: number;
        revenue: number;
      }>;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['coupon-campaign-analytics', id],
    queryFn: () => couponsApi.getCampaignAnalytics(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Statistics Hooks
export const useCouponStats = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
    type?: string;
    category?: string;
  },
  options?: UseQueryOptions<ApiResponse<CouponStats>>
) => {
  return useQuery({
    queryKey: ['coupon-stats', params],
    queryFn: () => couponsApi.getCouponStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useCouponPerformanceReport = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    sortBy?: 'usage' | 'discount' | 'revenue' | 'conversion';
  },
  options?: UseQueryOptions<ApiResponse<{
    topPerformers: Array<{
      coupon: Coupon;
      metrics: {
        usage: number;
        discount: number;
        revenue: number;
        conversionRate: number;
        roi: number;
      };
    }>;
    underPerformers: Array<{
      coupon: Coupon;
      issues: string[];
      suggestions: string[];
    }>;
    insights: {
      bestPerformingType: string;
      optimalDiscountRange: { min: number; max: number };
      peakUsageHours: string[];
      seasonalTrends: Record<string, number>;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['coupon-performance-report', params],
    queryFn: () => couponsApi.getCouponPerformanceReport(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

// Code Generation Hooks
export const useGenerateCouponCode = () => {
  return useMutation({
    mutationFn: (options?: {
      length?: number;
      prefix?: string;
      suffix?: string;
      includeNumbers?: boolean;
      includeLetters?: boolean;
      includeSpecialChars?: boolean;
      avoidConfusingChars?: boolean;
    }) => couponsApi.generateCouponCode(options),
  });
};

export const useValidateCouponCode = () => {
  return useMutation({
    mutationFn: (code: string) => couponsApi.validateCouponCode(code),
  });
};

// A/B Testing Hooks
export const useCreateCouponTest = () => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      variants: Array<{
        name: string;
        couponId: string;
        trafficPercentage: number;
      }>;
      duration: number;
      goals: Array<{
        metric: 'usage' | 'conversion' | 'revenue' | 'retention';
        target: number;
      }>;
      audience: {
        userSegments?: string[];
        locations?: string[];
        newCustomersOnly?: boolean;
      };
    }) => couponsApi.createCouponTest(data),
  });
};

export const useCouponTestResults = (
  testId: string,
  options?: UseQueryOptions<ApiResponse<{
    test: {
      id: string;
      name: string;
      status: string;
      startDate: string;
      endDate: string;
    };
    results: Array<{
      variant: string;
      coupon: Coupon;
      metrics: {
        impressions: number;
        usage: number;
        conversionRate: number;
        revenue: number;
        averageOrderValue: number;
      };
      performance: 'winner' | 'loser' | 'neutral';
      confidenceLevel: number;
    }>;
    insights: {
      winner: string;
      improvementPercentage: number;
      significance: number;
      recommendations: string[];
    };
  }>>
) => {
  return useQuery({
    queryKey: ['coupon-test-results', testId],
    queryFn: () => couponsApi.getCouponTestResults(testId),
    enabled: !!testId,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

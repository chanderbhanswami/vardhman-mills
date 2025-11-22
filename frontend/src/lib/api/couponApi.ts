import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * Coupon API Service
 * Handles promotional codes, discounts, and coupon management
 */

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  status: 'active' | 'inactive' | 'expired' | 'scheduled' | 'draft';
  
  // Discount settings
  discount: {
    value: number; // percentage (0-100) or fixed amount
    maxAmount?: number; // max discount amount for percentage coupons
    minOrderAmount?: number; // minimum order amount to apply
    applyTo: 'order' | 'products' | 'shipping' | 'tax';
  };
  
  // BOGO settings (Buy X Get Y)
  bogo?: {
    buyQuantity: number;
    getQuantity: number;
    getDiscount: number; // percentage discount on free items
    maxApplications?: number;
  };
  
  // Usage limits
  usage: {
    totalLimit?: number; // total usage limit
    perUserLimit?: number; // limit per user
    perDayLimit?: number; // limit per day
    used: number; // current usage count
    userUsage: Record<string, number>; // user-specific usage tracking
  };
  
  // Validity period
  validity: {
    startDate: string;
    endDate?: string;
    timezone: string;
    activeHours?: {
      start: string; // HH:MM format
      end: string; // HH:MM format
      days: number[]; // 0-6 (Sunday-Saturday)
    };
  };
  
  // Target criteria
  targeting: {
    userSegments?: Array<{
      type: 'new_customers' | 'returning_customers' | 'vip' | 'inactive' | 'high_value' | 'custom';
      criteria?: Record<string, unknown>;
    }>;
    products?: Array<{
      type: 'include' | 'exclude';
      productIds?: string[];
      categoryIds?: string[];
      brandIds?: string[];
      tags?: string[];
      priceRange?: {
        min: number;
        max: number;
      };
    }>;
    locations?: {
      countries?: string[];
      states?: string[];
      cities?: string[];
      zipcodes?: string[];
    };
    channels?: ('web' | 'mobile' | 'api' | 'pos')[];
  };
  
  // Stackability
  stacking: {
    allowStacking: boolean;
    stackableWith?: string[]; // coupon IDs that can be stacked
    priority: number; // higher priority applied first
    maxStackCount?: number;
  };
  
  // Auto-application
  autoApply: {
    enabled: boolean;
    conditions?: Array<{
      type: 'cart_amount' | 'product_quantity' | 'user_segment' | 'first_order';
      value?: string | number;
    }>;
  };
  
  // Analytics
  analytics: {
    views: number;
    applications: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    discountGiven: number;
    averageOrderValue: number;
    topProducts: Array<{
      productId: string;
      applications: number;
      revenue: number;
    }>;
  };
  
  // Distribution
  distribution: {
    method: 'public' | 'private' | 'email' | 'sms' | 'social' | 'referral';
    channels: Array<{
      type: 'email' | 'sms' | 'push' | 'social' | 'banner' | 'popup';
      settings: Record<string, unknown>;
    }>;
    referralSettings?: {
      referrerReward: {
        type: 'percentage' | 'fixed_amount';
        value: number;
      };
      refereeReward: {
        type: 'percentage' | 'fixed_amount';
        value: number;
      };
    };
  };
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  orderAmount: number;
  usedAt: string;
  
  coupon: {
    code: string;
    title: string;
    type: string;
  };
  
  user: {
    id: string;
    email: string;
    name: string;
  };
  
  order: {
    id: string;
    total: number;
    status: string;
  };
}

interface CouponValidation {
  isValid: boolean;
  reason?: string;
  discount: {
    amount: number;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    maxAmount?: number;
  };
  applicableProducts?: Array<{
    productId: string;
    discountAmount: number;
  }>;
  restrictions?: {
    minOrderAmount?: number;
    maxUsage?: number;
    remainingUsage?: number;
    validUntil?: string;
  };
}

interface CouponTemplate {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  defaultSettings: {
    discount: Coupon['discount'];
    usage: Partial<Coupon['usage']>;
    validity: Partial<Coupon['validity']>;
    targeting: Partial<Coupon['targeting']>;
  };
  category: 'welcome' | 'seasonal' | 'loyalty' | 'winback' | 'flash_sale' | 'referral' | 'custom';
  previewImage?: string;
  isPopular: boolean;
  createdAt: string;
}

interface CouponAnalytics {
  couponId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    views: number;
    applications: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    discountGiven: number;
    averageOrderValue: number;
    roi: number; // return on investment
    customerAcquisition: number;
    repeatPurchases: number;
  };
  performance: {
    byChannel: Record<string, {
      applications: number;
      conversions: number;
      revenue: number;
    }>;
    byDevice: Record<string, number>;
    byLocation: Record<string, number>;
    byUserSegment: Record<string, number>;
  };
  trends: Array<{
    date: string;
    applications: number;
    conversions: number;
    revenue: number;
    discountGiven: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    applications: number;
    totalDiscount: number;
    totalRevenue: number;
  }>;
}

class CouponApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Coupon Management

  // Get coupons
  async getCoupons(params?: SearchParams & PaginationParams & {
    type?: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
    status?: 'active' | 'inactive' | 'expired' | 'scheduled' | 'draft';
    sortBy?: 'code' | 'created' | 'updated' | 'usage' | 'expiry';
    sortOrder?: 'asc' | 'desc';
    category?: 'welcome' | 'seasonal' | 'loyalty' | 'winback' | 'flash_sale' | 'referral';
  }): Promise<ApiResponse<Coupon[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.type && { type: params.type }),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      ...(params?.category && { category: params.category }),
    };
    
    return this.client.get<Coupon[]>(endpoints.coupons.list, { params: queryParams });
  }

  // Get coupon by ID
  async getCouponById(couponId: string): Promise<ApiResponse<Coupon>> {
    return this.client.get<Coupon>(endpoints.coupons.byId(couponId));
  }

  // Get coupon by code
  async getCouponByCode(code: string): Promise<ApiResponse<Coupon>> {
    return this.client.get<Coupon>(endpoints.coupons.byCode(code));
  }

  // Get active coupons
  async getActiveCoupons(params?: PaginationParams): Promise<ApiResponse<Coupon[]>> {
    const queryParams = buildPaginationParams(params || {});
    return this.client.get<Coupon[]>(endpoints.coupons.active, { params: queryParams });
  }

  // Create coupon
  async createCoupon(couponData: {
    code: string;
    title: string;
    description: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
    discount: Coupon['discount'];
    validity: Coupon['validity'];
    usage?: Partial<Coupon['usage']>;
    targeting?: Partial<Coupon['targeting']>;
    stacking?: Partial<Coupon['stacking']>;
    autoApply?: Partial<Coupon['autoApply']>;
    distribution?: Partial<Coupon['distribution']>;
    bogo?: Coupon['bogo'];
  }): Promise<ApiResponse<Coupon>> {
    return this.client.post<Coupon>(endpoints.coupons.create, couponData);
  }

  // Update coupon
  async updateCoupon(couponId: string, updates: {
    title?: string;
    description?: string;
    status?: 'active' | 'inactive' | 'expired' | 'scheduled' | 'draft';
    discount?: Coupon['discount'];
    validity?: Coupon['validity'];
    usage?: Partial<Coupon['usage']>;
    targeting?: Partial<Coupon['targeting']>;
    stacking?: Partial<Coupon['stacking']>;
    autoApply?: Partial<Coupon['autoApply']>;
    distribution?: Partial<Coupon['distribution']>;
    bogo?: Coupon['bogo'];
  }): Promise<ApiResponse<Coupon>> {
    return this.client.put<Coupon>(endpoints.coupons.update(couponId), updates);
  }

  // Delete coupon
  async deleteCoupon(couponId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.coupons.delete(couponId));
  }

  // Duplicate coupon
  async duplicateCoupon(couponId: string, options?: {
    code?: string;
    title?: string;
    resetUsage?: boolean;
  }): Promise<ApiResponse<Coupon>> {
    return this.client.post<Coupon>(endpoints.coupons.duplicate(couponId), options || {});
  }

  // Validation & Application

  // Validate coupon
  async validateCoupon(code: string, validationData: {
    userId?: string;
    cartTotal: number;
    cartItems: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    location?: {
      country: string;
      state?: string;
      city?: string;
      zipcode?: string;
    };
  }): Promise<ApiResponse<CouponValidation>> {
    return this.client.post<CouponValidation>(endpoints.coupons.validateCode(code), validationData);
  }

  // Apply coupon to cart
  async applyCouponToCart(cartId: string, code: string): Promise<ApiResponse<{
    success: boolean;
    discount: {
      amount: number;
      type: string;
    };
    newTotal: number;
    message: string;
  }>> {
    return this.client.post<{
      success: boolean;
      discount: {
        amount: number;
        type: string;
      };
      newTotal: number;
      message: string;
    }>(endpoints.coupons.applyToCart(cartId), { code });
  }

  // Remove coupon from cart
  async removeCouponFromCart(cartId: string, code: string): Promise<ApiResponse<{
    success: boolean;
    newTotal: number;
    message: string;
  }>> {
    return this.client.delete<{
      success: boolean;
      newTotal: number;
      message: string;
    }>(endpoints.coupons.removeFromCart(cartId, code));
  }

  // Usage Tracking

  // Get coupon usage
  async getCouponUsage(couponId: string, params?: PaginationParams & {
    userId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    sortBy?: 'date' | 'amount' | 'user';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<CouponUsage[]>> {
    const queryParams = {
      ...buildPaginationParams(params || {}),
      ...(params?.userId && { userId: params.userId }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<CouponUsage[]>(endpoints.coupons.usage(couponId), { params: queryParams });
  }

  // Get user coupon usage
  async getUserCouponUsage(userId: string, params?: PaginationParams): Promise<ApiResponse<CouponUsage[]>> {
    const queryParams = buildPaginationParams(params || {});
    return this.client.get<CouponUsage[]>(endpoints.coupons.userUsage(userId), { params: queryParams });
  }

  // Templates

  // Get coupon templates
  async getCouponTemplates(category?: 'welcome' | 'seasonal' | 'loyalty' | 'winback' | 'flash_sale' | 'referral'): Promise<ApiResponse<CouponTemplate[]>> {
    const params = category ? { category } : {};
    return this.client.get<CouponTemplate[]>(endpoints.coupons.templates, { params });
  }

  // Create coupon from template
  async createCouponFromTemplate(templateId: string, couponData: {
    code: string;
    title?: string;
    description?: string;
    validity: Coupon['validity'];
    customizations?: Record<string, unknown>;
  }): Promise<ApiResponse<Coupon>> {
    return this.client.post<Coupon>(endpoints.coupons.fromTemplate(templateId), couponData);
  }

  // Analytics

  // Get coupon analytics
  async getCouponAnalytics(couponId: string, params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    granularity?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<CouponAnalytics>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.granularity && { granularity: params.granularity }),
    };
    
    return this.client.get<CouponAnalytics>(endpoints.coupons.analytics(couponId), { params: queryParams });
  }

  // Get coupon performance
  async getCouponPerformance(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    sortBy?: 'applications' | 'conversions' | 'revenue' | 'roi';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    type?: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  }): Promise<ApiResponse<Array<{
    couponId: string;
    couponCode: string;
    couponTitle: string;
    applications: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    discountGiven: number;
    roi: number;
    trend: 'up' | 'down' | 'stable';
  }>>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      ...(params?.limit && { limit: params.limit }),
      ...(params?.type && { type: params.type }),
    };
    
    return this.client.get<Array<{
      couponId: string;
      couponCode: string;
      couponTitle: string;
      applications: number;
      conversions: number;
      conversionRate: number;
      revenue: number;
      discountGiven: number;
      roi: number;
      trend: 'up' | 'down' | 'stable';
    }>>(endpoints.coupons.performance, { params: queryParams });
  }

  // Bulk Operations

  // Bulk update coupons
  async bulkUpdateCoupons(updates: Array<{
    couponId: string;
    updates: {
      status?: 'active' | 'inactive' | 'expired' | 'scheduled' | 'draft';
      validity?: Partial<Coupon['validity']>;
      usage?: Partial<Coupon['usage']>;
    };
  }>): Promise<ApiResponse<{
    updatedCount: number;
    errors: Array<{
      couponId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      updatedCount: number;
      errors: Array<{
        couponId: string;
        error: string;
      }>;
    }>(endpoints.coupons.bulkUpdate, { updates });
  }

  // Bulk delete coupons
  async bulkDeleteCoupons(couponIds: string[]): Promise<ApiResponse<{
    deletedCount: number;
    errors: Array<{
      couponId: string;
      error: string;
    }>;
  }>> {
    return this.client.delete<{
      deletedCount: number;
      errors: Array<{
        couponId: string;
        error: string;
      }>;
    }>(endpoints.coupons.bulkDelete, {
      data: { couponIds },
    });
  }

  // Code Generation

  // Generate coupon codes
  async generateCouponCodes(options: {
    count: number;
    pattern?: string; // e.g., "SAVE###", "###OFF", custom pattern
    length?: number;
    prefix?: string;
    suffix?: string;
    excludeSimilar?: boolean; // exclude similar characters (0, O, 1, I, etc.)
    caseType?: 'upper' | 'lower' | 'mixed';
  }): Promise<ApiResponse<{
    codes: string[];
    pattern: string;
  }>> {
    return this.client.post<{
      codes: string[];
      pattern: string;
    }>(endpoints.coupons.generateCodes, options);
  }

  // Check code availability
  async checkCodeAvailability(code: string): Promise<ApiResponse<{
    available: boolean;
    suggestions?: string[];
  }>> {
    return this.client.get<{
      available: boolean;
      suggestions?: string[];
    }>(endpoints.coupons.checkCode(code));
  }

  // Distribution

  // Send coupon via email
  async sendCouponEmail(couponId: string, recipients: Array<{
    email: string;
    name?: string;
    customFields?: Record<string, string>;
  }>, template?: {
    subject?: string;
    body?: string;
    templateId?: string;
  }): Promise<ApiResponse<{
    sentCount: number;
    failedCount: number;
    errors: Array<{
      email: string;
      error: string;
    }>;
  }>> {
    return this.client.post<{
      sentCount: number;
      failedCount: number;
      errors: Array<{
        email: string;
        error: string;
      }>;
    }>(endpoints.coupons.sendEmail(couponId), { recipients, template });
  }

  // Send coupon via SMS
  async sendCouponSMS(couponId: string, recipients: Array<{
    phone: string;
    name?: string;
  }>, message?: string): Promise<ApiResponse<{
    sentCount: number;
    failedCount: number;
    errors: Array<{
      phone: string;
      error: string;
    }>;
  }>> {
    return this.client.post<{
      sentCount: number;
      failedCount: number;
      errors: Array<{
        phone: string;
        error: string;
      }>;
    }>(endpoints.coupons.sendSMS(couponId), { recipients, message });
  }

  // Get coupon QR code
  async getCouponQRCode(couponId: string, options?: {
    size?: number;
    format?: 'png' | 'svg';
    includeText?: boolean;
  }): Promise<ApiResponse<{
    qrCodeUrl: string;
    qrCodeData: string;
  }>> {
    const params = {
      ...(options?.size && { size: options.size }),
      ...(options?.format && { format: options.format }),
      ...(options?.includeText !== undefined && { includeText: options.includeText }),
    };
    
    return this.client.get<{
      qrCodeUrl: string;
      qrCodeData: string;
    }>(endpoints.coupons.qrCode(couponId), { params });
  }

  // Personalization

  // Get personalized coupons for user
  async getPersonalizedCoupons(userId: string, params?: {
    limit?: number;
    includeReasons?: boolean;
    context?: 'cart' | 'checkout' | 'email' | 'browse';
  }): Promise<ApiResponse<Array<Coupon & {
    personalizedScore: number;
    reasons?: string[];
    suggestedText?: string;
  }>>> {
    const queryParams = {
      ...(params?.limit && { limit: params.limit }),
      ...(params?.includeReasons !== undefined && { includeReasons: params.includeReasons }),
      ...(params?.context && { context: params.context }),
    };
    
    return this.client.get<Array<Coupon & {
      personalizedScore: number;
      reasons?: string[];
      suggestedText?: string;
    }>>(endpoints.coupons.personalized(userId), { params: queryParams });
  }

  // Auto-apply eligible coupons
  async getAutoApplyCoupons(cartData: {
    cartTotal: number;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    userId?: string;
  }): Promise<ApiResponse<Array<{
    coupon: Coupon;
    discount: {
      amount: number;
      type: string;
    };
    priority: number;
  }>>> {
    return this.client.post<Array<{
      coupon: Coupon;
      discount: {
        amount: number;
        type: string;
      };
      priority: number;
    }>>(endpoints.coupons.autoApply, cartData);
  }
}

// Create service instance
const couponApiService = new CouponApiService();

// React Query Hooks

// Coupon Management
export const useCoupons = (params?: SearchParams & PaginationParams & {
  type?: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  status?: 'active' | 'inactive' | 'expired' | 'scheduled' | 'draft';
  sortBy?: 'code' | 'created' | 'updated' | 'usage' | 'expiry';
  sortOrder?: 'asc' | 'desc';
  category?: 'welcome' | 'seasonal' | 'loyalty' | 'winback' | 'flash_sale' | 'referral';
}) => {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: () => couponApiService.getCoupons(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCoupon = (couponId: string) => {
  return useQuery({
    queryKey: ['coupons', 'detail', couponId],
    queryFn: () => couponApiService.getCouponById(couponId),
    enabled: !!couponId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useCouponByCode = (code: string) => {
  return useQuery({
    queryKey: ['coupons', 'code', code],
    queryFn: () => couponApiService.getCouponByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveCoupons = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['coupons', 'active', params],
    queryFn: () => couponApiService.getActiveCoupons(params),
    staleTime: 15 * 60 * 1000,
  });
};

// Usage Tracking
export const useCouponUsage = (couponId: string, params?: PaginationParams & {
  userId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'date' | 'amount' | 'user';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['coupons', 'usage', couponId, params],
    queryFn: () => couponApiService.getCouponUsage(couponId, params),
    enabled: !!couponId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserCouponUsage = (userId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['coupons', 'user-usage', userId, params],
    queryFn: () => couponApiService.getUserCouponUsage(userId, params),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
};

// Templates
export const useCouponTemplates = (category?: 'welcome' | 'seasonal' | 'loyalty' | 'winback' | 'flash_sale' | 'referral') => {
  return useQuery({
    queryKey: ['coupons', 'templates', category],
    queryFn: () => couponApiService.getCouponTemplates(category),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Analytics
export const useCouponAnalytics = (couponId: string, params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  granularity?: 'day' | 'week' | 'month';
}) => {
  return useQuery({
    queryKey: ['coupons', 'analytics', couponId, params],
    queryFn: () => couponApiService.getCouponAnalytics(couponId, params),
    enabled: !!couponId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCouponPerformance = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'applications' | 'conversions' | 'revenue' | 'roi';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  type?: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
}) => {
  return useQuery({
    queryKey: ['coupons', 'performance', params],
    queryFn: () => couponApiService.getCouponPerformance(params),
    staleTime: 15 * 60 * 1000,
  });
};

// Code Generation
export const useCheckCodeAvailability = (code: string) => {
  return useQuery({
    queryKey: ['coupons', 'check-code', code],
    queryFn: () => couponApiService.checkCodeAvailability(code),
    enabled: !!code && code.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Personalization
export const usePersonalizedCoupons = (userId: string, params?: {
  limit?: number;
  includeReasons?: boolean;
  context?: 'cart' | 'checkout' | 'email' | 'browse';
}) => {
  return useQuery({
    queryKey: ['coupons', 'personalized', userId, params],
    queryFn: () => couponApiService.getPersonalizedCoupons(userId, params),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
};

// Mutation Hooks

// Coupon Management
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (couponData: {
      code: string;
      title: string;
      description: string;
      type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
      discount: Coupon['discount'];
      validity: Coupon['validity'];
      usage?: Partial<Coupon['usage']>;
      targeting?: Partial<Coupon['targeting']>;
      stacking?: Partial<Coupon['stacking']>;
      autoApply?: Partial<Coupon['autoApply']>;
      distribution?: Partial<Coupon['distribution']>;
      bogo?: Coupon['bogo'];
    }) => couponApiService.createCoupon(couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ couponId, updates }: {
      couponId: string;
      updates: {
        title?: string;
        description?: string;
        status?: 'active' | 'inactive' | 'expired' | 'scheduled' | 'draft';
        discount?: Coupon['discount'];
        validity?: Coupon['validity'];
        usage?: Partial<Coupon['usage']>;
        targeting?: Partial<Coupon['targeting']>;
        stacking?: Partial<Coupon['stacking']>;
        autoApply?: Partial<Coupon['autoApply']>;
        distribution?: Partial<Coupon['distribution']>;
        bogo?: Coupon['bogo'];
      };
    }) => couponApiService.updateCoupon(couponId, updates),
    onSuccess: (_, { couponId }) => {
      queryClient.invalidateQueries({ queryKey: ['coupons', 'detail', couponId] });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (couponId: string) => couponApiService.deleteCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useDuplicateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ couponId, options }: {
      couponId: string;
      options?: {
        code?: string;
        title?: string;
        resetUsage?: boolean;
      };
    }) => couponApiService.duplicateCoupon(couponId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

// Validation & Application
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ code, validationData }: {
      code: string;
      validationData: {
        userId?: string;
        cartTotal: number;
        cartItems: Array<{
          productId: string;
          quantity: number;
          price: number;
        }>;
        location?: {
          country: string;
          state?: string;
          city?: string;
          zipcode?: string;
        };
      };
    }) => couponApiService.validateCoupon(code, validationData),
  });
};

export const useApplyCouponToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, code }: {
      cartId: string;
      code: string;
    }) => couponApiService.applyCouponToCart(cartId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveCouponFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, code }: {
      cartId: string;
      code: string;
    }) => couponApiService.removeCouponFromCart(cartId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Templates
export const useCreateCouponFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, couponData }: {
      templateId: string;
      couponData: {
        code: string;
        title?: string;
        description?: string;
        validity: Coupon['validity'];
        customizations?: Record<string, unknown>;
      };
    }) => couponApiService.createCouponFromTemplate(templateId, couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

// Bulk Operations
export const useBulkUpdateCoupons = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{
      couponId: string;
      updates: {
        status?: 'active' | 'inactive' | 'expired' | 'scheduled' | 'draft';
        validity?: Partial<Coupon['validity']>;
        usage?: Partial<Coupon['usage']>;
      };
    }>) => couponApiService.bulkUpdateCoupons(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useBulkDeleteCoupons = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (couponIds: string[]) => couponApiService.bulkDeleteCoupons(couponIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

// Code Generation
export const useGenerateCouponCodes = () => {
  return useMutation({
    mutationFn: (options: {
      count: number;
      pattern?: string;
      length?: number;
      prefix?: string;
      suffix?: string;
      excludeSimilar?: boolean;
      caseType?: 'upper' | 'lower' | 'mixed';
    }) => couponApiService.generateCouponCodes(options),
  });
};

// Distribution
export const useSendCouponEmail = () => {
  return useMutation({
    mutationFn: ({ couponId, recipients, template }: {
      couponId: string;
      recipients: Array<{
        email: string;
        name?: string;
        customFields?: Record<string, string>;
      }>;
      template?: {
        subject?: string;
        body?: string;
        templateId?: string;
      };
    }) => couponApiService.sendCouponEmail(couponId, recipients, template),
  });
};

export const useSendCouponSMS = () => {
  return useMutation({
    mutationFn: ({ couponId, recipients, message }: {
      couponId: string;
      recipients: Array<{
        phone: string;
        name?: string;
      }>;
      message?: string;
    }) => couponApiService.sendCouponSMS(couponId, recipients, message),
  });
};

// QR Code
export const useCouponQRCode = (couponId: string, options?: {
  size?: number;
  format?: 'png' | 'svg';
  includeText?: boolean;
}) => {
  return useQuery({
    queryKey: ['coupons', 'qr-code', couponId, options],
    queryFn: () => couponApiService.getCouponQRCode(couponId, options),
    enabled: !!couponId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Auto Apply
export const useAutoApplyCoupons = () => {
  return useMutation({
    mutationFn: (cartData: {
      cartTotal: number;
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
      }>;
      userId?: string;
    }) => couponApiService.getAutoApplyCoupons(cartData),
  });
};

export default couponApiService;
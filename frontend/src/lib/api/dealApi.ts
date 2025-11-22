import axios, { AxiosInstance } from 'axios';
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { endpoints } from './endpoints';
import { ApiResponse, PaginationParams } from './types';

// Deal Types
export interface Deal {
  id: string;
  title: string;
  description: string;
  type: 'flash_sale' | 'daily_deal' | 'clearance' | 'bundle' | 'bogo' | 'percentage_off' | 'fixed_amount';
  status: 'draft' | 'scheduled' | 'active' | 'expired' | 'paused' | 'cancelled';
  
  // Timing
  startDate: string;
  endDate: string;
  timezone: string;
  duration: number; // in seconds
  remainingTime?: number;
  
  // Deal Configuration
  discountType: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
  discountValue: number;
  originalPrice: number;
  salePrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  
  // Conditions
  minQuantity?: number;
  maxQuantity?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  
  // Products & Categories
  applicableProducts: string[];
  applicableCategories: string[];
  excludeProducts: string[];
  excludeCategories: string[];
  
  // Display & Marketing
  featuredImage: string;
  images: string[];
  badge?: string;
  tagline?: string;
  terms: string;
  featured: boolean;
  priority: number;
  
  // Inventory & Stock
  stockLevel?: number;
  lowStockThreshold?: number;
  soldCount: number;
  remainingStock?: number;
  
  // Analytics
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  clickThroughRate: number;
  
  // Targeting
  targetAudience: string[];
  geographicRestrictions: string[];
  deviceTargeting: string[];
  
  // Notifications
  notifyOnStart: boolean;
  notifyOnEnd: boolean;
  notifyOnLowStock: boolean;
  notificationsSent: number;
  
  // Social & Sharing
  shareCount: number;
  socialMediaPosts: string[];
  
  // Settings
  autoActivate: boolean;
  autoExpire: boolean;
  stackable: boolean;
  combinable: boolean;
  
  // Metadata
  tags: string[];
  categoryId?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface DealTemplate {
  id: string;
  name: string;
  description: string;
  type: Deal['type'];
  config: Partial<Deal>;
  category: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  thumbnail?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealAnalytics {
  dealId: string;
  period: string;
  
  // Performance Metrics
  impressions: number;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  
  // Conversion Metrics
  viewToClickRate: number;
  clickToConversionRate: number;
  overallConversionRate: number;
  
  // Financial Metrics
  averageOrderValue: number;
  revenuePerView: number;
  revenuePerClick: number;
  costPerAcquisition: number;
  returnOnInvestment: number;
  
  // Time-based Analytics
  hourlyData: Array<{
    hour: number;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  
  dailyData: Array<{
    date: string;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  
  // Audience Analytics
  topCountries: Array<{ country: string; count: number; percentage: number }>;
  deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
  trafficSources: Array<{ source: string; count: number; percentage: number }>;
  
  // Product Analytics
  topProducts: Array<{
    productId: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  
  updatedAt: string;
}

export interface DealCampaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Campaign Details
  type: 'seasonal' | 'promotional' | 'clearance' | 'acquisition' | 'retention';
  startDate: string;
  endDate: string;
  budget?: number;
  spent: number;
  
  // Deals
  deals: string[];
  
  // Targeting
  targetAudience: string[];
  geographicTargeting: string[];
  demographicTargeting: Record<string, unknown>;
  
  // Performance
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  averageCTR: number;
  averageConversionRate: number;
  
  // Settings
  autoOptimize: boolean;
  budgetAlert: boolean;
  budgetAlertThreshold: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashSale {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'ended';
  
  // Flash Sale Specific
  countdown: number;
  quickBuyEnabled: boolean;
  limitedQuantity: boolean;
  totalQuantity?: number;
  soldQuantity: number;
  
  // Products
  products: Array<{
    productId: string;
    originalPrice: number;
    salePrice: number;
    discount: number;
    quantity: number;
    sold: number;
    remaining: number;
  }>;
  
  // Settings
  notifyUsers: boolean;
  notificationsSent: number;
  emailReminders: boolean;
  smsReminders: boolean;
  
  // Performance
  participants: number;
  totalRevenue: number;
  averageOrderValue: number;
  
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types
export interface CreateDealRequest {
  title: string;
  description: string;
  type: Deal['type'];
  startDate: string;
  endDate: string;
  discountType: Deal['discountType'];
  discountValue: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  terms: string;
  featured?: boolean;
  autoActivate?: boolean;
  notifyOnStart?: boolean;
  targetAudience?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {
  status?: Deal['status'];
}

export interface DealListParams extends PaginationParams {
  status?: Deal['status'];
  type?: Deal['type'];
  featured?: boolean;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'priority' | 'views' | 'conversions';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tags?: string[];
}

export interface DealStatsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  dealIds?: string[];
  categories?: string[];
  timezone?: string;
}

export interface BulkDealOperation {
  dealIds: string[];
  operation: 'activate' | 'pause' | 'cancel' | 'delete' | 'update_status' | 'update_priority';
  data?: Record<string, unknown>;
}

export interface DealRecommendation {
  type: 'similar' | 'complementary' | 'trending' | 'personalized';
  deals: Deal[];
  reason: string;
  confidence: number;
}

/**
 * Deal API Service Class
 * Comprehensive deal and promotion management system
 */
class DealApiService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  // Basic Deal Operations
  async getDeals(params?: DealListParams): Promise<ApiResponse<Deal[]>> {
    return this.client.get(endpoints.deals.list, { params });
  }

  async getDeal(id: string): Promise<ApiResponse<Deal>> {
    return this.client.get(endpoints.deals.byId(id));
  }

  async createDeal(data: CreateDealRequest): Promise<ApiResponse<Deal>> {
    return this.client.post(endpoints.deals.create, data);
  }

  async updateDeal(id: string, data: UpdateDealRequest): Promise<ApiResponse<Deal>> {
    return this.client.put(endpoints.deals.update(id), data);
  }

  async deleteDeal(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.deals.delete(id));
  }

  async duplicateDeal(id: string, data?: { title?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Deal>> {
    return this.client.post(endpoints.deals.duplicate(id), data);
  }

  // Deal Status Management
  async activateDeal(id: string): Promise<ApiResponse<Deal>> {
    return this.client.patch(endpoints.deals.activate(id));
  }

  async pauseDeal(id: string): Promise<ApiResponse<Deal>> {
    return this.client.patch(endpoints.deals.pause(id));
  }

  async cancelDeal(id: string, reason?: string): Promise<ApiResponse<Deal>> {
    return this.client.patch(endpoints.deals.cancel(id), { reason });
  }

  async extendDeal(id: string, endDate: string): Promise<ApiResponse<Deal>> {
    return this.client.patch(endpoints.deals.extend(id), { endDate });
  }

  // Featured & Priority Deals
  async getFeaturedDeals(params?: Omit<DealListParams, 'featured'>): Promise<ApiResponse<Deal[]>> {
    return this.client.get(endpoints.deals.featured, { params });
  }

  async setFeatured(id: string, featured: boolean, priority?: number): Promise<ApiResponse<Deal>> {
    return this.client.patch(endpoints.deals.featured, { dealId: id, featured, priority });
  }

  async updatePriority(id: string, priority: number): Promise<ApiResponse<Deal>> {
    return this.client.patch(endpoints.deals.priority(id), { priority });
  }

  // Deal Types & Categories
  async getDealsByType(type: Deal['type'], params?: Omit<DealListParams, 'type'>): Promise<ApiResponse<Deal[]>> {
    return this.client.get(endpoints.deals.byType(type), { params });
  }

  async getDealsByCategory(category: string, params?: Omit<DealListParams, 'category'>): Promise<ApiResponse<Deal[]>> {
    return this.client.get(endpoints.deals.byCategory(category), { params });
  }

  async getActiveDeals(params?: Omit<DealListParams, 'status'>): Promise<ApiResponse<Deal[]>> {
    return this.client.get(endpoints.deals.active, { params });
  }

  async getUpcomingDeals(params?: Omit<DealListParams, 'status'>): Promise<ApiResponse<Deal[]>> {
    return this.client.get(endpoints.deals.upcoming, { params });
  }

  async getExpiredDeals(params?: Omit<DealListParams, 'status'>): Promise<ApiResponse<Deal[]>> {
    return this.client.get(endpoints.deals.expired, { params });
  }

  // Deal Analytics
  async getDealAnalytics(id: string, params?: DealStatsParams): Promise<ApiResponse<DealAnalytics>> {
    return this.client.get(endpoints.deals.analytics(id), { params });
  }

  async getDealStats(params?: DealStatsParams): Promise<ApiResponse<{
    totalDeals: number;
    activeDeals: number;
    totalRevenue: number;
    totalConversions: number;
    averageConversionRate: number;
    topPerformingDeals: Deal[];
    revenueByType: Array<{ type: string; revenue: number; count: number }>;
    performanceByDay: Array<{ date: string; revenue: number; conversions: number }>;
  }>> {
    return this.client.get(endpoints.deals.stats, { params });
  }

  async getDealPerformance(params?: DealStatsParams): Promise<ApiResponse<{
    deals: Array<{
      dealId: string;
      title: string;
      views: number;
      clicks: number;
      conversions: number;
      revenue: number;
      ctr: number;
      conversionRate: number;
      roi: number;
    }>;
    summary: {
      totalViews: number;
      totalClicks: number;
      totalConversions: number;
      totalRevenue: number;
      averageCTR: number;
      averageConversionRate: number;
    };
  }>> {
    return this.client.get(endpoints.deals.performance, { params });
  }

  // Deal Templates
  async getDealTemplates(params?: PaginationParams): Promise<ApiResponse<DealTemplate[]>> {
    return this.client.get(endpoints.deals.templates.list, { params });
  }

  async getDealTemplate(id: string): Promise<ApiResponse<DealTemplate>> {
    return this.client.get(endpoints.deals.templates.byId(id));
  }

  async createDealTemplate(data: {
    name: string;
    description: string;
    type: Deal['type'];
    config: Partial<Deal>;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  }): Promise<ApiResponse<DealTemplate>> {
    return this.client.post(endpoints.deals.templates.create, data);
  }

  async updateDealTemplate(id: string, data: Partial<{
    name: string;
    description: string;
    config: Partial<Deal>;
    category: string;
    tags: string[];
    isPublic: boolean;
  }>): Promise<ApiResponse<DealTemplate>> {
    return this.client.put(endpoints.deals.templates.update(id), data);
  }

  async deleteDealTemplate(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.deals.templates.delete(id));
  }

  async createDealFromTemplate(templateId: string, data: {
    title: string;
    startDate: string;
    endDate: string;
    overrides?: Partial<Deal>;
  }): Promise<ApiResponse<Deal>> {
    return this.client.post(endpoints.deals.templates.createDeal(templateId), data);
  }

  // Flash Sales
  async getFlashSales(params?: PaginationParams): Promise<ApiResponse<FlashSale[]>> {
    return this.client.get(endpoints.deals.flashSales.list, { params });
  }

  async getFlashSale(id: string): Promise<ApiResponse<FlashSale>> {
    return this.client.get(endpoints.deals.flashSales.byId(id));
  }

  async createFlashSale(data: {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    products: Array<{
      productId: string;
      salePrice: number;
      quantity?: number;
    }>;
    quickBuyEnabled?: boolean;
    notifyUsers?: boolean;
  }): Promise<ApiResponse<FlashSale>> {
    return this.client.post(endpoints.deals.flashSales.create, data);
  }

  async updateFlashSale(id: string, data: Partial<{
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    notifyUsers: boolean;
  }>): Promise<ApiResponse<FlashSale>> {
    return this.client.put(endpoints.deals.flashSales.update(id), data);
  }

  async deleteFlashSale(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.deals.flashSales.delete(id));
  }

  async getActiveFlashSales(): Promise<ApiResponse<FlashSale[]>> {
    return this.client.get(endpoints.deals.flashSales.active);
  }

  async getUpcomingFlashSales(): Promise<ApiResponse<FlashSale[]>> {
    return this.client.get(endpoints.deals.flashSales.upcoming);
  }

  // Deal Campaigns
  async getDealCampaigns(params?: PaginationParams): Promise<ApiResponse<DealCampaign[]>> {
    return this.client.get(endpoints.deals.campaigns.list, { params });
  }

  async getDealCampaign(id: string): Promise<ApiResponse<DealCampaign>> {
    return this.client.get(endpoints.deals.campaigns.byId(id));
  }

  async createDealCampaign(data: {
    name: string;
    description: string;
    type: DealCampaign['type'];
    startDate: string;
    endDate: string;
    deals: string[];
    targetAudience?: string[];
    budget?: number;
  }): Promise<ApiResponse<DealCampaign>> {
    return this.client.post(endpoints.deals.campaigns.create, data);
  }

  async updateDealCampaign(id: string, data: Partial<{
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    budget: number;
    targetAudience: string[];
  }>): Promise<ApiResponse<DealCampaign>> {
    return this.client.put(endpoints.deals.campaigns.update(id), data);
  }

  async deleteDealCampaign(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.deals.campaigns.delete(id));
  }

  async getCampaignAnalytics(id: string): Promise<ApiResponse<{
    campaign: DealCampaign;
    performance: {
      impressions: number;
      clicks: number;
      conversions: number;
      revenue: number;
      ctr: number;
      conversionRate: number;
      roi: number;
      costPerAcquisition: number;
    };
    dealPerformance: Array<{
      dealId: string;
      title: string;
      views: number;
      conversions: number;
      revenue: number;
    }>;
  }>> {
    return this.client.get(endpoints.deals.campaigns.analytics(id));
  }

  // Bulk Operations
  async bulkUpdateDeals(operation: BulkDealOperation): Promise<ApiResponse<{
    success: number;
    failed: number;
    errors: Array<{ dealId: string; error: string }>;
  }>> {
    return this.client.post(endpoints.deals.bulk.update, operation);
  }

  async bulkDeleteDeals(dealIds: string[]): Promise<ApiResponse<{
    deleted: number;
    failed: number;
    errors: Array<{ dealId: string; error: string }>;
  }>> {
    return this.client.delete(endpoints.deals.bulk.delete, {
      data: { dealIds }
    });
  }

  // Import/Export
  async importDeals(file: File, options?: {
    skipErrors?: boolean;
    updateExisting?: boolean;
    dryRun?: boolean;
  }): Promise<ApiResponse<{
    imported: number;
    updated: number;
    errors: Array<{ row: number; error: string }>;
    preview?: Deal[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.client.post(endpoints.deals.import, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async exportDeals(params?: {
    format?: 'csv' | 'xlsx' | 'json';
    dealIds?: string[];
    status?: Deal['status'];
    type?: Deal['type'];
    startDate?: string;
    endDate?: string;
    includeAnalytics?: boolean;
  }): Promise<ApiResponse<{ downloadUrl: string; filename: string }>> {
    return this.client.get(endpoints.deals.export, {
      params,
      responseType: 'blob'
    });
  }

  // Deal Recommendations
  async getDealRecommendations(dealId: string, type?: DealRecommendation['type']): Promise<ApiResponse<DealRecommendation[]>> {
    return this.client.get(endpoints.deals.recommendations(dealId), {
      params: { type }
    });
  }

  async getPersonalizedDeals(userId: string, params?: {
    limit?: number;
    category?: string;
    priceRange?: { min: number; max: number };
  }): Promise<ApiResponse<Deal[]>> {
    return this.client.get(endpoints.deals.personalized(userId), { params });
  }

  // Search & Filter
  async searchDeals(query: string, params?: {
    limit?: number;
    filters?: {
      type?: Deal['type'];
      status?: Deal['status'];
      priceRange?: { min: number; max: number };
      dateRange?: { start: string; end: string };
      category?: string;
    };
  }): Promise<ApiResponse<Deal[]>> {
    return this.client.get(endpoints.deals.search, {
      params: { query, ...params }
    });
  }

  // Deal Validation
  async validateDeal(dealData: CreateDealRequest): Promise<ApiResponse<{
    valid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string }>;
    suggestions: string[];
  }>> {
    return this.client.post(endpoints.deals.validate, dealData);
  }

  // Deal Preview
  async previewDeal(dealData: CreateDealRequest): Promise<ApiResponse<{
    deal: Deal;
    estimatedSavings: number;
    estimatedRevenue: number;
    similarDeals: Deal[];
    recommendations: string[];
  }>> {
    return this.client.post(endpoints.deals.preview, dealData);
  }

  // Deal Notifications
  async notifyDealStart(id: string): Promise<ApiResponse<{ sent: number; failed: number }>> {
    return this.client.post(endpoints.deals.notifications.start(id));
  }

  async notifyDealEnd(id: string): Promise<ApiResponse<{ sent: number; failed: number }>> {
    return this.client.post(endpoints.deals.notifications.end(id));
  }

  async scheduleDealNotification(id: string, data: {
    type: 'start' | 'end' | 'reminder' | 'low_stock';
    scheduledAt: string;
    audience?: string[];
    message?: string;
  }): Promise<ApiResponse<{ scheduled: boolean; scheduledId: string }>> {
    return this.client.post(endpoints.deals.notifications.schedule(id), data);
  }
}

// Create service instance
const dealApi = new DealApiService(axios);

// React Query Hooks

// Basic Deal Hooks
export const useDeals = (
  params?: DealListParams,
  options?: UseQueryOptions<ApiResponse<Deal[]>>
) => {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => dealApi.getDeals(params),
    ...options,
  });
};

export const useDeal = (
  id: string,
  options?: UseQueryOptions<ApiResponse<Deal>>
) => {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: () => dealApi.getDeal(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateDeal = (
  options?: UseMutationOptions<ApiResponse<Deal>, Error, CreateDealRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-stats'] });
    },
    ...options,
  });
};

export const useUpdateDeal = (
  options?: UseMutationOptions<ApiResponse<Deal>, Error, { id: string; data: UpdateDealRequest }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => dealApi.updateDeal(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-analytics', id] });
    },
    ...options,
  });
};

export const useDeleteDeal = (
  options?: UseMutationOptions<ApiResponse<void>, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.deleteDeal,
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-stats'] });
    },
    ...options,
  });
};

export const useDuplicateDeal = (
  options?: UseMutationOptions<ApiResponse<Deal>, Error, { id: string; data?: { title?: string; startDate?: string; endDate?: string } }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => dealApi.duplicateDeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
    ...options,
  });
};

// Deal Status Hooks
export const useActivateDeal = (
  options?: UseMutationOptions<ApiResponse<Deal>, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.activateDeal,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['active-deals'] });
    },
    ...options,
  });
};

export const usePauseDeal = (
  options?: UseMutationOptions<ApiResponse<Deal>, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.pauseDeal,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['active-deals'] });
    },
    ...options,
  });
};

export const useCancelDeal = (
  options?: UseMutationOptions<ApiResponse<Deal>, Error, { id: string; reason?: string }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => dealApi.cancelDeal(id, reason),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['active-deals'] });
    },
    ...options,
  });
};

export const useExtendDeal = (
  options?: UseMutationOptions<ApiResponse<Deal>, Error, { id: string; endDate: string }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, endDate }) => dealApi.extendDeal(id, endDate),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
    ...options,
  });
};

// Featured & Category Hooks
export const useFeaturedDeals = (
  params?: Omit<DealListParams, 'featured'>,
  options?: UseQueryOptions<ApiResponse<Deal[]>>
) => {
  return useQuery({
    queryKey: ['featured-deals', params],
    queryFn: () => dealApi.getFeaturedDeals(params),
    ...options,
  });
};

export const useSetFeatured = (
  options?: UseMutationOptions<ApiResponse<Deal>, Error, { id: string; featured: boolean; priority?: number }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, featured, priority }) => dealApi.setFeatured(id, featured, priority),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['featured-deals'] });
    },
    ...options,
  });
};

export const useDealsByType = (
  type: Deal['type'],
  params?: Omit<DealListParams, 'type'>,
  options?: UseQueryOptions<ApiResponse<Deal[]>>
) => {
  return useQuery({
    queryKey: ['deals-by-type', type, params],
    queryFn: () => dealApi.getDealsByType(type, params),
    ...options,
  });
};

export const useDealsByCategory = (
  category: string,
  params?: Omit<DealListParams, 'category'>,
  options?: UseQueryOptions<ApiResponse<Deal[]>>
) => {
  return useQuery({
    queryKey: ['deals-by-category', category, params],
    queryFn: () => dealApi.getDealsByCategory(category, params),
    ...options,
  });
};

export const useActiveDeals = (
  params?: Omit<DealListParams, 'status'>,
  options?: UseQueryOptions<ApiResponse<Deal[]>>
) => {
  return useQuery({
    queryKey: ['active-deals', params],
    queryFn: () => dealApi.getActiveDeals(params),
    ...options,
  });
};

export const useUpcomingDeals = (
  params?: Omit<DealListParams, 'status'>,
  options?: UseQueryOptions<ApiResponse<Deal[]>>
) => {
  return useQuery({
    queryKey: ['upcoming-deals', params],
    queryFn: () => dealApi.getUpcomingDeals(params),
    ...options,
  });
};

export const useExpiredDeals = (
  params?: Omit<DealListParams, 'status'>,
  options?: UseQueryOptions<ApiResponse<Deal[]>>
) => {
  return useQuery({
    queryKey: ['expired-deals', params],
    queryFn: () => dealApi.getExpiredDeals(params),
    ...options,
  });
};

// Analytics Hooks
export const useDealAnalytics = (
  id: string,
  params?: DealStatsParams,
  options?: UseQueryOptions<ApiResponse<DealAnalytics>>
) => {
  return useQuery({
    queryKey: ['deal-analytics', id, params],
    queryFn: () => dealApi.getDealAnalytics(id, params),
    enabled: !!id,
    ...options,
  });
};

export const useDealStats = (
  params?: DealStatsParams,
  options?: UseQueryOptions<ApiResponse<{
    totalDeals: number;
    activeDeals: number;
    totalRevenue: number;
    totalConversions: number;
    averageConversionRate: number;
    topPerformingDeals: Deal[];
    revenueByType: Array<{ type: string; revenue: number; count: number }>;
    performanceByDay: Array<{ date: string; revenue: number; conversions: number }>;
  }>>
) => {
  return useQuery({
    queryKey: ['deal-stats', params],
    queryFn: () => dealApi.getDealStats(params),
    ...options,
  });
};

export const useDealPerformance = (
  params?: DealStatsParams,
  options?: UseQueryOptions<ApiResponse<{
    deals: Array<{
      dealId: string;
      title: string;
      views: number;
      clicks: number;
      conversions: number;
      revenue: number;
      ctr: number;
      conversionRate: number;
      roi: number;
    }>;
    summary: {
      totalViews: number;
      totalClicks: number;
      totalConversions: number;
      totalRevenue: number;
      averageCTR: number;
      averageConversionRate: number;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['deal-performance', params],
    queryFn: () => dealApi.getDealPerformance(params),
    ...options,
  });
};

// Template Hooks
export const useDealTemplates = (
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<DealTemplate[]>>
) => {
  return useQuery({
    queryKey: ['deal-templates', params],
    queryFn: () => dealApi.getDealTemplates(params),
    ...options,
  });
};

export const useDealTemplate = (
  id: string,
  options?: UseQueryOptions<ApiResponse<DealTemplate>>
) => {
  return useQuery({
    queryKey: ['deal-template', id],
    queryFn: () => dealApi.getDealTemplate(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateDealTemplate = (
  options?: UseMutationOptions<ApiResponse<DealTemplate>, Error, {
    name: string;
    description: string;
    type: Deal['type'];
    config: Partial<Deal>;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.createDealTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-templates'] });
    },
    ...options,
  });
};

export const useUpdateDealTemplate = (
  options?: UseMutationOptions<ApiResponse<DealTemplate>, Error, { id: string; data: Partial<{
    name: string;
    description: string;
    config: Partial<Deal>;
    category: string;
    tags: string[];
    isPublic: boolean;
  }> }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => dealApi.updateDealTemplate(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deal-template', id] });
      queryClient.invalidateQueries({ queryKey: ['deal-templates'] });
    },
    ...options,
  });
};

export const useDeleteDealTemplate = (
  options?: UseMutationOptions<ApiResponse<void>, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.deleteDealTemplate,
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: ['deal-template', id] });
      queryClient.invalidateQueries({ queryKey: ['deal-templates'] });
    },
    ...options,
  });
};

export const useCreateDealFromTemplate = (
  options?: UseMutationOptions<ApiResponse<Deal>, Error, { templateId: string; data: {
    title: string;
    startDate: string;
    endDate: string;
    overrides?: Partial<Deal>;
  } }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, data }) => dealApi.createDealFromTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
    ...options,
  });
};

// Flash Sale Hooks
export const useFlashSales = (
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<FlashSale[]>>
) => {
  return useQuery({
    queryKey: ['flash-sales', params],
    queryFn: () => dealApi.getFlashSales(params),
    ...options,
  });
};

export const useFlashSale = (
  id: string,
  options?: UseQueryOptions<ApiResponse<FlashSale>>
) => {
  return useQuery({
    queryKey: ['flash-sale', id],
    queryFn: () => dealApi.getFlashSale(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateFlashSale = (
  options?: UseMutationOptions<ApiResponse<FlashSale>, Error, {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    products: Array<{
      productId: string;
      salePrice: number;
      quantity?: number;
    }>;
    quickBuyEnabled?: boolean;
    notifyUsers?: boolean;
  }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.createFlashSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flash-sales'] });
    },
    ...options,
  });
};

export const useUpdateFlashSale = (
  options?: UseMutationOptions<ApiResponse<FlashSale>, Error, { id: string; data: Partial<{
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    notifyUsers: boolean;
  }> }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => dealApi.updateFlashSale(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['flash-sale', id] });
      queryClient.invalidateQueries({ queryKey: ['flash-sales'] });
    },
    ...options,
  });
};

export const useDeleteFlashSale = (
  options?: UseMutationOptions<ApiResponse<void>, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.deleteFlashSale,
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: ['flash-sale', id] });
      queryClient.invalidateQueries({ queryKey: ['flash-sales'] });
    },
    ...options,
  });
};

export const useActiveFlashSales = (
  options?: UseQueryOptions<ApiResponse<FlashSale[]>>
) => {
  return useQuery({
    queryKey: ['active-flash-sales'],
    queryFn: () => dealApi.getActiveFlashSales(),
    ...options,
  });
};

export const useUpcomingFlashSales = (
  options?: UseQueryOptions<ApiResponse<FlashSale[]>>
) => {
  return useQuery({
    queryKey: ['upcoming-flash-sales'],
    queryFn: () => dealApi.getUpcomingFlashSales(),
    ...options,
  });
};

// Campaign Hooks
export const useDealCampaigns = (
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<DealCampaign[]>>
) => {
  return useQuery({
    queryKey: ['deal-campaigns', params],
    queryFn: () => dealApi.getDealCampaigns(params),
    ...options,
  });
};

export const useDealCampaign = (
  id: string,
  options?: UseQueryOptions<ApiResponse<DealCampaign>>
) => {
  return useQuery({
    queryKey: ['deal-campaign', id],
    queryFn: () => dealApi.getDealCampaign(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateDealCampaign = (
  options?: UseMutationOptions<ApiResponse<DealCampaign>, Error, {
    name: string;
    description: string;
    type: DealCampaign['type'];
    startDate: string;
    endDate: string;
    deals: string[];
    targetAudience?: string[];
    budget?: number;
  }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.createDealCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-campaigns'] });
    },
    ...options,
  });
};

export const useUpdateDealCampaign = (
  options?: UseMutationOptions<ApiResponse<DealCampaign>, Error, { id: string; data: Partial<{
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    budget: number;
    targetAudience: string[];
  }> }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => dealApi.updateDealCampaign(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deal-campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['deal-campaigns'] });
    },
    ...options,
  });
};

export const useDeleteDealCampaign = (
  options?: UseMutationOptions<ApiResponse<void>, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.deleteDealCampaign,
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: ['deal-campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['deal-campaigns'] });
    },
    ...options,
  });
};

export const useCampaignAnalytics = (
  id: string,
  options?: UseQueryOptions<ApiResponse<{
    campaign: DealCampaign;
    performance: {
      impressions: number;
      clicks: number;
      conversions: number;
      revenue: number;
      ctr: number;
      conversionRate: number;
      roi: number;
      costPerAcquisition: number;
    };
    dealPerformance: Array<{
      dealId: string;
      title: string;
      views: number;
      conversions: number;
      revenue: number;
    }>;
  }>>
) => {
  return useQuery({
    queryKey: ['campaign-analytics', id],
    queryFn: () => dealApi.getCampaignAnalytics(id),
    enabled: !!id,
    ...options,
  });
};

// Bulk Operations Hooks
export const useBulkUpdateDeals = (
  options?: UseMutationOptions<ApiResponse<{
    success: number;
    failed: number;
    errors: Array<{ dealId: string; error: string }>;
  }>, Error, BulkDealOperation>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.bulkUpdateDeals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-stats'] });
    },
    ...options,
  });
};

export const useBulkDeleteDeals = (
  options?: UseMutationOptions<ApiResponse<{
    deleted: number;
    failed: number;
    errors: Array<{ dealId: string; error: string }>;
  }>, Error, string[]>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dealApi.bulkDeleteDeals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-stats'] });
    },
    ...options,
  });
};

// Import/Export Hooks
export const useImportDeals = (
  options?: UseMutationOptions<ApiResponse<{
    imported: number;
    updated: number;
    errors: Array<{ row: number; error: string }>;
    preview?: Deal[];
  }>, Error, { file: File; options?: {
    skipErrors?: boolean;
    updateExisting?: boolean;
    dryRun?: boolean;
  } }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }) => dealApi.importDeals(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-stats'] });
    },
    ...options,
  });
};

export const useExportDeals = (
  options?: UseMutationOptions<ApiResponse<{ downloadUrl: string; filename: string }>, Error, {
    format?: 'csv' | 'xlsx' | 'json';
    dealIds?: string[];
    status?: Deal['status'];
    type?: Deal['type'];
    startDate?: string;
    endDate?: string;
    includeAnalytics?: boolean;
  }>
) => {
  return useMutation({
    mutationFn: dealApi.exportDeals,
    ...options,
  });
};

// Recommendation Hooks
export const useDealRecommendations = (
  dealId: string,
  type?: DealRecommendation['type'],
  options?: UseQueryOptions<ApiResponse<DealRecommendation[]>>
) => {
  return useQuery({
    queryKey: ['deal-recommendations', dealId, type],
    queryFn: () => dealApi.getDealRecommendations(dealId, type),
    enabled: !!dealId,
    ...options,
  });
};

export const usePersonalizedDeals = (
  userId: string,
  params?: {
    limit?: number;
    category?: string;
    priceRange?: { min: number; max: number };
  },
  options?: UseQueryOptions<ApiResponse<Deal[]>>
) => {
  return useQuery({
    queryKey: ['personalized-deals', userId, params],
    queryFn: () => dealApi.getPersonalizedDeals(userId, params),
    enabled: !!userId,
    ...options,
  });
};

// Search Hooks
export const useSearchDeals = (
  query: string,
  params?: {
    limit?: number;
    filters?: {
      type?: Deal['type'];
      status?: Deal['status'];
      priceRange?: { min: number; max: number };
      dateRange?: { start: string; end: string };
      category?: string;
    };
  },
  options?: UseQueryOptions<ApiResponse<Deal[]>>
) => {
  return useQuery({
    queryKey: ['search-deals', query, params],
    queryFn: () => dealApi.searchDeals(query, params),
    enabled: !!query && query.length >= 2,
    ...options,
  });
};

// Validation Hooks
export const useValidateDeal = (
  options?: UseMutationOptions<ApiResponse<{
    valid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string }>;
    suggestions: string[];
  }>, Error, CreateDealRequest>
) => {
  return useMutation({
    mutationFn: dealApi.validateDeal,
    ...options,
  });
};

export const usePreviewDeal = (
  options?: UseMutationOptions<ApiResponse<{
    deal: Deal;
    estimatedSavings: number;
    estimatedRevenue: number;
    similarDeals: Deal[];
    recommendations: string[];
  }>, Error, CreateDealRequest>
) => {
  return useMutation({
    mutationFn: dealApi.previewDeal,
    ...options,
  });
};

// Notification Hooks
export const useNotifyDealStart = (
  options?: UseMutationOptions<ApiResponse<{ sent: number; failed: number }>, Error, string>
) => {
  return useMutation({
    mutationFn: dealApi.notifyDealStart,
    ...options,
  });
};

export const useNotifyDealEnd = (
  options?: UseMutationOptions<ApiResponse<{ sent: number; failed: number }>, Error, string>
) => {
  return useMutation({
    mutationFn: dealApi.notifyDealEnd,
    ...options,
  });
};

export const useScheduleDealNotification = (
  options?: UseMutationOptions<ApiResponse<{ scheduled: boolean; scheduledId: string }>, Error, { id: string; data: {
    type: 'start' | 'end' | 'reminder' | 'low_stock';
    scheduledAt: string;
    audience?: string[];
    message?: string;
  } }>
) => {
  return useMutation({
    mutationFn: ({ id, data }) => dealApi.scheduleDealNotification(id, data),
    ...options,
  });
};

export default dealApi;

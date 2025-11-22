import { 
  useMutation, 
  useQuery, 
  useQueryClient, 
  useInfiniteQuery
} from '@tanstack/react-query';
import { httpClient } from './client';
import { 
  ApiResponse, 
  Sale, 
  SearchParams,
  Product,
  Category
} from './types';

// ==================== INTERFACES ====================

export interface SaleDetailed extends Omit<Sale, 'products' | 'categories'> {
  products: SaleProduct[];
  categories: SaleCategory[];
  conditions: SaleCondition[];
  analytics: SaleAnalytics;
  targeting: SaleTargeting;
  automation: SaleAutomation;
  performance: SalePerformance;
  settings: SaleSettings;
  campaign: SaleCampaign;
  variants: SaleVariant[];
  schedule: SaleSchedule;
  inventory: SaleInventory;
  notifications: SaleNotification[];
  createdBy: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
}

export interface SaleProduct {
  id: string;
  productId: string;
  product: Product;
  originalPrice: number;
  salePrice: number;
  discountAmount: number;
  discountPercentage: number;
  maxQuantity?: number;
  minQuantity?: number;
  inventory: {
    available: number;
    reserved: number;
    sold: number;
    remaining: number;
  };
  performance: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  };
  customDiscounts: SaleCustomDiscount[];
  bundleOptions: SaleBundleOption[];
  variantPricing: SaleVariantPricing[];
  isActive: boolean;
  addedAt: string;
  updatedAt: string;
}

export interface SaleCategory {
  id: string;
  categoryId: string;
  category: Category;
  discountType: 'percentage' | 'fixed' | 'tiered';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  excludeProducts?: string[];
  includeSubcategories: boolean;
  tierRules?: SaleTierRule[];
  isActive: boolean;
  addedAt: string;
  updatedAt: string;
}

export interface SaleCondition {
  id: string;
  type: 'minimum_order' | 'user_group' | 'location' | 'time_range' | 'purchase_history' | 'custom';
  operator: 'equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between' | 'contains';
  value: string | number | boolean | string[] | number[];
  field?: string;
  description: string;
  isActive: boolean;
  priority: number;
}

export interface SaleAnalytics {
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  refunds: number;
  netRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  clickThroughRate: number;
  returnRate: number;
  customerAcquisition: number;
  customerRetention: number;
  profitMargin: number;
  roi: number;
  engagementMetrics: {
    shares: number;
    likes: number;
    comments: number;
    saves: number;
    emailOpens: number;
    emailClicks: number;
  };
  demographics: {
    ageGroups: Array<{ range: string; count: number; revenue: number }>;
    genders: Array<{ gender: string; count: number; revenue: number }>;
    locations: Array<{ country: string; city: string; count: number; revenue: number }>;
  };
  deviceMetrics: {
    desktop: { views: number; conversions: number; revenue: number };
    mobile: { views: number; conversions: number; revenue: number };
    tablet: { views: number; conversions: number; revenue: number };
  };
  timeMetrics: {
    hourlyData: Array<{ hour: number; views: number; conversions: number; revenue: number }>;
    dailyData: Array<{ date: string; views: number; conversions: number; revenue: number }>;
    weeklyData: Array<{ week: string; views: number; conversions: number; revenue: number }>;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    sales: number;
    revenue: number;
    discountGiven: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    averageOrderValue: number;
  }>;
}

export interface SaleTargeting {
  userGroups: string[];
  locations: {
    countries: string[];
    states: string[];
    cities: string[];
    excludeLocations: string[];
  };
  demographics: {
    ageRange: [number, number];
    genders: string[];
    interests: string[];
    behaviors: string[];
  };
  purchase: {
    minimumOrders: number;
    maximumOrders?: number;
    totalSpent: [number, number];
    lastPurchase: [string, string];
    favoriteCategories: string[];
    brandPreferences: string[];
  };
  device: {
    types: ('desktop' | 'mobile' | 'tablet')[];
    operatingSystems: string[];
    browsers: string[];
  };
  timing: {
    timeZones: string[];
    preferredHours: number[];
    daysOfWeek: number[];
    seasons: string[];
  };
  custom: {
    segments: string[];
    attributes: Record<string, string | number | boolean>;
    rules: SaleTargetingRule[];
  };
}

export interface SaleTargetingRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'contains';
  value: string | number | boolean | string[];
  weight: number;
}

export interface SaleAutomation {
  triggers: SaleTrigger[];
  actions: SaleAction[];
  workflows: SaleWorkflow[];
  rules: SaleRule[];
  notifications: SaleNotificationRule[];
  optimizations: SaleOptimization[];
  abTests: SaleABTest[];
}

export interface SaleTrigger {
  id: string;
  type: 'time' | 'inventory' | 'performance' | 'user_action' | 'external';
  condition: Record<string, unknown>;
  isActive: boolean;
  priority: number;
  cooldown?: number;
  maxExecutions?: number;
  executionCount: number;
}

export interface SaleAction {
  id: string;
  type: 'send_notification' | 'update_price' | 'change_status' | 'create_coupon' | 'send_email' | 'update_inventory';
  parameters: Record<string, unknown>;
  isActive: boolean;
  executionOrder: number;
  conditions?: Record<string, unknown>;
}

export interface SaleWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: string[];
  isActive: boolean;
  executionCount: number;
  lastExecuted?: string;
  averageExecutionTime: number;
}

export interface SaleRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
  executionCount: number;
  successRate: number;
}

export interface SaleNotificationRule {
  id: string;
  event: 'start' | 'end' | 'low_inventory' | 'high_performance' | 'low_performance' | 'error';
  channels: ('email' | 'sms' | 'push' | 'webhook')[];
  recipients: string[];
  template: string;
  conditions?: Record<string, unknown>;
  isActive: boolean;
}

export interface SaleOptimization {
  id: string;
  type: 'price' | 'inventory' | 'targeting' | 'schedule' | 'promotion';
  algorithm: 'ml' | 'rule_based' | 'manual';
  parameters: Record<string, unknown>;
  isActive: boolean;
  performance: {
    improvements: number;
    confidence: number;
    lastOptimized: string;
  };
}

export interface SaleABTest {
  id: string;
  name: string;
  description: string;
  variants: SaleABTestVariant[];
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  metrics: string[];
  results?: SaleABTestResults;
  confidence: number;
  significance: number;
}

export interface SaleABTestVariant {
  id: string;
  name: string;
  trafficPercentage: number;
  isControl: boolean;
  config: Record<string, unknown>;
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

export interface SaleABTestResults {
  winner?: string;
  uplift: number;
  confidence: number;
  significance: number;
  summary: string;
  recommendations: string[];
}

export interface SalePerformance {
  currentMetrics: {
    activeUsers: number;
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    averageSessionDuration: number;
    conversionFunnel: Array<{
      stage: string;
      count: number;
      percentage: number;
    }>;
  };
  comparisons: {
    previousPeriod: {
      revenue: { current: number; previous: number; change: number };
      conversions: { current: number; previous: number; change: number };
      averageOrderValue: { current: number; previous: number; change: number };
    };
    benchmark: {
      industryAverage: number;
      competitorData?: Array<{
        competitor: string;
        metric: string;
        value: number;
      }>;
    };
  };
  forecasting: {
    predictedRevenue: number;
    predictedConversions: number;
    confidence: number;
    factors: string[];
  };
  heatmaps: {
    productPopularity: Array<{
      productId: string;
      score: number;
      interactions: number;
    }>;
    timeActivity: Array<{
      hour: number;
      activity: number;
    }>;
    geographicDistribution: Array<{
      location: string;
      activity: number;
    }>;
  };
}

export interface SaleSettings {
  display: {
    showCountdown: boolean;
    showProgressBar: boolean;
    showSavings: boolean;
    showOriginalPrice: boolean;
    badgeStyle: 'percentage' | 'amount' | 'custom';
    badgeColor: string;
    badgePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  behavior: {
    stackWithCoupons: boolean;
    stackWithOtherSales: boolean;
    applyToVariants: boolean;
    inheritFromParent: boolean;
    priorityLevel: number;
  };
  restrictions: {
    maxUsagePerCustomer?: number;
    maxTotalUsage?: number;
    minimumCartValue?: number;
    maximumCartValue?: number;
    applicablePaymentMethods: string[];
    excludedPaymentMethods: string[];
  };
  notifications: {
    notifyOnStart: boolean;
    notifyOnEnd: boolean;
    notifyOnLowInventory: boolean;
    reminderSettings: {
      enabled: boolean;
      intervals: number[];
      maxReminders: number;
    };
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    structuredData: Record<string, unknown>;
    socialSharing: {
      enabled: boolean;
      title?: string;
      description?: string;
      image?: string;
    };
  };
  accessibility: {
    altTexts: Record<string, string>;
    ariaLabels: Record<string, string>;
    keyboardNavigation: boolean;
    screenReaderOptimized: boolean;
  };
}

export interface SaleCampaign {
  id: string;
  name: string;
  type: 'seasonal' | 'clearance' | 'flash' | 'promotional' | 'bundle' | 'loyalty';
  theme: string;
  assets: {
    banners: Array<{
      size: string;
      url: string;
      alt: string;
    }>;
    videos: Array<{
      url: string;
      thumbnail: string;
      duration: number;
    }>;
    copy: {
      headlines: string[];
      descriptions: string[];
      callToActions: string[];
    };
  };
  channels: Array<{
    type: 'email' | 'sms' | 'push' | 'social' | 'display' | 'search';
    isActive: boolean;
    budget?: number;
    targeting?: Record<string, unknown>;
  }>;
  budget: {
    total: number;
    spent: number;
    remaining: number;
    distribution: Record<string, number>;
  };
  timeline: {
    preparation: { start: string; end: string; status: string };
    launch: { start: string; end: string; status: string };
    active: { start: string; end: string; status: string };
    analysis: { start: string; end: string; status: string };
  };
}

export interface SaleVariant {
  id: string;
  name: string;
  description: string;
  config: Partial<SaleDetailed>;
  isActive: boolean;
  trafficPercentage: number;
  performance: {
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  };
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleSchedule {
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    weeksOfMonth?: number[];
    monthsOfYear?: number[];
    endDate?: string;
    maxOccurrences?: number;
  };
  timeZone: string;
  preparation: {
    duration: number; // hours before start
    tasks: Array<{
      name: string;
      duration: number;
      dependencies: string[];
      assignee?: string;
      status: 'pending' | 'in_progress' | 'completed';
    }>;
  };
  execution: {
    autoStart: boolean;
    autoEnd: boolean;
    rollbackPlan: {
      enabled: boolean;
      triggers: string[];
      actions: string[];
    };
  };
  notifications: {
    preparation: { enabled: boolean; advance: number };
    start: { enabled: boolean; recipients: string[] };
    milestones: Array<{
      percentage: number;
      enabled: boolean;
      recipients: string[];
    }>;
    end: { enabled: boolean; recipients: string[] };
    issues: { enabled: boolean; recipients: string[] };
  };
}

export interface SaleInventory {
  tracking: {
    enabled: boolean;
    method: 'automatic' | 'manual' | 'hybrid';
    updateFrequency: number; // minutes
  };
  allocation: {
    method: 'first_come_first_served' | 'proportional' | 'priority_based';
    reservationTime: number; // minutes
    overbookingAllowed: boolean;
    overbookingPercentage?: number;
  };
  thresholds: {
    lowStock: number;
    outOfStock: number;
    reorderPoint: number;
    maxStock?: number;
  };
  replenishment: {
    automatic: boolean;
    suppliers: string[];
    leadTime: number; // days
    minimumOrder: number;
    bufferStock: number;
  };
  forecasting: {
    enabled: boolean;
    algorithm: 'linear' | 'seasonal' | 'ml';
    horizon: number; // days
    accuracy: number;
    factors: string[];
  };
}

export interface SaleNotification {
  id: string;
  type: 'system' | 'user' | 'admin';
  event: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  recipients: string[];
  channels: string[];
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface SaleCustomDiscount {
  id: string;
  name: string;
  type: 'quantity' | 'value' | 'user_group' | 'loyalty' | 'custom';
  rules: Array<{
    condition: Record<string, unknown>;
    discount: {
      type: 'percentage' | 'fixed';
      value: number;
      maxAmount?: number;
    };
  }>;
  isActive: boolean;
  priority: number;
}

export interface SaleBundleOption {
  id: string;
  name: string;
  products: string[];
  discountType: 'percentage' | 'fixed' | 'buy_x_get_y';
  discountValue: number;
  minQuantity: number;
  maxQuantity?: number;
  isActive: boolean;
}

export interface SaleVariantPricing {
  variantId: string;
  originalPrice: number;
  salePrice: number;
  inventory?: {
    available: number;
    reserved: number;
  };
}

export interface SaleTierRule {
  minQuantity: number;
  maxQuantity?: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  label?: string;
}

export interface SaleCreate {
  name: string;
  description?: string;
  image?: File;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  products?: string[];
  categories?: string[];
  conditions?: Omit<SaleCondition, 'id'>[];
  targeting?: Partial<SaleTargeting>;
  settings?: Partial<SaleSettings>;
  campaign?: Partial<SaleCampaign>;
  schedule?: Partial<SaleSchedule>;
  inventory?: Partial<SaleInventory>;
  isActive?: boolean;
  autoStart?: boolean;
  autoEnd?: boolean;
}

export interface SaleUpdate {
  name?: string;
  description?: string;
  image?: File;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  products?: string[];
  categories?: string[];
  conditions?: Partial<SaleCondition>[];
  targeting?: Partial<SaleTargeting>;
  settings?: Partial<SaleSettings>;
  campaign?: Partial<SaleCampaign>;
  schedule?: Partial<SaleSchedule>;
  inventory?: Partial<SaleInventory>;
  isActive?: boolean;
  status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
}

export interface SaleSearch extends SearchParams {
  status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
  discountType?: 'percentage' | 'fixed';
  minDiscount?: number;
  maxDiscount?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  productId?: string;
  categoryId?: string;
  hasProducts?: boolean;
  hasCategories?: boolean;
  hasConditions?: boolean;
  campaignType?: 'seasonal' | 'clearance' | 'flash' | 'promotional' | 'bundle' | 'loyalty';
  createdBy?: string;
  minRevenue?: number;
  maxRevenue?: number;
  minConversions?: number;
  maxConversions?: number;
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'revenue' | 'conversions' | 'discountValue' | 'name';
  includeAnalytics?: boolean;
  includePerformance?: boolean;
  includeProducts?: boolean;
  includeCategories?: boolean;
}

export interface SaleBulkAction {
  saleIds: string[];
  action: 'activate' | 'deactivate' | 'pause' | 'resume' | 'delete' | 'duplicate' | 'extend' | 'archive';
  params?: Record<string, unknown>;
  reason?: string;
  notify?: boolean;
  scheduleAt?: string;
}

export interface SaleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'seasonal' | 'clearance' | 'flash' | 'promotional' | 'bundle' | 'loyalty';
  config: Partial<SaleDetailed>;
  preview: {
    image?: string;
    description: string;
    features: string[];
  };
  customization: {
    fields: Array<{
      name: string;
      type: 'text' | 'number' | 'date' | 'boolean' | 'select';
      required: boolean;
      options?: string[];
      defaultValue?: unknown;
    }>;
    rules: Array<{
      field: string;
      condition: string;
      action: string;
    }>;
  };
  isPublic: boolean;
  usageCount: number;
  rating: number;
  reviews: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== API SERVICE CLASS ====================

export class SaleApiService {
  private readonly baseUrl = '/api/v1/sales';

  // ==================== CRUD Operations ====================

  async getAll(params?: SaleSearch): Promise<ApiResponse<SaleDetailed[]>> {
    return httpClient.get(this.baseUrl, { params });
  }

  async getById(id: string, includeAnalytics = false): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.get(`${this.baseUrl}/${id}`, { 
      params: { includeAnalytics } 
    });
  }

  async getActive(params?: Omit<SaleSearch, 'status'>): Promise<ApiResponse<SaleDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/active`, { params });
  }

  async getUpcoming(params?: Omit<SaleSearch, 'status'>): Promise<ApiResponse<SaleDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/upcoming`, { params });
  }

  async getPast(params?: Omit<SaleSearch, 'status'>): Promise<ApiResponse<SaleDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/past`, { params });
  }

  async create(data: SaleCreate): Promise<ApiResponse<SaleDetailed>> {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('name', data.name);
    formData.append('discountType', data.discountType);
    formData.append('discountValue', String(data.discountValue));
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    if (data.products) formData.append('products', JSON.stringify(data.products));
    if (data.categories) formData.append('categories', JSON.stringify(data.categories));
    if (data.conditions) formData.append('conditions', JSON.stringify(data.conditions));
    if (data.targeting) formData.append('targeting', JSON.stringify(data.targeting));
    if (data.settings) formData.append('settings', JSON.stringify(data.settings));
    if (data.campaign) formData.append('campaign', JSON.stringify(data.campaign));
    if (data.schedule) formData.append('schedule', JSON.stringify(data.schedule));
    if (data.inventory) formData.append('inventory', JSON.stringify(data.inventory));
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
    if (data.autoStart !== undefined) formData.append('autoStart', String(data.autoStart));
    if (data.autoEnd !== undefined) formData.append('autoEnd', String(data.autoEnd));

    return httpClient.upload(this.baseUrl, formData);
  }

  async update(id: string, data: SaleUpdate): Promise<ApiResponse<SaleDetailed>> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return httpClient.upload(`${this.baseUrl}/${id}`, formData);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<{ deleted: string[]; failed: string[] }>> {
    return httpClient.post(`${this.baseUrl}/bulk-delete`, { ids });
  }

  async duplicate(id: string, options?: {
    name?: string;
    adjustDates?: boolean;
    copyAnalytics?: boolean;
    copySettings?: boolean;
  }): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/duplicate`, options);
  }

  // ==================== Status Management ====================

  async activate(id: string): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/activate`);
  }

  async deactivate(id: string): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/deactivate`);
  }

  async pause(id: string, reason?: string): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/pause`, { reason });
  }

  async resume(id: string): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/resume`);
  }

  async extend(id: string, newEndDate: string, reason?: string): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/extend`, { newEndDate, reason });
  }

  async end(id: string, reason?: string): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/end`, { reason });
  }

  async cancel(id: string, reason: string): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/cancel`, { reason });
  }

  async schedule(id: string, startDate: string, endDate?: string): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/schedule`, { startDate, endDate });
  }

  // ==================== Product & Category Management ====================

  async addProducts(id: string, productIds: string[]): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/products`, { productIds });
  }

  async removeProducts(id: string, productIds: string[]): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.delete(`${this.baseUrl}/${id}/products`, { data: { productIds } });
  }

  async updateProductPricing(id: string, productId: string, pricing: {
    salePrice: number;
    maxQuantity?: number;
    minQuantity?: number;
  }): Promise<ApiResponse<SaleProduct>> {
    return httpClient.put(`${this.baseUrl}/${id}/products/${productId}/pricing`, pricing);
  }

  async addCategories(id: string, categoryIds: string[]): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/categories`, { categoryIds });
  }

  async removeCategories(id: string, categoryIds: string[]): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.delete(`${this.baseUrl}/${id}/categories`, { data: { categoryIds } });
  }

  async updateCategoryDiscount(id: string, categoryId: string, discount: {
    discountType: 'percentage' | 'fixed' | 'tiered';
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
  }): Promise<ApiResponse<SaleCategory>> {
    return httpClient.put(`${this.baseUrl}/${id}/categories/${categoryId}/discount`, discount);
  }

  // ==================== Analytics & Performance ====================

  async getAnalytics(id: string, params?: {
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
    includeComparison?: boolean;
    includeForecast?: boolean;
  }): Promise<ApiResponse<SaleAnalytics>> {
    return httpClient.get(`${this.baseUrl}/${id}/analytics`, { params });
  }

  async getPerformance(id: string): Promise<ApiResponse<SalePerformance>> {
    return httpClient.get(`${this.baseUrl}/${id}/performance`);
  }

  async getRevenueBreakdown(id: string, params?: {
    groupBy?: 'product' | 'category' | 'time' | 'customer';
    period?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<Array<{
    group: string;
    revenue: number;
    orders: number;
    quantity: number;
    percentage: number;
  }>>> {
    return httpClient.get(`${this.baseUrl}/${id}/revenue-breakdown`, { params });
  }

  async getConversionFunnel(id: string): Promise<ApiResponse<Array<{
    stage: string;
    count: number;
    percentage: number;
    dropOffRate: number;
  }>>> {
    return httpClient.get(`${this.baseUrl}/${id}/conversion-funnel`);
  }

  async getCustomerSegmentation(id: string): Promise<ApiResponse<Array<{
    segment: string;
    customers: number;
    revenue: number;
    averageOrderValue: number;
    retentionRate: number;
  }>>> {
    return httpClient.get(`${this.baseUrl}/${id}/customer-segmentation`);
  }

  // ==================== A/B Testing ====================

  async createABTest(id: string, test: {
    name: string;
    description: string;
    variants: Array<{
      name: string;
      trafficPercentage: number;
      isControl: boolean;
      config: Record<string, unknown>;
    }>;
    metrics: string[];
    duration: number;
  }): Promise<ApiResponse<SaleABTest>> {
    return httpClient.post(`${this.baseUrl}/${id}/ab-tests`, test);
  }

  async getABTests(id: string): Promise<ApiResponse<SaleABTest[]>> {
    return httpClient.get(`${this.baseUrl}/${id}/ab-tests`);
  }

  async startABTest(id: string, testId: string): Promise<ApiResponse<SaleABTest>> {
    return httpClient.post(`${this.baseUrl}/${id}/ab-tests/${testId}/start`);
  }

  async stopABTest(id: string, testId: string): Promise<ApiResponse<SaleABTest>> {
    return httpClient.post(`${this.baseUrl}/${id}/ab-tests/${testId}/stop`);
  }

  async getABTestResults(id: string, testId: string): Promise<ApiResponse<SaleABTestResults>> {
    return httpClient.get(`${this.baseUrl}/${id}/ab-tests/${testId}/results`);
  }

  // ==================== Templates ====================

  async getTemplates(category?: string): Promise<ApiResponse<SaleTemplate[]>> {
    return httpClient.get(`${this.baseUrl}/templates`, { 
      params: { category } 
    });
  }

  async createTemplate(data: Omit<SaleTemplate, 'id' | 'usageCount' | 'rating' | 'reviews' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SaleTemplate>> {
    return httpClient.post(`${this.baseUrl}/templates`, data);
  }

  async useTemplate(templateId: string, customization: Record<string, unknown>): Promise<ApiResponse<SaleDetailed>> {
    return httpClient.post(`${this.baseUrl}/templates/${templateId}/use`, { customization });
  }

  async updateTemplate(id: string, data: Partial<SaleTemplate>): Promise<ApiResponse<SaleTemplate>> {
    return httpClient.put(`${this.baseUrl}/templates/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/templates/${id}`);
  }

  // ==================== Bulk Operations ====================

  async bulkAction(action: SaleBulkAction): Promise<ApiResponse<{ processed: string[]; failed: string[] }>> {
    return httpClient.post(`${this.baseUrl}/bulk-action`, action);
  }

  async bulkUpdatePrices(updates: Array<{
    saleId: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    products?: Array<{
      productId: string;
      salePrice: number;
    }>;
  }>): Promise<ApiResponse<{ updated: string[]; failed: string[] }>> {
    return httpClient.post(`${this.baseUrl}/bulk-update-prices`, { updates });
  }

  async bulkSchedule(schedule: {
    saleIds: string[];
    startDate: string;
    endDate: string;
    timeZone?: string;
  }): Promise<ApiResponse<{ scheduled: string[]; failed: string[] }>> {
    return httpClient.post(`${this.baseUrl}/bulk-schedule`, schedule);
  }

  // ==================== Utilities ====================

  async search(params: SaleSearch): Promise<ApiResponse<SaleDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/search`, { params });
  }

  async validate(data: Partial<SaleCreate | SaleUpdate>): Promise<ApiResponse<{
    isValid: boolean;
    errors: Array<{
      field: string;
      message: string;
      code: string;
    }>;
    warnings: Array<{
      field: string;
      message: string;
      suggestion?: string;
    }>;
  }>> {
    return httpClient.post(`${this.baseUrl}/validate`, data);
  }

  async preview(id: string): Promise<ApiResponse<{
    url: string;
    expiresAt: string;
    screenshots: Array<{
      device: string;
      url: string;
    }>;
  }>> {
    return httpClient.get(`${this.baseUrl}/${id}/preview`);
  }

  async export(params?: {
    format?: 'json' | 'csv' | 'xlsx' | 'pdf';
    includeAnalytics?: boolean;
    includeProducts?: boolean;
    includeCategories?: boolean;
    dateRange?: [string, string];
    filters?: SaleSearch;
  }): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> {
    return httpClient.post(`${this.baseUrl}/export`, params);
  }

  async getRecentActivity(limit = 50): Promise<ApiResponse<Array<{
    id: string;
    type: 'create' | 'update' | 'activate' | 'deactivate' | 'pause' | 'resume' | 'end' | 'delete';
    saleId: string;
    sale: {
      id: string;
      name: string;
      status: string;
      discountValue: number;
    };
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    timestamp: string;
    changes?: Record<string, { from: unknown; to: unknown }>;
    metadata?: Record<string, unknown>;
  }>>> {
    return httpClient.get(`${this.baseUrl}/activity`, { params: { limit } });
  }

  async getConflicts(id: string): Promise<ApiResponse<Array<{
    type: 'sale' | 'coupon' | 'promotion';
    conflictId: string;
    name: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    resolution?: string;
  }>>> {
    return httpClient.get(`${this.baseUrl}/${id}/conflicts`);
  }

  async getRecommendations(params?: {
    category?: string;
    minRevenue?: number;
    timeframe?: 'week' | 'month' | 'quarter';
    includeSeasonality?: boolean;
  }): Promise<ApiResponse<Array<{
    type: 'optimization' | 'timing' | 'pricing' | 'targeting';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    confidence: number;
    actions: string[];
  }>>> {
    return httpClient.get(`${this.baseUrl}/recommendations`, { params });
  }
}

// Create service instance
export const saleApi = new SaleApiService();

// ==================== REACT QUERY HOOKS ====================

// Query Keys
export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (params?: SaleSearch) => [...saleKeys.lists(), params] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  active: () => [...saleKeys.all, 'active'] as const,
  upcoming: () => [...saleKeys.all, 'upcoming'] as const,
  past: () => [...saleKeys.all, 'past'] as const,
  analytics: (id: string, params?: unknown) => [...saleKeys.all, 'analytics', id, params] as const,
  performance: (id: string) => [...saleKeys.all, 'performance', id] as const,
  templates: (category?: string) => [...saleKeys.all, 'templates', category] as const,
  abTests: (id: string) => [...saleKeys.all, 'abTests', id] as const,
  search: (params: SaleSearch) => [...saleKeys.all, 'search', params] as const,
  activity: () => [...saleKeys.all, 'activity'] as const,
  conflicts: (id: string) => [...saleKeys.all, 'conflicts', id] as const,
  recommendations: (params?: unknown) => [...saleKeys.all, 'recommendations', params] as const,
};

// ==================== Query Hooks ====================

export function useSales(params?: SaleSearch) {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => saleApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSalesInfinite(params?: SaleSearch) {
  return useInfiniteQuery({
    queryKey: saleKeys.list(params),
    queryFn: ({ pageParam = 1 }) => 
      saleApi.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasNextPage) {
        return (lastPage.meta.page || 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useSaleById(id: string, includeAnalytics = false) {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => saleApi.getById(id, includeAnalytics),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useActiveSales(params?: Omit<SaleSearch, 'status'>) {
  return useQuery({
    queryKey: saleKeys.active(),
    queryFn: () => saleApi.getActive(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpcomingSales(params?: Omit<SaleSearch, 'status'>) {
  return useQuery({
    queryKey: saleKeys.upcoming(),
    queryFn: () => saleApi.getUpcoming(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePastSales(params?: Omit<SaleSearch, 'status'>) {
  return useQuery({
    queryKey: saleKeys.past(),
    queryFn: () => saleApi.getPast(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useSaleAnalytics(id: string, params?: {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  includeComparison?: boolean;
  includeForecast?: boolean;
}) {
  return useQuery({
    queryKey: saleKeys.analytics(id, params),
    queryFn: () => saleApi.getAnalytics(id, params),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSalePerformance(id: string) {
  return useQuery({
    queryKey: saleKeys.performance(id),
    queryFn: () => saleApi.getPerformance(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaleTemplates(category?: string) {
  return useQuery({
    queryKey: saleKeys.templates(category),
    queryFn: () => saleApi.getTemplates(category),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useSaleABTests(id: string) {
  return useQuery({
    queryKey: saleKeys.abTests(id),
    queryFn: () => saleApi.getABTests(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchSales(params: SaleSearch) {
  return useQuery({
    queryKey: saleKeys.search(params),
    queryFn: () => saleApi.search(params),
    enabled: !!(params.q || params.status || params.categoryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentSaleActivity(limit = 50) {
  return useQuery({
    queryKey: saleKeys.activity(),
    queryFn: () => saleApi.getRecentActivity(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useSaleConflicts(id: string) {
  return useQuery({
    queryKey: saleKeys.conflicts(id),
    queryFn: () => saleApi.getConflicts(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaleRecommendations(params?: {
  category?: string;
  minRevenue?: number;
  timeframe?: 'week' | 'month' | 'quarter';
  includeSeasonality?: boolean;
}) {
  return useQuery({
    queryKey: saleKeys.recommendations(params),
    queryFn: () => saleApi.getRecommendations(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ==================== Mutation Hooks ====================

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaleCreate) => saleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SaleUpdate }) =>
      saleApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => saleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useActivateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => saleApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.active() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useDeactivateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => saleApi.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.active() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function usePauseSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      saleApi.pause(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useResumeSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => saleApi.resume(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useExtendSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newEndDate, reason }: { id: string; newEndDate: string; reason?: string }) =>
      saleApi.extend(id, newEndDate, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useDuplicateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }: { 
      id: string; 
      options?: {
        name?: string;
        adjustDates?: boolean;
        copyAnalytics?: boolean;
        copySettings?: boolean;
      };
    }) => saleApi.duplicate(id, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useAddSaleProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productIds }: { id: string; productIds: string[] }) =>
      saleApi.addProducts(id, productIds),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
    },
  });
}

export function useCreateSaleABTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, test }: { 
      id: string; 
      test: {
        name: string;
        description: string;
        variants: Array<{
          name: string;
          trafficPercentage: number;
          isControl: boolean;
          config: Record<string, unknown>;
        }>;
        metrics: string[];
        duration: number;
      };
    }) => saleApi.createABTest(id, test),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.abTests(id) });
    },
  });
}

export function useBulkSaleAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: SaleBulkAction) => saleApi.bulkAction(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useCreateSaleTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<SaleTemplate, 'id' | 'usageCount' | 'rating' | 'reviews' | 'createdBy' | 'createdAt' | 'updatedAt'>) =>
      saleApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.templates() });
    },
  });
}

export function useUseSaleTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, customization }: { templateId: string; customization: Record<string, unknown> }) =>
      saleApi.useTemplate(templateId, customization),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.activity() });
    },
  });
}

export function useExportSales() {
  return useMutation({
    mutationFn: (params?: {
      format?: 'json' | 'csv' | 'xlsx' | 'pdf';
      includeAnalytics?: boolean;
      includeProducts?: boolean;
      includeCategories?: boolean;
      dateRange?: [string, string];
      filters?: SaleSearch;
    }) => saleApi.export(params),
  });
}

// Export all hooks as a convenience object
export const useSaleApi = {
  // Queries
  useSales,
  useSalesInfinite,
  useSaleById,
  useActiveSales,
  useUpcomingSales,
  usePastSales,
  useSaleAnalytics,
  useSalePerformance,
  useSaleTemplates,
  useSaleABTests,
  useSearchSales,
  useRecentSaleActivity,
  useSaleConflicts,
  useSaleRecommendations,
  
  // Mutations
  useCreateSale,
  useUpdateSale,
  useDeleteSale,
  useActivateSale,
  useDeactivateSale,
  usePauseSale,
  useResumeSale,
  useExtendSale,
  useDuplicateSale,
  useAddSaleProducts,
  useCreateSaleABTest,
  useBulkSaleAction,
  useCreateSaleTemplate,
  useUseSaleTemplate,
  useExportSales,
};

export default saleApi;

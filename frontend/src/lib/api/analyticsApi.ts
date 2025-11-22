import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  ApiResponse
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Analytics API Service
 * Handles analytics tracking, reporting, user behavior analysis, and business intelligence
 */



interface UserBehavior {
  userId: string;
  sessionId: string;
  totalSessions: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  totalPurchases: number;
  totalRevenue: number;
  averageOrderValue: number;
  mostViewedProducts: Array<{
    productId: string;
    name: string;
    views: number;
  }>;
  favoriteCategories: Array<{
    categoryId: string;
    name: string;
    views: number;
  }>;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  location: {
    country: string;
    city: string;
    timezone: string;
  };
  firstSeen: string;
  lastSeen: string;
}

interface AnalyticsReport {
  id: string;
  name: string;
  type: 'dashboard' | 'user_behavior' | 'product_performance' | 'revenue' | 'conversion' | 'custom';
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: Record<string, number | string>;
  charts: Array<{
    type: 'line' | 'bar' | 'pie' | 'area' | 'funnel' | 'heatmap';
    title: string;
    data: unknown[];
    config: Record<string, unknown>;
  }>;
  filters: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

class AnalyticsApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Event Tracking

  // Track analytics event
  async trackEvent(event: {
    type: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search' | 'click' | 'custom';
    name: string;
    properties?: Record<string, unknown>;
    url?: string;
    referrer?: string;
  }): Promise<ApiResponse<{ message: string; eventId: string }>> {
    return this.client.post<{ message: string; eventId: string }>(endpoints.analytics.track, event);
  }

  // Track page view
  async trackPageView(pageData: {
    url: string;
    title: string;
    referrer?: string;
    duration?: number;
    properties?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<{ message: string; eventId: string }>> {
    return this.client.post<{ message: string; eventId: string }>(endpoints.analytics.pageView, pageData);
  }

  // Track product view
  async trackProductView(productData: {
    productId: string;
    productName: string;
    categoryId?: string;
    price?: number;
    brand?: string;
    properties?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<{ message: string; eventId: string }>> {
    return this.client.post<{ message: string; eventId: string }>(endpoints.analytics.productView, productData);
  }

  // Track add to cart
  async trackAddToCart(cartData: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    categoryId?: string;
    variant?: string;
    properties?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<{ message: string; eventId: string }>> {
    return this.client.post<{ message: string; eventId: string }>(endpoints.analytics.addToCart, cartData);
  }

  // Track purchase
  async trackPurchase(purchaseData: {
    orderId: string;
    totalAmount: number;
    currency: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      categoryId?: string;
    }>;
    couponCode?: string;
    paymentMethod?: string;
    properties?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<{ message: string; eventId: string }>> {
    return this.client.post<{ message: string; eventId: string }>(endpoints.analytics.purchase, purchaseData);
  }

  // Track search
  async trackSearch(searchData: {
    query: string;
    resultsCount: number;
    filters?: Record<string, string | number | boolean>;
    sortBy?: string;
    page?: number;
    properties?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<{ message: string; eventId: string }>> {
    return this.client.post<{ message: string; eventId: string }>(endpoints.analytics.search, searchData);
  }

  // Track custom event
  async trackCustomEvent(eventData: {
    name: string;
    category: string;
    action: string;
    label?: string;
    value?: number;
    properties?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<{ message: string; eventId: string }>> {
    return this.client.post<{ message: string; eventId: string }>(endpoints.analytics.events, eventData);
  }

  // Batch track events
  async batchTrackEvents(events: Array<{
    type: string;
    name: string;
    properties?: Record<string, string | number | boolean>;
    timestamp?: string;
  }>): Promise<ApiResponse<{ message: string; processedCount: number }>> {
    return this.client.post<{ message: string; processedCount: number }>(endpoints.analytics.batchTrack, { events });
  }

  // User Behavior Analytics

  // Get user behavior data
  async getUserBehavior(userId?: string, dateRange?: {
    start: string;
    end: string;
  }): Promise<ApiResponse<UserBehavior>> {
    const params = {
      ...(userId && { userId }),
      ...(dateRange && { startDate: dateRange.start, endDate: dateRange.end }),
    };
    
    return this.client.get<UserBehavior>(endpoints.analytics.userBehavior, { params });
  }

  // Get user journey
  async getUserJourney(params?: {
    userId?: string;
    sessionId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<Array<{
    timestamp: string;
    event: string;
    page: string;
    action: string;
    properties: Record<string, string | number | boolean>;
    duration?: number;
  }>>> {
    const queryParams = {
      ...(params?.userId && { userId: params.userId }),
      ...(params?.sessionId && { sessionId: params.sessionId }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<Array<{
      timestamp: string;
      event: string;
      page: string;
      action: string;
      properties: Record<string, string | number | boolean>;
      duration?: number;
    }>>(endpoints.analytics.userJourney, { params: queryParams });
  }

  // Get session analytics
  async getSessionAnalytics(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    segmentBy?: 'device' | 'location' | 'source' | 'campaign';
  }): Promise<ApiResponse<{
    totalSessions: number;
    totalUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    pagesPerSession: number;
    newVsReturning: {
      newUsers: number;
      returningUsers: number;
    };
    topPages: Array<{
      url: string;
      title: string;
      views: number;
      uniqueViews: number;
      averageDuration: number;
    }>;
    topSources: Array<{
      source: string;
      sessions: number;
      users: number;
      conversionRate: number;
    }>;
    deviceBreakdown: Record<string, number>;
    locationBreakdown: Record<string, number>;
    hourlyDistribution: Array<{ hour: number; sessions: number }>;
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.segmentBy && { segmentBy: params.segmentBy }),
    };
    
    return this.client.get<{
      totalSessions: number;
      totalUsers: number;
      averageSessionDuration: number;
      bounceRate: number;
      pagesPerSession: number;
      newVsReturning: {
        newUsers: number;
        returningUsers: number;
      };
      topPages: Array<{
        url: string;
        title: string;
        views: number;
        uniqueViews: number;
        averageDuration: number;
      }>;
      topSources: Array<{
        source: string;
        sessions: number;
        users: number;
        conversionRate: number;
      }>;
      deviceBreakdown: Record<string, number>;
      locationBreakdown: Record<string, number>;
      hourlyDistribution: Array<{ hour: number; sessions: number }>;
    }>(endpoints.analytics.sessionAnalytics, { params: queryParams });
  }

  // Product Analytics

  // Get product performance
  async getProductPerformance(params?: {
    productId?: string;
    categoryId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    sortBy?: 'views' | 'conversions' | 'revenue' | 'add_to_cart';
    limit?: number;
  }): Promise<ApiResponse<Array<{
    productId: string;
    productName: string;
    views: number;
    uniqueViews: number;
    addToCartCount: number;
    purchaseCount: number;
    revenue: number;
    conversionRate: number;
    addToCartRate: number;
    averageViewDuration: number;
    bounceRate: number;
    category: string;
    brand?: string;
    trends: Array<{ date: string; views: number; purchases: number }>;
  }>>> {
    const queryParams = {
      ...(params?.productId && { productId: params.productId }),
      ...(params?.categoryId && { categoryId: params.categoryId }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.limit && { limit: params.limit }),
    };
    
    return this.client.get<Array<{
      productId: string;
      productName: string;
      views: number;
      uniqueViews: number;
      addToCartCount: number;
      purchaseCount: number;
      revenue: number;
      conversionRate: number;
      addToCartRate: number;
      averageViewDuration: number;
      bounceRate: number;
      category: string;
      brand?: string;
      trends: Array<{ date: string; views: number; purchases: number }>;
    }>>(endpoints.analytics.productPerformance, { params: queryParams });
  }

  // Get category analytics
  async getCategoryAnalytics(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<Array<{
    categoryId: string;
    categoryName: string;
    views: number;
    uniqueViews: number;
    productsViewed: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
    averageOrderValue: number;
    topProducts: Array<{
      productId: string;
      name: string;
      views: number;
      purchases: number;
    }>;
  }>>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<Array<{
      categoryId: string;
      categoryName: string;
      views: number;
      uniqueViews: number;
      productsViewed: number;
      purchases: number;
      revenue: number;
      conversionRate: number;
      averageOrderValue: number;
      topProducts: Array<{
        productId: string;
        name: string;
        views: number;
        purchases: number;
      }>;
    }>>(endpoints.analytics.categoryAnalytics, { params: queryParams });
  }

  // Sales & Revenue Analytics

  // Get revenue analytics
  async getRevenueAnalytics(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    granularity?: 'hour' | 'day' | 'week' | 'month';
    segmentBy?: 'product' | 'category' | 'location' | 'device' | 'source';
  }): Promise<ApiResponse<{
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    refundRate: number;
    timeline: Array<{
      date: string;
      revenue: number;
      orders: number;
      averageOrderValue: number;
    }>;
    topProducts: Array<{
      productId: string;
      name: string;
      revenue: number;
      orders: number;
    }>;
    topCategories: Array<{
      categoryId: string;
      name: string;
      revenue: number;
      orders: number;
    }>;
    paymentMethods: Record<string, {
      revenue: number;
      orders: number;
      percentage: number;
    }>;
    geographicDistribution: Record<string, {
      revenue: number;
      orders: number;
      customers: number;
    }>;
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.granularity && { granularity: params.granularity }),
      ...(params?.segmentBy && { segmentBy: params.segmentBy }),
    };
    
    return this.client.get<{
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
      conversionRate: number;
      refundRate: number;
      timeline: Array<{
        date: string;
        revenue: number;
        orders: number;
        averageOrderValue: number;
      }>;
      topProducts: Array<{
        productId: string;
        name: string;
        revenue: number;
        orders: number;
      }>;
      topCategories: Array<{
        categoryId: string;
        name: string;
        revenue: number;
        orders: number;
      }>;
      paymentMethods: Record<string, {
        revenue: number;
        orders: number;
        percentage: number;
      }>;
      geographicDistribution: Record<string, {
        revenue: number;
        orders: number;
        customers: number;
      }>;
    }>(endpoints.analytics.revenueAnalytics, { params: queryParams });
  }

  // Get conversion funnel
  async getConversionFunnel(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    segmentBy?: 'device' | 'location' | 'source' | 'campaign';
  }): Promise<ApiResponse<{
    totalVisitors: number;
    steps: Array<{
      name: string;
      users: number;
      conversionRate: number;
      dropOffRate: number;
    }>;
    segmentData?: Record<string, Array<{
      name: string;
      users: number;
      conversionRate: number;
    }>>;
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.segmentBy && { segmentBy: params.segmentBy }),
    };
    
    return this.client.get<{
      totalVisitors: number;
      steps: Array<{
        name: string;
        users: number;
        conversionRate: number;
        dropOffRate: number;
      }>;
      segmentData?: Record<string, Array<{
        name: string;
        users: number;
        conversionRate: number;
      }>>;
    }>(endpoints.analytics.conversionFunnel, { params: queryParams });
  }

  // Search Analytics

  // Get search analytics
  async getSearchAnalytics(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<{
    totalSearches: number;
    uniqueQueries: number;
    averageResultsPerSearch: number;
    zeroResultsRate: number;
    topQueries: Array<{
      query: string;
      count: number;
      resultsCount: number;
      clickThroughRate: number;
    }>;
    noResultsQueries: Array<{
      query: string;
      count: number;
    }>;
    searchTrends: Array<{
      date: string;
      searches: number;
      uniqueQueries: number;
    }>;
    popularFilters: Record<string, number>;
    conversionByQuery: Array<{
      query: string;
      searches: number;
      conversions: number;
      conversionRate: number;
    }>;
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<{
      totalSearches: number;
      uniqueQueries: number;
      averageResultsPerSearch: number;
      zeroResultsRate: number;
      topQueries: Array<{
        query: string;
        count: number;
        resultsCount: number;
        clickThroughRate: number;
      }>;
      noResultsQueries: Array<{
        query: string;
        count: number;
      }>;
      searchTrends: Array<{
        date: string;
        searches: number;
        uniqueQueries: number;
      }>;
      popularFilters: Record<string, number>;
      conversionByQuery: Array<{
        query: string;
        searches: number;
        conversions: number;
        conversionRate: number;
      }>;
    }>(endpoints.analytics.searchAnalytics, { params: queryParams });
  }

  // Reporting

  // Get dashboard data
  async getDashboard(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<{
    overview: {
      totalUsers: number;
      totalSessions: number;
      totalPageViews: number;
      totalRevenue: number;
      totalOrders: number;
      conversionRate: number;
      averageOrderValue: number;
      bounceRate: number;
    };
    trends: {
      users: Array<{ date: string; value: number }>;
      sessions: Array<{ date: string; value: number }>;
      revenue: Array<{ date: string; value: number }>;
      orders: Array<{ date: string; value: number }>;
    };
    topMetrics: {
      topPages: Array<{ url: string; views: number }>;
      topProducts: Array<{ name: string; views: number; revenue: number }>;
      topSources: Array<{ source: string; users: number; conversionRate: number }>;
      topCountries: Array<{ country: string; users: number; revenue: number }>;
    };
    realtimeData: {
      activeUsers: number;
      currentPageViews: number;
      topActivePages: Array<{ url: string; activeUsers: number }>;
    };
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<{
      overview: {
        totalUsers: number;
        totalSessions: number;
        totalPageViews: number;
        totalRevenue: number;
        totalOrders: number;
        conversionRate: number;
        averageOrderValue: number;
        bounceRate: number;
      };
      trends: {
        users: Array<{ date: string; value: number }>;
        sessions: Array<{ date: string; value: number }>;
        revenue: Array<{ date: string; value: number }>;
        orders: Array<{ date: string; value: number }>;
      };
      topMetrics: {
        topPages: Array<{ url: string; views: number }>;
        topProducts: Array<{ name: string; views: number; revenue: number }>;
        topSources: Array<{ source: string; users: number; conversionRate: number }>;
        topCountries: Array<{ country: string; users: number; revenue: number }>;
      };
      realtimeData: {
        activeUsers: number;
        currentPageViews: number;
        topActivePages: Array<{ url: string; activeUsers: number }>;
      };
    }>(endpoints.analytics.dashboard, { params: queryParams });
  }

  // Get custom report
  async getCustomReport(reportId: string, params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    filters?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<AnalyticsReport>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.filters && { filters: JSON.stringify(params.filters) }),
    };
    
    return this.client.get<AnalyticsReport>(endpoints.analytics.customReport(reportId), { params: queryParams });
  }

  // Create custom report
  async createCustomReport(report: {
    name: string;
    type: string;
    description: string;
    metrics: string[];
    dimensions: string[];
    filters?: Record<string, string | number | boolean>;
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<AnalyticsReport>> {
    return this.client.post<AnalyticsReport>(endpoints.analytics.reports, report);
  }

  // Export analytics data
  async exportData(params: {
    type: 'users' | 'sessions' | 'products' | 'revenue' | 'events';
    format: 'csv' | 'xlsx' | 'json';
    dateRange: {
      start: string;
      end: string;
    };
    filters?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(endpoints.analytics.export, {
      params,
      responseType: 'blob',
    });
  }

  // Real-time Analytics

  // Get real-time data
  async getRealTimeData(): Promise<ApiResponse<{
    activeUsers: number;
    activePageViews: number;
    topActivePages: Array<{
      url: string;
      title: string;
      activeUsers: number;
    }>;
    topSources: Array<{
      source: string;
      activeUsers: number;
    }>;
    deviceBreakdown: Record<string, number>;
    locationBreakdown: Record<string, number>;
    recentEvents: Array<{
      type: string;
      page: string;
      location: string;
      timestamp: string;
    }>;
  }>> {
    return this.client.get<{
      activeUsers: number;
      activePageViews: number;
      topActivePages: Array<{
        url: string;
        title: string;
        activeUsers: number;
      }>;
      topSources: Array<{
        source: string;
        activeUsers: number;
      }>;
      deviceBreakdown: Record<string, number>;
      locationBreakdown: Record<string, number>;
      recentEvents: Array<{
        type: string;
        page: string;
        location: string;
        timestamp: string;
      }>;
    }>(endpoints.analytics.realtime);
  }

  // Admin Operations

  // Get system analytics (Admin)
  async getSystemAnalytics(): Promise<ApiResponse<{
    dataPoints: number;
    storage: {
      used: string;
      available: string;
      percentage: number;
    };
    performance: {
      averageProcessingTime: number;
      eventsPerSecond: number;
      errorRate: number;
    };
    retention: {
      days30: number;
      days90: number;
      days365: number;
    };
    apiUsage: Array<{
      endpoint: string;
      requests: number;
      averageResponseTime: number;
      errorRate: number;
    }>;
  }>> {
    return this.client.get<{
      dataPoints: number;
      storage: {
        used: string;
        available: string;
        percentage: number;
      };
      performance: {
        averageProcessingTime: number;
        eventsPerSecond: number;
        errorRate: number;
      };
      retention: {
        days30: number;
        days90: number;
        days365: number;
      };
      apiUsage: Array<{
        endpoint: string;
        requests: number;
        averageResponseTime: number;
        errorRate: number;
      }>;
    }>(endpoints.analytics.admin.systemAnalytics);
  }

  // Configure analytics settings (Admin)
  async configureSettings(settings: {
    retention: {
      eventData: number; // days
      userData: number;   // days
      reportData: number; // days
    };
    sampling: {
      enabled: boolean;
      rate: number; // 0-100
    };
    privacy: {
      anonymizeIp: boolean;
      cookieConsent: boolean;
      dataProcessingConsent: boolean;
    };
    tracking: {
      enabledEvents: string[];
      enabledDimensions: string[];
      customDimensions: Array<{
        name: string;
        scope: 'hit' | 'session' | 'user' | 'product';
      }>;
    };
  }): Promise<ApiResponse<{ message: string }>> {
    return this.client.put<{ message: string }>(endpoints.analytics.admin.settings, settings);
  }

  // Get analytics settings
  async getSettings(): Promise<ApiResponse<{
    retention: {
      eventData: number;
      userData: number;
      reportData: number;
    };
    sampling: {
      enabled: boolean;
      rate: number;
    };
    privacy: {
      anonymizeIp: boolean;
      cookieConsent: boolean;
      dataProcessingConsent: boolean;
    };
    tracking: {
      enabledEvents: string[];
      enabledDimensions: string[];
      customDimensions: Array<{
        name: string;
        scope: string;
      }>;
    };
  }>> {
    return this.client.get<{
      retention: {
        eventData: number;
        userData: number;
        reportData: number;
      };
      sampling: {
        enabled: boolean;
        rate: number;
      };
      privacy: {
        anonymizeIp: boolean;
        cookieConsent: boolean;
        dataProcessingConsent: boolean;
      };
      tracking: {
        enabledEvents: string[];
        enabledDimensions: string[];
        customDimensions: Array<{
          name: string;
          scope: string;
        }>;
      };
    }>(endpoints.analytics.admin.settings);
  }

  // Clean up old data (Admin)
  async cleanupData(params: {
    type: 'events' | 'sessions' | 'users' | 'reports';
    olderThan: string; // ISO date
    dryRun?: boolean;
  }): Promise<ApiResponse<{
    message: string;
    recordsAffected: number;
    spaceFreed?: string;
  }>> {
    return this.client.delete<{
      message: string;
      recordsAffected: number;
      spaceFreed?: string;
    }>(endpoints.analytics.admin.cleanup, { params });
  }
}

// Create service instance
const analyticsApiService = new AnalyticsApiService();

// React Query Hooks

// User Behavior
export const useUserBehavior = (userId?: string, dateRange?: {
  start: string;
  end: string;
}) => {
  return useQuery({
    queryKey: ['analytics', 'user-behavior', userId, dateRange],
    queryFn: () => analyticsApiService.getUserBehavior(userId, dateRange),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserJourney = (params?: {
  userId?: string;
  sessionId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['analytics', 'user-journey', params],
    queryFn: () => analyticsApiService.getUserJourney(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSessionAnalytics = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  segmentBy?: 'device' | 'location' | 'source' | 'campaign';
}) => {
  return useQuery({
    queryKey: ['analytics', 'session-analytics', params],
    queryFn: () => analyticsApiService.getSessionAnalytics(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Product Analytics
export const useProductPerformance = (params?: {
  productId?: string;
  categoryId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'views' | 'conversions' | 'revenue' | 'add_to_cart';
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['analytics', 'product-performance', params],
    queryFn: () => analyticsApiService.getProductPerformance(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategoryAnalytics = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['analytics', 'category-analytics', params],
    queryFn: () => analyticsApiService.getCategoryAnalytics(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Revenue Analytics
export const useRevenueAnalytics = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  granularity?: 'hour' | 'day' | 'week' | 'month';
  segmentBy?: 'product' | 'category' | 'location' | 'device' | 'source';
}) => {
  return useQuery({
    queryKey: ['analytics', 'revenue-analytics', params],
    queryFn: () => analyticsApiService.getRevenueAnalytics(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useConversionFunnel = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  segmentBy?: 'device' | 'location' | 'source' | 'campaign';
}) => {
  return useQuery({
    queryKey: ['analytics', 'conversion-funnel', params],
    queryFn: () => analyticsApiService.getConversionFunnel(params),
    staleTime: 10 * 60 * 1000,
  });
};

// Search Analytics
export const useSearchAnalytics = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['analytics', 'search-analytics', params],
    queryFn: () => analyticsApiService.getSearchAnalytics(params),
    staleTime: 15 * 60 * 1000,
  });
};

// Dashboard & Reporting
export const useDashboard = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: () => analyticsApiService.getDashboard(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useCustomReport = (reportId: string, params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, string | number | boolean>;
}) => {
  return useQuery({
    queryKey: ['analytics', 'custom-report', reportId, params],
    queryFn: () => analyticsApiService.getCustomReport(reportId, params),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000,
  });
};

// Real-time Analytics
export const useRealTimeData = () => {
  return useQuery({
    queryKey: ['analytics', 'realtime'],
    queryFn: () => analyticsApiService.getRealTimeData(),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Admin Analytics
export const useSystemAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'admin', 'system-analytics'],
    queryFn: () => analyticsApiService.getSystemAnalytics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useAnalyticsSettings = () => {
  return useQuery({
    queryKey: ['analytics', 'admin', 'settings'],
    queryFn: () => analyticsApiService.getSettings(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Mutation Hooks

// Event Tracking
export const useTrackEvent = () => {
  return useMutation({
    mutationFn: (event: {
      type: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search' | 'click' | 'custom';
      name: string;
      properties?: Record<string, string | number | boolean>;
      url?: string;
      referrer?: string;
    }) => analyticsApiService.trackEvent(event),
  });
};

export const useTrackPageView = () => {
  return useMutation({
    mutationFn: (pageData: {
      url: string;
      title: string;
      referrer?: string;
      duration?: number;
      properties?: Record<string, string | number | boolean>;
    }) => analyticsApiService.trackPageView(pageData),
  });
};

export const useTrackProductView = () => {
  return useMutation({
    mutationFn: (productData: {
      productId: string;
      productName: string;
      categoryId?: string;
      price?: number;
      brand?: string;
      properties?: Record<string, string | number | boolean>;
    }) => analyticsApiService.trackProductView(productData),
  });
};

export const useTrackAddToCart = () => {
  return useMutation({
    mutationFn: (cartData: {
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      categoryId?: string;
      variant?: string;
      properties?: Record<string, string | number | boolean>;
    }) => analyticsApiService.trackAddToCart(cartData),
  });
};

export const useTrackPurchase = () => {
  return useMutation({
    mutationFn: (purchaseData: {
      orderId: string;
      totalAmount: number;
      currency: string;
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        categoryId?: string;
      }>;
      couponCode?: string;
      paymentMethod?: string;
      properties?: Record<string, string | number | boolean>;
    }) => analyticsApiService.trackPurchase(purchaseData),
  });
};

export const useTrackSearch = () => {
  return useMutation({
    mutationFn: (searchData: {
      query: string;
      resultsCount: number;
      filters?: Record<string, string | number | boolean>;
      sortBy?: string;
      page?: number;
      properties?: Record<string, string | number | boolean>;
    }) => analyticsApiService.trackSearch(searchData),
  });
};

export const useTrackCustomEvent = () => {
  return useMutation({
    mutationFn: (eventData: {
      name: string;
      category: string;
      action: string;
      label?: string;
      value?: number;
      properties?: Record<string, string | number | boolean>;
    }) => analyticsApiService.trackCustomEvent(eventData),
  });
};

export const useBatchTrackEvents = () => {
  return useMutation({
    mutationFn: (events: Array<{
      type: string;
      name: string;
      properties?: Record<string, string | number | boolean>;
      timestamp?: string;
    }>) => analyticsApiService.batchTrackEvents(events),
  });
};

// Reporting
export const useCreateCustomReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (report: {
      name: string;
      type: string;
      description: string;
      metrics: string[];
      dimensions: string[];
      filters?: Record<string, string | number | boolean>;
      dateRange?: {
        start: string;
        end: string;
      };
    }) => analyticsApiService.createCustomReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useExportData = () => {
  return useMutation({
    mutationFn: (params: {
      type: 'users' | 'sessions' | 'products' | 'revenue' | 'events';
      format: 'csv' | 'xlsx' | 'json';
      dateRange: {
        start: string;
        end: string;
      };
      filters?: Record<string, string | number | boolean>;
    }) => analyticsApiService.exportData(params),
  });
};

// Admin Operations
export const useConfigureAnalyticsSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: {
      retention: {
        eventData: number;
        userData: number;
        reportData: number;
      };
      sampling: {
        enabled: boolean;
        rate: number;
      };
      privacy: {
        anonymizeIp: boolean;
        cookieConsent: boolean;
        dataProcessingConsent: boolean;
      };
      tracking: {
        enabledEvents: string[];
        enabledDimensions: string[];
        customDimensions: Array<{
          name: string;
          scope: 'hit' | 'session' | 'user' | 'product';
        }>;
      };
    }) => analyticsApiService.configureSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'admin', 'settings'] });
    },
  });
};

export const useCleanupData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      type: 'events' | 'sessions' | 'users' | 'reports';
      olderThan: string;
      dryRun?: boolean;
    }) => analyticsApiService.cleanupData(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export default analyticsApiService;

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from './client';

// API Response Type
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// New Arrival Types
export interface NewArrival {
  id: string;
  name: string;
  description?: string;
  
  // Product Information
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    brand: string;
    category: string;
    subcategory?: string;
    
    // Product Details
    images: Array<{
      id: string;
      url: string;
      alt: string;
      width: number;
      height: number;
      isPrimary: boolean;
      position: number;
    }>;
    
    price: {
      original: number;
      current: number;
      discount?: {
        type: 'percentage' | 'fixed';
        value: number;
        label?: string;
      };
      currency: string;
      priceRange?: {
        min: number;
        max: number;
      };
    };
    
    inventory: {
      inStock: boolean;
      quantity: number;
      lowStockThreshold: number;
      trackInventory: boolean;
      allowBackorder: boolean;
      stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';
    };
    
    attributes: Array<{
      name: string;
      value: string | number | boolean;
      type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
      displayName: string;
      unit?: string;
    }>;
    
    variants: Array<{
      id: string;
      name: string;
      attributes: Record<string, string | number>;
      price: number;
      sku: string;
      inventory: number;
      images?: string[];
    }>;
    
    // SEO & Meta
    seo: {
      title?: string;
      description?: string;
      keywords?: string[];
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
    };
  };
  
  // New Arrival Configuration
  config: {
    featured: boolean;
    priority: number;
    badge: {
      enabled: boolean;
      text?: string;
      color?: string;
      backgroundColor?: string;
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      animation?: 'none' | 'pulse' | 'bounce' | 'glow' | 'fade';
    };
    
    // Display Options
    display: {
      showPrice: boolean;
      showDiscount: boolean;
      showBadge: boolean;
      showDescription: boolean;
      showImages: boolean;
      imageCount: number;
      
      layout: 'grid' | 'list' | 'carousel' | 'masonry';
      cardStyle: 'minimal' | 'detailed' | 'overlay' | 'hover';
      aspectRatio: '1:1' | '4:3' | '16:9' | '3:2' | 'auto';
    };
    
    // Hover Effects
    hoverEffects: {
      enabled: boolean;
      imageZoom: boolean;
      priceHighlight: boolean;
      buttonAppear: boolean;
      overlayShow: boolean;
      cardElevation: boolean;
      
      animations: {
        duration: number;
        easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
        type: 'scale' | 'fade' | 'slide' | 'rotate' | 'flip';
      };
    };
    
    // Call-to-Action
    cta: {
      enabled: boolean;
      primaryAction: {
        text: string;
        type: 'view_product' | 'add_to_cart' | 'quick_view' | 'custom';
        customUrl?: string;
        trackingLabel?: string;
      };
      
      secondaryAction?: {
        text: string;
        type: 'wishlist' | 'compare' | 'share' | 'custom';
        customUrl?: string;
        trackingLabel?: string;
      };
    };
  };
  
  // Categorization & Filtering
  categories: string[];
  tags: string[];
  collections?: string[];
  
  filters: {
    priceRange?: {
      min: number;
      max: number;
    };
    brand?: string[];
    color?: string[];
    size?: string[];
    material?: string[];
    customFilters?: Record<string, string[]>;
  };
  
  // Targeting & Personalization
  targeting: {
    enabled: boolean;
    
    // Audience Targeting
    audience: {
      segments?: string[];
      demographics?: {
        ageRange?: string;
        gender?: string;
        location?: string[];
        interests?: string[];
      };
      
      behavior?: {
        previousPurchases?: string[];
        browsedCategories?: string[];
        priceRange?: string;
        deviceType?: 'mobile' | 'tablet' | 'desktop';
      };
    };
    
    // Personalization Rules
    personalization: {
      showBasedOnHistory: boolean;
      recommendSimilar: boolean;
      priceBasedOnSegment: boolean;
      customRules?: Array<{
        condition: string;
        action: string;
        value: unknown;
      }>;
    };
  };
  
  // Launch Strategy
  launch: {
    strategy: 'immediate' | 'scheduled' | 'gradual' | 'campaign';
    
    // Scheduled Launch
    schedule?: {
      startDate: Date;
      endDate?: Date;
      timezone: string;
      
      // Pre-launch activities
      preLaunch?: {
        teaserCampaign: boolean;
        emailNotification: boolean;
        socialMediaPost: boolean;
        influencerOutreach: boolean;
      };
      
      // Launch day activities
      launchDay?: {
        featuredPlacement: boolean;
        emailBlast: boolean;
        pushNotifications: boolean;
        socialMediaBoost: boolean;
        pressRelease: boolean;
      };
    };
    
    // Gradual Rollout
    gradualRollout?: {
      enabled: boolean;
      phases: Array<{
        name: string;
        startDate: Date;
        audiencePercentage: number;
        targetSegments?: string[];
        successMetrics: string[];
      }>;
    };
    
    // Campaign Integration
    campaign?: {
      campaignId: string;
      campaignName: string;
      theme: string;
      messaging: string;
      hashtags?: string[];
      landingPageUrl?: string;
    };
  };
  
  // Promotion & Marketing
  promotion: {
    enabled: boolean;
    
    // Discounts & Offers
    discounts?: Array<{
      id: string;
      type: 'percentage' | 'fixed' | 'bogo' | 'tiered';
      value: number;
      minQuantity?: number;
      maxQuantity?: number;
      validFrom: Date;
      validTo: Date;
      conditions?: string[];
    }>;
    
    // Bundle Offers
    bundles?: Array<{
      id: string;
      name: string;
      products: string[];
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      minItems?: number;
    }>;
    
    // Marketing Channels
    channels: {
      email: {
        enabled: boolean;
        templates?: string[];
        sendDate?: Date;
        targetLists?: string[];
      };
      
      social: {
        enabled: boolean;
        platforms: string[];
        postSchedule?: Array<{
          platform: string;
          date: Date;
          content: string;
        }>;
      };
      
      paid: {
        enabled: boolean;
        adCampaigns?: Array<{
          platform: string;
          campaignId: string;
          budget: number;
          duration: number;
        }>;
      };
      
      influencer: {
        enabled: boolean;
        collaborations?: Array<{
          influencerId: string;
          platform: string;
          deliverables: string[];
          deadline: Date;
        }>;
      };
    };
  };
  
  // Performance Tracking
  performance: {
    // Views & Engagement
    views: number;
    uniqueViews: number;
    averageViewTime: number;
    bounceRate: number;
    
    // Interactions
    clicks: number;
    uniqueClicks: number;
    ctr: number; // Click-through rate
    
    // E-commerce Metrics
    addToCarts: number;
    cartConversions: number;
    purchases: number;
    revenue: number;
    averageOrderValue: number;
    
    // Social Engagement
    shares: number;
    likes: number;
    comments: number;
    saves: number;
    
    // Time-based Performance
    dailyStats: Record<string, {
      views: number;
      clicks: number;
      purchases: number;
      revenue: number;
    }>;
    
    // Conversion Funnel
    funnel: {
      impressions: number;
      views: number;
      productClicks: number;
      addToCarts: number;
      checkoutStarts: number;
      purchases: number;
      
      conversionRates: {
        viewToClick: number;
        clickToCart: number;
        cartToCheckout: number;
        checkoutToPurchase: number;
        overallConversion: number;
      };
    };
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    testId: string;
    testName: string;
    hypothesis: string;
    
    variants: Array<{
      id: string;
      name: string;
      weight: number;
      config: Partial<NewArrival>;
      
      performance: {
        impressions: number;
        clicks: number;
        conversions: number;
        revenue: number;
        ctr: number;
        conversionRate: number;
      };
    }>;
    
    testMetrics: {
      primaryMetric: 'ctr' | 'conversion_rate' | 'revenue' | 'engagement';
      secondaryMetrics: string[];
      statisticalSignificance: number;
      confidenceLevel: number;
    };
    
    testStatus: 'draft' | 'running' | 'paused' | 'completed';
    startDate: Date;
    endDate?: Date;
    duration: number;
    
    results?: {
      winningVariant?: string;
      improvement: number;
      significance: number;
      recommendation: string;
    };
  };
  
  // Analytics & Insights
  analytics: {
    // Traffic Sources
    trafficSources: Record<string, number>;
    referralSites: Record<string, number>;
    searchKeywords: Record<string, number>;
    
    // User Demographics
    demographics: {
      age: Record<string, number>;
      gender: Record<string, number>;
      location: Record<string, number>;
      deviceType: Record<string, number>;
    };
    
    // Behavior Analysis
    behavior: {
      timeOnPage: number;
      pagesPerSession: number;
      returnVisitorRate: number;
      newVisitorRate: number;
      
      userJourney: Array<{
        step: string;
        users: number;
        dropoffRate: number;
      }>;
    };
    
    // Competitive Analysis
    competitive?: {
      benchmarks: {
        industryAvgCtr: number;
        industryAvgConversion: number;
        categoryPerformance: number;
      };
      
      positioning: {
        priceCompetitiveness: number;
        featureDifferentiation: string[];
        marketShare: number;
      };
    };
  };
  
  // Inventory Management
  inventory: {
    trackingEnabled: boolean;
    
    levels: {
      current: number;
      reserved: number;
      available: number;
      incoming: number;
      onOrder: number;
    };
    
    alerts: {
      lowStock: {
        enabled: boolean;
        threshold: number;
        recipients: string[];
      };
      
      outOfStock: {
        enabled: boolean;
        autoDisable: boolean;
        notificationMethod: 'email' | 'sms' | 'webhook';
      };
      
      overstock: {
        enabled: boolean;
        threshold: number;
        recommendations: boolean;
      };
    };
    
    replenishment: {
      automatic: boolean;
      reorderPoint: number;
      reorderQuantity: number;
      leadTime: number;
      supplier?: string;
    };
  };
  
  // Customer Feedback
  feedback: {
    enabled: boolean;
    
    reviews: {
      count: number;
      averageRating: number;
      ratingDistribution: Record<string, number>;
      
      recent: Array<{
        id: string;
        rating: number;
        title: string;
        content: string;
        author: string;
        date: Date;
        verified: boolean;
        helpful: number;
      }>;
    };
    
    questions: Array<{
      id: string;
      question: string;
      answer?: string;
      author: string;
      date: Date;
      helpful: number;
    }>;
    
    wishlistCount: number;
    shareCount: number;
    compareCount: number;
  };
  
  // SEO & Content
  seo: {
    optimized: boolean;
    
    metadata: {
      title: string;
      description: string;
      keywords: string[];
      canonicalUrl?: string;
      ogImage?: string;
      schemaMarkup?: Record<string, unknown>;
    };
    
    contentScore: {
      titleOptimization: number;
      descriptionQuality: number;
      imageAltText: number;
      keywordDensity: number;
      overallScore: number;
    };
    
    searchPerformance: {
      impressions: number;
      clicks: number;
      averagePosition: number;
      ctr: number;
      topQueries: Record<string, number>;
    };
  };
  
  // Compliance & Quality
  compliance: {
    approved: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    
    checks: {
      contentGuidelines: boolean;
      imageStandards: boolean;
      pricingAccuracy: boolean;
      legalCompliance: boolean;
      brandGuidelines: boolean;
    };
    
    quality: {
      score: number;
      issues: Array<{
        type: string;
        severity: 'low' | 'medium' | 'high';
        description: string;
        resolution?: string;
      }>;
    };
  };
  
  // Workflow & Collaboration
  workflow: {
    currentStage: 'planning' | 'content_creation' | 'review' | 'approval' | 'scheduling' | 'live' | 'analysis';
    
    stages: Array<{
      name: string;
      status: 'pending' | 'in_progress' | 'completed' | 'blocked';
      assignee?: string;
      dueDate?: Date;
      completedAt?: Date;
      notes?: string[];
    }>;
    
    approvals: Array<{
      role: string;
      approver: string;
      status: 'pending' | 'approved' | 'rejected';
      date?: Date;
      notes?: string;
    }>;
    
    notifications: {
      enabled: boolean;
      recipients: string[];
      triggers: string[];
    };
  };
  
  // System Fields
  status: 'draft' | 'review' | 'approved' | 'scheduled' | 'live' | 'paused' | 'archived';
  version: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  launchedAt?: Date;
  archivedAt?: Date;
  
  // User Relations
  createdBy: string;
  updatedBy?: string;
  approvedBy?: string;
  assignedTo?: string[];
}

// Template System
export interface NewArrivalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'seasonal' | 'product_launch' | 'fashion' | 'electronics' | 'home' | 'promotional' | 'custom';
  
  // Template Configuration
  config: Partial<NewArrival>;
  
  // Design Assets
  designAssets: {
    thumbnailUrl: string;
    previewImages: string[];
    mockups?: string[];
    designFiles?: string[];
  };
  
  // Template Metadata
  isPremium: boolean;
  featured: boolean;
  rating: number;
  downloads: number;
  reviews: number;
  tags: string[];
  
  // Usage & Compatibility
  industries: string[];
  productTypes: string[];
  seasonality?: string[];
  
  // Performance Benchmarks
  benchmarks?: {
    averageCtr: number;
    averageConversion: number;
    averageRevenue: number;
    successRate: number;
  };
  
  // Author & License
  author: {
    name: string;
    avatar?: string;
    profile?: string;
    verified: boolean;
  };
  
  license: 'free' | 'premium' | 'commercial';
  usageRights: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

// Campaign Management
export interface NewArrivalCampaign {
  id: string;
  name: string;
  description: string;
  theme: string;
  
  // Campaign Details
  objectives: string[];
  targetAudience: string[];
  budget: number;
  timeline: {
    startDate: Date;
    endDate: Date;
    phases: Array<{
      name: string;
      startDate: Date;
      endDate: Date;
      activities: string[];
    }>;
  };
  
  // Product Selection
  products: Array<{
    productId: string;
    priority: number;
    customConfig?: Partial<NewArrival>;
  }>;
  
  // Channel Strategy
  channels: {
    website: boolean;
    email: boolean;
    social: boolean;
    paid: boolean;
    influencer: boolean;
    pr: boolean;
  };
  
  // Performance Tracking
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    costPerAcquisition: number;
  };
  
  // Status & Management
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  manager: string;
  team: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  launchedAt?: Date;
  completedAt?: Date;
}

// Analytics Types
export interface NewArrivalAnalytics {
  arrivalId: string;
  period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Performance Overview
  overview: {
    totalViews: number;
    uniqueViews: number;
    totalClicks: number;
    uniqueClicks: number;
    ctr: number;
    
    conversions: number;
    conversionRate: number;
    revenue: number;
    averageOrderValue: number;
    
    engagement: {
      timeOnPage: number;
      bounceRate: number;
      scrollDepth: number;
      interactionRate: number;
    };
  };
  
  // Time-series Data
  timeSeries: Array<{
    date: string;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  
  // Segmentation Analysis
  segments: {
    byDevice: Record<string, NewArrivalAnalytics['overview']>;
    byLocation: Record<string, NewArrivalAnalytics['overview']>;
    byAge: Record<string, NewArrivalAnalytics['overview']>;
    byGender: Record<string, NewArrivalAnalytics['overview']>;
    byTrafficSource: Record<string, NewArrivalAnalytics['overview']>;
  };
  
  // Product Performance
  productMetrics: {
    viewToCartRate: number;
    cartAbandonmentRate: number;
    purchaseCompletionRate: number;
    returnRate: number;
    averageRating: number;
    reviewCount: number;
  };
  
  // Comparative Analysis
  comparison: {
    previousPeriod: {
      viewsChange: number;
      clicksChange: number;
      conversionsChange: number;
      revenueChange: number;
    };
    
    categoryAverage: {
      performanceIndex: number;
      ranking: number;
      percentile: number;
    };
    
    seasonality: {
      expectedPerformance: number;
      actualVsExpected: number;
      seasonalTrend: 'up' | 'down' | 'stable';
    };
  };
  
  // Predictive Insights
  predictions: {
    nextPeriodViews: number;
    nextPeriodRevenue: number;
    stockoutDate?: Date;
    peakPerformanceDate?: Date;
    
    recommendations: Array<{
      type: string;
      priority: 'low' | 'medium' | 'high';
      description: string;
      expectedImpact: string;
    }>;
  };
}

// Parameter Types
export interface NewArrivalListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeAnalytics?: boolean;
  includePerformance?: boolean;
}

export interface NewArrivalFilter {
  status?: NewArrival['status'][];
  categories?: string[];
  tags?: string[];
  priceRange?: { min: number; max: number };
  launchDateFrom?: string;
  launchDateTo?: string;
  featured?: boolean;
  inStock?: boolean;
  hasPromotion?: boolean;
  performanceScore?: { min: number; max: number };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// New Arrival API Service Class
class NewArrivalApi {
  // Basic CRUD Operations
  async getNewArrivals(params?: NewArrivalListParams & NewArrivalFilter) {
    const response = await httpClient.get<ApiResponse<{ items: NewArrival[]; pagination: PaginationInfo }>>(
      '/new-arrivals',
      { params }
    );
    return response.data;
  }

  async getNewArrival(id: string, options?: {
    includeAnalytics?: boolean;
    includePerformance?: boolean;
    includeReviews?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${id}`,
      { params: options }
    );
    return response.data!.data;
  }

  async createNewArrival(data: Omit<NewArrival, 'id' | 'createdAt' | 'updatedAt' | 'performance' | 'analytics'>) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      '/new-arrivals',
      data
    );
    return response.data!.data;
  }

  async updateNewArrival(id: string, data: Partial<NewArrival>) {
    const response = await httpClient.put<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${id}`,
      data
    );
    return response.data!.data;
  }

  async deleteNewArrival(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      `/api/v1/new-arrivals/${id}`
    );
    return response.data;
  }

  // Product Integration
  async linkProduct(arrivalId: string, productId: string, config?: Partial<NewArrival['product']>) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${arrivalId}/link-product`,
      { productId, config }
    );
    return response.data!.data;
  }

  async unlinkProduct(arrivalId: string) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${arrivalId}/unlink-product`
    );
    return response.data!.data;
  }

  async syncProductData(arrivalId: string) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${arrivalId}/sync-product`
    );
    return response.data!.data;
  }

  // Template Operations
  async getTemplates(category?: string, featured?: boolean) {
    const response = await httpClient.get<ApiResponse<NewArrivalTemplate[]>>(
      '/new-arrivals/templates',
      { params: { category, featured } }
    );
    return response.data!.data;
  }

  async getTemplate(id: string) {
    const response = await httpClient.get<ApiResponse<NewArrivalTemplate>>(
      `/api/v1/new-arrivals/templates/${id}`
    );
    return response.data!.data;
  }

  async createFromTemplate(templateId: string, customizations?: Partial<NewArrival>) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/templates/${templateId}/create`,
      customizations
    );
    return response.data!.data;
  }

  async saveAsTemplate(arrivalId: string, templateData: {
    name: string;
    description: string;
    category: string;
    tags: string[];
    isPremium?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<NewArrivalTemplate>>(
      `/api/v1/new-arrivals/${arrivalId}/save-template`,
      templateData
    );
    return response.data!.data;
  }

  // Launch Management
  async scheduleLaunch(id: string, launchConfig: {
    launchDate: Date;
    strategy: 'immediate' | 'scheduled' | 'gradual' | 'campaign';
    gradualRollout?: NewArrival['launch']['gradualRollout'];
    campaign?: NewArrival['launch']['campaign'];
  }) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${id}/schedule-launch`,
      launchConfig
    );
    return response.data!.data;
  }

  async launchNow(id: string) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${id}/launch`
    );
    return response.data!.data;
  }

  async pauseLaunch(id: string, reason?: string) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${id}/pause`,
      { reason }
    );
    return response.data!.data;
  }

  async resumeLaunch(id: string) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${id}/resume`
    );
    return response.data!.data;
  }

  // Campaign Management
  async getCampaigns() {
    const response = await httpClient.get<ApiResponse<NewArrivalCampaign[]>>(
      '/new-arrivals/campaigns'
    );
    return response.data!.data;
  }

  async createCampaign(campaignData: Omit<NewArrivalCampaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) {
    const response = await httpClient.post<ApiResponse<NewArrivalCampaign>>(
      '/new-arrivals/campaigns',
      campaignData
    );
    return response.data!.data;
  }

  async addToCampaign(arrivalId: string, campaignId: string, priority?: number) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${arrivalId}/add-to-campaign`,
      { campaignId, priority }
    );
    return response.data!.data;
  }

  // Performance Analytics
  async getAnalytics(id: string, params?: {
    period?: NewArrivalAnalytics['period'];
    dateFrom?: string;
    dateTo?: string;
    metrics?: string[];
  }) {
    const response = await httpClient.get<ApiResponse<NewArrivalAnalytics>>(
      `/api/v1/new-arrivals/${id}/analytics`,
      { params }
    );
    return response.data!.data;
  }

  async getPerformanceReport(params?: {
    arrivalIds?: string[];
    period?: string;
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string[];
  }) {
    const response = await httpClient.get<ApiResponse<{
      summary: {
        totalArrivals: number;
        totalRevenue: number;
        averageConversionRate: number;
        topPerformers: Array<{
          id: string;
          name: string;
          revenue: number;
          conversionRate: number;
        }>;
      };
      breakdown: Record<string, NewArrivalAnalytics>;
      trends: Record<string, Array<{ date: string; value: number }>>;
      insights: Array<{
        type: string;
        message: string;
        impact: 'low' | 'medium' | 'high';
        actionable: boolean;
      }>;
    }>>(
      '/new-arrivals/performance-report',
      { params }
    );
    return response.data!.data;
  }

  // A/B Testing
  async createAbTest(arrivalId: string, testConfig: {
    name: string;
    hypothesis: string;
    variants: Array<{
      name: string;
      weight: number;
      config: Partial<NewArrival>;
    }>;
    duration?: number;
    successMetrics: string[];
  }) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${arrivalId}/ab-test`,
      testConfig
    );
    return response.data!.data;
  }

  async getAbTestResults(arrivalId: string) {
    const response = await httpClient.get<ApiResponse<NewArrival['abTest']>>(
      `/api/v1/new-arrivals/${arrivalId}/ab-test-results`
    );
    return response.data!.data;
  }

  async endAbTest(arrivalId: string, action?: {
    type: 'declare_winner' | 'end_test' | 'extend_test';
    winnerVariantId?: string;
    extensionDays?: number;
    reason?: string;
  }) {
    const response = await httpClient.post<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${arrivalId}/end-ab-test`,
      action
    );
    return response.data!.data;
  }

  // Inventory Management
  async updateInventory(arrivalId: string, inventoryData: Partial<NewArrival['inventory']>) {
    const response = await httpClient.put<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${arrivalId}/inventory`,
      inventoryData
    );
    return response.data!.data;
  }

  async getInventoryAlerts(arrivalId?: string) {
    const response = await httpClient.get<ApiResponse<Array<{
      arrivalId: string;
      alertType: 'low_stock' | 'out_of_stock' | 'overstock';
      severity: 'low' | 'medium' | 'high';
      message: string;
      timestamp: Date;
    }>>>(
      '/new-arrivals/inventory-alerts',
      { params: { arrivalId } }
    );
    return response.data!.data;
  }

  // Bulk Operations
  async bulkOperation(operation: {
    action: 'launch' | 'pause' | 'archive' | 'delete' | 'update_status' | 'assign_campaign';
    arrivalIds: string[];
    data?: unknown;
    options?: Record<string, unknown>;
  }) {
    const response = await httpClient.post<ApiResponse<{
      success: number;
      failed: number;
      results: Array<{
        arrivalId: string;
        status: 'success' | 'error';
        error?: string;
        result?: unknown;
      }>;
    }>>(
      '/new-arrivals/bulk',
      operation
    );
    return response.data!.data;
  }

  // Search & Filtering
  async searchArrivals(query: string, filters?: NewArrivalFilter & {
    facets?: string[];
    boost?: Record<string, number>;
    fuzzy?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<{
      items: NewArrival[];
      pagination: PaginationInfo;
      facets: Record<string, Array<{ value: string; count: number }>>;
      suggestions: string[];
    }>>(
      '/new-arrivals/search',
      { params: { q: query, ...filters } }
    );
    return response.data;
  }

  // Export Operations
  async exportArrivals(arrivalIds?: string[], options?: {
    format?: 'json' | 'csv' | 'excel';
    includePerformance?: boolean;
    includeAnalytics?: boolean;
    dateRange?: { from: string; to: string };
  }) {
    const response = await httpClient.get(
      '/new-arrivals/export',
      {
        params: { arrivalIds, ...options },
        responseType: 'blob'
      }
    );
    return response.data;
  }

  // Recommendations
  async getRecommendations(arrivalId: string, type?: 'optimization' | 'marketing' | 'inventory' | 'pricing') {
    const response = await httpClient.get<ApiResponse<Array<{
      type: string;
      category: string;
      priority: 'low' | 'medium' | 'high';
      title: string;
      description: string;
      expectedImpact: string;
      effort: 'low' | 'medium' | 'high';
      implementation: string[];
      resources?: string[];
    }>>>(
      `/api/v1/new-arrivals/${arrivalId}/recommendations`,
      { params: { type } }
    );
    return response.data!.data;
  }

  // Social Integration
  async schedulePost(arrivalId: string, posts: Array<{
    platform: 'instagram' | 'facebook' | 'twitter' | 'pinterest' | 'linkedin';
    content: string;
    scheduledFor: Date;
    mediaUrls?: string[];
    hashtags?: string[];
    targeting?: Record<string, unknown>;
  }>) {
    const response = await httpClient.post<ApiResponse<{
      scheduled: number;
      failed: number;
      results: Array<{
        platform: string;
        status: 'scheduled' | 'failed';
        postId?: string;
        error?: string;
      }>;
    }>>(
      `/api/v1/new-arrivals/${arrivalId}/schedule-posts`,
      { posts }
    );
    return response.data!.data;
  }

  // Workflow Management
  async updateWorkflow(arrivalId: string, update: {
    stage?: NewArrival['workflow']['currentStage'];
    assignee?: string;
    notes?: string;
    approvals?: Array<{
      role: string;
      status: 'approved' | 'rejected';
      notes?: string;
    }>;
  }) {
    const response = await httpClient.put<ApiResponse<NewArrival>>(
      `/api/v1/new-arrivals/${arrivalId}/workflow`,
      update
    );
    return response.data!.data;
  }
}

// Create service instance
const newArrivalApi = new NewArrivalApi();

// REACT QUERY HOOKS - COMPREHENSIVE NEW ARRIVAL MANAGEMENT

// ========== BASIC CRUD HOOKS ==========

export const useNewArrivals = (params?: NewArrivalListParams & NewArrivalFilter) => {
  return useQuery({
    queryKey: ['new-arrivals', 'list', params],
    queryFn: () => newArrivalApi.getNewArrivals(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useInfiniteNewArrivals = (params?: NewArrivalListParams & NewArrivalFilter) => {
  return useInfiniteQuery({
    queryKey: ['new-arrivals', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      newArrivalApi.getNewArrivals({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.data || !lastPage.data.pagination) return undefined;
      const pagination = lastPage.data.pagination;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useNewArrival = (arrivalId: string, options?: {
  includeAnalytics?: boolean;
  includePerformance?: boolean;
  includeReviews?: boolean;
}) => {
  return useQuery({
    queryKey: ['new-arrivals', arrivalId, options],
    queryFn: () => newArrivalApi.getNewArrival(arrivalId, options),
    enabled: !!arrivalId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useCreateNewArrival = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<NewArrival, 'id' | 'createdAt' | 'updatedAt' | 'performance' | 'analytics'>) =>
      newArrivalApi.createNewArrival(data),
    onSuccess: (newArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', newArrival.id], newArrival);
    },
  });
};

export const useUpdateNewArrival = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewArrival> }) =>
      newArrivalApi.updateNewArrival(id, data),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

export const useDeleteNewArrival = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (arrivalId: string) => newArrivalApi.deleteNewArrival(arrivalId),
    onSuccess: (_, arrivalId) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.removeQueries({ queryKey: ['new-arrivals', arrivalId] });
    },
  });
};

// ========== PRODUCT INTEGRATION HOOKS ==========

export const useLinkProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ arrivalId, productId, config }: {
      arrivalId: string;
      productId: string;
      config?: Partial<NewArrival['product']>;
    }) => newArrivalApi.linkProduct(arrivalId, productId, config),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

export const useUnlinkProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (arrivalId: string) => newArrivalApi.unlinkProduct(arrivalId),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

export const useSyncProductData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (arrivalId: string) => newArrivalApi.syncProductData(arrivalId),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

// ========== TEMPLATE MANAGEMENT HOOKS ==========

export const useNewArrivalTemplates = (category?: string, featured?: boolean) => {
  return useQuery({
    queryKey: ['new-arrival-templates', category, featured],
    queryFn: () => newArrivalApi.getTemplates(category, featured),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useNewArrivalTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['new-arrival-templates', templateId],
    queryFn: () => newArrivalApi.getTemplate(templateId),
    enabled: !!templateId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useCreateFromNewArrivalTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, customizations }: {
      templateId: string;
      customizations?: Partial<NewArrival>;
    }) => newArrivalApi.createFromTemplate(templateId, customizations),
    onSuccess: (newArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', newArrival.id], newArrival);
    },
  });
};

export const useSaveAsNewArrivalTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ arrivalId, templateData }: {
      arrivalId: string;
      templateData: {
        name: string;
        description: string;
        category: string;
        tags: string[];
        isPremium?: boolean;
      };
    }) => newArrivalApi.saveAsTemplate(arrivalId, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-arrival-templates'] });
    },
  });
};

// ========== LAUNCH MANAGEMENT HOOKS ==========

export const useScheduleLaunch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, launchConfig }: {
      id: string;
      launchConfig: {
        launchDate: Date;
        strategy: 'immediate' | 'scheduled' | 'gradual' | 'campaign';
        gradualRollout?: NewArrival['launch']['gradualRollout'];
        campaign?: NewArrival['launch']['campaign'];
      };
    }) => newArrivalApi.scheduleLaunch(id, launchConfig),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

export const useLaunchNow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (arrivalId: string) => newArrivalApi.launchNow(arrivalId),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

export const usePauseLaunch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      newArrivalApi.pauseLaunch(id, reason),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

export const useResumeLaunch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (arrivalId: string) => newArrivalApi.resumeLaunch(arrivalId),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

// ========== CAMPAIGN MANAGEMENT HOOKS ==========

export const useNewArrivalCampaigns = () => {
  return useQuery({
    queryKey: ['new-arrival-campaigns'],
    queryFn: () => newArrivalApi.getCampaigns(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignData: Omit<NewArrivalCampaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) =>
      newArrivalApi.createCampaign(campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-arrival-campaigns'] });
    },
  });
};

export const useAddToCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ arrivalId, campaignId, priority }: {
      arrivalId: string;
      campaignId: string;
      priority?: number;
    }) => newArrivalApi.addToCampaign(arrivalId, campaignId, priority),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

// ========== ANALYTICS HOOKS ==========

export const useNewArrivalAnalytics = (arrivalId: string, params?: {
  period?: NewArrivalAnalytics['period'];
  dateFrom?: string;
  dateTo?: string;
  metrics?: string[];
}) => {
  return useQuery({
    queryKey: ['new-arrivals', arrivalId, 'analytics', params],
    queryFn: () => newArrivalApi.getAnalytics(arrivalId, params),
    enabled: !!arrivalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useNewArrivalPerformanceReport = (params?: {
  arrivalIds?: string[];
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  groupBy?: string[];
}) => {
  return useQuery({
    queryKey: ['new-arrivals', 'performance-report', params],
    queryFn: () => newArrivalApi.getPerformanceReport(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// ========== A/B TESTING HOOKS ==========

export const useCreateNewArrivalAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ arrivalId, testConfig }: {
      arrivalId: string;
      testConfig: {
        name: string;
        hypothesis: string;
        variants: Array<{
          name: string;
          weight: number;
          config: Partial<NewArrival>;
        }>;
        duration?: number;
        successMetrics: string[];
      };
    }) => newArrivalApi.createAbTest(arrivalId, testConfig),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

export const useNewArrivalAbTestResults = (arrivalId: string) => {
  return useQuery({
    queryKey: ['new-arrivals', arrivalId, 'ab-test-results'],
    queryFn: () => newArrivalApi.getAbTestResults(arrivalId),
    enabled: !!arrivalId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEndNewArrivalAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ arrivalId, action }: {
      arrivalId: string;
      action?: {
        type: 'declare_winner' | 'end_test' | 'extend_test';
        winnerVariantId?: string;
        extensionDays?: number;
        reason?: string;
      };
    }) => newArrivalApi.endAbTest(arrivalId, action),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

// ========== INVENTORY MANAGEMENT HOOKS ==========

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ arrivalId, inventoryData }: {
      arrivalId: string;
      inventoryData: Partial<NewArrival['inventory']>;
    }) => newArrivalApi.updateInventory(arrivalId, inventoryData),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

export const useInventoryAlerts = (arrivalId?: string) => {
  return useQuery({
    queryKey: ['new-arrivals', 'inventory-alerts', arrivalId],
    queryFn: () => newArrivalApi.getInventoryAlerts(arrivalId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// ========== BULK OPERATIONS HOOKS ==========

export const useBulkNewArrivalOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: {
      action: 'launch' | 'pause' | 'archive' | 'delete' | 'update_status' | 'assign_campaign';
      arrivalIds: string[];
      data?: unknown;
      options?: Record<string, unknown>;
    }) => newArrivalApi.bulkOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
    },
  });
};

// ========== SEARCH & FILTERING HOOKS ==========

export const useSearchNewArrivals = (query: string, filters?: NewArrivalFilter & {
  facets?: string[];
  boost?: Record<string, number>;
  fuzzy?: boolean;
}) => {
  return useQuery({
    queryKey: ['new-arrivals', 'search', query, filters],
    queryFn: () => newArrivalApi.searchArrivals(query, filters),
    enabled: !!query,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ========== EXPORT HOOKS ==========

export const useExportNewArrivals = () => {
  return useMutation({
    mutationFn: ({ arrivalIds, options }: {
      arrivalIds?: string[];
      options?: {
        format?: 'json' | 'csv' | 'excel';
        includePerformance?: boolean;
        includeAnalytics?: boolean;
        dateRange?: { from: string; to: string };
      };
    }) => newArrivalApi.exportArrivals(arrivalIds, options),
  });
};

// ========== RECOMMENDATIONS HOOKS ==========

export const useNewArrivalRecommendations = (arrivalId: string, type?: 'optimization' | 'marketing' | 'inventory' | 'pricing') => {
  return useQuery({
    queryKey: ['new-arrivals', arrivalId, 'recommendations', type],
    queryFn: () => newArrivalApi.getRecommendations(arrivalId, type),
    enabled: !!arrivalId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// ========== SOCIAL INTEGRATION HOOKS ==========

export const useSchedulePost = () => {
  return useMutation({
    mutationFn: ({ arrivalId, posts }: {
      arrivalId: string;
      posts: Array<{
        platform: 'instagram' | 'facebook' | 'twitter' | 'pinterest' | 'linkedin';
        content: string;
        scheduledFor: Date;
        mediaUrls?: string[];
        hashtags?: string[];
        targeting?: Record<string, unknown>;
      }>;
    }) => newArrivalApi.schedulePost(arrivalId, posts),
  });
};

// ========== WORKFLOW MANAGEMENT HOOKS ==========

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ arrivalId, update }: {
      arrivalId: string;
      update: {
        stage?: NewArrival['workflow']['currentStage'];
        assignee?: string;
        notes?: string;
        approvals?: Array<{
          role: string;
          status: 'approved' | 'rejected';
          notes?: string;
        }>;
      };
    }) => newArrivalApi.updateWorkflow(arrivalId, update),
    onSuccess: (updatedArrival) => {
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.setQueryData(['new-arrivals', updatedArrival.id], updatedArrival);
    },
  });
};

// ========== COMPOUND HOOKS FOR COMPLEX OPERATIONS ==========

export const useNewArrivalManagement = (arrivalId: string) => {
  const arrival = useNewArrival(arrivalId, {
    includeAnalytics: true,
    includePerformance: true,
    includeReviews: true,
  });
  const analytics = useNewArrivalAnalytics(arrivalId);
  const abTestResults = useNewArrivalAbTestResults(arrivalId);
  const recommendations = useNewArrivalRecommendations(arrivalId);
  const inventoryAlerts = useInventoryAlerts(arrivalId);
  
  return {
    arrival,
    analytics,
    abTestResults,
    recommendations,
    inventoryAlerts,
    isLoading: arrival.isLoading || analytics.isLoading || abTestResults.isLoading || recommendations.isLoading || inventoryAlerts.isLoading,
    error: arrival.error || analytics.error || abTestResults.error || recommendations.error || inventoryAlerts.error,
  };
};

export const useNewArrivalDashboard = () => {
  const arrivals = useNewArrivals({
    limit: 10,
    sortBy: 'launchedAt',
    sortOrder: 'desc',
    includeAnalytics: true,
    includePerformance: true,
  });
  const performanceReport = useNewArrivalPerformanceReport({
    period: 'week',
    groupBy: ['category', 'status'],
  });
  const campaigns = useNewArrivalCampaigns();
  const templates = useNewArrivalTemplates();
  const inventoryAlerts = useInventoryAlerts();
  
  return {
    arrivals,
    performanceReport,
    campaigns,
    templates,
    inventoryAlerts,
    isLoading: arrivals.isLoading || performanceReport.isLoading || campaigns.isLoading || templates.isLoading || inventoryAlerts.isLoading,
    error: arrivals.error || performanceReport.error || campaigns.error || templates.error || inventoryAlerts.error,
  };
};

// Export the API instance and all hooks
export { newArrivalApi };
export default newArrivalApi;

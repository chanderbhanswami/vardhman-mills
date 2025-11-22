import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from './client';
import { endpoints } from './endpoints';

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

// Header Logo Types
export interface HeaderLogo {
  id: string;
  name: string;
  description?: string;
  
  // Logo Assets
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
    format: 'png' | 'jpg' | 'jpeg' | 'svg' | 'webp';
    size: number; // in bytes
    cloudinaryId?: string;
    blurhash?: string;
  };
  
  // Logo Variants for different contexts
  variants: {
    light?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    dark?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    monochrome?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    condensed?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    expanded?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    icon?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    wordmark?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
  };
  
  // Display Configuration
  display: {
    position: 'left' | 'center' | 'right';
    alignment: 'top' | 'middle' | 'bottom';
    maxWidth: number;
    maxHeight: number;
    aspectRatio: 'auto' | '1:1' | '16:9' | '4:3' | '3:2' | 'custom';
    customAspectRatio?: string;
    objectFit: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
    
    // Spacing
    margin: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    
    padding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    
    // Sticky behavior
    sticky: {
      enabled: boolean;
      offset: number;
      shrinkRatio: number;
      minHeight: number;
    };
  };
  
  // Styling Options
  styling: {
    backgroundColor?: string;
    borderRadius: number;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    border: {
      width: number;
      color: string;
      style: 'solid' | 'dashed' | 'dotted' | 'none';
    };
    
    // Filters & Effects
    opacity: number;
    brightness: number;
    contrast: number;
    saturation: number;
    grayscale: number;
    blur: number;
    
    // Hover Effects
    hoverEffects: {
      enabled: boolean;
      scale: number;
      opacity: number;
      brightness: number;
      transition: 'none' | 'smooth' | 'bounce' | 'elastic';
      duration: number;
    };
    
    // Scroll Effects
    scrollEffects: {
      enabled: boolean;
      fadeIn: boolean;
      slideIn: boolean;
      scaleOnScroll: boolean;
      parallax: number;
    };
  };
  
  // Link Configuration
  link: {
    enabled: boolean;
    url?: string;
    target: '_self' | '_blank' | '_parent' | '_top';
    rel?: string;
    title?: string;
    
    // Analytics tracking
    trackClicks: boolean;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  
  // Responsive Settings
  responsive: {
    mobile: {
      maxWidth: number;
      maxHeight: number;
      position: 'left' | 'center' | 'right';
      visible: boolean;
      variant?: string;
      shrinkOnScroll: boolean;
    };
    tablet: {
      maxWidth: number;
      maxHeight: number;
      position: 'left' | 'center' | 'right';
      visible: boolean;
      variant?: string;
      shrinkOnScroll: boolean;
    };
    desktop: {
      maxWidth: number;
      maxHeight: number;
      position: 'left' | 'center' | 'right';
      visible: boolean;
      variant?: string;
      shrinkOnScroll: boolean;
    };
  };
  
  // Navigation Integration
  navigation: {
    integrated: boolean;
    menuPosition: 'top' | 'bottom' | 'left' | 'right';
    mobileMenuTrigger: boolean;
    breadcrumbIntegration: boolean;
    searchIntegration: boolean;
  };
  
  // SEO & Accessibility
  seo: {
    alt: string;
    title?: string;
    description?: string;
    keywords?: string[];
    
    // Schema.org structured data
    schema: {
      '@type': 'Organization' | 'Brand' | 'LocalBusiness';
      name: string;
      logo: string;
      url?: string;
      sameAs?: string[];
      foundingDate?: string;
      founder?: string;
      location?: {
        '@type': 'Place';
        address: string;
      };
    };
  };
  
  // Animation Settings
  animation: {
    entrance: {
      enabled: boolean;
      type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce' | 'rotate' | 'flip';
      direction?: 'up' | 'down' | 'left' | 'right';
      duration: number;
      delay: number;
      easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    };
    
    loading: {
      type: 'skeleton' | 'shimmer' | 'pulse' | 'spinner' | 'progressive';
      color: string;
      showProgress: boolean;
    };
    
    interactions: {
      hover: {
        type: 'none' | 'scale' | 'rotate' | 'bounce' | 'pulse' | 'glow';
        intensity: number;
        duration: number;
      };
      
      click: {
        type: 'none' | 'ripple' | 'scale' | 'shake' | 'flash';
        duration: number;
      };
    };
    
    scroll: {
      parallax: {
        enabled: boolean;
        speed: number;
        direction: 'vertical' | 'horizontal';
      };
      
      reveal: {
        enabled: boolean;
        threshold: number;
        animation: 'fade' | 'slide' | 'zoom';
      };
    };
  };
  
  // Performance Optimization
  performance: {
    lazyLoading: boolean;
    preconnect: string[];
    prefetch: boolean;
    priority: 'high' | 'normal' | 'low';
    
    // Image optimization
    optimization: {
      webp: boolean;
      avif: boolean;
      progressive: boolean;
      quality: number;
      compression: 'lossless' | 'lossy';
    };
    
    // Caching
    caching: {
      enabled: boolean;
      ttl: number; // Time to live in seconds
      strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    };
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: Array<{
      id: string;
      name: string;
      weight: number;
      config: Partial<HeaderLogo>;
      impressions: number;
      clicks: number;
      conversions: number;
    }>;
    winnerVariant?: string;
    testDuration?: number;
    testEndDate?: Date;
    confidenceLevel: number;
  };
  
  // Analytics & Performance
  analytics: {
    impressions: number;
    clicks: number;
    ctr: number; // Click-through rate
    
    // Performance metrics
    loadTime: number;
    renderTime: number;
    lcp: number; // Largest Contentful Paint
    cls: number; // Cumulative Layout Shift
    errorRate: number;
    
    // User engagement
    hoverCount: number;
    hoverDuration: number;
    averageViewTime: number;
    scrollInteractions: number;
    
    // Device breakdown
    deviceStats: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    
    // Browser breakdown
    browserStats: Record<string, number>;
    
    // Geographic data
    geoStats: {
      countries: Record<string, number>;
      cities: Record<string, number>;
    };
    
    // Time-based analytics
    timeStats: {
      hourly: Record<string, number>;
      daily: Record<string, number>;
      monthly: Record<string, number>;
    };
  };
  
  // Brand Guidelines Compliance
  brandCompliance: {
    approved: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    
    guidelines: {
      colorAccuracy: boolean;
      sizeCompliance: boolean;
      spacingCompliance: boolean;
      contextualUsage: boolean;
      brandConsistency: boolean;
    };
    
    violations: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      suggestedFix: string;
    }>;
    
    notes?: string[];
    reviewDate?: Date;
  };
  
  // Usage Tracking
  usage: {
    usedIn: string[]; // Array of page/component IDs
    lastUsed: Date;
    usageFrequency: number;
    
    // Context analysis
    contexts: Array<{
      pageId: string;
      pageName: string;
      pageType: string;
      componentId: string;
      componentName: string;
      usageCount: number;
      performance: {
        loadTime: number;
        renderTime: number;
        errorRate: number;
      };
    }>;
    
    // Dependencies
    dependencies: string[];
    dependents: string[];
  };
  
  // Version Control
  version: number;
  changelog: Array<{
    version: number;
    changes: string[];
    changedBy: string;
    changedAt: Date;
    migrationNotes?: string[];
  }>;
  
  // Status & Scheduling
  status: 'draft' | 'review' | 'approved' | 'published' | 'scheduled' | 'archived' | 'deprecated';
  
  schedule?: {
    publishAt?: Date;
    expireAt?: Date;
    timezone: string;
    
    // Seasonal variations
    seasonal?: {
      enabled: boolean;
      variations: Array<{
        name: string;
        startDate: Date;
        endDate: Date;
        logoVariant: string;
        config: Partial<HeaderLogo>;
      }>;
    };
    
    // Event-based scheduling
    events?: {
      enabled: boolean;
      triggers: Array<{
        event: string;
        condition: string;
        logoVariant: string;
        duration?: number;
      }>;
    };
  };
  
  // Metadata
  metadata: Record<string, unknown>;
  tags: string[];
  categories: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  lastModified?: Date;
  
  // User Relations
  createdBy: string;
  updatedBy?: string;
  approvedBy?: string;
  reviewedBy?: string[];
}

// Template System
export interface HeaderLogoTemplate {
  id: string;
  name: string;
  description: string;
  category: 'corporate' | 'startup' | 'ecommerce' | 'blog' | 'portfolio' | 'agency' | 'custom';
  
  // Template Configuration
  config: Partial<HeaderLogo>;
  
  // Preview Assets
  thumbnailUrl: string;
  previewImages: string[];
  demoUrl?: string;
  
  // Template Metadata
  isPremium: boolean;
  featured: boolean;
  rating: number;
  downloads: number;
  reviews: number;
  tags: string[];
  
  // Compatibility & Requirements
  compatibleWith: string[];
  minVersion: string;
  dependencies: string[];
  
  // Author Information
  author: {
    name: string;
    avatar?: string;
    profile?: string;
    verified: boolean;
  };
  
  // License & Usage
  license: 'free' | 'premium' | 'commercial';
  usageRights: string[];
  restrictions: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

// Analytics Types
export interface HeaderLogoAnalytics {
  logoId: string;
  period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Engagement Metrics
  impressions: number;
  uniqueImpressions: number;
  clicks: number;
  uniqueClicks: number;
  ctr: number;
  averageViewTime: number;
  
  // Performance Metrics
  averageLoadTime: number;
  averageRenderTime: number;
  errorRate: number;
  
  // Core Web Vitals
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
  
  // User Interaction
  interactions: {
    hovers: number;
    averageHoverDuration: number;
    scrollInteractions: number;
    mobileSwipes: number;
    keyboardNavigations: number;
  };
  
  // Device & Technology Analysis
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  screenResolutionBreakdown: Record<string, number>;
  connectionTypeBreakdown: Record<string, number>;
  
  // Geographic Distribution
  geographic: {
    countries: Record<string, number>;
    regions: Record<string, number>;
    cities: Record<string, number>;
    timezones: Record<string, number>;
  };
  
  // Time-based Analysis
  temporal: {
    hourlyDistribution: Record<string, number>;
    dailyDistribution: Record<string, number>;
    weeklyDistribution: Record<string, number>;
    monthlyDistribution: Record<string, number>;
    seasonalTrends: Record<string, number>;
  };
  
  // Conversion & Business Impact
  conversions: {
    total: number;
    rate: number;
    revenue: number;
    attributedSales: number;
    goalCompletions: Record<string, number>;
  };
  
  // A/B Test Results
  abTestResults?: {
    testId: string;
    status: 'running' | 'completed' | 'paused';
    variants: Array<{
      id: string;
      name: string;
      traffic: number;
      impressions: number;
      clicks: number;
      conversions: number;
      ctr: number;
      conversionRate: number;
      confidence: number;
      significance: number;
    }>;
    
    winningVariant?: {
      id: string;
      improvement: number;
      confidence: number;
    };
    
    statisticalSignificance: number;
    testDuration: number;
    recommendedAction: string;
  };
  
  // Performance Insights
  insights: {
    performanceScore: number;
    optimizationSuggestions: Array<{
      category: string;
      suggestion: string;
      impact: 'low' | 'medium' | 'high';
      effort: 'low' | 'medium' | 'high';
    }>;
    
    trendAnalysis: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      period: string;
      significance: 'low' | 'medium' | 'high';
    };
  };
}

// Additional Parameter Types
export interface HeaderLogoListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeAnalytics?: boolean;
  includeUsage?: boolean;
  includeVersions?: boolean;
}

export interface HeaderLogoFilter {
  status?: HeaderLogo['status'][];
  categories?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string[];
  hasAbTest?: boolean;
  brandApproved?: boolean;
  usageCountMin?: number;
  usageCountMax?: number;
  performanceScoreMin?: number;
  performanceScoreMax?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Header Logo API Service Class
class HeaderLogoApi {
  // Basic CRUD Operations
  async getHeaderLogos(params?: HeaderLogoListParams & HeaderLogoFilter) {
    const response = await httpClient.get<ApiResponse<{ items: HeaderLogo[]; pagination: PaginationInfo }>>(
      '/api/v1/header-logos',
      { params }
    );
    return response.data;
  }

  async getHeaderLogo(id: string, options?: {
    includeAnalytics?: boolean;
    includeUsage?: boolean;
    includeVersions?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<HeaderLogo>>(
      `/api/v1/header-logos/${id}`,
      { params: options }
    );
    return response.data!.data;
  }

  async createHeaderLogo(data: Omit<HeaderLogo, 'id' | 'createdAt' | 'updatedAt' | 'analytics' | 'usage'>) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      '/api/v1/header-logos',
      data
    );
    return response.data!.data;
  }

  async updateHeaderLogo(id: string, data: Partial<HeaderLogo>) {
    const response = await httpClient.put<ApiResponse<HeaderLogo>>(
      `/api/v1/header-logos/${id}`,
      data
    );
    return response.data!.data;
  }

  async deleteHeaderLogo(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      `/api/v1/header-logos/${id}`
    );
    return response.data;
  }

  // Logo Upload & Management
  async uploadLogo(file: File, options?: {
    generateVariants?: boolean;
    optimize?: boolean;
    formats?: ('png' | 'jpg' | 'webp' | 'svg')[];
    sizes?: Array<{ width: number; height: number; name: string }>;
  }) {
    const formData = new FormData();
    formData.append('logo', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await httpClient.post<ApiResponse<{
      logo: HeaderLogo['logo'];
      variants: HeaderLogo['variants'];
      optimizationReport: {
        originalSize: number;
        optimizedSize: number;
        compressionRatio: number;
        qualityScore: number;
      };
    }>>(
      '/api/v1/header-logos/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data!.data;
  }

  async generateVariants(logoId: string, types: ('light' | 'dark' | 'monochrome' | 'condensed' | 'expanded' | 'icon' | 'wordmark')[]) {
    const response = await httpClient.post<ApiResponse<HeaderLogo['variants']>>(
      `/api/v1/header-logos/${logoId}/variants`,
      { types }
    );
    return response.data!.data;
  }

  async optimizeLogo(logoId: string, options?: {
    quality?: number;
    format?: 'png' | 'jpg' | 'webp' | 'avif';
    maxWidth?: number;
    maxHeight?: number;
    progressive?: boolean;
    lossless?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<{
      logo: HeaderLogo['logo'];
      optimizationReport: {
        originalSize: number;
        optimizedSize: number;
        compressionRatio: number;
        qualityScore: number;
        loadTimeImprovement: number;
      };
    }>>(
      `/api/v1/header-logos/${logoId}/optimize`,
      options
    );
    return response.data!.data;
  }

  // Template Operations
  async getTemplates(category?: string, featured?: boolean) {
    const response = await httpClient.get<ApiResponse<HeaderLogoTemplate[]>>(
      '/api/v1/header-logos/templates',
      { params: { category, featured } }
    );
    return response.data!.data;
  }

  async getTemplate(id: string) {
    const response = await httpClient.get<ApiResponse<HeaderLogoTemplate>>(
      `/api/v1/header-logos/templates/${id}`
    );
    return response.data!.data;
  }

  async createFromTemplate(templateId: string, customizations?: Partial<HeaderLogo>) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      `/api/v1/header-logos/templates/${templateId}/create`,
      customizations
    );
    return response.data!.data;
  }

  async saveAsTemplate(logoId: string, templateData: {
    name: string;
    description: string;
    category: string;
    tags: string[];
    isPremium?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<HeaderLogoTemplate>>(
      `/api/v1/header-logos/${logoId}/save-template`,
      templateData
    );
    return response.data!.data;
  }

  // Status Management
  async publishLogo(id: string, publishAt?: Date) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      `/api/v1/header-logos/${id}/publish`,
      { publishAt }
    );
    return response.data!.data;
  }

  async unpublishLogo(id: string) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      `/api/v1/header-logos/${id}/unpublish`
    );
    return response.data!.data;
  }

  async archiveLogo(id: string) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      `/api/v1/header-logos/${id}/archive`
    );
    return response.data!.data;
  }

  async duplicateLogo(id: string, name?: string) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      `/api/v1/header-logos/${id}/duplicate`,
      { name }
    );
    return response.data!.data;
  }

  // Analytics Operations
  async getLogoAnalytics(id: string, params?: {
    period?: HeaderLogoAnalytics['period'];
    dateFrom?: string;
    dateTo?: string;
    metrics?: string[];
  }) {
    const response = await httpClient.get<ApiResponse<HeaderLogoAnalytics>>(
      `/api/v1/header-logos/${id}/analytics`,
      { params }
    );
    return response.data!.data;
  }

  async getAnalyticsReport(params?: {
    logoIds?: string[];
    period?: string;
    dateFrom?: string;
    dateTo?: string;
    metrics?: string[];
    groupBy?: string[];
  }) {
    const response = await httpClient.get<ApiResponse<{
      summary: {
        totalImpressions: number;
        totalClicks: number;
        averageCtr: number;
        averageLoadTime: number;
        performanceScore: number;
      };
      breakdown: Record<string, HeaderLogoAnalytics>;
      trends: Record<string, Array<{ date: string; value: number }>>;
      insights: Array<{
        type: string;
        message: string;
        impact: 'low' | 'medium' | 'high';
        actionable: boolean;
      }>;
    }>>(
      '/api/v1/header-logos/analytics-report',
      { params }
    );
    return response.data!.data;
  }

  // Performance Analysis
  async getPerformanceReport(logoId: string, params?: {
    dateFrom?: string;
    dateTo?: string;
    includeWebVitals?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<{
      overallScore: number;
      loadTime: {
        average: number;
        p50: number;
        p75: number;
        p90: number;
        p95: number;
      };
      webVitals: HeaderLogoAnalytics['coreWebVitals'];
      recommendations: Array<{
        category: string;
        priority: 'low' | 'medium' | 'high';
        description: string;
        impact: string;
        effort: string;
        implementation: string;
      }>;
      benchmarks: {
        industry: number;
        competitors: number;
        previousPeriod: number;
      };
    }>>(
      `/api/v1/header-logos/${logoId}/performance`,
      { params }
    );
    return response.data!.data;
  }

  // Brand Compliance
  async submitForReview(logoId: string, notes?: string) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      endpoints.headerLogos.submitForReview(logoId),
      { notes }
    );
    return response.data!.data;
  }

  async approveLogo(logoId: string, guidelines: {
    colorAccuracy: boolean;
    sizeCompliance: boolean;
    spacingCompliance: boolean;
    contextualUsage: boolean;
    brandConsistency: boolean;
  }, notes?: string[]) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      endpoints.headerLogos.approve(logoId),
      { guidelines, notes }
    );
    return response.data!.data;
  }

  async rejectLogo(logoId: string, violations: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    suggestedFix: string;
  }>, notes?: string[]) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      endpoints.headerLogos.reject(logoId),
      { violations, notes }
    );
    return response.data!.data;
  }

  // A/B Testing Operations
  async createAbTest(logoId: string, testConfig: {
    name: string;
    hypothesis: string;
    variants: Array<{
      name: string;
      weight: number;
      config: Partial<HeaderLogo>;
    }>;
    duration?: number;
    trafficAllocation?: number;
    successMetrics: string[];
  }) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      endpoints.headerLogos.createAbTest(logoId),
      testConfig
    );
    return response.data!.data;
  }

  async getAbTestResults(logoId: string) {
    const response = await httpClient.get<ApiResponse<HeaderLogoAnalytics['abTestResults']>>(
      endpoints.headerLogos.abTestResults(logoId)
    );
    return response.data!.data;
  }

  async endAbTest(logoId: string, action?: {
    type: 'declare_winner' | 'end_test' | 'extend_test';
    winnerVariantId?: string;
    extensionDays?: number;
    reason?: string;
  }) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      endpoints.headerLogos.endAbTest(logoId),
      action
    );
    return response.data!.data;
  }

  // Usage Tracking & Context Analysis
  async trackInteraction(logoId: string, interaction: {
    type: 'impression' | 'click' | 'hover' | 'scroll_interaction';
    context: {
      pageId: string;
      pageUrl: string;
      componentId: string;
      deviceType: string;
      viewport: { width: number; height: number };
      timestamp: Date;
    };
    metadata?: Record<string, unknown>;
  }) {
    const response = await httpClient.post<ApiResponse<void>>(
      endpoints.headerLogos.trackInteraction(logoId),
      interaction
    );
    return response.data;
  }

  async getUsageAnalysis(logoId: string, params?: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'page' | 'component' | 'device' | 'time';
  }) {
    const response = await httpClient.get<ApiResponse<{
      summary: {
        totalPages: number;
        totalComponents: number;
        averageUsagePerPage: number;
        mostUsedContext: string;
      };
      breakdown: HeaderLogo['usage']['contexts'];
      trends: Record<string, Array<{ date: string; count: number }>>;
      dependencies: {
        dependsOn: string[];
        dependents: string[];
        criticalPath: boolean;
      };
    }>>(
      endpoints.headerLogos.usageAnalysis(logoId),
      { params }
    );
    return response.data!.data;
  }

  // Bulk Operations
  async bulkOperation(operation: {
    action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'approve' | 'optimize' | 'update';
    logoIds: string[];
    data?: Partial<HeaderLogo>;
    options?: Record<string, unknown>;
  }) {
    const response = await httpClient.post<ApiResponse<{
      success: number;
      failed: number;
      results: Array<{
        logoId: string;
        status: 'success' | 'error';
        error?: string;
        result?: unknown;
      }>;
      summary: {
        totalProcessed: number;
        successRate: number;
        averageProcessingTime: number;
      };
    }>>(
      endpoints.headerLogos.bulk,
      operation
    );
    return response.data!.data;
  }

  // Import/Export Operations
  async exportLogos(logoIds?: string[], options?: {
    format?: 'json' | 'zip' | 'figma' | 'sketch';
    includeAssets?: boolean;
    includeAnalytics?: boolean;
    includeVersionHistory?: boolean;
  }) {
    const response = await httpClient.get(
      endpoints.headerLogos.export,
      {
        params: { logoIds, ...options },
        responseType: 'blob'
      }
    );
    return response.data;
  }

  async importLogos(file: File, options?: {
    overwrite?: boolean;
    preserveIds?: boolean;
    generateVariants?: boolean;
    validateBrand?: boolean;
    autoOptimize?: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await httpClient.post<ApiResponse<{
      imported: number;
      failed: number;
      skipped: number;
      errors: Array<{
        item: string;
        error: string;
        suggestions?: string[];
      }>;
      summary: {
        totalProcessed: number;
        successRate: number;
        processingTime: number;
      };
    }>>(
      endpoints.headerLogos.import,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data!.data;
  }

  // Search & Filtering
  async searchLogos(query: string, filters?: HeaderLogoFilter & {
    facets?: string[];
    boost?: Record<string, number>;
    fuzzy?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<{
      items: HeaderLogo[];
      pagination: PaginationInfo;
      facets: Record<string, Array<{ value: string; count: number }>>;
      suggestions: string[];
      searchMetadata: {
        totalMatches: number;
        searchTime: number;
        query: string;
        correctedQuery?: string;
      };
    }>>(
      endpoints.headerLogos.search,
      { params: { q: query, ...filters } }
    );
    return response.data;
  }

  // Version Control
  async getVersionHistory(logoId: string, params?: {
    limit?: number;
    includeContent?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<{
      versions: HeaderLogo['changelog'];
      currentVersion: number;
      branches: string[];
      tags: string[];
    }>>(
      endpoints.headerLogos.versions(logoId),
      { params }
    );
    return response.data!.data;
  }

  async revertToVersion(logoId: string, version: number, options?: {
    createBackup?: boolean;
    preserveAnalytics?: boolean;
    notifyUsers?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<HeaderLogo>>(
      endpoints.headerLogos.revertVersion(logoId),
      { version, options }
    );
    return response.data!.data;
  }

  async createBranch(logoId: string, branchName: string, fromVersion?: number) {
    const response = await httpClient.post<ApiResponse<{
      branchId: string;
      branchName: string;
      baseVersion: number;
      logo: HeaderLogo;
    }>>(
      endpoints.headerLogos.createBranch(logoId),
      { branchName, fromVersion }
    );
    return response.data!.data;
  }

  // Preview & Validation
  async getPreview(logoId: string, context?: {
    theme?: 'light' | 'dark';
    background?: string;
    size?: 'small' | 'medium' | 'large';
    viewport?: { width: number; height: number };
    mockupType?: 'header' | 'mobile' | 'email' | 'social';
  }) {
    const response = await httpClient.get<ApiResponse<{
      previewUrl: string;
      variants: Record<string, string>;
      mockups: Record<string, string>;
      contextualPreviews: Array<{
        context: string;
        url: string;
        description: string;
      }>;
    }>>(
      endpoints.headerLogos.preview(logoId),
      { params: context }
    );
    return response.data!.data;
  }

  async validateLogo(data: Partial<HeaderLogo>) {
    const response = await httpClient.post<ApiResponse<{
      valid: boolean;
      score: number;
      errors: Array<{
        field: string;
        message: string;
        severity: 'error' | 'warning' | 'info';
        suggestion?: string;
      }>;
      warnings: Array<{
        field: string;
        message: string;
        impact: 'low' | 'medium' | 'high';
        suggestion?: string;
      }>;
      recommendations: Array<{
        category: string;
        suggestion: string;
        rationale: string;
        priority: 'low' | 'medium' | 'high';
      }>;
      brandCompliance: {
        score: number;
        issues: string[];
        suggestions: string[];
      };
    }>>(
      endpoints.headerLogos.validate,
      data
    );
    return response.data!.data;
  }
}

// Create service instance
const headerLogoApi = new HeaderLogoApi();

// REACT QUERY HOOKS - COMPREHENSIVE HEADER LOGO MANAGEMENT

// ========== BASIC CRUD HOOKS ==========

export const useHeaderLogos = (params?: HeaderLogoListParams & HeaderLogoFilter) => {
  return useQuery({
    queryKey: ['header-logos', 'list', params],
    queryFn: () => headerLogoApi.getHeaderLogos(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useInfiniteHeaderLogos = (params?: HeaderLogoListParams & HeaderLogoFilter) => {
  return useInfiniteQuery({
    queryKey: ['header-logos', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      headerLogoApi.getHeaderLogos({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.data || !lastPage.data.pagination) return undefined;
      const pagination = lastPage.data.pagination;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeaderLogo = (logoId: string, options?: {
  includeAnalytics?: boolean;
  includeUsage?: boolean;
  includeVersions?: boolean;
}) => {
  return useQuery({
    queryKey: ['header-logos', logoId, options],
    queryFn: () => headerLogoApi.getHeaderLogo(logoId, options),
    enabled: !!logoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useCreateHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<HeaderLogo, 'id' | 'createdAt' | 'updatedAt' | 'analytics' | 'usage'>) =>
      headerLogoApi.createHeaderLogo(data),
    onSuccess: (newLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', newLogo.id], newLogo);
    },
  });
};

export const useUpdateHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HeaderLogo> }) =>
      headerLogoApi.updateHeaderLogo(id, data),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useDeleteHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (logoId: string) => headerLogoApi.deleteHeaderLogo(logoId),
    onSuccess: (_, logoId) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.removeQueries({ queryKey: ['header-logos', logoId] });
    },
  });
};

// ========== LOGO UPLOAD & MANAGEMENT HOOKS ==========

export const useUploadHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: {
      file: File;
      options?: {
        generateVariants?: boolean;
        optimize?: boolean;
        formats?: ('png' | 'jpg' | 'webp' | 'svg')[];
        sizes?: Array<{ width: number; height: number; name: string }>;
      };
    }) => headerLogoApi.uploadLogo(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
    },
  });
};

export const useGenerateLogoVariants = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, types }: {
      logoId: string;
      types: ('light' | 'dark' | 'monochrome' | 'condensed' | 'expanded' | 'icon' | 'wordmark')[];
    }) => headerLogoApi.generateVariants(logoId, types),
    onSuccess: (_, { logoId }) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos', logoId] });
    },
  });
};

export const useOptimizeHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, options }: {
      logoId: string;
      options?: {
        quality?: number;
        format?: 'png' | 'jpg' | 'webp' | 'avif';
        maxWidth?: number;
        maxHeight?: number;
        progressive?: boolean;
        lossless?: boolean;
      };
    }) => headerLogoApi.optimizeLogo(logoId, options),
    onSuccess: (_, { logoId }) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos', logoId] });
    },
  });
};

// ========== TEMPLATE MANAGEMENT HOOKS ==========

export const useHeaderLogoTemplates = (category?: string, featured?: boolean) => {
  return useQuery({
    queryKey: ['header-logo-templates', category, featured],
    queryFn: () => headerLogoApi.getTemplates(category, featured),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useHeaderLogoTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['header-logo-templates', templateId],
    queryFn: () => headerLogoApi.getTemplate(templateId),
    enabled: !!templateId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useCreateFromHeaderTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, customizations }: {
      templateId: string;
      customizations?: Partial<HeaderLogo>;
    }) => headerLogoApi.createFromTemplate(templateId, customizations),
    onSuccess: (newLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', newLogo.id], newLogo);
    },
  });
};

export const useSaveAsHeaderTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, templateData }: {
      logoId: string;
      templateData: {
        name: string;
        description: string;
        category: string;
        tags: string[];
        isPremium?: boolean;
      };
    }) => headerLogoApi.saveAsTemplate(logoId, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-logo-templates'] });
    },
  });
};

// ========== STATUS MANAGEMENT HOOKS ==========

export const usePublishHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, publishAt }: { id: string; publishAt?: Date }) =>
      headerLogoApi.publishLogo(id, publishAt),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useUnpublishHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (logoId: string) => headerLogoApi.unpublishLogo(logoId),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useArchiveHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (logoId: string) => headerLogoApi.archiveLogo(logoId),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useDuplicateHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      headerLogoApi.duplicateLogo(id, name),
    onSuccess: (newLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', newLogo.id], newLogo);
    },
  });
};

// ========== ANALYTICS HOOKS ==========

export const useHeaderLogoAnalytics = (logoId: string, params?: {
  period?: HeaderLogoAnalytics['period'];
  dateFrom?: string;
  dateTo?: string;
  metrics?: string[];
}) => {
  return useQuery({
    queryKey: ['header-logos', logoId, 'analytics', params],
    queryFn: () => headerLogoApi.getLogoAnalytics(logoId, params),
    enabled: !!logoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useHeaderAnalyticsReport = (params?: {
  logoIds?: string[];
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  metrics?: string[];
  groupBy?: string[];
}) => {
  return useQuery({
    queryKey: ['header-logos', 'analytics-report', params],
    queryFn: () => headerLogoApi.getAnalyticsReport(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const usePerformanceReport = (logoId: string, params?: {
  dateFrom?: string;
  dateTo?: string;
  includeWebVitals?: boolean;
}) => {
  return useQuery({
    queryKey: ['header-logos', logoId, 'performance', params],
    queryFn: () => headerLogoApi.getPerformanceReport(logoId, params),
    enabled: !!logoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ========== BRAND COMPLIANCE HOOKS ==========

export const useSubmitForReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, notes }: { logoId: string; notes?: string }) =>
      headerLogoApi.submitForReview(logoId, notes),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useApproveHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, guidelines, notes }: {
      logoId: string;
      guidelines: {
        colorAccuracy: boolean;
        sizeCompliance: boolean;
        spacingCompliance: boolean;
        contextualUsage: boolean;
        brandConsistency: boolean;
      };
      notes?: string[];
    }) => headerLogoApi.approveLogo(logoId, guidelines, notes),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useRejectHeaderLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, violations, notes }: {
      logoId: string;
      violations: Array<{
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
        suggestedFix: string;
      }>;
      notes?: string[];
    }) => headerLogoApi.rejectLogo(logoId, violations, notes),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

// ========== A/B TESTING HOOKS ==========

export const useCreateHeaderAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, testConfig }: {
      logoId: string;
      testConfig: {
        name: string;
        hypothesis: string;
        variants: Array<{
          name: string;
          weight: number;
          config: Partial<HeaderLogo>;
        }>;
        duration?: number;
        trafficAllocation?: number;
        successMetrics: string[];
      };
    }) => headerLogoApi.createAbTest(logoId, testConfig),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useHeaderAbTestResults = (logoId: string) => {
  return useQuery({
    queryKey: ['header-logos', logoId, 'ab-test-results'],
    queryFn: () => headerLogoApi.getAbTestResults(logoId),
    enabled: !!logoId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEndHeaderAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, action }: {
      logoId: string;
      action?: {
        type: 'declare_winner' | 'end_test' | 'extend_test';
        winnerVariantId?: string;
        extensionDays?: number;
        reason?: string;
      };
    }) => headerLogoApi.endAbTest(logoId, action),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

// ========== USAGE TRACKING HOOKS ==========

export const useTrackLogoInteraction = () => {
  return useMutation({
    mutationFn: ({ logoId, interaction }: {
      logoId: string;
      interaction: {
        type: 'impression' | 'click' | 'hover' | 'scroll_interaction';
        context: {
          pageId: string;
          pageUrl: string;
          componentId: string;
          deviceType: string;
          viewport: { width: number; height: number };
          timestamp: Date;
        };
        metadata?: Record<string, unknown>;
      };
    }) => headerLogoApi.trackInteraction(logoId, interaction),
  });
};

export const useUsageAnalysis = (logoId: string, params?: {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  groupBy?: 'page' | 'component' | 'device' | 'time';
}) => {
  return useQuery({
    queryKey: ['header-logos', logoId, 'usage-analysis', params],
    queryFn: () => headerLogoApi.getUsageAnalysis(logoId, params),
    enabled: !!logoId,
    staleTime: 5 * 60 * 1000,
  });
};

// ========== BULK OPERATIONS HOOKS ==========

export const useBulkHeaderLogoOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: {
      action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'approve' | 'optimize' | 'update';
      logoIds: string[];
      data?: Partial<HeaderLogo>;
      options?: Record<string, unknown>;
    }) => headerLogoApi.bulkOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
    },
  });
};

// ========== IMPORT/EXPORT HOOKS ==========

export const useExportHeaderLogos = () => {
  return useMutation({
    mutationFn: ({ logoIds, options }: {
      logoIds?: string[];
      options?: {
        format?: 'json' | 'zip' | 'figma' | 'sketch';
        includeAssets?: boolean;
        includeAnalytics?: boolean;
        includeVersionHistory?: boolean;
      };
    }) => headerLogoApi.exportLogos(logoIds, options),
  });
};

export const useImportHeaderLogos = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: {
      file: File;
      options?: {
        overwrite?: boolean;
        preserveIds?: boolean;
        generateVariants?: boolean;
        validateBrand?: boolean;
        autoOptimize?: boolean;
      };
    }) => headerLogoApi.importLogos(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
    },
  });
};

// ========== SEARCH & FILTERING HOOKS ==========

export const useSearchHeaderLogos = (query: string, filters?: HeaderLogoFilter & {
  facets?: string[];
  boost?: Record<string, number>;
  fuzzy?: boolean;
}) => {
  return useQuery({
    queryKey: ['header-logos', 'search', query, filters],
    queryFn: () => headerLogoApi.searchLogos(query, filters),
    enabled: !!query,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ========== VERSION CONTROL HOOKS ==========

export const useHeaderLogoVersionHistory = (logoId: string, params?: {
  limit?: number;
  includeContent?: boolean;
}) => {
  return useQuery({
    queryKey: ['header-logos', logoId, 'versions', params],
    queryFn: () => headerLogoApi.getVersionHistory(logoId, params),
    enabled: !!logoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRevertHeaderLogoVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, version, options }: {
      logoId: string;
      version: number;
      options?: {
        createBackup?: boolean;
        preserveAnalytics?: boolean;
        notifyUsers?: boolean;
      };
    }) => headerLogoApi.revertToVersion(logoId, version, options),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useCreateLogoBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, branchName, fromVersion }: {
      logoId: string;
      branchName: string;
      fromVersion?: number;
    }) => headerLogoApi.createBranch(logoId, branchName, fromVersion),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['header-logos'] });
      queryClient.setQueryData(['header-logos', result.logo.id], result.logo);
    },
  });
};

// ========== PREVIEW & VALIDATION HOOKS ==========

export const useHeaderLogoPreview = (logoId: string, context?: {
  theme?: 'light' | 'dark';
  background?: string;
  size?: 'small' | 'medium' | 'large';
  viewport?: { width: number; height: number };
  mockupType?: 'header' | 'mobile' | 'email' | 'social';
}) => {
  return useQuery({
    queryKey: ['header-logos', logoId, 'preview', context],
    queryFn: () => headerLogoApi.getPreview(logoId, context),
    enabled: !!logoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useValidateHeaderLogo = () => {
  return useMutation({
    mutationFn: (data: Partial<HeaderLogo>) => headerLogoApi.validateLogo(data),
  });
};

// ========== COMPOUND HOOKS FOR COMPLEX OPERATIONS ==========

export const useHeaderLogoManagement = (logoId: string) => {
  const logo = useHeaderLogo(logoId, {
    includeAnalytics: true,
    includeUsage: true,
    includeVersions: true,
  });
  const analytics = useHeaderLogoAnalytics(logoId);
  const performanceReport = usePerformanceReport(logoId);
  const abTestResults = useHeaderAbTestResults(logoId);
  const usageAnalysis = useUsageAnalysis(logoId);
  const versionHistory = useHeaderLogoVersionHistory(logoId);
  
  return {
    logo,
    analytics,
    performanceReport,
    abTestResults,
    usageAnalysis,
    versionHistory,
    isLoading: logo.isLoading || analytics.isLoading || performanceReport.isLoading || abTestResults.isLoading || usageAnalysis.isLoading || versionHistory.isLoading,
    error: logo.error || analytics.error || performanceReport.error || abTestResults.error || usageAnalysis.error || versionHistory.error,
  };
};

export const useHeaderLogoDashboard = () => {
  const logos = useHeaderLogos({
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    includeAnalytics: true,
  });
  const analyticsReport = useHeaderAnalyticsReport({
    period: 'week',
    metrics: ['impressions', 'clicks', 'ctr', 'loadTime'],
  });
  const templates = useHeaderLogoTemplates();
  
  return {
    logos,
    analyticsReport,
    templates,
    isLoading: logos.isLoading || analyticsReport.isLoading || templates.isLoading,
    error: logos.error || analyticsReport.error || templates.error,
  };
};

// Export the API instance and all hooks
export { headerLogoApi };
export default headerLogoApi;

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

// Footer Logo Types
export interface FooterLogo {
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
  
  // Logo Variants for different use cases
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
    square?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    horizontal?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    vertical?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
  };
  
  // Display Configuration
  display: {
    position: 'left' | 'center' | 'right';
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
    };
    tablet: {
      maxWidth: number;
      maxHeight: number;
      position: 'left' | 'center' | 'right';
      visible: boolean;
    };
    desktop: {
      maxWidth: number;
      maxHeight: number;
      position: 'left' | 'center' | 'right';
      visible: boolean;
    };
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
    };
  };
  
  // Animation Settings
  animation: {
    entrance: {
      enabled: boolean;
      type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce' | 'rotate';
      duration: number;
      delay: number;
      easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    };
    
    loading: {
      type: 'skeleton' | 'shimmer' | 'pulse' | 'spinner';
      color: string;
    };
    
    parallax: {
      enabled: boolean;
      speed: number;
      direction: 'vertical' | 'horizontal';
    };
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: Array<{
      id: string;
      name: string;
      weight: number;
      config: Partial<FooterLogo>;
      impressions: number;
      clicks: number;
    }>;
    winnerVariant?: string;
    testDuration?: number;
    testEndDate?: Date;
  };
  
  // Analytics & Performance
  analytics: {
    impressions: number;
    clicks: number;
    ctr: number; // Click-through rate
    
    // Performance metrics
    loadTime: number;
    errorRate: number;
    
    // User engagement
    hoverCount: number;
    averageViewTime: number;
    
    // Device breakdown
    deviceStats: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    
    // Geographic data
    topCountries: Array<{
      country: string;
      count: number;
    }>;
  };
  
  // Version Control
  version: number;
  changelog: Array<{
    version: number;
    changes: string[];
    changedBy: string;
    changedAt: Date;
  }>;
  
  // Status & Scheduling
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  
  schedule?: {
    publishAt?: Date;
    expireAt?: Date;
    timezone: string;
    
    // Recurring schedule
    recurring?: {
      enabled: boolean;
      pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      endDate?: Date;
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
      usageContext: boolean;
    };
    
    notes?: string[];
  };
  
  // Usage Tracking
  usage: {
    usedIn: string[]; // Array of page/component IDs where this logo is used
    lastUsed: Date;
    usageCount: number;
    
    // Dependencies
    dependencies: string[]; // IDs of other elements that depend on this logo
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
  
  // User Relations
  createdBy: string;
  updatedBy?: string;
  approvedBy?: string;
}

// Logo Template System
export interface FooterLogoTemplate {
  id: string;
  name: string;
  description: string;
  category: 'corporate' | 'startup' | 'retail' | 'nonprofit' | 'agency' | 'custom';
  
  // Template Configuration
  config: Partial<FooterLogo>;
  
  // Preview Assets
  thumbnailUrl: string;
  previewImages: string[];
  
  // Template Metadata
  isPremium: boolean;
  rating: number;
  downloads: number;
  tags: string[];
  
  // Compatibility
  compatibleWith: string[];
  minVersion: string;
  
  // Author Information
  author: {
    name: string;
    avatar?: string;
    profile?: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface FooterLogoAnalytics {
  logoId: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Engagement Metrics
  impressions: number;
  clicks: number;
  ctr: number;
  uniqueViews: number;
  
  // Performance Metrics
  averageLoadTime: number;
  errorRate: number;
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  
  // User Behavior
  hoverEvents: number;
  scrollDepth: number;
  timeOnPage: number;
  bounceRate: number;
  
  // Device & Browser Analysis
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  
  // Geographic Distribution
  countryBreakdown: Record<string, number>;
  cityBreakdown: Record<string, number>;
  
  // Time-based Analysis
  hourlyDistribution: Record<string, number>;
  dailyDistribution: Record<string, number>;
  
  // Conversion Tracking
  conversions: number;
  conversionRate: number;
  revenue: number;
  
  // A/B Test Results
  abTestResults?: {
    variants: Array<{
      id: string;
      name: string;
      impressions: number;
      clicks: number;
      ctr: number;
      conversions: number;
      significance: number;
    }>;
    
    confidence: number;
    winningVariant?: string;
  };
}

// Additional Parameter Types
export interface FooterLogoListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeAnalytics?: boolean;
  includeUsage?: boolean;
}

export interface FooterLogoFilter {
  status?: FooterLogo['status'][];
  categories?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string[];
  hasAbTest?: boolean;
  brandApproved?: boolean;
  usageCountMin?: number;
  usageCountMax?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Footer Logo API Service Class
class FooterLogoApi {
  // Basic CRUD Operations
  async getFooterLogos(params?: FooterLogoListParams & FooterLogoFilter) {
    const response = await httpClient.get<ApiResponse<{ items: FooterLogo[]; pagination: PaginationInfo }>>(
      endpoints.footerLogos.list,
      { params }
    );
    return response.data;
  }

  async getFooterLogo(id: string, options?: {
    includeAnalytics?: boolean;
    includeUsage?: boolean;
    includeChangelog?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.byId(id),
      { params: options }
    );
    return response.data!.data;
  }

  async createFooterLogo(data: Omit<FooterLogo, 'id' | 'createdAt' | 'updatedAt' | 'analytics' | 'usage'>) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.create,
      data
    );
    return response.data!.data;
  }

  async updateFooterLogo(id: string, data: Partial<FooterLogo>) {
    const response = await httpClient.put<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.update(id),
      data
    );
    return response.data!.data;
  }

  async deleteFooterLogo(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.footerLogos.delete(id)
    );
    return response.data;
  }

  // Logo Upload & Management
  async uploadLogo(file: File, options?: {
    generateVariants?: boolean;
    optimize?: boolean;
    formats?: ('png' | 'jpg' | 'webp' | 'svg')[];
  }) {
    const formData = new FormData();
    formData.append('logo', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await httpClient.post<ApiResponse<{
      logo: FooterLogo['logo'];
      variants: FooterLogo['variants'];
    }>>(
      endpoints.footerLogos.upload,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data!.data;
  }

  async generateVariants(logoId: string, types: ('light' | 'dark' | 'monochrome' | 'square' | 'horizontal' | 'vertical')[]) {
    const response = await httpClient.post<ApiResponse<FooterLogo['variants']>>(
      endpoints.footerLogos.generateVariants(logoId),
      { types }
    );
    return response.data!.data;
  }

  async optimizeLogo(logoId: string, options?: {
    quality?: number;
    format?: 'png' | 'jpg' | 'webp';
    maxWidth?: number;
    maxHeight?: number;
  }) {
    const response = await httpClient.post<ApiResponse<FooterLogo['logo']>>(
      endpoints.footerLogos.optimize(logoId),
      options
    );
    return response.data!.data;
  }

  // Template Operations
  async getTemplates(category?: string) {
    const response = await httpClient.get<ApiResponse<FooterLogoTemplate[]>>(
      endpoints.footerLogos.templates,
      { params: { category } }
    );
    return response.data!.data;
  }

  async getTemplate(id: string) {
    const response = await httpClient.get<ApiResponse<FooterLogoTemplate>>(
      endpoints.footerLogos.template(id)
    );
    return response.data!.data;
  }

  async createFromTemplate(templateId: string, customizations?: Partial<FooterLogo>) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.createFromTemplate(templateId),
      customizations
    );
    return response.data!.data;
  }

  async saveAsTemplate(logoId: string, templateData: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  }) {
    const response = await httpClient.post<ApiResponse<FooterLogoTemplate>>(
      endpoints.footerLogos.saveAsTemplate(logoId),
      templateData
    );
    return response.data!.data;
  }

  // Status Management
  async publishLogo(id: string, publishAt?: Date) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.publish(id),
      { publishAt }
    );
    return response.data!.data;
  }

  async unpublishLogo(id: string) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.unpublish(id)
    );
    return response.data!.data;
  }

  async archiveLogo(id: string) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.archive(id)
    );
    return response.data!.data;
  }

  async duplicateLogo(id: string, name?: string) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.duplicate(id),
      { name }
    );
    return response.data!.data;
  }

  // Analytics Operations
  async getLogoAnalytics(id: string, params?: {
    period?: FooterLogoAnalytics['period'];
    dateFrom?: string;
    dateTo?: string;
  }) {
    const response = await httpClient.get<ApiResponse<FooterLogoAnalytics>>(
      endpoints.footerLogos.analytics(id),
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
  }) {
    const response = await httpClient.get<ApiResponse<unknown>>(
      endpoints.footerLogos.analyticsReport,
      { params }
    );
    return response.data!.data;
  }

  // Brand Compliance
  async submitForApproval(logoId: string, notes?: string) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.submitForApproval(logoId),
      { notes }
    );
    return response.data!.data;
  }

  async approveLogo(logoId: string, guidelines: {
    colorAccuracy: boolean;
    sizeCompliance: boolean;
    spacingCompliance: boolean;
    usageContext: boolean;
  }, notes?: string[]) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.approve(logoId),
      { guidelines, notes }
    );
    return response.data!.data;
  }

  async rejectLogo(logoId: string, reason: string, notes?: string[]) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.reject(logoId),
      { reason, notes }
    );
    return response.data!.data;
  }

  // A/B Testing Operations
  async createAbTest(logoId: string, testConfig: {
    name: string;
    variants: Array<{
      name: string;
      weight: number;
      config: Partial<FooterLogo>;
    }>;
    duration?: number;
  }) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.createAbTest(logoId),
      testConfig
    );
    return response.data!.data;
  }

  async getAbTestResults(logoId: string) {
    const response = await httpClient.get<ApiResponse<FooterLogoAnalytics['abTestResults']>>(
      endpoints.footerLogos.abTestResults(logoId)
    );
    return response.data!.data;
  }

  async endAbTest(logoId: string, winnerVariantId?: string) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.endAbTest(logoId),
      { winnerVariantId }
    );
    return response.data!.data;
  }

  // Usage Tracking
  async trackUsage(logoId: string, context: {
    pageId: string;
    componentId: string;
    event: 'impression' | 'click' | 'hover';
    metadata?: Record<string, unknown>;
  }) {
    const response = await httpClient.post<ApiResponse<void>>(
      endpoints.footerLogos.trackUsage(logoId),
      context
    );
    return response.data;
  }

  async getUsageReport(logoId: string, params?: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const response = await httpClient.get<ApiResponse<{
      usedIn: Array<{
        pageId: string;
        pageName: string;
        componentId: string;
        componentName: string;
        usageCount: number;
        lastUsed: Date;
      }>;
      totalUsage: number;
      trends: Record<string, number>;
    }>>(
      endpoints.footerLogos.usageReport(logoId),
      { params }
    );
    return response.data!.data;
  }

  // Bulk Operations
  async bulkOperation(operation: {
    action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'approve' | 'update';
    logoIds: string[];
    data?: Partial<FooterLogo>;
  }) {
    const response = await httpClient.post<ApiResponse<{
      success: number;
      failed: number;
      errors: Array<{
        logoId: string;
        error: string;
      }>;
    }>>(
      endpoints.footerLogos.bulk,
      operation
    );
    return response.data!.data;
  }

  // Import/Export Operations
  async exportLogos(logoIds?: string[], format?: 'json' | 'zip') {
    const response = await httpClient.get(
      endpoints.footerLogos.export,
      {
        params: { logoIds, format },
        responseType: 'blob'
      }
    );
    return response.data;
  }

  async importLogos(file: File, options?: {
    overwrite?: boolean;
    preserveIds?: boolean;
    generateVariants?: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await httpClient.post<ApiResponse<{
      imported: number;
      failed: number;
      errors: string[];
    }>>(
      endpoints.footerLogos.import,
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
  async searchLogos(query: string, filters?: FooterLogoFilter) {
    const response = await httpClient.get<ApiResponse<{ items: FooterLogo[]; pagination: PaginationInfo }>>(
      endpoints.footerLogos.search,
      { params: { q: query, ...filters } }
    );
    return response.data;
  }

  // Version Control
  async getVersionHistory(logoId: string) {
    const response = await httpClient.get<ApiResponse<FooterLogo['changelog']>>(
      endpoints.footerLogos.versions(logoId)
    );
    return response.data!.data;
  }

  async revertToVersion(logoId: string, version: number) {
    const response = await httpClient.post<ApiResponse<FooterLogo>>(
      endpoints.footerLogos.revertVersion(logoId),
      { version }
    );
    return response.data!.data;
  }

  // Preview & Validation
  async getPreview(logoId: string, context?: {
    theme?: 'light' | 'dark';
    background?: string;
    size?: 'small' | 'medium' | 'large';
  }) {
    const response = await httpClient.get<ApiResponse<{
      previewUrl: string;
      variants: Record<string, string>;
    }>>(
      endpoints.footerLogos.preview(logoId),
      { params: context }
    );
    return response.data!.data;
  }

  async validateLogo(data: Partial<FooterLogo>) {
    const response = await httpClient.post<ApiResponse<{
      valid: boolean;
      errors: Array<{
        field: string;
        message: string;
      }>;
      warnings: Array<{
        field: string;
        message: string;
      }>;
    }>>(
      endpoints.footerLogos.validate,
      data
    );
    return response.data!.data;
  }
}

// Create service instance
const footerLogoApi = new FooterLogoApi();

// REACT QUERY HOOKS - COMPREHENSIVE FOOTER LOGO MANAGEMENT

// ========== BASIC CRUD HOOKS ==========

export const useFooterLogos = (params?: FooterLogoListParams & FooterLogoFilter) => {
  return useQuery({
    queryKey: ['footer-logos', 'list', params],
    queryFn: () => footerLogoApi.getFooterLogos(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useInfiniteFooterLogos = (params?: FooterLogoListParams & FooterLogoFilter) => {
  return useInfiniteQuery({
    queryKey: ['footer-logos', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      footerLogoApi.getFooterLogos({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.data || !lastPage.data.pagination) return undefined;
      const pagination = lastPage.data.pagination;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFooterLogo = (logoId: string, options?: {
  includeAnalytics?: boolean;
  includeUsage?: boolean;
  includeChangelog?: boolean;
}) => {
  return useQuery({
    queryKey: ['footer-logos', logoId, options],
    queryFn: () => footerLogoApi.getFooterLogo(logoId, options),
    enabled: !!logoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useCreateFooterLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<FooterLogo, 'id' | 'createdAt' | 'updatedAt' | 'analytics' | 'usage'>) =>
      footerLogoApi.createFooterLogo(data),
    onSuccess: (newLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', newLogo.id], newLogo);
    },
  });
};

export const useUpdateFooterLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FooterLogo> }) =>
      footerLogoApi.updateFooterLogo(id, data),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useDeleteFooterLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (logoId: string) => footerLogoApi.deleteFooterLogo(logoId),
    onSuccess: (_, logoId) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.removeQueries({ queryKey: ['footer-logos', logoId] });
    },
  });
};

// ========== LOGO UPLOAD & MANAGEMENT HOOKS ==========

export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: {
      file: File;
      options?: {
        generateVariants?: boolean;
        optimize?: boolean;
        formats?: ('png' | 'jpg' | 'webp' | 'svg')[];
      };
    }) => footerLogoApi.uploadLogo(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
    },
  });
};

export const useGenerateVariants = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, types }: {
      logoId: string;
      types: ('light' | 'dark' | 'monochrome' | 'square' | 'horizontal' | 'vertical')[];
    }) => footerLogoApi.generateVariants(logoId, types),
    onSuccess: (_, { logoId }) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos', logoId] });
    },
  });
};

export const useOptimizeLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, options }: {
      logoId: string;
      options?: {
        quality?: number;
        format?: 'png' | 'jpg' | 'webp';
        maxWidth?: number;
        maxHeight?: number;
      };
    }) => footerLogoApi.optimizeLogo(logoId, options),
    onSuccess: (_, { logoId }) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos', logoId] });
    },
  });
};

// ========== TEMPLATE MANAGEMENT HOOKS ==========

export const useFooterLogoTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['footer-logo-templates', category],
    queryFn: () => footerLogoApi.getTemplates(category),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useFooterLogoTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['footer-logo-templates', templateId],
    queryFn: () => footerLogoApi.getTemplate(templateId),
    enabled: !!templateId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, customizations }: {
      templateId: string;
      customizations?: Partial<FooterLogo>;
    }) => footerLogoApi.createFromTemplate(templateId, customizations),
    onSuccess: (newLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', newLogo.id], newLogo);
    },
  });
};

export const useSaveAsTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, templateData }: {
      logoId: string;
      templateData: {
        name: string;
        description: string;
        category: string;
        tags: string[];
      };
    }) => footerLogoApi.saveAsTemplate(logoId, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-logo-templates'] });
    },
  });
};

// ========== STATUS MANAGEMENT HOOKS ==========

export const usePublishLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, publishAt }: { id: string; publishAt?: Date }) =>
      footerLogoApi.publishLogo(id, publishAt),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useUnpublishLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (logoId: string) => footerLogoApi.unpublishLogo(logoId),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useArchiveLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (logoId: string) => footerLogoApi.archiveLogo(logoId),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useDuplicateLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      footerLogoApi.duplicateLogo(id, name),
    onSuccess: (newLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', newLogo.id], newLogo);
    },
  });
};

// ========== ANALYTICS HOOKS ==========

export const useLogoAnalytics = (logoId: string, params?: {
  period?: FooterLogoAnalytics['period'];
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['footer-logos', logoId, 'analytics', params],
    queryFn: () => footerLogoApi.getLogoAnalytics(logoId, params),
    enabled: !!logoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAnalyticsReport = (params?: {
  logoIds?: string[];
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  metrics?: string[];
}) => {
  return useQuery({
    queryKey: ['footer-logos', 'analytics-report', params],
    queryFn: () => footerLogoApi.getAnalyticsReport(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// ========== BRAND COMPLIANCE HOOKS ==========

export const useSubmitForApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, notes }: { logoId: string; notes?: string }) =>
      footerLogoApi.submitForApproval(logoId, notes),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useApproveLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, guidelines, notes }: {
      logoId: string;
      guidelines: {
        colorAccuracy: boolean;
        sizeCompliance: boolean;
        spacingCompliance: boolean;
        usageContext: boolean;
      };
      notes?: string[];
    }) => footerLogoApi.approveLogo(logoId, guidelines, notes),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useRejectLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, reason, notes }: {
      logoId: string;
      reason: string;
      notes?: string[];
    }) => footerLogoApi.rejectLogo(logoId, reason, notes),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

// ========== A/B TESTING HOOKS ==========

export const useCreateAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, testConfig }: {
      logoId: string;
      testConfig: {
        name: string;
        variants: Array<{
          name: string;
          weight: number;
          config: Partial<FooterLogo>;
        }>;
        duration?: number;
      };
    }) => footerLogoApi.createAbTest(logoId, testConfig),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

export const useAbTestResults = (logoId: string) => {
  return useQuery({
    queryKey: ['footer-logos', logoId, 'ab-test-results'],
    queryFn: () => footerLogoApi.getAbTestResults(logoId),
    enabled: !!logoId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEndAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, winnerVariantId }: {
      logoId: string;
      winnerVariantId?: string;
    }) => footerLogoApi.endAbTest(logoId, winnerVariantId),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

// ========== USAGE TRACKING HOOKS ==========

export const useTrackUsage = () => {
  return useMutation({
    mutationFn: ({ logoId, context }: {
      logoId: string;
      context: {
        pageId: string;
        componentId: string;
        event: 'impression' | 'click' | 'hover';
        metadata?: Record<string, unknown>;
      };
    }) => footerLogoApi.trackUsage(logoId, context),
  });
};

export const useUsageReport = (logoId: string, params?: {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['footer-logos', logoId, 'usage-report', params],
    queryFn: () => footerLogoApi.getUsageReport(logoId, params),
    enabled: !!logoId,
    staleTime: 5 * 60 * 1000,
  });
};

// ========== BULK OPERATIONS HOOKS ==========

export const useBulkLogoOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: {
      action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'approve' | 'update';
      logoIds: string[];
      data?: Partial<FooterLogo>;
    }) => footerLogoApi.bulkOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
    },
  });
};

// ========== IMPORT/EXPORT HOOKS ==========

export const useExportLogos = () => {
  return useMutation({
    mutationFn: ({ logoIds, format }: {
      logoIds?: string[];
      format?: 'json' | 'zip';
    }) => footerLogoApi.exportLogos(logoIds, format),
  });
};

export const useImportLogos = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: {
      file: File;
      options?: {
        overwrite?: boolean;
        preserveIds?: boolean;
        generateVariants?: boolean;
      };
    }) => footerLogoApi.importLogos(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
    },
  });
};

// ========== SEARCH & FILTERING HOOKS ==========

export const useSearchLogos = (query: string, filters?: FooterLogoFilter) => {
  return useQuery({
    queryKey: ['footer-logos', 'search', query, filters],
    queryFn: () => footerLogoApi.searchLogos(query, filters),
    enabled: !!query,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ========== VERSION CONTROL HOOKS ==========

export const useVersionHistory = (logoId: string) => {
  return useQuery({
    queryKey: ['footer-logos', logoId, 'versions'],
    queryFn: () => footerLogoApi.getVersionHistory(logoId),
    enabled: !!logoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRevertToVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ logoId, version }: { logoId: string; version: number }) =>
      footerLogoApi.revertToVersion(logoId, version),
    onSuccess: (updatedLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footer-logos'] });
      queryClient.setQueryData(['footer-logos', updatedLogo.id], updatedLogo);
    },
  });
};

// ========== PREVIEW & VALIDATION HOOKS ==========

export const useLogoPreview = (logoId: string, context?: {
  theme?: 'light' | 'dark';
  background?: string;
  size?: 'small' | 'medium' | 'large';
}) => {
  return useQuery({
    queryKey: ['footer-logos', logoId, 'preview', context],
    queryFn: () => footerLogoApi.getPreview(logoId, context),
    enabled: !!logoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useValidateLogo = () => {
  return useMutation({
    mutationFn: (data: Partial<FooterLogo>) => footerLogoApi.validateLogo(data),
  });
};

// ========== COMPOUND HOOKS FOR COMPLEX OPERATIONS ==========

export const useLogoManagement = (logoId: string) => {
  const logo = useFooterLogo(logoId, {
    includeAnalytics: true,
    includeUsage: true,
    includeChangelog: true,
  });
  const analytics = useLogoAnalytics(logoId);
  const abTestResults = useAbTestResults(logoId);
  const usageReport = useUsageReport(logoId);
  const versionHistory = useVersionHistory(logoId);
  
  return {
    logo,
    analytics,
    abTestResults,
    usageReport,
    versionHistory,
    isLoading: logo.isLoading || analytics.isLoading || abTestResults.isLoading || usageReport.isLoading || versionHistory.isLoading,
    error: logo.error || analytics.error || abTestResults.error || usageReport.error || versionHistory.error,
  };
};

export const useLogoDashboard = () => {
  const logos = useFooterLogos({
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    includeAnalytics: true,
  });
  const analyticsReport = useAnalyticsReport({
    period: 'week',
    metrics: ['impressions', 'clicks', 'ctr'],
  });
  const templates = useFooterLogoTemplates();
  
  return {
    logos,
    analyticsReport,
    templates,
    isLoading: logos.isLoading || analyticsReport.isLoading || templates.isLoading,
    error: logos.error || analyticsReport.error || templates.error,
  };
};

// Export the API instance and all hooks
export { footerLogoApi };
export default footerLogoApi;

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

// Favorite Section Types
export interface FavoriteSection {
  id: string;
  title: string;
  description?: string;
  slug: string;
  
  // Display Configuration
  displayType: 'grid' | 'list' | 'carousel' | 'masonry';
  itemsPerRow: number;
  maxItems: number;
  showTitle: boolean;
  showDescription: boolean;
  showViewAll: boolean;
  
  // Styling & Layout
  layout: {
    containerWidth: 'full' | 'container' | 'narrow';
    padding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    margin: {
      top: number;
      bottom: number;
    };
    backgroundColor?: string;
    backgroundImage?: string;
    borderRadius: number;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
  
  // Typography
  typography: {
    titleFont: string;
    titleSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    titleWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    titleColor: string;
    descriptionFont: string;
    descriptionSize: 'xs' | 'sm' | 'base' | 'lg';
    descriptionColor: string;
  };
  
  // Content Configuration
  contentType: 'products' | 'categories' | 'brands' | 'collections' | 'custom';
  contentIds: string[];
  autoUpdate: boolean;
  
  // Filtering & Sorting
  filters: {
    categories?: string[];
    brands?: string[];
    priceRange?: {
      min: number;
      max: number;
    };
    tags?: string[];
    inStock?: boolean;
    featured?: boolean;
    onSale?: boolean;
  };
  
  sortBy: 'popularity' | 'newest' | 'price-low' | 'price-high' | 'rating' | 'name' | 'random';
  
  // Animation & Effects
  animation: {
    entrance: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';
    hover: 'none' | 'scale' | 'lift' | 'glow' | 'rotate';
    loading: 'skeleton' | 'spinner' | 'shimmer' | 'pulse';
    stagger: boolean;
    duration: number;
  };
  
  // Responsive Settings
  responsive: {
    mobile: {
      itemsPerRow: number;
      maxItems: number;
      displayType: 'grid' | 'list' | 'carousel';
    };
    tablet: {
      itemsPerRow: number;
      maxItems: number;
      displayType: 'grid' | 'list' | 'carousel';
    };
    desktop: {
      itemsPerRow: number;
      maxItems: number;
      displayType: 'grid' | 'list' | 'carousel' | 'masonry';
    };
  };
  
  // SEO & Meta
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  
  // Analytics & Tracking
  tracking: {
    enabled: boolean;
    events: string[];
    customProperties?: Record<string, unknown>;
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: Array<{
      id: string;
      name: string;
      weight: number;
      config: Partial<FavoriteSection>;
    }>;
    winnerVariant?: string;
  };
  
  // Scheduling
  schedule?: {
    startDate?: Date;
    endDate?: Date;
    timezone: string;
    recurrence?: {
      type: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endAfter?: number;
    };
  };
  
  // Personalization
  personalization: {
    enabled: boolean;
    rules: Array<{
      condition: string;
      action: string;
      value: unknown;
    }>;
    segmentTargeting?: string[];
  };
  
  // Status & Visibility
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  visibility: 'public' | 'private' | 'members-only';
  priority: number;
  
  // Metadata
  metadata: Record<string, unknown>;
  tags: string[];
  version: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  
  // Relations
  createdBy: string;
  updatedBy?: string;
}

// Template System
export interface FavoriteSectionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ecommerce' | 'blog' | 'portfolio' | 'landing' | 'custom';
  tags: string[];
  
  // Template Configuration
  config: Partial<FavoriteSection>;
  
  // Preview
  thumbnailUrl: string;
  previewImages: string[];
  
  // Usage Stats
  usageCount: number;
  rating: number;
  reviews: number;
  
  // Template Metadata
  isPremium: boolean;
  author: string;
  version: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface FavoriteSectionAnalytics {
  sectionId: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Performance Metrics
  views: number;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  
  // Engagement Metrics
  hoverTime: number;
  scrollDepth: number;
  bounceRate: number;
  
  // Conversion Metrics
  conversions: number;
  conversionRate: number;
  revenue: number;
  
  // User Behavior
  topProducts: Array<{
    id: string;
    name: string;
    clicks: number;
    conversions: number;
  }>;
  
  // Device & Browser Stats
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  
  // Geographic Data
  countryBreakdown: Record<string, number>;
  cityBreakdown: Record<string, number>;
  
  // Time-based Analysis
  hourlyDistribution: Record<string, number>;
  dailyDistribution: Record<string, number>;
  
  // A/B Test Results
  abTestResults?: {
    variants: Array<{
      id: string;
      name: string;
      views: number;
      conversions: number;
      conversionRate: number;
      confidence: number;
    }>;
    winningVariant?: string;
    significance: number;
  };
}

// Additional Parameter Types
export interface FavoriteSectionListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: FavoriteSection['status'][];
  contentType?: string[];
  tags?: string[];
}

export interface FavoriteSectionFilter {
  status?: FavoriteSection['status'][];
  contentType?: string[];
  visibility?: FavoriteSection['visibility'][];
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string[];
  tags?: string[];
  hasSchedule?: boolean;
  hasAbTest?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Favorite Section API Service Class
class FavoriteSectionApi {
  // Basic CRUD Operations
  async getFavoriteSections(params?: FavoriteSectionListParams & FavoriteSectionFilter) {
    const response = await httpClient.get<ApiResponse<{ items: FavoriteSection[]; pagination: PaginationInfo }>>(
      endpoints.favoriteSections.list,
      { params }
    );
    return response.data;
  }

  async getFavoriteSection(id: string, options?: {
    includeAnalytics?: boolean;
    includeContent?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.byId(id),
      { params: options }
    );
    return response.data!.data;
  }

  async createFavoriteSection(data: Omit<FavoriteSection, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.create,
      data
    );
    return response.data!.data;
  }

  async updateFavoriteSection(id: string, data: Partial<FavoriteSection>) {
    const response = await httpClient.put<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.update(id),
      data
    );
    return response.data!.data;
  }

  async deleteFavoriteSection(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.favoriteSections.delete(id)
    );
    return response.data;
  }

  // Template Operations
  async getTemplates(category?: string) {
    const response = await httpClient.get<ApiResponse<FavoriteSectionTemplate[]>>(
      endpoints.favoriteSections.templates,
      { params: { category } }
    );
    return response.data!.data;
  }

  async getTemplate(id: string) {
    const response = await httpClient.get<ApiResponse<FavoriteSectionTemplate>>(
      endpoints.favoriteSections.template(id)
    );
    return response.data!.data;
  }

  async createFromTemplate(templateId: string, customizations?: Partial<FavoriteSection>) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.createFromTemplate(templateId),
      customizations
    );
    return response.data!.data;
  }

  async saveAsTemplate(sectionId: string, templateData: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  }) {
    const response = await httpClient.post<ApiResponse<FavoriteSectionTemplate>>(
      endpoints.favoriteSections.saveAsTemplate(sectionId),
      templateData
    );
    return response.data!.data;
  }

  // Status Management
  async publishSection(id: string, publishAt?: Date) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.publish(id),
      { publishAt }
    );
    return response.data!.data;
  }

  async unpublishSection(id: string) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.unpublish(id)
    );
    return response.data!.data;
  }

  async archiveSection(id: string) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.archive(id)
    );
    return response.data!.data;
  }

  async duplicateSection(id: string, name?: string) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.duplicate(id),
      { name }
    );
    return response.data!.data;
  }

  // Analytics Operations
  async getSectionAnalytics(id: string, params?: {
    period?: FavoriteSectionAnalytics['period'];
    dateFrom?: string;
    dateTo?: string;
  }) {
    const response = await httpClient.get<ApiResponse<FavoriteSectionAnalytics>>(
      endpoints.favoriteSections.analytics(id),
      { params }
    );
    return response.data!.data;
  }

  async getAnalyticsReport(params?: {
    sectionIds?: string[];
    period?: string;
    dateFrom?: string;
    dateTo?: string;
    metrics?: string[];
  }) {
    const response = await httpClient.get<ApiResponse<unknown>>(
      endpoints.favoriteSections.analyticsReport,
      { params }
    );
    return response.data!.data;
  }

  // A/B Testing Operations
  async createAbTest(sectionId: string, testConfig: {
    name: string;
    variants: Array<{
      name: string;
      weight: number;
      config: Partial<FavoriteSection>;
    }>;
    duration?: number;
  }) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.createAbTest(sectionId),
      testConfig
    );
    return response.data!.data;
  }

  async getAbTestResults(sectionId: string) {
    const response = await httpClient.get<ApiResponse<FavoriteSectionAnalytics['abTestResults']>>(
      endpoints.favoriteSections.abTestResults(sectionId)
    );
    return response.data!.data;
  }

  async endAbTest(sectionId: string, winnerVariantId?: string) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.endAbTest(sectionId),
      { winnerVariantId }
    );
    return response.data!.data;
  }

  // Bulk Operations
  async bulkOperation(operation: {
    action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'update';
    sectionIds: string[];
    data?: Partial<FavoriteSection>;
  }) {
    const response = await httpClient.post<ApiResponse<{
      success: number;
      failed: number;
      errors: Array<{
        sectionId: string;
        error: string;
      }>;
    }>>(
      endpoints.favoriteSections.bulk,
      operation
    );
    return response.data!.data;
  }

  // Import/Export Operations
  async exportSections(sectionIds?: string[], format?: 'json' | 'csv') {
    const response = await httpClient.get(
      endpoints.favoriteSections.export,
      {
        params: { sectionIds, format },
        responseType: 'blob'
      }
    );
    return response.data;
  }

  async importSections(file: File, options?: {
    overwrite?: boolean;
    preserveIds?: boolean;
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
      endpoints.favoriteSections.import,
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
  async searchSections(query: string, filters?: FavoriteSectionFilter) {
    const response = await httpClient.get<ApiResponse<{ items: FavoriteSection[]; pagination: PaginationInfo }>>(
      endpoints.favoriteSections.search,
      { params: { q: query, ...filters } }
    );
    return response.data;
  }

  // Content Management
  async updateContent(sectionId: string, contentIds: string[]) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.updateContent(sectionId),
      { contentIds }
    );
    return response.data!.data;
  }

  async refreshContent(sectionId: string) {
    const response = await httpClient.post<ApiResponse<FavoriteSection>>(
      endpoints.favoriteSections.refreshContent(sectionId)
    );
    return response.data!.data;
  }

  // Preview Operations
  async getPreview(sectionId: string, variantId?: string) {
    const response = await httpClient.get<ApiResponse<{
      html: string;
      css: string;
      js?: string;
    }>>(
      endpoints.favoriteSections.preview(sectionId),
      { params: { variantId } }
    );
    return response.data!.data;
  }

  // Validation
  async validateSection(data: Partial<FavoriteSection>) {
    const response = await httpClient.post<ApiResponse<{
      valid: boolean;
      errors: Array<{
        field: string;
        message: string;
      }>;
    }>>(
      endpoints.favoriteSections.validate,
      data
    );
    return response.data!.data;
  }
}

// Create service instance
const favoriteSectionApi = new FavoriteSectionApi();

// REACT QUERY HOOKS - COMPREHENSIVE FAVORITE SECTION MANAGEMENT

// ========== BASIC CRUD HOOKS ==========

export const useFavoriteSections = (params?: FavoriteSectionListParams & FavoriteSectionFilter) => {
  return useQuery({
    queryKey: ['favorite-sections', 'list', params],
    queryFn: () => favoriteSectionApi.getFavoriteSections(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useInfiniteFavoriteSections = (params?: FavoriteSectionListParams & FavoriteSectionFilter) => {
  return useInfiniteQuery({
    queryKey: ['favorite-sections', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      favoriteSectionApi.getFavoriteSections({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.data || !lastPage.data.pagination) return undefined;
      const pagination = lastPage.data.pagination;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
};

export const useFavoriteSection = (sectionId: string, options?: {
  includeAnalytics?: boolean;
  includeContent?: boolean;
}) => {
  return useQuery({
    queryKey: ['favorite-sections', sectionId, options],
    queryFn: () => favoriteSectionApi.getFavoriteSection(sectionId, options),
    enabled: !!sectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCreateFavoriteSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<FavoriteSection, 'id' | 'createdAt' | 'updatedAt'>) =>
      favoriteSectionApi.createFavoriteSection(data),
    onSuccess: (newSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', newSection.id], newSection);
    },
  });
};

export const useUpdateFavoriteSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FavoriteSection> }) =>
      favoriteSectionApi.updateFavoriteSection(id, data),
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', updatedSection.id], updatedSection);
    },
  });
};

export const useDeleteFavoriteSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sectionId: string) => favoriteSectionApi.deleteFavoriteSection(sectionId),
    onSuccess: (_, sectionId) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.removeQueries({ queryKey: ['favorite-sections', sectionId] });
    },
  });
};

// ========== TEMPLATE MANAGEMENT HOOKS ==========

export const useFavoriteSectionTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['favorite-section-templates', category],
    queryFn: () => favoriteSectionApi.getTemplates(category),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useFavoriteSectionTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['favorite-section-templates', templateId],
    queryFn: () => favoriteSectionApi.getTemplate(templateId),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, customizations }: {
      templateId: string;
      customizations?: Partial<FavoriteSection>;
    }) => favoriteSectionApi.createFromTemplate(templateId, customizations),
    onSuccess: (newSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', newSection.id], newSection);
    },
  });
};

export const useSaveAsTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sectionId, templateData }: {
      sectionId: string;
      templateData: {
        name: string;
        description: string;
        category: string;
        tags: string[];
      };
    }) => favoriteSectionApi.saveAsTemplate(sectionId, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-section-templates'] });
    },
  });
};

// ========== STATUS MANAGEMENT HOOKS ==========

export const usePublishSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, publishAt }: { id: string; publishAt?: Date }) =>
      favoriteSectionApi.publishSection(id, publishAt),
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', updatedSection.id], updatedSection);
    },
  });
};

export const useUnpublishSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sectionId: string) => favoriteSectionApi.unpublishSection(sectionId),
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', updatedSection.id], updatedSection);
    },
  });
};

export const useArchiveSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sectionId: string) => favoriteSectionApi.archiveSection(sectionId),
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', updatedSection.id], updatedSection);
    },
  });
};

export const useDuplicateSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      favoriteSectionApi.duplicateSection(id, name),
    onSuccess: (newSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', newSection.id], newSection);
    },
  });
};

// ========== ANALYTICS HOOKS ==========

export const useSectionAnalytics = (sectionId: string, params?: {
  period?: FavoriteSectionAnalytics['period'];
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['favorite-sections', sectionId, 'analytics', params],
    queryFn: () => favoriteSectionApi.getSectionAnalytics(sectionId, params),
    enabled: !!sectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAnalyticsReport = (params?: {
  sectionIds?: string[];
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  metrics?: string[];
}) => {
  return useQuery({
    queryKey: ['favorite-sections', 'analytics-report', params],
    queryFn: () => favoriteSectionApi.getAnalyticsReport(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// ========== A/B TESTING HOOKS ==========

export const useCreateAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sectionId, testConfig }: {
      sectionId: string;
      testConfig: {
        name: string;
        variants: Array<{
          name: string;
          weight: number;
          config: Partial<FavoriteSection>;
        }>;
        duration?: number;
      };
    }) => favoriteSectionApi.createAbTest(sectionId, testConfig),
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', updatedSection.id], updatedSection);
    },
  });
};

export const useAbTestResults = (sectionId: string) => {
  return useQuery({
    queryKey: ['favorite-sections', sectionId, 'ab-test-results'],
    queryFn: () => favoriteSectionApi.getAbTestResults(sectionId),
    enabled: !!sectionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEndAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sectionId, winnerVariantId }: {
      sectionId: string;
      winnerVariantId?: string;
    }) => favoriteSectionApi.endAbTest(sectionId, winnerVariantId),
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', updatedSection.id], updatedSection);
    },
  });
};

// ========== BULK OPERATIONS HOOKS ==========

export const useBulkSectionOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: {
      action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'update';
      sectionIds: string[];
      data?: Partial<FavoriteSection>;
    }) => favoriteSectionApi.bulkOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
    },
  });
};

// ========== IMPORT/EXPORT HOOKS ==========

export const useExportSections = () => {
  return useMutation({
    mutationFn: ({ sectionIds, format }: {
      sectionIds?: string[];
      format?: 'json' | 'csv';
    }) => favoriteSectionApi.exportSections(sectionIds, format),
  });
};

export const useImportSections = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: {
      file: File;
      options?: {
        overwrite?: boolean;
        preserveIds?: boolean;
      };
    }) => favoriteSectionApi.importSections(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
    },
  });
};

// ========== SEARCH & FILTERING HOOKS ==========

export const useSearchSections = (query: string, filters?: FavoriteSectionFilter) => {
  return useQuery({
    queryKey: ['favorite-sections', 'search', query, filters],
    queryFn: () => favoriteSectionApi.searchSections(query, filters),
    enabled: !!query,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ========== CONTENT MANAGEMENT HOOKS ==========

export const useUpdateSectionContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sectionId, contentIds }: {
      sectionId: string;
      contentIds: string[];
    }) => favoriteSectionApi.updateContent(sectionId, contentIds),
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', updatedSection.id], updatedSection);
    },
  });
};

export const useRefreshSectionContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sectionId: string) => favoriteSectionApi.refreshContent(sectionId),
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sections'] });
      queryClient.setQueryData(['favorite-sections', updatedSection.id], updatedSection);
    },
  });
};

// ========== PREVIEW & VALIDATION HOOKS ==========

export const useSectionPreview = (sectionId: string, variantId?: string) => {
  return useQuery({
    queryKey: ['favorite-sections', sectionId, 'preview', variantId],
    queryFn: () => favoriteSectionApi.getPreview(sectionId, variantId),
    enabled: !!sectionId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useValidateSection = () => {
  return useMutation({
    mutationFn: (data: Partial<FavoriteSection>) => favoriteSectionApi.validateSection(data),
  });
};

// ========== COMPOUND HOOKS FOR COMPLEX OPERATIONS ==========

export const useSectionManagement = (sectionId: string) => {
  const section = useFavoriteSection(sectionId, {
    includeAnalytics: true,
    includeContent: true,
  });
  const analytics = useSectionAnalytics(sectionId);
  const abTestResults = useAbTestResults(sectionId);
  
  return {
    section,
    analytics,
    abTestResults,
    isLoading: section.isLoading || analytics.isLoading || abTestResults.isLoading,
    error: section.error || analytics.error || abTestResults.error,
  };
};

export const useSectionDashboard = () => {
  const sections = useFavoriteSections({
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const analyticsReport = useAnalyticsReport({
    period: 'week',
    metrics: ['views', 'clicks', 'conversions'],
  });
  const templates = useFavoriteSectionTemplates();
  
  return {
    sections,
    analyticsReport,
    templates,
    isLoading: sections.isLoading || analyticsReport.isLoading || templates.isLoading,
    error: sections.error || analyticsReport.error || templates.error,
  };
};

// Export the API instance and all hooks
export { favoriteSectionApi };
export default favoriteSectionApi;

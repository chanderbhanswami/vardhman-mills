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
 * Brand API Service
 * Handles brand management, products, and related operations
 */

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  website?: string;
  establishedYear?: number;
  country?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata: Record<string, unknown>;
  productCount: number;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BrandCategory {
  categoryId: string;
  categoryName: string;
  productCount: number;
}

interface BrandProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  isInStock: boolean;
  categories: string[];
}

class BrandApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Brand Retrieval

  // Get all brands
  async getBrands(params?: SearchParams & PaginationParams & {
    isActive?: boolean;
    isFeatured?: boolean;
    country?: string;
    hasProducts?: boolean;
  }): Promise<ApiResponse<Brand[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.isActive !== undefined && { isActive: params.isActive }),
      ...(params?.isFeatured !== undefined && { isFeatured: params.isFeatured }),
      ...(params?.country && { country: params.country }),
      ...(params?.hasProducts !== undefined && { hasProducts: params.hasProducts }),
    };
    
    return this.client.get<Brand[]>(endpoints.brands.list, { params: queryParams });
  }

  // Get brand by ID
  async getBrandById(brandId: string): Promise<ApiResponse<Brand>> {
    return this.client.get<Brand>(endpoints.brands.byId(brandId));
  }

  // Get brand by slug
  async getBrandBySlug(slug: string): Promise<ApiResponse<Brand>> {
    return this.client.get<Brand>(endpoints.brands.bySlug(slug));
  }

  // Get featured brands
  async getFeaturedBrands(limit?: number): Promise<ApiResponse<Brand[]>> {
    const params = limit ? { limit } : {};
    return this.client.get<Brand[]>(endpoints.brands.featured, { params });
  }

  // Get brand products
  async getBrandProducts(brandId: string, params?: SearchParams & PaginationParams & {
    categoryId?: string;
    sortBy?: 'name' | 'price' | 'created' | 'popularity' | 'rating';
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
    priceRange?: {
      min: number;
      max: number;
    };
  }): Promise<ApiResponse<BrandProduct[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.categoryId && { categoryId: params.categoryId }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      ...(params?.filters && { filters: JSON.stringify(params.filters) }),
      ...(params?.priceRange && {
        minPrice: params.priceRange.min,
        maxPrice: params.priceRange.max,
      }),
    };
    
    return this.client.get<BrandProduct[]>(endpoints.brands.products(brandId), { params: queryParams });
  }

  // Get brand categories
  async getBrandCategories(brandId: string): Promise<ApiResponse<BrandCategory[]>> {
    return this.client.get<BrandCategory[]>(endpoints.brands.categories(brandId));
  }

  // Get brand statistics
  async getBrandStatistics(brandId: string, params?: {
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<{
    totalProducts: number;
    activeProducts: number;
    totalViews: number;
    uniqueViews: number;
    totalSales: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    conversionRate: number;
    topCategories: Array<{
      categoryId: string;
      categoryName: string;
      productCount: number;
      revenue: number;
    }>;
    topProducts: Array<{
      productId: string;
      productName: string;
      views: number;
      sales: number;
      revenue: number;
    }>;
    salesTrends: Array<{
      date: string;
      sales: number;
      revenue: number;
      views: number;
    }>;
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<{
      totalProducts: number;
      activeProducts: number;
      totalViews: number;
      uniqueViews: number;
      totalSales: number;
      totalRevenue: number;
      averageRating: number;
      totalReviews: number;
      conversionRate: number;
      topCategories: Array<{
        categoryId: string;
        categoryName: string;
        productCount: number;
        revenue: number;
      }>;
      topProducts: Array<{
        productId: string;
        productName: string;
        views: number;
        sales: number;
        revenue: number;
      }>;
      salesTrends: Array<{
        date: string;
        sales: number;
        revenue: number;
        views: number;
      }>;
    }>(endpoints.brands.statistics(brandId), { params: queryParams });
  }

  // Brand Management (Admin)

  // Create brand
  async createBrand(brandData: {
    name: string;
    slug?: string;
    description?: string;
    logo?: string;
    banner?: string;
    website?: string;
    establishedYear?: number;
    country?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<Brand>> {
    return this.client.post<Brand>(endpoints.brands.create, brandData);
  }

  // Update brand
  async updateBrand(brandId: string, updates: Partial<Brand>): Promise<ApiResponse<Brand>> {
    return this.client.put<Brand>(endpoints.brands.update(brandId), updates);
  }

  // Delete brand
  async deleteBrand(brandId: string, options?: {
    moveProductsTo?: string; // Move products to another brand
    deleteProducts?: boolean; // Delete products with this brand
  }): Promise<ApiResponse<{ message: string }>> {
    const params = options ? {
      ...(options.moveProductsTo && { moveProductsTo: options.moveProductsTo }),
      ...(options.deleteProducts !== undefined && { deleteProducts: options.deleteProducts }),
    } : {};
    
    return this.client.delete<{ message: string }>(endpoints.brands.delete(brandId), { params });
  }

  // Upload brand logo
  async uploadBrandLogo(brandId: string, logoFile: File): Promise<ApiResponse<{
    logoUrl: string;
    thumbnailUrl: string;
  }>> {
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    return this.client.post<{
      logoUrl: string;
      thumbnailUrl: string;
    }>(endpoints.brands.uploadLogo(brandId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Upload brand banner
  async uploadBrandBanner(brandId: string, bannerFile: File): Promise<ApiResponse<{
    bannerUrl: string;
    thumbnailUrl: string;
  }>> {
    const formData = new FormData();
    formData.append('banner', bannerFile);
    
    return this.client.post<{
      bannerUrl: string;
      thumbnailUrl: string;
    }>(endpoints.brands.uploadBanner(brandId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete brand logo
  async deleteBrandLogo(brandId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.brands.deleteLogo(brandId));
  }

  // Delete brand banner
  async deleteBrandBanner(brandId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.brands.deleteBanner(brandId));
  }

  // Brand Analytics

  // Get brand performance comparison
  async getBrandPerformanceComparison(params?: {
    brandIds?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    metrics?: string[];
  }): Promise<ApiResponse<Array<{
    brandId: string;
    brandName: string;
    metrics: Record<string, number>;
    ranking: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
  }>>> {
    const queryParams = {
      ...(params?.brandIds && { brandIds: params.brandIds.join(',') }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.metrics && { metrics: params.metrics.join(',') }),
    };
    
    return this.client.get<Array<{
      brandId: string;
      brandName: string;
      metrics: Record<string, number>;
      ranking: number;
      trend: 'up' | 'down' | 'stable';
      trendPercentage: number;
    }>>(endpoints.brands.performanceComparison, { params: queryParams });
  }

  // Get market share analysis
  async getMarketShareAnalysis(params?: {
    categoryId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<Array<{
    brandId: string;
    brandName: string;
    marketShare: number;
    totalSales: number;
    totalRevenue: number;
    growth: number;
    ranking: number;
  }>>> {
    const queryParams = {
      ...(params?.categoryId && { categoryId: params.categoryId }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<Array<{
      brandId: string;
      brandName: string;
      marketShare: number;
      totalSales: number;
      totalRevenue: number;
      growth: number;
      ranking: number;
    }>>(endpoints.brands.marketShare, { params: queryParams });
  }

  // Brand SEO

  // Update brand SEO
  async updateBrandSEO(brandId: string, seoData: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    structuredData?: Record<string, unknown>;
  }): Promise<ApiResponse<Brand>> {
    return this.client.put<Brand>(endpoints.brands.updateSEO(brandId), seoData);
  }

  // Generate brand sitemap
  async generateBrandSitemap(): Promise<ApiResponse<{
    sitemapUrl: string;
    brandCount: number;
    lastUpdated: string;
  }>> {
    return this.client.post<{
      sitemapUrl: string;
      brandCount: number;
      lastUpdated: string;
    }>(endpoints.brands.generateSitemap);
  }

  // Admin Operations

  // Get all brands statistics (Admin)
  async getAllBrandsStatistics(): Promise<ApiResponse<{
    totalBrands: number;
    activeBrands: number;
    featuredBrands: number;
    brandsWithProducts: number;
    brandsWithoutProducts: number;
    averageProductsPerBrand: number;
    topBrands: Array<{
      id: string;
      name: string;
      productCount: number;
      views: number;
      revenue: number;
    }>;
    brandsByCountry: Record<string, number>;
    establishmentYearDistribution: Record<string, number>;
  }>> {
    return this.client.get<{
      totalBrands: number;
      activeBrands: number;
      featuredBrands: number;
      brandsWithProducts: number;
      brandsWithoutProducts: number;
      averageProductsPerBrand: number;
      topBrands: Array<{
        id: string;
        name: string;
        productCount: number;
        views: number;
        revenue: number;
      }>;
      brandsByCountry: Record<string, number>;
      establishmentYearDistribution: Record<string, number>;
    }>(endpoints.brands.admin.statistics);
  }

  // Bulk update brands (Admin)
  async bulkUpdateBrands(updates: Array<{
    brandId: string;
    updates: Partial<Brand>;
  }>): Promise<ApiResponse<{
    message: string;
    updatedCount: number;
    errors: Array<{
      brandId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      message: string;
      updatedCount: number;
      errors: Array<{
        brandId: string;
        error: string;
      }>;
    }>(endpoints.brands.admin.bulkUpdate, { updates });
  }

  // Bulk delete brands (Admin)
  async bulkDeleteBrands(brandIds: string[], options?: {
    moveProductsTo?: string;
    deleteProducts?: boolean;
  }): Promise<ApiResponse<{
    message: string;
    deletedCount: number;
    errors: Array<{
      brandId: string;
      error: string;
    }>;
  }>> {
    return this.client.delete<{
      message: string;
      deletedCount: number;
      errors: Array<{
        brandId: string;
        error: string;
      }>;
    }>(endpoints.brands.admin.bulkDelete, {
      data: {
        brandIds,
        ...options,
      },
    });
  }

  // Export brands (Admin)
  async exportBrands(params?: {
    format?: 'csv' | 'xlsx' | 'json';
    includeProducts?: boolean;
    includeAnalytics?: boolean;
  }): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(endpoints.brands.admin.export, {
      params: params || {},
      responseType: 'blob',
    });
  }

  // Import brands (Admin)
  async importBrands(file: File, options?: {
    updateExisting?: boolean;
    skipErrors?: boolean;
    createMissing?: boolean;
  }): Promise<ApiResponse<{
    message: string;
    importedCount: number;
    updatedCount: number;
    skippedCount: number;
    errors: Array<{
      row: number;
      error: string;
    }>;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    
    return this.client.post<{
      message: string;
      importedCount: number;
      updatedCount: number;
      skippedCount: number;
      errors: Array<{
        row: number;
        error: string;
      }>;
    }>(endpoints.brands.admin.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Validate brand data (Admin)
  async validateBrandData(): Promise<ApiResponse<{
    isValid: boolean;
    issues: Array<{
      brandId: string;
      brandName: string;
      issue: string;
      severity: 'error' | 'warning';
    }>;
    suggestions: string[];
  }>> {
    return this.client.get<{
      isValid: boolean;
      issues: Array<{
        brandId: string;
        brandName: string;
        issue: string;
        severity: 'error' | 'warning';
      }>;
      suggestions: string[];
    }>(endpoints.brands.admin.validate);
  }

  // Brand Search & Discovery

  // Search brands
  async searchBrands(params: SearchParams & {
    category?: string;
    country?: string;
    establishedYearRange?: {
      start: number;
      end: number;
    };
    hasWebsite?: boolean;
    sortBy?: 'name' | 'productCount' | 'established' | 'popularity';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Brand[]>> {
    const queryParams = {
      ...buildSearchParams(params),
      ...(params.category && { category: params.category }),
      ...(params.country && { country: params.country }),
      ...(params.establishedYearRange && {
        establishedFrom: params.establishedYearRange.start,
        establishedTo: params.establishedYearRange.end,
      }),
      ...(params.hasWebsite !== undefined && { hasWebsite: params.hasWebsite }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<Brand[]>(endpoints.brands.search, { params: queryParams });
  }

  // Get brand suggestions
  async getBrandSuggestions(query: string, limit?: number): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    slug: string;
    logo?: string;
    productCount: number;
  }>>> {
    const params = {
      q: query,
      ...(limit && { limit }),
    };
    
    return this.client.get<Array<{
      id: string;
      name: string;
      slug: string;
      logo?: string;
      productCount: number;
    }>>(endpoints.brands.suggestions, { params });
  }

  // Get similar brands
  async getSimilarBrands(brandId: string, limit?: number): Promise<ApiResponse<Brand[]>> {
    const params = limit ? { limit } : {};
    return this.client.get<Brand[]>(endpoints.brands.similar(brandId), { params });
  }
}

// Create service instance
const brandApiService = new BrandApiService();

// React Query Hooks

// Brand Retrieval
export const useBrands = (params?: SearchParams & PaginationParams & {
  isActive?: boolean;
  isFeatured?: boolean;
  country?: string;
  hasProducts?: boolean;
}) => {
  return useQuery({
    queryKey: ['brands', 'list', params],
    queryFn: () => brandApiService.getBrands(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useBrand = (brandId: string) => {
  return useQuery({
    queryKey: ['brands', 'detail', brandId],
    queryFn: () => brandApiService.getBrandById(brandId),
    enabled: !!brandId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useBrandBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['brands', 'by-slug', slug],
    queryFn: () => brandApiService.getBrandBySlug(slug),
    enabled: !!slug,
    staleTime: 15 * 60 * 1000,
  });
};

export const useFeaturedBrands = (limit?: number) => {
  return useQuery({
    queryKey: ['brands', 'featured', limit],
    queryFn: () => brandApiService.getFeaturedBrands(limit),
    staleTime: 30 * 60 * 1000,
  });
};

export const useBrandProducts = (brandId: string, params?: SearchParams & PaginationParams & {
  categoryId?: string;
  sortBy?: 'name' | 'price' | 'created' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  priceRange?: {
    min: number;
    max: number;
  };
}) => {
  return useQuery({
    queryKey: ['brands', 'products', brandId, params],
    queryFn: () => brandApiService.getBrandProducts(brandId, params),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBrandCategories = (brandId: string) => {
  return useQuery({
    queryKey: ['brands', 'categories', brandId],
    queryFn: () => brandApiService.getBrandCategories(brandId),
    enabled: !!brandId,
    staleTime: 30 * 60 * 1000,
  });
};

export const useBrandStatistics = (brandId: string, params?: {
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['brands', 'statistics', brandId, params],
    queryFn: () => brandApiService.getBrandStatistics(brandId, params),
    enabled: !!brandId,
    staleTime: 15 * 60 * 1000,
  });
};

// Analytics
export const useBrandPerformanceComparison = (params?: {
  brandIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  metrics?: string[];
}) => {
  return useQuery({
    queryKey: ['brands', 'performance-comparison', params],
    queryFn: () => brandApiService.getBrandPerformanceComparison(params),
    staleTime: 15 * 60 * 1000,
  });
};

export const useMarketShareAnalysis = (params?: {
  categoryId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['brands', 'market-share', params],
    queryFn: () => brandApiService.getMarketShareAnalysis(params),
    staleTime: 30 * 60 * 1000,
  });
};

// Search & Discovery
export const useSearchBrands = (params: SearchParams & {
  category?: string;
  country?: string;
  establishedYearRange?: {
    start: number;
    end: number;
  };
  hasWebsite?: boolean;
  sortBy?: 'name' | 'productCount' | 'established' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['brands', 'search', params],
    queryFn: () => brandApiService.searchBrands(params),
    enabled: !!params.q,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBrandSuggestions = (query: string, limit?: number) => {
  return useQuery({
    queryKey: ['brands', 'suggestions', query, limit],
    queryFn: () => brandApiService.getBrandSuggestions(query, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSimilarBrands = (brandId: string, limit?: number) => {
  return useQuery({
    queryKey: ['brands', 'similar', brandId, limit],
    queryFn: () => brandApiService.getSimilarBrands(brandId, limit),
    enabled: !!brandId,
    staleTime: 30 * 60 * 1000,
  });
};

// Admin Hooks
export const useAllBrandsStatistics = () => {
  return useQuery({
    queryKey: ['brands', 'admin', 'statistics'],
    queryFn: () => brandApiService.getAllBrandsStatistics(),
    staleTime: 15 * 60 * 1000,
  });
};

// Mutation Hooks

// Brand Management
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (brandData: {
      name: string;
      slug?: string;
      description?: string;
      logo?: string;
      banner?: string;
      website?: string;
      establishedYear?: number;
      country?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      sortOrder?: number;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      socialLinks?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
      };
      metadata?: Record<string, unknown>;
    }) => brandApiService.createBrand(brandData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ brandId, updates }: {
      brandId: string;
      updates: Partial<Brand>;
    }) => brandApiService.updateBrand(brandId, updates),
    onSuccess: (_, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands', 'detail', brandId] });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ brandId, options }: {
      brandId: string;
      options?: {
        moveProductsTo?: string;
        deleteProducts?: boolean;
      };
    }) => brandApiService.deleteBrand(brandId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useUploadBrandLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ brandId, logoFile }: {
      brandId: string;
      logoFile: File;
    }) => brandApiService.uploadBrandLogo(brandId, logoFile),
    onSuccess: (_, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: ['brands', 'detail', brandId] });
      queryClient.invalidateQueries({ queryKey: ['brands', 'list'] });
    },
  });
};

export const useUploadBrandBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ brandId, bannerFile }: {
      brandId: string;
      bannerFile: File;
    }) => brandApiService.uploadBrandBanner(brandId, bannerFile),
    onSuccess: (_, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: ['brands', 'detail', brandId] });
      queryClient.invalidateQueries({ queryKey: ['brands', 'list'] });
    },
  });
};

export const useDeleteBrandLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (brandId: string) => brandApiService.deleteBrandLogo(brandId),
    onSuccess: (_, brandId) => {
      queryClient.invalidateQueries({ queryKey: ['brands', 'detail', brandId] });
      queryClient.invalidateQueries({ queryKey: ['brands', 'list'] });
    },
  });
};

export const useDeleteBrandBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (brandId: string) => brandApiService.deleteBrandBanner(brandId),
    onSuccess: (_, brandId) => {
      queryClient.invalidateQueries({ queryKey: ['brands', 'detail', brandId] });
      queryClient.invalidateQueries({ queryKey: ['brands', 'list'] });
    },
  });
};

// SEO
export const useUpdateBrandSEO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ brandId, seoData }: {
      brandId: string;
      seoData: {
        seoTitle?: string;
        seoDescription?: string;
        seoKeywords?: string;
        canonicalUrl?: string;
        ogImage?: string;
        structuredData?: Record<string, unknown>;
      };
    }) => brandApiService.updateBrandSEO(brandId, seoData),
    onSuccess: (_, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: ['brands', 'detail', brandId] });
    },
  });
};

export const useGenerateBrandSitemap = () => {
  return useMutation({
    mutationFn: () => brandApiService.generateBrandSitemap(),
  });
};

// Admin Operations
export const useBulkUpdateBrands = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{
      brandId: string;
      updates: Partial<Brand>;
    }>) => brandApiService.bulkUpdateBrands(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useBulkDeleteBrands = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ brandIds, options }: {
      brandIds: string[];
      options?: {
        moveProductsTo?: string;
        deleteProducts?: boolean;
      };
    }) => brandApiService.bulkDeleteBrands(brandIds, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useExportBrands = () => {
  return useMutation({
    mutationFn: (params?: {
      format?: 'csv' | 'xlsx' | 'json';
      includeProducts?: boolean;
      includeAnalytics?: boolean;
    }) => brandApiService.exportBrands(params),
  });
};

export const useImportBrands = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: {
      file: File;
      options?: {
        updateExisting?: boolean;
        skipErrors?: boolean;
        createMissing?: boolean;
      };
    }) => brandApiService.importBrands(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useValidateBrandData = () => {
  return useMutation({
    mutationFn: () => brandApiService.validateBrandData(),
  });
};

export default brandApiService;

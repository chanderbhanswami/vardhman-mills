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
 * Category API Service
 * Handles product category management, hierarchy, and navigation
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  level: number;
  path: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata: Record<string, unknown>;
  productCount: number;
  children?: Category[];
  parent?: Category;
  createdAt: string;
  updatedAt: string;
}

interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  level: number;
  productCount: number;
  children: CategoryTree[];
}

interface CategoryFilter {
  id: string;
  name: string;
  type: 'select' | 'multiselect' | 'range' | 'boolean' | 'color' | 'size';
  values: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
  isRequired: boolean;
  sortOrder: number;
}

class CategoryApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Category Retrieval

  // Get all categories
  async getCategories(params?: SearchParams & PaginationParams & {
    parentId?: string;
    level?: number;
    isActive?: boolean;
    isFeatured?: boolean;
  }): Promise<ApiResponse<Category[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.parentId && { parentId: params.parentId }),
      ...(params?.level !== undefined && { level: params.level }),
      ...(params?.isActive !== undefined && { isActive: params.isActive }),
      ...(params?.isFeatured !== undefined && { isFeatured: params.isFeatured }),
    };
    
    return this.client.get<Category[]>(endpoints.categories.list, { params: queryParams });
  }

  // Get category tree (hierarchical structure)
  async getCategoryTree(params?: {
    maxDepth?: number;
    includeInactive?: boolean;
    includeProductCount?: boolean;
  }): Promise<ApiResponse<CategoryTree[]>> {
    const queryParams = {
      ...(params?.maxDepth && { maxDepth: params.maxDepth }),
      ...(params?.includeInactive !== undefined && { includeInactive: params.includeInactive }),
      ...(params?.includeProductCount !== undefined && { includeProductCount: params.includeProductCount }),
    };
    
    return this.client.get<CategoryTree[]>(endpoints.categories.tree, { params: queryParams });
  }

  // Get category by ID
  async getCategoryById(categoryId: string): Promise<ApiResponse<Category>> {
    return this.client.get<Category>(endpoints.categories.byId(categoryId));
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    return this.client.get<Category>(endpoints.categories.bySlug(slug));
  }

  // Get featured categories
  async getFeaturedCategories(limit?: number): Promise<ApiResponse<Category[]>> {
    const params = limit ? { limit } : {};
    return this.client.get<Category[]>(endpoints.categories.featured, { params });
  }

  // Get category products
  async getCategoryProducts(categoryId: string, params?: SearchParams & PaginationParams & {
    sortBy?: 'name' | 'price' | 'created' | 'popularity' | 'rating';
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
    includeSubcategories?: boolean;
  }): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    isInStock: boolean;
    brand?: string;
    categories: string[];
  }>>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      ...(params?.filters && { filters: JSON.stringify(params.filters) }),
      ...(params?.includeSubcategories !== undefined && { includeSubcategories: params.includeSubcategories }),
    };
    
    return this.client.get<Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      salePrice?: number;
      image: string;
      rating: number;
      reviewCount: number;
      isInStock: boolean;
      brand?: string;
      categories: string[];
    }>>(endpoints.categories.products(categoryId), { params: queryParams });
  }

  // Get category filters
  async getCategoryFilters(categoryId: string): Promise<ApiResponse<CategoryFilter[]>> {
    return this.client.get<CategoryFilter[]>(endpoints.categories.filters(categoryId));
  }

  // Category Management (Admin)

  // Create category
  async createCategory(categoryData: {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    icon?: string;
    parentId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<Category>> {
    return this.client.post<Category>(endpoints.categories.create, categoryData);
  }

  // Update category
  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<ApiResponse<Category>> {
    return this.client.put<Category>(endpoints.categories.update(categoryId), updates);
  }

  // Delete category
  async deleteCategory(categoryId: string, options?: {
    moveProductsTo?: string; // Move products to another category
    deleteProducts?: boolean; // Delete products in this category
  }): Promise<ApiResponse<{ message: string }>> {
    const params = options ? {
      ...(options.moveProductsTo && { moveProductsTo: options.moveProductsTo }),
      ...(options.deleteProducts !== undefined && { deleteProducts: options.deleteProducts }),
    } : {};
    
    return this.client.delete<{ message: string }>(endpoints.categories.delete(categoryId), { params });
  }

  // Reorder categories
  async reorderCategories(reorderData: Array<{
    categoryId: string;
    sortOrder: number;
    parentId?: string;
  }>): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.categories.reorder, { categories: reorderData });
  }

  // Upload category image
  async uploadCategoryImage(categoryId: string, imageFile: File): Promise<ApiResponse<{
    imageUrl: string;
    thumbnailUrl: string;
  }>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return this.client.post<{
      imageUrl: string;
      thumbnailUrl: string;
    }>(endpoints.categories.uploadImage(categoryId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete category image
  async deleteCategoryImage(categoryId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.categories.deleteImage(categoryId));
  }

  // Category Analytics

  // Get category analytics
  async getCategoryAnalytics(categoryId: string, params?: {
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<{
    views: number;
    uniqueViews: number;
    productsViewed: number;
    addToCartCount: number;
    purchaseCount: number;
    revenue: number;
    conversionRate: number;
    bounceRate: number;
    averageTimeOnCategory: number;
    topProducts: Array<{
      productId: string;
      name: string;
      views: number;
      purchases: number;
      revenue: number;
    }>;
    searchTerms: Array<{
      term: string;
      count: number;
    }>;
    trends: Array<{
      date: string;
      views: number;
      purchases: number;
      revenue: number;
    }>;
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<{
      views: number;
      uniqueViews: number;
      productsViewed: number;
      addToCartCount: number;
      purchaseCount: number;
      revenue: number;
      conversionRate: number;
      bounceRate: number;
      averageTimeOnCategory: number;
      topProducts: Array<{
        productId: string;
        name: string;
        views: number;
        purchases: number;
        revenue: number;
      }>;
      searchTerms: Array<{
        term: string;
        count: number;
      }>;
      trends: Array<{
        date: string;
        views: number;
        purchases: number;
        revenue: number;
      }>;
    }>(endpoints.categories.analytics(categoryId), { params: queryParams });
  }

  // Get category performance comparison
  async getCategoryPerformanceComparison(params?: {
    categoryIds?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    metrics?: string[];
  }): Promise<ApiResponse<Array<{
    categoryId: string;
    categoryName: string;
    metrics: Record<string, number>;
    ranking: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
  }>>> {
    const queryParams = {
      ...(params?.categoryIds && { categoryIds: params.categoryIds.join(',') }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.metrics && { metrics: params.metrics.join(',') }),
    };
    
    return this.client.get<Array<{
      categoryId: string;
      categoryName: string;
      metrics: Record<string, number>;
      ranking: number;
      trend: 'up' | 'down' | 'stable';
      trendPercentage: number;
    }>>(endpoints.categories.performanceComparison, { params: queryParams });
  }

  // Category SEO

  // Generate category sitemap
  async generateSitemap(): Promise<ApiResponse<{
    sitemapUrl: string;
    categoryCount: number;
    lastUpdated: string;
  }>> {
    return this.client.post<{
      sitemapUrl: string;
      categoryCount: number;
      lastUpdated: string;
    }>(endpoints.categories.generateSitemap);
  }

  // Get category breadcrumbs
  async getCategoryBreadcrumbs(categoryId: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    slug: string;
    url: string;
  }>>> {
    return this.client.get<Array<{
      id: string;
      name: string;
      slug: string;
      url: string;
    }>>(endpoints.categories.breadcrumbs(categoryId));
  }

  // Update category SEO
  async updateCategorySEO(categoryId: string, seoData: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    structuredData?: Record<string, unknown>;
  }): Promise<ApiResponse<Category>> {
    return this.client.put<Category>(endpoints.categories.updateSEO(categoryId), seoData);
  }

  // Admin Operations

  // Get category statistics (Admin)
  async getCategoryStatistics(): Promise<ApiResponse<{
    totalCategories: number;
    activeCategories: number;
    featuredCategories: number;
    categoriesWithProducts: number;
    categoriesWithoutProducts: number;
    averageProductsPerCategory: number;
    maxCategoryDepth: number;
    topCategories: Array<{
      id: string;
      name: string;
      productCount: number;
      views: number;
      revenue: number;
    }>;
    categoryDistribution: Record<string, number>;
  }>> {
    return this.client.get<{
      totalCategories: number;
      activeCategories: number;
      featuredCategories: number;
      categoriesWithProducts: number;
      categoriesWithoutProducts: number;
      averageProductsPerCategory: number;
      maxCategoryDepth: number;
      topCategories: Array<{
        id: string;
        name: string;
        productCount: number;
        views: number;
        revenue: number;
      }>;
      categoryDistribution: Record<string, number>;
    }>(endpoints.categories.admin.statistics);
  }

  // Bulk update categories (Admin)
  async bulkUpdateCategories(updates: Array<{
    categoryId: string;
    updates: Partial<Category>;
  }>): Promise<ApiResponse<{
    message: string;
    updatedCount: number;
    errors: Array<{
      categoryId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      message: string;
      updatedCount: number;
      errors: Array<{
        categoryId: string;
        error: string;
      }>;
    }>(endpoints.categories.admin.bulkUpdate, { updates });
  }

  // Bulk delete categories (Admin)
  async bulkDeleteCategories(categoryIds: string[], options?: {
    moveProductsTo?: string;
    deleteProducts?: boolean;
  }): Promise<ApiResponse<{
    message: string;
    deletedCount: number;
    errors: Array<{
      categoryId: string;
      error: string;
    }>;
  }>> {
    return this.client.delete<{
      message: string;
      deletedCount: number;
      errors: Array<{
        categoryId: string;
        error: string;
      }>;
    }>(endpoints.categories.admin.bulkDelete, {
      data: {
        categoryIds,
        ...options,
      },
    });
  }

  // Export categories (Admin)
  async exportCategories(params?: {
    format?: 'csv' | 'xlsx' | 'json';
    includeProducts?: boolean;
    includeAnalytics?: boolean;
  }): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(endpoints.categories.admin.export, {
      params: params || {},
      responseType: 'blob',
    });
  }

  // Import categories (Admin)
  async importCategories(file: File, options?: {
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
    }>(endpoints.categories.admin.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Rebuild category tree (Admin)
  async rebuildCategoryTree(): Promise<ApiResponse<{
    message: string;
    processedCount: number;
    maxDepth: number;
  }>> {
    return this.client.post<{
      message: string;
      processedCount: number;
      maxDepth: number;
    }>(endpoints.categories.admin.rebuildTree);
  }

  // Validate category structure (Admin)
  async validateCategoryStructure(): Promise<ApiResponse<{
    isValid: boolean;
    issues: Array<{
      categoryId: string;
      categoryName: string;
      issue: string;
      severity: 'error' | 'warning';
    }>;
    suggestions: string[];
  }>> {
    return this.client.get<{
      isValid: boolean;
      issues: Array<{
        categoryId: string;
        categoryName: string;
        issue: string;
        severity: 'error' | 'warning';
      }>;
      suggestions: string[];
    }>(endpoints.categories.admin.validate);
  }
}

// Create service instance
const categoryApiService = new CategoryApiService();

// React Query Hooks

// Category Retrieval
export const useCategories = (params?: SearchParams & PaginationParams & {
  parentId?: string;
  level?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}) => {
  return useQuery({
    queryKey: ['categories', 'list', params],
    queryFn: () => categoryApiService.getCategories(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCategoryTree = (params?: {
  maxDepth?: number;
  includeInactive?: boolean;
  includeProductCount?: boolean;
}) => {
  return useQuery({
    queryKey: ['categories', 'tree', params],
    queryFn: () => categoryApiService.getCategoryTree(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['categories', 'detail', categoryId],
    queryFn: () => categoryApiService.getCategoryById(categoryId),
    enabled: !!categoryId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['categories', 'by-slug', slug],
    queryFn: () => categoryApiService.getCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 15 * 60 * 1000,
  });
};

export const useFeaturedCategories = (limit?: number) => {
  return useQuery({
    queryKey: ['categories', 'featured', limit],
    queryFn: () => categoryApiService.getFeaturedCategories(limit),
    staleTime: 30 * 60 * 1000,
  });
};

export const useCategoryProducts = (categoryId: string, params?: SearchParams & PaginationParams & {
  sortBy?: 'name' | 'price' | 'created' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  includeSubcategories?: boolean;
}) => {
  return useQuery({
    queryKey: ['categories', 'products', categoryId, params],
    queryFn: () => categoryApiService.getCategoryProducts(categoryId, params),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategoryFilters = (categoryId: string) => {
  return useQuery({
    queryKey: ['categories', 'filters', categoryId],
    queryFn: () => categoryApiService.getCategoryFilters(categoryId),
    enabled: !!categoryId,
    staleTime: 30 * 60 * 1000,
  });
};

export const useCategoryBreadcrumbs = (categoryId: string) => {
  return useQuery({
    queryKey: ['categories', 'breadcrumbs', categoryId],
    queryFn: () => categoryApiService.getCategoryBreadcrumbs(categoryId),
    enabled: !!categoryId,
    staleTime: 30 * 60 * 1000,
  });
};

// Analytics
export const useCategoryAnalytics = (categoryId: string, params?: {
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['categories', 'analytics', categoryId, params],
    queryFn: () => categoryApiService.getCategoryAnalytics(categoryId, params),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategoryPerformanceComparison = (params?: {
  categoryIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  metrics?: string[];
}) => {
  return useQuery({
    queryKey: ['categories', 'performance-comparison', params],
    queryFn: () => categoryApiService.getCategoryPerformanceComparison(params),
    staleTime: 15 * 60 * 1000,
  });
};

// Admin Hooks
export const useCategoryStatistics = () => {
  return useQuery({
    queryKey: ['categories', 'admin', 'statistics'],
    queryFn: () => categoryApiService.getCategoryStatistics(),
    staleTime: 15 * 60 * 1000,
  });
};

// Mutation Hooks

// Category Management
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryData: {
      name: string;
      slug?: string;
      description?: string;
      image?: string;
      icon?: string;
      parentId?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      sortOrder?: number;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      metadata?: Record<string, unknown>;
    }) => categoryApiService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ categoryId, updates }: {
      categoryId: string;
      updates: Partial<Category>;
    }) => categoryApiService.updateCategory(categoryId, updates),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'detail', categoryId] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ categoryId, options }: {
      categoryId: string;
      options?: {
        moveProductsTo?: string;
        deleteProducts?: boolean;
      };
    }) => categoryApiService.deleteCategory(categoryId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reorderData: Array<{
      categoryId: string;
      sortOrder: number;
      parentId?: string;
    }>) => categoryApiService.reorderCategories(reorderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUploadCategoryImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ categoryId, imageFile }: {
      categoryId: string;
      imageFile: File;
    }) => categoryApiService.uploadCategoryImage(categoryId, imageFile),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'detail', categoryId] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'list'] });
    },
  });
};

export const useDeleteCategoryImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryId: string) => categoryApiService.deleteCategoryImage(categoryId),
    onSuccess: (_, categoryId) => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'detail', categoryId] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'list'] });
    },
  });
};

// SEO
export const useUpdateCategorySEO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ categoryId, seoData }: {
      categoryId: string;
      seoData: {
        seoTitle?: string;
        seoDescription?: string;
        seoKeywords?: string;
        canonicalUrl?: string;
        ogImage?: string;
        structuredData?: Record<string, unknown>;
      };
    }) => categoryApiService.updateCategorySEO(categoryId, seoData),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'detail', categoryId] });
    },
  });
};

export const useGenerateSitemap = () => {
  return useMutation({
    mutationFn: () => categoryApiService.generateSitemap(),
  });
};

// Admin Operations
export const useBulkUpdateCategories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{
      categoryId: string;
      updates: Partial<Category>;
    }>) => categoryApiService.bulkUpdateCategories(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ categoryIds, options }: {
      categoryIds: string[];
      options?: {
        moveProductsTo?: string;
        deleteProducts?: boolean;
      };
    }) => categoryApiService.bulkDeleteCategories(categoryIds, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useExportCategories = () => {
  return useMutation({
    mutationFn: (params?: {
      format?: 'csv' | 'xlsx' | 'json';
      includeProducts?: boolean;
      includeAnalytics?: boolean;
    }) => categoryApiService.exportCategories(params),
  });
};

export const useImportCategories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: {
      file: File;
      options?: {
        updateExisting?: boolean;
        skipErrors?: boolean;
        createMissing?: boolean;
      };
    }) => categoryApiService.importCategories(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useRebuildCategoryTree = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => categoryApiService.rebuildCategoryTree(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useValidateCategoryStructure = () => {
  return useMutation({
    mutationFn: () => categoryApiService.validateCategoryStructure(),
  });
};

export default categoryApiService;

import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse, PaginationParams, Bestseller, Product } from './types';

// Paginated Response Type
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateBestsellerRequest {
  productId: string;
  order?: number;
  isActive?: boolean;
  salesCount?: number;
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export type UpdateBestsellerRequest = Partial<CreateBestsellerRequest>;

export interface BestsellerFilters {
  period?: 'week' | 'month' | 'quarter' | 'year';
  isActive?: boolean;
  categoryId?: string;
  brandId?: string;
  minSalesCount?: number;
  maxSalesCount?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface BestsellerAnalytics {
  totalBestsellers: number;
  activeBestsellers: number;
  totalSales: number;
  averageSalesCount: number;
  periodDistribution: {
    period: 'week' | 'month' | 'quarter' | 'year';
    count: number;
    totalSales: number;
    percentage: number;
  }[];
  categoryDistribution: {
    categoryId: string;
    categoryName: string;
    count: number;
    totalSales: number;
    percentage: number;
  }[];
  brandDistribution: {
    brandId: string;
    brandName: string;
    count: number;
    totalSales: number;
    percentage: number;
  }[];
  salesTrends: {
    date: string;
    totalSales: number;
    uniqueProducts: number;
    averageOrder: number;
  }[];
  topPerformers: {
    id: string;
    productId: string;
    productName: string;
    salesCount: number;
    revenue: number;
    period: string;
  }[];
}

export interface BestsellerReport {
  period: 'week' | 'month' | 'quarter' | 'year';
  dateRange: {
    from: string;
    to: string;
  };
  summary: {
    totalProducts: number;
    totalSales: number;
    totalRevenue: number;
    averageSalesPerProduct: number;
    growthRate: number;
  };
  products: Array<{
    id: string;
    product: Product;
    salesCount: number;
    revenue: number;
    rank: number;
    previousRank?: number;
    rankChange: number;
    growth: number;
  }>;
  insights: {
    topCategories: string[];
    topBrands: string[];
    seasonalTrends: string[];
    recommendations: string[];
  };
}

class BestsellerApiClient {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // CRUD Operations
  async getBestsellers(params?: PaginationParams & BestsellerFilters): Promise<ApiResponse<PaginatedResponse<Bestseller>>> {
    return this.client.get(endpoints.bestsellers.list, { params });
  }

  async getBestseller(id: string): Promise<ApiResponse<Bestseller>> {
    return this.client.get(endpoints.bestsellers.byId(id));
  }

  async getBestsellersByPeriod(period: 'week' | 'month' | 'quarter' | 'year', params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Bestseller>>> {
    return this.client.get(endpoints.bestsellers.byPeriod(period), { params });
  }

  async getActiveBestsellers(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Bestseller>>> {
    return this.client.get(endpoints.bestsellers.active, { params });
  }

  async createBestseller(data: CreateBestsellerRequest): Promise<ApiResponse<Bestseller>> {
    return this.client.post(endpoints.bestsellers.create, data);
  }

  async updateBestseller(id: string, data: UpdateBestsellerRequest): Promise<ApiResponse<Bestseller>> {
    return this.client.put(endpoints.bestsellers.update(id), data);
  }

  async deleteBestseller(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.bestsellers.delete(id));
  }

  // Bulk Operations
  async bulkCreateBestsellers(data: CreateBestsellerRequest[]): Promise<ApiResponse<Bestseller[]>> {
    return this.client.post(endpoints.bestsellers.bulkCreate, { items: data });
  }

  async bulkUpdateBestsellers(data: {
    ids: string[];
    updates: UpdateBestsellerRequest;
  }): Promise<ApiResponse<Bestseller[]>> {
    return this.client.put(endpoints.bestsellers.bulkUpdate, data);
  }

  async bulkDeleteBestsellers(ids: string[]): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.bestsellers.bulkDelete, { data: { ids } });
  }

  async reorderBestsellers(data: {
    id: string;
    order: number;
  }[]): Promise<ApiResponse<Bestseller[]>> {
    return this.client.put(endpoints.bestsellers.reorder, { items: data });
  }

  // Status Management
  async toggleBestsellerStatus(id: string): Promise<ApiResponse<Bestseller>> {
    return this.client.patch(endpoints.bestsellers.toggleStatus(id));
  }

  async activateBestseller(id: string): Promise<ApiResponse<Bestseller>> {
    return this.client.patch(endpoints.bestsellers.activate(id));
  }

  async deactivateBestseller(id: string): Promise<ApiResponse<Bestseller>> {
    return this.client.patch(endpoints.bestsellers.deactivate(id));
  }

  // Analytics and Reports
  async getBestsellerAnalytics(params?: {
    dateFrom?: string;
    dateTo?: string;
    period?: 'week' | 'month' | 'quarter' | 'year';
    categoryId?: string;
    brandId?: string;
  }): Promise<ApiResponse<BestsellerAnalytics>> {
    return this.client.get(endpoints.bestsellers.analytics, { params });
  }

  async getBestsellerReport(params: {
    period: 'week' | 'month' | 'quarter' | 'year';
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    brandId?: string;
    limit?: number;
  }): Promise<ApiResponse<BestsellerReport>> {
    return this.client.get(endpoints.bestsellers.report, { params });
  }

  async getBestsellerTrends(params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    dateFrom?: string;
    dateTo?: string;
    productId?: string;
  }): Promise<ApiResponse<Array<{
    date: string;
    period: string;
    salesCount: number;
    revenue: number;
    rank: number;
    products: number;
  }>>> {
    return this.client.get(endpoints.bestsellers.trends, { params });
  }

  // Automatic Management
  async generateBestsellers(params: {
    period: 'week' | 'month' | 'quarter' | 'year';
    limit?: number;
    minSalesCount?: number;
    categoryId?: string;
    brandId?: string;
    replaceExisting?: boolean;
  }): Promise<ApiResponse<{
    generated: number;
    updated: number;
    removed: number;
    bestsellers: Bestseller[];
  }>> {
    return this.client.post(endpoints.bestsellers.generate, params);
  }

  async refreshBestsellers(period?: 'week' | 'month' | 'quarter' | 'year'): Promise<ApiResponse<{
    refreshed: number;
    added: number;
    removed: number;
    updated: number;
  }>> {
    return this.client.post(endpoints.bestsellers.refresh, { period });
  }

  async syncSalesData(params?: {
    dateFrom?: string;
    dateTo?: string;
    productIds?: string[];
  }): Promise<ApiResponse<{
    synced: number;
    updated: number;
    errors: string[];
  }>> {
    return this.client.post(endpoints.bestsellers.syncSales, params);
  }

  // Product Operations
  async addProductToBestsellers(productId: string, data: {
    order?: number;
    period?: 'week' | 'month' | 'quarter' | 'year';
    salesCount?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<Bestseller>> {
    return this.client.post(endpoints.bestsellers.addProduct(productId), data);
  }

  async removeProductFromBestsellers(productId: string, period?: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.bestsellers.removeProduct(productId), {
      params: period ? { period } : undefined
    });
  }

  async getProductBestsellerStatus(productId: string): Promise<ApiResponse<{
    isBestseller: boolean;
    periods: Array<{
      period: 'week' | 'month' | 'quarter' | 'year';
      rank: number;
      salesCount: number;
      isActive: boolean;
    }>;
  }>> {
    return this.client.get(endpoints.bestsellers.productStatus(productId));
  }

  // Category and Brand Operations
  async getBestsellersByCategory(categoryId: string, params?: PaginationParams & {
    period?: 'week' | 'month' | 'quarter' | 'year';
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Bestseller>>> {
    return this.client.get(endpoints.bestsellers.byCategory(categoryId), { params });
  }

  async getBestsellersByBrand(brandId: string, params?: PaginationParams & {
    period?: 'week' | 'month' | 'quarter' | 'year';
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Bestseller>>> {
    return this.client.get(endpoints.bestsellers.byBrand(brandId), { params });
  }

  // Export/Import
  async exportBestsellers(format: 'csv' | 'xlsx' | 'json', filters?: BestsellerFilters): Promise<ApiResponse<Blob>> {
    return this.client.get(endpoints.bestsellers.export, {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }

  async importBestsellers(file: File): Promise<ApiResponse<{
    imported: number;
    updated: number;
    errors: string[];
    duplicates: number;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post(endpoints.bestsellers.import, formData);
  }

  // Settings
  async getBestsellerSettings(): Promise<ApiResponse<{
    autoGeneration: {
      enabled: boolean;
      schedule: string;
      periods: string[];
      minSalesCount: number;
      maxItems: number;
    };
    display: {
      showRank: boolean;
      showSalesCount: boolean;
      showBadge: boolean;
      badgeText: string;
    };
    criteria: {
      salesWeight: number;
      revenueWeight: number;
      ratingWeight: number;
      reviewWeight: number;
    };
  }>> {
    return this.client.get(endpoints.bestsellers.settings);
  }

  async updateBestsellerSettings(data: {
    autoGeneration?: {
      enabled?: boolean;
      schedule?: string;
      periods?: string[];
      minSalesCount?: number;
      maxItems?: number;
    };
    display?: {
      showRank?: boolean;
      showSalesCount?: boolean;
      showBadge?: boolean;
      badgeText?: string;
    };
    criteria?: {
      salesWeight?: number;
      revenueWeight?: number;
      ratingWeight?: number;
      reviewWeight?: number;
    };
  }): Promise<ApiResponse<{
    autoGeneration: {
      enabled: boolean;
      schedule: string;
      periods: string[];
      minSalesCount: number;
      maxItems: number;
    };
    display: {
      showRank: boolean;
      showSalesCount: boolean;
      showBadge: boolean;
      badgeText: string;
    };
    criteria: {
      salesWeight: number;
      revenueWeight: number;
      ratingWeight: number;
      reviewWeight: number;
    };
  }>> {
    return this.client.put(endpoints.bestsellers.settings, data);
  }
}

export const bestsellerApi = new BestsellerApiClient();

// React Query Hooks

// Basic CRUD Hooks
export const useBestsellers = (
  params?: PaginationParams & BestsellerFilters,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Bestseller>>>
) => {
  return useQuery({
    queryKey: ['bestsellers', params],
    queryFn: () => bestsellerApi.getBestsellers(params),
    ...options,
  });
};

export const useBestseller = (id: string, options?: UseQueryOptions<ApiResponse<Bestseller>>) => {
  return useQuery({
    queryKey: ['bestsellers', id],
    queryFn: () => bestsellerApi.getBestseller(id),
    enabled: !!id,
    ...options,
  });
};

export const useBestsellersByPeriod = (
  period: 'week' | 'month' | 'quarter' | 'year',
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Bestseller>>>
) => {
  return useQuery({
    queryKey: ['bestsellers', 'by-period', period, params],
    queryFn: () => bestsellerApi.getBestsellersByPeriod(period, params),
    ...options,
  });
};

export const useActiveBestsellers = (
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Bestseller>>>
) => {
  return useQuery({
    queryKey: ['bestsellers', 'active', params],
    queryFn: () => bestsellerApi.getActiveBestsellers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useCreateBestseller = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBestsellerRequest) => bestsellerApi.createBestseller(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
      if (response.data) {
        queryClient.setQueryData(['bestsellers', response.data.id], response);
      }
    },
  });
};

export const useUpdateBestseller = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBestsellerRequest }) => 
      bestsellerApi.updateBestseller(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
      queryClient.setQueryData(['bestsellers', id], response);
    },
  });
};

export const useDeleteBestseller = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bestsellerApi.deleteBestseller(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
      queryClient.removeQueries({ queryKey: ['bestsellers', id] });
    },
  });
};

// Bulk Operations Hooks
export const useBulkCreateBestsellers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBestsellerRequest[]) => bestsellerApi.bulkCreateBestsellers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

export const useBulkUpdateBestsellers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { ids: string[]; updates: UpdateBestsellerRequest }) => 
      bestsellerApi.bulkUpdateBestsellers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

export const useBulkDeleteBestsellers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => bestsellerApi.bulkDeleteBestsellers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

export const useReorderBestsellers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: string; order: number }[]) => bestsellerApi.reorderBestsellers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

// Status Management Hooks
export const useToggleBestsellerStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bestsellerApi.toggleBestsellerStatus(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
      queryClient.setQueryData(['bestsellers', id], response);
    },
  });
};

export const useActivateBestseller = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bestsellerApi.activateBestseller(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
      queryClient.setQueryData(['bestsellers', id], response);
    },
  });
};

export const useDeactivateBestseller = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bestsellerApi.deactivateBestseller(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
      queryClient.setQueryData(['bestsellers', id], response);
    },
  });
};

// Analytics Hooks
export const useBestsellerAnalytics = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
    period?: 'week' | 'month' | 'quarter' | 'year';
    categoryId?: string;
    brandId?: string;
  },
  options?: UseQueryOptions<ApiResponse<BestsellerAnalytics>>
) => {
  return useQuery({
    queryKey: ['bestsellers', 'analytics', params],
    queryFn: () => bestsellerApi.getBestsellerAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useBestsellerReport = (
  params: {
    period: 'week' | 'month' | 'quarter' | 'year';
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    brandId?: string;
    limit?: number;
  },
  options?: UseQueryOptions<ApiResponse<BestsellerReport>>
) => {
  return useQuery({
    queryKey: ['bestsellers', 'report', params],
    queryFn: () => bestsellerApi.getBestsellerReport(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useBestsellerTrends = (
  params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    dateFrom?: string;
    dateTo?: string;
    productId?: string;
  },
  options?: UseQueryOptions<ApiResponse<Array<{
    date: string;
    period: string;
    salesCount: number;
    revenue: number;
    rank: number;
    products: number;
  }>>>
) => {
  return useQuery({
    queryKey: ['bestsellers', 'trends', params],
    queryFn: () => bestsellerApi.getBestsellerTrends(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

// Automatic Management Hooks
export const useGenerateBestsellers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      period: 'week' | 'month' | 'quarter' | 'year';
      limit?: number;
      minSalesCount?: number;
      categoryId?: string;
      brandId?: string;
      replaceExisting?: boolean;
    }) => bestsellerApi.generateBestsellers(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

export const useRefreshBestsellers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (period?: 'week' | 'month' | 'quarter' | 'year') => 
      bestsellerApi.refreshBestsellers(period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

export const useSyncSalesData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params?: {
      dateFrom?: string;
      dateTo?: string;
      productIds?: string[];
    }) => bestsellerApi.syncSalesData(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

// Product Operations Hooks
export const useAddProductToBestsellers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, data }: { 
      productId: string; 
      data: {
        order?: number;
        period?: 'week' | 'month' | 'quarter' | 'year';
        salesCount?: number;
        isActive?: boolean;
      } 
    }) => bestsellerApi.addProductToBestsellers(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

export const useRemoveProductFromBestsellers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, period }: { productId: string; period?: string }) => 
      bestsellerApi.removeProductFromBestsellers(productId, period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

export const useProductBestsellerStatus = (
  productId: string, 
  options?: UseQueryOptions<ApiResponse<{
    isBestseller: boolean;
    periods: Array<{
      period: 'week' | 'month' | 'quarter' | 'year';
      rank: number;
      salesCount: number;
      isActive: boolean;
    }>;
  }>>
) => {
  return useQuery({
    queryKey: ['bestsellers', 'product-status', productId],
    queryFn: () => bestsellerApi.getProductBestsellerStatus(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Category and Brand Hooks
export const useBestsellersByCategory = (
  categoryId: string,
  params?: PaginationParams & {
    period?: 'week' | 'month' | 'quarter' | 'year';
    isActive?: boolean;
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Bestseller>>>
) => {
  return useQuery({
    queryKey: ['bestsellers', 'by-category', categoryId, params],
    queryFn: () => bestsellerApi.getBestsellersByCategory(categoryId, params),
    enabled: !!categoryId,
    ...options,
  });
};

export const useBestsellersByBrand = (
  brandId: string,
  params?: PaginationParams & {
    period?: 'week' | 'month' | 'quarter' | 'year';
    isActive?: boolean;
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Bestseller>>>
) => {
  return useQuery({
    queryKey: ['bestsellers', 'by-brand', brandId, params],
    queryFn: () => bestsellerApi.getBestsellersByBrand(brandId, params),
    enabled: !!brandId,
    ...options,
  });
};

// Export/Import Hooks
export const useExportBestsellers = () => {
  return useMutation({
    mutationFn: ({ format, filters }: { 
      format: 'csv' | 'xlsx' | 'json'; 
      filters?: BestsellerFilters 
    }) => bestsellerApi.exportBestsellers(format, filters),
  });
};

export const useImportBestsellers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => bestsellerApi.importBestsellers(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    },
  });
};

// Settings Hooks
export const useBestsellerSettings = (options?: UseQueryOptions<ApiResponse<{
  autoGeneration: {
    enabled: boolean;
    schedule: string;
    periods: string[];
    minSalesCount: number;
    maxItems: number;
  };
  display: {
    showRank: boolean;
    showSalesCount: boolean;
    showBadge: boolean;
    badgeText: string;
  };
  criteria: {
    salesWeight: number;
    revenueWeight: number;
    ratingWeight: number;
    reviewWeight: number;
  };
}>>) => {
  return useQuery({
    queryKey: ['bestsellers', 'settings'],
    queryFn: () => bestsellerApi.getBestsellerSettings(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useUpdateBestsellerSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      autoGeneration?: {
        enabled?: boolean;
        schedule?: string;
        periods?: string[];
        minSalesCount?: number;
        maxItems?: number;
      };
      display?: {
        showRank?: boolean;
        showSalesCount?: boolean;
        showBadge?: boolean;
        badgeText?: string;
      };
      criteria?: {
        salesWeight?: number;
        revenueWeight?: number;
        ratingWeight?: number;
        reviewWeight?: number;
      };
    }) => bestsellerApi.updateBestsellerSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestsellers', 'settings'] });
    },
  });
};

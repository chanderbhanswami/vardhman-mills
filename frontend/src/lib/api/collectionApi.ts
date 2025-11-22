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
 * Collection API Service
 * Handles product collections, curated lists, and featured product sets
 */

interface ProductCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'featured' | 'curated' | 'automated' | 'seasonal' | 'category' | 'brand';
  status: 'active' | 'inactive' | 'scheduled' | 'draft';
  visibility: 'public' | 'private' | 'members_only';
  sortOrder: number;
  
  // Display settings
  displaySettings: {
    layout: 'grid' | 'list' | 'carousel' | 'masonry';
    itemsPerPage: number;
    showPrices: boolean;
    showRatings: boolean;
    showQuickAdd: boolean;
    showFilters: boolean;
    allowSorting: boolean;
  };
  
  // SEO & metadata
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  
  // Media
  featuredImage?: string;
  bannerImage?: string;
  thumbnailImage?: string;
  gallery: string[];
  
  // Rules for automated collections
  rules?: {
    conditions: Array<{
      field: 'category' | 'brand' | 'price' | 'rating' | 'tags' | 'availability' | 'creation_date';
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
      value: string | number | string[];
    }>;
    operator: 'AND' | 'OR';
    maxProducts?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  
  // Manual product assignments
  products?: Array<{
    productId: string;
    position: number;
    addedAt: string;
  }>;
  
  // Analytics
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    topProducts: Array<{
      productId: string;
      views: number;
      clicks: number;
      conversions: number;
    }>;
  };
  
  // Scheduling
  schedule?: {
    startDate: string;
    endDate?: string;
    timezone: string;
    publishAt?: string;
    expireAt?: string;
  };
  
  // Personalization
  personalization?: {
    enabled: boolean;
    targetAudience: Array<{
      type: 'user_segment' | 'demographic' | 'behavior' | 'location';
      criteria: Record<string, unknown>;
    }>;
    weightingFactors: {
      userHistory: number;
      trending: number;
      seasonal: number;
      personal: number;
    };
  };
  
  productCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface CollectionProduct {
  id: string;
  collectionId: string;
  productId: string;
  position: number;
  addedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice?: number;
    images: string[];
    rating: number;
    reviewCount: number;
    availability: 'in_stock' | 'out_of_stock' | 'pre_order';
    category: {
      id: string;
      name: string;
    };
    brand: {
      id: string;
      name: string;
    };
  };
}

interface CollectionTemplate {
  id: string;
  name: string;
  description: string;
  type: 'featured' | 'curated' | 'automated' | 'seasonal' | 'category' | 'brand';
  defaultSettings: {
    displaySettings: ProductCollection['displaySettings'];
    rules?: ProductCollection['rules'];
    personalization?: ProductCollection['personalization'];
  };
  previewImage?: string;
  isDefault: boolean;
  createdAt: string;
}

interface CollectionAnalytics {
  collectionId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    views: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    bounceRate: number;
    timeOnCollection: number;
    productsViewed: number;
    addToCartRate: number;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }>;
  traffic: {
    sources: Record<string, number>;
    devices: Record<string, number>;
    locations: Record<string, number>;
  };
  trends: Array<{
    date: string;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}

class CollectionApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Collection Management

  // Get collections
  async getCollections(params?: SearchParams & PaginationParams & {
    type?: 'featured' | 'curated' | 'automated' | 'seasonal' | 'category' | 'brand';
    status?: 'active' | 'inactive' | 'scheduled' | 'draft';
    visibility?: 'public' | 'private' | 'members_only';
    sortBy?: 'name' | 'created' | 'updated' | 'views' | 'products';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<ProductCollection[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.type && { type: params.type }),
      ...(params?.status && { status: params.status }),
      ...(params?.visibility && { visibility: params.visibility }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<ProductCollection[]>(endpoints.collections.list, { params: queryParams });
  }

  // Get collection by ID
  async getCollectionById(collectionId: string): Promise<ApiResponse<ProductCollection>> {
    return this.client.get<ProductCollection>(endpoints.collections.byId(collectionId));
  }

  // Get collection by slug
  async getCollectionBySlug(slug: string): Promise<ApiResponse<ProductCollection>> {
    return this.client.get<ProductCollection>(endpoints.collections.bySlug(slug));
  }

  // Get featured collections
  async getFeaturedCollections(limit?: number): Promise<ApiResponse<ProductCollection[]>> {
    const params = limit ? { limit } : {};
    return this.client.get<ProductCollection[]>(endpoints.collections.featured, { params });
  }

  // Create collection
  async createCollection(collectionData: {
    name: string;
    slug: string;
    description: string;
    type: 'featured' | 'curated' | 'automated' | 'seasonal' | 'category' | 'brand';
    visibility?: 'public' | 'private' | 'members_only';
    displaySettings?: ProductCollection['displaySettings'];
    seo?: ProductCollection['seo'];
    featuredImage?: string;
    bannerImage?: string;
    rules?: ProductCollection['rules'];
    schedule?: ProductCollection['schedule'];
    personalization?: ProductCollection['personalization'];
  }): Promise<ApiResponse<ProductCollection>> {
    return this.client.post<ProductCollection>(endpoints.collections.create, collectionData);
  }

  // Update collection
  async updateCollection(collectionId: string, updates: {
    name?: string;
    slug?: string;
    description?: string;
    status?: 'active' | 'inactive' | 'scheduled' | 'draft';
    visibility?: 'public' | 'private' | 'members_only';
    sortOrder?: number;
    displaySettings?: ProductCollection['displaySettings'];
    seo?: ProductCollection['seo'];
    featuredImage?: string;
    bannerImage?: string;
    rules?: ProductCollection['rules'];
    schedule?: ProductCollection['schedule'];
    personalization?: ProductCollection['personalization'];
  }): Promise<ApiResponse<ProductCollection>> {
    return this.client.put<ProductCollection>(endpoints.collections.update(collectionId), updates);
  }

  // Delete collection
  async deleteCollection(collectionId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.collections.delete(collectionId));
  }

  // Duplicate collection
  async duplicateCollection(collectionId: string, options?: {
    name?: string;
    slug?: string;
    copyProducts?: boolean;
    copySchedule?: boolean;
  }): Promise<ApiResponse<ProductCollection>> {
    return this.client.post<ProductCollection>(endpoints.collections.duplicate(collectionId), options || {});
  }

  // Product Management

  // Get collection products
  async getCollectionProducts(collectionId: string, params?: PaginationParams & {
    sortBy?: 'position' | 'name' | 'price' | 'rating' | 'created';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<CollectionProduct[]>> {
    const queryParams = {
      ...buildPaginationParams(params || {}),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<CollectionProduct[]>(endpoints.collections.products(collectionId), { params: queryParams });
  }

  // Add product to collection
  async addProductToCollection(collectionId: string, productData: {
    productId: string;
    position?: number;
  }): Promise<ApiResponse<CollectionProduct>> {
    return this.client.post<CollectionProduct>(endpoints.collections.addProduct(collectionId), productData);
  }

  // Add multiple products to collection
  async addMultipleProductsToCollection(collectionId: string, products: Array<{
    productId: string;
    position?: number;
  }>): Promise<ApiResponse<{
    addedCount: number;
    products: CollectionProduct[];
    errors: Array<{
      productId: string;
      error: string;
    }>;
  }>> {
    return this.client.post<{
      addedCount: number;
      products: CollectionProduct[];
      errors: Array<{
        productId: string;
        error: string;
      }>;
    }>(endpoints.collections.addMultipleProducts(collectionId), { products });
  }

  // Remove product from collection
  async removeProductFromCollection(collectionId: string, productId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.collections.removeProduct(collectionId, productId));
  }

  // Update product position in collection
  async updateProductPosition(collectionId: string, productId: string, position: number): Promise<ApiResponse<CollectionProduct>> {
    return this.client.put<CollectionProduct>(endpoints.collections.updatePosition(collectionId, productId), { position });
  }

  // Reorder collection products
  async reorderCollectionProducts(collectionId: string, productOrder: Array<{
    productId: string;
    position: number;
  }>): Promise<ApiResponse<{
    updatedCount: number;
    products: CollectionProduct[];
  }>> {
    return this.client.put<{
      updatedCount: number;
      products: CollectionProduct[];
    }>(endpoints.collections.reorder(collectionId), { productOrder });
  }

  // Automated Collections

  // Preview automated collection
  async previewAutomatedCollection(rules: ProductCollection['rules']): Promise<ApiResponse<{
    productCount: number;
    sampleProducts: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
    }>;
  }>> {
    return this.client.post<{
      productCount: number;
      sampleProducts: Array<{
        id: string;
        name: string;
        price: number;
        image: string;
      }>;
    }>(endpoints.collections.previewAutomated, { rules });
  }

  // Refresh automated collection
  async refreshAutomatedCollection(collectionId: string): Promise<ApiResponse<{
    message: string;
    addedCount: number;
    removedCount: number;
    totalProducts: number;
  }>> {
    return this.client.post<{
      message: string;
      addedCount: number;
      removedCount: number;
      totalProducts: number;
    }>(endpoints.collections.refresh(collectionId), {});
  }

  // Templates

  // Get collection templates
  async getCollectionTemplates(): Promise<ApiResponse<CollectionTemplate[]>> {
    return this.client.get<CollectionTemplate[]>(endpoints.collections.templates);
  }

  // Create collection from template
  async createCollectionFromTemplate(templateId: string, collectionData: {
    name: string;
    slug: string;
    description: string;
  }): Promise<ApiResponse<ProductCollection>> {
    return this.client.post<ProductCollection>(endpoints.collections.fromTemplate(templateId), collectionData);
  }

  // Analytics

  // Get collection analytics
  async getCollectionAnalytics(collectionId: string, params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    granularity?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<CollectionAnalytics>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.granularity && { granularity: params.granularity }),
    };
    
    return this.client.get<CollectionAnalytics>(endpoints.collections.analytics(collectionId), { params: queryParams });
  }

  // Get collection performance
  async getCollectionPerformance(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    sortBy?: 'views' | 'clicks' | 'conversions' | 'revenue';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  }): Promise<ApiResponse<Array<{
    collectionId: string;
    collectionName: string;
    views: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    trend: 'up' | 'down' | 'stable';
  }>>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      ...(params?.limit && { limit: params.limit }),
    };
    
    return this.client.get<Array<{
      collectionId: string;
      collectionName: string;
      views: number;
      clicks: number;
      conversions: number;
      conversionRate: number;
      revenue: number;
      trend: 'up' | 'down' | 'stable';
    }>>(endpoints.collections.performance, { params: queryParams });
  }

  // Bulk Operations

  // Bulk update collections
  async bulkUpdateCollections(updates: Array<{
    collectionId: string;
    updates: {
      status?: 'active' | 'inactive' | 'scheduled' | 'draft';
      visibility?: 'public' | 'private' | 'members_only';
      sortOrder?: number;
    };
  }>): Promise<ApiResponse<{
    updatedCount: number;
    errors: Array<{
      collectionId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      updatedCount: number;
      errors: Array<{
        collectionId: string;
        error: string;
      }>;
    }>(endpoints.collections.bulkUpdate, { updates });
  }

  // Bulk delete collections
  async bulkDeleteCollections(collectionIds: string[]): Promise<ApiResponse<{
    deletedCount: number;
    errors: Array<{
      collectionId: string;
      error: string;
    }>;
  }>> {
    return this.client.delete<{
      deletedCount: number;
      errors: Array<{
        collectionId: string;
        error: string;
      }>;
    }>(endpoints.collections.bulkDelete, {
      data: { collectionIds },
    });
  }

  // Search & Discovery

  // Search collections
  async searchCollections(params: SearchParams & PaginationParams & {
    type?: 'featured' | 'curated' | 'automated' | 'seasonal' | 'category' | 'brand';
    includeProducts?: boolean;
  }): Promise<ApiResponse<ProductCollection[]>> {
    const queryParams = {
      ...buildSearchParams(params),
      ...buildPaginationParams(params),
      ...(params.type && { type: params.type }),
      ...(params.includeProducts !== undefined && { includeProducts: params.includeProducts }),
    };
    
    return this.client.get<ProductCollection[]>(endpoints.collections.search, { params: queryParams });
  }

  // Get related collections
  async getRelatedCollections(collectionId: string, limit?: number): Promise<ApiResponse<ProductCollection[]>> {
    const params = limit ? { limit } : {};
    return this.client.get<ProductCollection[]>(endpoints.collections.related(collectionId), { params });
  }

  // Personalization

  // Get personalized collections for user
  async getPersonalizedCollections(params?: {
    userId?: string;
    limit?: number;
    includeReasons?: boolean;
  }): Promise<ApiResponse<Array<ProductCollection & {
    personalizedScore: number;
    reasons?: string[];
  }>>> {
    const queryParams = {
      ...(params?.userId && { userId: params.userId }),
      ...(params?.limit && { limit: params.limit }),
      ...(params?.includeReasons !== undefined && { includeReasons: params.includeReasons }),
    };
    
    return this.client.get<Array<ProductCollection & {
      personalizedScore: number;
      reasons?: string[];
    }>>(endpoints.collections.personalized, { params: queryParams });
  }

  // Update personalization settings
  async updatePersonalizationSettings(collectionId: string, settings: ProductCollection['personalization']): Promise<ApiResponse<ProductCollection>> {
    return this.client.put<ProductCollection>(endpoints.collections.updatePersonalization(collectionId), { personalization: settings });
  }
}

// Create service instance
const collectionApiService = new CollectionApiService();

// React Query Hooks

// Collection Management
export const useCollections = (params?: SearchParams & PaginationParams & {
  type?: 'featured' | 'curated' | 'automated' | 'seasonal' | 'category' | 'brand';
  status?: 'active' | 'inactive' | 'scheduled' | 'draft';
  visibility?: 'public' | 'private' | 'members_only';
  sortBy?: 'name' | 'created' | 'updated' | 'views' | 'products';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['collections', params],
    queryFn: () => collectionApiService.getCollections(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCollection = (collectionId: string) => {
  return useQuery({
    queryKey: ['collections', 'detail', collectionId],
    queryFn: () => collectionApiService.getCollectionById(collectionId),
    enabled: !!collectionId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useCollectionBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['collections', 'slug', slug],
    queryFn: () => collectionApiService.getCollectionBySlug(slug),
    enabled: !!slug,
    staleTime: 15 * 60 * 1000,
  });
};

export const useFeaturedCollections = (limit?: number) => {
  return useQuery({
    queryKey: ['collections', 'featured', limit],
    queryFn: () => collectionApiService.getFeaturedCollections(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Collection Products
export const useCollectionProducts = (collectionId: string, params?: PaginationParams & {
  sortBy?: 'position' | 'name' | 'price' | 'rating' | 'created';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['collections', 'products', collectionId, params],
    queryFn: () => collectionApiService.getCollectionProducts(collectionId, params),
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000,
  });
};

// Templates
export const useCollectionTemplates = () => {
  return useQuery({
    queryKey: ['collections', 'templates'],
    queryFn: () => collectionApiService.getCollectionTemplates(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Analytics
export const useCollectionAnalytics = (collectionId: string, params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  granularity?: 'day' | 'week' | 'month';
}) => {
  return useQuery({
    queryKey: ['collections', 'analytics', collectionId, params],
    queryFn: () => collectionApiService.getCollectionAnalytics(collectionId, params),
    enabled: !!collectionId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCollectionPerformance = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'views' | 'clicks' | 'conversions' | 'revenue';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['collections', 'performance', params],
    queryFn: () => collectionApiService.getCollectionPerformance(params),
    staleTime: 15 * 60 * 1000,
  });
};

// Search
export const useSearchCollections = (params: SearchParams & PaginationParams & {
  type?: 'featured' | 'curated' | 'automated' | 'seasonal' | 'category' | 'brand';
  includeProducts?: boolean;
}) => {
  return useQuery({
    queryKey: ['collections', 'search', params],
    queryFn: () => collectionApiService.searchCollections(params),
    enabled: !!params.q,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRelatedCollections = (collectionId: string, limit?: number) => {
  return useQuery({
    queryKey: ['collections', 'related', collectionId, limit],
    queryFn: () => collectionApiService.getRelatedCollections(collectionId, limit),
    enabled: !!collectionId,
    staleTime: 30 * 60 * 1000,
  });
};

// Personalization
export const usePersonalizedCollections = (params?: {
  userId?: string;
  limit?: number;
  includeReasons?: boolean;
}) => {
  return useQuery({
    queryKey: ['collections', 'personalized', params],
    queryFn: () => collectionApiService.getPersonalizedCollections(params),
    staleTime: 10 * 60 * 1000,
  });
};

// Mutation Hooks

// Collection Management
export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (collectionData: {
      name: string;
      slug: string;
      description: string;
      type: 'featured' | 'curated' | 'automated' | 'seasonal' | 'category' | 'brand';
      visibility?: 'public' | 'private' | 'members_only';
      displaySettings?: ProductCollection['displaySettings'];
      seo?: ProductCollection['seo'];
      featuredImage?: string;
      bannerImage?: string;
      rules?: ProductCollection['rules'];
      schedule?: ProductCollection['schedule'];
      personalization?: ProductCollection['personalization'];
    }) => collectionApiService.createCollection(collectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, updates }: {
      collectionId: string;
      updates: {
        name?: string;
        slug?: string;
        description?: string;
        status?: 'active' | 'inactive' | 'scheduled' | 'draft';
        visibility?: 'public' | 'private' | 'members_only';
        sortOrder?: number;
        displaySettings?: ProductCollection['displaySettings'];
        seo?: ProductCollection['seo'];
        featuredImage?: string;
        bannerImage?: string;
        rules?: ProductCollection['rules'];
        schedule?: ProductCollection['schedule'];
        personalization?: ProductCollection['personalization'];
      };
    }) => collectionApiService.updateCollection(collectionId, updates),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'detail', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (collectionId: string) => collectionApiService.deleteCollection(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useDuplicateCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, options }: {
      collectionId: string;
      options?: {
        name?: string;
        slug?: string;
        copyProducts?: boolean;
        copySchedule?: boolean;
      };
    }) => collectionApiService.duplicateCollection(collectionId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

// Product Management
export const useAddProductToCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, productData }: {
      collectionId: string;
      productData: {
        productId: string;
        position?: number;
      };
    }) => collectionApiService.addProductToCollection(collectionId, productData),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'products', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections', 'detail', collectionId] });
    },
  });
};

export const useAddMultipleProductsToCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, products }: {
      collectionId: string;
      products: Array<{
        productId: string;
        position?: number;
      }>;
    }) => collectionApiService.addMultipleProductsToCollection(collectionId, products),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'products', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections', 'detail', collectionId] });
    },
  });
};

export const useRemoveProductFromCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, productId }: {
      collectionId: string;
      productId: string;
    }) => collectionApiService.removeProductFromCollection(collectionId, productId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'products', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections', 'detail', collectionId] });
    },
  });
};

export const useUpdateProductPosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, productId, position }: {
      collectionId: string;
      productId: string;
      position: number;
    }) => collectionApiService.updateProductPosition(collectionId, productId, position),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'products', collectionId] });
    },
  });
};

export const useReorderCollectionProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, productOrder }: {
      collectionId: string;
      productOrder: Array<{
        productId: string;
        position: number;
      }>;
    }) => collectionApiService.reorderCollectionProducts(collectionId, productOrder),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'products', collectionId] });
    },
  });
};

// Automated Collections
export const usePreviewAutomatedCollection = () => {
  return useMutation({
    mutationFn: (rules: ProductCollection['rules']) => collectionApiService.previewAutomatedCollection(rules),
  });
};

export const useRefreshAutomatedCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (collectionId: string) => collectionApiService.refreshAutomatedCollection(collectionId),
    onSuccess: (_, collectionId) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'detail', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections', 'products', collectionId] });
    },
  });
};

// Templates
export const useCreateCollectionFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, collectionData }: {
      templateId: string;
      collectionData: {
        name: string;
        slug: string;
        description: string;
      };
    }) => collectionApiService.createCollectionFromTemplate(templateId, collectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

// Bulk Operations
export const useBulkUpdateCollections = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{
      collectionId: string;
      updates: {
        status?: 'active' | 'inactive' | 'scheduled' | 'draft';
        visibility?: 'public' | 'private' | 'members_only';
        sortOrder?: number;
      };
    }>) => collectionApiService.bulkUpdateCollections(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useBulkDeleteCollections = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (collectionIds: string[]) => collectionApiService.bulkDeleteCollections(collectionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

// Personalization
export const useUpdatePersonalizationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, settings }: {
      collectionId: string;
      settings: ProductCollection['personalization'];
    }) => collectionApiService.updatePersonalizationSettings(collectionId, settings),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'detail', collectionId] });
    },
  });
};

export default collectionApiService;

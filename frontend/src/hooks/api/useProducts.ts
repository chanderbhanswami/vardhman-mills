import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from '../api/useApi';

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  slug: string;
  price: number;
  salePrice?: number;
  currency: string;
  categories: Category[];
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  inventory: ProductInventory;
  shipping: ProductShipping;
  seo: ProductSEO;
  status: 'draft' | 'published' | 'archived' | 'out_of_stock';
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  level: number;
  path: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  attributes: Record<string, string>;
  inventory: number;
  isDefault: boolean;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'color' | 'size' | 'material';
  isFilterable: boolean;
}

export interface ProductInventory {
  stock: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  lowStockThreshold: number;
}

export interface ProductShipping {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass?: string;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonical?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  attributes?: Record<string, string[]>;
  status?: Product['status'];
  featured?: boolean;
  inStock?: boolean;
  onSale?: boolean;
  rating?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'created' | 'updated' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: Category[];
    priceRange: { min: number; max: number };
    availableAttributes: ProductAttribute[];
    tags: string[];
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  salePrice?: number;
  categoryIds: string[];
  tags: string[];
  images: File[];
  variants: Omit<ProductVariant, 'id'>[];
  attributes: Omit<ProductAttribute, 'id'>[];
  inventory: ProductInventory;
  shipping: ProductShipping;
  seo: ProductSEO;
  status: Product['status'];
  featured: boolean;
}

const QUERY_KEYS = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productBySlug: (slug: string) => ['products', 'slug', slug] as const,
  categories: ['product-categories'] as const,
  attributes: ['product-attributes'] as const,
} as const;

export const useProducts = (filters: ProductFilters = {}, options: { enabled?: boolean } = {}) => {
  const api = useApi();
  const queryClient = useQueryClient();

  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);

  // Merge filters
  const activeFilters = useMemo(() => ({ ...filters, ...localFilters }), [filters, localFilters]);

  // Query for products list
  const productsQuery = useQuery({
    queryKey: [...QUERY_KEYS.products, activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get<ProductsResponse>(`/products?${params.toString()}`);
      return response;
    },
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Infinite query for products (for pagination)
  const infiniteProductsQuery = useInfiniteQuery({
    queryKey: [...QUERY_KEYS.products, 'infinite', activeFilters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.append('page', pageParam.toString());
      
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'page') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get<ProductsResponse>(`/products?${params.toString()}`);
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });

  // Get single product by ID (returns query function)
  const getProduct = useCallback(async (id: string) => {
    const response = await api.get<{ product: Product }>(`/products/${id}`);
    return response?.product;
  }, [api]);

  // Get single product by slug (returns query function)
  const getProductBySlug = useCallback(async (slug: string) => {
    const response = await api.get<{ product: Product }>(`/products/slug/${slug}`);
    return response?.product;
  }, [api]);

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: CreateProductData) => {
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', data.name);
      formData.append('description', data.description);
      if (data.shortDescription) formData.append('shortDescription', data.shortDescription);
      formData.append('sku', data.sku);
      formData.append('price', data.price.toString());
      if (data.salePrice) formData.append('salePrice', data.salePrice.toString());
      formData.append('categoryIds', JSON.stringify(data.categoryIds));
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('variants', JSON.stringify(data.variants));
      formData.append('attributes', JSON.stringify(data.attributes));
      formData.append('inventory', JSON.stringify(data.inventory));
      formData.append('shipping', JSON.stringify(data.shipping));
      formData.append('seo', JSON.stringify(data.seo));
      formData.append('status', data.status);
      formData.append('featured', data.featured.toString());
      
      // Add image files
      data.images.forEach((image) => {
        formData.append(`images`, image);
      });

      const response = await api.post<{ product: Product }>('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response?.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProductData> }) => {
      let requestData: FormData | Partial<CreateProductData> = data;

      // Handle file uploads
      if (data.images && data.images.length > 0) {
        const formData = new FormData();
        
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'images' && value !== undefined) {
            if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value.toString());
            }
          }
        });
        
        data.images.forEach((image) => {
          formData.append('images', image);
        });
        
        requestData = formData;
      }

      const response = await api.put<{ product: Product }>(`/products/${id}`, requestData);
      return response?.product;
    },
    onSuccess: (product) => {
      if (product) {
        queryClient.setQueryData(QUERY_KEYS.product(product.id), product);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
        toast.success('Product updated successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.product(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  // Reset filters to initial
  const resetFilters = useCallback(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Search products
  const searchProducts = useCallback((query: string) => {
    updateFilters({ search: query });
  }, [updateFilters]);

  // Filter by category
  const filterByCategory = useCallback((categoryId: string) => {
    updateFilters({ category: categoryId });
  }, [updateFilters]);

  // Filter by price range
  const filterByPriceRange = useCallback((min: number, max: number) => {
    updateFilters({ priceMin: min, priceMax: max });
  }, [updateFilters]);

  // Sort products
  const sortProducts = useCallback((sortBy: ProductFilters['sortBy'], sortOrder: ProductFilters['sortOrder'] = 'asc') => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  // Computed values
  const computed = useMemo(() => {
    const data = productsQuery.data;
    
    return {
      products: data?.products || [],
      pagination: data?.pagination || null,
      availableFilters: data?.filters || null,
      totalProducts: data?.pagination?.total || 0,
      hasProducts: (data?.products?.length || 0) > 0,
      isFirstPage: (data?.pagination?.page || 1) === 1,
      isLastPage: data?.pagination ? data.pagination.page >= data.pagination.pages : false,
      hasFilters: Object.keys(activeFilters).length > 0,
    };
  }, [productsQuery.data, activeFilters]);

  return {
    // Query data
    ...computed,
    
    // Query states
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    isRefetching: productsQuery.isRefetching,
    
    // Infinite query
    infiniteData: infiniteProductsQuery.data,
    hasNextPage: infiniteProductsQuery.hasNextPage,
    fetchNextPage: infiniteProductsQuery.fetchNextPage,
    isFetchingNextPage: infiniteProductsQuery.isFetchingNextPage,
    
    // Actions
    refetch: productsQuery.refetch,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    
    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    
    // Filtering
    filters: activeFilters,
    updateFilters,
    clearFilters,
    resetFilters,
    searchProducts,
    filterByCategory,
    filterByPriceRange,
    sortProducts,
    
    // Utilities
    getProduct,
    getProductBySlug,
  };
};

export default useProducts;

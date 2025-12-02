import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  Product, 
  ProductVariant,
  Category,
  Brand
} from '../../types/product.types';
import { ProductReview as Review } from '../../types/review.types';
import { 
  APIResponse as ApiResponse,
  PaginationMeta
} from '../../types/common.types';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { CACHE_KEYS } from './config';
import { buildSearchParams, buildPaginationParams } from './utils';
import { SearchParams, PaginationParams } from './types';

/**
 * Product API Service
 * Handles all product-related operations including CRUD, search, filtering, etc.
 */

class ProductApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Helper to map backend product to frontend product
  private mapProduct(backendProduct: any): Product {
    const images = backendProduct.images || [];
    const imageAssets = images.map((url: string, index: number) => ({
      id: `img-${index}`,
      url,
      alt: backendProduct.name,
      priority: index === 0
    }));

    const price = backendProduct.variants?.[0]?.price || 0;
    const comparePrice = backendProduct.variants?.[0]?.comparePrice;

    return {
      id: backendProduct._id || backendProduct.id,
      name: backendProduct.name,
      slug: backendProduct.slug,
      sku: backendProduct.variants?.[0]?.sku || '',
      description: backendProduct.description,
      shortDescription: backendProduct.shortDescription,
      
      categoryId: backendProduct.category?._id || backendProduct.category?.id || '',
      category: backendProduct.category ? {
        id: backendProduct.category._id || backendProduct.category.id,
        name: backendProduct.category.name,
        slug: backendProduct.category.slug,
        level: 0,
        children: [],
        path: '',
        seo: {},
        status: 'active',
        isVisible: true,
        isFeatured: false,
        productCount: 0,
        activeProductCount: 0,
        sortOrder: 0,
        attributeGroups: [],
        createdBy: '',
        updatedBy: '',
        createdAt: '',
        updatedAt: ''
      } : { 
        id: '', name: '', slug: '', level: 0, children: [], path: '', seo: {}, 
        status: 'active', isVisible: true, isFeatured: false, 
        productCount: 0, activeProductCount: 0, sortOrder: 0, attributeGroups: [],
        createdBy: '', updatedBy: '', createdAt: '', updatedAt: '' 
      },
      
      collectionIds: [],
      collections: [],
      
      price: price,
      pricing: {
        basePrice: { amount: price, currency: 'INR', formatted: `₹${price}` },
        salePrice: comparePrice ? { amount: price, currency: 'INR', formatted: `₹${price}` } : undefined,
        compareAtPrice: comparePrice ? { amount: comparePrice, currency: 'INR', formatted: `₹${comparePrice}` } : undefined,
        isDynamicPricing: false,
        taxable: true
      },

      // Inventory
      stock: backendProduct.stock || 0,
      inventory: {
        quantity: backendProduct.stock || 0,
        isInStock: (backendProduct.stock || 0) > 0,
        isLowStock: (backendProduct.stock || 0) < 10,
        lowStockThreshold: 10,
        availableQuantity: backendProduct.stock || 0,
        backorderAllowed: false
      },
      
      variants: (backendProduct.variants || []).map((v: any) => ({
        id: v._id || v.id,
        productId: backendProduct._id || backendProduct.id,
        name: `${v.size || ''} ${v.color || ''}`.trim(),
        sku: v.sku,
        options: [
            { id: 'opt-size', optionId: 'size', value: v.size, displayValue: v.size, sortOrder: 0, isAvailable: true },
            { id: 'opt-color', optionId: 'color', value: v.color, displayValue: v.color, sortOrder: 1, isAvailable: true }
        ].filter((o: any) => o.value),
        pricing: {
            basePrice: { amount: v.price, currency: 'INR', formatted: `₹${v.price}` },
            salePrice: v.comparePrice ? { amount: v.price, currency: 'INR', formatted: `₹${v.price}` } : undefined,
            compareAtPrice: v.comparePrice ? { amount: v.comparePrice, currency: 'INR', formatted: `₹${v.comparePrice}` } : undefined,
            isDynamicPricing: false,
            taxable: true
        },
        inventory: {
            quantity: v.stock || 0,
            isInStock: (v.stock || 0) > 0,
            isLowStock: (v.stock || 0) < 10,
            lowStockThreshold: 10,
            availableQuantity: v.stock || 0,
            backorderAllowed: false
        },
        status: 'active',
        isDefault: false,
        createdAt: '',
        updatedAt: ''
      })),
      
      images: images,
      media: {
        images: imageAssets
      },
      
      rating: {
        average: backendProduct.averageRating || 0,
        count: backendProduct.totalReviews || 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      },
      reviewCount: backendProduct.totalReviews || 0,

      status: backendProduct.isActive ? 'active' : 'inactive',
      isPublished: backendProduct.isActive,
      isFeatured: backendProduct.isFeatured || false,
      
      createdAt: backendProduct.createdAt,
      updatedAt: backendProduct.updatedAt
    } as Product;
  }

  // Helper to transform backend list response to frontend ApiResponse
  private transformListResponse(response: any): ApiResponse<Product[]> {
    if (response && response.data && Array.isArray(response.data.products)) {
      return {
        success: response.status === 'success',
        data: response.data.products.map((p: any) => this.mapProduct(p)),
        meta: {
          total: response.pagination?.total || response.results || 0,
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 12,
          totalPages: response.pagination?.pages || 1,
          hasNextPage: (response.pagination?.page || 1) < (response.pagination?.pages || 1),
          hasPreviousPage: (response.pagination?.page || 1) > 1
        } as PaginationMeta
      };
    }
    return response as ApiResponse<Product[]>;
  }

  // Helper to transform backend single item response
  private transformSingleResponse(response: any): ApiResponse<Product> {
    if (response && response.data && response.data.product) {
      return {
        success: response.status === 'success',
        data: this.mapProduct(response.data.product)
      };
    }
    return response as ApiResponse<Product>;
  }

  // Get all products with filters and pagination
  async getProducts(params?: SearchParams & PaginationParams): Promise<ApiResponse<Product[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
    };
    
    const response = await this.client.get<any>(endpoints.products.list, { params: queryParams });
    return this.transformListResponse(response);
  }

  // Get product by ID
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await this.client.get<any>(endpoints.products.byId(id));
    return this.transformSingleResponse(response);
  }

  // Get product by slug
  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    const response = await this.client.get<any>(endpoints.products.bySlug(slug));
    return this.transformSingleResponse(response);
  }

  // Get featured products
  async getFeaturedProducts(limit?: number): Promise<ApiResponse<Product[]>> {
    const params = limit ? { limit } : {};
    const response = await this.client.get<any>(endpoints.products.featured, { params });
    return this.transformListResponse(response);
  }

  // Get bestselling products
  async getBestsellerProducts(limit?: number): Promise<ApiResponse<Product[]>> {
    const params = limit ? { limit } : {};
    const response = await this.client.get<any>(endpoints.products.bestsellers, { params });
    return this.transformListResponse(response);
  }

  // Get new arrival products
  async getNewArrivals(limit?: number): Promise<ApiResponse<Product[]>> {
    const params = limit ? { limit } : {};
    const response = await this.client.get<any>(endpoints.products.newArrivals, { params });
    return this.transformListResponse(response);
  }

  // Get products on sale
  async getOnSaleProducts(limit?: number): Promise<ApiResponse<Product[]>> {
    const params = limit ? { limit } : {};
    const response = await this.client.get<any>(endpoints.products.onSale, { params });
    return this.transformListResponse(response);
  }

  // Get related products
  async getRelatedProducts(id: string, limit?: number): Promise<ApiResponse<Product[]>> {
    const params = limit ? { limit } : {};
    const response = await this.client.get<any>(endpoints.products.related(id), { params });
    return this.transformListResponse(response);
  }

  // Get similar products
  async getSimilarProducts(id: string, limit?: number): Promise<ApiResponse<Product[]>> {
    const params = limit ? { limit } : {};
    const response = await this.client.get<any>(endpoints.products.similar(id), { params });
    return this.transformListResponse(response);
  }

  // Search products
  async searchProducts(query: string, params?: SearchParams & PaginationParams): Promise<ApiResponse<Product[]>> {
    const searchParams = {
      q: query,
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
    };
    
    const response = await this.client.get<any>(endpoints.products.search, { params: searchParams });
    return this.transformListResponse(response);
  }

  // Get products by category
  async getProductsByCategory(categoryId: string, params?: SearchParams & PaginationParams): Promise<ApiResponse<Product[]>> {
    const queryParams = {
      category: categoryId,
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
    };
    
    const response = await this.client.get<any>(endpoints.products.byCategory(categoryId), { params: queryParams });
    return this.transformListResponse(response);
  }

  // Get products by brand
  async getProductsByBrand(brandId: string, params?: SearchParams & PaginationParams): Promise<ApiResponse<Product[]>> {
    const queryParams = {
      brand: brandId,
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
    };
    
    const response = await this.client.get<any>(endpoints.products.byBrand(brandId), { params: queryParams });
    return this.transformListResponse(response);
  }

  // Create product (Admin only)
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    const response = await this.client.post<any>(endpoints.products.create, data);
    return this.transformSingleResponse(response);
  }

  // Update product (Admin only)
  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await this.client.put<any>(endpoints.products.update(id), data);
    return this.transformSingleResponse(response);
  }

  // Delete product (Admin only)
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.products.delete(id));
  }

  // Upload product images (Admin only)
  async uploadProductImages(id: string, files: File[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    
    return this.client.post<string[]>(endpoints.products.uploadImages(id), formData);
  }

  // Delete product image (Admin only)
  async deleteProductImage(id: string, imageUrl: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.products.deleteImage(id), { data: { imageUrl } });
  }

  // Update product stock (Admin only)
  async updateProductStock(id: string, stock: number): Promise<ApiResponse<Product>> {
    const response = await this.client.patch<any>(endpoints.products.updateStock(id), { stock });
    return this.transformSingleResponse(response);
  }

  // Update product price (Admin only)
  async updateProductPrice(id: string, price: number, salePrice?: number): Promise<ApiResponse<Product>> {
    const response = await this.client.patch<any>(endpoints.products.updatePrice(id), { price, salePrice });
    return this.transformSingleResponse(response);
  }

  // Toggle product status (Admin only)
  async toggleProductStatus(id: string, isActive: boolean): Promise<ApiResponse<Product>> {
    const response = await this.client.patch<any>(endpoints.products.toggleStatus(id), { isActive });
    return this.transformSingleResponse(response);
  }

  // Get product reviews
  async getProductReviews(id: string, params?: PaginationParams): Promise<ApiResponse<Review[]>> {
    const queryParams = buildPaginationParams(params || {});
    const response = await this.client.get<any>(endpoints.products.reviews(id), { params: queryParams });
    // Reviews might also need transformation if they follow the same pattern
    if (response && response.data && Array.isArray(response.data.reviews)) {
        return {
            success: response.status === 'success',
            data: response.data.reviews,
            meta: {
                total: response.results || 0
            }
        };
    }
    return response;
  }

  // Add product review
  async addProductReview(id: string, review: { rating: number; comment: string; title?: string }): Promise<ApiResponse<Review>> {
    const response = await this.client.post<any>(endpoints.products.addReview(id), review);
    if (response && response.data && response.data.review) {
        return {
            success: response.status === 'success',
            data: response.data.review
        };
    }
    return response;
  }

  // Get product variants
  async getProductVariants(id: string): Promise<ApiResponse<ProductVariant[]>> {
    return this.client.get<ProductVariant[]>(endpoints.products.variants(id));
  }

  // Get product inventory
  async getProductInventory(id: string): Promise<ApiResponse<{ stock: number; reserved: number; available: number }>> {
    return this.client.get<{ stock: number; reserved: number; available: number }>(endpoints.products.inventory(id));
  }

  // Bulk operations (Admin only)
  async bulkUpdateProducts(updates: Array<{ id: string; data: Partial<Product> }>): Promise<ApiResponse<Product[]>> {
    return this.client.post<Product[]>(endpoints.products.bulkUpdate, { updates });
  }

  async bulkDeleteProducts(ids: string[]): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.products.bulkDelete, { data: { ids } });
  }

  // Product analytics (Admin only)
  async getProductAnalytics(id: string, period?: string): Promise<ApiResponse<{ views: number; sales: number; revenue: number; conversions: number }>> {
    const params = period ? { period } : {};
    return this.client.get<{ views: number; sales: number; revenue: number; conversions: number }>(endpoints.products.analytics(id), { params });
  }

  // Get product export data (Admin only)
  async exportProducts(format: 'csv' | 'xlsx' | 'json' = 'csv'): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(endpoints.products.export, { 
      params: { format },
      responseType: 'blob'
    });
  }

  // Import products (Admin only)
  async importProducts(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.client.post<{ imported: number; errors: string[] }>(endpoints.products.import, formData);
  }
}

// Create service instance
const productApiService = new ProductApiService();

// React Query Hooks
export const useProducts = (params?: SearchParams & PaginationParams) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'list', params],
    queryFn: () => productApiService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInfiniteProducts = (params?: SearchParams & PaginationParams) => {
  return useInfiniteQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      productApiService.getProducts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta || !lastPage.meta.page || !lastPage.meta.totalPages) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'detail', id],
    queryFn: () => productApiService.getProductById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'slug', slug],
    queryFn: () => productApiService.getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
};

export const useFeaturedProducts = (limit?: number) => {
  return useQuery({
    queryKey: [CACHE_KEYS.FEATURED_PRODUCTS, limit],
    queryFn: () => productApiService.getFeaturedProducts(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useBestsellerProducts = (limit?: number) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'bestsellers', limit],
    queryFn: () => productApiService.getBestsellerProducts(limit),
    staleTime: 15 * 60 * 1000,
  });
};

export const useNewArrivals = (limit?: number) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'new-arrivals', limit],
    queryFn: () => productApiService.getNewArrivals(limit),
    staleTime: 10 * 60 * 1000,
  });
};

export const useOnSaleProducts = (limit?: number) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'on-sale', limit],
    queryFn: () => productApiService.getOnSaleProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRelatedProducts = (id: string, limit?: number) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'related', id, limit],
    queryFn: () => productApiService.getRelatedProducts(id, limit),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
};

export const useSimilarProducts = (id: string, limit?: number) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'similar', id, limit],
    queryFn: () => productApiService.getSimilarProducts(id, limit),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
};

export const useSearchProducts = (query: string, params?: SearchParams & PaginationParams) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'search', query, params],
    queryFn: () => productApiService.searchProducts(query, params),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useProductsByCategory = (categoryId: string, params?: SearchParams & PaginationParams) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'category', categoryId, params],
    queryFn: () => productApiService.getProductsByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductsByBrand = (brandId: string, params?: SearchParams & PaginationParams) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, 'brand', brandId, params],
    queryFn: () => productApiService.getProductsByBrand(brandId, params),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation Hooks
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => 
      productApiService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      productApiService.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS, 'detail', id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => productApiService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS] });
    },
  });
};

export const useUploadProductImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => 
      productApiService.uploadProductImages(id, files),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS, 'detail', id] });
    },
  });
};

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, imageUrl }: { id: string; imageUrl: string }) => 
      productApiService.deleteProductImage(id, imageUrl),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS, 'detail', id] });
    },
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => 
      productApiService.updateProductStock(id, stock),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS, 'detail', id] });
    },
  });
};

export const useUpdateProductPrice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, price, salePrice }: { id: string; price: number; salePrice?: number }) => 
      productApiService.updateProductPrice(id, price, salePrice),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS, 'detail', id] });
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      productApiService.toggleProductStatus(id, isActive),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS, 'detail', id] });
    },
  });
};

export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{ id: string; data: Partial<Product> }>) => 
      productApiService.bulkUpdateProducts(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS] });
    },
  });
};

export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => productApiService.bulkDeleteProducts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS] });
    },
  });
};

export const useImportProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => productApiService.importProducts(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS] });
    },
  });
};

export default productApiService;

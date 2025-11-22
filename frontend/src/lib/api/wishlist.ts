/**
 * Wishlist API Client
 * Comprehensive wishlist management with essential features
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type {
  ApiResponse,
  User,
  Product,
} from './types';

/**
 * Wishlist interfaces
 */
export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  note?: string;
  priority: number;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

/**
 * Enhanced Wishlist Item with additional metadata
 */
export interface WishlistItemDetailed extends Omit<WishlistItem, 'priority'> {
  product: Product;
  addedAt: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

/**
 * Enhanced Wishlist with comprehensive metadata
 */
export interface WishlistDetailed extends Wishlist {
  user: User;
  items: WishlistItemDetailed[];
  itemCount: number;
  totalValue: number;
  lastUpdated: string;
}

/**
 * Wishlist API Service Class
 * Provides comprehensive wishlist management functionality
 */
export class WishlistApiService {
  private baseUrl = '/api/v1/wishlist';

  // ============================================================================
  // BASIC CRUD OPERATIONS
  // ============================================================================

  /**
   * Get user's wishlist with all items
   */
  async getWishlist(): Promise<ApiResponse<WishlistDetailed>> {
    return httpClient.get(endpoints.wishlist.get);
  }

  /**
   * Add a product to the wishlist
   */
  async addToWishlist(productId: string, options?: {
    priority?: 'high' | 'medium' | 'low';
    notes?: string;
  }): Promise<ApiResponse<WishlistItemDetailed>> {
    return httpClient.post(endpoints.wishlist.add, {
      productId,
      ...options,
    });
  }

  /**
   * Remove an item from the wishlist
   */
  async removeFromWishlist(itemId: string): Promise<ApiResponse<void>> {
    return httpClient.delete(endpoints.wishlist.remove(itemId));
  }

  /**
   * Clear all items from the wishlist
   */
  async clearWishlist(): Promise<ApiResponse<void>> {
    return httpClient.delete(endpoints.wishlist.clear);
  }

  /**
   * Get wishlist item count
   */
  async getWishlistCount(): Promise<ApiResponse<{ count: number }>> {
    return httpClient.get(endpoints.wishlist.count);
  }

  /**
   * Share wishlist
   */
  async shareWishlist(options?: {
    isPublic?: boolean;
    allowCollaboration?: boolean;
    expiresAt?: string;
  }): Promise<ApiResponse<{ shareCode: string; shareUrl: string }>> {
    return httpClient.post(endpoints.wishlist.share, options);
  }

  /**
   * Move item to cart
   */
  async moveToCart(itemId: string, quantity: number = 1): Promise<ApiResponse<void>> {
    return httpClient.post(`${this.baseUrl}/items/${itemId}/move-to-cart`, { quantity });
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(productId: string): Promise<ApiResponse<{ inWishlist: boolean; itemId?: string }>> {
    return httpClient.get(`${this.baseUrl}/check/${productId}`);
  }

  /**
   * Toggle product in wishlist (add if not present, remove if present)
   */
  async toggleWishlist(productId: string): Promise<ApiResponse<{ action: 'added' | 'removed'; item?: WishlistItemDetailed }>> {
    return httpClient.post(`${this.baseUrl}/toggle`, { productId });
  }

  /**
   * Get wishlist recommendations based on current items
   */
  async getRecommendations(limit: number = 10): Promise<ApiResponse<Product[]>> {
    return httpClient.get(`${this.baseUrl}/recommendations`, { params: { limit } });
  }

  /**
   * Get similar products to a specific wishlist item
   */
  async getSimilarProducts(itemId: string, limit: number = 5): Promise<ApiResponse<Product[]>> {
    return httpClient.get(`${this.baseUrl}/items/${itemId}/similar`, { params: { limit } });
  }

  /**
   * Bulk add products to wishlist
   */
  async bulkAddToWishlist(productIds: string[]): Promise<ApiResponse<WishlistItemDetailed[]>> {
    return httpClient.post(`${this.baseUrl}/bulk/add`, { productIds });
  }

  /**
   * Bulk remove items from wishlist
   */
  async bulkRemoveFromWishlist(itemIds: string[]): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/bulk/remove`, { data: { itemIds } });
  }

  /**
   * Bulk move items to cart
   */
  async bulkMoveToCart(itemIds: string[]): Promise<ApiResponse<void>> {
    return httpClient.post(`${this.baseUrl}/bulk/move-to-cart`, { itemIds });
  }

  /**
   * Search wishlist items
   */
  async searchWishlist(query: string, filters?: {
    category?: string;
    priceRange?: { min: number; max: number };
    inStock?: boolean;
  }): Promise<ApiResponse<WishlistItemDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/search`, { params: { query, ...filters } });
  }

  /**
   * Get wishlist analytics
   */
  async getWishlistAnalytics(): Promise<ApiResponse<{
    totalItems: number;
    totalValue: number;
    categoryBreakdown: Array<{ category: string; count: number; value: number }>;
    recentActivity: Array<{ action: string; productName: string; date: string }>;
  }>> {
    return httpClient.get(`${this.baseUrl}/analytics`);
  }

  /**
   * Export wishlist
   */
  async exportWishlist(format: 'json' | 'csv' = 'json'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return httpClient.post(`${this.baseUrl}/export`, { format });
  }

  /**
   * Import wishlist
   */
  async importWishlist(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient.post(`${this.baseUrl}/import`, formData);
  }
}

// Create service instance
export const wishlistService = new WishlistApiService();

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Cache keys for wishlist queries
 */
export const WISHLIST_CACHE_KEYS = {
  all: ['wishlist'] as const,
  lists: () => [...WISHLIST_CACHE_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...WISHLIST_CACHE_KEYS.lists(), filters] as const,
  details: () => [...WISHLIST_CACHE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WISHLIST_CACHE_KEYS.details(), id] as const,
  count: () => [...WISHLIST_CACHE_KEYS.all, 'count'] as const,
  recommendations: () => [...WISHLIST_CACHE_KEYS.all, 'recommendations'] as const,
  analytics: () => [...WISHLIST_CACHE_KEYS.all, 'analytics'] as const,
};

/**
 * Get user's wishlist
 */
export const useWishlist = (options?: UseQueryOptions<ApiResponse<WishlistDetailed>>) => {
  return useQuery({
    queryKey: WISHLIST_CACHE_KEYS.details(),
    queryFn: () => wishlistService.getWishlist(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get wishlist item count
 */
export const useWishlistCount = (options?: UseQueryOptions<ApiResponse<{ count: number }>>) => {
  return useQuery({
    queryKey: WISHLIST_CACHE_KEYS.count(),
    queryFn: () => wishlistService.getWishlistCount(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Check if product is in wishlist
 */
export const useIsInWishlist = (
  productId: string,
  options?: UseQueryOptions<ApiResponse<{ inWishlist: boolean; itemId?: string }>>
) => {
  return useQuery({
    queryKey: [...WISHLIST_CACHE_KEYS.all, 'check', productId],
    queryFn: () => wishlistService.isInWishlist(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Get wishlist recommendations
 */
export const useWishlistRecommendations = (
  limit: number = 10,
  options?: UseQueryOptions<ApiResponse<Product[]>>
) => {
  return useQuery({
    queryKey: [...WISHLIST_CACHE_KEYS.recommendations(), limit],
    queryFn: () => wishlistService.getRecommendations(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

/**
 * Get wishlist analytics
 */
export const useWishlistAnalytics = (options?: UseQueryOptions<ApiResponse<{
  totalItems: number;
  totalValue: number;
  categoryBreakdown: Array<{ category: string; count: number; value: number }>;
  recentActivity: Array<{ action: string; productName: string; date: string }>;
}>>) => {
  return useQuery({
    queryKey: WISHLIST_CACHE_KEYS.analytics(),
    queryFn: () => wishlistService.getWishlistAnalytics(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

/**
 * Add product to wishlist
 */
export const useAddToWishlist = (options?: UseMutationOptions<
  ApiResponse<WishlistItemDetailed>,
  Error,
  { productId: string; options?: { priority?: 'high' | 'medium' | 'low'; notes?: string } }
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, options: addOptions }) => 
      wishlistService.addToWishlist(productId, addOptions),
    onSuccess: (data) => {
      console.log('Added to wishlist:', data);
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: WISHLIST_CACHE_KEYS.all });
      
      // Show success message
      toast.success('Added to wishlist');
    },
    onError: (error) => {
      toast.error('Failed to add to wishlist');
      console.error('Add to wishlist error:', error);
    },
    ...options,
  });
};

/**
 * Remove item from wishlist
 */
export const useRemoveFromWishlist = (options?: UseMutationOptions<
  ApiResponse<void>,
  Error,
  string
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => wishlistService.removeFromWishlist(itemId),
    onSuccess: () => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: WISHLIST_CACHE_KEYS.all });
      
      // Show success message
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toast.error('Failed to remove from wishlist');
      console.error('Remove from wishlist error:', error);
    },
    ...options,
  });
};

/**
 * Toggle product in wishlist
 */
export const useToggleWishlist = (options?: UseMutationOptions<
  ApiResponse<{ action: 'added' | 'removed'; item?: WishlistItemDetailed }>,
  Error,
  string
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.toggleWishlist(productId),
    onSuccess: (data) => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: WISHLIST_CACHE_KEYS.all });
      
      // Show success message
      const action = data?.data?.action;
      toast.success(action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
    },
    onError: (error) => {
      toast.error('Failed to update wishlist');
      console.error('Toggle wishlist error:', error);
    },
    ...options,
  });
};

/**
 * Clear entire wishlist
 */
export const useClearWishlist = (options?: UseMutationOptions<
  ApiResponse<void>,
  Error,
  void
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onSuccess: () => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: WISHLIST_CACHE_KEYS.all });
      
      // Show success message
      toast.success('Wishlist cleared');
    },
    onError: (error) => {
      toast.error('Failed to clear wishlist');
      console.error('Clear wishlist error:', error);
    },
    ...options,
  });
};

/**
 * Move item to cart
 */
export const useMoveToCart = (options?: UseMutationOptions<
  ApiResponse<void>,
  Error,
  { itemId: string; quantity?: number }
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity = 1 }) => wishlistService.moveToCart(itemId, quantity),
    onSuccess: () => {
      // Invalidate wishlist and cart queries
      queryClient.invalidateQueries({ queryKey: WISHLIST_CACHE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // Show success message
      toast.success('Moved to cart');
    },
    onError: (error) => {
      toast.error('Failed to move to cart');
      console.error('Move to cart error:', error);
    },
    ...options,
  });
};

/**
 * Share wishlist
 */
export const useShareWishlist = (options?: UseMutationOptions<
  ApiResponse<{ shareCode: string; shareUrl: string }>,
  Error,
  { isPublic?: boolean; allowCollaboration?: boolean; expiresAt?: string }
>) => {
  return useMutation({
    mutationFn: (shareOptions) => wishlistService.shareWishlist(shareOptions),
    onSuccess: (data) => {
      // Copy share URL to clipboard
      if (navigator.clipboard) {
        if (data?.data?.shareUrl) {
          navigator.clipboard.writeText(data.data.shareUrl);
        }
        toast.success('Share link copied to clipboard');
      } else {
        toast.success('Wishlist shared successfully');
      }
    },
    onError: (error) => {
      toast.error('Failed to share wishlist');
      console.error('Share wishlist error:', error);
    },
    ...options,
  });
};

/**
 * Bulk add products to wishlist
 */
export const useBulkAddToWishlist = (options?: UseMutationOptions<
  ApiResponse<WishlistItemDetailed[]>,
  Error,
  string[]
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) => wishlistService.bulkAddToWishlist(productIds),
    onSuccess: (data) => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: WISHLIST_CACHE_KEYS.all });
      
      // Show success message
      const count = data?.data?.length || 0;
      toast.success(`Added ${count} item${count > 1 ? 's' : ''} to wishlist`);
    },
    onError: (error) => {
      toast.error('Failed to add items to wishlist');
      console.error('Bulk add to wishlist error:', error);
    },
    ...options,
  });
};

/**
 * Bulk remove items from wishlist
 */
export const useBulkRemoveFromWishlist = (options?: UseMutationOptions<
  ApiResponse<void>,
  Error,
  string[]
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemIds: string[]) => wishlistService.bulkRemoveFromWishlist(itemIds),
    onSuccess: (_, itemIds) => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: WISHLIST_CACHE_KEYS.all });
      
      // Show success message
      const count = itemIds.length;
      toast.success(`Removed ${count} item${count > 1 ? 's' : ''} from wishlist`);
    },
    onError: (error) => {
      toast.error('Failed to remove items from wishlist');
      console.error('Bulk remove from wishlist error:', error);
    },
    ...options,
  });
};

/**
 * Bulk move items to cart
 */
export const useBulkMoveToCart = (options?: UseMutationOptions<
  ApiResponse<void>,
  Error,
  string[]
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemIds: string[]) => wishlistService.bulkMoveToCart(itemIds),
    onSuccess: (_, itemIds) => {
      // Invalidate wishlist and cart queries
      queryClient.invalidateQueries({ queryKey: WISHLIST_CACHE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // Show success message
      const count = itemIds.length;
      toast.success(`Moved ${count} item${count > 1 ? 's' : ''} to cart`);
    },
    onError: (error) => {
      toast.error('Failed to move items to cart');
      console.error('Bulk move to cart error:', error);
    },
    ...options,
  });
};

/**
 * Export wishlist
 */
export const useExportWishlist = (options?: UseMutationOptions<
  ApiResponse<{ downloadUrl: string }>,
  Error,
  'json' | 'csv'
>) => {
  return useMutation({
    mutationFn: (format: 'json' | 'csv') => wishlistService.exportWishlist(format),
    onSuccess: (data) => {
      // Trigger download
      const link = document.createElement('a');
      if (data?.data?.downloadUrl) {
        link.href = data.data.downloadUrl;
        link.download = `wishlist.${data.data.downloadUrl.includes('.csv') ? 'csv' : 'json'}`;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Wishlist exported successfully');
    },
    onError: (error) => {
      toast.error('Failed to export wishlist');
      console.error('Export wishlist error:', error);
    },
    ...options,
  });
};

/**
 * Import wishlist
 */
export const useImportWishlist = (options?: UseMutationOptions<
  ApiResponse<{ imported: number; errors: string[] }>,
  Error,
  File
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => wishlistService.importWishlist(file),
    onSuccess: (data) => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: WISHLIST_CACHE_KEYS.all });
      
      // Show success message
      const { imported, errors } = data?.data || { imported: 0, errors: [] };
      if (imported > 0) {
        toast.success(`Imported ${imported} item${imported > 1 ? 's' : ''}`);
      }
      if (errors.length > 0) {
        toast.error(`${errors.length} item${errors.length > 1 ? 's' : ''} failed to import`);
      }
    },
    onError: (error) => {
      toast.error('Failed to import wishlist');
      console.error('Import wishlist error:', error);
    },
    ...options,
  });
};

export default wishlistService;
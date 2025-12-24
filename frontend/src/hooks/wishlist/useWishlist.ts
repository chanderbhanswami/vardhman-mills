import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  userId: string;
  addedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    image: string;
    gallery?: string[];
    description?: string;
    category?: string;
    brand?: string;
    inStock: boolean;
    stockQuantity: number;
    rating?: number;
    reviewCount?: number;
    tags?: string[];
    features?: string[];
  };
  variant?: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    image?: string;
    attributes: Record<string, string>;
    inStock: boolean;
    stockQuantity: number;
  };
}

export interface WishlistFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  inStock?: boolean;
  onSale?: boolean;
  brand?: string;
  tags?: string[];
  rating?: number;
  sortBy?: 'addedAt' | 'price' | 'name' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface WishlistStats {
  totalItems: number;
  totalValue: number;
  totalSavings: number;
  categories: Array<{ name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  inStockItems: number;
  outOfStockItems: number;
  onSaleItems: number;
  averageRating: number;
  oldestItem: string;
  newestItem: string;
}

export interface UseWishlistOptions {
  filters?: WishlistFilters;
  autoRefetch?: boolean;
  staleTime?: number;
  cacheTime?: number;
  enablePagination?: boolean;
  itemsPerPage?: number;
}

export const useWishlist = (options: UseWishlistOptions = {}) => {
  const {
    filters: initialFilters = {},
    autoRefetch = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    enablePagination = false,
    itemsPerPage = 12,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [filters, setFilters] = useState<WishlistFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch wishlist data
  const wishlistQuery = useQuery<{
    items: WishlistItem[];
    total: number;
    page: number;
    totalPages: number;
    stats: WishlistStats;
  }>({
    queryKey: ['wishlist', user?.id, filters, currentPage, itemsPerPage, isAuthenticated],
    queryFn: async () => {
      // GUEST MODE: Use localStorage
      if (!isAuthenticated || !user) {
        const { getGuestWishlist } = await import('@/lib/wishlist/guestWishlist');
        const guestProductIds = getGuestWishlist();

        return {
          items: guestProductIds.map(productId => ({
            id: productId,
            productId: productId,
            userId: 'guest',
            variant: undefined,
            product: {} as any,
            addedAt: new Date().toISOString(),
            notes: null,
          } as WishlistItem)),
          total: guestProductIds.length,
          page: 1,
          totalPages: 1,
          stats: {
            totalItems: guestProductIds.length,
            totalValue: 0,
            totalSavings: 0,
            categories: [],
            brands: [],
            inStockItems: 0,
            outOfStockItems: 0,
            onSaleItems: 0,
            averageRating: 0,
            oldestItem: '',
            newestItem: '',
          },
        };
      }

      // AUTHENTICATED MODE: Use API (existing behavior)
      // Simulate API call with filters and pagination
      await new Promise(resolve => setTimeout(resolve, 800));

      // TODO: Replace with real API call
      // For now, return empty wishlist by default
      // Mock data has been removed - integrate with real backend
      const allItems: WishlistItem[] = [];

      // Apply filters (when real data exists)
      const filteredItems = allItems.filter(item => {
        if (filters.category && item.product.category !== filters.category) return false;
        if (filters.brand && item.product.brand !== filters.brand) return false;
        if (filters.inStock !== undefined && item.product.inStock !== filters.inStock) return false;
        if (filters.onSale && !item.product.salePrice) return false;
        if (filters.rating && (!item.product.rating || item.product.rating < filters.rating)) return false;
        if (filters.tags?.length && !filters.tags.some(tag => item.product.tags?.includes(tag))) return false;

        if (filters.priceRange) {
          const price = item.product.salePrice || item.product.price;
          if (price < filters.priceRange.min || price > filters.priceRange.max) return false;
        }

        return true;
      });

      // Apply sorting
      if (filters.sortBy) {
        filteredItems.sort((a, b) => {
          const order = filters.sortOrder === 'desc' ? -1 : 1;

          switch (filters.sortBy) {
            case 'addedAt':
              return order * (new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
            case 'price': {
              const priceA = a.product.salePrice || a.product.price;
              const priceB = b.product.salePrice || b.product.price;
              return order * (priceA - priceB);
            }
            case 'name':
              return order * a.product.name.localeCompare(b.product.name);
            case 'rating':
              return order * ((a.product.rating || 0) - (b.product.rating || 0));
            case 'popularity':
              return order * ((a.product.reviewCount || 0) - (b.product.reviewCount || 0));
            default:
              return 0;
          }
        });
      } else {
        // Default sort by newest first
        filteredItems.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      }

      // Pagination
      const total = filteredItems.length;
      const totalPages = enablePagination ? Math.ceil(total / itemsPerPage) : 1;
      const startIndex = enablePagination ? (currentPage - 1) * itemsPerPage : 0;
      const endIndex = enablePagination ? startIndex + itemsPerPage : total;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      // Generate stats
      const stats: WishlistStats = {
        totalItems: total,
        totalValue: filteredItems.reduce((sum, item) => {
          const price = item.variant?.price || item.product.price;
          return sum + price;
        }, 0),
        totalSavings: filteredItems.reduce((sum, item) => {
          const originalPrice = item.variant?.price || item.product.price;
          const salePrice = item.variant?.salePrice || item.product.salePrice;
          return sum + (salePrice ? originalPrice - salePrice : 0);
        }, 0),
        categories: Object.entries(
          filteredItems.reduce((acc, item) => {
            if (item.product.category) {
              acc[item.product.category] = (acc[item.product.category] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>)
        ).map(([name, count]) => ({ name, count })),
        brands: Object.entries(
          filteredItems.reduce((acc, item) => {
            if (item.product.brand) {
              acc[item.product.brand] = (acc[item.product.brand] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>)
        ).map(([name, count]) => ({ name, count })),
        inStockItems: filteredItems.filter(item => item.product.inStock).length,
        outOfStockItems: filteredItems.filter(item => !item.product.inStock).length,
        onSaleItems: filteredItems.filter(item => item.product.salePrice).length,
        averageRating: filteredItems.reduce((sum, item) => sum + (item.product.rating || 0), 0) / filteredItems.length || 0,
        oldestItem: filteredItems.reduce((oldest, item) =>
          new Date(item.addedAt) < new Date(oldest.addedAt) ? item : oldest,
          filteredItems[0]
        )?.addedAt || '',
        newestItem: filteredItems.reduce((newest, item) =>
          new Date(item.addedAt) > new Date(newest.addedAt) ? item : newest,
          filteredItems[0]
        )?.addedAt || '',
      };

      return {
        items: paginatedItems,
        total,
        page: currentPage,
        totalPages,
        stats,
      };
    },
    enabled: isAuthenticated && !!user,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: autoRefetch,
  });

  // Sync wishlist mutation (for manual refresh)
  const syncWishlistMutation = useMutation({
    mutationFn: async (): Promise<{ synced: number; removed: number }> => {
      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated');
      }

      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Syncing wishlist with server...');

      return {
        synced: Math.floor(Math.random() * 5) + 1,
        removed: Math.floor(Math.random() * 2),
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });

      toast.success(
        `Wishlist synced! ${result.synced} items updated, ${result.removed} items removed`,
        { duration: 3000, icon: '🔄' }
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sync wishlist',
        { duration: 4000 }
      );
    },
  });

  // Computed values
  const items = useMemo(() => wishlistQuery.data?.items || [], [wishlistQuery.data?.items]);
  const stats = wishlistQuery.data?.stats;
  const totalPages = wishlistQuery.data?.totalPages || 1;
  const hasItems = items.length > 0;
  const isEmpty = !wishlistQuery.isLoading && !hasItems;

  // Filter utilities
  const availableCategories = useMemo(() => {
    return stats?.categories || [];
  }, [stats]);

  const availableBrands = useMemo(() => {
    return stats?.brands || [];
  }, [stats]);

  const priceRange = useMemo(() => {
    if (!items.length) return { min: 0, max: 0 };

    const prices = items.map((item: WishlistItem) => {
      const price = item.variant?.salePrice || item.variant?.price || item.product.salePrice || item.product.price;
      return price;
    });

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [items]);

  // Action functions
  const updateFilters = useCallback((newFilters: Partial<WishlistFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
  }, [queryClient, user?.id]);

  const sync = useCallback(() => {
    syncWishlistMutation.mutate();
  }, [syncWishlistMutation]);

  // Search functionality
  const searchItems = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return items.filter((item: WishlistItem) =>
      item.product.name.toLowerCase().includes(term) ||
      item.product.description?.toLowerCase().includes(term) ||
      item.product.brand?.toLowerCase().includes(term) ||
      item.product.category?.toLowerCase().includes(term) ||
      item.product.tags?.some((tag: string) => tag.toLowerCase().includes(term))
    );
  }, [items]);

  return {
    // Data
    items,
    stats,
    totalPages,
    currentPage,

    // State
    hasItems,
    isEmpty,
    isLoading: wishlistQuery.isLoading,
    isError: wishlistQuery.isError,
    error: wishlistQuery.error,
    isFetching: wishlistQuery.isFetching,
    isSuccess: wishlistQuery.isSuccess,

    // Filters
    filters,
    availableCategories,
    availableBrands,
    priceRange,

    // Actions
    updateFilters,
    clearFilters,
    goToPage,
    refresh,
    sync,
    searchItems,

    // View mode
    viewMode,
    setViewMode,

    // Sync state
    isSyncing: syncWishlistMutation.isPending,

    // Query object
    query: wishlistQuery,
    syncMutation: syncWishlistMutation,

    // Helper functions
    getItemById: (id: string) => items.find((item: WishlistItem) => item.id === id),
    getItemByProductId: (productId: string, variantId?: string) =>
      items.find((item: WishlistItem) => item.productId === productId && item.variantId === variantId),

    // Bulk selection helpers
    selectAll: () => items.map((item: WishlistItem) => item.id),
    selectInStock: () => items.filter((item: WishlistItem) => item.product.inStock).map((item: WishlistItem) => item.id),
    selectOnSale: () => items.filter((item: WishlistItem) => item.product.salePrice).map((item: WishlistItem) => item.id),
    selectByCategory: (category: string) => items.filter((item: WishlistItem) => item.product.category === category).map((item: WishlistItem) => item.id),
    selectByBrand: (brand: string) => items.filter((item: WishlistItem) => item.product.brand === brand).map((item: WishlistItem) => item.id),
  };
};

export default useWishlist;

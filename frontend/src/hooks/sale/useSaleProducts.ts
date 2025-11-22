import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface SaleProduct {
  id: string;
  productId: string;
  saleId: string;
  name: string;
  slug: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  discountAmount: number;
  category: string;
  subcategory?: string;
  brand: string;
  images: {
    url: string;
    alt: string;
  }[];
  rating: number;
  reviewCount: number;
  stock: number;
  isInStock: boolean;
  priority: number;
  tags: string[];
  specifications?: Record<string, string>;
  variants?: {
    id: string;
    name: string;
    value: string;
    price?: number;
    stock?: number;
  }[];
  createdAt: string;
  updatedAt: string;
  stats?: {
    viewCount: number;
    orderCount: number;
    conversionRate: number;
    totalRevenue: number;
  };
}

export interface SaleProductFilters {
  saleId?: string;
  category?: string;
  brand?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'discount-high' | 'rating' | 'popularity';
  search?: string;
}

export interface UseSaleProductsOptions {
  saleId?: string;
  pageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeStats?: boolean;
}

export const useSaleProducts = (options: UseSaleProductsOptions = {}) => {
  const {
    saleId,
    pageSize = 20,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
    includeStats = false,
  } = options;

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [filters, setFilters] = useState<SaleProductFilters>({
    saleId,
    inStockOnly: true,
    sortBy: 'discount-high',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Fetch sale products
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['sale-products', { filters, page, pageSize, includeStats }],
    queryFn: async (): Promise<{ products: SaleProduct[]; pagination: { total: number; hasMore: boolean } }> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockProducts: SaleProduct[] = [
        {
          id: 'sp_1',
          productId: 'prod_1',
          saleId: 'sale_1',
          name: 'Premium Cotton T-Shirt',
          slug: 'premium-cotton-t-shirt',
          description: 'High-quality premium cotton t-shirt with superior comfort and durability',
          originalPrice: 1999,
          salePrice: 1499,
          discountPercentage: 25,
          discountAmount: 500,
          category: 'clothing',
          subcategory: 't-shirts',
          brand: 'Vardhman',
          images: [
            { url: '/images/products/tshirt-1.jpg', alt: 'Premium Cotton T-Shirt Front' },
            { url: '/images/products/tshirt-2.jpg', alt: 'Premium Cotton T-Shirt Back' },
          ],
          rating: 4.5,
          reviewCount: 128,
          stock: 45,
          isInStock: true,
          priority: 1,
          tags: ['premium', 'cotton', 'comfort', 'casual'],
          specifications: {
            material: '100% Premium Cotton',
            fit: 'Regular Fit',
            care: 'Machine Wash Cold',
            origin: 'Made in India',
          },
          variants: [
            { id: 'v1', name: 'Size', value: 'S', stock: 10 },
            { id: 'v2', name: 'Size', value: 'M', stock: 15 },
            { id: 'v3', name: 'Size', value: 'L', stock: 12 },
            { id: 'v4', name: 'Size', value: 'XL', stock: 8 },
          ],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          stats: includeStats ? {
            viewCount: 1250,
            orderCount: 89,
            conversionRate: 7.1,
            totalRevenue: 133411,
          } : undefined,
        },
        {
          id: 'sp_2',
          productId: 'prod_2',
          saleId: 'sale_1',
          name: 'Luxury Silk Scarf',
          slug: 'luxury-silk-scarf',
          description: 'Elegant silk scarf with intricate patterns and premium finish',
          originalPrice: 2999,
          salePrice: 2249,
          discountPercentage: 25,
          discountAmount: 750,
          category: 'accessories',
          subcategory: 'scarves',
          brand: 'Vardhman',
          images: [
            { url: '/images/products/scarf-1.jpg', alt: 'Luxury Silk Scarf Pattern' },
            { url: '/images/products/scarf-2.jpg', alt: 'Luxury Silk Scarf Detail' },
          ],
          rating: 4.8,
          reviewCount: 67,
          stock: 23,
          isInStock: true,
          priority: 2,
          tags: ['luxury', 'silk', 'elegant', 'accessory'],
          specifications: {
            material: '100% Mulberry Silk',
            dimensions: '90cm x 90cm',
            pattern: 'Hand-printed',
            care: 'Dry Clean Only',
          },
          variants: [
            { id: 'v5', name: 'Color', value: 'Blue', stock: 8 },
            { id: 'v6', name: 'Color', value: 'Red', stock: 7 },
            { id: 'v7', name: 'Color', value: 'Gold', stock: 8 },
          ],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          stats: includeStats ? {
            viewCount: 890,
            orderCount: 34,
            conversionRate: 3.8,
            totalRevenue: 76466,
          } : undefined,
        },
        {
          id: 'sp_3',
          productId: 'prod_3',
          saleId: 'sale_2',
          name: 'Running Shoes Pro',
          slug: 'running-shoes-pro',
          description: 'Professional running shoes with advanced cushioning and support',
          originalPrice: 4999,
          salePrice: 2499, // BOGO - effectively 50% off
          discountPercentage: 50,
          discountAmount: 2500,
          category: 'shoes',
          subcategory: 'athletic',
          brand: 'SportMax',
          images: [
            { url: '/images/products/shoes-1.jpg', alt: 'Running Shoes Pro Side' },
            { url: '/images/products/shoes-2.jpg', alt: 'Running Shoes Pro Sole' },
          ],
          rating: 4.6,
          reviewCount: 203,
          stock: 0,
          isInStock: false,
          priority: 3,
          tags: ['running', 'sports', 'comfort', 'professional'],
          specifications: {
            material: 'Breathable Mesh',
            sole: 'EVA Foam Cushioning',
            support: 'Arch Support',
            weight: '280g per shoe',
          },
          variants: [
            { id: 'v8', name: 'Size', value: '7', stock: 0 },
            { id: 'v9', name: 'Size', value: '8', stock: 0 },
            { id: 'v10', name: 'Size', value: '9', stock: 0 },
          ],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          stats: includeStats ? {
            viewCount: 2100,
            orderCount: 156,
            conversionRate: 7.4,
            totalRevenue: 389844,
          } : undefined,
        },
      ];

      // Apply filters
      let filteredProducts = [...mockProducts];

      // Filter by sale
      if (filters.saleId) {
        filteredProducts = filteredProducts.filter(product => product.saleId === filters.saleId);
      }

      // Filter by category
      if (filters.category) {
        filteredProducts = filteredProducts.filter(product => product.category === filters.category);
      }

      // Filter by brand
      if (filters.brand) {
        filteredProducts = filteredProducts.filter(product => product.brand === filters.brand);
      }

      // Filter by price range
      if (filters.priceRange) {
        filteredProducts = filteredProducts.filter(product => 
          product.salePrice >= filters.priceRange!.min && 
          product.salePrice <= filters.priceRange!.max
        );
      }

      // Filter by rating
      if (filters.rating) {
        filteredProducts = filteredProducts.filter(product => product.rating >= filters.rating!);
      }

      // Filter by stock
      if (filters.inStockOnly) {
        filteredProducts = filteredProducts.filter(product => product.isInStock && product.stock > 0);
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.salePrice - b.salePrice);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.salePrice - a.salePrice);
          break;
        case 'discount-high':
          filteredProducts.sort((a, b) => b.discountPercentage - a.discountPercentage);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'popularity':
          filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        case 'newest':
        default:
          filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      // Paginate
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        pagination: {
          total: filteredProducts.length,
          hasMore: endIndex < filteredProducts.length,
        },
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1, variantId }: { 
      productId: string; 
      quantity?: number;
      variantId?: string;
    }): Promise<void> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Adding product ${productId} to cart (qty: ${quantity}, variant: ${variantId})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Product added to cart!', { duration: 2000, icon: '🛒' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add to cart',
        { duration: 3000 }
      );
    },
  });

  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId: string): Promise<{ inWishlist: boolean }> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to manage wishlist');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const isCurrentlyInWishlist = wishlist.has(productId);
      return { inWishlist: !isCurrentlyInWishlist };
    },
    onSuccess: (result, productId) => {
      setWishlist(prev => {
        const newWishlist = new Set(prev);
        if (result.inWishlist) {
          newWishlist.add(productId);
          toast.success('Added to wishlist!', { duration: 2000, icon: '❤️' });
        } else {
          newWishlist.delete(productId);
          toast.success('Removed from wishlist', { duration: 2000, icon: '💔' });
        }
        return newWishlist;
      });
      
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update wishlist',
        { duration: 3000 }
      );
    },
  });

  // Computed values
  const inStockProducts = useMemo(() => {
    return productsData?.products.filter(product => product.isInStock && product.stock > 0) || [];
  }, [productsData]);

  const outOfStockProducts = useMemo(() => {
    return productsData?.products.filter(product => !product.isInStock || product.stock === 0) || [];
  }, [productsData]);

  const averageDiscount = useMemo(() => {
    const products = productsData?.products || [];
    if (products.length === 0) return 0;
    return products.reduce((sum, product) => sum + product.discountPercentage, 0) / products.length;
  }, [productsData]);

  const priceRange = useMemo(() => {
    const products = productsData?.products || [];
    if (products.length === 0) return { min: 0, max: 0 };
    
    const prices = products.map(p => p.salePrice);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [productsData]);

  // Helper functions
  const getProductById = useCallback((productId: string): SaleProduct | null => {
    return productsData?.products.find(product => product.id === productId) || null;
  }, [productsData]);

  const getProductsByCategory = useCallback((category: string): SaleProduct[] => {
    return productsData?.products.filter(product => product.category === category) || [];
  }, [productsData]);

  const getProductsByBrand = useCallback((brand: string): SaleProduct[] => {
    return productsData?.products.filter(product => product.brand === brand) || [];
  }, [productsData]);

  const calculateSavings = useCallback((product: SaleProduct, quantity: number = 1): number => {
    return product.discountAmount * quantity;
  }, []);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlist.has(productId);
  }, [wishlist]);

  const getAvailableVariants = useCallback((productId: string): Array<{ id: string; name: string; value: string; inStock: boolean }> => {
    const product = getProductById(productId);
    if (!product || !product.variants) return [];
    
    return product.variants.map(variant => ({
      ...variant,
      inStock: (variant.stock || 0) > 0,
    }));
  }, [getProductById]);

  // Actions
  const updateFilters = useCallback((newFilters: Partial<SaleProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const loadMore = useCallback(() => {
    if (productsData?.pagination.hasMore) {
      setPage(prev => prev + 1);
    }
  }, [productsData]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1, variantId?: string) => {
    return addToCartMutation.mutateAsync({ productId, quantity, variantId });
  }, [addToCartMutation]);

  const toggleWishlist = useCallback(async (productId: string) => {
    return toggleWishlistMutation.mutateAsync(productId);
  }, [toggleWishlistMutation]);

  const resetFilters = useCallback(() => {
    setFilters({
      saleId,
      inStockOnly: true,
      sortBy: 'discount-high',
      search: '',
    });
    setPage(1);
  }, [saleId]);

  const refreshProducts = useCallback(() => {
    return refetch();
  }, [refetch]);

  return {
    // Data
    products: productsData?.products || [],
    pagination: productsData?.pagination || { total: 0, hasMore: false },
    inStockProducts,
    outOfStockProducts,
    filters,
    
    // State
    isLoading,
    isFetching,
    error,
    page,
    
    // Computed values
    averageDiscount,
    priceRange,
    
    // Helpers
    getProductById,
    getProductsByCategory,
    getProductsByBrand,
    calculateSavings,
    isInWishlist,
    getAvailableVariants,
    
    // Actions
    updateFilters,
    loadMore,
    addToCart,
    toggleWishlist,
    resetFilters,
    refreshProducts,
    
    // Stats
    stats: {
      totalProducts: productsData?.pagination.total || 0,
      inStockCount: inStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      averageDiscount,
      maxDiscount: Math.max(...(productsData?.products.map(p => p.discountPercentage) || [0])),
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    },
    
    // Loading states
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingWishlist: toggleWishlistMutation.isPending,
    
    // Errors
    cartError: addToCartMutation.error,
    wishlistError: toggleWishlistMutation.error,
  };
};

export default useSaleProducts;

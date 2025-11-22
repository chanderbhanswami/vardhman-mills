import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from './useApi';
import type { 
  Product, 
  ProductImage, 
  ProductVariant,
  ProductInventory
} from './useProducts';

export interface ProductUpdate {
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  salePrice?: number;
  categories?: string[];
  tags?: string[];
  status?: Product['status'];
  featured?: boolean;
  inventory?: Partial<ProductInventory>;
}

export interface ProductView {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  source: 'search' | 'category' | 'direct' | 'recommendation';
  metadata?: Record<string, unknown>;
}

export interface ProductRecommendation {
  id: string;
  product: Product;
  score: number;
  reason: 'similar' | 'viewed_together' | 'bought_together' | 'trending' | 'personalized';
}

export interface UseProductOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  trackViews?: boolean;
  loadRecommendations?: boolean;
  loadReviews?: boolean;
  onViewTracked?: (product: Product) => void;
  onVariantChange?: (variant: ProductVariant) => void;
}

const QUERY_KEYS = {
  product: (id: string) => ['products', id] as const,
  productBySlug: (slug: string) => ['products', 'slug', slug] as const,
  productViews: (id: string) => ['products', id, 'views'] as const,
  productRecommendations: (id: string) => ['products', id, 'recommendations'] as const,
  productReviews: (id: string) => ['products', id, 'reviews'] as const,
  productInventory: (id: string) => ['products', id, 'inventory'] as const,
  productImages: (id: string) => ['products', id, 'images'] as const,
} as const;

export const useProduct = (
  identifier: string,
  identifierType: 'id' | 'slug' = 'id',
  options: UseProductOptions = {}
) => {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    trackViews = true,
    loadRecommendations = true,
    loadReviews = true,
    onViewTracked,
    onVariantChange,
  } = options;

  const api = useApi();
  const queryClient = useQueryClient();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [viewTracked, setViewTracked] = useState(false);

  // Main product query
  const productQuery = useQuery({
    queryKey: identifierType === 'id' 
      ? QUERY_KEYS.product(identifier)
      : QUERY_KEYS.productBySlug(identifier),
    queryFn: async () => {
      const endpoint = identifierType === 'id' 
        ? `/products/${identifier}`
        : `/products/slug/${identifier}`;
      
      const response = await api.get<{ product: Product }>(endpoint);
      return response?.product;
    },
    enabled: enabled && !!identifier,
    refetchOnWindowFocus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Product recommendations query
  const recommendationsQuery = useQuery({
    queryKey: QUERY_KEYS.productRecommendations(productQuery.data?.id || ''),
    queryFn: async () => {
      const response = await api.get<{ recommendations: ProductRecommendation[] }>(
        `/products/${productQuery.data?.id}/recommendations`
      );
      return response?.recommendations || [];
    },
    enabled: enabled && loadRecommendations && !!productQuery.data?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Product reviews summary query
  const reviewsQuery = useQuery({
    queryKey: QUERY_KEYS.productReviews(productQuery.data?.id || ''),
    queryFn: async () => {
      const response = await api.get<{
        reviews: Array<{
          id: string;
          rating: number;
          comment: string;
          userName: string;
          createdAt: Date;
        }>;
        stats: {
          averageRating: number;
          totalReviews: number;
          ratingDistribution: { [key: number]: number };
        };
      }>(`/products/${productQuery.data?.id}/reviews?limit=5`);
      return response;
    },
    enabled: enabled && loadReviews && !!productQuery.data?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Real-time inventory query
  const inventoryQuery = useQuery({
    queryKey: QUERY_KEYS.productInventory(productQuery.data?.id || ''),
    queryFn: async () => {
      const response = await api.get<{ inventory: ProductInventory }>(
        `/products/${productQuery.data?.id}/inventory`
      );
      return response?.inventory;
    },
    enabled: enabled && !!productQuery.data?.id,
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (updates: ProductUpdate) => {
      const response = await api.put<{ product: Product }>(
        `/products/${productQuery.data?.id}`,
        updates
      );
      return response?.product;
    },
    onSuccess: (updatedProduct) => {
      if (updatedProduct) {
        queryClient.setQueryData(
          identifierType === 'id' 
            ? QUERY_KEYS.product(identifier)
            : QUERY_KEYS.productBySlug(identifier),
          updatedProduct
        );
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Product updated successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  // Track product view mutation
  const trackViewMutation = useMutation({
    mutationFn: async (viewData: Partial<ProductView>) => {
      const response = await api.post(`/products/${productQuery.data?.id}/view`, {
        timestamp: new Date(),
        source: 'direct',
        ...viewData,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.productViews(productQuery.data?.id || '') 
      });
    },
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/wishlist/add`, {
        productId: productQuery.data?.id,
      });
      return response;
    },
    onSuccess: () => {
      toast.success('Added to wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add to wishlist');
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/wishlist/remove/${productQuery.data?.id}`);
      return response;
    },
    onSuccess: () => {
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove from wishlist');
    },
  });

  // Upload product images mutation
  const uploadImagesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      const response = await api.post<{ images: ProductImage[] }>(
        `/products/${productQuery.data?.id}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response?.images;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.product(productQuery.data?.id || '') 
      });
      toast.success('Images uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload images');
    },
  });

  // Delete product image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const response = await api.delete(
        `/products/${productQuery.data?.id}/images/${imageId}`
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.product(productQuery.data?.id || '') 
      });
      toast.success('Image deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete image');
    },
  });

  // Track view when product loads
  useEffect(() => {
    if (productQuery.data && trackViews && !viewTracked) {
      trackViewMutation.mutate({});
      setViewTracked(true);
      onViewTracked?.(productQuery.data);
    }
  }, [productQuery.data, trackViews, viewTracked, trackViewMutation, onViewTracked]);

  // Set default variant when product loads
  useEffect(() => {
    if (productQuery.data?.variants && productQuery.data.variants.length > 0 && !selectedVariant) {
      const defaultVariant = productQuery.data.variants.find(v => v.isDefault) || productQuery.data.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [productQuery.data?.variants, selectedVariant]);

  // Handle variant change
  const handleVariantChange = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    onVariantChange?.(variant);
  }, [onVariantChange]);

  // Computed values
  const isLoading = productQuery.isLoading;
  const error = productQuery.error;
  const product = productQuery.data;

  const currentPrice = selectedVariant?.salePrice || selectedVariant?.price || product?.salePrice || product?.price || 0;
  const originalPrice = selectedVariant?.price || product?.price || 0;
  const isOnSale = currentPrice < originalPrice;
  const discountPercentage = isOnSale ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const currentInventory = inventoryQuery.data || product?.inventory;
  const isInStock = (currentInventory?.stock || 0) > 0;
  const isLowStock = (currentInventory?.stock || 0) <= (currentInventory?.lowStockThreshold || 5);
  const canBackorder = currentInventory?.allowBackorder || false;

  const primaryImage = product?.images?.find(img => img.isPrimary) || product?.images?.[0];
  const hasMultipleImages = (product?.images?.length || 0) > 1;

  const averageRating = reviewsQuery.data?.stats?.averageRating || product?.rating || 0;
  const totalReviews = reviewsQuery.data?.stats?.totalReviews || product?.reviewCount || 0;

  const categoryNames = product?.categories?.map(cat => cat.name) || [];
  const primaryCategory = product?.categories?.[0];

  const relatedProducts = recommendationsQuery.data?.filter(rec => rec.reason === 'similar').slice(0, 4) || [];
  const frequentlyBoughtTogether = recommendationsQuery.data?.filter(rec => rec.reason === 'bought_together').slice(0, 3) || [];

  return {
    // Core data
    product,
    selectedVariant,
    currentInventory,

    // Loading states
    isLoading,
    isLoadingRecommendations: recommendationsQuery.isLoading,
    isLoadingReviews: reviewsQuery.isLoading,
    isLoadingInventory: inventoryQuery.isLoading,

    // Error states
    error,
    recommendationsError: recommendationsQuery.error,
    reviewsError: reviewsQuery.error,
    inventoryError: inventoryQuery.error,

    // Mutation states
    isUpdating: updateProductMutation.isPending,
    isTrackingView: trackViewMutation.isPending,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
    isUploadingImages: uploadImagesMutation.isPending,
    isDeletingImage: deleteImageMutation.isPending,

    // Actions
    updateProduct: updateProductMutation.mutate,
    trackView: trackViewMutation.mutate,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    uploadImages: uploadImagesMutation.mutate,
    deleteImage: deleteImageMutation.mutate,
    selectVariant: handleVariantChange,

    // Computed values
    currentPrice,
    originalPrice,
    isOnSale,
    discountPercentage,
    isInStock,
    isLowStock,
    canBackorder,
    primaryImage,
    hasMultipleImages,
    averageRating,
    totalReviews,
    categoryNames,
    primaryCategory,

    // Related data
    recommendations: recommendationsQuery.data || [],
    relatedProducts,
    frequentlyBoughtTogether,
    recentReviews: reviewsQuery.data?.reviews || [],
    reviewsStats: reviewsQuery.data?.stats,

    // Refetch functions
    refetch: productQuery.refetch,
    refetchRecommendations: recommendationsQuery.refetch,
    refetchReviews: reviewsQuery.refetch,
    refetchInventory: inventoryQuery.refetch,
  };
};

export default useProduct;

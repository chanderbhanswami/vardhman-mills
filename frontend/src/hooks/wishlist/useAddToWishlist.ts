import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface AddToWishlistData {
  productId: string;
  variantId?: string;
  categoryId?: string;
}

export interface UseAddToWishlistOptions {
  onSuccess?: (productId: string) => void;
  onError?: (error: Error, productId: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export const useAddToWishlist = (options: UseAddToWishlistOptions = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (data: AddToWishlistData): Promise<{ success: boolean; message: string }> => {
      // GUEST MODE: Use localStorage
      if (!isAuthenticated || !user) {
        const { addToGuestWishlist, isInGuestWishlist } = await import('@/lib/wishlist/guestWishlist');

        // Check if already in wishlist
        if (isInGuestWishlist(data.productId)) {
          throw new Error('Product is already in your wishlist');
        }

        // Add to localStorage
        const success = addToGuestWishlist(data.productId);

        if (!success) {
          throw new Error('Failed to add to wishlist');
        }

        return {
          success: true,
          message: 'Product added to wishlist successfully',
        };
      }

      // AUTHENTICATED MODE: Use API

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check if product is already in wishlist (optimistic check)
      const existingWishlist = queryClient.getQueryData(['wishlist', user.id]) as Array<{ productId: string; variantId?: string }> | undefined;
      const isAlreadyInWishlist = existingWishlist?.some(
        item => item.productId === data.productId && item.variantId === data.variantId
      );

      if (isAlreadyInWishlist) {
        throw new Error('Product is already in your wishlist');
      }

      // Simulate successful addition
      console.log(`Adding product ${data.productId} to wishlist for user ${user.id}`);

      return {
        success: true,
        message: 'Product added to wishlist successfully',
      };
    },
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist', user?.id] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist', user?.id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['wishlist', user?.id], (old: Array<Record<string, unknown>> = []) => {
        const newItem = {
          id: `temp_${Date.now()}`,
          productId: data.productId,
          variantId: data.variantId,
          userId: user?.id,
          addedAt: new Date().toISOString(),
          // Mock product data for optimistic update
          product: {
            id: data.productId,
            name: 'Loading...',
            price: 0,
            image: '/images/placeholder.jpg',
          },
        };
        return [newItem, ...old];
      });

      // Return a context object with the snapshotted value
      return { previousWishlist };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['wishlist', user?.id], context?.previousWishlist);

      if (showErrorToast) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to add to wishlist',
          { duration: 4000, icon: '💔' }
        );
      }

      onError?.(error instanceof Error ? error : new Error('Failed to add to wishlist'), variables.productId);
    },
    onSuccess: (result, variables) => {
      // Invalidate ALL wishlist queries to refetch (works for both guest and authenticated)
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });

      // Also invalidate product queries to update wishlist status
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });

      if (showSuccessToast) {
        toast.success(result.message, { duration: 3000, icon: '❤️' });
      }

      onSuccess?.(variables.productId);
    },
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry if already in wishlist
      if (error instanceof Error && error.message.includes('already in your wishlist')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Multiple products addition
  const addMultipleToWishlistMutation = useMutation({
    mutationFn: async (products: AddToWishlistData[]): Promise<{
      success: number;
      failed: number;
      errors: Array<{ productId: string; error: string }>;
    }> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to add items to wishlist');
      }

      // Simulate batch API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ productId: string; error: string }>,
      };

      // Simulate adding each product
      for (const product of products) {
        try {
          // Simulate individual validation
          if (Math.random() > 0.9) { // 10% failure rate for demo
            throw new Error('Product not available');
          }
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            productId: product.productId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      // Invalidate wishlist to refresh data
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });

      if (results.success > 0) {
        toast.success(
          `${results.success} item${results.success > 1 ? 's' : ''} added to wishlist!`,
          { duration: 3000, icon: '❤️' }
        );
      }

      if (results.failed > 0) {
        toast.error(
          `${results.failed} item${results.failed > 1 ? 's' : ''} could not be added`,
          { duration: 4000, icon: '⚠️' }
        );
      }
    },
    onError: (error) => {
      if (showErrorToast) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to add products to wishlist',
          { duration: 4000 }
        );
      }
    },
  });

  // Quick add helper for single product
  const quickAdd = async (productId: string, variantId?: string) => {
    return addToWishlistMutation.mutateAsync({
      productId,
      variantId,
    });
  };

  // Add multiple products helper
  const addMultiple = async (products: AddToWishlistData[]) => {
    return addMultipleToWishlistMutation.mutateAsync(products);
  };

  // Check if can add to wishlist
  const canAddToWishlist = (productId: string, variantId?: string): boolean => {
    if (!isAuthenticated) return false;

    const existingWishlist = queryClient.getQueryData(['wishlist', user?.id]) as Array<{ productId: string; variantId?: string }> | undefined;
    return !existingWishlist?.some(
      item => item.productId === productId && item.variantId === variantId
    );
  };

  return {
    // Primary action
    addToWishlist: addToWishlistMutation.mutate,
    addToWishlistAsync: addToWishlistMutation.mutateAsync,

    // Helpers
    quickAdd,
    addMultiple,
    canAddToWishlist,

    // State
    isAdding: addToWishlistMutation.isPending,
    isAddingMultiple: addMultipleToWishlistMutation.isPending,
    error: addToWishlistMutation.error,

    // Status helpers
    isLoading: addToWishlistMutation.isPending || addMultipleToWishlistMutation.isPending,
    isSuccess: addToWishlistMutation.isSuccess,
    isError: addToWishlistMutation.isError,

    // Reset function
    reset: addToWishlistMutation.reset,

    // Mutation objects for advanced usage
    addMutation: addToWishlistMutation,
    addMultipleMutation: addMultipleToWishlistMutation,
  };
};

export default useAddToWishlist;

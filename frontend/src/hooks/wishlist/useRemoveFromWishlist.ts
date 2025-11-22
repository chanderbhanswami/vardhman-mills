import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface RemoveFromWishlistData {
  productId: string;
  variantId?: string;
  wishlistItemId?: string; // If available from wishlist data
}

export interface UseRemoveFromWishlistOptions {
  onSuccess?: (productId: string) => void;
  onError?: (error: Error, productId: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  confirmRemoval?: boolean;
}

export const useRemoveFromWishlist = (options: UseRemoveFromWishlistOptions = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    confirmRemoval = false,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (data: RemoveFromWishlistData): Promise<{ success: boolean; message: string }> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to remove items from wishlist');
      }

      // Show confirmation if required
      if (confirmRemoval && typeof window !== 'undefined') {
        const confirmed = window.confirm('Are you sure you want to remove this item from your wishlist?');
        if (!confirmed) {
          throw new Error('Removal cancelled by user');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      // Check if product exists in wishlist
      const existingWishlist = queryClient.getQueryData(['wishlist', user.id]) as Array<{ productId: string; variantId?: string; id: string }> | undefined;
      const itemExists = existingWishlist?.some(
        item => item.productId === data.productId && item.variantId === data.variantId
      );

      if (!itemExists) {
        throw new Error('Product not found in wishlist');
      }

      // Simulate successful removal
      console.log(`Removing product ${data.productId} from wishlist for user ${user.id}`);

      return {
        success: true,
        message: 'Product removed from wishlist',
      };
    },
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist', user?.id] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist', user?.id]);

      // Optimistically remove the item
      queryClient.setQueryData(['wishlist', user?.id], (old: Array<Record<string, unknown>> = []) => {
        return old.filter(item => 
          !(item.productId === data.productId && item.variantId === data.variantId)
        );
      });

      // Return a context object with the snapshotted value
      return { previousWishlist };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['wishlist', user?.id], context?.previousWishlist);

      // Don't show error for user cancellation
      if (error instanceof Error && error.message === 'Removal cancelled by user') {
        return;
      }

      if (showErrorToast) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to remove from wishlist',
          { duration: 4000, icon: '💔' }
        );
      }

      onError?.(error instanceof Error ? error : new Error('Failed to remove from wishlist'), variables.productId);
    },
    onSuccess: (result, variables) => {
      // Invalidate and refetch wishlist to ensure accuracy
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });

      // Also invalidate product queries to update wishlist status
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });

      if (showSuccessToast) {
        toast.success(result.message, { duration: 2000, icon: '💔' });
      }

      onSuccess?.(variables.productId);
    },
    retry: (failureCount, error) => {
      // Don't retry if user cancelled or item not found
      if (error instanceof Error && 
          (error.message.includes('cancelled by user') || error.message.includes('not found'))) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });

  // Remove multiple items mutation
  const removeMultipleFromWishlistMutation = useMutation({
    mutationFn: async (items: RemoveFromWishlistData[]): Promise<{
      success: number;
      failed: number;
      errors: Array<{ productId: string; error: string }>;
    }> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to remove items from wishlist');
      }

      // Show confirmation for bulk removal if required
      if (confirmRemoval && typeof window !== 'undefined') {
        const confirmed = window.confirm(
          `Are you sure you want to remove ${items.length} item${items.length > 1 ? 's' : ''} from your wishlist?`
        );
        if (!confirmed) {
          throw new Error('Removal cancelled by user');
        }
      }

      // Simulate batch API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ productId: string; error: string }>,
      };

      // Simulate removing each item
      for (const item of items) {
        try {
          // Simulate individual validation
          if (Math.random() > 0.95) { // 5% failure rate for demo
            throw new Error('Item not found');
          }
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            productId: item.productId,
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
          `${results.success} item${results.success > 1 ? 's' : ''} removed from wishlist`,
          { duration: 3000, icon: '💔' }
        );
      }

      if (results.failed > 0) {
        toast.error(
          `${results.failed} item${results.failed > 1 ? 's' : ''} could not be removed`,
          { duration: 4000, icon: '⚠️' }
        );
      }
    },
    onError: (error) => {
      // Don't show error for user cancellation
      if (error instanceof Error && error.message === 'Removal cancelled by user') {
        return;
      }

      if (showErrorToast) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to remove items from wishlist',
          { duration: 4000 }
        );
      }
    },
  });

  // Clear entire wishlist mutation
  const clearWishlistMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to clear wishlist');
      }

      // Always confirm for clearing entire wishlist
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm(
          'Are you sure you want to clear your entire wishlist? This action cannot be undone.'
        );
        if (!confirmed) {
          throw new Error('Clear cancelled by user');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Clearing entire wishlist for user ${user.id}`);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist', user?.id] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist', user?.id]);

      // Optimistically clear the wishlist
      queryClient.setQueryData(['wishlist', user?.id], []);

      // Return a context object with the snapshotted value
      return { previousWishlist };
    },
    onError: (error, _, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['wishlist', user?.id], context?.previousWishlist);

      // Don't show error for user cancellation
      if (error instanceof Error && error.message === 'Clear cancelled by user') {
        return;
      }

      if (showErrorToast) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to clear wishlist',
          { duration: 4000 }
        );
      }
    },
    onSuccess: () => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });

      if (showSuccessToast) {
        toast.success('Wishlist cleared successfully', { duration: 2000, icon: '🗑️' });
      }
    },
  });

  // Helper functions
  const quickRemove = async (productId: string, variantId?: string) => {
    return removeFromWishlistMutation.mutateAsync({
      productId,
      variantId,
    });
  };

  const removeMultiple = async (items: RemoveFromWishlistData[]) => {
    return removeMultipleFromWishlistMutation.mutateAsync(items);
  };

  const clearWishlist = async () => {
    return clearWishlistMutation.mutateAsync();
  };

  // Remove by wishlist item ID (when available)
  const removeById = async (wishlistItemId: string) => {
    // Find the item first to get productId
    const wishlist = queryClient.getQueryData(['wishlist', user?.id]) as Array<{
      id: string;
      productId: string;
      variantId?: string;
    }> | undefined;

    const item = wishlist?.find(w => w.id === wishlistItemId);
    if (!item) {
      throw new Error('Wishlist item not found');
    }

    return removeFromWishlistMutation.mutateAsync({
      productId: item.productId,
      variantId: item.variantId,
      wishlistItemId,
    });
  };

  // Check if item is in wishlist
  const isInWishlist = (productId: string, variantId?: string): boolean => {
    const wishlist = queryClient.getQueryData(['wishlist', user?.id]) as Array<{
      productId: string;
      variantId?: string;
    }> | undefined;

    return wishlist?.some(
      item => item.productId === productId && item.variantId === variantId
    ) ?? false;
  };

  return {
    // Primary actions
    removeFromWishlist: removeFromWishlistMutation.mutate,
    removeFromWishlistAsync: removeFromWishlistMutation.mutateAsync,
    
    // Helper functions
    quickRemove,
    removeMultiple,
    clearWishlist,
    removeById,
    isInWishlist,
    
    // State
    isRemoving: removeFromWishlistMutation.isPending,
    isRemovingMultiple: removeMultipleFromWishlistMutation.isPending,
    isClearing: clearWishlistMutation.isPending,
    error: removeFromWishlistMutation.error,
    
    // Status helpers
    isLoading: removeFromWishlistMutation.isPending || 
               removeMultipleFromWishlistMutation.isPending || 
               clearWishlistMutation.isPending,
    isSuccess: removeFromWishlistMutation.isSuccess,
    isError: removeFromWishlistMutation.isError,
    
    // Reset function
    reset: removeFromWishlistMutation.reset,
    
    // Mutation objects for advanced usage
    removeMutation: removeFromWishlistMutation,
    removeMultipleMutation: removeMultipleFromWishlistMutation,
    clearMutation: clearWishlistMutation,
  };
};

export default useRemoveFromWishlist;

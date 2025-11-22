import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface ToggleWishlistData {
  productId: string;
  variantId?: string;
  action?: 'add' | 'remove'; // Force specific action
}

export interface UseToggleWishlistOptions {
  onAdd?: (productId: string) => void;
  onRemove?: (productId: string) => void;
  onError?: (error: Error, productId: string, action: 'add' | 'remove') => void;
  showToasts?: boolean;
  confirmRemoval?: boolean;
}

export const useToggleWishlist = (options: UseToggleWishlistOptions = {}) => {
  const {
    onAdd,
    onRemove,
    onError,
    showToasts = true,
    confirmRemoval = false,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async (data: ToggleWishlistData): Promise<{
      action: 'add' | 'remove';
      productId: string;
      success: boolean;
      message: string;
    }> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to manage wishlist');
      }

      // Get current wishlist state
      const currentWishlist = queryClient.getQueryData(['wishlist', user.id]) as Array<{
        productId: string;
        variantId?: string;
        id: string;
      }> | undefined;

      // Determine current state
      const isCurrentlyInWishlist = currentWishlist?.some(
        item => item.productId === data.productId && item.variantId === data.variantId
      ) ?? false;

      // Determine action
      let action: 'add' | 'remove';
      if (data.action) {
        action = data.action;
      } else {
        action = isCurrentlyInWishlist ? 'remove' : 'add';
      }

      // Validate action
      if (action === 'add' && isCurrentlyInWishlist) {
        throw new Error('Product is already in your wishlist');
      }
      if (action === 'remove' && !isCurrentlyInWishlist) {
        throw new Error('Product is not in your wishlist');
      }

      // Confirm removal if required
      if (action === 'remove' && confirmRemoval && typeof window !== 'undefined') {
        const confirmed = window.confirm('Remove this item from your wishlist?');
        if (!confirmed) {
          throw new Error('Action cancelled by user');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));

      console.log(`${action === 'add' ? 'Adding' : 'Removing'} product ${data.productId} ${action === 'add' ? 'to' : 'from'} wishlist`);

      return {
        action,
        productId: data.productId,
        success: true,
        message: action === 'add' 
          ? 'Added to wishlist' 
          : 'Removed from wishlist',
      };
    },
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist', user?.id] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist', user?.id]);

      // Get current state
      const currentWishlist = (previousWishlist as Array<{
        productId: string;
        variantId?: string;
        id: string;
      }>) || [];

      const isCurrentlyInWishlist = currentWishlist.some(
        item => item.productId === data.productId && item.variantId === data.variantId
      );

      // Determine action
      const action = data.action || (isCurrentlyInWishlist ? 'remove' : 'add');

      // Optimistically update wishlist
      if (action === 'add') {
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

        queryClient.setQueryData(['wishlist', user?.id], [newItem, ...currentWishlist]);
      } else {
        // Remove item
        queryClient.setQueryData(['wishlist', user?.id], 
          currentWishlist.filter(item => 
            !(item.productId === data.productId && item.variantId === data.variantId)
          )
        );
      }

      // Return context
      return { previousWishlist, action };
    },
    onError: (error, variables, context) => {
      // Roll back the optimistic update
      queryClient.setQueryData(['wishlist', user?.id], context?.previousWishlist);

      // Don't show error for user cancellation
      if (error instanceof Error && error.message === 'Action cancelled by user') {
        return;
      }

      if (showToasts) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update wishlist',
          { duration: 4000, icon: '💔' }
        );
      }

      onError?.(
        error instanceof Error ? error : new Error('Failed to update wishlist'), 
        variables.productId, 
        context?.action || 'add'
      );
    },
    onSuccess: (result, variables) => {
      // Invalidate and refetch wishlist
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });

      // Also invalidate product queries to update wishlist status
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });

      // Show appropriate toast
      if (showToasts) {
        const icon = result.action === 'add' ? '❤️' : '💔';
        toast.success(result.message, { duration: 2000, icon });
      }

      // Call appropriate callback
      if (result.action === 'add') {
        onAdd?.(result.productId);
      } else {
        onRemove?.(result.productId);
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if user cancelled or already in correct state
      if (error instanceof Error && 
          (error.message.includes('cancelled by user') || 
           error.message.includes('already in') || 
           error.message.includes('not in your wishlist'))) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Batch toggle for multiple products
  const batchToggleMutation = useMutation({
    mutationFn: async (products: Array<{ productId: string; variantId?: string; action: 'add' | 'remove' }>): Promise<{
      success: number;
      failed: number;
      added: number;
      removed: number;
      errors: Array<{ productId: string; error: string }>;
    }> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to manage wishlist');
      }

      // Simulate batch API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      const results = {
        success: 0,
        failed: 0,
        added: 0,
        removed: 0,
        errors: [] as Array<{ productId: string; error: string }>,
      };

      // Process each product
      for (const product of products) {
        try {
          // Simulate individual processing
          if (Math.random() > 0.95) { // 5% failure rate
            throw new Error('Operation failed');
          }
          
          results.success++;
          if (product.action === 'add') {
            results.added++;
          } else {
            results.removed++;
          }
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

      if (showToasts) {
        if (results.added > 0) {
          toast.success(
            `${results.added} item${results.added > 1 ? 's' : ''} added to wishlist`,
            { duration: 2000, icon: '❤️' }
          );
        }
        
        if (results.removed > 0) {
          toast.success(
            `${results.removed} item${results.removed > 1 ? 's' : ''} removed from wishlist`,
            { duration: 2000, icon: '💔' }
          );
        }

        if (results.failed > 0) {
          toast.error(
            `${results.failed} operation${results.failed > 1 ? 's' : ''} failed`,
            { duration: 3000, icon: '⚠️' }
          );
        }
      }
    },
    onError: (error) => {
      if (showToasts) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update wishlist items',
          { duration: 4000 }
        );
      }
    },
  });

  // Helper functions
  const toggle = async (productId: string, variantId?: string) => {
    return toggleWishlistMutation.mutateAsync({ productId, variantId });
  };

  const forceAdd = async (productId: string, variantId?: string) => {
    return toggleWishlistMutation.mutateAsync({ 
      productId, 
      variantId, 
      action: 'add' 
    });
  };

  const forceRemove = async (productId: string, variantId?: string) => {
    return toggleWishlistMutation.mutateAsync({ 
      productId, 
      variantId, 
      action: 'remove' 
    });
  };

  const batchToggle = async (products: Array<{ productId: string; variantId?: string; action: 'add' | 'remove' }>) => {
    return batchToggleMutation.mutateAsync(products);
  };

  // Status helpers
  const isInWishlist = (productId: string, variantId?: string): boolean => {
    const wishlist = queryClient.getQueryData(['wishlist', user?.id]) as Array<{
      productId: string;
      variantId?: string;
    }> | undefined;

    return wishlist?.some(
      item => item.productId === productId && item.variantId === variantId
    ) ?? false;
  };

  const getWishlistStatus = (productId: string, variantId?: string) => {
    const inWishlist = isInWishlist(productId, variantId);
    return {
      inWishlist,
      nextAction: inWishlist ? 'remove' as const : 'add' as const,
      buttonText: inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist',
      icon: inWishlist ? '💔' : '❤️',
    };
  };

  return {
    // Primary actions
    toggle: toggleWishlistMutation.mutate,
    toggleAsync: toggleWishlistMutation.mutateAsync,
    
    // Helper functions
    quickToggle: toggle,
    forceAdd,
    forceRemove,
    batchToggle,
    
    // Status helpers
    isInWishlist,
    getWishlistStatus,
    
    // State
    isToggling: toggleWishlistMutation.isPending,
    isBatchToggling: batchToggleMutation.isPending,
    error: toggleWishlistMutation.error,
    lastResult: toggleWishlistMutation.data,
    
    // Status
    isLoading: toggleWishlistMutation.isPending || batchToggleMutation.isPending,
    isSuccess: toggleWishlistMutation.isSuccess,
    isError: toggleWishlistMutation.isError,
    
    // Reset
    reset: toggleWishlistMutation.reset,
    
    // Mutation objects
    toggleMutation: toggleWishlistMutation,
    batchMutation: batchToggleMutation,
  };
};

export default useToggleWishlist;

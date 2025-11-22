import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface RemoveFromCartData {
  itemId?: string;
  productId?: string;
  variantId?: string;
  removeAll?: boolean;
}

export interface RemoveFromCartOptions {
  showToast?: boolean;
  showConfirmation?: boolean;
  analytics?: boolean;
}

export interface RemoveFromCartResponse {
  success: boolean;
  removedItem?: {
    id: string;
    productName: string;
    quantity: number;
    price: number;
  };
  message: string;
  cartSummary: {
    itemCount: number;
    total: number;
  };
}

export interface UseRemoveFromCartOptions {
  enableAnalytics?: boolean;
  autoShowToast?: boolean;
  requireConfirmation?: boolean;
}

export const useRemoveFromCart = (options: UseRemoveFromCartOptions = {}) => {
  const {
    enableAnalytics = true,
    autoShowToast = true,
    requireConfirmation = false,
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async ({ 
      data, 
      options: removeOptions = {} 
    }: { 
      data: RemoveFromCartData; 
      options?: RemoveFromCartOptions 
    }): Promise<RemoveFromCartResponse> => {
      // Show confirmation if required
      if ((requireConfirmation || removeOptions.showConfirmation) && !data.removeAll) {
        const confirmed = window.confirm(
          'Are you sure you want to remove this item from your cart?'
        );
        if (!confirmed) {
          throw new Error('Removal cancelled by user');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      // Mock removed item data
      const removedItem = {
        id: data.itemId || `item_${Date.now()}`,
        productName: `Product ${Math.floor(Math.random() * 100)}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.floor(Math.random() * 5000) + 500,
      };

      // Track analytics
      if (enableAnalytics && removeOptions.analytics !== false) {
        console.log('Analytics: Item removed from cart', {
          itemId: data.itemId,
          productId: data.productId,
          variantId: data.variantId,
          userId: user?.id,
          timestamp: new Date(),
        });
      }

      return {
        success: true,
        removedItem,
        message: `${removedItem.productName} removed from cart`,
        cartSummary: {
          itemCount: Math.floor(Math.random() * 5),
          total: Math.floor(Math.random() * 10000) + 1000,
        },
      };
    },
    onSuccess: (response, { options: removeOptions = {} }) => {
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });

      // Show success toast
      if (autoShowToast && removeOptions.showToast !== false) {
        toast.success(response.message, {
          duration: 3000,
          icon: '🗑️',
        });
      }
    },
    onError: (error, { options: removeOptions = {} }) => {
      // Don't show error for user cancellation
      if (error instanceof Error && error.message === 'Removal cancelled by user') {
        return;
      }
      
      if (autoShowToast && removeOptions.showToast !== false) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to remove item from cart',
          { duration: 4000 }
        );
      }
    },
  });

  // Remove item by ID
  const removeById = useCallback(
    async (itemId: string, options: RemoveFromCartOptions = {}) => {
      return removeFromCartMutation.mutateAsync({
        data: { itemId },
        options,
      });
    },
    [removeFromCartMutation]
  );

  // Remove item by product ID and variant
  const removeByProduct = useCallback(
    async (
      productId: string, 
      variantId?: string, 
      options: RemoveFromCartOptions = {}
    ) => {
      return removeFromCartMutation.mutateAsync({
        data: { productId, variantId },
        options,
      });
    },
    [removeFromCartMutation]
  );

  // Remove all items of a product
  const removeAllOfProduct = useCallback(
    async (
      productId: string, 
      variantId?: string, 
      options: RemoveFromCartOptions = {}
    ) => {
      return removeFromCartMutation.mutateAsync({
        data: { productId, variantId, removeAll: true },
        options,
      });
    },
    [removeFromCartMutation]
  );

  // Remove with confirmation
  const removeWithConfirmation = useCallback(
    async (data: RemoveFromCartData, options: Omit<RemoveFromCartOptions, 'showConfirmation'> = {}) => {
      return removeFromCartMutation.mutateAsync({
        data,
        options: { ...options, showConfirmation: true },
      });
    },
    [removeFromCartMutation]
  );

  // Remove silently (no toast, no confirmation)
  const removeSilently = useCallback(
    async (data: RemoveFromCartData) => {
      return removeFromCartMutation.mutateAsync({
        data,
        options: { showToast: false, showConfirmation: false },
      });
    },
    [removeFromCartMutation]
  );

  // Bulk remove multiple items
  const bulkRemove = useCallback(
    async (items: RemoveFromCartData[], options: RemoveFromCartOptions = {}) => {
      const results: RemoveFromCartResponse[] = [];
      const errors: Error[] = [];

      for (const item of items) {
        try {
          const result = await removeFromCartMutation.mutateAsync({
            data: item,
            options: { ...options, showToast: false },
          });
          results.push(result);
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error('Unknown error'));
        }
      }

      // Show summary toast
      if (autoShowToast && options.showToast !== false) {
        if (results.length > 0) {
          toast.success(
            `${results.length} item${results.length > 1 ? 's' : ''} removed from cart`,
            { duration: 3000, icon: '🗑️' }
          );
        }
        
        if (errors.length > 0) {
          toast.error(
            `Failed to remove ${errors.length} item${errors.length > 1 ? 's' : ''}`,
            { duration: 4000 }
          );
        }
      }

      return { results, errors };
    },
    [removeFromCartMutation, autoShowToast]
  );

  // Check if item can be removed
  const canRemoveItem = useCallback(
    (itemId: string): boolean => {
      // Basic validation - item should exist in cart
      // This would typically check the actual cart state
      return Boolean(itemId);
    },
    []
  );

  // Get removal confirmation message
  const getRemovalConfirmMessage = useCallback(
    (productName?: string): string => {
      return productName
        ? `Are you sure you want to remove "${productName}" from your cart?`
        : 'Are you sure you want to remove this item from your cart?';
    },
    []
  );

  return {
    // Actions
    removeById,
    removeByProduct,
    removeAllOfProduct,
    removeWithConfirmation,
    removeSilently,
    bulkRemove,
    
    // Utilities
    canRemoveItem,
    getRemovalConfirmMessage,
    
    // State
    isRemoving: removeFromCartMutation.isPending,
    error: removeFromCartMutation.error,
    isError: removeFromCartMutation.isError,
    isSuccess: removeFromCartMutation.isSuccess,
    
    // Last operation result
    lastResult: removeFromCartMutation.data,
    
    // Reset mutation state
    reset: removeFromCartMutation.reset,
  };
};

export default useRemoveFromCart;

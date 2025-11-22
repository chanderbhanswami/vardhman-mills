import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface ClearCartOptions {
  showConfirmation?: boolean;
  showToast?: boolean;
  keepWishlist?: boolean;
  keepCoupons?: boolean;
  analytics?: boolean;
}

export interface ClearCartResponse {
  success: boolean;
  clearedItems: number;
  message: string;
  timestamp: Date;
}

export interface UseClearCartOptions {
  enableAnalytics?: boolean;
  autoConfirm?: boolean;
  preserveGuestCart?: boolean;
}

export const useClearCart = (options: UseClearCartOptions = {}) => {
  const {
    enableAnalytics = true,
    autoConfirm = false,
    preserveGuestCart = false,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async (clearOptions: ClearCartOptions = {}): Promise<ClearCartResponse> => {
      // Show confirmation dialog if required
      if (!autoConfirm && clearOptions.showConfirmation !== false) {
        const confirmed = window.confirm(
          'Are you sure you want to clear your cart? This action cannot be undone.'
        );
        if (!confirmed) {
          throw new Error('Cart clearing cancelled by user');
        }
      }

      // Get current cart to count items
      let itemCount = 0;
      try {
        if (isAuthenticated) {
          // Simulate API call to get current cart
          await new Promise(resolve => setTimeout(resolve, 300));
          itemCount = Math.floor(Math.random() * 10) + 1; // Mock item count
        } else {
          // Get from localStorage
          const localCart = localStorage.getItem('vardhman_cart');
          if (localCart) {
            const cart = JSON.parse(localCart);
            itemCount = cart.items?.length || 0;
          }
        }
      } catch (error) {
        console.error('Error getting cart items:', error);
      }

      // Perform the clear operation
      if (isAuthenticated && user?.id) {
        // Simulate API call for authenticated user
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Track analytics
        if (enableAnalytics && clearOptions.analytics !== false) {
          console.log('Analytics: Cart cleared', {
            userId: user.id,
            itemCount,
            timestamp: new Date(),
          });
        }
      } else {
        // Clear local storage for guest users
        if (!preserveGuestCart) {
          try {
            localStorage.removeItem('vardhman_cart');
          } catch (error) {
            console.error('Error clearing cart from localStorage:', error);
          }
        }
      }

      return {
        success: true,
        clearedItems: itemCount,
        message: `Successfully cleared ${itemCount} item${itemCount !== 1 ? 's' : ''} from cart`,
        timestamp: new Date(),
      };
    },
    onSuccess: (response, clearOptions = {}) => {
      // Invalidate all cart-related queries
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });
      
      // Clear specific cache data
      queryClient.setQueryData(['cart', user?.id], null);
      
      // Show success toast
      if (clearOptions.showToast !== false) {
        toast.success(response.message, {
          duration: 3000,
          icon: '🗑️',
        });
      }
    },
    onError: (error, clearOptions = {}) => {
      // Don't show error for user cancellation
      if (error instanceof Error && error.message === 'Cart clearing cancelled by user') {
        return;
      }
      
      if (clearOptions.showToast !== false) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to clear cart',
          { duration: 4000 }
        );
      }
    },
  });

  // Clear cart function
  const clearCart = useCallback(
    async (options: ClearCartOptions = {}) => {
      return clearCartMutation.mutateAsync(options);
    },
    [clearCartMutation]
  );

  // Clear cart without confirmation
  const clearCartSilently = useCallback(
    async (options: Omit<ClearCartOptions, 'showConfirmation'> = {}) => {
      return clearCartMutation.mutateAsync({
        ...options,
        showConfirmation: false,
      });
    },
    [clearCartMutation]
  );

  // Clear cart with confirmation
  const clearCartWithConfirmation = useCallback(
    async (options: Omit<ClearCartOptions, 'showConfirmation'> = {}) => {
      return clearCartMutation.mutateAsync({
        ...options,
        showConfirmation: true,
      });
    },
    [clearCartMutation]
  );

  // Clear cart and redirect
  const clearCartAndRedirect = useCallback(
    async (redirectUrl: string, options: ClearCartOptions = {}) => {
      try {
        await clearCart(options);
        // Redirect after successful clear
        window.location.href = redirectUrl;
      } catch (error) {
        // Handle error but don't redirect
        console.error('Failed to clear cart before redirect:', error);
      }
    },
    [clearCart]
  );

  // Emergency clear (for error recovery)
  const emergencyClear = useCallback(async () => {
    try {
      // Clear localStorage regardless of authentication status
      localStorage.removeItem('vardhman_cart');
      
      // Clear React Query cache
      queryClient.removeQueries({ queryKey: ['cart'] });
      
      // If authenticated, try to clear server-side cart
      if (isAuthenticated) {
        try {
          await clearCartSilently({ showToast: false });
        } catch {
          console.error('Failed to clear server cart during emergency clear');
        }
      }
      
      toast.success('Cart cleared successfully', { duration: 2000 });
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart', { duration: 3000 });
    }
  }, [queryClient, isAuthenticated, clearCartSilently]);

  // Check if cart can be cleared
  const canClearCart = useCallback(() => {
    // Can always clear if there's a cart, regardless of authentication
    return true;
  }, []);

  // Get clear confirmation message
  const getClearConfirmationMessage = useCallback(() => {
    return 'Are you sure you want to clear your cart? This action cannot be undone.';
  }, []);

  return {
    // Actions
    clearCart,
    clearCartSilently,
    clearCartWithConfirmation,
    clearCartAndRedirect,
    emergencyClear,
    
    // Utilities
    canClearCart,
    getClearConfirmationMessage,
    
    // State
    isClearing: clearCartMutation.isPending,
    error: clearCartMutation.error,
    isError: clearCartMutation.isError,
    isSuccess: clearCartMutation.isSuccess,
    
    // Last operation result
    lastResult: clearCartMutation.data,
    
    // Reset mutation state
    reset: clearCartMutation.reset,
  };
};

export default useClearCart;

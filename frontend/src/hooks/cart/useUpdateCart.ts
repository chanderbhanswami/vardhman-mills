import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface UpdateCartData {
  itemId?: string;
  productId?: string;
  variantId?: string;
  quantity?: number;
  customization?: Record<string, unknown>;
  giftWrap?: boolean;
  giftMessage?: string;
}

export interface UpdateCartOptions {
  showToast?: boolean;
  validateStock?: boolean;
  analytics?: boolean;
  replaceCustomization?: boolean;
}

export interface UpdateCartResponse {
  success: boolean;
  updatedItem: {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    subtotal: number;
    productName: string;
  };
  message: string;
  cartSummary: {
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    total: number;
  };
}

export interface UseUpdateCartOptions {
  enableAnalytics?: boolean;
  autoShowToast?: boolean;
  enableStockValidation?: boolean;
  maxQuantityPerItem?: number;
}

export const useUpdateCart = (options: UseUpdateCartOptions = {}) => {
  const {
    enableAnalytics = true,
    autoShowToast = true,
    enableStockValidation = true,
    maxQuantityPerItem = 10,
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Update cart mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ 
      data, 
      options: updateOptions = {} 
    }: { 
      data: UpdateCartData; 
      options?: UpdateCartOptions 
    }): Promise<UpdateCartResponse> => {
      // Validate quantity
      if (data.quantity !== undefined) {
        if (data.quantity < 0) {
          throw new Error('Quantity cannot be negative');
        }
        if (data.quantity > maxQuantityPerItem) {
          throw new Error(`Maximum quantity per item is ${maxQuantityPerItem}`);
        }
      }

      // Validate stock if required
      if (enableStockValidation || updateOptions.validateStock) {
        if (data.productId && data.quantity) {
          // Simulate stock check
          await new Promise(resolve => setTimeout(resolve, 300));
          const availableStock = Math.floor(Math.random() * 20) + 1;
          
          if (data.quantity > availableStock) {
            throw new Error(`Only ${availableStock} items available in stock`);
          }
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock updated item
      const price = Math.floor(Math.random() * 5000) + 500;
      const quantity = data.quantity || Math.floor(Math.random() * 3) + 1;
      
      const updatedItem = {
        id: data.itemId || `item_${Date.now()}`,
        productId: data.productId || `product_${Math.floor(Math.random() * 100)}`,
        variantId: data.variantId,
        quantity,
        price,
        subtotal: price * quantity,
        productName: `Product ${Math.floor(Math.random() * 100)}`,
      };

      // Track analytics
      if (enableAnalytics && updateOptions.analytics !== false) {
        console.log('Analytics: Cart item updated', {
          itemId: data.itemId,
          productId: data.productId,
          variantId: data.variantId,
          oldQuantity: 1, // Would be retrieved from current cart
          newQuantity: data.quantity,
          userId: user?.id,
          timestamp: new Date(),
        });
      }

      return {
        success: true,
        updatedItem,
        message: `${updatedItem.productName} updated in cart`,
        cartSummary: {
          itemCount: Math.floor(Math.random() * 5) + 1,
          totalQuantity: Math.floor(Math.random() * 10) + 1,
          subtotal: Math.floor(Math.random() * 10000) + 1000,
          total: Math.floor(Math.random() * 12000) + 1200,
        },
      };
    },
    onMutate: async ({ data }) => {
      // Optimistic update
      const queryKey = ['cart', user?.id];
      await queryClient.cancelQueries({ queryKey });
      
      const previousCart = queryClient.getQueryData(queryKey);
      
      // Update cache optimistically if quantity is being changed
      if (data.quantity !== undefined) {
        queryClient.setQueryData(queryKey, (old: unknown) => {
          if (!old || typeof old !== 'object' || !('items' in old)) return old;
          
          const cartData = old as { items: Array<{ id: string; productId: string; variantId?: string; price: number; quantity: number; subtotal: number }> };
          
          return {
            ...cartData,
            items: cartData.items.map((item) =>
              (data.itemId && item.id === data.itemId) ||
              (data.productId && item.productId === data.productId && item.variantId === data.variantId)
                ? { ...item, quantity: data.quantity!, subtotal: item.price * data.quantity! }
                : item
            ),
          };
        });
      }
      
      return { previousCart };
    },
    onSuccess: (response, { options: updateOptions = {} }) => {
      // Invalidate cart queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });

      // Show success toast
      if (autoShowToast && updateOptions.showToast !== false) {
        toast.success(response.message, {
          duration: 2000,
          icon: '✅',
        });
      }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', user?.id], context.previousCart);
      }
      
      const updateOptions = variables.options || {};
      
      if (autoShowToast && updateOptions.showToast !== false) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update cart item',
          { duration: 4000 }
        );
      }
    },
  });

  // Update quantity
  const updateQuantity = useCallback(
    async (
      itemIdentifier: { itemId?: string; productId?: string; variantId?: string },
      quantity: number,
      options: UpdateCartOptions = {}
    ) => {
      return updateCartMutation.mutateAsync({
        data: { ...itemIdentifier, quantity },
        options,
      });
    },
    [updateCartMutation]
  );

  // Increase quantity
  const increaseQuantity = useCallback(
    async (
      itemIdentifier: { itemId?: string; productId?: string; variantId?: string },
      incrementBy: number = 1,
      options: UpdateCartOptions = {}
    ) => {
      // Get current quantity (would normally come from cart state)
      const currentQuantity = 1; // Mock current quantity
      const newQuantity = currentQuantity + incrementBy;
      
      return updateQuantity(itemIdentifier, newQuantity, options);
    },
    [updateQuantity]
  );

  // Decrease quantity
  const decreaseQuantity = useCallback(
    async (
      itemIdentifier: { itemId?: string; productId?: string; variantId?: string },
      decrementBy: number = 1,
      options: UpdateCartOptions = {}
    ) => {
      // Get current quantity (would normally come from cart state)
      const currentQuantity = 2; // Mock current quantity
      const newQuantity = Math.max(1, currentQuantity - decrementBy);
      
      return updateQuantity(itemIdentifier, newQuantity, options);
    },
    [updateQuantity]
  );

  // Update customization
  const updateCustomization = useCallback(
    async (
      itemIdentifier: { itemId?: string; productId?: string; variantId?: string },
      customization: Record<string, unknown>,
      options: UpdateCartOptions = {}
    ) => {
      return updateCartMutation.mutateAsync({
        data: { ...itemIdentifier, customization },
        options: { ...options, replaceCustomization: true },
      });
    },
    [updateCartMutation]
  );

  // Update gift options
  const updateGiftOptions = useCallback(
    async (
      itemIdentifier: { itemId?: string; productId?: string; variantId?: string },
      giftOptions: { giftWrap?: boolean; giftMessage?: string },
      options: UpdateCartOptions = {}
    ) => {
      return updateCartMutation.mutateAsync({
        data: { ...itemIdentifier, ...giftOptions },
        options,
      });
    },
    [updateCartMutation]
  );

  // Bulk update multiple items
  const bulkUpdate = useCallback(
    async (updates: UpdateCartData[], options: UpdateCartOptions = {}) => {
      const results: UpdateCartResponse[] = [];
      const errors: Error[] = [];

      for (const update of updates) {
        try {
          const result = await updateCartMutation.mutateAsync({
            data: update,
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
            `${results.length} item${results.length > 1 ? 's' : ''} updated in cart`,
            { duration: 3000, icon: '✅' }
          );
        }
        
        if (errors.length > 0) {
          toast.error(
            `Failed to update ${errors.length} item${errors.length > 1 ? 's' : ''}`,
            { duration: 4000 }
          );
        }
      }

      return { results, errors };
    },
    [updateCartMutation, autoShowToast]
  );

  // Validate quantity
  const validateQuantity = useCallback(
    (quantity: number): { isValid: boolean; error?: string } => {
      if (quantity < 1) {
        return { isValid: false, error: 'Quantity must be at least 1' };
      }
      if (quantity > maxQuantityPerItem) {
        return { isValid: false, error: `Maximum quantity per item is ${maxQuantityPerItem}` };
      }
      return { isValid: true };
    },
    [maxQuantityPerItem]
  );

  // Check if item can be updated
  const canUpdateItem = useCallback(
    (itemId: string): boolean => {
      // Basic validation - item should exist in cart
      return Boolean(itemId);
    },
    []
  );

  return {
    // Actions
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    updateCustomization,
    updateGiftOptions,
    bulkUpdate,
    
    // Utilities
    validateQuantity,
    canUpdateItem,
    
    // State
    isUpdating: updateCartMutation.isPending,
    error: updateCartMutation.error,
    isError: updateCartMutation.isError,
    isSuccess: updateCartMutation.isSuccess,
    
    // Last operation result
    lastResult: updateCartMutation.data,
    
    // Reset mutation state
    reset: updateCartMutation.reset,
  };
};

export default useUpdateCart;

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    category: string;
    brand?: string;
    inStock: boolean;
    maxQuantity: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    attributes: Record<string, string>;
  };
  addedAt: Date;
  updatedAt: Date;
}

export interface AddToCartData {
  productId: string;
  variantId?: string;
  quantity: number;
  customization?: Record<string, unknown>;
  giftWrap?: boolean;
  giftMessage?: string;
}

export interface AddToCartOptions {
  showToast?: boolean;
  redirectToCart?: boolean;
  replaceQuantity?: boolean;
  validateStock?: boolean;
  analytics?: boolean;
}

export interface AddToCartState {
  isAdding: boolean;
  lastAddedItem: CartItem | null;
  addCount: number;
  recentlyAdded: CartItem[];
}

export interface UseAddToCartOptions {
  enableAnalytics?: boolean;
  maxRecentItems?: number;
  autoShowToast?: boolean;
  validateBeforeAdd?: boolean;
}

export const useAddToCart = (options: UseAddToCartOptions = {}) => {
  const {
    enableAnalytics = true,
    maxRecentItems = 5,
    autoShowToast = true,
    validateBeforeAdd = true,
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [addState, setAddState] = useState<AddToCartState>({
    isAdding: false,
    lastAddedItem: null,
    addCount: 0,
    recentlyAdded: [],
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ 
      data, 
      options: addOptions = {} 
    }: { 
      data: AddToCartData; 
      options?: AddToCartOptions 
    }) => {
      setAddState(prev => ({ ...prev, isAdding: true }));

      // Validate stock if required
      if (validateBeforeAdd || addOptions.validateStock) {
        const stockResponse = await fetch(`/api/products/${data.productId}/stock`);
        const stockData = await stockResponse.json();
        
        if (!stockData.inStock || stockData.quantity < data.quantity) {
          throw new Error('Insufficient stock available');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newCartItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        price: Math.floor(Math.random() * 5000) + 500,
        originalPrice: Math.floor(Math.random() * 6000) + 600,
        discount: Math.floor(Math.random() * 20) + 5,
        product: {
          id: data.productId,
          name: `Sample Product ${Math.floor(Math.random() * 100)}`,
          slug: `sample-product-${Math.floor(Math.random() * 100)}`,
          image: `/images/products/sample-${Math.floor(Math.random() * 10) + 1}.jpg`,
          category: 'Electronics',
          brand: 'Sample Brand',
          inStock: true,
          maxQuantity: 10,
          weight: Math.floor(Math.random() * 500) + 100,
          dimensions: {
            length: Math.floor(Math.random() * 30) + 10,
            width: Math.floor(Math.random() * 20) + 5,
            height: Math.floor(Math.random() * 15) + 3,
          },
        },
        variant: data.variantId ? {
          id: data.variantId,
          name: `Variant ${Math.floor(Math.random() * 5) + 1}`,
          sku: `SKU_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          attributes: {
            color: ['Red', 'Blue', 'Green', 'Black', 'White'][Math.floor(Math.random() * 5)],
            size: ['S', 'M', 'L', 'XL', 'XXL'][Math.floor(Math.random() * 5)],
          },
        } : undefined,
        addedAt: new Date(),
        updatedAt: new Date(),
      };

      // Track analytics
      if (enableAnalytics && addOptions.analytics !== false) {
        // Analytics tracking would go here
        console.log('Analytics: Product added to cart', {
          productId: data.productId,
          quantity: data.quantity,
          userId: user?.id,
        });
      }

      return newCartItem;
    },
    onSuccess: (newItem, { options: addOptions = {} }) => {
      // Update local state
      setAddState(prev => ({
        ...prev,
        isAdding: false,
        lastAddedItem: newItem,
        addCount: prev.addCount + 1,
        recentlyAdded: [
          newItem,
          ...prev.recentlyAdded.slice(0, maxRecentItems - 1),
        ],
      }));

      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });

      // Show success toast
      if (autoShowToast && addOptions.showToast !== false) {
        toast.success(
          `${newItem.product.name} added to cart${newItem.quantity > 1 ? ` (${newItem.quantity} items)` : ''}!`,
          {
            duration: 3000,
            icon: '🛒',
          }
        );
      }
    },
    onError: (error, { options: addOptions = {} }) => {
      setAddState(prev => ({ ...prev, isAdding: false }));
      
      if (autoShowToast && addOptions.showToast !== false) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to add item to cart',
          { duration: 4000 }
        );
      }
    },
  });

  // Quick add function
  const addToCart = useCallback(
    async (
      productId: string,
      quantity: number = 1,
      options: AddToCartOptions & { variantId?: string } = {}
    ) => {
      const { variantId, ...addOptions } = options;
      
      return addToCartMutation.mutateAsync({
        data: {
          productId,
          variantId,
          quantity,
        },
        options: addOptions,
      });
    },
    [addToCartMutation]
  );

  // Add with full data
  const addToCartWithData = useCallback(
    async (data: AddToCartData, options: AddToCartOptions = {}) => {
      return addToCartMutation.mutateAsync({ data, options });
    },
    [addToCartMutation]
  );

  // Bulk add to cart
  const bulkAddToCart = useCallback(
    async (items: AddToCartData[], options: AddToCartOptions = {}) => {
      const results: CartItem[] = [];
      const errors: Error[] = [];

      for (const item of items) {
        try {
          const result = await addToCartMutation.mutateAsync({
            data: item,
            options: { ...options, showToast: false },
          });
          results.push(result);
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error('Unknown error'));
        }
      }

      if (autoShowToast && options.showToast !== false) {
        if (results.length > 0) {
          toast.success(
            `${results.length} item${results.length > 1 ? 's' : ''} added to cart!`,
            { duration: 3000, icon: '🛒' }
          );
        }
        
        if (errors.length > 0) {
          toast.error(
            `Failed to add ${errors.length} item${errors.length > 1 ? 's' : ''} to cart`,
            { duration: 4000 }
          );
        }
      }

      return { results, errors };
    },
    [addToCartMutation, autoShowToast]
  );

  // Clear recent items
  const clearRecentItems = useCallback(() => {
    setAddState(prev => ({
      ...prev,
      recentlyAdded: [],
    }));
  }, []);

  // Check if product is in recent items
  const isRecentlyAdded = useCallback(
    (productId: string, variantId?: string): boolean => {
      return addState.recentlyAdded.some(
        item => item.productId === productId && item.variantId === variantId
      );
    },
    [addState.recentlyAdded]
  );

  // Get last added item of specific product
  const getLastAddedItem = useCallback(
    (productId: string, variantId?: string): CartItem | undefined => {
      return addState.recentlyAdded.find(
        item => item.productId === productId && item.variantId === variantId
      );
    },
    [addState.recentlyAdded]
  );

  return {
    // State
    isAdding: addState.isAdding,
    lastAddedItem: addState.lastAddedItem,
    addCount: addState.addCount,
    recentlyAdded: addState.recentlyAdded,
    
    // Actions
    addToCart,
    addToCartWithData,
    bulkAddToCart,
    clearRecentItems,
    
    // Utilities
    isRecentlyAdded,
    getLastAddedItem,
    
    // Mutation state
    error: addToCartMutation.error,
    isError: addToCartMutation.isError,
    isSuccess: addToCartMutation.isSuccess,
    isPending: addToCartMutation.isPending,
    reset: addToCartMutation.reset,
  };
};

export default useAddToCart;

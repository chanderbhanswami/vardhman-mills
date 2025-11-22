import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  subtotal: number;
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

export interface CartSummary {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  savings: number;
  currency: string;
  estimatedDelivery?: Date;
}

export interface CartCoupon {
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  description: string;
  appliedAmount: number;
  minOrderValue?: number;
  expiresAt?: Date;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  summary: CartSummary;
  coupons: CartCoupon[];
  shippingAddress?: {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface CartFilters {
  category?: string;
  brand?: string;
  inStockOnly?: boolean;
  priceRange?: { min: number; max: number };
}

export interface UseCartOptions {
  enableAutoSave?: boolean;
  enableSync?: boolean;
  autoLoad?: boolean;
  enableLocalStorage?: boolean;
  expirationDays?: number;
}

export const useCart = (options: UseCartOptions = {}) => {
  const {
    enableAutoSave = true,
    enableSync = true,
    autoLoad = true,
    enableLocalStorage = true,
    expirationDays = 30,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [filters, setFilters] = useState<CartFilters>({});
  const [localCart, setLocalCart] = useState<Cart | null>(null);

  // Cart query
  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async (): Promise<Cart> => {
      if (isAuthenticated && user?.id) {
        // TODO: Replace with real API call
        // For now, return empty cart or load from localStorage
        return getLocalCart();
      } else {
        // Return local cart for guest users
        return getLocalCart();
      }
    },
    enabled: autoLoad,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create empty cart
  const createEmptyCart = useCallback((): Cart => {
    return {
      id: `guest_cart_${Date.now()}`,
      items: [],
      summary: {
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        savings: 0,
        currency: 'INR',
      },
      coupons: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
    };
  }, [expirationDays]);

  // Get local cart from localStorage
  const getLocalCart = useCallback((): Cart => {
    if (!enableLocalStorage) {
      return createEmptyCart();
    }

    try {
      const stored = localStorage.getItem('vardhman_cart');
      if (stored) {
        const parsedCart = JSON.parse(stored);
        // Check if cart is expired
        if (parsedCart.expiresAt && new Date(parsedCart.expiresAt) < new Date()) {
          localStorage.removeItem('vardhman_cart');
          return createEmptyCart();
        }
        return parsedCart;
      }
    } catch (error) {
      console.error('Error parsing local cart:', error);
    }
    
    return createEmptyCart();
  }, [enableLocalStorage, createEmptyCart]);

  // Save to localStorage
  const saveToLocalStorage = useCallback((cartData: Cart) => {
    if (!enableLocalStorage) return;
    
    try {
      localStorage.setItem('vardhman_cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [enableLocalStorage]);

  // Sync cart mutation
  const syncCartMutation = useMutation({
    mutationFn: async (cartData: Cart) => {
      if (!isAuthenticated || !user?.id) {
        throw new Error('User not authenticated');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return cartData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (enableAutoSave) {
        toast.success('Cart synced successfully', { duration: 2000 });
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sync cart',
        { duration: 4000 }
      );
    },
  });

  // Get filtered items
  const filteredItems = useCallback(() => {
    const currentCart = cart || localCart;
    if (!currentCart) return [];

    return currentCart.items.filter(item => {
      if (filters.category && item.product.category !== filters.category) return false;
      if (filters.brand && item.product.brand !== filters.brand) return false;
      if (filters.inStockOnly && !item.product.inStock) return false;
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        if (item.price < min || item.price > max) return false;
      }
      return true;
    });
  }, [cart, localCart, filters]);

  // Get cart statistics
  const getCartStats = useCallback(() => {
    const currentCart = cart || localCart;
    if (!currentCart) return null;

    const items = filteredItems();
    const categories = Array.from(new Set(items.map(item => item.product.category)));
    const brands = Array.from(new Set(items.map(item => item.product.brand).filter(Boolean)));
    const outOfStockCount = items.filter(item => !item.product.inStock).length;
    
    return {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: items.reduce((sum, item) => sum + item.subtotal, 0),
      categories: categories.length,
      brands: brands.length,
      outOfStockItems: outOfStockCount,
      averageItemValue: items.length > 0 ? items.reduce((sum, item) => sum + item.subtotal, 0) / items.length : 0,
    };
  }, [filteredItems, cart, localCart]);

  // Check if item exists in cart
  const hasItem = useCallback(
    (productId: string, variantId?: string): boolean => {
      const currentCart = cart || localCart;
      if (!currentCart) return false;

      return currentCart.items.some(
        item => item.productId === productId && item.variantId === variantId
      );
    },
    [cart, localCart]
  );

  // Get item from cart
  const getItem = useCallback(
    (productId: string, variantId?: string): CartItem | undefined => {
      const currentCart = cart || localCart;
      if (!currentCart) return undefined;

      return currentCart.items.find(
        item => item.productId === productId && item.variantId === variantId
      );
    },
    [cart, localCart]
  );

  // Get item quantity
  const getItemQuantity = useCallback(
    (productId: string, variantId?: string): number => {
      const item = getItem(productId, variantId);
      return item?.quantity || 0;
    },
    [getItem]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      await syncCartMutation.mutateAsync(createEmptyCart());
    } else {
      const emptyCart = createEmptyCart();
      setLocalCart(emptyCart);
      saveToLocalStorage(emptyCart);
    }
  }, [isAuthenticated, user?.id, syncCartMutation, createEmptyCart, saveToLocalStorage]);

  // Refresh cart
  const refreshCart = useCallback(() => {
    if (isAuthenticated) {
      refetch();
    } else {
      setLocalCart(getLocalCart());
    }
  }, [isAuthenticated, refetch, getLocalCart]);

  // Apply filters
  const applyFilters = useCallback((newFilters: CartFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Sync with server if authenticated
  useEffect(() => {
    if (enableSync && isAuthenticated && localCart && localCart.items.length > 0) {
      syncCartMutation.mutate(localCart);
    }
  }, [enableSync, isAuthenticated, localCart, syncCartMutation]);

  // Load local cart on mount for guest users
  useEffect(() => {
    if (!isAuthenticated && !localCart) {
      setLocalCart(getLocalCart());
    }
  }, [isAuthenticated, localCart, getLocalCart]);

  return {
    // Data
    cart: cart || localCart,
    items: filteredItems(),
    summary: (cart || localCart)?.summary,
    coupons: (cart || localCart)?.coupons || [],
    
    // State
    isLoading,
    error,
    isEmpty: (cart || localCart)?.items.length === 0,
    itemCount: (cart || localCart)?.summary.itemCount || 0,
    totalQuantity: (cart || localCart)?.summary.totalQuantity || 0,
    
    // Filters
    filters,
    applyFilters,
    clearFilters,
    
    // Actions
    clearCart,
    refreshCart,
    
    // Utilities
    hasItem,
    getItem,
    getItemQuantity,
    getCartStats,
    
    // Sync
    syncCart: () => syncCartMutation.mutate(cart || localCart || createEmptyCart()),
    isSyncing: syncCartMutation.isPending,
  };
};

export default useCart;

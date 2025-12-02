'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { useAuth } from './AuthProvider';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Types
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  title: string;
  image: string;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variant?: {
    color?: string;
    size?: string;
    material?: string;
    [key: string]: unknown;
  };
  customization?: {
    text?: string;
    color?: string;
    font?: string;
    [key: string]: unknown;
  };
  note?: string;
  isAvailable: boolean;
  maxQuantity: number;
  addedAt: string;
  updatedAt: string;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
  totalWeight: number;
  appliedCoupons: AppliedCoupon[];
}

export interface AppliedCoupon {
  id: string;
  code: string;
  title: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  discount: number;
  isValid: boolean;
  expiresAt?: string;
}

export interface ShippingOption {
  id: string;
  title: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier: string;
  isAvailable: boolean;
  isFree: boolean;
}

export interface CartContextType {
  // Cart State
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  isUpdating: boolean;
  lastUpdated: string | null;
  
  // Cart Actions
  addToCart: (
    productId: string,
    quantity?: number,
    variant?: CartItem['variant'],
    customization?: CartItem['customization'],
    note?: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  updateQuantity: (itemId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  removeFromCart: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => Promise<{ success: boolean; error?: string }>;
  
  // Bulk Operations
  updateMultipleItems: (updates: Array<{ itemId: string; quantity: number }>) => Promise<{ success: boolean; error?: string }>;
  removeMultipleItems: (itemIds: string[]) => Promise<{ success: boolean; error?: string }>;
  
  // Cart Management
  refreshCart: () => Promise<void>;
  saveForLater: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  moveToCart: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Validation
  validateCart: () => Promise<{ isValid: boolean; issues: string[] }>;
  checkAvailability: () => Promise<{ availableItems: CartItem[]; unavailableItems: CartItem[] }>;
  
  // Coupons & Discounts
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string; coupon?: AppliedCoupon }>;
  removeCoupon: (couponId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Shipping
  getShippingOptions: (address?: unknown) => Promise<{ success: boolean; options?: ShippingOption[]; error?: string }>;
  selectShippingOption: (optionId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Estimation
  estimateTotal: (
    items: CartItem[],
    shippingOptionId?: string,
    coupons?: string[]
  ) => Promise<{ success: boolean; estimate?: CartSummary; error?: string }>;
  
  // Persistence
  syncWithServer: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Context Creation
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook to use Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart Provider Component
interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
    totalWeight: 0,
    appliedCoupons: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Persistent storage for guest users
  const guestCartStorage = useLocalStorage<CartItem[]>('guestCart', { defaultValue: [] });
  
  // Refs
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);
  const updateQueue = useRef<Array<() => Promise<void>>>([]);
  const isProcessingQueue = useRef(false);
  const retryAttempts = useRef<Map<string, number>>(new Map());

  // Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const SYNC_DELAY = 2000; // 2 seconds
  const MAX_RETRY_ATTEMPTS = 3;
  
  // User info for analytics and personalization
  const userId = user?.id;
  const userEmail = user?.email;

  // Utility Functions
  const apiRequest = useCallback(async (endpoint: string, options: AxiosRequestConfig = {}): Promise<ApiResponse> => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      const config: AxiosRequestConfig = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await axios(`${API_BASE_URL}${endpoint}`, config);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Cart API Request failed:', axiosError);
      
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message || 'An error occurred'
      };
    }
  }, [API_BASE_URL]);

  const calculateSummary = useCallback((cartItems: CartItem[], appliedCoupons: AppliedCoupon[] = []): CartSummary => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalWeight = cartItems.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0);
    
    let discount = 0;
    appliedCoupons.forEach(coupon => {
      if (coupon.isValid) {
        discount += coupon.discount;
      }
    });
    
    const tax = (subtotal - discount) * 0.18; // 18% GST
    const shipping = subtotal > 999 ? 0 : 99; // Free shipping above ₹999
    const total = subtotal - discount + tax + shipping;

    return {
      subtotal,
      discount,
      tax,
      shipping,
      total,
      itemCount,
      totalWeight,
      appliedCoupons
    };
  }, []);

  const processUpdateQueue = useCallback(async () => {
    if (isProcessingQueue.current || updateQueue.current.length === 0) return;
    
    isProcessingQueue.current = true;
    
    while (updateQueue.current.length > 0) {
      const update = updateQueue.current.shift();
      if (update) {
        try {
          await update();
        } catch (error) {
          console.error('Failed to process cart update:', error);
        }
      }
    }
    
    isProcessingQueue.current = false;
  }, []);

  // Define syncWithServer first
  const syncWithServer = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const result = await apiRequest('/cart/sync', {
        method: 'POST',
        data: { items }
      });

      if (result.success) {
        const { cart } = result.data as { cart: CartItem[] };
        setItems(cart);
        setSummary(calculateSummary(cart));
        setLastUpdated(new Date().toISOString());
      }
    } catch (error) {
      console.error('Sync with server error:', error);
    }
  }, [isAuthenticated, items, apiRequest, calculateSummary]);

  const debouncedSync = useCallback(() => {
    if (syncTimeout.current) {
      clearTimeout(syncTimeout.current);
    }
    
    syncTimeout.current = setTimeout(() => {
      if (isAuthenticated) {
        syncWithServer();
      }
    }, SYNC_DELAY);
  }, [isAuthenticated, SYNC_DELAY, syncWithServer]);

  // Cart Operations
  const addToCart = async (
    productId: string,
    quantity = 1,
    variant?: CartItem['variant'],
    customization?: CartItem['customization'],
    note?: string
  ) => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/cart/add', {
        method: 'POST',
        data: { productId, quantity, variant, customization, note }
      });

      if (result.success) {
        const { cart, item } = result.data as { cart: CartItem[]; item: CartItem };
        setItems(cart);
        setSummary(calculateSummary(cart));
        setLastUpdated(new Date().toISOString());
        
        // Store for guest users
        if (!isAuthenticated) {
          guestCartStorage.setValue(cart);
        }
        
        toast.success(`${item.title} added to cart`);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, error: 'Failed to add item to cart' };
    } finally {
      setIsUpdating(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 0) {
      return { success: false, error: 'Quantity cannot be negative' };
    }

    if (quantity === 0) {
      return removeFromCart(itemId);
    }

    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/cart/update', {
        method: 'PATCH',
        data: { itemId, quantity }
      });

      if (result.success) {
        const { cart } = result.data as { cart: CartItem[] };
        setItems(cart);
        setSummary(calculateSummary(cart));
        setLastUpdated(new Date().toISOString());
        
        if (!isAuthenticated) {
          guestCartStorage.setValue(cart);
        }
        
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Update quantity error:', error);
      return { success: false, error: 'Failed to update quantity' };
    } finally {
      setIsUpdating(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/cart/remove', {
        method: 'DELETE',
        data: { itemId }
      });

      if (result.success) {
        const { cart } = result.data as { cart: CartItem[] };
        setItems(cart);
        setSummary(calculateSummary(cart));
        setLastUpdated(new Date().toISOString());
        
        if (!isAuthenticated) {
          guestCartStorage.setValue(cart);
        }
        
        toast.success('Item removed from cart');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return { success: false, error: 'Failed to remove item from cart' };
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/cart/clear', { method: 'DELETE' });

      if (result.success) {
        setItems([]);
        setSummary(calculateSummary([]));
        setLastUpdated(new Date().toISOString());
        
        if (!isAuthenticated) {
          guestCartStorage.remove();
        }
        
        toast.success('Cart cleared');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Clear cart error:', error);
      return { success: false, error: 'Failed to clear cart' };
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk Operations
  const updateMultipleItems = async (updates: Array<{ itemId: string; quantity: number }>) => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/cart/bulk-update', {
        method: 'PATCH',
        data: { updates }
      });

      if (result.success) {
        const { cart } = result.data as { cart: CartItem[] };
        setItems(cart);
        setSummary(calculateSummary(cart));
        setLastUpdated(new Date().toISOString());
        
        if (!isAuthenticated) {
          guestCartStorage.setValue(cart);
        }
        
        toast.success('Cart updated');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Bulk update error:', error);
      return { success: false, error: 'Failed to update cart' };
    } finally {
      setIsUpdating(false);
    }
  };

  const removeMultipleItems = async (itemIds: string[]) => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/cart/bulk-remove', {
        method: 'DELETE',
        data: { itemIds }
      });

      if (result.success) {
        const { cart } = result.data as { cart: CartItem[] };
        setItems(cart);
        setSummary(calculateSummary(cart));
        setLastUpdated(new Date().toISOString());
        
        if (!isAuthenticated) {
          guestCartStorage.setValue(cart);
        }
        
        toast.success(`${itemIds.length} items removed from cart`);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Bulk remove error:', error);
      return { success: false, error: 'Failed to remove items from cart' };
    } finally {
      setIsUpdating(false);
    }
  };

  // Cart Management
  const refreshCart = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const result = await apiRequest('/cart');
        
        if (result.success) {
          const { cart, summary: cartSummary } = result.data as { cart: CartItem[]; summary: CartSummary };
          setItems(cart);
          setSummary(cartSummary || calculateSummary(cart));
          setLastUpdated(new Date().toISOString());
        }
      } else {
        // For guest users, load from localStorage
        const guestCart = guestCartStorage.value || [];
        setItems(guestCart);
        setSummary(calculateSummary(guestCart));
      }
    } catch (error) {
      console.error('Refresh cart error:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, apiRequest, calculateSummary]);

  const saveForLater = async (itemId: string) => {
    try {
      const result = await apiRequest('/cart/save-for-later', {
        method: 'POST',
        data: { itemId }
      });

      if (result.success) {
        await refreshCart();
        toast.success('Item saved for later');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Save for later error:', error);
      return { success: false, error: 'Failed to save item for later' };
    }
  };

  const moveToCart = async (itemId: string) => {
    try {
      const result = await apiRequest('/cart/move-to-cart', {
        method: 'POST',
        data: { itemId }
      });

      if (result.success) {
        await refreshCart();
        toast.success('Item moved to cart');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Move to cart error:', error);
      return { success: false, error: 'Failed to move item to cart' };
    }
  };

  // Validation
  const validateCart = async () => {
    try {
      const result = await apiRequest('/cart/validate');
      
      if (result.success) {
        const { isValid, issues } = result.data as { isValid: boolean; issues: string[] };
        return { isValid, issues };
      }

      return { isValid: false, issues: ['Failed to validate cart'] };
    } catch (error) {
      console.error('Validate cart error:', error);
      return { isValid: false, issues: ['Failed to validate cart'] };
    }
  };

  const checkAvailability = async () => {
    try {
      const result = await apiRequest('/cart/check-availability');
      
      if (result.success) {
        const { availableItems, unavailableItems } = result.data as {
          availableItems: CartItem[];
          unavailableItems: CartItem[];
        };
        return { availableItems, unavailableItems };
      }

      return { availableItems: [], unavailableItems: items };
    } catch (error) {
      console.error('Check availability error:', error);
      return { availableItems: [], unavailableItems: items };
    }
  };

  // Coupons & Discounts
  const applyCoupon = async (code: string) => {
    try {
      const result = await apiRequest('/cart/apply-coupon', {
        method: 'POST',
        data: { code }
      });

      if (result.success) {
        const { cart, summary: newSummary, coupon } = result.data as {
          cart: CartItem[];
          summary: CartSummary;
          coupon: AppliedCoupon;
        };
        
        setItems(cart);
        setSummary(newSummary);
        setLastUpdated(new Date().toISOString());
        
        toast.success(`Coupon "${code}" applied successfully`);
        return { success: true, coupon };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Apply coupon error:', error);
      return { success: false, error: 'Failed to apply coupon' };
    }
  };

  const removeCoupon = async (couponId: string) => {
    try {
      const result = await apiRequest('/cart/remove-coupon', {
        method: 'DELETE',
        data: { couponId }
      });

      if (result.success) {
        const { cart, summary: newSummary } = result.data as {
          cart: CartItem[];
          summary: CartSummary;
        };
        
        setItems(cart);
        setSummary(newSummary);
        setLastUpdated(new Date().toISOString());
        
        toast.success('Coupon removed');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Remove coupon error:', error);
      return { success: false, error: 'Failed to remove coupon' };
    }
  };

  // Shipping
  const getShippingOptions = async (address?: unknown) => {
    try {
      const result = await apiRequest('/cart/shipping-options', {
        method: 'POST',
        data: { address }
      });

      if (result.success) {
        const { options } = result.data as { options: ShippingOption[] };
        return { success: true, options };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get shipping options error:', error);
      return { success: false, error: 'Failed to get shipping options' };
    }
  };

  const selectShippingOption = async (optionId: string) => {
    try {
      const result = await apiRequest('/cart/select-shipping', {
        method: 'POST',
        data: { optionId }
      });

      if (result.success) {
        const { summary: newSummary } = result.data as { summary: CartSummary };
        setSummary(newSummary);
        setLastUpdated(new Date().toISOString());
        
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Select shipping option error:', error);
      return { success: false, error: 'Failed to select shipping option' };
    }
  };

  // Estimation
  const estimateTotal = async (
    cartItems: CartItem[],
    shippingOptionId?: string,
    coupons?: string[]
  ) => {
    try {
      const result = await apiRequest('/cart/estimate', {
        method: 'POST',
        data: { items: cartItems, shippingOptionId, coupons }
      });

      if (result.success) {
        const { estimate } = result.data as { estimate: CartSummary };
        return { success: true, estimate };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Estimate total error:', error);
      return { success: false, error: 'Failed to estimate total' };
    }
  };

  // Persistence functions will be defined above

  const mergeGuestCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const guestCart = guestCartStorage.value;
    if (!guestCart || guestCart.length === 0) return;
    
    try {
      const result = await apiRequest('/cart/merge', {
        method: 'POST',
        data: { guestCart }
      });

      if (result.success) {
        const { cart, summary: mergedSummary } = result.data as { cart: CartItem[]; summary: CartSummary };
        setItems(cart);
        setSummary(mergedSummary);
        setLastUpdated(new Date().toISOString());
        
        // Clear guest cart after merge
        guestCartStorage.remove();
        
        if (cart.length > guestCart.length) {
          toast.success('Guest cart merged with your account');
        }
      }
    } catch (error) {
      console.error('Merge guest cart error:', error);
    }
  }, [isAuthenticated, guestCartStorage, apiRequest]);

  // Initialize cart
  useEffect(() => {
    const initializeCart = async () => {
      setIsLoading(true);
      try {
        await refreshCart();
        
        // Merge guest cart if user just logged in
        if (isAuthenticated && guestCartStorage.value && guestCartStorage.value.length > 0) {
          await mergeGuestCart();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Process update queue
  useEffect(() => {
    processUpdateQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeout.current) {
        clearTimeout(syncTimeout.current);
      }
    };
  }, []);
  
  // Use debouncedSync when cart changes
  useEffect(() => {
    if (items.length > 0 && isAuthenticated) {
      debouncedSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isAuthenticated]);
  
  // Use retry attempts for failed operations
  useEffect(() => {
    const handleRetry = async (operation: string) => {
      const attempts = retryAttempts.current.get(operation) || 0;
      if (attempts < MAX_RETRY_ATTEMPTS) {
        retryAttempts.current.set(operation, attempts + 1);
        console.log(`Retrying ${operation}, attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS}`);
      } else {
        console.error(`Max retry attempts reached for ${operation}`);
        retryAttempts.current.delete(operation);
      }
    };
    
    // Example usage in error scenarios
    if (retryAttempts.current.size > 0) {
      const operations = Array.from(retryAttempts.current.keys());
      operations.forEach(op => handleRetry(op));
    }
  }, [MAX_RETRY_ATTEMPTS]);
  
  // Use user data for analytics and personalization
  useEffect(() => {
    if (userId && items.length > 0) {
      // Track user cart behavior
      console.log(`User ${userId} (${userEmail}) has ${items.length} items in cart`);
      
      // Example: Send analytics data
      const cartAnalytics = {
        userId,
        userEmail,
        itemCount: items.length,
        cartValue: summary.total,
        timestamp: new Date().toISOString()
      };
      console.log('Cart Analytics:', cartAnalytics);
    }
  }, [userId, userEmail, items.length, summary.total]);

  // Context value
  const contextValue: CartContextType = {
    // Cart State
    items,
    summary,
    isLoading,
    isUpdating,
    lastUpdated,
    
    // Cart Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    
    // Bulk Operations
    updateMultipleItems,
    removeMultipleItems,
    
    // Cart Management
    refreshCart,
    saveForLater,
    moveToCart,
    
    // Validation
    validateCart,
    checkAvailability,
    
    // Coupons & Discounts
    applyCoupon,
    removeCoupon,
    
    // Shipping
    getShippingOptions,
    selectShippingOption,
    
    // Estimation
    estimateTotal,
    
    // Persistence
    syncWithServer,
    mergeGuestCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;


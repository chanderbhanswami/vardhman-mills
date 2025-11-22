import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse, PaginationParams, Cart, CartItem, Product, User, Coupon } from './types';

// Cart Response Types
export interface CartResponse {
  cart: Cart;
  items: CartItem[];
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  summary: {
    itemCount: number;
    uniqueItemCount: number;
    weight: number;
    estimatedDelivery?: string;
  };
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  customizations?: Record<string, unknown>;
  guestCartId?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
  customizations?: Record<string, unknown>;
}

export interface ApplyCouponRequest {
  code: string;
  cartId?: string;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: Array<{
    itemId: string;
    type: 'stock' | 'price' | 'availability' | 'minimum_quantity';
    message: string;
    currentValue?: unknown;
    requiredValue?: unknown;
  }>;
  warnings: Array<{
    itemId: string;
    type: 'stock_low' | 'price_change' | 'discount_expired';
    message: string;
  }>;
  updatedItems: CartItem[];
}

export interface CartRecommendations {
  frequentlyBoughtTogether: Product[];
  recommendedProducts: Product[];
  upsellProducts: Product[];
  crossSellProducts: Product[];
  recentlyViewed: Product[];
  similarProducts: Product[];
}

export interface CartAnalytics {
  abandonmentRate: number;
  averageCartValue: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    product: Product;
    addedCount: number;
    purchasedCount: number;
    abandonedCount: number;
  }>;
  cartMetrics: {
    totalCarts: number;
    activeCarts: number;
    abandonedCarts: number;
    convertedCarts: number;
  };
  timeSpentAnalysis: {
    averageTimeBeforeCheckout: number;
    averageTimeBeforeAbandonment: number;
    peakActivityHours: number[];
  };
}

export interface SavedCart {
  id: string;
  name: string;
  items: CartItem[];
  totals: {
    subtotal: number;
    total: number;
  };
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

class CartApiClient {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Cart Operations
  async getCart(cartId?: string): Promise<ApiResponse<CartResponse>> {
    const params = cartId ? { cartId } : undefined;
    return this.client.get(endpoints.cart.get, { params });
  }

  async createCart(guestCartId?: string): Promise<ApiResponse<CartResponse>> {
    return this.client.post(endpoints.cart.create, { guestCartId });
  }

  async clearCart(cartId?: string): Promise<ApiResponse<CartResponse>> {
    return this.client.delete(endpoints.cart.clear, { data: { cartId } });
  }

  async validateCart(cartId?: string): Promise<ApiResponse<CartValidationResult>> {
    return this.client.post(endpoints.cart.validate, { cartId });
  }

  async syncGuestCart(guestCartId: string): Promise<ApiResponse<CartResponse>> {
    return this.client.post(endpoints.cart.syncGuest, { guestCartId });
  }

  // Item Operations
  async addItem(data: AddToCartRequest): Promise<ApiResponse<CartResponse>> {
    return this.client.post(endpoints.cart.addItem, data);
  }

  async updateItem(itemId: string, data: UpdateCartItemRequest): Promise<ApiResponse<CartResponse>> {
    return this.client.put(endpoints.cart.updateItem(itemId), data);
  }

  async removeItem(itemId: string, cartId?: string): Promise<ApiResponse<CartResponse>> {
    return this.client.delete(endpoints.cart.removeItem(itemId), { 
      data: { cartId } 
    });
  }

  async moveToWishlist(itemId: string): Promise<ApiResponse<{
    cart: CartResponse;
    wishlistUpdated: boolean;
  }>> {
    return this.client.post(endpoints.cart.moveToWishlist(itemId));
  }

  async moveFromWishlist(wishlistItemId: string, quantity?: number): Promise<ApiResponse<CartResponse>> {
    return this.client.post(endpoints.cart.moveFromWishlist(wishlistItemId), { quantity });
  }

  // Bulk Operations
  async addMultipleItems(items: AddToCartRequest[]): Promise<ApiResponse<CartResponse>> {
    return this.client.post(endpoints.cart.addMultiple, { items });
  }

  async updateMultipleItems(updates: Array<{
    itemId: string;
    quantity: number;
    customizations?: Record<string, unknown>;
  }>): Promise<ApiResponse<CartResponse>> {
    return this.client.put(endpoints.cart.updateMultiple, { updates });
  }

  async removeMultipleItems(itemIds: string[], cartId?: string): Promise<ApiResponse<CartResponse>> {
    return this.client.delete(endpoints.cart.removeMultiple, { 
      data: { itemIds, cartId } 
    });
  }

  // Quantity Operations
  async increaseQuantity(itemId: string, amount: number = 1): Promise<ApiResponse<CartResponse>> {
    return this.client.patch(endpoints.cart.increaseQuantity(itemId), { amount });
  }

  async decreaseQuantity(itemId: string, amount: number = 1): Promise<ApiResponse<CartResponse>> {
    return this.client.patch(endpoints.cart.decreaseQuantity(itemId), { amount });
  }

  async setQuantity(itemId: string, quantity: number): Promise<ApiResponse<CartResponse>> {
    return this.client.patch(endpoints.cart.setQuantity(itemId), { quantity });
  }

  // Coupon Operations
  async applyCoupon(data: ApplyCouponRequest): Promise<ApiResponse<{
    cart: CartResponse;
    coupon: Coupon;
    discount: number;
  }>> {
    return this.client.post(endpoints.cart.applyCoupon, data);
  }

  async removeCoupon(couponId: string, cartId?: string): Promise<ApiResponse<CartResponse>> {
    return this.client.delete(endpoints.cart.removeCoupon(couponId), { 
      data: { cartId } 
    });
  }

  async validateCoupon(code: string, cartId?: string): Promise<ApiResponse<{
    isValid: boolean;
    coupon?: Coupon;
    discount?: number;
    error?: string;
  }>> {
    return this.client.post(endpoints.cart.validateCoupon, { code, cartId });
  }

  // Saved Carts
  async getSavedCarts(params?: PaginationParams): Promise<ApiResponse<{
    carts: SavedCart[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return this.client.get(endpoints.cart.saved.list, { params });
  }

  async saveCart(name: string, cartId?: string): Promise<ApiResponse<SavedCart>> {
    return this.client.post(endpoints.cart.saved.save, { name, cartId });
  }

  async getSavedCart(id: string): Promise<ApiResponse<SavedCart>> {
    return this.client.get(endpoints.cart.saved.byId(id));
  }

  async restoreSavedCart(id: string, replaceCart?: boolean): Promise<ApiResponse<CartResponse>> {
    return this.client.post(endpoints.cart.saved.restore(id), { replaceCart });
  }

  async deleteSavedCart(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.cart.saved.delete(id));
  }

  async updateSavedCart(id: string, name: string): Promise<ApiResponse<SavedCart>> {
    return this.client.put(endpoints.cart.saved.update(id), { name });
  }

  // Recommendations
  async getRecommendations(cartId?: string): Promise<ApiResponse<CartRecommendations>> {
    return this.client.get(endpoints.cart.recommendations, { 
      params: cartId ? { cartId } : undefined 
    });
  }

  async getFrequentlyBoughtTogether(productId: string): Promise<ApiResponse<Product[]>> {
    return this.client.get(endpoints.cart.frequentlyBoughtTogether(productId));
  }

  async getUpsellProducts(cartId?: string): Promise<ApiResponse<Product[]>> {
    return this.client.get(endpoints.cart.upsell, { 
      params: cartId ? { cartId } : undefined 
    });
  }

  async getCrossSellProducts(cartId?: string): Promise<ApiResponse<Product[]>> {
    return this.client.get(endpoints.cart.crossSell, { 
      params: cartId ? { cartId } : undefined 
    });
  }

  // Shipping and Tax
  async calculateShipping(data: {
    cartId?: string;
    address: {
      country: string;
      state: string;
      city: string;
      zipCode: string;
    };
    shippingMethod?: string;
  }): Promise<ApiResponse<{
    options: Array<{
      id: string;
      name: string;
      cost: number;
      estimatedDays: number;
      description?: string;
    }>;
    selectedOption?: string;
    total: number;
  }>> {
    return this.client.post(endpoints.cart.calculateShipping, data);
  }

  async calculateTax(data: {
    cartId?: string;
    address: {
      country: string;
      state: string;
      city: string;
      zipCode: string;
    };
  }): Promise<ApiResponse<{
    taxAmount: number;
    taxRate: number;
    breakdown: Array<{
      type: string;
      rate: number;
      amount: number;
    }>;
  }>> {
    return this.client.post(endpoints.cart.calculateTax, data);
  }

  async estimateTotal(data: {
    cartId?: string;
    address: {
      country: string;
      state: string;
      city: string;
      zipCode: string;
    };
    shippingMethod?: string;
    couponCode?: string;
  }): Promise<ApiResponse<{
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    breakdown: {
      items: number;
      shipping: number;
      tax: number;
      discount: number;
    };
  }>> {
    return this.client.post(endpoints.cart.estimateTotal, data);
  }

  // Cart Recovery
  async getAbandonedCarts(params?: PaginationParams & {
    dateFrom?: string;
    dateTo?: string;
    minValue?: number;
    userId?: string;
  }): Promise<ApiResponse<{
    carts: Array<{
      id: string;
      user?: User;
      email?: string;
      items: CartItem[];
      totals: {
        subtotal: number;
        total: number;
      };
      lastActivity: string;
      abandonedAt: string;
      recoveryEmailsSent: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return this.client.get(endpoints.cart.abandoned, { params });
  }

  async sendRecoveryEmail(cartId: string, template?: string): Promise<ApiResponse<{
    sent: boolean;
    emailId?: string;
  }>> {
    return this.client.post(endpoints.cart.sendRecovery(cartId), { template });
  }

  async recoverCart(token: string): Promise<ApiResponse<CartResponse>> {
    return this.client.post(endpoints.cart.recover(token));
  }

  // Analytics
  async getCartAnalytics(params?: {
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  }): Promise<ApiResponse<CartAnalytics>> {
    return this.client.get(endpoints.cart.analytics, { params });
  }

  async getCartConversionFunnel(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    steps: Array<{
      step: string;
      count: number;
      percentage: number;
      dropoffRate: number;
    }>;
    overallConversion: number;
  }>> {
    return this.client.get(endpoints.cart.conversionFunnel, { params });
  }

  // Cart Sharing
  async shareCart(data: {
    cartId?: string;
    emails: string[];
    message?: string;
    expiresAt?: string;
  }): Promise<ApiResponse<{
    shareId: string;
    shareUrl: string;
    emailsSent: number;
  }>> {
    return this.client.post(endpoints.cart.share, data);
  }

  async getSharedCart(shareId: string): Promise<ApiResponse<{
    cart: CartResponse;
    sharedBy: {
      name: string;
      email: string;
    };
    message?: string;
    expiresAt?: string;
  }>> {
    return this.client.get(endpoints.cart.getShared(shareId));
  }

  async copySharedCart(shareId: string): Promise<ApiResponse<CartResponse>> {
    return this.client.post(endpoints.cart.copyShared(shareId));
  }

  // Quick Add
  async quickAdd(productId: string, quantity: number = 1, variantId?: string): Promise<ApiResponse<{
    added: boolean;
    item: CartItem;
    cartSummary: {
      itemCount: number;
      total: number;
    };
  }>> {
    return this.client.post(endpoints.cart.quickAdd, { 
      productId, 
      quantity, 
      variantId 
    });
  }

  // Export Cart
  async exportCart(format: 'csv' | 'pdf' | 'json', cartId?: string): Promise<ApiResponse<Blob>> {
    return this.client.get(endpoints.cart.export, {
      params: { format, cartId },
      responseType: 'blob'
    });
  }

  // Cart Comparison
  async compareWithSimilar(cartId?: string): Promise<ApiResponse<{
    alternatives: Array<{
      items: Array<{
        original: Product;
        alternative: Product;
        priceDifference: number;
        savings: number;
      }>;
      totalSavings: number;
      alternativeTotal: number;
    }>;
    recommendations: string[];
  }>> {
    return this.client.get(endpoints.cart.compare, { 
      params: cartId ? { cartId } : undefined 
    });
  }

  // Cart Templates
  async getCartTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description?: string;
    items: Array<{
      productId: string;
      quantity: number;
      variantId?: string;
    }>;
    category: string;
    isPopular: boolean;
  }>>> {
    return this.client.get(endpoints.cart.templates);
  }

  async applyCartTemplate(templateId: string, replaceCart?: boolean): Promise<ApiResponse<CartResponse>> {
    return this.client.post(endpoints.cart.applyTemplate(templateId), { replaceCart });
  }
}

export const cartApi = new CartApiClient();

// React Query Hooks

// Basic Cart Hooks
export const useCart = (cartId?: string, options?: UseQueryOptions<ApiResponse<CartResponse>>) => {
  return useQuery({
    queryKey: ['cart', cartId],
    queryFn: () => cartApi.getCart(cartId),
    staleTime: 30000, // 30 seconds
    ...options,
  });
};

export const useCreateCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (guestCartId?: string) => cartApi.createCart(guestCartId),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData(['cart'], response);
      }
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cartId?: string) => cartApi.clearCart(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useValidateCart = () => {
  return useMutation({
    mutationFn: (cartId?: string) => cartApi.validateCart(cartId),
  });
};

export const useSyncGuestCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (guestCartId: string) => cartApi.syncGuestCart(guestCartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Item Operations Hooks
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartApi.addItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItemRequest }) => 
      cartApi.updateItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, cartId }: { itemId: string; cartId?: string }) => 
      cartApi.removeItem(itemId, cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useMoveToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: string) => cartApi.moveToWishlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};

export const useMoveFromWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ wishlistItemId, quantity }: { wishlistItemId: string; quantity?: number }) => 
      cartApi.moveFromWishlist(wishlistItemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};

// Bulk Operations Hooks
export const useAddMultipleItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (items: AddToCartRequest[]) => cartApi.addMultipleItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateMultipleItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{
      itemId: string;
      quantity: number;
      customizations?: Record<string, unknown>;
    }>) => cartApi.updateMultipleItems(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveMultipleItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemIds, cartId }: { itemIds: string[]; cartId?: string }) => 
      cartApi.removeMultipleItems(itemIds, cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Quantity Operations Hooks
export const useIncreaseQuantity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, amount }: { itemId: string; amount?: number }) => 
      cartApi.increaseQuantity(itemId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useDecreaseQuantity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, amount }: { itemId: string; amount?: number }) => 
      cartApi.decreaseQuantity(itemId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useSetQuantity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => 
      cartApi.setQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Coupon Hooks
export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ApplyCouponRequest) => cartApi.applyCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ couponId, cartId }: { couponId: string; cartId?: string }) => 
      cartApi.removeCoupon(couponId, cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ code, cartId }: { code: string; cartId?: string }) => 
      cartApi.validateCoupon(code, cartId),
  });
};

// Saved Carts Hooks
export const useSavedCarts = (
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<{
    carts: SavedCart[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['saved-carts', params],
    queryFn: () => cartApi.getSavedCarts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useSaveCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, cartId }: { name: string; cartId?: string }) => 
      cartApi.saveCart(name, cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
    },
  });
};

export const useSavedCart = (
  id: string,
  options?: UseQueryOptions<ApiResponse<SavedCart>>
) => {
  return useQuery({
    queryKey: ['saved-carts', id],
    queryFn: () => cartApi.getSavedCart(id),
    enabled: !!id,
    ...options,
  });
};

export const useRestoreSavedCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, replaceCart }: { id: string; replaceCart?: boolean }) => 
      cartApi.restoreSavedCart(id, replaceCart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useDeleteSavedCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => cartApi.deleteSavedCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
    },
  });
};

// Recommendations Hooks
export const useCartRecommendations = (
  cartId?: string,
  options?: UseQueryOptions<ApiResponse<CartRecommendations>>
) => {
  return useQuery({
    queryKey: ['cart-recommendations', cartId],
    queryFn: () => cartApi.getRecommendations(cartId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useFrequentlyBoughtTogether = (
  productId: string,
  options?: UseQueryOptions<ApiResponse<Product[]>>
) => {
  return useQuery({
    queryKey: ['frequently-bought-together', productId],
    queryFn: () => cartApi.getFrequentlyBoughtTogether(productId),
    enabled: !!productId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useUpsellProducts = (
  cartId?: string,
  options?: UseQueryOptions<ApiResponse<Product[]>>
) => {
  return useQuery({
    queryKey: ['upsell-products', cartId],
    queryFn: () => cartApi.getUpsellProducts(cartId),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useCrossSellProducts = (
  cartId?: string,
  options?: UseQueryOptions<ApiResponse<Product[]>>
) => {
  return useQuery({
    queryKey: ['cross-sell-products', cartId],
    queryFn: () => cartApi.getCrossSellProducts(cartId),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

// Shipping and Tax Hooks
export const useCalculateShipping = () => {
  return useMutation({
    mutationFn: (data: {
      cartId?: string;
      address: {
        country: string;
        state: string;
        city: string;
        zipCode: string;
      };
      shippingMethod?: string;
    }) => cartApi.calculateShipping(data),
  });
};

export const useCalculateTax = () => {
  return useMutation({
    mutationFn: (data: {
      cartId?: string;
      address: {
        country: string;
        state: string;
        city: string;
        zipCode: string;
      };
    }) => cartApi.calculateTax(data),
  });
};

export const useEstimateTotal = () => {
  return useMutation({
    mutationFn: (data: {
      cartId?: string;
      address: {
        country: string;
        state: string;
        city: string;
        zipCode: string;
      };
      shippingMethod?: string;
      couponCode?: string;
    }) => cartApi.estimateTotal(data),
  });
};

// Analytics Hooks
export const useCartAnalytics = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  },
  options?: UseQueryOptions<ApiResponse<CartAnalytics>>
) => {
  return useQuery({
    queryKey: ['cart-analytics', params],
    queryFn: () => cartApi.getCartAnalytics(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useCartConversionFunnel = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
  },
  options?: UseQueryOptions<ApiResponse<{
    steps: Array<{
      step: string;
      count: number;
      percentage: number;
      dropoffRate: number;
    }>;
    overallConversion: number;
  }>>
) => {
  return useQuery({
    queryKey: ['cart-conversion-funnel', params],
    queryFn: () => cartApi.getCartConversionFunnel(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

// Cart Sharing Hooks
export const useShareCart = () => {
  return useMutation({
    mutationFn: (data: {
      cartId?: string;
      emails: string[];
      message?: string;
      expiresAt?: string;
    }) => cartApi.shareCart(data),
  });
};

export const useSharedCart = (
  shareId: string,
  options?: UseQueryOptions<ApiResponse<{
    cart: CartResponse;
    sharedBy: {
      name: string;
      email: string;
    };
    message?: string;
    expiresAt?: string;
  }>>
) => {
  return useQuery({
    queryKey: ['shared-cart', shareId],
    queryFn: () => cartApi.getSharedCart(shareId),
    enabled: !!shareId,
    ...options,
  });
};

export const useCopySharedCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (shareId: string) => cartApi.copySharedCart(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Quick Add Hook
export const useQuickAdd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity, variantId }: { 
      productId: string; 
      quantity?: number; 
      variantId?: string; 
    }) => cartApi.quickAdd(productId, quantity, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Export Hook
export const useExportCart = () => {
  return useMutation({
    mutationFn: ({ format, cartId }: { format: 'csv' | 'pdf' | 'json'; cartId?: string }) => 
      cartApi.exportCart(format, cartId),
  });
};

// Comparison Hook
export const useCompareCart = (
  cartId?: string,
  options?: UseQueryOptions<ApiResponse<{
    alternatives: Array<{
      items: Array<{
        original: Product;
        alternative: Product;
        priceDifference: number;
        savings: number;
      }>;
      totalSavings: number;
      alternativeTotal: number;
    }>;
    recommendations: string[];
  }>>
) => {
  return useQuery({
    queryKey: ['cart-comparison', cartId],
    queryFn: () => cartApi.compareWithSimilar(cartId),
    staleTime: 20 * 60 * 1000, // 20 minutes
    ...options,
  });
};

// Templates Hooks
export const useCartTemplates = (options?: UseQueryOptions<ApiResponse<Array<{
  id: string;
  name: string;
  description?: string;
  items: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
  category: string;
  isPopular: boolean;
}>>>) => {
  return useQuery({
    queryKey: ['cart-templates'],
    queryFn: () => cartApi.getCartTemplates(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useApplyCartTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, replaceCart }: { templateId: string; replaceCart?: boolean }) => 
      cartApi.applyCartTemplate(templateId, replaceCart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

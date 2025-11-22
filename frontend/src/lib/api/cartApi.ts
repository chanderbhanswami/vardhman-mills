import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  Cart, 
  CartItem, 
  ApiResponse, 
  PaginationParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from './config';
import { buildPaginationParams } from './utils';

/**
 * Cart API Service
 * Handles shopping cart operations including CRUD, sync, and checkout preparation
 */

class CartApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Get current user's cart
  async getCart(): Promise<ApiResponse<Cart>> {
    return this.client.get<Cart>(endpoints.cart.get);
  }

  // Get cart by ID (for guest carts)
  async getCartById(cartId: string): Promise<ApiResponse<Cart>> {
    return this.client.get<Cart>(endpoints.cart.byId(cartId));
  }

  // Create new cart (for guests)
  async createCart(): Promise<ApiResponse<Cart>> {
    return this.client.post<Cart>(endpoints.cart.create);
  }

  // Add item to cart
  async addToCart(productId: string, quantity: number, variantId?: string): Promise<ApiResponse<Cart>> {
    return this.client.post<Cart>(endpoints.cart.addItem, {
      productId,
      quantity,
      variantId,
    });
  }

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<Cart>> {
    return this.client.put<Cart>(endpoints.cart.updateItem(itemId), { quantity });
  }

  // Remove item from cart
  async removeFromCart(itemId: string): Promise<ApiResponse<Cart>> {
    return this.client.delete<Cart>(endpoints.cart.removeItem(itemId));
  }

  // Clear entire cart
  async clearCart(): Promise<ApiResponse<Cart>> {
    return this.client.delete<Cart>(endpoints.cart.clear);
  }

  // Apply coupon to cart
  async applyCoupon(couponCode: string): Promise<ApiResponse<Cart>> {
    return this.client.post<Cart>(endpoints.cart.applyCoupon, { couponCode });
  }

  // Remove coupon from cart
  async removeCoupon(couponId: string): Promise<ApiResponse<Cart>> {
    return this.client.delete<Cart>(endpoints.cart.removeCoupon(couponId));
  }

  // Update cart shipping address
  async updateShippingAddress(address: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): Promise<ApiResponse<Cart>> {
    return this.client.put<Cart>(endpoints.cart.updateShipping, { shippingAddress: address });
  }

  // Update cart billing address
  async updateBillingAddress(address: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): Promise<ApiResponse<Cart>> {
    return this.client.put<Cart>(endpoints.cart.updateBilling, { billingAddress: address });
  }

  // Calculate shipping costs
  async calculateShipping(shippingMethod: string): Promise<ApiResponse<{ cost: number; estimatedDays: number }>> {
    return this.client.post<{ cost: number; estimatedDays: number }>(endpoints.cart.calculateShipping, { shippingMethod });
  }

  // Get available shipping methods
  async getShippingMethods(): Promise<ApiResponse<Array<{ id: string; name: string; cost: number; estimatedDays: number }>>> {
    return this.client.get<Array<{ id: string; name: string; cost: number; estimatedDays: number }>>(endpoints.cart.shippingMethods);
  }

  // Sync local cart with server (for guest to user conversion)
  async syncCart(localCartItems: CartItem[]): Promise<ApiResponse<Cart>> {
    return this.client.post<Cart>(endpoints.cart.sync, { items: localCartItems });
  }

  // Merge carts (when user logs in with existing guest cart)
  async mergeCarts(guestCartId: string): Promise<ApiResponse<Cart>> {
    return this.client.post<Cart>(endpoints.cart.merge, { guestCartId });
  }

  // Validate cart before checkout
  async validateCart(): Promise<ApiResponse<{ isValid: boolean; errors: string[] }>> {
    return this.client.post<{ isValid: boolean; errors: string[] }>(endpoints.cart.validate);
  }

  // Get cart summary
  async getCartSummary(): Promise<ApiResponse<{
    itemCount: number;
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  }>> {
    return this.client.get<{
      itemCount: number;
      subtotal: number;
      discount: number;
      tax: number;
      shipping: number;
      total: number;
    }>(endpoints.cart.summary);
  }

  // Save cart for later (wishlist-like functionality)
  async saveForLater(itemId: string): Promise<ApiResponse<Cart>> {
    return this.client.post<Cart>(endpoints.cart.saveForLater(itemId));
  }

  // Move item from saved to cart
  async moveToCart(itemId: string): Promise<ApiResponse<Cart>> {
    return this.client.post<Cart>(endpoints.cart.moveToCart(itemId));
  }

  // Get saved items
  async getSavedItems(): Promise<ApiResponse<CartItem[]>> {
    return this.client.get<CartItem[]>(endpoints.cart.savedItems);
  }

  // Estimate taxes
  async calculateTax(shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): Promise<ApiResponse<{ taxAmount: number; taxRate: number }>> {
    return this.client.post<{ taxAmount: number; taxRate: number }>(endpoints.cart.calculateTax, { shippingAddress });
  }

  // Check item availability
  async checkAvailability(): Promise<ApiResponse<{ availableItems: string[]; unavailableItems: string[] }>> {
    return this.client.get<{ availableItems: string[]; unavailableItems: string[] }>(endpoints.cart.checkAvailability);
  }

  // Get recommended products based on cart
  async getRecommendations(limit?: number): Promise<ApiResponse<CartItem[]>> {
    const params = limit ? { limit } : {};
    return this.client.get<CartItem[]>(endpoints.cart.recommendations, { params });
  }

  // Abandon cart recovery (Admin)
  async getAbandonedCarts(params?: PaginationParams): Promise<ApiResponse<Cart[]>> {
    const queryParams = buildPaginationParams(params || {});
    return this.client.get<Cart[]>(endpoints.cart.abandoned, { params: queryParams });
  }

  // Send cart recovery email (Admin)
  async sendRecoveryEmail(cartId: string): Promise<ApiResponse<{ sent: boolean }>> {
    return this.client.post<{ sent: boolean }>(endpoints.cart.sendRecovery(cartId));
  }
}

// Create service instance
const cartApiService = new CartApiService();

// React Query Hooks
export const useCart = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.CART],
    queryFn: () => cartApiService.getCart(),
    staleTime: 30 * 1000, // 30 seconds - cart should be relatively fresh
    refetchOnWindowFocus: true,
  });
};

export const useCartById = (cartId: string) => {
  return useQuery({
    queryKey: [CACHE_KEYS.CART, cartId],
    queryFn: () => cartApiService.getCartById(cartId),
    enabled: !!cartId,
    staleTime: 30 * 1000,
  });
};

export const useCartSummary = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.CART, 'summary'],
    queryFn: () => cartApiService.getCartSummary(),
    staleTime: 30 * 1000,
  });
};

export const useShippingMethods = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.CART, 'shipping-methods'],
    queryFn: () => cartApiService.getShippingMethods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSavedItems = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.CART, 'saved'],
    queryFn: () => cartApiService.getSavedItems(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCartRecommendations = (limit?: number) => {
  return useQuery({
    queryKey: [CACHE_KEYS.CART, 'recommendations', limit],
    queryFn: () => cartApiService.getRecommendations(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutation Hooks
export const useCreateCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartApiService.createCart(),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity, variantId }: { productId: string; quantity: number; variantId?: string }) => 
      cartApiService.addToCart(productId, quantity, variantId),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'summary'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => 
      cartApiService.updateCartItem(itemId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'summary'] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: string) => cartApiService.removeFromCart(itemId),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'summary'] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartApiService.clearCart(),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'summary'] });
    },
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (couponCode: string) => cartApiService.applyCoupon(couponCode),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'summary'] });
    },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ couponId }: { couponId: string }) => cartApiService.removeCoupon(couponId),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'summary'] });
    },
  });
};

export const useUpdateShippingAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (address: {
      name: string;
      email: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }) => cartApiService.updateShippingAddress(address),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
    },
  });
};

export const useUpdateBillingAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (address: {
      name: string;
      email: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }) => cartApiService.updateBillingAddress(address),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
    },
  });
};

export const useCalculateShipping = () => {
  return useMutation({
    mutationFn: (shippingMethod: string) => cartApiService.calculateShipping(shippingMethod),
  });
};

export const useCalculateTax = () => {
  return useMutation({
    mutationFn: (shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }) => cartApiService.calculateTax(shippingAddress),
  });
};

export const useSyncCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (localCartItems: CartItem[]) => cartApiService.syncCart(localCartItems),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'summary'] });
    },
  });
};

export const useMergeCarts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (guestCartId: string) => cartApiService.mergeCarts(guestCartId),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'summary'] });
    },
  });
};

export const useValidateCart = () => {
  return useMutation({
    mutationFn: () => cartApiService.validateCart(),
  });
};

export const useSaveForLater = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: string) => cartApiService.saveForLater(itemId),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'saved'] });
    },
  });
};

export const useMoveToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: string) => cartApiService.moveToCart(itemId),
    onSuccess: (data) => {
      queryClient.setQueryData([CACHE_KEYS.CART], data);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART, 'saved'] });
    },
  });
};

export const useCheckAvailability = () => {
  return useMutation({
    mutationFn: () => cartApiService.checkAvailability(),
  });
};

export default cartApiService;
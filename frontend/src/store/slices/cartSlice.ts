import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductVariant } from '@/types';

// Cart item interface
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  product: Product;
  variant?: ProductVariant;
  addedAt: string;
  customizations?: Record<string, unknown>;
  giftWrap?: {
    enabled: boolean;
    message?: string;
    cost: number;
  };
}

// Shipping method interface
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isDefault: boolean;
}

// Coupon interface
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  description: string;
  expiresAt?: string;
  usageCount: number;
  maxUsage?: number;
}

// Cart summary interface
export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  giftWrapCost: number;
  total: number;
  savings: number;
  itemCount: number;
  appliedCoupons: Coupon[];
}

// Async thunks for cart operations
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (params: {
    productId: string;
    variantId?: string;
    quantity: number;
    customizations?: Record<string, unknown>;
  }) => {
    const response = await fetch('/api/cart/items', { // Fixed: Use /api/cart/items
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }
    
    return response.json();
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (params: { itemId: string; quantity: number }) => {
    const response = await fetch(`/api/cart/items/${params.itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: params.quantity }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update cart item');
    }
    
    return response.json();
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string) => {
    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }
    
    return { itemId };
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (couponCode: string) => {
    const response = await fetch('/api/cart/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: couponCode }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply coupon');
    }
    
    return response.json();
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (couponId: string) => {
    const response = await fetch(`/api/cart/coupons/${couponId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove coupon');
    }
    
    return { couponId };
  }
);

export const updateShippingMethod = createAsyncThunk(
  'cart/updateShippingMethod',
  async (methodId: string) => {
    const response = await fetch('/api/cart/calculate-shipping', { // Fixed: Use /api/cart/calculate-shipping
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ methodId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update shipping method');
    }
    
    return response.json();
  }
);

export const syncCart = createAsyncThunk(
  'cart/syncCart',
  async () => {
    const response = await fetch('/api/cart');
    if (!response.ok) {
      throw new Error('Failed to sync cart');
    }
    return response.json();
  }
);

interface CartState {
  // Cart items
  items: CartItem[];
  
  // Summary
  summary: CartSummary;
  
  // Shipping
  shippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod | null;
  
  // Coupons
  availableCoupons: Coupon[];
  appliedCoupons: Coupon[];
  
  // UI state
  isLoading: boolean;
  isUpdating: boolean;
  isApplyingCoupon: boolean;
  
  // Drawer/modal state
  isDrawerOpen: boolean;
  
  // Error handling
  error: string | null;
  couponError: string | null;
  
  // Last sync
  lastSync: number;
  syncInterval: number;
  
  // Cart persistence
  isGuest: boolean;
  guestCartId: string | null;
  
  // Recently removed items (for undo functionality)
  recentlyRemoved: Array<{
    item: CartItem;
    removedAt: number;
  }>;
  
  // Recommendations
  recommendedProducts: Product[];
  
  // Checkout state
  isReadyForCheckout: boolean;
  checkoutValidation: {
    hasItems: boolean;
    hasValidShipping: boolean;
    inventoryChecked: boolean;
  };
}

const initialState: CartState = {
  items: [],
  summary: {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    giftWrapCost: 0,
    total: 0,
    savings: 0,
    itemCount: 0,
    appliedCoupons: [],
  },
  shippingMethods: [],
  selectedShippingMethod: null,
  availableCoupons: [],
  appliedCoupons: [],
  isLoading: false,
  isUpdating: false,
  isApplyingCoupon: false,
  isDrawerOpen: false,
  error: null,
  couponError: null,
  lastSync: 0,
  syncInterval: 30000, // 30 seconds
  isGuest: true,
  guestCartId: null,
  recentlyRemoved: [],
  recommendedProducts: [],
  isReadyForCheckout: false,
  checkoutValidation: {
    hasItems: false,
    hasValidShipping: false,
    inventoryChecked: false,
  },
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local cart operations (optimistic updates)
    addItemToCart: (state, action: PayloadAction<Omit<CartItem, 'id' | 'addedAt'>>) => {
      const newItem: CartItem = {
        ...action.payload,
        id: `temp-${Date.now()}`,
        addedAt: new Date().toISOString(),
      };
      
      // Check if item already exists
      const existingIndex = state.items.findIndex(
        item => item.productId === newItem.productId && item.variantId === newItem.variantId
      );
      
      if (existingIndex !== -1) {
        state.items[existingIndex].quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      
      // Update summary
      cartSlice.caseReducers.calculateSummary(state);
    },
    
    updateItemQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== itemId);
        } else {
          item.quantity = quantity;
        }
        cartSlice.caseReducers.calculateSummary(state);
      }
    },
    
    removeItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        const removedItem = state.items[itemIndex];
        state.items.splice(itemIndex, 1);
        
        // Add to recently removed for undo functionality
        state.recentlyRemoved.unshift({
          item: removedItem,
          removedAt: Date.now(),
        });
        
        // Keep only recent items (last 5 minutes)
        state.recentlyRemoved = state.recentlyRemoved.filter(
          removed => Date.now() - removed.removedAt < 300000
        );
        
        cartSlice.caseReducers.calculateSummary(state);
      }
    },
    
    restoreItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const removedIndex = state.recentlyRemoved.findIndex(
        removed => removed.item.id === itemId
      );
      
      if (removedIndex !== -1) {
        const restoredItem = state.recentlyRemoved[removedIndex].item;
        state.items.push(restoredItem);
        state.recentlyRemoved.splice(removedIndex, 1);
        cartSlice.caseReducers.calculateSummary(state);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupons = [];
      cartSlice.caseReducers.calculateSummary(state);
    },
    
    // Drawer/modal control
    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    
    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    
    // Gift wrap
    updateGiftWrap: (state, action: PayloadAction<{ itemId: string; giftWrap: CartItem['giftWrap'] }>) => {
      const { itemId, giftWrap } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        item.giftWrap = giftWrap;
        cartSlice.caseReducers.calculateSummary(state);
      }
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.couponError = null;
    },
    
    // Summary calculation
    calculateSummary: (state) => {
      const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const giftWrapCost = state.items.reduce((sum, item) => {
        return sum + (item.giftWrap?.enabled ? (item.giftWrap.cost * item.quantity) : 0);
      }, 0);
      
      let discount = 0;
      state.appliedCoupons.forEach(coupon => {
        if (coupon.type === 'percentage') {
          discount += Math.min(subtotal * (coupon.value / 100), coupon.maximumDiscount || Infinity);
        } else if (coupon.type === 'fixed') {
          discount += coupon.value;
        }
      });
      
      const shipping = state.selectedShippingMethod?.price || 0;
      const freeShippingApplied = state.appliedCoupons.some(coupon => coupon.type === 'free_shipping');
      const finalShipping = freeShippingApplied ? 0 : shipping;
      
      const subtotalAfterDiscount = Math.max(0, subtotal - discount);
      const tax = subtotalAfterDiscount * 0.18; // 18% GST (example)
      const total = subtotalAfterDiscount + finalShipping + tax + giftWrapCost;
      
      const originalTotal = subtotal + shipping + tax + giftWrapCost;
      const savings = originalTotal - total;
      
      state.summary = {
        subtotal,
        discount,
        shipping: finalShipping,
        tax,
        giftWrapCost,
        total,
        savings,
        itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
        appliedCoupons: state.appliedCoupons,
      };
      
      // Update checkout validation
      state.checkoutValidation = {
        hasItems: state.items.length > 0,
        hasValidShipping: state.selectedShippingMethod !== null,
        inventoryChecked: true, // Assume checked after calculation
      };
      
      state.isReadyForCheckout = Object.values(state.checkoutValidation).every(Boolean);
    },
    
    // Set shipping methods
    setShippingMethods: (state, action: PayloadAction<ShippingMethod[]>) => {
      state.shippingMethods = action.payload;
      // Auto-select default method if none selected
      if (!state.selectedShippingMethod && action.payload.length > 0) {
        const defaultMethod = action.payload.find(method => method.isDefault) || action.payload[0];
        state.selectedShippingMethod = defaultMethod;
        cartSlice.caseReducers.calculateSummary(state);
      }
    },
    
    selectShippingMethod: (state, action: PayloadAction<string>) => {
      const method = state.shippingMethods.find(m => m.id === action.payload);
      if (method) {
        state.selectedShippingMethod = method;
        cartSlice.caseReducers.calculateSummary(state);
      }
    },
    
    // Set available coupons
    setAvailableCoupons: (state, action: PayloadAction<Coupon[]>) => {
      state.availableCoupons = action.payload;
    },
    
    // Set recommended products
    setRecommendedProducts: (state, action: PayloadAction<Product[]>) => {
      state.recommendedProducts = action.payload;
    },
    
    // Sync management
    updateLastSync: (state) => {
      state.lastSync = Date.now();
    },
    
    // Guest cart management
    setGuestCartId: (state, action: PayloadAction<string>) => {
      state.guestCartId = action.payload;
    },
    
    setUserAuthenticated: (state) => {
      state.isGuest = false;
      state.guestCartId = null;
    },
    
    // Load cart from localStorage
    loadCartFromStorage: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.isLoading = false;
      cartSlice.caseReducers.calculateSummary(state);
    },
  },
  extraReducers: (builder) => {
    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Update with server response
        if (action.payload.cart) {
          state.items = action.payload.cart.items;
          cartSlice.caseReducers.calculateSummary(state);
        }
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to add item to cart';
      });

    // Update cart item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isUpdating = false;
        if (action.payload.cart) {
          state.items = action.payload.cart.items;
          cartSlice.caseReducers.calculateSummary(state);
        }
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update cart item';
      });

    // Remove from cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.items = state.items.filter(item => item.id !== action.payload.itemId);
        cartSlice.caseReducers.calculateSummary(state);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to remove item from cart';
      });

    // Apply coupon
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.isApplyingCoupon = true;
        state.couponError = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.isApplyingCoupon = false;
        if (action.payload.coupon) {
          state.appliedCoupons.push(action.payload.coupon);
          cartSlice.caseReducers.calculateSummary(state);
        }
        state.couponError = null;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.isApplyingCoupon = false;
        state.couponError = action.error.message || 'Failed to apply coupon';
      });

    // Remove coupon
    builder
      .addCase(removeCoupon.pending, (state) => {
        state.isApplyingCoupon = true;
        state.couponError = null;
      })
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.isApplyingCoupon = false;
        state.appliedCoupons = state.appliedCoupons.filter(
          coupon => coupon.id !== action.payload.couponId
        );
        cartSlice.caseReducers.calculateSummary(state);
        state.couponError = null;
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.isApplyingCoupon = false;
        state.couponError = action.error.message || 'Failed to remove coupon';
      });

    // Update shipping method
    builder
      .addCase(updateShippingMethod.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateShippingMethod.fulfilled, (state, action) => {
        state.isUpdating = false;
        if (action.payload.shippingMethod) {
          state.selectedShippingMethod = action.payload.shippingMethod;
          cartSlice.caseReducers.calculateSummary(state);
        }
        state.error = null;
      })
      .addCase(updateShippingMethod.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update shipping method';
      });

    // Sync cart
    builder
      .addCase(syncCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.items = action.payload.items || [];
          state.appliedCoupons = action.payload.appliedCoupons || [];
          state.selectedShippingMethod = action.payload.shippingMethod || null;
          cartSlice.caseReducers.calculateSummary(state);
          cartSlice.caseReducers.updateLastSync(state);
        }
        state.error = null;
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to sync cart';
      });
  },
});

export const {
  addItemToCart,
  updateItemQuantity,
  removeItem,
  restoreItem,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  updateGiftWrap,
  clearError,
  calculateSummary,
  setShippingMethods,
  selectShippingMethod,
  setAvailableCoupons,
  setRecommendedProducts,
  updateLastSync,
  setGuestCartId,
  setUserAuthenticated,
  loadCartFromStorage,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartSummary = (state: { cart: CartState }) => state.cart.summary;
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.summary.itemCount;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.summary.total;
export const selectCartIsEmpty = (state: { cart: CartState }) => state.cart.items.length === 0;
export const selectCartIsLoading = (state: { cart: CartState }) => state.cart.isLoading;
export const selectCartIsUpdating = (state: { cart: CartState }) => state.cart.isUpdating;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectCartDrawerOpen = (state: { cart: CartState }) => state.cart.isDrawerOpen;
export const selectShippingMethods = (state: { cart: CartState }) => state.cart.shippingMethods;
export const selectSelectedShippingMethod = (state: { cart: CartState }) => state.cart.selectedShippingMethod;
export const selectAppliedCoupons = (state: { cart: CartState }) => state.cart.appliedCoupons;
export const selectAvailableCoupons = (state: { cart: CartState }) => state.cart.availableCoupons;
export const selectRecommendedProducts = (state: { cart: CartState }) => state.cart.recommendedProducts;
export const selectRecentlyRemovedItems = (state: { cart: CartState }) => state.cart.recentlyRemoved;
export const selectIsReadyForCheckout = (state: { cart: CartState }) => state.cart.isReadyForCheckout;
export const selectCheckoutValidation = (state: { cart: CartState }) => state.cart.checkoutValidation;

// Complex selectors
export const selectCartItemById = (state: { cart: CartState }, itemId: string) =>
  state.cart.items.find(item => item.id === itemId);

export const selectCartItemsByProduct = (state: { cart: CartState }, productId: string) =>
  state.cart.items.filter(item => item.productId === productId);

export const selectCartNeedsSync = (state: { cart: CartState }) => {
  const { lastSync, syncInterval } = state.cart;
  return Date.now() - lastSync > syncInterval;
};

export const selectCartHasDiscounts = (state: { cart: CartState }) =>
  state.cart.summary.discount > 0 || state.cart.appliedCoupons.length > 0;

export const selectCartSubtotalWithoutDiscounts = (state: { cart: CartState }) => {
  const { summary } = state.cart;
  return summary.subtotal + summary.discount;
};

export default cartSlice.reducer;
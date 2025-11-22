/**
 * Cart Context - Vardhman Mills Frontend
 * Manages shopping cart state and operations
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { ORDER_LIMITS, CART_ERRORS } from '@/constants';

// Types
interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  quantity: number;
  image: string;
  slug: string;
  sku: string;
  weight?: number;
  color?: string;
  size?: string;
  material?: string;
  inStock: number;
  maxQuantity?: number;
  isGift?: boolean;
  giftMessage?: string;
  addedAt: Date;
}

interface CartSummary {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  savings: number;
}

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  syncing: boolean;
  lastUpdated: Date | null;
  couponCode?: string;
  couponDiscount?: number;
  shippingMethod?: string;
  giftWrap?: boolean;
  giftWrapPrice?: number;
  estimatedDelivery?: string;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'addedAt'> }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_SHIPPING_METHOD'; payload: string }
  | { type: 'SET_GIFT_WRAP'; payload: { enabled: boolean; price?: number } }
  | { type: 'CALCULATE_SUMMARY' }
  | { type: 'RESTORE_CART'; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  // Item operations
  addItem: (item: Omit<CartItem, 'addedAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<CartItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Cart operations
  getItem: (productId: string, variantId?: string) => CartItem | undefined;
  getItemCount: () => number;
  getTotalQuantity: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  isEmpty: () => boolean;
  
  // Coupon operations
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  
  // Shipping operations
  setShippingMethod: (method: string) => void;
  setGiftWrap: (enabled: boolean, price?: number) => void;
  
  // Utility operations
  validateStock: () => Promise<boolean>;
  calculateEstimatedDelivery: () => string;
  exportCart: () => CartItem[];
  importCart: (items: CartItem[]) => void;
}

// Initial state
const initialState: CartState = {
  items: [],
  summary: {
    itemCount: 0,
    totalQuantity: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    savings: 0,
  },
  loading: false,
  syncing: false,
  lastUpdated: null,
};

// Utility functions
const calculateSummary = (items: CartItem[], couponDiscount = 0, giftWrapPrice = 0): CartSummary => {
  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemDiscount = items.reduce((sum, item) => {
    const itemSavings = item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0;
    return sum + itemSavings;
  }, 0);
  
  const totalDiscount = itemDiscount + couponDiscount;
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 500 ? 0 : 99; // Free shipping above ₹500
  const total = subtotal - couponDiscount + tax + shipping + giftWrapPrice;
  
  return {
    itemCount,
    totalQuantity,
    subtotal,
    discount: totalDiscount,
    tax,
    shipping,
    total,
    savings: totalDiscount,
  };
};

const generateItemId = (productId: string, variantId?: string): string => {
  return variantId ? `${productId}-${variantId}` : productId;
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_SYNCING':
      return { ...state, syncing: action.payload };
    
    case 'ADD_ITEM': {
      const itemId = generateItemId(action.payload.productId, action.payload.variantId);
      const existingItemIndex = state.items.findIndex(item => 
        generateItemId(item.productId, item.variantId) === itemId
      );
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = [...state.items];
        const existingItem = newItems[existingItemIndex];
        const newQuantity = existingItem.quantity + action.payload.quantity;
        
        if (newQuantity > ORDER_LIMITS.MAX_QUANTITY_PER_ITEM) {
          toast.error(`Cannot add more than ${ORDER_LIMITS.MAX_QUANTITY_PER_ITEM} items`);
          return state;
        }
        
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };
      } else {
        // Add new item
        if (state.items.length >= ORDER_LIMITS.MAX_ITEMS) {
          toast.error(`Cannot add more than ${ORDER_LIMITS.MAX_ITEMS} items to cart`);
          return state;
        }
        
        newItems = [...state.items, {
          ...action.payload,
          id: itemId,
          addedAt: new Date(),
        }];
      }
      
      const newSummary = calculateSummary(newItems, state.couponDiscount, state.giftWrapPrice);
      
      return {
        ...state,
        items: newItems,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    }
    
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
      
      const newSummary = calculateSummary(newItems, state.couponDiscount, state.giftWrapPrice);
      
      return {
        ...state,
        items: newItems,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const newSummary = calculateSummary(newItems, state.couponDiscount, state.giftWrapPrice);
      
      return {
        ...state,
        items: newItems,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: id });
      }
      
      if (quantity > ORDER_LIMITS.MAX_QUANTITY_PER_ITEM) {
        toast.error(`Maximum ${ORDER_LIMITS.MAX_QUANTITY_PER_ITEM} items allowed`);
        return state;
      }
      
      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      
      const newSummary = calculateSummary(newItems, state.couponDiscount, state.giftWrapPrice);
      
      return {
        ...state,
        items: newItems,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...initialState,
        lastUpdated: new Date(),
      };
    
    case 'APPLY_COUPON': {
      const newSummary = calculateSummary(state.items, action.payload.discount, state.giftWrapPrice);
      
      return {
        ...state,
        couponCode: action.payload.code,
        couponDiscount: action.payload.discount,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    }
    
    case 'REMOVE_COUPON': {
      const newSummary = calculateSummary(state.items, 0, state.giftWrapPrice);
      
      return {
        ...state,
        couponCode: undefined,
        couponDiscount: undefined,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    }
    
    case 'SET_SHIPPING_METHOD':
      return {
        ...state,
        shippingMethod: action.payload,
        lastUpdated: new Date(),
      };
    
    case 'SET_GIFT_WRAP':
      const newSummary = calculateSummary(state.items, state.couponDiscount, action.payload.price || 0);
      
      return {
        ...state,
        giftWrap: action.payload.enabled,
        giftWrapPrice: action.payload.price || 0,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    
    case 'CALCULATE_SUMMARY': {
      const summary = calculateSummary(state.items, state.couponDiscount, state.giftWrapPrice);
      return { ...state, summary };
    }
    
    case 'RESTORE_CART': {
      const summary = calculateSummary(action.payload, 0, 0);
      return {
        ...state,
        items: action.payload,
        summary,
        lastUpdated: new Date(),
      };
    }
    
    default:
      return state;
  }
};

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vardhman_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          dispatch({ type: 'RESTORE_CART', payload: parsedCart });
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('vardhman_cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [state.items]);
  
  // Context methods
  const addItem = async (item: Omit<CartItem, 'addedAt'>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Validate stock
      if (item.quantity > item.inStock) {
        toast.error(CART_ERRORS.INSUFFICIENT_STOCK);
        return;
      }
      
      dispatch({ type: 'ADD_ITEM', payload: item });
      toast.success(`${item.name} added to cart`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const updateItem = async (id: string, updates: Partial<CartItem>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
    } catch (error) {
      console.error('Failed to update cart item:', error);
      toast.error('Failed to update item');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const removeItem = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'REMOVE_ITEM', payload: id });
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      toast.error('Failed to remove item');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const updateQuantity = async (id: string, quantity: number): Promise<void> => {
    try {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    }
  };
  
  const clearCart = async (): Promise<void> => {
    try {
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };
  
  const getItem = (productId: string, variantId?: string): CartItem | undefined => {
    const itemId = generateItemId(productId, variantId);
    return state.items.find(item => generateItemId(item.productId, item.variantId) === itemId);
  };
  
  const getItemCount = (): number => state.summary.itemCount;
  const getTotalQuantity = (): number => state.summary.totalQuantity;
  const getSubtotal = (): number => state.summary.subtotal;
  const getTotal = (): number => state.summary.total;
  const isEmpty = (): boolean => state.items.length === 0;
  
  const applyCoupon = async (code: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call to validate coupon
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: state.summary.subtotal }),
      });
      
      if (!response.ok) {
        throw new Error('Invalid coupon code');
      }
      
      const { discount } = await response.json();
      dispatch({ type: 'APPLY_COUPON', payload: { code, discount } });
      toast.success(`Coupon applied! You saved ₹${discount}`);
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      toast.error('Invalid or expired coupon code');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const removeCoupon = (): void => {
    dispatch({ type: 'REMOVE_COUPON' });
    toast.success('Coupon removed');
  };
  
  const setShippingMethod = (method: string): void => {
    dispatch({ type: 'SET_SHIPPING_METHOD', payload: method });
  };
  
  const setGiftWrap = (enabled: boolean, price = 99): void => {
    dispatch({ type: 'SET_GIFT_WRAP', payload: { enabled, price: enabled ? price : 0 } });
  };
  
  const validateStock = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/cart/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: state.items }),
      });
      
      const { valid, outOfStock } = await response.json();
      
      if (!valid && outOfStock.length > 0) {
        outOfStock.forEach((item: { name: string; id: string }) => {
          toast.error(`${item.name} is out of stock`);
        });
      }
      
      return valid;
    } catch (error) {
      console.error('Failed to validate stock:', error);
      return false;
    }
  };
  
  const calculateEstimatedDelivery = (): string => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
    return deliveryDate.toLocaleDateString();
  };
  
  const exportCart = (): CartItem[] => state.items;
  
  const importCart = (items: CartItem[]): void => {
    dispatch({ type: 'RESTORE_CART', payload: items });
  };
  
  const contextValue: CartContextType = {
    state,
    addItem,
    updateItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItem,
    getItemCount,
    getTotalQuantity,
    getSubtotal,
    getTotal,
    isEmpty,
    applyCoupon,
    removeCoupon,
    setShippingMethod,
    setGiftWrap,
    validateStock,
    calculateEstimatedDelivery,
    exportCart,
    importCart,
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
export type { CartItem, CartSummary, CartState };
/**
 * Wishlist Context - Vardhman Mills Frontend
 * Manages user wishlist and saved items
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Types
interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string;
  brand: string;
  inStock: boolean;
  addedAt: Date;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  lastUpdated: Date | null;
}

type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: WishlistItem[] }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<WishlistItem> } };

interface WishlistContextType {
  state: WishlistState;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (itemId: string) => Promise<void>;
  shareWishlist: () => Promise<string>;
  getWishlistItem: (productId: string) => WishlistItem | undefined;
}

// Initial state
const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
  lastUpdated: null,
};

// Reducer
const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
        totalItems: action.payload.length,
        lastUpdated: new Date(),
      };
    
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        return state; // Item already exists
      }
      
      const newItems = [...state.items, action.payload];
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        lastUpdated: new Date(),
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        lastUpdated: new Date(),
      };
    }
    
    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
        totalItems: 0,
        lastUpdated: new Date(),
      };
    
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
      
      return {
        ...state,
        items: newItems,
        lastUpdated: new Date(),
      };
    }
    
    default:
      return state;
  }
};

// Context
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Provider
export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  
  // Load wishlist from localStorage on mount
  useEffect(() => {
    loadWishlist();
  }, []);
  
  // Save to localStorage when items change
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  }, [state.items]);
  
  const loadWishlist = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load from localStorage first
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const items = JSON.parse(savedWishlist).map((item: WishlistItem) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        dispatch({ type: 'SET_ITEMS', payload: items });
      }
      
      // Sync with server if authenticated
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const addToWishlist = async (productId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Check if already in wishlist
      if (isInWishlist(productId)) {
        toast.error('Item already in wishlist');
        return;
      }
      
      // Fetch product details
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      const product = await response.json();
      
      const wishlistItem: WishlistItem = {
        id: `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images?.[0] || product.image,
        category: product.category,
        brand: product.brand,
        inStock: product.inStock,
        addedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_ITEM', payload: wishlistItem });
      
      // Sync with server
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      
      toast.success('Added to wishlist');
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add to wishlist' });
      toast.error('Failed to add to wishlist');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const removeFromWishlist = (itemId: string): void => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    
    // Sync with server
    fetch(`/api/wishlist/${item.productId}`, {
      method: 'DELETE',
    }).catch(error => {
      console.error('Failed to sync wishlist removal:', error);
    });
    
    toast.success('Removed from wishlist');
  };
  
  const clearWishlist = (): void => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    localStorage.removeItem('wishlist');
    
    // Sync with server
    fetch('/api/wishlist', {
      method: 'DELETE',
    }).catch(error => {
      console.error('Failed to sync wishlist clear:', error);
    });
    
    toast.success('Wishlist cleared');
  };
  
  const isInWishlist = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId);
  };
  
  const moveToCart = async (itemId: string): Promise<void> => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    try {
      // Add to cart
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          quantity: 1,
        }),
      });
      
      if (response.ok) {
        removeFromWishlist(itemId);
        toast.success('Moved to cart');
      } else {
        toast.error('Failed to move to cart');
      }
    } catch (error) {
      console.error('Failed to move to cart:', error);
      toast.error('Failed to move to cart');
    }
  };
  
  const shareWishlist = async (): Promise<string> => {
    try {
      const response = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: state.items }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.shareUrl;
      }
      
      throw new Error('Failed to create share link');
    } catch (error) {
      console.error('Failed to share wishlist:', error);
      toast.error('Failed to create share link');
      return '';
    }
  };
  
  const getWishlistItem = (productId: string): WishlistItem | undefined => {
    return state.items.find(item => item.productId === productId);
  };
  
  return (
    <WishlistContext.Provider value={{
      state,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      moveToCart,
      shareWishlist,
      getWishlistItem,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hook
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
export type { WishlistItem, WishlistState };
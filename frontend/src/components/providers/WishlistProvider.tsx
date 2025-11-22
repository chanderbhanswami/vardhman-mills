'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { useAuth } from './AuthProvider';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Types
export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  brand?: string;
  category: string;
  subcategory?: string;
  isAvailable: boolean;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  rating?: number;
  reviewCount?: number;
  tags: string[];
  variants?: Array<{
    id: string;
    name: string;
    value: string;
    price?: number;
    inStock: boolean;
  }>;
  specifications?: Record<string, unknown>;
  addedAt: string;
  updatedAt: string;
  viewedAt?: string;
  notifyOnDiscount?: boolean;
  notifyOnRestock?: boolean;
  targetPrice?: number;
  notes?: string;
}

export interface WishlistCollection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isDefault: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  shareUrl?: string;
}

export interface WishlistContextType {
  // Wishlist State
  items: WishlistItem[];
  collections: WishlistCollection[];
  isLoading: boolean;
  isUpdating: boolean;
  totalItems: number;
  
  // Item Actions
  addToWishlist: (
    productId: string,
    collectionId?: string,
    options?: {
      notifyOnDiscount?: boolean;
      notifyOnRestock?: boolean;
      targetPrice?: number;
      notes?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  
  removeFromWishlist: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  
  isInWishlist: (productId: string, collectionId?: string) => boolean;
  
  // Bulk Operations
  addMultipleToWishlist: (productIds: string[], collectionId?: string) => Promise<{ success: boolean; error?: string }>;
  removeMultipleFromWishlist: (itemIds: string[]) => Promise<{ success: boolean; error?: string }>;
  moveItemsToCollection: (itemIds: string[], targetCollectionId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Collection Management
  createCollection: (name: string, description?: string, isPublic?: boolean) => Promise<{ success: boolean; collection?: WishlistCollection; error?: string }>;
  updateCollection: (collectionId: string, updates: Partial<WishlistCollection>) => Promise<{ success: boolean; error?: string }>;
  deleteCollection: (collectionId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Item Updates
  updateItemSettings: (
    itemId: string,
    settings: {
      notifyOnDiscount?: boolean;
      notifyOnRestock?: boolean;
      targetPrice?: number;
      notes?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  
  markAsViewed: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Filtering & Sorting
  getItemsByCollection: (collectionId?: string) => WishlistItem[];
  getAvailableItems: () => WishlistItem[];
  getUnavailableItems: () => WishlistItem[];
  getDiscountedItems: () => WishlistItem[];
  
  // Comparison
  addToComparison: (itemId: string) => void;
  removeFromComparison: (itemId: string) => void;
  clearComparison: () => void;
  comparisonItems: WishlistItem[];
  
  // Sharing
  shareCollection: (collectionId: string) => Promise<{ success: boolean; shareUrl?: string; error?: string }>;
  getSharedCollection: (shareToken: string) => Promise<{ success: boolean; collection?: WishlistCollection; items?: WishlistItem[]; error?: string }>;
  
  // Analytics
  getRecommendations: () => Promise<{ success: boolean; products?: unknown[]; error?: string }>;
  trackInteraction: (action: 'view' | 'add' | 'remove' | 'share', itemId?: string) => void;
  
  // Sync & Persistence
  refreshWishlist: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  mergeGuestWishlist: () => Promise<void>;
  
  // Cart Integration
  addToCart: (itemId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  addAllToCart: (collectionId?: string) => Promise<{ success: boolean; error?: string }>;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Context Creation
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Hook to use Wishlist Context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Wishlist Provider Component
interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [collections, setCollections] = useState<WishlistCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [comparisonItems, setComparisonItems] = useState<WishlistItem[]>([]);
  
  // Persistent storage for guest users
  const guestWishlistStorage = useLocalStorage<WishlistItem[]>('guestWishlist', { defaultValue: [] });
  const comparisonStorage = useLocalStorage<string[]>('wishlistComparison', { defaultValue: [] });
  
  // Refs
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);
  const analyticsQueue = useRef<Array<{ action: string; itemId?: string; timestamp: number }>>([]);

  // Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const SYNC_DELAY = 3000; // 3 seconds
  const MAX_COMPARISON_ITEMS = 4;
  
  // Use user data for personalization
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
      console.error('Wishlist API Request failed:', axiosError);
      
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message || 'An error occurred'
      };
    }
  }, [API_BASE_URL]);

  // Item Actions
  const addToWishlist = async (
    productId: string,
    collectionId?: string,
    options?: {
      notifyOnDiscount?: boolean;
      notifyOnRestock?: boolean;
      targetPrice?: number;
      notes?: string;
    }
  ) => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/wishlist/add', {
        method: 'POST',
        data: { productId, collectionId, ...options }
      });

      if (result.success) {
        const { item, wishlist } = result.data as { item: WishlistItem; wishlist: WishlistItem[] };
        setItems(wishlist);
        
        // Store for guest users
        if (!isAuthenticated) {
          guestWishlistStorage.setValue(wishlist);
        }
        
        // Track interaction
        trackInteraction('add', item.id);
        
        toast.success(`${item.title} added to wishlist`);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return { success: false, error: 'Failed to add item to wishlist' };
    } finally {
      setIsUpdating(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/wishlist/remove', {
        method: 'DELETE',
        data: { itemId }
      });

      if (result.success) {
        const { wishlist } = result.data as { wishlist: WishlistItem[] };
        setItems(wishlist);
        
        if (!isAuthenticated) {
          guestWishlistStorage.setValue(wishlist);
        }
        
        // Remove from comparison if present
        setComparisonItems(prev => prev.filter(item => item.id !== itemId));
        comparisonStorage.setValue(comparisonStorage.value.filter(id => id !== itemId));
        
        // Track interaction
        trackInteraction('remove', itemId);
        
        toast.success('Item removed from wishlist');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return { success: false, error: 'Failed to remove item from wishlist' };
    } finally {
      setIsUpdating(false);
    }
  };

  const isInWishlist = useCallback((productId: string, collectionId?: string): boolean => {
    return items.some(item => {
      const matchesProduct = item.productId === productId;
      if (!collectionId) return matchesProduct;
      
      // For specific collection, we'd need collection-item mapping
      // This is a simplified version
      return matchesProduct;
    });
  }, [items]);

  // Bulk Operations
  const addMultipleToWishlist = async (productIds: string[], collectionId?: string) => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/wishlist/add-multiple', {
        method: 'POST',
        data: { productIds, collectionId }
      });

      if (result.success) {
        const { wishlist } = result.data as { wishlist: WishlistItem[] };
        setItems(wishlist);
        
        if (!isAuthenticated) {
          guestWishlistStorage.setValue(wishlist);
        }
        
        toast.success(`${productIds.length} items added to wishlist`);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Bulk add to wishlist error:', error);
      return { success: false, error: 'Failed to add items to wishlist' };
    } finally {
      setIsUpdating(false);
    }
  };

  const removeMultipleFromWishlist = async (itemIds: string[]) => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/wishlist/remove-multiple', {
        method: 'DELETE',
        data: { itemIds }
      });

      if (result.success) {
        const { wishlist } = result.data as { wishlist: WishlistItem[] };
        setItems(wishlist);
        
        if (!isAuthenticated) {
          guestWishlistStorage.setValue(wishlist);
        }
        
        // Remove from comparison
        setComparisonItems(prev => prev.filter(item => !itemIds.includes(item.id)));
        comparisonStorage.setValue(comparisonStorage.value.filter(id => !itemIds.includes(id)));
        
        toast.success(`${itemIds.length} items removed from wishlist`);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Bulk remove from wishlist error:', error);
      return { success: false, error: 'Failed to remove items from wishlist' };
    } finally {
      setIsUpdating(false);
    }
  };

  const moveItemsToCollection = async (itemIds: string[], targetCollectionId: string) => {
    try {
      setIsUpdating(true);
      
      const result = await apiRequest('/wishlist/move-to-collection', {
        method: 'PATCH',
        data: { itemIds, targetCollectionId }
      });

      if (result.success) {
        const { wishlist } = result.data as { wishlist: WishlistItem[] };
        setItems(wishlist);
        
        toast.success('Items moved to collection');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Move items to collection error:', error);
      return { success: false, error: 'Failed to move items to collection' };
    } finally {
      setIsUpdating(false);
    }
  };

  // Collection Management
  const createCollection = async (name: string, description?: string, isPublic = false) => {
    try {
      const result = await apiRequest('/wishlist/collections', {
        method: 'POST',
        data: { name, description, isPublic }
      });

      if (result.success) {
        const { collection, collections: updatedCollections } = result.data as {
          collection: WishlistCollection;
          collections: WishlistCollection[];
        };
        setCollections(updatedCollections);
        
        toast.success(`Collection "${name}" created`);
        return { success: true, collection };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Create collection error:', error);
      return { success: false, error: 'Failed to create collection' };
    }
  };

  const updateCollection = async (collectionId: string, updates: Partial<WishlistCollection>) => {
    try {
      const result = await apiRequest(`/wishlist/collections/${collectionId}`, {
        method: 'PATCH',
        data: updates
      });

      if (result.success) {
        const { collections: updatedCollections } = result.data as { collections: WishlistCollection[] };
        setCollections(updatedCollections);
        
        toast.success('Collection updated');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Update collection error:', error);
      return { success: false, error: 'Failed to update collection' };
    }
  };

  const deleteCollection = async (collectionId: string) => {
    try {
      const result = await apiRequest(`/wishlist/collections/${collectionId}`, {
        method: 'DELETE'
      });

      if (result.success) {
        const { collections: updatedCollections } = result.data as { collections: WishlistCollection[] };
        setCollections(updatedCollections);
        
        toast.success('Collection deleted');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Delete collection error:', error);
      return { success: false, error: 'Failed to delete collection' };
    }
  };

  // Item Updates
  const updateItemSettings = async (
    itemId: string,
    settings: {
      notifyOnDiscount?: boolean;
      notifyOnRestock?: boolean;
      targetPrice?: number;
      notes?: string;
    }
  ) => {
    try {
      const result = await apiRequest(`/wishlist/items/${itemId}`, {
        method: 'PATCH',
        data: settings
      });

      if (result.success) {
        const { wishlist } = result.data as { wishlist: WishlistItem[] };
        setItems(wishlist);
        
        toast.success('Item settings updated');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Update item settings error:', error);
      return { success: false, error: 'Failed to update item settings' };
    }
  };

  const markAsViewed = async (itemId: string) => {
    try {
      await apiRequest(`/wishlist/items/${itemId}/viewed`, { method: 'POST' });
      
      // Update local state
      setItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, viewedAt: new Date().toISOString() }
            : item
        )
      );
      
      // Track interaction
      trackInteraction('view', itemId);
      
      return { success: true };
    } catch (error) {
      console.error('Mark as viewed error:', error);
      return { success: false, error: 'Failed to mark as viewed' };
    }
  };

  // Filtering & Sorting
  const getItemsByCollection = useCallback((collectionId?: string): WishlistItem[] => {
    if (!collectionId) return items;
    // This would require collection-item mapping from API
    return items;
  }, [items]);

  const getAvailableItems = useCallback((): WishlistItem[] => {
    return items.filter(item => item.isAvailable && item.inStock);
  }, [items]);

  const getUnavailableItems = useCallback((): WishlistItem[] => {
    return items.filter(item => !item.isAvailable || !item.inStock);
  }, [items]);

  const getDiscountedItems = useCallback((): WishlistItem[] => {
    return items.filter(item => item.discount && item.discount > 0);
  }, [items]);

  // Comparison
  const addToComparison = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    if (comparisonItems.length >= MAX_COMPARISON_ITEMS) {
      toast.error(`You can only compare up to ${MAX_COMPARISON_ITEMS} items`);
      return;
    }
    
    if (comparisonItems.some(i => i.id === itemId)) {
      toast.error('Item is already in comparison');
      return;
    }
    
    setComparisonItems(prev => [...prev, item]);
    comparisonStorage.setValue([...comparisonStorage.value, itemId]);
    toast.success('Item added to comparison');
  }, [items, comparisonItems, comparisonStorage]);

  const removeFromComparison = useCallback((itemId: string) => {
    setComparisonItems(prev => prev.filter(item => item.id !== itemId));
    comparisonStorage.setValue(comparisonStorage.value.filter(id => id !== itemId));
    toast.success('Item removed from comparison');
  }, [comparisonStorage]);

  const clearComparison = useCallback(() => {
    setComparisonItems([]);
    comparisonStorage.remove();
    toast.success('Comparison cleared');
  }, [comparisonStorage]);

  // Sharing
  const shareCollection = async (collectionId: string) => {
    try {
      const result = await apiRequest(`/wishlist/collections/${collectionId}/share`, {
        method: 'POST'
      });

      if (result.success) {
        const { shareUrl } = result.data as { shareUrl: string };
        
        // Copy to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Share link copied to clipboard');
        }
        
        return { success: true, shareUrl };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Share collection error:', error);
      return { success: false, error: 'Failed to share collection' };
    }
  };

  const getSharedCollection = async (shareToken: string) => {
    try {
      const result = await apiRequest(`/wishlist/shared/${shareToken}`);

      if (result.success) {
        const { collection, items: sharedItems } = result.data as {
          collection: WishlistCollection;
          items: WishlistItem[];
        };
        return { success: true, collection, items: sharedItems };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get shared collection error:', error);
      return { success: false, error: 'Failed to get shared collection' };
    }
  };

  // Analytics
  const getRecommendations = async () => {
    try {
      const result = await apiRequest('/wishlist/recommendations');

      if (result.success) {
        const { products } = result.data as { products: unknown[] };
        return { success: true, products };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get recommendations error:', error);
      return { success: false, error: 'Failed to get recommendations' };
    }
  };

  const trackInteraction = useCallback((action: 'view' | 'add' | 'remove' | 'share', itemId?: string) => {
    analyticsQueue.current.push({
      action,
      itemId,
      timestamp: Date.now()
    });
    
    // Send analytics in batches
    if (analyticsQueue.current.length >= 10) {
      // Send to analytics service
      analyticsQueue.current = [];
    }
  }, []);

  // Sync & Persistence
  const refreshWishlist = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const result = await apiRequest('/wishlist');
        
        if (result.success) {
          const { wishlist, collections: userCollections } = result.data as {
            wishlist: WishlistItem[];
            collections: WishlistCollection[];
          };
          setItems(wishlist);
          setCollections(userCollections);
        }
      } else {
        // For guest users, load from localStorage
        const guestWishlist = guestWishlistStorage.value || [];
        setItems(guestWishlist);
      }
    } catch (error) {
      console.error('Refresh wishlist error:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, apiRequest]);

  const syncWithServer = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const result = await apiRequest('/wishlist/sync', {
        method: 'POST',
        data: { items }
      });

      if (result.success) {
        const { wishlist, collections: syncedCollections } = result.data as {
          wishlist: WishlistItem[];
          collections: WishlistCollection[];
        };
        setItems(wishlist);
        setCollections(syncedCollections);
      }
    } catch (error) {
      console.error('Sync with server error:', error);
    }
  }, [isAuthenticated, items, apiRequest]);

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

  const mergeGuestWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const guestWishlist = guestWishlistStorage.value;
    if (!guestWishlist || guestWishlist.length === 0) return;
    
    try {
      const result = await apiRequest('/wishlist/merge', {
        method: 'POST',
        data: { guestWishlist }
      });

      if (result.success) {
        const { wishlist, collections: mergedCollections } = result.data as {
          wishlist: WishlistItem[];
          collections: WishlistCollection[];
        };
        setItems(wishlist);
        setCollections(mergedCollections);
        
        // Clear guest wishlist after merge
        guestWishlistStorage.remove();
        
        if (wishlist.length > guestWishlist.length) {
          toast.success('Guest wishlist merged with your account');
        }
      }
    } catch (error) {
      console.error('Merge guest wishlist error:', error);
    }
  }, [isAuthenticated, guestWishlistStorage, apiRequest]);

  // Cart Integration
  const addToCart = async (itemId: string, quantity = 1) => {
    try {
      const result = await apiRequest('/cart/add-from-wishlist', {
        method: 'POST',
        data: { itemId, quantity }
      });

      if (result.success) {
        toast.success('Item added to cart');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, error: 'Failed to add item to cart' };
    }
  };

  const addAllToCart = async (collectionId?: string) => {
    try {
      const itemsToAdd = collectionId ? getItemsByCollection(collectionId) : getAvailableItems();
      
      const result = await apiRequest('/cart/add-multiple-from-wishlist', {
        method: 'POST',
        data: { itemIds: itemsToAdd.map(item => item.id) }
      });

      if (result.success) {
        toast.success(`${itemsToAdd.length} items added to cart`);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Add all to cart error:', error);
      return { success: false, error: 'Failed to add items to cart' };
    }
  };

  // Load comparison items from storage
  useEffect(() => {
    const savedComparisonIds = comparisonStorage.value || [];
    const comparisonItemsFromIds = items.filter(item => savedComparisonIds.includes(item.id));
    setComparisonItems(comparisonItemsFromIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Initialize wishlist
  useEffect(() => {
    const initializeWishlist = async () => {
      setIsLoading(true);
      try {
        await refreshWishlist();
        
        // Merge guest wishlist if user just logged in
        if (isAuthenticated && guestWishlistStorage.value && guestWishlistStorage.value.length > 0) {
          await mergeGuestWishlist();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeout.current) {
        clearTimeout(syncTimeout.current);
      }
    };
  }, []);
  
  // Use debouncedSync when items change
  useEffect(() => {
    if (items.length > 0 && isAuthenticated) {
      debouncedSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isAuthenticated]);
  
  // Use user data for analytics and personalization
  useEffect(() => {
    if (userId && items.length > 0) {
      // Track user wishlist behavior
      console.log(`User ${userId} (${userEmail}) has ${items.length} items in wishlist`);
      
      // Example: Send analytics data
      const wishlistAnalytics = {
        userId,
        userEmail,
        itemCount: items.length,
        collections: collections.length,
        timestamp: new Date().toISOString()
      };
      console.log('Wishlist Analytics:', wishlistAnalytics);
    }
  }, [userId, userEmail, items.length, collections.length]);

  // Context value
  const contextValue: WishlistContextType = {
    // Wishlist State
    items,
    collections,
    isLoading,
    isUpdating,
    totalItems: items.length,
    
    // Item Actions
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    
    // Bulk Operations
    addMultipleToWishlist,
    removeMultipleFromWishlist,
    moveItemsToCollection,
    
    // Collection Management
    createCollection,
    updateCollection,
    deleteCollection,
    
    // Item Updates
    updateItemSettings,
    markAsViewed,
    
    // Filtering & Sorting
    getItemsByCollection,
    getAvailableItems,
    getUnavailableItems,
    getDiscountedItems,
    
    // Comparison
    addToComparison,
    removeFromComparison,
    clearComparison,
    comparisonItems,
    
    // Sharing
    shareCollection,
    getSharedCollection,
    
    // Analytics
    getRecommendations,
    trackInteraction,
    
    // Sync & Persistence
    refreshWishlist,
    syncWithServer,
    mergeGuestWishlist,
    
    // Cart Integration
    addToCart,
    addAllToCart,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;

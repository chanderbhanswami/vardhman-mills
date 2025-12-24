/**
 * useWishlist Hook
 * 
 * Custom hook for wishlist management
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from './useToast';
import type { Product } from '@/types';

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: Date;
}

export interface UseWishlistReturn {
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  addItem: (product: Product) => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>; // Alias for addItem
  removeItem: (itemId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>; // Remove by product ID
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const ignoreNextUpdate = useRef(false);
  const { toast } = useToast();

  // Load wishlist from localStorage on mount and listen for updates
  useEffect(() => {
    const loadWishlist = () => {
      const savedWishlist = localStorage.getItem('vardhman_wishlist');
      if (savedWishlist) {
        try {
          // Prevent loop: do not trigger save/dispatch when loading from storage
          ignoreNextUpdate.current = true;
          setItems(JSON.parse(savedWishlist));
        } catch (error) {
          console.error('Failed to load wishlist:', error);
        }
      }
      setIsInitialized(true);
    };

    loadWishlist();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vardhman_wishlist') {
        loadWishlist();
      }
    };

    window.addEventListener('storage', handleStorage);
    // Custom event for same-tab sync
    window.addEventListener('vardhman_wishlist_updated', loadWishlist);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('vardhman_wishlist_updated', loadWishlist);
    };
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;

    // If update came from storage/event, don't save back or dispatch
    if (ignoreNextUpdate.current) {
      ignoreNextUpdate.current = false;
      return;
    }

    localStorage.setItem('vardhman_wishlist', JSON.stringify(items));
    window.dispatchEvent(new Event('vardhman_wishlist_updated'));
  }, [items, isInitialized]);

  const addItem = useCallback(async (product: Product) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setItems(prev => {
        // Check if already in wishlist
        if (prev.some(item => item.productId === product.id)) {
          return prev;
        }

        const newItem: WishlistItem = {
          id: `wishlist-${Date.now()}`,
          productId: product.id,
          product,
          addedAt: new Date(),
        };

        return [...prev, newItem];
      });

      toast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to your wishlist`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to wishlist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setItems(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setItems([]);

      toast({
        title: 'Wishlist cleared',
        description: 'All items have been removed from your wishlist',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear wishlist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.productId === productId);
  }, [items]);

  const toggleWishlist = useCallback(async (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id);

    if (existingItem) {
      await removeItem(existingItem.id);
    } else {
      await addItem(product);
    }
  }, [items, addItem, removeItem]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    const existingItem = items.find(item => item.productId === productId);
    if (existingItem) {
      await removeItem(existingItem.id);
    }
  }, [items, removeItem]);

  const itemCount = items.length;

  return {
    items,
    itemCount,
    isLoading,
    addItem,
    addToWishlist: addItem, // Alias for addItem for backward compatibility
    removeItem,
    removeFromWishlist, // Remove by product ID
    clearWishlist,
    isInWishlist,
    toggleWishlist,
  };
}

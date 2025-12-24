/**
 * useSaveForLater Hook
 * 
 * Custom hook for Save For Later functionality with cross-component sync
 * NOTE: This hook does NOT depend on useCart to avoid circular dependencies
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from './useToast';
import type { Product } from '@/types';

const STORAGE_KEY = 'vardhman_saved_for_later';
const UPDATE_EVENT = 'vardhman_sfl_updated';

export interface SavedItem {
    id: string;
    productId: string;
    product: Product;
    price: number;
    originalPrice?: number;
    color?: string;
    size?: string;
    fabric?: string;
    savedAt: Date;
}

export interface UseSaveForLaterReturn {
    items: SavedItem[];
    itemCount: number;
    isLoading: boolean;
    saveItem: (item: {
        id: string;
        productId: string;
        product: Product;
        price: number;
        originalPrice?: number;
        color?: string;
        size?: string;
        fabric?: string;
    }) => void;
    moveToCart: (itemId: string) => SavedItem | null;
    removeItem: (itemId: string) => void;
    isInSaveForLater: (productId: string) => boolean;
    clearAll: () => void;
}

export function useSaveForLater(): UseSaveForLaterReturn {
    const [items, setItems] = useState<SavedItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const { toast } = useToast();

    // Load from localStorage on mount
    useEffect(() => {
        const loadItems = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const loadedItems: SavedItem[] = (Array.isArray(parsed) ? parsed : []).map((item: any) => ({
                        id: item.id,
                        productId: item.productId || item.product?.id,
                        product: item.product || {},
                        price: typeof item.price === 'number' ? item.price : 0,
                        originalPrice: item.originalPrice,
                        color: item.color,
                        size: item.size,
                        fabric: item.fabric,
                        savedAt: item.savedAt ? new Date(item.savedAt) : new Date(),
                    }));
                    setItems(loadedItems);
                }
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to load saved items:', error);
                setIsInitialized(true);
            }
        };

        loadItems();

        // Listen for storage events from other tabs
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadItems();
            }
        };

        // Listen for custom events from same-tab components
        const handleCustomEvent = () => loadItems();

        window.addEventListener('storage', handleStorageEvent);
        window.addEventListener(UPDATE_EVENT, handleCustomEvent);

        return () => {
            window.removeEventListener('storage', handleStorageEvent);
            window.removeEventListener(UPDATE_EVENT, handleCustomEvent);
        };
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        if (!isInitialized) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        window.dispatchEvent(new Event(UPDATE_EVENT));
    }, [items, isInitialized]);

    // Save an item to the list (caller is responsible for removing from cart)
    const saveItem = useCallback((item: {
        id: string;
        productId: string;
        product: Product;
        price: number;
        originalPrice?: number;
        color?: string;
        size?: string;
        fabric?: string;
    }) => {
        // Ensure productId is defined
        const productId = item.productId || item.product?.id || item.id;

        setItems(prev => {
            // Check if already saved (using functional update to avoid stale closure)
            if (prev.some(existing => existing.productId === productId)) {
                toast({
                    title: 'Already saved',
                    description: 'This item is already in your saved list',
                    variant: 'default',
                });
                return prev; // Return unchanged
            }

            // Create saved item with new ID
            const savedItem: SavedItem = {
                id: `sfl-${Date.now()}`,
                productId,
                product: item.product,
                price: item.price,
                originalPrice: item.originalPrice,
                color: item.color,
                size: item.size,
                fabric: item.fabric,
                savedAt: new Date(),
            };

            toast({
                title: 'Saved for later',
                description: `${item.product?.name || 'Item'} has been saved for later`,
                variant: 'success',
            });

            return [...prev, savedItem];
        });
    }, [toast]);

    // Move item from SFL back to cart - returns the item so caller can add to cart
    const moveToCart = useCallback((itemId: string): SavedItem | null => {
        const item = items.find(i => i.id === itemId);
        if (!item) return null;

        // Remove from saved list
        setItems(prev => prev.filter(i => i.id !== itemId));

        toast({
            title: 'Moved to cart',
            description: `${item.product?.name || 'Item'} has been added to your cart`,
            variant: 'success',
        });

        return item;
    }, [items, toast]);

    const removeItem = useCallback((itemId: string) => {
        setItems(prev => prev.filter(item => item.id !== itemId));

        toast({
            title: 'Removed',
            description: 'Item has been removed from your saved list',
            variant: 'success',
        });
    }, [toast]);

    const isInSaveForLater = useCallback((productId: string) => {
        return items.some(item => item.productId === productId);
    }, [items]);

    const clearAll = useCallback(() => {
        setItems([]);
        toast({
            title: 'Cleared',
            description: 'All saved items have been removed',
            variant: 'success',
        });
    }, [toast]);

    return {
        items,
        itemCount: items.length,
        isLoading,
        saveItem,
        moveToCart,
        removeItem,
        isInSaveForLater,
        clearAll,
    };
}

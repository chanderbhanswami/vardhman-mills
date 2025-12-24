'use client';

import { useEffect, useCallback, useState } from 'react';
import type { Product } from '@/types/product.types';

// Type for recently viewed product with timestamp
export interface RecentProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating?: number;
    reviewCount?: number;
    inStock: boolean;
    viewedAt: string;
}

const STORAGE_KEY = 'vardhman_recently_viewed';
const MAX_PRODUCTS = 20;

/**
 * Custom hook for managing recently viewed products
 * Persists data to localStorage and provides methods to add/remove products
 */
export function useRecentlyViewed() {
    const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as RecentProduct[];
                setRecentProducts(parsed);
            }
        } catch (error) {
            console.error('Failed to load recently viewed products:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage whenever products change
    useEffect(() => {
        if (!isLoaded) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentProducts));
        } catch (error) {
            console.error('Failed to save recently viewed products:', error);
        }
    }, [recentProducts, isLoaded]);

    /**
     * Add a product to recently viewed
     * If product already exists, move it to the front and update timestamp
     */
    const addProduct = useCallback((product: Product) => {
        if (!product?.id) return;

        const newProduct: RecentProduct = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.pricing?.salePrice?.amount || product.pricing?.basePrice?.amount || 0,
            originalPrice: product.pricing?.compareAtPrice?.amount,
            image: product.media?.images?.[0]?.url || '/images/placeholder.jpg',
            category: product.category?.name || 'Uncategorized',
            rating: product.rating?.average || product.averageRating,
            reviewCount: product.rating?.count || product.reviewCount || product.totalReviews,
            inStock: product.inventory?.isInStock ?? true,
            viewedAt: new Date().toISOString(),
        };

        setRecentProducts((prev) => {
            // Remove existing entry if present
            const filtered = prev.filter((p) => p.id !== product.id);
            // Add to front and limit to max
            const updated = [newProduct, ...filtered].slice(0, MAX_PRODUCTS);
            return updated;
        });

        console.log('Added to recently viewed:', product.name);
    }, []);

    /**
     * Remove a product from recently viewed
     */
    const removeProduct = useCallback((productId: string) => {
        setRecentProducts((prev) => prev.filter((p) => p.id !== productId));
        console.log('Removed from recently viewed:', productId);
    }, []);

    /**
     * Clear all recently viewed products
     */
    const clearAll = useCallback(() => {
        setRecentProducts([]);
        console.log('Cleared all recently viewed products');
    }, []);

    /**
     * Check if a product is in recently viewed
     */
    const isRecentlyViewed = useCallback(
        (productId: string) => {
            return recentProducts.some((p) => p.id === productId);
        },
        [recentProducts]
    );

    return {
        recentProducts,
        addProduct,
        removeProduct,
        clearAll,
        isRecentlyViewed,
        isLoaded,
        count: recentProducts.length,
    };
}

export default useRecentlyViewed;

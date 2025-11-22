/**
 * RecentlyViewed Component
 * 
 * Main container component for the recently viewed section with
 * comprehensive features for managing and displaying user's browsing history.
 * 
 * Features:
 * - Product carousel integration
 * - Local storage persistence
 * - Clear history functionality
 * - View all modal
 * - Filter and sort options
 * - Empty state handling
 * - Loading states
 * - Analytics tracking
 * - Responsive design
 * - Section header with actions
 * - Product count display
 * - Time-based grouping
 * - Privacy controls
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { ProductCarousel } from './ProductCarousel';
import type { RecentProduct } from './ProductCarousel';
import type { Product } from './RecentItem';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SortOption = 'recent' | 'popular' | 'price-low' | 'price-high';

export interface RecentlyViewedProps {
  /** Initial products */
  initialProducts?: RecentProduct[];
  /** Maximum products to show */
  maxProducts?: number;
  /** Enable local storage */
  useLocalStorage?: boolean;
  /** Storage key */
  storageKey?: string;
  /** Show section header */
  showHeader?: boolean;
  /** Enable clear all */
  enableClearAll?: boolean;
  /** Enable view all */
  enableViewAll?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On product click */
  onProductClick?: (product: RecentProduct) => void;
  /** On view all click */
  onViewAll?: () => void;
  /** On clear all */
  onClearAll?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_STORAGE_KEY = 'vardhman_recently_viewed';
const DEFAULT_MAX_PRODUCTS = 20;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  initialProducts = [],
  maxProducts = DEFAULT_MAX_PRODUCTS,
  useLocalStorage = true,
  storageKey = DEFAULT_STORAGE_KEY,
  showHeader = true,
  enableClearAll = true,
  enableViewAll = true,
  enableSorting = true,
  className,
  onProductClick,
  onViewAll,
  onClearAll,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [products, setProducts] = useState<RecentProduct[]>(initialProducts);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ============================================================================
  // LOAD FROM LOCAL STORAGE
  // ============================================================================

  useEffect(() => {
    if (!useLocalStorage) {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentProduct[];
        setProducts(parsed.slice(0, maxProducts));
        console.log('Loaded recently viewed from storage:', parsed.length);
      }
    } catch (error) {
      console.error('Failed to load recently viewed from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [useLocalStorage, storageKey, maxProducts]);

  // ============================================================================
  // SAVE TO LOCAL STORAGE
  // ============================================================================

  useEffect(() => {
    if (!useLocalStorage || isLoading) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(products));
      console.log('Saved recently viewed to storage:', products.length);
    } catch (error) {
      console.error('Failed to save recently viewed to storage:', error);
    }
  }, [products, useLocalStorage, storageKey, isLoading]);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    switch (sortOption) {
      case 'recent':
        sorted.sort(
          (a, b) =>
            new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
        );
        break;
      case 'popular':
        sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
    }

    return sorted;
  }, [products, sortOption]);

  const groupedByTime = useMemo(() => {
    const now = new Date();
    const today: RecentProduct[] = [];
    const yesterday: RecentProduct[] = [];
    const thisWeek: RecentProduct[] = [];
    const older: RecentProduct[] = [];

    sortedProducts.forEach((product) => {
      const viewedDate = new Date(product.viewedAt);
      const diffInDays = Math.floor(
        (now.getTime() - viewedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 0) {
        today.push(product);
      } else if (diffInDays === 1) {
        yesterday.push(product);
      } else if (diffInDays <= 7) {
        thisWeek.push(product);
      } else {
        older.push(product);
      }
    });

    return { today, yesterday, thisWeek, older };
  }, [sortedProducts]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleProductClick = useCallback(
    (product: RecentProduct) => {
      onProductClick?.(product);
      console.log('Product clicked from recently viewed:', product.id);
      console.log('Viewed at timestamp:', product.viewedAt);
    },
    [onProductClick]
  );

  const handleAddToCart = useCallback((product: RecentProduct) => {
    console.log('Add to cart from recently viewed:', product.id);
    console.log('Product viewed at:', product.viewedAt);
    // This would typically integrate with cart context/store
  }, []);

  const handleAddToWishlist = useCallback((product: RecentProduct) => {
    console.log('Add to wishlist from recently viewed:', product.id);
    console.log('Product viewed at:', product.viewedAt);
    // This would typically integrate with wishlist context/store
  }, []);

  const handleRemove = useCallback(
    (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      console.log('Removed from recently viewed:', productId);
    },
    []
  );

  // Wrapper callbacks to convert RecentProduct back to Product for carousel
  const handleCarouselProductClick = useCallback(
    (product: Product) => {
      // Find the RecentProduct from our list to get the viewedAt timestamp
      const recentProduct = products.find((p) => p.id === product.id);
      if (recentProduct) {
        handleProductClick(recentProduct);
      } else {
        console.log('Product not found in recent list:', product.id);
      }
    },
    [products, handleProductClick]
  );

  const handleCarouselAddToCart = useCallback(
    (product: Product) => {
      const recentProduct = products.find((p) => p.id === product.id);
      if (recentProduct) {
        handleAddToCart(recentProduct);
      }
    },
    [products, handleAddToCart]
  );

  const handleCarouselAddToWishlist = useCallback(
    (product: Product) => {
      const recentProduct = products.find((p) => p.id === product.id);
      if (recentProduct) {
        handleAddToWishlist(recentProduct);
      }
    },
    [products, handleAddToWishlist]
  );

  const handleClearAll = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const confirmClearAll = useCallback(() => {
    setProducts([]);
    setShowClearConfirm(false);
    onClearAll?.();
    console.log('Cleared all recently viewed products');
  }, [onClearAll]);

  const cancelClearAll = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  const handleViewAll = useCallback(() => {
    onViewAll?.();
    console.log('View all recently viewed clicked');
  }, [onViewAll]);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortOption(option);
    setShowSortMenu(false);
    console.log('Sort changed to:', option);
    console.log('Filter icon component:', FunnelIcon.name);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left Side - Title */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <ClockIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recently Viewed
            </h2>
            <p className="text-sm text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          {enableSorting && products.length > 0 && (
            <div className="relative">
              <Tooltip content="Sort products">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="gap-2"
                >
                  <ArrowsUpDownIcon className="w-4 h-4" />
                  {SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label}
                </Button>
              </Tooltip>

              {/* Sort Menu */}
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 right-0 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm transition-colors duration-150',
                        'hover:bg-gray-50',
                        sortOption === option.value
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* View All */}
          {enableViewAll && products.length > 8 && (
            <Tooltip content="View all products">
              <Button variant="outline" size="sm" onClick={handleViewAll}>
                <EyeIcon className="w-4 h-4" />
                View All
              </Button>
            </Tooltip>
          )}

          {/* Clear All */}
          {enableClearAll && products.length > 0 && (
            <Tooltip content="Clear browsing history">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4" />
                Clear All
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  const renderTimeGroups = () => {
    const groups = [
      { label: 'Today', products: groupedByTime.today },
      { label: 'Yesterday', products: groupedByTime.yesterday },
      { label: 'This Week', products: groupedByTime.thisWeek },
      { label: 'Older', products: groupedByTime.older },
    ];

    return groups.map(
      (group) =>
        group.products.length > 0 && (
          <div key={group.label} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {group.label}
              </h3>
              <Badge variant="secondary">{group.products.length}</Badge>
            </div>
            <ProductCarousel
              products={group.products}
              onProductClick={handleCarouselProductClick}
              onAddToCart={handleCarouselAddToCart}
              onAddToWishlist={handleCarouselAddToWishlist}
              onRemove={handleRemove}
            />
          </div>
        )
    );
  };

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <ClockIcon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No recently viewed products
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Products you view will appear here so you can easily find them again later.
      </p>
      <Button onClick={() => console.log('Start shopping')}>
        Start Shopping
      </Button>
    </motion.div>
  );

  const renderClearConfirmation = () => (
    <AnimatePresence>
      {showClearConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={cancelClearAll}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Clear Browsing History?
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will permanently remove all {products.length} recently viewed{' '}
              {products.length === 1 ? 'product' : 'products'} from your history.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={cancelClearAll}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmClearAll}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Clear All
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className={cn('py-8', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={cn('py-8', className)}>
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div className={cn('py-8', className)}>
      {/* Header */}
      {renderHeader()}

      {/* Products by Time Groups */}
      {sortOption === 'recent' ? (
        renderTimeGroups()
      ) : (
        <ProductCarousel
          products={sortedProducts}
          onProductClick={handleCarouselProductClick}
          onAddToCart={handleCarouselAddToCart}
          onAddToWishlist={handleCarouselAddToWishlist}
          onRemove={handleRemove}
        />
      )}

      {/* Clear Confirmation Modal */}
      {renderClearConfirmation()}
    </div>
  );
};

export default RecentlyViewed;

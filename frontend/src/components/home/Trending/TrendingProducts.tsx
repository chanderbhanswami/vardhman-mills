/**
 * TrendingProducts Component
 * 
 * Main container component for trending products section with
 * comprehensive filtering, sorting, and display options.
 * 
 * Features:
 * - Product grid layout
 * - Filter by category
 * - Sort options (rank, price, popularity)
 * - Load more pagination
 * - View toggle (grid/list)
 * - Search within trending
 * - Responsive grid
 * - Loading states
 * - Empty state
 * - Analytics tracking
 * - Export functionality
 * - Share trending list
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowsUpDownIcon,
  FireIcon,
  ShareIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { TrendingCard } from './TrendingCard';
import type { TrendingProduct } from './TrendingCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SortOption =
  | 'rank'
  | 'popularity'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'growth';

export type ViewMode = 'grid' | 'list';

export interface TrendingProductsProps {
  /** Initial products */
  initialProducts?: TrendingProduct[];
  /** Products per page */
  productsPerPage?: number;
  /** Available categories */
  categories?: string[];
  /** Show filters */
  showFilters?: boolean;
  /** Show search */
  showSearch?: boolean;
  /** Enable view toggle */
  enableViewToggle?: boolean;
  /** Default view mode */
  defaultView?: ViewMode;
  /** Additional CSS classes */
  className?: string;
  /** On product click */
  onProductClick?: (product: TrendingProduct) => void;
  /** On filter change */
  onFilterChange?: (category: string | null) => void;
  /** On sort change */
  onSortChange?: (sort: SortOption) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rank', label: 'Trending Rank' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'growth', label: 'Fastest Growing' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const TrendingProducts: React.FC<TrendingProductsProps> = ({
  initialProducts = [],
  productsPerPage = 12,
  categories = [],
  showFilters = true,
  showSearch = true,
  enableViewToggle = true,
  defaultView = 'grid',
  className,
  onProductClick,
  onFilterChange,
  onSortChange,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [products, setProducts] = useState<TrendingProduct[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('rank');
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [displayCount, setDisplayCount] = useState(productsPerPage);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // FILTERED & SORTED PRODUCTS
  // ============================================================================

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'rank':
          return a.rank - b.rank;
        case 'popularity':
          return b.views - a.views;
        case 'growth':
          return b.growthRate - a.growthRate;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, selectedCategory, searchQuery, sortOption]);

  const displayedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, displayCount);
  }, [filteredAndSortedProducts, displayCount]);

  const hasMore = displayCount < filteredAndSortedProducts.length;

  // ============================================================================
  // CATEGORY COUNTS
  // ============================================================================

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCategoryFilter = useCallback(
    (category: string | null) => {
      setSelectedCategory(category);
      setDisplayCount(productsPerPage);
      onFilterChange?.(category);
      console.log('Category filter changed:', category);
    },
    [productsPerPage, onFilterChange]
  );

  const handleSortChange = useCallback(
    (option: SortOption) => {
      setSortOption(option);
      setShowSortMenu(false);
      onSortChange?.(option);
      console.log('Sort changed to:', option);
    },
    [onSortChange]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setDisplayCount(productsPerPage);
  }, [productsPerPage]);

  const handleLoadMore = useCallback(() => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setDisplayCount((prev) => prev + productsPerPage);
      setIsLoading(false);
      console.log('Loaded more products');
    }, 500);
  }, [productsPerPage]);

  const handleProductClick = useCallback(
    (product: TrendingProduct) => {
      onProductClick?.(product);
      console.log('Trending product clicked:', product.id, 'Rank:', product.rank);
    },
    [onProductClick]
  );

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    console.log('View mode changed to:', mode);
  }, []);

  const handleShare = useCallback(() => {
    console.log('Share trending products');
    // This would typically open a share dialog
  }, []);

  const handleExport = useCallback(() => {
    console.log('Export trending products list');
    console.log('Total products:', filteredAndSortedProducts.length);
    // This would typically trigger a CSV/PDF download
  }, [filteredAndSortedProducts]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Simulate initial load
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);

    // Update products when initialProducts change
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      console.log('Products updated:', initialProducts.length);
    }
  }, [initialProducts]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Left Side - Title */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-full p-2">
          <FireIcon className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trending Products</h2>
          <p className="text-sm text-gray-600">
            {filteredAndSortedProducts.length}{' '}
            {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View Toggle */}
        {enableViewToggle && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Tooltip content="Grid view">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => handleViewModeChange('grid')}
                className="h-8 w-8 p-0"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="List view">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => handleViewModeChange('list')}
                className="h-8 w-8 p-0"
              >
                <ListBulletIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        )}

        {/* Sort */}
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
              className="absolute top-full mt-2 right-0 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors duration-150',
                    'hover:bg-gray-50',
                    sortOption === option.value
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'text-gray-700'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Share */}
        <Tooltip content="Share trending list">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <ShareIcon className="w-4 h-4" />
          </Button>
        </Tooltip>

        {/* Export */}
        <Tooltip content="Export list">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <ArrowDownTrayIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );

  const renderFilters = () => {
    if (!showFilters && !showSearch) return null;

    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        {showSearch && (
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search trending products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Category Filter */}
        {showFilters && categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <FunnelIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <Button
              size="sm"
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => handleCategoryFilter(null)}
              className="whitespace-nowrap"
            >
              All Categories
              <Badge variant="secondary" className="ml-2">
                {products.length}
              </Badge>
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => handleCategoryFilter(category)}
                className="whitespace-nowrap"
              >
                {category}
                <Badge variant="secondary" className="ml-2">
                  {categoryCounts[category] || 0}
                </Badge>
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProducts = () => {
    if (isLoading && displayedProducts.length === 0) {
      return (
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          )}
        >
          {Array.from({ length: productsPerPage }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'bg-gray-200 rounded-xl animate-pulse',
                viewMode === 'grid' ? 'h-96' : 'h-48'
              )}
            />
          ))}
        </div>
      );
    }

    if (displayedProducts.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <FireIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No trending products found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery
              ? `No results for "${searchQuery}". Try adjusting your search.`
              : 'Check back later for new trending items.'}
          </p>
          {(searchQuery || selectedCategory) && (
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              Clear Filters
            </Button>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        layout
        className={cn(
          'grid gap-6',
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}
      >
        <AnimatePresence mode="popLayout">
          {displayedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <TrendingCard
                product={product}
                onProductClick={handleProductClick}
                compact={viewMode === 'list'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderLoadMore = () => {
    if (!hasMore) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mt-8"
      >
        <Button
          onClick={handleLoadMore}
          disabled={isLoading}
          size="lg"
          variant="outline"
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2"
              >
                <ArrowsUpDownIcon className="w-5 h-5" />
              </motion.div>
              Loading...
            </>
          ) : (
            <>
              Load More ({filteredAndSortedProducts.length - displayCount} remaining)
            </>
          )}
        </Button>
      </motion.div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('py-8', className)}>
      {/* Header */}
      {renderHeader()}

      {/* Filters */}
      {renderFilters()}

      {/* Products */}
      {renderProducts()}

      {/* Load More */}
      {renderLoadMore()}
    </div>
  );
};

export default TrendingProducts;

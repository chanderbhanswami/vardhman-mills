'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import SaleProductCard from './SaleProductCard';
import SaleEmptyState from './SaleEmptyState';
// import SaleSkeleton from './SaleSkeleton'; // TODO: Uncomment after creating SaleSkeleton
import { cn } from '@/lib/utils';
import type { Sale, SaleProduct } from '@/types/sale.types';

/**
 * Sale List Component Props
 */
interface SaleListProps {
  /**
   * Parent sale information
   */
  sale: Sale;

  /**
   * Array of sale products
   */
  products: SaleProduct[];

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Display mode
   * - grid: Grid layout
   * - list: List layout
   * - auto: Responsive (grid on desktop, list on mobile)
   */
  displayMode?: 'grid' | 'list' | 'auto';

  /**
   * Allow user to toggle display mode
   */
  allowDisplayToggle?: boolean;

  /**
   * Grid columns (for grid mode)
   */
  gridColumns?: 2 | 3 | 4 | 5;

  /**
   * Show sorting options
   */
  showSort?: boolean;

  /**
   * Show filters
   */
  showFilters?: boolean;

  /**
   * Show results count
   */
  showResultsCount?: boolean;

  /**
   * Sorting options
   */
  sortOptions?: SortOption[];

  /**
   * Current sort value
   */
  currentSort?: string;

  /**
   * Sort change callback
   */
  onSortChange?: (value: string) => void;

  /**
   * Filter toggle callback
   */
  onToggleFilters?: () => void;

  /**
   * Applied filters count (for filter badge)
   */
  appliedFiltersCount?: number;

  /**
   * Product action callbacks
   */
  onAddToCart?: (saleProduct: SaleProduct, quantity: number) => void;
  onQuickView?: (saleProduct: SaleProduct) => void;
  onProductClick?: (saleProduct: SaleProduct) => void;
  onToggleWishlist?: (productId: string) => void;

  /**
   * Wishlist product IDs
   */
  wishlistProductIds?: string[];

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Empty state props
   */
  emptyStateProps?: {
    type?: 'no-results' | 'filter-empty' | 'no-sales';
    searchQuery?: string;
    appliedFilters?: string[];
  };

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Sort Option
 */
interface SortOption {
  label: string;
  value: string;
}

/**
 * Default sort options
 */
const defaultSortOptions: SortOption[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Discount: High to Low', value: 'discount_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Best Selling', value: 'bestseller' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' },
];

/**
 * SaleList Component
 * 
 * Comprehensive list/grid component for displaying sale products with sorting and filtering.
 * Features:
 * - Grid/List view toggle
 * - Responsive layouts
 * - Sorting options
 * - Filter integration
 * - Results count
 * - Loading skeletons
 * - Empty states
 * - Animated transitions
 * - Product card integration
 * 
 * @example
 * ```tsx
 * <SaleList
 *   sale={sale}
 *   products={saleProducts}
 *   displayMode="grid"
 *   gridColumns={4}
 *   showSort
 *   onAddToCart={(product, qty) => handleAddToCart(product, qty)}
 * />
 * ```
 */
const SaleList: React.FC<SaleListProps> = ({
  sale,
  products,
  loading = false,
  displayMode: initialDisplayMode = 'auto',
  allowDisplayToggle = true,
  gridColumns = 4,
  showSort = true,
  showFilters = false,
  showResultsCount = true,
  sortOptions = defaultSortOptions,
  currentSort = 'featured',
  onSortChange,
  onToggleFilters,
  appliedFiltersCount = 0,
  onAddToCart,
  onQuickView,
  onProductClick,
  onToggleWishlist,
  wishlistProductIds = [],
  animated = true,
  emptyStateProps,
  className,
}) => {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>(
    initialDisplayMode === 'auto' ? 'grid' : initialDisplayMode
  );

  const handleSortChange = (value: string | number) => {
    if (onSortChange) {
      onSortChange(String(value));
    }
  };

  const listVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
  };

  // Determine grid column classes
  const gridColumnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Toolbar Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Products Skeleton */}
        <div className={cn(
          'grid gap-4 md:gap-6',
          displayMode === 'grid' ? gridColumnClasses[gridColumns] : 'grid-cols-1'
        )}>
          {Array.from({ length: displayMode === 'grid' ? gridColumns * 2 : 4 }).map((_, i) => (
            <div key={i} className={cn(
              'bg-gray-200 rounded-lg animate-pulse',
              displayMode === 'grid' ? 'h-96' : 'h-48'
            )} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className={className}>
        {/* Show toolbar even when empty */}
        {(showSort || showFilters || showResultsCount) && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {showResultsCount && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">0</span> products
              </p>
            )}
          </div>
        )}

        <SaleEmptyState
          type={emptyStateProps?.type || 'no-results'}
          searchQuery={emptyStateProps?.searchQuery}
          appliedFilters={emptyStateProps?.appliedFilters}
          variant="centered"
        />
      </div>
    );
  }

  // Render toolbar
  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Results count */}
      {showResultsCount && (
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{products.length}</span> product
          {products.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filters button */}
        {showFilters && onToggleFilters && (
          <Button
            onClick={onToggleFilters}
            variant="outline"
            size="sm"
            leftIcon={<FunnelIcon className="h-4 w-4" />}
            className="relative"
          >
            Filters
            {appliedFiltersCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                {appliedFiltersCount}
              </span>
            )}
          </Button>
        )}

        {/* Sort select */}
        {showSort && sortOptions.length > 0 && (
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label="Sort products"
              className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        {/* Display toggle */}
        {allowDisplayToggle && (
          <div className="flex items-center gap-1 rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => setDisplayMode('grid')}
              className={cn(
                'rounded p-1.5 transition-colors',
                displayMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              aria-label="Grid view"
              title="Grid view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={cn(
                'rounded p-1.5 transition-colors',
                displayMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              aria-label="List view"
              title="List view"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render products grid
  const renderGrid = () => {
    const GridContainer = animated ? motion.div : 'div';
    const GridItem = animated ? motion.div : 'div';

    const gridContainerProps = animated
      ? {
          variants: listVariants,
          initial: 'initial',
          animate: 'animate',
        }
      : {};

    const gridItemProps = animated
      ? {
          variants: itemVariants,
        }
      : {};

    return (
      <GridContainer
        {...gridContainerProps}
        className={cn('grid gap-4 md:gap-6', gridColumnClasses[gridColumns])}
      >
        {products.map((saleProduct) => (
          <GridItem key={saleProduct.productId} {...gridItemProps}>
            <SaleProductCard
              saleProduct={saleProduct}
              sale={sale}
              variant="default"
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              onClick={onProductClick}
              isInWishlist={wishlistProductIds.includes(saleProduct.productId)}
              onToggleWishlist={onToggleWishlist}
              animated={false} // Individual card animation disabled when list is animated
            />
          </GridItem>
        ))}
      </GridContainer>
    );
  };

  // Render products list
  const renderList = () => {
    const ListContainer = animated ? motion.div : 'div';
    const ListItem = animated ? motion.div : 'div';

    const listContainerProps = animated
      ? {
          variants: listVariants,
          initial: 'initial',
          animate: 'animate',
        }
      : {};

    const listItemProps = animated
      ? {
          variants: itemVariants,
        }
      : {};

    return (
      <ListContainer {...listContainerProps} className="space-y-4">
        {products.map((saleProduct) => (
          <ListItem key={saleProduct.productId} {...listItemProps}>
            <SaleProductCard
              saleProduct={saleProduct}
              sale={sale}
              variant="list"
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              onClick={onProductClick}
              isInWishlist={wishlistProductIds.includes(saleProduct.productId)}
              onToggleWishlist={onToggleWishlist}
              animated={false} // Individual card animation disabled when list is animated
            />
          </ListItem>
        ))}
      </ListContainer>
    );
  };

  return (
    <div className={className}>
      {/* Toolbar */}
      {(showSort || showFilters || showResultsCount || allowDisplayToggle) &&
        renderToolbar()}

      {/* Products */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {displayMode === 'grid' ? (
            <div key="grid">{renderGrid()}</div>
          ) : (
            <div key="list">{renderList()}</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SaleList;

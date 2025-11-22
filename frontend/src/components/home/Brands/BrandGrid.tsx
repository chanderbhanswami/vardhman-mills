/**
 * BrandGrid Component
 * 
 * Grid layout for displaying brand cards with filtering and sorting.
 * 
 * Features:
 * - Responsive grid layout
 * - Multiple grid variants
 * - Filtering capabilities
 * - Sorting options
 * - Search functionality
 * - Loading states
 * - Empty states
 * - Pagination support
 * - View mode toggle
 * - Animated transitions
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';
import { BrandCard } from './BrandCard';
import type { Brand } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BrandGridProps {
  /** Brands to display */
  brands: Brand[];
  /** Grid variant */
  variant?: 'grid' | 'masonry' | 'list';
  /** Enable filtering */
  enableFiltering?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Enable search */
  enableSearch?: boolean;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Items per page */
  itemsPerPage?: number;
  /** Default view mode */
  defaultView?: 'grid' | 'list';
  /** Show view toggle */
  showViewToggle?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On brand click */
  onBrandClick?: (brand: Brand) => void;
  /** On brand follow */
  onBrandFollow?: (brandId: string) => void;
  /** On brand quick view */
  onBrandQuickView?: (brand: Brand) => void;
  /** On filter change */
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  search: string;
  featured: boolean;
  minProducts: number;
}

type SortOption = 'name-asc' | 'name-desc' | 'products-desc' | 'products-asc' | 'newest' | 'popular';

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'products-desc', label: 'Most Products' },
  { value: 'products-asc', label: 'Least Products' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

const DEFAULT_FILTERS: FilterState = {
  search: '',
  featured: false,
  minProducts: 0,
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const BrandGrid: React.FC<BrandGridProps> = ({
  brands,
  variant = 'grid',
  enableFiltering = true,
  enableSorting = true,
  enableSearch = true,
  enablePagination = true,
  itemsPerPage = 12,
  defaultView = 'grid',
  showViewToggle = true,
  animated = true,
  className,
  onBrandClick,
  onBrandFollow,
  onBrandQuickView,
  onFilterChange,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredBrands = useMemo(() => {
    let result = [...brands];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        brand =>
          brand.name.toLowerCase().includes(query) ||
          brand.description?.toLowerCase().includes(query)
      );
    }

    // Featured filter
    if (filters.featured) {
      result = result.filter(brand => brand.isFeatured);
    }

    // Min products filter
    if (filters.minProducts > 0) {
      result = result.filter(brand => brand.productCount >= filters.minProducts);
    }

    return result;
  }, [brands, filters]);

  const sortedBrands = useMemo(() => {
    const result = [...filteredBrands];

    switch (sortBy) {
      case 'name-asc':
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return result.sort((a, b) => b.name.localeCompare(a.name));
      case 'products-desc':
        return result.sort((a, b) => b.productCount - a.productCount);
      case 'products-asc':
        return result.sort((a, b) => a.productCount - b.productCount);
      case 'newest':
        return result.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      case 'popular':
        return result.sort((a, b) => 
          (b.followersCount || 0) - (a.followersCount || 0)
        );
      default:
        return result;
    }
  }, [filteredBrands, sortBy]);

  const paginatedBrands = useMemo(() => {
    if (!enablePagination) return sortedBrands;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedBrands.slice(startIndex, endIndex);
  }, [sortedBrands, currentPage, itemsPerPage, enablePagination]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedBrands.length / itemsPerPage);
  }, [sortedBrands.length, itemsPerPage]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.featured) count++;
    if (filters.minProducts > 0) count++;
    return count;
  }, [filters]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  const handleFeaturedToggle = useCallback(() => {
    setFilters(prev => ({ ...prev, featured: !prev.featured }));
  }, []);

  const handleMinProductsChange = useCallback((value: number) => {
    setFilters(prev => ({ ...prev, minProducts: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setSortBy('name-asc');
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortBy(value);
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSearchBar = useCallback(() => {
    if (!enableSearch) return null;

    return (
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search brands..."
          className={cn(
            'w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600',
            'rounded-lg bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-white',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-colors'
          )}
          aria-label="Search brands"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }, [enableSearch, searchQuery, handleSearch]);

  const renderFilters = useCallback(() => {
    if (!enableFiltering || !showFilters) return null;

    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="mb-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
      >
        <div className="space-y-4">
          {/* Featured Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured-filter"
              checked={filters.featured}
              onChange={handleFeaturedToggle}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="featured-filter"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Show only featured brands
            </label>
          </div>

          {/* Min Products */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Products: {filters.minProducts}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={filters.minProducts}
              onChange={e => handleMinProductsChange(Number(e.target.value))}
              className="w-full"
              aria-label="Minimum products filter"
            />
          </div>
        </div>
      </motion.div>
    );
  }, [enableFiltering, showFilters, filters, handleFeaturedToggle, handleMinProductsChange]);

  const renderToolbar = useCallback(() => {
    console.log('Rendering toolbar with view mode:', viewMode, 'and variant:', variant);
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left Side */}
        <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
          {renderSearchBar()}

          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {sortedBrands.length} {sortedBrands.length === 1 ? 'brand' : 'brands'}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          {enableFiltering && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(prev => !prev)}
              className="relative"
              aria-label="Toggle filters"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="default"
                  className="ml-2 bg-blue-600 text-white"
                  size="sm"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Sort Dropdown */}
          {enableSorting && (
            <select
              value={sortBy}
              onChange={e => handleSortChange(e.target.value as SortOption)}
              className={cn(
                'px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'transition-colors'
              )}
              aria-label="Sort brands"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* View Toggle */}
          {showViewToggle && (
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className={cn('p-2', viewMode === 'grid' && 'bg-blue-600 text-white')}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className={cn('p-2', viewMode === 'list' && 'bg-blue-600 text-white')}
                aria-label="List view"
              >
                <ListBulletIcon className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              aria-label="Reset filters"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    );
  }, [
    renderSearchBar,
    sortedBrands.length,
    enableFiltering,
    activeFilterCount,
    enableSorting,
    sortBy,
    handleSortChange,
    showViewToggle,
    viewMode,
    handleViewModeChange,
    handleResetFilters,
    variant,
  ]);

  const renderGrid = useCallback(() => {
    if (paginatedBrands.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            No brands found matching your criteria
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      );
    }

    const gridClasses = cn(
      viewMode === 'grid' &&
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
      viewMode === 'list' && 'flex flex-col gap-4'
    );

    const cardVariant = viewMode === 'list' ? 'horizontal' : 'default';

    return (
      <motion.div
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        className={gridClasses}
      >
        <AnimatePresence mode="popLayout">
          {paginatedBrands.map(brand => (
            <motion.div
              key={brand.id}
              variants={animated ? itemVariants : undefined}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <BrandCard
                brand={brand}
                variant={cardVariant}
                animated={animated}
                onClick={onBrandClick}
                onFollow={onBrandFollow}
                onQuickView={onBrandQuickView}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }, [
    paginatedBrands,
    viewMode,
    animated,
    activeFilterCount,
    handleResetFilters,
    onBrandClick,
    onBrandFollow,
    onBrandQuickView,
  ]);

  const renderPagination = useCallback(() => {
    if (!enablePagination || totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          Previous
        </Button>

        {pages.map(page => {
          // Show first, last, current, and adjacent pages
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={cn(page === currentPage && 'bg-blue-600 text-white')}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </Button>
            );
          }

          // Show ellipsis
          if (page === currentPage - 2 || page === currentPage + 2) {
            return (
              <span key={page} className="px-2 text-gray-500">
                ...
              </span>
            );
          }

          return null;
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    );
  }, [enablePagination, totalPages, currentPage, handlePageChange]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('brand-grid', className)}>
      {/* Toolbar */}
      {renderToolbar()}

      {/* Filters */}
      {renderFilters()}

      {/* Grid */}
      {renderGrid()}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default BrandGrid;

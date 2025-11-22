/**
 * CollectionGrid Component
 * 
 * Comprehensive grid layout for displaying collections with advanced filtering,
 * sorting, search, and pagination.
 * 
 * Features:
 * - Responsive grid layout (1-4 columns)
 * - Advanced search functionality
 * - Type filtering (manual, automatic, seasonal, promotional)
 * - Date range filtering (active, upcoming, expired)
 * - Product count range filtering
 * - Multiple sorting options
 * - Grid/list view toggle
 * - Pagination with page numbers
 * - Loading states
 * - Empty states
 * - Active filter count
 * - Filter reset
 * 
 * @component
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';
import { CollectionCard } from './CollectionCard';
import type { Collection } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CollectionGridProps {
  /** Collections to display */
  collections: Collection[];
  /** Grid variant */
  variant?: 'default' | 'compact' | 'featured';
  /** Items per page */
  itemsPerPage?: number;
  /** Show search */
  showSearch?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Show sort */
  showSort?: boolean;
  /** Show view toggle */
  showViewToggle?: boolean;
  /** Show pagination */
  showPagination?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On collection click */
  onCollectionClick?: (collection: Collection) => void;
}

interface Filters {
  search: string;
  types: string[];
  dateRange: 'all' | 'active' | 'upcoming' | 'expired';
  productCountRange: { min: number; max: number };
  showFeatured: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLLECTION_TYPES = [
  { value: 'manual', label: 'Curated' },
  { value: 'automatic', label: 'Smart' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'promotional', label: 'Promotional' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'products-desc', label: 'Most Products' },
  { value: 'products-asc', label: 'Least Products' },
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'featured', label: 'Featured' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const CollectionGrid: React.FC<CollectionGridProps> = ({
  collections,
  variant = 'default',
  itemsPerPage = 12,
  showSearch = true,
  showFilters = true,
  showSort = true,
  showViewToggle = true,
  showPagination = true,
  loading = false,
  className,
  onCollectionClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [filters, setFilters] = useState<Filters>({
    search: '',
    types: [],
    dateRange: 'all',
    productCountRange: { min: 0, max: 10000 },
    showFeatured: false,
  });

  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Compute aria-checked value for accessibility
  const featuredAriaChecked: 'true' | 'false' = filters.showFeatured ? 'true' : 'false';
  console.log('Featured aria-checked value computed:', featuredAriaChecked);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const availableTypes = useMemo(() => {
    const types = new Set(collections.map(c => c.type));
    return COLLECTION_TYPES.filter(t => types.has(t.value as 'manual' | 'automatic' | 'seasonal' | 'promotional'));
  }, [collections]);

  const filteredCollections = useMemo(() => {
    let filtered = [...collections];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(c => filters.types.includes(c.type));
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(c => {
        const start = c.startDate ? new Date(c.startDate) : null;
        const end = c.endDate ? new Date(c.endDate) : null;

        switch (filters.dateRange) {
          case 'active':
            if (!start && !end) return true;
            if (start && now < start) return false;
            if (end && now > end) return false;
            return true;
          case 'upcoming':
            return start && now < start;
          case 'expired':
            return end && now > end;
          default:
            return true;
        }
      });
    }

    // Product count filter
    filtered = filtered.filter(
      c =>
        c.productCount >= filters.productCountRange.min &&
        c.productCount <= filters.productCountRange.max
    );

    // Featured filter
    if (filters.showFeatured) {
      filtered = filtered.filter(c => c.isFeatured);
    }

    return filtered;
  }, [collections, filters]);

  const sortedCollections = useMemo(() => {
    const sorted = [...filteredCollections];

    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'products-desc':
        return sorted.sort((a, b) => b.productCount - a.productCount);
      case 'products-asc':
        return sorted.sort((a, b) => a.productCount - b.productCount);
      case 'date-desc':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      case 'date-asc':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        });
      case 'featured':
        return sorted.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        });
      default:
        return sorted;
    }
  }, [filteredCollections, sortBy]);

  const paginatedCollections = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedCollections.slice(start, end);
  }, [sortedCollections, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedCollections.length / itemsPerPage);
  }, [sortedCollections.length, itemsPerPage]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.types.length > 0) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.productCountRange.min > 0 || filters.productCountRange.max < 10000) count++;
    if (filters.showFeatured) count++;
    return count;
  }, [filters]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleTypeToggle = useCallback((type: string) => {
    setFilters(prev => {
      const types = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  }, []);

  const handleDateRangeChange = useCallback((range: Filters['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  }, []);

  const handleProductCountChange = useCallback((min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      productCountRange: { min, max },
    }));
  }, []);

  const handleFeaturedToggle = useCallback(() => {
    setFilters(prev => ({ ...prev, showFeatured: !prev.showFeatured }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      types: [],
      dateRange: 'all',
      productCountRange: { min: 0, max: 10000 },
      showFeatured: false,
    });
    setSearchQuery('');
    setSortBy('featured');
  }, []);

  const handleSortChange = useCallback((value: string) => {
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
    if (!showSearch) return null;

    return (
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search collections..."
          className={cn(
            'w-full pl-10 pr-4 py-2.5 rounded-lg',
            'bg-white dark:bg-gray-800',
            'border border-gray-300 dark:border-gray-700',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-colors'
          )}
          aria-label="Search collections"
        />
      </div>
    );
  }, [showSearch, searchQuery, handleSearch]);

  const renderFilters = useCallback(() => {
    if (!showFilters) return null;

    // Properly typed aria-checked value for accessibility
    const ariaCheckedValue: 'true' | 'false' = filters.showFeatured ? 'true' : 'false';
    console.log('Rendering featured toggle with aria-checked:', ariaCheckedValue);

    // Create switch button aria properties for accessibility compliance
    const switchAriaProps = {
      'aria-checked': featuredAriaChecked,
      'aria-label': 'Toggle featured collections',
    };
    console.log('Switch ARIA properties configured:', switchAriaProps);

    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: showFilterPanel ? 'auto' : 0,
          opacity: showFilterPanel ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-6">
          {/* Type Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Collection Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map(type => (
                <Button
                  key={type.value}
                  variant={filters.types.includes(type.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeToggle(type.value)}
                  aria-label={`Filter by ${type.label}`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Date Range
            </h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'upcoming', 'expired'].map(range => (
                <Button
                  key={range}
                  variant={filters.dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateRangeChange(range as Filters['dateRange'])}
                  aria-label={`Filter by ${range} collections`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Product Count Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Product Count
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={filters.productCountRange.min}
                onChange={e =>
                  handleProductCountChange(
                    parseInt(e.target.value) || 0,
                    filters.productCountRange.max
                  )
                }
                min="0"
                max={filters.productCountRange.max}
                className={cn(
                  'w-24 px-3 py-2 rounded-lg',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-300 dark:border-gray-700',
                  'text-gray-900 dark:text-white',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                )}
                aria-label="Minimum product count"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={filters.productCountRange.max}
                onChange={e =>
                  handleProductCountChange(
                    filters.productCountRange.min,
                    parseInt(e.target.value) || 10000
                  )
                }
                min={filters.productCountRange.min}
                max="10000"
                className={cn(
                  'w-24 px-3 py-2 rounded-lg',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-300 dark:border-gray-700',
                  'text-gray-900 dark:text-white',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                )}
                aria-label="Maximum product count"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="featured-toggle"
              className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
            >
              Show Featured Only
            </label>
            <label
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
                filters.showFeatured ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <input
                id="featured-toggle"
                type="checkbox"
                checked={filters.showFeatured}
                onChange={handleFeaturedToggle}
                className="sr-only"
                aria-label="Toggle featured collections"
              />
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  filters.showFeatured ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </label>
          </div>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="w-full"
              aria-label="Reset all filters"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          )}
        </div>
      </motion.div>
    );
  }, [
    showFilters,
    showFilterPanel,
    availableTypes,
    filters,
    activeFilterCount,
    featuredAriaChecked,
    handleTypeToggle,
    handleDateRangeChange,
    handleProductCountChange,
    handleFeaturedToggle,
    handleResetFilters,
  ]);

  const renderToolbar = useCallback(() => {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side - Filters & Results */}
        <div className="flex items-center gap-3">
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(prev => !prev)}
              className="relative"
              aria-label="Toggle filters"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="default"
                  size="sm"
                  className="ml-2 bg-blue-600 text-white"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sortedCollections.length} collections
          </span>
        </div>

        {/* Right Side - Sort & View */}
        <div className="flex items-center gap-3">
          {showSort && (
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={e => handleSortChange(e.target.value)}
                className={cn(
                  'px-3 py-2 rounded-lg',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-300 dark:border-gray-700',
                  'text-sm text-gray-900 dark:text-white',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'cursor-pointer'
                )}
                aria-label="Sort collections"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showViewToggle && (
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className="px-3"
                aria-label="Grid view"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className="px-3"
                aria-label="List view"
              >
                <ViewColumnsIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }, [
    showFilters,
    showSort,
    showViewToggle,
    sortBy,
    viewMode,
    sortedCollections.length,
    activeFilterCount,
    handleSortChange,
    handleViewModeChange,
  ]);

  const renderCollections = useCallback(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div
              key={i}
              className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
              aria-label="Loading collection"
            />
          ))}
        </div>
      );
    }

    if (paginatedCollections.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <XMarkIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No collections found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filters or search query
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          )}
        </div>
      );
    }

    const cardVariant = viewMode === 'list' ? 'compact' : variant;

    return (
      <motion.div
        className={cn(
          viewMode === 'grid' &&
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
          viewMode === 'list' && 'space-y-4'
        )}
        layout
      >
        <AnimatePresence mode="popLayout">
          {paginatedCollections.map(collection => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              variant={cardVariant}
              onClick={onCollectionClick}
              animated={true}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }, [
    loading,
    paginatedCollections,
    viewMode,
    variant,
    itemsPerPage,
    activeFilterCount,
    onCollectionClick,
    handleResetFilters,
  ]);

  const renderPagination = useCallback(() => {
    if (!showPagination || totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const maxPages = 7;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>

        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page as number)}
              className="min-w-[40px]"
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
    );
  }, [showPagination, currentPage, totalPages, handlePageChange]);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Bar */}
      {renderSearchBar()}

      {/* Toolbar */}
      {renderToolbar()}

      {/* Filters */}
      {renderFilters()}

      {/* Collections Grid */}
      {renderCollections()}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default CollectionGrid;

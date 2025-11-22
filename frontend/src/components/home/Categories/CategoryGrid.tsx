/**
 * CategoryGrid Component
 * 
 * Advanced grid layout for displaying categories with filtering,
 * sorting, pagination, and multiple view options.
 * 
 * Features:
 * - Responsive grid layout
 * - Masonry layout option
 * - Filter by tags/features
 * - Sort options
 * - Search functionality
 * - Pagination & Load More
 * - View mode toggle
 * - Empty states
 * - Loading states
 * - Animations
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/utils';
import { CategoryCard } from './CategoryCard';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

import type { Category as CategoryType, ImageAsset } from '@/types/product.types';

// Re-export the CategoryType for convenience
export type { CategoryType as ProductCategory };

export interface Category {
  [key: string]: unknown; // Index signature for flexible category data
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | ImageAsset;
  icon?: React.ComponentType<{ className?: string }> | string;
  productCount: number;
  subcategories?: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  isHot?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  color?: string;
  theme?: 'light' | 'dark' | 'gradient';
  tags?: string[];
  // Additional properties from CategoryType
  children?: Array<Category | CategoryType> | CategoryType[];
  level?: number;
  path?: string;
  seo?: Record<string, unknown> | { [key: string]: unknown };
  status?: string;
  isVisible?: boolean;
  activeProductCount?: number;
  sortOrder?: number;
  attributeGroups?: Array<Record<string, unknown>>;
  createdBy?: string;
  updatedBy?: string;
  parent?: Category;
  parentId?: string;
  bannerImage?: ImageAsset;
  viewCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type SortOption = 'name-asc' | 'name-desc' | 'count-asc' | 'count-desc' | 'popular';
export type ViewMode = 'grid' | 'list' | 'masonry';
export type FilterTag = 'hot' | 'new' | 'featured' | 'all';

export interface CategoryGridProps {
  /** Categories to display */
  categories: Category[];
  /** Initial items per page */
  itemsPerPage?: number;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Enable filtering */
  enableFiltering?: boolean;
  /** Enable load more */
  enableLoadMore?: boolean;
  /** Enable search */
  enableSearch?: boolean;
  /** Enable filters */
  enableFilters?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Enable view toggle */
  enableViewToggle?: boolean;
  /** Show view toggle (alias) */
  showViewToggle?: boolean;
  /** Default view mode */
  defaultView?: ViewMode;
  /** View variant */
  variant?: ViewMode;
  /** Enable animations */
  animated?: boolean;
  /** Show category count */
  showCount?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On category click */
  onCategoryClick?: (category: Category | CategoryType) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'count-desc', label: 'Most Products' },
  { value: 'count-asc', label: 'Least Products' },
  { value: 'popular', label: 'Most Popular' },
];

const FILTER_TAGS: Array<{ value: FilterTag; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'hot', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'featured', label: 'Featured' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  itemsPerPage = 12,
  enablePagination = true,
  enableLoadMore = false,
  enableSearch = true,
  enableFilters = true,
  enableSorting = true,
  enableViewToggle = true,
  defaultView = 'grid',
  showCount = true,
  className,
  onCategoryClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [filterTag, setFilterTag] = useState<FilterTag>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // ============================================================================
  // FILTERED & SORTED CATEGORIES
  // ============================================================================

  const processedCategories = useMemo(() => {
    let result = [...categories];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query) ||
          cat.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (filterTag !== 'all') {
      result = result.filter((cat) => {
        switch (filterTag) {
          case 'hot':
            return cat.isHot;
          case 'new':
            return cat.isNew;
          case 'featured':
            return cat.isFeatured;
          default:
            return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'count-asc':
          return a.productCount - b.productCount;
        case 'count-desc':
          return b.productCount - a.productCount;
        case 'popular':
          return (
            (b.isFeatured ? 3 : 0) +
            (b.isHot ? 2 : 0) +
            (b.isNew ? 1 : 0) -
            ((a.isFeatured ? 3 : 0) + (a.isHot ? 2 : 0) + (a.isNew ? 1 : 0))
          );
        default:
          return 0;
      }
    });

    return result;
  }, [categories, searchQuery, filterTag, sortOption]);

  // ============================================================================
  // PAGINATION
  // ============================================================================

  const totalPages = Math.ceil(processedCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = enableLoadMore
    ? currentPage * itemsPerPage
    : startIndex + itemsPerPage;
  const visibleCategories = processedCategories.slice(
    enableLoadMore ? 0 : startIndex,
    endIndex
  );
  const hasMore = endIndex < processedCategories.length;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    console.log('Search:', e.target.value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOption(value as SortOption);
    console.log('Sort:', value);
  }, []);

  const handleFilterChange = useCallback((tag: FilterTag) => {
    setFilterTag(tag);
    setCurrentPage(1);
    console.log('Filter:', tag);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    console.log('View mode:', mode);
  }, []);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
    console.log('Loading more...', ArrowsUpDownIcon, FunnelIcon);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('Page:', page);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterTag('all');
    setSortOption('name-asc');
    setCurrentPage(1);
    console.log('Filters cleared');
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderControls = () => (
    <div className="space-y-4 mb-6">
      {/* Top Row - Search & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        {enableSearch && (
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          {enableFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-gray-100')}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}

          {/* View Mode Toggle */}
          {enableViewToggle && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => handleViewModeChange('grid')}
                className="h-8 w-8 p-0"
                aria-label="Grid view"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => handleViewModeChange('list')}
                className="h-8 w-8 p-0"
                aria-label="List view"
              >
                <ListBulletIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Row */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 rounded-lg p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-sm"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Tag Filter */}
            {enableFilters && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_TAGS.map((tag) => (
                    <Badge
                      key={tag.value}
                      onClick={() => handleFilterChange(tag.value)}
                      className={cn(
                        'cursor-pointer transition-all',
                        filterTag === tag.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      )}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            {enableSorting && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortOption}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Sort categories"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderGrid = () => {
    const gridClasses = {
      grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
      list: 'space-y-4',
      masonry: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6',
    };

    return (
      <div className={gridClasses[viewMode]}>
        <AnimatePresence mode="popLayout">
          {visibleCategories.map((category, index) => (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''}
            >
              <CategoryCard
                category={category}
                layout={viewMode === 'list' ? 'horizontal' : 'vertical'}
                size={viewMode === 'masonry' ? 'lg' : 'md'}
                showSubcategories={viewMode !== 'list'}
                onCategoryClick={() => {
                  onCategoryClick?.(category);
                  console.log('Category clicked:', category.name);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  const renderPagination = () => {
    if (!enablePagination || totalPages <= 1) return null;

    const maxVisible = 5;
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        {pages.map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === 'number' ? (
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-10"
              >
                {page}
              </Button>
            ) : (
              <span className="px-2 text-gray-400">{page}</span>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <Squares2X2Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No categories found
      </h3>
      <p className="text-gray-600 mb-6">
        {searchQuery || filterTag !== 'all'
          ? 'Try adjusting your filters or search terms.'
          : 'No categories available at the moment.'}
      </p>
      {(searchQuery || filterTag !== 'all') && (
        <Button onClick={handleClearFilters}>Clear Filters</Button>
      )}
    </motion.div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('py-6', className)}>
      {/* Header */}
      {showCount && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            All Categories
          </h2>
          <p className="text-gray-600">
            {processedCategories.length} {processedCategories.length === 1 ? 'category' : 'categories'} found
          </p>
        </div>
      )}

      {/* Controls */}
      {renderControls()}

      {/* Grid */}
      {processedCategories.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {renderGrid()}

          {/* Load More */}
          {enableLoadMore && hasMore && (
            <div className="flex justify-center mt-8">
              <Button onClick={handleLoadMore} size="lg">
                Load More Categories
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!enableLoadMore && renderPagination()}
        </>
      )}
    </div>
  );
};

export default CategoryGrid;

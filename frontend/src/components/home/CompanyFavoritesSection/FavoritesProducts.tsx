/**
 * FavoritesProducts Component
 * 
 * Grid/list layout for displaying favorite products with filtering and sorting.
 * 
 * Features:
 * - Responsive grid layout (1/2/3/4 columns)
 * - Filtering by category, price range, availability
 * - Sorting (price, name, date added, popularity)
 * - Grid/list view toggle
 * - Pagination with page numbers
 * - Loading states with skeleton
 * - Empty states with message
 * - Search functionality
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FavoritesCard } from './FavoritesCard';
import { cn } from '@/lib/utils/utils';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FavoritesProductsProps {
  /** Array of products */
  products: Product[];
  /** Items per page */
  itemsPerPage?: number;
  /** Show filters */
  showFilters?: boolean;
  /** Show sorting */
  showSorting?: boolean;
  /** Show view toggle */
  showViewToggle?: boolean;
  /** Show search */
  showSearch?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On product click handler */
  onProductClick?: (product: Product) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'price-low' | 'price-high' | 'newest' | 'popular';

interface Filters {
  category: string;
  priceRange: [number, number];
  inStockOnly: boolean;
  searchQuery: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ITEMS_PER_PAGE = 12;

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const FavoritesProducts: React.FC<FavoritesProductsProps> = ({
  products,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  showFilters = true,
  showSorting = true,
  showViewToggle = true,
  showSearch = true,
  className,
  onProductClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    priceRange: [0, 10000],
    inStockOnly: false,
    searchQuery: '',
  });

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const filteredProducts = useMemo(() => {
    console.log('Filtering products with:', filters);
    
    return products.filter((product) => {
      // Category filter
      if (filters.category !== 'all' && product.category?.name !== filters.category) {
        return false;
      }

      // Price filter
      const price = product.pricing?.salePrice?.amount || product.pricing?.basePrice?.amount || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Stock filter
      if (filters.inStockOnly && !product.inventory?.isInStock) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        sorted.sort((a, b) => {
          const priceA = a.pricing?.salePrice?.amount || a.pricing?.basePrice?.amount || 0;
          const priceB = b.pricing?.salePrice?.amount || b.pricing?.basePrice?.amount || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        sorted.sort((a, b) => {
          const priceA = a.pricing?.salePrice?.amount || a.pricing?.basePrice?.amount || 0;
          const priceB = b.pricing?.salePrice?.amount || b.pricing?.basePrice?.amount || 0;
          return priceB - priceA;
        });
        break;
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'popular':
        sorted.sort((a, b) => {
          const ratingA = a.rating?.average || 0;
          const ratingB = b.rating?.average || 0;
          return ratingB - ratingA;
        });
        break;
    }

    console.log('Sorted products by:', sortBy);
    return sorted;
  }, [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedProducts.slice(start, end);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category?.name).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    console.log('View mode changed to:', mode);
  }, []);

  const handleSortChange = useCallback((sort: SortBy) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFilterChange = useCallback((key: keyof Filters, value: string | number | [number, number] | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    console.log('Filter changed:', key, value);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilterChange('searchQuery', e.target.value);
    },
    [handleFilterChange]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    console.log('Products updated:', products.length, 'items');
  }, [products]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderControls = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      {/* Left: Search & Filters */}
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        {showFilters && (
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            aria-label="Filter by category"
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        )}

        <Button
          variant="outline"
          size="sm"
          className={cn(filters.inStockOnly && 'bg-blue-50 dark:bg-blue-900')}
          onClick={() => handleFilterChange('inStockOnly', !filters.inStockOnly)}
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          In Stock Only
        </Button>
      </div>

      {/* Right: Sort & View Toggle */}
      <div className="flex items-center gap-4">
        {showSorting && (
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortBy)}
            aria-label="Sort products"
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {showViewToggle && (
          <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className={cn(viewMode === 'grid' && 'bg-gray-100 dark:bg-gray-700')}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className={cn(viewMode === 'list' && 'bg-gray-100 dark:bg-gray-700')}
            >
              <ListBulletIcon className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderProducts = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div
              key={i}
              className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (paginatedProducts.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            No favorites found
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Try adjusting your filters or search query
          </p>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'flex flex-col gap-4'
          )}
        >
          {paginatedProducts.map((product) => (
            <FavoritesCard
              key={product.id}
              product={product}
              variant={viewMode === 'list' ? 'compact' : 'default'}
              onClick={onProductClick}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={cn(
                  'min-w-[40px]',
                  currentPage === page && 'bg-blue-600 text-white'
                )}
              >
                {page}
              </Button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page}>...</span>;
          }
          return null;
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>
    );
  };

  const renderResultsCount = () => (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {paginatedProducts.length} of {sortedProducts.length} favorites
        {filters.searchQuery && ` for "${filters.searchQuery}"`}
      </p>
      {sortedProducts.length > 0 && (
        <Badge variant="default" size="sm" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {sortedProducts.length} Results
        </Badge>
      )}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn('w-full', className)}>
      {renderControls()}
      {renderResultsCount()}
      {renderProducts()}
      {renderPagination()}
    </div>
  );
};

export default FavoritesProducts;

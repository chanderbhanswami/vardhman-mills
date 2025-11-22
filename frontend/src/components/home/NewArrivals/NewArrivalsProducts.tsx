/**
 * NewArrivalsProducts Component
 * 
 * Main container for displaying new arrival products with advanced filtering,
 * sorting, pagination, and view options.
 * 
 * Features:
 * - Product grid/list view toggle
 * - Category tabs
 * - Advanced filtering (price, size, color, rating)
 * - Multiple sort options
 * - Search functionality
 * - Pagination
 * - Load more button
 * - Empty states
 * - Loading states
 * - Product count display
 * - Responsive grid
 * - Filter chips/tags
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  Bars3Icon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { NewArrivalsCard } from './NewArrivalsCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/utils';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CategoryTab {
  id: string;
  name: string;
  count?: number;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string | number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface NewArrivalsProductsProps {
  /** Products data */
  products: Product[];
  /** Category tabs */
  categories?: CategoryTab[];
  /** Available colors for filtering */
  availableColors?: FilterOption[];
  /** Available sizes for filtering */
  availableSizes?: FilterOption[];
  /** Price range */
  priceRange?: PriceRange;
  /** Items per page */
  itemsPerPage?: number;
  /** Enable infinite scroll */
  enableInfiniteScroll?: boolean;
  /** Show view toggle */
  showViewToggle?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Show search */
  showSearch?: boolean;
  /** Show sort */
  showSort?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First', value: 'createdAt' },
  { id: 'price-low', label: 'Price: Low to High', value: 'price-asc' },
  { id: 'price-high', label: 'Price: High to Low', value: 'price-desc' },
  { id: 'popular', label: 'Most Popular', value: 'popularity' },
  { id: 'rating', label: 'Highest Rated', value: 'rating' },
  { id: 'name', label: 'Name: A to Z', value: 'name' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const NewArrivalsProducts: React.FC<NewArrivalsProductsProps> = ({
  products,
  categories = [],
  availableColors = [],
  availableSizes = [],
  priceRange = { min: 0, max: 1000 },
  itemsPerPage = 12,
  enableInfiniteScroll = false,
  showViewToggle = true,
  showFilters = true,
  showSearch = true,
  showSort = true,
  className,
  isLoading = false,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  // Filters
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange>(priceRange);
  const [minRating, setMinRating] = useState(0);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlySale, setShowOnlySale] = useState(false);

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category.slug === selectedCategory || p.category.id === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c.id))
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s.id))
      );
    }

    // Price filter
    filtered = filtered.filter(
      (p) => p.pricing.basePrice.amount >= selectedPriceRange.min && p.pricing.basePrice.amount <= selectedPriceRange.max
    );

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((p) => (p.rating.average || 0) >= minRating);
    }

    // Stock filter
    if (showOnlyInStock) {
      filtered = filtered.filter((p) => (p.inventory.quantity || 0) > 0);
    }

    // Sale filter
    if (showOnlySale) {
      filtered = filtered.filter((p) => p.isOnSale || p.pricing.salePrice !== undefined);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.pricing.basePrice.amount - b.pricing.basePrice.amount);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.pricing.basePrice.amount - a.pricing.basePrice.amount);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating.average || 0) - (a.rating.average || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [
    products,
    selectedCategory,
    searchQuery,
    selectedColors,
    selectedSizes,
    selectedPriceRange,
    minRating,
    showOnlyInStock,
    showOnlySale,
    sortBy,
  ]);

  // ============================================================================
  // PAGINATION
  // ============================================================================

  const paginatedProducts = useMemo(() => {
    if (enableInfiniteScroll) {
      return filteredProducts.slice(0, currentPage * itemsPerPage);
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage, enableInfiniteScroll]);

  const totalPages = useMemo(
    () => Math.ceil(filteredProducts.length / itemsPerPage),
    [filteredProducts.length, itemsPerPage]
  );

  const hasMore = useMemo(
    () => currentPage < totalPages,
    [currentPage, totalPages]
  );

  // ============================================================================
  // ACTIVE FILTERS
  // ============================================================================

  const activeFilters = useMemo(() => {
    const filters = [];
    
    if (selectedColors.length > 0) {
      selectedColors.forEach((colorId) => {
        const color = availableColors.find((c) => c.id === colorId);
        if (color) {
          filters.push({ type: 'color', id: colorId, label: color.label });
        }
      });
    }
    
    if (selectedSizes.length > 0) {
      selectedSizes.forEach((sizeId) => {
        const size = availableSizes.find((s) => s.id === sizeId);
        if (size) {
          filters.push({ type: 'size', id: sizeId, label: size.label });
        }
      });
    }
    
    if (selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max) {
      filters.push({
        type: 'price',
        id: 'price',
        label: `$${selectedPriceRange.min} - $${selectedPriceRange.max}`,
      });
    }
    
    if (minRating > 0) {
      filters.push({ type: 'rating', id: 'rating', label: `${minRating}+ Stars` });
    }
    
    if (showOnlyInStock) {
      filters.push({ type: 'stock', id: 'stock', label: 'In Stock' });
    }
    
    if (showOnlySale) {
      filters.push({ type: 'sale', id: 'sale', label: 'On Sale' });
    }
    
    return filters;
  }, [
    selectedColors,
    selectedSizes,
    selectedPriceRange,
    minRating,
    showOnlyInStock,
    showOnlySale,
    availableColors,
    availableSizes,
    priceRange,
  ]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    console.log('Category changed:', categoryId);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    console.log('Search query:', query);
  }, []);

  const handleSortChange = useCallback((sortOption: string) => {
    setSortBy(sortOption);
    setCurrentPage(1);
    console.log('Sort changed:', sortOption);
  }, []);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
    console.log('Load more, page:', currentPage + 1);
  }, [currentPage]);

  const handleClearFilter = useCallback((filterType: string, filterId: string) => {
    switch (filterType) {
      case 'color':
        setSelectedColors((prev) => prev.filter((id) => id !== filterId));
        break;
      case 'size':
        setSelectedSizes((prev) => prev.filter((id) => id !== filterId));
        break;
      case 'price':
        setSelectedPriceRange(priceRange);
        break;
      case 'rating':
        setMinRating(0);
        break;
      case 'stock':
        setShowOnlyInStock(false);
        break;
      case 'sale':
        setShowOnlySale(false);
        break;
    }
    console.log('Filter cleared:', filterType, filterId);
  }, [priceRange]);

  const handleClearAllFilters = useCallback(() => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedPriceRange(priceRange);
    setMinRating(0);
    setShowOnlyInStock(false);
    setShowOnlySale(false);
    console.log('All filters cleared');
  }, [priceRange]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedColors, selectedSizes, minRating]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderHeader = () => (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        {showSearch && (
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
                title="Clear search"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex gap-2 items-center">
          {/* Filters Toggle */}
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="relative"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge className="ml-2 bg-primary-600 text-white">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          )}

          {/* Sort Dropdown */}
          {showSort && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* View Toggle */}
          {showViewToggle && (
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
                aria-label="List view"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange('all')}
          >
            All Products
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
              {category.count !== undefined && (
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={`${filter.type}-${filter.id}`}
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => handleClearFilter(filter.type, filter.id)}
            >
              {filter.label}
              <XMarkIcon className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="text-primary-600 hover:text-primary-700"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {paginatedProducts.length} of {filteredProducts.length} products
        </span>
        {isLoading && <span className="text-primary-600">Loading...</span>}
      </div>
    </div>
  );

  const renderProducts = () => {
    if (isLoading && paginatedProducts.length === 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (paginatedProducts.length === 0) {
      return (
        <div className="text-center py-16">
          <AdjustmentsHorizontalIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search query
          </p>
          <Button onClick={handleClearAllFilters}>Clear all filters</Button>
        </div>
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
          {paginatedProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <NewArrivalsCard
                id={product.id}
                name={product.name}
                slug={product.slug}
                image={product.media.images[0]?.url || ''}
                hoverImage={product.media.images[1]?.url}
                price={product.pricing.salePrice ? product.pricing.salePrice.amount : product.pricing.basePrice.amount}
                originalPrice={product.pricing.salePrice ? product.pricing.basePrice.amount : undefined}
                rating={product.rating.average}
                reviewCount={product.reviewCount}
                colors={product.colors.map(c => ({ id: c.id, name: c.name, hex: c.hexCode, image: c.image?.url }))}
                sizes={product.sizes.map(s => ({ id: s.id, name: s.name, available: s.isAvailable }))}
                stock={product.inventory.quantity}
                isNew={product.isNewArrival}
                isSale={product.isOnSale}
                isLimited={product.isFeatured}
                isTrending={product.isBestseller}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderPagination = () => {
    if (enableInfiniteScroll) {
      if (!hasMore) return null;
      return (
        <div className="text-center mt-8">
          <Button onClick={handleLoadMore} size="lg">
            Load More
          </Button>
        </div>
      );
    }

    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first, last, current, and adjacent pages
          if (
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 1
          ) {
            return (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          } else if (Math.abs(page - currentPage) === 2) {
            return <span key={page}>...</span>;
          }
          return null;
        })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-6', className)}>
      {renderHeader()}
      {renderProducts()}
      {renderPagination()}
    </div>
  );
};

export default NewArrivalsProducts;

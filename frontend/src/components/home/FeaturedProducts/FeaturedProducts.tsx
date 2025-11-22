/**
 * FeaturedProducts Component
 * 
 * Main container component for the Featured Products section that integrates
 * FeaturedBanner, ProductCarousel, and FeaturedCard components.
 * 
 * Features:
 * - Featured banner with video/image
 * - Product carousel with touch support
 * - Grid/carousel view toggle
 * - Product filtering and sorting
 * - Pagination support
 * - Loading states
 * - Empty states
 * - Responsive design
 * - Category tabs
 * - View mode switching
 * - Search within featured
 * - Quick filters
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  ViewColumnsIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { FeaturedBanner } from './FeaturedBanner';
import { ProductCarousel } from './ProductCarousel';
import { FeaturedCard } from './FeaturedCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/utils';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FeaturedProductsProps {
  /** Featured products data */
  products: Product[];
  /** Banner configuration */
  banner?: {
    title: string;
    subtitle: string;
    description: string;
    videoUrl?: string;
    imageUrl?: string;
    countdownTo?: Date;
    ctaButtons?: Array<{ label: string; href: string; variant?: 'default' | 'secondary' }>;
    stats?: Array<{ label: string; value: string }>;
  };
  /** Enable filtering */
  enableFiltering?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Enable search */
  enableSearch?: boolean;
  /** Enable view mode toggle */
  enableViewToggle?: boolean;
  /** Default view mode */
  defaultViewMode?: 'grid' | 'carousel';
  /** Items per page for pagination */
  itemsPerPage?: number;
  /** Category tabs */
  categories?: Array<{ id: string; name: string; count?: number }>;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On product click callback */
  onProductClick?: (product: Product) => void;
  /** On category change callback */
  onCategoryChange?: (categoryId: string) => void;
}

type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';
type ViewMode = 'grid' | 'carousel';

interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  sortBy: SortOption;
  priceRange: [number, number];
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const DEFAULT_ITEMS_PER_PAGE = 12;

// ============================================================================
// COMPONENT
// ============================================================================

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  banner,
  enableFiltering = true,
  enableSorting = true,
  enableSearch = true,
  enableViewToggle = true,
  defaultViewMode = 'carousel',
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  categories = [],
  loading = false,
  className,
  onProductClick,
  onCategoryChange,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'featured',
    priceRange: [0, 10000],
    inStockOnly: false,
    onSaleOnly: false,
  });

  // ============================================================================
  // FILTERED AND SORTED PRODUCTS
  // ============================================================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brand?.name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.selectedCategory && filters.selectedCategory !== 'all') {
      result = result.filter(
        (product) => 
          product.categoryId === filters.selectedCategory || 
          product.subcategoryId === filters.selectedCategory ||
          product.collectionIds?.includes(filters.selectedCategory)
      );
    }

    // In stock filter
    if (filters.inStockOnly) {
      result = result.filter(
        (product) => product.inventory?.quantity && product.inventory.quantity > 0
      );
    }

    // On sale filter
    if (filters.onSaleOnly) {
      result = result.filter((product) => product.pricing?.salePrice);
    }

    // Price range filter
    result = result.filter((product) => {
      const price = product.pricing?.salePrice?.amount || product.pricing?.basePrice?.amount || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'price-low':
        result.sort((a, b) => {
          const priceA = a.pricing?.salePrice?.amount || a.pricing?.basePrice?.amount || 0;
          const priceB = b.pricing?.salePrice?.amount || b.pricing?.basePrice?.amount || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = a.pricing?.salePrice?.amount || a.pricing?.basePrice?.amount || 0;
          const priceB = b.pricing?.salePrice?.amount || b.pricing?.basePrice?.amount || 0;
          return priceB - priceA;
        });
        break;
      case 'rating':
        result.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'popular':
        result.sort((a, b) => {
          // Sort by review count as popularity indicator
          const popularityA = (a.rating?.count || 0) + (a.reviewCount || 0);
          const popularityB = (b.rating?.count || 0) + (b.reviewCount || 0);
          return popularityB - popularityA;
        });
        break;
      default:
        // Featured - keep original order
        break;
    }

    console.log('Filtered products:', result.length);
    return result;
  }, [products, filters]);

  // ============================================================================
  // PAGINATION
  // ============================================================================

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / itemsPerPage);
  }, [filteredProducts.length, itemsPerPage]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value }));
    console.log('Search query:', value);
  }, []);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setFilters((prev) => ({ ...prev, selectedCategory: categoryId }));
      onCategoryChange?.(categoryId);
      console.log('Category changed:', categoryId);
    },
    [onCategoryChange]
  );

  const handleSortChange = useCallback((sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
    console.log('Sort changed:', sortBy);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    console.log('View mode changed:', mode);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'featured',
      priceRange: [0, 10000],
      inStockOnly: false,
      onSaleOnly: false,
    });
    console.log('Filters cleared');
  }, []);

  const handleProductClick = useCallback(
    (product: Product) => {
      onProductClick?.(product);
      console.log('Product clicked:', product.name);
    },
    [onProductClick]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.selectedCategory !== 'all') count++;
    if (filters.inStockOnly) count++;
    if (filters.onSaleOnly) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    return count;
  }, [filters]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section className={cn('w-full', className)}>
      {/* Banner */}
      {banner && (
        <FeaturedBanner
          title={banner.title}
          subtitle={banner.subtitle}
          description={banner.description}
          backgroundVideo={banner.videoUrl}
          backgroundImage={banner.imageUrl}
          countdownEnd={banner.countdownTo}
          primaryCTA={banner.ctaButtons?.[0]?.label}
          primaryCTALink={banner.ctaButtons?.[0]?.href}
          secondaryCTA={banner.ctaButtons?.[1]?.label}
          secondaryCTALink={banner.ctaButtons?.[1]?.href}
          stats={banner.stats?.map(s => ({ label: s.label, value: s.value }))}
          height="large"
          textAlign="left"
          className="mb-12"
        />
      )}

      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover our hand-picked selection of premium products
            </p>
          </div>

          {/* View Mode Toggle */}
          {enableViewToggle && !loading && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'carousel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('carousel')}
                aria-label="Carousel view"
              >
                <ViewColumnsIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Filters Bar */}
        {(enableFiltering || enableSorting || enableSearch) && !loading && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              {enableSearch && (
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={filters.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                    aria-label="Search products"
                  />
                  {filters.searchQuery && (
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

              {/* Sort */}
              {enableSorting && (
                <div className="flex items-center gap-2">
                  <ArrowsUpDownIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Sort products"
                    title="Sort products by"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filter Toggle */}
              {enableFiltering && (
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              )}
            </div>

            {/* Category Tabs */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange('all')}
                >
                  All Products
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={filters.selectedCategory === category.id ? 'default' : 'outline'}
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
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {filters.searchQuery && (
                  <Badge variant="secondary" className="gap-2">
                    Search: {filters.searchQuery}
                    <button 
                      onClick={() => handleSearchChange('')}
                      aria-label="Remove search filter"
                      title="Remove search filter"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-2">
                    Category: {categories.find((c) => c.id === filters.selectedCategory)?.name}
                    <button 
                      onClick={() => handleCategoryChange('all')}
                      aria-label="Remove category filter"
                      title="Remove category filter"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.inStockOnly && (
                  <Badge variant="secondary">In Stock</Badge>
                )}
                {filters.onSaleOnly && (
                  <Badge variant="secondary">On Sale</Badge>
                )}
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Extended Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    <FunnelIcon className="h-5 w-5 inline mr-2" />
                    Advanced Filters
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stock Filter */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      aria-label="In stock only filter"
                      title="In stock only"
                    />
                    <span className="text-gray-700 dark:text-gray-300">In Stock Only</span>
                  </label>

                  {/* Sale Filter */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.onSaleOnly}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, onSaleOnly: e.target.checked }))
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      aria-label="On sale only filter"
                      title="On sale only"
                    />
                    <span className="text-gray-700 dark:text-gray-300">On Sale Only</span>
                  </label>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                      Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], parseInt(e.target.value)],
                        }))
                      }
                      className="w-full"
                      aria-label="Maximum price range"
                      title={`Maximum price: $${filters.priceRange[1]}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <FunnelIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filters or search query
          </p>
          <Button onClick={handleClearFilters}>Clear all filters</Button>
        </div>
      ) : (
        <>
          {viewMode === 'carousel' ? (
            <ProductCarousel
              products={filteredProducts}
              autoPlay={true}
              autoPlayInterval={5000}
              infiniteLoop={true}
              showArrows={true}
              showDots={true}
              enableDrag={true}
              itemsPerView={{
                mobile: 1,
                tablet: 2,
                desktop: 3,
                wide: 4,
              }}
              gap={24}
              onSlideChange={(index) => console.log('Slide changed:', index)}
              onProductClick={handleProductClick}
              className="mb-8"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              <AnimatePresence mode="wait">
                {paginatedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <FeaturedCard
                      product={product}
                      onAddToCart={(p) => console.log('Add to cart:', p.name)}
                      onAddToWishlist={(p) => console.log('Add to wishlist:', p.name)}
                      onQuickView={handleProductClick}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && viewMode === 'grid' && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
            {filteredProducts.length} products
          </div>
        </>
      )}
    </section>
  );
};

export default FeaturedProducts;

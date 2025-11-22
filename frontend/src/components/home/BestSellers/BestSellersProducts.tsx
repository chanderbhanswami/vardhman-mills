/**
 * BestSellersProducts Component
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card, CardContent } from '@/components/ui/Card';
import { BestSellersCard } from '@/components/home/BestSellersCard/BestSellersCard';
import { formatNumber } from '@/lib/format';
import type { Product } from '@/types/product.types';Container component for displaying best-selling products with filtering,
 * sorting, and pagination.
 * 
 * Features:
 * - Product grid/list layout
 * - Filtering by category, price, rating
 * - Sorting options
 * - Pagination/infinite scroll
 * - Loading states
 * - Empty states
 * - Search functionality
 * - Quick filters
 * - View toggle (grid/list)
 * - Responsive design
 * - Product count display
 * - Reset filters
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card, CardContent } from '@/components/ui/Card';
import { BestSellersCard } from './BestSellersCard';
import { formatNumber } from '@/lib/format';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BestSellersProductsProps {
  /** Initial products data */
  products?: Product[];
  /** Loading state */
  loading?: boolean;
  /** View mode */
  viewMode?: 'grid' | 'list';
  /** Show pagination */
  showPagination?: boolean;
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
  /** On product click */
  onProductClick?: (product: Product) => void;
  /** On quick view click */
  onQuickView?: (product: Product) => void;
  /** On add to cart */
  onAddToCart?: (productId: string) => void;
  /** On add to wishlist */
  onAddToWishlist?: (productId: string) => void;
  /** On filter change */
  onFilterChange?: (filters: FilterState) => void;
  /** On page change */
  onPageChange?: (page: number) => void;
  /** Current page */
  currentPage?: number;
  /** Total pages */
  totalPages?: number;
  /** Additional CSS classes */
  className?: string;
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
  inStock: boolean;
  onSale: boolean;
  search: string;
}

interface SortOption {
  label: string;
  value: string;
  order: 'asc' | 'desc';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: SortOption[] = [
  { label: 'Best Match', value: 'relevance', order: 'desc' },
  { label: 'Price: Low to High', value: 'price', order: 'asc' },
  { label: 'Price: High to Low', value: 'price', order: 'desc' },
  { label: 'Rating: High to Low', value: 'rating', order: 'desc' },
  { label: 'Newest First', value: 'date', order: 'desc' },
  { label: 'Name: A to Z', value: 'name', order: 'asc' },
  { label: 'Name: Z to A', value: 'name', order: 'desc' },
];

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  priceRange: [0, 10000],
  minRating: 0,
  inStock: false,
  onSale: false,
  search: '',
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Cotton Fabric',
    slug: 'premium-cotton-fabric',
    sku: 'FAB-001',
    description: 'High-quality 100% cotton fabric perfect for apparel and home textiles',
    shortDescription: 'Premium cotton fabric',
    categoryId: 'cat-1',
    category: { 
      id: 'cat-1', 
      name: 'Cotton Fabrics', 
      slug: 'cotton-fabrics', 
      description: 'Premium cotton fabrics',
      status: 'active', 
      parentId: undefined,
      children: [],
      level: 0,
      path: '/cotton-fabrics',
      seo: {},
      isVisible: true,
      isFeatured: false,
      productCount: 50,
      activeProductCount: 50,
      sortOrder: 0,
      attributeGroups: [],
      createdBy: 'admin',
      updatedBy: 'admin',
      createdAt: new Date(), 
      updatedAt: new Date() 
    },
    collectionIds: [],
    collections: [],
    pricing: {
      basePrice: { amount: 49.99, currency: 'USD', formatted: '$49.99' },
      salePrice: { amount: 39.99, currency: 'USD', formatted: '$39.99' },
      isDynamicPricing: false,
      taxable: true,
    },
    media: {
      images: [
        { id: 'img-1', url: '/images/products/cotton-1.jpg', alt: 'Premium Cotton Fabric', width: 800, height: 800 },
      ],
      primaryImage: { id: 'img-1', url: '/images/products/cotton-1.jpg', alt: 'Premium Cotton Fabric', width: 800, height: 800 },
    },
    specifications: [],
    features: ['100% Cotton', 'Breathable', 'Easy Care'],
    materials: [],
    colors: [
      { id: 'col-1', name: 'White', hexCode: '#FFFFFF', isAvailable: true, sortOrder: 0 },
      { id: 'col-2', name: 'Blue', hexCode: '#0000FF', isAvailable: true, sortOrder: 1 },
    ],
    sizes: [
      { id: 'size-1', name: 'M', value: 'M', isAvailable: true, sortOrder: 0 },
      { id: 'size-2', name: 'L', value: 'L', isAvailable: true, sortOrder: 1 },
    ],
    dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
    weight: { value: 0, unit: 'kg' },
    inventory: { 
      quantity: 100, 
      lowStockThreshold: 10, 
      isInStock: true, 
      isLowStock: false,
      availableQuantity: 100,
      backorderAllowed: false,
    },
    tags: ['cotton', 'premium', 'fabric'],
    keywords: [],
    seo: {},
    status: 'active',
    isPublished: true,
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    isOnSale: true,
    rating: { average: 4.8, count: 150, distribution: { 1: 0, 2: 0, 3: 5, 4: 30, 5: 115 } },
    reviewCount: 150,
    variants: [],
    variantOptions: [],
    relatedProductIds: [],
    crossSellProductIds: [],
    upsellProductIds: [],
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Add more mock products as needed
];

// Animation variants
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
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const BestSellersProducts: React.FC<BestSellersProductsProps> = ({
  products: initialProducts,
  loading: externalLoading = false,
  enableFiltering = true,
  enableSorting = true,
  enableSearch = true,
  enablePagination = true,
  itemsPerPage = 12,
  defaultView = 'grid',
  showViewToggle = true,
  animated = true,
  onProductClick,
  onFilterChange,
  className,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [products, setProducts] = useState<Product[]>(initialProducts || MOCK_PRODUCTS);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(externalLoading);
  const [searchQuery, setSearchQuery] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach(product => {
      if (product.category?.name) {
        categories.add(product.category.name);
      }
    });
    return Array.from(categories);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search) ||
        product.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category?.name || '')
      );
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.pricing?.salePrice?.amount || product.pricing?.basePrice.amount || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(product =>
        (product.rating?.average || 0) >= filters.minRating
      );
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product =>
        product.inventory?.isInStock
      );
    }

    // Sale filter
    if (filters.onSale) {
      filtered = filtered.filter(product => product.isOnSale);
    }

    return filtered;
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy.value) {
        case 'price':
          const priceA = a.pricing?.salePrice?.amount || a.pricing?.basePrice.amount || 0;
          const priceB = b.pricing?.salePrice?.amount || b.pricing?.basePrice.amount || 0;
          comparison = priceA - priceB;
          break;
        case 'rating':
          comparison = (a.rating?.average || 0) - (b.rating?.average || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortBy.order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    if (!enablePagination) return sortedProducts;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, itemsPerPage, enablePagination]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedProducts.length / itemsPerPage);
  }, [sortedProducts.length, itemsPerPage]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    setLoading(externalLoading);
  }, [externalLoading]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filters, sortBy]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  const handleCategoryToggle = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    setFilters(prev => ({ ...prev, priceRange: range }));
  }, []);

  const handleRatingChange = useCallback((rating: number) => {
    setFilters(prev => ({ ...prev, minRating: rating }));
  }, []);

  const handleStockToggle = useCallback(() => {
    setFilters(prev => ({ ...prev, inStock: !prev.inStock }));
  }, []);

  const handleSaleToggle = useCallback(() => {
    setFilters(prev => ({ ...prev, onSale: !prev.onSale }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setSortBy(SORT_OPTIONS[0]);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, handlePageChange]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSearchBar = useCallback(() => {
    if (!enableSearch) return null;

    return (
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6"
      >
        {/* Categories */}
        {availableCategories.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Categories
            </h3>
            <div className="space-y-2">
              {availableCategories.map(category => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Minimum Rating
          </h3>
          <div className="space-y-2">
            {[4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => handleRatingChange(filters.minRating === rating ? 0 : rating)}
                className={cn(
                  'flex items-center gap-2 text-sm py-1 px-2 rounded transition-colors w-full',
                  filters.minRating === rating
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <span>{rating}★ & up</span>
                {filters.minRating === rating && <CheckIcon className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range - Placeholder for future implementation */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Price Range
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceRangeChange([Number(e.target.value), filters.priceRange[1]])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              placeholder="Min"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange([filters.priceRange[0], Number(e.target.value)])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Quick Filters
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={handleStockToggle}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={handleSaleToggle}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">On Sale</span>
            </label>
          </div>
        </div>
      </motion.div>
    );
  }, [
    enableFiltering,
    showFilters,
    availableCategories,
    filters,
    handleCategoryToggle,
    handleRatingChange,
    handlePriceRangeChange,
    handleStockToggle,
    handleSaleToggle,
  ]);

  const renderToolbar = useCallback(() => {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Left side - Search */}
        {renderSearchBar()}

        {/* Right side - Controls */}
        <div className="flex items-center gap-3">
          {/* Results count */}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatNumber(sortedProducts.length)} results
          </span>

          {/* Filter toggle */}
          {enableFiltering && (
            <Tooltip content="Toggle filters">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(prev => !prev)}
                className="relative"
              >
                <FunnelIcon className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </Tooltip>
          )}

          {/* Sort */}
          {enableSorting && (
            <select
              value={`${sortBy.value}-${sortBy.order}`}
              onChange={(e) => {
                const [value, order] = e.target.value.split('-');
                const option = SORT_OPTIONS.find(opt => opt.value === value && opt.order === order);
                if (option) handleSortChange(option);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map(option => (
                <option key={`${option.value}-${option.order}`} value={`${option.value}-${option.order}`}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* View toggle */}
          {showViewToggle && (
            <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <Tooltip content="Grid view">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'grid'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
              </Tooltip>
              <Tooltip content="List view">
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'list'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  aria-label="List view"
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
          )}

          {/* Reset filters */}
          {activeFilterCount > 0 && (
            <Tooltip content="Reset all filters">
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <ArrowPathIcon className="w-5 h-5" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }, [
    renderSearchBar,
    sortedProducts.length,
    enableFiltering,
    activeFilterCount,
    enableSorting,
    sortBy,
    showViewToggle,
    viewMode,
    handleSortChange,
    handleViewModeChange,
    handleResetFilters,
  ]);

  const renderProducts = useCallback(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <AdjustmentsHorizontalIcon className="w-12 h-12 text-gray-400 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        </div>
      );
    }

    if (paginatedProducts.length === 0) {
      return (
        <Card className="py-20">
          <CardContent className="flex flex-col items-center gap-4">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Try adjusting your filters or search query to find what you&apos;re looking for.
            </p>
            {activeFilterCount > 0 && (
              <Button onClick={handleResetFilters}>
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <motion.div
        className={cn(
          'grid gap-6',
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}
        variants={animated ? containerVariants : undefined}
        initial="hidden"
        animate="visible"
      >
        {paginatedProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={animated ? itemVariants : undefined}
          >
            <BestSellersCard
              product={product}
              variant={viewMode === 'list' ? 'detailed' : 'default'}
              animated={animated}
              onQuickView={onProductClick}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  }, [
    loading,
    paginatedProducts,
    viewMode,
    animated,
    activeFilterCount,
    handleResetFilters,
    onProductClick,
  ]);

  const renderPagination = useCallback(() => {
    if (!enablePagination || totalPages <= 1) return null;

    const pageNumbers: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    } else {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>

        {pageNumbers.map((page, index) => (
          typeof page === 'number' ? (
            <Button
              key={index}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="min-w-[2.5rem]"
            >
              {page}
            </Button>
          ) : (
            <span key={index} className="px-2 text-gray-500">
              {page}
            </span>
          )
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>
    );
  }, [
    enablePagination,
    totalPages,
    currentPage,
    handlePrevPage,
    handleNextPage,
    handlePageChange,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      {/* Toolbar */}
      {renderToolbar()}

      {/* Filters */}
      <AnimatePresence>
        {renderFilters()}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="mt-6">
        {renderProducts()}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default BestSellersProducts;

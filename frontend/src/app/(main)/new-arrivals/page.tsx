/**
 * New Arrivals Page
 * 
 * Displays all newly added products with comprehensive filtering and sorting:
 * - Hero section highlighting new arrivals
 * - Time-based filtering (this week, this month, last 3 months)
 * - Category and price filtering
 * - Multiple sort options
 * - Product grid with pagination
 * - Stats overview
 * - Responsive design
 * - SEO optimization
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  ClockIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

// Components
import { ProductGrid } from '@/components/products';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import SEOHead from '@/components/common/SEO/SEOHead';

// Types
import type { Product } from '@/types/product.types';

// Utils
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'popular';
type TimeFilter = 'all' | 'week' | 'month' | 'quarter';

interface ProductFilters {
  search: string;
  sortBy: SortOption;
  timeFilter: TimeFilter;
  minPrice?: number;
  maxPrice?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'Newest First' },
  { value: 'popular' as const, label: 'Most Popular' },
  { value: 'price_asc' as const, label: 'Price: Low to High' },
  { value: 'price_desc' as const, label: 'Price: High to Low' },
  { value: 'name_asc' as const, label: 'Name: A-Z' },
  { value: 'name_desc' as const, label: 'Name: Z-A' },
];

const TIME_FILTERS = [
  { value: 'all' as const, label: 'All Time', icon: SparklesIcon },
  { value: 'week' as const, label: 'This Week', icon: ClockIcon },
  { value: 'month' as const, label: 'This Month', icon: TagIcon },
  { value: 'quarter' as const, label: 'Last 3 Months', icon: FireIcon },
];

const ITEMS_PER_PAGE = 12;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewArrivalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ============================================================================
  // STATE
  // ============================================================================

  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams?.get('search') || '',
    sortBy: (searchParams?.get('sort') as SortOption) || 'newest',
    timeFilter: (searchParams?.get('time') as TimeFilter) || 'all',
  });

  // ============================================================================
  // FETCH DATA FROM API
  // ============================================================================

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        setIsLoading(true);

        // Try the new-arrivals endpoint first
        let fetchedProducts: any[] = [];

        const response = await fetch('/api/new-arrivals?limit=50', {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const result = await response.json();
          fetchedProducts = result.data?.products || result.products || [];
        }

        // Fallback to products API if new-arrivals is empty
        if (fetchedProducts.length === 0) {
          console.log('New arrivals empty, falling back to products API');
          const fallbackResponse = await fetch('/api/products?limit=50&isNewArrival=true', {
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
          });

          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            fetchedProducts = fallbackResult.data?.products || fallbackResult.products || fallbackResult.data || [];
          }
        }

        // If still empty, try getting all products
        if (fetchedProducts.length === 0) {
          console.log('Fallback also empty, getting all products');
          const allProductsResponse = await fetch('/api/products?limit=50', {
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
          });

          if (allProductsResponse.ok) {
            const allProductsResult = await allProductsResponse.json();
            fetchedProducts = allProductsResult.data?.products || allProductsResult.products || allProductsResult.data || [];
          }
        }

        // Transform the data to match Product type if needed
        const transformedProducts = fetchedProducts.map((p: any) => {
          // Get proper pricing - preserve existing structure if available
          const basePrice = p.pricing?.basePrice?.amount || p.price || p.variants?.[0]?.comparePrice || p.variants?.[0]?.price || 0;
          const salePrice = p.pricing?.salePrice?.amount || p.salePrice || p.variants?.[0]?.price || null;
          const hasDiscount = salePrice && salePrice < basePrice;

          return {
            ...p,
            id: p.id || p._id,
            category: p.category || { id: '', name: '', slug: '' },
            // Only set pricing if it doesn't already exist in proper format
            pricing: p.pricing?.basePrice ? p.pricing : {
              basePrice: { amount: basePrice, currency: 'INR', formatted: `₹${basePrice.toLocaleString('en-IN')}` },
              salePrice: hasDiscount ? { amount: salePrice, currency: 'INR', formatted: `₹${salePrice.toLocaleString('en-IN')}` } : undefined,
            },
            media: p.media?.images ? p.media : {
              images: p.images?.map((img: any, idx: number) => ({
                id: `img-${idx}`,
                url: typeof img === 'string' ? img : img.url,
                alt: p.name,
                isPrimary: idx === 0,
              })) || [{ id: 'default', url: p.thumbnail || '', alt: p.name, isPrimary: true }],
            },
            // Ensure inventory defaults to in-stock if no data is provided
            inventory: p.inventory || {
              quantity: p.stockQuantity ?? p.stock ?? 100, // Default to 100 if not specified
              isInStock: p.inStock !== false && p.outOfStock !== true,
              lowStockThreshold: 10
            },
            createdAt: p.createdAt || p.arrivalInfo?.arrivedAt || new Date(),
            isNewArrival: p.isNewArrival !== false,
            isFeatured: p.isFeatured || false,
            // Ensure isOnSale is set when there's a discount
            isOnSale: p.isOnSale || hasDiscount || false,
          };
        });

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNewArrivals();
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Time filter
    const now = new Date();
    if (filters.timeFilter !== 'all') {
      result = result.filter((p) => {
        const createdDate = new Date(p.createdAt);
        const daysDiff = Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.timeFilter) {
          case 'week':
            return daysDiff <= 7;
          case 'month':
            return daysDiff <= 30;
          case 'quarter':
            return daysDiff <= 90;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => {
          const aPrice = a.pricing?.basePrice?.amount || 0;
          const bPrice = b.pricing?.basePrice?.amount || 0;
          return aPrice - bPrice;
        });
        break;
      case 'price_desc':
        result.sort((a, b) => {
          const aPrice = a.pricing?.basePrice?.amount || 0;
          const bPrice = b.pricing?.basePrice?.amount || 0;
          return bPrice - aPrice;
        });
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popular':
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return bDate - aDate;
        });
    }

    return result;
  }, [products, filters]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
    [filteredProducts]
  );

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: products.length,
      thisWeek: products.filter((p) => {
        const daysDiff = Math.floor(
          (now.getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff <= 7;
      }).length,
      thisMonth: products.filter((p) => {
        const daysDiff = Math.floor(
          (now.getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff <= 30;
      }).length,
      featured: products.filter((p) => p.isFeatured).length,
    };
  }, [products]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
    setCurrentPage(1);
  }, []);

  const handleTimeFilterChange = useCallback((value: TimeFilter) => {
    setFilters((prev) => ({ ...prev, timeFilter: value }));
    setCurrentPage(1);
  }, []);

  const handleProductClick = useCallback(
    (product: Product) => {
      router.push(`/products/${product.slug}`);
    },
    [router]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      sortBy: 'newest',
      timeFilter: 'all',
    });
    setCurrentPage(1);
  }, []);

  // ============================================================================
  // EFFECTS - Loading is now handled by the data fetch
  // ============================================================================

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHero = () => (
    <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="w-12 h-12 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            New Arrivals
          </h1>
        </div>
        <p className="text-lg text-purple-100 mb-6 max-w-2xl">
          Discover our latest collection of premium fabrics and textiles.
          Fresh designs, exceptional quality, and innovative materials.
        </p>
        <div className="flex flex-wrap gap-3">
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
            <SparklesIcon className="w-4 h-4 mr-2" />
            {stats.total} New Products
          </Badge>
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
            <FireIcon className="w-4 h-4 mr-2" />
            {stats.featured} Featured
          </Badge>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total New</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <SparklesIcon className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
            <TagIcon className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Featured</p>
              <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
            </div>
            <FireIcon className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFilters = () => (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search new arrivals..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<Squares2X2Icon className="w-5 h-5" />}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              aria-label="Grid view"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              aria-label="List view"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Mobile Filters Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Time Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TIME_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = filters.timeFilter === filter.value;

          return (
            <button
              key={filter.value}
              onClick={() => handleTimeFilterChange(filter.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                isActive
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-600'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{filter.label}</span>
              {isActive && <CheckIcon className="w-4 h-4" />}
            </button>
          );
        })}
      </div>

      {/* Active Filters */}
      {(filters.search || filters.timeFilter !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-2">
              Search: {filters.search}
              <button
                onClick={() => handleSearchChange('')}
                className="hover:text-red-600"
                aria-label="Remove search filter"
                title="Remove search filter"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.timeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              Time: {TIME_FILTERS.find((f) => f.value === filters.timeFilter)?.label}
              <button
                onClick={() => handleTimeFilterChange('all')}
                className="hover:text-red-600"
                aria-label="Remove time filter"
                title="Remove time filter"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-purple-600 hover:text-purple-700"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );

  const renderProducts = () => {
    if (isLoading) {
      return (
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          )}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      const IconComponent = SparklesIcon;
      return (
        <EmptyState
          icon={<IconComponent className="w-12 h-12" />}
          title="No new arrivals found"
          description="Try adjusting your search or filter criteria"
          action={{
            label: 'Clear filters',
            onClick: handleClearFilters,
          }}
        />
      );
    }

    return (
      <>
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProductGrid
              products={paginatedProducts}
              onProductClick={handleProductClick}
            />
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      <SEOHead
        title="New Arrivals | Vardhman Mills"
        description="Discover our latest collection of premium fabrics and textiles with fresh designs and exceptional quality"
        keywords="new arrivals, latest fabrics, new textiles, fresh designs"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Hero Section */}
          {renderHero()}

          {/* Stats */}
          {renderStats()}

          {/* Filters & Search */}
          {renderFilters()}

          {/* Products Grid */}
          {renderProducts()}
        </div>
      </div>
    </>
  );
}

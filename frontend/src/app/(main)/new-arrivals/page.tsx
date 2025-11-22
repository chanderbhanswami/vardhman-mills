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

// Mock new arrivals products
const MOCK_NEW_ARRIVALS: Product[] = Array.from({ length: 36 }, (_, i) => {
  const daysAgo = i * 2;
  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - daysAgo);

  return {
    id: `new-product-${i + 1}`,
    name: `New Fabric ${i + 1}`,
    slug: `new-fabric-${i + 1}`,
    sku: `NF-${String(i + 1).padStart(4, '0')}`,
    description: `Brand new premium quality fabric with innovative design and exceptional quality.`,
    shortDescription: `Brand new premium quality fabric`,
    
    // Categorization
    categoryId: `cat-${(i % 5) + 1}`,
    category: {
      id: `cat-${(i % 5) + 1}`,
      name: `Category ${(i % 5) + 1}`,
      slug: `category-${(i % 5) + 1}`,
      description: `Category description ${(i % 5) + 1}`,
      children: [],
      level: 1,
      path: `/category-${(i % 5) + 1}`,
      status: 'active' as const,
      isVisible: true,
      isFeatured: false,
      productCount: 10,
      activeProductCount: 10,
      sortOrder: (i % 5) + 1,
      attributeGroups: [],
      seo: {
        title: `Category ${(i % 5) + 1}`,
        description: `Category description`,
      },
      createdBy: 'admin-1',
      updatedBy: 'admin-1',
      createdAt: new Date(2024, 0, 1),
      updatedAt: new Date(2024, 10, 20),
    },
    collectionIds: [],
    collections: [],
    
    // Pricing
    pricing: {
      basePrice: {
        amount: 600 + (i * 30),
        currency: 'INR',
        formatted: `₹${(600 + (i * 30)).toLocaleString('en-IN')}`,
      },
      salePrice: i % 4 === 0 ? {
        amount: 500 + (i * 25),
        currency: 'INR',
        formatted: `₹${(500 + (i * 25)).toLocaleString('en-IN')}`,
      } : undefined,
      isDynamicPricing: false,
      taxable: true,
    },
    
    // Media
    media: {
      images: [
        {
          id: `new-product-img-${i}`,
          url: `/images/products/new-fabric-${(i % 10) + 1}.jpg`,
          alt: `New Fabric ${i + 1}`,
          width: 800,
          height: 800,
          isPrimary: true,
        },
      ],
      videos: [],
      documents: [],
    },
    
    // Product Details
    specifications: [],
    features: ['New Arrival', 'Premium Quality', 'Innovative Design'],
    materials: [],
    colors: [],
    sizes: [],
    dimensions: {
      length: 100,
      width: 150,
      height: 0.5,
      unit: 'cm' as const,
    },
    weight: {
      value: 250,
      unit: 'g' as const,
    },
    
    // Inventory
    inventory: {
      quantity: 50 + i,
      isInStock: true,
      isLowStock: false,
      lowStockThreshold: 10,
      availableQuantity: 50 + i,
      backorderAllowed: false,
    },
    stock: 50 + i,
    
    // Marketing
    tags: ['new-arrival', 'premium', 'latest'],
    keywords: ['fabric', 'new', 'textile', 'premium'],
    seo: {
      title: `New Fabric ${i + 1}`,
      description: `New arrival fabric`,
    },
    
    // Status and Visibility
    status: 'active' as const,
    isPublished: true,
    isFeatured: i < 6,
    isNewArrival: true,
    isBestseller: false,
    isOnSale: i % 4 === 0,
    
    // Reviews and Ratings
    rating: {
      average: 4.0 + (i % 10) * 0.1,
      count: 10 + i,
      distribution: {
        1: 0,
        2: 1,
        3: 2,
        4: 3,
        5: 4 + i,
      },
    },
    reviewCount: 10 + i,
    
    // Variants
    variants: [],
    variantOptions: [],
    
    // Related Products
    relatedProductIds: [],
    crossSellProductIds: [],
    upsellProductIds: [],
    
    // Admin Fields
    createdBy: 'admin-1',
    updatedBy: 'admin-1',
    createdAt: createdDate,
    updatedAt: createdDate,
  };
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewArrivalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ============================================================================
  // STATE
  // ============================================================================

  const [products] = useState<Product[]>(MOCK_NEW_ARRIVALS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams?.get('search') || '',
    sortBy: (searchParams?.get('sort') as SortOption) || 'newest',
    timeFilter: (searchParams?.get('time') as TimeFilter) || 'all',
  });

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
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [filters]);

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
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'New Arrivals', href: '/new-arrivals' },
            ]}
            className="mb-6"
          />

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

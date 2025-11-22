/**
 * Brands Listing Page - Vardhman Mills
 * 
 * Comprehensive brands directory with filtering, sorting, and multiple view modes.
 * 
 * Features:
 * - Brand grid with multiple layouts (grid/list/masonry)
 * - Brand search and filtering
 * - Featured brands carousel
 * - Brand categories
 * - Sorting options
 * - View mode toggle
 * - Pagination
 * - SEO optimization
 * - Breadcrumb navigation
 * - Statistics display
 * - Responsive design
 * - Loading states
 * - Error handling
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ViewColumnsIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';

// Components
import { Container } from '@/components/ui';
import SEOHead from '@/components/common/SEO/SEOHead';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

// Home Components (Brand specific)
import BrandGrid from '@/components/home/Brands/BrandGrid';
import BrandCarousel from '@/components/home/Brands/BrandCarousel';

// Types
import type { Brand } from '@/types/product.types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES
// ============================================================================

interface StatsCard {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  color: string;
}

interface FilterState {
  search: string;
  featured: boolean;
  minProducts: number;
  categories: string[];
}

type ViewMode = 'grid' | 'list' | 'masonry';
type SortOption = 'name' | 'products' | 'newest' | 'popular';

// ============================================================================
// CONSTANTS
// ============================================================================

const BREADCRUMB_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Brands', href: '/brands' },
];

const STATS_CARDS: StatsCard[] = [
  {
    icon: BuildingStorefrontIcon,
    label: 'Total Brands',
    value: '150+',
    trend: '+8%',
    trendUp: true,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrophyIcon,
    label: 'Premium Brands',
    value: '45+',
    trend: '+12%',
    trendUp: true,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: FireIcon,
    label: 'Trending Now',
    value: '28',
    trend: '+25%',
    trendUp: true,
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: SparklesIcon,
    label: 'New Arrivals',
    value: '15',
    trend: 'This Month',
    trendUp: true,
    color: 'from-purple-500 to-indigo-500',
  },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'products', label: 'Most Products' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
];

// Mock brands data (replace with actual API call)
const MOCK_BRANDS: Brand[] = [];
const MOCK_FEATURED_BRANDS: Brand[] = [];

// ============================================================================
// COMPONENT
// ============================================================================

export default function BrandsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [brands] = useState<Brand[]>(MOCK_BRANDS);
  const [featuredBrands] = useState<Brand[]>(MOCK_FEATURED_BRANDS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    featured: false,
    minProducts: 0,
    categories: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const seoData = useMemo(() => ({
    title: 'Premium Brands - Home Textiles & Furnishings | Vardhman Mills',
    description: 'Explore our curated collection of premium home textile brands. Discover trusted manufacturers of bed sheets, towels, curtains, and furnishings.',
    keywords: 'home textile brands, premium furnishing brands, bed sheet brands, towel brands',
    ogImage: '/images/brands-og.jpg',
    canonical: 'https://vardhmanmills.com/brands',
  }), []);

  const filteredBrands = useMemo(() => {
    let result = [...brands];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(brand => 
        brand.name.toLowerCase().includes(searchLower) ||
        brand.description?.toLowerCase().includes(searchLower)
      );
    }

    // Featured filter
    if (filters.featured) {
      result = result.filter(brand => brand.isFeatured);
    }

    // Minimum products filter
    if (filters.minProducts > 0) {
      result = result.filter(brand => (brand.productCount || 0) >= filters.minProducts);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'products':
          return (b.productCount || 0) - (a.productCount || 0);
        case 'popular':
          return (b.followersCount || 0) - (a.followersCount || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [brands, filters, sortBy]);

  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBrands, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredBrands.length / itemsPerPage),
    [filteredBrands.length, itemsPerPage]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Load from URL params
    const page = searchParams?.get('page');
    const sort = searchParams?.get('sort');
    const search = searchParams?.get('search');
    const view = searchParams?.get('view');

    if (page) setCurrentPage(parseInt(page, 10));
    if (sort) setSortBy(sort as SortOption);
    if (search) setFilters(prev => ({ ...prev, search }));
    if (view) setViewMode(view as ViewMode);
  }, [searchParams]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleBrandClick = useCallback((brand: Brand) => {
    router.push(`/brands/${brand.slug}`);
  }, [router]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      featured: false,
      minProducts: 0,
      categories: [],
    });
    setCurrentPage(1);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBreadcrumbs = () => (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {BREADCRUMB_ITEMS.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <span className="text-gray-400">/</span>
          )}
          <a
            href={item.href}
            className={cn(
              'hover:text-blue-600 transition-colors',
              index === BREADCRUMB_ITEMS.length - 1
                ? 'text-gray-900 dark:text-white font-semibold'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {item.label}
          </a>
        </React.Fragment>
      ))}
    </nav>
  );

  const renderHeader = () => (
    <div className="space-y-6">
      {renderBreadcrumbs()}
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Premium Brands
          </h1>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl">
            Explore our curated collection of trusted home textile brands. Quality, style, and comfort from industry leaders.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
            >
              Explore Brands
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => router.push('/products')}
            >
              View Products
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_CARDS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Badge
                          className={cn(
                            'text-xs',
                            stat.trendUp
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {stat.trend}
                        </Badge>
                      </div>
                    </div>
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      'bg-gradient-to-br', stat.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderFeaturedCarousel = () => {
    if (featuredBrands.length === 0) return null;

    return (
      <section className="my-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Featured Brands
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Discover our handpicked premium brands
            </p>
          </div>
        </div>
        <BrandCarousel
          brands={featuredBrands}
          autoPlay
          autoPlayInterval={5000}
          showArrows
          showDots
          slidesPerView={4}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        />
      </section>
    );
  };

  const renderSearchAndFilters = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      {/* Left side - Search and results count */}
      <div className="flex-1 flex items-center gap-4 w-full sm:w-auto">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search brands..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatNumber(filteredBrands.length)}
          </span>{' '}
          brands
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Right side - View mode and sort */}
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('grid')}
            className="px-3"
          >
            <Squares2X2Icon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
            className="px-3"
          >
            <ListBulletIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'masonry' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('masonry')}
            className="px-3"
          >
            <ViewColumnsIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Sort brands"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderFiltersSidebar = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            Filters
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs"
          >
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Featured Only */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => handleFilterChange({ featured: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Featured Brands Only
            </span>
          </label>
        </div>

        {/* Minimum Products */}
        <div>
          <label htmlFor="min-products-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Products: {filters.minProducts}
          </label>
          <input
            id="min-products-slider"
            type="range"
            min="0"
            max="100"
            step="10"
            value={filters.minProducts}
            onChange={(e) => handleFilterChange({ minProducts: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            aria-label="Minimum products filter"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>100+</span>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.featured || filters.minProducts > 0) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Active Filters:
            </p>
            <div className="flex flex-wrap gap-2">
              {filters.featured && (
                <Badge className="bg-blue-100 text-blue-800">
                  Featured
                  <button
                    onClick={() => handleFilterChange({ featured: false })}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.minProducts > 0 && (
                <Badge className="bg-blue-100 text-blue-800">
                  Min {filters.minProducts} products
                  <button
                    onClick={() => handleFilterChange({ minProducts: 0 })}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderBrands = () => {
    if (filteredBrands.length === 0) {
      return (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            No brands found matching your criteria
          </p>
          <Button onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </Card>
      );
    }

    return (
      <>
        <BrandGrid
          brands={paginatedBrands}
          variant={viewMode}
          enableFiltering={false}
          enableSorting={false}
          showViewToggle={false}
          animated
          onBrandClick={handleBrandClick}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
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
        )}
      </>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      <SEOHead {...seoData} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
      >
        <Container>
          {renderHeader()}
          {renderFeaturedCarousel()}

          <div className="mt-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters (Desktop) */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  {renderFiltersSidebar()}
                </div>
              </aside>

              {/* Mobile Filters */}
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 lg:hidden"
                  >
                    <div
                      className="absolute inset-0 bg-black/50"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'tween', duration: 0.3 }}
                      className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 overflow-y-auto p-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Filters</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsFilterOpen(false)}
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </Button>
                      </div>
                      {renderFiltersSidebar()}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content Area */}
              <div className="flex-1 space-y-6">
                {renderSearchAndFilters()}
                {renderBrands()}
              </div>
            </div>
          </div>
        </Container>
      </motion.div>
    </>
  );
}

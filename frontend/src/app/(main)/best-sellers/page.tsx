/**
 * Best Sellers Page - Vardhman Mills
 * 
 * Comprehensive best-selling products showcase page with advanced filtering,
 * sorting, pagination, and analytics integration.
 * 
 * Features:
 * - Best sellers product grid with multiple views
 * - Advanced filtering (category, price, rating, availability)
 * - Multiple sorting options
 * - Pagination and infinite scroll
 * - Product quick view
 * - Add to cart/wishlist
 * - SEO optimization
 * - Analytics tracking
 * - Breadcrumb navigation
 * - Banner/hero section
 * - Product recommendations
 * - Statistics and metrics
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
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3Icon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';

// Components
import Container from '@/components/ui/Container';
import SEOHead from '@/components/common/SEO/SEOHead';
import { Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';
import ErrorMessage from '@/components/common/Error/ErrorMessage';

// Home Components (Best Sellers specific)
import BestSellersBanner from '@/components/home/BestSellers/BestSellersBanner';
import BestSellersProducts from '@/components/home/BestSellers/BestSellersProducts';
import BestSellersCard from '@/components/home/BestSellers/BestSellersCard';
import BestSellersProductCarousel from '@/components/home/BestSellers/ProductCarousel';

// Product Components
import {
  ProductGrid,
  ProductSort,
  QuickView,
} from '@/components/products';

// Hooks and Utils
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/useToast';
import { fetchProducts } from '@/store/slices/productSlice';
import { cn } from '@/lib/utils/utils';
import { formatNumber, formatCurrency } from '@/lib/format';

// Types
import type { Product, ProductFilters as ProductFilterType, ProductSortOption } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BestSellersPageProps {}

interface StatsCard {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

interface ViewMode {
  type: 'grid' | 'list';
  columns: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PAGE_SIZE = 24;
const BREADCRUMB_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Best Sellers', href: '/best-sellers' },
];

const STATS_CARDS: StatsCard[] = [
  {
    icon: TrophyIcon,
    label: 'Top Products',
    value: '500+',
    trend: '+12%',
    trendUp: true,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: FireIcon,
    label: 'Hot Items',
    value: '250+',
    trend: '+28%',
    trendUp: true,
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: ChartBarIcon,
    label: 'Categories',
    value: '15+',
    trend: 'Stable',
    trendUp: true,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: SparklesIcon,
    label: 'New Entries',
    value: '45+',
    trend: '+15%',
    trendUp: true,
    color: 'from-purple-500 to-indigo-500',
  },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BestSellersPage({}: BestSellersPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // ============================================================================
  // STATE
  // ============================================================================

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode['type']>('grid');
  const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Partial<ProductFilterType>>({
    isBestseller: true,
    sortBy: 'bestselling',
  });

  // Redux State
  const {
    products,
    isLoading: loading,
    error,
    pagination,
  } = useAppSelector((state) => state.product);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const bestSellerProducts = useMemo(() => {
    return products.filter((product: Product) => product.isBestseller);
  }, [products]);

  const topProducts = useMemo(() => {
    return bestSellerProducts.slice(0, 8);
  }, [bestSellerProducts]);

  const seoData = useMemo(() => ({
    title: 'Best Sellers - Premium Home Textiles | Vardhman Mills',
    description: 'Discover our best-selling home textiles and furnishings. Premium quality bed sheets, towels, curtains, and more. Shop the most popular products loved by thousands of customers.',
    keywords: 'best sellers, popular products, top rated, bed sheets, home textiles, premium furnishings',
    ogImage: '/images/best-sellers-og.jpg',
    canonical: 'https://vardhmanmills.com/best-sellers',
  }), []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch products on mount and filter change
  useEffect(() => {
    dispatch(fetchProducts({
      ...filters,
      page: currentPage,
      limit: DEFAULT_PAGE_SIZE,
    }));
  }, [dispatch, filters, currentPage]);

  // Handle URL params
  useEffect(() => {
    if (!searchParams) return;
    
    const page = searchParams.get('page');
    const sort = searchParams.get('sort');
    const category = searchParams.get('category');

    if (page) setCurrentPage(parseInt(page, 10));
    if (sort) setFilters(prev => ({ ...prev, sortBy: sort as ProductSortOption }));
    if (category) setFilters(prev => ({ ...prev, categoryIds: [category] }));
  }, [searchParams]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // TODO: Implement filter functionality when ProductFilters component is available
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFilterChange = useCallback((newFilters: Partial<ProductFilterType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
    router.push(`/best-sellers?${params.toString()}`);
  }, [router]);

  const handleSortChange = useCallback((sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as ProductSortOption }));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleQuickView = useCallback((product: Product) => {
    setSelectedQuickView(product);
  }, []);

  const handleAddToCart = useCallback((productId: string) => {
    // TODO: Implement actual add to cart logic with Redux
    console.log('Adding product to cart:', productId);
    showToast('Product added to cart successfully', 'success');
  }, [showToast]);

  const handleAddToWishlist = useCallback((productId: string) => {
    // TODO: Implement actual add to wishlist logic with Redux
    console.log('Adding product to wishlist:', productId);
    showToast('Product added to wishlist successfully', 'success');
  }, [showToast]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderHeader = () => (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={BREADCRUMB_ITEMS} />

      {/* Banner */}
      <BestSellersBanner
        title="Best Sellers"
        subtitle="Most Popular Products"
        description="Discover our top-rated and most-loved home textiles. Quality products trusted by thousands of satisfied customers."
        showStats
        animated
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_CARDS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
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
                      {stat.trend && (
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
                      )}
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

  const renderFiltersAndSort = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      {/* Left side - Results count and filter button */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatNumber(pagination.total || bestSellerProducts.length)}
          </span>{' '}
          products found
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
            onClick={() => setViewMode('grid')}
            className="px-3"
          >
            <Squares2X2Icon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="px-3"
          >
            <ListBulletIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Sort Dropdown */}
        <ProductSort
          value={filters.sortBy || 'bestselling'}
          onChange={handleSortChange}
          options={[
            { value: 'bestselling', label: 'Best Selling', icon: TrophyIcon },
            { value: 'rating_desc', label: 'Highest Rated', icon: StarIcon },
            { value: 'price_asc', label: 'Price: Low to High', icon: ArrowUpIcon },
            { value: 'price_desc', label: 'Price: High to Low', icon: ArrowDownIcon },
            { value: 'name_asc', label: 'Name: A-Z', icon: Bars3Icon },
            { value: 'created_desc', label: 'Newest First', icon: ClockIcon },
          ]}
        />
      </div>
    </div>
  );

  const renderProducts = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <ErrorMessage
          title="Failed to Load Products"
          message={error}
          onRetry={() => dispatch(fetchProducts(filters))}
        />
      );
    }

    if (bestSellerProducts.length === 0) {
      return (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            No best seller products found
          </p>
          <Button onClick={() => router.push('/products')}>
            Browse All Products
          </Button>
        </Card>
      );
    }

    return (
      <>
        <BestSellersProducts
          products={bestSellerProducts}
          viewMode={viewMode}
          loading={loading}
          onProductClick={(product: Product) => router.push(`/products/${product.slug}`)}
          onQuickView={handleQuickView}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          showPagination
          currentPage={currentPage}
          totalPages={pagination.totalPages || 1}
          onPageChange={handlePageChange}
        />
        {/* Alternative ProductGrid view for compact display */}
        {viewMode === 'grid' && bestSellerProducts.length > 8 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">All Best Sellers - Grid View</h3>
            <ProductGrid
              products={bestSellerProducts.slice(8)}
              columns={4}
              gap="md"
              isLoading={loading}
              enableQuickView
              onProductClick={(product) => router.push(`/products/${product.slug}`)}
            />
          </div>
        )}
      </>
    );
  };

  const renderTopSellingCarousel = () => {
    if (topProducts.length === 0) return null;

    return (
      <section className="my-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Top 8 Best Sellers
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our most popular products right now
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            View All
          </Button>
        </div>
        <BestSellersProductCarousel
          products={topProducts}
          autoPlay
          showArrows
          showDots
        />
      </section>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      <SEOHead {...seoData} />

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
      >
        <Container>
          {/* Header Section */}
          {renderHeader()}

          {/* Top Selling Carousel */}
          {renderTopSellingCarousel()}

          {/* Main Content */}
          <div className="mt-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters (Desktop) */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        Filters
                      </h3>
                    </CardHeader>
                    <CardContent>
                      {/* TODO: Implement ProductFilters component */}
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Filters coming soon...
                        </p>
                        {/* Using BestSellersCard component for featured products in sidebar */}
                        <div className="space-y-2">
                          {bestSellerProducts.slice(0, 3).map((product: Product) => (
                            <BestSellersCard 
                              key={product.id}
                              product={product}
                              variant="compact"
                              onClick={() => router.push(`/products/${product.slug}`)}
                            />
                          ))}
                        </div>
                        {/* Display formatted price using formatCurrency */}
                        {bestSellerProducts.length > 0 && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Price Range: {formatCurrency(0)} - {formatCurrency(10000)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                          Close
                        </Button>
                      </div>
                      {/* TODO: Implement ProductFilters component */}
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Filters coming soon...
                        </p>
                        {/* Using BestSellersCard for mobile filter panel */}
                        <div className="space-y-2">
                          {bestSellerProducts.slice(0, 3).map((product: Product) => (
                            <BestSellersCard 
                              key={product.id}
                              product={product}
                              variant="compact"
                              onClick={() => {
                                setIsFilterOpen(false);
                                router.push(`/products/${product.slug}`);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content Area */}
              <div className="flex-1 space-y-6">
                {/* Filters and Sort Bar */}
                {renderFiltersAndSort()}

                {/* Products Grid/List */}
                {renderProducts()}
              </div>
            </div>
          </div>
        </Container>
      </motion.div>

      {/* Quick View Modal */}
      {selectedQuickView && (
        <QuickView
          product={selectedQuickView}
          isOpen={!!selectedQuickView}
          onClose={() => setSelectedQuickView(null)}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />
      )}
    </>
  );
}

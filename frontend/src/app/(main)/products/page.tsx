/**
 * Products Listing Page - Vardhman Mills
 * Main products catalog with filtering, sorting, and search
 */

'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import {
  LoadingSpinner,
  ErrorBoundary,
  SEOHead,
  BackToTop,
} from '@/components/common';

// Product Components
import {
  ProductGrid,
  ProductGridSkeleton,
  ProductList,
  QuickView,
  ProductSort,
  AvailabilityFilter,
  BrandFilter,
  CategoryFilter,
  ColorFilter,
  RatingFilter,
  SizeFilter,
  ThreadCountFilter,
  PriceFilter,
  MaterialFilter,
  ArrivalFilter,
  defaultFilterState,
  NoResults,
} from '@/components/products';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';
import { useCart } from '@/hooks/useCart';
// import { useWishlist } from '@/hooks/useWishlist'; // Available for future wishlist features
import { useDebounce, useLocalStorage, useMediaQuery } from '@/hooks';

// API
import { useInfiniteProducts } from '@/lib/api/productApi';

// Types
import type { Product, Brand } from '@/types/product.types';
import type { FilterState, GridLayout, ProductSortOption } from '@/components/products';

// Utils
import { cn, formatCurrency } from '@/lib/utils';
// API_ENDPOINTS available from constants if needed for future API integration

// Icons
import {
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// Constants
const PRODUCTS_PER_PAGE = 24;
// Cache duration constant available for future caching implementation
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// MOCK FILTER DATA
// ============================================================================

// Mock data for filter options (replace with API data in production)
const mockCategories: Array<{ id: string; name: string; count: number; level: number }> = [
  { id: '1', name: 'Cotton Bedsheets', count: 145, level: 0 },
  { id: '2', name: 'Silk Bedsheets', count: 89, level: 0 },
  { id: '3', name: 'Linen Bedsheets', count: 67, level: 0 },
  { id: '4', name: 'Satin Bedsheets', count: 54, level: 0 },
];

const mockColors: Array<{ id: string; name: string; hex: string; count: number }> = [
  { id: 'white', name: 'White', hex: '#FFFFFF', count: 120 },
  { id: 'blue', name: 'Blue', hex: '#0000FF', count: 95 },
  { id: 'red', name: 'Red', hex: '#FF0000', count: 78 },
  { id: 'green', name: 'Green', hex: '#00FF00', count: 65 },
  { id: 'black', name: 'Black', hex: '#000000', count: 87 },
];

const mockSizes: Array<{ id: string; name: string; count: number; isAvailable: boolean }> = [
  { id: 'single', name: 'Single', count: 98, isAvailable: true },
  { id: 'double', name: 'Double', count: 156, isAvailable: true },
  { id: 'queen', name: 'Queen', count: 134, isAvailable: true },
  { id: 'king', name: 'King', count: 112, isAvailable: true },
];

const mockMaterials: Array<{ id: string; name: string; count: number }> = [
  { id: 'cotton-100', name: '100% Cotton', count: 145 },
  { id: 'cotton-blend', name: 'Cotton Blend', count: 89 },
  { id: 'pure-silk', name: 'Pure Silk', count: 67 },
  { id: 'linen-mix', name: 'Linen Mix', count: 54 },
];

const mockBrands: Array<{ id: string; name: string; count: number }> = [
  { id: 'brand-1', name: 'Vardhman Mills', count: 234 },
  { id: 'brand-2', name: 'Premium Home', count: 156 },
  { id: 'brand-3', name: 'Luxury Linens', count: 98 },
];

const mockRatings: Array<{ value: number; label: string; count: number }> = [
  { value: 4, label: '4 Stars & Up', count: 234 },
  { value: 3, label: '3 Stars & Up', count: 345 },
  { value: 2, label: '2 Stars & Up', count: 423 },
  { value: 1, label: '1 Star & Up', count: 500 },
];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Extended Product type for filter attributes
interface ProductWithAttributes extends Omit<Product, 'brand'> {
  attributes?: {
    color?: string;
    size?: string;
    material?: string;
    brand?: string;
    threadCount?: number;
  };
  color?: string;
  size?: string;
  material?: string;
  brand?: string | Brand;
}

interface ProductsPageContentProps {
  initialProducts?: Product[];
  initialTotal?: number;
}

function ProductsPageContent({ initialProducts = [], initialTotal = 0 }: ProductsPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Responsive
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // UI State
  const viewModeStorage = useLocalStorage<GridLayout>('product-view-mode', { defaultValue: 'grid' });
  const viewMode = viewModeStorage.value;
  const setViewMode = viewModeStorage.setValue;
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilterState,
    categoryIds: searchParams?.get('category') ? [searchParams.get('category')!] : [],
    priceRange: {
      min: Number(searchParams?.get('minPrice')) || 0,
      max: Number(searchParams?.get('maxPrice')) || 10000,
    },
  });

  // Sort State
  const [sortBy, setSortBy] = useState<ProductSortOption>('relevance');

  // Fetch products using React Query infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteProducts({
    limit: PRODUCTS_PER_PAGE,
    search: debouncedSearch || undefined,
    sortBy: sortBy as string,
  });

  // Flatten all pages into a single products array
  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data || []);
  }, [data]);

  // Get total count
  const total = useMemo(() => {
    if (!data?.pages || !data.pages[0]?.meta) return 0;
    return data.pages[0].meta.total || 0;
  }, [data]);

  // Apply sorting function - defined before applyFilters
  const applySorting = useCallback((items: Product[], sort: ProductSortOption): Product[] => {
    const sorted = [...items];

    switch (sort) {
      case 'price_asc':
        return sorted.sort((a, b) => {
          const aPrice = a.pricing.salePrice?.amount || a.pricing.basePrice.amount;
          const bPrice = b.pricing.salePrice?.amount || b.pricing.basePrice.amount;
          return aPrice - bPrice;
        });
      case 'price_desc':
        return sorted.sort((a, b) => {
          const aPrice = a.pricing.salePrice?.amount || a.pricing.basePrice.amount;
          const bPrice = b.pricing.salePrice?.amount || b.pricing.basePrice.amount;
          return bPrice - aPrice;
        });
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating_desc':
        return sorted.sort((a, b) => {
          const aRating = typeof a.rating === 'number' ? a.rating : 0;
          const bRating = typeof b.rating === 'number' ? b.rating : 0;
          return bRating - aRating;
        });
      case 'created_desc':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'created_asc':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'review_count_desc':
      case 'popularity':
        return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'bestselling':
        return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      default:
        return sorted;
    }
  }, []);

  // Filter products
  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Category filter
    if (filters.categoryIds.length > 0) {
      filtered = filtered.filter(p => filters.categoryIds.includes(p.category.id || p.category.name));
    }

    // Price filter
    filtered = filtered.filter(
      p => {
        const price = p.pricing?.salePrice?.amount || p.pricing?.basePrice?.amount || p.price || 0;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      }
    );

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(p => {
        const productWithAttrs = p as ProductWithAttributes;
        const color = productWithAttrs.attributes?.color || productWithAttrs.color || '';
        return filters.colors.includes(color);
      });
    }

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(p => {
        const productWithAttrs = p as ProductWithAttributes;
        const size = productWithAttrs.attributes?.size || productWithAttrs.size || '';
        return filters.sizes.includes(size);
      });
    }

    // Material filter
    if (filters.materials.length > 0) {
      filtered = filtered.filter(p => {
        const productWithAttrs = p as ProductWithAttributes;
        const material = productWithAttrs.attributes?.material || productWithAttrs.material || '';
        return filters.materials.includes(material);
      });
    }

    // Brand filter
    if (filters.brandIds.length > 0) {
      filtered = filtered.filter(p => {
        const productWithAttrs = p as ProductWithAttributes;
        const brand = productWithAttrs.attributes?.brand || productWithAttrs.brand || '';
        const brandId = typeof brand === 'string' ? brand : brand?.id || '';
        return filters.brandIds.includes(brandId);
      });
    }

    // Rating filter
    if (filters.ratings.length > 0) {
      filtered = filtered.filter(p => {
        const rating = typeof p.rating === 'number' ? p.rating : 0;
        return filters.ratings.some(r => rating >= r);
      });
    }

    // Availability filter
    if (filters.availability === 'in_stock') {
      filtered = filtered.filter(p => p.inventory.isInStock !== false);
    } else if (filters.availability === 'out_of_stock') {
      filtered = filtered.filter(p => p.inventory.isInStock === false);
    }

    // Thread count filter
    if (filters.threadCount.min > 0 || filters.threadCount.max < 1000) {
      filtered = filtered.filter(
        p => {
          const productWithAttrs = p as ProductWithAttributes;
          const threadCount = productWithAttrs.attributes?.threadCount || 0;
          return threadCount >= filters.threadCount.min && threadCount <= filters.threadCount.max;
        }
      );
    }

    // New arrivals filter based on period
    if (filters.arrivalPeriod !== 'all') {
      const now = Date.now();
      const periods = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        quarter: 90 * 24 * 60 * 60 * 1000,
      };
      const periodMs = periods[filters.arrivalPeriod] || 0;
      filtered = filtered.filter(p => {
        const createdAt = new Date(p.createdAt).getTime();
        return now - createdAt <= periodMs;
      });
    }

    // Apply sorting
    filtered = applySorting(filtered, sortBy);

    return filtered;
  }, [products, filters, sortBy, applySorting]);

  const filteredProducts = useMemo(() => applyFilters(), [applyFilters]);

  // Handlers
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilterState);
    setSearchQuery('');
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    router.push(`/products/${product.slug}`);
  }, [router]);

  const handleQuickView = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  }, []);

  const handleAddToCart = useCallback(async (product: Product) => {
    try {
      await addToCart(product, 1);
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
        variant: 'success',
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message || 'Failed to add product to cart',
        variant: 'destructive',
      });
    }
  }, [addToCart, toast]);

  // Wishlist toggle handler - available for future use when QuickView or ProductGrid components add wishlist support
  // const handleToggleWishlist = useCallback(async (product: Product) => {
  //   try {
  //     if (isInWishlist(product.id)) {
  //       await removeFromWishlist(product.id);
  //       toast({
  //         title: 'Removed from wishlist',
  //         description: `${product.name} has been removed from your wishlist`,
  //         variant: 'success',
  //       });
  //     } else {
  //       await addToWishlist(product);
  //       toast({
  //         title: 'Added to wishlist',
  //         description: `${product.name} has been added to your wishlist`,
  //         variant: 'success',
  //       });
  //     }
  //   } catch (error) {
  //     const err = error as Error;
  //     toast({
  //       title: 'Error',
  //       description: err.message || 'Failed to update wishlist',
  //       variant: 'destructive',
  //     });
  //   }
  // }, [addToWishlist, removeFromWishlist, isInWishlist, toast]);

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  // No longer need fetchProducts useEffect - React Query handles it
  // applyFilters on filter/sort changes
  useEffect(() => {
    // Filters are applied via useMemo, no action needed
  }, [filters, sortBy]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categoryIds.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.sizes.length > 0) count++;
    if (filters.materials.length > 0) count++;
    if (filters.brandIds.length > 0) count++;
    if (filters.ratings.length > 0) count++;
    if (filters.availability !== 'all') count++;
    if (filters.threadCount.min > 0 || filters.threadCount.max < 1000) count++;
    if (filters.arrivalPeriod !== 'all') count++;
    if (debouncedSearch) count++;
    return count;
  }, [filters, debouncedSearch]);

  if (isError && products.length === 0) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
    return (
      <ErrorBoundary>
        <SEOHead
          title="Products - Vardhman Mills"
          description="Browse our collection of premium bedsheets"
          keywords="bedsheets, cotton, silk, linen"
        />
        <div className="container mx-auto py-12 px-4">
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => window.location.reload()}>
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SEOHead
        title={`Products ${searchQuery ? `- ${searchQuery}` : ''} | Vardhman Mills`}
        description="Browse our premium collection of bedsheets, made from finest materials"
        keywords="bedsheets, cotton bedsheets, silk bedsheets, premium bedding"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
              ]}
            />
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user ? `Welcome back, ${user.email?.split('@')[0] || 'User'}!` : 'Our Products'}
                </h1>
                <p className="text-gray-600 mt-2">
                  Showing {filteredProducts.length} of {total} products
                  {user && ' curated for you'}
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      aria-label="Clear search"
                      title="Clear search"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <Tooltip content="View Wishlist">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/wishlist')}>
                      <HeartIcon className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="View Cart">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/cart')}>
                      <ShoppingCartIcon className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <AnimatePresence>
              {(showFilters || !isMobile) && (
                <motion.aside
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className={cn(
                    'lg:w-64 flex-shrink-0',
                    isMobile && 'fixed inset-0 z-50 bg-white overflow-y-auto'
                  )}
                >
                  <Card className={cn(isMobile && 'h-full rounded-none')}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </CardTitle>
                      {isMobile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFilters(false)}
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CategoryFilter
                        categories={mockCategories}
                        selectedCategoryIds={filters.categoryIds}
                        onCategoryChange={(categoryIds) => handleFilterChange({ categoryIds })}
                      />
                      <PriceFilter
                        minPrice={0}
                        maxPrice={10000}
                        selectedRange={filters.priceRange}
                        onRangeChange={(priceRange) => handleFilterChange({ priceRange })}
                      />
                      <ColorFilter
                        colors={mockColors}
                        selectedColors={filters.colors}
                        onColorChange={(colors) => handleFilterChange({ colors })}
                      />
                      <SizeFilter
                        sizes={mockSizes}
                        selectedSizes={filters.sizes}
                        onSizeChange={(sizes) => handleFilterChange({ sizes })}
                      />
                      <MaterialFilter
                        materials={mockMaterials}
                        selectedMaterials={filters.materials}
                        onMaterialChange={(materials) => handleFilterChange({ materials })}
                      />
                      <BrandFilter
                        brands={mockBrands}
                        selectedBrandIds={filters.brandIds}
                        onBrandChange={(brandIds) => handleFilterChange({ brandIds })}
                      />
                      <RatingFilter
                        ratings={mockRatings}
                        selectedRatings={filters.ratings}
                        onRatingChange={(ratings) => handleFilterChange({ ratings })}
                      />
                      <ThreadCountFilter
                        minThreadCount={0}
                        maxThreadCount={1000}
                        selectedRange={filters.threadCount}
                        onRangeChange={(threadCount) => handleFilterChange({ threadCount })}
                      />
                      <AvailabilityFilter
                        selectedAvailability={filters.availability}
                        onAvailabilityChange={(availability) => handleFilterChange({ availability })}
                      />
                      <ArrivalFilter
                        selectedPeriod={filters.arrivalPeriod}
                        onPeriodChange={(arrivalPeriod) => handleFilterChange({ arrivalPeriod })}
                      />

                      {activeFiltersCount > 0 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleClearFilters}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {(isMobile || isTablet) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(true)}
                      >
                        <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <ProductSort value={sortBy} onChange={setSortBy} />

                    <div className="flex items-center gap-1 border rounded-lg p-1">
                      <Tooltip content="Grid View">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                        >
                          <Squares2X2Icon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="List View">
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                        >
                          <ListBulletIcon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Display */}
              {isLoading ? (
                <ProductGridSkeleton count={PRODUCTS_PER_PAGE} layout={viewMode} />
              ) : filteredProducts.length === 0 ? (
                <NoResults
                  query={searchQuery}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <ProductGrid
                      products={filteredProducts}
                      isLoading={isLoading}
                      onProductClick={handleProductClick}
                      layout="grid"
                    />
                  ) : (
                    <ProductList
                      products={filteredProducts}
                      onProductClick={handleProductClick}
                    />
                  )}

                  {/* Load More */}
                  {hasNextPage && !isFetchingNextPage && (
                    <div className="flex justify-center py-8">
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        size="lg"
                      >
                        Load More Products
                      </Button>
                    </div>
                  )}
                  
                  {isFetchingNextPage && (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick View Modal */}
        {selectedProduct && (
          <QuickView
            product={selectedProduct}
            isOpen={showQuickView}
            onClose={() => {
              setShowQuickView(false);
              setSelectedProduct(null);
            }}
            onAddToCart={(productId: string) => {
              // QuickView expects productId, but we already have selectedProduct
              if (selectedProduct && selectedProduct.id === productId) {
                handleAddToCart(selectedProduct);
              }
            }}
          />
        )}

        {/* Floating Quick View Button - Mobile */}
        {isMobile && filteredProducts.length > 0 && (
          <div className="fixed bottom-20 right-4 z-40">
            <Tooltip content="Quick View First Product">
              <Button
                variant="default"
                size="lg"
                className="rounded-full shadow-lg"
                onClick={() => handleQuickView(filteredProducts[0])}
              >
                <EyeIcon className="w-6 h-6" />
              </Button>
            </Tooltip>
          </div>
        )}

        {/* Back to Top */}
        <BackToTop />
      </div>
    </ErrorBoundary>
  );
}

// Main export with Suspense wrapper
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={24} layout="grid" />}>
      <ProductsPageContent />
    </Suspense>
  );
}

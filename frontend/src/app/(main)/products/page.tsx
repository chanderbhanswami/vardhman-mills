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
import { Separator } from '@/components/ui/Separator';

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
  PatternFilter,
  OccasionFilter,
  DiscountFilter,
  defaultFilterState,
  NoResults,
} from '@/components/products';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';
import { useCart } from '@/hooks/cart/useCart';
import { useAddToCart } from '@/hooks/cart/useAddToCart';
import { useRemoveFromCart } from '@/hooks/cart/useRemoveFromCart';
import { useWishlist } from '@/hooks/useWishlist'; // Use the same hook as home page
import { useDebounce, useLocalStorage, useMediaQuery } from '@/hooks';

// API
import { useInfiniteProducts } from '@/lib/api/productApi';
import useCategories from '@/hooks/categories/useCategories';
import useBrands from '@/hooks/brands/useBrands';

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

// ============================================================================
// MOCK FILTER DATA
// ============================================================================

// Static filter data (until API supports these)
const staticColors: Array<{ id: string; name: string; hex: string; count: number }> = [
  { id: 'white', name: 'White', hex: '#FFFFFF', count: 120 },
  { id: 'blue', name: 'Blue', hex: '#0000FF', count: 95 },
  { id: 'red', name: 'Red', hex: '#FF0000', count: 78 },
  { id: 'green', name: 'Green', hex: '#00FF00', count: 65 },
  { id: 'black', name: 'Black', hex: '#000000', count: 87 },
  { id: 'yellow', name: 'Yellow', hex: '#FFFF00', count: 45 },
  { id: 'purple', name: 'Purple', hex: '#800080', count: 34 },
  { id: 'pink', name: 'Pink', hex: '#FFC0CB', count: 56 },
  { id: 'orange', name: 'Orange', hex: '#FFA500', count: 42 },
  { id: 'gray', name: 'Gray', hex: '#808080', count: 67 },
  { id: 'brown', name: 'Brown', hex: '#A52A2A', count: 38 },
  { id: 'beige', name: 'Beige', hex: '#F5F5DC', count: 89 },
  { id: 'navy', name: 'Navy', hex: '#000080', count: 52 },
  { id: 'teal', name: 'Teal', hex: '#008080', count: 29 },
  { id: 'maroon', name: 'Maroon', hex: '#800000', count: 31 },
];

const staticSizes: Array<{ id: string; name: string; count: number; isAvailable: boolean }> = [
  { id: 'single', name: 'Single', count: 98, isAvailable: true },
  { id: 'double', name: 'Double', count: 156, isAvailable: true },
  { id: 'queen', name: 'Queen', count: 134, isAvailable: true },
  { id: 'king', name: 'King', count: 112, isAvailable: true },
];

const staticMaterials: Array<{ id: string; name: string; count: number }> = [
  { id: 'cotton-100', name: '100% Cotton', count: 145 },
  { id: 'cotton-blend', name: 'Cotton Blend', count: 89 },
  { id: 'pure-silk', name: 'Pure Silk', count: 67 },
  { id: 'linen-mix', name: 'Linen Mix', count: 54 },
];

const staticPatterns: Array<{ id: string; name: string; count: number }> = [
  { id: 'solid', name: 'Solid', count: 210 },
  { id: 'stripe', name: 'Stripe', count: 85 },
  { id: 'check', name: 'Check', count: 64 },
  { id: 'floral', name: 'Floral', count: 92 },
  { id: 'abstract', name: 'Abstract', count: 45 },
  { id: 'geometric', name: 'Geometric', count: 58 },
  { id: 'paisley', name: 'Paisley', count: 23 },
  { id: 'polka-dot', name: 'Polka Dot', count: 19 },
];

const staticOccasions: Array<{ id: string; name: string; count: number }> = [
  { id: 'daily-use', name: 'Daily Use', count: 320 },
  { id: 'luxury', name: 'Luxury', count: 85 },
  { id: 'wedding', name: 'Wedding', count: 42 },
  { id: 'party', name: 'Party', count: 28 },
  { id: 'hotel', name: 'Hotel Collection', count: 65 },
];

// Mock ratings
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
    pattern?: string;
    occasion?: string;
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

  // Cart hooks
  const { cart, getItemQuantity } = useCart();
  const { addToCart: addToCartMutation } = useAddToCart();
  const { removeByProduct: removeFromCartByProduct } = useRemoveFromCart();

  // Wishlist - Use same localStorage hook as home page
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

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
    // search: debouncedSearch || undefined, // Removed invalid prop, using client-side filtering
    sort: sortBy as string,
  });

  // Fetch Filters Data
  const { categories: apiCategories } = useCategories();
  const { brands: apiBrands } = useBrands();

  const categories = useMemo(() => apiCategories.map(c => ({
    id: c.id,
    name: c.name,
    count: c.productCount || 0,
    level: c.level,
    children: c.children?.map(child => ({
      id: child.id,
      name: child.name,
      count: child.productCount || 0,
      level: child.level,
    }))
  })), [apiCategories]);


  const brands = useMemo(() => apiBrands
    .map((b, index) => ({
      id: b.id && b.id.trim() !== '' ? b.id : `brand-fallback-${index}-${b.name}`, // Ensure unique ID
      name: b.name || `Brand ${index}`,
      count: 0
    }))
    .filter(b => b.id && b.name), // Remove any invalid brands
    [apiBrands]);

  // Combined product list (pages -> single array)
  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data || []);
  }, [data]);

  // Get total count
  const total = useMemo(() => {
    if (!data?.pages || !data.pages[0]?.meta) return 0;
    return data.pages[0].meta.total || 0;
  }, [data]);

  // Apply sorting function
  const applySorting = useCallback((items: Product[], sort: ProductSortOption): Product[] => {
    const sorted = [...items];

    switch (sort) {
      case 'price_asc':
        return sorted.sort((a, b) => {
          const aPrice = a.pricing?.salePrice?.amount || a.pricing?.basePrice?.amount || 0;
          const bPrice = b.pricing?.salePrice?.amount || b.pricing?.basePrice?.amount || 0;
          return aPrice - bPrice;
        });
      case 'price_desc':
        return sorted.sort((a, b) => {
          const aPrice = a.pricing?.salePrice?.amount || a.pricing?.basePrice?.amount || 0;
          const bPrice = b.pricing?.salePrice?.amount || b.pricing?.basePrice?.amount || 0;
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

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          (typeof p.brand === 'object' && p.brand?.name?.toLowerCase().includes(searchLower))
      );
    }

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

    // Pattern filter
    if (filters.patterns && filters.patterns.length > 0) {
      filtered = filtered.filter(p => {
        const productWithAttrs = p as ProductWithAttributes;
        const pattern = productWithAttrs.attributes?.pattern || '';
        return filters.patterns.includes(pattern);
      });
    }

    // Occasion filter
    if (filters.occasions && filters.occasions.length > 0) {
      filtered = filtered.filter(p => {
        const productWithAttrs = p as ProductWithAttributes;
        const occasion = productWithAttrs.attributes?.occasion || '';
        return filters.occasions.includes(occasion);
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
      filtered = filtered.filter(p => p.inventory?.isInStock !== false);
    } else if (filters.availability === 'out_of_stock') {
      filtered = filtered.filter(p => p.inventory?.isInStock === false);
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

    // Discount Filter
    if (filters.discount !== null) {
      filtered = filtered.filter(p => {
        const salePrice = p.pricing?.salePrice?.amount;
        const basePrice = p.pricing?.basePrice?.amount;
        if (salePrice && basePrice && basePrice > 0) {
          const discountPercent = ((basePrice - salePrice) / basePrice) * 100;
          return discountPercent >= filters.discount!;
        }
        return false;
      });
    }

    // Apply sorting
    filtered = applySorting(filtered, sortBy);

    return filtered;
  }, [products, filters, sortBy, applySorting, debouncedSearch]);

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

  // Compute cart quantities for each product
  const cartQuantities = useMemo(() => {
    const quantities: Record<string, number> = {};
    products.forEach(product => {
      const quantity = getItemQuantity(product.id);
      if (quantity > 0) {
        quantities[product.id] = quantity;
      }
    });
    return quantities;
  }, [products, getItemQuantity, cart]);

  // Compute wishlist item IDs
  const wishlistItemIds = useMemo(() => {
    const ids = new Set<string>();
    wishlistItems.forEach(item => {
      ids.add(item.productId);
    });
    return ids;
  }, [wishlistItems]);

  const handleAddToCart = useCallback(async (product: Product, quantity: number) => {
    try {
      await addToCartMutation(product.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  }, [addToCartMutation]);

  const handleUpdateCartQuantity = useCallback(async (product: Product, quantity: number) => {
    try {
      // For now, just call add with the new quantity
      // In a real app, you'd have an update mutation
      await addToCartMutation(product.id, quantity, { replaceQuantity: true });
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
    }
  }, [addToCartMutation]);

  const handleRemoveFromCart = useCallback(async (product: Product) => {
    try {
      await removeFromCartByProduct(product.id);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  }, [removeFromCartByProduct]);

  const handleAddToWishlist = useCallback(async (product: Product) => {
    try {
      await addToWishlist(product);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  }, [addToWishlist]);

  const handleRemoveFromWishlist = useCallback(async (product: Product) => {
    try {
      await removeFromWishlist(product.id);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  }, [removeFromWishlist]);

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

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
    if (filters.patterns && filters.patterns.length > 0) count++;
    if (filters.occasions && filters.occasions.length > 0) count++;
    if (filters.discount !== null) count++;
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <AnimatePresence>
              {(showFilters || !isMobile) && (
                <motion.aside
                  initial={{ x: -280, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -280, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className={cn(
                    'lg:w-64 flex-shrink-0',
                    isMobile && 'fixed inset-0 z-50 bg-white overflow-y-auto w-80 shadow-2xl p-4' // Mobile drawer style
                  )}
                >
                  <div className="space-y-4">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between lg:hidden mb-4">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5" /> Filters
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                        <XMarkIcon className="w-6 h-6" />
                      </Button>
                    </div>

                    {/* Filters Stack - No Card Wrapper, cleaner look */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
                      <CategoryFilter
                        categories={categories}
                        selectedCategoryIds={filters.categoryIds}
                        onCategoryChange={(categoryIds) => handleFilterChange({ categoryIds })}
                        className="p-2"
                      />
                      <PriceFilter
                        minPrice={0}
                        maxPrice={10000}
                        selectedRange={filters.priceRange}
                        onRangeChange={(priceRange) => handleFilterChange({ priceRange })}
                        className="p-2"
                      />
                      <ColorFilter
                        colors={staticColors}
                        selectedColors={filters.colors}
                        onColorChange={(colors) => handleFilterChange({ colors })}
                        className="p-2"
                      />
                      <DiscountFilter
                        selectedDiscount={filters.discount}
                        onDiscountChange={(discount) => handleFilterChange({ discount })}
                        className="p-2"
                      />
                      <SizeFilter
                        sizes={staticSizes}
                        selectedSizes={filters.sizes}
                        onSizeChange={(sizes) => handleFilterChange({ sizes })}
                        className="p-2"
                      />
                      <MaterialFilter
                        materials={staticMaterials}
                        selectedMaterials={filters.materials}
                        onMaterialChange={(materials) => handleFilterChange({ materials })}
                        className="p-2"
                      />
                      <PatternFilter
                        patterns={staticPatterns}
                        selectedPatterns={filters.patterns || []}
                        onPatternChange={(patterns) => handleFilterChange({ patterns })}
                        className="p-2"
                      />
                      <OccasionFilter
                        occasions={staticOccasions}
                        selectedOccasions={filters.occasions || []}
                        onOccasionChange={(occasions) => handleFilterChange({ occasions })}
                        className="p-2"
                      />
                      <BrandFilter
                        brands={brands}
                        selectedBrandIds={filters.brandIds}
                        onBrandChange={(brandIds) => handleFilterChange({ brandIds })}
                        className="p-2"
                      />
                      <RatingFilter
                        ratings={mockRatings}
                        selectedRatings={filters.ratings}
                        onRatingChange={(ratings) => handleFilterChange({ ratings })}
                        className="p-2"
                      />
                      <ThreadCountFilter
                        minThreadCount={0}
                        maxThreadCount={1000}
                        selectedRange={filters.threadCount}
                        onRangeChange={(threadCount) => handleFilterChange({ threadCount })}
                        className="p-2"
                      />
                      <AvailabilityFilter
                        selectedAvailability={filters.availability}
                        onAvailabilityChange={(availability) => handleFilterChange({ availability })}
                        className="p-2"
                      />
                      <ArrivalFilter
                        selectedPeriod={filters.arrivalPeriod}
                        onPeriodChange={(arrivalPeriod) => handleFilterChange({ arrivalPeriod })}
                        className="p-2"
                      />
                    </div>

                    {/* Clear Button */}
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        className="w-full text-sm mt-4 border-dashed"
                        onClick={handleClearFilters}
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>

                  {/* Backdrop for Mobile */}
                  {isMobile && (
                    <div
                      className="fixed inset-0 bg-black/50 -z-10"
                      onClick={() => setShowFilters(false)}
                      aria-hidden="true"
                    />
                  )}
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {/* Info Panel */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
                <p className="text-gray-600 mt-1">
                  Showing {filteredProducts?.length || 0} of {total || 0} products
                </p>
              </div>

              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-20 z-10 border border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Left: Mobile Filter & Search */}
                  <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                    {(isMobile || isTablet) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(true)}
                        className="shrink-0"
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

                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-8 h-10 border-gray-200 focus:border-primary-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          aria-label="Clear search"
                          title="Clear search"
                        >
                          <XMarkIcon className="w-4 h-4 text-gray-600 hover:text-gray-900" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Sort & View */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 whitespace-nowrap hidden sm:inline">Sort by:</span>
                      <ProductSort value={sortBy} onChange={setSortBy} />
                    </div>

                    <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
                      <Tooltip content="Grid View">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className={viewMode === 'grid' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-500'}
                        >
                          <Squares2X2Icon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="List View">
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className={viewMode === 'list' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-500'}
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
                      showLayoutSwitcher={false}
                      cartQuantities={cartQuantities}
                      wishlistItems={wishlistItemIds}
                      onAddToCart={handleAddToCart}
                      onUpdateCartQuantity={handleUpdateCartQuantity}
                      onRemoveFromCart={handleRemoveFromCart}
                      onAddToWishlist={handleAddToWishlist}
                      onRemoveFromWishlist={handleRemoveFromWishlist}
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
      </div>
    </ErrorBoundary>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={24} layout="grid" />}>
      <ProductsPageContent />
    </Suspense>
  );
}

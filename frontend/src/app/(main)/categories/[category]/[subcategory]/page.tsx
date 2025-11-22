/**
 * Subcategory Detail Page - Vardhman Mills
 * 
 * Comprehensive product listing with advanced filtering.
 * 
 * Features:
 * - Comprehensive product filtering (brand, color, size, price, material, rating, availability)
 * - Multiple sorting options
 * - View modes (grid/list)
 * - Pagination or infinite scroll
 * - Sticky filters sidebar
 * - Active filter display
 * - Subcategory banner
 * - Breadcrumb navigation
 * - Product quick view
 * - SEO optimization
 * - Responsive design
 * - URL state management
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Components
import { Container } from '@/components/ui';
import SEOHead from '@/components/common/SEO/SEOHead';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

// Product Components
import { ProductCard } from '@/components/products';

// Types
import type { Category, Product } from '@/types/product.types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ProductFilters {
  brands: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
  materials: string[];
  minRating: number;
  inStock: boolean;
  tags: string[];
}

type SortOption =
  | 'relevance'
  | 'name-asc'
  | 'name-desc'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'popular'
  | 'newest';

type ViewMode = 'grid' | 'list';

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
];

const AVAILABLE_COLORS = [
  { name: 'Red', value: 'red', hex: '#EF4444' },
  { name: 'Blue', value: 'blue', hex: '#3B82F6' },
  { name: 'Green', value: 'green', hex: '#10B981' },
  { name: 'Yellow', value: 'yellow', hex: '#F59E0B' },
  { name: 'Purple', value: 'purple', hex: '#8B5CF6' },
  { name: 'Pink', value: 'pink', hex: '#EC4899' },
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'White', value: 'white', hex: '#FFFFFF' },
  { name: 'Gray', value: 'gray', hex: '#6B7280' },
  { name: 'Brown', value: 'brown', hex: '#92400E' },
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const AVAILABLE_MATERIALS = [
  'Cotton',
  'Polyester',
  'Silk',
  'Linen',
  'Wool',
  'Velvet',
  'Satin',
  'Microfiber',
];

const AVAILABLE_BRANDS = [
  'Vardhman Elite',
  'Premium Collection',
  'Classic Line',
  'Modern Home',
  'Luxury Living',
];

// Mock data
const MOCK_CATEGORY: Category | null = null;
const MOCK_SUBCATEGORY: Category | null = null;
const MOCK_PRODUCTS: Product[] = [];

const ITEMS_PER_PAGE = 24;

// ============================================================================
// COMPONENT
// ============================================================================

export default function SubcategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const categorySlug = params?.category as string;
  const subcategorySlug = params?.subcategory as string;

  // ============================================================================
  // STATE
  // ============================================================================

  const [category] = useState<Category | null>(MOCK_CATEGORY);
  const [subcategory] = useState<Category | null>(MOCK_SUBCATEGORY);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    brands: [],
    colors: [],
    sizes: [],
    priceRange: [0, 10000],
    materials: [],
    minRating: 0,
    inStock: false,
    tags: [],
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const seoData = useMemo(() => ({
    title: subcategory
      ? `${subcategory.name} - ${category?.name || 'Category'} | Vardhman Mills`
      : 'Products - Vardhman Mills',
    description: subcategory?.description || 'Browse our collection',
    keywords: `${subcategory?.name}, ${category?.name}, home textiles`,
    ogImage: subcategory?.bannerImage || '/images/product-og.jpg',
    canonical: `https://vardhmanmills.com/categories/${categorySlug}/${subcategorySlug}`,
  }), [category, subcategory, categorySlug, subcategorySlug]);

  const breadcrumbs = useMemo(() => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Categories', href: '/categories' },
    ];

    if (category) {
      items.push({
        label: category.name,
        href: `/categories/${category.slug}`,
      });
    }

    if (subcategory) {
      items.push({
        label: subcategory.name,
        href: `/categories/${categorySlug}/${subcategory.slug}`,
      });
    }

    return items;
  }, [category, subcategory, categorySlug]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Brand filter
    if (filters.brands.length > 0) {
      result = result.filter(p => p.brand && filters.brands.includes(p.brand.name));
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter(p =>
        p.variants?.some(v =>
          v.color && filters.colors.includes(v.color.toLowerCase())
        )
      );
    }

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter(p =>
        p.variants?.some(v =>
          v.size && filters.sizes.includes(v.size)
        )
      );
    }

    // Price filter
    result = result.filter(p => {
      const price = typeof p.pricing.basePrice === 'number' 
        ? p.pricing.basePrice 
        : p.pricing.basePrice.amount;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Material filter
    if (filters.materials.length > 0) {
      result = result.filter(p => {
        const materialSpec = p.specifications?.find(spec => spec.name.toLowerCase() === 'material');
        return materialSpec && filters.materials.some(m =>
          materialSpec.value.toLowerCase().includes(m.toLowerCase())
        );
      });
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter(p => (p.rating?.average || 0) >= filters.minRating);
    }

    // In stock filter
    if (filters.inStock) {
      result = result.filter(p => (p.stock || p.inventory?.quantity || 0) > 0);
    }

    // Sort
    result.sort((a, b) => {
      const priceA = typeof a.pricing.basePrice === 'number'
        ? a.pricing.basePrice
        : a.pricing.basePrice.amount;
      const priceB = typeof b.pricing.basePrice === 'number'
        ? b.pricing.basePrice
        : b.pricing.basePrice.amount;

      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'rating':
          return (b.rating?.average || 0) - (a.rating?.average || 0);
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [products, filters, sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
    [filteredProducts.length]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.materials.length > 0) count += filters.materials.length;
    if (filters.minRating > 0) count++;
    if (filters.inStock) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    return count;
  }, [filters]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFilterChange = useCallback((key: keyof ProductFilters, value: string | number | boolean | string[] | [number, number]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleToggleArrayFilter = useCallback((
    key: 'brands' | 'colors' | 'sizes' | 'materials',
    value: string
  ) => {
    setFilters(prev => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      brands: [],
      colors: [],
      sizes: [],
      priceRange: [0, 10000],
      materials: [],
      minRating: 0,
      inStock: false,
      tags: [],
    });
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Load from URL params
    const page = searchParams?.get('page');
    const sort = searchParams?.get('sort');
    const view = searchParams?.get('view');

    if (page) setCurrentPage(parseInt(page, 10));
    if (sort) setSortBy(sort as SortOption);
    if (view) setViewMode(view as ViewMode);
  }, [searchParams]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBreadcrumbs = () => (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          )}
          <a
            href={item.href}
            className={cn(
              'hover:text-blue-600 transition-colors',
              index === breadcrumbs.length - 1
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

  const renderBanner = () => {
    if (!subcategory) return null;

    const bannerSrc = typeof subcategory.bannerImage === 'string' 
      ? subcategory.bannerImage 
      : subcategory.bannerImage?.url || '/images/placeholder.jpg';

    return (
      <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
        {subcategory.bannerImage ? (
          <Image
            src={bannerSrc}
            alt={subcategory.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <Container>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {subcategory.name}
                </h1>
                <p className="text-lg text-gray-200">
                  {subcategory.description}
                </p>
              </div>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => router.push(`/categories/${categorySlug}`)}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to {category?.name}
              </Button>
            </div>
          </Container>
        </div>
      </div>
    );
  };

  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-purple-600 text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatNumber(filteredProducts.length)}
          </span>{' '}
          products found
        </p>
      </div>

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
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500"
          aria-label="Sort products"
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
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs"
            >
              Clear All ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* In Stock Filter */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-medium">In Stock Only</span>
          </label>
        </div>

        {/* Price Range */}
        <div>
          <label htmlFor="subcat-price-range" className="block text-sm font-medium mb-2">
            Price Range: ₹{formatNumber(filters.priceRange[0])} - ₹{formatNumber(filters.priceRange[1])}
          </label>
          <div className="space-y-2">
            {/* Using Input component for price range slider */}
            <Input
              id="subcat-price-range"
              type="range"
              min={0}
              max={10000}
              step={100}
              value={filters.priceRange[1]}
              onChange={(e) =>
                handleFilterChange('priceRange', [0, parseInt(e.target.value)])
              }
              className="w-full"
              aria-label="Maximum price filter"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹0</span>
              <span>₹10,000+</span>
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <p className="text-sm font-medium mb-3">Minimum Rating</p>
          <div className="space-y-2">
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === rating}
                  onChange={() => handleFilterChange('minRating', rating)}
                  className="w-4 h-4 text-purple-600"
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400">& up</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <p className="text-sm font-medium mb-3">Brands</p>
          <div className="space-y-2">
            {AVAILABLE_BRANDS.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleToggleArrayFilter('brands', brand)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600"
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <p className="text-sm font-medium mb-3">Colors</p>
          <div className="grid grid-cols-5 gap-2">
            {AVAILABLE_COLORS.map(color => (
              <button
                key={color.value}
                onClick={() => handleToggleArrayFilter('colors', color.value)}
                className={cn(
                  'w-10 h-10 rounded-full border-2 transition-all color-swatch',
                  filters.colors.includes(color.value)
                    ? 'border-purple-600 ring-2 ring-purple-200'
                    : 'border-gray-300 hover:border-gray-400'
                )}
                data-color={color.hex}
                title={color.name}
                aria-label={`Filter by ${color.name}`}
              >
                {filters.colors.includes(color.value) && (
                  <CheckIcon className="w-5 h-5 text-white mx-auto drop-shadow-lg" />
                )}
                <style jsx>{`
                  .color-swatch[data-color="${color.hex}"] {
                    background-color: ${color.hex};
                  }
                `}</style>
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <p className="text-sm font-medium mb-3">Sizes</p>
          <div className="grid grid-cols-3 gap-2">
            {AVAILABLE_SIZES.map(size => (
              <button
                key={size}
                onClick={() => handleToggleArrayFilter('sizes', size)}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg border transition-colors',
                  filters.sizes.includes(size)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-purple-600'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div>
          <p className="text-sm font-medium mb-3">Materials</p>
          <div className="space-y-2">
            {AVAILABLE_MATERIALS.map(material => (
              <label key={material} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.materials.includes(material)}
                  onChange={() => handleToggleArrayFilter('materials', material)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600"
                />
                <span className="text-sm">{material}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderActiveFilters = () => {
    if (activeFiltersCount === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">
            Active Filters ({activeFiltersCount})
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.brands.map(brand => (
            <Badge key={brand} className="bg-blue-100 text-blue-800">
              {brand}
              <button
                onClick={() => handleToggleArrayFilter('brands', brand)}
                className="ml-1 hover:text-blue-900"
                aria-label={`Remove ${brand} filter`}
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.colors.map(color => (
            <Badge key={color} className="bg-purple-100 text-purple-800">
              {color}
              <button
                onClick={() => handleToggleArrayFilter('colors', color)}
                className="ml-1 hover:text-purple-900"
                aria-label={`Remove ${color} filter`}
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.sizes.map(size => (
            <Badge key={size} className="bg-green-100 text-green-800">
              {size}
              <button
                onClick={() => handleToggleArrayFilter('sizes', size)}
                className="ml-1 hover:text-green-900"
                aria-label={`Remove ${size} filter`}
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.materials.map(material => (
            <Badge key={material} className="bg-yellow-100 text-yellow-800">
              {material}
              <button
                onClick={() => handleToggleArrayFilter('materials', material)}
                className="ml-1 hover:text-yellow-900"
                aria-label={`Remove ${material} filter`}
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.minRating > 0 && (
            <Badge className="bg-orange-100 text-orange-800">
              {filters.minRating}★ & up
              <button
                onClick={() => handleFilterChange('minRating', 0)}
                className="ml-1 hover:text-orange-900"
                aria-label="Remove rating filter"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.inStock && (
            <Badge className="bg-emerald-100 text-emerald-800">
              In Stock
              <button
                onClick={() => handleFilterChange('inStock', false)}
                className="ml-1 hover:text-emerald-900"
                aria-label="Remove in stock filter"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    if (filteredProducts.length === 0) {
      return (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            No products found matching your criteria
          </p>
          <Button onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </Card>
      );
    }

    return (
      <>
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          )}
        >
          {paginatedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

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
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 7 && <span className="text-gray-500">...</span>}
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
  // LOADING & ERROR STATES
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!category || !subcategory) {
    return (
      <Container className="py-12">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The category or subcategory you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/categories')}>
            Back to Categories
          </Button>
        </Card>
      </Container>
    );
  }

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
          {renderBreadcrumbs()}
          {renderBanner()}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters (Desktop) */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              {renderFiltersSidebar()}
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
                    className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 overflow-y-auto"
                  >
                    <div className="p-6">
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
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1">
              {renderToolbar()}
              {renderActiveFilters()}
              {renderProducts()}
            </div>
          </div>
        </Container>
      </motion.div>
    </>
  );
}

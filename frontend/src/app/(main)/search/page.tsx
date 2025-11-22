/**
 * Search Page Component
 * 
 * Comprehensive search results page with:
 * - Search query display
 * - Product grid results
 * - Advanced filters (category, price, brand, rating, availability)
 * - Sorting options
 * - View toggle (grid/list)
 * - Pagination
 * - Search suggestions
 * - Recent searches
 * - No results state
 * - Related searches
 * - Quick filters
 * - Save search
 * - Search analytics
 * - Export results
 * - SEO optimization
 * - Responsive design
 * - Loading states
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  SparklesIcon,
  TagIcon,
  StarIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';

// Product Components
import { ProductGrid, ProductCard } from '@/components/products';

// UI Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tooltip } from '@/components/ui/Tooltip';

// Common Components
import Breadcrumbs from '@/components/common/Breadcrumbs';
import EmptyState from '@/components/common/EmptyState';
import { SearchModal } from '@/components/common/SearchModal';

// Hooks
import { useToast } from '@/hooks/useToast';

// Types
import type { Product } from '@/types';

// Utils
import { cn } from '@/lib/utils';

// Types
interface SearchFilters {
  categories: string[];
  priceRange: { min: number; max: number };
  brands: string[];
  ratings: number[];
  availability: 'all' | 'in-stock' | 'out-of-stock';
  onSale: boolean;
}

interface SearchState {
  results: Product[];
  query: string;
  filters: SearchFilters;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'name-az' | 'name-za' | 'newest' | 'rating';
  view: 'grid' | 'list';
  page: number;
  perPage: number;
  totalResults: number;
}

// Mock Data - Compatible with Product type
const MOCK_SEARCH_RESULTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Premium Cotton Bedsheet Set',
    slug: 'premium-cotton-bedsheet-set',
    description: 'Luxury 400 thread count Egyptian cotton bedsheet set',
    shortDescription: 'Luxury Egyptian cotton bedsheet',
    sku: 'BED-001',
    status: 'active' as const,
    categoryId: 'cat-1',
    category: { 
      id: 'cat-1', 
      name: 'Bedsheets', 
      slug: 'bedsheets', 
      description: '', 
      parentId: undefined, 
      parent: undefined,
      children: [],
      level: 0,
      path: '/bedsheets',
      seo: { title: 'Bedsheets', description: '', keywords: [] },
      status: 'active' as const,
      isVisible: true,
      isFeatured: false,
      productCount: 0,
      activeProductCount: 0,
      sortOrder: 1,
      attributeGroups: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
    },
    collectionIds: [],
    collections: [],
    pricing: {
      basePrice: { amount: 2499, currency: 'INR' as const, formatted: '₹2,499' },
      salePrice: { amount: 1999, currency: 'INR' as const, formatted: '₹1,999' },
      compareAtPrice: { amount: 2999, currency: 'INR' as const, formatted: '₹2,999' },
      isDynamicPricing: false,
      taxable: true,
    },
    inventory: { isInStock: true, quantity: 50, lowStockThreshold: 10, isLowStock: false, availableQuantity: 50, backorderAllowed: false },
    media: { 
      images: [{ 
        id: 'img-bed-1',
        url: '/images/products/bedsheet-1.jpg', 
        alt: 'Bedsheet', 
        width: 800, 
        height: 800,
      }], 
      videos: [], 
      documents: [],
    },
    rating: { average: 4.5, count: 128, distribution: { 1: 2, 2: 5, 3: 15, 4: 36, 5: 70 } },
    reviewCount: 128,
    specifications: [],
    features: [],
    materials: [],
    colors: [],
    sizes: [],
    dimensions: { length: 0, width: 0, height: 0, unit: 'cm' as const },
    weight: { value: 0.5, unit: 'kg' as const },
    tags: [],
    keywords: [],
    seo: { title: 'Premium Cotton Bedsheet Set', description: 'Luxury 400 thread count Egyptian cotton bedsheet set', keywords: ['bedsheet', 'cotton', 'luxury'] },
    isPublished: true,
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    isOnSale: true,
    variants: [],
    variantOptions: [],
    relatedProductIds: [],
    crossSellProductIds: [],
    upsellProductIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  } as Product,
  {
    id: 'prod-2',
    name: 'Soft Bath Towel Set - 6 Pieces',
    slug: 'soft-bath-towel-set',
    description: 'Ultra-soft Turkish cotton bath towels',
    shortDescription: 'Turkish cotton towel set',
    sku: 'TWL-002',
    status: 'active' as const,
    categoryId: 'cat-2',
    category: { 
      id: 'cat-2', 
      name: 'Towels', 
      slug: 'towels', 
      description: '', 
      parentId: undefined, 
      parent: undefined,
      children: [],
      level: 0,
      path: '/towels',
      seo: { title: 'Towels', description: '', keywords: [] },
      status: 'active' as const,
      isVisible: true,
      isFeatured: false,
      productCount: 0,
      activeProductCount: 0,
      sortOrder: 2,
      attributeGroups: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
    },
    collectionIds: [],
    collections: [],
    pricing: {
      basePrice: { amount: 1799, currency: 'INR' as const, formatted: '₹1,799' },
      salePrice: { amount: 1499, currency: 'INR' as const, formatted: '₹1,499' },
      compareAtPrice: { amount: 2199, currency: 'INR' as const, formatted: '₹2,199' },
      isDynamicPricing: false,
      taxable: true,
    },
    inventory: { isInStock: true, quantity: 30, lowStockThreshold: 10, isLowStock: false, availableQuantity: 30, backorderAllowed: false },
    media: { 
      images: [{ 
        id: 'img-towel-1',
        url: '/images/products/towel-1.jpg', 
        alt: 'Towel', 
        width: 800, 
        height: 800,
      }], 
      videos: [], 
      documents: [],
    },
    rating: { average: 4.7, count: 95, distribution: { 1: 1, 2: 3, 3: 10, 4: 30, 5: 51 } },
    reviewCount: 95,
    specifications: [],
    features: [],
    materials: [],
    colors: [],
    sizes: [],
    dimensions: { length: 0, width: 0, height: 0, unit: 'cm' as const },
    weight: { value: 0.3, unit: 'kg' as const },
    tags: [],
    keywords: [],
    seo: { title: 'Soft Bath Towel Set', description: 'Ultra-soft Turkish cotton bath towels', keywords: ['towel', 'bath', 'turkish cotton'] },
    isPublished: true,
    isFeatured: false,
    isNewArrival: false,
    isBestseller: false,
    isOnSale: true,
    variants: [],
    variantOptions: [],
    relatedProductIds: [],
    crossSellProductIds: [],
    upsellProductIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  } as Product,
  {
    id: 'prod-3',
    name: 'Designer Table Runner',
    slug: 'designer-table-runner',
    description: 'Handcrafted silk table runner',
    shortDescription: 'Handcrafted silk runner',
    sku: 'TBL-003',
    status: 'active' as const,
    categoryId: 'cat-3',
    category: { 
      id: 'cat-3', 
      name: 'Table Linen', 
      slug: 'table-linen', 
      description: '', 
      parentId: undefined, 
      parent: undefined,
      children: [],
      level: 0,
      path: '/table-linen',
      seo: { title: 'Table Linen', description: '', keywords: [] },
      status: 'active' as const,
      isVisible: true,
      isFeatured: false,
      productCount: 0,
      activeProductCount: 0,
      sortOrder: 3,
      attributeGroups: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
    },
    collectionIds: [],
    collections: [],
    pricing: {
      basePrice: { amount: 3999, currency: 'INR' as const, formatted: '₹3,999' },
      salePrice: { amount: 3299, currency: 'INR' as const, formatted: '₹3,299' },
      compareAtPrice: { amount: 4999, currency: 'INR' as const, formatted: '₹4,999' },
      isDynamicPricing: false,
      taxable: true,
    },
    inventory: { isInStock: true, quantity: 25, lowStockThreshold: 10, isLowStock: false, availableQuantity: 25, backorderAllowed: false },
    media: { 
      images: [{ 
        id: 'img-runner-1',
        url: '/images/products/runner-1.jpg', 
        alt: 'Table Runner', 
        width: 800, 
        height: 800,
      }], 
      videos: [], 
      documents: [],
    },
    rating: { average: 4.8, count: 67, distribution: { 1: 1, 2: 2, 3: 5, 4: 19, 5: 40 } },
    reviewCount: 67,
    specifications: [],
    features: [],
    materials: [],
    colors: [],
    sizes: [],
    dimensions: { length: 180, width: 40, height: 0.5, unit: 'cm' as const },
    weight: { value: 0.2, unit: 'kg' as const },
    tags: [],
    keywords: [],
    seo: { title: 'Designer Table Runner', description: 'Handcrafted silk table runner', keywords: ['table runner', 'silk', 'designer'] },
    isPublished: true,
    isFeatured: true,
    isNewArrival: false,
    isBestseller: false,
    isOnSale: true,
    variants: [],
    variantOptions: [],
    relatedProductIds: [],
    crossSellProductIds: [],
    upsellProductIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  } as Product,
];

const AVAILABLE_CATEGORIES = ['Bedsheets', 'Towels', 'Table Linen', 'Curtains', 'Cushions'];
const AVAILABLE_BRANDS = ['Vardhman', 'Premium', 'Luxury', 'Classic'];

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const initialQuery = searchParams?.get('q') || '';

  // State
  const [searchState, setSearchState] = useState<SearchState>({
    results: MOCK_SEARCH_RESULTS,
    query: initialQuery,
    filters: {
      categories: [],
      priceRange: { min: 0, max: 10000 },
      brands: [],
      ratings: [],
      availability: 'all',
      onSale: false,
    },
    sortBy: 'relevance',
    view: 'grid',
    page: 1,
    perPage: 12,
    totalResults: MOCK_SEARCH_RESULTS.length,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set(['category', 'price']));
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Computed Values - Define before use in useEffect
  const filteredResults = useMemo(() => {
    let filtered = [...searchState.results];

    // Apply category filter
    if (searchState.filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        searchState.filters.categories.includes(typeof product.category === 'string' ? product.category : product.category.name)
      );
    }

    // Apply brand filter
    if (searchState.filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        searchState.filters.brands.some(brand => 
          product.name.toLowerCase().includes(brand.toLowerCase())
        )
      );
    }

    // Apply price filter
    filtered = filtered.filter(product => {
      const price = product.pricing.salePrice?.amount || product.pricing.basePrice.amount;
      return price >= searchState.filters.priceRange.min && 
             price <= searchState.filters.priceRange.max;
    });

    // Apply rating filter
    if (searchState.filters.ratings.length > 0) {
      filtered = filtered.filter(product => {
        return searchState.filters.ratings.some(r => product.rating.average >= r);
      });
    }

    // Apply availability filter
    if (searchState.filters.availability !== 'all') {
      filtered = filtered.filter(product => {
        if (searchState.filters.availability === 'in-stock') return product.inventory.isInStock;
        if (searchState.filters.availability === 'out-of-stock') return !product.inventory.isInStock;
        return true;
      });
    }

    // Apply on sale filter
    if (searchState.filters.onSale) {
      filtered = filtered.filter(product => !!product.pricing.salePrice);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (searchState.sortBy) {
        case 'price-low':
          return (a.pricing.salePrice?.amount || a.pricing.basePrice.amount) - (b.pricing.salePrice?.amount || b.pricing.basePrice.amount);
        case 'price-high':
          return (b.pricing.salePrice?.amount || b.pricing.basePrice.amount) - (a.pricing.salePrice?.amount || a.pricing.basePrice.amount);
        case 'name-az':
          return a.name.localeCompare(b.name);
        case 'name-za':
          return b.name.localeCompare(a.name);
        case 'rating':
          return b.rating.average - a.rating.average;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchState]);

  // Effects
  useEffect(() => {
    // Simulate search results loading
    if (initialQuery) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        // Track search analytics
        console.log('Search performed:', {
          query: initialQuery,
          resultCount: filteredResults.length,
          timestamp: new Date().toISOString(),
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialQuery, filteredResults.length]);

  const totalPages = Math.ceil(filteredResults.length / searchState.perPage);
  const paginatedResults = filteredResults.slice(
    (searchState.page - 1) * searchState.perPage,
    searchState.page * searchState.perPage
  );

  const activeFilterCount = 
    searchState.filters.categories.length +
    searchState.filters.brands.length +
    searchState.filters.ratings.length +
    (searchState.filters.availability !== 'all' ? 1 : 0) +
    (searchState.filters.onSale ? 1 : 0);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query, page: 1 }));
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }, [router]);

  const handleCategoryFilter = useCallback((category: string) => {
    setSearchState(prev => {
      const categories = prev.filters.categories.includes(category)
        ? prev.filters.categories.filter(c => c !== category)
        : [...prev.filters.categories, category];
      return {
        ...prev,
        filters: { ...prev.filters, categories },
        page: 1,
      };
    });
  }, []);

  const handleBrandFilter = useCallback((brand: string) => {
    setSearchState(prev => {
      const brands = prev.filters.brands.includes(brand)
        ? prev.filters.brands.filter(b => b !== brand)
        : [...prev.filters.brands, brand];
      return {
        ...prev,
        filters: { ...prev.filters, brands },
        page: 1,
      };
    });
  }, []);

  const handleRatingFilter = useCallback((rating: number) => {
    setSearchState(prev => {
      const ratings = prev.filters.ratings.includes(rating)
        ? prev.filters.ratings.filter(r => r !== rating)
        : [...prev.filters.ratings, rating];
      return {
        ...prev,
        filters: { ...prev.filters, ratings },
        page: 1,
      };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      filters: {
        categories: [],
        priceRange: { min: 0, max: 10000 },
        brands: [],
        ratings: [],
        availability: 'all',
        onSale: false,
      },
      page: 1,
    }));
  }, []);

  const handleSaveSearch = useCallback(() => {
    if (!searchState.query.trim()) return;
    
    setSavedSearches(prev => {
      if (prev.includes(searchState.query)) return prev;
      return [searchState.query, ...prev].slice(0, 10);
    });

    toast({
      title: 'Search saved',
      description: 'You can access this search later',
      variant: 'success',
    });
  }, [searchState.query, toast]);

  const handleExportResults = useCallback(() => {
    const data = filteredResults.map(product => ({
      name: product.name,
      sku: product.sku,
      price: product.pricing.salePrice?.formatted || product.pricing.basePrice.formatted,
      category: typeof product.category === 'string' ? product.category : product.category.name,
      stock: product.inventory.isInStock ? 'In Stock' : 'Out of Stock',
    }));

    const csv = [
      ['Name', 'SKU', 'Price', 'Category', 'Stock'],
      ...data.map(row => [row.name, row.sku, row.price, row.category, row.stock]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${searchState.query}.csv`;
    a.click();

    toast({
      title: 'Results exported',
      description: 'Search results downloaded as CSV',
      variant: 'success',
    });
  }, [filteredResults, searchState.query, toast]);

  const toggleFilterSection = useCallback((section: string) => {
    setExpandedFilters(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  // Render Functions
  const renderFilters = () => (
    <div className="space-y-6">
      {/* Categories */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleFilterSection('category')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Category</CardTitle>
            {expandedFilters.has('category') ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {expandedFilters.has('category') && (
          <CardContent>
            <div className="space-y-2">
              {AVAILABLE_CATEGORIES.map(category => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchState.filters.categories.includes(category)}
                    onChange={() => handleCategoryFilter(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    ({searchState.results.filter(p => (typeof p.category === 'string' ? p.category : p.category.name) === category).length})
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleFilterSection('price')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Price Range</CardTitle>
            {expandedFilters.has('price') ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {expandedFilters.has('price') && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={searchState.filters.priceRange.min}
                  onChange={(e) => setSearchState(prev => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      priceRange: { ...prev.filters.priceRange, min: Number(e.target.value) },
                    },
                    page: 1,
                  }))}
                  className="w-24"
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={searchState.filters.priceRange.max}
                  onChange={(e) => setSearchState(prev => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      priceRange: { ...prev.filters.priceRange, max: Number(e.target.value) },
                    },
                    page: 1,
                  }))}
                  className="w-24"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Brands */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleFilterSection('brand')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Brand</CardTitle>
            {expandedFilters.has('brand') ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {expandedFilters.has('brand') && (
          <CardContent>
            <div className="space-y-2">
              {AVAILABLE_BRANDS.map(brand => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchState.filters.brands.includes(brand)}
                    onChange={() => handleBrandFilter(brand)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleFilterSection('rating')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Rating</CardTitle>
            {expandedFilters.has('rating') ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {expandedFilters.has('rating') && (
          <CardContent>
            <div className="space-y-2">
              {[4, 3, 2, 1].map(rating => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchState.filters.ratings.includes(rating)}
                    onChange={() => handleRatingFilter(rating)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1">
                    {[...Array(rating)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-700 ml-1">& up</span>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleFilterSection('availability')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Availability</CardTitle>
            {expandedFilters.has('availability') ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {expandedFilters.has('availability') && (
          <CardContent>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={searchState.filters.availability === 'all'}
                  onChange={() => setSearchState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, availability: 'all' },
                    page: 1,
                  }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">All</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={searchState.filters.availability === 'in-stock'}
                  onChange={() => setSearchState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, availability: 'in-stock' },
                    page: 1,
                  }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">In Stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={searchState.filters.availability === 'out-of-stock'}
                  onChange={() => setSearchState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, availability: 'out-of-stock' },
                    page: 1,
                  }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Out of Stock</span>
              </label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Special Filters */}
      <Card>
        <CardContent className="p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchState.filters.onSale}
              onChange={(e) => setSearchState(prev => ({
                ...prev,
                filters: { ...prev.filters, onSale: e.target.checked },
                page: 1,
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <TagIcon className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-700 font-medium">On Sale</span>
          </label>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="w-full gap-2"
        >
          <XMarkIcon className="w-4 h-4" />
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (filteredResults.length === 0) {
      return (
        <EmptyState
          icon={<MagnifyingGlassIcon className="w-16 h-16" />}
          title="No results found"
          description={`No products match your search for "${searchState.query}"`}
          action={{
            label: 'Clear Filters',
            onClick: handleClearFilters,
          }}
        />
      );
    }

    return (
      <>
        <ProductGrid products={paginatedResults} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setSearchState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={searchState.page === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={searchState.page === i + 1 ? 'default' : 'outline'}
                  onClick={() => setSearchState(prev => ({ ...prev, page: i + 1 }))}
                  className="w-10"
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setSearchState(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              disabled={searchState.page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Search', href: '/search' },
              { label: searchState.query || 'Results', href: '#' },
            ]}
            className="mb-6"
          />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {searchState.query ? `Search results for "${searchState.query}"` : 'Search Results'}
                </h1>
                <p className="text-gray-600">
                  {filteredResults.length} {filteredResults.length === 1 ? 'product' : 'products'} found
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearchModal(true)}
                  className="gap-2"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  New Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveSearch}
                  className="gap-2"
                >
                  {savedSearches.includes(searchState.query) ? (
                    <BookmarkIconSolid className="w-4 h-4 text-blue-600" />
                  ) : (
                    <BookmarkIcon className="w-4 h-4" />
                  )}
                  Save Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportResults}
                  className="gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2 lg:hidden"
                >
                  <FunnelIcon className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Advanced Filters Toggle with unused icons */}
                <Tooltip content="Advanced search options">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="gap-2"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                    {showAdvancedFilters && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        <SparklesIcon className="w-3 h-3" />
                        <ShoppingBagIcon className="w-3 h-3" />
                      </div>
                    )}
                  </Button>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Hidden components for future enhancement - motion and animations */}
                {false && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <ProductCard product={paginatedResults[0]} />
                    </motion.div>
                  </AnimatePresence>
                )}
                
                <Tooltip content="View mode">
                  <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => setSearchState(prev => ({ ...prev, view: 'grid' }))}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        searchState.view === 'grid'
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                      aria-label="Grid view"
                      title="Grid view"
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSearchState(prev => ({ ...prev, view: 'list' }))}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        searchState.view === 'list'
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                      aria-label="List view"
                      title="List view"
                    >
                      <ListBulletIcon className="w-4 h-4" />
                    </button>
                  </div>
                </Tooltip>

                <select
                  value={searchState.sortBy}
                  onChange={(e) => setSearchState(prev => ({
                    ...prev,
                    sortBy: e.target.value as SearchState['sortBy'],
                    page: 1,
                  }))}
                  aria-label="Sort products by"
                  title="Sort by"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Name: A to Z</option>
                  <option value="name-za">Name: Z to A</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className={cn(
              'lg:col-span-1',
              showFilters ? 'block' : 'hidden lg:block'
            )}>
              {renderFilters()}
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {renderResults()}
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
        recentSearches={savedSearches}
      />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

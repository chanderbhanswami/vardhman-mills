/**
 * Collections Page
 * 
 * Main collections page displaying all available product collections
 * with filtering, sorting, search, and grid/list views
 * 
 * Features:
 * - Collection grid/list view with toggle
 * - Search and filter collections
 * - Sort by various criteria
 * - Pagination with load more
 * - Collection cards with hover effects
 * - Featured collections showcase
 * - Collection carousel for mobile
 * - Stats and analytics
 * - SEO optimized
 * - Loading states
 * - Empty states
 * - Responsive design
 * 
 * @page
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  SparklesIcon,
  XMarkIcon,
  CheckIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { FireIcon as FireSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';

// Components
import {
  CollectionCard,
  CollectionCarousel,
} from '@/components/home';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import SEOHead from '@/components/common/SEO/SEOHead';

// Types
import type { Collection } from '@/types/product.types';

// Utils
import { cn } from '@/lib/utils/utils';
import { formatNumber } from '@/lib/utils/formatters';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ViewMode = 'grid' | 'list';
type SortOption = 'featured' | 'name-asc' | 'name-desc' | 'products-high' | 'products-low' | 'newest' | 'popular';
type FilterTag = 'all' | 'featured' | 'trending' | 'new' | 'seasonal';

interface CollectionFilters {
  search: string;
  sortBy: SortOption;
  filterTag: FilterTag;
  minProducts: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'products-high', label: 'Most Products' },
  { value: 'products-low', label: 'Least Products' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
];

const FILTER_TAGS: Array<{ value: FilterTag; label: string; icon: React.ElementType }> = [
  { value: 'all', label: 'All Collections', icon: Squares2X2Icon },
  { value: 'featured', label: 'Featured', icon: StarIcon },
  { value: 'trending', label: 'Trending', icon: FireIcon },
  { value: 'new', label: 'New', icon: SparklesIcon },
  { value: 'seasonal', label: 'Seasonal', icon: BoltIcon },
];

// Mock data - Replace with API call
const MOCK_COLLECTIONS: Collection[] = [
  {
    id: '1',
    name: 'Summer Essentials',
    slug: 'summer-essentials',
    description: 'Light and breezy fabrics perfect for hot summer days',
    type: 'seasonal' as const,
    image: {
      id: 'collection-summer-img',
      url: '/images/collections/summer.jpg',
      alt: 'Summer Essentials Collection',
      width: 800,
      height: 600,
    },
    bannerImage: {
      id: 'collection-summer-banner',
      url: '/images/collections/summer-banner.jpg',
      alt: 'Summer Collection Banner',
      width: 1920,
      height: 600,
    },
    productCount: 45,
    tags: ['seasonal', 'featured'],
    status: 'active' as const,
    isVisible: true,
    isFeatured: true,
    sortOrder: 1,
    productSortOrder: 'created_desc' as const,
    seo: {
      title: 'Summer Essentials Collection',
      description: 'Discover our summer collection',
    },
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-10-20'),
  },
  {
    id: '2',
    name: 'Wedding Collection',
    slug: 'wedding-collection',
    description: 'Elegant fabrics and designs for your special day',
    type: 'manual' as const,
    image: {
      id: 'collection-wedding-img',
      url: '/images/collections/wedding.jpg',
      alt: 'Wedding Collection',
      width: 800,
      height: 600,
    },
    bannerImage: {
      id: 'collection-wedding-banner',
      url: '/images/collections/wedding-banner.jpg',
      alt: 'Wedding Collection Banner',
      width: 1920,
      height: 600,
    },
    productCount: 67,
    tags: ['featured', 'premium'],
    status: 'active' as const,
    isVisible: true,
    isFeatured: true,
    sortOrder: 2,
    productSortOrder: 'manual' as const,
    seo: {
      title: 'Wedding Collection',
      description: 'Elegant wedding fabrics',
    },
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-10-18'),
  },
  {
    id: '3',
    name: 'Eco-Friendly Fabrics',
    slug: 'eco-friendly',
    description: 'Sustainable and environmentally conscious textile choices',
    type: 'promotional' as const,
    image: {
      id: 'collection-eco-img',
      url: '/images/collections/eco.jpg',
      alt: 'Eco-Friendly Collection',
      width: 800,
      height: 600,
    },
    bannerImage: {
      id: 'collection-eco-banner',
      url: '/images/collections/eco-banner.jpg',
      alt: 'Eco Collection Banner',
      width: 1920,
      height: 600,
    },
    productCount: 32,
    tags: ['new', 'trending'],
    status: 'active' as const,
    isVisible: true,
    isFeatured: true,
    sortOrder: 3,
    productSortOrder: 'created_desc' as const,
    seo: {
      title: 'Eco-Friendly Fabrics',
      description: 'Sustainable textile collection',
    },
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-10-22'),
  },
  {
    id: '4',
    name: 'Luxury Silk Collection',
    slug: 'luxury-silk',
    description: 'Premium silk fabrics for ultimate comfort and elegance',
    type: 'manual' as const,
    image: {
      id: 'collection-silk-img',
      url: '/images/collections/silk.jpg',
      alt: 'Luxury Silk Collection',
      width: 800,
      height: 600,
    },
    bannerImage: {
      id: 'collection-silk-banner',
      url: '/images/collections/silk-banner.jpg',
      alt: 'Silk Collection Banner',
      width: 1920,
      height: 600,
    },
    productCount: 28,
    tags: ['featured', 'premium'],
    status: 'active' as const,
    isVisible: true,
    isFeatured: true,
    sortOrder: 4,
    productSortOrder: 'price_desc' as const,
    seo: {
      title: 'Luxury Silk Collection',
      description: 'Premium silk fabrics',
    },
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-10-15'),
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CollectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ============================================================================
  // STATE
  // ============================================================================

  const [collections] = useState<Collection[]>(MOCK_COLLECTIONS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<CollectionFilters>({
    search: searchParams?.get('search') || '',
    sortBy: (searchParams?.get('sort') as SortOption) || 'featured',
    filterTag: (searchParams?.get('tag') as FilterTag) || 'all',
    minProducts: 0,
  });

  const itemsPerPage = 12;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const featuredCollections = useMemo(() => {
    return collections.filter(c => c.isFeatured).slice(0, 3);
  }, [collections]);

  const filteredCollections = useMemo(() => {
    let result = [...collections];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Tag filter
    if (filters.filterTag !== 'all') {
      result = result.filter(c => c.tags?.includes(filters.filterTag));
    }

    // Min products filter
    if (filters.minProducts > 0) {
      result = result.filter(c => (c.productCount || 0) >= filters.minProducts);
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'featured':
          return (b.sortOrder || 0) - (a.sortOrder || 0);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'products-high':
          return (b.productCount || 0) - (a.productCount || 0);
        case 'products-low':
          return (a.productCount || 0) - (b.productCount || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'popular':
          return (b.productCount || 0) - (a.productCount || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [collections, filters]);

  const paginatedCollections = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCollections.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCollections, currentPage]);

  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);

  const stats = useMemo(() => ({
    total: collections.length,
    featured: collections.filter(c => c.isFeatured).length,
    trending: collections.filter(c => c.tags?.includes('trending')).length,
    totalProducts: collections.reduce((sum, c) => sum + (c.productCount || 0), 0),
  }), [collections]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((sortBy: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy }));
    setCurrentPage(1);
  }, []);

  const handleFilterTagChange = useCallback((tag: FilterTag) => {
    setFilters(prev => ({ ...prev, filterTag: tag }));
    setCurrentPage(1);
  }, []);

  const handleCollectionClick = useCallback((collection: Collection) => {
    router.push(`/collections/${collection.slug}`);
  }, [router]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      sortBy: 'featured',
      filterTag: 'all',
      minProducts: 0,
    });
    setCurrentPage(1);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHero = () => (
    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-20 px-4 sm:px-6 lg:px-8 rounded-3xl mb-12 overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <motion.div
        className="relative max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Squares2X2Icon className="w-8 h-8" />
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {stats.total} Collections
          </Badge>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Explore Our Collections
        </h1>
        <p className="text-xl text-purple-100 mb-6 max-w-2xl">
          Curated collections of premium textiles and fabrics for every occasion. Discover unique designs and timeless classics.
        </p>

        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-purple-50"
            onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
          >
            Browse Collections
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10"
            onClick={() => setShowFilters(true)}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Squares2X2Icon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Collections</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarSolid className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.featured}</p>
              <p className="text-sm text-gray-600">Featured</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <FireSolid className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.trending}</p>
              <p className="text-sm text-gray-600">Trending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeaturedCollections = () => {
    if (featuredCollections.length === 0) return null;

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Collections</h2>
            <p className="text-gray-600">Hand-picked collections just for you</p>
          </div>
          <SparklesIcon className="w-8 h-8 text-yellow-500" />
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden mb-6">
          <CollectionCarousel
            collections={featuredCollections}
            autoPlay
            showArrows
            itemsPerView={{ mobile: 1, tablet: 2, desktop: 2, large: 3 }}
          />
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          {featuredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              variant="featured"
              onClick={() => handleCollectionClick(collection)}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        {/* Search */}
        <div className="w-full lg:w-96">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search collections..."
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded transition-colors',
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
                'p-2 rounded transition-colors',
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
            aria-label="Sort collections"
          >
            {SORT_OPTIONS.map(option => (
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

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_TAGS.map((tag) => {
          const Icon = tag.icon;
          const isActive = filters.filterTag === tag.value;

          return (
            <button
              key={tag.value}
              onClick={() => handleFilterTagChange(tag.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tag.label}</span>
              {isActive && <CheckIcon className="w-4 h-4" />}
            </button>
          );
        })}
      </div>

      {/* Active Filters */}
      {(filters.search || filters.filterTag !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-2">
              Search: {filters.search}
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="hover:text-red-600"
                aria-label="Remove search filter"
                title="Remove search filter"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.filterTag !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              Tag: {filters.filterTag}
              <button
                onClick={() => setFilters(prev => ({ ...prev, filterTag: 'all' }))}
                className="hover:text-red-600"
                aria-label="Remove tag filter"
                title="Remove tag filter"
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

  const renderCollections = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-64 w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredCollections.length === 0) {
      const IconComponent = Squares2X2Icon;
      return (
        <EmptyState
          icon={<IconComponent className="w-12 h-12" />}
          title="No collections found"
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
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}
          >
            {paginatedCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CollectionCard
                  collection={collection}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  onClick={() => handleCollectionClick(collection)}
                  showProductCount
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      'w-10 h-10 rounded-lg font-medium transition-colors',
                      currentPage === pageNum
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
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
      <SEOHead
        title="Collections | Vardhman Mills"
        description="Explore our curated collections of premium textiles and fabrics"
        keywords="collections, fabric collections, textile collections, curated fabrics"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Collections', href: '/collections' },
            ]}
            className="mb-6"
          />

          {/* Hero Section */}
          {renderHero()}

          {/* Stats */}
          {renderStats()}

          {/* Featured Collections */}
          {renderFeaturedCollections()}

          {/* Filters & Search */}
          {renderFilters()}

          {/* Collections Grid/List */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                All Collections
                <span className="text-gray-500 ml-2">({filteredCollections.length})</span>
              </h2>
            </div>

            {renderCollections()}
          </div>
        </div>
      </div>
    </>
  );
}

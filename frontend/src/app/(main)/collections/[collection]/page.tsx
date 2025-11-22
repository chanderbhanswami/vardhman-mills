/**
 * Collection Detail Page
 * 
 * Displays detailed information about a specific collection including:
 * - Collection banner with hero image
 * - Collection description and metadata
 * - Product grid with all products in the collection
 * - Filtering and sorting capabilities
 * - Related collections
 * - Breadcrumb navigation
 * - SEO optimization
 * - Share functionality
 * - Responsive design with mobile-first approach
 * - Loading states and error handling
 * - Pagination for products
 * - View mode toggle (grid/list)
 * - Product quick view
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  ShoppingBagIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  SparklesIcon,
  CalendarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// Components
import {
  CollectionBanner,
  CollectionCard,
  CollectionCarousel,
} from '@/components/home';
import { ProductCard, ProductGrid } from '@/components/products';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import SEOHead from '@/components/common/SEO/SEOHead';

// Types
import type { Collection, Product } from '@/types/product.types';

// Utils
import { cn, formatNumber, formatDate } from '@/lib/utils/index';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'list';
type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'popular';

interface ProductFilters {
  search: string;
  sortBy: SortOption;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS = [
  { value: 'featured' as const, label: 'Featured' },
  { value: 'newest' as const, label: 'Newest First' },
  { value: 'popular' as const, label: 'Most Popular' },
  { value: 'price_asc' as const, label: 'Price: Low to High' },
  { value: 'price_desc' as const, label: 'Price: High to Low' },
  { value: 'name_asc' as const, label: 'Name: A-Z' },
  { value: 'name_desc' as const, label: 'Name: Z-A' },
];

const ITEMS_PER_PAGE = 12;

// Mock collection data
const MOCK_COLLECTION: Collection = {
  id: '1',
  name: 'Summer Essentials',
  slug: 'summer-essentials',
  description: 'Light and breezy fabrics perfect for hot summer days. Our Summer Essentials collection features breathable materials, vibrant colors, and versatile designs that keep you cool and stylish throughout the season.',
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
  tags: ['seasonal', 'featured', 'trending'],
  status: 'active' as const,
  isVisible: true,
  isFeatured: true,
  sortOrder: 1,
  productSortOrder: 'created_desc' as const,
  seo: {
    title: 'Summer Essentials Collection | Vardhman Mills',
    description: 'Discover our summer collection of light, breathable fabrics',
  },
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-10-20'),
};

// Mock products data
const MOCK_PRODUCTS: Product[] = Array.from({ length: 45 }, (_, i) => ({
  id: `product-${i + 1}`,
  name: `Summer Fabric ${i + 1}`,
  slug: `summer-fabric-${i + 1}`,
  sku: `SF-${String(i + 1).padStart(4, '0')}`,
  description: `Premium quality summer fabric with excellent breathability and vibrant colors.`,
  shortDescription: `Lightweight and breathable fabric for summer`,
  
  // Categorization
  categoryId: 'cat-summer',
  category: {
    id: 'cat-summer',
    name: 'Summer Fabrics',
    slug: 'summer-fabrics',
    description: 'Lightweight summer fabrics',
    children: [],
    level: 1,
    path: '/summer-fabrics',
    status: 'active' as const,
    isVisible: true,
    isFeatured: false,
    productCount: 45,
    activeProductCount: 45,
    sortOrder: 1,
    attributeGroups: [],
    seo: {
      title: 'Summer Fabrics',
      description: 'Summer fabric collection',
    },
    createdBy: 'admin-1',
    updatedBy: 'admin-1',
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 10, 20),
  },
  collectionIds: ['1'],
  collections: [MOCK_COLLECTION],
  
  // Pricing
  pricing: {
    basePrice: {
      amount: 500 + (i * 50),
      currency: 'INR',
      formatted: `₹${(500 + (i * 50)).toLocaleString('en-IN')}`,
    },
    salePrice: i % 3 === 0 ? {
      amount: 400 + (i * 40),
      currency: 'INR',
      formatted: `₹${(400 + (i * 40)).toLocaleString('en-IN')}`,
    } : undefined,
    isDynamicPricing: false,
    taxable: true,
  },
  
  // Media
  media: {
    images: [
      {
        id: `product-img-${i}`,
        url: `/images/products/fabric-${(i % 10) + 1}.jpg`,
        alt: `Summer Fabric ${i + 1}`,
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
  features: ['Breathable', 'Lightweight', 'Durable'],
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
    value: 200,
    unit: 'g' as const,
  },
  
  // Inventory
  inventory: {
    quantity: 100 + i,
    isInStock: true,
    isLowStock: false,
    lowStockThreshold: 10,
    availableQuantity: 100 + i,
    backorderAllowed: false,
  },
  stock: 100 + i,
  
  // Marketing
  tags: i % 2 === 0 ? ['cotton', 'summer'] : ['linen', 'breathable'],
  keywords: ['fabric', 'summer', 'textile'],
  seo: {
    title: `Summer Fabric ${i + 1}`,
    description: `Premium summer fabric`,
  },
  
  // Status and Visibility
  status: 'active' as const,
  isPublished: true,
  isFeatured: i < 5,
  isNewArrival: false,
  isBestseller: i < 10,
  isOnSale: i % 3 === 0,
  
  // Reviews and Ratings
  rating: {
    average: 4.5,
    count: 20 + i,
    distribution: {
      1: 0,
      2: 1,
      3: 2,
      4: 5,
      5: 12 + i,
    },
  },
  reviewCount: 20 + i,
  
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
  createdAt: new Date(2024, 5, i + 1),
  updatedAt: new Date(2024, 10, 20),
}));

// Mock related collections
const MOCK_RELATED_COLLECTIONS: Collection[] = [
  {
    id: '2',
    name: 'Wedding Collection',
    slug: 'wedding-collection',
    description: 'Elegant fabrics for your special day',
    type: 'manual' as const,
    image: {
      id: 'collection-wedding-img',
      url: '/images/collections/wedding.jpg',
      alt: 'Wedding Collection',
      width: 800,
      height: 600,
    },
    productCount: 67,
    tags: ['featured'],
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
    description: 'Sustainable textile choices',
    type: 'promotional' as const,
    image: {
      id: 'collection-eco-img',
      url: '/images/collections/eco.jpg',
      alt: 'Eco-Friendly Collection',
      width: 800,
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
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CollectionPageProps {
  params: Promise<{
    collection: string;
  }>;
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const resolvedParams = React.use(params);
  const collectionSlug = resolvedParams.collection;
  const router = useRouter();

  // ============================================================================
  // STATE
  // ============================================================================

  const [collection] = useState<Collection>(MOCK_COLLECTION);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [relatedCollections] = useState<Collection[]>(MOCK_RELATED_COLLECTIONS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    sortBy: 'featured',
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Price filter
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.pricing.basePrice.amount >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.pricing.basePrice.amount <= filters.maxPrice!);
    }

    // Category filter
    if (filters.category) {
      result = result.filter((p) => p.category?.slug === filters.category);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.pricing.basePrice.amount - b.pricing.basePrice.amount);
        break;
      case 'price_desc':
        result.sort((a, b) => b.pricing.basePrice.amount - a.pricing.basePrice.amount);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => {
          const aTime = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt.getTime();
          const bTime = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt.getTime();
          return bTime - aTime;
        });
        break;
      case 'popular':
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (a.isFeatured === b.isFeatured) return 0;
          return a.isFeatured ? -1 : 1;
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

  const handleProductClick = useCallback(
    (product: Product) => {
      router.push(`/products/${product.slug}`);
    },
    [router]
  );

  const handleCollectionClick = useCallback(
    (collection: Collection) => {
      router.push(`/collections/${collection.slug}`);
    },
    [router]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackClick = useCallback(() => {
    router.push('/collections');
  }, [router]);

  const handleShareClick = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: collection.name,
        text: collection.description,
        url: window.location.href,
      });
    }
  }, [collection]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      sortBy: 'featured',
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
  }, [filters, collectionSlug]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Collections
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            className={cn(
              isFavorite && 'text-red-600 border-red-600'
            )}
          >
            {isFavorite ? (
              <HeartSolidIcon className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareClick}
            className="gap-2"
          >
            <ShareIcon className="w-5 h-5" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBanner = () => (
    <div className="mb-8">
      <CollectionBanner
        collection={collection}
        variant="overlay"
      />
    </div>
  );

  const renderCollectionInfo = () => (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBagIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Products</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatNumber(collection.productCount)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TagIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {collection.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Updated</h3>
            </div>
            <p className="text-gray-600">
              {formatDate(collection.updatedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFilters = () => (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search products..."
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

      {/* Active Filters */}
      {filters.search && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          <Badge variant="secondary" className="gap-2">
            Search: {filters.search}
            <button
              onClick={() => handleSearchChange('')}
              className="hover:text-red-600"
              aria-label="Remove search filter"
              title="Remove search filter"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
          </Badge>
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
      const IconComponent = ShoppingBagIcon;
      return (
        <EmptyState
          icon={<IconComponent className="w-12 h-12" />}
          title="No products found"
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
            {viewMode === 'grid' ? (
              <ProductGrid
                products={paginatedProducts}
                layout={viewMode}
                onProductClick={handleProductClick}
              />
            ) : (
              <div className="space-y-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="list"
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            )}
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

  const renderRelatedCollections = () => {
    if (relatedCollections.length === 0) return null;

    return (
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Related Collections
            </h2>
            <p className="text-gray-600">Discover more curated collections</p>
          </div>
          <SparklesIcon className="w-8 h-8 text-yellow-500" />
        </div>

        <div className="lg:hidden">
          <CollectionCarousel
            collections={relatedCollections}
            autoPlay
            showArrows
            itemsPerView={{ mobile: 1, tablet: 2, desktop: 2, large: 3 }}
          />
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-6">
          {relatedCollections.map((relatedCollection) => (
            <CollectionCard
              key={relatedCollection.id}
              collection={relatedCollection}
              variant="default"
              onClick={() => handleCollectionClick(relatedCollection)}
              showProductCount
            />
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      <SEOHead
        title={collection.seo.title || `${collection.name} | Vardhman Mills`}
        description={
          collection.seo.description || collection.description || ''
        }
        keywords={collection.tags?.join(', ') || ''}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Collections', href: '/collections' },
              { label: collection.name, href: `/collections/${collection.slug}` },
            ]}
            className="mb-6"
          />

          {/* Header */}
          {renderHeader()}

          {/* Banner */}
          {renderBanner()}

          {/* Collection Info */}
          {renderCollectionInfo()}

          {/* Filters */}
          {renderFilters()}

          {/* Products Grid */}
          {renderProducts()}

          {/* Related Collections */}
          {renderRelatedCollections()}
        </div>
      </div>
    </>
  );
}

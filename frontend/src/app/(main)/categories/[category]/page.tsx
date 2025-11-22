/**
 * Category Detail Page - Vardhman Mills
 * 
 * Individual category showcase with subcategories and products.
 * 
 * Features:
 * - Category banner with image
 * - Subcategory navigation
 * - Product preview
 * - Category description
 * - Related categories
 * - Breadcrumb navigation
 * - SEO optimization
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
  ChevronRightIcon,
  ShoppingBagIcon,
  TagIcon,
  FolderIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// Components
import { Container } from '@/components/ui';
import SEOHead from '@/components/common/SEO/SEOHead';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';

// Home Components
import SubcategoryList from '@/components/home/Categories/SubcategoryList';

// Product Components
import { ProductGrid, ProductCard } from '@/components/products';

// Types
import type { Category, Product } from '@/types/product.types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES
// ============================================================================

interface SubcategoryFilter {
  search: string;
  featured: boolean;
}

interface ProductFilter {
  sortBy: 'popular' | 'newest' | 'price-low' | 'price-high' | 'name';
  priceRange: [number, number];
  minRating: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PRODUCT_SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name (A-Z)' },
] as const;

// Mock data (replace with actual API calls)
const MOCK_CATEGORY: Category | null = null;
const MOCK_SUBCATEGORIES: Category[] = [];
const MOCK_PRODUCTS: Product[] = [];
const MOCK_RELATED_CATEGORIES: Category[] = [];

// ============================================================================
// COMPONENT
// ============================================================================

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params?.category as string;

  // ============================================================================
  // STATE
  // ============================================================================

  const [category] = useState<Category | null>(MOCK_CATEGORY);
  const [subcategories] = useState<Category[]>(MOCK_SUBCATEGORIES);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [relatedCategories] = useState<Category[]>(MOCK_RELATED_CATEGORIES);
  const [activeTab, setActiveTab] = useState<'subcategories' | 'products' | 'about'>('subcategories');
  const [isLoading] = useState(false);
  
  const [subcategoryFilter, setSubcategoryFilter] = useState<SubcategoryFilter>({
    search: '',
    featured: false,
  });

  const [productFilter, setProductFilter] = useState<ProductFilter>({
    sortBy: 'popular',
    priceRange: [0, 10000],
    minRating: 0,
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const seoData = useMemo(() => ({
    title: category 
      ? `${category.name} - Home Textiles & Furnishings | Vardhman Mills`
      : 'Category - Vardhman Mills',
    description: category?.description || 'Browse our collection of home textiles',
    keywords: category?.name || 'home textiles',
    ogImage: category?.bannerImage || '/images/category-og.jpg',
    canonical: `https://vardhmanmills.com/categories/${categorySlug}`,
  }), [category, categorySlug]);

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
    
    return items;
  }, [category]);

  const filteredSubcategories = useMemo(() => {
    let result = [...subcategories];

    if (subcategoryFilter.search) {
      const searchLower = subcategoryFilter.search.toLowerCase();
      result = result.filter(cat =>
        cat.name.toLowerCase().includes(searchLower)
      );
    }

    if (subcategoryFilter.featured) {
      result = result.filter(cat => cat.isFeatured);
    }

    return result;
  }, [subcategories, subcategoryFilter]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price filter
    result = result.filter(p =>
      p.pricing.basePrice.amount >= productFilter.priceRange[0] &&
      p.pricing.basePrice.amount <= productFilter.priceRange[1]
    );

    // Rating filter
    if (productFilter.minRating > 0) {
      result = result.filter(p => (p.rating?.average || 0) >= productFilter.minRating);
    }

    // Sort
    result.sort((a, b) => {
      switch (productFilter.sortBy) {
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'price-low':
          return a.pricing.basePrice.amount - b.pricing.basePrice.amount;
        case 'price-high':
          return b.pricing.basePrice.amount - a.pricing.basePrice.amount;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [products, productFilter]);

  const categoryStats = useMemo(() => {
    if (!category) return [];

    return [
      {
        icon: FolderIcon,
        label: 'Subcategories',
        value: subcategories.length.toString(),
        color: 'from-blue-500 to-cyan-500',
      },
      {
        icon: ShoppingBagIcon,
        label: 'Products',
        value: formatNumber(category.productCount || 0),
        color: 'from-purple-500 to-pink-500',
      },
      {
        icon: TagIcon,
        label: 'Brands',
        value: '45+',
        color: 'from-green-500 to-emerald-500',
      },
    ];
  }, [category, subcategories.length]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubcategoryClick = useCallback((subcat: Category | { slug: string }) => {
    router.push(`/categories/${categorySlug}/${subcat.slug}`);
  }, [router, categorySlug]);

  // TODO: Connect product click handler when products section is fully implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleProductClick = useCallback((product: Product) => {
    router.push(`/products/${product.slug}`);
  }, [router]);

  const handleBackToCategories = useCallback(() => {
    router.push('/categories');
  }, [router]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Load category data from API
    // This would fetch category by slug
  }, [categorySlug]);

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

  const renderCategoryBanner = () => {
    if (!category) return null;

    return (
      <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
        {category.bannerImage ? (
          <Image
            src={category.bannerImage.url}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <Container>
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {category.isFeatured && (
                    <Badge className="bg-yellow-500 text-white">
                      Featured
                    </Badge>
                  )}
                  {category.isHot && (
                    <Badge className="bg-red-500 text-white">
                      Hot
                    </Badge>
                  )}
                  {category.isNew && (
                    <Badge className="bg-green-500 text-white">
                      New
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  {category.name}
                </h1>
                <p className="text-lg text-gray-200 max-w-2xl">
                  {category.description}
                </p>
              </div>
              
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={handleBackToCategories}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                All Categories
              </Button>
            </div>
          </Container>
        </div>
      </div>
    );
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {categoryStats.map((stat, index) => {
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
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    'bg-gradient-to-br', stat.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  const renderSubcategoriesTab = () => (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search subcategories..."
            value={subcategoryFilter.search}
            onChange={(e) => setSubcategoryFilter(prev => ({
              ...prev,
              search: e.target.value
            }))}
            className="pl-10"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
          <input
            type="checkbox"
            checked={subcategoryFilter.featured}
            onChange={(e) => setSubcategoryFilter(prev => ({
              ...prev,
              featured: e.target.checked
            }))}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm">Featured Only</span>
        </label>
      </div>

      {/* Subcategories list */}
      {filteredSubcategories.length > 0 ? (
        <SubcategoryList
          categories={filteredSubcategories}
          layout="grid"
          showProductCount
          showBadges
          onCategoryClick={handleSubcategoryClick}
        />
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No subcategories found
          </p>
        </Card>
      )}
    </div>
  );

  const renderProductsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">
              {filteredProducts.length}
            </span> products
          </span>
        </div>

        <select
          value={productFilter.sortBy}
          onChange={(e) => setProductFilter(prev => ({
            ...prev,
            sortBy: e.target.value as ProductFilter['sortBy']
          }))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500"
          aria-label="Sort products"
        >
          {PRODUCT_SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 12).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No products found in this category
          </p>
          <Button onClick={() => router.push('/products')}>
            Browse All Products
          </Button>
        </Card>
      )}

      {filteredProducts.length > 12 && (
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => {
              const firstSubcat = subcategories[0];
              if (firstSubcat) {
                router.push(`/categories/${categorySlug}/${firstSubcat.slug}`);
              }
            }}
          >
            View All Products
          </Button>
        </div>
      )}
    </div>
  );

  const renderAboutTab = () => {
    if (!category) return null;

    return (
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">About {category.name}</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {category.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Products
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(category.productCount || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Subcategories
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {subcategories.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Available Brands
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  45+
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Price Range
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ₹99 - ₹9,999
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {category.attributeGroups && category.attributeGroups.length > 0 && (
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Category Attributes</h3>
              <div className="space-y-4">
                {category.attributeGroups.map((group) => (
                  <div key={group.name}>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {group.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {group.attributes.map((attr) => (
                        <Badge key={attr.name} variant="secondary">
                          {attr.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderRelatedCategories = () => {
    if (relatedCategories.length === 0) return null;

    return (
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Related Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedCategories.map((cat) => (
            <Card
              key={cat.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => router.push(`/categories/${cat.slug}`)}
            >
              <CardContent className="p-6">
                {cat.image && (
                  <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={typeof cat.image === 'string' ? cat.image : cat.image.url}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(cat.productCount || 0)} products
                  </span>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
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
          <p className="text-gray-600 dark:text-gray-400">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <Container className="py-12">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The category you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={handleBackToCategories}>
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
          {renderCategoryBanner()}
          {renderStats()}

          {/* Tabs with AnimatePresence for smooth transitions */}
          <AnimatePresence mode="wait">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-8">
                <TabsTrigger value="subcategories">
                  Subcategories ({subcategories.length})
                </TabsTrigger>
                <TabsTrigger value="products">
                  Products ({products.length})
                </TabsTrigger>
                <TabsTrigger value="about">
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subcategories">
                <motion.div
                  key="subcategories-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderSubcategoriesTab()}
                </motion.div>
              </TabsContent>

              <TabsContent value="products">
                <motion.div
                  key="products-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderProductsTab()}
                  {/* Alternative ProductGrid view */}
                  {filteredProducts.length > 12 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">More Products</h3>
                      <ProductGrid
                        products={filteredProducts.slice(12, 24)}
                        columns={4}
                        gap="md"
                        showQuickView
                      />
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="about">
                <motion.div
                  key="about-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderAboutTab()}
                </motion.div>
              </TabsContent>
            </Tabs>
          </AnimatePresence>

          {renderRelatedCategories()}
        </Container>
      </motion.div>
    </>
  );
}

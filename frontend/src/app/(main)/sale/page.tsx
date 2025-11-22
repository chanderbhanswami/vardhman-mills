/**
 * Sale Page - Vardhman Mills
 * Browse sale items and special offers
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import SEOHead from '@/components/common/SEOHead';

// Product Components
import {
  ProductCard,
  ProductGridSkeleton,
} from '@/components/products';

// Hooks
import { useToast } from '@/hooks/useToast';

// Types
import type { Product } from '@/types/product.types';

// Simplified type for sale products
interface SaleProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  pricing: {
    basePrice: {
      amount: number;
      currency: 'INR';
      displayAmount: string;
    };
    salePrice: {
      amount: number;
      currency: 'INR';
      displayAmount: string;
    };
    compareAtPrice: {
      amount: number;
      currency: 'INR';
      displayAmount: string;
    };
    isDynamicPricing: boolean;
    taxable: boolean;
  };
  media: {
    images: Array<{
      id: string;
      url: string;
      alt: string;
      title: string;
      width: number;
      height: number;
      isPrimary: boolean;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>;
    videos: never[];
  };
  inventory: {
    inStock: boolean;
    quantity: number;
    lowStockThreshold: number;
    isLowStock: boolean;
    allowBackorder: boolean;
    trackInventory: boolean;
  };
  saleData: {
    discountPercentage: number;
  };
}

// Utils
import { formatCurrency } from '@/lib/utils';

// Icons
import {
  FireIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  SparklesIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface SaleFilters {
  category: string;
  discount: string;
  priceRange: string;
  search: string;
}

const CATEGORIES = ['All', 'Bedsheets', 'Towels', 'Curtains', 'Cushions', 'Blankets'];
const DISCOUNT_RANGES = ['All', '10% - 25%', '26% - 50%', '50%+'];
const PRICE_RANGES = ['All', '₹0 - ₹500', '₹500 - ₹1000', '₹1000 - ₹2000', '₹2000+'];

export default function SalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [filters, setFilters] = useState<SaleFilters>({
    category: 'All',
    discount: 'All',
    priceRange: 'All',
    search: '',
  });

  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock sale products with proper typing
      const mockProducts: SaleProduct[] = Array.from({ length: 12 }, (_, i) => {
        const basePrice = 2000 + (i * 500);
        const salePrice = 1000 + (i * 250);
        const discountPercentage = Math.round(((basePrice - salePrice) / basePrice) * 100);
        
        return {
          id: `sale-${i + 1}`,
          name: `Sale Product ${i + 1}`,
          slug: `sale-product-${i + 1}`,
          description: `Amazing deal on premium quality product. Limited time offer!`,
          category: {
            id: `cat-${i}`,
            name: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1],
            slug: 'category',
          },
          pricing: {
            basePrice: {
              amount: basePrice,
              currency: 'INR' as const,
              displayAmount: formatCurrency(basePrice),
            },
            salePrice: {
              amount: salePrice,
              currency: 'INR' as const,
              displayAmount: formatCurrency(salePrice),
            },
            compareAtPrice: {
              amount: basePrice,
              currency: 'INR' as const,
              displayAmount: formatCurrency(basePrice),
            },
            isDynamicPricing: false,
            taxable: true,
          },
          media: {
            images: [
              {
                id: `img-${i}`,
                url: '/api/placeholder/400/400',
                alt: `Product ${i + 1}`,
                title: `Product ${i + 1}`,
                width: 400,
                height: 400,
                isPrimary: true,
                order: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            videos: [],
          },
          inventory: {
            inStock: true,
            quantity: 100,
            lowStockThreshold: 10,
            isLowStock: false,
            allowBackorder: false,
            trackInventory: true,
          },
          saleData: {
            discountPercentage,
          },
        };
      });

      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to load sale products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sale items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const category = searchParams?.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = filters.category === 'All' || product.category?.name === filters.category;
      
      const discountPercentage = product.saleData?.discountPercentage || 0;
      const matchesDiscount =
        filters.discount === 'All' ||
        (filters.discount === '10% - 25%' && discountPercentage >= 10 && discountPercentage <= 25) ||
        (filters.discount === '26% - 50%' && discountPercentage > 25 && discountPercentage <= 50) ||
        (filters.discount === '50%+' && discountPercentage > 50);

      const salePrice = product.pricing?.salePrice?.amount || 0;
      const matchesPrice =
        filters.priceRange === 'All' ||
        (filters.priceRange === '₹0 - ₹500' && salePrice <= 500) ||
        (filters.priceRange === '₹500 - ₹1000' && salePrice > 500 && salePrice <= 1000) ||
        (filters.priceRange === '₹1000 - ₹2000' && salePrice > 1000 && salePrice <= 2000) ||
        (filters.priceRange === '₹2000+' && salePrice > 2000);

      const matchesSearch =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase());

      return matchesCategory && matchesDiscount && matchesPrice && matchesSearch;
    });
  }, [products, filters]);

  const handleFilterChange = useCallback((key: keyof SaleFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Sale - Up to 70% Off | Vardhman Mills"
        description="Grab amazing deals on premium quality products. Limited time offers!"
        keywords={['sale', 'discount', 'offers', 'deals']}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Sale', href: '/sale' },
          ]}
        />

        {/* Hero Banner */}
        <div className="mt-6 mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 p-8 lg:p-12">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <FireIcon className="w-10 h-10 text-white" />
              <Badge className="bg-white text-red-600 font-bold text-lg px-4 py-2">
                MEGA SALE
              </Badge>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Up to 70% Off
            </h1>
            <p className="text-xl text-white mb-6 max-w-2xl">
              Limited time offer! Shop our biggest sale of the season with incredible discounts on premium products.
            </p>

            {/* Countdown Timer */}
            <Card className="inline-block bg-white/95 backdrop-blur">
              <CardContent className="py-4 px-6">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-semibold text-gray-900">Sale Ends In</span>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-600">Hours</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-400">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-600">Minutes</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-400">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-600">Seconds</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category-select" className="block text-sm font-medium mb-2">Category</label>
                <select
                  id="category-select"
                  aria-label="Filter by category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Discount */}
              <div>
                <label htmlFor="discount-select" className="block text-sm font-medium mb-2">Discount</label>
                <select
                  id="discount-select"
                  aria-label="Filter by discount percentage"
                  value={filters.discount}
                  onChange={(e) => handleFilterChange('discount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {DISCOUNT_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label htmlFor="price-select" className="block text-sm font-medium mb-2">Price Range</label>
                <select
                  id="price-select"
                  aria-label="Filter by price range"
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {PRICE_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.category !== 'All' || filters.discount !== 'All' || filters.priceRange !== 'All' || filters.search) && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.category !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.category}
                    <button onClick={() => handleFilterChange('category', 'All')} className="ml-1 hover:text-red-600">×</button>
                  </Badge>
                )}
                {filters.discount !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.discount}
                    <button onClick={() => handleFilterChange('discount', 'All')} className="ml-1 hover:text-red-600">×</button>
                  </Badge>
                )}
                {filters.priceRange !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.priceRange}
                    <button onClick={() => handleFilterChange('priceRange', 'All')} className="ml-1 hover:text-red-600">×</button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ category: 'All', discount: 'All', priceRange: 'All', search: '' })}
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products on sale
          </p>
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Hot Deals</span>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <TagIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
            <Button
              onClick={() => setFilters({ category: 'All', discount: 'All', priceRange: 'All', search: '' })}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product as unknown as Product}
                onQuickView={() => router.push(`/products/${product.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

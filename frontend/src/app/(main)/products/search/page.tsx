/**
 * Product Search Page - Vardhman Mills
 * Dedicated search results page with advanced filtering
 */

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import { motion } from 'framer-motion'; // Available for future animations

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

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
  // ProductGrid, // Available for alternative grid layout
  ProductGridSkeleton,
  ProductSort,
  SearchResults,
  SearchSuggestions,
  SearchHistory,
  NoResults,
  // addSearchToHistory, // Available for future search history integration
} from '@/components/products';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks';
// import { useLocalStorage } from '@/hooks'; // Available for future use

// Types
import type { Product } from '@/types/product.types';
import type { ProductSortOption } from '@/components/products';

// Utils
import { formatCurrency } from '@/lib/utils';
// cn utility available for future className conditionals

// Icons
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  // ArrowPathIcon, // Available for future refresh functionality
  // FunnelIcon, // Available for future advanced filter UI
} from '@heroicons/react/24/outline';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SearchPageContentProps {}

function SearchPageContent({}: SearchPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Get initial search query
  const initialQuery = (searchParams?.get('q')) || '';
  // const initialCategory = (searchParams?.get('category')) || ''; // Available for future category filtering

  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  // const [isLoading, setIsLoading] = useState(false); // Available for future loading states
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<ProductSortOption>('relevance');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Generate mock products
  const generateMockSearchProducts = useCallback((query: string, count: number = 20): Product[] => {
    if (!query) return [];

    const categories = ['Cotton', 'Silk', 'Linen', 'Wool', 'Synthetic'];
    const colors = ['White', 'Blue', 'Red', 'Green', 'Yellow'];
    const sizes = ['Single', 'Double', 'Queen', 'King'];

    return Array.from({ length: count }, (_, i) => {
      const basePrice = 1000 + (i * 200);
      const discount = Math.floor(Math.random() * 30) + 10;
      const salePrice = basePrice - (basePrice * discount / 100);

      return {
        id: `search-${i + 1}`,
        name: `${query} ${categories[i % categories.length]} Bedsheet Set ${i + 1}`,
        slug: `${query.toLowerCase().replace(/\s+/g, '-')}-${categories[i % categories.length].toLowerCase()}-${i + 1}`,
        description: `Premium ${query} ${categories[i % categories.length]} bedsheet with excellent quality`,
        category: {
          id: `cat-${i % categories.length}`,
          name: categories[i % categories.length],
          slug: categories[i % categories.length].toLowerCase(),
        },
        pricing: {
          basePrice: {
            amount: basePrice,
            currency: 'INR',
            displayAmount: formatCurrency(basePrice),
          },
          salePrice: {
            amount: salePrice,
            currency: 'INR',
            displayAmount: formatCurrency(salePrice),
          },
          compareAtPrice: {
            amount: basePrice,
            currency: 'INR',
            displayAmount: formatCurrency(basePrice),
          },
          discount: {
            amount: basePrice - salePrice,
            percentage: discount,
          },
          isDynamicPricing: false,
          taxable: true,
        },
        media: {
          images: [
            {
              id: `img-${i}-1`,
              url: `https://picsum.photos/seed/search${i}/800/800`,
              alt: `${query} Bedsheet`,
              title: `Search Result ${i + 1}`,
              width: 800,
              height: 800,
              isPrimary: true,
            },
          ],
          videos: [],
        },
        inventory: {
          inStock: Math.random() > 0.2,
          quantity: Math.floor(Math.random() * 100) + 10,
          isLowStock: false,
          lowStockThreshold: 10,
          allowBackorder: true,
          trackInventory: true,
        },
        attributes: {
          color: colors[i % colors.length],
          size: sizes[i % sizes.length],
          material: `${query} Material`,
          threadCount: 300 + (i % 5) * 100,
          brand: 'Vardhman Mills',
        },
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 500) + 50,
        tags: ['search-result', 'bestseller'],
        isFeatured: false,
        isNew: false,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as Product;
    });
  }, []);

  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setProducts([]);
      return;
    }

    try {
      setIsSearching(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      const results = generateMockSearchProducts(query, 20);
      setProducts(results);

      // Add to search history (future feature - will integrate with search history service)
      // addSearchToHistory(query);

      // Update URL
      if (searchParams) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('q', query);
        router.replace(`/products/search?${params.toString()}`, { scroll: false });
      }

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  }, [generateMockSearchProducts, router, searchParams, toast]);

  // Generate suggestions
  const generateSuggestions = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const allSuggestions = [
      'Cotton Bedsheet',
      'Silk Bedsheet',
      'Linen Bedsheet',
      'King Size Bedsheet',
      'Queen Size Bedsheet',
      'Double Bedsheet',
      'Single Bedsheet',
      'White Bedsheet',
      'Blue Bedsheet',
      'Premium Bedsheet',
      'Luxury Bedsheet',
      'Designer Bedsheet',
    ];

    const filtered = allSuggestions.filter(s =>
      s.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    setSuggestions(filtered);
  }, []);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    generateSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setProducts([]);
    setSuggestions([]);
    router.push('/products/search');
  };

  // const handleProductClick = (product: Product) => {
  //   router.push(`/products/${product.slug}`);
  // }; // Available for future direct product navigation

  // Effects
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debouncedSearch && debouncedSearch !== initialQuery) {
      handleSearch(debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <ErrorBoundary>
      <SEOHead
        title={`Search ${searchQuery ? `- ${searchQuery}` : ''} | Vardhman Mills`}
        description="Search our premium collection of bedsheets"
        keywords="search, bedsheets, products"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: 'Search', href: '/products/search' },
              ]}
            />

            <div className="mt-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Products</h1>

              {/* Search Bar */}
              <div className="relative max-w-3xl">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search for bedsheets, materials, colors..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-12 pr-12 h-14 text-lg"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      aria-label="Clear search"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <Card className="absolute z-50 w-full mt-2 shadow-lg">
                    <CardContent className="p-0">
                      <SearchSuggestions
                        query={searchQuery}
                        suggestions={suggestions.map(s => ({
                          id: s,
                          label: s,
                          type: 'keyword' as const,
                        }))}
                        onSelect={(suggestion) => handleSuggestionClick(suggestion.label)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Search Info */}
              {searchQuery && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-gray-600">
                    {isSearching ? (
                      'Searching...'
                    ) : (
                      <>
                        Found <strong>{products.length}</strong> results for{' '}
                        <strong>&quot;{searchQuery}&quot;</strong>
                      </>
                    )}
                  </p>
                  {products.length > 0 && (
                    <ProductSort value={sortBy} onChange={setSortBy} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {!searchQuery ? (
            /* Empty State - Show Search History */
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="py-12">
                  <div className="text-center mb-8">
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Search Our Products
                    </h2>
                    <p className="text-gray-600">
                      Find the perfect bedsheets from our premium collection
                    </p>
                  </div>

                  {/* Popular Searches */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5" />
                      Popular Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Cotton Bedsheet',
                        'Silk Bedsheet',
                        'King Size',
                        'Queen Size',
                        'White Bedsheet',
                        'Premium Collection',
                      ].map((term) => (
                        <Badge
                          key={term}
                          variant="secondary"
                          className="cursor-pointer hover:bg-gray-200"
                          onClick={() => {
                            setSearchQuery(term);
                            handleSearch(term);
                          }}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Search History */}
                  <SearchHistory
                    onSelect={(query) => {
                      setSearchQuery(query);
                      handleSearch(query);
                    }}
                    currentQuery={searchQuery}
                  />

                  {/* Browse All Link */}
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/products')}
                    >
                      Browse All Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : isSearching ? (
            /* Loading State */
            <ProductGridSkeleton count={12} layout="grid" />
          ) : products.length === 0 ? (
            /* No Results */
            <NoResults
              query={searchQuery}
              onClearFilters={handleClearSearch}
            />
          ) : (
            /* Search Results */
            <div>
              <SearchResults
                products={products}
                query={searchQuery}
              />
            </div>
          )}
        </div>

        <BackToTop />
      </div>
    </ErrorBoundary>
  );
}

// Main export with Suspense
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

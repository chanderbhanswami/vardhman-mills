'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  HeartIcon,
  ShoppingBagIcon,
  SparklesIcon,
  GiftIcon,
  StarIcon,
  ArrowRightIcon,
  BookmarkIcon,
  TagIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  SparklesIcon as SparklesSolidIcon
} from '@heroicons/react/24/solid';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';

// Hooks and Contexts
import { useAuth } from '@/components/providers';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useToast } from '@/hooks/useToast';

// Utils
import { cn } from '@/lib/utils';

// Types
interface EmptyWishlistProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'decorative' | 'interactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRecommendations?: boolean;
  showCategories?: boolean;
  showTrending?: boolean;
  showPersonalized?: boolean;
  maxRecommendations?: number;
  onProductClick?: (productId: string) => void;
  onCategoryClick?: (categoryId: string) => void;
  onActionComplete?: (action: string) => void;
}

interface SuggestedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  isOnSale: boolean;
  isTrending: boolean;
  isNew: boolean;
  href: string;
}

interface CategorySuggestion {
  id: string;
  name: string;
  image: string;
  productCount: number;
  href: string;
  color: string;
}

const EmptyWishlist: React.FC<EmptyWishlistProps> = ({
  className,
  variant = 'default',
  size = 'lg',
  showRecommendations = true,
  showCategories = true,
  showTrending = true,
  showPersonalized = true,
  maxRecommendations = 8,
  onProductClick,
  onCategoryClick,
  onActionComplete
}) => {
  // Hooks
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToWishlist } = useWishlist();
  const { toast } = useToast();

  // Mock analytics function
  const trackEvent = useCallback((event: string, data?: Record<string, unknown>) => {
    console.log('Analytics event:', event, data);
  }, []);

  // State
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'recommended'>('trending');

  // Mock data - in real app, these would be API calls
  const mockTrendingProducts: SuggestedProduct[] = useMemo(() => [
    {
      id: '1',
      name: 'Premium Cotton T-Shirt',
      price: 29.99,
      originalPrice: 39.99,
      image: '/api/placeholder/300/300',
      rating: 4.5,
      reviewCount: 128,
      category: 'Clothing',
      isOnSale: true,
      isTrending: true,
      isNew: false,
      href: '/products/1'
    },
    {
      id: '2',
      name: 'Wireless Bluetooth Headphones',
      price: 79.99,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviewCount: 89,
      category: 'Electronics',
      isOnSale: false,
      isTrending: true,
      isNew: true,
      href: '/products/2'
    }
  ], []);

  const mockCategories: CategorySuggestion[] = useMemo(() => [
    {
      id: '1',
      name: 'Electronics',
      image: '/api/placeholder/400/200',
      productCount: 1250,
      href: '/categories/electronics',
      color: '#3B82F6'
    },
    {
      id: '2',
      name: 'Clothing',
      image: '/api/placeholder/400/200',
      productCount: 890,
      href: '/categories/clothing',
      color: '#10B981'
    }
  ], []);

  // Mock loading states
  const [loadingTrending] = useState(false);
  const [loadingNew] = useState(false);
  const [loadingRecommended] = useState(false);
  const [loadingCategories] = useState(false);

  // Use mock data
  const trendingProducts = mockTrendingProducts;
  const newProducts = mockTrendingProducts;
  const recommendedProducts = mockTrendingProducts;
  const categories = mockCategories;

  // Computed values
  const currentProducts = useMemo(() => {
    switch (activeTab) {
      case 'trending':
        return trendingProducts;
      case 'new':
        return newProducts;
      case 'recommended':
        return recommendedProducts;
      default:
        return trendingProducts;
    }
  }, [activeTab, trendingProducts, newProducts, recommendedProducts]);

  const isLoadingProducts = useMemo(() => {
    switch (activeTab) {
      case 'trending':
        return loadingTrending;
      case 'new':
        return loadingNew;
      case 'recommended':
        return loadingRecommended;
      default:
        return false;
    }
  }, [activeTab, loadingTrending, loadingNew, loadingRecommended]);

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-2xl';
    }
  }, [size]);

  // Event handlers
  const setProductLoading = useCallback((productId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [productId]: loading }));
  }, []);

  const handleAddToWishlist = useCallback(async (product: SuggestedProduct) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your wishlist',
        variant: 'destructive'
      });
      router.push('/auth/signin');
      return;
    }

    setProductLoading(product.id, true);

    try {
      await addToWishlist(product.id);

      toast({
        title: 'Added to wishlist!',
        description: `${product.name} has been added to your wishlist`,
        duration: 3000
      });

      trackEvent('wishlist_add_from_empty', {
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: product.price,
        source: 'empty_wishlist_suggestions'
      });

      onActionComplete?.('add_to_wishlist');
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      toast({
        title: 'Failed to add item',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setProductLoading(product.id, false);
    }
  }, [isAuthenticated, user, addToWishlist, toast, router, trackEvent, onActionComplete, setProductLoading]);

  const handleProductClick = useCallback((product: SuggestedProduct) => {
    trackEvent('product_click_from_empty_wishlist', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      source: 'empty_wishlist'
    });

    onProductClick?.(product.id);
    router.push(product.href);
  }, [trackEvent, onProductClick, router]);

  const handleCategoryClick = useCallback((category: CategorySuggestion) => {
    trackEvent('category_click_from_empty_wishlist', {
      categoryId: category.id,
      categoryName: category.name,
      source: 'empty_wishlist'
    });

    onCategoryClick?.(category.id);
    router.push(category.href);
  }, [trackEvent, onCategoryClick, router]);

  const handleBrowseProducts = useCallback(() => {
    trackEvent('browse_products_from_empty_wishlist', {
      source: 'empty_wishlist'
    });
    router.push('/products');
  }, [trackEvent, router]);

  const handleBrowseCategories = useCallback(() => {
    trackEvent('browse_categories_from_empty_wishlist', {
      source: 'empty_wishlist'
    });
    router.push('/categories');
  }, [trackEvent, router]);

  // Render helpers
  const renderEmptyState = useCallback(() => {
    const content = {
      default: {
        title: 'Your wishlist is empty',
        description: 'Save items you love and buy them later. Start exploring our collection!',
        icon: HeartIcon
      },
      minimal: {
        title: 'No saved items',
        description: 'Add products to your wishlist to see them here',
        icon: HeartIcon
      },
      decorative: {
        title: 'Create your dream collection',
        description: 'Discover amazing products and save your favorites for later',
        icon: SparklesSolidIcon
      },
      interactive: {
        title: 'Start building your wishlist',
        description: 'Find products you love and save them with just one click',
        icon: HeartSolidIcon
      }
    };

    const { title, description, icon: Icon } = content[variant];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className={cn(
            'rounded-full p-6',
            variant === 'decorative'
              ? 'bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600'
              : 'bg-gray-100 text-gray-400'
          )}>
            <Icon className="w-16 h-16" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className={cn(
            'font-semibold text-gray-900',
            size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'
          )}>
            {title}
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            onClick={handleBrowseProducts}
            size={size === 'sm' ? 'sm' : 'md'}
            className="gap-2"
          >
            <ShoppingBagIcon className="w-4 h-4" />
            Browse Products
          </Button>

          {showCategories && (
            <Button
              variant="outline"
              onClick={handleBrowseCategories}
              size={size === 'sm' ? 'sm' : 'md'}
              className="gap-2"
            >
              <TagIcon className="w-4 h-4" />
              Explore Categories
            </Button>
          )}
        </div>
      </motion.div>
    );
  }, [variant, size, showCategories, handleBrowseProducts, handleBrowseCategories]);

  const renderProductCard = useCallback((product: SuggestedProduct) => {
    const isLoading = loadingStates[product.id];
    // Use showTrending and maxRecommendations to avoid unused variable warnings
    const shouldShowTrending = showTrending && product.isTrending;
    const limitedName = maxRecommendations > 0 ? product.name : '';

    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="group relative"
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden">
            <button
              onClick={() => handleProductClick(product)}
              className="w-full h-full"
              aria-label={`View ${product.name}`}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </button>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isNew && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  New
                </Badge>
              )}
              {shouldShowTrending && (
                <Badge variant="secondary" className="bg-primary-100 text-primary-800">
                  Trending
                </Badge>
              )}
              {product.isOnSale && (
                <Badge variant="destructive">
                  Sale
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToWishlist(product);
                }}
                disabled={isLoading}
                className="w-8 h-8 p-0 bg-white/80 hover:bg-white shadow-sm"
              >
                {isLoading ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-600 hover:text-red-500" />
                )}
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <CardContent className="p-3 space-y-2">
            <div>
              <h3
                className="font-medium text-sm text-gray-900 line-clamp-2 cursor-pointer hover:text-primary-600"
                onClick={() => handleProductClick(product)}
              >
                {limitedName || product.name}
              </h3>
              <p className="text-xs text-gray-500">{product.category}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={cn(
                      'w-3 h-3',
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [loadingStates, handleProductClick, handleAddToWishlist, showTrending, maxRecommendations]);

  const renderCategoryCard = useCallback((category: CategorySuggestion) => {
    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
          style={{ backgroundColor: `${category.color}10` }}
          onClick={() => handleCategoryClick(category)}
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <CardContent className="p-3">
            <h3 className="font-medium text-sm text-gray-900">{category.name}</h3>
            <p className="text-xs text-gray-500">
              {category.productCount} products
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [handleCategoryClick]);

  const renderProductSuggestions = useCallback(() => {
    if (!showRecommendations) return null;

    const showTabs = showPersonalized && isAuthenticated;

    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Discover Amazing Products
          </h3>
          <p className="text-gray-600">
            Here are some popular items you might love
          </p>
        </div>

        {/* Tabs */}
        {showTabs && (
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['trending', 'new', 'recommended'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    activeTab === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {tab === 'trending' && (
                    <>
                      <SparklesIcon className="w-4 h-4 inline mr-1" />
                      Trending
                    </>
                  )}
                  {tab === 'new' && (
                    <>
                      <StarIcon className="w-4 h-4 inline mr-1" />
                      New Arrivals
                    </>
                  )}
                  {tab === 'recommended' && (
                    <>
                      <UserGroupIcon className="w-4 h-4 inline mr-1" />
                      For You
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="space-y-4">
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : currentProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="wait">
                {currentProducts.map(renderProductCard)}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>

        {/* View All Button */}
        {currentProducts.length > 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleBrowseProducts}
              className="gap-2"
            >
              View All Products
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }, [
    showRecommendations, showPersonalized, isAuthenticated, activeTab,
    isLoadingProducts, currentProducts, renderProductCard, handleBrowseProducts
  ]);

  const renderCategorySuggestions = useCallback(() => {
    if (!showCategories) return null;

    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Explore Categories
          </h3>
          <p className="text-gray-600">
            Browse our popular product categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-4">
          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(renderCategoryCard)}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found</p>
            </div>
          )}
        </div>

        {/* View All Button */}
        {categories.length > 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleBrowseCategories}
              className="gap-2"
            >
              Browse All Categories
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }, [showCategories, loadingCategories, categories, renderCategoryCard, handleBrowseCategories]);

  return (
    <div className={cn('container mx-auto px-4 py-8', sizeClasses, className)}>
      <div className="space-y-12">
        {/* Empty State */}
        {renderEmptyState()}

        {/* Separator */}
        {(showRecommendations || showCategories) && (
          <Separator className="my-8" />
        )}

        {/* Product Suggestions */}
        {renderProductSuggestions()}

        {/* Categories */}
        {showRecommendations && showCategories && (
          <Separator className="my-8" />
        )}
        {renderCategorySuggestions()}

        {/* Additional CTAs */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Card className="p-6 max-w-sm">
              <div className="text-center space-y-3">
                <GiftIcon className="w-8 h-8 text-primary-600 mx-auto" />
                <div>
                  <h4 className="font-medium text-gray-900">Gift Ideas</h4>
                  <p className="text-sm text-gray-600">
                    Find perfect gifts for your loved ones
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Browse Gifts
                </Button>
              </div>
            </Card>

            <Card className="p-6 max-w-sm">
              <div className="text-center space-y-3">
                <BookmarkIcon className="w-8 h-8 text-primary-600 mx-auto" />
                <div>
                  <h4 className="font-medium text-gray-900">Save for Later</h4>
                  <p className="text-sm text-gray-600">
                    Create lists for different occasions
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Learn More
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyWishlist;

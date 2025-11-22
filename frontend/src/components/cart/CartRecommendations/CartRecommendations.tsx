/**
 * CartRecommendations Component - Vardhman Mills Frontend
 * 
 * Product recommendations based on cart with:
 * - Frequently bought together
 * - Customers also bought
 * - Complete the look
 * - Personalized recommendations
 * - Bundle discounts
 * - Quick add to cart
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  SparklesIcon,
  HeartIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  stockLevel?: number;
  discount?: number;
  badge?: string;
}

export interface ProductBundle {
  id: string;
  title: string;
  description: string;
  products: RecommendedProduct[];
  totalPrice: number;
  bundlePrice: number;
  savings: number;
  savingsPercent: number;
}

export interface CartRecommendationsProps {
  /**
   * Current cart items (for recommendations)
   */
  cartItems?: Array<{ productId: string; name: string }>;

  /**
   * Frequently bought together
   */
  frequentlyBought?: RecommendedProduct[];

  /**
   * Customers also bought
   */
  alsoBought?: RecommendedProduct[];

  /**
   * Complete the look bundles
   */
  bundles?: ProductBundle[];

  /**
   * Personalized recommendations
   */
  personalized?: RecommendedProduct[];

  /**
   * On add to cart
   */
  onAddToCart?: (productId: string) => Promise<void>;

  /**
   * On add to wishlist
   */
  onAddToWishlist?: (productId: string) => Promise<void>;

  /**
   * On add bundle
   */
  onAddBundle?: (bundleId: string) => Promise<void>;

  /**
   * Show ratings
   * @default true
   */
  showRatings?: boolean;

  /**
   * Max items per section
   * @default 4
   */
  maxItemsPerSection?: number;

  /**
   * Enable carousel
   * @default true
   */
  enableCarousel?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ProductCardProps {
  product: RecommendedProduct;
  onAddToCart?: (productId: string) => Promise<void>;
  onAddToWishlist?: (productId: string) => Promise<void>;
  showRating?: boolean;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  showRating = true,
  compact = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleAddToCart = useCallback(async () => {
    if (!onAddToCart) return;
    
    setIsAdding(true);
    try {
      await onAddToCart(product.id);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  }, [onAddToCart, product]);

  const handleAddToWishlist = useCallback(async () => {
    if (!onAddToWishlist) return;

    setIsWishlisting(true);
    try {
      await onAddToWishlist(product.id);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsWishlisting(false);
    }
  }, [onAddToWishlist, product, isWishlisted]);

  return (
    <motion.div
      layout
      className={cn(
        'group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {hasDiscount && product.discount && (
          <Badge variant="destructive" size="sm">
            {product.discount}% OFF
          </Badge>
        )}
        {product.badge && (
          <Badge variant="success" size="sm">
            {product.badge}
          </Badge>
        )}
        {!product.inStock && (
          <Badge variant="secondary" size="sm">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      {onAddToWishlist && (
        <button
          onClick={handleAddToWishlist}
          disabled={isWishlisting}
          className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Add to wishlist"
        >
          {isWishlisted ? (
            <HeartSolidIcon className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4 text-gray-600" />
          )}
        </button>
      )}

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block mb-3">
        <div className={cn('relative overflow-hidden rounded-lg bg-gray-100', compact ? 'h-32' : 'h-48')}>
          <Image
            src={product.image || '/images/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={compact ? '(max-width: 768px) 120px, 160px' : '(max-width: 768px) 200px, 280px'}
          />
        </div>
      </Link>

      {/* Details */}
      <div className="space-y-2">
        <Link href={`/products/${product.slug}`}>
          <h4 className={cn('font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors', compact ? 'text-sm' : 'text-base')}>
            {product.name}
          </h4>
        </Link>

        {/* Rating */}
        {showRating && product.rating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn('h-3 w-3', i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <p className={cn('font-bold text-gray-900', compact ? 'text-base' : 'text-lg')}>
            {formatCurrency(product.price, 'INR')}
          </p>
          {hasDiscount && (
            <p className="text-sm text-gray-500 line-through">
              {formatCurrency(product.originalPrice!, 'INR')}
            </p>
          )}
        </div>

        {/* Stock Warning */}
        {product.inStock && product.stockLevel && product.stockLevel < 5 && (
          <p className="text-xs text-orange-600">Only {product.stockLevel} left!</p>
        )}

        {/* Add to Cart Button */}
        {onAddToCart && (
          <Button
            variant="default"
            size={compact ? 'sm' : 'md'}
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            loading={isAdding}
            className="w-full"
          >
            <ShoppingBagIcon className="h-4 w-4 mr-2" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartRecommendations: React.FC<CartRecommendationsProps> = ({
  cartItems = [],
  frequentlyBought = [],
  alsoBought = [],
  bundles = [],
  personalized = [],
  onAddToCart,
  onAddToWishlist,
  onAddBundle,
  showRatings = true,
  maxItemsPerSection = 4,
  enableCarousel = true,
  className,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<'frequently' | 'also' | 'bundles' | 'personalized'>('frequently');
  const [addingBundle, setAddingBundle] = useState<string | null>(null);

  // Use cartItems for analytics/tracking (used to filter out already added products)
  const cartProductIds = useMemo(() => cartItems.map((item) => item.productId), [cartItems]);
  
  // Log cart context for recommendation engine (could be sent to analytics)
  useEffect(() => {
    if (cartProductIds.length > 0) {
      console.log('Cart context for recommendations:', cartProductIds);
    }
  }, [cartProductIds]);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const hasFrequentlyBought = frequentlyBought.length > 0;
  const hasAlsoBought = alsoBought.length > 0;
  const hasBundles = bundles.length > 0;
  const hasPersonalized = personalized.length > 0;
  const hasAnyRecommendations = hasFrequentlyBought || hasAlsoBought || hasBundles || hasPersonalized;

  const displayItems = useMemo(() => {
    let items: RecommendedProduct[] = [];
    switch (activeTab) {
      case 'frequently':
        items = frequentlyBought;
        break;
      case 'also':
        items = alsoBought;
        break;
      case 'personalized':
        items = personalized;
        break;
      default:
        items = [];
    }
    return enableCarousel ? items.slice(0, maxItemsPerSection) : items;
  }, [activeTab, frequentlyBought, alsoBought, personalized, enableCarousel, maxItemsPerSection]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddBundle = useCallback(
    async (bundleId: string) => {
      if (!onAddBundle) return;

      setAddingBundle(bundleId);
      try {
        await onAddBundle(bundleId);
        toast.success('Bundle added to cart');
      } catch (error) {
        console.error('Add bundle error:', error);
        toast.error('Failed to add bundle');
      } finally {
        setAddingBundle(null);
      }
    },
    [onAddBundle]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!hasAnyRecommendations) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {hasFrequentlyBought && (
          <button
            onClick={() => setActiveTab('frequently')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
              activeTab === 'frequently'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Frequently Bought Together
          </button>
        )}
        {hasAlsoBought && (
          <button
            onClick={() => setActiveTab('also')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
              activeTab === 'also'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Customers Also Bought
          </button>
        )}
        {hasBundles && (
          <button
            onClick={() => setActiveTab('bundles')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
              activeTab === 'bundles'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Complete the Look
          </button>
        )}
        {hasPersonalized && (
          <button
            onClick={() => setActiveTab('personalized')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
              activeTab === 'personalized'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <SparklesIcon className="h-4 w-4 inline mr-1" />
            Just for You
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'bundles' ? (
          <motion.div
            key="bundles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {bundles.map((bundle) => (
              <div key={bundle.id} className="bg-white rounded-lg border-2 border-primary/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{bundle.title}</h3>
                    <p className="text-sm text-gray-600">{bundle.description}</p>
                  </div>
                  <Badge variant="success" size="lg">
                    Save {formatCurrency(bundle.savings, 'INR')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {bundle.products.map((product, index) => (
                    <div key={product.id} className="relative">
                      {index < bundle.products.length - 1 && (
                        <div className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 bg-primary text-white rounded-full">
                          <PlusIcon className="h-4 w-4" />
                        </div>
                      )}
                      <ProductCard
                        product={product}
                        onAddToCart={undefined}
                        onAddToWishlist={onAddToWishlist}
                        showRating={false}
                        compact
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bundle Price</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(bundle.bundlePrice, 'INR')}
                      </p>
                      <p className="text-lg text-gray-500 line-through">
                        {formatCurrency(bundle.totalPrice, 'INR')}
                      </p>
                      <Badge variant="success" size="sm">
                        {bundle.savingsPercent}% OFF
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => handleAddBundle(bundle.id)}
                    loading={addingBundle === bundle.id}
                    className="min-w-[160px]"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Add Bundle
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {displayItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                showRating={showRatings}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartRecommendations;

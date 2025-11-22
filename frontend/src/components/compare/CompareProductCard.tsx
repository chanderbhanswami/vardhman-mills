'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  ShareIcon,
  TagIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { ComparisonProduct } from '@/types/compare.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CompareProductCardProps {
  /**
   * Product data
   */
  product: ComparisonProduct;

  /**
   * Card position in comparison
   */
  position?: number;

  /**
   * Show remove button
   */
  showRemove?: boolean;

  /**
   * Show favorite button
   */
  showFavorite?: boolean;

  /**
   * Show add to cart button
   */
  showAddToCart?: boolean;

  /**
   * Show share button
   */
  showShare?: boolean;

  /**
   * Show price
   */
  showPrice?: boolean;

  /**
   * Show rating
   */
  showRating?: boolean;

  /**
   * Show availability
   */
  showAvailability?: boolean;

  /**
   * Show badges
   */
  showBadges?: boolean;

  /**
   * Show quick specs
   */
  showQuickSpecs?: boolean;

  /**
   * Highlight this card
   */
  isHighlighted?: boolean;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Callback when remove is clicked
   */
  onRemove?: () => void;

  /**
   * Callback when favorite is toggled
   */
  onToggleFavorite?: () => void;

  /**
   * Callback when add to cart is clicked
   */
  onAddToCart?: () => void;

  /**
   * Callback when share is clicked
   */
  onShare?: () => void;

  /**
   * Callback when card is clicked
   */
  onClick?: () => void;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency
 */
const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get product image
 */
const getProductImage = (product: ComparisonProduct): string => {
  if (product.product?.media?.primaryImage?.url) {
    return product.product.media.primaryImage.url;
  }
  if (product.product?.media?.images?.[0]?.url) {
    return product.product.media.images[0].url;
  }
  if (product.variant?.media?.primaryImage?.url) {
    return product.variant.media.primaryImage.url;
  }
  if (product.variant?.media?.images?.[0]?.url) {
    return product.variant.media.images[0].url;
  }
  return '/placeholder-product.png';
};

/**
 * Get product name
 */
const getProductName = (product: ComparisonProduct): string => {
  if (product.customLabel) return product.customLabel;
  if (product.variant?.name) return product.variant.name;
  if (product.product?.name) return product.product.name;
  return 'Product';
};

/**
 * Get product brand
 */
const getProductBrand = (product: ComparisonProduct): string | undefined => {
  return product.product?.brand?.name;
};

/**
 * Get product price
 */
const getProductPrice = (product: ComparisonProduct): string => {
  const price = product.comparisonContext?.priceAtComparison;
  if (price) {
    return formatCurrency(price.amount, price.currency);
  }
  if (product.product?.pricing?.basePrice) {
    return formatCurrency(
      product.product.pricing.basePrice.amount,
      product.product.pricing.basePrice.currency
    );
  }
  return 'N/A';
};

/**
 * Get sale price if available
 */
const getSalePrice = (product: ComparisonProduct): string | null => {
  if (product.product?.pricing?.salePrice) {
    return formatCurrency(
      product.product.pricing.salePrice.amount,
      product.product.pricing.salePrice.currency
    );
  }
  return null;
};

/**
 * Calculate discount percentage
 */
const getDiscountPercentage = (product: ComparisonProduct): number | null => {
  const basePrice = product.product?.pricing?.basePrice?.amount;
  const salePrice = product.product?.pricing?.salePrice?.amount;
  
  if (basePrice && salePrice && salePrice < basePrice) {
    return Math.round(((basePrice - salePrice) / basePrice) * 100);
  }
  
  return null;
};

/**
 * Get product rating
 */
const getProductRating = (product: ComparisonProduct): number => {
  return product.comparisonContext?.ratingAtComparison?.average || 
         product.product?.rating?.average || 
         0;
};

/**
 * Get review count
 */
const getReviewCount = (product: ComparisonProduct): number => {
  return product.comparisonContext?.ratingAtComparison?.count || 
         product.product?.rating?.count || 
         0;
};

/**
 * Get availability status
 */
const getAvailability = (product: ComparisonProduct): {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  message: string;
} => {
  const availability = product.comparisonContext?.availabilityAtComparison;
  
  if (availability?.includes('Out of Stock')) {
    return { status: 'out_of_stock', message: 'Out of Stock' };
  }
  
  if (availability?.includes('Low Stock')) {
    return { status: 'low_stock', message: 'Low Stock' };
  }
  
  const stockLevel = product.product?.inventory?.quantity || 0;
  
  if (stockLevel === 0) {
    return { status: 'out_of_stock', message: 'Out of Stock' };
  }
  
  if (stockLevel < 10) {
    return { status: 'low_stock', message: `Only ${stockLevel} left` };
  }
  
  return { status: 'in_stock', message: 'In Stock' };
};

/**
 * Get quick specifications
 */
const getQuickSpecs = (product: ComparisonProduct): Array<{ label: string; value: string }> => {
  const specs: Array<{ label: string; value: string }> = [];
  
  // Material
  if (product.product?.materials?.[0]) {
    specs.push({
      label: 'Material',
      value: product.product.materials[0].name,
    });
  }
  
  // Dimensions
  if (product.product?.dimensions) {
    const dim = product.product.dimensions;
    if (dim.length && dim.width) {
      specs.push({
        label: 'Size',
        value: `${dim.length}${dim.unit} × ${dim.width}${dim.unit}`,
      });
    }
  }
  
  // Weight
  if (product.product?.weight) {
    specs.push({
      label: 'Weight',
      value: `${product.product.weight.value} ${product.product.weight.unit}`,
    });
  }
  
  // GSM (for textiles)
  const gsmSpec = product.product?.specifications?.find(s => 
    s.name.toLowerCase().includes('gsm') || s.name.toLowerCase().includes('thread count')
  );
  if (gsmSpec) {
    specs.push({
      label: gsmSpec.name,
      value: gsmSpec.value,
    });
  }
  
  return specs.slice(0, 3); // Limit to 3 specs
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Star rating display
 */
interface StarRatingProps {
  rating: number;
  reviewCount: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => {
          if (index < fullStars) {
            return (
              <StarIconSolid key={index} className="h-4 w-4 text-yellow-400" />
            );
          } else if (index === fullStars && hasHalfStar) {
            return (
              <div key={index} className="relative">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <StarIconSolid
                  className="h-4 w-4 text-yellow-400 absolute top-0 left-0"
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                />
              </div>
            );
          } else {
            return (
              <StarIcon key={index} className="h-4 w-4 text-gray-300" />
            );
          }
        })}
      </div>
      <span className="text-sm text-gray-600">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CompareProductCard Component
 * 
 * Product card for comparison view with comprehensive details.
 * Features:
 * - Product image with fallback
 * - Product name, brand, and SKU
 * - Price display (original and sale)
 * - Discount badge
 * - Star rating and reviews
 * - Availability status
 * - Quick specifications
 * - Action buttons (remove, favorite, cart, share)
 * - Highlight state for best product
 * - Loading state overlay
 * - Hover effects and animations
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <CompareProductCard
 *   product={comparisonProduct}
 *   position={0}
 *   showRemove={true}
 *   showAddToCart={true}
 *   onRemove={handleRemove}
 *   onAddToCart={handleAddToCart}
 * />
 * ```
 */
export const CompareProductCard: React.FC<CompareProductCardProps> = ({
  product,
  position,
  showRemove = true,
  showFavorite = true,
  showAddToCart = true,
  showShare = false,
  showPrice = true,
  showRating = true,
  showAvailability = true,
  showBadges = true,
  showQuickSpecs = true,
  isHighlighted: propIsHighlighted,
  isLoading = false,
  onRemove,
  onToggleFavorite,
  onAddToCart,
  onShare,
  onClick,
  animated = true,
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);
  
  const isHighlighted = propIsHighlighted !== undefined 
    ? propIsHighlighted 
    : product.isHighlighted;
  
  const availability = getAvailability(product);
  const discountPercentage = getDiscountPercentage(product);
  const salePrice = getSalePrice(product);
  const rating = getProductRating(product);
  const reviewCount = getReviewCount(product);
  const quickSpecs = getQuickSpecs(product);

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position ? position * 0.1 : 0 }}
      className={cn('relative', className)}
    >
      <Card
        className={cn(
          'h-full overflow-hidden transition-all duration-300',
          isHighlighted && 'ring-2 ring-primary-500 shadow-xl',
          onClick && 'cursor-pointer hover:shadow-lg'
        )}
        onClick={onClick}
      >
        {/* Highlighted badge */}
        {isHighlighted && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="warning" className="shadow-md">
              <StarIconSolid className="h-3 w-3 mr-1" />
              {product.highlightReason || 'Best Choice'}
            </Badge>
          </div>
        )}

        {/* Remove button */}
        {showRemove && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={isLoading}
            className={cn(
              'absolute top-3 right-3 z-10',
              'w-8 h-8 bg-white rounded-full shadow-md',
              'flex items-center justify-center',
              'hover:bg-red-50 hover:text-red-600 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Remove from comparison"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}

        <CardContent className="p-4">
          {/* Image section */}
          <div className="relative aspect-square mb-4 bg-gray-50 rounded-lg overflow-hidden">
            {!imageError ? (
              <Image
                src={getProductImage(product)}
                alt={getProductName(product)}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TagIcon className="h-24 w-24 text-gray-300" />
              </div>
            )}

            {/* Discount badge */}
            {showBadges && discountPercentage && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive">-{discountPercentage}%</Badge>
              </div>
            )}

            {/* Favorite button */}
            {showFavorite && onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                disabled={isLoading}
                className={cn(
                  'absolute bottom-2 right-2',
                  'w-9 h-9 bg-white rounded-full shadow-md',
                  'flex items-center justify-center',
                  'hover:bg-red-50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label={product.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {product.isFavorite ? (
                  <HeartIconSolid className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-3">
            {/* Brand */}
            {getProductBrand(product) && (
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {getProductBrand(product)}
              </div>
            )}

            {/* Product name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
              {getProductName(product)}
            </h3>

            {/* Rating */}
            {showRating && rating > 0 && (
              <StarRating rating={rating} reviewCount={reviewCount} />
            )}

            {/* Price */}
            {showPrice && (
              <div className="flex items-baseline gap-2">
                {salePrice ? (
                  <>
                    <span className="text-xl font-bold text-primary-600">
                      {salePrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {getProductPrice(product)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-gray-900">
                    {getProductPrice(product)}
                  </span>
                )}
              </div>
            )}

            {/* Availability */}
            {showAvailability && (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    availability.status === 'in_stock' && 'bg-green-500',
                    availability.status === 'low_stock' && 'bg-yellow-500',
                    availability.status === 'out_of_stock' && 'bg-red-500'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    availability.status === 'in_stock' && 'text-green-600',
                    availability.status === 'low_stock' && 'text-yellow-600',
                    availability.status === 'out_of_stock' && 'text-red-600'
                  )}
                >
                  {availability.message}
                </span>
              </div>
            )}

            {/* Quick specs */}
            {showQuickSpecs && quickSpecs.length > 0 && (
              <div className="pt-3 border-t border-gray-200 space-y-2">
                {quickSpecs.map((spec, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{spec.label}:</span>
                    <span className="text-gray-900 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Features badges */}
            {showBadges && (
              <div className="flex flex-wrap gap-2">
                {product.product?.warranty && (
                  <Badge variant="outline" className="text-xs">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    Warranty
                  </Badge>
                )}
                {product.product?.isFeatured && (
                  <Badge variant="outline" className="text-xs">
                    <StarIconSolid className="h-3 w-3 mr-1 text-yellow-500" />
                    Featured
                  </Badge>
                )}
              </div>
            )}

            {/* User notes */}
            {product.userNotes && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="flex items-start gap-2">
                  <InformationCircleIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-800">{product.userNotes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Actions footer */}
        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          {/* Add to cart */}
          {showAddToCart && onAddToCart && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={isLoading || availability.status === 'out_of_stock'}
              className="w-full"
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          )}

          {/* Share button */}
          {showShare && onShare && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </CardFooter>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default CompareProductCard;
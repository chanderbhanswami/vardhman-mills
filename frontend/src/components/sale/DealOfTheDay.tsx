'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  TagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { Price } from '@/types/common.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DealOfTheDayProps {
  /**
   * Product details
   */
  product: DealProduct;

  /**
   * Deal end time
   */
  dealEndsAt: Date | string;

  /**
   * Display variant
   * - default: Full card layout
   * - compact: Minimal layout
   * - hero: Large hero layout
   */
  variant?: 'default' | 'compact' | 'hero';

  /**
   * Show countdown timer
   */
  showTimer?: boolean;

  /**
   * Show quantity remaining
   */
  showQuantity?: boolean;

  /**
   * Show delivery info
   */
  showDeliveryInfo?: boolean;

  /**
   * Show features list
   */
  showFeatures?: boolean;

  /**
   * Callback when deal is clicked
   */
  onClick?: () => void;

  /**
   * Callback when "Shop Now" is clicked
   */
  onShopNow?: () => void;

  /**
   * Callback when timer expires
   */
  onTimerExpire?: () => void;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Deal product interface
 */
export interface DealProduct {
  id: string;
  name: string;
  description?: string;
  image: string;
  originalPrice: Price;
  dealPrice: Price;
  discountPercentage: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  quantityAvailable?: number;
  features?: string[];
  freeDelivery?: boolean;
  warranty?: string;
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
 * Calculate time remaining
 */
const calculateTimeRemaining = (endDate: Date | string): string => {
  const now = new Date().getTime();
  const end = typeof endDate === 'string' ? new Date(endDate).getTime() : endDate.getTime();
  const diff = end - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }

  return `${hours}h ${minutes}m left`;
};

/**
 * Get quantity color
 */
const getQuantityColor = (quantity: number, total: number = 100): string => {
  const percentage = (quantity / total) * 100;
  if (percentage <= 10) return 'text-red-600';
  if (percentage <= 30) return 'text-primary-600';
  return 'text-green-600';
};

/**
 * Render star rating
 */
const renderStarRating = (rating: number): React.ReactNode => {
  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={index}
      className={cn(
        'text-lg',
        index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
      )}
    >
      ★
    </span>
  ));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DealOfTheDay Component
 * 
 * Daily deal showcase component with featured product display.
 * Features:
 * - Multiple display variants
 * - Special pricing display
 * - Countdown timer integration
 * - Limited quantity indicator
 * - Product features list
 * - Delivery information
 * - Rating and reviews
 * - Image with fallback
 * - Call-to-action buttons
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <DealOfTheDay
 *   product={dealProduct}
 *   dealEndsAt={endDate}
 *   variant="hero"
 *   showTimer={true}
 *   showQuantity={true}
 *   onShopNow={() => navigate(`/products/${product.id}`)}
 * />
 * ```
 */
export const DealOfTheDay: React.FC<DealOfTheDayProps> = ({
  product,
  dealEndsAt,
  variant = 'default',
  showTimer = true,
  showQuantity = true,
  showDeliveryInfo = true,
  showFeatures = true,
  onClick,
  onShopNow,
  animated = true,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(calculateTimeRemaining(dealEndsAt));

  // Update timer every minute
  React.useEffect(() => {
    if (!showTimer) return;

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(dealEndsAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dealEndsAt, showTimer]);

  const cardVariants = {
    hover: { scale: animated ? 1.02 : 1, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className={cn('cursor-pointer')}
        onClick={onClick}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image */}
              <div className="relative w-24 h-24 flex-shrink-0">
                {!imageError ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="96px"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <TagIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-1 left-1">
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                    -{product.discountPercentage}%
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <SparklesIcon className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-yellow-600 uppercase">
                    Deal of the Day
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 truncate mb-2">{product.name}</h4>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(product.dealPrice.amount, product.dealPrice.currency)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.originalPrice.amount, product.originalPrice.currency)}
                  </span>
                </div>

                {showTimer && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <FireIcon className="h-3 w-3" />
                    <span>{timeRemaining}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Hero variant
  if (variant === 'hero') {
    return (
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className={cn('cursor-pointer')}
        onClick={onClick}
      >
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative h-96 md:h-auto bg-gradient-to-br from-primary-100 to-primary-50">
              {!imageError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TagIcon className="h-32 w-32 text-gray-300" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge variant="warning" className="shadow-lg">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  Deal of the Day
                </Badge>
                <Badge variant="destructive" className="text-xl px-4 py-2 shadow-lg">
                  {product.discountPercentage}% OFF
                </Badge>
              </div>

              {/* Timer */}
              {showTimer && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">Ends In:</span>
                      </div>
                      <span className="text-lg font-bold text-red-600">{timeRemaining}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <CardContent className="p-8 flex flex-col justify-center">
              <div className="space-y-6">
                {/* Category */}
                {product.category && (
                  <Badge variant="outline" className="w-fit">
                    {product.category}
                  </Badge>
                )}

                {/* Title */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                  {product.description && (
                    <p className="text-gray-600">{product.description}</p>
                  )}
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStarRating(product.rating)}</div>
                    {product.reviewCount && (
                      <span className="text-sm text-gray-500">
                        ({product.reviewCount.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-4xl font-bold text-primary-600">
                      {formatCurrency(product.dealPrice.amount, product.dealPrice.currency)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatCurrency(product.originalPrice.amount, product.originalPrice.currency)}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    You Save: {formatCurrency(
                      product.originalPrice.amount - product.dealPrice.amount,
                      product.dealPrice.currency
                    )}{' '}
                    ({product.discountPercentage}%)
                  </p>
                </div>

                {/* Quantity */}
                {showQuantity && product.quantityAvailable !== undefined && (
                  <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        getQuantityColor(product.quantityAvailable)
                      )}
                    >
                      ⚡ Only {product.quantityAvailable} left in stock - Order now!
                    </p>
                  </div>
                )}

                {/* Features */}
                {showFeatures && product.features && product.features.length > 0 && (
                  <ul className="space-y-2">
                    {product.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Delivery Info */}
                {showDeliveryInfo && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    {product.freeDelivery && (
                      <div className="flex items-center gap-2 text-green-600">
                        <TruckIcon className="h-5 w-5" />
                        <span className="font-medium">Free Delivery</span>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="flex items-center gap-2 text-primary-600">
                        <ShieldCheckIcon className="h-5 w-5" />
                        <span className="font-medium">{product.warranty} Warranty</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                <Button
                  size="lg"
                  className="w-full text-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShopNow?.();
                  }}
                >
                  Shop Now - Limited Time Offer
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={cn('cursor-pointer')}
      onClick={onClick}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-5 gap-6">
            {/* Image */}
            <div className="md:col-span-2">
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg overflow-hidden">
                {!imageError ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TagIcon className="h-24 w-24 text-gray-300" />
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <Badge variant="warning" className="shadow-md">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    Deal of the Day
                  </Badge>
                </div>

                <div className="absolute top-3 right-3">
                  <Badge variant="destructive" className="text-lg px-3 py-1.5 shadow-md">
                    -{product.discountPercentage}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-3 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Category */}
                {product.category && (
                  <Badge variant="outline">{product.category}</Badge>
                )}

                {/* Title */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  )}
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStarRating(product.rating)}</div>
                    {product.reviewCount && (
                      <span className="text-sm text-gray-500">
                        ({product.reviewCount.toLocaleString()})
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-primary-600">
                      {formatCurrency(product.dealPrice.amount, product.dealPrice.currency)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(product.originalPrice.amount, product.originalPrice.currency)}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    Save {formatCurrency(
                      product.originalPrice.amount - product.dealPrice.amount,
                      product.dealPrice.currency
                    )}
                  </p>
                </div>

                {/* Timer */}
                {showTimer && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <FireIcon className="h-5 w-5 text-red-600 animate-pulse" />
                    <span className="text-sm font-semibold text-red-600">{timeRemaining}</span>
                  </div>
                )}

                {/* Quantity */}
                {showQuantity && product.quantityAvailable !== undefined && (
                  <p
                    className={cn(
                      'text-sm font-medium',
                      getQuantityColor(product.quantityAvailable)
                    )}
                  >
                    {product.quantityAvailable} units left
                  </p>
                )}

                {/* Features */}
                {showFeatures && product.features && product.features.length > 0 && (
                  <ul className="space-y-1.5">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Delivery */}
                {showDeliveryInfo && (
                  <div className="flex flex-wrap gap-3 text-sm">
                    {product.freeDelivery && (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <TruckIcon className="h-4 w-4" />
                        <span>Free Delivery</span>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <ShieldCheckIcon className="h-4 w-4" />
                        <span>{product.warranty} Warranty</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShopNow?.();
                  }}
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DealOfTheDay;

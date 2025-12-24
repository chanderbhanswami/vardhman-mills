/**
 * ProductCarousel Component
 * 
 * Touch-enabled product carousel with drag navigation and auto-play.
 * 
 * Features:
 * - Touch/drag navigation with Framer Motion
 * - Auto-play with configurable interval
 * - Navigation arrows (prev/next)
 * - Dot indicators for slide position
 * - Play/pause button
 * - Infinite loop support
 * - Pause on hover/interaction
 * - Responsive breakpoints (1/2/3/4 items per view)
 * - Keyboard navigation (arrow keys)
 * - Smooth spring animations
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  HeartIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProductCarouselProps {
  /** Array of products to display */
  products: Product[];
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
  /** Enable auto-play on mount */
  autoPlay?: boolean;
  /** Enable infinite loop */
  loop?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show play/pause button */
  showPlayPause?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On product click handler */
  onProductClick?: (product: Product) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DRAG_THRESHOLD = 50;
const AUTO_PLAY_INTERVAL = 5000;

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  autoPlayInterval = AUTO_PLAY_INTERVAL,
  autoPlay = true,
  loop = true,
  showArrows = true,
  showDots = true,
  showPlayPause = true,
  className,
  onProductClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [itemsVisible, setItemsVisible] = useState(1);

  // ============================================================================
  // REFS & MOTION VALUES
  // ============================================================================

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePrev = useCallback(() => {
    if (loop) {
      setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
    } else {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
    setIsPaused(true);
    console.log('Previous slide navigation');
  }, [loop, products.length]);

  const handleNext = useCallback(() => {
    if (loop) {
      setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    } else {
      setCurrentIndex((prev) => Math.min(products.length - 1, prev + 1));
    }
    setIsPaused(true);
    console.log('Next slide navigation');
  }, [loop, products.length]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setIsPaused(true);
  }, []);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const offset = info.offset.x;

      if (Math.abs(offset) > DRAG_THRESHOLD) {
        if (offset > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    },
    [handlePrev, handleNext]
  );

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev: boolean) => !prev);
    console.log('Auto-play toggled:', x.get(), controls);
  }, [x, controls]);

  const handleMouseEnter = useCallback(() => {
    if (isAutoPlaying) {
      setIsPaused(true);
    }
  }, [isAutoPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (isAutoPlaying) {
      setIsPaused(false);
    }
  }, [isAutoPlaying]);

  const handleProductClick = useCallback(
    (product: Product) => {
      if (onProductClick) {
        onProductClick(product);
      }
    },
    [onProductClick]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Responsive breakpoints
  useEffect(() => {
    const updateItemsVisible = () => {
      if (window.innerWidth >= 1280) {
        setItemsVisible(4);
      } else if (window.innerWidth >= 1024) {
        setItemsVisible(3);
      } else if (window.innerWidth >= 640) {
        setItemsVisible(2);
      } else {
        setItemsVisible(1);
      }
    };

    updateItemsVisible();
    window.addEventListener('resize', updateItemsVisible);

    return () => window.removeEventListener('resize', updateItemsVisible);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused || isDragging) return;

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, isDragging, autoPlayInterval, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const translateX = -(currentIndex * (100 / itemsVisible));
  const canGoPrev = loop || currentIndex > 0;
  const canGoNext = loop || currentIndex < products.length - itemsVisible;

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No products available
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative group', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={{ x: `${translateX}%` }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
          style={{ x }}
        >
          {products.map((product, index) => {
            if (!product) return null;
            const basePrice = product.pricing?.basePrice?.amount || 0;
            const salePrice = product.pricing?.salePrice?.amount;
            const hasDiscount = salePrice && salePrice < basePrice;
            const discountPercent = hasDiscount
              ? Math.round(((basePrice - salePrice!) / basePrice) * 100)
              : 0;
            const itemWidth = 100 / itemsVisible;
            console.log('Rendering product card:', product.id, 'width:', itemWidth);

            return (
              <div
                key={product.id || `company-fav-${index}`}
                className="flex-shrink-0 px-2"
                {...(itemWidth ? { style: { width: `${itemWidth}%` } } : {})}
              >
                <Link
                  href={`/products/${product.slug}`}
                  onClick={() => handleProductClick(product)}
                  className="block"
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring' as const, stiffness: 400 }}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <Image
                        src={product.media?.images?.[0]?.url || '/images/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {product.isFeatured && (
                          <Badge variant="default" size="sm" className="bg-yellow-500 text-white">
                            Featured
                          </Badge>
                        )}
                        {product.isNewArrival && (
                          <Badge variant="default" size="sm" className="bg-green-600 text-white">
                            New
                          </Badge>
                        )}
                        {hasDiscount && (
                          <Badge variant="default" size="sm" className="bg-red-600 text-white">
                            -{discountPercent}%
                          </Badge>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm"
                        >
                          <HeartIcon className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm"
                        >
                          <ShoppingCartIcon className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Category */}
                      {product.category && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          {product.category.name}
                        </p>
                      )}

                      {/* Name */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(salePrice || basePrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(basePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            );

          })}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full',
              'bg-white/90 backdrop-blur-sm shadow-lg',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              !canGoPrev && 'opacity-0 cursor-not-allowed'
            )}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full',
              'bg-white/90 backdrop-blur-sm shadow-lg',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              !canGoNext && 'opacity-0 cursor-not-allowed'
            )}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(products.length / itemsVisible) }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentIndex === index
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Play/Pause Button */}
      {showPlayPause && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAutoPlay}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg"
        >
          {isAutoPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </Button>
      )}
    </div>
  );
};

export default ProductCarousel;

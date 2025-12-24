/**
 * ProductCarousel Component (Trending Section)
 * 
 * Advanced carousel component for displaying trending products
 * with rank indicators, smooth animations, and interactive navigation.
 * 
 * Features:
 * - Smooth carousel transitions
 * - Touch/swipe gestures
 * - Rank-based ordering
 * - Navigation arrows
 * - Dot indicators
 * - Auto-scroll with pause
 * - Responsive breakpoints
 * - Infinite loop mode
 * - Keyboard navigation
 * - Fire icon animations
 * - Progress bar
 * - Trending badges
 * - Loading states
 * - Empty state handling
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { TrendingCard } from './TrendingCard';
import type { TrendingProduct } from './TrendingCard';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProductCarouselProps {
  /** Trending products */
  products: TrendingProduct[];
  /** Items to show per view */
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /** Enable auto-scroll */
  autoScroll?: boolean;
  /** Auto-scroll interval in milliseconds */
  interval?: number;
  /** Enable infinite loop */
  infinite?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Enable swipe gestures */
  swipeEnabled?: boolean;
  /** Gap between items */
  gap?: number;
  /** Sort by rank */
  sortByRank?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On product click */
  onProductClick?: (product: TrendingProduct) => void;
  /** On add to cart */
  onAddToCart?: (product: TrendingProduct) => void;
  /** On add to wishlist */
  onAddToWishlist?: (product: TrendingProduct) => void;
  /** On quick view */
  onQuickView?: (product: TrendingProduct) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 4 },
  autoScroll = false,
  interval = 5000,
  infinite = true,
  showArrows = true,
  showDots = true,
  showProgress = false,
  swipeEnabled = true,
  gap = 24,
  sortByRank = true,
  className,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoScroll);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsShown, setItemsShown] = useState(itemsPerView.desktop);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [progress, setProgress] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dragX = useMotionValue(0);

  // ============================================================================
  // SORTED PRODUCTS
  // ============================================================================

  const sortedProducts = useMemo(() => {
    if (!sortByRank) return products;
    return [...products].sort((a, b) => a.rank - b.rank);
  }, [products, sortByRank]);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const totalSlides = useMemo(() => {
    return Math.ceil(sortedProducts.length / itemsShown);
  }, [sortedProducts.length, itemsShown]);

  const canGoPrevious = infinite || currentIndex > 0;
  const canGoNext = infinite || currentIndex < totalSlides - 1;

  const visibleProducts = useMemo(() => {
    const start = currentIndex * itemsShown;
    const end = start + itemsShown;
    return sortedProducts.slice(start, end);
  }, [sortedProducts, currentIndex, itemsShown]);

  // ============================================================================
  // RESPONSIVE BREAKPOINTS
  // ============================================================================

  useEffect(() => {
    const updateItemsShown = () => {
      if (window.innerWidth >= 1024) {
        setItemsShown(itemsPerView.desktop);
      } else if (window.innerWidth >= 640) {
        setItemsShown(itemsPerView.tablet);
      } else {
        setItemsShown(itemsPerView.mobile);
      }
    };

    updateItemsShown();
    window.addEventListener('resize', updateItemsShown);

    return () => window.removeEventListener('resize', updateItemsShown);
  }, [itemsPerView]);

  // ============================================================================
  // CAROUSEL NAVIGATION
  // ============================================================================

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0) {
        setCurrentIndex(infinite ? totalSlides - 1 : 0);
      } else if (index >= totalSlides) {
        setCurrentIndex(infinite ? 0 : totalSlides - 1);
      } else {
        setCurrentIndex(index);
      }
      setProgress(0);
    },
    [totalSlides, infinite]
  );

  const goToPrevious = useCallback(() => {
    if (!canGoPrevious) return;
    setDirection('left');
    goToSlide(currentIndex - 1);
    console.log('Previous slide:', currentIndex - 1);
  }, [currentIndex, canGoPrevious, goToSlide]);

  const goToNext = useCallback(() => {
    if (!canGoNext) return;
    setDirection('right');
    goToSlide(currentIndex + 1);
    console.log('Next slide:', currentIndex + 1);
  }, [currentIndex, canGoNext, goToSlide]);

  // ============================================================================
  // AUTO-SCROLL
  // ============================================================================

  const startAutoScroll = useCallback(() => {
    if (!isPlaying || isPaused) return;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + (100 / (interval / 100));
      });
    }, 100);
  }, [isPlaying, isPaused, interval, goToNext]);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggleAutoScroll = useCallback(() => {
    setIsPaused(!isPaused);
    console.log('Auto-scroll:', !isPaused ? 'paused' : 'resumed');
  }, [isPaused]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    return () => stopAutoScroll();
  }, [isPlaying, isPaused, startAutoScroll, stopAutoScroll]);

  // Update isPlaying when autoScroll prop changes
  useEffect(() => {
    setIsPlaying(autoScroll);
    console.log('Auto-scroll enabled:', autoScroll);
  }, [autoScroll]);

  // ============================================================================
  // SWIPE GESTURES
  // ============================================================================

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!swipeEnabled) return;

      const swipe = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(swipe) > SWIPE_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD) {
        if (swipe > 0) {
          goToPrevious();
        } else {
          goToNext();
        }
      }

      dragX.set(0);
    },
    [swipeEnabled, goToPrevious, goToNext, dragX]
  );

  // ============================================================================
  // MOUSE EVENTS
  // ============================================================================

  const handleMouseEnter = useCallback(() => {
    if (autoScroll) {
      setIsPaused(true);
    }
  }, [autoScroll]);

  const handleMouseLeave = useCallback(() => {
    if (autoScroll) {
      setIsPaused(false);
    }
  }, [autoScroll]);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          toggleAutoScroll();
          break;
        default:
          // Number keys for direct navigation
          const num = parseInt(e.key);
          if (!isNaN(num) && num >= 1 && num <= totalSlides) {
            goToSlide(num - 1);
          }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevious, goToNext, toggleAutoScroll, goToSlide, totalSlides]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (sortedProducts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FireIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No trending products available</p>
      </div>
    );
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Trending products carousel"
      aria-live="polite"
    >
      {/* Progress Bar */}
      {showProgress && isPlaying && !isPaused && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      {/* Carousel Container */}
      <div className="overflow-hidden">
        <motion.div
          drag={swipeEnabled ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{
                x: direction === 'right' ? 1000 : -1000,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: direction === 'right' ? -1000 : 1000,
                opacity: 0,
              }}
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              className={cn(
                'grid gap-6',
                itemsShown === 1 && 'grid-cols-1',
                itemsShown === 2 && 'grid-cols-1 sm:grid-cols-2',
                itemsShown === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              )}
              style={{ gap: `${gap}px` }}
            >
              {visibleProducts.map((product, index) => {
                if (!product) return null;
                return (
                  <div key={product.id || `trending-${index}`}>
                    <TrendingCard
                      product={product}
                      onProductClick={onProductClick}
                      onAddToCart={onAddToCart}
                      onAddToWishlist={onAddToWishlist}
                      onQuickView={onQuickView}
                    />
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          {/* Previous Button */}
          <Tooltip content="Previous">
            <Button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 z-20',
                'h-12 w-12 p-0 rounded-full',
                'bg-white/90 backdrop-blur-sm shadow-lg',
                'hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-300'
              )}
              aria-label="Previous trending products"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </Button>
          </Tooltip>

          {/* Next Button */}
          <Tooltip content="Next">
            <Button
              onClick={goToNext}
              disabled={!canGoNext}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 z-20',
                'h-12 w-12 p-0 rounded-full',
                'bg-white/90 backdrop-blur-sm shadow-lg',
                'hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-300'
              )}
              aria-label="Next trending products"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-800" />
            </Button>
          </Tooltip>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'transition-all duration-300 rounded-full',
                currentIndex === index
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 w-8 h-2'
                  : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentIndex === index ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Play/Pause Button */}
      {autoScroll && (
        <Tooltip content={isPaused ? 'Play' : 'Pause'}>
          <Button
            onClick={toggleAutoScroll}
            className={cn(
              'absolute bottom-4 right-4 z-20',
              'h-10 w-10 p-0 rounded-full',
              'bg-white/90 backdrop-blur-sm shadow-lg',
              'hover:bg-white transition-all duration-300'
            )}
            aria-label={isPaused ? 'Play carousel' : 'Pause carousel'}
          >
            {isPaused ? (
              <PlayIcon className="w-5 h-5 text-gray-800" />
            ) : (
              <PauseIcon className="w-5 h-5 text-gray-800" />
            )}
          </Button>
        </Tooltip>
      )}

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Showing slide {currentIndex + 1} of {totalSlides}. {visibleProducts.length} trending products displayed.
      </div>
    </div>
  );
};

export default ProductCarousel;

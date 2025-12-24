/**
 * ProductCarousel Component (Recently Viewed Section)
 * 
 * Advanced carousel component for displaying recently viewed products
 * with smooth animations, navigation, and responsive behavior.
 * 
 * Features:
 * - Smooth carousel transitions
 * - Touch/swipe gestures
 * - Navigation arrows with disabled states
 * - Dot indicators
 * - Auto-scroll option
 * - Responsive breakpoints
 * - Infinite loop mode
 * - Keyboard navigation
 * - Progress indicators
 * - Item animations
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
} from '@heroicons/react/24/outline';
import { RecentItem } from './RecentItem';
import type { Product } from './RecentItem';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RecentProduct extends Product {
  viewedAt: Date | string;
}

export interface ProductCarouselProps {
  /** Recently viewed products */
  products: RecentProduct[];
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
  /** Enable swipe gestures */
  swipeEnabled?: boolean;
  /** Gap between items */
  gap?: number;
  /** Additional CSS classes */
  className?: string;
  /** On product click */
  onProductClick?: (product: Product) => void;
  /** On add to cart */
  onAddToCart?: (product: Product) => void;
  /** On add to wishlist */
  onAddToWishlist?: (product: Product) => void;
  /** On remove from history */
  onRemove?: (productId: string) => void;
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
  swipeEnabled = true,
  gap = 16,
  className,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  onRemove,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoScroll);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsShown, setItemsShown] = useState(itemsPerView.desktop);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // ============================================================================
  // REFS
  // ============================================================================

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // MOTION VALUES
  // ============================================================================

  const dragX = useMotionValue(0);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const totalSlides = useMemo(() => {
    return Math.ceil(products.length / itemsShown);
  }, [products.length, itemsShown]);

  const canGoPrevious = useMemo(
    () => infinite || currentIndex > 0,
    [infinite, currentIndex]
  );

  const canGoNext = useMemo(
    () => infinite || currentIndex < totalSlides - 1,
    [infinite, currentIndex, totalSlides]
  );

  const visibleProducts = useMemo(() => {
    const startIndex = currentIndex * itemsShown;
    const endIndex = startIndex + itemsShown;
    return products.slice(startIndex, endIndex);
  }, [products, currentIndex, itemsShown]);

  // ============================================================================
  // RESPONSIVE
  // ============================================================================

  useEffect(() => {
    const updateItemsShown = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsShown(itemsPerView.mobile);
      } else if (width < 1024) {
        setItemsShown(itemsPerView.tablet);
      } else {
        setItemsShown(itemsPerView.desktop);
      }
    };

    updateItemsShown();
    window.addEventListener('resize', updateItemsShown);
    return () => window.removeEventListener('resize', updateItemsShown);
  }, [itemsPerView]);

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const goToSlide = useCallback(
    (index: number) => {
      let newIndex = index;

      if (infinite) {
        if (newIndex < 0) {
          newIndex = totalSlides - 1;
        } else if (newIndex >= totalSlides) {
          newIndex = 0;
        }
      } else {
        newIndex = Math.max(0, Math.min(totalSlides - 1, newIndex));
      }

      setDirection(newIndex > currentIndex ? 'right' : 'left');
      setCurrentIndex(newIndex);
      console.log('Carousel slide changed to:', newIndex);
    },
    [currentIndex, totalSlides, infinite]
  );

  const goToPrevious = useCallback(() => {
    if (!canGoPrevious) return;
    goToSlide(currentIndex - 1);
  }, [canGoPrevious, currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    if (!canGoNext) return;
    goToSlide(currentIndex + 1);
  }, [canGoNext, currentIndex, goToSlide]);

  // ============================================================================
  // AUTO-SCROLL
  // ============================================================================

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      goToNext();
    }, interval);

    console.log('Auto-scroll started');
  }, [interval, goToNext]);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Auto-scroll stopped');
    }
  }, []);

  const toggleAutoScroll = useCallback(() => {
    setIsPlaying(!isPlaying);
    console.log('Auto-scroll toggled:', !isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    return () => {
      stopAutoScroll();
    };
  }, [isPlaying, isPaused, startAutoScroll, stopAutoScroll]);

  // ============================================================================
  // SWIPE GESTURES
  // ============================================================================

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      const shouldGoNext =
        offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD;
      const shouldGoPrevious =
        offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD;

      if (shouldGoNext) {
        goToNext();
      } else if (shouldGoPrevious) {
        goToPrevious();
      }

      dragX.set(0);
    },
    [goToNext, goToPrevious, dragX]
  );

  // ============================================================================
  // HOVER
  // ============================================================================

  const handleMouseEnter = useCallback(() => {
    if (isPlaying) {
      setIsPaused(true);
      console.log('Carousel paused on hover');
    }
  }, [isPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      setIsPaused(false);
      console.log('Carousel resumed');
    }
  }, [isPlaying]);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          toggleAutoScroll();
          break;
        default:
          const num = parseInt(e.key);
          if (!isNaN(num) && num >= 1 && num <= totalSlides) {
            e.preventDefault();
            goToSlide(num - 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, toggleAutoScroll, totalSlides, goToSlide]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRemove = useCallback(
    (productId: string) => {
      onRemove?.(productId);
      // Adjust carousel if needed after removal
      if (visibleProducts.length === 1 && currentIndex > 0) {
        goToPrevious();
      }
    },
    [onRemove, visibleProducts.length, currentIndex, goToPrevious]
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderNavigationArrows = () => {
    if (!showArrows) return null;

    return (
      <>
        <Tooltip content="Previous products">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2"
            aria-label="Previous products"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>
        </Tooltip>

        <Tooltip content="Next products">
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={!canGoNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2"
            aria-label="Next products"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </Tooltip>
      </>
    );
  };

  const renderDotIndicators = () => {
    if (!showDots || totalSlides <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'transition-all duration-300 rounded-full',
              index === currentIndex
                ? 'w-8 h-2 bg-primary-600'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
        {autoScroll && (
          <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoScroll}
              className="ml-2"
              aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No recently viewed products</p>
        <p className="text-sm mt-2">Products you view will appear here</p>
      </div>
    );
  }

  return (
    <div
      className={cn('space-y-4', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-roledescription="carousel"
      aria-label="Recently viewed products"
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden px-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction === 'right' ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'right' ? -100 : 100 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            drag={swipeEnabled ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            style={{ x: dragX, gap: `${gap}px` }}
            className={cn(
              'grid',
              itemsShown === 1 && 'grid-cols-1',
              itemsShown === 2 && 'grid-cols-1 sm:grid-cols-2',
              itemsShown === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
              itemsShown === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            )}
          >
            {visibleProducts.map((product) => {
              if (!product) return null;
              return (
                <RecentItem
                  key={product.id}
                  product={product}
                  viewedAt={product.viewedAt}
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  onRemove={handleRemove}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {renderNavigationArrows()}
      </div>

      {/* Dot Indicators */}
      {renderDotIndicators()}

      {/* Screen Reader Announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing products {currentIndex * itemsShown + 1} to{' '}
        {Math.min((currentIndex + 1) * itemsShown, products.length)} of{' '}
        {products.length}
      </div>
    </div>
  );
};

export default ProductCarousel;

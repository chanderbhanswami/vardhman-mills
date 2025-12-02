/**
 * ProductCarousel Component (NewArrivals)
 * 
 * Touch-enabled carousel for displaying new arrival products with smooth
 * animations, auto-play, and responsive navigation.
 * 
 * Features:
 * - Touch/drag gestures
 * - Mouse drag support
 * - Responsive breakpoints
 * - Auto-play with pause on hover
 * - Navigation arrows
 * - Dot indicators
 * - Thumbnail preview
 * - Infinite loop
 * - Custom transition speeds
 * - Smooth momentum scrolling
 * - Product quick view
 * - Loading states
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { NewArrivalsCard } from './NewArrivalsCard';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProductCarouselProps {
  /** Products to display */
  products: Product[];
  /** Items to show per view */
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /** Gap between items in pixels */
  gap?: number;
  /** Auto-play enabled */
  autoPlay?: boolean;
  /** Auto-play interval in milliseconds */
  interval?: number;
  /** Enable infinite loop */
  infinite?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Enable drag/swipe */
  draggable?: boolean;
  /** Carousel title */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DRAG_THRESHOLD = 50;
const DRAG_VELOCITY_THRESHOLD = 500;

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 4 },
  gap = 24,
  autoPlay = false,
  interval = 5000,
  infinite = true,
  showArrows = true,
  showDots = true,
  draggable = true,
  title,
  className,
  isLoading = false,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsShown, setItemsShown] = useState(itemsPerView.desktop);
  const [containerWidth, setContainerWidth] = useState(0);

  // ============================================================================
  // REFS
  // ============================================================================

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // MOTION VALUES
  // ============================================================================

  const dragX = useMotionValue(0);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const totalItems = useMemo(() => products.length, [products.length]);

  const maxIndex = useMemo(() => {
    return Math.max(0, totalItems - itemsShown);
  }, [totalItems, itemsShown]);

  const canGoPrevious = useMemo(() => {
    return infinite || currentIndex > 0;
  }, [infinite, currentIndex]);

  const canGoNext = useMemo(() => {
    return infinite || currentIndex < maxIndex;
  }, [infinite, currentIndex, maxIndex]);

  const itemWidth = useMemo(() => {
    if (containerWidth === 0) return 0;
    return (containerWidth - gap * (itemsShown - 1)) / itemsShown;
  }, [containerWidth, gap, itemsShown]);

  const translateX = useMemo(() => {
    return -(currentIndex * (itemWidth + gap));
  }, [currentIndex, itemWidth, gap]);

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
  // CONTAINER WIDTH
  // ============================================================================

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const goToIndex = useCallback(
    (index: number) => {
      let newIndex = index;

      if (infinite) {
        if (newIndex < 0) {
          newIndex = maxIndex;
        } else if (newIndex > maxIndex) {
          newIndex = 0;
        }
      } else {
        newIndex = Math.max(0, Math.min(maxIndex, newIndex));
      }

      setCurrentIndex(newIndex);
      console.log('Carousel index:', newIndex);
    },
    [maxIndex, infinite]
  );

  const goToPrevious = useCallback(() => {
    if (!canGoPrevious) return;
    goToIndex(currentIndex - 1);
  }, [canGoPrevious, currentIndex, goToIndex]);

  const goToNext = useCallback(() => {
    if (!canGoNext) return;
    goToIndex(currentIndex + 1);
  }, [canGoNext, currentIndex, goToIndex]);

  // ============================================================================
  // AUTO-PLAY
  // ============================================================================

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      goToNext();
    }, interval);

    console.log('Carousel autoplay started');
  }, [interval, goToNext]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Carousel autoplay stopped');
    }
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsPlaying(!isPlaying);
    console.log('Carousel autoplay toggled:', !isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isPlaying, isPaused, startAutoPlay, stopAutoPlay]);

  // ============================================================================
  // DRAG HANDLERS
  // ============================================================================

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      const shouldGoNext = offset.x < -DRAG_THRESHOLD || velocity.x < -DRAG_VELOCITY_THRESHOLD;
      const shouldGoPrevious = offset.x > DRAG_THRESHOLD || velocity.x > DRAG_VELOCITY_THRESHOLD;

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
  // HOVER HANDLERS
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
      console.log('Carousel resumed after hover');
    }
  }, [isPlaying]);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderNavigationArrows = () => {
    if (!showArrows) return null;

    return (
      <>
        <Tooltip content="Previous">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-lg"
            aria-label="Previous products"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
        </Tooltip>

        <Tooltip content="Next">
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={!canGoNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
            aria-label="Next products"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </Tooltip>
      </>
    );
  };

  const renderDotIndicators = () => {
    if (!showDots || maxIndex === 0) return null;

    const dots = [];
    for (let i = 0; i <= maxIndex; i++) {
      dots.push(
        <button
          key={i}
          onClick={() => goToIndex(i)}
          className={cn(
            'transition-all duration-300 rounded-full',
            i === currentIndex
              ? 'w-8 h-2 bg-blue-600'
              : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
          )}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === currentIndex ? 'true' : 'false'}
        />
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        {dots}
        {autoPlay && (
          <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoPlay}
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

  const renderProducts = () => {
    if (isLoading) {
      return (
        <div className="flex gap-6">
          {Array.from({ length: itemsShown }).map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 animate-pulse"
              {...(itemWidth ? { style: { width: `${itemWidth}px` } } : {})}
            >
              <div className="aspect-[3/4] bg-muted rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500">
          No products available
        </div>
      );
    }

    return (
      <motion.div
        className="flex"
        style={{ x: translateX }}
        animate={{ x: translateX }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        drag={draggable ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0"
            {...(itemWidth || gap ? {
              style: {
                ...(itemWidth ? { width: `${itemWidth}px` } : {}),
                ...(gap ? { marginRight: `${gap}px` } : {}),
              }
            } : {})}
          >
            <NewArrivalsCard
              id={product.id}
              name={product.name}
              slug={product.slug}
              image={product.media.images[0]?.url || ''}
              hoverImage={product.media.images[1]?.url}
              price={product.pricing.salePrice ? product.pricing.salePrice.amount : product.pricing.basePrice.amount}
              originalPrice={product.pricing.salePrice ? product.pricing.basePrice.amount : undefined}
              rating={product.rating.average}
              reviewCount={product.reviewCount}
              colors={product.colors.map(c => ({ id: c.id, name: c.name, hex: c.hexCode, image: c.image?.url }))}
              sizes={product.sizes.map(s => ({ id: s.id, name: s.name, available: s.isAvailable }))}
              stock={product.inventory.quantity}
              isNew={product.isNewArrival}
              isSale={product.isOnSale}
              isLimited={product.isFeatured}
              isTrending={product.isBestseller}
            />
          </div>
        ))}
      </motion.div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Title */}
      {title && (
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      )}

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="region"
        aria-roledescription="carousel"
        aria-label={title || 'Product carousel'}
      >
        {/* Products */}
        <div className="overflow-hidden">
          {renderProducts()}
        </div>

        {/* Navigation Arrows */}
        {renderNavigationArrows()}
      </div>

      {/* Dot Indicators */}
      {renderDotIndicators()}

      {/* Screen Reader Announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing products {currentIndex + 1} to {Math.min(currentIndex + itemsShown, totalItems)} of {totalItems}
      </div>
    </div>
  );
};

export default ProductCarousel;

/**
 * ProductCarousel Component
 * 
 * Advanced touch-enabled carousel for displaying products with smooth animations,
 * drag support, auto-play, and responsive design.
 * 
 * Features:
 * - Touch and drag support
 * - Auto-play with pause on hover
 * - Navigation arrows
 * - Dot indicators with thumbnails
 * - Keyboard navigation
 * - Responsive breakpoints
 * - Infinite loop
 * - Swipe gestures
 * - Loading states
 * - Multiple items per view
 * - Gap between items
 * - Smooth transitions
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';
import { FeaturedCard } from './FeaturedCard';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProductCarouselProps {
  /** Products to display */
  products: Product[];
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
  /** Enable auto-play */
  autoPlay?: boolean;
  /** Enable infinite loop */
  infiniteLoop?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show thumbnails in dots */
  showThumbnails?: boolean;
  /** Enable drag/swipe */
  enableDrag?: boolean;
  /** Items per view (responsive) */
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
  /** Gap between items in pixels */
  gap?: number;
  /** Transition duration in seconds */
  transitionDuration?: number;
  /** Carousel title */
  title?: string;
  /** Carousel subtitle */
  subtitle?: string;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On slide change callback */
  onSlideChange?: (index: number) => void;
  /** On product click callback */
  onProductClick?: (product: Product) => void;
}

interface CarouselState {
  currentIndex: number;
  isPlaying: boolean;
  isDragging: boolean;
  direction: 'left' | 'right';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ITEMS_PER_VIEW = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
};

const DRAG_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  autoPlayInterval = 5000,
  autoPlay = true,
  infiniteLoop = true,
  showArrows = true,
  showDots = true,
  showThumbnails = false,
  enableDrag = true,
  itemsPerView = DEFAULT_ITEMS_PER_VIEW,
  gap = 16,
  transitionDuration = 0.5,
  title,
  subtitle,
  loading = false,
  className,
  onSlideChange,
  onProductClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [state, setState] = useState<CarouselState>({
    currentIndex: 0,
    isPlaying: autoPlay,
    isDragging: false,
    direction: 'right',
  });

  const [currentItemsPerView, setCurrentItemsPerView] = useState(itemsPerView.desktop);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragX = useMotionValue(0);

  // Transform drag value for smooth animations
  const dragOpacity = useTransform(dragX, [-100, 0, 100], [0.5, 1, 0.5]);

  // ============================================================================
  // RESPONSIVE ITEMS PER VIEW
  // ============================================================================

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCurrentItemsPerView(itemsPerView.mobile);
      } else if (width < 1024) {
        setCurrentItemsPerView(itemsPerView.tablet);
      } else if (width < 1536) {
        setCurrentItemsPerView(itemsPerView.desktop);
      } else {
        setCurrentItemsPerView(itemsPerView.wide);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerView]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalSlides = useMemo(() => {
    return Math.ceil(products.length / currentItemsPerView);
  }, [products.length, currentItemsPerView]);

  const canGoNext = useMemo(() => {
    return infiniteLoop || state.currentIndex < totalSlides - 1;
  }, [infiniteLoop, state.currentIndex, totalSlides]);

  const canGoPrev = useMemo(() => {
    return infiniteLoop || state.currentIndex > 0;
  }, [infiniteLoop, state.currentIndex]);

  const visibleProducts = useMemo(() => {
    const startIndex = state.currentIndex * currentItemsPerView;
    return products.slice(startIndex, startIndex + currentItemsPerView);
  }, [products, state.currentIndex, currentItemsPerView]);

  const progress = useMemo(() => {
    return ((state.currentIndex + 1) / totalSlides) * 100;
  }, [state.currentIndex, totalSlides]);

  // ============================================================================
  // AUTO PLAY
  // ============================================================================

  const startAutoPlay = useCallback(() => {
    if (!autoPlay) return;

    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    autoPlayTimerRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.isPlaying) return prev;

        const nextIndex = prev.currentIndex + 1;
        if (nextIndex >= totalSlides) {
          if (infiniteLoop) {
            return { ...prev, currentIndex: 0, direction: 'right' };
          } else {
            return { ...prev, isPlaying: false };
          }
        }
        return { ...prev, currentIndex: nextIndex, direction: 'right' };
      });
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, totalSlides, infiniteLoop]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [state.isPlaying, startAutoPlay, stopAutoPlay]);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const goToSlide = useCallback(
    (index: number) => {
      const normalizedIndex = Math.max(0, Math.min(index, totalSlides - 1));

      setState((prev) => ({
        ...prev,
        currentIndex: normalizedIndex,
        direction: normalizedIndex > prev.currentIndex ? 'right' : 'left',
      }));

      console.log('Going to slide:', normalizedIndex);
      onSlideChange?.(normalizedIndex);
    },
    [totalSlides, onSlideChange]
  );

  const goToNext = useCallback(() => {
    if (!canGoNext) return;

    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      const newIndex = nextIndex >= totalSlides ? 0 : nextIndex;

      console.log('Next slide:', newIndex);
      onSlideChange?.(newIndex);

      return {
        ...prev,
        currentIndex: newIndex,
        direction: 'right',
      };
    });
  }, [canGoNext, totalSlides, onSlideChange]);

  const goToPrev = useCallback(() => {
    if (!canGoPrev) return;

    setState((prev) => {
      const prevIndex = prev.currentIndex - 1;
      const newIndex = prevIndex < 0 ? totalSlides - 1 : prevIndex;

      console.log('Previous slide:', newIndex);
      onSlideChange?.(newIndex);

      return {
        ...prev,
        currentIndex: newIndex,
        direction: 'left',
      };
    });
  }, [canGoPrev, totalSlides, onSlideChange]);

  const togglePlayPause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
    console.log('Auto-play toggled:', !state.isPlaying);
  }, [state.isPlaying]);

  const handleReset = useCallback(() => {
    goToSlide(0);
    setState((prev) => ({ ...prev, isPlaying: true }));
    console.log('Carousel reset to beginning');
  }, [goToSlide]);

  // ============================================================================
  // DRAG HANDLERS
  // ============================================================================

  const handleDragStart = useCallback(() => {
    setState((prev) => ({ ...prev, isDragging: true }));
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setState((prev) => ({ ...prev, isDragging: false }));

      const offset = info.offset.x;
      const velocity = info.velocity.x;

      // Check if drag threshold or velocity threshold is met
      if (Math.abs(offset) > DRAG_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD) {
        if (offset > 0) {
          goToPrev();
        } else {
          goToNext();
        }
      }

      dragX.set(0);

      if (state.isPlaying) {
        startAutoPlay();
      }
    },
    [goToNext, goToPrev, dragX, state.isPlaying, startAutoPlay]
  );

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, togglePlayPause]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading || products.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(currentItemsPerView)].map((_, index) => (
            <FeaturedCard key={index} product={{} as Product} loading={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} ref={carouselRef}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              {state.currentIndex + 1} / {totalSlides}
            </Badge>

            {autoPlay && (
              <Tooltip content={state.isPlaying ? 'Pause' : 'Play'}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                  aria-label={state.isPlaying ? 'Pause carousel' : 'Play carousel'}
                >
                  {state.isPlaying ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </Button>
              </Tooltip>
            )}

            <Tooltip content="Reset to beginning">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                aria-label="Reset carousel"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        {showArrows && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrev}
              disabled={!canGoPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={!canGoNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Products Grid */}
        <div className="overflow-hidden px-12">
          <motion.div
            drag={enableDrag ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ x: dragX, gap: `${gap}px`, opacity: dragOpacity }}
            className={cn(
              'grid transition-all duration-500',
              currentItemsPerView === 1 && 'grid-cols-1',
              currentItemsPerView === 2 && 'grid-cols-2',
              currentItemsPerView === 3 && 'grid-cols-3',
              currentItemsPerView === 4 && 'grid-cols-4',
              state.isDragging && 'cursor-grabbing',
              enableDrag && 'cursor-grab'
            )}
            animate={{
              opacity: state.isDragging ? 0.7 : 1,
            }}
          >
            <AnimatePresence mode="wait">
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={`${product.id}-${state.currentIndex}-${index}`}
                  initial={{ opacity: 0, x: state.direction === 'right' ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: state.direction === 'right' ? -100 : 100 }}
                  transition={{ duration: transitionDuration, delay: index * 0.1 }}
                >
                  <FeaturedCard
                    product={product}
                    onAddToCart={(p) => console.log('Add to cart:', p.name)}
                    onAddToWishlist={(p) => console.log('Add to wishlist:', p.name)}
                    onQuickView={(p) => {
                      console.log('Quick view:', p.name);
                      onProductClick?.(p);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Dot Indicators */}
        {showDots && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {[...Array(totalSlides)].map((_, index) => (
              <Tooltip
                key={index}
                content={
                  showThumbnails && products[index * currentItemsPerView]
                    ? products[index * currentItemsPerView].name
                    : `Slide ${index + 1}`
                }
              >
                <button
                  onClick={() => goToSlide(index)}
                  onMouseEnter={() => setHoveredDot(index)}
                  onMouseLeave={() => setHoveredDot(null)}
                  className={cn(
                    'transition-all duration-300',
                    index === state.currentIndex
                      ? 'w-8 h-2 bg-blue-600 rounded-full'
                      : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500',
                    hoveredDot === index && index !== state.currentIndex && 'w-4'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === state.currentIndex ? 'true' : 'false'}
                />
              </Tooltip>
            ))}
          </div>
        )}
      </div>

      {/* Accessibility */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing slide {state.currentIndex + 1} of {totalSlides}
      </div>
    </div>
  );
};

export default ProductCarousel;

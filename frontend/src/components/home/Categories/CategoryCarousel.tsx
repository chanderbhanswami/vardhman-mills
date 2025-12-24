/**
 * CategoryCarousel Component
 * 
 * Carousel for displaying categories with navigation controls,
 * auto-scroll, and responsive breakpoints.
 * 
 * Features:
 * - Responsive carousel with breakpoints
 * - Navigation arrows
 * - Pagination dots
 * - Auto-scroll functionality
 * - Touch/swipe gestures
 * - Loop mode
 * - Custom animations
 * - Loading states
 * - Keyboard navigation
 * - Accessibility features
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ImageAsset } from '@/types/product.types';
import { motion, PanInfo } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/utils';
import { CategoryCard } from './CategoryCard';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | ImageAsset;
  icon?: React.ComponentType<{ className?: string }> | string;
  productCount: number;
  subcategories?: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  isHot?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  color?: string;
  theme?: 'light' | 'dark' | 'gradient';
}

export interface CarouselBreakpoint {
  /** Minimum screen width in pixels */
  minWidth: number;
  /** Items to show per view */
  itemsPerView: number;
  /** Gap between items in pixels */
  gap: number;
}

export interface CategoryCarouselProps {
  /** Categories to display */
  categories: Category[];
  /** Auto-scroll interval (ms) */
  autoScrollInterval?: number;
  /** Enable auto-scroll */
  autoScroll?: boolean;
  /** Autoplay (alias for autoScroll) */
  autoplay?: boolean;
  /** Enable loop */
  loop?: boolean;
  /** Show navigation arrows */
  showNavigation?: boolean;
  /** Show arrows (alias for showNavigation) */
  showArrows?: boolean;
  /** Show pagination dots */
  showPagination?: boolean;
  /** Slides per view */
  slidesPerView?: number;
  /** Enable touch gestures */
  enableTouch?: boolean;
  /** Responsive breakpoints */
  breakpoints?: CarouselBreakpoint[];
  /** Additional CSS classes */
  className?: string;
  /** On category click */
  onCategoryClick?: (category: Category) => void;
}

// ============================================================================
// DEFAULT BREAKPOINTS
// ============================================================================

const DEFAULT_BREAKPOINTS: CarouselBreakpoint[] = [
  { minWidth: 0, itemsPerView: 1, gap: 16 },
  { minWidth: 640, itemsPerView: 2, gap: 16 },
  { minWidth: 1024, itemsPerView: 3, gap: 24 },
  { minWidth: 1280, itemsPerView: 4, gap: 24 },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  autoScrollInterval = 5000,
  autoScroll = true,
  loop = true,
  showNavigation = true,
  showPagination = true,
  enableTouch = true,
  breakpoints = DEFAULT_BREAKPOINTS,
  className,
  onCategoryClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoScroll);
  const [isPausedByUser, setIsPausedByUser] = useState(!autoScroll);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [gap, setGap] = useState(16);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // RESPONSIVE BREAKPOINTS
  // ============================================================================

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const breakpoint =
        [...breakpoints]
          .reverse()
          .find((bp) => width >= bp.minWidth) || breakpoints[0];

      setItemsPerView(breakpoint.itemsPerView);
      setGap(breakpoint.gap);
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [breakpoints]);

  // Update playing state based on user pause and hover
  useEffect(() => {
    if (autoScroll) {
      setIsPlaying(!isPausedByUser && !isHovered && !isDragging);
    }
  }, [autoScroll, isPausedByUser, isHovered, isDragging]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalPages = Math.ceil(categories.length / itemsPerView);
  const canGoNext = loop || currentIndex < totalPages - 1;
  const canGoPrev = loop || currentIndex > 0;

  // ============================================================================
  // AUTO SCROLL
  // ============================================================================

  useEffect(() => {
    if (!isPlaying || categories.length <= itemsPerView) return;

    autoScrollTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= totalPages - 1) {
          return loop ? 0 : prev;
        }
        return prev + 1;
      });
    }, autoScrollInterval);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isPlaying, categories.length, itemsPerView, totalPages, loop, autoScrollInterval]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0) {
        setCurrentIndex(loop ? totalPages - 1 : 0);
      } else if (index >= totalPages) {
        setCurrentIndex(loop ? 0 : totalPages - 1);
      } else {
        setCurrentIndex(index);
      }
      console.log('Navigated to slide:', index);
    },
    [loop, totalPages]
  );

  const goNext = useCallback(() => {
    if (canGoNext) {
      goToSlide(currentIndex + 1);
    }
  }, [canGoNext, currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    if (canGoPrev) {
      goToSlide(currentIndex - 1);
    }
  }, [canGoPrev, currentIndex, goToSlide]);

  const togglePlayPause = useCallback(() => {
    setIsPausedByUser((prev) => !prev);
    console.log('Auto-scroll:', isPausedByUser ? 'resumed' : 'paused');
  }, [isPausedByUser]);

  // ============================================================================
  // TOUCH HANDLERS
  // ============================================================================

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!enableTouch) return;

      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      setDragStart(clientX);
      setDragOffset(0);

      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    },
    [enableTouch]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging || !enableTouch) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const offset = clientX - dragStart;
      setDragOffset(offset);
    },
    [isDragging, dragStart, enableTouch]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !enableTouch) return;

    setIsDragging(false);

    const threshold = 50;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        goPrev();
      } else {
        goNext();
      }
    }

    setDragOffset(0);
  }, [isDragging, dragOffset, goPrev, goNext, enableTouch]);

  // ============================================================================
  // DRAG HANDLERS
  // ============================================================================

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const offset = info.offset.x;
      const velocity = info.velocity.x;
      const threshold = 50;

      if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
        if (offset > 0) {
          goPrev();
        } else {
          goNext();
        }
      }
    },
    [goNext, goPrev]
  );

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'ArrowRight') {
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (categories.length === 0) {
    return null;
  }

  const translateX = -(currentIndex * 100);
  // Calculate item width for layout
  console.log('Item width:', `${100 / itemsPerView}%`);

  return (
    <div
      className={cn('relative', className)}
    >
      {/* Main Carousel Wrapper with Navigation */}
      {/* Main Carousel Wrapper */}
      <div className="overflow-hidden py-4">
        <div
          ref={carouselRef}
          className="flex-1 overflow-hidden py-4"
        >
          <motion.div
            className="flex"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            animate={{
              x: `${translateX}%`,
            }}
            transition={{
              type: 'tween',
              ease: [0.25, 0.1, 0.25, 1],
              duration: 0.5,
            }}
            style={{
              cursor: isDragging ? 'grabbing' : enableTouch ? 'grab' : 'default',
            }}
          >
            {categories.map((category) => {
              const widthPercent = 100 / itemsPerView;
              const gapHalf = gap / 2;
              const itemStyle = {
                width: `${widthPercent}%`,
                paddingLeft: `${gapHalf}px`,
                paddingRight: `${gapHalf}px`,
              };
              return (
                <div
                  key={category.id}
                  className="flex-shrink-0"
                  {...{ style: itemStyle }}
                  onMouseEnter={() => autoScroll && setIsHovered(true)}
                  onMouseLeave={() => autoScroll && setIsHovered(false)}
                >
                  <CategoryCard
                    category={category}
                    size="md"
                    showSubcategories={false}
                    onCategoryClick={() => {
                      onCategoryClick?.(category);
                      console.log('Category clicked:', category.name);
                    }}
                  />
                </div>
              );
            })}
          </motion.div>
        </div>

      </div>

      {/* Controls Bar - Bottom Right */}
      {(showNavigation || showPagination || autoScroll) && categories.length > itemsPerView && (

        <div className="relative flex items-center justify-end gap-6 mt-6">

          {/* Pagination Dots & Play/Pause (Grouped) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
            {/* Play/Pause Button */}
            {autoScroll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="w-8 h-8 p-0 rounded-full"
                aria-label={isPlaying ? 'Pause auto-scroll' : 'Play auto-scroll'}
              >
                {isPlaying ? (
                  <PauseIcon className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* Dots */}
            {showPagination && (
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      'transition-all duration-200',
                      'rounded-full',
                      currentIndex === index
                        ? 'w-8 h-2 bg-primary-600'
                        : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {showNavigation && (
            <div className="flex items-center gap-3 z-10">
              <button
                onClick={goPrev}
                disabled={!canGoPrev}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'border border-gray-200 shadow-sm',
                  'hover:border-primary-500 hover:text-primary-600 hover:shadow-md',
                  'transition-all duration-200',
                  canGoPrev
                    ? 'text-gray-700 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed opacity-50'
                )}
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                disabled={!canGoNext}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'border border-gray-200 shadow-sm',
                  'hover:border-primary-500 hover:text-primary-600 hover:shadow-md',
                  'transition-all duration-200',
                  canGoNext
                    ? 'text-gray-700 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed opacity-50'
                )}
                aria-label="Next slide"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default CategoryCarousel;

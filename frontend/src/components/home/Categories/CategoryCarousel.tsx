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
import { motion } from 'framer-motion';
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
    setIsPlaying((prev) => !prev);
    console.log('Auto-scroll:', !isPlaying ? 'playing' : 'paused');
  }, [isPlaying]);

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
    <div className={cn('relative', className)}>
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <motion.div
          className="flex"
          animate={{
            x: `${translateX}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          drag={enableTouch ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
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
                {...{style: itemStyle}}
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

      {/* Navigation Arrows */}
      {showNavigation && categories.length > itemsPerView && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={!canGoPrev}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 p-0 rounded-full',
              'bg-white/90 backdrop-blur-sm shadow-lg',
              'hover:bg-white hover:scale-110',
              'transition-all duration-200',
              !canGoPrev && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={!canGoNext}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 p-0 rounded-full',
              'bg-white/90 backdrop-blur-sm shadow-lg',
              'hover:bg-white hover:scale-110',
              'transition-all duration-200',
              !canGoNext && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Controls Bar */}
      {(showPagination || autoScroll) && categories.length > itemsPerView && (
        <div className="flex items-center justify-center gap-4 mt-6">
          {/* Pagination Dots */}
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
        </div>
      )}

      {/* Progress Indicator */}
      {categories.length > itemsPerView && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {currentIndex + 1} / {totalPages}
        </div>
      )}
    </div>
  );
};

export default CategoryCarousel;

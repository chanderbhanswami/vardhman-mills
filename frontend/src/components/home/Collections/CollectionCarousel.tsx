/**
 * CollectionCarousel Component
 * 
 * Touch-enabled carousel for displaying collections with smooth animations.
 * 
 * Features:
 * - Touch and drag navigation
 * - Auto-play functionality
 * - Navigation arrows
 * - Dot indicators
 * - Infinite loop support
 * - Pause on hover
 * - Responsive breakpoints
 * - Keyboard navigation
 * - Smooth spring animations
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/utils';
import { CollectionCard } from './CollectionCard';
import type { Collection } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CollectionCarouselProps {
  /** Collections to display */
  collections: Collection[];
  /** Card variant to use */
  cardVariant?: 'default' | 'compact' | 'featured' | 'minimal' | 'overlay';
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
  /** Enable auto-play */
  autoPlay?: boolean;
  /** Enable infinite loop */
  loop?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show play/pause button */
  showPlayPause?: boolean;
  /** Enable drag/swipe */
  enableDrag?: boolean;
  /** Items per view at different breakpoints */
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
  /** Gap between items in pixels */
  gap?: number;
  /** Additional CSS classes */
  className?: string;
  /** On collection click */
  onCollectionClick?: (collection: Collection) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ITEMS_PER_VIEW = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  large: 4,
};

const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
  large: 1280,
};

// ============================================================================
// COMPONENT
// ============================================================================


export const CollectionCarousel: React.FC<CollectionCarouselProps> = ({
  collections,
  cardVariant = 'default',
  autoPlayInterval = 5000,
  autoPlay = true,
  loop = true,
  showArrows = true,
  showDots = true,
  showPlayPause = true,
  enableDrag = true,
  itemsPerView = DEFAULT_ITEMS_PER_VIEW,
  gap = 24,
  className,
  onCollectionClick,
}) => {
  // ============================================================================
  // TYPES
  // ============================================================================

  interface CarouselState {
    currentIndex: number;
    isPlaying: boolean;
    isPausedByUser: boolean;
    isHovered: boolean;
    isDragging: boolean;
    direction: 'left' | 'right';
  }

  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [state, setState] = useState<CarouselState>({
    currentIndex: 0,
    isPlaying: autoPlay,
    isPausedByUser: false,
    isHovered: false,
    isDragging: false,
    direction: 'right',
  });

  const [currentItemsPerView, setCurrentItemsPerView] = useState(itemsPerView.desktop);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // CONSTANTS
  // ============================================================================

  const DRAG_THRESHOLD = 50;
  const SWIPE_VELOCITY_THRESHOLD = 500;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalSlides = useMemo(() => {
    return Math.ceil(collections.length / currentItemsPerView);
  }, [collections.length, currentItemsPerView]);

  const canGoNext = useMemo(() => {
    return loop || state.currentIndex < totalSlides - 1;
  }, [loop, state.currentIndex, totalSlides]);

  const canGoPrev = useMemo(() => {
    return loop || state.currentIndex > 0;
  }, [loop, state.currentIndex]);

  // ============================================================================
  // RESPONSIVE BREAKPOINTS
  // ============================================================================

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCurrentItemsPerView(itemsPerView.mobile);
      } else if (width < 1024) {
        setCurrentItemsPerView(itemsPerView.tablet);
      } else if (width < 1280) {
        setCurrentItemsPerView(itemsPerView.desktop);
      } else {
        setCurrentItemsPerView(itemsPerView.large);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerView]);

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
          if (loop) {
            return { ...prev, currentIndex: 0, direction: 'right' };
          } else {
            return { ...prev, isPlaying: false };
          }
        }
        return { ...prev, currentIndex: nextIndex, direction: 'right' };
      });
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, totalSlides, loop]);

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
    },
    [totalSlides]
  );

  const goToNext = useCallback(() => {
    if (!canGoNext) return;

    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= totalSlides) {
        return loop
          ? { ...prev, currentIndex: 0, direction: 'right' }
          : prev;
      }
      return { ...prev, currentIndex: nextIndex, direction: 'right' };
    });
  }, [canGoNext, totalSlides, loop]);

  const goToPrev = useCallback(() => {
    if (!canGoPrev) return;

    setState((prev) => {
      const prevIndex = prev.currentIndex - 1;
      if (prevIndex < 0) {
        return loop
          ? { ...prev, currentIndex: totalSlides - 1, direction: 'left' }
          : prev;
      }
      return { ...prev, currentIndex: prevIndex, direction: 'left' };
    });
  }, [canGoPrev, totalSlides, loop]);

  const togglePlayPause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
      isPausedByUser: !prev.isPausedByUser,
    }));
  }, []);

  // ============================================================================
  // DRAG HANDLERS
  // ============================================================================

  const handleDragStart = useCallback(() => {
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setState((prev) => ({ ...prev, isDragging: false }));

      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(offset) > DRAG_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD) {
        if (offset > 0 || velocity > 0) {
          goToPrev();
        } else {
          goToNext();
        }
      }
    },
    [goToPrev, goToNext, DRAG_THRESHOLD, SWIPE_VELOCITY_THRESHOLD]
  );

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrev, goToNext]);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================


  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400">No collections to display</p>
      </div>
    );
  }

  // Calculate translateX based on currentIndex and currentItemsPerView
  const translateX = -state.currentIndex * 100;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Main Carousel Wrapper */}
      <div className="overflow-hidden py-4">
        <motion.div
          className="flex"
          drag={enableDrag ? 'x' : false}
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
            cursor: state.isDragging ? 'grabbing' : enableDrag ? 'grab' : 'default',
          }}
        >
          {collections.map((collection) => {
            if (!collection) return null;
            const widthPercent = 100 / currentItemsPerView;
            const gapHalf = gap / 2;
            const itemStyle = {
              width: `${widthPercent}%`,
              paddingLeft: `${gapHalf}px`,
              paddingRight: `${gapHalf}px`,
            };
            return (
              <div
                key={collection.id || `collection-${Math.random()}`}
                className="flex-shrink-0"
                style={itemStyle}
                onMouseEnter={() => setState(prev => ({ ...prev, isHovered: true, isPlaying: false }))}
                onMouseLeave={() => setState(prev => ({ ...prev, isHovered: false, isPlaying: !prev.isPausedByUser }))}
              >
                <CollectionCard
                  collection={collection}
                  variant={cardVariant}
                  onClick={onCollectionClick}
                  animated={false}
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls Bar - Bottom Center + Right */}
      {(showDots || showArrows) && collections.length > 1 && (
        <div className="relative flex items-center justify-end gap-6 mt-6">

          {/* Pagination Dots & Play/Pause (Grouped, Centered) */}
          {showDots && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
              {/* Play/Pause Button */}
              {showPlayPause && (
                <button
                  onClick={togglePlayPause}
                  className="w-8 h-8 p-0 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label={!state.isPlaying ? 'Play auto-scroll' : 'Pause auto-scroll'}
                >
                  {!state.isPlaying ? (
                    <PlayIcon className="w-4 h-4" />
                  ) : (
                    <PauseIcon className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Dots */}
              <div className="flex items-center gap-2">
                {[...Array(totalSlides || 0)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      'transition-all duration-200',
                      'rounded-full',
                      state.currentIndex === index
                        ? 'w-8 h-2 bg-primary-600'
                        : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {showArrows && (
            <div className="flex items-center gap-3 z-10">
              <button
                onClick={goToPrev}
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
                onClick={goToNext}
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

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {state.currentIndex + 1} of {totalSlides}
      </div>
    </div>
  );
};

export default CollectionCarousel;

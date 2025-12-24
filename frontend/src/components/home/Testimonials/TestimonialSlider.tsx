/**
 * TestimonialSlider Component
 * 
 * Advanced carousel slider for displaying testimonials with smooth animations,
 * auto-play, and navigation controls - matching ProductCarousel functionality.
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { TestimonialCard } from './TestimonialCard';
import type { TestimonialCardProps } from './TestimonialCard';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TestimonialSliderProps {
  testimonials: TestimonialCardProps[];
  itemsPerSlide?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  autoPlay?: boolean;
  interval?: number;
  infinite?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  swipeEnabled?: boolean;
  gap?: number;
  className?: string;
  onSlideChange?: (index: number) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DRAG_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

const DEFAULT_ITEMS_PER_VIEW = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

// ============================================================================
// COMPONENT
// ============================================================================

export const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
  testimonials,
  itemsPerSlide = DEFAULT_ITEMS_PER_VIEW,
  autoPlay = true,
  interval = 5000,
  infinite = true,
  showArrows = true,
  showDots = true,
  swipeEnabled = true,
  gap = 24,
  className,
  onSlideChange,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPausedByUser, setIsPausedByUser] = useState(!autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentItemsPerView, setCurrentItemsPerView] = useState(itemsPerSlide.desktop);

  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // RESPONSIVE ITEMS PER VIEW
  // ============================================================================

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCurrentItemsPerView(itemsPerSlide.mobile);
      } else if (width < 1024) {
        setCurrentItemsPerView(itemsPerSlide.tablet);
      } else {
        setCurrentItemsPerView(itemsPerSlide.desktop);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerSlide]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalSlides = useMemo(() => {
    return Math.ceil(testimonials.length / currentItemsPerView);
  }, [testimonials.length, currentItemsPerView]);

  const canGoNext = useMemo(() => {
    return infinite || currentIndex < totalSlides - 1;
  }, [infinite, currentIndex, totalSlides]);

  const canGoPrev = useMemo(() => {
    return infinite || currentIndex > 0;
  }, [infinite, currentIndex]);

  // ============================================================================
  // AUTO PLAY
  // ============================================================================

  const startAutoPlay = useCallback(() => {
    if (!autoPlay) return;

    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    autoPlayTimerRef.current = setInterval(() => {
      if (isPlaying && !isHovered && !isPausedByUser) {
        setCurrentIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= totalSlides) {
            return infinite ? 0 : prev;
          }
          return nextIndex;
        });
      }
    }, interval);
  }, [autoPlay, interval, totalSlides, infinite, isPlaying, isHovered, isPausedByUser]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying && !isHovered && !isPausedByUser) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isPlaying, isHovered, isPausedByUser, startAutoPlay, stopAutoPlay]);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const goToSlide = useCallback((index: number) => {
    const normalizedIndex = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentIndex(normalizedIndex);
    onSlideChange?.(normalizedIndex);
  }, [totalSlides, onSlideChange]);

  const goToNext = useCallback(() => {
    if (!canGoNext) return;
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      const newIndex = nextIndex >= totalSlides ? 0 : nextIndex;
      onSlideChange?.(newIndex);
      return newIndex;
    });
  }, [canGoNext, totalSlides, onSlideChange]);

  const goToPrev = useCallback(() => {
    if (!canGoPrev) return;
    setCurrentIndex((prev) => {
      const prevIndex = prev - 1;
      const newIndex = prevIndex < 0 ? totalSlides - 1 : prevIndex;
      onSlideChange?.(newIndex);
      return newIndex;
    });
  }, [canGoPrev, totalSlides, onSlideChange]);

  const togglePlayPause = useCallback(() => {
    setIsPausedByUser((prev) => !prev);
    setIsPlaying((prev) => !prev);
  }, []);

  // ============================================================================
  // DRAG HANDLERS
  // ============================================================================

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);

      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(offset) > DRAG_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD) {
        if (offset > 0) {
          goToPrev();
        } else {
          goToNext();
        }
      }

      if (!isPausedByUser) {
        startAutoPlay();
      }
    },
    [goToNext, goToPrev, isPausedByUser, startAutoPlay]
  );

  // ============================================================================
  // CARD HOVER HANDLERS
  // ============================================================================

  const handleCardMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsPlaying(false);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (!isPausedByUser) {
      setIsPlaying(true);
    }
  }, [isPausedByUser]);

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

  const translateX = -(currentIndex * 100);

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        No testimonials available
      </div>
    );
  }

  return (
    <div
      className={cn('relative', className)}
      ref={carouselRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
    >
      {/* Main Carousel Wrapper - py-4 allows shadow overflow */}
      <div className="overflow-hidden py-4">
        <motion.div
          className="flex"
          drag={swipeEnabled ? 'x' : false}
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
            cursor: isDragging ? 'grabbing' : swipeEnabled ? 'grab' : 'default',
          }}
        >
          {testimonials.map((testimonial) => {
            const widthPercent = 100 / currentItemsPerView;
            const gapHalf = gap / 2;
            const itemStyle = {
              width: `${widthPercent}%`,
              paddingLeft: `${gapHalf}px`,
              paddingRight: `${gapHalf}px`,
            };
            return (
              <div
                key={testimonial.id}
                className="flex-shrink-0"
                style={itemStyle}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
              >
                <TestimonialCard {...testimonial} />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls Bar - Bottom (matching ProductCarousel layout) */}
      {testimonials.length > currentItemsPerView && (
        <div className="relative flex items-center justify-end gap-6 mt-6">
          {/* Pagination Dots & Play/Pause (Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
            {/* Play/Pause Button */}
            {autoPlay && (
              <button
                onClick={togglePlayPause}
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label={!isPlaying ? 'Play auto-scroll' : 'Pause auto-scroll'}
              >
                {!isPlaying || isPausedByUser ? (
                  <PlayIcon className="w-4 h-4" />
                ) : (
                  <PauseIcon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Dots */}
            {showDots && (
              <div className="flex items-center gap-2">
                {[...Array(totalSlides)].map((_, index) => (
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

          {/* Navigation Arrows (Right) */}
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
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing slide {currentIndex + 1} of {totalSlides}
      </div>
    </div>
  );
};

export default TestimonialSlider;

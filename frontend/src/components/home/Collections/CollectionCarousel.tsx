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

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  itemsPerView = DEFAULT_ITEMS_PER_VIEW,
  gap = 24,
  className,
  onCollectionClick,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [itemsVisible, setItemsVisible] = useState(itemsPerView.desktop);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const x = useMotionValue(0);
  const controls = useAnimation();

  // Log motion values for debugging
  console.log('Motion values:', { x: x.get(), controls });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalSlides = collections.length;
  const maxIndex = Math.max(0, totalSlides - itemsVisible);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev === 0) {
        return loop ? maxIndex : 0;
      }
      return prev - 1;
    });
  }, [loop, maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev >= maxIndex) {
        return loop ? 0 : maxIndex;
      }
      return prev + 1;
    });
  }, [loop, maxIndex]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);

      const threshold = 50;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
        if (offset > 0 || velocity > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    },
    [handlePrev, handleNext]
  );

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Handle responsive breakpoints
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS.large) {
        setItemsVisible(itemsPerView.large);
      } else if (width >= BREAKPOINTS.desktop) {
        setItemsVisible(itemsPerView.desktop);
      } else if (width >= BREAKPOINTS.tablet) {
        setItemsVisible(itemsPerView.tablet);
      } else {
        setItemsVisible(itemsPerView.mobile);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, [itemsPerView]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !isPaused && !isDragging && totalSlides > itemsVisible) {
      autoPlayTimerRef.current = setInterval(() => {
        handleNext();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, isPaused, isDragging, currentIndex, totalSlides, itemsVisible, autoPlayInterval, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrev, handleNext]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderArrows = useCallback(() => {
    if (!showArrows) return null;

    return (
      <>
        {/* Previous Arrow */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          disabled={!loop && currentIndex === 0}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 rounded-full',
            'bg-white dark:bg-gray-800',
            'shadow-lg hover:shadow-xl',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            (!loop && currentIndex === 0) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>

        {/* Next Arrow */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={!loop && currentIndex >= maxIndex}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 rounded-full',
            'bg-white dark:bg-gray-800',
            'shadow-lg hover:shadow-xl',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            (!loop && currentIndex >= maxIndex) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </Button>
      </>
    );
  }, [showArrows, handlePrev, handleNext, loop, currentIndex, maxIndex]);

  const renderDots = useCallback(() => {
    if (!showDots || totalSlides <= itemsVisible) return null;

    const dotsCount = Math.ceil(totalSlides / itemsVisible);

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: dotsCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex
                ? 'bg-blue-600 w-8'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
    );
  }, [showDots, totalSlides, itemsVisible, currentIndex, handleDotClick]);

  const renderPlayPause = useCallback(() => {
    if (!showPlayPause || totalSlides <= itemsVisible) return null;

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleAutoPlay}
        className={cn(
          'absolute bottom-4 right-4 z-10',
          'w-10 h-10 rounded-full',
          'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
          'shadow-lg hover:shadow-xl',
          'opacity-0 group-hover:opacity-100 transition-opacity'
        )}
        aria-label={isAutoPlaying ? 'Pause auto-play' : 'Start auto-play'}
      >
        {isAutoPlaying ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </Button>
    );
  }, [showPlayPause, totalSlides, itemsVisible, isAutoPlaying, toggleAutoPlay]);

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

  const itemWidth = containerRef.current
    ? (containerRef.current.offsetWidth - gap * (itemsVisible - 1)) / itemsVisible
    : 300;

  const slideOffset = -(currentIndex * (itemWidth + gap));

  return (
    <div className={cn('relative', className)}>
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="group relative overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Slides */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={{ x: slideOffset }}
          transition={{
            type: 'spring' as const,
            stiffness: 300,
            damping: 30,
          }}
          className={cn(
            'flex gap-6',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          style={{ gap: `${gap}px` }}
        >
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              className="flex-shrink-0"
              style={{ width: `${itemWidth}px` }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                type: 'spring' as const,
                stiffness: 100,
              }}
            >
              <CollectionCard
                collection={collection}
                variant={cardVariant}
                onClick={onCollectionClick}
                animated={false}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Arrows */}
        {renderArrows()}

        {/* Play/Pause Button */}
        {renderPlayPause()}
      </div>

      {/* Dot Indicators */}
      {renderDots()}

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {Math.ceil(totalSlides / itemsVisible)}
      </div>
    </div>
  );
};

export default CollectionCarousel;

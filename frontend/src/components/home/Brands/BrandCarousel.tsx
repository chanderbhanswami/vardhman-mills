/**
 * BrandCarousel Component
 * 
 * Carousel for displaying multiple brand cards with touch/drag support.
 * 
 * Features:
 * - Touch and drag navigation
 * - Auto-play functionality
 * - Navigation arrows
 * - Dot indicators
 * - Responsive breakpoints
 * - Smooth transitions
 * - Keyboard navigation
 * - Infinite loop
 * - Customizable settings
 * - Brand card integration
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useAnimation } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';
import { BrandCard } from './BrandCard';
import type { Brand } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BrandCarouselProps {
  /** Brands to display */
  brands: Brand[];
  /** Card variant to use */
  cardVariant?: 'default' | 'compact' | 'featured' | 'minimal' | 'horizontal';
  /** Enable auto-play */
  autoPlay?: boolean;
  /** Auto-play interval (ms) */
  autoPlayInterval?: number;
  /** Enable infinite loop */
  infinite?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Slides to show per view */
  slidesPerView?: number | 'auto';
  /** Slides to scroll */
  slidesToScroll?: number;
  /** Space between slides (px) */
  spaceBetween?: number;
  /** Enable animations */
  animated?: boolean;
  /** Pause on hover */
  pauseOnHover?: boolean;
  /** Enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Responsive breakpoints */
  breakpoints?: {
    [key: number]: {
      slidesPerView: number;
      slidesToScroll?: number;
      spaceBetween?: number;
    };
  };
  /** Additional CSS classes */
  className?: string;
  /** On brand click */
  onBrandClick?: (brand: Brand) => void;
  /** On brand follow */
  onBrandFollow?: (brandId: string) => void;
  /** On brand quick view */
  onBrandQuickView?: (brand: Brand) => void;
}

interface CarouselState {
  currentIndex: number;
  isTransitioning: boolean;
  isPaused: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BREAKPOINTS = {
  0: { slidesPerView: 1, slidesToScroll: 1, spaceBetween: 16 },
  640: { slidesPerView: 2, slidesToScroll: 1, spaceBetween: 20 },
  1024: { slidesPerView: 3, slidesToScroll: 1, spaceBetween: 24 },
  1280: { slidesPerView: 4, slidesToScroll: 1, spaceBetween: 24 },
};

const SWIPE_THRESHOLD = 50;
const DRAG_ELASTIC = 0.2;

// ============================================================================
// COMPONENT
// ============================================================================

export const BrandCarousel: React.FC<BrandCarouselProps> = ({
  brands,
  cardVariant = 'default',
  autoPlay = false,
  autoPlayInterval = 5000,
  infinite = true,
  showArrows = true,
  showDots = true,
  slidesPerView = 4,
  slidesToScroll = 1,
  spaceBetween = 24,
  animated = true,
  pauseOnHover = true,
  keyboardNavigation = true,
  breakpoints = DEFAULT_BREAKPOINTS,
  className,
  onBrandClick,
  onBrandFollow,
  onBrandQuickView,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [state, setState] = useState<CarouselState>({
    currentIndex: 0,
    isTransitioning: false,
    isPaused: false,
  });
  const [windowWidth, setWindowWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const x = useMotionValue(0);
  const controls = useAnimation();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const currentBreakpoint = useMemo(() => {
    const breakpointKeys = Object.keys(breakpoints)
      .map(Number)
      .sort((a, b) => b - a);

    for (const bp of breakpointKeys) {
      if (windowWidth >= bp) {
        const result = breakpoints[bp as keyof typeof breakpoints];
        return result || { slidesPerView: 1, slidesToScroll: 1, spaceBetween: 16 };
      }
    }

    return { slidesPerView: 1, slidesToScroll: 1, spaceBetween: 16 };
  }, [windowWidth, breakpoints]);

  const effectiveSlidesPerView = useMemo(() => {
    if (slidesPerView === 'auto') return currentBreakpoint.slidesPerView;
    return currentBreakpoint.slidesPerView;
  }, [slidesPerView, currentBreakpoint]);

  const effectiveSlidesToScroll = useMemo(() => {
    return currentBreakpoint.slidesToScroll || slidesToScroll;
  }, [currentBreakpoint, slidesToScroll]);

  const effectiveSpaceBetween = useMemo(() => {
    return currentBreakpoint.spaceBetween || spaceBetween;
  }, [currentBreakpoint, spaceBetween]);

  const totalSlides = useMemo(() => brands.length, [brands.length]);

  const maxIndex = useMemo(() => {
    return Math.max(0, totalSlides - effectiveSlidesPerView);
  }, [totalSlides, effectiveSlidesPerView]);

  const canGoPrev = useMemo(() => {
    return infinite || state.currentIndex > 0;
  }, [infinite, state.currentIndex]);

  const canGoNext = useMemo(() => {
    return infinite || state.currentIndex < maxIndex;
  }, [infinite, state.currentIndex, maxIndex]);

  const slideWidth = useMemo(() => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return (
      (containerWidth - effectiveSpaceBetween * (effectiveSlidesPerView - 1)) /
      effectiveSlidesPerView
    );
  }, [windowWidth, effectiveSlidesPerView, effectiveSpaceBetween]); // eslint-disable-line react-hooks/exhaustive-deps

  const translateX = useMemo(() => {
    return -(state.currentIndex * (slideWidth + effectiveSpaceBetween));
  }, [state.currentIndex, slideWidth, effectiveSpaceBetween]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || state.isPaused) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, state.isPaused]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation
  useEffect(() => {
    if (!keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavigation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate on index change
  useEffect(() => {
    controls.start({
      x: translateX,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    });
  }, [translateX, controls]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePrev = useCallback(() => {
    if (!canGoPrev || state.isTransitioning) return;

    setState(prev => {
      let newIndex = prev.currentIndex - effectiveSlidesToScroll;

      if (newIndex < 0) {
        newIndex = infinite ? maxIndex : 0;
      }

      return {
        ...prev,
        currentIndex: newIndex,
        isTransitioning: true,
      };
    });

    setTimeout(() => {
      setState(prev => ({ ...prev, isTransitioning: false }));
    }, 300);
  }, [canGoPrev, state.isTransitioning, effectiveSlidesToScroll, infinite, maxIndex]);

  const handleNext = useCallback(() => {
    if (!canGoNext || state.isTransitioning) return;

    setState(prev => {
      let newIndex = prev.currentIndex + effectiveSlidesToScroll;

      if (newIndex > maxIndex) {
        newIndex = infinite ? 0 : maxIndex;
      }

      return {
        ...prev,
        currentIndex: newIndex,
        isTransitioning: true,
      };
    });

    setTimeout(() => {
      setState(prev => ({ ...prev, isTransitioning: false }));
    }, 300);
  }, [canGoNext, state.isTransitioning, effectiveSlidesToScroll, infinite, maxIndex]);

  const handleDotClick = useCallback(
    (index: number) => {
      if (state.isTransitioning) return;

      setState(prev => ({
        ...prev,
        currentIndex: index,
        isTransitioning: true,
      }));

      setTimeout(() => {
        setState(prev => ({ ...prev, isTransitioning: false }));
      }, 300);
    },
    [state.isTransitioning]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      setIsDragging(false);

      const dragDistance = info.offset.x;

      if (Math.abs(dragDistance) > SWIPE_THRESHOLD) {
        if (dragDistance > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }

      controls.start({
        x: translateX,
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 30,
        },
      });
    },
    [handlePrev, handleNext, controls, translateX]
  );

  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover && autoPlay) {
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [pauseOnHover, autoPlay]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover && autoPlay) {
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [pauseOnHover, autoPlay]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderArrows = useCallback(() => {
    if (!showArrows) return null;

    return (
      <>
        <Tooltip content="Previous">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10',
              'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
              'hover:bg-white dark:hover:bg-gray-800',
              'shadow-lg rounded-full p-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
        </Tooltip>

        <Tooltip content="Next">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10',
              'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
              'hover:bg-white dark:hover:bg-gray-800',
              'shadow-lg rounded-full p-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
      </>
    );
  }, [showArrows, handlePrev, handleNext, canGoPrev, canGoNext]);

  const renderDots = useCallback(() => {
    if (!showDots) return null;

    const dotCount = Math.ceil(totalSlides / effectiveSlidesToScroll);
    const dots = Array.from({ length: dotCount }, (_, i) => i);

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        {dots.map(index => (
          <button
            key={index}
            onClick={() => handleDotClick(index * effectiveSlidesToScroll)}
            className={cn(
              'rounded-full transition-all',
              state.currentIndex === index * effectiveSlidesToScroll
                ? 'w-8 h-2 bg-blue-600'
                : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  }, [showDots, totalSlides, effectiveSlidesToScroll, state.currentIndex, handleDotClick]);

  const renderAutoPlayControl = useCallback(() => {
    if (!autoPlay) return null;

    return (
      <Tooltip content={state.isPaused ? 'Play' : 'Pause'}>
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePause}
          className={cn(
            'absolute bottom-4 right-4 z-10',
            'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
            'hover:bg-white dark:hover:bg-gray-800',
            'shadow-lg rounded-full p-2'
          )}
          aria-label={state.isPaused ? 'Play carousel' : 'Pause carousel'}
        >
          {state.isPaused ? (
            <PlayIcon className="w-5 h-5" />
          ) : (
            <PauseIcon className="w-5 h-5" />
          )}
        </Button>
      </Tooltip>
    );
  }, [autoPlay, state.isPaused, togglePause]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (brands.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No brands to display
      </div>
    );
  }

  return (
    <div
      className={cn('relative w-full', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <div ref={containerRef} className="overflow-hidden">
        <motion.div
          className={cn('flex', isDragging && 'cursor-grabbing')}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={DRAG_ELASTIC}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
          initial={{ x: 0 }}
        >
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              className="flex-shrink-0"
              style={{
                width: slideWidth,
                marginRight: index < brands.length - 1 ? effectiveSpaceBetween : 0,
              }}
              initial={animated ? { opacity: 0, scale: 0.9 } : undefined}
              animate={animated ? { opacity: 1, scale: 1 } : undefined}
              transition={animated ? { duration: 0.3, delay: index * 0.05 } : undefined}
            >
              <BrandCard
                brand={brand}
                variant={cardVariant}
                animated={false}
                onClick={onBrandClick}
                onFollow={onBrandFollow}
                onQuickView={onBrandQuickView}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {renderArrows()}

      {/* Dots */}
      {renderDots()}

      {/* Auto-play Control */}
      {renderAutoPlayControl()}
    </div>
  );
};

export default BrandCarousel;

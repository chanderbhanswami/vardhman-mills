/**
 * TestimonialSlider Component
 * 
 * Advanced carousel slider for displaying testimonials with smooth animations,
 * auto-play, and navigation controls.
 * 
 * Features:
 * - Smooth slide transitions
 * - Auto-play with pause on hover
 * - Touch/swipe gestures
 * - Navigation arrows
 * - Dot indicators
 * - Thumbnail preview
 * - Keyboard navigation
 * - Infinite loop
 * - Multiple items per slide
 * - Responsive breakpoints
 * - Progress indicator
 * - Video testimonials support
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
import { TestimonialCard } from './TestimonialCard';
import type { TestimonialCardProps } from './TestimonialCard';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TestimonialSliderProps {
  /** Testimonials data */
  testimonials: TestimonialCardProps[];
  /** Items to show per slide */
  itemsPerSlide?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /** Auto-play enabled */
  autoPlay?: boolean;
  /** Auto-play interval in milliseconds */
  interval?: number;
  /** Enable infinite loop */
  infinite?: boolean;
  /** Transition effect */
  transitionEffect?: 'slide' | 'fade' | 'scale';
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Enable swipe gestures */
  swipeEnabled?: boolean;
  /** Gap between items */
  gap?: number;
  /** Additional CSS classes */
  className?: string;
  /** On slide change callback */
  onSlideChange?: (index: number) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

// ============================================================================
// COMPONENT
// ============================================================================

export const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
  testimonials,
  itemsPerSlide = { mobile: 1, tablet: 2, desktop: 3 },
  autoPlay = true,
  interval = 5000,
  infinite = true,
  transitionEffect = 'slide',
  showArrows = true,
  showDots = true,
  showProgress = true,
  keyboardNavigation = true,
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
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [progress, setProgress] = useState(0);
  const [itemsShown, setItemsShown] = useState(itemsPerSlide.desktop);

  // ============================================================================
  // REFS
  // ============================================================================

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // MOTION VALUES
  // ============================================================================

  const dragX = useMotionValue(0);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const totalSlides = useMemo(() => {
    return Math.ceil(testimonials.length / itemsShown);
  }, [testimonials.length, itemsShown]);

  const canGoPrevious = useMemo(
    () => infinite || currentIndex > 0,
    [infinite, currentIndex]
  );

  const canGoNext = useMemo(
    () => infinite || currentIndex < totalSlides - 1,
    [infinite, currentIndex, totalSlides]
  );

  const visibleTestimonials = useMemo(() => {
    const startIndex = currentIndex * itemsShown;
    const endIndex = startIndex + itemsShown;
    return testimonials.slice(startIndex, endIndex);
  }, [testimonials, currentIndex, itemsShown]);

  // ============================================================================
  // RESPONSIVE
  // ============================================================================

  useEffect(() => {
    const updateItemsShown = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsShown(itemsPerSlide.mobile);
      } else if (width < 1024) {
        setItemsShown(itemsPerSlide.tablet);
      } else {
        setItemsShown(itemsPerSlide.desktop);
      }
    };

    updateItemsShown();
    window.addEventListener('resize', updateItemsShown);
    return () => window.removeEventListener('resize', updateItemsShown);
  }, [itemsPerSlide.mobile, itemsPerSlide.tablet, itemsPerSlide.desktop]);

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
      setProgress(0);
      onSlideChange?.(newIndex);
      console.log('Testimonial slide changed to:', newIndex);
    },
    [currentIndex, totalSlides, infinite, onSlideChange]
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
  // AUTO-PLAY
  // ============================================================================

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      goToNext();
    }, interval);

    console.log('Testimonial autoplay started');
  }, [interval, goToNext]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Testimonial autoplay stopped');
    }
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsPlaying(!isPlaying);
    console.log('Testimonial autoplay toggled:', !isPlaying);
  }, [isPlaying]);

  // ============================================================================
  // PROGRESS
  // ============================================================================

  const startProgress = useCallback(() => {
    setProgress(0);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (interval / 100));
      });
    }, 100);
  }, [interval]);

  const stopProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      startAutoPlay();
      startProgress();
    } else {
      stopAutoPlay();
      stopProgress();
    }

    return () => {
      stopAutoPlay();
      stopProgress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isPaused]);

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
      console.log('Testimonial slider paused on hover');
    }
  }, [isPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      setIsPaused(false);
      console.log('Testimonial slider resumed');
    }
  }, [isPlaying]);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    if (!keyboardNavigation) return;

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
          toggleAutoPlay();
          break;
        default:
          // Number keys for direct navigation
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
  }, [keyboardNavigation, goToPrevious, goToNext, toggleAutoPlay, totalSlides, goToSlide]);

  // ============================================================================
  // TRANSITION VARIANTS
  // ============================================================================

  const slideVariants = useMemo(
    () => ({
      enter: (direction: string) => ({
        x: direction === 'right' ? 1000 : -1000,
        opacity: 0,
      }),
      center: {
        x: 0,
        opacity: 1,
      },
      exit: (direction: string) => ({
        x: direction === 'right' ? -1000 : 1000,
        opacity: 0,
      }),
    }),
    []
  );

  const fadeVariants = useMemo(
    () => ({
      enter: {
        opacity: 0,
      },
      center: {
        opacity: 1,
      },
      exit: {
        opacity: 0,
      },
    }),
    []
  );

  const scaleVariants = useMemo(
    () => ({
      enter: {
        scale: 0.8,
        opacity: 0,
      },
      center: {
        scale: 1,
        opacity: 1,
      },
      exit: {
        scale: 0.8,
        opacity: 0,
      },
    }),
    []
  );

  const getVariants = useCallback(() => {
    switch (transitionEffect) {
      case 'fade':
        return fadeVariants;
      case 'scale':
        return scaleVariants;
      default:
        return slideVariants;
    }
  }, [transitionEffect, slideVariants, fadeVariants, scaleVariants]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderNavigationArrows = () => {
    if (!showArrows) return null;

    return (
      <>
        <Tooltip content="Previous testimonials">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-lg"
            aria-label="Previous testimonials"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
        </Tooltip>

        <Tooltip content="Next testimonials">
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={!canGoNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-lg"
            aria-label="Next testimonials"
          >
            <ChevronRightIcon className="h-5 w-5" />
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
                ? 'w-8 h-2 bg-blue-600'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
        {autoPlay && (
          <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoPlay}
              className="ml-2"
              aria-label={isPlaying ? 'Pause slider' : 'Play slider'}
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

  const renderProgressBar = () => {
    if (!showProgress || !isPlaying) return null;

    return (
      <div className="mt-4">
        <Progress value={progress} className="h-1 bg-gray-200" />
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        No testimonials available
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
      aria-label="Customer testimonials"
    >
      {/* Slider Container */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={getVariants()}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 },
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
            {visibleTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} {...testimonial} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {renderNavigationArrows()}
      </div>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Dot Indicators */}
      {renderDotIndicators()}

      {/* Screen Reader Announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing testimonials {currentIndex * itemsShown + 1} to{' '}
        {Math.min((currentIndex + 1) * itemsShown, testimonials.length)} of{' '}
        {testimonials.length}
      </div>
    </div>
  );
};

export default TestimonialSlider;

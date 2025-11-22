/**
 * HeroSlider Component
 * 
 * Main hero slider container with advanced features including autoplay,
 * touch/swipe gestures, keyboard navigation, and accessibility.
 * 
 * Features:
 * - Slide management with smooth transitions
 * - Autoplay with customizable interval
 * - Touch/swipe gestures
 * - Keyboard navigation
 * - Infinite loop mode
 * - Slide preloading
 * - Multiple transition effects
 * - Responsive heights
 * - Accessibility features
 * - Fullscreen mode
 * - Progress tracking
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { HeroSlide } from './HeroSlide';
import { HeroControls } from './HeroControls';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SlideData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  thumbnail?: string;
  ctaPrimary?: {
    label: string;
    href: string;
  };
  ctaSecondary?: {
    label: string;
    href: string;
  };
  badges?: Array<{
    id: string;
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    icon?: React.ReactNode;
  }>;
  stats?: Array<{
    id: string;
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
  contentAlign?: 'left' | 'center' | 'right';
  contentVerticalAlign?: 'top' | 'center' | 'bottom';
  overlayColor?: string;
  overlayOpacity?: number;
  enableParallax?: boolean;
  enableKenBurns?: boolean;
  showCountdown?: boolean;
  countdownDate?: Date;
}

export interface HeroSliderProps {
  /** Slides data */
  slides: SlideData[];
  /** Autoplay enabled */
  autoPlay?: boolean;
  /** Autoplay interval in milliseconds */
  interval?: number;
  /** Enable infinite loop */
  infinite?: boolean;
  /** Transition effect */
  transitionEffect?: 'slide' | 'fade' | 'scale' | 'flip';
  /** Show controls */
  showControls?: boolean;
  /** Show thumbnails */
  showThumbnails?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Enable touch/swipe gestures */
  swipeEnabled?: boolean;
  /** Slider height */
  height?: 'small' | 'medium' | 'large' | 'full' | 'auto';
  /** Additional CSS classes */
  className?: string;
  /** On slide change callback */
  onSlideChange?: (index: number) => void;
  /** On autoplay toggle callback */
  onAutoplayToggle?: (isPlaying: boolean) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HEIGHT_VARIANTS = {
  small: 'h-[400px] sm:h-[500px]',
  medium: 'h-[500px] sm:h-[600px] lg:h-[700px]',
  large: 'h-[600px] sm:h-[700px] lg:h-[800px]',
  full: 'h-screen',
  auto: 'h-auto min-h-[500px]',
};

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

// ============================================================================
// COMPONENT
// ============================================================================

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  autoPlay = true,
  interval = 5000,
  infinite = true,
  transitionEffect = 'slide',
  showControls = true,
  showThumbnails = false,
  showProgress = true,
  keyboardNavigation = true,
  swipeEnabled = true,
  height = 'large',
  className,
  onSlideChange,
  onAutoplayToggle,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preloadedSlides, setPreloadedSlides] = useState<Set<number>>(new Set([0]));

  // ============================================================================
  // REFS
  // ============================================================================

  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // MOTION VALUES
  // ============================================================================

  const dragX = useMotionValue(0);
  const dragProgress = useTransform(dragX, [-300, 0, 300], [1, 0, -1]);
  const dragScaleX = useTransform(dragProgress, [-1, 0, 1], [0, 0, 0]);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const totalSlides = useMemo(() => slides.length, [slides.length]);
  
  const currentSlide = useMemo(() => slides[currentSlideIndex], [slides, currentSlideIndex]);

  const canGoPrevious = useMemo(
    () => infinite || currentSlideIndex > 0,
    [infinite, currentSlideIndex]
  );

  const canGoNext = useMemo(
    () => infinite || currentSlideIndex < totalSlides - 1,
    [infinite, currentSlideIndex, totalSlides]
  );

  // ============================================================================
  // SLIDE MANAGEMENT
  // ============================================================================

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      
      setDirection(index > currentSlideIndex ? 'right' : 'left');
      setCurrentSlideIndex(index);
      setProgress(0);
      
      // Preload adjacent slides
      setPreloadedSlides((prev) => {
        const newSet = new Set(prev);
        newSet.add(index);
        if (index > 0) newSet.add(index - 1);
        if (index < totalSlides - 1) newSet.add(index + 1);
        return newSet;
      });

      onSlideChange?.(index);
      console.log('Slide changed to:', index);
    },
    [currentSlideIndex, totalSlides, onSlideChange]
  );

  const goToNext = useCallback(() => {
    if (!canGoNext) return;

    if (infinite && currentSlideIndex === totalSlides - 1) {
      goToSlide(0);
    } else {
      goToSlide(currentSlideIndex + 1);
    }
  }, [canGoNext, infinite, currentSlideIndex, totalSlides, goToSlide]);

  const goToPrevious = useCallback(() => {
    if (!canGoPrevious) return;

    if (infinite && currentSlideIndex === 0) {
      goToSlide(totalSlides - 1);
    } else {
      goToSlide(currentSlideIndex - 1);
    }
  }, [canGoPrevious, infinite, currentSlideIndex, totalSlides, goToSlide]);

  // ============================================================================
  // AUTOPLAY
  // ============================================================================

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      goToNext();
    }, interval);

    console.log('Autoplay started');
  }, [interval, goToNext]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Autoplay stopped');
    }
  }, []);

  const toggleAutoplay = useCallback(() => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    onAutoplayToggle?.(newIsPlaying);
    console.log('Autoplay toggled:', newIsPlaying);
  }, [isPlaying, onAutoplayToggle]);

  // ============================================================================
  // PROGRESS TRACKING
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

  // ============================================================================
  // FULLSCREEN
  // ============================================================================

  const toggleFullscreen = useCallback(() => {
    if (!sliderRef.current) return;

    if (!isFullscreen) {
      if (sliderRef.current.requestFullscreen) {
        sliderRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }

    setIsFullscreen(!isFullscreen);
    console.log('Fullscreen toggled:', !isFullscreen);
  }, [isFullscreen]);

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
          toggleAutoplay();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
        default:
          // Number keys (1-9) for direct slide navigation
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
  }, [
    keyboardNavigation,
    goToPrevious,
    goToNext,
    toggleAutoplay,
    toggleFullscreen,
    isFullscreen,
    totalSlides,
    goToSlide,
  ]);

  // ============================================================================
  // SWIPE GESTURES
  // ============================================================================

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      
      const shouldGoNext = offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD;
      const shouldGoPrevious = offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD;

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
  // PAUSE ON HOVER
  // ============================================================================

  const handleMouseEnter = useCallback(() => {
    if (isPlaying) {
      setIsPaused(true);
      stopAutoplay();
      stopProgress();
      console.log('Autoplay paused on hover');
    }
  }, [isPlaying, stopAutoplay, stopProgress]);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying && isPaused) {
      setIsPaused(false);
      startAutoplay();
      startProgress();
      console.log('Autoplay resumed after hover');
    }
  }, [isPlaying, isPaused, startAutoplay, startProgress]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Autoplay effect
  useEffect(() => {
    if (isPlaying && !isPaused) {
      startAutoplay();
      startProgress();
    } else {
      stopAutoplay();
      stopProgress();
    }

    return () => {
      stopAutoplay();
      stopProgress();
    };
  }, [isPlaying, isPaused, startAutoplay, stopAutoplay, startProgress, stopProgress]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        scale: 1.2,
        opacity: 0,
      },
    }),
    []
  );

  const flipVariants = useMemo(
    () => ({
      enter: {
        rotateY: 90,
        opacity: 0,
      },
      center: {
        rotateY: 0,
        opacity: 1,
      },
      exit: {
        rotateY: -90,
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
      case 'flip':
        return flipVariants;
      default:
        return slideVariants;
    }
  }, [transitionEffect, slideVariants, fadeVariants, scaleVariants, flipVariants]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={sliderRef}
      className={cn(
        'relative overflow-hidden bg-gray-900',
        HEIGHT_VARIANTS[height],
        isFullscreen && 'fixed inset-0 z-50 h-screen',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero slider"
    >
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlideIndex}
          custom={direction}
          variants={getVariants()}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
            rotateY: { duration: 0.8 },
          }}
          drag={swipeEnabled ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="absolute inset-0"
        >
          <HeroSlide
            {...currentSlide}
            isActive={true}
          />
        </motion.div>
      </AnimatePresence>

      {/* Preload next slides */}
      <div className="hidden">
        {slides.map((slide, index) => {
          if (!preloadedSlides.has(index) || index === currentSlideIndex) return null;
          return (
            <div key={`preload-${slide.id}`}>
              {slide.imageUrl && (
                <link rel="preload" as="image" href={slide.imageUrl} />
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      {showControls && (
        <HeroControls
          totalSlides={totalSlides}
          currentSlide={currentSlideIndex}
          isPlaying={isPlaying}
          isFullscreen={isFullscreen}
          showThumbnails={showThumbnails}
          showProgress={showProgress}
          slides={slides}
          autoPlayInterval={interval}
          progress={progress}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onGoToSlide={goToSlide}
          onToggleAutoplay={toggleAutoplay}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {/* Drag progress indicator */}
      {swipeEnabled && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-white/30"
          style={{
            scaleX: dragScaleX,
          }}
        />
      )}

      {/* Accessibility announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Slide {currentSlideIndex + 1} of {totalSlides}: {currentSlide.title}
      </div>
    </div>
  );
};

export default HeroSlider;

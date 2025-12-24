/**
 * HeroControls Component
 * 
 * Control panel for the hero slider with navigation, autoplay controls,
 * progress indicators, and thumbnail navigation.
 * 
 * Features:
 * - Previous/Next navigation
 * - Dot indicators
 * - Thumbnail navigation
 * - Autoplay toggle
 * - Progress bar
 * - Slide counter
 * - Keyboard shortcuts info
 * - Fullscreen toggle
 * - Touch gesture support
 * - Accessibility features
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Slide {
  id: string;
  title: string;
  thumbnail?: string;
}

export interface HeroControlsProps {
  /** Total number of slides */
  totalSlides: number;
  /** Current slide index */
  currentSlide: number;
  /** Autoplay enabled */
  isPlaying: boolean;
  /** Fullscreen mode */
  isFullscreen?: boolean;
  /** Show thumbnails */
  showThumbnails?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Show slide counter */
  showCounter?: boolean;
  /** Slides data for thumbnails */
  slides?: Slide[];
  /** Autoplay interval in ms */
  autoPlayInterval?: number;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Control position */
  position?: 'bottom' | 'side';
  /** Additional CSS classes */
  className?: string;
  /** On previous slide */
  onPrevious?: () => void;
  /** On next slide */
  onNext?: () => void;
  /** On go to slide */
  onGoToSlide?: (index: number) => void;
  /** On toggle autoplay */
  onToggleAutoplay?: () => void;
  /** On toggle fullscreen */
  onToggleFullscreen?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const HeroControls: React.FC<HeroControlsProps> = ({
  totalSlides,
  currentSlide,
  isPlaying,
  isFullscreen = false,
  showThumbnails = false,
  showProgress = true,
  showCounter = true,
  slides = [],
  autoPlayInterval = 5000,
  progress = 0,
  position = 'bottom',
  className,
  onPrevious,
  onNext,
  onGoToSlide,
  onToggleAutoplay,
  onToggleFullscreen,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [hoveredSlide, setHoveredSlide] = useState<number | null>(null);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const canGoPrevious = useMemo(() => totalSlides > 1, [totalSlides]);
  const canGoNext = useMemo(() => totalSlides > 1, [totalSlides]);

  const progressPercentage = useMemo(() => {
    if (progress > 0) return progress;
    return ((currentSlide + 1) / totalSlides) * 100;
  }, [progress, currentSlide, totalSlides]);

  // Calculate remaining time for timer display
  const remainingTime = useMemo(() => {
    const totalSeconds = autoPlayInterval / 1000;
    const remaining = totalSeconds - (progress / 100) * totalSeconds;
    return Math.max(0, Math.ceil(remaining));
  }, [progress, autoPlayInterval]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePrevious = useCallback(() => {
    onPrevious?.();
    console.log('Previous slide clicked');
  }, [onPrevious]);

  const handleNext = useCallback(() => {
    onNext?.();
    console.log('Next slide clicked');
  }, [onNext]);

  const handleGoToSlide = useCallback(
    (index: number) => {
      onGoToSlide?.(index);
      console.log('Go to slide:', index);
    },
    [onGoToSlide]
  );

  const handleToggleAutoplay = useCallback(() => {
    onToggleAutoplay?.();
    console.log('Autoplay toggled:', !isPlaying);
  }, [onToggleAutoplay, isPlaying]);

  const handleToggleFullscreen = useCallback(() => {
    onToggleFullscreen?.();
    console.log('Fullscreen toggled:', !isFullscreen);
  }, [onToggleFullscreen, isFullscreen]);

  const handleToggleShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(!showKeyboardShortcuts);
    console.log('Keyboard shortcuts toggled:', !showKeyboardShortcuts);
  }, [showKeyboardShortcuts]);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  const keyboardShortcuts = useMemo(
    () => [
      { key: '←', description: 'Previous slide' },
      { key: '→', description: 'Next slide' },
      { key: 'Space', description: 'Toggle autoplay' },
      { key: 'F', description: 'Toggle fullscreen' },
      { key: 'Esc', description: 'Exit fullscreen' },
      { key: '1-9', description: 'Jump to slide' },
    ],
    []
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderNavigationButtons = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow-sm border border-gray-200/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow-sm border border-gray-200/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );


  const renderDotIndicators = () => (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => handleGoToSlide(index)}
          onMouseEnter={() => setHoveredSlide(index)}
          onMouseLeave={() => setHoveredSlide(null)}
          className={cn(
            'transition-all duration-300 rounded-full',
            index === currentSlide
              ? 'w-8 h-2.5 bg-blue-600 shadow-md'
              : 'w-2.5 h-2.5 bg-gray-400 hover:bg-gray-600',
            hoveredSlide === index && index !== currentSlide && 'w-4 bg-gray-500'
          )}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === currentSlide ? 'true' : 'false'}
        />
      ))}
    </div>
  );

  const renderThumbnails = () => (
    <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => handleGoToSlide(index)}
          onMouseEnter={() => setHoveredSlide(index)}
          onMouseLeave={() => setHoveredSlide(null)}
          className={cn(
            'relative flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden transition-all duration-300',
            index === currentSlide
              ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
              : 'opacity-60 hover:opacity-100 hover:scale-105',
            hoveredSlide === index && 'scale-105'
          )}
          aria-label={`Go to ${slide.title}`}
          aria-current={index === currentSlide ? 'true' : 'false'}
        >
          {slide.thumbnail ? (
            <Image
              src={slide.thumbnail}
              alt={slide.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{index + 1}</span>
            </div>
          )}
          {index === currentSlide && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
          )}
        </button>
      ))}
    </div>
  );

  const renderControls = () => (
    <div className="flex items-center gap-2">
      {/* Autoplay Toggle */}
      <button
        onClick={handleToggleAutoplay}
        className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow-sm border border-gray-200/50 transition-all duration-200"
        aria-label={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
      >
        {isPlaying ? (
          <PauseIcon className="h-4 w-4" />
        ) : (
          <PlayIcon className="h-4 w-4" />
        )}
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={handleToggleFullscreen}
        className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow-sm border border-gray-200/50 transition-all duration-200"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <ArrowsPointingInIcon className="h-4 w-4" />
        ) : (
          <ArrowsPointingOutIcon className="h-4 w-4" />
        )}
      </button>

      {/* Keyboard Shortcuts Info */}
      <button
        onClick={handleToggleShortcuts}
        className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow-sm border border-gray-200/50 transition-all duration-200"
        aria-label="Show keyboard shortcuts"
      >
        <InformationCircleIcon className="h-4 w-4" />
      </button>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Main Controls Container */}
      <div
        className={cn(
          'absolute z-40',
          position === 'bottom' && 'bottom-6 left-0 right-0 px-4 sm:px-6 lg:px-8',
          position === 'side' && 'right-6 top-1/2 -translate-y-1/2',
          className
        )}
      >
        <div
          className={cn(
            'max-w-7xl mx-auto',
            position === 'bottom' && 'flex flex-col gap-4',
            position === 'side' && 'flex flex-col gap-4'
          )}
        >
          {/* Progress Bar */}
          {showProgress && position === 'bottom' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="h-1 bg-gray-300/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Main Control Bar - Light Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={cn(
              'flex items-center justify-between gap-4 p-3 rounded-2xl',
              'bg-white/70 backdrop-blur-xl',
              'border border-white/40 shadow-lg shadow-black/5',
              position === 'side' && 'flex-col'
            )}
          >
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Navigation */}
              {renderNavigationButtons()}

              {/* Counter */}
              {showCounter && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm border border-gray-200/50">
                    {currentSlide + 1} / {totalSlides}
                  </span>
                  {isPlaying && (
                    <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium border border-green-200/50 tabular-nums">
                      {remainingTime}s
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Center Section - Dot Indicators */}
            {!showThumbnails && position === 'bottom' && renderDotIndicators()}

            {/* Right Section */}
            {renderControls()}
          </motion.div>

          {/* Thumbnails */}
          {showThumbnails && position === 'bottom' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="p-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5"
            >
              {renderThumbnails()}
            </motion.div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleToggleShortcuts}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Keyboard Shortcuts
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleShortcuts}
                  aria-label="Close shortcuts"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-3">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <span className="text-gray-700">
                      {shortcut.description}
                    </span>
                    <Badge variant="outline" className="font-mono bg-gray-100 text-gray-900 border-gray-300">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Currently showing slide {currentSlide + 1} of {totalSlides}.
        Autoplay is {isPlaying ? 'enabled' : 'disabled'}.
      </div>
    </>
  );
};

export default HeroControls;

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
import { Tooltip } from '@/components/ui/Tooltip';
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

  const canGoPrevious = useMemo(() => currentSlide > 0, [currentSlide]);
  const canGoNext = useMemo(() => currentSlide < totalSlides - 1, [currentSlide, totalSlides]);
  
  const progressPercentage = useMemo(() => {
    if (progress > 0) return progress;
    return ((currentSlide + 1) / totalSlides) * 100;
  }, [progress, currentSlide, totalSlides]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePrevious = useCallback(() => {
    if (!canGoPrevious) return;
    onPrevious?.();
    console.log('Previous slide');
  }, [canGoPrevious, onPrevious]);

  const handleNext = useCallback(() => {
    if (!canGoNext) return;
    onNext?.();
    console.log('Next slide');
  }, [canGoNext, onNext]);

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
      <Tooltip content="Previous slide (←)">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
      </Tooltip>
      <Tooltip content="Next slide (→)">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </Tooltip>
    </div>
  );

  const renderDotIndicators = () => (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <Tooltip
          key={index}
          content={slides[index]?.title || `Slide ${index + 1}`}
        >
          <button
            onClick={() => handleGoToSlide(index)}
            onMouseEnter={() => setHoveredSlide(index)}
            onMouseLeave={() => setHoveredSlide(null)}
            className={cn(
              'transition-all duration-300 rounded-full',
              index === currentSlide
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/70',
              hoveredSlide === index && index !== currentSlide && 'w-4'
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? 'true' : 'false'}
          />
        </Tooltip>
      ))}
    </div>
  );

  const renderThumbnails = () => (
    <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
      {slides.map((slide, index) => (
        <Tooltip key={slide.id} content={slide.title}>
          <button
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
        </Tooltip>
      ))}
    </div>
  );

  const renderControls = () => (
    <div className="flex items-center gap-2">
      {/* Autoplay Toggle */}
      <Tooltip content={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleAutoplay}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
          aria-label={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
        >
          {isPlaying ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
        </Button>
      </Tooltip>

      {/* Fullscreen Toggle */}
      <Tooltip content={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleFullscreen}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <ArrowsPointingInIcon className="h-4 w-4" />
          ) : (
            <ArrowsPointingOutIcon className="h-4 w-4" />
          )}
        </Button>
      </Tooltip>

      {/* Keyboard Shortcuts Info */}
      <Tooltip content="Keyboard shortcuts">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleShortcuts}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
          aria-label="Show keyboard shortcuts"
        >
          <InformationCircleIcon className="h-4 w-4" />
        </Button>
      </Tooltip>
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
          'absolute z-20',
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
              <Progress
                value={progressPercentage}
                className="h-1 bg-white/20"
              />
            </motion.div>
          )}

          {/* Main Control Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={cn(
              'flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-900/50 backdrop-blur-md border border-white/10',
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
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {currentSlide + 1} / {totalSlides}
                  </Badge>
                  {isPlaying && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">
                      {autoPlayInterval / 1000}s
                    </Badge>
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
              className="p-2 rounded-xl bg-gray-900/50 backdrop-blur-md border border-white/10"
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
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleShortcuts}
                  aria-label="Close shortcuts"
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-3">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <Badge variant="outline" className="font-mono">
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

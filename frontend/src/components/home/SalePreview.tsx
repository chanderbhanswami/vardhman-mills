'use client';

/**
 * SalePreview Component (Simplified)
 * 
 * Homepage sale/deals preview carousel with professional cards.
 * Full sale functionality available on dedicated /sales page.
 * 
 * @component
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, PanInfo } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  FireIcon,
  TagIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Sale {
  id: string;
  name: string;
  slug: string;
  description: string;
  discount: number;
  endDate: string;
  productCount: number;
  type: 'flash' | 'seasonal' | 'clearance' | 'festival';
  featured?: boolean;
}

interface SalePreviewProps {
  className?: string;
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
// MOCK DATA
// ============================================================================

const SALES: Sale[] = [
  {
    id: '1',
    name: 'Winter Clearance Sale',
    slug: 'winter-clearance-2025',
    description: 'Huge discounts on winter collection. Up to 70% off on selected items.',
    discount: 70,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    productCount: 250,
    type: 'clearance',
    featured: true,
  },
  {
    id: '2',
    name: 'Festival Special Offers',
    slug: 'festival-special-2025',
    description: 'Celebrate with incredible savings on premium textiles and home decor.',
    discount: 50,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    productCount: 180,
    type: 'festival',
    featured: true,
  },
  {
    id: '3',
    name: 'Flash Deal Friday',
    slug: 'flash-friday',
    description: 'Limited time offers every Friday. Grab them before they are gone!',
    discount: 40,
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    productCount: 50,
    type: 'flash',
  },
  {
    id: '4',
    name: 'Season End Sale',
    slug: 'season-end-sale',
    description: 'Massive discounts as we make room for new arrivals.',
    discount: 60,
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    productCount: 320,
    type: 'seasonal',
  },
  {
    id: '5',
    name: 'Buy More Save More',
    slug: 'buy-more-save-more',
    description: 'Stack your savings - bigger cart means bigger discounts!',
    discount: 35,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    productCount: 100,
    type: 'clearance',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTimeRemaining = (endDate: string) => {
  const total = new Date(endDate).getTime() - Date.now();
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h left`;
  } else {
    return 'Ending soon!';
  }
};

const getTypeColor = (type: Sale['type']) => {
  switch (type) {
    case 'flash':
      return 'from-red-500 to-orange-500';
    case 'festival':
      return 'from-purple-500 to-pink-500';
    case 'clearance':
      return 'from-blue-500 to-cyan-500';
    case 'seasonal':
      return 'from-green-500 to-teal-500';
    default:
      return 'from-primary-500 to-primary-600';
  }
};

const getTypeBadge = (type: Sale['type']) => {
  switch (type) {
    case 'flash':
      return { label: 'Flash Sale', icon: FireIcon };
    case 'festival':
      return { label: 'Festival', icon: TagIcon };
    case 'clearance':
      return { label: 'Clearance', icon: TagIcon };
    case 'seasonal':
      return { label: 'Seasonal', icon: TagIcon };
    default:
      return { label: 'Sale', icon: TagIcon };
  }
};

// ============================================================================
// SALE CARD COMPONENT
// ============================================================================

interface SaleCardProps {
  sale: Sale;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SaleCard: React.FC<SaleCardProps> = ({ sale, onMouseEnter, onMouseLeave }) => {
  const timeRemaining = getTimeRemaining(sale.endDate);
  const typeInfo = getTypeBadge(sale.type);
  const TypeIcon = typeInfo.icon;

  return (
    <div
      className="group h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
        {/* Header with Gradient */}
        <div className={cn(
          "relative h-32 bg-gradient-to-br flex items-center justify-center",
          getTypeColor(sale.type)
        )}>
          {/* Discount Badge */}
          <div className="text-center text-white">
            <div className="text-5xl font-bold tracking-tight">{sale.discount}%</div>
            <div className="text-sm font-medium opacity-90">OFF</div>
          </div>

          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full">
              <TypeIcon className="w-3.5 h-3.5" />
              {typeInfo.label}
            </span>
          </div>

          {/* Timer Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-black/20 backdrop-blur-sm text-white rounded-full">
              <ClockIcon className="w-3.5 h-3.5" />
              {timeRemaining}
            </span>
          </div>

          {/* Featured Badge */}
          {sale.featured && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-amber-400 text-amber-900 rounded-full shadow-lg">
                <FireIcon className="w-3.5 h-3.5" />
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 pt-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {sale.name}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
            {sale.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {sale.productCount}+ products
            </span>
            <Link
              href={`/sales/${sale.slug}`}
              className="inline-flex items-center gap-1.5 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors group/link"
            >
              Shop Now
              <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SalePreview: React.FC<SalePreviewProps> = ({ className }) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentItemsPerView, setCurrentItemsPerView] = useState(DEFAULT_ITEMS_PER_VIEW.desktop);

  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayInterval = 5000;

  // ============================================================================
  // RESPONSIVE ITEMS PER VIEW
  // ============================================================================

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCurrentItemsPerView(DEFAULT_ITEMS_PER_VIEW.mobile);
      } else if (width < 1024) {
        setCurrentItemsPerView(DEFAULT_ITEMS_PER_VIEW.tablet);
      } else {
        setCurrentItemsPerView(DEFAULT_ITEMS_PER_VIEW.desktop);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalSlides = useMemo(() => {
    return Math.ceil(SALES.length / currentItemsPerView);
  }, [currentItemsPerView]);

  const canGoNext = useMemo(() => {
    return currentIndex < totalSlides - 1 || true;
  }, [currentIndex, totalSlides]);

  const canGoPrev = useMemo(() => {
    return currentIndex > 0 || true;
  }, [currentIndex]);

  // ============================================================================
  // AUTO PLAY
  // ============================================================================

  const startAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    autoPlayTimerRef.current = setInterval(() => {
      if (isPlaying && !isHovered && !isPausedByUser) {
        setCurrentIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex >= totalSlides ? 0 : nextIndex;
        });
      }
    }, autoPlayInterval);
  }, [isPlaying, isHovered, isPausedByUser, totalSlides]);

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
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= totalSlides ? 0 : nextIndex;
    });
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const prevIndex = prev - 1;
      return prevIndex < 0 ? totalSlides - 1 : prevIndex;
    });
  }, [totalSlides]);

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
  // RENDER
  // ============================================================================

  const translateX = -(currentIndex * 100);
  const gap = 24;

  if (SALES.length === 0) {
    return (
      <div className={cn('relative text-center py-12', className)}>
        <p className="text-gray-500">No sales available right now</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={carouselRef}>
      {/* Main Carousel Wrapper */}
      <div className="overflow-hidden py-4">
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
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {SALES.map((sale) => {
            const widthPercent = 100 / currentItemsPerView;
            const gapHalf = gap / 2;
            const itemStyle = {
              width: `${widthPercent}%`,
              paddingLeft: `${gapHalf}px`,
              paddingRight: `${gapHalf}px`,
            };
            return (
              <div
                key={sale.id}
                className="flex-shrink-0"
                style={itemStyle}
              >
                <SaleCard
                  sale={sale}
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls Bar - Bottom (matching other carousels) */}
      {SALES.length > currentItemsPerView && (
        <div className="relative flex items-center justify-end gap-6 mt-6">
          {/* Pagination Dots & Play/Pause (Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
            {/* Play/Pause Button */}
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

            {/* Dots */}
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
          </div>

          {/* Navigation Arrows (Right) */}
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
        </div>
      )}

      {/* Accessibility */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing slide {currentIndex + 1} of {totalSlides}
      </div>
    </div>
  );
};

export default SalePreview;

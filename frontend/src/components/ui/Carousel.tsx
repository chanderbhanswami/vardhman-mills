'use client';

import React, { forwardRef, useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// Carousel variants
const carouselVariants = cva(
  'relative w-full overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-background',
        fade: 'bg-background',
        slide: 'bg-background',
        scale: 'bg-background',
      },
      size: {
        sm: 'h-48',
        md: 'h-64',
        lg: 'h-96',
        xl: 'h-[32rem]',
        auto: 'h-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Carousel item interface
export interface CarouselItem {
  id: string;
  content: React.ReactNode;
  image?: string;
  title?: string;
  description?: string;
  link?: string;
}

// Carousel Props
export interface CarouselProps extends VariantProps<typeof carouselVariants> {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  loop?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  swipeable?: boolean;
  dragThreshold?: number;
  animationType?: 'slide' | 'fade' | 'scale' | 'flip';
  direction?: 'horizontal' | 'vertical';
  itemsPerView?: number;
  gap?: number;
  centerMode?: boolean;
  initialSlide?: number;
  className?: string;
  itemClassName?: string;
  onSlideChange?: (index: number) => void;
}

// Carousel ref interface
export interface CarouselRef {
  goNext: () => void;
  goPrevious: () => void;
  goToSlide: (index: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentIndex: () => number;
}

// Main Carousel Component
export const Carousel = forwardRef<CarouselRef, CarouselProps>(
  ({
    items,
    autoPlay = false,
    interval = 3000,
    loop = true,
    showDots = true,
    showArrows = true,
    showProgress = false,
    pauseOnHover = true,
    swipeable = true,
    dragThreshold = 50,
    animationType = 'slide',
    direction = 'horizontal',
    itemsPerView = 1,
    gap = 0,
    centerMode = false,
    initialSlide = 0,
    variant = 'default',
    size = 'md',
    className,
    itemClassName,
    onSlideChange,
    ...props
  }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(initialSlide);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isDragging, setIsDragging] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const totalItems = items.length;
    const maxIndex = Math.max(0, totalItems - itemsPerView);
    
    // Navigation functions
    const goNext = useCallback(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next > maxIndex) {
          return loop ? 0 : prev;
        }
        return next;
      });
    }, [maxIndex, loop]);
    
    const goPrevious = useCallback(() => {
      setCurrentIndex(prev => {
        const previous = prev - 1;
        if (previous < 0) {
          return loop ? maxIndex : prev;
        }
        return previous;
      });
    }, [maxIndex, loop]);
    
    const goToSlide = useCallback((index: number) => {
      if (index >= 0 && index <= maxIndex) {
        setCurrentIndex(index);
      }
    }, [maxIndex]);
    
    const play = useCallback(() => {
      setIsPlaying(true);
    }, []);
    
    const pause = useCallback(() => {
      setIsPlaying(false);
    }, []);
    
    // Auto-play logic
    useEffect(() => {
      if (isPlaying && !isDragging) {
        intervalRef.current = setInterval(goNext, interval);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [isPlaying, isDragging, goNext, interval]);
    
    // Notify slide change
    useEffect(() => {
      onSlideChange?.(currentIndex);
    }, [currentIndex, onSlideChange]);
    
    // Imperative API
    useImperativeHandle(ref, () => ({
      goNext,
      goPrevious,
      goToSlide,
      play,
      pause,
      getCurrentIndex: () => currentIndex,
    }), [goNext, goPrevious, goToSlide, play, pause, currentIndex]);
    
    // Swipe handlers
    const handleDragStart = () => {
      setIsDragging(true);
    };
    
    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      
      if (!swipeable) return;
      
      const offset = direction === 'horizontal' ? info.offset.x : info.offset.y;
      const velocity = direction === 'horizontal' ? info.velocity.x : info.velocity.y;
      
      if (Math.abs(offset) > dragThreshold || Math.abs(velocity) > 500) {
        if (offset > 0 || velocity > 0) {
          goPrevious();
        } else {
          goNext();
        }
      }
    };
    
    // Mouse handlers for pause on hover
    const handleMouseEnter = () => {
      if (pauseOnHover && isPlaying) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };
    
    const handleMouseLeave = () => {
      if (pauseOnHover && isPlaying) {
        intervalRef.current = setInterval(goNext, interval);
      }
    };
    
    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target === containerRef.current || containerRef.current?.contains(e.target as Node)) {
          switch (e.key) {
            case 'ArrowRight':
              e.preventDefault();
              if (direction === 'horizontal') goNext();
              break;
            case 'ArrowLeft':
              e.preventDefault();
              if (direction === 'horizontal') goPrevious();
              break;
            case 'ArrowUp':
              e.preventDefault();
              if (direction === 'vertical') goPrevious();
              break;
            case 'ArrowDown':
              e.preventDefault();
              if (direction === 'vertical') goNext();
              break;
            case ' ':
              e.preventDefault();
              if (isPlaying) pause();
              else play();
              break;
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [direction, goNext, goPrevious, isPlaying, play, pause]);
    
    // Animation variants
    const getAnimationVariants = () => {
      const isHorizontal = direction === 'horizontal';
      
      switch (animationType) {
        case 'fade':
          return {
            enter: { opacity: 0 },
            center: { opacity: 1 },
            exit: { opacity: 0 },
          };
        case 'scale':
          return {
            enter: { scale: 0.8, opacity: 0 },
            center: { scale: 1, opacity: 1 },
            exit: { scale: 1.2, opacity: 0 },
          };
        case 'flip':
          return {
            enter: { rotateY: isHorizontal ? 90 : 0, rotateX: isHorizontal ? 0 : 90, opacity: 0 },
            center: { rotateY: 0, rotateX: 0, opacity: 1 },
            exit: { rotateY: isHorizontal ? -90 : 0, rotateX: isHorizontal ? 0 : -90, opacity: 0 },
          };
        default: // slide
          return {
            enter: { 
              x: isHorizontal ? 300 : 0, 
              y: isHorizontal ? 0 : 300, 
              opacity: 0 
            },
            center: { x: 0, y: 0, opacity: 1 },
            exit: { 
              x: isHorizontal ? -300 : 0, 
              y: isHorizontal ? 0 : -300, 
              opacity: 0 
            },
          };
      }
    };
    
    const variants = getAnimationVariants();
    
    return (
      <div
        ref={containerRef}
        className={cn(carouselVariants({ variant, size }), className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="region"
        aria-roledescription="carousel"
        aria-label="Image carousel"
        tabIndex={0}
        {...props}
      >
        {/* Main Content */}
        <div className="relative h-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              drag={swipeable ? (direction === 'horizontal' ? 'x' : 'y') : false}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              className="absolute inset-0"
            >
              {itemsPerView === 1 ? (
                <div className={cn('w-full h-full', itemClassName)}>
                  {items[currentIndex]?.content}
                </div>
              ) : (
                <div 
                  className={cn(
                    'flex h-full',
                    direction === 'horizontal' ? 'flex-row' : 'flex-col',
                    gap > 0 && 'gap-4'
                  )}
                >
                  {items.slice(currentIndex, currentIndex + itemsPerView).map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex-1',
                        centerMode && itemIndex === Math.floor(itemsPerView / 2) && 'scale-105 z-10',
                        itemClassName
                      )}
                    >
                      {item.content}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation Arrows */}
        {showArrows && totalItems > itemsPerView && (
          <>
            <button
              onClick={goPrevious}
              disabled={!loop && currentIndex === 0}
              className={cn(
                'absolute z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                direction === 'horizontal' 
                  ? 'left-4 top-1/2 -translate-y-1/2'
                  : 'top-4 left-1/2 -translate-x-1/2 rotate-90'
              )}
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={goNext}
              disabled={!loop && currentIndex >= maxIndex}
              className={cn(
                'absolute z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                direction === 'horizontal'
                  ? 'right-4 top-1/2 -translate-y-1/2'
                  : 'bottom-4 left-1/2 -translate-x-1/2 rotate-90'
              )}
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}
        
        {/* Play/Pause Button */}
        {autoPlay && (
          <button
            onClick={() => isPlaying ? pause() : play()}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
          >
            {isPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
          </button>
        )}
        
        {/* Progress Bar */}
        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
        
        {/* Dots Indicator */}
        {showDots && totalItems > 1 && (
          <div 
            className={cn(
              'absolute flex gap-2 z-10',
              direction === 'horizontal'
                ? 'bottom-4 left-1/2 -translate-x-1/2'
                : 'right-4 top-1/2 -translate-y-1/2 flex-col'
            )}
          >
            {Array.from({ length: itemsPerView === 1 ? totalItems : maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/40 hover:bg-white/60'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

Carousel.displayName = 'Carousel';

// Carousel Item Component
export interface CarouselItemProps {
  children: React.ReactNode;
  className?: string;
}

export const CarouselItem = forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('w-full h-full flex items-center justify-center', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CarouselItem.displayName = 'CarouselItem';

// Image Carousel Component
export interface ImageCarouselProps extends Omit<CarouselProps, 'items'> {
  images: {
    id: string;
    src: string;
    alt?: string;
    title?: string;
    description?: string;
  }[];
}

export const ImageCarousel = forwardRef<CarouselRef, ImageCarouselProps>(
  ({ images, ...props }, ref) => {
    const items: CarouselItem[] = images.map(image => ({
      id: image.id,
      content: (
        <div className="relative w-full h-full">
          <Image
            src={image.src}
            alt={image.alt || image.title || 'Carousel image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {(image.title || image.description) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
              {image.title && (
                <h3 className="font-medium mb-1">{image.title}</h3>
              )}
              {image.description && (
                <p className="text-sm opacity-90">{image.description}</p>
              )}
            </div>
          )}
        </div>
      ),
    }));
    
    return <Carousel ref={ref} items={items} {...props} />;
  }
);

ImageCarousel.displayName = 'ImageCarousel';

// Card Carousel Component
export interface CardCarouselProps extends Omit<CarouselProps, 'items'> {
  cards: {
    id: string;
    title?: string;
    description?: string;
    image?: string;
    content?: React.ReactNode;
    action?: React.ReactNode;
  }[];
}

export const CardCarousel = forwardRef<CarouselRef, CardCarouselProps>(
  ({ cards, ...props }, ref) => {
    const items: CarouselItem[] = cards.map(card => ({
      id: card.id,
      content: (
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
          {card.image && (
            <div className="relative h-48">
              <Image
                src={card.image}
                alt={card.title || 'Card image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          <div className="p-4 flex-1 flex flex-col">
            {card.title && (
              <h3 className="font-medium text-lg mb-2">{card.title}</h3>
            )}
            {card.description && (
              <p className="text-gray-600 mb-4 flex-1">{card.description}</p>
            )}
            {card.content}
            {card.action && (
              <div className="mt-auto pt-4">
                {card.action}
              </div>
            )}
          </div>
        </div>
      ),
    }));
    
    return <Carousel ref={ref} items={items} {...props} />;
  }
);

CardCarousel.displayName = 'CardCarousel';

export default Carousel;

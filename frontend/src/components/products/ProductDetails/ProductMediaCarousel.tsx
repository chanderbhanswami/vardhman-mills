'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product.types';
import { ImageAsset, VideoAsset } from '@/types/common.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface ProductMediaCarouselProps {
  product: Product;
  selectedVariant?: ProductVariant;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  enableSwipe?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
}

type MediaItem = 
  | (ImageAsset & { mediaType: 'image' })
  | (VideoAsset & { mediaType: 'video' });

const ProductMediaCarousel: React.FC<ProductMediaCarouselProps> = ({
  product,
  selectedVariant,
  className,
  autoPlay = false,
  autoPlayInterval = 3000,
  enableSwipe = true,
  showControls = true,
  showIndicators = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get media items from variant or product
  const images = selectedVariant?.media?.images || product.media.images || [];
  const videos = selectedVariant?.media?.videos || product.media.videos || [];
  
  const mediaItems: MediaItem[] = [
    ...images.map(img => ({ ...img, mediaType: 'image' as const })),
    ...(videos || []).map(vid => ({ ...vid, mediaType: 'video' as const }))
  ];

  const currentMedia = mediaItems[currentIndex];

  // Auto play functionality
  useEffect(() => {
    if (isAutoPlaying && !isPaused && mediaItems.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, isPaused, mediaItems.length, autoPlayInterval]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrevious();
    } else if (info.offset.x < -threshold) {
      handleNext();
    }
  };

  if (mediaItems.length === 0) {
    return (
      <div className={cn('aspect-square bg-gray-100 rounded-lg flex items-center justify-center', className)}>
        <p className="text-gray-400">No media available</p>
      </div>
    );
  }

  return (
    <div 
      className={cn('relative group', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            drag={enableSwipe ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            {currentMedia.mediaType === 'image' ? (
              <Image
                src={currentMedia.url}
                alt={'alt' in currentMedia ? currentMedia.alt : product.name}
                fill
                className="object-contain"
                priority={currentIndex === 0}
              />
            ) : (
              <video
                src={currentMedia.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                loop
                muted
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        {showControls && mediaItems.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous media"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next media"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Auto Play Control */}
        {autoPlay && mediaItems.length > 1 && (
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleAutoPlay}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label={isAutoPlaying ? 'Pause autoplay' : 'Start autoplay'}
          >
            {isAutoPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Counter */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {mediaItems.length}
        </div>
      </div>

      {/* Indicators */}
      {showIndicators && mediaItems.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                currentIndex === index
                  ? 'w-8 bg-primary-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to media ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductMediaCarousel;

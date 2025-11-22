'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Product, ProductVariant } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, Maximize2, ZoomIn } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface ProductImagesProps {
  product: Product;
  variant?: ProductVariant;
  className?: string;
  aspectRatio?: 'square' | '3/4' | '16/9' | 'auto';
  showThumbnails?: boolean;
  showZoom?: boolean;
  showVideoControls?: boolean;
  autoPlay?: boolean;
  enableSwipe?: boolean;
  onImageClick?: (index: number) => void;
  priority?: boolean;
  sizes?: string;
}

export const ProductImages: React.FC<ProductImagesProps> = ({
  product,
  variant,
  className,
  aspectRatio = 'square',
  showThumbnails = false,
  showZoom = true,
  showVideoControls = true,
  autoPlay = false,
  onImageClick,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}) => {
  // Handle both backend and frontend image structures
  const getImages = () => {
    // Check variant first
    if (variant?.media?.images) return variant.media.images;
    if (variant?.images) return variant.images.map(url => ({ url, alt: product.name }));
    
    // Check product
    if (product.media?.images) return product.media.images;
    if (product.images) return product.images.map(url => ({ url, alt: product.name }));
    if (product.image) return [{ url: product.image, alt: product.name }];
    
    return [];
  };
  
  const getVideos = () => {
    if (variant?.media?.videos) return variant.media.videos;
    if (product.media?.videos) return product.media.videos;
    return [];
  };
  
  const images = getImages();
  const videos = getVideos();
  
  const allMedia = [
    ...images.map(img => ({ 
      ...img, 
      type: 'image' as const,
      url: typeof img === 'string' ? img : img.url,
      alt: typeof img === 'string' ? product.name : (img.alt || product.name)
    })),
    ...videos.map(vid => ({ ...vid, type: 'video' as const })),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const currentMedia = allMedia[currentIndex] || allMedia[0];

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
    setIsZoomed(false);
  }, [allMedia.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  }, [allMedia.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  }, []);

  const handleImageClick = useCallback(() => {
    if (currentMedia.type === 'image') {
      if (showZoom) {
        setIsZoomed(!isZoomed);
      }
      onImageClick?.(currentIndex);
    }
  }, [currentMedia, showZoom, isZoomed, onImageClick, currentIndex]);

  const toggleVideoPlay = useCallback(() => {
    setIsVideoPlaying(!isVideoPlaying);
  }, [isVideoPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const aspectRatioClasses = {
    square: 'aspect-square',
    '3/4': 'aspect-[3/4]',
    '16/9': 'aspect-video',
    auto: 'aspect-auto',
  };

  if (!currentMedia) {
    return (
      <div className={cn('relative overflow-hidden bg-gray-100 rounded-lg', aspectRatioClasses[aspectRatio], className)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No image available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative group', className)}>
      {/* Main Media Display */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg bg-gray-50',
          aspectRatioClasses[aspectRatio],
          showZoom && 'cursor-zoom-in',
          isZoomed && 'cursor-zoom-out'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleImageClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            {currentMedia.type === 'image' ? (
              <Image
                src={currentMedia.url}
                alt={currentMedia.alt || product.name}
                fill
                className={cn(
                  'object-cover transition-transform duration-300',
                  isHovered && !isZoomed && 'scale-105'
                )}
                sizes={sizes}
                priority={priority && currentIndex === 0}
                quality={85}
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={currentMedia.url}
                  className="w-full h-full object-cover"
                  autoPlay={isVideoPlaying}
                  loop
                  muted={isMuted}
                  playsInline
                />
                {showVideoControls && (
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVideoPlay();
                      }}
                      className="p-1.5 hover:bg-white/20 rounded transition-colors"
                      aria-label={isVideoPlaying ? 'Pause' : 'Play'}
                    >
                      <Play className={cn('h-4 w-4 text-white', isVideoPlaying && 'fill-current')} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="p-1.5 hover:bg-white/20 rounded transition-colors"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4 text-white" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-white" />
                      )}
                    </button>
                    <Badge variant="secondary" className="text-xs">Video</Badge>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Zoom Icon */}
        {showZoom && currentMedia.type === 'image' && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-2"
          >
            {isZoomed ? (
              <Maximize2 className="h-4 w-4 text-white" />
            ) : (
              <ZoomIn className="h-4 w-4 text-white" />
            )}
          </motion.div>
        )}

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200',
                'opacity-0 group-hover:opacity-100',
                isHovered && 'opacity-100'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 text-gray-900" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200',
                'opacity-0 group-hover:opacity-100',
                isHovered && 'opacity-100'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 text-gray-900" />
            </button>
          </>
        )}

        {/* Media Counter */}
        {allMedia.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {allMedia.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && allMedia.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200',
                currentIndex === index
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-gray-300'
              )}
              aria-label={`View image ${index + 1}`}
            >
              {media.type === 'image' ? (
                <Image
                  src={media.url}
                  alt={media.alt || `${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                  <Play className="h-6 w-6 text-gray-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;

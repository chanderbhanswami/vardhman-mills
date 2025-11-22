'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product.types';
import { ImageAsset, VideoAsset } from '@/types/common.types';
import { cn } from '@/lib/utils';
import ProductImageZoom from './ProductImageZoom';

export interface ProductGalleryProps {
  product: Product;
  selectedVariant?: ProductVariant;
  className?: string;
  showThumbnails?: boolean;
  showZoom?: boolean;
  autoPlay?: boolean;
}

type MediaItem = 
  | (ImageAsset & { mediaType: 'image' })
  | (VideoAsset & { mediaType: 'video' });

const ProductGallery: React.FC<ProductGalleryProps> = ({
  product,
  selectedVariant,
  className,
  showThumbnails = true,
  showZoom = true,
  autoPlay = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);

  // Get media items from variant or product
  const images = selectedVariant?.media?.images || product.media.images || [];
  const videos = selectedVariant?.media?.videos || product.media.videos || [];
  
  const mediaItems: MediaItem[] = [
    ...images.map(img => ({ ...img, mediaType: 'image' as const })),
    ...(videos || []).map(vid => ({ ...vid, mediaType: 'video' as const }))
  ];
  
  const currentMedia = mediaItems[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (!currentMedia) {
    return (
      <div className={cn('aspect-square bg-gray-100 rounded-lg flex items-center justify-center', className)}>
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Display */}
      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {currentMedia.mediaType === 'image' ? (
              showZoom ? (
                <ProductImageZoom
                  src={currentMedia.url}
                  alt={'alt' in currentMedia ? currentMedia.alt : product.name}
                />
              ) : (
                <Image
                  src={currentMedia.url}
                  alt={'alt' in currentMedia ? currentMedia.alt : product.name}
                  fill
                  className="object-contain"
                  priority={currentIndex === 0}
                />
              )
            ) : currentMedia.mediaType === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  src={currentMedia.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay={isPlaying}
                  muted={isMuted}
                  loop
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="h-4 w-4 text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-white" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Counter */}
        {mediaItems.length > 1 && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
            {currentIndex + 1} / {mediaItems.length}
          </div>
        )}

        {/* Media Type Badge */}
        {currentMedia.mediaType === 'video' && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-full">
            VIDEO
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && mediaItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mediaItems.map((media, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                currentIndex === index
                  ? 'border-primary-600 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Image
                src={media.mediaType === 'video' && 'thumbnail' in media && media.thumbnail ? media.thumbnail.url : media.url}
                alt={media.mediaType === 'image' && 'alt' in media ? media.alt : `${product.name} image ${index + 1}`}
                fill
                className="object-cover"
              />
              {media.mediaType === 'video' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;

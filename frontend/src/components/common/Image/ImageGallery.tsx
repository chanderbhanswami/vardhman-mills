'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import OptimizedImage from './OptimizedImage';

export interface ImageItem {
  id: string | number;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface ImageGalleryProps {
  images: ImageItem[];
  className?: string;
  variant?: 'grid' | 'masonry' | 'carousel' | 'slider';
  columns?: 2 | 3 | 4 | 5 | 6;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  gap?: 'sm' | 'md' | 'lg';
  showThumbnails?: boolean;
  showControls?: boolean;
  showCounter?: boolean;
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onImageClick?: (image: ImageItem, index: number) => void;
  onImageLoad?: (image: ImageItem, index: number) => void;
  onImageError?: (image: ImageItem, index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = '',
  variant = 'grid',
  columns = 3,
  aspectRatio = 'auto',
  gap = 'md',
  showThumbnails = true,
  showControls = true,
  showCounter = true,
  enableZoom = true,
  enableFullscreen = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  onImageClick,
  onImageLoad,
  onImageError,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [autoPlayActive, setAutoPlayActive] = useState(autoPlay);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlayActive || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlayActive, autoPlayInterval, images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const openFullscreen = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
    setAutoPlayActive(false); // Pause autoplay in fullscreen
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setIsZoomed(false);
    setZoomScale(1);
  }, []);

  const toggleZoom = useCallback(() => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomScale(1);
    } else {
      setIsZoomed(true);
      setZoomScale(2);
    }
  }, [isZoomed]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlayActive(prev => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (event.key) {
        case 'Escape':
          closeFullscreen();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case ' ':
          event.preventDefault();
          toggleAutoPlay();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, closeFullscreen, goToPrevious, goToNext, toggleAutoPlay]);

  const handleImageClick = useCallback((image: ImageItem, index: number) => {
    onImageClick?.(image, index);
    if (enableFullscreen) {
      openFullscreen(index);
    }
  }, [enableFullscreen, onImageClick, openFullscreen]);

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  const renderGridView = () => (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}>
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-lg cursor-pointer group ${aspectRatioClasses[aspectRatio]}`}
          onClick={() => handleImageClick(image, index)}
          whileHover={{ scale: 1.02 }}
        >
          <OptimizedImage
            src={image.thumbnail || image.src}
            alt={image.alt}
            fill={aspectRatio !== 'auto'}
            width={aspectRatio === 'auto' ? image.width : undefined}
            height={aspectRatio === 'auto' ? image.height : undefined}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onLoad={() => onImageLoad?.(image, index)}
            onError={() => onImageError?.(image, index)}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          
          {/* Zoom icon */}
          {enableZoom && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="p-1.5 bg-white/90 rounded-full">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-700" />
              </div>
            </div>
          )}
          
          {/* Image info */}
          {image.title && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-white text-sm font-medium truncate">
                {image.title}
              </h3>
              {image.description && (
                <p className="text-white/80 text-xs mt-1 line-clamp-2">
                  {image.description}
                </p>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  const renderCarouselView = () => (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-video"
          >
            <OptimizedImage
              src={images[currentIndex]?.src}
              alt={images[currentIndex]?.alt}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Controls */}
      {showControls && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200"
            aria-label="Previous image"
            title="Previous image"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200"
            aria-label="Next image"
            title="Next image"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}
      
      {/* Counter */}
      {showCounter && (
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}
      
      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              className={`
                flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200
                ${index === currentIndex
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              aria-label={`Go to image ${index + 1}`}
              title={`Go to image ${index + 1}`}
            >
              <OptimizedImage
                src={image.thumbnail || image.src}
                alt={image.alt}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderFullscreenModal = () => (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              aria-label="Close fullscreen"
              title="Close fullscreen"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            {/* Image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: isZoomed ? zoomScale : 1 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-full max-h-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (enableZoom) toggleZoom();
              }}
            >
              <OptimizedImage
                src={images[currentIndex]?.src}
                alt={images[currentIndex]?.alt}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </motion.div>
            
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  aria-label="Previous image"
                  title="Previous image"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  aria-label="Next image"
                  title="Next image"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Info panel */}
            {(images[currentIndex]?.title || images[currentIndex]?.description) && (
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-sm text-white rounded-lg">
                {images[currentIndex]?.title && (
                  <h3 className="font-semibold text-lg mb-1">
                    {images[currentIndex].title}
                  </h3>
                )}
                {images[currentIndex]?.description && (
                  <p className="text-gray-300">
                    {images[currentIndex].description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-400">
                    {currentIndex + 1} of {images.length}
                  </span>
                  {enableZoom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleZoom();
                      }}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      aria-label="Toggle zoom"
                      title="Toggle zoom"
                    >
                      <ArrowsPointingOutIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!images.length) {
    return (
      <div className="flex items-center justify-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No images to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`image-gallery ${className}`}>
      {variant === 'carousel' || variant === 'slider' ? renderCarouselView() : renderGridView()}
      {enableFullscreen && renderFullscreenModal()}
    </div>
  );
};

export default ImageGallery;
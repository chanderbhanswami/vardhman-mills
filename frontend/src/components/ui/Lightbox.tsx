'use client';

import React, { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Lightbox variants
const lightboxVariants = cva(
  'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm',
  {
    variants: {
      variant: {
        default: 'bg-black/80',
        dark: 'bg-black/90',
        light: 'bg-white/90',
        blur: 'bg-black/60 backdrop-blur-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const lightboxContentVariants = cva(
  'relative max-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden',
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw] max-h-[95vh]',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);

// Media item interface
export interface MediaItem {
  id: string;
  src: string;
  type: 'image' | 'video';
  alt?: string;
  caption?: string;
  title?: string;
  thumbnail?: string;
}

// Lightbox Props
export interface LightboxProps extends VariantProps<typeof lightboxVariants> {
  isOpen?: boolean;
  onClose?: () => void;
  media?: MediaItem[];
  initialIndex?: number;
  size?: VariantProps<typeof lightboxContentVariants>['size'];
  showThumbnails?: boolean;
  showNavigation?: boolean;
  showCounter?: boolean;
  showCaption?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  keyboardNavigation?: boolean;
  closeOnClickOutside?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Main Lightbox Component
export const Lightbox = forwardRef<HTMLDivElement, LightboxProps>(
  ({
    isOpen = false,
    onClose,
    media = [],
    initialIndex = 0,
    variant = 'default',
    size = 'lg',
    showThumbnails = true,
    showNavigation = true,
    showCounter = true,
    showCaption = true,
    autoPlay = false,
    loop = true,
    keyboardNavigation = true,
    closeOnClickOutside = true,
    className,
    children,
    ...props
  }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isLoading, setIsLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const currentItem = media[currentIndex];
    
    // Navigation functions
    const goNext = useCallback(() => {
      if (currentIndex < media.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (loop) {
        setCurrentIndex(0);
      }
    }, [currentIndex, media.length, loop]);
    
    const goPrevious = useCallback(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (loop) {
        setCurrentIndex(media.length - 1);
      }
    }, [currentIndex, media.length, loop]);
    
    const goToIndex = useCallback((index: number) => {
      if (index >= 0 && index < media.length) {
        setCurrentIndex(index);
      }
    }, [media.length]);
    
    // Keyboard navigation
    useEffect(() => {
      if (!isOpen || !keyboardNavigation) return;
      
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'Escape':
            onClose?.();
            break;
          case 'ArrowRight':
            goNext();
            break;
          case 'ArrowLeft':
            goPrevious();
            break;
          case 'Home':
            goToIndex(0);
            break;
          case 'End':
            goToIndex(media.length - 1);
            break;
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, keyboardNavigation, onClose, goNext, goPrevious, goToIndex, media.length]);
    
    // Auto-play for videos
    useEffect(() => {
      if (autoPlay && currentItem?.type === 'video' && videoRef.current) {
        videoRef.current.play();
      }
    }, [autoPlay, currentItem]);
    
    // Reset index when media changes
    useEffect(() => {
      setCurrentIndex(Math.min(initialIndex, media.length - 1));
    }, [initialIndex, media.length]);
    
    // Prevent body scroll when open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);
    
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (closeOnClickOutside && e.target === e.currentTarget) {
        onClose?.();
      }
    };
    
    if (!isOpen) return null;
    
    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(lightboxVariants({ variant }), className)}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Media lightbox"
          {...props}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          {/* Counter */}
          {showCounter && media.length > 1 && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/40 text-white text-sm">
              {currentIndex + 1} / {media.length}
            </div>
          )}
          
          {/* Main Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(lightboxContentVariants({ size }))}
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem ? (
              <div className="relative">
                {/* Media Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {currentItem.type === 'image' ? (
                      <Image
                        src={currentItem.src}
                        alt={currentItem.alt || currentItem.title || 'Image'}
                        width={800}
                        height={600}
                        className="w-full h-full object-contain"
                        onLoad={() => setIsLoading(false)}
                        onLoadStart={() => setIsLoading(true)}
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        src={currentItem.src}
                        controls
                        className="w-full h-full"
                        onLoadedData={() => setIsLoading(false)}
                        onLoadStart={() => setIsLoading(true)}
                      >
                        <track kind="captions" />
                      </video>
                    )}
                    
                    {/* Loading Indicator */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Arrows */}
                {showNavigation && media.length > 1 && (
                  <>
                    <button
                      onClick={goPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!loop && currentIndex === 0}
                      aria-label="Previous image"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={goNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!loop && currentIndex === media.length - 1}
                      aria-label="Next image"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                {/* Caption */}
                {showCaption && (currentItem.caption || currentItem.title) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                    {currentItem.title && (
                      <h3 className="font-medium mb-1">{currentItem.title}</h3>
                    )}
                    {currentItem.caption && (
                      <p className="text-sm opacity-90">{currentItem.caption}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              children
            )}
          </motion.div>
          
          {/* Thumbnails */}
          {showThumbnails && media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/40 rounded-lg max-w-[90vw] overflow-x-auto">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => goToIndex(index)}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all',
                    index === currentIndex
                      ? 'border-white'
                      : 'border-transparent opacity-60 hover:opacity-80'
                  )}
                  aria-label={`Go to item ${index + 1}`}
                >
                  <Image
                    src={item.thumbnail || item.src}
                    alt={item.alt || `Thumbnail ${index + 1}`}
                    width={100}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

Lightbox.displayName = 'Lightbox';

// Simple Image Lightbox
export interface ImageLightboxProps extends Omit<LightboxProps, 'media'> {
  src: string;
  alt?: string;
  caption?: string;
  title?: string;
}

export const ImageLightbox = forwardRef<HTMLDivElement, ImageLightboxProps>(
  ({
    src,
    alt,
    caption,
    title,
    ...props
  }, ref) => {
    const media: MediaItem[] = [
      {
        id: '1',
        src,
        type: 'image',
        alt,
        caption,
        title,
      },
    ];
    
    return (
      <Lightbox
        ref={ref}
        media={media}
        initialIndex={0}
        showThumbnails={false}
        showCounter={false}
        showNavigation={false}
        {...props}
      />
    );
  }
);

ImageLightbox.displayName = 'ImageLightbox';

// Gallery Lightbox Hook
export const useLightbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const openLightbox = (index = 0) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };
  
  const closeLightbox = () => {
    setIsOpen(false);
  };
  
  return {
    isOpen,
    currentIndex,
    openLightbox,
    closeLightbox,
    setCurrentIndex,
  };
};

// Gallery Component with Lightbox
export interface GalleryProps {
  media: MediaItem[];
  columns?: number;
  gap?: number;
  lightboxProps?: Partial<LightboxProps>;
  className?: string;
  itemClassName?: string;
}

export const Gallery = forwardRef<HTMLDivElement, GalleryProps>(
  ({
    media,
    columns = 3,
    gap = 4,
    lightboxProps,
    className,
    itemClassName,
    ...props
  }, ref) => {
    const { isOpen, currentIndex, openLightbox, closeLightbox } = useLightbox();
    
    return (
      <>
        <div
          ref={ref}
          className={cn(
            'grid',
            {
              'grid-cols-1': columns === 1,
              'grid-cols-2': columns === 2,
              'grid-cols-3': columns === 3,
              'grid-cols-4': columns === 4,
              'grid-cols-5': columns === 5,
              'grid-cols-6': columns === 6,
            },
            `gap-${Math.min(gap, 8)}`, // Use Tailwind gap classes for valid values
            className
          )}
          {...props}
        >
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => openLightbox(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg bg-gray-100 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500',
                itemClassName
              )}
            >
              <Image
                src={item.thumbnail || item.src}
                alt={item.alt || item.title || `Gallery item ${index + 1}`}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
              
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
        
        <Lightbox
          isOpen={isOpen}
          onClose={closeLightbox}
          media={media}
          initialIndex={currentIndex}
          {...lightboxProps}
        />
      </>
    );
  }
);

Gallery.displayName = 'Gallery';

export default Lightbox;

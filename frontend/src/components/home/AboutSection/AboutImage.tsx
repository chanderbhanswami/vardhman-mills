/**
 * AboutImage Component
 * 
 * Displays the image/media content for the About section including
 * company photos, facility images, and team pictures.
 * 
 * Features:
 * - Image gallery with lightbox
 * - Lazy loading optimization
 * - Responsive images
 * - Zoom functionality
 * - Image carousel
 * - Video playback support
 * - Parallax effects
 * - Image filters/effects
 * - Download capability
 * - Share functionality
 * - Thumbnail navigation
 * - Fullscreen mode
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  PlayIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  PlayIcon as PlaySolidIcon,
  StarIcon as StarSolidIcon,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AboutImageProps {
  /** Image display variant */
  variant?: 'default' | 'gallery' | 'collage' | 'slider';
  /** Show thumbnails */
  showThumbnails?: boolean;
  /** Enable lightbox */
  enableLightbox?: boolean;
  /** Enable zoom */
  enableZoom?: boolean;
  /** Show image info */
  showInfo?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Custom images */
  images?: ImageData[];
  /** Aspect ratio */
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
  /** Image click handler */
  onImageClick?: (image: ImageData, index: number) => void;
  /** Additional CSS classes */
  className?: string;
}

interface ImageData {
  id: string;
  url: string;
  alt: string;
  title?: string;
  caption?: string;
  description?: string;
  type: 'image' | 'video';
  thumbnail?: string;
  width?: number;
  height?: number;
  tags?: string[];
  featured?: boolean;
  order?: number;
}

interface LightboxState {
  isOpen: boolean;
  currentIndex: number;
  zoom: number;
  isFullscreen: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_IMAGES: ImageData[] = [
  {
    id: 'img-1',
    url: '/images/about/factory-main.jpg',
    alt: 'Vardhman Mills Main Factory',
    title: 'State-of-the-Art Manufacturing Facility',
    caption: 'Our 200,000 sq ft manufacturing facility',
    description: 'Equipped with the latest textile machinery and technology',
    type: 'image',
    thumbnail: '/images/about/factory-main-thumb.jpg',
    width: 1920,
    height: 1080,
    tags: ['facility', 'manufacturing', 'main'],
    featured: true,
    order: 1,
  },
  {
    id: 'img-2',
    url: '/images/about/team-work.jpg',
    alt: 'Our Dedicated Team',
    title: 'Skilled Professionals',
    caption: 'Expert team of textile professionals',
    description: 'Over 500 skilled workers and engineers',
    type: 'image',
    thumbnail: '/images/about/team-work-thumb.jpg',
    width: 1920,
    height: 1080,
    tags: ['team', 'people', 'work'],
    featured: true,
    order: 2,
  },
  {
    id: 'img-3',
    url: '/images/about/quality-control.jpg',
    alt: 'Quality Control Lab',
    title: 'Advanced Testing Facility',
    caption: 'ISO certified quality control',
    description: 'Ensuring the highest standards in every product',
    type: 'image',
    thumbnail: '/images/about/quality-control-thumb.jpg',
    width: 1920,
    height: 1080,
    tags: ['quality', 'lab', 'testing'],
    featured: false,
    order: 3,
  },
  {
    id: 'img-4',
    url: '/images/about/sustainability.jpg',
    alt: 'Sustainable Practices',
    title: 'Eco-Friendly Operations',
    caption: 'Committed to environmental sustainability',
    description: 'Green initiatives and renewable energy',
    type: 'image',
    thumbnail: '/images/about/sustainability-thumb.jpg',
    width: 1920,
    height: 1080,
    tags: ['sustainability', 'green', 'eco'],
    featured: false,
    order: 4,
  },
  {
    id: 'vid-1',
    url: '/videos/about/company-tour.mp4',
    alt: 'Company Tour Video',
    title: 'Virtual Factory Tour',
    caption: 'Take a virtual tour of our facility',
    description: 'See our manufacturing process in action',
    type: 'video',
    thumbnail: '/images/about/video-thumb.jpg',
    width: 1920,
    height: 1080,
    tags: ['video', 'tour', 'facility'],
    featured: true,
    order: 5,
  },
  {
    id: 'img-5',
    url: '/images/about/innovation.jpg',
    alt: 'Innovation Center',
    title: 'Research & Development',
    caption: 'Innovation at the heart of everything',
    description: 'Cutting-edge R&D for textile innovation',
    type: 'image',
    thumbnail: '/images/about/innovation-thumb.jpg',
    width: 1920,
    height: 1080,
    tags: ['innovation', 'r&d', 'technology'],
    featured: false,
    order: 6,
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const AboutImage: React.FC<AboutImageProps> = ({
  variant = 'default',
  showThumbnails = true,
  enableLightbox = true,
  enableZoom = true,
  showInfo = true,
  animated = true,
  images = DEFAULT_IMAGES,
  aspectRatio = 'landscape',
  onImageClick,
  className,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    currentIndex: 0,
    zoom: 1,
    isFullscreen: false,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [images]);

  const featuredImages = useMemo(() => {
    return sortedImages.filter(img => img.featured);
  }, [sortedImages]);

  const currentImage = useMemo(() => {
    return sortedImages[lightbox.currentIndex] || null;
  }, [sortedImages, lightbox.currentIndex]);

  const aspectRatioClass = useMemo(() => {
    const ratios = {
      square: 'aspect-square',
      landscape: 'aspect-video',
      portrait: 'aspect-[3/4]',
      auto: 'aspect-auto',
    };
    return ratios[aspectRatio];
  }, [aspectRatio]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isInView && animated) {
      controls.start('visible');
    }
  }, [isInView, animated, controls]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          navigateLightbox('next');
          break;
        case '+':
        case '=':
          handleZoom('in');
          break;
        case '-':
        case '_':
          handleZoom('out');
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox.isOpen, lightbox.currentIndex]);

  useEffect(() => {
    // Preload adjacent images for smooth transitions
    if (lightbox.isOpen) {
      const prevIndex = (lightbox.currentIndex - 1 + sortedImages.length) % sortedImages.length;
      const nextIndex = (lightbox.currentIndex + 1) % sortedImages.length;
      
      [prevIndex, nextIndex].forEach(index => {
        const img = sortedImages[index];
        if (img && img.type === 'image' && !loadedImages.has(img.id)) {
          const image = new window.Image();
          image.src = img.url;
          image.onload = () => {
            setLoadedImages(prev => new Set(prev).add(img.id));
          };
        }
      });
    }
  }, [lightbox.isOpen, lightbox.currentIndex, sortedImages, loadedImages]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleImageClick = useCallback((image: ImageData, index: number) => {
    if (onImageClick) {
      onImageClick(image, index);
    }
    
    if (enableLightbox) {
      setLightbox(prev => ({
        ...prev,
        isOpen: true,
        currentIndex: index,
        zoom: 1,
      }));
      
      if (image.type === 'video') {
        setIsVideoPlaying(true);
      }
    }
  }, [onImageClick, enableLightbox]);

  const closeLightbox = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      isOpen: false,
      zoom: 1,
      isFullscreen: false,
    }));
    setIsVideoPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    setLightbox(prev => {
      const newIndex = direction === 'next'
        ? (prev.currentIndex + 1) % sortedImages.length
        : (prev.currentIndex - 1 + sortedImages.length) % sortedImages.length;
      
      return {
        ...prev,
        currentIndex: newIndex,
        zoom: 1,
      };
    });
    setIsVideoPlaying(false);
  }, [sortedImages.length]);

  const handleZoom = useCallback((action: 'in' | 'out' | 'reset') => {
    if (!enableZoom) return;

    setLightbox(prev => {
      let newZoom = prev.zoom;
      
      switch (action) {
        case 'in':
          newZoom = Math.min(prev.zoom + 0.25, 3);
          break;
        case 'out':
          newZoom = Math.max(prev.zoom - 0.25, 1);
          break;
        case 'reset':
          newZoom = 1;
          break;
      }
      
      return { ...prev, zoom: newZoom };
    });
  }, [enableZoom]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setLightbox(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setLightbox(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  const handleDownload = useCallback(async (image: ImageData) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.title || 'image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const handleShare = useCallback(async (image: ImageData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title || 'Vardhman Mills',
          text: image.description || image.caption || '',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }, []);

  const toggleFavorite = useCallback((imageId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId);
      } else {
        newFavorites.add(imageId);
      }
      return newFavorites;
    });
  }, []);

  const handleVideoToggle = useCallback(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [isVideoPlaying]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderImage = useCallback((image: ImageData, index: number) => {
    const isHovered = hoveredIndex === index;
    const isFavorite = favorites.has(image.id);

    return (
      <motion.div
        key={image.id}
        variants={animated ? imageVariants : undefined}
        className={cn(
          'relative overflow-hidden rounded-lg cursor-pointer group',
          aspectRatioClass,
          'bg-gray-100 dark:bg-gray-800'
        )}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => handleImageClick(image, index)}
        whileHover={animated ? { scale: 1.02 } : undefined}
        transition={{ duration: 0.3 }}
      >
        {/* Image */}
        {image.type === 'image' ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className={cn(
              'object-cover transition-transform duration-500',
              isHovered && 'scale-110'
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <Image
              src={image.thumbnail || image.url}
              alt={image.alt}
              fill
              className="object-cover opacity-70"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlaySolidIcon className="w-16 h-16 text-white opacity-80" />
            </div>
          </div>
        )}

        {/* Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent',
            'transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Info */}
          {showInfo && (
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              {image.title && (
                <h4 className="text-lg font-semibold mb-1">{image.title}</h4>
              )}
              {image.caption && (
                <p className="text-sm text-gray-200">{image.caption}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Tooltip content={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(image.id);
                }}
              >
                <HeartSolidIcon
                  className={cn(
                    'w-4 h-4',
                    isFavorite ? 'text-red-500' : 'text-white'
                  )}
                />
              </Button>
            </Tooltip>
            
            {image.type === 'image' && (
              <Tooltip content="Download">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(image);
                  }}
                >
                  <ArrowDownTrayIcon className="w-4 h-4 text-white" />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Featured Badge */}
        {image.featured && (
          <div className="absolute top-4 left-4">
            <Badge variant="default" className="bg-yellow-500 text-white">
              <StarSolidIcon className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        {/* Type Badge */}
        {image.type === 'video' && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="bg-blue-500 text-white">
              <VideoCameraIcon className="w-3 h-3 mr-1" />
              Video
            </Badge>
          </div>
        )}
      </motion.div>
    );
  }, [
    hoveredIndex,
    favorites,
    animated,
    aspectRatioClass,
    showInfo,
    handleImageClick,
    toggleFavorite,
    handleDownload,
  ]);

  const renderLightbox = useCallback(() => {
    if (!lightbox.isOpen || !currentImage) return null;

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeLightbox}
          >
            <XMarkIcon className="w-6 h-6" />
          </Button>

          {/* Navigation */}
          {sortedImages.length > 1 && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox('prev');
                }}
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox('next');
                }}
              >
                <ChevronRightIcon className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Zoom Controls */}
          {enableZoom && currentImage.type === 'image' && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom('out');
                }}
                disabled={lightbox.zoom <= 1}
              >
                <MagnifyingGlassMinusIcon className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom('reset');
                }}
              >
                {Math.round(lightbox.zoom * 100)}%
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom('in');
                }}
                disabled={lightbox.zoom >= 3}
              >
                <MagnifyingGlassPlusIcon className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Additional Controls */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <Tooltip content={lightbox.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
              >
                {lightbox.isFullscreen ? (
                  <ArrowsPointingInIcon className="w-4 h-4" />
                ) : (
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
            
            <Tooltip content="Share">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(currentImage);
                }}
              >
                <ShareIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
            
            {currentImage.type === 'image' && (
              <Tooltip content="Download">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(currentImage);
                  }}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          </div>

          {/* Image/Video Container */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {currentImage.type === 'image' ? (
              <motion.div
                className="relative w-full h-full"
                animate={{ scale: lightbox.zoom }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            ) : (
              <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
                <video
                  ref={videoRef}
                  src={currentImage.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  onClick={handleVideoToggle}
                />
              </div>
            )}
          </div>

          {/* Image Info */}
          {showInfo && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white z-10">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {currentImage.title && (
                      <h3 className="text-xl font-semibold mb-2">{currentImage.title}</h3>
                    )}
                    {currentImage.description && (
                      <p className="text-sm text-gray-300 mb-2">{currentImage.description}</p>
                    )}
                    {currentImage.tags && currentImage.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentImage.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {lightbox.currentIndex + 1} / {sortedImages.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thumbnails */}
          {showThumbnails && sortedImages.length > 1 && (
            <div className="absolute bottom-24 left-0 right-0 z-10">
              <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {sortedImages.map((img, index) => (
                    <button
                      key={img.id}
                      className={cn(
                        'relative flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all',
                        index === lightbox.currentIndex
                          ? 'border-white scale-110'
                          : 'border-transparent opacity-50 hover:opacity-100'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightbox(prev => ({ ...prev, currentIndex: index, zoom: 1 }));
                      }}
                    >
                      <Image
                        src={img.thumbnail || img.url}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      {img.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <PlayIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }, [
    lightbox,
    currentImage,
    sortedImages,
    enableZoom,
    showInfo,
    showThumbnails,
    closeLightbox,
    navigateLightbox,
    handleZoom,
    toggleFullscreen,
    handleShare,
    handleDownload,
    handleVideoToggle,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <motion.div
        ref={containerRef}
        className={cn('w-full', className)}
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={controls}
      >
        {/* Gallery Grid */}
        {variant === 'gallery' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedImages.map((image, index) => renderImage(image, index))}
          </div>
        )}

        {/* Default Slider */}
        {variant === 'default' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredImages.length > 0 && (
              <div className="md:col-span-2">
                {renderImage(featuredImages[0], sortedImages.indexOf(featuredImages[0]))}
              </div>
            )}
            {sortedImages.slice(featuredImages.length ? 1 : 0, 5).map((image) => 
              renderImage(image, sortedImages.indexOf(image))
            )}
          </div>
        )}

        {/* Collage */}
        {variant === 'collage' && (
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[600px]">
            {sortedImages.slice(0, 5).map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  index === 0 && 'col-span-2 row-span-2',
                  index === 1 && 'col-span-2',
                  index === 2 && 'col-span-1',
                  index === 3 && 'col-span-1',
                  index === 4 && 'col-span-2'
                )}
              >
                {renderImage(image, index)}
              </div>
            ))}
          </div>
        )}

        {/* Slider */}
        {variant === 'slider' && (
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-4"
                drag="x"
                dragConstraints={{ left: -1000, right: 0 }}
              >
                {sortedImages.map((image, index) => (
                  <div key={image.id} className="flex-shrink-0 w-[400px]">
                    {renderImage(image, index)}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Lightbox */}
      {renderLightbox()}
    </>
  );
};

export default AboutImage;

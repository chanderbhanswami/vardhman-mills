'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, 
  Share2, 
  Maximize2, 
  Minimize2, 
  RotateCw,
  ZoomIn,
  ZoomOut,
  Info,
  AlertTriangle,
  FileImage,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Types
export interface ImageMeta {
  width: number;
  height: number;
  size?: number;
  format?: string;
  altText?: string;
  caption?: string;
  credit?: string;
  license?: string;
  tags?: string[];
  location?: string;
  cameraMake?: string;
  cameraModel?: string;
  iso?: number;
  aperture?: number;
  shutterSpeed?: string;
  focalLength?: number;
  dateTaken?: string;
}

export interface BlogFeaturedImageProps {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  credit?: string;
  meta?: ImageMeta;
  variant?: 'default' | 'hero' | 'card' | 'banner' | 'minimal';
  aspectRatio?: 'auto' | '16:9' | '4:3' | '3:2' | '1:1' | 'golden';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  showCaption?: boolean;
  showCredit?: boolean;
  showMeta?: boolean;
  showControls?: boolean;
  showOverlay?: boolean;
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
  lazy?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  onShare?: (src: string, title?: string) => void;
  onDownload?: (src: string, filename?: string) => void;
  loading?: boolean;
  rounded?: boolean;
  shadow?: boolean;
  border?: boolean;
}

// Aspect ratio configurations
const aspectRatios = {
  'auto': '',
  '16:9': 'aspect-[16/9]',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '1:1': 'aspect-square',
  'golden': 'aspect-[1.618/1]'
};

export const BlogFeaturedImage: React.FC<BlogFeaturedImageProps> = ({
  src,
  alt,
  title,
  caption,
  credit,
  meta,
  variant = 'default',
  aspectRatio = 'auto',
  objectFit = 'cover',
  quality = 85,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  imageClassName,
  showCaption = true,
  showCredit = true,
  showMeta = false,
  showControls = true,
  showOverlay = false,
  enableZoom = true,
  enableFullscreen = true,
  enableDownload = true,
  enableShare = true,
  lazy = true,
  fallbackSrc,
  onLoad,
  onError,
  onShare,
  onDownload,
  loading = false,
  rounded = true,
  shadow = true,
  border = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showControlsVisible, setShowControlsVisible] = useState(showControls);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(null);
    
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
    
    if (onLoad) {
      onLoad();
    }
  };

  // Handle image error
  const handleImageError = () => {
    const errorMessage = 'Failed to load image';
    setImageError(errorMessage);
    setImageLoaded(true);
    
    if (onError) {
      onError(errorMessage);
    }
  };

  // Download image
  const handleDownload = async () => {
    if (!enableDownload || !src) return;
    
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title || alt || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      if (onDownload) {
        onDownload(src, title || alt);
      }
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  // Share image
  const handleShare = async () => {
    if (!enableShare || !src) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || alt,
          text: caption,
          url: src
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(src);
        // Could show a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
    
    if (onShare) {
      onShare(src, title);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    handleResetZoom();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get responsive sizes
  const getResponsiveSizes = () => {
    switch (variant) {
      case 'hero':
        return '100vw';
      case 'banner':
        return '(max-width: 768px) 100vw, 80vw';
      case 'card':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
      default:
        return sizes;
    }
  };

  // Image controls overlay
  const ImageControls = () => (
    <AnimatePresence>
      {showControls && (showControlsVisible || isFullscreen) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"
        >
          <div className="absolute top-2 right-2 flex space-x-1 pointer-events-auto">
            {showMeta && meta && (
              <TooltipProvider>
                <Tooltip content="Image information">
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
                      onClick={() => setShowMetaModal(true)}
                    >
                      <Info size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Image information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {enableShare && (
              <TooltipProvider>
                <Tooltip content="Share image">
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
                      onClick={handleShare}
                    >
                      <Share2 size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {enableDownload && (
              <TooltipProvider>
                <Tooltip content="Download image">
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
                      onClick={handleDownload}
                    >
                      <Download size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {enableFullscreen && (
              <TooltipProvider>
                <Tooltip content="Fullscreen">
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
                      onClick={toggleFullscreen}
                    >
                      <Maximize2 size={14} />
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {isFullscreen && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 pointer-events-auto">
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut size={14} />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
                onClick={handleResetZoom}
              >
                {Math.round(zoom * 100)}%
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn size={14} />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
                onClick={handleRotate}
              >
                <RotateCw size={14} />
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Meta information modal
  const MetaModal = () => (
    <Modal 
      open={showMetaModal} 
      onClose={() => setShowMetaModal(false)}
      title="Image Information"
    >
      <div className="space-y-4">
        {/* Basic info */}
        <div>
          <h4 className="font-medium mb-2">Basic Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {imageDimensions && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                <span className="ml-2">{imageDimensions.width} × {imageDimensions.height}</span>
              </div>
            )}
            {meta?.size && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">File size:</span>
                <span className="ml-2">{formatFileSize(meta.size)}</span>
              </div>
            )}
            {meta?.format && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Format:</span>
                <span className="ml-2 uppercase">{meta.format}</span>
              </div>
            )}
          </div>
        </div>

        {/* Camera info */}
        {(meta?.cameraMake || meta?.cameraModel || meta?.iso || meta?.aperture || meta?.shutterSpeed || meta?.focalLength) && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Camera size={16} />
              Camera Information
            </h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {meta.cameraMake && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Camera:</span>
                  <span className="ml-2">{meta.cameraMake} {meta.cameraModel}</span>
                </div>
              )}
              {meta.iso && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">ISO:</span>
                  <span className="ml-2">{meta.iso}</span>
                </div>
              )}
              {meta.aperture && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Aperture:</span>
                  <span className="ml-2">f/{meta.aperture}</span>
                </div>
              )}
              {meta.shutterSpeed && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Shutter Speed:</span>
                  <span className="ml-2">{meta.shutterSpeed}</span>
                </div>
              )}
              {meta.focalLength && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Focal Length:</span>
                  <span className="ml-2">{meta.focalLength}mm</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional info */}
        {(meta?.dateTaken || meta?.location || meta?.license) && (
          <div>
            <h4 className="font-medium mb-2">Additional Information</h4>
            <div className="space-y-2 text-sm">
              {meta.dateTaken && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Date taken:</span>
                  <span className="ml-2">{new Date(meta.dateTaken).toLocaleDateString()}</span>
                </div>
              )}
              {meta.location && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="ml-2">{meta.location}</span>
                </div>
              )}
              {meta.license && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">License:</span>
                  <span className="ml-2">{meta.license}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {meta?.tags && meta.tags.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {meta.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );

  // Loading state
  if (loading) {
    return (
      <div className={cn('relative', className)}>
        <Skeleton className={cn(
          'w-full',
          aspectRatios[aspectRatio],
          rounded && 'rounded-lg',
          variant === 'hero' ? 'h-96 md:h-[500px]' : 'h-64'
        )} />
      </div>
    );
  }

  // Error state with fallback
  if (imageError && !fallbackSrc) {
    return (
      <div className={cn(
        'relative flex items-center justify-center bg-gray-100 dark:bg-gray-800',
        aspectRatios[aspectRatio],
        rounded && 'rounded-lg',
        border && 'border border-gray-200 dark:border-gray-700',
        variant === 'hero' ? 'h-96 md:h-[500px]' : 'h-64',
        className
      )}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <AlertTriangle size={48} className="mx-auto mb-2 opacity-50" />
          <p className="font-medium">Image not available</p>
          <p className="text-sm">{imageError}</p>
        </div>
      </div>
    );
  }

  const imageElement = (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden group',
        aspectRatios[aspectRatio],
        rounded && 'rounded-lg',
        shadow && 'shadow-lg',
        border && 'border border-gray-200 dark:border-gray-700',
        variant === 'hero' && 'h-96 md:h-[500px]',
        variant === 'banner' && 'h-48 md:h-64',
        className
      )}
      onMouseEnter={() => setShowControlsVisible(true)}
      onMouseLeave={() => setShowControlsVisible(false)}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <Skeleton className="absolute inset-0" />
      )}

      {/* Main image */}
      <Image
        ref={imageRef}
        src={imageError && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        fill={aspectRatio !== 'auto'}
        width={aspectRatio === 'auto' ? undefined : 800}
        height={aspectRatio === 'auto' ? undefined : 600}
        className={cn(
          'transition-all duration-300',
          `object-${objectFit}`,
          imageLoaded ? 'opacity-100' : 'opacity-0',
          enableZoom && !isFullscreen && 'group-hover:scale-105',
          imageClassName
        )}
        style={isFullscreen ? {
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: 'center'
        } : undefined}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={getResponsiveSizes()}
        onLoad={handleImageLoad}
        onError={handleImageError}
        unoptimized={!lazy}
      />

      {/* Overlay controls */}
      <ImageControls />

      {/* Overlay badge */}
      {showOverlay && variant === 'hero' && (
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="bg-black/20 text-white border-0 backdrop-blur-sm">
            <FileImage size={14} className="mr-1" />
            Featured Image
          </Badge>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Main image container */}
      <figure className="space-y-2">
        {imageElement}
        
        {/* Caption and credit */}
        {(showCaption && caption) || (showCredit && credit) ? (
          <figcaption className="text-sm text-gray-600 dark:text-gray-400">
            {showCaption && caption && (
              <p className="mb-1">{caption}</p>
            )}
            {showCredit && credit && (
              <p className="text-xs opacity-75">Credit: {credit}</p>
            )}
          </figcaption>
        ) : null}
      </figure>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <Modal
          open={isFullscreen}
          onClose={toggleFullscreen}
          size="full"
          showCloseButton={false}
          className="bg-black/90"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative max-w-full max-h-full">
              <Image
                src={src}
                alt={alt}
                width={imageDimensions?.width || 800}
                height={imageDimensions?.height || 600}
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
                quality={quality}
                priority
              />
            </div>
            
            {/* Fullscreen controls */}
            <div className="absolute top-4 right-4">
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
                onClick={toggleFullscreen}
              >
                <Minimize2 size={16} />
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Meta information modal */}
      <MetaModal />
    </>
  );
};

// Utility components
export const HeroImage: React.FC<Omit<BlogFeaturedImageProps, 'variant'>> = (props) => (
  <BlogFeaturedImage {...props} variant="hero" />
);

export const CardImage: React.FC<Omit<BlogFeaturedImageProps, 'variant'>> = (props) => (
  <BlogFeaturedImage {...props} variant="card" />
);

export const BannerImage: React.FC<Omit<BlogFeaturedImageProps, 'variant'>> = (props) => (
  <BlogFeaturedImage {...props} variant="banner" />
);

export const MinimalImage: React.FC<Omit<BlogFeaturedImageProps, 'variant'>> = (props) => (
  <BlogFeaturedImage {...props} variant="minimal" showControls={false} />
);

export default BlogFeaturedImage;

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Share2, 
  Play, 
  Pause,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Video,
  FileAudio,
  File,
  Eye,
  Heart,
  Flag,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { formatFileSize, formatDuration } from '@/lib/format';
import { useImagePreloader } from '@/hooks/useImagePreloader';

// Types
export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  duration?: number; // for video/audio in seconds
  size?: number; // file size in bytes
  mimeType?: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  uploadedBy?: string;
  metadata?: {
    camera?: string;
    location?: string;
    tags?: string[];
    quality?: 'low' | 'medium' | 'high' | 'original';
    processed?: boolean;
  };
  accessibility?: {
    altText?: string;
    caption?: string;
    transcript?: string;
  };
  permissions?: {
    canView: boolean;
    canDownload: boolean;
    canShare: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  analytics?: {
    views: number;
    downloads: number;
    shares: number;
    likes: number;
  };
}

export interface MediaCarouselProps {
  items: MediaItem[];
  className?: string;
  showThumbnails?: boolean;
  showControls?: boolean;
  showMetadata?: boolean;
  showAnalytics?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
  allowFullscreen?: boolean;
  allowZoom?: boolean;
  allowRotation?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  preloadImages?: boolean;
  lazyLoad?: boolean;
  maxHeight?: number;
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1' | '9:16';
  layout?: 'standard' | 'grid' | 'masonry' | 'slideshow';
  theme?: 'light' | 'dark' | 'auto';
  quality?: 'low' | 'medium' | 'high' | 'original';
  watermark?: {
    enabled: boolean;
    text?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity?: number;
  };
  
  // Event handlers
  onItemClick?: (item: MediaItem, index: number) => void;
  onItemView?: (item: MediaItem, index: number) => void;
  onItemLike?: (item: MediaItem, index: number) => void;
  onItemShare?: (item: MediaItem, index: number, platform?: string) => void;
  onItemDownload?: (item: MediaItem, index: number) => void;
  onItemEdit?: (item: MediaItem, index: number) => void;
  onItemDelete?: (item: MediaItem, index: number) => void;
  onItemReport?: (item: MediaItem, index: number, reason: string) => void;
  onIndexChange?: (index: number) => void;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: number) => void;
  
  // Permissions
  userId?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  
  // Configuration
  enableKeyboardNavigation?: boolean;
  enableTouchGestures?: boolean;
  enableMouseWheel?: boolean;
  enableAnimations?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  
  // Customization
  customControls?: React.ReactNode;
  customToolbar?: React.ReactNode;
  customOverlay?: React.ReactNode;
  renderItem?: (item: MediaItem, index: number) => React.ReactNode;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({
  items = [],
  className,
  showThumbnails = true,
  showControls = true,
  showAnalytics = false,
  allowDownload = true,
  allowShare = true,
  allowFullscreen = true,
  allowZoom = true,
  allowRotation = false,
  autoPlay = false,
  autoPlayInterval = 5000,
  loop = true,
  preloadImages = true,
  lazyLoad = true,
  maxHeight = 600,
  watermark = { enabled: false },
  onItemClick,
  onItemView,
  onItemLike,
  onItemShare,
  onItemDownload,
  onItemEdit,
  onItemDelete,
  onItemReport,
  onIndexChange,
  onFullscreenToggle,
  onZoomChange,
  onRotationChange,
  
  // Permissions
  userId,
  isOwner = false,
  isAdmin = false,
  isModerator = false,
  enableKeyboardNavigation = true,
  enableTouchGestures = true,
  enableAnimations = true,
  customControls,
  customToolbar,
  customOverlay,
  renderItem
}) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted] = useState(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | HTMLAudioElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const preloadCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Hooks
  const { preloadImage } = useImagePreloader();
  const { success, error } = useToastHelpers();

  // Current item
  const currentItem = useMemo(() => items[currentIndex], [items, currentIndex]);

  // Permission check utility
  const hasPermission = useCallback((action: 'view' | 'download' | 'share' | 'edit' | 'delete') => {
    if (!userId && action !== 'view') return false;
    
    switch (action) {
      case 'edit':
      case 'delete':
        return isOwner || isAdmin || isModerator;
      default:
        return true;
    }
  }, [userId, isOwner, isAdmin, isModerator]);

  // Filter items based on permissions
  const visibleItems = useMemo(() => {
    return items.filter(item => item.permissions?.canView !== false && hasPermission('view'));
  }, [items, hasPermission]);

  // Preload adjacent images
  useEffect(() => {
    if (!preloadImages) return;

    const preloadAdjacent = async () => {
      const adjacentIndices = [
        currentIndex - 1,
        currentIndex + 1,
        currentIndex - 2,
        currentIndex + 2
      ].filter(index => index >= 0 && index < visibleItems.length);

      for (const index of adjacentIndices) {
        const item = visibleItems[index];
        if (item?.type === 'image' && !preloadCacheRef.current.has(item.url)) {
          try {
            await preloadImage(item.url);
            const img = new Image();
            img.src = item.url;
            preloadCacheRef.current.set(item.url, img);
          } catch (error) {
            console.warn('Failed to preload image:', item.url, error);
          }
        }
      }
    };

    preloadAdjacent();
  }, [currentIndex, visibleItems, preloadImages, preloadImage]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !autoPlay || visibleItems.length <= 1) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        return next >= visibleItems.length ? (loop ? 0 : prev) : next;
      });
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isPlaying, autoPlay, autoPlayInterval, loop, visibleItems.length]);

  // Track item views
  useEffect(() => {
    if (currentItem && onItemView) {
      const timer = setTimeout(() => {
        onItemView(currentItem, currentIndex);
      }, 1000); // Count as view after 1 second

      return () => clearTimeout(timer);
    }
  }, [currentItem, currentIndex, onItemView]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => {
      const newIndex = prev > 0 ? prev - 1 : (loop ? visibleItems.length - 1 : 0);
      onIndexChange?.(newIndex);
      return newIndex;
    });
    setZoom(100);
    setRotation(0);
  }, [loop, visibleItems.length, onIndexChange]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => {
      const newIndex = prev < visibleItems.length - 1 ? prev + 1 : (loop ? 0 : prev);
      onIndexChange?.(newIndex);
      return newIndex;
    });
    setZoom(100);
    setRotation(0);
  }, [loop, visibleItems.length, onIndexChange]);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
    onIndexChange?.(index);
    setZoom(100);
    setRotation(0);
  }, [onIndexChange]);

  // Media controls
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Zoom and rotation handlers
  const handleZoomIn = useCallback(() => {
    if (!allowZoom) return;
    setZoom(prev => {
      const newZoom = Math.min(prev + 25, 400);
      onZoomChange?.(newZoom);
      return newZoom;
    });
    setIsZoomed(true);
  }, [allowZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    if (!allowZoom) return;
    setZoom(prev => {
      const newZoom = Math.max(prev - 25, 25);
      onZoomChange?.(newZoom);
      return newZoom;
    });
    if (zoom <= 100) setIsZoomed(false);
  }, [allowZoom, zoom, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
    setIsZoomed(false);
    onZoomChange?.(100);
  }, [onZoomChange]);

  const handleRotate = useCallback(() => {
    if (!allowRotation) return;
    setRotation(prev => {
      const newRotation = (prev + 90) % 360;
      onRotationChange?.(newRotation);
      return newRotation;
    });
  }, [allowRotation, onRotationChange]);

  // Fullscreen handlers
  const enterFullscreen = useCallback(async () => {
    if (!allowFullscreen || !containerRef.current) return;

    try {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
      onFullscreenToggle?.(true);
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
      error('Failed to enter fullscreen mode');
    }
  }, [allowFullscreen, onFullscreenToggle, error]);

  const exitFullscreen = useCallback(async () => {
    try {
      await document.exitFullscreen();
      setIsFullscreen(false);
      onFullscreenToggle?.(false);
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, [onFullscreenToggle]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen || document.activeElement === containerRef.current) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            handlePrevious();
            break;
          case 'ArrowRight':
            e.preventDefault();
            handleNext();
            break;
          case 'Escape':
            if (isFullscreen) {
              e.preventDefault();
              exitFullscreen();
            }
            break;
          case ' ':
            e.preventDefault();
            togglePlayPause();
            break;
          case '+':
          case '=':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case 'r':
            if (allowRotation) {
              e.preventDefault();
              handleRotate();
            }
            break;
          case 'f':
            if (allowFullscreen) {
              e.preventDefault();
              toggleFullscreen();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    enableKeyboardNavigation, 
    isFullscreen, 
    allowRotation, 
    allowFullscreen,
    handlePrevious,
    handleNext,
    exitFullscreen,
    togglePlayPause,
    handleZoomIn,
    handleZoomOut,
    handleRotate,
    toggleFullscreen
  ]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableTouchGestures) return;
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, [enableTouchGestures]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableTouchGestures || !touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      e.preventDefault();
    }

    if (isZoomed) {
      setDragOffset({ x: deltaX, y: deltaY });
      setIsDragging(true);
    }
  }, [enableTouchGestures, touchStart, isZoomed]);

  const handleTouchEnd = useCallback(() => {
    if (!enableTouchGestures || !touchStart) return;

    if (!isZoomed && !isDragging) {
      const deltaX = dragOffset.x;
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          handlePrevious();
        } else {
          handleNext();
        }
      }
    }

    setTouchStart(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, [enableTouchGestures, touchStart, isZoomed, isDragging, dragOffset, handlePrevious, handleNext]);

  // Action handlers
  const handleItemClick = useCallback((item: MediaItem, index: number) => {
    onItemClick?.(item, index);
    
    if (item.type === 'image' && allowZoom) {
      if (isZoomed) {
        handleZoomReset();
      } else {
        handleZoomIn();
      }
    }
  }, [onItemClick, allowZoom, isZoomed, handleZoomReset, handleZoomIn]);

  const handleDownload = useCallback(async (item: MediaItem) => {
    if (!allowDownload || !item.permissions?.canDownload) {
      error('Download not allowed for this item');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = item.title || `media-${item.id}`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      onItemDownload?.(item, currentIndex);
      success('Download started');
    } catch (err) {
      console.error('Download failed:', err);
      error('Failed to download item');
    } finally {
      setIsLoading(false);
    }
  }, [allowDownload, currentIndex, onItemDownload, error, success]);

  const handleShare = useCallback(async (item: MediaItem, platform?: string) => {
    if (!allowShare || !item.permissions?.canShare) {
      error('Sharing not allowed for this item');
      return;
    }

    try {
      const shareData = {
        title: item.title || 'Shared media',
        text: item.description || 'Check out this media',
        url: item.url
      };

      if (navigator.share && !platform) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(item.url);
        success('Link copied to clipboard');
      }

      onItemShare?.(item, currentIndex, platform);
    } catch (err) {
      console.error('Share failed:', err);
      error('Failed to share item');
    }
  }, [allowShare, currentIndex, onItemShare, error, success]);

  const handleLike = useCallback((item: MediaItem) => {
    onItemLike?.(item, currentIndex);
    success('Added to favorites');
  }, [currentIndex, onItemLike, success]);

  const handleReport = useCallback((item: MediaItem, reason: string) => {
    onItemReport?.(item, currentIndex, reason);
    success('Report submitted');
  }, [currentIndex, onItemReport, success]);

  // Render media item
  const renderMediaItem = useCallback((item: MediaItem, index: number) => {
    if (renderItem) {
      return renderItem(item, index);
    }

    const itemStyle = {
      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
      transition: enableAnimations ? 'transform 0.3s ease' : 'none',
      maxHeight: isFullscreen ? '100vh' : `${maxHeight}px`,
      cursor: allowZoom && item.type === 'image' ? (isZoomed ? 'zoom-out' : 'zoom-in') : 'default'
    };

    switch (item.type) {
      case 'image':
        return (
          <motion.img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={item.url}
            alt={item.accessibility?.altText || item.title || 'Media item'}
            className={cn(
              'max-w-full h-auto object-contain',
              isDragging && 'cursor-grabbing'
            )}
            style={itemStyle}
            loading={lazyLoad ? 'lazy' : 'eager'}
            onClick={() => handleItemClick(item, index)}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setErrorMessage('Failed to load image');
              setIsLoading(false);
            }}
            draggable={false}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: enableAnimations ? 0.3 : 0 }}
          />
        );

      case 'video':
        return (
          <motion.video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={item.url}
            poster={item.thumbnailUrl}
            className="max-w-full h-auto object-contain"
            style={itemStyle}
            controls={showControls}
            autoPlay={isPlaying}
            muted={isMuted}
            loop={loop}
            preload={preloadImages ? 'metadata' : 'none'}
            onClick={() => handleItemClick(item, index)}
            onLoadStart={() => setIsLoading(true)}
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setErrorMessage('Failed to load video');
              setIsLoading(false);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: enableAnimations ? 0.3 : 0 }}
          >
            {item.accessibility?.caption && (
              <track
                kind="captions"
                src={item.accessibility.caption}
                srcLang="en"
                label="English"
                default
              />
            )}
          </motion.video>
        );

      case 'audio':
        return (
          <motion.div
            className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg"
            style={{ minHeight: '200px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FileAudio className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">{item.title || 'Audio File'}</h3>
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={item.url}
              controls
              autoPlay={isPlaying}
              muted={isMuted}
              loop={loop}
              className="w-full max-w-md"
              onLoadStart={() => setIsLoading(true)}
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setErrorMessage('Failed to load audio');
                setIsLoading(false);
              }}
            />
          </motion.div>
        );

      case 'document':
        return (
          <motion.div
            className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg"
            style={{ minHeight: '200px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <File className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">{item.title || 'Document'}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {item.size && formatFileSize(item.size)}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.open(item.url, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
              {allowDownload && (
                <Button variant="outline" onClick={() => handleDownload(item)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="flex items-center justify-center p-8 text-gray-500">
            <p>Unsupported media type</p>
          </div>
        );
    }
  }, [
    renderItem, zoom, rotation, enableAnimations, isFullscreen, maxHeight, allowZoom, 
    isZoomed, isDragging, lazyLoad, handleItemClick, showControls, isPlaying, isMuted, 
    loop, preloadImages, allowDownload, handleDownload
  ]);

  // Render thumbnail strip
  const renderThumbnails = useCallback(() => {
    if (!showThumbnails || visibleItems.length <= 1) return null;

    return (
      <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50 rounded-lg">
        {visibleItems.map((item, index) => (
          <motion.div
            key={item.id}
            className={cn(
              'flex-shrink-0 w-16 h-16 rounded cursor-pointer overflow-hidden',
              'border-2 transition-all duration-200',
              index === currentIndex 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
            )}
            onClick={() => handleThumbnailClick(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.type === 'image' ? (
              <div className="w-full h-full relative overflow-hidden rounded">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.accessibility?.altText || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                {item.type === 'video' && <Video className="w-6 h-6 text-gray-400" />}
                {item.type === 'audio' && <FileAudio className="w-6 h-6 text-gray-400" />}
                {item.type === 'document' && <File className="w-6 h-6 text-gray-400" />}
              </div>
            )}
            
            {/* Item indicator */}
            <div className="absolute top-1 right-1">
              {item.type === 'video' && item.duration && (
                <Badge variant="secondary" className="text-xs px-1">
                  {formatDuration(item.duration)}
                </Badge>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }, [showThumbnails, visibleItems, currentIndex, handleThumbnailClick]);

  // Render metadata panel
  const renderMetadata = useCallback(() => {
    if (!showMetadataPanel || !currentItem) return null;

    return (
      <motion.div
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-xs"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
      >
        <h4 className="font-medium mb-2">{currentItem.title || 'Media Information'}</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Type: {currentItem.type}</p>
          {currentItem.size && <p>Size: {formatFileSize(currentItem.size)}</p>}
          {currentItem.duration && <p>Duration: {formatDuration(currentItem.duration)}</p>}
          {currentItem.width && currentItem.height && (
            <p>Dimensions: {currentItem.width} × {currentItem.height}</p>
          )}
          <p>Uploaded: {new Date(currentItem.uploadedAt).toLocaleDateString()}</p>
          {showAnalytics && currentItem.analytics && (
            <div className="mt-2 pt-2 border-t">
              <p>Views: {currentItem.analytics.views}</p>
              <p>Likes: {currentItem.analytics.likes}</p>
              <p>Downloads: {currentItem.analytics.downloads}</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [showMetadataPanel, currentItem, showAnalytics]);

  // Render controls
  const renderControls = useCallback(() => {
    if (!showControls) return null;

    return (
      <motion.div
        className={cn(
          'absolute bottom-4 left-1/2 transform -translate-x-1/2',
          'flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        {/* Previous button */}
        <Tooltip content="Previous">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={!loop && currentIndex === 0}
            className="text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Tooltip>

        {/* Play/Pause for videos */}
        {currentItem?.type === 'video' && (
          <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </Tooltip>
        )}

        {/* Zoom controls */}
        {allowZoom && currentItem?.type === 'image' && (
          <>
            <Tooltip content="Zoom out">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className="text-white hover:bg-white/20"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </Tooltip>
            
            <span className="text-white text-sm px-2">{zoom}%</span>
            
            <Tooltip content="Zoom in">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 400}
                className="text-white hover:bg-white/20"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </Tooltip>
          </>
        )}

        {/* Rotation */}
        {allowRotation && currentItem?.type === 'image' && (
          <Tooltip content="Rotate">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}

        {/* Next button */}
        <Tooltip content="Next">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={!loop && currentIndex === visibleItems.length - 1}
            className="text-white hover:bg-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Tooltip>

        {/* Fullscreen */}
        {allowFullscreen && (
          <Tooltip content={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </Tooltip>
        )}

        {/* More actions */}
        <DropdownMenu
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              key: 'info',
              label: `${showMetadataPanel ? 'Hide' : 'Show'} Info`,
              icon: Eye,
              onClick: () => setShowMetadataPanel(prev => !prev)
            },
            ...(allowDownload && currentItem?.permissions?.canDownload ? [{
              key: 'download',
              label: 'Download',
              icon: Download,
              onClick: () => handleDownload(currentItem)
            }] : []),
            ...(allowShare && currentItem?.permissions?.canShare ? [{
              key: 'share',
              label: 'Share',
              icon: Share2,
              onClick: () => handleShare(currentItem)
            }] : []),
            {
              key: 'like',
              label: 'Like',
              icon: Heart,
              onClick: () => handleLike(currentItem)
            },
            ...((isOwner || isAdmin || isModerator) ? [
              {
                key: 'edit',
                label: 'Edit',
                icon: Edit3,
                onClick: () => onItemEdit?.(currentItem, currentIndex)
              },
              {
                key: 'delete',
                label: 'Delete',
                icon: Trash2,
                destructive: true,
                onClick: () => onItemDelete?.(currentItem, currentIndex)
              }
            ] : []),
            {
              key: 'report',
              label: 'Report',
              icon: Flag,
              destructive: true,
              onClick: () => handleReport(currentItem, 'inappropriate')
            }
          ]}
          align="end"
        />
      </motion.div>
    );
  }, [
    showControls, currentIndex, currentItem, loop, visibleItems.length, isPlaying, 
    allowZoom, zoom, allowRotation, allowFullscreen, isFullscreen, showMetadataPanel,
    allowDownload, allowShare, isOwner, isAdmin, isModerator, handlePrevious, 
    togglePlayPause, handleZoomOut, handleZoomIn, handleRotate, handleNext, 
    toggleFullscreen, handleDownload, handleShare, handleLike, onItemEdit, 
    onItemDelete, handleReport
  ]);

  // Main render
  if (!visibleItems.length) {
    return (
      <Card className={cn('p-8', className)}>
        <CardContent className="text-center text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No media items to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={enableKeyboardNavigation ? 0 : -1}
      role="region"
      aria-label="Media carousel"
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {errorMessage && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <p className="mb-2">{errorMessage}</p>
            <Button onClick={() => setErrorMessage(null)} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Main media area */}
      <div className="relative flex items-center justify-center min-h-96">
        <AnimatePresence mode="wait">
          {currentItem && (
            <div key={currentItem.id} className="w-full h-full flex items-center justify-center">
              {renderMediaItem(currentItem, currentIndex)}
            </div>
          )}
        </AnimatePresence>

        {/* Watermark */}
        {watermark.enabled && watermark.text && (
          <div
            className={cn(
              'absolute text-white/50 text-sm font-medium pointer-events-none',
              watermark.position === 'top-left' && 'top-4 left-4',
              watermark.position === 'top-right' && 'top-4 right-4',
              watermark.position === 'bottom-left' && 'bottom-4 left-4',
              watermark.position === 'bottom-right' && 'bottom-4 right-4',
              watermark.position === 'center' && 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
            )}
          >
            {watermark.text}
          </div>
        )}

        {/* Custom overlay */}
        {customOverlay}
      </div>

      {/* Controls overlay */}
      <AnimatePresence>
        {renderControls()}
      </AnimatePresence>

      {/* Metadata panel */}
      <AnimatePresence>
        {renderMetadata()}
      </AnimatePresence>

      {/* Custom controls */}
      {customControls}

      {/* Custom toolbar */}
      {customToolbar}

      {/* Thumbnail strip */}
      {!isFullscreen && renderThumbnails()}

      {/* Media counter */}
      {visibleItems.length > 1 && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm">
            {currentIndex + 1} / {visibleItems.length}
          </span>
        </div>
      )}

      {/* Auto-play indicator */}
      {autoPlay && isPlaying && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="bg-green-600">
            Auto-playing
          </Badge>
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;

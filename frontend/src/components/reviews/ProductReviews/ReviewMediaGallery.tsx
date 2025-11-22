'use client';

import Image from 'next/image';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  Bars3BottomLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ClockIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Slider } from '@/components/ui/Slider';
import { Progress } from '@/components/ui/Progress';
import { Loading } from '@/components/ui/Loading';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

// Types
export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  caption?: string;
  alt?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
    format?: string;
    quality?: 'low' | 'medium' | 'high' | 'ultra';
  };
  tags?: string[];
  uploadedAt?: Date;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  interactions?: {
    likes: number;
    views: number;
    downloads: number;
  };
}

export interface ReviewMediaGalleryProps {
  // Media data
  media: MediaItem[];
  initialIndex?: number;
  
  // Display configuration
  variant?: 'grid' | 'carousel' | 'masonry' | 'list';
  showThumbnails?: boolean;
  showCaptions?: boolean;
  showMetadata?: boolean;
  showInteractions?: boolean;
  showAuthor?: boolean;
  showTimestamp?: boolean;
  
  // Grid settings
  gridColumns?: number;
  maxHeight?: number;
  aspectRatio?: 'auto' | 'square' | '16:9' | '4:3' | '3:2';
  
  // Carousel settings
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  
  // Viewer settings
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  enableSlideshow?: boolean;
  enableKeyboardNav?: boolean;
  zoomLevel?: number;
  maxZoom?: number;
  minZoom?: number;
  
  // Audio/Video settings
  autoPlayMedia?: boolean;
  showControls?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
  volume?: number;
  
  // Filtering
  filterByType?: ('image' | 'video' | 'audio')[];
  searchTerm?: string;
  sortBy?: 'date' | 'type' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
  
  // UI customization
  className?: string;
  itemClassName?: string;
  thumbnailClassName?: string;
  
  // Callbacks
  onMediaClick?: (media: MediaItem, index: number) => void;
  onMediaLoad?: (media: MediaItem) => void;
  onMediaError?: (media: MediaItem, error: Error) => void;
  onZoomChange?: (zoom: number) => void;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  onLike?: (mediaId: string) => Promise<void>;
  onBookmark?: (mediaId: string) => Promise<void>;
  onDownload?: (mediaId: string) => Promise<void>;
  onShare?: (mediaId: string) => Promise<void>;
  
  // Analytics
  onView?: (mediaId: string) => void;
  onInteraction?: (mediaId: string, type: string) => void;
}

// Thumbnail component
const MediaThumbnail: React.FC<{
  media: MediaItem;
  index: number;
  isActive?: boolean;
  className?: string;
  onClick: () => void;
}> = ({ media, index, isActive, className, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        'relative cursor-pointer group overflow-hidden rounded-lg bg-gray-100',
        isActive && 'ring-2 ring-blue-500',
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-square relative">
        {media.type === 'image' ? (
          <Image
            src={media.thumbnail || media.url}
            alt={media.alt || media.caption || `Media ${index + 1}`}
            fill
            className={cn(
              'object-cover transition-all duration-200',
              'group-hover:scale-105',
              !isLoaded && 'opacity-0',
              hasError && 'opacity-50'
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        ) : media.type === 'video' ? (
          <>
            {media.thumbnail ? (
              <Image
                src={media.thumbnail}
                alt={media.alt || media.caption || `Video ${index + 1}`}
                fill
                className="object-cover"
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <VideoCameraIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-white" />
            </div>
            {media.metadata?.duration && (
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                {Math.floor(media.metadata.duration / 60)}:
                {(media.metadata.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <SpeakerWaveIcon className="w-8 h-8 text-gray-400" />
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        {/* Media type indicator */}
        <div className="absolute top-1 left-1">
          <Badge size="sm" variant="secondary" className="bg-black bg-opacity-50 text-white">
            {media.type === 'image' && <PhotoIcon className="w-3 h-3" />}
            {media.type === 'video' && <VideoCameraIcon className="w-3 h-3" />}
            {media.type === 'audio' && <SpeakerWaveIcon className="w-3 h-3" />}
          </Badge>
        </div>

        {/* Loading overlay */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loading size="sm" />
          </div>
        )}

        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Caption */}
      {media.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
          {media.caption}
        </div>
      )}
    </div>
  );
};

// Media viewer component
const MediaViewer: React.FC<{
  media: MediaItem;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  autoPlayMedia?: boolean;
  showControls?: boolean;
  volume?: number;
}> = ({ media, zoom, onZoomChange, onLoad, onError, autoPlayMedia = false, showControls = true, volume: initialVolume = 1 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  const handlePlayPause = useCallback(() => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (mediaRef.current) {
      if (isMuted) {
        mediaRef.current.volume = volume;
        setIsMuted(false);
      } else {
        mediaRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (media.type === 'image') {
    return (
      <div
        className="relative flex items-center justify-center transform transition-transform"
        data-zoom={zoom}
        onWheel={(e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
          onZoomChange?.(newZoom);
        }}
      >
        <Image
          src={media.url}
          alt={media.alt || media.caption || 'Review image'}
          width={media.metadata?.width || 800}
          height={media.metadata?.height || 600}
          className="max-w-full max-h-full object-contain"
          onLoad={() => onLoad?.()}
          onError={() => onError?.(new Error('Failed to load image'))}
        />
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div className="relative">
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={media.url}
          className="max-w-full max-h-full"
          autoPlay={autoPlayMedia}
          controls={showControls}
          onLoadedMetadata={() => {
            if (mediaRef.current) {
              setDuration(mediaRef.current.duration);
              (mediaRef.current as HTMLVideoElement).volume = volume;
            }
            onLoad?.();
          }}
          onTimeUpdate={() => {
            if (mediaRef.current) {
              setCurrentTime(mediaRef.current.currentTime);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => onError?.(new Error('Failed to load video'))}
        />

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          <div className="flex items-center gap-4">
            <button onClick={handlePlayPause} className="text-white hover:text-gray-300">
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>

            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={([value]) => handleSeek(value)}
                className="w-full"
              />
            </div>

            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button onClick={toggleMute} className="text-white hover:text-gray-300">
              {isMuted ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>

            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={([value]) => handleVolumeChange(value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (media.type === 'audio') {
    return (
      <div className="bg-gray-100 rounded-lg p-6 max-w-md">
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={media.url}
          onLoadedMetadata={() => {
            if (mediaRef.current) {
              setDuration(mediaRef.current.duration);
            }
            onLoad?.();
          }}
          onTimeUpdate={() => {
            if (mediaRef.current) {
              setCurrentTime(mediaRef.current.currentTime);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => onError?.(new Error('Failed to load audio'))}
        />

        <div className="space-y-4">
          <div className="text-center">
            <SpeakerWaveIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">
              {media.caption || 'Audio Recording'}
            </h3>
          </div>

          <div className="space-y-2">
            <Progress value={(currentTime / duration) * 100} className="w-full" />
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Tooltip content="Rewind 15 seconds">
              <button 
                onClick={() => handleSeek(Math.max(0, currentTime - 15))} 
                className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300"
                aria-label="Rewind 15 seconds"
              >
                <BackwardIcon className="w-5 h-5" />
              </button>
            </Tooltip>
            
            <button onClick={handlePlayPause} className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600">
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
            
            <Tooltip content="Forward 15 seconds">
              <button 
                onClick={() => handleSeek(Math.min(duration, currentTime + 15))} 
                className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300"
                aria-label="Forward 15 seconds"
              >
                <ForwardIcon className="w-5 h-5" />
              </button>
            </Tooltip>

            <button onClick={toggleMute} className="text-gray-600 hover:text-gray-800">
              {isMuted ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>

            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={([value]) => handleVolumeChange(value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Main component
const ReviewMediaGallery: React.FC<ReviewMediaGalleryProps> = ({
  media,
  initialIndex = 0,
  variant = 'grid',
  showThumbnails = true,
  showCaptions = true,
  showMetadata = false,
  showInteractions = true,
  showAuthor = false,
  showTimestamp = false,
  gridColumns = 4,
  maxHeight = 400,
  aspectRatio = 'auto',
  autoPlay = false,
  autoPlayInterval = 3000,
  showIndicators = true,
  showNavigation = true,
  loop = true,
  enableZoom = true,
  enableFullscreen = true,
  enableSlideshow = false,
  enableKeyboardNav = true,
  zoomLevel = 1,
  maxZoom = 3,
  minZoom = 0.5,
  autoPlayMedia = false,
  showControls = true,
  enableDownload = true,
  enableShare = true,
  volume = 1,
  filterByType,
  searchTerm,
  sortBy = 'date',
  sortOrder = 'desc',
  className,
  itemClassName,
  thumbnailClassName,
  onMediaClick,
  onMediaLoad,
  onMediaError,
  onZoomChange,
  onFullscreenToggle,
  onLike,
  onBookmark,
  onDownload,
  onShare,
  onView,
  onInteraction
}) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoomLevel);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showMetadataOverlay, setShowMetadataOverlay] = useState(showMetadata);
  const [slideDirection, setSlideDirection] = useState(1);

  // Refs
  const galleryRef = useRef<HTMLDivElement>(null);
  const slideshowRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { toast } = useToast();

  // Filter and sort media
  const processedMedia = React.useMemo(() => {
    let filtered = [...media];

    // Filter by type
    if (filterByType && filterByType.length > 0) {
      filtered = filtered.filter(item => filterByType.includes(item.type));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = (a.uploadedAt?.getTime() || 0) - (b.uploadedAt?.getTime() || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'name':
          comparison = (a.caption || '').localeCompare(b.caption || '');
          break;
        case 'size':
          comparison = (a.metadata?.size || 0) - (b.metadata?.size || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [media, filterByType, searchTerm, sortBy, sortOrder]);

  // Navigation handlers
  const goToNext = useCallback(() => {
    setSlideDirection(1);
    if (currentIndex < processedMedia.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (loop) {
      setCurrentIndex(0);
    }
  }, [currentIndex, processedMedia.length, loop]);

  const goToPrevious = useCallback(() => {
    setSlideDirection(-1);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (loop) {
      setCurrentIndex(processedMedia.length - 1);
    }
  }, [currentIndex, processedMedia.length, loop]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(currentZoom + 0.2, maxZoom);
    setCurrentZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [currentZoom, maxZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(currentZoom - 0.2, minZoom);
    setCurrentZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [currentZoom, minZoom, onZoomChange]);

  const resetZoom = useCallback(() => {
    setCurrentZoom(1);
    onZoomChange?.(1);
  }, [onZoomChange]);

  // Fullscreen handlers
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      galleryRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    onFullscreenToggle?.(!isFullscreen);
  }, [isFullscreen, onFullscreenToggle]);

  // Slideshow handlers
  const startSlideshow = useCallback(() => {
    setIsSlideshow(true);
    slideshowRef.current = setInterval(goToNext, autoPlayInterval);
  }, [goToNext, autoPlayInterval]);

  const stopSlideshow = useCallback(() => {
    setIsSlideshow(false);
    if (slideshowRef.current) {
      clearInterval(slideshowRef.current);
      slideshowRef.current = null;
    }
  }, []);

  // Interaction handlers
  const handleLike = useCallback(async (mediaId: string) => {
    try {
      await onLike?.(mediaId);
      setLikedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(mediaId)) {
          newSet.delete(mediaId);
        } else {
          newSet.add(mediaId);
        }
        return newSet;
      });
      onInteraction?.(mediaId, 'like');
    } catch (error) {
      console.error('Like error:', error);
      toast({
        title: 'Action Failed',
        description: 'Could not like media item',
        variant: 'destructive'
      });
    }
  }, [onLike, onInteraction, toast]);

  const handleBookmark = useCallback(async (mediaId: string) => {
    try {
      const bookmarkId = `bookmark-${mediaId}`;
      await onBookmark?.(mediaId);
      setLikedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(bookmarkId)) {
          newSet.delete(bookmarkId);
        } else {
          newSet.add(bookmarkId);
        }
        return newSet;
      });
      onInteraction?.(mediaId, 'bookmark');
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: 'Action Failed',
        description: 'Could not bookmark media item',
        variant: 'destructive'
      });
    }
  }, [onBookmark, onInteraction, toast]);

  const handleDownload = useCallback(async (mediaId: string) => {
    try {
      await onDownload?.(mediaId);
      onInteraction?.(mediaId, 'download');
      toast({
        title: 'Download Started',
        description: 'Media item is being downloaded',
        variant: 'default'
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not download media item',
        variant: 'destructive'
      });
    }
  }, [onDownload, onInteraction, toast]);

  const handleShare = useCallback(async (mediaId: string) => {
    try {
      await onShare?.(mediaId);
      onInteraction?.(mediaId, 'share');
      toast({
        title: 'Shared Successfully',
        description: 'Media item has been shared',
        variant: 'default'
      });
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share media item',
        variant: 'destructive'
      });
    }
  }, [onShare, onInteraction, toast]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNav || !isViewerOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          setIsViewerOpen(false);
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case ' ':
          if (isSlideshow) {
            stopSlideshow();
          } else {
            startSlideshow();
          }
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    enableKeyboardNav,
    isViewerOpen,
    goToNext,
    goToPrevious,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
    toggleFullscreen,
    isSlideshow,
    startSlideshow,
    stopSlideshow
  ]);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && !isSlideshow && isViewerOpen) {
      startSlideshow();
    }

    return () => {
      if (slideshowRef.current) {
        clearInterval(slideshowRef.current);
      }
    };
  }, [autoPlay, isSlideshow, isViewerOpen, startSlideshow]);

  // View tracking
  useEffect(() => {
    if (isViewerOpen && processedMedia[currentIndex]) {
      onView?.(processedMedia[currentIndex].id);
    }
  }, [isViewerOpen, currentIndex, processedMedia, onView]);

  if (processedMedia.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <PhotoIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No media items to display</p>
      </div>
    );
  }

  const currentMedia = processedMedia[currentIndex];

  return (
    <div ref={galleryRef} className={cn('relative', className)}>
      {/* Grid View */}
      {variant === 'grid' && (
        <div 
          className={cn(
            'grid gap-2',
            `grid-cols-${gridColumns}`,
            aspectRatio === 'square' && 'auto-rows-fr',
            maxHeight <= 400 ? 'max-h-96' : 'max-h-screen'
          )}
        >
          {processedMedia.map((item, index) => (
            <MediaThumbnail
              key={item.id}
              media={item}
              index={index}
              className={cn(thumbnailClassName, itemClassName)}
              onClick={() => {
                setCurrentIndex(index);
                setIsViewerOpen(true);
                onMediaClick?.(item, index);
              }}
            />
          ))}
        </div>
      )}

      {/* Carousel View */}
      {variant === 'carousel' && (
        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div 
              className={cn(
                "flex transition-transform duration-300",
                maxHeight <= 400 ? 'max-h-96' : 'max-h-screen'
              )}
              data-carousel-index={currentIndex}
            >
              {processedMedia.map((item, index) => (
                <div key={item.id} className="w-full flex-shrink-0">
                  <MediaThumbnail
                    media={item}
                    index={index}
                    className={cn('w-full h-full', itemClassName)}
                    onClick={() => {
                      setIsViewerOpen(true);
                      onMediaClick?.(item, index);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {showNavigation && processedMedia.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={goToNext}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Indicators */}
          {showIndicators && processedMedia.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {processedMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Thumbnails Strip */}
      {showThumbnails && isViewerOpen && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {processedMedia.map((item, index) => (
            <MediaThumbnail
              key={item.id}
              media={item}
              index={index}
              isActive={index === currentIndex}
              className={cn('w-16 h-16 flex-shrink-0', thumbnailClassName)}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Media Viewer Modal */}
      <Modal
        open={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          stopSlideshow();
          resetZoom();
        }}
        size="full"
      >
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
            <div className="flex items-center gap-4">
              {showCaptions && (
                <h3 className="font-medium">
                  {currentMedia.caption || `Media ${currentIndex + 1} of ${processedMedia.length}`}
                </h3>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMetadataOverlay(!showMetadataOverlay)}
                className="text-white hover:bg-white hover:bg-opacity-20"
                aria-label={showMetadataOverlay ? "Hide metadata" : "Show metadata"}
              >
                {showMetadataOverlay ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </Button>
              
              {showMetadataOverlay && currentMedia.metadata && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {currentMedia.metadata.width && currentMedia.metadata.height && (
                    <span>{currentMedia.metadata.width} × {currentMedia.metadata.height}</span>
                  )}
                  {currentMedia.metadata.size && (
                    <span>{Math.round(currentMedia.metadata.size / 1024)} KB</span>
                  )}
                  {currentMedia.metadata.duration && (
                    <span>{Math.round(currentMedia.metadata.duration)}s</span>
                  )}
                </div>
              )}
              
              {showMetadata && currentMedia.metadata && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {currentMedia.metadata.width && currentMedia.metadata.height && (
                    <span>{currentMedia.metadata.width} × {currentMedia.metadata.height}</span>
                  )}
                  {currentMedia.metadata.size && (
                    <span>{(currentMedia.metadata.size / 1024 / 1024).toFixed(1)} MB</span>
                  )}
                  {currentMedia.metadata.duration && (
                    <span>
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      {Math.floor(currentMedia.metadata.duration / 60)}:
                      {(currentMedia.metadata.duration % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              {enableZoom && currentMedia.type === 'image' && (
                <>
                  <button
                    onClick={handleZoomOut}
                    aria-label="Zoom out"
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    <MagnifyingGlassMinusIcon className="w-5 h-5" />
                  </button>
                  <span className="text-sm px-2">
                    {Math.round(currentZoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    aria-label="Zoom in"
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    <MagnifyingGlassPlusIcon className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Slideshow Control */}
              {enableSlideshow && (
                <button
                  onClick={isSlideshow ? stopSlideshow : startSlideshow}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  {isSlideshow ? (
                    <PauseIcon className="w-5 h-5" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Fullscreen Toggle */}
              {enableFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  {isFullscreen ? (
                    <ArrowsPointingInIcon className="w-5 h-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Actions */}
              {showInteractions && (
                <div className="flex items-center gap-1 border-l border-gray-600 pl-2 ml-2">
                  <button
                    onClick={() => handleLike(currentMedia.id)}
                    aria-label={likedItems.has(currentMedia.id) ? "Unlike" : "Like"}
                    className={cn(
                      'p-2 hover:bg-white hover:bg-opacity-20 rounded',
                      likedItems.has(currentMedia.id) && 'text-red-400'
                    )}
                  >
                    <HeartIconSolid className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleBookmark(currentMedia.id)}
                    aria-label={likedItems.has(`bookmark-${currentMedia.id}`) ? "Remove bookmark" : "Bookmark"}
                    className={cn(
                      'p-2 hover:bg-white hover:bg-opacity-20 rounded',
                      likedItems.has(`bookmark-${currentMedia.id}`) && 'text-yellow-400'
                    )}
                  >
                    <BookmarkIconSolid className="w-5 h-5" />
                  </button>

                  {enableShare && (
                    <button
                      onClick={() => handleShare(currentMedia.id)}
                      aria-label="Share"
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                    >
                      <ShareIcon className="w-5 h-5" />
                    </button>
                  )}

                  {enableDownload && (
                    <button
                      onClick={() => handleDownload(currentMedia.id)}
                      aria-label="Download"
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Additional Menu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMetadataOverlay(!showMetadataOverlay)}
                className="text-white hover:bg-white hover:bg-opacity-20 ml-2"
                aria-label="Additional options"
              >
                <Bars3BottomLeftIcon className="w-5 h-5" />
              </Button>

              {/* Close */}
              <button
                onClick={() => setIsViewerOpen(false)}
                aria-label="Close viewer"
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded ml-2"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Viewer */}
          <div className="flex-1 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: slideDirection > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection > 0 ? -100 : 100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full h-full flex items-center justify-center"
              >
                <MediaViewer
                  media={currentMedia}
                  zoom={currentZoom}
                  onZoomChange={setCurrentZoom}
                  onLoad={() => onMediaLoad?.(currentMedia)}
                  onError={(error) => onMediaError?.(currentMedia, error)}
                  autoPlayMedia={autoPlayMedia}
                  showControls={showControls}
                  volume={volume}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {processedMedia.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                aria-label="Previous media"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                aria-label="Next media"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Footer Info */}
          <div className="bg-black bg-opacity-50 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {showAuthor && currentMedia.author && (
                  <div className="flex items-center gap-2">
                    {currentMedia.author.avatar && (
                      <Image
                        src={currentMedia.author.avatar}
                        alt={currentMedia.author.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm">{currentMedia.author.name}</span>
                  </div>
                )}

                {showTimestamp && currentMedia.uploadedAt && (
                  <span className="text-sm text-gray-300">
                    {formatDistanceToNow(currentMedia.uploadedAt, { addSuffix: true })}
                  </span>
                )}

                {currentMedia.tags && currentMedia.tags.length > 0 && (
                  <div className="flex gap-1">
                    {currentMedia.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-300">
                {currentIndex + 1} of {processedMedia.length}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewMediaGallery;

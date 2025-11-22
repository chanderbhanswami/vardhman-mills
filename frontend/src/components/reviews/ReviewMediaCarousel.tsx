'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Image from 'next/image';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ShareIcon,
  HeartIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
  FlagIcon,
  InformationCircleIcon,
  EyeIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  PlayIcon as PlayIconSolid
} from '@heroicons/react/24/solid';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';

// Utils
import { cn } from '@/lib/utils';

// Types
interface ExifData {
  [key: string]: string | number | boolean | undefined;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  duration?: number; // for video/audio in seconds
  size?: number; // in bytes
  dimensions?: {
    width: number;
    height: number;
  };
  metadata?: {
    format?: string;
    quality?: 'low' | 'medium' | 'high' | 'original';
    compression?: number;
    colorSpace?: string;
    exif?: ExifData;
  };
  uploadedAt: Date;
  uploadedBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags?: string[];
  likes?: number;
  views?: number;
  downloads?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReported?: boolean;
  status: 'processing' | 'ready' | 'error' | 'removed';
  accessibility?: {
    description?: string;
    transcript?: string;
    subtitles?: string;
  };
}

interface CarouselSettings {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showThumbnails?: boolean;
  showProgress?: boolean;
  showControls?: boolean;
  showInfo?: boolean;
  showActions?: boolean;
  allowFullscreen?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
  allowZoom?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  playbackSpeed?: number;
  quality?: 'auto' | 'low' | 'medium' | 'high' | 'original';
}

interface ZoomState {
  scale: number;
  x: number;
  y: number;
  isDragging: boolean;
}

export interface ReviewMediaCarouselProps {
  // Data
  media: MediaItem[];
  initialIndex?: number;
  
  // Configuration
  variant?: 'gallery' | 'carousel' | 'grid' | 'masonry' | 'slideshow';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  aspectRatio?: 'auto' | '1:1' | '4:3' | '16:9' | '21:9';
  navigation?: 'arrows' | 'dots' | 'both' | 'none';
  thumbnailPosition?: 'bottom' | 'top' | 'left' | 'right' | 'none';
  
  // Settings
  settings?: CarouselSettings;
  
  // Styling
  className?: string;
  containerClassName?: string;
  mediaClassName?: string;
  thumbnailClassName?: string;
  overlayClassName?: string;
  
  // Responsive
  breakpoints?: {
    sm?: Partial<ReviewMediaCarouselProps>;
    md?: Partial<ReviewMediaCarouselProps>;
    lg?: Partial<ReviewMediaCarouselProps>;
    xl?: Partial<ReviewMediaCarouselProps>;
  };
  
  // Behavior
  enableSwipe?: boolean;
  enableKeyboard?: boolean;
  enableMouseWheel?: boolean;
  enableTouch?: boolean;
  dragThreshold?: number;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
  
  // Callbacks
  onMediaChange?: (index: number, media: MediaItem) => void;
  onMediaLoad?: (media: MediaItem) => void;
  onMediaError?: (media: MediaItem, error: Error) => void;
  onMediaLike?: (mediaId: string, liked: boolean) => void;
  onMediaBookmark?: (mediaId: string, bookmarked: boolean) => void;
  onMediaShare?: (mediaId: string) => void;
  onMediaDownload?: (mediaId: string) => void;
  onMediaReport?: (mediaId: string, reason: string) => void;
  onMediaView?: (mediaId: string) => void;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  onZoomChange?: (zoom: ZoomState) => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: ExifData) => void;
}

// Media viewer component for different media types
const MediaViewer: React.FC<{
  media: MediaItem;
  isActive: boolean;
  settings: CarouselSettings;
  zoom: ZoomState;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onZoomChange?: (zoom: ZoomState) => void;
  className?: string;
}> = ({ media, isActive, settings, zoom, onLoad, onError, onZoomChange, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(settings.volume || 1);
  const [muted, setMuted] = useState(settings.muted || false);
  
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle media load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    onLoad?.();
  }, [onLoad]);

  // Handle media error
  const handleError = useCallback((e: React.SyntheticEvent) => {
    setIsLoading(false);
    setError('Failed to load media');
    const errorEvent = new Error(`Failed to load ${media.type}: ${e.type}`);
    onError?.(errorEvent);
  }, [onError, media.type]);

  // Handle video/audio time update
  const handleTimeUpdate = useCallback(() => {
    if (mediaRef.current && 'currentTime' in mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  }, []);

  // Handle video/audio duration change
  const handleDurationChange = useCallback(() => {
    if (mediaRef.current && 'duration' in mediaRef.current) {
      setDuration(mediaRef.current.duration || 0);
    }
  }, []);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (mediaRef.current && 'play' in mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (mediaRef.current && 'volume' in mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    setMuted(!muted);
    if (mediaRef.current && 'muted' in mediaRef.current) {
      mediaRef.current.muted = !muted;
    }
  }, [muted]);

  // Handle seek
  const handleSeek = useCallback((time: number) => {
    if (mediaRef.current && 'currentTime' in mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Handle zoom for images
  const handleImageZoom = useCallback((delta: number, point?: { x: number; y: number }) => {
    if (media.type !== 'image' || !onZoomChange) return;

    const newScale = Math.max(0.1, Math.min(5, zoom.scale + delta));
    const container = containerRef.current;
    
    if (container && point) {
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (point.x - centerX) * (delta / zoom.scale);
      const deltaY = (point.y - centerY) * (delta / zoom.scale);
      
      onZoomChange({
        scale: newScale,
        x: zoom.x - deltaX,
        y: zoom.y - deltaY,
        isDragging: false
      });
    } else {
      onZoomChange({
        ...zoom,
        scale: newScale
      });
    }
  }, [media.type, zoom, onZoomChange]);

  // Auto-play for videos
  useEffect(() => {
    if (isActive && media.type === 'video' && settings.autoPlay && mediaRef.current) {
      const video = mediaRef.current as HTMLVideoElement;
      video.play().catch(() => {
        // Auto-play blocked, user needs to interact first
      });
    }
  }, [isActive, media.type, settings.autoPlay]);

  // Render based on media type
  const renderMedia = () => {
    switch (media.type) {
      case 'image':
        return (
          <div
            ref={containerRef}
            className={cn(
              "relative w-full h-full overflow-hidden",
              settings.allowZoom ? "cursor-zoom-in" : "cursor-default"
            )}
          >
            <motion.img
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              src={media.url}
              alt={media.alt || media.caption || `Media ${media.id}`}
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                "w-full h-full object-contain",
                zoom.scale > 1 ? "cursor-grab" : settings.allowZoom ? "cursor-zoom-in" : "cursor-default"
              )}
              style={{
                transform: `scale(${zoom.scale}) translate(${zoom.x}px, ${zoom.y}px)`
              }}
              drag={zoom.scale > 1}
              dragConstraints={containerRef}
              onDragStart={() => onZoomChange?.({ ...zoom, isDragging: true })}
              onDragEnd={() => onZoomChange?.({ ...zoom, isDragging: false })}
              onClick={(e) => {
                if (settings.allowZoom) {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    handleImageZoom(zoom.scale < 2 ? 1 : -zoom.scale + 1, {
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }
                }
              }}
            />
          </div>
        );
        
      case 'video':
        return (
          <div className="relative w-full h-full">
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={media.url}
              poster={media.thumbnailUrl}
              onLoad={handleLoad}
              onError={handleError}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
              controls={!settings.showControls}
              muted={muted}
              loop={settings.loop}
            />
            
            {settings.showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center gap-3 text-white">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={0.1}
                      onValueChange={([value]) => handleSeek(value)}
                      className="flex-1"
                    />
                  </div>
                  
                  <span className="text-sm tabular-nums">
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} /
                    {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleMuteToggle}
                      className="text-white hover:bg-white/20"
                    >
                      {muted ? (
                        <SpeakerXMarkIcon className="w-4 h-4" />
                      ) : (
                        <SpeakerWaveIcon className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <div className="w-20">
                      <Slider
                        value={[volume]}
                        max={1}
                        step={0.1}
                        onValueChange={([value]) => handleVolumeChange(value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'audio':
        return (
          <div className="flex items-center justify-center w-full h-full bg-gray-100">
            <div className="text-center space-y-4 p-8">
              <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <MusicalNoteIcon className="w-12 h-12 text-blue-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">
                  {media.caption || 'Audio File'}
                </h3>
                {media.duration && (
                  <p className="text-sm text-gray-600">
                    Duration: {Math.floor(media.duration / 60)}:{String(Math.floor(media.duration % 60)).padStart(2, '0')}
                  </p>
                )}
              </div>
              
              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={media.url}
                onLoad={handleLoad}
                onError={handleError}
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={handleDurationChange}
                controls
                className="w-full max-w-md"
              />
            </div>
          </div>
        );
        
      case 'document':
        return (
          <div className="flex items-center justify-center w-full h-full bg-gray-50">
            <div className="text-center space-y-4 p-8">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <DocumentIcon className="w-12 h-12 text-gray-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">
                  {media.caption || 'Document'}
                </h3>
                {media.size && (
                  <p className="text-sm text-gray-600">
                    Size: {(media.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center w-full h-full bg-gray-100">
            <div className="text-center space-y-2">
              <XMarkIcon className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-gray-600">Unsupported media type</p>
            </div>
          </div>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Loading media...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <div className="text-center space-y-2">
          <XMarkIcon className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-600">{error}</p>
          <Button size="sm" variant="outline" onClick={() => {
            setError(null);
            setIsLoading(true);
          }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full h-full', className)}>
      {renderMedia()}
    </div>
  );
};

// Media options menu component using EllipsisHorizontalIcon and FlagIcon
const MediaOptionsMenu: React.FC<{
  media: MediaItem;
  onReport: (reason: string) => void;
  onFlag: () => void;
}> = ({ media, onReport, onFlag }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const reportReasons = [
    'Inappropriate content',
    'Copyright violation',
    'Spam or misleading',
    'Harmful or dangerous',
    'Other'
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <>
      <Tooltip content={`More options for ${media.caption || 'media'}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="text-white hover:bg-white/20 relative"
        >
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </Button>
      </Tooltip>

      {showMenu && (
        <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border p-2 min-w-[160px] z-20">
          <button
            onClick={() => {
              setShowReportModal(true);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
          >
            <FlagIcon className="w-4 h-4" />
            Report content
          </button>
          <button
            onClick={() => {
              onFlag();
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
          >
            <InformationCircleIcon className="w-4 h-4" />
            Flag for review
          </button>
        </div>
      )}

      <Modal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        size="default"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Report Content</h3>
          <p className="text-gray-600 mb-4">
            Help us understand what&apos;s wrong with this content.
          </p>
          
          <div className="space-y-2 mb-4">
            {reportReasons.map((reason) => (
              <label key={reason} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={reportReason === reason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">{reason}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReportModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (reportReason) {
                  onReport(reportReason);
                  setShowReportModal(false);
                  setReportReason('');
                }
              }}
              disabled={!reportReason}
            >
              Report
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Loading overlay component using Skeleton
const LoadingOverlay: React.FC<{
  variant: string;
}> = ({ variant }) => {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-100">
      <div className="text-center space-y-4 p-8">
        {variant === 'gallery' ? (
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-20 w-20" />
            <Skeleton className="h-20 w-20" />
            <Skeleton className="h-20 w-20" />
            <Skeleton className="h-20 w-20" />
          </div>
        ) : (
          <Skeleton className="h-64 w-full" />
        )}
        <Skeleton className="h-4 w-32 mx-auto" />
        <p className="text-sm text-gray-600">Loading media...</p>
      </div>
    </div>
  );
};

// Media thumbnail component
const MediaThumbnail: React.FC<{
  media: MediaItem;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  className?: string;
}> = ({ media, isActive, size = 'md', onClick, className }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const getTypeIcon = () => {
    switch (media.type) {
      case 'video':
        return <VideoCameraIcon className="w-4 h-4" />;
      case 'audio':
        return <MusicalNoteIcon className="w-4 h-4" />;
      case 'document':
        return <DocumentIcon className="w-4 h-4" />;
      default:
        return <PhotoIcon className="w-4 h-4" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-lg overflow-hidden transition-all',
        'border-2 hover:border-blue-300',
        isActive ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200',
        sizeClasses[size],
        className
      )}
    >
      {media.thumbnailUrl || media.type === 'image' ? (
        <Image
          src={media.thumbnailUrl || media.url}
          alt={media.alt || `Thumbnail ${media.id}`}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          {getTypeIcon()}
        </div>
      )}
      
      {media.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
            <PlayIconSolid className="w-3 h-3 text-white ml-0.5" />
          </div>
        </div>
      )}
      
      {media.duration && (
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
          {Math.floor(media.duration / 60)}:{String(Math.floor(media.duration % 60)).padStart(2, '0')}
        </div>
      )}
    </button>
  );
};

// Main carousel component
const ReviewMediaCarousel: React.FC<ReviewMediaCarouselProps> = ({
  media = [],
  initialIndex = 0,
  variant = 'carousel',
  size = 'lg',
  aspectRatio = 'auto',
  navigation = 'both',
  thumbnailPosition = 'bottom',
  settings = {},
  className,
  containerClassName,
  mediaClassName,
  thumbnailClassName,
  overlayClassName,
  enableSwipe = true,
  enableKeyboard = true,
  enableMouseWheel = false,
  enableTouch = true,
  dragThreshold = 50,
  ariaLabel = 'Media carousel',
  onMediaChange,
  onMediaLoad,
  onMediaError,
  onMediaLike,
  onMediaBookmark,
  onMediaShare,
  onMediaDownload,
  onMediaReport,
  onMediaView,
  onFullscreenToggle,
  onZoomChange,
  onAnalyticsEvent
}) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [autoPlayActive, setAutoPlayActive] = useState(settings.autoPlay || false);
  const [zoom, setZoom] = useState<ZoomState>({
    scale: 1,
    x: 0,
    y: 0,
    isDragging: false
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Current media
  const currentMedia = media[currentIndex];

  // Default settings
  const defaultSettings: CarouselSettings = {
    autoPlay: false,
    autoPlayInterval: 5000,
    showThumbnails: true,
    showProgress: true,
    showControls: true,
    showInfo: true,
    showActions: true,
    allowFullscreen: true,
    allowDownload: true,
    allowShare: true,
    allowZoom: true,
    loop: true,
    muted: false,
    volume: 1,
    playbackSpeed: 1,
    quality: 'auto',
    ...settings
  };

  // Navigation functions
  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? 
      (defaultSettings.loop ? media.length - 1 : 0) : 
      currentIndex - 1;
    
    setCurrentIndex(newIndex);
    onMediaChange?.(newIndex, media[newIndex]);
    onAnalyticsEvent?.('media_navigation', { direction: 'previous', index: newIndex });
  }, [currentIndex, media, defaultSettings.loop, onMediaChange, onAnalyticsEvent]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === media.length - 1 ? 
      (defaultSettings.loop ? 0 : media.length - 1) : 
      currentIndex + 1;
    
    setCurrentIndex(newIndex);
    onMediaChange?.(newIndex, media[newIndex]);
    onAnalyticsEvent?.('media_navigation', { direction: 'next', index: newIndex });
  }, [currentIndex, media, defaultSettings.loop, onMediaChange, onAnalyticsEvent]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < media.length) {
      setCurrentIndex(index);
      onMediaChange?.(index, media[index]);
      onAnalyticsEvent?.('media_navigation', { direction: 'direct', index });
    }
  }, [media, onMediaChange, onAnalyticsEvent]);

  // Fullscreen handling
  const handleFullscreenToggle = useCallback(() => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    onFullscreenToggle?.(newFullscreen);
    onAnalyticsEvent?.('fullscreen_toggle', { isFullscreen: newFullscreen });
  }, [isFullscreen, onFullscreenToggle, onAnalyticsEvent]);

  // Zoom handling
  const handleZoomChange = useCallback((newZoom: ZoomState) => {
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [onZoomChange]);

  // Image zoom function
  const handleImageZoom = useCallback((delta: number, point?: { x: number; y: number }) => {
    if (currentMedia?.type !== 'image' || !defaultSettings.allowZoom) return;

    const newScale = Math.max(0.1, Math.min(5, zoom.scale + delta));
    const container = containerRef.current;
    
    if (container && point) {
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (point.x - centerX) * (delta / zoom.scale);
      const deltaY = (point.y - centerY) * (delta / zoom.scale);
      
      handleZoomChange({
        scale: newScale,
        x: zoom.x - deltaX,
        y: zoom.y - deltaY,
        isDragging: false
      });
    } else {
      handleZoomChange({
        ...zoom,
        scale: newScale
      });
    }
  }, [currentMedia?.type, zoom, handleZoomChange, defaultSettings.allowZoom]);

  // Auto-play logic
  useEffect(() => {
    if (autoPlayActive && media.length > 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        goToNext();
      }, defaultSettings.autoPlayInterval);
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [autoPlayActive, defaultSettings.autoPlayInterval, goToNext, media.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          if (isFullscreen) {
            handleFullscreenToggle();
          }
          break;
        case ' ':
          e.preventDefault();
          if (currentMedia?.type === 'video') {
            // Toggle play/pause for videos
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleFullscreenToggle();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setShowInfo(!showInfo);
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          if (currentMedia?.type === 'image') {
            handleZoomChange({ scale: 1, x: 0, y: 0, isDragging: false });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, goToPrevious, goToNext, isFullscreen, currentMedia, handleFullscreenToggle, showInfo, handleZoomChange]);

  // Enhanced keyboard navigation with more features
  const enhancedKeyboardHandler = useMemo(() => {
    return {
      supportedKeys: ['ArrowLeft', 'ArrowRight', 'Escape', ' ', 'f', 'i', 'z', 'm'],
      getKeyDescription: (key: string) => {
        const descriptions = {
          'ArrowLeft': 'Previous media',
          'ArrowRight': 'Next media',
          'Escape': 'Exit fullscreen',
          ' ': 'Play/Pause video',
          'f': 'Toggle fullscreen',
          'i': 'Toggle info',
          'z': 'Reset zoom',
          'm': 'Toggle mute'
        };
        return descriptions[key as keyof typeof descriptions] || 'Unknown';
      },
      isEnabled: enableKeyboard
    };
  }, [enableKeyboard]);

  // Mouse wheel zoom handling
  const handleMouseWheel = useCallback((e: WheelEvent) => {
    if (currentMedia?.type === 'image' && defaultSettings.allowZoom) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      handleImageZoom(delta, { x: e.clientX, y: e.clientY });
    }
  }, [currentMedia, defaultSettings.allowZoom, handleImageZoom]);

  useEffect(() => {
    if (!enableMouseWheel || !containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener('wheel', handleMouseWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleMouseWheel);
  }, [enableMouseWheel, handleMouseWheel]);

  // Touch gesture handling
  useEffect(() => {
    if (!enableTouch || !containerRef.current) return;

    let startDistance = 0;
    let startScale = zoom.scale;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        startDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        startScale = zoom.scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && currentMedia?.type === 'image') {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scale = startScale * (distance / startDistance);
        handleZoomChange({ ...zoom, scale: Math.max(0.1, Math.min(5, scale)) });
      }
    };

    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enableTouch, currentMedia, zoom, handleZoomChange]);

  // Swipe/drag handling
  const handlePanEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!enableSwipe) return;

    const threshold = dragThreshold;
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  }, [enableSwipe, dragThreshold, goToPrevious, goToNext]);

  // Media actions
  const handleMediaAction = useCallback((action: string, mediaId: string) => {
    switch (action) {
      case 'like':
        const isLiked = !currentMedia?.isLiked;
        onMediaLike?.(mediaId, isLiked);
        onAnalyticsEvent?.('media_like', { mediaId, liked: isLiked });
        break;
      case 'bookmark':
        const isBookmarked = !currentMedia?.isBookmarked;
        onMediaBookmark?.(mediaId, isBookmarked);
        onAnalyticsEvent?.('media_bookmark', { mediaId, bookmarked: isBookmarked });
        break;
      case 'share':
        onMediaShare?.(mediaId);
        onAnalyticsEvent?.('media_share', { mediaId });
        break;
      case 'download':
        onMediaDownload?.(mediaId);
        onAnalyticsEvent?.('media_download', { mediaId });
        break;
      case 'report':
        onMediaReport?.(mediaId, 'inappropriate');
        onAnalyticsEvent?.('media_report', { mediaId });
        break;
    }
  }, [currentMedia, onMediaLike, onMediaBookmark, onMediaShare, onMediaDownload, onMediaReport, onAnalyticsEvent]);

  // Track views
  useEffect(() => {
    if (currentMedia) {
      onMediaView?.(currentMedia.id);
      onAnalyticsEvent?.('media_view', { mediaId: currentMedia.id, index: currentIndex });
    }
  }, [currentMedia, currentIndex, onMediaView, onAnalyticsEvent]);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md h-64',
    md: 'max-w-2xl h-96',
    lg: 'max-w-4xl h-[500px]',
    xl: 'max-w-6xl h-[600px]',
    full: 'w-full h-full'
  };

  // Aspect ratio classes
  const aspectRatioClasses = {
    auto: '',
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]'
  };

  // Loading state for different variants
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading based on variant
    const loadingTime = variant === 'slideshow' ? 2000 : variant === 'masonry' ? 1500 : 1000;
    const timer = setTimeout(() => setIsInitialLoading(false), loadingTime);
    return () => clearTimeout(timer);
  }, [variant]);

  // Show loading overlay during initial load
  if (isInitialLoading) {
    return (
      <Card className={cn('relative overflow-hidden', sizeClasses[size], className)}>
        <LoadingOverlay variant={variant} />
      </Card>
    );
  }

  // Empty state
  if (media.length === 0) {
    return (
      <Card className={cn('p-12 text-center', className)}>
        <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {variant === 'gallery' ? 'No gallery items' : 
           variant === 'slideshow' ? 'No slides available' :
           variant === 'masonry' ? 'No masonry items' :
           variant === 'grid' ? 'No grid items' : 'No media available'}
        </h3>
        <p className="text-gray-600">
          {variant === 'slideshow' ? 'Add slides to start your slideshow.' :
           'There are no images or videos to display.'}
        </p>
      </Card>
    );
  }

  return (
    <div className={cn('relative', containerClassName)}>
      {/* Main carousel container */}
      <Card className={cn(
        'relative overflow-hidden bg-black',
        sizeClasses[size],
        aspectRatio !== 'auto' && aspectRatioClasses[aspectRatio],
        isFullscreen && 'fixed inset-0 z-50 max-w-none h-screen rounded-none',
        className
      )}>
        {/* Media viewer */}
        <motion.div
          ref={containerRef}
          className="relative w-full h-full"
          onPanEnd={handlePanEnd}
          drag={enableSwipe ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          aria-label={ariaLabel}
        >
          <MediaViewer
            media={currentMedia}
            isActive={true}
            settings={defaultSettings}
            zoom={zoom}
            onLoad={() => onMediaLoad?.(currentMedia)}
            onError={(error) => onMediaError?.(currentMedia, error)}
            onZoomChange={handleZoomChange}
            className={mediaClassName}
          />
        </motion.div>

        {/* Navigation arrows */}
        {navigation !== 'none' && navigation !== 'dots' && media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
              disabled={!defaultSettings.loop && currentIndex === 0}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
              disabled={!defaultSettings.loop && currentIndex === media.length - 1}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Progress indicator */}
        {defaultSettings.showProgress && media.length > 1 && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <Progress
              value={(currentIndex / (media.length - 1)) * 100}
              className="h-1 bg-white/20"
            />
          </div>
        )}

        {/* Top overlay with actions */}
        {defaultSettings.showActions && (
          <div className={cn(
            'absolute top-4 right-4 flex items-center gap-2 z-10',
            overlayClassName
          )}>
            {defaultSettings.allowFullscreen && (
              <Tooltip content={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreenToggle}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? (
                    <ArrowsPointingInIcon className="w-5 h-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-5 h-5" />
                  )}
                </Button>
              </Tooltip>
            )}
            
            {defaultSettings.allowZoom && currentMedia?.type === 'image' && (
              <div className="flex items-center gap-1">
                <Tooltip content="Zoom out">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleZoomChange({ ...zoom, scale: Math.max(0.1, zoom.scale - 0.5) })}
                    className="text-white hover:bg-white/20"
                  >
                    <MagnifyingGlassMinusIcon className="w-5 h-5" />
                  </Button>
                </Tooltip>
                <Tooltip content="Zoom in">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleZoomChange({ ...zoom, scale: Math.min(5, zoom.scale + 0.5) })}
                    className="text-white hover:bg-white/20"
                  >
                    <MagnifyingGlassPlusIcon className="w-5 h-5" />
                  </Button>
                </Tooltip>
              </div>
            )}

            <Tooltip content={showInfo ? 'Hide info' : 'Show info'}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="text-white hover:bg-white/20"
              >
                <InformationCircleIcon className="w-5 h-5" />
              </Button>
            </Tooltip>

            {/* Media options menu */}
            <MediaOptionsMenu
              media={currentMedia}
              onReport={(reason) => {
                handleMediaAction('report', currentMedia.id);
                onAnalyticsEvent?.('media_report', { mediaId: currentMedia.id, reason });
              }}
              onFlag={() => {
                handleMediaAction('flag', currentMedia.id);
                onAnalyticsEvent?.('media_flag', { mediaId: currentMedia.id });
              }}
            />

            {/* Keyboard shortcuts info */}
            {enhancedKeyboardHandler.isEnabled && (
              <Tooltip 
                content={
                  <div className="text-xs space-y-1">
                    <div className="font-semibold">Keyboard Shortcuts:</div>
                    {enhancedKeyboardHandler.supportedKeys.slice(0, 4).map(key => (
                      <div key={key} className="flex justify-between gap-2">
                        <span>{key}</span>
                        <span>{enhancedKeyboardHandler.getKeyDescription(key)}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        )}

        {/* Bottom overlay with media actions */}
        {defaultSettings.showActions && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Like button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMediaAction('like', currentMedia.id)}
                  className="text-white hover:bg-white/20"
                >
                  {currentMedia.isLiked ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  {currentMedia.likes && (
                    <span className="ml-1 text-sm">{currentMedia.likes}</span>
                  )}
                </Button>

                {/* Bookmark button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMediaAction('bookmark', currentMedia.id)}
                  className="text-white hover:bg-white/20"
                >
                  {currentMedia.isBookmarked ? (
                    <BookmarkIconSolid className="w-5 h-5 text-blue-500" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5" />
                  )}
                </Button>

                {/* Share button */}
                {defaultSettings.allowShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMediaAction('share', currentMedia.id)}
                    className="text-white hover:bg-white/20"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </Button>
                )}

                {/* Download button */}
                {defaultSettings.allowDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMediaAction('download', currentMedia.id)}
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-play toggle */}
                {media.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoPlayActive}
                      onChange={(e) => setAutoPlayActive(e.target.checked)}
                      size="sm"
                    />
                    <span className="text-white text-sm">Auto-play</span>
                  </div>
                )}

                {/* Media counter */}
                <span className="text-white text-sm tabular-nums">
                  {currentIndex + 1} / {media.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Media info overlay */}
        <AnimatePresence>
          {showInfo && currentMedia && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white z-10"
            >
              <div className="space-y-2">
                {currentMedia.caption && (
                  <h3 className="font-semibold">{currentMedia.caption}</h3>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  {currentMedia.uploadedBy && (
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={currentMedia.uploadedBy.avatar}
                        alt={currentMedia.uploadedBy.name}
                        fallback={currentMedia.uploadedBy.name.charAt(0)}
                        size="sm"
                      />
                      <span>{currentMedia.uploadedBy.name}</span>
                    </div>
                  )}
                  
                  <span>{currentMedia.uploadedAt.toLocaleDateString()}</span>
                  
                  {currentMedia.views && (
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{currentMedia.views.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {currentMedia.tags && currentMedia.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentMedia.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dots navigation */}
        {navigation !== 'none' && navigation !== 'arrows' && media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Thumbnails */}
      {defaultSettings.showThumbnails && media.length > 1 && !isFullscreen && (
        <div className={cn(
          'mt-4 flex gap-2 overflow-x-auto py-2',
          thumbnailPosition === 'top' && 'order-first mt-0 mb-4',
          thumbnailClassName
        )}>
          {media.map((item, index) => (
            <MediaThumbnail
              key={item.id}
              media={item}
              isActive={index === currentIndex}
              onClick={() => goToIndex(index)}
              className="flex-shrink-0"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewMediaCarousel;
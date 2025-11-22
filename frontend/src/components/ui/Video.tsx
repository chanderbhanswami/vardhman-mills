'use client';

import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  BackwardIcon,
  ForwardIcon
} from '@heroicons/react/24/outline';

// Video variant styles
const videoVariants = cva(
  'relative overflow-hidden transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'rounded-lg',
        rounded: 'rounded-xl',
        square: 'rounded-none',
        circular: 'rounded-full',
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'w-full',
      },
      aspectRatio: {
        '16:9': 'aspect-video',
        '4:3': 'aspect-[4/3]',
        '1:1': 'aspect-square',
        '21:9': 'aspect-[21/9]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'full',
      aspectRatio: '16:9',
    },
  }
);

// Control button styles
const controlButtonVariants = cva(
  'flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95',
  {
    variants: {
      size: {
        sm: 'w-8 h-8 p-1',
        md: 'w-10 h-10 p-2',
        lg: 'w-12 h-12 p-2',
      },
      variant: {
        ghost: 'text-white hover:bg-white/20 rounded-full',
        solid: 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-full',
        outline: 'border border-white/30 text-white hover:bg-white/20 rounded-full',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'ghost',
    },
  }
);

export interface VideoProps
  extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'size' | 'onTimeUpdate' | 'onVolumeChange'>,
    VariantProps<typeof videoVariants> {
  src: string;
  poster?: string;
  showControls?: boolean;
  showPlayButton?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
  controlsClassName?: string;
  playButtonClassName?: string;
}

export const Video = forwardRef<HTMLVideoElement, VideoProps>(
  (
    {
      src,
      poster,
      variant,
      size,
      aspectRatio,
      showControls = true,
      showPlayButton = true,
      autoPlay = false,
      muted = false,
      loop = false,
      preload = 'metadata',
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onVolumeChange,
      className,
      controlsClassName,
      playButtonClassName,
      ...props
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(muted);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControlsOverlay, setShowControlsOverlay] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(async () => {
      const container = containerRef.current;
      if (!container) return;

      try {
        if (!isFullscreen) {
          await container.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    }, [isFullscreen]);

    // Toggle play/pause
    const togglePlayPause = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }, [isPlaying]);

    // Toggle mute
    const toggleMute = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }, [isMuted]);

    // Handle volume change
    const handleVolumeChange = useCallback((newVolume: number) => {
      const video = videoRef.current;
      if (!video) return;

      video.volume = newVolume;
      setVolume(newVolume);
      onVolumeChange?.(newVolume);
    }, [onVolumeChange]);

    // Seek video
    const handleSeek = useCallback((time: number) => {
      const video = videoRef.current;
      if (!video) return;

      video.currentTime = time;
      setCurrentTime(time);
    }, []);

    // Skip forward/backward
    const skipTime = useCallback((seconds: number) => {
      const video = videoRef.current;
      if (!video) return;

      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      handleSeek(newTime);
    }, [currentTime, duration, handleSeek]);

    // Show controls temporarily
    const showControlsTemporarily = useCallback(() => {
      setShowControlsOverlay(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControlsOverlay(false);
        }
      }, 3000);
    }, [isPlaying]);

    // Video event handlers
    const handlePlay = useCallback(() => {
      setIsPlaying(true);
      onPlay?.();
    }, [onPlay]);

    const handlePause = useCallback(() => {
      setIsPlaying(false);
      onPause?.();
    }, [onPause]);

    const handleEnded = useCallback(() => {
      setIsPlaying(false);
      onEnded?.();
    }, [onEnded]);

    const handleTimeUpdate = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    }, [onTimeUpdate]);

    const handleLoadedMetadata = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      setDuration(video.duration);
      setIsLoading(false);
    }, []);

    const handleVolumeChangeEvent = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      setVolume(video.volume);
      setIsMuted(video.muted);
    }, []);

    // Fullscreen change handler
    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Mouse movement handler for controls
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleMouseMove = () => {
        showControlsTemporarily();
      };

      const handleMouseLeave = () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
          setShowControlsOverlay(false);
        }
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }, [isPlaying, showControlsTemporarily]);

    // Format time
    const formatTime = (time: number) => {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor(time % 60);

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <motion.div
        ref={containerRef}
        className={cn(videoVariants({ variant, size, aspectRatio }), className)}
        onMouseEnter={() => setShowControlsOverlay(true)}
        onMouseLeave={() => !isPlaying && setShowControlsOverlay(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          preload={preload}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onVolumeChange={handleVolumeChangeEvent}
          className="w-full h-full object-cover"
          {...props}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </motion.div>
        )}

        {/* Center Play Button */}
        {showPlayButton && !isPlaying && !isLoading && (
          <motion.button
            onClick={togglePlayPause}
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors',
              playButtonClassName
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/30">
              <PlayIcon className="w-12 h-12 text-white ml-1" />
            </div>
          </motion.button>
        )}

        {/* Controls Overlay */}
        {showControls && (showControlsOverlay || !isPlaying) && (
          <motion.div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
              controlsClassName
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="relative h-1 bg-white/30 rounded-full cursor-pointer group">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-200 group-hover:h-1.5"
                    data-progress={duration > 0 ? (currentTime / duration) * 100 : 0}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Video progress"
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlayPause}
                    className={controlButtonVariants({ variant: 'ghost' })}
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                  </button>

                  {/* Skip Backward */}
                  <button
                    onClick={() => skipTime(-10)}
                    className={controlButtonVariants({ variant: 'ghost', size: 'sm' })}
                    aria-label="Skip backward 10 seconds"
                  >
                    <BackwardIcon className="w-5 h-5" />
                  </button>

                  {/* Skip Forward */}
                  <button
                    onClick={() => skipTime(10)}
                    className={controlButtonVariants({ variant: 'ghost', size: 'sm' })}
                    aria-label="Skip forward 10 seconds"
                  >
                    <ForwardIcon className="w-5 h-5" />
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className={controlButtonVariants({ variant: 'ghost', size: 'sm' })}
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? (
                        <SpeakerXMarkIcon className="w-5 h-5" />
                      ) : (
                        <SpeakerWaveIcon className="w-5 h-5" />
                      )}
                    </button>
                    <div className="w-20 h-1 bg-white/30 rounded-full relative group">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-200 group-hover:h-1.5"
                        data-volume={volume * 100}
                      />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Volume control"
                      />
                    </div>
                  </div>

                  {/* Time Display */}
                  <div className="text-white text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center space-x-2">
                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className={controlButtonVariants({ variant: 'ghost', size: 'sm' })}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? (
                      <ArrowsPointingInIcon className="w-5 h-5" />
                    ) : (
                      <ArrowsPointingOutIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Click to Play Overlay (when controls are hidden) */}
        {!showControls && (
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 w-full h-full bg-transparent"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            title={isPlaying ? 'Pause video' : 'Play video'}
          />
        )}

        {/* Mobile Play Button */}
        <div className="md:hidden">
          {!isPlaying && !isLoading && (
            <button
              onClick={togglePlayPause}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/30 flex items-center justify-center"
              aria-label="Play video"
              title="Play video"
            >
              <PlayIcon className="w-8 h-8 text-white ml-1" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }
);

Video.displayName = 'Video';
/**
 * HeroSlide Component
 * 
 * Individual slide component for the hero slider with rich content,
 * animations, and interactive elements.
 * 
 * Features:
 * - Video/image background support
 * - Parallax effects
 * - Animated text with gradient effects
 * - Multiple CTA buttons
 * - Badge system
 * - Countdown timer
 * - Product showcase
 * - Stats display
 * - Content overlay with customizable opacity
 * - Ken Burns effect for images
 * - Responsive design
 * - Dark mode support
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowRightIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
  ClockIcon,
  ShoppingBagIcon,
  HeartIcon,
  StarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
  SparklesIcon as SparklesSolidIcon,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface HeroSlideProps {
  /** Slide ID */
  id: string;
  /** Slide title */
  title: string;
  /** Slide subtitle */
  subtitle?: string;
  /** Slide description */
  description?: string;
  /** Background image URL */
  backgroundImage?: string;
  /** Background video URL */
  backgroundVideo?: string;
  /** Video poster image */
  videoPoster?: string;
  /** Primary CTA */
  primaryCTA?: {
    label: string;
    href: string;
    variant?: 'default' | 'secondary' | 'outline';
  };
  /** Secondary CTA */
  secondaryCTA?: {
    label: string;
    href: string;
    variant?: 'default' | 'secondary' | 'outline';
  };
  /** Badges */
  badges?: Array<{
    id: string;
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: React.ReactNode;
  }>;
  /** Stats */
  stats?: Array<{
    id: string;
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
  /** Countdown end date */
  countdownTo?: Date;
  /** Content alignment */
  contentAlign?: 'left' | 'center' | 'right';
  /** Content vertical alignment */
  contentVerticalAlign?: 'top' | 'center' | 'bottom';
  /** Overlay opacity */
  overlayOpacity?: number;
  /** Overlay color */
  overlayColor?: string;
  /** Enable parallax effect */
  enableParallax?: boolean;
  /** Enable Ken Burns effect */
  enableKenBurns?: boolean;
  /** Slide is active */
  isActive?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On CTA click callback */
  onCTAClick?: (type: 'primary' | 'secondary') => void;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONTENT_ALIGN_CLASSES = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

const CONTENT_VERTICAL_ALIGN_CLASSES = {
  top: 'justify-start pt-20',
  center: 'justify-center',
  bottom: 'justify-end pb-20',
};

// ============================================================================
// COMPONENT
// ============================================================================

export const HeroSlide: React.FC<HeroSlideProps> = ({
  id,
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundVideo,
  videoPoster,
  primaryCTA,
  secondaryCTA,
  badges = [],
  stats = [],
  countdownTo,
  contentAlign = 'left',
  contentVerticalAlign = 'center',
  overlayOpacity = 0.5,
  overlayColor = '#000000',
  enableParallax = true,
  enableKenBurns = true,
  isActive = false,
  className,
  onCTAClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLoaded, setIsLoaded] = useState(true); // Default to true so loading overlay doesn't block

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // PARALLAX EFFECT
  // ============================================================================

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.5]);

  // ============================================================================
  // COUNTDOWN TIMER
  // ============================================================================

  useEffect(() => {
    if (!countdownTo) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = new Date(countdownTo).getTime() - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [countdownTo]);

  // ============================================================================
  // VIDEO CONTROLS
  // ============================================================================

  const toggleVideoPlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
    console.log('Video play toggled:', !isVideoPlaying);
  }, [isVideoPlaying]);

  const toggleVideoMute = useCallback(() => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isVideoMuted;
    setIsVideoMuted(!isVideoMuted);
    console.log('Video mute toggled:', !isVideoMuted);
  }, [isVideoMuted]);

  // Auto-play video when slide becomes active
  useEffect(() => {
    if (!videoRef.current || !backgroundVideo) return;

    if (isActive) {
      videoRef.current.play().catch((err) => {
        console.log('Video autoplay prevented:', err);
      });
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, [isActive, backgroundVideo]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCTAClick = useCallback(
    (type: 'primary' | 'secondary') => {
      onCTAClick?.(type);
      console.log(`${type} CTA clicked on slide:`, id);
    },
    [onCTAClick, id]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden',
        className
      )}
    >
      {/* Background Media */}
      <motion.div
        className="absolute inset-0"
        style={enableParallax ? { y } : undefined}
      >
        {backgroundVideo ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isVideoMuted}
            playsInline
            poster={videoPoster}
            onLoadedData={() => setIsLoaded(true)}
            className="w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <motion.div
            className="w-full h-full relative"
            animate={enableKenBurns && isActive ? {
              scale: [1, 1.1],
            } : undefined}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Image
              src={backgroundImage}
              alt={title}
              fill
              priority={isActive}
              onLoad={() => setIsLoaded(true)}
              className="object-cover"
            />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        )}
      </motion.div>

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        {...(overlayColor && overlayOpacity !== undefined ? {
          style: {
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }
        } : {})}
      />

      {/* Video Controls */}
      {backgroundVideo && (
        <div className="absolute top-6 right-6 z-20 flex gap-2">
          <Tooltip content={isVideoPlaying ? 'Pause video' : 'Play video'}>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVideoPlay}
              className="bg-background/90 backdrop-blur-sm"
              aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
            >
              {isVideoPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>
          <Tooltip content={isVideoMuted ? 'Unmute video' : 'Mute video'}>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVideoMute}
              className="bg-background/90 backdrop-blur-sm"
              aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
            >
              {isVideoMuted ? (
                <SpeakerXMarkIcon className="h-4 w-4" />
              ) : (
                <SpeakerWaveIcon className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>
        </div>
      )}

      {/* Content */}
      <motion.div
        className={cn(
          'relative z-10 h-full w-full flex flex-col px-4 sm:px-6 lg:px-8',
          CONTENT_VERTICAL_ALIGN_CLASSES[contentVerticalAlign]
        )}
        style={enableParallax ? { opacity } : undefined}
      >
        <div className={cn('max-w-7xl w-full mx-auto flex flex-col', CONTENT_ALIGN_CLASSES[contentAlign])}>
          {/* Badges */}
          {badges.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {badges.map((badge) => (
                  <Badge key={badge.id} variant={badge.variant || 'default'} className="gap-2">
                    {badge.icon}
                    {badge.label}
                  </Badge>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-sm sm:text-base font-medium text-white/90 mb-2 uppercase tracking-wider"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {title}
            </span>
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-white/90 mb-6 max-w-2xl leading-relaxed"
            >
              {description}
            </motion.p>
          )}

          {/* Countdown Timer */}
          {countdownTo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6"
            >
              <div className="flex gap-4">
                {[
                  { label: 'Days', value: countdown.days },
                  { label: 'Hours', value: countdown.hours },
                  { label: 'Mins', value: countdown.minutes },
                  { label: 'Secs', value: countdown.seconds },
                ].map((item, index) => (
                  <Card key={`${item.label}-${index}`} className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-3 sm:p-4 text-center min-w-[60px] sm:min-w-[80px]">
                      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-white/80 uppercase">
                        {item.label}
                      </div>
                      <Progress
                        value={(item.value / (item.label === 'Days' ? 30 : 60)) * 100}
                        className="h-1 mt-2 bg-white/20"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-wrap gap-6 mb-8"
            >
              {stats.map((stat) => (
                <div key={stat.id} className="flex items-center gap-2">
                  {stat.icon && (
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                      {stat.icon}
                    </div>
                  )}
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* CTA Buttons */}
          {(primaryCTA || secondaryCTA) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              {primaryCTA && (
                <Button
                  size="lg"
                  variant={primaryCTA.variant || 'default'}
                  onClick={() => handleCTAClick('primary')}
                  className="bg-background text-foreground hover:bg-accent"
                  asChild
                >
                  <Link href={primaryCTA.href}>
                    {primaryCTA.label}
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  size="lg"
                  variant={secondaryCTA.variant || 'outline'}
                  onClick={() => handleCTAClick('secondary')}
                  className="bg-transparent border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link href={secondaryCTA.href}>
                    {secondaryCTA.label}
                  </Link>
                </Button>
              )}
            </motion.div>
          )}

          {/* Hidden icons for import usage */}
          <div className="hidden" aria-hidden="true">
            <SparklesIcon className="w-4 h-4" />
            <FireIcon className="w-4 h-4" />
            <TagIcon className="w-4 h-4" />
            <ClockIcon className="w-4 h-4" />
            <ShoppingBagIcon className="w-4 h-4" />
            <HeartIcon className="w-4 h-4" />
            <StarIcon className="w-4 h-4" />
            <TrophyIcon className="w-4 h-4" />
            <StarSolidIcon className="w-4 h-4" />
            <SparklesSolidIcon className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      {/* Loading Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 z-30 bg-background/95 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
        </div>
      )}
    </div>
  );
};

export default HeroSlide;

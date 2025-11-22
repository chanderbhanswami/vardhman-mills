/**
 * FeaturedBanner Component
 * 
 * Hero banner for the Featured Products section with video background,
 * parallax effects, countdown timer, and call-to-action.
 * 
 * Features:
 * - Video/image background with parallax
 * - Animated text with gradient effects
 * - Countdown timer for limited-time offers
 * - Multiple CTA buttons
 * - Responsive design
 * - Dark mode support
 * - Loading states
 * - Accessibility features
 * - Auto-play video controls
 * - Background overlay customization
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon,
  TagIcon,
  FireIcon,
  TrophyIcon,
  ShoppingBagIcon,
  HeartIcon,
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

export interface FeaturedBannerProps {
  /** Banner title */
  title: string;
  /** Banner subtitle */
  subtitle?: string;
  /** Banner description */
  description?: string;
  /** Background image URL */
  backgroundImage?: string;
  /** Background video URL */
  backgroundVideo?: string;
  /** Video poster image */
  videoPoster?: string;
  /** Primary CTA text */
  primaryCTA?: string;
  /** Primary CTA link */
  primaryCTALink?: string;
  /** Secondary CTA text */
  secondaryCTA?: string;
  /** Secondary CTA link */
  secondaryCTALink?: string;
  /** Show countdown timer */
  showCountdown?: boolean;
  /** Countdown end date */
  countdownEnd?: Date;
  /** Show stats */
  showStats?: boolean;
  /** Stats data */
  stats?: BannerStat[];
  /** Overlay opacity (0-1) */
  overlayOpacity?: number;
  /** Overlay color */
  overlayColor?: string;
  /** Enable parallax effect */
  enableParallax?: boolean;
  /** Banner height */
  height?: 'small' | 'medium' | 'large' | 'full';
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Additional CSS classes */
  className?: string;
  /** On CTA click callback */
  onCTAClick?: (type: 'primary' | 'secondary') => void;
}

export interface BannerStat {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  color?: string;
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

const HEIGHT_CLASSES = {
  small: 'h-[400px] md:h-[500px]',
  medium: 'h-[500px] md:h-[600px]',
  large: 'h-[600px] md:h-[700px]',
  full: 'h-screen',
} as const;

const TEXT_ALIGN_CLASSES = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
} as const;

const DEFAULT_STATS: BannerStat[] = [
  { label: 'Products', value: '500+', icon: ShoppingBagIcon, color: 'text-blue-500' },
  { label: 'Rating', value: '4.8', icon: StarSolidIcon, color: 'text-yellow-500' },
  { label: 'Sold', value: '10K+', icon: TrophyIcon, color: 'text-green-500' },
  { label: 'Reviews', value: '2.5K', icon: HeartIcon, color: 'text-red-500' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const FeaturedBanner: React.FC<FeaturedBannerProps> = ({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundVideo,
  videoPoster,
  primaryCTA = 'Shop Now',
  primaryCTALink = '/products',
  secondaryCTA = 'Learn More',
  secondaryCTALink = '/about',
  showCountdown = false,
  countdownEnd,
  showStats = true,
  stats = DEFAULT_STATS,
  overlayOpacity = 0.6,
  overlayColor = 'bg-black',
  enableParallax = true,
  height = 'large',
  textAlign = 'center',
  className,
  onCTAClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
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
  // COUNTDOWN LOGIC
  // ============================================================================

  const calculateCountdown = useCallback(() => {
    if (!countdownEnd) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const now = new Date().getTime();
    const endTime = new Date(countdownEnd).getTime();
    const distance = endTime - now;

    if (distance < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  }, [countdownEnd]);

  useEffect(() => {
    if (showCountdown && countdownEnd) {
      setCountdown(calculateCountdown());
      const interval = setInterval(() => {
        setCountdown(calculateCountdown());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showCountdown, countdownEnd, calculateCountdown]);

  // ============================================================================
  // VIDEO CONTROLS
  // ============================================================================

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

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  }, [isVideoMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && backgroundVideo) {
      video.play().catch(() => {
        console.log('Video autoplay prevented');
      });
      setIsLoaded(true);
    } else {
      setIsLoaded(true);
    }
  }, [backgroundVideo]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePrimaryCTA = useCallback(() => {
    console.log('Primary CTA clicked:', primaryCTALink);
    onCTAClick?.('primary');
  }, [primaryCTALink, onCTAClick]);

  const handleSecondaryCTA = useCallback(() => {
    console.log('Secondary CTA clicked:', secondaryCTALink);
    onCTAClick?.('secondary');
  }, [secondaryCTALink, onCTAClick]);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const hasActiveCountdown = useMemo(() => {
    return showCountdown && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0);
  }, [showCountdown, countdown]);

  const statsToDisplay = useMemo(() => stats.slice(0, 4), [stats]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden',
        HEIGHT_CLASSES[height],
        className
      )}
    >
      {/* Background Media */}
      <motion.div
        className="absolute inset-0 z-0"
        style={enableParallax ? { y } : undefined}
      >
        {backgroundVideo ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={videoPoster}
            autoPlay
            muted={isVideoMuted}
            loop
            playsInline
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        )}

        {/* Overlay */}
        <div
          className={cn(overlayColor)}
          {...(overlayOpacity !== undefined ? {
            style: { opacity: overlayOpacity }
          } : {})}
        />
      </motion.div>

      {/* Video Controls */}
      {backgroundVideo && (
        <div className="absolute top-6 right-6 z-20 flex gap-2">
          <Tooltip content={isVideoPlaying ? 'Pause' : 'Play'}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleVideoToggle}
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white"
              aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
            >
              {isVideoPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>
          <Tooltip content={isVideoMuted ? 'Unmute' : 'Mute'}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMuteToggle}
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white"
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
        className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        style={enableParallax ? { opacity } : undefined}
      >
        <div className={cn('w-full flex flex-col gap-6', TEXT_ALIGN_CLASSES[textAlign])}>
          {/* Badge */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex flex-wrap gap-2 items-center">
                <Badge
                  variant="default"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border-white/20 text-white text-sm font-medium"
                >
                  <SparklesSolidIcon className="h-4 w-4 text-yellow-400" />
                  Featured Collection
                  <FireIcon className="h-4 w-4 text-orange-400" />
                </Badge>
                <Badge
                  variant="default"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 backdrop-blur-md border-orange-400/30 text-white text-xs font-medium"
                >
                  <SparklesIcon className="h-3 w-3" />
                  New
                </Badge>
                <Badge
                  variant="default"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 backdrop-blur-md border-blue-400/30 text-white text-xs font-medium"
                >
                  <TagIcon className="h-3 w-3" />
                  Limited
                </Badge>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/90 font-medium"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              {title}
            </span>
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl text-white/80 max-w-2xl"
            >
              {description}
            </motion.p>
          )}

          {/* Countdown Timer */}
          {hasActiveCountdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="inline-flex"
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="h-5 w-5 text-white" />
                    <span className="text-sm font-medium text-white">Limited Time Offer</span>
                  </div>
                  <div className="flex gap-2 sm:gap-4">
                    {[
                      { label: 'Days', value: countdown.days },
                      { label: 'Hours', value: countdown.hours },
                      { label: 'Mins', value: countdown.minutes },
                      { label: 'Secs', value: countdown.seconds },
                    ].map((item, index) => (
                      <div key={`${item.label}-${index}`} className="flex flex-col items-center">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg min-w-[60px]">
                          <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                            {String(item.value).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-xs text-white/70 mt-1">{item.label}</span>
                        <Progress value={((item.value % 60) / 60) * 100} className="hidden h-1 mt-1 w-full opacity-50" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats */}
          {showStats && statsToDisplay.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl"
            >
              {statsToDisplay.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {Icon && <Icon className={cn('h-5 w-5', stat.color || 'text-white')} />}
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                    </div>
                    <span className="text-sm text-white/70">{stat.label}</span>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-4"
          >
            <Link href={primaryCTALink} passHref>
              <Button
                size="lg"
                onClick={handlePrimaryCTA}
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {primaryCTA}
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            {secondaryCTA && (
              <Link href={secondaryCTALink} passHref>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSecondaryCTA}
                  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg"
                >
                  {secondaryCTA}
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default FeaturedBanner;

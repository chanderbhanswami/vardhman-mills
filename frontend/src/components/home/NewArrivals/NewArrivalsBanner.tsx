/**
 * NewArrivalsBanner Component
 * 
 * Eye-catching banner for the New Arrivals section with countdown timer,
 * animated badges, and strong call-to-actions.
 * 
 * Features:
 * - Large hero image/video background
 * - Animated gradient text
 * - Countdown timer for limited offers
 * - Floating badge system
 * - Product preview grid
 * - Statistics display
 * - Multiple CTAs
 * - Parallax effects
 * - Particle animations
 * - Responsive design
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  SparklesIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  TrophyIcon,
  HeartIcon,
  ShoppingBagIcon,
  ClockIcon,
  ArrowRightIcon,
  GiftIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PreviewProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
}

export interface BannerStat {
  id: string;
  icon: React.ReactNode;
  value: string;
  label: string;
}

export interface NewArrivalsBannerProps {
  /** Banner title */
  title?: string;
  /** Banner subtitle */
  subtitle?: string;
  /** Banner description */
  description?: string;
  /** Background image URL */
  backgroundImage?: string;
  /** Background video URL */
  backgroundVideo?: string;
  /** Countdown end date */
  countdownDate?: Date;
  /** Preview products */
  previewProducts?: PreviewProduct[];
  /** Statistics */
  stats?: BannerStat[];
  /** Primary CTA */
  primaryCta?: {
    label: string;
    href: string;
  };
  /** Secondary CTA */
  secondaryCta?: {
    label: string;
    href: string;
  };
  /** Enable parallax */
  enableParallax?: boolean;
  /** Enable particles */
  enableParticles?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// PARTICLE COMPONENT
// ============================================================================

interface ParticleProps {
  delay: number;
  duration: number;
  x: number;
  y: number;
}

const Particle: React.FC<ParticleProps> = ({ delay, duration, x, y }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      x: [x, x + Math.random() * 100 - 50],
      y: [y, y - 200],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 5,
    }}
    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
  />
);

// ============================================================================
// COMPONENT
// ============================================================================

export const NewArrivalsBanner: React.FC<NewArrivalsBannerProps> = ({
  title = 'New Arrivals',
  subtitle = 'Fresh Collections Just Dropped',
  description = 'Discover the latest trends and exclusive designs that just arrived',
  backgroundImage,
  backgroundVideo,
  countdownDate,
  previewProducts = [],
  stats = [],
  primaryCta = { label: 'Shop Now', href: '/new-arrivals' },
  secondaryCta = { label: 'View Collection', href: '/collections/new' },
  enableParallax = true,
  enableParticles = true,
  className,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ============================================================================
  // REFS
  // ============================================================================

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ============================================================================
  // PARALLAX
  // ============================================================================

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], enableParallax ? [0, -100] : [0, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 1.05]);

  // ============================================================================
  // COUNTDOWN
  // ============================================================================

  useEffect(() => {
    if (!countdownDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = countdownDate.getTime() - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [countdownDate]);

  // ============================================================================
  // VIDEO
  // ============================================================================

  useEffect(() => {
    if (backgroundVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        console.log('Video autoplay failed');
      });
    }
  }, [backgroundVideo]);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const hasCountdown = useMemo(() => {
    return countdownDate && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0);
  }, [countdownDate, countdown]);

  const particles = useMemo(() => {
    if (!enableParticles) return [];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 2,
      x: Math.random() * window.innerWidth,
      y: Math.random() * 500,
    }));
  }, [enableParticles]);

  const defaultStats: BannerStat[] = useMemo(
    () => [
      {
        id: 'products',
        icon: <ShoppingBagIcon className="h-5 w-5" />,
        value: '500+',
        label: 'New Items',
      },
      {
        id: 'categories',
        icon: <TagIcon className="h-5 w-5" />,
        value: '25+',
        label: 'Categories',
      },
      {
        id: 'discount',
        icon: <GiftIcon className="h-5 w-5" />,
        value: '40%',
        label: 'Off',
      },
    ],
    []
  );

  const displayStats = useMemo(() => {
    return stats.length > 0 ? stats : defaultStats;
  }, [stats, defaultStats]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderCountdown = () => {
    if (!hasCountdown) return null;

    const timeUnits = [
      { value: countdown.days, label: 'Days' },
      { value: countdown.hours, label: 'Hours' },
      { value: countdown.minutes, label: 'Mins' },
      { value: countdown.seconds, label: 'Secs' },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex gap-4"
      >
        {timeUnits.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[80px]"
            >
              <motion.span
                key={unit.value}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-bold text-white block text-center"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
              <Progress
                value={(unit.value / (unit.label === 'Days' ? 30 : unit.label === 'Hours' ? 24 : 60)) * 100}
                className="h-1 mt-2 bg-white/20"
              />
            </motion.div>
            <span className="text-sm text-white/70 mt-2">{unit.label}</span>
          </div>
        ))}
        <div className="flex items-center">
          <ClockIcon className="h-8 w-8 text-yellow-400 animate-pulse" />
        </div>
      </motion.div>
    );
  };

  const renderBadges = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-wrap gap-3"
    >
      <Badge
        variant="default"
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-sm px-4 py-2"
      >
        <SparklesIcon className="h-4 w-4 mr-1" />
        New
      </Badge>
      <Badge
        variant="default"
        className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-sm px-4 py-2 animate-pulse"
      >
        <FireIcon className="h-4 w-4 mr-1" />
        Hot
      </Badge>
      <Badge
        variant="default"
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm px-4 py-2"
      >
        <BoltIcon className="h-4 w-4 mr-1" />
        Limited
      </Badge>
      <Badge
        variant="default"
        className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 text-sm px-4 py-2"
      >
        <StarIcon className="h-4 w-4 mr-1" />
        Exclusive
      </Badge>
    </motion.div>
  );

  const renderStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="grid grid-cols-3 gap-4"
    >
      {displayStats.map((stat) => (
        <motion.div
          key={stat.id}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center"
        >
          <div className="text-white/70 mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
          <div className="text-sm text-white/60">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderPreviewProducts = () => {
    if (previewProducts.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="hidden lg:flex gap-4"
      >
        {previewProducts.slice(0, 3).map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-32 bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-2">
                <div className="relative aspect-square mb-2 rounded-lg overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.badge && (
                    <Badge className="absolute top-1 right-1 text-xs">
                      {product.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white font-medium truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm font-bold text-white">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-white/50 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
        'py-20 px-4 sm:px-6 lg:px-8',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Media */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        {backgroundVideo ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className={cn(
              'absolute inset-0 w-full h-full object-cover',
              !isVideoLoaded && 'opacity-0'
            )}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <Image
            src={backgroundImage}
            alt="New Arrivals Background"
            fill
            className="object-cover"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-purple-900/70 to-pink-900/80" />
      </motion.div>

      {/* Particles */}
      {enableParticles && (
        <div className="absolute inset-0 z-10 overflow-hidden">
          {particles.map((particle) => (
            <Particle key={particle.id} {...particle} />
          ))}
        </div>
      )}

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 max-w-7xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badges */}
            {renderBadges()}

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {title}
                </span>
              </h2>
              <p className="text-2xl sm:text-3xl text-white/90 font-semibold">
                {subtitle}
              </p>
              <p className="text-lg text-white/70 max-w-xl">
                {description}
              </p>
            </motion.div>

            {/* Countdown */}
            {renderCountdown()}

            {/* Stats */}
            {renderStats()}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href={primaryCta.href}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 border-0 text-lg px-8"
                >
                  {primaryCta.label}
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href={secondaryCta.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 text-lg px-8"
                >
                  {secondaryCta.label}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Content - Preview Products */}
          {renderPreviewProducts()}
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 opacity-20">
        <TrophyIcon className="h-32 w-32 text-yellow-400" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-20">
        <HeartIcon className="h-24 w-24 text-pink-400" />
      </div>
    </div>
  );
};

export default NewArrivalsBanner;

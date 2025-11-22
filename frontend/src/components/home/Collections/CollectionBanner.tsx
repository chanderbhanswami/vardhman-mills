/**
 * CollectionBanner Component
 * 
 * Hero banner for collection showcase pages.
 * 
 * Features:
 * - Multiple banner variants
 * - Video background support
 * - Parallax effects
 * - Collection highlights
 * - CTA buttons
 * - Countdown timer (for seasonal)
 * - Statistics display
 * - Responsive design
 * - Dark mode support
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  SparklesIcon,
  TagIcon,
  ClockIcon,
  FireIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';
import { formatNumber } from '@/lib/format';
import type { Collection } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CollectionBannerProps {
  /** Collection data */
  collection?: Collection;
  /** Banner variant */
  variant?: 'hero' | 'split' | 'overlay' | 'minimal' | 'fullscreen';
  /** Show countdown */
  showCountdown?: boolean;
  /** Show statistics */
  showStats?: boolean;
  /** Show video */
  showVideo?: boolean;
  /** Enable parallax */
  enableParallax?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Custom description */
  description?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaLink?: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaLink?: string;
  /** Additional CSS classes */
  className?: string;
  /** On CTA click */
  onCtaClick?: () => void;
  /** On secondary CTA click */
  onSecondaryCtaClick?: () => void;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Statistic {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_STATS: Statistic[] = [
  { icon: TagIcon, label: 'Products', value: 150 },
  { icon: FireIcon, label: 'New Arrivals', value: 25 },
  { icon: SparklesIcon, label: 'Exclusive', value: 'Limited' },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CollectionBanner: React.FC<CollectionBannerProps> = ({
  collection,
  variant = 'hero',
  showCountdown = false,
  showStats = true,
  showVideo = false,
  enableParallax = true,
  animated = true,
  title,
  subtitle,
  description,
  ctaText = 'Shop Collection',
  ctaLink = '#',
  secondaryCtaText = 'Learn More',
  secondaryCtaLink = '#',
  className,
  onCtaClick,
  onSecondaryCtaClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const displayTitle = useMemo(() => {
    return title || collection?.name || 'Featured Collection';
  }, [title, collection]);

  const displaySubtitle = useMemo(() => {
    return subtitle || (collection?.type === 'seasonal' ? 'Seasonal Collection' : 'Exclusive Collection');
  }, [subtitle, collection]);

  const displayDescription = useMemo(() => {
    return description || collection?.description || 'Discover our handpicked selection of premium products.';
  }, [description, collection]);

  const bannerImage = useMemo(() => {
    return collection?.bannerImage?.url || collection?.image?.url || '/images/default-collection-banner.jpg';
  }, [collection]);

  const statistics = useMemo(() => {
    if (!collection) return DEFAULT_STATS;

    return [
      { icon: TagIcon, label: 'Products', value: collection.productCount },
      { icon: FireIcon, label: 'Type', value: collection.type },
      { icon: SparklesIcon, label: 'Status', value: collection.isVisible ? 'Active' : 'Draft' },
    ];
  }, [collection]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Countdown timer
  useEffect(() => {
    if (!showCountdown || !collection?.endDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(collection.endDate!).getTime();
      const distance = end - now;

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
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [showCountdown, collection?.endDate]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleVideo = useCallback(() => {
    setIsVideoPlaying(prev => !prev);
  }, []);

  const handleCtaClickInternal = useCallback(() => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      window.location.href = ctaLink;
    }
  }, [onCtaClick, ctaLink]);

  const handleSecondaryCtaClickInternal = useCallback(() => {
    if (onSecondaryCtaClick) {
      onSecondaryCtaClick();
    } else {
      window.location.href = secondaryCtaLink;
    }
  }, [onSecondaryCtaClick, secondaryCtaLink]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCountdown = useCallback(() => {
    if (!showCountdown) return null;

    // Use ClockIcon for countdown timer display
    console.log('Rendering countdown with ClockIcon');

    return (
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center mt-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="w-6 h-6 text-white" />
          <span className="text-white/80 uppercase text-sm">Time Remaining</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          {[
            { label: 'Days', value: countdown.days },
            { label: 'Hours', value: countdown.hours },
            { label: 'Minutes', value: countdown.minutes },
            { label: 'Seconds', value: countdown.seconds },
          ].map(item => (
            <div
              key={item.label}
              className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[80px]"
            >
              <div className="text-3xl md:text-4xl font-bold text-white">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-xs text-white/80 uppercase mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }, [showCountdown, countdown]);

  const renderStatistics = useCallback(() => {
    if (!showStats) return null;

    return (
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-3 gap-6 mt-12"
      >
        {statistics.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full mb-3">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
              </div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }, [showStats, statistics]);

  const renderVideoBackground = useCallback(() => {
    if (!showVideo) return null;

    return (
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="w-full h-full object-cover"
          autoPlay={isVideoPlaying}
          loop
          muted
          playsInline
        >
          <source src="/videos/collection-hero.mp4" type="video/mp4" />
        </video>

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />

        {/* Video Controls */}
        <button
          onClick={toggleVideo}
          className="absolute bottom-8 right-8 p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
        >
          {isVideoPlaying ? (
            <PauseIcon className="w-6 h-6 text-white" />
          ) : (
            <PlayIcon className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
    );
  }, [showVideo, isVideoPlaying, toggleVideo]);

  const renderContent = useCallback(() => {
    return (
      <motion.div
        variants={containerVariants}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Badge */}
        {collection?.isFeatured && (
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="default" size="lg" className="bg-white/20 text-white backdrop-blur-sm">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Featured Collection
            </Badge>
          </motion.div>
        )}

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-white/90 mb-4"
        >
          {displaySubtitle}
        </motion.p>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
        >
          {displayTitle}
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-8"
        >
          {displayDescription}
        </motion.p>

        {/* Countdown */}
        {renderCountdown()}

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <Button
            size="lg"
            onClick={handleCtaClickInternal}
            className="min-w-[200px] bg-white text-gray-900 hover:bg-gray-100"
          >
            {ctaText}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSecondaryCtaClickInternal}
            className="min-w-[200px] border-white text-white hover:bg-white/10"
          >
            {secondaryCtaText}
          </Button>
        </motion.div>

        {/* Statistics */}
        {renderStatistics()}
      </motion.div>
    );
  }, [
    animated,
    collection,
    displaySubtitle,
    displayTitle,
    displayDescription,
    renderCountdown,
    ctaText,
    secondaryCtaText,
    handleCtaClickInternal,
    handleSecondaryCtaClickInternal,
    renderStatistics,
  ]);

  // ============================================================================
  // VARIANT RENDERERS
  // ============================================================================

  const renderHeroVariant = () => (
    <div className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {showVideo ? (
        renderVideoBackground()
      ) : (
        <motion.div
          style={enableParallax ? { y } : undefined}
          className="absolute inset-0"
        >
          <Image
            src={bannerImage}
            alt={displayTitle}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </motion.div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-20">
        {renderContent()}
      </div>
    </div>
  );

  const renderSplitVariant = () => (
    <div className="grid md:grid-cols-2 gap-8 min-h-[600px]">
      {/* Image Side */}
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src={bannerImage}
          alt={displayTitle}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Content Side */}
      <div className="flex items-center justify-center p-8 md:p-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-white">
        {renderContent()}
      </div>
    </div>
  );

  const renderOverlayVariant = () => (
    <div className="relative min-h-[500px] flex items-center justify-center rounded-2xl overflow-hidden">
      <Image
        src={bannerImage}
        alt={displayTitle}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="relative z-10 container mx-auto px-4 py-16">
        {renderContent()}
      </div>
    </div>
  );

  const renderMinimalVariant = () => (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center max-w-4xl mx-auto">
        {/* Badge */}
        {collection?.isFeatured && (
          <Badge variant="default" size="lg" className="mb-6 bg-blue-600 text-white">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Featured Collection
          </Badge>
        )}

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-4">
          {displaySubtitle}
        </p>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
          {displayTitle}
        </h1>

        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          {displayDescription}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={handleCtaClickInternal} className="min-w-[200px]">
            {ctaText}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSecondaryCtaClickInternal}
            className="min-w-[200px]"
          >
            {secondaryCtaText}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderFullscreenVariant = () => (
    <motion.div
      style={enableParallax ? { opacity } : undefined}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src={bannerImage}
          alt={displayTitle}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-20">
        {renderContent()}
      </div>
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <section className={cn('collection-banner', className)}>
      {variant === 'hero' && renderHeroVariant()}
      {variant === 'split' && renderSplitVariant()}
      {variant === 'overlay' && renderOverlayVariant()}
      {variant === 'minimal' && renderMinimalVariant()}
      {variant === 'fullscreen' && renderFullscreenVariant()}
    </section>
  );
};

export default CollectionBanner;

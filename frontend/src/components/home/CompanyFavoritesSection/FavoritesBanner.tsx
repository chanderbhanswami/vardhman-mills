/**
 * FavoritesBanner Component
 * 
 * Hero banner for company favorites section with promotional content.
 * 
 * Features:
 * - Multiple banner variants
 * - Video background support
 * - Animated statistics
 * - Call-to-action buttons
 * - Countdown timer integration
 * - Parallax scrolling effects
 * - Gradient overlays
 * - Responsive design
 * 
 * @component
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  SparklesIcon,
  HeartIcon,
  TrophyIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';
import { formatNumber } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FavoritesBannerProps {
  /** Banner title */
  title?: string;
  /** Banner subtitle */
  subtitle?: string;
  /** Banner description */
  description?: string;
  /** Background image */
  image?: string;
  /** Video URL */
  videoUrl?: string;
  /** Banner variant */
  variant?: 'default' | 'gradient' | 'video' | 'minimal' | 'split';
  /** Show statistics */
  showStats?: boolean;
  /** Statistics data */
  stats?: Array<{
    icon: React.ReactNode;
    label: string;
    value: number;
    suffix?: string;
  }>;
  /** Show CTA buttons */
  showCta?: boolean;
  /** Primary CTA text */
  primaryCtaText?: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Additional CSS classes */
  className?: string;
  /** On primary CTA click */
  onPrimaryCtaClick?: () => void;
  /** On secondary CTA click */
  onSecondaryCtaClick?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_STATS = [
  {
    icon: <HeartIconSolid className="w-6 h-6" />,
    label: 'Favorites',
    value: 10000,
    suffix: '+',
  },
  {
    icon: <StarIcon className="w-6 h-6" />,
    label: 'Rating',
    value: 4.9,
    suffix: '/5',
  },
  {
    icon: <TrophyIcon className="w-6 h-6" />,
    label: 'Awards',
    value: 50,
    suffix: '+',
  },
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    label: 'Products',
    value: 500,
    suffix: '+',
  },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const bannerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      type: 'spring' as const,
      stiffness: 100,
      damping: 10,
    },
  }),
};

// ============================================================================
// COMPONENT
// ============================================================================

export const FavoritesBanner: React.FC<FavoritesBannerProps> = ({
  title = 'Company Favorites',
  subtitle = 'Handpicked Products',
  description = 'Discover our most loved products, carefully selected by our team and customers.',
  image = '/images/favorites-banner.jpg',
  videoUrl,
  variant = 'default',
  showStats = true,
  stats = DEFAULT_STATS,
  showCta = true,
  primaryCtaText = 'Explore Favorites',
  secondaryCtaText = 'View All',
  className,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // ============================================================================
  // SCROLL ANIMATIONS
  // ============================================================================

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleVideoToggle = useCallback(() => {
    setIsVideoPlaying(prev => !prev);
  }, []);

  const handlePrimaryClick = useCallback(() => {
    console.log('Primary CTA clicked');
    onPrimaryCtaClick?.();
  }, [onPrimaryCtaClick]);

  const handleSecondaryClick = useCallback(() => {
    console.log('Secondary CTA clicked');
    onSecondaryCtaClick?.();
  }, [onSecondaryCtaClick]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderVideo = useMemo(() => {
    if (!videoUrl) return null;

    return (
      <div className="absolute inset-0">
        <video
          src={videoUrl}
          autoPlay={isVideoPlaying}
          loop
          muted
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleVideoToggle}
          className={cn(
            'absolute bottom-4 right-4 z-10',
            'w-12 h-12 rounded-full',
            'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
            'flex items-center justify-center',
            'shadow-lg hover:shadow-xl transition-shadow'
          )}
          aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
        >
          {isVideoPlaying ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </button>
      </div>
    );
  }, [videoUrl, isVideoPlaying, handleVideoToggle]);

  const renderStats = useMemo(() => {
    if (!showStats || !stats.length) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            custom={index}
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              'flex flex-col items-center p-4 rounded-lg',
              'bg-white/10 backdrop-blur-sm',
              'border border-white/20'
            )}
          >
            <div className="text-white mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(stat.value)}
              {stat.suffix}
            </div>
            <div className="text-sm text-white/80">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    );
  }, [showStats, stats]);

  const renderCta = useMemo(() => {
    if (!showCta) return null;

    return (
      <div className="flex flex-wrap items-center gap-4 mt-8">
        <Button
          variant="default"
          size="lg"
          onClick={handlePrimaryClick}
          className="group"
        >
          {primaryCtaText}
          <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleSecondaryClick}
          className="border-white text-white hover:bg-white hover:text-gray-900"
        >
          {secondaryCtaText}
        </Button>
      </div>
    );
  }, [showCta, primaryCtaText, secondaryCtaText, handlePrimaryClick, handleSecondaryClick]);

  // ============================================================================
  // VARIANT RENDERERS
  // ============================================================================

  const renderDefaultVariant = () => (
    <motion.div
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-purple-600 to-pink-600',
        'min-h-[500px] flex items-center',
        className
      )}
    >
      {/* Background Image */}
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover opacity-30"
          sizes="100vw"
          priority
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-900/50" />

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Badge variant="default" size="lg" className="mb-4 bg-white/20 text-white">
          <SparklesIcon className="w-4 h-4 mr-2" />
          {subtitle}
        </Badge>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          {title}
        </h1>

        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8">
          {description}
        </p>

        {renderCta}
        {renderStats}
      </motion.div>
    </motion.div>
  );

  const renderGradientVariant = () => (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600',
        'min-h-[400px] flex items-center',
        className
      )}
    >
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">{description}</p>
        {renderCta}
      </div>
    </div>
  );

  const renderVideoVariant = () => (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'min-h-[600px] flex items-center',
        className
      )}
    >
      {renderVideo}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Badge variant="default" size="lg" className="mb-4 bg-white/20 text-white">
          <HeartIcon className="w-4 h-4 mr-2" />
          {subtitle}
        </Badge>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
        <p className="text-lg text-white/90 max-w-2xl mb-8">{description}</p>

        {renderCta}
        {renderStats}
      </div>
    </div>
  );

  const renderMinimalVariant = () => (
    <div className={cn('py-12 text-center', className)}>
      <Badge variant="default" size="lg" className="mb-4">
        <SparklesIcon className="w-4 h-4 mr-2" />
        {subtitle}
      </Badge>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );

  const renderSplitVariant = () => (
    <div
      className={cn(
        'grid md:grid-cols-2 gap-8 items-center rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
        'p-8 md:p-12',
        className
      )}
    >
      <div>
        <Badge variant="default" size="lg" className="mb-4">
          <HeartIcon className="w-4 h-4 mr-2" />
          {subtitle}
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{description}</p>
        {renderCta}
      </div>

      <div className="relative h-[400px] rounded-xl overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      {variant === 'default' && renderDefaultVariant()}
      {variant === 'gradient' && renderGradientVariant()}
      {variant === 'video' && renderVideoVariant()}
      {variant === 'minimal' && renderMinimalVariant()}
      {variant === 'split' && renderSplitVariant()}
    </>
  );
};

export default FavoritesBanner;

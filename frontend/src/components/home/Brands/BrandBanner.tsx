/**
 * BrandBanner Component
 * 
 * Hero banner for brand showcase with multiple display variants.
 * 
 * Features:
 * - Multiple banner variants (hero, split, overlay, minimal, fullscreen)
 * - Video background support
 * - Parallax scrolling effects
 * - Animated statistics
 * - Social proof indicators
 * - CTA buttons
 * - Brand story highlights
 * - Auto-rotating testimonials
 * - Responsive design
 * - Dark mode support
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import {
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
  HeartIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';
import { formatNumber } from '@/lib/format';
import type { Brand } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BrandBannerProps {
  /** Brand data */
  brand?: Brand;
  /** Banner variant */
  variant?: 'hero' | 'split' | 'overlay' | 'minimal' | 'fullscreen';
  /** Show statistics */
  showStats?: boolean;
  /** Show testimonials */
  showTestimonials?: boolean;
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

interface Statistic {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_STATISTICS: Statistic[] = [
  { icon: TrophyIcon, label: 'Awards Won', value: 25, suffix: '+' },
  { icon: UsersIcon, label: 'Happy Customers', value: 50000, suffix: '+' },
  { icon: StarIcon, label: 'Products', value: 500, suffix: '+' },
  { icon: HeartIcon, label: 'Years Experience', value: 30, suffix: '+' },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    author: 'Sarah Johnson',
    role: 'Fashion Enthusiast',
    content: 'The quality and attention to detail in their products is unmatched. Every piece tells a story.',
    rating: 5,
  },
  {
    id: '2',
    author: 'Michael Chen',
    role: 'Interior Designer',
    content: 'Their fabrics have transformed countless spaces. The craftsmanship is truly exceptional.',
    rating: 5,
  },
  {
    id: '3',
    author: 'Emily Rodriguez',
    role: 'Boutique Owner',
    content: 'Working with this brand has been a game-changer for my business. Quality you can trust.',
    rating: 5,
  },
];

const TRUST_BADGES = [
  { icon: CheckBadgeIcon, text: 'Certified Quality' },
  { icon: ShieldCheckIcon, text: 'Secure Shopping' },
  { icon: GlobeAltIcon, text: 'Global Shipping' },
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

const statsVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const BrandBanner: React.FC<BrandBannerProps> = ({
  brand,
  variant = 'hero',
  showStats = true,
  showTestimonials = true,
  showVideo = false,
  enableParallax = true,
  animated = true,
  title,
  subtitle,
  description,
  ctaText = 'Explore Collection',
  ctaLink = '#',
  secondaryCtaText = 'Learn More',
  secondaryCtaLink = '#',
  className,
  onCtaClick,
  onSecondaryCtaClick,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [counters, setCounters] = useState<Record<string, number>>({});

  const controls = useAnimation();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const displayTitle = useMemo(() => {
    return title || brand?.name || 'Premium Brand';
  }, [title, brand]);

  const displaySubtitle = useMemo(() => {
    return subtitle || 'Crafting Excellence Since ' + (brand?.foundedYear || '1990');
  }, [subtitle, brand]);

  const displayDescription = useMemo(() => {
    return description || brand?.description || 'Experience the finest quality fabrics and textiles, handcrafted with precision and care.';
  }, [description, brand]);

  const bannerImage = useMemo(() => {
    return brand?.bannerImage?.url || brand?.logo?.url || '/images/default-brand-banner.jpg';
  }, [brand]);

  const statistics = useMemo(() => {
    if (!brand) return DEFAULT_STATISTICS;

    return [
      { icon: TrophyIcon, label: 'Awards', value: brand.achievements?.length || 25, suffix: '+' },
      { icon: UsersIcon, label: 'Followers', value: brand.followersCount || 50000, suffix: '+' },
      { icon: StarIcon, label: 'Products', value: brand.productCount || 500, suffix: '+' },
      { icon: HeartIcon, label: 'Years', value: new Date().getFullYear() - (brand.foundedYear || 1990), suffix: '+' },
    ];
  }, [brand]);

  const testimonials = useMemo(() => DEFAULT_TESTIMONIALS, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Animate on mount
  useEffect(() => {
    if (animated) {
      controls.start('visible');
    }
  }, [animated, controls]);

  // Counter animation
  useEffect(() => {
    if (!showStats) return;

    const animateCounter = (stat: Statistic, key: string) => {
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCounters(prev => ({ ...prev, [key]: stat.value }));
          clearInterval(timer);
        } else {
          setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    };

    const timers = statistics.map((stat, index) =>
      animateCounter(stat, `stat-${index}`)
    );

    return () => {
      timers.forEach(cleanup => cleanup && cleanup());
    };
  }, [statistics, showStats]);

  // Testimonial rotation
  useEffect(() => {
    if (!showTestimonials || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [showTestimonials, testimonials.length]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePrevTestimonial = useCallback(() => {
    setCurrentTestimonial(prev =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  }, [testimonials.length]);

  const handleNextTestimonial = useCallback(() => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

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

  const renderStatistics = useCallback(() => {
    if (!showStats) return null;

    return (
      <motion.div
        variants={containerVariants}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? controls : undefined}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
      >
        {statistics.map((stat, index) => {
          const Icon = stat.icon;
          const key = `stat-${index}`;
          const value = counters[key] || 0;

          return (
            <motion.div
              key={key}
              variants={statsVariants}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {'prefix' in stat ? stat.prefix : ''}
                {formatNumber(value)}
                {'suffix' in stat ? stat.suffix : ''}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }, [showStats, statistics, counters, animated, controls]);

  const renderTestimonials = useCallback(() => {
    if (!showTestimonials || testimonials.length === 0) return null;

    const testimonial = testimonials[currentTestimonial];

    return (
      <motion.div
        variants={itemVariants}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        className="mt-12 relative"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
          {/* Quote Icon */}
          <SparklesIcon className="w-12 h-12 text-primary-600 dark:text-primary-400 mb-4" />

          {/* Content */}
          <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6">
            &quot;{testimonial.content}&quot;
          </blockquote>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIconSolid
                key={i}
                className={cn(
                  'w-5 h-5',
                  i < testimonial.rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                )}
              />
            ))}
          </div>

          {/* Author */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {testimonial.author}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {testimonial.role}
              </div>
            </div>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevTestimonial}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextTestimonial}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Indicators */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={cn(
                  'rounded-full transition-all',
                  currentTestimonial === index
                    ? 'w-8 h-2 bg-primary-600'
                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  }, [showTestimonials, testimonials, currentTestimonial, animated, handlePrevTestimonial, handleNextTestimonial]);

  const renderTrustBadges = useCallback(() => {
    return (
      <motion.div
        variants={itemVariants}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        className="flex flex-wrap items-center justify-center gap-6 mt-8"
      >
        {TRUST_BADGES.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span>{badge.text}</span>
            </div>
          );
        })}
      </motion.div>
    );
  }, [animated]);

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
          <source src="/videos/brand-hero.mp4" type="video/mp4" />
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
        animate={animated ? controls : undefined}
        className="relative z-10 text-center"
      >
        {/* Badge */}
        {brand?.isFeatured && (
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="default" size="lg" className="inline-flex items-center gap-2 bg-primary-600 text-white">
              <CheckBadgeIcon className="w-4 h-4" />
              Featured Brand
            </Badge>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4"
        >
          {displayTitle}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6"
        >
          {displaySubtitle}
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8"
        >
          {displayDescription}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <Button
            size="lg"
            onClick={handleCtaClickInternal}
            className="min-w-[200px]"
          >
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
        </motion.div>

        {/* Trust Badges */}
        {renderTrustBadges()}

        {/* Statistics */}
        {renderStatistics()}

        {/* Testimonials */}
        {renderTestimonials()}
      </motion.div>
    );
  }, [
    animated,
    controls,
    brand,
    displayTitle,
    displaySubtitle,
    displayDescription,
    ctaText,
    secondaryCtaText,
    handleCtaClickInternal,
    handleSecondaryCtaClickInternal,
    renderTrustBadges,
    renderStatistics,
    renderTestimonials,
  ]);

  // ============================================================================
  // RENDER BY VARIANT
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-white dark:to-gray-900" />
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
      <div className="flex items-center justify-center p-8 md:p-12">
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
      <div className="relative z-10 container mx-auto px-4 py-16 text-white">
        {renderContent()}
      </div>
    </div>
  );

  const renderMinimalVariant = () => (
    <div className="container mx-auto px-4 py-20">
      {renderContent()}
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
    <section className={cn('brand-banner', className)}>
      {variant === 'hero' && renderHeroVariant()}
      {variant === 'split' && renderSplitVariant()}
      {variant === 'overlay' && renderOverlayVariant()}
      {variant === 'minimal' && renderMinimalVariant()}
      {variant === 'fullscreen' && renderFullscreenVariant()}
    </section>
  );
};

export default BrandBanner;

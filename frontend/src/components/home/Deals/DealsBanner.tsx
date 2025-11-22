/**
 * DealsBanner Component
 * 
 * Hero banner for deals section with countdown and urgency elements.
 * 
 * Features:
 * - Multiple banner variants (default, urgent, video, minimal, split)
 * - Countdown timer integration
 * - Video background support
 * - Animated discount badges
 * - Parallax scrolling effects
 * - Call-to-action buttons
 * - Responsive layouts
 * - Gradient overlays
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FireIcon,
  BoltIcon,
  TagIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CountdownTimer } from './CountdownTimer';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DealsBannerProps {
  /** Banner title */
  title?: string;
  /** Banner subtitle */
  subtitle?: string;
  /** Banner description */
  description?: string;
  /** Background image URL */
  image?: string;
  /** Background video URL */
  videoUrl?: string;
  /** Deal end date */
  dealEndDate?: Date | string;
  /** Discount percentage */
  discountPercent?: number;
  /** Banner variant */
  variant?: 'default' | 'urgent' | 'video' | 'minimal' | 'split';
  /** Show countdown timer */
  showCountdown?: boolean;
  /** Show CTA button */
  showCta?: boolean;
  /** Primary CTA text */
  primaryCtaText?: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Primary CTA handler */
  onPrimaryCtaClick?: () => void;
  /** Secondary CTA handler */
  onSecondaryCtaClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const bannerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const badgeVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 200, delay: 0.3 },
  },
  pulse: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 2, repeat: Infinity },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const DealsBanner: React.FC<DealsBannerProps> = ({
  title = 'Limited Time Deals',
  subtitle = "Don't Miss Out!",
  description = 'Grab amazing discounts on our best products before time runs out',
  image = '/images/deals-banner.jpg',
  videoUrl,
  dealEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  discountPercent = 50,
  variant = 'default',
  showCountdown = true,
  showCta = true,
  primaryCtaText = 'Shop Deals Now',
  secondaryCtaText = 'View All Deals',
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  className,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // ============================================================================
  // SCROLL EFFECTS
  // ============================================================================

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleVideoToggle = useCallback(() => {
    setIsVideoPlaying((prev: boolean) => !prev);
    console.log('Video playback toggled:', isVideoPlaying);
  }, [isVideoPlaying]);

  const handlePrimaryClick = useCallback(() => {
    onPrimaryCtaClick?.();
    console.log('Primary CTA clicked');
  }, [onPrimaryCtaClick]);

  const handleSecondaryClick = useCallback(() => {
    onSecondaryCtaClick?.();
    console.log('Secondary CTA clicked');
  }, [onSecondaryCtaClick]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderVideo = useMemo(
    () => {
      if (!videoUrl) return null;

      return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={videoUrl}
            autoPlay={isVideoPlaying}
            loop
            muted
            playsInline
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVideoToggle}
            className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm"
          >
            {isVideoPlaying ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6" />
            )}
          </Button>
        </div>
      );
    },
    [videoUrl, isVideoPlaying, handleVideoToggle]
  );

  const renderCountdownSection = useMemo(
    () => {
      if (!showCountdown) return null;

      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' as const, stiffness: 100 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <ClockIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              Hurry! Deal ends in:
            </p>
          </div>
          <CountdownTimer
            endDate={dealEndDate}
            variant={variant === 'minimal' ? 'compact' : 'large'}
            showLabels={true}
            showIcon={false}
          />
        </motion.div>
      );
    },
    [showCountdown, dealEndDate, variant]
  );

  const renderCta = useMemo(
    () => {
      if (!showCta) return null;

      return (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            variant="default"
            size="lg"
            onClick={handlePrimaryClick}
            className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4 font-bold shadow-xl"
          >
            <FireIcon className="w-6 h-6 mr-2" />
            {primaryCtaText}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSecondaryClick}
            className="border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4 font-semibold"
          >
            {secondaryCtaText}
          </Button>
        </motion.div>
      );
    },
    [showCta, primaryCtaText, secondaryCtaText, handlePrimaryClick, handleSecondaryClick]
  );

  // ============================================================================
  // VARIANT RENDERERS
  // ============================================================================

  const renderDefaultVariant = () => (
    <motion.div
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative w-full min-h-[600px] overflow-hidden rounded-2xl',
        className
      )}
    >
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      </motion.div>

      {/* Badges */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
        <motion.div variants={badgeVariants} initial="initial" animate="pulse">
          <Badge variant="default" size="lg" className="bg-red-600 text-white text-lg px-4 py-2">
            <FireIcon className="w-6 h-6 mr-2" />
            Hot Deal
          </Badge>
        </motion.div>
        <motion.div variants={badgeVariants} initial="initial" animate="animate">
          <Badge variant="default" size="lg" className="bg-orange-500 text-white text-2xl px-6 py-3 font-bold">
            <TagIcon className="w-8 h-8 mr-2" />
            UP TO {discountPercent}% OFF
          </Badge>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 py-20">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white mb-4 uppercase tracking-tight"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-4xl font-bold text-red-400 mb-4"
        >
          {subtitle}
        </motion.p>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8"
        >
          {description}
        </motion.p>

        {renderCountdownSection}
        {renderCta}
      </motion.div>
    </motion.div>
  );

  const renderUrgentVariant = () => (
    <motion.div
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative w-full min-h-[500px] overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-red-600 via-red-700 to-orange-600',
        className
      )}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
      </div>

      {/* Badges */}
      <div className="absolute top-6 right-6 z-10">
        <motion.div variants={badgeVariants} initial="initial" animate="pulse">
          <Badge variant="default" size="lg" className="bg-yellow-500 text-black text-xl px-6 py-3 font-black">
            <BoltIcon className="w-6 h-6 mr-2" />
            FLASH SALE
          </Badge>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 py-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200 }}
          className="mb-6"
        >
          <div className="text-9xl font-black text-white">
            {discountPercent}<span className="text-yellow-300">%</span>
          </div>
          <p className="text-3xl font-bold text-white uppercase tracking-widest">OFF</p>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-black text-white mb-4 uppercase"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-white/90 max-w-xl mb-8"
        >
          {description}
        </motion.p>

        {renderCountdownSection}
        {renderCta}
      </div>
    </motion.div>
  );

  const renderVideoVariant = () => (
    <motion.div
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative w-full min-h-[700px] overflow-hidden rounded-2xl',
        className
      )}
    >
      {/* Video Background */}
      {renderVideo}
      {!videoUrl && (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-end h-full text-center px-6 pb-20">
        <motion.h2
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white mb-4 uppercase"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-red-400 mb-4"
        >
          Save up to {discountPercent}%
        </motion.p>

        {renderCountdownSection}
        {renderCta}
      </div>
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      {variant === 'default' && renderDefaultVariant()}
      {variant === 'urgent' && renderUrgentVariant()}
      {variant === 'video' && renderVideoVariant()}
      {variant === 'minimal' && renderDefaultVariant()}
      {variant === 'split' && renderDefaultVariant()}
    </>
  );
};

export default DealsBanner;

/**
 * TestimonialBanner Component
 * 
 * Hero banner component for testimonials section with featured customer quotes,
 * statistics, and call-to-action buttons.
 * 
 * Features:
 * - Hero layout with background image/gradient
 * - Featured customer quote with avatar
 * - Key statistics (rating, reviews, customers)
 * - Trust badges and certifications
 * - Call-to-action buttons
 * - Animated entrance
 * - Responsive design
 * - Video background support
 * - Parallax effects
 * - Social proof indicators
 * - Customer logos carousel
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  StarIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FeaturedQuote {
  id: string;
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating: number;
  verified?: boolean;
}

export interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  suffix?: string;
}

export interface TrustBadge {
  id: string;
  name: string;
  icon?: string;
  tooltip?: string;
}

export interface TestimonialBannerProps {
  /** Featured customer quote */
  featuredQuote: FeaturedQuote;
  /** Statistics to display */
  stats: StatItem[];
  /** Trust badges */
  trustBadges?: TrustBadge[];
  /** Background image URL */
  backgroundImage?: string;
  /** Background video URL */
  backgroundVideo?: string;
  /** Enable parallax effect */
  enableParallax?: boolean;
  /** Show call-to-action buttons */
  showCTA?: boolean;
  /** Primary CTA text */
  primaryCTAText?: string;
  /** Secondary CTA text */
  secondaryCTAText?: string;
  /** Additional CSS classes */
  className?: string;
  /** On primary CTA click */
  onPrimaryCTAClick?: () => void;
  /** On secondary CTA click */
  onSecondaryCTAClick?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_STATS: StatItem[] = [
  { label: 'Average Rating', value: '4.8', icon: StarIcon, suffix: '/5' },
  { label: 'Happy Customers', value: '50K', icon: UserGroupIcon, suffix: '+' },
  { label: 'Reviews', value: '25K', icon: ChatBubbleLeftRightIcon, suffix: '+' },
  { label: 'Years in Business', value: '15', icon: TrophyIcon, suffix: '+' },
];

const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  { id: '1', name: 'Verified Reviews', tooltip: '100% verified customer reviews' },
  { id: '2', name: 'Secure Shopping', tooltip: 'SSL encrypted transactions' },
  { id: '3', name: 'Money Back Guarantee', tooltip: '30-day return policy' },
  { id: '4', name: 'Quality Assured', tooltip: 'Premium quality products' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const TestimonialBanner: React.FC<TestimonialBannerProps> = ({
  featuredQuote,
  stats = DEFAULT_STATS,
  trustBadges = DEFAULT_TRUST_BADGES,
  backgroundImage,
  backgroundVideo,
  enableParallax = true,
  showCTA = true,
  primaryCTAText = 'Write a Review',
  secondaryCTAText = 'Read All Reviews',
  className,
  onPrimaryCTAClick,
  onSecondaryCTAClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [videoError, setVideoError] = useState(false);

  // ============================================================================
  // PARALLAX
  // ============================================================================

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const hasBackground = useMemo(
    () => backgroundImage || (backgroundVideo && !videoError),
    [backgroundImage, backgroundVideo, videoError]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePrimaryCTA = useCallback(() => {
    onPrimaryCTAClick?.();
    console.log('Primary CTA clicked: Write a Review');
  }, [onPrimaryCTAClick]);

  const handleSecondaryCTA = useCallback(() => {
    onSecondaryCTAClick?.();
    console.log('Secondary CTA clicked: Read All Reviews');
  }, [onSecondaryCTAClick]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    console.error('Background video failed to load');
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video Background */}
      {backgroundVideo && !videoError && (
        <video
          autoPlay
          loop
          muted
          playsInline
          onError={handleVideoError}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Image Background */}
      {backgroundImage && !backgroundVideo && (
        <motion.div
          style={enableParallax ? { y: parallaxY } : undefined}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={backgroundImage}
            alt="Testimonials background"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-purple-900/90" />

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
    </div>
  );

  const renderFeaturedQuote = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={enableParallax ? { opacity } : undefined}
      className="relative z-10 max-w-3xl mx-auto text-center space-y-6"
    >
      {/* Quote Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Quote Text */}
      <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-relaxed">
        &ldquo;{featuredQuote.quote}&rdquo;
      </blockquote>

      {/* Rating Stars */}
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon
            key={index}
            className={cn(
              'w-6 h-6',
              index < featuredQuote.rating
                ? 'text-yellow-400'
                : 'text-gray-400/30'
            )}
          />
        ))}
      </div>

      {/* Author Info */}
      <div className="flex items-center justify-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/30">
            {featuredQuote.avatar ? (
              <Image
                src={featuredQuote.avatar}
                alt={featuredQuote.author}
                width={56}
                height={56}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {featuredQuote.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
            )}
          </div>
          {featuredQuote.verified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
            </div>
          )}
        </div>

        {/* Author Details */}
        <div className="text-left">
          <div className="font-semibold text-white text-lg">
            {featuredQuote.author}
          </div>
          {featuredQuote.role && (
            <div className="text-blue-200 text-sm">{featuredQuote.role}</div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="relative z-10 mt-12"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20"
            >
              {Icon && (
                <div className="flex justify-center mb-3">
                  <Icon className="w-8 h-8 text-yellow-400" />
                </div>
              )}
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stat.value}
                {stat.suffix && (
                  <span className="text-2xl text-blue-200">{stat.suffix}</span>
                )}
              </div>
              <div className="text-sm text-blue-200">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderCTA = () => {
    if (!showCTA) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-10 mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Button
          size="lg"
          onClick={handlePrimaryCTA}
          className="bg-white text-blue-900 hover:bg-blue-50 shadow-lg px-8 py-6 text-lg font-semibold"
        >
          {primaryCTAText}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleSecondaryCTA}
          className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
        >
          {secondaryCTAText}
        </Button>
      </motion.div>
    );
  };

  const renderTrustBadges = () => {
    if (!trustBadges || trustBadges.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative z-10 mt-12"
      >
        <div className="flex flex-wrap items-center justify-center gap-6 max-w-4xl mx-auto">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
            >
              <Tooltip content={badge.tooltip}>
                <Badge
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-4 py-2 gap-2"
                >
                  {badge.icon && (
                    <Image
                      src={badge.icon}
                      alt={badge.name}
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  )}
                  <ShieldCheckIcon className="w-5 h-5" />
                  {badge.name}
                </Badge>
              </Tooltip>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl',
        hasBackground ? 'min-h-[600px] lg:min-h-[700px]' : 'min-h-[500px]',
        className
      )}
    >
      {/* Background */}
      {hasBackground ? (
        renderBackground()
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700" />
      )}

      {/* Content Container */}
      <div className="relative z-10 px-6 py-16 md:py-20 lg:py-24">
        {/* Featured Quote */}
        {renderFeaturedQuote()}

        {/* Statistics */}
        {renderStats()}

        {/* Call to Action */}
        {renderCTA()}

        {/* Trust Badges */}
        {renderTrustBadges()}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-3xl" />
    </div>
  );
};

export default TestimonialBanner;

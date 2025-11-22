/**
 * TrendingBanner Component
 * 
 * Hero banner for the trending section showcasing popular products
 * with dynamic statistics, social proof, and engaging animations.
 * 
 * Features:
 * - Hero layout with gradient background
 * - Live statistics (trending count, growth rate)
 * - Social proof indicators
 * - Featured trending tags
 * - Animated fire icons
 * - CTA buttons
 * - Responsive design
 * - Scroll animations
 * - Badge system
 * - Time-based updates
 * - Mobile optimized
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  FireIcon,
  SparklesIcon,
  UserGroupIcon,
  HeartIcon,
  StarIcon,
  ArrowRightIcon,
  BoltIcon,
} from '@heroicons/react/24/solid';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TrendingStat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color: string;
}

export interface TrendingTag {
  id: string;
  name: string;
  count: number;
  growth: number;
}

export interface TrendingBannerProps {
  /** Total trending products */
  trendingCount?: number;
  /** Growth rate percentage */
  growthRate?: number;
  /** Active viewers */
  activeViewers?: number;
  /** Trending tags */
  trendingTags?: TrendingTag[];
  /** Show statistics */
  showStats?: boolean;
  /** Show tags */
  showTags?: boolean;
  /** Enable animations */
  enableAnimations?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On CTA click */
  onCTAClick?: () => void;
  /** On tag click */
  onTagClick?: (tag: TrendingTag) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_TRENDING_TAGS: TrendingTag[] = [
  { id: '1', name: 'Summer Collection', count: 156, growth: 23 },
  { id: '2', name: 'Premium Fabrics', count: 98, growth: 45 },
  { id: '3', name: 'Traditional Wear', count: 134, growth: 18 },
  { id: '4', name: 'Modern Designs', count: 87, growth: 67 },
];

// ============================================================================
// ANIMATED COUNTER HOOK
// ============================================================================

const useAnimatedCounter = (
  target: number,
  duration: number = 2000,
  shouldAnimate: boolean = true
) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldAnimate || target === 0) {
      setCount(target);
      return;
    }

    const increment = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, shouldAnimate]);

  return count;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const TrendingBanner: React.FC<TrendingBannerProps> = ({
  trendingCount = 0,
  growthRate = 0,
  activeViewers = 0,
  trendingTags = DEFAULT_TRENDING_TAGS,
  showStats = true,
  showTags = true,
  enableAnimations = true,
  className,
  onCTAClick,
  onTagClick,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTagIndex, setActiveTagIndex] = useState(0);

  // ============================================================================
  // PARALLAX EFFECT
  // ============================================================================

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, enableAnimations ? -30 : 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  // ============================================================================
  // INTERSECTION OBSERVER
  // ============================================================================

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // ============================================================================
  // TAG ROTATION
  // ============================================================================

  useEffect(() => {
    if (!showTags || trendingTags.length === 0) return;

    const interval = setInterval(() => {
      setActiveTagIndex((prev) => (prev + 1) % trendingTags.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [showTags, trendingTags.length]);

  // ============================================================================
  // ANIMATED COUNTERS
  // ============================================================================

  const animatedTrendingCount = useAnimatedCounter(trendingCount, 2000, isVisible);
  const animatedGrowthRate = useAnimatedCounter(growthRate, 1500, isVisible);
  const animatedActiveViewers = useAnimatedCounter(activeViewers, 2500, isVisible);

  // ============================================================================
  // STATISTICS
  // ============================================================================

  const statistics: TrendingStat[] = [
    {
      label: 'Trending Now',
      value: animatedTrendingCount,
      suffix: ' products',
      icon: FireIcon,
      trend: 'up',
      trendValue: animatedGrowthRate,
      color: 'text-primary-600',
    },
    {
      label: 'Growth Rate',
      value: animatedGrowthRate,
      prefix: '+',
      suffix: '%',
      icon: ChartBarIcon,
      trend: 'up',
      color: 'text-green-600',
    },
    {
      label: 'Active Viewers',
      value: animatedActiveViewers,
      icon: UserGroupIcon,
      color: 'text-primary-600',
    },
  ];

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderStatistics = () => {
    if (!showStats || trendingCount === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statistics.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border-2 border-white"
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-xl opacity-50" />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('rounded-full p-2', `bg-${stat.color.split('-')[1]}-100`)}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
                {stat.trend === 'up' && stat.trendValue && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <ChartBarIcon className="w-3 h-3 mr-1" />
                    +{stat.trendValue}%
                  </Badge>
                )}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">
                {stat.label}
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stat.prefix}
                {stat.value.toLocaleString()}
                {stat.suffix}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderTrendingTags = () => {
    if (!showTags || trendingTags.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <span className="text-sm font-medium text-gray-600">Hot Topics:</span>
        {trendingTags.slice(0, 4).map((tag, index) => (
          <motion.button
            key={tag.id}
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 + index * 0.1 }}
            onClick={() => onTagClick?.(tag)}
            className={cn(
              'group px-4 py-2 rounded-full transition-all duration-300',
              'bg-white/80 backdrop-blur-sm border-2',
              'hover:scale-105 hover:shadow-lg',
              activeTagIndex === index
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            )}
          >
            <div className="flex items-center gap-2">
              <FireIcon
                className={cn(
                  'w-4 h-4',
                  activeTagIndex === index ? 'text-primary-600' : 'text-gray-400',
                  'group-hover:text-primary-600 transition-colors'
                )}
              />
              <span className="font-medium text-gray-900">{tag.name}</span>
              <Badge
                className={cn(
                  'text-xs',
                  tag.growth > 50
                    ? 'bg-green-100 text-green-700'
                    : 'bg-primary-100 text-primary-700'
                )}
              >
                +{tag.growth}%
              </Badge>
            </div>
          </motion.button>
        ))}
      </div>
    );
  };

  const renderFloatingIcons = () => {
    if (!enableAnimations) return null;

    const icons = [
      { Icon: FireIcon, color: 'text-primary-500', delay: 0 },
      { Icon: SparklesIcon, color: 'text-yellow-500', delay: 0.5 },
      { Icon: HeartIcon, color: 'text-pink-500', delay: 1 },
      { Icon: StarIcon, color: 'text-primary-500', delay: 1.5 },
      { Icon: BoltIcon, color: 'text-primary-500', delay: 2 },
    ];

    return (
      <>
        {icons.map((item, index) => (
          <motion.div
            key={index}
            className={cn('absolute opacity-20', item.color)}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [0, 1, 0],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
          >
            <item.Icon className="w-16 h-16" />
          </motion.div>
        ))}
      </>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      ref={containerRef}
      style={{ y, scale }}
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100',
        className
      )}
    >
      {/* Background Pattern with SVG */}
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="trending-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="#FF6B35" opacity="0.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#trending-pattern)" />
        </svg>
      </div>

      {/* Floating Animated Icons */}
      {renderFloatingIcons()}

      {/* Content Container */}
      <div className="relative z-10 p-8 sm:p-12 lg:p-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Fire Badge with Animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={isVisible ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm shadow-lg">
              <FireIcon className="w-5 h-5 inline mr-2 animate-pulse" />
              Trending Now
            </Badge>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            <AnimatePresence mode="wait">
              <motion.span
                key="trending-title"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="inline-block"
              >
                What&apos;s Hot
              </motion.span>
            </AnimatePresence>
            <br />
            <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Right Now
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover the most popular products loved by thousands of customers.
            Shop trending items before they sell out!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={onCTAClick}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg group"
            >
              <FireIcon className="w-5 h-5 mr-2" />
              Explore Trending
              <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => console.log('View all products')}
              className="border-2 border-gray-300 hover:border-primary-500"
            >
              View All Products
            </Button>
          </div>
        </motion.div>

        {/* Statistics */}
        {renderStatistics()}

        {/* Trending Tags */}
        {renderTrendingTags()}

        {/* Social Proof Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              <strong className="text-blue-600">{animatedActiveViewers.toLocaleString()}</strong>{' '}
              people are viewing trending products right now
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TrendingBanner;

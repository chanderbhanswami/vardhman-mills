/**
 * RecentlyViewedBanner Component
 * 
 * Hero banner for the recently viewed section with statistics,
 * engaging visuals, and call-to-action elements.
 * 
 * Features:
 * - Hero layout with background media
 * - Statistics display (views, products, time saved)
 * - Animated counters
 * - CTA buttons
 * - Responsive design
 * - Parallax scroll effect
 * - Privacy information
 * - Benefits showcase
 * - Icon animations
 * - Gradient backgrounds
 * - Mobile optimized
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ClockIcon,
  EyeIcon,
  SparklesIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Statistic {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface RecentlyViewedBannerProps {
  /** Total products viewed */
  totalViewed?: number;
  /** This week's views */
  weeklyViews?: number;
  /** Time saved in minutes */
  timeSaved?: number;
  /** Show statistics */
  showStats?: boolean;
  /** Show benefits */
  showBenefits?: boolean;
  /** Enable parallax effect */
  enableParallax?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On CTA click */
  onCTAClick?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BENEFITS: Benefit[] = [
  {
    title: 'Quick Access',
    description: 'Easily find products you viewed before',
    icon: ClockIcon,
  },
  {
    title: 'Personalized',
    description: 'Your unique browsing history',
    icon: SparklesIcon,
  },
  {
    title: 'Privacy First',
    description: 'Your data stays on your device',
    icon: ShieldCheckIcon,
  },
];

// ============================================================================
// ANIMATED COUNTER HOOK
// ============================================================================

const useAnimatedCounter = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated || target === 0) return;

    const increment = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        setHasAnimated(true);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, hasAnimated]);

  return count;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const RecentlyViewedBanner: React.FC<RecentlyViewedBannerProps> = ({
  totalViewed = 0,
  weeklyViews = 0,
  timeSaved = 0,
  showStats = true,
  showBenefits = true,
  enableParallax = true,
  className,
  onCTAClick,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // ============================================================================
  // PARALLAX EFFECT
  // ============================================================================

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, enableParallax ? -50 : 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

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
  // ANIMATED COUNTERS
  // ============================================================================

  const animatedTotalViewed = useAnimatedCounter(totalViewed, 2000);
  const animatedWeeklyViews = useAnimatedCounter(weeklyViews, 1500);
  const animatedTimeSaved = useAnimatedCounter(timeSaved, 2500);

  // ============================================================================
  // STATISTICS
  // ============================================================================

  const statistics: Statistic[] = [
    {
      label: 'Total Viewed',
      value: animatedTotalViewed,
      suffix: ' products',
      icon: EyeIcon,
      color: 'text-blue-600',
    },
    {
      label: 'This Week',
      value: animatedWeeklyViews,
      suffix: ' views',
      icon: ChartBarIcon,
      color: 'text-purple-600',
    },
    {
      label: 'Time Saved',
      value: animatedTimeSaved,
      suffix: ' mins',
      icon: ClockIcon,
      color: 'text-green-600',
    },
  ];

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderStatistics = () => {
    if (!showStats || totalViewed === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statistics.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('rounded-full p-2', `bg-${stat.color.split('-')[1]}-100`)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {stat.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stat.prefix}
              {stat.value.toLocaleString()}
              {stat.suffix}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderBenefits = () => {
    if (!showBenefits) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {DEFAULT_BENEFITS.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            className="flex items-start gap-4 bg-white/50 backdrop-blur-sm rounded-lg p-4"
          >
            <div className="bg-blue-100 rounded-lg p-3">
              <benefit.icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      ref={containerRef}
      style={{ y, opacity }}
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="banner-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <g fill="#9C92AC" fillOpacity="0.4">
                <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" />
              </g>
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#banner-pattern)" />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-8 sm:p-12 lg:p-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isVisible ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block mb-4"
          >
            <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
              <ClockIcon className="w-4 h-4 inline mr-2" />
              Your Browsing History
            </Badge>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Recently Viewed
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Products
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Pick up where you left off. Browse your recently viewed products and
            never lose track of items you love.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={onCTAClick}
              className="bg-blue-600 hover:bg-blue-700 text-white group"
            >
              <ShoppingBagIcon className="w-5 h-5 mr-2" />
              View Your History
              <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => console.log('Continue shopping')}
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>

        {/* Statistics */}
        {renderStatistics()}

        {/* Benefits */}
        {renderBenefits()}

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 opacity-20">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <SparklesIcon className="w-24 h-24 text-blue-600" />
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-10 opacity-20">
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <EyeIcon className="w-20 h-20 text-purple-600" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentlyViewedBanner;

/**
 * ValueProposition Component
 * 
 * Comprehensive value proposition section showcasing USPs, benefits,
 * trust badges, testimonials, and stats with multiple display modes.
 * 
 * Features:
 * - USP list with icons
 * - Comparison table
 * - Trust badges
 * - Stats display with animated counters
 * - Testimonials integration
 * - CTA section
 * - Tabs for different value props
 * - Progress indicators
 * - Interactive elements
 * - Responsive design
 * - Dark mode support
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import {
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  GlobeAltIcon,
  HeartIcon,
  StarIcon,
  UsersIcon,
  BoltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CubeIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import {
  CheckBadgeIcon,
  StarIcon as StarSolidIcon,
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

export interface USP {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
}

export interface Stat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  progress?: number;
}

export interface ComparisonFeature {
  name: string;
  us: boolean | string;
  competitors: boolean | string;
}

export interface TrustBadge {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  verified?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  quote: string;
  rating: number;
}

export interface ValueTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  usps: USP[];
}

export interface ValuePropositionProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** USPs to display */
  usps?: USP[];
  /** Stats to display */
  stats?: Stat[];
  /** Comparison features */
  comparisonFeatures?: ComparisonFeature[];
  /** Trust badges */
  trustBadges?: TrustBadge[];
  /** Testimonials */
  testimonials?: Testimonial[];
  /** Value tabs */
  tabs?: ValueTab[];
  /** Show comparison table */
  showComparison?: boolean;
  /** Show stats */
  showStats?: boolean;
  /** Show trust badges */
  showTrustBadges?: boolean;
  /** Show testimonials */
  showTestimonials?: boolean;
  /** Enable animated counters */
  animateCounters?: boolean;
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaLink?: string;
  /** Secondary CTA text */
  secondaryCTAText?: string;
  /** Secondary CTA link */
  secondaryCTALink?: string;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On CTA click callback */
  onCTAClick?: () => void;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_USPS: USP[] = [
  {
    id: '1',
    icon: ShieldCheckIcon,
    title: 'Quality Guaranteed',
    description: 'Premium materials and craftsmanship backed by our satisfaction guarantee',
    badge: 'Top Feature',
  },
  {
    id: '2',
    icon: TruckIcon,
    title: 'Free Shipping',
    description: 'Free delivery on all orders over $50 with tracking',
  },
  {
    id: '3',
    icon: ChatBubbleLeftRightIcon,
    title: '24/7 Support',
    description: 'Expert customer service available around the clock',
  },
  {
    id: '4',
    icon: CreditCardIcon,
    title: 'Secure Payments',
    description: 'Multiple payment options with bank-level security',
  },
  {
    id: '5',
    icon: GlobeAltIcon,
    title: 'Global Reach',
    description: 'Shipping to over 100 countries worldwide',
  },
  {
    id: '6',
    icon: HeartIcon,
    title: 'Customer Love',
    description: 'Rated 4.8/5 stars by over 10,000 happy customers',
  },
];

const DEFAULT_STATS: Stat[] = [
  { id: '1', label: 'Happy Customers', value: 10000, suffix: '+', icon: UsersIcon, color: 'text-blue-600', progress: 85 },
  { id: '2', label: 'Products Sold', value: 50000, suffix: '+', icon: CubeIcon, color: 'text-green-600', progress: 92 },
  { id: '3', label: 'Countries Served', value: 100, suffix: '+', icon: GlobeAltIcon, color: 'text-purple-600', progress: 78 },
  { id: '4', label: 'Customer Rating', value: 4.8, suffix: '/5', icon: StarSolidIcon, color: 'text-yellow-600', progress: 96 },
  { id: '5', label: 'Growth Rate', value: 150, suffix: '%', icon: ArrowTrendingUpIcon, color: 'text-red-600', progress: 88 },
  { id: '6', label: 'Market Share', value: 35, suffix: '%', icon: ChartBarIcon, color: 'text-indigo-600', progress: 70 },
  { id: '7', label: 'Top Rated', value: 5, suffix: '', icon: StarIcon, color: 'text-orange-600', progress: 100 },
];

const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  { id: '1', label: 'SSL Secured', icon: ShieldCheckIcon, verified: true },
  { id: '2', label: 'Money-Back Guarantee', icon: CheckBadgeIcon, verified: true },
  { id: '3', label: 'Quality Certified', icon: StarSolidIcon, verified: true },
  { id: '4', label: 'Fast Delivery', icon: BoltIcon, verified: true },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const ValueProposition: React.FC<ValuePropositionProps> = ({
  title = 'Why Choose Us',
  subtitle = 'Discover the advantages that set us apart from the competition',
  usps = DEFAULT_USPS,
  stats = DEFAULT_STATS,
  comparisonFeatures = [],
  trustBadges = DEFAULT_TRUST_BADGES,
  testimonials = [],
  tabs = [],
  showComparison = false,
  showStats = true,
  showTrustBadges = true,
  showTestimonials = false,
  animateCounters = true,
  ctaText = 'Get Started',
  ctaLink = '#',
  secondaryCTAText = 'Learn More',
  secondaryCTALink = '#',
  loading = false,
  className,
  onCTAClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : null);
  const [animatedStats, setAnimatedStats] = useState<Record<string, number>>({});
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });

  // ============================================================================
  // ACTIVE USPs
  // ============================================================================

  const activeUSPs = useMemo(() => {
    if (tabs.length === 0 || !activeTab) return usps;
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    return activeTabData?.usps || usps;
  }, [tabs, activeTab, usps]);

  // ============================================================================
  // ANIMATED COUNTERS
  // ============================================================================

  useEffect(() => {
    if (!animateCounters || !isStatsInView) return;

    const animationDuration = 2000; // 2 seconds
    const frameRate = 60;
    const totalFrames = (animationDuration / 1000) * frameRate;

    stats.forEach((stat) => {
      let currentFrame = 0;
      const increment = stat.value / totalFrames;

      const timer = setInterval(() => {
        currentFrame++;
        const currentValue = Math.min(increment * currentFrame, stat.value);
        
        setAnimatedStats((prev) => ({
          ...prev,
          [stat.id]: currentValue,
        }));

        if (currentFrame >= totalFrames) {
          clearInterval(timer);
          setAnimatedStats((prev) => ({
            ...prev,
            [stat.id]: stat.value,
          }));
        }
      }, 1000 / frameRate);

      return () => clearInterval(timer);
    });

    console.log('Counter animations started');
  }, [isStatsInView, animateCounters, stats]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    console.log('Tab changed:', tabId);
  }, []);

  const handleCTAClick = useCallback(() => {
    onCTAClick?.();
    console.log('CTA clicked');
  }, [onCTAClick]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderUSPs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <AnimatePresence mode="wait">
        {activeUSPs.map((usp, index) => {
          const Icon = usp.icon;
          return (
            <motion.div
              key={usp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {usp.title}
                        </h3>
                        {usp.badge && (
                          <Badge variant="default" className="text-xs">
                            {usp.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {usp.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderStats = () => (
    <div ref={statsRef} className="py-12 bg-gray-50 dark:bg-gray-800 rounded-xl mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const displayValue = animateCounters && isStatsInView
            ? (animatedStats[stat.id] || 0)
            : stat.value;
          
          const formattedValue = stat.value % 1 !== 0
            ? displayValue.toFixed(1)
            : Math.floor(displayValue).toLocaleString();

          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              {Icon && (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-700 mb-3">
                  <Icon className={cn('w-6 h-6', stat.color || 'text-gray-600')} />
                </div>
              )}
              <div className={cn('text-3xl font-bold mb-1', stat.color || 'text-gray-900 dark:text-white')}>
                {stat.prefix}{formattedValue}{stat.suffix}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {stat.label}
              </div>
              {stat.progress !== undefined && (
                <Progress value={stat.progress} className="h-1 max-w-[120px] mx-auto" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderComparison = () => (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
        How We Compare
      </h3>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Us
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Competitors
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {feature.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.us === 'boolean' ? (
                        feature.us ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-600 mx-auto" />
                        ) : (
                          <XCircleIcon className="w-6 h-6 text-red-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">{feature.us}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.competitors === 'boolean' ? (
                        feature.competitors ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-600 mx-auto" />
                        ) : (
                          <XCircleIcon className="w-6 h-6 text-gray-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.competitors}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrustBadges = () => (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
      {trustBadges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Tooltip content={badge.label}>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {badge.label}
                    </span>
                    {badge.verified && (
                      <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Tooltip>
          </motion.div>
        );
      })}
    </div>
  );

  const renderTestimonials = () => (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
        What Our Customers Say
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.slice(0, 3).map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {testimonial.avatar && (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                      <Image 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                      {testimonial.company && ` at ${testimonial.company}`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <section className={cn('w-full py-16', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <section className={cn('w-full py-16', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => handleTabChange(tab.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* USPs */}
        {renderUSPs()}

        {/* Stats */}
        {showStats && renderStats()}

        {/* Comparison */}
        {showComparison && comparisonFeatures.length > 0 && renderComparison()}

        {/* Trust Badges */}
        {showTrustBadges && renderTrustBadges()}

        {/* Testimonials */}
        {showTestimonials && testimonials.length > 0 && renderTestimonials()}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleCTAClick} asChild>
              <a href={ctaLink}>
                {ctaText}
                <RocketLaunchIcon className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={secondaryCTALink}>
                {secondaryCTAText}
                <SparklesIcon className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProposition;

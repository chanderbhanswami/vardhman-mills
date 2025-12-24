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
  /** Badge text (e.g., "TRUSTED SINCE 1975") */
  badge?: string;
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
  badge,
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

  const renderUSPs = () => {
    // Gradient colors for each card icon
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-purple-500 to-violet-600',
      'from-rose-500 to-pink-600',
      'from-cyan-500 to-sky-600',
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        <AnimatePresence mode="wait">
          {activeUSPs.map((usp, index) => {
            const Icon = usp.icon;
            const gradient = gradients[index % gradients.length];
            const isFirst = index === 0;

            return (
              <motion.div
                key={usp.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={cn(
                  isFirst && 'md:col-span-2 lg:col-span-1'
                )}
              >
                <div
                  className={cn(
                    'group relative h-full p-6 rounded-2xl',
                    'bg-white backdrop-blur-xl',
                    'border border-gray-200',
                    'hover:bg-gray-50',
                    'hover:border-gray-300',
                    'hover:shadow-xl hover:shadow-gray-200/50',
                    'transition-all duration-300 cursor-default'
                  )}
                >
                  {/* Gradient glow on hover */}
                  <div className={cn(
                    'absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100',
                    'bg-gradient-to-r', gradient,
                    'blur-xl transition-opacity duration-500 -z-10'
                  )} style={{ opacity: 0.15 }} />

                  <div className="flex items-start gap-4">
                    {/* Icon with gradient background */}
                    <div className={cn(
                      'flex-shrink-0 w-14 h-14 rounded-xl',
                      'bg-gradient-to-br', gradient,
                      'flex items-center justify-center',
                      'shadow-lg group-hover:shadow-xl',
                      'group-hover:scale-110 transition-transform duration-300'
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-800">
                          {usp.title}
                        </h3>
                        {usp.badge && (
                          <Badge
                            variant="default"
                            className="text-[10px] uppercase tracking-wide bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm"
                          >
                            {usp.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {usp.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  const renderStats = () => {
    // Only show first 4 stats for cleaner look
    const displayStats = stats.slice(0, 4);

    return (
      <div
        ref={statsRef}
        className="relative py-10 px-8 mb-16 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg"
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
          {displayStats.map((stat, index) => {
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                {Icon && (
                  <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                    {/* Gradient ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-[3px] rounded-full bg-white" />
                    <Icon className={cn('relative w-7 h-7', stat.color || 'text-blue-600')} />
                  </div>
                )}
                <motion.div
                  className="text-4xl font-bold text-gray-900 mb-1 tracking-tight"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isStatsInView ? 1 : 0.8 }}
                  transition={{ type: 'spring', stiffness: 200, delay: index * 0.1 + 0.3 }}
                >
                  {stat.prefix}{formattedValue}{stat.suffix}
                </motion.div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

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
    <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
      {trustBadges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ scale: 1.05 }}
          >
            <div
              className={cn(
                'group flex items-center gap-2.5 px-5 py-2.5 rounded-full',
                'bg-white backdrop-blur-sm',
                'border border-gray-200',
                'hover:border-green-400 hover:bg-green-50',
                'hover:shadow-lg hover:shadow-green-500/20',
                'transition-all duration-300 cursor-pointer'
              )}
            >
              <Icon className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">
                {badge.label}
              </span>
              {badge.verified && (
                <CheckBadgeIcon className="w-5 h-5 text-green-500" />
              )}
            </div>
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
    <section className={cn('w-full py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {badge && (
              <Badge
                variant="outline"
                className="mb-4 text-xs font-bold uppercase tracking-widest bg-primary-50 text-primary-700 border-primary-200 px-4 py-1.5"
              >
                {badge}
              </Badge>
            )}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {title}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-6 rounded-full" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-normal"
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
          className="text-center pt-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 px-8 py-6 text-base font-semibold"
              asChild
            >
              <a href={ctaLink}>
                {ctaText}
                <RocketLaunchIcon className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 px-8 py-6 text-base font-semibold transition-all duration-300"
              asChild
            >
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

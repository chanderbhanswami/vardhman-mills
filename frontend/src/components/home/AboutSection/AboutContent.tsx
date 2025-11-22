/**
 * AboutContent Component
 * 
 * Displays the textual content for the About section including
 * company information, mission, values, and statistics.
 * 
 * Features:
 * - Animated text content
 * - Company statistics counter
 * - Mission and vision display
 * - Core values showcase
 * - Awards and certifications
 * - Interactive elements
 * - Responsive typography
 * - Dynamic content loading
 * - SEO optimized
 * - Rich text formatting
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  TrophyIcon, 
  UsersIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  SparklesIcon,
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  StarIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AboutContentProps {
  /** Content variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show statistics counter */
  showStats?: boolean;
  /** Show values section */
  showValues?: boolean;
  /** Show awards section */
  showAwards?: boolean;
  /** Show CTA buttons */
  showCTA?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Custom content */
  content?: Partial<AboutData>;
  /** CTA click handler */
  onCTAClick?: (action: string) => void;
  /** Additional CSS classes */
  className?: string;
}

interface AboutData {
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  tagline: string;
  foundedYear: number;
  stats: Statistic[];
  values: Value[];
  awards: Award[];
  certifications: Certification[];
  highlights: string[];
}

interface Statistic {
  id: string;
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface Value {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  order: number;
}

interface Award {
  id: string;
  title: string;
  year: number;
  organization: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
  logo?: string;
  verified: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ABOUT_DATA: AboutData = {
  title: 'Vardhman Mills',
  subtitle: 'Weaving Excellence Since 1965',
  description: 'For over five decades, Vardhman Mills has been at the forefront of textile manufacturing, combining traditional craftsmanship with cutting-edge technology. We are committed to delivering premium quality fabrics that meet the diverse needs of our global clientele.',
  mission: 'To provide superior quality textile products while maintaining sustainable practices and fostering innovation in the textile industry.',
  vision: 'To be the world&apos;s most trusted and innovative textile manufacturer, setting new standards in quality, sustainability, and customer satisfaction.',
  tagline: 'Quality Woven into Every Thread',
  foundedYear: 1965,
  stats: [
    {
      id: 'stat-1',
      label: 'Years of Excellence',
      value: 59,
      suffix: '+',
      icon: TrophyIcon,
      color: 'text-yellow-600',
      description: 'Decades of industry leadership',
      trend: 'up',
      trendValue: 'Since 1965',
    },
    {
      id: 'stat-2',
      label: 'Happy Customers',
      value: 50000,
      suffix: '+',
      icon: UsersIcon,
      color: 'text-blue-600',
      description: 'Satisfied clients worldwide',
      trend: 'up',
      trendValue: '+15% YoY',
    },
    {
      id: 'stat-3',
      label: 'Countries Served',
      value: 45,
      suffix: '+',
      icon: GlobeAltIcon,
      color: 'text-green-600',
      description: 'Global presence and reach',
      trend: 'up',
      trendValue: 'Expanding',
    },
    {
      id: 'stat-4',
      label: 'Products Delivered',
      value: 1000000,
      suffix: '+',
      icon: BuildingOffice2Icon,
      color: 'text-purple-600',
      description: 'Quality products delivered',
      trend: 'up',
      trendValue: 'Monthly',
    },
  ],
  values: [
    {
      id: 'value-1',
      title: 'Quality Excellence',
      description: 'We never compromise on quality. Every product undergoes rigorous testing to ensure it meets our high standards.',
      icon: ShieldCheckIcon,
      color: 'bg-blue-50 text-blue-600',
      order: 1,
    },
    {
      id: 'value-2',
      title: 'Innovation',
      description: 'Constantly evolving with the latest technology and sustainable practices to deliver cutting-edge textile solutions.',
      icon: LightBulbIcon,
      color: 'bg-yellow-50 text-yellow-600',
      order: 2,
    },
    {
      id: 'value-3',
      title: 'Customer Focus',
      description: 'Your satisfaction is our priority. We build lasting relationships through exceptional service and support.',
      icon: HeartIcon,
      color: 'bg-red-50 text-red-600',
      order: 3,
    },
    {
      id: 'value-4',
      title: 'Sustainability',
      description: 'Committed to environmental responsibility with eco-friendly manufacturing processes and sustainable materials.',
      icon: SparklesIcon,
      color: 'bg-green-50 text-green-600',
      order: 4,
    },
    {
      id: 'value-5',
      title: 'Growth Mindset',
      description: 'Continuously improving and adapting to market needs while empowering our team and partners.',
      icon: RocketLaunchIcon,
      color: 'bg-purple-50 text-purple-600',
      order: 5,
    },
    {
      id: 'value-6',
      title: 'Integrity',
      description: 'Operating with transparency, honesty, and ethical business practices in all our dealings.',
      icon: HandRaisedIcon,
      color: 'bg-indigo-50 text-indigo-600',
      order: 6,
    },
  ],
  awards: [
    {
      id: 'award-1',
      title: 'Best Textile Manufacturer',
      year: 2024,
      organization: 'Indian Textile Excellence Awards',
      description: 'Recognized for outstanding quality and innovation',
      icon: TrophyIcon,
    },
    {
      id: 'award-2',
      title: 'Sustainability Leader',
      year: 2023,
      organization: 'Green Manufacturing Council',
      description: 'Awarded for eco-friendly practices',
      icon: SparklesIcon,
    },
    {
      id: 'award-3',
      title: 'Export Excellence',
      year: 2023,
      organization: 'Government of India',
      description: 'Top exporter in textile category',
      icon: StarIcon,
    },
    {
      id: 'award-4',
      title: 'Quality Certification',
      year: 2022,
      organization: 'ISO International',
      description: 'ISO 9001:2015 certified',
      icon: AcademicCapIcon,
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'ISO 9001:2015',
      issuer: 'International Organization for Standardization',
      year: 2022,
      verified: true,
    },
    {
      id: 'cert-2',
      name: 'OEKO-TEX Standard 100',
      issuer: 'OEKO-TEX Association',
      year: 2023,
      verified: true,
    },
    {
      id: 'cert-3',
      name: 'GOTS Certified',
      issuer: 'Global Organic Textile Standard',
      year: 2023,
      verified: true,
    },
    {
      id: 'cert-4',
      name: 'BIS Certification',
      issuer: 'Bureau of Indian Standards',
      year: 2024,
      verified: true,
    },
  ],
  highlights: [
    'Premium quality fabrics with international standards',
    'State-of-the-art manufacturing facilities',
    'Sustainable and eco-friendly production',
    'Expert team with decades of experience',
    'Global distribution network',
    '24/7 customer support and service',
  ],
};

// Animation variants
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
  },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const AboutContent: React.FC<AboutContentProps> = ({
  variant = 'default',
  showStats = true,
  showValues = true,
  showAwards = true,
  showCTA = true,
  animated = true,
  content,
  onCTAClick,
  className,
}) => {
  const router = useRouter();
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Merge default data with custom content
  const aboutData = useMemo(() => ({
    ...DEFAULT_ABOUT_DATA,
    ...content,
    stats: content?.stats || DEFAULT_ABOUT_DATA.stats,
    values: content?.values || DEFAULT_ABOUT_DATA.values,
    awards: content?.awards || DEFAULT_ABOUT_DATA.awards,
    certifications: content?.certifications || DEFAULT_ABOUT_DATA.certifications,
    highlights: content?.highlights || DEFAULT_ABOUT_DATA.highlights,
  }), [content]);

  // State
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [countersStarted, setCountersStarted] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<Record<string, number>>({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [expandedAward, setExpandedAward] = useState<string | null>(null);

  // Start animations when in view
  useEffect(() => {
    if (isInView && animated) {
      controls.start('visible');
      if (!countersStarted) {
        setCountersStarted(true);
      }
    }
  }, [isInView, controls, animated, countersStarted]);

  // Animate statistics counters
  useEffect(() => {
    if (!countersStarted || !showStats) return;

    aboutData.stats.forEach((stat) => {
      const startValue = 0;
      const duration = 2000; // 2 seconds
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuad = (t: number) => t * (2 - t);
        const easedProgress = easeOutQuad(progress);
        
        const currentValue = Math.floor(startValue + (stat.value - startValue) * easedProgress);
        
        setAnimatedStats((prev) => ({
          ...prev,
          [stat.id]: currentValue,
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    });
  }, [countersStarted, aboutData.stats, showStats]);

  // Handlers
  const handleCTAClick = useCallback((action: string) => {
    if (onCTAClick) {
      onCTAClick(action);
    } else {
      // Default navigation
      switch (action) {
        case 'products':
          router.push('/products');
          break;
        case 'contact':
          router.push('/contact');
          break;
        case 'learn-more':
          router.push('/about');
          break;
        case 'video':
          setShowVideoModal(true);
          break;
        default:
          break;
      }
    }
  }, [onCTAClick, router]);

  const handleValueHover = useCallback((valueId: string | null) => {
    setActiveValue(valueId);
  }, []);

  const handleAwardClick = useCallback((awardId: string) => {
    setExpandedAward(expandedAward === awardId ? null : awardId);
  }, [expandedAward]);

  const formatStatValue = useCallback((stat: Statistic) => {
    const value = animatedStats[stat.id] || 0;
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    
    return formatNumber(value);
  }, [animatedStats]);

  // Computed values
  const sortedValues = useMemo(() => {
    return [...aboutData.values].sort((a, b) => a.order - b.order);
  }, [aboutData.values]);

  const recentAwards = useMemo(() => {
    return [...aboutData.awards]
      .sort((a, b) => b.year - a.year)
      .slice(0, variant === 'compact' ? 2 : 4);
  }, [aboutData.awards, variant]);

  // Render helpers
  const renderStatistic = (stat: Statistic, index: number) => {
    const Icon = stat.icon;
    const displayValue = formatStatValue(stat);
    const delay = index * 0.1; // Use index for staggered animation

    return (
      <motion.div
        key={stat.id}
        variants={animated ? statVariants : undefined}
        transition={animated ? { delay } : undefined}
        className={cn(
          'group relative bg-white rounded-xl p-6 shadow-sm',
          'border border-gray-100 hover:border-primary-200',
          'hover:shadow-md transition-all duration-300',
          'cursor-pointer'
        )}
      >
        <Tooltip content={stat.description || stat.label}>
          <div className="flex items-start gap-4">
            <div className={cn(
              'flex-shrink-0 w-12 h-12 rounded-lg',
              'bg-gradient-to-br from-primary-50 to-primary-100',
              'flex items-center justify-center',
              'group-hover:scale-110 transition-transform duration-300'
            )}>
              <Icon className={cn('w-6 h-6', stat.color)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1">
                {stat.prefix && (
                  <span className="text-sm font-medium text-gray-600">
                    {stat.prefix}
                  </span>
                )}
                <span className="text-3xl font-bold text-gray-900">
                  {displayValue}
                </span>
                {stat.suffix && (
                  <span className="text-xl font-semibold text-gray-600">
                    {stat.suffix}
                  </span>
                )}
              </div>
              
              <p className="text-sm font-medium text-gray-600 mt-1">
                {stat.label}
              </p>
              
              {stat.trend && stat.trendValue && (
                <div className="flex items-center gap-1 mt-2">
                  <Badge
                    variant={stat.trend === 'up' ? 'success' : stat.trend === 'down' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {stat.trendValue}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Tooltip>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    );
  };

  const renderValue = (value: Value, index: number) => {
    const Icon = value.icon;
    const isActive = activeValue === value.id;
    const delay = index * 0.15; // Use index for staggered animation

    return (
      <motion.div
        key={value.id}
        variants={animated ? itemVariants : undefined}
        transition={animated ? { delay } : undefined}
        onMouseEnter={() => handleValueHover(value.id)}
        onMouseLeave={() => handleValueHover(null)}
        className={cn(
          'group relative bg-white rounded-xl p-6',
          'border-2 transition-all duration-300',
          isActive
            ? 'border-primary-500 shadow-lg scale-105'
            : 'border-gray-100 hover:border-primary-200 hover:shadow-md'
        )}
      >
        <div className={cn(
          'inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4',
          'transition-all duration-300',
          value.color,
          isActive && 'scale-110 shadow-md'
        )}>
          <Icon className="w-7 h-7" />
        </div>

        <h3 className={cn(
          'text-lg font-bold mb-2 transition-colors duration-300',
          isActive ? 'text-primary-600' : 'text-gray-900'
        )}>
          {value.title}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed">
          {value.description}
        </p>

        {/* Hover indicator */}
        <div className={cn(
          'absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600',
          'rounded-b-xl transition-all duration-300',
          isActive ? 'w-full' : 'w-0'
        )} />
      </motion.div>
    );
  };

  const renderAward = (award: Award, index: number) => {
    const Icon = award.icon || TrophyIcon;
    const isExpanded = expandedAward === award.id;
    const delay = index * 0.1; // Use index for staggered animation

    return (
      <motion.div
        key={award.id}
        variants={animated ? itemVariants : undefined}
        transition={animated ? { delay } : undefined}
        onClick={() => handleAwardClick(award.id)}
        className={cn(
          'bg-white rounded-lg p-4 border border-gray-200',
          'hover:border-yellow-300 hover:shadow-md',
          'transition-all duration-300 cursor-pointer',
          isExpanded && 'border-yellow-400 shadow-lg'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-yellow-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-gray-900 text-sm">
                {award.title}
              </h4>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {award.year}
              </Badge>
            </div>

            <p className="text-xs text-gray-600 mt-1">
              {award.organization}
            </p>

            <AnimatePresence>
              {isExpanded && award.description && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-gray-700 mt-2 overflow-hidden"
                >
                  {award.description}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  // Main render
  return (
    <motion.div
      ref={ref}
      initial={animated ? 'hidden' : 'visible'}
      animate={controls}
      variants={animated ? containerVariants : undefined}
      className={cn('space-y-8', className)}
    >
      {/* Header Section */}
      <motion.div
        variants={animated ? itemVariants : undefined}
        className="space-y-4"
      >
        {/* Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="success" className="gap-1">
            <CheckCircleSolidIcon className="w-4 h-4" />
            Trusted Since {aboutData.foundedYear}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <StarSolidIcon className="w-4 h-4 text-yellow-500" />
            Award Winning
          </Badge>
          <Badge variant="info" className="gap-1">
            <GlobeAltIcon className="w-4 h-4" />
            Global Presence
          </Badge>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {aboutData.title}
          </h2>
          <p className="text-xl text-primary-600 font-semibold">
            {aboutData.subtitle}
          </p>
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-2 text-gray-600">
          <SparklesIcon className="w-5 h-5 text-primary-500" />
          <p className="text-lg italic">&ldquo;{aboutData.tagline}&rdquo;</p>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        variants={animated ? itemVariants : undefined}
        className="prose prose-lg max-w-none"
      >
        <p className="text-gray-700 leading-relaxed">
          {aboutData.description}
        </p>
      </motion.div>

      {/* Statistics */}
      {showStats && (
        <motion.div
          variants={animated ? itemVariants : undefined}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 text-primary-600" />
            <h3 className="text-2xl font-bold text-gray-900">
              Our Achievements
            </h3>
          </div>

          <div className={cn(
            'grid gap-4',
            variant === 'compact'
              ? 'grid-cols-2'
              : 'grid-cols-2 lg:grid-cols-4'
          )}>
            {aboutData.stats.map((stat, index) => renderStatistic(stat, index))}
          </div>
        </motion.div>
      )}

      {/* Mission & Vision */}
      {variant !== 'compact' && (
        <motion.div
          variants={animated ? itemVariants : undefined}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Mission */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <RocketLaunchIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Our Mission
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {aboutData.mission}
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Our Vision
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {aboutData.vision}
            </p>
          </div>
        </motion.div>
      )}

      {/* Core Values */}
      {showValues && (
        <motion.div
          variants={animated ? itemVariants : undefined}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <HeartSolidIcon className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-bold text-gray-900">
              Our Core Values
            </h3>
          </div>

          <div className={cn(
            'grid gap-4',
            variant === 'compact'
              ? 'grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}>
            {sortedValues.slice(0, variant === 'compact' ? 4 : sortedValues.length).map((value, index) => 
              renderValue(value, index)
            )}
          </div>
        </motion.div>
      )}

      {/* Highlights */}
      {variant === 'detailed' && (
        <motion.div
          variants={animated ? itemVariants : undefined}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircleSolidIcon className="w-6 h-6 text-green-500" />
            Why Choose Us
          </h3>

          <div className="grid md:grid-cols-2 gap-3">
            {aboutData.highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-gray-700"
              >
                <ChevronRightIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Awards & Recognition */}
      {showAwards && (
        <motion.div
          variants={animated ? itemVariants : undefined}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarSolidIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="text-2xl font-bold text-gray-900">
                Awards & Recognition
              </h3>
            </div>
            {variant !== 'compact' && recentAwards.length < aboutData.awards.length && (
              <Button
                variant="link"
                size="sm"
                onClick={() => handleCTAClick('awards')}
                className="gap-1"
              >
                View All
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className={cn(
            'grid gap-3',
            variant === 'compact'
              ? 'grid-cols-1'
              : 'grid-cols-1 md:grid-cols-2'
          )}>
            {recentAwards.map((award, index) => renderAward(award, index))}
          </div>
        </motion.div>
      )}

      {/* Certifications */}
      {variant === 'detailed' && aboutData.certifications.length > 0 && (
        <motion.div
          variants={animated ? itemVariants : undefined}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <AcademicCapIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Certifications
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aboutData.certifications.map((cert) => (
              <Tooltip
                key={cert.id}
                content={`${cert.name} - Issued by ${cert.issuer} (${cert.year})`}
              >
                <div className="flex flex-col items-center text-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  {cert.verified && (
                    <CheckCircleSolidIcon className="w-5 h-5 text-green-500 mb-2" />
                  )}
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {cert.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {cert.year}
                  </p>
                </div>
              </Tooltip>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA Buttons */}
      {showCTA && (
        <motion.div
          variants={animated ? itemVariants : undefined}
          className="flex flex-wrap items-center gap-4 pt-4"
        >
          <Button
            size="lg"
            onClick={() => handleCTAClick('products')}
            className="gap-2"
          >
            Explore Our Products
            <ArrowRightIcon className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => handleCTAClick('contact')}
            className="gap-2"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Get in Touch
          </Button>

          {variant === 'detailed' && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleCTAClick('video')}
              className="gap-2"
            >
              <PlayCircleIcon className="w-5 h-5" />
              Watch Our Story
            </Button>
          )}
        </motion.div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-4 max-w-4xl w-full"
            >
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-white">Video Player Placeholder</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AboutContent;

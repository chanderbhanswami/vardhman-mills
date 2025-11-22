/**
 * BestSellersBanner Component
 * 
 * Hero banner for Best Sellers section with featured products and CTAs.
 * 
 * Features:
 * - Dynamic background images
 * - Animated entrance effects
 * - Interactive CTAs
 * - Badge overlays
 * - Responsive design
 * - Video background support
 * - Countdown timers
 * - Social proof indicators
 * - Parallax effects
 * - Custom gradients
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatNumber } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BestSellersBannerProps {
  /** Banner title */
  title?: string;
  /** Banner subtitle */
  subtitle?: string;
  /** Banner description */
  description?: string;
  /** Show statistics */
  showStats?: boolean;
  /** Banner variant */
  variant?: 'default' | 'gradient' | 'image' | 'video' | 'carousel';
  /** Banner size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show countdown timer */
  showCountdown?: boolean;
  /** Enable parallax effect */
  enableParallax?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Auto-play carousel */
  autoPlay?: boolean;
  /** Auto-play interval (ms) */
  autoPlayInterval?: number;
  /** Custom background image */
  backgroundImage?: string;
  /** Custom background video */
  backgroundVideo?: string;
  /** Show social proof */
  showSocialProof?: boolean;
  /** Custom call-to-action text */
  ctaText?: string;
  /** Custom secondary CTA text */
  secondaryCtaText?: string;
  /** On CTA click handler */
  onCtaClick?: () => void;
  /** On secondary CTA click handler */
  onSecondaryCtaClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  video?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  ctaText: string;
  ctaLink: string;
  stats?: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }[];
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    title: 'Best Selling Products',
    subtitle: 'Premium Quality Textiles',
    description: 'Discover our most popular products trusted by thousands of customers worldwide',
    image: '/images/banners/best-sellers-1.jpg',
    badge: 'Top Rated',
    badgeIcon: <TrophyIcon className="w-4 h-4" />,
    ctaText: 'Shop Now',
    ctaLink: '/products/best-sellers',
    stats: [
      { label: 'Products', value: 250, icon: <SparklesIcon className="w-4 h-4" /> },
      { label: 'Reviews', value: '15K+', icon: <StarIconSolid className="w-4 h-4 text-yellow-400" /> },
      { label: 'Rating', value: 4.8, icon: <StarIcon className="w-4 h-4" /> },
    ],
  },
  {
    id: 'slide-2',
    title: 'Limited Time Offer',
    subtitle: 'Up to 40% Off',
    description: 'Exclusive discounts on our best-selling textile collections',
    image: '/images/banners/best-sellers-2.jpg',
    badge: 'Hot Deal',
    badgeIcon: <FireIcon className="w-4 h-4" />,
    ctaText: 'View Deals',
    ctaLink: '/products/deals',
    stats: [
      { label: 'Save up to', value: '40%', icon: <SparklesIcon className="w-4 h-4" /> },
      { label: 'Customers', value: '50K+', icon: <StarIconSolid className="w-4 h-4 text-yellow-400" /> },
    ],
  },
  {
    id: 'slide-3',
    title: 'New Arrivals',
    subtitle: 'Latest Collections',
    description: 'Explore our newest textile designs and premium fabrics',
    image: '/images/banners/best-sellers-3.jpg',
    badge: 'New',
    badgeIcon: <SparklesIcon className="w-4 h-4" />,
    ctaText: 'Explore Now',
    ctaLink: '/products/new',
  },
];

const SOCIAL_PROOF = {
  customers: 50000,
  rating: 4.8,
  reviews: 15000,
  products: 250,
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
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

// ============================================================================
// COMPONENT
// ============================================================================

export const BestSellersBanner: React.FC<BestSellersBannerProps> = ({
  variant = 'default',
  size = 'lg',
  showCountdown = false,
  enableParallax = false,
  animated = true,
  autoPlay = true,
  autoPlayInterval = 5000,
  backgroundImage,
  backgroundVideo,
  showSocialProof = true,
  ctaText = 'Shop Best Sellers',
  secondaryCtaText = 'View All Products',
  onCtaClick,
  onSecondaryCtaClick,
  className,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [[currentSlide, direction], setCurrentSlide] = useState([0, 0]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 7,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });
  
  const bannerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const isInView = useInView(bannerRef, { once: true, amount: 0.2 });
  
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ['start end', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const slides = useMemo(() => DEFAULT_SLIDES, []);
  const activeSlide = useMemo(() => slides[currentSlide], [slides, currentSlide]);

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'h-64 sm:h-80';
      case 'md':
        return 'h-80 sm:h-96';
      case 'lg':
        return 'h-96 sm:h-[32rem]';
      case 'xl':
        return 'h-[32rem] sm:h-[40rem]';
      default:
        return 'h-96 sm:h-[32rem]';
    }
  }, [size]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Countdown timer
  useEffect(() => {
    if (!showCountdown) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown]);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || variant !== 'carousel') return;

    autoPlayTimerRef.current = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, variant, currentSlide]); // eslint-disable-line react-hooks/exhaustive-deps

  // Video controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVideoPlaying) {
      video.play().catch(() => setIsVideoPlaying(false));
    } else {
      video.pause();
    }
  }, [isVideoPlaying]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const paginateRef = useRef<((newDirection: number) => void) | null>(null);

  const paginate = useCallback((newDirection: number) => {
    const newIndex = (currentSlide + newDirection + slides.length) % slides.length;
    setCurrentSlide([newIndex, newDirection]);
    
    // Reset auto-play timer
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = setInterval(() => {
        if (paginateRef.current) {
          paginateRef.current(1);
        }
      }, autoPlayInterval);
    }
  }, [currentSlide, slides.length, autoPlayInterval]);

  // Store paginate in ref for timer access
  useEffect(() => {
    paginateRef.current = paginate;
  }, [paginate]);

  const handlePrevSlide = useCallback(() => {
    paginate(-1);
  }, [paginate]);

  const handleNextSlide = useCallback(() => {
    paginate(1);
  }, [paginate]);

  const toggleVideo = useCallback(() => {
    setIsVideoPlaying((prev) => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  const handleCtaClick = useCallback(() => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      window.location.href = activeSlide.ctaLink;
    }
  }, [onCtaClick, activeSlide]);

  const handleSecondaryCtaClick = useCallback(() => {
    if (onSecondaryCtaClick) {
      onSecondaryCtaClick();
    } else {
      window.location.href = '/products';
    }
  }, [onSecondaryCtaClick]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCountdown = useCallback(() => {
    if (!showCountdown) return null;

    return (
      <motion.div
        variants={animated ? itemVariants : undefined}
        className="flex items-center gap-4 mb-6"
      >
        <Badge variant="destructive" className="text-sm font-semibold">
          <FireIcon className="w-4 h-4 mr-1" />
          Limited Time
        </Badge>
        <div className="flex gap-2">
          {[
            { label: 'Days', value: countdown.days },
            { label: 'Hours', value: countdown.hours },
            { label: 'Mins', value: countdown.minutes },
            { label: 'Secs', value: countdown.seconds },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[3rem] text-center">
                <span className="text-2xl font-bold text-white">
                  {String(item.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-white/80 mt-1">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }, [showCountdown, countdown, animated]);

  const renderSocialProof = useCallback(() => {
    if (!showSocialProof) return null;

    // Use slide stats or fallback to global social proof
    const stats = activeSlide.stats || [
      { label: 'Customers', value: SOCIAL_PROOF.customers, icon: <SparklesIcon className="w-4 h-4" /> },
      { label: 'Rating', value: SOCIAL_PROOF.rating, icon: <StarIconSolid className="w-4 h-4 text-yellow-400" /> },
      { label: 'Reviews', value: `${Math.floor(SOCIAL_PROOF.reviews / 1000)}K+`, icon: <StarIcon className="w-4 h-4" /> },
    ];

    return (
      <motion.div
        variants={animated ? itemVariants : undefined}
        className="flex flex-wrap items-center gap-4 mt-6"
      >
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            {stat.icon}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">
                {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
              </span>
              <span className="text-xs text-white/80">{stat.label}</span>
            </div>
          </div>
        ))}
      </motion.div>
    );
  }, [showSocialProof, activeSlide, animated]);

  const renderVideoControls = useCallback(() => {
    if (variant !== 'video' && !backgroundVideo) return null;

    return (
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Tooltip content={isVideoPlaying ? 'Pause' : 'Play'}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleVideo}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            {isVideoPlaying ? (
              <PauseIcon className="w-5 h-5 text-white" />
            ) : (
              <PlayIcon className="w-5 h-5 text-white" />
            )}
          </Button>
        </Tooltip>
        <Tooltip content={isMuted ? 'Unmute' : 'Mute'}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="w-5 h-5 text-white" />
            ) : (
              <SpeakerWaveIcon className="w-5 h-5 text-white" />
            )}
          </Button>
        </Tooltip>
      </div>
    );
  }, [variant, backgroundVideo, isVideoPlaying, isMuted, toggleVideo, toggleMute]);

  const renderCarouselControls = useCallback(() => {
    if (variant !== 'carousel') return null;

    return (
      <>
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </button>
        
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide([index, index > currentSlide ? 1 : -1])}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </>
    );
  }, [variant, slides, currentSlide, handlePrevSlide, handleNextSlide]);

  const renderContent = useCallback(() => (
    <motion.div
      className="relative z-10 h-full flex flex-col justify-center container mx-auto px-4 sm:px-6 lg:px-8"
      variants={animated ? containerVariants : undefined}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {/* Badge */}
      {activeSlide.badge && (
        <motion.div variants={animated ? itemVariants : undefined} className="mb-4">
          <Badge variant="secondary" className="text-base px-4 py-2">
            {activeSlide.badgeIcon}
            <span className="ml-2">{activeSlide.badge}</span>
          </Badge>
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        variants={animated ? itemVariants : undefined}
        className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 max-w-4xl"
      >
        {activeSlide.title}
      </motion.h1>

      {/* Subtitle */}
      <motion.h2
        variants={animated ? itemVariants : undefined}
        className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white/90 mb-6 max-w-3xl"
      >
        {activeSlide.subtitle}
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={animated ? itemVariants : undefined}
        className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl"
      >
        {activeSlide.description}
      </motion.p>

      {/* Countdown */}
      {renderCountdown()}

      {/* CTAs */}
      <motion.div
        variants={animated ? itemVariants : undefined}
        className="flex flex-wrap gap-4 mb-6"
      >
        <Button
          size="lg"
          onClick={handleCtaClick}
          className="bg-white text-gray-900 hover:bg-gray-100 group"
        >
          {ctaText}
          <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleSecondaryCtaClick}
          className="border-white text-white hover:bg-white/10"
        >
          {secondaryCtaText}
        </Button>
      </motion.div>

      {/* Social Proof */}
      {renderSocialProof()}
    </motion.div>
  ), [
    animated,
    isInView,
    activeSlide,
    renderCountdown,
    renderSocialProof,
    ctaText,
    secondaryCtaText,
    handleCtaClick,
    handleSecondaryCtaClick,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={bannerRef}
      className={cn(
        'relative overflow-hidden',
        sizeClasses,
        className
      )}
    >
      {/* Background */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={variant === 'carousel' ? currentSlide : 'static'}
          custom={direction}
          variants={variant === 'carousel' ? slideVariants : undefined}
          initial={variant === 'carousel' ? 'enter' : undefined}
          animate="center"
          exit={variant === 'carousel' ? 'exit' : undefined}
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
          style={enableParallax ? { y } : undefined}
        >
          {/* Video Background */}
          {(variant === 'video' || backgroundVideo) && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
              autoPlay
            >
              <source src={backgroundVideo || activeSlide.video || '/videos/banner.mp4'} type="video/mp4" />
            </video>
          )}

          {/* Image Background */}
          {(variant === 'image' || variant === 'carousel' || backgroundImage) && (
            <Image
              src={backgroundImage || activeSlide.image}
              alt={activeSlide.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          )}

          {/* Gradient Background */}
          {variant === 'gradient' && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          
          {/* Parallax Opacity */}
          {enableParallax && (
            <motion.div
              className="absolute inset-0 bg-black"
              style={{ opacity }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      {renderContent()}

      {/* Video Controls */}
      {renderVideoControls()}

      {/* Carousel Controls */}
      {renderCarouselControls()}

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-500/10 rounded-full filter blur-3xl" />
    </div>
  );
};

export default BestSellersBanner;

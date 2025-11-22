/**
 * AboutSection Component
 * 
 * Main container component for the About section that combines
 * AboutContent and AboutImage components.
 * 
 * Features:
 * - Responsive layout management
 * - Section visibility controls
 * - Animation coordination
 * - Background effects
 * - Scroll-based animations
 * - Section navigation
 * - Content synchronization
 * - Theme support
 * - Accessibility features
 * - SEO optimization
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  InformationCircleIcon,
  PhotoIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { AboutContent } from './AboutContent';
import { AboutImage } from './AboutImage';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AboutSectionProps {
  /** Section layout variant */
  variant?: 'default' | 'split' | 'stacked' | 'grid' | 'masonry';
  /** Content alignment */
  alignment?: 'left' | 'right' | 'center';
  /** Show section header */
  showHeader?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Background style */
  background?: 'none' | 'gradient' | 'pattern' | 'image';
  /** Show navigation */
  showNavigation?: boolean;
  /** Content first (before images) */
  contentFirst?: boolean;
  /** Enable parallax effect */
  enableParallax?: boolean;
  /** Custom section ID for navigation */
  sectionId?: string;
  /** Additional CSS classes */
  className?: string;
  /** Children components */
  children?: React.ReactNode;
}

interface SectionConfig {
  showContent: boolean;
  showImages: boolean;
  contentVariant: 'default' | 'compact' | 'detailed';
  imageVariant: 'default' | 'gallery' | 'collage' | 'slider';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SECTION_HEADER = {
  title: 'About Us',
  subtitle: 'Our Story, Mission & Values',
  description: 'Learn more about Vardhman Mills - our history, commitment to quality, and dedication to excellence in textile manufacturing.',
};

const BACKGROUND_PATTERNS = {
  pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const AboutSection: React.FC<AboutSectionProps> = ({
  variant = 'default',
  alignment = 'left',
  showHeader = true,
  animated = true,
  background = 'none',
  showNavigation = false,
  contentFirst = true,
  enableParallax = false,
  sectionId = 'about',
  className,
  children,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [config, setConfig] = useState<SectionConfig>({
    showContent: true,
    showImages: true,
    contentVariant: 'default',
    imageVariant: 'default',
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'images'>('content');
  
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const backgroundStyle = useMemo(() => {
    switch (background) {
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed',
        };
      case 'pattern':
        return {
          backgroundImage: BACKGROUND_PATTERNS.pattern,
        };
      case 'image':
        return {
          backgroundImage: 'url(/images/about/bg-pattern.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: enableParallax ? 'fixed' : 'scroll',
        };
      default:
        return {};
    }
  }, [background, enableParallax]);

  const layoutClasses = useMemo(() => {
    const baseClasses = 'container mx-auto px-4 sm:px-6 lg:px-8';
    
    switch (variant) {
      case 'split':
        return cn(
          baseClasses,
          'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'
        );
      case 'stacked':
        return cn(baseClasses, 'space-y-12');
      case 'grid':
        return cn(baseClasses, 'grid grid-cols-1 md:grid-cols-2 gap-8');
      case 'masonry':
        return cn(
          baseClasses,
          'columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8'
        );
      default:
        return cn(baseClasses, 'max-w-7xl');
    }
  }, [variant]);

  const alignmentClasses = useMemo(() => {
    switch (alignment) {
      case 'center':
        return 'text-center mx-auto';
      case 'right':
        return 'text-right ml-auto';
      default:
        return 'text-left';
    }
  }, [alignment]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Update config based on variant
    if (variant === 'stacked') {
      setConfig(prev => ({
        ...prev,
        showContent: true,
        showImages: true,
      }));
    } else if (variant === 'grid') {
      setConfig(prev => ({
        ...prev,
        contentVariant: 'compact',
        imageVariant: 'gallery',
      }));
    }
  }, [variant]);

  useEffect(() => {
    // Intersection Observer for section visibility
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleSection = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const toggleContent = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      showContent: !prev.showContent,
    }));
  }, []);

  const toggleImages = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      showImages: !prev.showImages,
    }));
  }, []);

  const scrollToSection = useCallback(() => {
    sectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const handleTabChange = useCallback((tab: 'content' | 'images') => {
    setActiveTab(tab);
    setConfig(prev => ({
      ...prev,
      showContent: tab === 'content',
      showImages: tab === 'images',
    }));
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = useCallback(() => {
    if (!showHeader) return null;

    return (
      <motion.div
        ref={headerRef}
        variants={animated ? headerVariants : undefined}
        className={cn('mb-12', alignmentClasses)}
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-sm">
            <InformationCircleIcon className="w-4 h-4 mr-1" />
            About
          </Badge>
          <Badge variant="outline" className="text-sm">
            <SparklesIcon className="w-4 h-4 mr-1" />
            Our Story
          </Badge>
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {SECTION_HEADER.title}
        </h2>
        
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-2 max-w-2xl">
          {SECTION_HEADER.subtitle}
        </p>
        
        <p className="text-base text-gray-500 dark:text-gray-400 max-w-3xl">
          {SECTION_HEADER.description}
        </p>
      </motion.div>
    );
  }, [showHeader, animated, alignmentClasses]);

  const renderNavigation = useCallback(() => {
    if (!showNavigation) return null;

    return (
      <motion.div
        variants={animated ? itemVariants : undefined}
        className="flex flex-wrap items-center justify-center gap-4 mb-8"
      >
        <Tooltip content="Toggle content visibility">
          <Button
            variant={config.showContent ? 'default' : 'outline'}
            size="sm"
            onClick={toggleContent}
          >
            <InformationCircleIcon className="w-4 h-4 mr-2" />
            Content
          </Button>
        </Tooltip>
        
        <Tooltip content="Toggle images visibility">
          <Button
            variant={config.showImages ? 'default' : 'outline'}
            size="sm"
            onClick={toggleImages}
          >
            <PhotoIcon className="w-4 h-4 mr-2" />
            Images
          </Button>
        </Tooltip>
        
        <Tooltip content="Section settings">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Toggle both content and images
              setConfig(prev => ({
                ...prev,
                showContent: !prev.showContent,
                showImages: !prev.showImages,
              }));
            }}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
        
        <Tooltip content="Scroll to section">
          <Button variant="ghost" size="sm" onClick={scrollToSection}>
            <ChevronDownIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
      </motion.div>
    );
  }, [
    showNavigation,
    animated,
    config.showContent,
    config.showImages,
    toggleContent,
    toggleImages,
    scrollToSection,
  ]);

  const renderContent = useCallback(() => {
    if (!config.showContent && !config.showImages) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Select content or images to display
          </p>
          <Button onClick={() => setConfig(prev => ({ ...prev, showContent: true, showImages: true }))}>
            Show All
          </Button>
        </div>
      );
    }

    // Render based on variant
    switch (variant) {
      case 'split':
        return (
          <>
            {contentFirst ? (
              <>
                {config.showContent && (
                  <motion.div variants={animated ? itemVariants : undefined}>
                    <AboutContent
                      variant={config.contentVariant}
                      animated={animated}
                    />
                  </motion.div>
                )}
                {config.showImages && (
                  <motion.div variants={animated ? itemVariants : undefined}>
                    <AboutImage
                      variant={config.imageVariant}
                      animated={animated}
                    />
                  </motion.div>
                )}
              </>
            ) : (
              <>
                {config.showImages && (
                  <motion.div variants={animated ? itemVariants : undefined}>
                    <AboutImage
                      variant={config.imageVariant}
                      animated={animated}
                    />
                  </motion.div>
                )}
                {config.showContent && (
                  <motion.div variants={animated ? itemVariants : undefined}>
                    <AboutContent
                      variant={config.contentVariant}
                      animated={animated}
                    />
                  </motion.div>
                )}
              </>
            )}
          </>
        );

      case 'stacked':
        return (
          <>
            {config.showContent && (
              <motion.div variants={animated ? itemVariants : undefined}>
                <AboutContent
                  variant={config.contentVariant}
                  animated={animated}
                />
              </motion.div>
            )}
            {config.showImages && (
              <motion.div variants={animated ? itemVariants : undefined}>
                <AboutImage
                  variant={config.imageVariant}
                  animated={animated}
                />
              </motion.div>
            )}
          </>
        );

      case 'grid':
        return (
          <>
            {config.showContent && (
              <motion.div variants={animated ? itemVariants : undefined}>
                <Card>
                  <CardHeader>
                    <h3 className="text-2xl font-bold">Our Story</h3>
                  </CardHeader>
                  <CardContent>
                    <AboutContent
                      variant="compact"
                      animated={animated}
                      showStats={false}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {config.showImages && (
              <motion.div variants={animated ? itemVariants : undefined}>
                <Card>
                  <CardHeader>
                    <h3 className="text-2xl font-bold">Gallery</h3>
                  </CardHeader>
                  <CardContent>
                    <AboutImage
                      variant="gallery"
                      animated={animated}
                      showThumbnails={false}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        );

      case 'masonry':
        return (
          <>
            {config.showContent && (
              <div className="break-inside-avoid mb-8">
                <AboutContent
                  variant="compact"
                  animated={animated}
                />
              </div>
            )}
            {config.showImages && (
              <div className="break-inside-avoid mb-8">
                <AboutImage
                  variant="collage"
                  animated={animated}
                />
              </div>
            )}
          </>
        );

      default:
        return (
          <div className="space-y-12">
            {config.showContent && (
              <motion.div variants={animated ? itemVariants : undefined}>
                <AboutContent
                  variant={config.contentVariant}
                  animated={animated}
                />
              </motion.div>
            )}
            {config.showImages && (
              <motion.div variants={animated ? itemVariants : undefined}>
                <AboutImage
                  variant={config.imageVariant}
                  animated={animated}
                />
              </motion.div>
            )}
          </div>
        );
    }
  }, [
    config,
    variant,
    contentFirst,
    animated,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.section
      id={sectionId}
      ref={sectionRef}
      className={cn(
        'relative py-16 sm:py-20 lg:py-24 overflow-hidden',
        background !== 'none' && 'bg-opacity-50',
        className
      )}
      style={backgroundStyle}
      initial={animated ? 'hidden' : undefined}
      animate={isInView && animated ? 'visible' : undefined}
      variants={animated ? containerVariants : undefined}
    >
      {/* Background Overlay */}
      {background !== 'none' && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm" />
      )}

      {/* Parallax Background */}
      {enableParallax && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ y, opacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/20 to-purple-50/20 dark:via-blue-900/10 dark:to-purple-900/10" />
        </motion.div>
      )}

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header */}
        {renderHeader()}

        {/* Navigation */}
        {renderNavigation()}

        {/* Main Content */}
        <motion.div
          className={layoutClasses}
          variants={animated ? containerVariants : undefined}
        >
          {renderContent()}
        </motion.div>

        {/* Children */}
        {children && (
          <motion.div
            variants={animated ? itemVariants : undefined}
            className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12"
          >
            {children}
          </motion.div>
        )}

        {/* Toggle Button */}
        {showNavigation && (
          <motion.div
            variants={animated ? itemVariants : undefined}
            className="flex justify-center mt-12"
          >
            <Tooltip content={isExpanded ? 'Collapse section' : 'Expand section'}>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleSection}
                className="group"
              >
                {isExpanded ? (
                  <>
                    <ChevronUpIcon className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
                    Show More
                  </>
                )}
              </Button>
            </Tooltip>
          </motion.div>
        )}

        {/* Mobile Tabs */}
        <div className="block lg:hidden mt-8">
          <div className="flex gap-2 justify-center">
            <Button
              variant={activeTab === 'content' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTabChange('content')}
            >
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              Story
            </Button>
            <Button
              variant={activeTab === 'images' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTabChange('images')}
            >
              <PhotoIcon className="w-4 h-4 mr-2" />
              Gallery
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 dark:bg-blue-900 rounded-full filter blur-3xl opacity-20 -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 dark:bg-purple-900 rounded-full filter blur-3xl opacity-20 -z-10" />
    </motion.section>
  );
};

export default AboutSection;

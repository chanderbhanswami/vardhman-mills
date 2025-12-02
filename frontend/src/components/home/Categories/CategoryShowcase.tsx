/**
 * CategoryShowcase Component
 * 
 * Featured categories showcase with highlights, statistics,
 * and interactive elements.
 * 
 * Features:
 * - Featured category highlights
 * - Statistics display
 * - Animated transitions
 * - Multiple layout options
 * - Interactive cards
 * - Product count badges
 * - Call-to-action buttons
 * - Responsive design
 * - Loading states
 * - Theme customization
 * 
 * @component
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  TagIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils/utils';
import type { ImageAsset, Category } from '@/types/product.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract image URL from string or ImageAsset object
 */
const getImageUrl = (image: string | ImageAsset | undefined): string => {
  if (!image) return '/images/placeholder-category.jpg';
  if (typeof image === 'string') return image;
  return image.url || '/images/placeholder-category.jpg';
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FeaturedCategory extends Partial<Category> {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | ImageAsset;
  icon?: React.ComponentType<{ className?: string }> | string;
  productCount: number;
  badge?: 'featured' | 'hot' | 'trending' | 'new';
  discount?: number;
  color?: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

export interface CategoryShowcaseProps {
  /** Featured categories */
  featuredCategories?: FeaturedCategory[];
  /** Categories (alternative to featuredCategories) */
  categories?: FeaturedCategory[];
  /** Title */
  title?: string;
  /** Subtitle */
  subtitle?: string;
  /** Layout type */
  layout?: 'grid' | 'hero' | 'split';
  /** Show statistics */
  showStats?: boolean;
  /** Enable animations */
  enableAnimations?: boolean;
  /** Animated (alias for enableAnimations) */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On category click */
  onCategoryClick?: (category: FeaturedCategory) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  featuredCategories: propFeaturedCategories,
  categories: propCategories,
  title = 'Featured Categories',
  subtitle = 'Explore our most popular and trending categories',
  layout = 'grid',
  showStats = true,
  enableAnimations: propEnableAnimations = true,
  animated,
  className,
  onCategoryClick,
}) => {
  // Use categories or featuredCategories, whichever is provided
  const featuredCategories = propCategories || propFeaturedCategories || [];
  const enableAnimations = animated !== undefined ? animated : propEnableAnimations;

  // ============================================================================
  // STATE
  // ============================================================================

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCategoryClick = useCallback(
    (category: FeaturedCategory) => {
      onCategoryClick?.(category);
      console.log('Featured category clicked:', category.name, CheckCircleIcon);
    },
    [onCategoryClick]
  );

  // ============================================================================
  // BADGE CONFIGS
  // ============================================================================

  const badgeConfig = {
    featured: {
      icon: StarSolidIcon,
      label: 'Featured',
      className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
    },
    hot: {
      icon: FireIcon,
      label: 'Hot',
      className: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
    },
    trending: {
      icon: ArrowTrendingUpIcon,
      label: 'Trending',
      className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    },
    new: {
      icon: SparklesIcon,
      label: 'New',
      className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    },
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderHeader = () => (
    <div className="text-center mb-12">
      <motion.div
        initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      </motion.div>
    </div>
  );

  const renderCategoryCard = (category: FeaturedCategory, index: number) => {
    const CategoryIcon = (typeof category.icon === 'function' || typeof category.icon === 'object') && category.icon !== null
      ? category.icon as React.ComponentType<{ className?: string }>
      : TagIcon;

    let badgeType = category.badge;
    if (!badgeType) {
      if (category.isHot) badgeType = 'hot';
      else if (category.isNew) badgeType = 'new';
      else if (category.isFeatured) badgeType = 'featured';
    }

    const badge = badgeType ? badgeConfig[badgeType] : null;
    const BadgeIcon = badge?.icon;
    const isHovered = hoveredCard === category.id;

    return (
      <motion.div
        key={category.id}
        initial={enableAnimations ? { opacity: 0, y: 50 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        onHoverStart={() => setHoveredCard(category.id)}
        onHoverEnd={() => setHoveredCard(null)}
      >
        <Link href={`/categories/${category.slug}`}>
          <Card
            className={cn(
              'group overflow-hidden cursor-pointer h-full',
              'transition-all duration-300',
              'hover:shadow-2xl hover:-translate-y-1',
              isHovered && 'ring-2 ring-primary-500'
            )}
            onClick={() => handleCategoryClick(category)}
          >
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
              <Image
                src={getImageUrl(category.image)}
                alt={category.name}
                fill
                className={cn(
                  'object-cover transition-transform duration-700',
                  'group-hover:scale-110'
                )}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Badge */}
              {badge && BadgeIcon && (
                <Badge
                  className={cn(
                    'absolute top-4 right-4 z-10',
                    badge.className,
                    'shadow-lg'
                  )}
                >
                  <BadgeIcon className="w-4 h-4 mr-1" />
                  {badge.label}
                </Badge>
              )}

              {/* Discount Badge */}
              {category.discount && (
                <Badge className="absolute top-4 left-4 z-10 bg-red-600 text-white shadow-lg">
                  {category.discount}% OFF
                </Badge>
              )}

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                className={cn(
                  'absolute bottom-4 left-4 z-10',
                  'w-12 h-12 rounded-full',
                  'flex items-center justify-center',
                  'bg-background/90 backdrop-blur-sm shadow-lg',
                  'group-hover:scale-110 transition-transform'
                )}
              >
                <CategoryIcon
                  className={cn('w-6 h-6', !category.color && 'text-primary')}
                  {...(category.color && {
                    style: { color: category.color },
                  })}
                />
              </motion.div>

              {/* Product Count */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 text-white">
                <ShoppingBagIcon className="w-5 h-5" />
                <span className="font-semibold">
                  {category.productCount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {category.description}
              </p>

              {/* Stats */}
              {showStats && category.stats && category.stats.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {category.stats.map((stat, i) => (
                    <div
                      key={i}
                      className="bg-muted rounded-lg p-3 text-center"
                    >
                      <div className="text-lg font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              <Button
                className="w-full group-hover:bg-primary/90 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick(category);
                }}
              >
                Explore Category
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  };

  const renderHeroLayout = () => {
    const mainCategory = featuredCategories[0];
    const secondaryCategories = featuredCategories.slice(1, 3);

    if (!mainCategory) return null;

    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Main Featured */}
        <div className="lg:row-span-2">
          {renderCategoryCard(mainCategory, 0)}
        </div>

        {/* Secondary Featured */}
        <div className="grid gap-6">
          {secondaryCategories.map((cat, idx) => (
            <div key={cat.id}>{renderCategoryCard(cat, idx + 1)}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderSplitLayout = () => {
    const leftCategories = featuredCategories.filter((_, i) => i % 2 === 0);
    const rightCategories = featuredCategories.filter((_, i) => i % 2 !== 0);

    return (
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {leftCategories.map((cat, idx) => (
            <div key={cat.id}>{renderCategoryCard(cat, idx * 2)}</div>
          ))}
        </div>
        <div className="space-y-6">
          {rightCategories.map((cat, idx) => (
            <div key={cat.id}>{renderCategoryCard(cat, idx * 2 + 1)}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredCategories.map((cat, idx) => (
        <div key={cat.id}>{renderCategoryCard(cat, idx)}</div>
      ))}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!featuredCategories || featuredCategories.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-12', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        {renderHeader()}

        {/* Content */}
        {layout === 'hero' && renderHeroLayout()}
        {layout === 'split' && renderSplitLayout()}
        {layout === 'grid' && renderGridLayout()}

        {/* View All Button */}
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/categories">
            <Button size="lg" variant="outline" className="group">
              View All Categories
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Statistics Bar */}
        {showStats && (
          <motion.div
            initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {featuredCategories.length}+
                </div>
                <div className="text-sm text-muted-foreground">
                  Featured Categories
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {featuredCategories
                    .reduce((sum, cat) => sum + cat.productCount, 0)
                    .toLocaleString()}
                  +
                </div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  100%
                </div>
                <div className="text-sm text-muted-foreground">Quality Assured</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon key={i} className="w-5 h-5 text-yellow-500" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Top Rated</div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CategoryShowcase;
